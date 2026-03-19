"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
