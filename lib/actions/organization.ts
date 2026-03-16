"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const ACTIVE_ORG_COOKIE = "active_org_id";

export async function setActiveOrganization(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Could not load your profile" };
  }

  const allowedOrgIds = new Set<string>([profile.org_id]);

  if (profile.role === "admin") {
    const { data: adminOrganizations } = await supabase
      .from("admin_organizations")
      .select("org_id")
      .eq("user_id", user.id);

    for (const item of adminOrganizations ?? []) {
      allowedOrgIds.add(item.org_id);
    }
  }

  if (!allowedOrgIds.has(orgId)) {
    return { error: "You do not have access to that organization" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}
