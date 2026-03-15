import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/types";

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function getAuthUser(): Promise<AuthUser> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("users")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const admin = createAdminClient();

    const fullName =
      user.user_metadata?.["full_name"] ??
      user.user_metadata?.["name"] ??
      user.email;

    const avatarUrl = user.user_metadata?.["avatar_url"] ?? null;

    const { error: upsertError } = await admin.from("users").upsert({
      id: user.id,
      org_id: DEMO_ORG_ID,
      role: "client",
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    if (upsertError) {
      console.error("[getAuthUser] profile upsert failed:", upsertError);
      await supabase.auth.signOut();
      redirect("/login?error=profile_error");
    }

    const { data: newProfile, error: refetchError } = await admin
      .from("users")
      .select("*, organizations(*)")
      .eq("id", user.id)
      .single();

    if (refetchError || !newProfile) {
      console.error("[getAuthUser] profile re-fetch failed:", refetchError);
      await supabase.auth.signOut();
      redirect("/login?error=profile_error");
    }

    profile = newProfile;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { organizations: organization, ...userProfile } = profile as any;

  return {
    id: user.id,
    email: user.email,
    profile: userProfile,
    organization,
  };
}

/**
 * Returns the current session user without redirecting.
 * Use this where auth is optional.
 */
export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
