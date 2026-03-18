import { Suspense } from "react";
import { AuthFinishContent } from "./auth-finish-content";

export default function AuthFinishPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">Finalizing your sign-in...</p>
        </main>
      }
    >
      <AuthFinishContent />
    </Suspense>
  );
}