"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const createPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type CreatePasswordFormValues = z.infer<typeof createPasswordSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type SetPasswordFormProps = {
  hasPassword: boolean;
};

export function SetPasswordForm({ hasPassword }: SetPasswordFormProps) {
  const [mode, setMode] = useState<"create" | "change">(
    hasPassword ? "change" : "create",
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const createForm = useForm<CreatePasswordFormValues>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changeForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function onCreatePassword(values: CreatePasswordFormValues) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      await supabase.from("users").update({ has_password: true }).eq("id", user.id);
    }

    createForm.reset();
    setMode("change");
    toast.success("Password saved. You can now sign in with email and password.");
  }

  async function onChangePassword(values: ChangePasswordFormValues) {
    const supabase = createClient();

    if (!userEmail) {
      toast.error("Could not verify your account email. Please sign in again.");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: values.currentPassword,
    });

    if (verifyError) {
      toast.error("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      await supabase.from("users").update({ has_password: true }).eq("id", user.id);
    }

    changeForm.reset();
    toast.success("Password updated successfully.");
  }

  async function sendPasswordReset() {
    setIsSendingReset(true);

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      toast.error("Could not get your email. Please sign in again.");
      setIsSendingReset(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });

    if (error) {
      toast.error(error.message);
      setIsSendingReset(false);
      return;
    }

    toast.success("Password reset link sent to your email.");
    setIsSendingReset(false);
  }

  if (mode === "change") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          For security, enter your current password to set a new one.
        </p>

        <Form {...changeForm}>
          <form onSubmit={changeForm.handleSubmit(onChangePassword)} className="space-y-3">
            <FormField
              control={changeForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={changeForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={changeForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={changeForm.formState.isSubmitting}>
                {changeForm.formState.isSubmitting ? "Updating..." : "Update password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={sendPasswordReset}
                disabled={isSendingReset}
              >
                {isSendingReset ? "Sending reset link..." : "Reset by email instead"}
              </Button>
            </div>
          </form>
        </Form>

      </div>
    );
  }

  return (
    <Form {...createForm}>
      <form onSubmit={createForm.handleSubmit(onCreatePassword)} className="space-y-3">
        <FormField
          control={createForm.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={createForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createForm.formState.isSubmitting}>
          {createForm.formState.isSubmitting ? "Saving..." : "Create password"}
        </Button>
      </form>
    </Form>
  );
}
