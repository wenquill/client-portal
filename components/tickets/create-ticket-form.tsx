"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import type { TicketPriority, TicketStatus } from "@/types";
import { createTicketAction, type CreateTicketState, type TicketActionState } from "@/lib/actions/tickets";
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

interface TicketFormValues {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigneeId: string;
}

interface TicketFormProps {
  assignees: AssigneeOption[];
  action?: (state: TicketActionState, formData: FormData) => Promise<TicketActionState>;
  initialValues?: TicketFormValues;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  showStatus?: boolean;
}

interface EditTicketFormProps {
  assignees: AssigneeOption[];
  action: (state: TicketActionState, formData: FormData) => Promise<TicketActionState>;
  initialValues: TicketFormValues;
}

const initialState: CreateTicketState = {};
const defaultValues: TicketFormValues = {
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  assigneeId: "",
};

function TicketForm({
  assignees,
  action = createTicketAction,
  initialValues = defaultValues,
  submitLabel,
  pendingLabel,
  successMessage,
  showStatus = false,
}: TicketFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(initialValues.title);

  useEffect(() => {
    setTitle(initialValues.title);
  }, [initialValues.title]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      toast.success(successMessage);
      router.push("/tickets" as Route<string>);
      router.refresh();
    }
  }, [router, state.success, successMessage]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Login issue for client portal"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the issue and steps to reproduce"
          defaultValue={initialValues.description}
          rows={6}
        />
      </div>

      <div className={`grid gap-4 ${showStatus ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={initialValues.priority}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {showStatus && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={initialValues.status}
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="assigneeId">Assignee</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={initialValues.assigneeId}
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
          {pending ? pendingLabel : submitLabel}
        </Button>
        <Button nativeButton={false} variant="outline" type="button" render={<Link href={"/tickets" as Route<string>} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CreateTicketForm({ assignees }: CreateTicketFormProps) {
  return (
    <TicketForm
      assignees={assignees}
      submitLabel="Create ticket"
      pendingLabel="Creating..."
      successMessage="Ticket created"
    />
  );
}

export function EditTicketForm({ assignees, action, initialValues }: EditTicketFormProps) {
  return (
    <TicketForm
      assignees={assignees}
      action={action}
      initialValues={initialValues}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      successMessage="Ticket updated"
      showStatus
    />
  );
}
