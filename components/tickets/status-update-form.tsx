"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { TicketStatus } from "@/types";
import type { TicketActionState } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface StatusUpdateFormProps {
  initialStatus: TicketStatus;
  action: (state: TicketActionState, formData: FormData) => Promise<TicketActionState>;
}

const initialState: TicketActionState = {};

export function StatusUpdateForm({ initialStatus, action }: StatusUpdateFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      toast.success("Ticket status updated");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="status">Update status</Label>
        <select
          id="status"
          name="status"
          defaultValue={initialStatus}
          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save status"}
      </Button>
    </form>
  );
}