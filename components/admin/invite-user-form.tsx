"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { inviteOrganizationUser } from "@/lib/actions/admin-users";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Organization, UserRole } from "@/types";

const inviteUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email is required"),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

interface InviteUserFormProps {
  organizations: Organization[];
  defaultOrgId: string;
}

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "client", label: "Client" },
  { value: "technician", label: "Technician" },
  { value: "admin", label: "Admin" },
];

export function InviteUserForm({ organizations, defaultOrgId }: InviteUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");
  const [selectedOrgId, setSelectedOrgId] = useState(defaultOrgId);
  const selectedOrganizationName = organizations.find((item) => item.id === selectedOrgId)?.name;

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  function onSubmit(values: InviteUserFormValues) {
    if (!selectedOrgId) {
      toast.error("Organization is required");
      return;
    }

    startTransition(async () => {
      const result = await inviteOrganizationUser({
        ...values,
        role: selectedRole,
        orgId: selectedOrgId,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      form.reset({
        fullName: "",
        email: "",
      });
      toast.success(`Invitation sent to ${result.email}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jane@client.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Label>Role</Label>
          <div>
            <Select value={selectedRole} onValueChange={(value) => value && setSelectedRole(value as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Organization</Label>
          <div>
            <Select value={selectedOrgId} onValueChange={(value) => value && setSelectedOrgId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedOrganizationName ?? "Select organization"}
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
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending invite..." : "Invite user"}
          </Button>
          <p className="text-sm text-muted-foreground">
            The invited user will receive an email invitation.
          </p>
        </div>
      </form>
    </Form>
  );
}
