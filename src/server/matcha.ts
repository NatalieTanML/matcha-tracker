import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { createDb } from "@/db";
import { listings } from "@/db/schema";

export const getListings = createServerFn({
  method: "GET",
}).handler(async () => {
  const db = createDb(env.DATABASE_URL);
  const result = await db.query.listings.findMany({
    where: eq(listings.isActive, true),
    with: {
      matcha: {
        with: {
          brand: true,
        },
      },
      storefront: true,
    },
    orderBy: desc(listings.lastChecked),
  });
  return result;
});
