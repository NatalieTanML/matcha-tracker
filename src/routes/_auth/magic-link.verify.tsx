import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthCard, AuthLayout } from "@/components/auth";
import { CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/lib/query-options";

export const Route = createFileRoute("/_auth/magic-link/verify")({
  component: MagicLinkVerifyPage,
});

function MagicLinkVerifyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");

      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid or missing token");
        return;
      }

      const { error } = await authClient.magicLink.verify({
        query: { token },
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message ?? "Failed to verify magic link");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });
      setStatus("success");

      setTimeout(() => {
        navigate({ to: "/" });
      }, 1500);
    };

    verifyToken();
  }, [navigate, queryClient]);

  const title = status === "loading" ? "Verifying..." : status === "success" ? "Success!" : "Verification failed";

  const description =
    status === "loading"
      ? "Please wait while we verify your magic link..."
      : status === "success"
        ? "You are now signed in. Redirecting..."
        : errorMessage;

  return (
    <AuthLayout>
      <AuthCard title={title} description={description}>
        {status === "error" && (
          <CardContent>
            <a href="/login" className="text-sm text-sprout-400 hover:underline">
              Back to sign in
            </a>
          </CardContent>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
