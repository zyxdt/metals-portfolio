import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userSettings, 
  holdings, 
  metalPrices, 
  priceHistory,
  portfolioSnapshots,
  type UserSettings,
  type InsertUserSettings,
  type Holding,
  type InsertHolding,
  type MetalPrice,
  type InsertMetalPrice,
  type PriceHistory,
  type InsertPriceHistory,
  type PortfolioSnapshot,
  type InsertPortfolioSnapshot
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ USER SETTINGS FUNCTIONS ============

export async function getUserSettings(userId: number): Promise<UserSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserSettings(settings: InsertUserSettings): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(userSettings).values(settings).onDuplicateKeyUpdate({
    set: {
      currency: settings.currency,
      weightUnit: settings.weightUnit,
    },
  });
}

// ============ HOLDINGS FUNCTIONS ============

export async function getUserHoldings(userId: number): Promise<Holding[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(holdings).where(eq(holdings.userId, userId)).orderBy(desc(holdings.createdAt));
}

export async function getHoldingById(id: number, userId: number): Promise<Holding | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(holdings)
    .where(and(eq(holdings.id, id), eq(holdings.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHolding(holding: InsertHolding): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(holdings).values(holding);
  return Number(result[0].insertId);
}

export async function updateHolding(id: number, userId: number, data: Partial<InsertHolding>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(holdings)
    .set(data)
    .where(and(eq(holdings.id, id), eq(holdings.userId, userId)));
}

export async function deleteHolding(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(holdings).where(and(eq(holdings.id, id), eq(holdings.userId, userId)));
}

export async function getUserHoldingsByMetal(userId: number, metalType: string): Promise<Holding[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(holdings)
    .where(and(
      eq(holdings.userId, userId),
      eq(holdings.metalType, metalType as any)
    ))
    .orderBy(desc(holdings.createdAt));
}

// ============ METAL PRICES FUNCTIONS ============

export async function getLatestPrices(): Promise<MetalPrice[]> {
  const db = await getDb();
  if (!db) return [];

  // Get the latest price for each metal type
  const metals = ['gold', 'silver', 'platinum', 'palladium'] as const;
  const prices: MetalPrice[] = [];

  for (const metal of metals) {
    const result = await db.select().from(metalPrices)
      .where(eq(metalPrices.metalType, metal))
      .orderBy(desc(metalPrices.fetchedAt))
      .limit(1);
    if (result.length > 0) {
      prices.push(result[0]);
    }
  }

  return prices;
}

export async function getLatestPriceByMetal(metalType: string): Promise<MetalPrice | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(metalPrices)
    .where(eq(metalPrices.metalType, metalType as any))
    .orderBy(desc(metalPrices.fetchedAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMetalPrice(price: InsertMetalPrice): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(metalPrices).values(price);
}

// ============ PRICE HISTORY FUNCTIONS ============

export async function getPriceHistory(metalType: string, startDate: Date, endDate: Date): Promise<PriceHistory[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(priceHistory)
    .where(and(
      eq(priceHistory.metalType, metalType as any),
      gte(priceHistory.priceDate, startDate),
      lte(priceHistory.priceDate, endDate)
    ))
    .orderBy(priceHistory.priceDate);
}

export async function insertPriceHistory(data: InsertPriceHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(priceHistory).values(data);
}

export async function bulkInsertPriceHistory(data: InsertPriceHistory[]): Promise<void> {
  const db = await getDb();
  if (!db) return;

  if (data.length > 0) {
    await db.insert(priceHistory).values(data);
  }
}

// ============ PORTFOLIO SNAPSHOTS FUNCTIONS ============

export async function getPortfolioSnapshots(userId: number, startDate: Date, endDate: Date): Promise<PortfolioSnapshot[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(portfolioSnapshots)
    .where(and(
      eq(portfolioSnapshots.userId, userId),
      gte(portfolioSnapshots.snapshotDate, startDate),
      lte(portfolioSnapshots.snapshotDate, endDate)
    ))
    .orderBy(portfolioSnapshots.snapshotDate);
}

export async function insertPortfolioSnapshot(data: InsertPortfolioSnapshot): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(portfolioSnapshots).values(data);
}

// ============ AGGREGATION HELPERS ============

export async function getUserPortfolioSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    metalType: holdings.metalType,
    totalWeight: sql<string>`SUM(${holdings.weightGrams})`,
    totalCost: sql<string>`SUM(${holdings.weightGrams} * COALESCE(${holdings.buyPricePerGram}, 0))`,
    holdingCount: sql<number>`COUNT(*)`,
  })
    .from(holdings)
    .where(eq(holdings.userId, userId))
    .groupBy(holdings.metalType);

  return result;
}
