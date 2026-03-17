"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setActiveOrganization } from "@/lib/actions/organization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Organization } from "@/types";

interface OrgSwitcherProps {
  currentOrgId: string;
  organizations: Organization[];
  compact?: boolean;
}

export function OrgSwitcher({ currentOrgId, organizations, compact = false }: OrgSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingOrganizationName, setPendingOrganizationName] = useState<string | null>(null);
  const currentOrganizationName = organizations.find((item) => item.id === currentOrgId)?.name;
  const displayedOrganizationName = isPending
    ? (pendingOrganizationName ?? currentOrganizationName)
    : currentOrganizationName;

  if (organizations.length <= 1) {
    return (
      <div className="min-w-0">
        {!compact && <p className="text-xs text-muted-foreground">Organization</p>}
        <p className="truncate text-sm font-medium">{organizations[0]?.name ?? "Unknown"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0 sm:min-w-56">
        {!compact && <p className="mb-1 text-xs text-muted-foreground">Organization</p>}
        <Select
          value={currentOrgId}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            const selectedOrganizationName = organizations.find((item) => item.id === value)?.name;
            setPendingOrganizationName(selectedOrganizationName ?? null);

            startTransition(async () => {
              const result = await setActiveOrganization(value);
              if (result?.error) {
                toast.error(result.error);
                setPendingOrganizationName(null);
                return;
              }
              router.refresh();
            });
          }}
        >
          <SelectTrigger className="w-full" disabled={isPending} aria-busy={isPending}>
            <SelectValue>
              {displayedOrganizationName ?? "Select organization"}
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

      {isPending && (
        <div
          className="fixed inset-y-0 left-0 right-0 z-[100] flex items-center justify-center bg-background/75 backdrop-blur-sm md:left-60"
          aria-live="polite"
          aria-label="Switching organization"
          role="status"
        >
          <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>
      )}
    </>
  );
}
