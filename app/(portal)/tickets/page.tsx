import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TicketPriority, TicketStatus } from "@/types";
import { StatusBadge, PriorityBadge } from "@/components/tickets/ticket-badges";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Tickets" };

const PAGE_SIZE = 10;
const STATUS_OPTIONS: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS: TicketPriority[] = ["low", "medium", "high", "urgent"];
const SORT_OPTIONS = ["created_at", "status", "priority", "title"] as const;
type SortField = (typeof SORT_OPTIONS)[number];
type SortOrder = "asc" | "desc";

function formatStatus(status: TicketStatus): string {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPriority(priority: TicketPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatAssigneeLabel(
  assigneeId: string | null,
  assigneeName: string | null | undefined,
): string {
  if (!assigneeId) {
    return "Unassigned";
  }

  if (assigneeName && assigneeName.trim().length > 0) {
    return assigneeName;
  }

  return `User ${assigneeId.slice(0, 8)}`;
}

function formatAssigneeEmail(
  assigneeId: string | null,
  assigneeEmail: string | null | undefined,
): string | null {
  if (!assigneeId) {
    return null;
  }

  if (assigneeEmail && assigneeEmail.trim().length > 0) {
    return assigneeEmail;
  }

  return null;
}

function assigneeInitials(label: string): string {
  if (label === "Unassigned") {
    return "--";
  }

  const parts = label
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  return parts.map((item) => item[0]?.toUpperCase() ?? "").join("");
}

function parseSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function makeTicketsHref(params: Record<string, string | undefined>): Route<string> {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return (query ? `/tickets?${query}` : "/tickets") as Route<string>;
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authUser = await getAuthUser();
  const supabase = await createClient();
  const canManageTickets = authUser.profile.role === "technician" || authUser.profile.role === "admin";

  const params = await searchParams;

  const q = parseSearchParam(params.q)?.trim() ?? "";
  const statusParam = parseSearchParam(params.status);
  const priorityParam = parseSearchParam(params.priority);
  const sortParam = parseSearchParam(params.sort);
  const orderParam = parseSearchParam(params.order);
  const pageParam = parseSearchParam(params.page);

  const status = STATUS_OPTIONS.includes(statusParam as TicketStatus)
    ? (statusParam as TicketStatus)
    : undefined;
  const priority = PRIORITY_OPTIONS.includes(priorityParam as TicketPriority)
    ? (priorityParam as TicketPriority)
    : undefined;
  const sort: SortField = SORT_OPTIONS.includes(sortParam as SortField)
    ? (sortParam as SortField)
    : "created_at";
  const order: SortOrder = orderParam === "asc" ? "asc" : "desc";

  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("tickets")
    .select(
      "id,title,status,priority,created_at,assignee_id,assignee:users!tickets_assignee_id_fkey(full_name,email,avatar_url),created_by_user:users!tickets_created_by_fkey(full_name)",
      { count: "exact" },
    )
    .eq("org_id", authUser.organization.id);

  if (status) {
    query = query.eq("status", status);
  }

  if (priority) {
    query = query.eq("priority", priority);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: tickets, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to load tickets: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function getSortHref(field: SortField): Route<string> {
    const nextOrder: SortOrder =
      sort === field ? (order === "asc" ? "desc" : "asc") : "asc";

    return makeTicketsHref({
      q: q || undefined,
      status,
      priority,
      sort: field,
      order: nextOrder,
      page: "1",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {authUser.organization.name} - {totalCount} total
          </p>
        </div>

        {canManageTickets && (
          <Button nativeButton={false} render={<Link href={"/tickets/new" as Route<string>} />}>
            New ticket
          </Button>
        )}
      </div>

      <form action="/tickets" method="get" className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label htmlFor="q" className="mb-1 block text-xs text-muted-foreground">Search</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search by title or description"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-xs text-muted-foreground">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="mb-1 block text-xs text-muted-foreground">Priority</label>
          <select
            id="priority"
            name="priority"
            defaultValue={priority ?? ""}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">All</option>
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {formatPriority(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="h-9">Apply</Button>
          <Button
            nativeButton={false}
            type="button"
            variant="outline"
            className="h-9"
            render={<Link href={"/tickets" as Route<string>} />}
          >
            Reset
          </Button>
        </div>
      </form>

      <div className="rounded-xl border bg-card p-2">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Link href={getSortHref("title")} className="hover:underline">Title</Link>
              </TableHead>
              <TableHead>
                <Link href={getSortHref("status")} className="hover:underline">Status</Link>
              </TableHead>
              <TableHead>
                <Link href={getSortHref("priority")} className="hover:underline">Priority</Link>
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>
                <Link href={getSortHref("created_at")} className="hover:underline">Created</Link>
              </TableHead>
              {canManageTickets && <TableHead className="w-[120px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tickets ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageTickets ? 6 : 5} className="py-10 text-center text-muted-foreground">
                  No tickets found for these filters.
                </TableCell>
              </TableRow>
            ) : (
              (tickets ?? []).map((ticket) => {
                const assignee = Array.isArray(ticket.assignee)
                  ? ticket.assignee[0]
                  : ticket.assignee;
                const assigneeLabel = formatAssigneeLabel(ticket.assignee_id, assignee?.full_name);
                const assigneeEmail = formatAssigneeEmail(ticket.assignee_id, assignee?.email);
                const assigneeAvatar = assignee?.avatar_url ?? null;

                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="max-w-[360px] truncate font-medium">
                      <Link href={`/tickets/${ticket.id}` as Route<string>} className="hover:underline">
                        {ticket.title}
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge status={ticket.status} /></TableCell>
                    <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {assigneeAvatar ? (
                          <img
                            src={assigneeAvatar}
                            alt={assigneeLabel}
                            className="h-6 w-6 rounded-full border object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                            {assigneeInitials(assigneeLabel)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate">{assigneeLabel}</p>
                          {assigneeEmail && (
                            <p className="truncate text-xs text-muted-foreground">{assigneeEmail}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(ticket.created_at))}
                    </TableCell>
                    {canManageTickets && (
                      <TableCell>
                        <Button
                          nativeButton={false}
                          variant="outline"
                          size="sm"
                          render={<Link href={`/tickets/${ticket.id}/edit` as Route<string>} />}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            nativeButton={false}
            variant="outline"
            disabled={!hasPrev}
            render={
              <Link
                href={makeTicketsHref({
                  q: q || undefined,
                  status,
                  priority,
                  sort,
                  order,
                  page: String(page - 1),
                })}
              />
            }
          >
            Previous
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            disabled={!hasNext}
            render={
              <Link
                href={makeTicketsHref({
                  q: q || undefined,
                  status,
                  priority,
                  sort,
                  order,
                  page: String(page + 1),
                })}
              />
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
