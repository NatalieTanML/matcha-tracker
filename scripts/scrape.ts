import { and, eq } from "drizzle-orm";
import { parse } from "node-html-parser";
import PQueue from "p-queue";
import { createDb } from "../src/db";
import {
  listings,
  notificationState,
  scrapeJobs,
  stockHistory,
  userFavourites,
  users,
} from "../src/db/schema";

const CONCURRENCY_LIMIT = 5;
const SAZEN_CONCURRENCY = 3;

interface Listing {
  id: string;
  url: string;
  price: string | null;
  lastStock: boolean | null;
  storefrontId: string;
  storefront: {
    id: string;
    name: string;
    url: string;
  };
  matcha: {
    name: string;
    brand: {
      name: string;
    };
  };
}

interface ProcessResult {
  listing: Listing;
  inStock: boolean;
  changed: boolean;
  error: string | null;
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!response.ok) {
      console.error(`Failed to send Telegram message to ${chatId}: ${response.status}`);
    }
  } catch (err) {
    console.error(`Error sending Telegram message: ${err}`);
  }
}

/**
 * After all stock data is collected, send per-storefront Telegram notifications.
 *
 * Logic:
 * - For each user with ≥1 enabled favourite, grouped by storefront:
 *   - inStockNow  = their enabled favourites for this storefront that are currently in stock
 *   - lastSentIds = the listing IDs that were in stock in the last message we sent (from notification_state)
 *   - newInStock  = inStockNow whose IDs are NOT in lastSentIds
 *   - If newInStock is empty → skip (no newly in-stock items)
 *   - Otherwise → send message, upsert notification_state
 *
 * The user-level option `includeOosInMessage` controls whether OOS favourites are appended.
 * When that option is toggled, we clear notification_state rows for that user (done in the server fn),
 * so the next scrape sends a fresh message.
 */
async function sendNotifications(
  db: ReturnType<typeof createDb>,
  allListings: Listing[],
  currentStockMap: Map<string, boolean>, // listingId → inStock
  botToken: string,
) {
  // Build a map of listingId → listing for quick lookup
  const listingMap = new Map<string, Listing>();
  for (const l of allListings) {
    listingMap.set(l.id, l);
  }

  // Fetch all users who have at least one enabled favourite and have a telegram chat id
  const usersWithFavourites = await db
    .select({
      userId: userFavourites.userId,
      telegramChatId: users.telegramChatId,
      includeOos: users.includeOosInMessage,
    })
    .from(userFavourites)
    .innerJoin(users, eq(userFavourites.userId, users.id))
    .where(eq(userFavourites.enabled, true))
    .groupBy(userFavourites.userId, users.telegramChatId, users.includeOosInMessage);

  // De-duplicate users (groupBy returns one row per user)
  const uniqueUsers = new Map<
    string,
    { userId: string; telegramChatId: string | null; includeOos: boolean }
  >();
  for (const row of usersWithFavourites) {
    if (!uniqueUsers.has(row.userId)) {
      uniqueUsers.set(row.userId, row);
    }
  }

  for (const { userId, telegramChatId, includeOos } of uniqueUsers.values()) {
    if (!telegramChatId) continue;

    // Fetch all enabled favourites for this user
    const favs = await db
      .select({
        listingId: userFavourites.listingId,
        storefrontId: listings.storefrontId,
      })
      .from(userFavourites)
      .innerJoin(listings, eq(userFavourites.listingId, listings.id))
      .where(and(eq(userFavourites.userId, userId), eq(userFavourites.enabled, true)));

    // Group favourites by storefront
    const byStorefront = new Map<string, string[]>(); // storefrontId → listingIds
    for (const fav of favs) {
      if (!byStorefront.has(fav.storefrontId)) {
        byStorefront.set(fav.storefrontId, []);
      }
      byStorefront.get(fav.storefrontId)!.push(fav.listingId);
    }

    for (const [storefrontId, listingIds] of byStorefront) {
      // Partition into in-stock / OOS based on current scrape data
      const inStockNow = listingIds.filter((id) => currentStockMap.get(id) === true);
      const oosNow = listingIds.filter((id) => currentStockMap.get(id) !== true);

      // Sort for stable comparison
      const inStockNowSorted = [...inStockNow].sort();

      if (inStockNowSorted.length === 0) {
        // Nothing in stock for this storefront → no message
        continue;
      }

      // Fetch last notification state for this user+storefront
      const state = await db.query.notificationState.findFirst({
        where: and(
          eq(notificationState.userId, userId),
          eq(notificationState.storefrontId, storefrontId),
        ),
      });

      const lastSentIds = state?.lastInStockListingIds ?? [];
      const lastSentSet = new Set(lastSentIds);

      // New items = currently in stock that were NOT in the last sent message
      const newInStock = inStockNowSorted.filter((id) => !lastSentSet.has(id));

      if (newInStock.length === 0) {
        // No new items came into stock → skip
        continue;
      }

      // Look up the storefront name from the first listing
      const storefrontName = listingMap.get(listingIds[0])?.storefront.name ?? storefrontId;

      // Build the message
      let message = `<b>${storefrontName} — Stock Update</b>\n\n`;

      message += "✅ <b>In Stock:</b>\n";
      for (const id of inStockNowSorted) {
        const l = listingMap.get(id);
        if (l) {
          message += `  • ${l.matcha.brand.name} – ${l.matcha.name}\n`;
        }
      }

      if (includeOos && oosNow.length > 0) {
        message += "\n❌ <b>Out of Stock:</b>\n";
        for (const id of oosNow) {
          const l = listingMap.get(id);
          if (l) {
            message += `  • ${l.matcha.brand.name} – ${l.matcha.name}\n`;
          }
        }
      }

      await sendTelegramMessage(botToken, telegramChatId, message.trim());

      // Upsert notification_state
      if (state) {
        await db
          .update(notificationState)
          .set({ lastInStockListingIds: inStockNowSorted, sentAt: new Date() })
          .where(eq(notificationState.id, state.id));
      } else {
        await db.insert(notificationState).values({
          id: crypto.randomUUID(),
          userId,
          storefrontId,
          lastInStockListingIds: inStockNowSorted,
          sentAt: new Date(),
        });
      }

      console.log(
        `  📱 Sent notification to user ${userId} for storefront ${storefrontName}: ${newInStock.length} new in-stock item(s)`,
      );
    }
  }
}

async function main() {
  console.log("🍵 Starting matcha stock scrape at:", new Date().toISOString());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const db = createDb(databaseUrl);

  const [scrapeJob] = await db
    .insert(scrapeJobs)
    .values({
      id: crypto.randomUUID(),
      startedAt: new Date(),
      success: false,
    })
    .returning();

  console.log(`📋 Created scrape job: ${scrapeJob.id}`);

  const activeListings = await db.query.listings.findMany({
    where: eq(listings.isActive, true),
    with: {
      matcha: { with: { brand: true } },
      storefront: true,
    },
  });

  console.log(`🔍 Found ${activeListings.length} active listings to check`);

  const listingsByStorefront = new Map<string, Listing[]>();

  for (const listing of activeListings) {
    const storefrontName = listing.storefront.name;
    if (!listingsByStorefront.has(storefrontName)) {
      listingsByStorefront.set(storefrontName, []);
    }
    listingsByStorefront.get(storefrontName)!.push(listing);
  }

  console.log("\n📊 Storefront breakdown:");
  for (const [name, sfListings] of listingsByStorefront) {
    console.log(`  - ${name}: ${sfListings.length} listings`);
  }

  let listingsChecked = 0;
  let listingsChanged = 0;
  const errors: string[] = [];

  // Track current stock state after scrape (used for notifications)
  const currentStockMap = new Map<string, boolean>(); // listingId → inStock

  console.log(`\n🚀 Processing ${listingsByStorefront.size} storefronts in parallel...`);

  const storefrontPromises = Array.from(listingsByStorefront.entries()).map(
    async ([storefrontName, storefrontListings]) => {
      const isSazen = storefrontName.toLowerCase().includes("sazen");
      const concurrency = isSazen ? SAZEN_CONCURRENCY : CONCURRENCY_LIMIT;

      console.log(
        `  [${storefrontName}] Starting ${storefrontListings.length} listings (concurrency: ${concurrency})...`,
      );

      const startTime = Date.now();
      const results = await processWithQueue(storefrontListings, db, concurrency);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      const changedCount = results.filter((r) => r.changed).length;
      const errorCount = results.filter((r) => r.error).length;

      console.log(
        `  [${storefrontName}] ✓ Completed in ${duration}s: ${results.length} checked, ${changedCount} changed${errorCount > 0 ? `, ${errorCount} errors` : ""}`,
      );

      const stockChanges = results.filter((r) => r.changed);
      for (const change of stockChanges) {
        const status = change.inStock ? "✅ IN STOCK" : "❌ Out of stock";
        console.log(`    ${status}: ${change.listing.matcha.brand.name} - ${change.listing.matcha.name}`);
      }

      // Record current stock state for notification logic
      for (const result of results) {
        currentStockMap.set(result.listing.id, result.inStock);
      }

      return {
        checked: results.length,
        changed: changedCount,
        errors: results
          .filter((r) => r.error)
          .map((r) => `${storefrontName} ${r.listing.id}: ${r.error}`),
      };
    },
  );

  const results = await Promise.all(storefrontPromises);

  for (const result of results) {
    listingsChecked += result.checked;
    listingsChanged += result.changed;
    errors.push(...result.errors);
  }

  // Send Telegram notifications now that we have the full stock picture
  if (telegramBotToken) {
    console.log("\n📲 Sending notifications...");
    await sendNotifications(db, activeListings, currentStockMap, telegramBotToken);
  }

  await db
    .update(scrapeJobs)
    .set({
      completedAt: new Date(),
      listingsChecked: String(listingsChecked),
      listingsChanged: String(listingsChanged),
      errors,
      success: errors.length === 0,
    })
    .where(eq(scrapeJobs.id, scrapeJob.id));

  console.log("\n✅ Scrape completed!");
  console.log(`📊 Final results: ${listingsChecked} checked, ${listingsChanged} changed, ${errors.length} errors`);

  if (errors.length > 0) {
    console.log("\n⚠️ Errors encountered:");
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(0);
  }
}

async function processWithQueue(
  storefrontListings: Listing[],
  db: ReturnType<typeof createDb>,
  concurrency: number,
): Promise<ProcessResult[]> {
  const queue = new PQueue({ concurrency });

  const promises = storefrontListings.map((listing) =>
    queue.add(async () => {
      try {
        const inStock = await checkStock(listing);

        await db.insert(stockHistory).values({
          id: crypto.randomUUID(),
          listingId: listing.id,
          inStock,
          price: listing.price,
        });

        if (listing.lastStock !== inStock) {
          await db
            .update(listings)
            .set({ lastStock: inStock, lastChecked: new Date() })
            .where(eq(listings.id, listing.id));

          return {
            listing,
            inStock,
            changed: true,
            error: null,
          };
        } else {
          await db.update(listings).set({ lastChecked: new Date() }).where(eq(listings.id, listing.id));
          return {
            listing,
            inStock,
            changed: false,
            error: null,
          };
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        await db.insert(stockHistory).values({
          id: crypto.randomUUID(),
          listingId: listing.id,
          inStock: false,
          error: errorMsg,
        });
        return {
          listing,
          inStock: false,
          changed: false,
          error: errorMsg,
        };
      }
    }),
  );

  const settledResults = await Promise.allSettled(promises);

  return settledResults.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        listing: storefrontListings[index],
        inStock: false,
        changed: false,
        error: String(result.reason),
      };
    }
  });
}

async function checkStock(listing: Listing): Promise<boolean> {
  const response = await fetch(listing.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();

  if (
    listing.storefront.name.toLowerCase().includes("sazen") ||
    listing.url.includes("sazentea.com")
  ) {
    return parseSazenStock(html);
  } else if (
    listing.storefront.name.toLowerCase().includes("ippodo") ||
    listing.url.includes("ippodo")
  ) {
    return parseIppodoStock(html);
  } else if (
    listing.storefront.name.toLowerCase().includes("nakamura") ||
    listing.url.includes("tokichi")
  ) {
    return parseNakamuraStock(html);
  } else if (listing.url.includes("horiishichimeien")) {
    return parseHoriiStock(html);
  } else if (listing.url.includes("myshopify.com") || listing.url.includes("shopify")) {
    return parseShopifyStock(html);
  }

  const outOfStockIndicators = [
    "out of stock",
    "sold out",
    "unavailable",
    '"availability":"https://schema.org/OutOfStock"',
    'data-availability="out of stock"',
  ];

  const htmlLower = html.toLowerCase();
  return !outOfStockIndicators.some((indicator) => htmlLower.includes(indicator.toLowerCase()));
}

function parseSazenStock(html: string): boolean {
  const root = parse(html);
  const outOfStockText = root.querySelector("p strong.red")?.text?.trim().toLowerCase() || "";
  const addToCartButton = root.querySelector("button#product-add-to-basket")?.text?.trim().toLowerCase() || "";
  return !outOfStockText.includes("this product is unavailable") && addToCartButton === "add to cart";
}

function parseIppodoStock(html: string): boolean {
  const root = parse(html);
  const buttons = root.querySelectorAll(".product-form__buttons button");

  for (const button of buttons) {
    const style = button.getAttribute("style") || "";
    if (!style.toLowerCase().includes("display: none")) {
      return true;
    }
  }

  return false;
}

function parseNakamuraStock(html: string): boolean {
  const root = parse(html);
  const buttonText = root.querySelector("div.product-form__buttons button span")?.text?.trim() || "";
  return buttonText === "Add to cart";
}

function parseHoriiStock(html: string): boolean {
  const root = parse(html);
  const buttonText = root.querySelector("button.product-form__cart-submit span")?.text?.trim() || "";
  return buttonText === "Add to cart";
}

function parseShopifyStock(html: string): boolean {
  const root = parse(html);
  const buttons = root.querySelectorAll(
    'button[name="add"], button[type="submit"], button[class*="add-to-cart"], button[class*="AddToCart"]',
  );

  for (const button of buttons) {
    const style = button.getAttribute("style") || "";
    if (style.toLowerCase().includes("display: none")) {
      continue;
    }

    const buttonText = button.text?.toLowerCase().trim() || "";
    if (
      buttonText.includes("sold out") ||
      buttonText.includes("out of stock") ||
      buttonText.includes("unavailable")
    ) {
      continue;
    }

    return true;
  }

  if (html.includes('"availability":"https://schema.org/OutOfStock"')) {
    return false;
  }

  return true;
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
