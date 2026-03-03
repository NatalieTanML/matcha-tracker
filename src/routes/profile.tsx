import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import {
  sessionQueryOptions,
  telegramLinkCodeMutationOptions,
  telegramStatusQueryOptions,
  telegramUnlinkMutationOptions,
} from "@/lib/query-options";
import { LinkCodeDisplay, LinkInstructions } from "./profile/-components";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions);
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(telegramStatusQueryOptions);
  },
  component: ProfilePage,
  pendingComponent: () => (
    <div className="flex items-center">
      <Spinner className="size-8" />
    </div>
  ),
});

function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  const { data: telegramStatus } = useSuspenseQuery(telegramStatusQueryOptions);

  const [linkCode, setLinkCode] = useState<{ code: string; expiresAt: Date } | null>(null);

  const generateCodeMutation = useMutation({
    ...telegramLinkCodeMutationOptions,
    onSuccess: (result) => {
      setLinkCode({ code: result.code, expiresAt: new Date(result.expiresAt) });
    },
  });

  const unlinkMutation = useMutation({
    ...telegramUnlinkMutationOptions,
    onSuccess: async () => {
      await router.invalidate();
    },
  });

  const isLinked = !!telegramStatus.telegramChatId;

  async function handleSignOut() {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });
    await router.invalidate();
    router.navigate({ to: "/" });
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-8">
      <SectionCard title="Profile">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm ">Hello, {session?.user.name}!</p>
            <p className="text-sm text-muted-foreground">{session?.user.email}</p>
          </div>
          {session?.user.role === "admin" && <Badge variant="default">Admin</Badge>}
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="mt-4">
          Sign out
        </Button>
      </SectionCard>

      <SectionCard title="Telegram notifications" description="Link your Telegram account to receive stock alerts.">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={isLinked ? "success" : "outline"}>{isLinked ? "Linked" : "Not linked"}</Badge>
        </div>

        {isLinked ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => unlinkMutation.mutate()}
            disabled={unlinkMutation.isPending}
          >
            {unlinkMutation.isPending ? "Unlinking..." : "Unlink Telegram"}
          </Button>
        ) : (
          <>
            {linkCode ? (
              <LinkCodeDisplay
                code={linkCode.code}
                expiresAt={linkCode.expiresAt}
                onRegenerate={() => generateCodeMutation.mutate()}
                isRegenerating={generateCodeMutation.isPending}
              />
            ) : (
              <LinkInstructions
                botUsername="matchadropbot"
                onGenerate={() => generateCodeMutation.mutate()}
                isGenerating={generateCodeMutation.isPending}
              />
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
