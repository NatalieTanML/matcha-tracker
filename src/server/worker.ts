import handler from "@tanstack/react-start/server-entry";
import { eq } from "drizzle-orm";
import { parse } from "node-html-parser";
import { createDb } from "@/db";
import { listings, scrapeJobs, stockHistory } from "@/db/schema";

// Cloudflare Workers scheduled event handler for stock checking
export default {
  fetch: handler.fetch,

  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    console.log("Cron triggered:", _event.cron);
    console.log("Running matcha stock check at:", new Date().toISOString());

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

      // Get all active listings to check
      const activeListings = await db.query.listings.findMany({
        where: eq(listings.isActive, true),
        with: {
          matcha: { with: { brand: true } },
          storefront: true,
        },
      });

      let listingsChecked = 0;
      let listingsChanged = 0;
      const errors: string[] = [];

      // Check stock for each listing
      // Process sequentially with delays to avoid Cloudflare subrequest limits (max 50)
      for (let i = 0; i < activeListings.length; i++) {
        const listing = activeListings[i];

        // Add delay between requests (except for first one)
        // 200ms delay = 5 requests per second, keeps us well under limits
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

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

          // Record error in stock history
          await db.insert(stockHistory).values({
            id: crypto.randomUUID(),
            listingId: listing.id,
            inStock: false,
            error: errorMsg,
          });
        }
      }

      // Update scrape job with results
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

      console.log(`Scrape completed: ${listingsChecked} checked, ${listingsChanged} changed`);
    } catch (error) {
      console.error("Scrape job failed:", error);
      throw error;
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
    'availability": "https://schema.org/OutOfStock"',
    'data-availability="out of stock"',
  ];

  const htmlLower = html.toLowerCase();
  return !outOfStockIndicators.some((indicator) => htmlLower.includes(indicator.toLowerCase()));
}

function parseSazenStock(html: string): boolean {
  // Based on old/index.ts logic:
  // const outOfStockText = $('p strong.red').text().trim();
  // const inStockForm = $('form#basket-add');
  // return !outOfStockText.includes('This product is unavailable') && inStockForm.length > 0;

  const root = parse(html);

  // Check for out of stock text in <p><strong class="red">
  const outOfStockText = root.querySelector("p strong.red")?.text?.trim() || "";

  // Check for add to cart form
  const inStockForm = root.querySelector("form#basket-add");

  return !outOfStockText.includes("This product is unavailable") && !!inStockForm;
}

function parseIppodoStock(html: string): boolean {
  // Based on old/index.ts logic:
  // Look for any button inside .product-form__buttons without style="display: none"
  // const visibleAddToCartButton = $('.product-form__buttons button').filter((_, el) => {
  //   const style = $(el).attr('style') || '';
  //   return !style.includes('display: none');
  // });
  // return visibleAddToCartButton.length > 0;

  const root = parse(html);
  const buttons = root.querySelectorAll(".product-form__buttons button");

  // Check if any button is visible (not display: none)
  for (const button of buttons) {
    const style = button.getAttribute("style") || "";
    if (!style.toLowerCase().includes("display: none")) {
      return true;
    }
  }

  return false;
}

function parseNakamuraStock(html: string): boolean {
  // Based on old/index.ts logic:
  // const buttonText = $('div.product-form__buttons button span').text().trim();
  // return buttonText === 'Add to cart';

  const root = parse(html);
  const buttonText = root.querySelector("div.product-form__buttons button span")?.text?.trim() || "";

  return buttonText === "Add to cart";
}

function parseShopifyStock(html: string): boolean {
  // Shopify stores - check for visible add to cart button
  const root = parse(html);

  // Look for add to cart buttons
  const buttons = root.querySelectorAll(
    'button[name="add"], button[type="submit"], button[class*="add-to-cart"], button[class*="AddToCart"]',
  );

  for (const button of buttons) {
    // Check if button is hidden
    const style = button.getAttribute("style") || "";
    if (style.toLowerCase().includes("display: none")) {
      continue;
    }

    // Check button text content
    const buttonText = button.text?.toLowerCase().trim() || "";
    if (buttonText.includes("sold out") || buttonText.includes("out of stock") || buttonText.includes("unavailable")) {
      continue;
    }

    return true;
  }

  // Check for schema.org out of stock
  if (html.includes('"availability":"https://schema.org/OutOfStock"')) {
    return false;
  }

  return true;
}

// async function sendNotification(listing: ListingWithDetails, env: Env): Promise<void> {
//   const telegramToken = env.TELEGRAM_BOT_TOKEN;
//   const chatId = env.TELEGRAM_CHAT_ID;

//   if (!telegramToken || !chatId) {
//     console.warn("Telegram credentials not configured");
//     return;
//   }

//   const timestamp = new Date().toLocaleString("en-GB", {
//     dateStyle: "full",
//     timeStyle: "long",
//     timeZone: "Asia/Singapore",
//   });

//   const message =
//     `<b>${timestamp}</b>\n\n` +
//     `<b><u>${listing.storefront.name}</u></b> stock update:\n` +
//     `<a href="${listing.url}">${listing.matcha.brand.name} - ${listing.matcha.name}</a>`;

//   const encodedMessage = encodeURIComponent(message);
//   const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`Failed to send Telegram notification: ${response.status}`);
//   }
// }
