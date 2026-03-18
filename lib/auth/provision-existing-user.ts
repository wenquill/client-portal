import { createAdminClient } from "@/lib/supabase/admin";

type ProvisionRole = "admin" | "technician" | "client";

type ProvisionExistingUserInput = {
  admin: ReturnType<typeof createAdminClient>;
  email: string;
  fullName: string;
  role: ProvisionRole;
  orgId: string;
};

type ProvisionExistingUserResult =
  | { found: false }
  | { found: true; email: string; error?: undefined }
  | { found: true; error: string; email?: undefined };

export async function provisionExistingAuthUser(
  input: ProvisionExistingUserInput,
): Promise<ProvisionExistingUserResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const { data, error } = await input.admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return { found: true, error: error.message };
  }

  const existingUser = data.users.find(
    (user) => user.email?.trim().toLowerCase() === normalizedEmail,
  );

  if (!existingUser) {
    return { found: false };
  }

  const existingMetadata =
    existingUser.user_metadata && typeof existingUser.user_metadata === "object"
      ? existingUser.user_metadata
      : {};

  const { error: updateError } = await input.admin.auth.admin.updateUserById(
    existingUser.id,
    {
      user_metadata: {
        ...existingMetadata,
        full_name: input.fullName,
        role: input.role,
        org_id: input.orgId,
      },
    },
  );

  if (updateError) {
    return { found: true, error: updateError.message };
  }

  const avatarUrl =
    typeof existingMetadata.avatar_url === "string"
      ? existingMetadata.avatar_url
      : null;

  const { error: profileError } = await input.admin.from("users").upsert({
    id: existingUser.id,
    org_id: input.orgId,
    role: input.role,
    full_name: input.fullName,
    avatar_url: avatarUrl,
    email: normalizedEmail,
  });

  if (profileError) {
    return { found: true, error: profileError.message };
  }

  return { found: true, email: existingUser.email ?? normalizedEmail };
}