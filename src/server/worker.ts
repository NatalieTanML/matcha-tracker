import handler from "@tanstack/react-start/server-entry";
import { eq } from "drizzle-orm";
import { parse } from "node-html-parser";
import { createDb } from "@/db";
import { listings, scrapeJobs, stockHistory } from "@/db/schema";

// Configuration: Number of listings per queue batch
const BATCH_SIZE = 10;

interface ListingBatch {
  batchIndex: number;
  totalBatches: number;
  scrapeJobId: string;
  listings: Array<{
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
  }>;
}

// Cloudflare Workers handler with both scheduled (cron) and queue support
export default {
  fetch: handler.fetch,

  // Cron handler: Triggered every 5 minutes
  // Enqueues batches of listings to be processed
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    console.log("Cron triggered:", _event.cron);
    console.log("Starting scrape job at:", new Date().toISOString());

    const db = createDb(env.DATABASE_URL);

    try {
      // Create a scrape job record
      const [scrapeJob] = await db
        .insert(scrapeJobs)
        .values({
          id: crypto.randomUUID(),
          startedAt: new Date(),
          success: false,
        })
        .returning();

      // Get all active listings
      const activeListings = await db.query.listings.findMany({
        where: eq(listings.isActive, true),
        with: {
          matcha: { with: { brand: true } },
          storefront: true,
        },
      });

      console.log(`Enqueuing ${activeListings.length} listings in batches of ${BATCH_SIZE}`);

      // Split listings into batches
      const batches: ListingBatch[] = [];
      for (let i = 0; i < activeListings.length; i += BATCH_SIZE) {
        batches.push({
          batchIndex: Math.floor(i / BATCH_SIZE),
          totalBatches: Math.ceil(activeListings.length / BATCH_SIZE),
          scrapeJobId: scrapeJob.id,
          listings: activeListings.slice(i, i + BATCH_SIZE),
        });
      }

      // Send all batches to the queue
      // Each batch will be processed by a separate queue invocation
      const messages = batches.map((batch) => ({ body: batch }));
      await env.SCRAPE_QUEUE.sendBatch(messages);

      console.log(`Enqueued ${batches.length} batches for processing`);
    } catch (error) {
      console.error("Failed to enqueue scrape batches:", error);
      throw error;
    }
  },

  // Queue handler: Processes each batch of listings
  // Each invocation has its own 50-subrequest limit
  async queue(batch: MessageBatch<ListingBatch>, env: Env, _ctx: ExecutionContext) {
    const db = createDb(env.DATABASE_URL);

    for (const message of batch.messages) {
      const { batchIndex, totalBatches, scrapeJobId, listings: batchListings } = message.body;

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} with ${batchListings.length} listings`);

      let listingsChecked = 0;
      let listingsChanged = 0;
      const errors: string[] = [];

      // Process each listing in the batch
      for (const listing of batchListings) {
        try {
          listingsChecked++;
          const inStock = await checkStock(listing);

          // Record stock history
          await db.insert(stockHistory).values({
            id: crypto.randomUUID(),
            listingId: listing.id,
            inStock,
            price: listing.price,
          });

          // Check if stock status changed
          if (listing.lastStock !== inStock) {
            listingsChanged++;

            // Update listing with new stock status
            await db
              .update(listings)
              .set({ lastStock: inStock, lastChecked: new Date() })
              .where(eq(listings.id, listing.id));

            // Send notification if now in stock
            if (inStock && listing.lastStock === false) {
              // await sendNotification(listing, env);
            }
          } else {
            // Just update lastChecked
            await db.update(listings).set({ lastChecked: new Date() }).where(eq(listings.id, listing.id));
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Listing ${listing.id}: ${errorMsg}`);
          console.error(`Error checking listing ${listing.id}:`, errorMsg);

          // Record error in stock history (preserve lastStock in listings table)
          await db.insert(stockHistory).values({
            id: crypto.randomUUID(),
            listingId: listing.id,
            inStock: false,
            error: errorMsg,
          });
        }
      }

      // Update scrape job with batch results
      // Use a simple increment approach by reading current values first
      const [currentJob] = await db.select().from(scrapeJobs).where(eq(scrapeJobs.id, scrapeJobId));

      if (currentJob) {
        const currentChecked = parseInt(currentJob.listingsChecked || "0", 10);
        const currentChanged = parseInt(currentJob.listingsChanged || "0", 10);
        const currentErrors = currentJob.errors || [];

        await db
          .update(scrapeJobs)
          .set({
            completedAt: new Date(),
            listingsChecked: String(currentChecked + listingsChecked),
            listingsChanged: String(currentChanged + listingsChanged),
            errors: [...currentErrors, ...errors],
            success: errors.length === 0 && currentErrors.length === 0,
          })
          .where(eq(scrapeJobs.id, scrapeJobId));
      }

      console.log(
        `Batch ${batchIndex + 1}/${totalBatches} completed: ${listingsChecked} checked, ${listingsChanged} changed`,
      );

      // Acknowledge the message as processed
      message.ack();
    }
  },
};

interface Listing {
  id: string;
  url: string;
  storefront: {
    name: string;
    url: string;
  };
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

  // Use storefront name to determine parsing strategy
  if (listing.storefront.name.toLowerCase().includes("sazen") || listing.url.includes("sazentea.com")) {
    return parseSazenStock(html);
  } else if (listing.storefront.name.toLowerCase().includes("ippodo") || listing.url.includes("ippodo")) {
    return parseIppodoStock(html);
  } else if (listing.storefront.name.toLowerCase().includes("nakamura") || listing.url.includes("tokichi")) {
    return parseNakamuraStock(html);
  } else if (listing.url.includes("myshopify.com") || listing.url.includes("shopify")) {
    return parseShopifyStock(html);
  }

  // Generic check
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
  const outOfStockText = root.querySelector("p strong.red")?.text?.trim() || "";
  const inStockForm = root.querySelector("form#basket-add");
  return !outOfStockText.includes("This product is unavailable") && !!inStockForm;
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
