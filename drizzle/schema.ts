import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User settings for currency and unit preferences
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  weightUnit: mysqlEnum("weightUnit", ["grams", "ounces"]).default("grams").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Portfolio holdings - stores user's metal holdings
 * Weight is always stored in grams internally
 */
export const holdings = mysqlTable("holdings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metalType: mysqlEnum("metalType", ["gold", "silver", "platinum", "palladium"]).notNull(),
  weightGrams: decimal("weightGrams", { precision: 12, scale: 4 }).notNull(),
  buyPricePerGram: decimal("buyPricePerGram", { precision: 12, scale: 4 }),
  buyDate: timestamp("buyDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = typeof holdings.$inferInsert;

/**
 * Cached metal prices from API
 * Prices stored per troy ounce in USD (standard market convention)
 */
export const metalPrices = mysqlTable("metal_prices", {
  id: int("id").autoincrement().primaryKey(),
  metalType: mysqlEnum("metalType", ["gold", "silver", "platinum", "palladium"]).notNull(),
  pricePerOunce: decimal("pricePerOunce", { precision: 12, scale: 4 }).notNull(),
  pricePerGram: decimal("pricePerGram", { precision: 12, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  previousClose: decimal("previousClose", { precision: 12, scale: 4 }),
  dayHigh: decimal("dayHigh", { precision: 12, scale: 4 }),
  dayLow: decimal("dayLow", { precision: 12, scale: 4 }),
  changePercent: decimal("changePercent", { precision: 8, scale: 4 }),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MetalPrice = typeof metalPrices.$inferSelect;
export type InsertMetalPrice = typeof metalPrices.$inferInsert;

/**
 * Historical price data for charts
 * Stores daily price snapshots
 */
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  metalType: mysqlEnum("metalType", ["gold", "silver", "platinum", "palladium"]).notNull(),
  pricePerOunce: decimal("pricePerOunce", { precision: 12, scale: 4 }).notNull(),
  pricePerGram: decimal("pricePerGram", { precision: 12, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  priceDate: timestamp("priceDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Portfolio value snapshots for portfolio chart
 * Stores daily portfolio value for historical tracking
 */
export const portfolioSnapshots = mysqlTable("portfolio_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalValueUsd: decimal("totalValueUsd", { precision: 14, scale: 2 }).notNull(),
  goldValueUsd: decimal("goldValueUsd", { precision: 14, scale: 2 }),
  silverValueUsd: decimal("silverValueUsd", { precision: 14, scale: 2 }),
  platinumValueUsd: decimal("platinumValueUsd", { precision: 14, scale: 2 }),
  palladiumValueUsd: decimal("palladiumValueUsd", { precision: 14, scale: 2 }),
  snapshotDate: timestamp("snapshotDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert;
