import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";

export const getListings = createServerFn({
  method: "GET",
}).handler(async () => {
  const listings = await prisma.listing.findMany({
    where: {
      isActive: true,
    },
    include: {
      matcha: {
        include: {
          brand: true,
        },
      },
      storefront: true,
    },
    orderBy: {
      lastChecked: "desc",
    },
  });
  return listings;
});
