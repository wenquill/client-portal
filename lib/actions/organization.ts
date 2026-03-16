"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function addAdminOrganizationAccess(orgId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: actor, error: actorError } = await admin
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (actorError || !actor || actor.role !== "admin") {
    return { error: "Only admins can manage organization access" };
  }

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .single();

  if (organizationError || !organization) {
    return { error: "Organization not found" };
  }

  const { error } = await admin
    .from("admin_organizations")
    .insert({ user_id: actor.id, org_id: orgId });

  if (error && error.code !== "23505") {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/tickets");
  return { success: true };
}

export async function createOrganization(input: { name: string; logoUrl?: string | null }) {
  void input;
  return {
    error: "Organization provisioning is handled by the platform team.",
  };
}

export type UpdateOrganizationState = {
  error?: string;
  success?: boolean;
};

export async function updateOrganizationAction(
  orgId: string,
  _previousState: UpdateOrganizationState,
  formData: FormData,
): Promise<UpdateOrganizationState> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: actor, error: actorError } = await admin
    .from("users")
    .select("id, org_id, role")
    .eq("id", user.id)
    .single();

  if (actorError || !actor || actor.role !== "admin") {
    return { error: "Only admins can manage organizations" };
  }

  const allowedOrgIds = new Set<string>([actor.org_id]);
  const { data: adminOrganizations } = await admin
    .from("admin_organizations")
    .select("org_id")
    .eq("user_id", actor.id);

  for (const item of adminOrganizations ?? []) {
    allowedOrgIds.add(item.org_id);
  }

  if (!allowedOrgIds.has(orgId)) {
    return { error: "You do not have access to that organization" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const logoUrlInput = String(formData.get("logoUrl") ?? "").trim();

  if (name.length < 2) {
    return { error: "Organization name must be at least 2 characters" };
  }

  if (slugInput.length < 2) {
    return { error: "Slug must be at least 2 characters" };
  }

  const slug = slugInput
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return { error: "Slug must contain letters or numbers" };
  }

  const { data: existingSlug } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .neq("id", orgId)
    .maybeSingle();

  if (existingSlug) {
    return { error: "Slug is already in use" };
  }

  const { error } = await admin
    .from("organizations")
    .update({
      name,
      slug,
      logo_url: logoUrlInput || null,
    })
    .eq("id", orgId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/organization");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/tickets");
  return { success: true };
}
