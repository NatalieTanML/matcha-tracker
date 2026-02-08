import { createFileRoute } from "@tanstack/react-router";
import { getListings } from "@/server/matcha";

export const Route = createFileRoute("/")({
  loader: async () => await getListings(),

  component: App,
});

function App() {
  const listings = Route.useLoaderData();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Matcha Stock Tracker</h1>

      {listings.length === 0 ? (
        <p>No matcha items yet.</p>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="border p-4 rounded">
              <h2 className="font-semibold">{listing.matcha.name}</h2>
              <p className="text-sm text-gray-600">
                {listing.matcha.brand.name}
              </p>
              <p className="text-sm text-gray-500">{listing.storefront.name}</p>
              {listing.matcha.description && (
                <p className="text-sm mt-2">{listing.matcha.description}</p>
              )}
              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${listing.lastStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {listing.lastStock ? "In Stock" : "Out of Stock"}
                </span>
                {listing.price && (
                  <span className="ml-2 text-sm text-gray-600">
                    {listing.price}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
