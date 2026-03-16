"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Chrome, KeyRound } from "lucide-react";

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type MagicLinkForm = z.infer<typeof magicLinkSchema>;
type PasswordSignInForm = z.infer<typeof passwordSignInSchema>;

export function LoginForm() {
  const router = useRouter();
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const magicLinkForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const signInForm = useForm<PasswordSignInForm>({
    resolver: zodResolver(passwordSignInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onMagicLink(values: MagicLinkForm) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setMagicLinkSentTo(values.email);
    toast.success("Check your email for the login link!");
  }

  async function onPasswordSignIn(values: PasswordSignInForm) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully");
    router.push("/dashboard");
    router.refresh();
  }

  async function onGoogleSignIn() {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Use Google, email/password, or a magic link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={onGoogleSignIn}
          disabled={isGoogleLoading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="access">Get access</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="pt-3">
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onPasswordSignIn)} className="space-y-3">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signInForm.formState.isSubmitting}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  {signInForm.formState.isSubmitting ? "Signing in..." : "Sign in with password"}
                </Button>
              </form>
            </Form>

            <div className="my-3 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or use magic link</span>
              <Separator className="flex-1" />
            </div>

            <Form {...magicLinkForm}>
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLink)} className="space-y-3">
                <FormField
                  control={magicLinkForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email for magic link</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={magicLinkForm.formState.isSubmitting}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {magicLinkForm.formState.isSubmitting ? "Sending..." : "Send magic link"}
                </Button>
              </form>
            </Form>

            {magicLinkSentTo && (
              <p className="mt-3 text-xs text-muted-foreground">
                Magic link sent to {magicLinkSentTo}. Check your inbox.
              </p>
            )}
          </TabsContent>

          <TabsContent value="access" className="space-y-4 pt-3">
            <Badge variant="secondary">Invite only</Badge>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Accounts are provisioned by organization admins. Ask your admin to invite you to a specific client organization.
              </p>
              <p>
                Once invited, you can sign in with the invited email using Google, a magic link, or set a password later in profile settings.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
