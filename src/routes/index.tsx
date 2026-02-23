import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getListings } from "@/server/matcha";

export const Route = createFileRoute("/")({
  loader: async () => await getListings(),
  component: App,
});

type SortOption = "lastChecked" | "storefront";
type StockFilter = "all" | "inStock" | "outOfStock";

function App() {
  const listings = Route.useLoaderData();

  const [sortBy, setSortBy] = useState<SortOption>("lastChecked");
  const [selectedStorefront, setSelectedStorefront] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

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
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
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

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4 border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Field className="text-sm text-muted-foreground w-64">
              <FieldLabel>Sort by</FieldLabel>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="lastChecked">Last Updated</SelectItem>
                  <SelectItem value="storefront">Storefront Name</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-1">
            <Field className="text-sm text-muted-foreground w-64">
              <FieldLabel>Storefront</FieldLabel>
              <Select value={selectedStorefront} onValueChange={setSelectedStorefront}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All Storefronts</SelectItem>
                  {storefronts.map((storefront) => (
                    <SelectItem key={storefront} value={storefront}>
                      {storefront}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-1">
            <Field className="text-sm text-muted-foreground w-64">
              <FieldLabel>Stock Status</FieldLabel>
              <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="inStock">In Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
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
                <Badge
                  variant={listing.lastStock ? "outline" : "destructive"}
                  className={
                    listing.lastStock ? "bg-primary-foreground text-primary border-primary/30" : "border-destructive/30"
                  }
                >
                  {listing.lastStock ? "In Stock" : "Out of Stock"}
                </Badge>
                {listing.price && <span className="text-sm text-muted-foreground">{listing.price}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
