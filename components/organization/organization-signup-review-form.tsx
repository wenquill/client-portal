"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { OrganizationSignupState } from "@/lib/actions/organization-signup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OrganizationSignupReviewFormProps {
  currentStatus: string;
  action: (state: OrganizationSignupState, formData: FormData) => Promise<OrganizationSignupState>;
}

const initialState: OrganizationSignupState = {};

export function OrganizationSignupReviewForm({ currentStatus, action }: OrganizationSignupReviewFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const defaultDecision = currentStatus === "approved" || currentStatus === "rejected"
    ? currentStatus
    : "";

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      toast.success("Request updated");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="review-status">Status</Label>
        <select
          id="review-status"
          name="status"
          defaultValue={defaultDecision}
          required
          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
        >
          <option value="" disabled>Select decision</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="decisionNotes">Decision notes (optional)</Label>
        <Textarea id="decisionNotes" name="decisionNotes" rows={3} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save decision"}
      </Button>
    </form>
  );
}
