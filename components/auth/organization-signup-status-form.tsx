"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  lookupOrganizationSignupStatusAction,
  type OrganizationSignupStatusLookupState,
} from "@/lib/actions/organization-signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OrganizationSignupStatusLookupState = {};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function OrganizationSignupStatusForm() {
  const [state, formAction, pending] = useActionState(lookupOrganizationSignupStatusAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" placeholder="you@company.com" required />
        </div>

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Checking..." : "Check request statuses"}
          </Button>
        </div>
      </form>

      {state.results && (
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            Found {state.results.length} request{state.results.length === 1 ? "" : "s"} for this email.
          </div>

          {state.results.map((request) => (
            <div key={request.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{request.companyName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted {dateFormatter.format(new Date(request.createdAt))}
                  </p>
                </div>
                <p className="text-sm font-medium capitalize">{request.status}</p>
              </div>

              {request.website && (
                <p className="mt-3 break-all text-sm text-muted-foreground">Website: {request.website}</p>
              )}

              {request.notes && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Request details</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{request.notes}</p>
                </div>
              )}

              {request.decisionNotes && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Review notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{request.decisionNotes}</p>
                </div>
              )}

              {request.reviewedAt && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Last reviewed {dateFormatter.format(new Date(request.reviewedAt))}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
