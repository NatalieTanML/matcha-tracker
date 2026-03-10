import { TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
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

export const Route = createFileRoute("/my-favourites")({
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
  component: MyFavouritesPage,
  pendingComponent: () => (
    <Empty className="w-full h-dvh">
      <Spinner className="size-8" />
    </Empty>
  ),
});

type FavouriteItem = {
  favouriteId: string;
  listingId: string;
  enabled: boolean;
  listing: {
    url: string;
    price?: string | null;
    lastStock: boolean | null;
    matcha: {
      name: string;
      brand: {
        name: string;
      };
    };
    storefront: {
      name: string;
    };
  };
};

function MyFavouritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: favourites } = useSuspenseQuery(myFavouritesQueryOptions);
  const { data: telegramStatus } = useSuspenseQuery(telegramStatusQueryOptions);
  const { data: settings } = useSuspenseQuery(notificationSettingsQueryOptions);

  const isTelegramLinked = !!telegramStatus.telegramChatId;

  const toggleEnabledMutation = useMutation({
    ...toggleFavouriteEnabledMutationOptions,
    onMutate: async (listingId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["matcha", "favourites"] });

      // Snapshot the previous value
      const previousFavourites = queryClient.getQueryData(["matcha", "favourites"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["matcha", "favourites"], (old: any) =>
        old.map((fav: any) => (fav.listingId === listingId ? { ...fav, enabled: !fav.enabled } : fav)),
      );

      return { previousFavourites };
    },
    onError: (_err, _listingId, context) => {
      queryClient.setQueryData(["matcha", "favourites"], context?.previousFavourites);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["matcha", "favourites"] });
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

  // Define columns for DataTable
  const columns: ColumnDef<FavouriteItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 28,
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Matcha Name",
      accessorKey: "listing.matcha.name",
      cell: ({ row }) => <div className="font-medium">{row.original.listing.matcha.name}</div>,
      size: 180,
      enableHiding: false,
      filterFn: "includesString",
    },
    {
      header: "Brand Name",
      accessorKey: "listing.matcha.brand.name",
      cell: ({ row }) => <div>{row.original.listing.matcha.brand.name}</div>,
      size: 150,
    },
    {
      header: "Storefront",
      accessorKey: "listing.storefront.name",
      cell: ({ row }) => <div>{row.original.listing.storefront.name}</div>,
      size: 150,
    },
    {
      header: "Status",
      accessorKey: "listing.lastStock",
      cell: ({ row }) => (
        <Badge variant={row.original.listing.lastStock ? "success" : "destructive"}>
          {row.original.listing.lastStock ? "In Stock" : "Out of Stock"}
        </Badge>
      ),
      size: 100,
    },
    {
      header: "Enabled",
      accessorKey: "enabled",
      cell: ({ row }) => (
        <Switch
          checked={row.original.enabled}
          disabled={!isTelegramLinked || toggleEnabledMutation.isPending}
          onCheckedChange={() => toggleEnabledMutation.mutate(row.original.listingId)}
        />
      ),
      size: 80,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          disabled={removeFavouriteMutation.isPending}
          onClick={() => removeFavouriteMutation.mutate(row.original.listingId)}
          aria-label="Remove favourite"
        >
          <TrashIcon size={16} />
        </Button>
      ),
      size: 60,
      enableHiding: false,
    },
  ];

  // Handle bulk delete
  const handleBulkDelete = (selectedRows: any[]) => {
    selectedRows.forEach((row) => {
      removeFavouriteMutation.mutate(row.original.listingId);
    });
  };

  // Let's define the bulk actions component that will be rendered inside DataTable
  const renderBulkActions = (table: any) => {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows;
            selectedRows.forEach((row: any) => {
              if (!row.original.enabled) {
                toggleEnabledMutation.mutate(row.original.listingId);
              }
            });
            table.resetRowSelection();
          }}
        >
          Enable
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows;
            selectedRows.forEach((row: any) => {
              if (row.original.enabled) {
                toggleEnabledMutation.mutate(row.original.listingId);
              }
            });
            table.resetRowSelection();
          }}
        >
          Disable
        </Button>
      </>
    );
  };

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
                <Link to="/profile" className="text-sprout-400 underline-offset-4 hover:underline">
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
              <div>
                <p className="text-sm font-medium">Include out-of-stock items in messages</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, stock update messages will also list your favourited matcha that are currently out of
                  stock.
                </p>
              </div>
              <div>
                <Switch
                  checked={settings.includeOosInMessage}
                  disabled={updateSettingsMutation.isPending}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ includeOosInMessage: checked })}
                />
              </div>
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
        <DataTable
          data={favourites}
          columns={columns}
          bulkActions={renderBulkActions}
          onDeleteSelected={handleBulkDelete}
          globalFilterColumnId="listing.matcha.name"
          statusFilterColumnId={undefined}
        />
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
