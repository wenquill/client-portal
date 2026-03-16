"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";
import { createTicketSchema, updateTicketSchema } from "@/lib/validations/ticket.schema";
import { createCommentSchema } from "@/lib/validations/comment.schema";

export type TicketActionState = {
  error?: string;
  success?: boolean;
};

export type CreateTicketState = TicketActionState;
export type CommentActionState = TicketActionState;

async function validateAssigneeInOrganization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assigneeId: string | undefined,
  orgId: string,
): Promise<string | null> {
  if (!assigneeId) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", assigneeId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (error) {
    return error.message;
  }

  if (!data) {
    return "Assignee must belong to the active organization";
  }

  return null;
}

export async function createTicketAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
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

  const assigneeError = await validateAssigneeInOrganization(
    supabase,
    parsed.data.assigneeId,
    authUser.organization.id,
  );

  if (assigneeError) {
    return { error: assigneeError };
  }

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

export async function updateTicketAction(
  ticketId: string,
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "technician" && authUser.profile.role !== "admin") {
    return { error: "Only technicians and admins can update tickets" };
  }

  const parsed = updateTicketSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") || "") as string,
    priority: formData.get("priority"),
    status: formData.get("status"),
    assigneeId: formData.get("assigneeId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid ticket data" };
  }

  const supabase = await createClient();

  const assigneeError = await validateAssigneeInOrganization(
    supabase,
    parsed.data.assigneeId,
    authUser.organization.id,
  );

  if (assigneeError) {
    return { error: assigneeError };
  }

  const { error } = await supabase
    .from("tickets")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      status: parsed.data.status,
      assignee_id: parsed.data.assigneeId ?? null,
    })
    .eq("id", ticketId)
    .eq("org_id", authUser.organization.id)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath(`/tickets/${ticketId}/edit`);
  return { success: true };
}

export async function addTicketCommentAction(
  ticketId: string,
  _previousState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const authUser = await getAuthUser();

  const parsed = createCommentSchema.safeParse({
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }

  const supabase = await createClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("org_id", authUser.organization.id)
    .maybeSingle();

  if (ticketError) {
    return { error: ticketError.message };
  }

  if (!ticket) {
    return { error: "Ticket not found" };
  }

  const { error } = await supabase.from("comments").insert({
    ticket_id: ticketId,
    author_id: authUser.id,
    body: parsed.data.body,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tickets/${ticketId}`);
  return { success: true };
}
