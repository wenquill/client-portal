import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth";
import { updateOrganizationAction } from "@/lib/actions/organization";
import { UpdateOrganizationForm } from "@/components/organization/update-organization-form";
import { AdminOrgAccessForm } from "@/components/admin/admin-org-access-form";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Organization" };

export default async function OrganizationPage() {
  const authUser = await getAuthUser();
  const organization = authUser.organization;
  const isAdmin = authUser.profile.role === "admin";
  const admin = createAdminClient();

  const { data: allOrganizations } = isAdmin
    ? await admin
      .from("organizations")
      .select("*")
      .order("name", { ascending: true })
    : { data: null };

  const accessibleOrgIds = new Set(authUser.availableOrganizations.map((item) => item.id));
  const addableOrganizations = (allOrganizations ?? []).filter(
    (item) => !accessibleOrgIds.has(item.id),
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview for your active client organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{organization.name}</CardTitle>
          <CardDescription>Basic organization information visible to all members.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
            <p className="mt-1 font-medium">{organization.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Slug</p>
            <p className="mt-1 font-medium">{organization.slug}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Logo URL</p>
            <p className="mt-1 text-sm text-muted-foreground break-all">
              {organization.logo_url ?? "No logo configured"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
            <p className="mt-1 font-medium">
              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(organization.created_at),
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Manage organization</CardTitle>
              <CardDescription>
                Admins can update organization details for the currently selected tenant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateOrganizationForm
                action={updateOrganizationAction.bind(null, organization.id)}
                initialValues={{
                  name: organization.name,
                  slug: organization.slug,
                  logoUrl: organization.logo_url ?? "",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite user</CardTitle>
              <CardDescription>
                Invite users directly into the currently selected organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteUserForm
                currentOrgId={organization.id}
                currentOrgName={organization.name}
              />
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
              {authUser.availableOrganizations.map((item) => (
                <Badge key={item.id} variant="secondary">
                  {item.name}
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
              <CardTitle className="text-base">Review signup requests</CardTitle>
              <CardDescription>
                Review and decide requests from new organizations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={"/organization/signup-requests" as Route<string>} className="text-sm font-medium text-primary hover:underline">
                Open review queue
              </Link>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Read-only access</CardTitle>
            <CardDescription>
              Only admins can edit organization settings. Contact your admin for updates.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}