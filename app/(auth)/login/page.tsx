import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

const errorMessages: Record<string, string> = {
  auth_failed: "Authentication failed. Please try again.",
  confirm_failed: "We could not confirm your email link. Please request a new one.",
  invite_required: "Your account is authenticated, but it is not assigned to any organization. Ask an admin to invite you first.",
  profile_error: "We could not load your portal profile. If you were not invited into an organization yet, ask an admin to provision your access.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in or create an account
          </p>
        </div>
        {error && (
          <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            <Badge variant="destructive">Access issue</Badge>
            <p className="text-destructive">{error}</p>
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
