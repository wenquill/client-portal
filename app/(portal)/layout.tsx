import { getAuthUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        orgName={authUser.organization.name}
        orgLogoUrl={authUser.organization.logo_url}
        role={authUser.profile.role}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
          <div />
          <UserMenu
            fullName={authUser.profile.full_name}
            email={authUser.email}
            avatarUrl={authUser.profile.avatar_url}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
