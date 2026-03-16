import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Route } from "next";

export const metadata: Metadata = { title: "Organization" };

export default function AdminPage() {
  redirect("/organization" as Route<string>);
}
