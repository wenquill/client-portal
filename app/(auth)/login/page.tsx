import { Metadata } from "next";
import { redirect } from "next/navigation";
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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const hasAuthCallbackParams =
    typeof params.code === "string" ||
    (typeof params.token_hash === "string" && typeof params.type === "string");

  if (hasAuthCallbackParams) {
    const callbackParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          callbackParams.append(key, item);
        }
      } else if (typeof value === "string") {
        callbackParams.set(key, value);
      }
    }

    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const error = errorCode ? errorMessages[errorCode] : null;

  return <AuthAccessHub activeSection="portal" error={error} />;
}
