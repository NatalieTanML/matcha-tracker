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

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email"),
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
        description="We've sent you a magic link to create your account. Click the link in your email to continue."
        onReset={() => setIsSent(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Already have an account?{" "}
          <Link to="/login" className="text-sprout-400 hover:underline">
            Sign in
          </Link>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <CardContent>
            <div className="flex flex-col gap-4">
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
