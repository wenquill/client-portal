"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import { createTicketAction, type CreateTicketState } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AssigneeOption {
  id: string;
  fullName: string | null;
}

interface CreateTicketFormProps {
  assignees: AssigneeOption[];
}

const initialState: CreateTicketState = {};

export function CreateTicketForm({ assignees }: CreateTicketFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTicketAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      toast.success("Ticket created");
      router.push("/tickets" as Route<string>);
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Login issue for client portal" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the issue and steps to reproduce"
          rows={6}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigneeId">Assignee</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue=""
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.fullName ?? "Unnamed user"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create ticket"}
        </Button>
        <Button variant="outline" type="button" render={<Link href={"/tickets" as Route<string>} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
