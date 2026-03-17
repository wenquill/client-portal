import { Metadata } from "next";
import { AuthAccessHub } from "@/components/auth/auth-access-hub";

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

  return <AuthAccessHub activeSection="portal" error={error} />;
}
