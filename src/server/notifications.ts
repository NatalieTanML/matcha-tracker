import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { createDb } from "@/db";
import { notificationState, userFavourites, users } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const getMyFavourites = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers });

  if (!session) return [];

  const db = createDb(env.DATABASE_URL);
  const favs = await db.query.userFavourites.findMany({
    where: eq(userFavourites.userId, session.user.id),
    with: {
      listing: {
        with: {
          matcha: { with: { brand: true } },
          storefront: true,
        },
      },
    },
  });

  return favs.map((f) => ({
    favouriteId: f.id,
    listingId: f.listingId,
    enabled: f.enabled,
    listing: f.listing,
  }));
});

const toggleFavouriteEnabledValidator = (input: unknown): { listingId: string } => {
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

export const toggleFavouriteEnabled = createServerFn({
  method: "POST",
})
  .inputValidator(toggleFavouriteEnabledValidator)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error("Unauthorized");

    const db = createDb(env.DATABASE_URL);

    const existing = await db.query.userFavourites.findFirst({
      where: and(eq(userFavourites.userId, session.user.id), eq(userFavourites.listingId, data.listingId)),
    });

    if (!existing) throw new Error("Favourite not found");

    await db
      .update(userFavourites)
      .set({ enabled: !existing.enabled, updatedAt: new Date() })
      .where(eq(userFavourites.id, existing.id));

    return { enabled: !existing.enabled };
  });

export const getNotificationSettings = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers });

  if (!session) throw new Error("Unauthorized");

  const db = createDb(env.DATABASE_URL);
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  return { includeOosInMessage: user?.includeOosInMessage ?? false };
});

const updateNotificationSettingsValidator = (input: unknown): { includeOosInMessage: boolean } => {
  if (
    !input ||
    typeof input !== "object" ||
    !("includeOosInMessage" in input) ||
    typeof (input as { includeOosInMessage: unknown }).includeOosInMessage !== "boolean"
  ) {
    throw new Error("includeOosInMessage (boolean) is required");
  }
  return input as { includeOosInMessage: boolean };
};

export const updateNotificationSettings = createServerFn({
  method: "POST",
})
  .inputValidator(updateNotificationSettingsValidator)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error("Unauthorized");

    const db = createDb(env.DATABASE_URL);

    await db
      .update(users)
      .set({ includeOosInMessage: data.includeOosInMessage, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    // Clear notification state for this user so the next scrape sends a fresh message
    // reflecting the updated OOS preference
    await db.delete(notificationState).where(eq(notificationState.userId, session.user.id));

    return { success: true };
  });
