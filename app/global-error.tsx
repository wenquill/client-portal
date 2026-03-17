"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-xl rounded-xl border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Critical application error</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            The app encountered a critical issue and could not render normally.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={reset}>Retry</Button>
            <Button variant="outline" nativeButton={false} render={<Link href={"/login" as Route<string>} />}>
              Go to sign in
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
