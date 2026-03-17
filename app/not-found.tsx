import Link from "next/link";
import type { Route } from "next";
import { Compass, Home, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Compass className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page not found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or may have moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button nativeButton={false} render={<Link href={"/dashboard" as Route<string>} />}>
              <Home className="mr-2 h-4 w-4" />
              Go to dashboard
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href={"/login" as Route<string>} />}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              Go to sign in
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            If you followed a broken link, please contact your portal administrator.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
