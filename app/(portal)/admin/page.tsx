import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { AdminOrgAccessForm } from "@/components/admin/admin-org-access-form";
import { CreateOrganizationForm } from "@/components/admin/create-organization-form";
import { getAuthUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const authUser = await getAuthUser();
  const admin = createAdminClient();

  if (authUser.profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: allOrganizations } = await admin
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });

  const accessibleOrgIds = new Set(authUser.availableOrganizations.map((item) => item.id));
  const addableOrganizations = (allOrganizations ?? []).filter(
    (organization) => !accessibleOrgIds.has(organization.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite users into a specific organization and manage your accessible tenants.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create organization</CardTitle>
          <CardDescription>
            Create a new client organization and add it to your switcher access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessible organizations</CardTitle>
          <CardDescription>
            Admin invitations can target only the organizations listed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {authUser.availableOrganizations.map((organization) => (
            <Badge key={organization.id} variant="secondary">
              {organization.name}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add organization access</CardTitle>
          <CardDescription>
            Add a client organization to your admin scope so it appears in the org switcher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminOrgAccessForm availableOrganizations={addableOrganizations} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite user</CardTitle>
          <CardDescription>
            Create organization-bound access instead of dropping new users into a shared demo tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteUserForm
            organizations={authUser.availableOrganizations}
            defaultOrgId={authUser.organization.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
