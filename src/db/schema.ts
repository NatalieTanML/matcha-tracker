import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

// ============================================================
// Better Auth core tables
// ============================================================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "user" | "admin" — managed by better-auth admin plugin
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { mode: "date" }),
  // Custom fields
  telegramChatId: text("telegram_chat_id"),
  includeOosInMessage: boolean("include_oos_in_message").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
});

// ============================================================
// App tables
// ============================================================

export const storefronts = pgTable("storefronts", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  url: text("url").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const storefrontsBrands = pgTable("storefronts_brands", {
  storefrontId: text("storefront_id")
    .notNull()
    .references(() => storefronts.id, { onDelete: "cascade" }),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
});

export const matchas = pgTable("matchas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "restrict" }),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  matchaId: text("matcha_id")
    .notNull()
    .references(() => matchas.id, { onDelete: "cascade" }),
  storefrontId: text("storefront_id")
    .notNull()
    .references(() => storefronts.id, { onDelete: "restrict" }),
  url: text("url").notNull().unique(),
  variantId: text("variant_id"),
  price: text("price"),
  isActive: boolean("is_active").default(true).notNull(),
  lastStock: boolean("last_stock"),
  lastChecked: timestamp("last_checked", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const stockHistory = pgTable("stock_history", {
  id: text("id").primaryKey(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  inStock: boolean("in_stock").notNull(),
  price: text("price"),
  scrapedAt: timestamp("scraped_at", { mode: "date" }).defaultNow().notNull(),
  error: text("error"),
});

// User favourites — a row existing means the user has favourited that listing.
// enabled controls whether this listing is included in Telegram alert logic.
export const userFavourites = pgTable(
  "user_favourites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.listingId)],
);

export const scrapeJobs = pgTable("scrape_jobs", {
  id: text("id").primaryKey(),
  startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  listingsChecked: text("listings_checked").default("0").notNull(),
  listingsChanged: text("listings_changed").default("0").notNull(),
  errors: text("errors").array().default([]).notNull(),
  success: boolean("success").default(false).notNull(),
});

// One-time codes for linking Telegram accounts
export const telegramLinkCodes = pgTable("telegram_link_codes", {
  code: text("code").primaryKey(), // 8-char alphanumeric, shown to user
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Deduplication state for notifications — tracks the last message sent per user per storefront.
// Used to avoid sending duplicate messages when stock state hasn't changed.
export const notificationState = pgTable(
  "notification_state",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storefrontId: text("storefront_id")
      .notNull()
      .references(() => storefronts.id, { onDelete: "cascade" }),
    // Sorted list of listing IDs that were in-stock in the last sent message
    lastInStockListingIds: text("last_in_stock_listing_ids").array().default([]).notNull(),
    sentAt: timestamp("sent_at", { mode: "date" }).notNull(),
  },
  (t) => [unique().on(t.userId, t.storefrontId)],
);

// ============================================================
// Relations
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  favourites: many(userFavourites),
  telegramLinkCodes: many(telegramLinkCodes),
  notificationStates: many(notificationState),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const storefrontsRelations = relations(storefronts, ({ many }) => ({
  listings: many(listings),
  brands: many(storefrontsBrands),
  notificationStates: many(notificationState),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  matchas: many(matchas),
  storefronts: many(storefrontsBrands),
}));

export const storefrontsBrandsRelations = relations(storefrontsBrands, ({ one }) => ({
  storefront: one(storefronts, {
    fields: [storefrontsBrands.storefrontId],
    references: [storefronts.id],
  }),
  brand: one(brands, {
    fields: [storefrontsBrands.brandId],
    references: [brands.id],
  }),
}));

export const matchasRelations = relations(matchas, ({ one, many }) => ({
  brand: one(brands, { fields: [matchas.brandId], references: [brands.id] }),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  matcha: one(matchas, { fields: [listings.matchaId], references: [matchas.id] }),
  storefront: one(storefronts, { fields: [listings.storefrontId], references: [storefronts.id] }),
  stockHistory: many(stockHistory),
  favourites: many(userFavourites),
}));

export const stockHistoryRelations = relations(stockHistory, ({ one }) => ({
  listing: one(listings, { fields: [stockHistory.listingId], references: [listings.id] }),
}));

export const userFavouritesRelations = relations(userFavourites, ({ one }) => ({
  user: one(users, { fields: [userFavourites.userId], references: [users.id] }),
  listing: one(listings, { fields: [userFavourites.listingId], references: [listings.id] }),
}));

export const telegramLinkCodesRelations = relations(telegramLinkCodes, ({ one }) => ({
  user: one(users, { fields: [telegramLinkCodes.userId], references: [users.id] }),
}));

export const notificationStateRelations = relations(notificationState, ({ one }) => ({
  user: one(users, { fields: [notificationState.userId], references: [users.id] }),
  storefront: one(storefronts, { fields: [notificationState.storefrontId], references: [storefronts.id] }),
}));

// ============================================================
// Types
// ============================================================

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Storefront = typeof storefronts.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Matcha = typeof matchas.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type StockHistory = typeof stockHistory.$inferSelect;
export type UserFavourite = typeof userFavourites.$inferSelect;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type StorefrontsBrands = typeof storefrontsBrands.$inferSelect;
export type TelegramLinkCode = typeof telegramLinkCodes.$inferSelect;
export type NotificationState = typeof notificationState.$inferSelect;
