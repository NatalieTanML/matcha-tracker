import { eq } from "drizzle-orm";
import { parse } from "node-html-parser";
import PQueue from "p-queue";
import { createDb } from "../src/db";
import { listings, notificationsSent, scrapeJobs, stockHistory, userNotificationPreferences, users } from "../src/db/schema";

const CONCURRENCY_LIMIT = 5;
const SAZEN_CONCURRENCY = 3;

interface Listing {
  id: string;
  url: string;
  price: string | null;
  lastStock: boolean | null;
  storefront: {
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

interface WatcherInfo {
  userId: string;
  telegramChatId: string | null;
  notificationMode: "none" | "individual" | "grouped";
}

interface GroupedNotification {
  userId: string;
  telegramChatId: string;
  inStockItems: string[];
  outOfStockItems: string[];
}

async function notifyUsers(
  db: ReturnType<typeof createDb>,
  listing: Listing,
  inStock: boolean,
  botToken: string | undefined,
  groupedNotifications: Map<string, GroupedNotification>
) {
  if (!botToken) return;

  const watchers: WatcherInfo[] = await db
    .select({
      userId: userNotificationPreferences.userId,
      telegramChatId: users.telegramChatId,
      notificationMode: userNotificationPreferences.notificationMode,
    })
    .from(userNotificationPreferences)
    .innerJoin(users, eq(userNotificationPreferences.userId, users.id))
    .where(eq(userNotificationPreferences.listingId, listing.id));

  const status = inStock ? "🟢 IN STOCK" : "🔴 OUT OF STOCK";
  const message = `${status}: ${listing.matcha.brand.name} - ${listing.matcha.name}\n${listing.storefront.name}`;

  for (const watcher of watchers) {
    if (!watcher.telegramChatId) continue;

    if (watcher.notificationMode === "individual") {
      await sendTelegramMessage(botToken, watcher.telegramChatId, message);
      await db.insert(notificationsSent).values({
        id: crypto.randomUUID(),
        userId: watcher.userId,
        listingId: listing.id,
        notificationMode: "individual",
        inStock,
        messageSent: message,
      });
    } else if (watcher.notificationMode === "grouped") {
      if (!groupedNotifications.has(watcher.userId)) {
        groupedNotifications.set(watcher.userId, {
          userId: watcher.userId,
          telegramChatId: watcher.telegramChatId,
          inStockItems: [],
          outOfStockItems: [],
        });
      }
      const grouped = groupedNotifications.get(watcher.userId)!;
      if (inStock) {
        grouped.inStockItems.push(`${listing.matcha.brand.name} - ${listing.matcha.name}`);
      } else {
        grouped.outOfStockItems.push(`${listing.matcha.brand.name} - ${listing.matcha.name}`);
      }
    }
  }

  const activeWatchers = watchers.filter((w) => w.notificationMode !== "none");
  if (activeWatchers.length > 0) {
    console.log(`  📱 Notified ${activeWatchers.length} user(s) about ${listing.matcha.name}`);
  }
}

async function sendGroupedNotifications(
  db: ReturnType<typeof createDb>,
  groupedNotifications: Map<string, GroupedNotification>,
  botToken: string
) {
  for (const grouped of groupedNotifications.values()) {
    if (grouped.inStockItems.length === 0 && grouped.outOfStockItems.length === 0) continue;

    let message = "📢 <b>Stock Update</b>\n\n";

    if (grouped.inStockItems.length > 0) {
      message += "🟢 <b>Back in Stock:</b>\n";
      for (const item of grouped.inStockItems) {
        message += `  • ${item}\n`;
      }
      message += "\n";
    }

    if (grouped.outOfStockItems.length > 0) {
      message += "🔴 <b>Out of Stock:</b>\n";
      for (const item of grouped.outOfStockItems) {
        message += `  • ${item}\n`;
      }
    }

    await sendTelegramMessage(botToken, grouped.telegramChatId, message);

    for (const item of grouped.inStockItems) {
      await db.insert(notificationsSent).values({
        id: crypto.randomUUID(),
        userId: grouped.userId,
        listingId: null,
        notificationMode: "grouped",
        inStock: true,
        messageSent: item,
      });
    }

    for (const item of grouped.outOfStockItems) {
      await db.insert(notificationsSent).values({
        id: crypto.randomUUID(),
        userId: grouped.userId,
        listingId: null,
        notificationMode: "grouped",
        inStock: false,
        messageSent: item,
      });
    }
  }

  if (groupedNotifications.size > 0) {
    console.log(`  📱 Sent grouped notifications to ${groupedNotifications.size} user(s)`);
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

  const groupedNotifications = new Map<string, GroupedNotification>();

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
  for (const [name, listings] of listingsByStorefront) {
    console.log(`  - ${name}: ${listings.length} listings`);
  }

  let listingsChecked = 0;
  let listingsChanged = 0;
  const errors: string[] = [];

  console.log(`\n🚀 Processing ${listingsByStorefront.size} storefronts in parallel...`);

  const storefrontPromises = Array.from(listingsByStorefront.entries()).map(
    async ([storefrontName, storefrontListings]) => {
      const isSazen = storefrontName.toLowerCase().includes("sazen");
      const concurrency = isSazen ? SAZEN_CONCURRENCY : CONCURRENCY_LIMIT;

      console.log(
        `  [${storefrontName}] Starting ${storefrontListings.length} listings (concurrency: ${concurrency})...`
      );

      const startTime = Date.now();
      const results = await processWithQueue(
        storefrontListings,
        db,
        telegramBotToken,
        concurrency,
        groupedNotifications
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      const changedCount = results.filter((r) => r.changed).length;
      const errorCount = results.filter((r) => r.error).length;

      console.log(
        `  [${storefrontName}] ✓ Completed in ${duration}s: ${results.length} checked, ${changedCount} changed${errorCount > 0 ? `, ${errorCount} errors` : ""}`
      );

      const stockChanges = results.filter((r) => r.changed);
      for (const change of stockChanges) {
        const status = change.inStock ? "✅ IN STOCK" : "❌ Out of stock";
        console.log(`    ${status}: ${change.listing.matcha.brand.name} - ${change.listing.matcha.name}`);
      }

      return {
        checked: results.length,
        changed: changedCount,
        errors: results.filter((r) => r.error).map((r) => `${storefrontName} ${r.listing.id}: ${r.error}`),
      };
    }
  );

  const results = await Promise.all(storefrontPromises);

  for (const result of results) {
    listingsChecked += result.checked;
    listingsChanged += result.changed;
    errors.push(...result.errors);
  }

  if (telegramBotToken) {
    await sendGroupedNotifications(db, groupedNotifications, telegramBotToken);
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
  botToken: string | undefined,
  concurrency: number,
  groupedNotifications: Map<string, GroupedNotification>
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

          // Send Telegram notifications
          await notifyUsers(db, listing, inStock, botToken, groupedNotifications);

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
    })
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
  } else if (
    listing.url.includes("myshopify.com") ||
    listing.url.includes("shopify")
  ) {
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
    'button[name="add"], button[type="submit"], button[class*="add-to-cart"], button[class*="AddToCart"]'
  );

  for (const button of buttons) {
    const style = button.getAttribute("style") || "";
    if (style.toLowerCase().includes("display: none")) {
      continue;
    }

    const buttonText = button.text?.toLowerCase().trim() || "";
    if (buttonText.includes("sold out") || buttonText.includes("out of stock") || buttonText.includes("unavailable")) {
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
