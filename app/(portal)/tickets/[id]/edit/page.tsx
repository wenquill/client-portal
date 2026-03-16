import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { getAuthUser } from "@/lib/auth";
import { updateTicketAction } from "@/lib/actions/tickets";
import { createClient } from "@/lib/supabase/server";
import { EditTicketForm } from "@/components/tickets/create-ticket-form";

export const metadata: Metadata = { title: "Edit Ticket" };

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "technician" && authUser.profile.role !== "admin") {
    redirect("/tickets" as Route<string>);
  }

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: ticket }, { data: users }] = await Promise.all([
    supabase
      .from("tickets")
      .select("id, title, description, priority, status, assignee_id")
      .eq("id", id)
      .eq("org_id", authUser.organization.id)
      .maybeSingle(),
    supabase
      .from("users")
      .select("id, full_name")
      .eq("org_id", authUser.organization.id)
      .order("full_name", { ascending: true }),
  ]);

  if (!ticket) {
    notFound();
  }

  const assignees = (users ?? []).map((user) => ({
    id: user.id,
    fullName: user.full_name,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update ticket details for {authUser.organization.name}
        </p>
      </div>

      <EditTicketForm
        assignees={assignees}
        action={updateTicketAction.bind(null, ticket.id)}
        initialValues={{
          title: ticket.title,
          description: ticket.description ?? "",
          priority: ticket.priority,
          status: ticket.status,
          assigneeId: ticket.assignee_id ?? "",
        }}
      />
    </div>
  );
}