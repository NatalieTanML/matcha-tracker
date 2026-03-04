import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { createDb } from "@/db";
import { listings, userNotificationPreferences } from "@/db/schema";
import { createAuth } from "@/lib/auth";

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

const toggleTrackingValidator = (input: unknown): { listingId: string } => {
  if (
    !input ||
    typeof input !== "object" ||
    !("listingId" in input) ||
    typeof (input as { listingId: unknown }).listingId !== "string"
  ) {
    throw new Error("listingId is required");
  }
  return input as { listingId: string };
};

export const toggleTracking = createServerFn({
  method: "POST",
})
  .inputValidator(toggleTrackingValidator)
  .handler(async ({ data }): Promise<{ tracked: boolean }> => {
    const headers = getRequestHeaders();
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error("Unauthorized");

    const db = createDb(env.DATABASE_URL);

    const existing = await db.query.userNotificationPreferences.findFirst({
      where: and(
        eq(userNotificationPreferences.userId, session.user.id),
        eq(userNotificationPreferences.listingId, data.listingId),
      ),
    });

    if (existing) {
      await db.delete(userNotificationPreferences).where(eq(userNotificationPreferences.id, existing.id));
      return { tracked: false };
    }

    await db.insert(userNotificationPreferences).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      listingId: data.listingId,
      notificationMode: "none",
    });

    return { tracked: true };
  });
