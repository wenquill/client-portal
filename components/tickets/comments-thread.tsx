"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Author = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type CommentWithAuthor = {
  id: string;
  body: string;
  created_at: string;
  author: Author | Author[] | null;
};

interface CommentsThreadProps {
  ticketId: string;
  initialComments: CommentWithAuthor[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatIdentityEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const value = email.trim();
  return value.length > 0 ? value : null;
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

export function CommentsThread({ ticketId, initialComments }: CommentsThreadProps) {
  const { data, error, isFetching } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: async () => {
      const supabase = createClient();
      const { data: comments, error } = await supabase
        .from("comments")
        .select("id,body,created_at,author:users!comments_author_id_fkey(id,full_name,email,avatar_url)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (comments ?? []) as CommentWithAuthor[];
    },
    initialData: initialComments,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load comments. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">{isFetching ? "Updating comments..." : "Comments are up to date"}</div>

      {(data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
          No comments yet.
        </div>
      ) : (
        (data ?? []).map((comment) => {
          const author = Array.isArray(comment.author) ? comment.author[0] : comment.author;
          const authorName = author?.full_name ?? "Unknown user";
          const authorEmail = formatIdentityEmail(author?.email);

          return (
            <div key={comment.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {author?.avatar_url ? (
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={author.avatar_url} alt={authorName} />
                      <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                      {getInitials(authorName)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{authorName}</p>
                    {authorEmail && (
                      <p className="truncate text-xs text-muted-foreground">{authorEmail}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(comment.created_at))}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>
            </div>
          );
        })
      )}
    </div>
  );
}