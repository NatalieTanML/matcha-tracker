import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  sessionQueryOptions,
  telegramLinkCodeMutationOptions,
  telegramStatusQueryOptions,
  telegramUnlinkMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/profile")({
  // Check auth and prefetch data
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
  pendingComponent: () => <div className="container mx-auto p-4">Loading...</div>,
});

function ProfilePage() {
  const router = useRouter();
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
    await router.invalidate();
    router.navigate({ to: "/" });
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-8">
      {/* Account */}
      <section className="space-y-3">
        <h1 className="text-lg font-semibold">Profile</h1>
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium">{session?.user.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user.email}</p>
            </div>
            {session?.user.role === "admin" && <Badge variant="default">Admin</Badge>}
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </section>

      {/* Telegram */}
      <section className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold">Telegram notifications</h2>
          <p className="text-xs text-muted-foreground">Link your Telegram account to receive stock alerts.</p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
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
            <div className="space-y-3">
              {linkCode ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Open your Telegram bot and send:</p>
                  <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm tracking-widest select-all">
                    /link {linkCode.code}
                  </div>
                  <p className="text-[0.625rem] text-muted-foreground">
                    Expires at {linkCode.expiresAt.toLocaleTimeString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateCodeMutation.mutate()}
                    disabled={generateCodeMutation.isPending}
                  >
                    Regenerate code
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Click the button below to generate a link code</li>
                    <li>
                      Open{" "}
                      <a
                        href="https://t.me/YourBotUsername"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        your Telegram bot
                      </a>
                    </li>
                    <li>
                      Send the code using <code className="bg-muted px-1 rounded">/link CODE</code>
                    </li>
                  </ol>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => generateCodeMutation.mutate()}
                    disabled={generateCodeMutation.isPending}
                  >
                    {generateCodeMutation.isPending ? "Generating..." : "Generate link code"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
