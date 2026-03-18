"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionExistingAuthUser } from "@/lib/auth/provision-existing-user";

const inviteUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email is required"),
  role: z.enum(["admin", "technician", "client"]),
  orgId: z.string().min(1, "Organization is required"),
});

export async function inviteOrganizationUser(input: z.infer<typeof inviteUserSchema>) {
  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

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
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (actorError || !actor || actor.role !== "admin") {
    return { error: "Only admins can invite users" };
  }

  const allowedOrgIds = new Set<string>([actor.org_id]);
  const { data: extraOrganizations } = await admin
    .from("admin_organizations")
    .select("org_id")
    .eq("user_id", user.id);

  for (const item of extraOrganizations ?? []) {
    allowedOrgIds.add(item.org_id);
  }

  if (!allowedOrgIds.has(parsed.data.orgId)) {
    return { error: "You do not have access to that organization" };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/finish?next=/dashboard`;

  const existingUserResult = await provisionExistingAuthUser({
    admin,
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    role: parsed.data.role,
    orgId: parsed.data.orgId,
  });

  if (existingUserResult.found) {
    if (existingUserResult.error) {
      return { error: existingUserResult.error };
    }

    return {
      success: true,
      email: existingUserResult.email,
      reusedExistingAccount: true,
    };
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo,
    data: {
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      org_id: parsed.data.orgId,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    email: data.user?.email ?? parsed.data.email,
    reusedExistingAccount: false,
  };
}
