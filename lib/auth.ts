import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/types";

const ACTIVE_ORG_COOKIE = "active_org_id";

export async function getAuthUser(): Promise<AuthUser> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await admin.from("users").select("*").eq("id", user.id).single();

  if (!profile) {
    const invitedOrgId = user.user_metadata?.["org_id"];

    if (typeof invitedOrgId !== "string") {
      await supabase.auth.signOut();
      redirect("/login?error=invite_required");
    }

    const fullName =
      user.user_metadata?.["full_name"] ??
      user.user_metadata?.["name"] ??
      user.email;

    const avatarUrl = user.user_metadata?.["avatar_url"] ?? null;
    const invitedRole = user.user_metadata?.["role"];

    const { error: upsertError } = await admin.from("users").upsert({
      id: user.id,
      org_id: invitedOrgId,
      role: invitedRole === "admin" || invitedRole === "technician" || invitedRole === "client"
        ? invitedRole
        : "client",
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
      .select("*")
      .eq("id", user.id)
      .single();

    if (refetchError || !newProfile) {
      console.error("[getAuthUser] profile re-fetch failed:", refetchError);
      await supabase.auth.signOut();
      redirect("/login?error=profile_error");
    }

    profile = newProfile;
  }

  const { data: defaultOrganization, error: defaultOrganizationError } = await admin
    .from("organizations")
    .select("*")
    .eq("id", profile.org_id)
    .single();

  if (defaultOrganizationError || !defaultOrganization) {
    console.error(
      "[getAuthUser] default organization fetch failed:",
      defaultOrganizationError,
    );
    await supabase.auth.signOut();
    redirect("/login?error=profile_error");
  }

  const userProfile = profile;
  const availableOrganizations = [defaultOrganization];

  if (userProfile.role === "admin") {
    const { data: adminOrganizations } = await admin
      .from("admin_organizations")
      .select("org_id")
      .eq("user_id", user.id);

    const adminOrgIds = (adminOrganizations ?? []).map((row) => row.org_id);

    if (adminOrgIds.length > 0) {
      const { data: extraOrganizations } = await admin
        .from("organizations")
        .select("*")
        .in("id", adminOrgIds);

      for (const organization of extraOrganizations ?? []) {
        if (!availableOrganizations.some((item) => item.id === organization.id)) {
          availableOrganizations.push(organization);
        }
      }
    }
  }

  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const organization =
    availableOrganizations.find((item) => item.id === activeOrgId) ?? defaultOrganization;

  return {
    id: user.id,
    email: user.email,
    profile: userProfile,
    organization,
    availableOrganizations,
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
