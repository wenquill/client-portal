"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setActiveOrganization } from "@/lib/actions/organization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Organization } from "@/types";

interface OrgSwitcherProps {
  currentOrgId: string;
  organizations: Organization[];
}

export function OrgSwitcher({ currentOrgId, organizations }: OrgSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentOrganizationName = organizations.find((item) => item.id === currentOrgId)?.name;

  if (organizations.length <= 1) {
    return (
      <div>
        <p className="text-xs text-muted-foreground">Organization</p>
        <p className="text-sm font-medium">{organizations[0]?.name ?? "Unknown"}</p>
      </div>
    );
  }

  return (
    <div className="min-w-56">
      <p className="mb-1 text-xs text-muted-foreground">Organization</p>
      <Select
        value={currentOrgId}
        onValueChange={(value) => {
          if (!value) {
            return;
          }

          startTransition(async () => {
            const result = await setActiveOrganization(value);
            if (result?.error) {
              toast.error(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <SelectTrigger className="w-full" disabled={isPending}>
          <SelectValue>
            {currentOrganizationName ?? "Select organization"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {organizations.map((organization) => (
            <SelectItem key={organization.id} value={organization.id}>
              {organization.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
