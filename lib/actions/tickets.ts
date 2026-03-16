"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { createTicketSchema } from "@/lib/validations/ticket.schema";

export type CreateTicketState = {
  error?: string;
  success?: boolean;
};

export async function createTicketAction(
  _previousState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "technician" && authUser.profile.role !== "admin") {
    return { error: "Only technicians and admins can create tickets" };
  }

  const parsed = createTicketSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") || "") as string,
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid ticket data" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("tickets").insert({
    org_id: authUser.organization.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    priority: parsed.data.priority,
    assignee_id: parsed.data.assigneeId ?? null,
    created_by: authUser.id,
    status: "open",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tickets");
  return { success: true };
}
