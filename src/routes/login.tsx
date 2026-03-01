import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/lib/query-options";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("root", { message: error.message ?? "Sign in failed" });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });
    await router.invalidate();
    router.navigate({ to: "/" });
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Don't have an account?{" "}
              <Link to="/register" className="text-sprout-400 hover:underline">
                Register
              </Link>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" autoComplete="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
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
                  <Button variant="default" type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </Field>
              </CardFooter>
            </FieldGroup>
          </form>
        </Card>
      </div>
    </div>
  );
}
