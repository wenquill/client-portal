import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { getAuthUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "admin") {
    redirect("/dashboard");
  }

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
