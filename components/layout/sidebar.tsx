"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  LayoutDashboard,
  Ticket,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/organization", label: "Organization", icon: Building2 },
];

const adminItems = [
  { href: "/admin", label: "Admin", icon: Settings },
];

interface SidebarNavProps {
  role: UserRole;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const items = role === "admin" ? [...navItems, ...adminItems] : navItems;

  return (
    <nav className="flex flex-col gap-1 px-2">
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
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
  role: UserRole;
}

export function Sidebar({ orgName, orgLogoUrl, role }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        {orgLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={orgLogoUrl} alt={orgName} className="h-6 w-6 rounded" />
        ) : (
          <Building2 className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="truncate text-sm font-semibold">{orgName}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav role={role} />
      </div>
    </aside>
  );
}
