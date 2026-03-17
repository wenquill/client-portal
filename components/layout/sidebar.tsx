"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/organization", label: "Organization", icon: Building2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  const items = navItems;

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href as Route<string>}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  orgName: string;
  orgLogoUrl: string | null;
  className?: string;
}

export function Sidebar({ orgName, orgLogoUrl, className }: SidebarProps) {
  return (
    <aside className={cn("flex h-full w-60 flex-col bg-sidebar", className)} style={{ borderRight: "1px solid var(--sidebar-border)" }}>
      <div className="flex h-14 items-center gap-2 px-4" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        {orgLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={orgLogoUrl} alt={orgName} className="h-6 w-6 rounded" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
        )}
        <span className="truncate text-sm font-semibold text-sidebar-foreground">{orgName}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
