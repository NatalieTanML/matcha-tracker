import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  myTrackedListingsQueryOptions,
  sessionQueryOptions,
  telegramStatusQueryOptions,
  toggleTrackingMutationOptions,
  updateNotificationModeMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/notifications")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(myTrackedListingsQueryOptions);
  },
  component: NotificationsPage,
  pendingComponent: () => (
    <Empty className="w-full h-dvh">
      <Spinner className="size-8" />
    </Empty>
  ),
});

type NotificationMode = "none" | "individual" | "grouped";

function NotificationsPage() {
  const router = useRouter();
  const { data: trackedListings } = useSuspenseQuery(myTrackedListingsQueryOptions);
  const { data: telegramStatus } = useSuspenseQuery(telegramStatusQueryOptions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const updateModeMutation = useMutation({
    ...updateNotificationModeMutationOptions,
    onSuccess: async () => {
      await router.invalidate();
    },
  });

  const removeTrackingMutation = useMutation({
    ...toggleTrackingMutationOptions,
    onSuccess: async () => {
      await router.invalidate();
    },
  });

  const isTelegramLinked = !!telegramStatus.telegramChatId;

  const allSelected = trackedListings.length > 0 && selectedIds.size === trackedListings.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trackedListings.map((t) => t.listingId)));
    }
  }

  function toggleSelect(listingId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });
  }

  async function handleNotificationModeChange(listingId: string, mode: NotificationMode) {
    await updateModeMutation.mutateAsync({ listingId, notificationMode: mode });
  }

  async function handleBulkModeChange(mode: NotificationMode) {
    const promises = Array.from(selectedIds).map((listingId) =>
      updateModeMutation.mutateAsync({ listingId, notificationMode: mode }),
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
  }

  async function handleBulkRemove() {
    const promises = Array.from(selectedIds).map((listingId) => removeTrackingMutation.mutateAsync(listingId));
    await Promise.all(promises);
    setSelectedIds(new Set());
  }

  async function handleRemoveTracking(listingId: string) {
    await removeTrackingMutation.mutateAsync(listingId);
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage which listings you want to receive stock alerts for.
        </p>
      </div>

      {!isTelegramLinked && (
        <Card>
          <CardHeader>
            <CardTitle>Telegram Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Not linked</Badge>
              <span className="text-sm text-muted-foreground">
                Link your Telegram account in{" "}
                <Link to="/profile" className="text-sprout-400 hover:underline">
                  Profile
                </Link>{" "}
                to receive notifications.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {trackedListings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tracked Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">You aren't tracking any listings yet.</p>
              <Button variant="link" asChild>
                <Link to="/">Browse listings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tracked Listings</CardTitle>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                  <Select onValueChange={(value) => handleBulkModeChange(value as NotificationMode)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Set mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Off</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="grouped">Grouped</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" size="sm" onClick={handleBulkRemove}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium w-10">
                      <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                    </th>
                    <th className="text-left p-3 text-sm font-medium">Product</th>
                    <th className="text-left p-3 text-sm font-medium">Storefront</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Notifications</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trackedListings.map((item) => (
                    <tr key={item.preferenceId} className="border-b last:border-0">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.has(item.listingId)}
                          onCheckedChange={() => toggleSelect(item.listingId)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {item.listing.matcha.brand.name} - {item.listing.matcha.name}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.listing.storefront.name}</td>
                      <td className="p-3">
                        <Badge variant={item.listing.lastStock ? "success" : "destructive"}>
                          {item.listing.lastStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Select
                          value={item.notificationMode}
                          onValueChange={(value) =>
                            handleNotificationModeChange(item.listingId, value as NotificationMode)
                          }
                          disabled={!isTelegramLinked || updateModeMutation.isPending}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Off</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="grouped">Grouped</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTracking(item.listingId)}
                          disabled={removeTrackingMutation.isPending}
                        >
                          {removeTrackingMutation.isPending ? "Removing..." : "Remove"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How notifications work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Off</span> – No notifications for this listing.
            </p>
            <p>
              <span className="font-medium text-foreground">Individual</span> – You'll receive a separate Telegram
              message each time the stock status changes.
            </p>
            <p>
              <span className="font-medium text-foreground">Grouped</span> – You'll receive one Telegram message at the
              end of each scrape with all stock changes combined.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
