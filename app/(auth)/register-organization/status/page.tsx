import type { Metadata } from "next";
import { AuthAccessHub } from "@/components/auth/auth-access-hub";

export const metadata: Metadata = { title: "Check Organization Request Status" };

export default function RegisterOrganizationStatusPage() {
  return <AuthAccessHub activeSection="organization" activeOrganizationSection="status" />;
}
