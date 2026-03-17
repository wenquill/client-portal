import { getAuthUser } from "@/lib/auth";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { Sidebar, SidebarNav } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Building2, Menu } from "lucide-react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  return (
    <div className="flex min-h-screen bg-background md:h-screen md:overflow-hidden">
      <Sidebar
        orgName={authUser.organization.name}
        orgLogoUrl={authUser.organization.logo_url}
        role={authUser.profile.role}
        className="hidden md:flex"
      />
      <div className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4 md:px-6">
          <div className="justify-self-start md:hidden">
            <Sheet>
              <SheetTrigger
                render={<Button type="button" variant="outline" size="icon-sm" aria-label="Open navigation" />}
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85vw] max-w-xs bg-sidebar p-0 text-sidebar-foreground"
                style={{ borderRight: "1px solid var(--sidebar-border)" }}
              >
                <SheetHeader className="border-b px-4 py-3" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
                  <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
                    {authUser.organization.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={authUser.organization.logo_url}
                        alt={authUser.organization.name}
                        className="h-6 w-6 rounded"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
                        <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
                      </span>
                    )}
                    <span className="truncate text-sm font-semibold">{authUser.organization.name}</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <SidebarNav role={authUser.profile.role} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:block" />

          <div className="w-[min(100%,24rem)] min-w-0">
            <OrgSwitcher
              currentOrgId={authUser.organization.id}
              organizations={authUser.availableOrganizations}
              compact
            />
          </div>

          <div className="justify-self-end">
            <UserMenu
              fullName={authUser.profile.full_name}
              email={authUser.email}
              avatarUrl={authUser.profile.avatar_url}
              compact
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
