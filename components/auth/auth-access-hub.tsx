"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { OrganizationSignupForm } from "@/components/auth/organization-signup-form";
import { OrganizationSignupStatusForm } from "@/components/auth/organization-signup-status-form";

type AuthSection = "portal" | "organization";
type OrganizationSection = "request" | "status";

interface AuthAccessHubProps {
  activeSection: AuthSection;
  activeOrganizationSection?: OrganizationSection;
  error?: string | null;
}

const sectionRoutes: Record<AuthSection, string> = {
  portal: "/login",
  organization: "/register-organization",
};

const organizationRoutes: Record<OrganizationSection, string> = {
  request: "/register-organization",
  status: "/register-organization/status",
};

export function AuthAccessHub({ activeSection, activeOrganizationSection = "request", error }: AuthAccessHubProps) {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Client Portal Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to an existing workspace or manage organization access requests from one place.
          </p>
        </div>

        {error && (
          <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            <Badge variant="destructive">Access issue</Badge>
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <Tabs
          value={activeSection}
          onValueChange={(value) => router.push(sectionRoutes[value as AuthSection])}
          className="w-full"
        >
          <div className="rounded-2xl border bg-card p-2 shadow-sm">
            <TabsList className="grid h-auto w-full grid-cols-2">
              <TabsTrigger value="portal" className="py-2">Portal sign in</TabsTrigger>
              <TabsTrigger value="organization" className="py-2">Organization requests</TabsTrigger>
            </TabsList>

            <TabsContent value="portal" className="pt-5">
              <p className="mb-5 text-sm text-muted-foreground">
                For team members and invited users whose organization is already in the portal. Sign in with Google, a magic link, or password.
                {" "}New to the portal?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register-organization")}
                  className="font-medium text-primary hover:underline"
                >
                  Submit an organization request instead.
                </button>
              </p>
              <LoginForm />
            </TabsContent>

            <TabsContent value="organization" className="space-y-4 pt-5">
              <p className="text-sm text-muted-foreground">
                Submit a new onboarding request, or enter your work email under Request status to see every update for requests you have already sent. Once approved and invited, return to Portal sign in.
              </p>
              <Card>
                <CardContent className="pt-5">
                  <Tabs
                    value={activeOrganizationSection}
                    onValueChange={(value) => router.push(organizationRoutes[value as OrganizationSection])}
                    className="w-full"
                  >
                    <TabsList className="grid h-auto w-full grid-cols-2">
                      <TabsTrigger value="request" className="py-2">New request</TabsTrigger>
                      <TabsTrigger value="status" className="py-2">Request status</TabsTrigger>
                    </TabsList>

                    <TabsContent value="request" className="pt-4">
                      <OrganizationSignupForm />
                    </TabsContent>

                    <TabsContent value="status" className="pt-4">
                      <OrganizationSignupStatusForm />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}