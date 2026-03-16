import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export const metadata: Metadata = { title: "New Ticket" };

export default async function NewTicketPage() {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "technician" && authUser.profile.role !== "admin") {
    redirect("/tickets" as Route<string>);
  }

  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("org_id", authUser.organization.id)
    .order("full_name", { ascending: true });

  const assignees = (users ?? []).map((user) => ({
    id: user.id,
    fullName: user.full_name,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a ticket for {authUser.organization.name}
        </p>
      </div>

      <CreateTicketForm assignees={assignees} />
    </div>
  );
}
