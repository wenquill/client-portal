import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewOrganizationSignupAction } from "@/lib/actions/organization-signup";
import { OrganizationSignupReviewForm } from "@/components/organization/organization-signup-review-form";

export const metadata: Metadata = { title: "Organization Signup Requests" };

export default async function OrganizationSignupRequestsPage() {
  const authUser = await getAuthUser();

  if (authUser.profile.role !== "admin") {
    redirect("/organization" as Route<string>);
  }

  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("organization_signup_requests")
    .select("id, company_name, company_slug, contact_name, contact_email, website, notes, status, decision_notes, created_at, reviewed_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Signup Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and decide pending requests from new organizations.
        </p>
      </div>

      {(requests ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            No pending signup requests.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(requests ?? []).map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="text-base">{request.company_name}</CardTitle>
                <CardDescription>
                  Requested by {request.contact_name} ({request.contact_email})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Preferred slug</p>
                    <p className="mt-1 text-sm">{request.company_slug ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Website</p>
                    <p className="mt-1 text-sm break-all">{request.website ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Current status</p>
                    <p className="mt-1 text-sm capitalize">{request.status}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Submitted</p>
                    <p className="mt-1 text-sm">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(request.created_at),
                      )}
                    </p>
                  </div>
                </div>

                {request.notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{request.notes}</p>
                  </div>
                )}

                {request.decision_notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Decision notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{request.decision_notes}</p>
                  </div>
                )}

                <OrganizationSignupReviewForm
                  currentStatus={request.status}
                  action={reviewOrganizationSignupAction.bind(null, request.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
