import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

async function finalizeAuthorizedSession(
  supabase: ReturnType<typeof createServerClient>,
  origin: string,
  next: string,
  oauthUser?: User | null,
) {
  const admin = createAdminClient();
  const { data: authData } = oauthUser
    ? { data: { user: oauthUser } }
    : await supabase.auth.getUser();
  const user = authData.user;

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
    await admin.from("users").delete().eq("id", user.id);
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id, false);
    await supabase.auth.signOut();

    if (deleteAuthError) {
      console.error("[auth/callback] failed to delete unauthorized oauth user:", deleteAuthError);
    }

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return finalizeAuthorizedSession(supabase, origin, next, data.user);
    }
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return finalizeAuthorizedSession(supabase, origin, next, data.user);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
