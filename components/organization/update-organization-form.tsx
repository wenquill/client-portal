"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { UpdateOrganizationState } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateOrganizationFormProps {
  action: (state: UpdateOrganizationState, formData: FormData) => Promise<UpdateOrganizationState>;
  initialValues: {
    name: string;
    slug: string;
    logoUrl: string;
  };
}

const initialState: UpdateOrganizationState = {};

export function UpdateOrganizationForm({ action, initialValues }: UpdateOrganizationFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      toast.success("Organization updated");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization name</Label>
        <Input id="org-name" name="name" defaultValue={initialValues.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-slug">Slug</Label>
        <Input id="org-slug" name="slug" defaultValue={initialValues.slug} required />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="org-logo">Logo URL</Label>
        <Input id="org-logo" name="logoUrl" defaultValue={initialValues.logoUrl} />
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save organization"}
        </Button>
        <p className="text-sm text-muted-foreground">Changes affect the currently selected organization.</p>
      </div>
    </form>
  );
}