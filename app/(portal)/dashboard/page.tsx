import type { Metadata } from "next";
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
  const { organization } = await getAuthUser();
  const supabase = await createClient();

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("status, priority")
    .eq("org_id", organization.id);

  if (error) {
    console.error("[dashboard] failed to load tickets:", error.message);
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
    </div>
  );
}
