"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { addAdminOrganizationAccess } from "@/lib/actions/organization";
import type { Organization } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminOrgAccessFormProps {
  availableOrganizations: Organization[];
}

export function AdminOrgAccessForm({ availableOrganizations }: AdminOrgAccessFormProps) {
  const [isPending, startTransition] = useTransition();
  const defaultOrg = availableOrganizations[0]?.id ?? "";
  const [selectedOrgId, setSelectedOrgId] = useState(defaultOrg);

  const selectedOrgName = useMemo(
    () => availableOrganizations.find((organization) => organization.id === selectedOrgId)?.name,
    [availableOrganizations, selectedOrgId],
  );

  if (availableOrganizations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You already have access to all organizations.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Organization</Label>
        <Select value={selectedOrgId} onValueChange={(value) => value && setSelectedOrgId(value)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedOrgName ?? "Select organization"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableOrganizations.map((organization) => (
              <SelectItem key={organization.id} value={organization.id}>
                {organization.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <Button
          type="button"
          disabled={isPending || !selectedOrgId}
          onClick={() => {
            if (!selectedOrgId) {
              return;
            }

            startTransition(async () => {
              const result = await addAdminOrganizationAccess(selectedOrgId);

              if (result?.error) {
                toast.error(result.error);
                return;
              }

              toast.success(
                selectedOrgName
                  ? `Access added for ${selectedOrgName}`
                  : "Organization access added",
              );
            });
          }}
        >
          {isPending ? "Adding access..." : "Add organization access"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Added organizations will appear in the header org switcher.
        </p>
      </div>
    </div>
  );
}