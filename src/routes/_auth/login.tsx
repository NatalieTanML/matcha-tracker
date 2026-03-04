import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { MagicLinkSent } from "./-components";

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: LoginFormData) {
    const { error } = await authClient.signIn.magicLink({
      email: data.email,
      callbackURL: "/magic-link/verify",
    });

    if (error) {
      setError("root", { message: error.message ?? "Failed to send magic link" });
      return;
    }

    setIsSent(true);
  }

  if (isSent) {
    return (
      <MagicLinkSent
        description="We've sent you a magic link to sign in. Click the link in your email to continue."
        onReset={() => setIsSent(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Don't have an account?{" "}
          <Button variant="link" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <CardContent>
            <div className="flex flex-col gap-6">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </Field>

              {errors.root && <p className="text-xs text-destructive">{errors.root.message}</p>}
            </div>
          </CardContent>

          <CardFooter>
            <Field>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send magic link"}
              </Button>
            </Field>
          </CardFooter>
        </FieldGroup>
      </form>
    </Card>
  );
}
