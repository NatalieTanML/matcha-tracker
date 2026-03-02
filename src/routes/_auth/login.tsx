import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard, AuthLayout, MagicLinkSent } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
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
    const { error } = await authClient.signIn.magicLink({ email: data.email });

    if (error) {
      setError("root", { message: error.message ?? "Failed to send magic link" });
      return;
    }

    setIsSent(true);
  }

  if (isSent) {
    return (
      <AuthLayout>
        <MagicLinkSent
          description="We've sent you a magic link to sign in. Click the link in your email to continue."
          onReset={() => setIsSent(false)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Sign in"
        description={
          <>
            Don't have an account?{" "}
            <Link to="/register" className="text-sprout-400 hover:underline">
              Register
            </Link>
          </>
        }
      >
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
              </div>
            </CardContent>

            {errors.root && (
              <CardContent>
                <p className="text-xs text-destructive">{errors.root.message}</p>
              </CardContent>
            )}

            <CardFooter>
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send magic link"}
                </Button>
              </Field>
            </CardFooter>
          </FieldGroup>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
