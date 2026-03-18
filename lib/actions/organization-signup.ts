"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth";
import { provisionExistingAuthUser } from "@/lib/auth/provision-existing-user";

export type OrganizationSignupState = {
  error?: string;
  success?: boolean;
  requestId?: string;
};

export type OrganizationSignupStatusLookupState = {
  error?: string;
  success?: boolean;
  results?: Array<{
    id: string;
    companyName: string;
    status: string;
    decisionNotes: string | null;
    notes: string | null;
    website: string | null;
    createdAt: string;
    reviewedAt: string | null;
  }>;
};

const organizationSignupSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companySlug: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("A valid email is required"),
  website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
  notes: z.string().max(5000, "Notes are too long").optional().or(z.literal("")),
});

const reviewOrganizationSignupSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  decisionNotes: z.string().max(5000, "Decision notes are too long").optional().or(z.literal("")),
});

const organizationSignupStatusLookupSchema = z.object({
  contactEmail: z.string().email("A valid email is required"),
});

function normalizeSlug(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || null;
}

export async function submitOrganizationSignupAction(
  _previousState: OrganizationSignupState,
  formData: FormData,
): Promise<OrganizationSignupState> {
  const parsed = organizationSignupSchema.safeParse({
    companyName: formData.get("companyName"),
    companySlug: formData.get("companySlug") || undefined,
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    website: formData.get("website") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("organization_signup_requests")
    .insert({
      company_name: parsed.data.companyName.trim(),
      company_slug: normalizeSlug(parsed.data.companySlug),
      contact_name: parsed.data.contactName.trim(),
      contact_email: parsed.data.contactEmail.trim().toLowerCase(),
      website: parsed.data.website?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, requestId: data.id };
}

export async function reviewOrganizationSignupAction(
  requestId: string,
  _previousState: OrganizationSignupState,
  formData: FormData,
): Promise<OrganizationSignupState> {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "admin") {
    return { error: "Only admins can review organization signup requests" };
  }

  const parsed = reviewOrganizationSignupSchema.safeParse({
    status: formData.get("status"),
    decisionNotes: formData.get("decisionNotes") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const admin = createAdminClient();
  const decisionNotes = parsed.data.decisionNotes?.trim() ?? "";

  const { data: request, error: fetchError } = await admin
    .from("organization_signup_requests")
    .select("id, company_name, company_slug, contact_name, contact_email, organization_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: fetchError?.message ?? "Signup request not found" };
  }

  let organizationId: string | null = request.organization_id ?? null;

  if (parsed.data.status === "approved" && !organizationId) {
    const slug = await resolveUniqueSlug(
      admin,
      request.company_slug ?? request.company_name,
    );

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: request.company_name.trim(), slug })
      .select("id")
      .single();

    if (orgError) {
      return { error: `Failed to create organization: ${orgError.message}` };
    }

    organizationId = org.id;
  }

  if (parsed.data.status === "approved" && organizationId) {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/finish?next=/dashboard`;
    const inviteEmail = request.contact_email.trim().toLowerCase();

    const existingUserResult = await provisionExistingAuthUser({
      admin,
      email: inviteEmail,
      fullName: request.contact_name.trim(),
      role: "technician",
      orgId: organizationId,
    });

    if (existingUserResult.found) {
      if (existingUserResult.error) {
        return {
          error: `Failed to provision existing account: ${existingUserResult.error}`,
        };
      }
    } else {

      const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(inviteEmail, {
        redirectTo,
        data: {
          full_name: request.contact_name.trim(),
          role: "technician",
          org_id: organizationId,
        },
      });

      if (inviteError) {
        if (inviteError.message.toLowerCase().includes("already")) {
          return {
            error: "The requester already has an account, but it could not be provisioned automatically. Please retry or handle this user manually.",
          };
        }

        return { error: `Failed to send invite link: ${inviteError.message}` };
      }
    }
  }

  const { error } = await admin
    .from("organization_signup_requests")
    .update({
      status: parsed.data.status,
      decision_notes: decisionNotes || null,
      reviewed_by: authUser.id,
      reviewed_at: new Date().toISOString(),
      ...(organizationId ? { organization_id: organizationId } : {}),
    })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

async function resolveUniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string,
): Promise<string> {
  const candidate = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const { data } = await admin
    .from("organizations")
    .select("slug")
    .eq("slug", candidate)
    .maybeSingle();

  if (!data) {
    return candidate;
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${candidate}-${suffix}`;
}

export async function lookupOrganizationSignupStatusAction(
  _previousState: OrganizationSignupStatusLookupState,
  formData: FormData,
): Promise<OrganizationSignupStatusLookupState> {
  const parsed = organizationSignupStatusLookupSchema.safeParse({
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid lookup" };
  }

  const admin = createAdminClient();
  const normalizedEmail = parsed.data.contactEmail.trim().toLowerCase();

  const { data, error } = await admin
    .from("organization_signup_requests")
    .select("id, company_name, status, decision_notes, notes, website, created_at, reviewed_at")
    .eq("contact_email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: "No organization requests were found for this email" };
  }

  return {
    success: true,
    results: data.map((request) => ({
      id: request.id,
      companyName: request.company_name,
      status: request.status,
      decisionNotes: request.decision_notes,
      notes: request.notes,
      website: request.website,
      createdAt: request.created_at,
      reviewedAt: request.reviewed_at,
    })),
  };
}
