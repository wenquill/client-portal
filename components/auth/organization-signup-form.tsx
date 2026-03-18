"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import { toast } from "sonner";
import { submitOrganizationSignupAction, type OrganizationSignupState } from "@/lib/actions/organization-signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: OrganizationSignupState = {};

export function OrganizationSignupForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitOrganizationSignupAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      toast.success("Request submitted. We will contact you shortly.");
    }
  }, [state.success]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" placeholder="Acme Corporation" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySlug">Preferred slug (optional)</Label>
          <Input id="companySlug" name="companySlug" placeholder="acme-corporation" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Your name</Label>
          <Input id="contactName" name="contactName" placeholder="Jane Doe" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Work email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" placeholder="jane@acme.com" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website">Company website (optional)</Label>
          <Input id="website" name="website" placeholder="https://acme.com" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={5}
            placeholder="Tell us your use case, expected team size, and anything we should know."
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Submitting..." : "Request organization account"}
          </Button>
        </div>
      </form>

      {state.success && state.requestId && (
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Request submitted</p>
          <p className="mt-2 text-muted-foreground">
            Use Request status with your work email to see every update for this request.
          </p>
          <Link href={"/register-organization/status" as Route<string>} className="mt-2 inline-block font-medium text-primary hover:underline">
            Open request status
          </Link>
        </div>
      )}
    </div>
  );
}
