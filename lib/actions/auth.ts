"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function canUseMagicLinkSignIn(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { allowed: false, error: "Email is required" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { allowed: false, error: "Could not verify access. Please try again." };
  }

  if (!data) {
    return {
      allowed: false,
      error: "This email is not invited yet. Ask your organization admin to invite you first.",
    };
  }

  return { allowed: true };
}

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _previousState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const avatarUrlInput = String(formData.get("avatarUrl") ?? "").trim();

  if (fullName.length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  let avatarUrl: string | null = null;
  if (avatarUrlInput) {
    try {
      const parsed = new URL(avatarUrlInput);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { error: "Avatar URL must start with http:// or https://" };
      }
      avatarUrl = avatarUrlInput;
    } catch {
      return { error: "Avatar URL must be a valid URL" };
    }
  }

  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/tickets");

  return { success: true };
}
