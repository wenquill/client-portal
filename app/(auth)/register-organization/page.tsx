import type { Metadata } from "next";
import { AuthAccessHub } from "@/components/auth/auth-access-hub";

export const metadata: Metadata = { title: "Register Organization" };

export default function RegisterOrganizationPage() {
  return <AuthAccessHub activeSection="organization" activeOrganizationSection="request" />;
}
