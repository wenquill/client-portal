import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/profile/set-password-form";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";

export const metadata: Metadata = { title: "Profile" };

function getInitials(name: string | null, email: string | undefined): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default async function ProfilePage() {
  const { profile, organization, email } = await getAuthUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? email} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.full_name, email)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{profile.full_name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
              {profile.role}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm
            initialFullName={profile.full_name ?? ""}
            initialAvatarUrl={profile.avatar_url ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{organization.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono text-xs">{organization.slug}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password login</CardTitle>
        </CardHeader>
        <CardContent>
          <SetPasswordForm hasPassword={profile.has_password} />
        </CardContent>
      </Card>
    </div>
  );
}
