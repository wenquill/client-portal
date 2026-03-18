import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

async function finalizeAuthorizedSession(
  supabase: ReturnType<typeof createServerClient>,
  origin: string,
  next: string,
) {
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const invitedOrgId = user.user_metadata?.["org_id"];
  const { data: existingProfile } = await admin
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const isInvited = typeof invitedOrgId === "string" || Boolean(existingProfile);

  if (!isInvited) {
    await supabase.auth.signOut();
    await admin.auth.admin.deleteUser(user.id);
    return NextResponse.redirect(`${origin}/login?error=invite_required`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}


export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return finalizeAuthorizedSession(supabase, origin, next);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return finalizeAuthorizedSession(supabase, origin, next);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
