import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SectionCard } from "@/components/common";
import { CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/lib/query-options";

export const Route = createFileRoute("/_auth/magic-link/verify")({
  component: MagicLinkVerifyPage,
});

function MagicLinkVerifyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (sessionData?.session) {
      queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });

      // Short delay so user sees success message
      const timer = setTimeout(() => {
        navigate({ to: "/" });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [sessionData, isPending, navigate, queryClient]);

  const title = isPending ? "Verifying..." : sessionData?.session ? "Success!" : "Verification failed";

  const description = isPending
    ? "Please wait while we sign you in..."
    : sessionData?.session
      ? "You are now signed in. Redirecting..."
      : "This link may have expired or already been used.";

  return (
    <SectionCard title={title} description={description}>
      {!isPending && !sessionData?.session && (
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Please request a new magic link to sign in.</p>
          <Link to="/login" className="text-sm text-sprout-400 hover:underline">
            Back to sign in
          </Link>
        </CardContent>
      )}
    </SectionCard>
  );
}
