"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganization } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();

        startTransition(async () => {
          const result = await createOrganization({ name, logoUrl });

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          setName("");
          setLogoUrl("");
          toast.success("Organization created and added to your switcher");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization name</Label>
        <Input
          id="org-name"
          placeholder="Acme Corporation"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-logo">Logo URL (optional)</Label>
        <Input
          id="org-logo"
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating organization..." : "Create organization"}
        </Button>
        <p className="text-sm text-muted-foreground">
          The new organization will be selected in your admin switcher.
        </p>
      </div>
    </form>
  );
}