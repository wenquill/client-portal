import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TicketPriority, TicketStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_ORDER: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_ORDER: TicketPriority[] = ["low", "medium", "high", "urgent"];

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export default async function DashboardPage() {
  const authUser = await getAuthUser();
  const { organization } = authUser;
  const supabase = await createClient();

  const [{ data: tickets, error }, { data: assignedTickets, error: assignedError }] = await Promise.all([
    supabase
      .from("tickets")
      .select("status, priority")
      .eq("org_id", organization.id),
    supabase
      .from("tickets")
      .select("id, title, status, priority, updated_at")
      .eq("org_id", organization.id)
      .eq("assignee_id", authUser.id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  if (error) {
    console.error("[dashboard] failed to load tickets:", error.message);
  }

  if (assignedError) {
    console.error("[dashboard] failed to load assigned tickets:", assignedError.message);
  }

  const statusCounts: Record<TicketStatus, number> = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  const priorityCounts: Record<TicketPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  for (const ticket of tickets ?? []) {
    statusCounts[ticket.status] += 1;
    priorityCounts[ticket.priority] += 1;
  }

  const totalTickets = (tickets ?? []).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview for {organization.name}
        </p>
        {error && (
          <p className="mt-2 text-sm text-destructive">
            Stats are temporarily unavailable. Please refresh in a moment.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight">{totalTickets}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">By Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {STATUS_LABELS[status]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {statusCounts[status]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">By Priority</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PRIORITY_ORDER.map((priority) => (
            <Card key={priority}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {PRIORITY_LABELS[priority]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {priorityCounts[priority]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Assigned To Me</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Recently updated tickets assigned to you
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedError ? (
              <p className="text-sm text-destructive">
                Assigned tickets are temporarily unavailable.
              </p>
            ) : (assignedTickets ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets assigned to you yet.</p>
            ) : (
              <ul className="space-y-3">
                {(assignedTickets ?? []).map((ticket) => (
                  <li key={ticket.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/tickets/${ticket.id}` as Route<string>}
                        className="truncate font-medium hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {STATUS_LABELS[ticket.status]} - {PRIORITY_LABELS[ticket.priority]}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                        new Date(ticket.updated_at),
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
