import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getListings } from "@/server/matcha";

export const Route = createFileRoute("/")({
  loader: async () => await getListings(),
  component: App,
});

type SortOption = "lastChecked" | "storefront";
type StockFilter = "all" | "inStock" | "outOfStock";

function App() {
  const listings = Route.useLoaderData();

  // State for sorting and filtering
  const [sortBy, setSortBy] = useState<SortOption>("lastChecked");
  const [selectedStorefront, setSelectedStorefront] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  // Get unique storefronts for filter dropdown
  const storefronts = useMemo(() => {
    const unique = new Set(listings.map((l) => l.storefront.name));
    return Array.from(unique).sort();
  }, [listings]);

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings];

    // Apply storefront filter
    if (selectedStorefront !== "all") {
      result = result.filter((l) => l.storefront.name === selectedStorefront);
    }

    // Apply stock filter
    if (stockFilter === "inStock") {
      result = result.filter((l) => l.lastStock);
    } else if (stockFilter === "outOfStock") {
      result = result.filter((l) => !l.lastStock);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "lastChecked") {
        // Sort by lastChecked descending (most recent first)
        const dateA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
        const dateB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === "storefront") {
        // Sort by storefront name ascending
        return a.storefront.name.localeCompare(b.storefront.name);
      }
      return 0;
    });

    return result;
  }, [listings, sortBy, selectedStorefront, stockFilter]);

  // Format date for display
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Matcha Stock Tracker</h1>

      {/* Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Sort by */}
          <div>
            <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            >
              <option value="lastChecked">Last Updated</option>
              <option value="storefront">Storefront Name</option>
            </select>
          </div>

          {/* Storefront filter */}
          <div>
            <label htmlFor="storefront-select" className="block text-sm font-medium text-gray-700 mb-1">
              Storefront
            </label>
            <select
              id="storefront-select"
              value={selectedStorefront}
              onChange={(e) => setSelectedStorefront(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            >
              <option value="all">All Storefronts</option>
              {storefronts.map((storefront) => (
                <option key={storefront} value={storefront}>
                  {storefront}
                </option>
              ))}
            </select>
          </div>

          {/* Stock status filter */}
          <div>
            <label htmlFor="stock-select" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status
            </label>
            <select
              id="stock-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            >
              <option value="all">All</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedListings.length} of {listings.length} listings
        </div>
      </div>

      {/* Listings Grid */}
      {filteredAndSortedListings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No matcha items match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedStorefront("all");
              setStockFilter("all");
              setSortBy("lastChecked");
            }}
            className="mt-2 text-indigo-600 hover:text-indigo-800 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAndSortedListings.map((listing) => (
            <div key={listing.id} className="border p-4 rounded flex flex-col hover:shadow-lg transition-shadow">
              {listing.matcha.imageUrl && (
                <div className="mb-3 aspect-square overflow-hidden rounded bg-gray-100">
                  <img src={listing.matcha.imageUrl} alt={listing.matcha.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="font-semibold">{listing.matcha.name}</h2>
              <p className="text-sm text-gray-600">{listing.matcha.brand.name}</p>
              <p className="text-sm text-gray-500">{listing.storefront.name}</p>

              {/* Last updated time */}
              <p className="text-xs text-gray-400 mt-1">Updated: {formatLastChecked(listing.lastChecked)}</p>

              {listing.matcha.description && (
                <p className="text-sm mt-2 text-gray-700 line-clamp-3">{listing.matcha.description}</p>
              )}
              <div className="mt-auto pt-3 flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    listing.lastStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {listing.lastStock ? "In Stock" : "Out of Stock"}
                </span>
                {listing.price && <span className="text-sm text-gray-600">{listing.price}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
