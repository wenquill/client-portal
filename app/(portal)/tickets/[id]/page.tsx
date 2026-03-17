import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { addTicketCommentAction, updateTicketStatusAction } from "@/lib/actions/tickets";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CommentsThread } from "@/components/tickets/comments-thread";
import { CommentForm } from "@/components/tickets/comment-form";
import { StatusUpdateForm } from "@/components/tickets/status-update-form";
import { StatusBadge, PriorityBadge } from "@/components/tickets/ticket-badges";

export const metadata: Metadata = { title: "Ticket Details" };

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

function formatIdentityEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const value = email.trim();
  return value.length > 0 ? value : null;
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

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  return parts.map((item) => item[0]?.toUpperCase() ?? "").join("");
}

type CommentWithAuthor = {
  id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  }[] | null;
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authUser = await getAuthUser();
  const { id } = await params;
  const supabase = await createClient();
  const canManageTickets = authUser.profile.role === "technician" || authUser.profile.role === "admin";

  const [{ data: ticket }, { data: comments, error: commentsError }] = await Promise.all([
    supabase
      .from("tickets")
      .select(
        "id,title,description,status,priority,created_at,updated_at,assignee_id,assignee:users!tickets_assignee_id_fkey(id,full_name,email,avatar_url),created_by_user:users!tickets_created_by_fkey(id,full_name,email,avatar_url)",
      )
      .eq("id", id)
      .eq("org_id", authUser.organization.id)
      .maybeSingle(),
    supabase
      .from("comments")
      .select("id,body,created_at,author:users!comments_author_id_fkey(id,full_name,email,avatar_url)")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!ticket) {
    notFound();
  }

  if (commentsError) {
    throw new Error(`Failed to load comments: ${commentsError.message}`);
  }

  const initialComments = (comments ?? []) as CommentWithAuthor[];

  const assignee = Array.isArray(ticket.assignee) ? ticket.assignee[0] : ticket.assignee;
  const creator = Array.isArray(ticket.created_by_user) ? ticket.created_by_user[0] : ticket.created_by_user;
  const assigneeLabel = formatAssigneeLabel(ticket.assignee_id, assignee?.full_name);
  const assigneeAvatar = assignee?.avatar_url ?? null;
  const creatorName = creator?.full_name ?? "Unknown user";
  const creatorAvatar = creator?.avatar_url ?? null;
  const assigneeEmail = formatIdentityEmail(assignee?.email);
  const creatorEmail = formatIdentityEmail(creator?.email);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Ticket</p>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {authUser.organization.name}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Button
            nativeButton={false}
            variant="outline"
            className="w-full sm:w-auto"
            render={<Link href={"/tickets" as Route<string>} />}
          >
            Back to tickets
          </Button>
          {canManageTickets && (
            <Button
              nativeButton={false}
              className="w-full sm:w-auto"
              render={<Link href={`/tickets/${ticket.id}/edit` as Route<string>} />}
            >
              Edit ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-2"><StatusBadge status={ticket.status} /></div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Priority</p>
          <div className="mt-2"><PriorityBadge priority={ticket.priority} /></div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Assignee</p>
          <div className="mt-2 flex items-center gap-2">
            {assigneeAvatar ? (
              <img
                src={assigneeAvatar}
                alt={assigneeLabel}
                className="h-7 w-7 rounded-full border object-cover"
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {assigneeInitials(assigneeLabel)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{assigneeLabel}</p>
              {assigneeEmail && (
                <p className="truncate text-xs text-muted-foreground">{assigneeEmail}</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Created by</p>
          <div className="mt-2 flex items-center gap-2">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="h-7 w-7 rounded-full border object-cover"
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {getInitials(creatorName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{creatorName}</p>
              {creatorEmail && (
                <p className="truncate text-xs text-muted-foreground">{creatorEmail}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <StatusUpdateForm
        initialStatus={ticket.status}
        action={updateTicketStatusAction.bind(null, ticket.id)}
      />

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {ticket.description?.trim() ? ticket.description : "No description provided."}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            Created {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ticket.created_at))}
          </span>
          <span>
            Updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ticket.updated_at))}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Comments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep ticket updates and investigation notes in one place.
          </p>
        </div>

        <CommentForm action={addTicketCommentAction.bind(null, ticket.id)} />

        <CommentsThread ticketId={ticket.id} initialComments={initialComments} />
      </div>
    </div>
  );
}