"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/client";

function buildLoginErrorUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `/login?error=auth_failed&message=${encodedMessage}`;
}

export default function AuthFinishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function finishAuth() {
      const next = searchParams.get("next") ?? "/dashboard";
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const errorDescription = hashParams.get("error_description");

      if (errorDescription) {
        router.replace(buildLoginErrorUrl(errorDescription) as Route<string>);
        return;
      }

      if (!accessToken || !refreshToken) {
        router.replace(
          buildLoginErrorUrl("Missing session tokens in invite link") as Route<string>,
        );
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        router.replace(buildLoginErrorUrl(error.message) as Route<string>);
        return;
      }

      router.replace(next as Route<string>);
      router.refresh();
    }

    void finishAuth();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">Finalizing your sign-in...</p>
    </main>
  );
}