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

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(data: RegisterFormData) {
    const { error } = await authClient.signIn.magicLink({
      email: data.email,
      name: data.name,
    });

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
          description="We've sent you a magic link to create your account. Click the link in your email to continue."
          onReset={() => setIsSent(false)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create an account"
        description={
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-sprout-400 hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <CardContent>
              <div className="flex flex-col gap-6">
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" type="text" autoComplete="name" placeholder="Your name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </Field>

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
