import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import handler from "@tanstack/react-start/server-entry";

// Define Cloudflare Workers environment interface
interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  [key: string]: string | undefined;
}

// Cloudflare Workers scheduled event handler for stock checking
export default {
  fetch: handler.fetch,

  async scheduled(event: { cron: string }, env: Env, _ctx: unknown) {
    console.log("Cron triggered:", event.cron);
    console.log("Running matcha stock check at:", new Date().toISOString());

    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
    });
    const prisma = new PrismaClient({
      adapter,
    });

    try {
      // Create a scrape job record
      const scrapeJob = await prisma.scrapeJob.create({
        data: {
          startedAt: new Date(),
          success: false,
        },
      });

      // Get all active listings to check
      const listings = await prisma.listing.findMany({
        where: { isActive: true },
        include: {
          matcha: { include: { brand: true } },
          storefront: true,
        },
      });

      let listingsChecked = 0;
      let listingsChanged = 0;
      const errors: string[] = [];

      // Check stock for each listing
      for (const listing of listings) {
        try {
          listingsChecked++;
          const inStock = await checkStock(listing);

          // Record stock history
          await prisma.stockHistory.create({
            data: {
              listingId: listing.id,
              inStock,
              price: listing.price,
            },
          });

          // Check if stock status changed
          if (listing.lastStock !== inStock) {
            listingsChanged++;

            // Update listing with new stock status
            await prisma.listing.update({
              where: { id: listing.id },
              data: { lastStock: inStock, lastChecked: new Date() },
            });

            // Send notification if now in stock
            if (inStock && listing.lastStock === false) {
              await sendNotification(listing, env);
            }
          } else {
            // Just update lastChecked
            await prisma.listing.update({
              where: { id: listing.id },
              data: { lastChecked: new Date() },
            });
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Listing ${listing.id}: ${errorMsg}`);

          // Record error in stock history
          await prisma.stockHistory.create({
            data: {
              listingId: listing.id,
              inStock: false,
              error: errorMsg,
            },
          });
        }
      }

      // Update scrape job with results
      await prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: {
          completedAt: new Date(),
          listingsChecked,
          listingsChanged,
          errors,
          success: errors.length === 0,
        },
      });

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

  const hasOutOfStockText = html.includes("This product is unavailable");
  const hasAddToCartForm = html.includes('id="basket-add"');

  return !hasOutOfStockText && hasAddToCartForm;
}

function parseIppodoStock(html: string): boolean {
  // Based on old/index.ts logic:
  // Look for any button inside .product-form__buttons without style="display: none"
  // const visibleAddToCartButton = $('.product-form__buttons button').filter((_, el) => {
  //   const style = $(el).attr('style') || '';
  //   return !style.includes('display: none');
  // });
  // return visibleAddToCartButton.length > 0;

  // Check for product-form__buttons section
  const formMatch = html.match(/<div[^>]*class="[^"]*product-form__buttons[^"]*"[^>]*>(.*?)<\/div>/is);

  if (formMatch) {
    const formSection = formMatch[1];
    // Check for visible button (not display: none)
    const buttonMatch = formSection.match(/<button[^>]*>(.*?)<\/button>/is);

    if (buttonMatch) {
      const buttonTag = buttonMatch[0];
      // Check if button is hidden
      if (buttonTag.includes('style="display: none"')) {
        return false;
      }
      return true;
    }
  }

  // Fallback: check for out of stock text
  if (html.toLowerCase().includes("sold out")) {
    return false;
  }

  return true;
}

function parseNakamuraStock(html: string): boolean {
  // Based on old/index.ts logic:
  // const buttonText = $('div.product-form__buttons button span').text().trim();
  // return buttonText === 'Add to cart';

  const formMatch = html.match(/<div[^>]*class="[^"]*product-form__buttons[^"]*"[^>]*>(.*?)<\/div>/is);

  if (formMatch) {
    const formSection = formMatch[1];
    // Extract button text
    const buttonTextMatch = formSection.match(
      /<button[^>]*>(?:\s*<span[^>]*>)?\s*(.*?)\s*(?:<\/span>\s*)?<\/button>/is,
    );

    if (buttonTextMatch) {
      const buttonText = buttonTextMatch[1].trim().toLowerCase();
      return buttonText === "add to cart";
    }
  }

  return false;
}

function parseShopifyStock(html: string): boolean {
  // Shopify stores - check for visible add to cart button
  const buttonMatch = html.match(/<button[^>]*(?:add[- ]?to[- ]?cart|checkout)[^>]*>([^<]*)<\/button>/i);

  if (buttonMatch) {
    const buttonHtml = buttonMatch[0].toLowerCase();
    const buttonText = buttonMatch[1].toLowerCase();

    // Check if button is hidden via style attribute
    if (buttonHtml.includes('style="display: none"')) {
      return false;
    }

    // Check button text
    if (buttonText.includes("sold out") || buttonText.includes("out of stock") || buttonText.includes("unavailable")) {
      return false;
    }

    return true;
  }

  // Check for schema.org out of stock
  if (html.includes('"availability":"https://schema.org/OutOfStock"')) {
    return false;
  }

  return true;
}

interface ListingWithDetails extends Listing {
  matcha: {
    name: string;
    brand: {
      name: string;
    };
  };
}

async function sendNotification(listing: ListingWithDetails, env: Env): Promise<void> {
  const telegramToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!telegramToken || !chatId) {
    console.warn("Telegram credentials not configured");
    return;
  }

  const timestamp = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Asia/Singapore",
  });

  const message =
    `<b>${timestamp}</b>\n\n` +
    `<b><u>${listing.storefront.name}</u></b> stock update:\n` +
    `<a href="${listing.url}">${listing.matcha.brand.name} - ${listing.matcha.name}</a>`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to send Telegram notification: ${response.status}`);
  }
}
