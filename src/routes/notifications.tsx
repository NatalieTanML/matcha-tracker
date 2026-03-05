import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  myFavouritesQueryOptions,
  notificationSettingsQueryOptions,
  sessionQueryOptions,
  telegramStatusQueryOptions,
  toggleFavouriteEnabledMutationOptions,
  toggleTrackingMutationOptions,
  updateNotificationSettingsMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/notifications")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(myFavouritesQueryOptions),
      context.queryClient.prefetchQuery(notificationSettingsQueryOptions),
    ]);
  },
  component: NotificationsPage,
  pendingComponent: () => (
    <Empty className="w-full h-dvh">
      <Spinner className="size-8" />
    </Empty>
  ),
});

function NotificationsPage() {
  const router = useRouter();
  const { data: favourites } = useSuspenseQuery(myFavouritesQueryOptions);
  const { data: telegramStatus } = useSuspenseQuery(telegramStatusQueryOptions);
  const { data: settings } = useSuspenseQuery(notificationSettingsQueryOptions);

  const isTelegramLinked = !!telegramStatus.telegramChatId;

  const toggleEnabledMutation = useMutation({
    ...toggleFavouriteEnabledMutationOptions,
    onSuccess: async () => {
      await router.invalidate();
    },
  });

  const removeFavouriteMutation = useMutation({
    ...toggleTrackingMutationOptions,
    onSuccess: async () => {
      await router.invalidate();
    },
  });

  const updateSettingsMutation = useMutation({
    ...updateNotificationSettingsMutationOptions,
    onSuccess: async () => {
      await router.invalidate();
    },
  });

  // Group favourites by storefront
  const byStorefront = favourites.reduce<Map<string, { storefrontName: string; items: typeof favourites }>>(
    (acc, fav) => {
      const sfId = fav.listing.storefront.id;
      if (!acc.has(sfId)) {
        acc.set(sfId, { storefrontName: fav.listing.storefront.name, items: [] });
      }
      acc.get(sfId)!.items.push(fav);
      return acc;
    },
    new Map(),
  );

  const storefrontGroups = Array.from(byStorefront.values()).sort((a, b) =>
    a.storefrontName.localeCompare(b.storefrontName),
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Favourites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your tracked matcha listings and notification preferences.
        </p>
      </div>

      {!isTelegramLinked && (
        <Card>
          <CardHeader>
            <CardTitle>Telegram not linked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Not linked</Badge>
              <span className="text-sm text-muted-foreground">
                Link your Telegram account in{" "}
                <Link to="/profile" className="text-sprout-400 hover:underline">
                  Profile
                </Link>{" "}
                to receive stock alerts.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isTelegramLinked && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Include out-of-stock items in messages</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, stock update messages will also list your favourited matcha that are currently out of
                  stock.
                </p>
              </div>
              <Switch
                checked={settings.includeOosInMessage}
                disabled={updateSettingsMutation.isPending}
                onCheckedChange={(checked) => updateSettingsMutation.mutate({ includeOosInMessage: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {favourites.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">You haven't favourited any listings yet.</p>
              <Button variant="link" asChild>
                <Link to="/">Browse listings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {storefrontGroups.map(({ storefrontName, items }) => (
            <div key={storefrontName}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {storefrontName}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.favouriteId} className="flex items-center gap-4 px-4 py-3">
                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.listing.matcha.brand.name} – {item.listing.matcha.name}
                          </p>
                        </div>

                        {/* Stock status */}
                        <Badge variant={item.listing.lastStock ? "success" : "destructive"} className="shrink-0">
                          {item.listing.lastStock ? "In Stock" : "Out of Stock"}
                        </Badge>

                        {/* Alerts toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">Alerts</span>
                          <Switch
                            checked={item.enabled}
                            disabled={!isTelegramLinked || toggleEnabledMutation.isPending}
                            onCheckedChange={() => toggleEnabledMutation.mutate(item.listingId)}
                          />
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          disabled={removeFavouriteMutation.isPending}
                          onClick={() => removeFavouriteMutation.mutate(item.listingId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How notifications work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              At each scrape interval, you'll receive a{" "}
              <span className="font-medium text-foreground">Telegram message per storefront</span> when one or more of
              your favourited matcha comes back in stock.
            </p>
            <p>
              A message is only sent when{" "}
              <span className="font-medium text-foreground">new items become available</span> compared to your last
              notification — no spam if nothing changes.
            </p>
            <p>
              Use the <span className="font-medium text-foreground">Alerts toggle</span> per listing to choose which
              favourites you want to be notified about. Use the{" "}
              <span className="font-medium text-foreground">include out-of-stock</span> setting to also see which of
              your favourites are currently unavailable in each message.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
