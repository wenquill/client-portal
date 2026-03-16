import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          Organization management lives on the Organization page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin tools moved</CardTitle>
          <CardDescription>
            Use the Organization page for invites and tenant management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={"/organization" as Route<string>} className="text-sm font-medium text-primary hover:underline">
            Go to Organization settings
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
