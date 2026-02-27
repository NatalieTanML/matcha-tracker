import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  listingsQueryOptions,
  myTrackedListingsQueryOptions,
  sessionQueryOptions,
  toggleTrackingMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/")({
  // Prefetch queries but don't block navigation
  beforeLoad: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(listingsQueryOptions),
      context.queryClient.prefetchQuery(myTrackedListingsQueryOptions),
    ]);
  },
  component: App,
  pendingComponent: () => <div className="container mx-auto p-4">Loading...</div>,
});

type SortOption = "lastChecked" | "storefront";
type StockFilter = "all" | "inStock" | "outOfStock";

function App() {
  const { data: listings } = useSuspenseQuery(listingsQueryOptions);
  const { data: trackedListingIds } = useSuspenseQuery(myTrackedListingsQueryOptions);
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set(trackedListingIds));

  const [sortBy, setSortBy] = useState<SortOption>("lastChecked");
  const [selectedStorefront, setSelectedStorefront] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [now, setNow] = useState<number | null>(null);

  // Keep local state in sync with server state
  useEffect(() => {
    setTrackedIds(new Set(trackedListingIds));
  }, [trackedListingIds]);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const toggleMutation = useMutation({
    ...toggleTrackingMutationOptions,
    onMutate: async (listingId) => {
      // Optimistic update
      const isTracked = trackedIds.has(listingId);
      setTrackedIds((prev) => {
        const next = new Set(prev);
        if (isTracked) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }
        return next;
      });
      return { isTracked };
    },
    onError: (_err, listingId, context) => {
      // Rollback on error
      if (context) {
        setTrackedIds((prev) => {
          const next = new Set(prev);
          if (context.isTracked) {
            next.add(listingId);
          } else {
            next.delete(listingId);
          }
          return next;
        });
      }
    },
  });

  const storefronts = useMemo(() => {
    const unique = new Set(listings.map((l) => l.storefront.name));
    return Array.from(unique).sort();
  }, [listings]);

  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings];

    if (selectedStorefront !== "all") {
      result = result.filter((l) => l.storefront.name === selectedStorefront);
    }

    if (stockFilter === "inStock") {
      result = result.filter((l) => l.lastStock);
    } else if (stockFilter === "outOfStock") {
      result = result.filter((l) => !l.lastStock);
    }

    result.sort((a, b) => {
      if (sortBy === "lastChecked") {
        const dateA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
        const dateB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === "storefront") {
        return a.storefront.name.localeCompare(b.storefront.name);
      }
      return 0;
    });

    return result;
  }, [listings, sortBy, selectedStorefront, stockFilter]);

  const formatLastChecked = (date: Date | null | undefined) => {
    if (!date) return "Never checked";
    if (now === null) return new Date(date).toISOString().slice(0, 10);
    const d = new Date(date);
    const diffMs = now - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const clearFilters = () => {
    setSelectedStorefront("all");
    setStockFilter("all");
    setSortBy("lastChecked");
  };

  const handleToggleTracking = (listingId: string) => {
    if (!session) return;
    toggleMutation.mutate(listingId);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4 border">
        <div className="flex flex-wrap gap-4 items-end">
          <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field>
              <FieldLabel className="text-muted-foreground" htmlFor="sortBy">
                Sort by
              </FieldLabel>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="bg-background">
                  <SelectValue id="sortBy" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="lastChecked">Last Updated</SelectItem>
                    <SelectItem value="storefront">Storefront Name</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel className="text-muted-foreground" htmlFor="storefront">
                Storefront
              </FieldLabel>
              <Select value={selectedStorefront} onValueChange={setSelectedStorefront}>
                <SelectTrigger className="bg-background">
                  <SelectValue id="storefront" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="all">All Storefronts</SelectItem>
                    {storefronts.map((storefront) => (
                      <SelectItem key={storefront} value={storefront}>
                        {storefront}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel className="text-muted-foreground" htmlFor="stockStatus">
                Stock Status
              </FieldLabel>
              <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
                <SelectTrigger className="bg-background">
                  <SelectValue id="stockStatus" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="inStock">In Stock</SelectItem>
                    <SelectItem value="outOfStock">Out of Stock</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredAndSortedListings.length} of {listings.length} listings
        </div>
      </div>

      {filteredAndSortedListings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg">No matcha items match your filters.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAndSortedListings.map((listing) => (
            <div key={listing.id} className="border rounded-lg flex flex-col hover:shadow-lg transition-shadow bg-card">
              {listing.matcha.imageUrl && (
                <div className="p-4 pb-2">
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src={listing.matcha.imageUrl}
                      alt={listing.matcha.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="p-4 space-y-1">
                <h2 className="text-md font-semibold">{listing.matcha.name}</h2>
                <p className="text-sm text-muted-foreground">{listing.matcha.brand.name}</p>
                <p className="text-sm text-muted-foreground">{listing.storefront.name}</p>
                <p className="text-xs text-muted-foreground/70">Updated: {formatLastChecked(listing.lastChecked)}</p>
                {listing.matcha.description && (
                  <p className="text-sm mt-2 line-clamp-3">{listing.matcha.description}</p>
                )}
              </div>
              <div className="p-4 pt-2 mt-auto flex items-center justify-between">
                <Badge variant={listing.lastStock ? "success" : "destructive"}>
                  {listing.lastStock ? "In Stock" : "Out of Stock"}
                </Badge>
                <div className="flex items-center gap-2">
                  {listing.price && <span className="text-sm text-muted-foreground">{listing.price}</span>}
                  {session ? (
                    <Button
                      variant={trackedIds.has(listing.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleTracking(listing.id)}
                      disabled={toggleMutation.isPending}
                    >
                      {trackedIds.has(listing.id) ? "🔔" : "🔕"}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">Login to track</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
