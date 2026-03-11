import { HeartIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listingsQueryOptions,
  myFavouritesQueryOptions,
  sessionQueryOptions,
  toggleTrackingMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/")({
  component: App,
});

type SortOption = "lastChecked" | "storefront";
type StockFilter = "all" | "inStock" | "outOfStock";

function ListingCard({
  listing,
  isTracked,
  onToggle,
  isToggling,
  formatLastChecked,
  session,
}: {
  listing: any;
  isTracked: boolean;
  isToggling: boolean;
  onToggle: (id: string) => void;
  formatLastChecked: (date: Date | null | undefined) => string;
  session: any;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow group/card border ring-0" key={listing.id}>
      {listing.matcha.imageUrl && (
        <div className="px-4 pb-2">
          <AspectRatio ratio={1} className="overflow-hidden rounded-md bg-muted">
            <img
              src={listing.matcha.imageUrl}
              alt={listing.matcha.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </AspectRatio>
        </div>
      )}
      <CardContent className="space-y-2 grow">
        <h2 className="text-md font-semibold">{listing.matcha.name}</h2>
        <p className="text-sm text-muted-foreground">{listing.matcha.brand.name}</p>
        <p className="text-sm text-muted-foreground">{listing.storefront.name}</p>
        <p className="text-xs text-muted-foreground/70">Updated: {formatLastChecked(listing.lastChecked)}</p>
        {listing.matcha.description && <p className="text-sm mt-2 line-clamp-3">{listing.matcha.description}</p>}
      </CardContent>
      <CardFooter className="justify-between mt-auto">
        <Badge variant={listing.lastStock ? "success" : "destructive"}>
          {listing.lastStock ? "In Stock" : "Out of Stock"}
        </Badge>
        {session && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(listing.id)}
              disabled={isToggling}
              className={
                isToggling
                  ? "opacity-50"
                  : isTracked
                    ? "text-destructive hover:text-gray-500"
                    : "text-muted-foreground hover:text-destructive"
              }
            >
              <HeartIcon size={20} weight={isTracked ? "fill" : "regular"} />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function ListingCardSkeleton() {
  return (
    <Card className="group/card border ring-0">
      <div className="px-4 pb-2">
        <AspectRatio ratio={1} className="overflow-hidden rounded-md bg-muted">
          <Skeleton className="w-full h-full" />
        </AspectRatio>
      </div>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-12 w-full mt-2" />
      </CardContent>
      <CardFooter className="justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
}

function FilterSkeleton() {
  return (
    <Card className="mb-6 p-4 bg-muted border ring-0">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-3 w-full">
        <Field>
          <Skeleton className="h-5 w-48 bg-card/80" />
          <Skeleton className="h-8 w-full rounded-md bg-card/80" />
        </Field>
        <Field>
          <Skeleton className="h-5 w-48 bg-card/80" />
          <Skeleton className="h-8 w-full rounded-md bg-card/80" />
        </Field>
        <Field>
          <Skeleton className="h-5 w-48 bg-card/80" />
          <Skeleton className="h-8 w-full rounded-md bg-card/80" />
        </Field>
      </FieldGroup>
      <Skeleton className="h-4 w-48 bg-card/80" />
    </Card>
  );
}

function App() {
  const { data: listings, isLoading: isLoadingListings } = useQuery(listingsQueryOptions);
  const { data: trackedListings, isLoading: isLoadingTracked } = useQuery(myFavouritesQueryOptions);
  const { data: session } = useQuery(sessionQueryOptions);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortOption>("lastChecked");
  const [selectedStorefront, setSelectedStorefront] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [now, setNow] = useState<number | null>(null);

  const isLoading = isLoadingListings || isLoadingTracked;

  // Keep local state in sync with server state
  useEffect(() => {
    if (trackedListings) {
      setTrackedIds(new Set(trackedListings.map((t) => t.listingId)));
    }
  }, [trackedListings]);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const toggleMutation = useMutation({
    ...toggleTrackingMutationOptions,
    onMutate: async (listingId) => {
      setTogglingId(listingId);
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
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const storefronts = useMemo(() => {
    if (!listings) return [];
    const unique = new Set(listings.map((l) => l.storefront.name));
    return Array.from(unique).sort();
  }, [listings]);

  const filteredAndSortedListings = useMemo(() => {
    if (!listings) return [];
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <FilterSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 p-4 bg-muted border ring-0">
        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
          <Field>
            <FieldLabel className="text-muted-foreground" htmlFor="sortBy">
              Sort by
            </FieldLabel>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="bg-card/80">
                <SelectValue id="sortBy" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="lastChecked">Last updated</SelectItem>
                  <SelectItem value="storefront">Storefront name</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel className="text-muted-foreground" htmlFor="storefront">
              Storefront
            </FieldLabel>
            <Select value={selectedStorefront} onValueChange={setSelectedStorefront}>
              <SelectTrigger className="bg-card/80">
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
              Stock status
            </FieldLabel>
            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
              <SelectTrigger className="bg-card/80">
                <SelectValue id="stockStatus" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="inStock">In stock</SelectItem>
                  <SelectItem value="outOfStock">Out of stock</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <div className="text-xs text-muted-foreground">
          Showing {filteredAndSortedListings.length} of {listings?.length ?? 0} listings
        </div>
      </Card>

      {filteredAndSortedListings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No matcha items match your filters</EmptyTitle>
            <EmptyDescription>
              <Button variant="link" onClick={clearFilters} className="p-0 h-auto">
                Clear filters
              </Button>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAndSortedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isTracked={trackedIds.has(listing.id)}
              isToggling={togglingId === listing.id}
              onToggle={handleToggleTracking}
              formatLastChecked={formatLastChecked}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}
