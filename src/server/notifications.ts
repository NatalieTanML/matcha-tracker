import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { createDb } from "@/db";
import { userNotificationPreferences } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const getMyTrackedListings = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers });

  if (!session) return [];

  const db = createDb(env.DATABASE_URL);
  const prefs = await db.query.userNotificationPreferences.findMany({
    where: eq(userNotificationPreferences.userId, session.user.id),
    with: {
      listing: {
        with: {
          matcha: { with: { brand: true } },
          storefront: true,
        },
      },
    },
  });

  return prefs.map((p) => ({
    preferenceId: p.id,
    listingId: p.listingId,
    notificationMode: p.notificationMode,
    listing: p.listing,
  }));
});

const updateNotificationModeValidator = (
  input: unknown,
): { listingId: string; notificationMode: "none" | "individual" | "grouped" } => {
  if (
    !input ||
    typeof input !== "object" ||
    !("listingId" in input) ||
    !("notificationMode" in input) ||
    typeof (input as { listingId: unknown }).listingId !== "string"
  ) {
    throw new Error("listingId and notificationMode are required");
  }
  const mode = (input as { notificationMode: unknown }).notificationMode;
  if (mode !== "none" && mode !== "individual" && mode !== "grouped") {
    throw new Error("notificationMode must be 'none', 'individual', or 'grouped'");
  }
  return input as { listingId: string; notificationMode: "none" | "individual" | "grouped" };
};

export const updateNotificationMode = createServerFn({
  method: "POST",
})
  .inputValidator(updateNotificationModeValidator)
  .handler(async ({ data }) => {
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
      await db
        .update(userNotificationPreferences)
        .set({ notificationMode: data.notificationMode, updatedAt: new Date() })
        .where(eq(userNotificationPreferences.id, existing.id));
    } else {
      await db.insert(userNotificationPreferences).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        listingId: data.listingId,
        notificationMode: data.notificationMode,
      });
    }

    return { success: true };
  });
