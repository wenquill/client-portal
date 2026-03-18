"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogOut, User } from "lucide-react";

interface UserMenuProps {
  fullName: string | null;
  email: string | undefined;
  avatarUrl: string | null;
  compact?: boolean;
}

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

export function UserMenu({ fullName, email, avatarUrl, compact = false }: UserMenuProps) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-md p-1 hover:bg-muted"
        render={
          <button type="button" />
        }
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl ?? undefined} alt={fullName ?? email} />
          <AvatarFallback className="text-xs">
            {getInitials(fullName, email)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden flex-col items-start text-left md:flex">
          <span className="text-sm font-medium leading-none">
            {fullName ?? email}
          </span>
          {fullName && !compact && (
            <span className="mt-0.5 text-xs text-muted-foreground">{email}</span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{fullName ?? "User"}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile" as Route<string>)}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ThemeToggle />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
