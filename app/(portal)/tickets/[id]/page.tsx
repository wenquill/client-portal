import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { addTicketCommentAction } from "@/lib/actions/tickets";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/tickets/comment-form";

export const metadata: Metadata = { title: "Ticket Details" };

function formatStatus(status: string) {
  return status === "in_progress"
    ? "In Progress"
    : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPriority(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

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
        "id,title,description,status,priority,created_at,updated_at,assignee_id,assignee:users!tickets_assignee_id_fkey(id,full_name),created_by_user:users!tickets_created_by_fkey(id,full_name)",
      )
      .eq("id", id)
      .eq("org_id", authUser.organization.id)
      .maybeSingle(),
    supabase
      .from("comments")
      .select("id,body,created_at,author:users!comments_author_id_fkey(id,full_name,avatar_url)")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!ticket) {
    notFound();
  }

  if (commentsError) {
    throw new Error(`Failed to load comments: ${commentsError.message}`);
  }

  const assignee = Array.isArray(ticket.assignee) ? ticket.assignee[0] : ticket.assignee;
  const creator = Array.isArray(ticket.created_by_user) ? ticket.created_by_user[0] : ticket.created_by_user;
  const assigneeLabel = ticket.assignee_id
    ? (assignee?.full_name ?? "Assigned")
    : "Unassigned";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Ticket</p>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {authUser.organization.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button nativeButton={false} variant="outline" render={<Link href={"/tickets" as Route<string>} />}>
            Back to tickets
          </Button>
          {canManageTickets && (
            <Button nativeButton={false} render={<Link href={`/tickets/${ticket.id}/edit` as Route<string>} />}>
              Edit ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-2 font-medium">{formatStatus(ticket.status)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Priority</p>
          <p className="mt-2 font-medium">{formatPriority(ticket.priority)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Assignee</p>
          <p className="mt-2 font-medium">{assigneeLabel}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Created by</p>
          <p className="mt-2 font-medium">{creator?.full_name ?? "Unknown user"}</p>
        </div>
      </div>

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

        <div className="space-y-3">
          {(comments ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
              No comments yet.
            </div>
          ) : (
            (comments ?? []).map((comment) => {
              const author = Array.isArray(comment.author) ? comment.author[0] : comment.author;

              return (
                <div key={comment.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{author?.full_name ?? "Unknown user"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(comment.created_at))}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}