"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction, type UpdateProfileState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: UpdateProfileState = {};

type UpdateProfileFormProps = {
  initialFullName: string;
  initialAvatarUrl: string;
};

export function UpdateProfileForm({ initialFullName, initialAvatarUrl }: UpdateProfileFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const [fullName, setFullName] = useState(() => initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(() => initialAvatarUrl);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success("Profile updated");
      router.refresh();
    }
  }, [state.error, state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your name"
          required
          minLength={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder="https://example.com/avatar.png"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
