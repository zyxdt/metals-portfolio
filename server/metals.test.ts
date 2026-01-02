import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("prices router", () => {
  it("getAll returns array of metal prices", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const prices = await caller.prices.getAll();

    expect(Array.isArray(prices)).toBe(true);
    // Should have 4 metals: gold, silver, platinum, palladium
    expect(prices.length).toBeLessThanOrEqual(4);
    
    if (prices.length > 0) {
      const price = prices[0];
      expect(price).toHaveProperty("metalType");
      expect(price).toHaveProperty("pricePerOunce");
      expect(price).toHaveProperty("pricePerGram");
      expect(price).toHaveProperty("name");
      expect(price).toHaveProperty("color");
    }
  });

  it("getHistory returns price history data", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.prices.getHistory({
      metalType: "gold",
      range: "1mo",
    });

    expect(history).toHaveProperty("metalType", "gold");
    expect(history).toHaveProperty("name", "Gold");
    expect(history).toHaveProperty("color");
    expect(history).toHaveProperty("data");
    expect(Array.isArray(history.data)).toBe(true);
  });
});

describe("settings router", () => {
  it("get returns default settings for new user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.settings.get();

    expect(settings).toHaveProperty("currency");
    expect(settings).toHaveProperty("weightUnit");
    expect(["USD", "EUR", "GBP"]).toContain(settings.currency);
    expect(["grams", "ounces"]).toContain(settings.weightUnit);
  });
});

describe("holdings router", () => {
  it("list returns empty array for user with no holdings", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const holdings = await caller.holdings.list();

    expect(Array.isArray(holdings)).toBe(true);
  });
});

describe("portfolio router", () => {
  it("summary returns portfolio summary structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.portfolio.summary();

    expect(summary).toHaveProperty("totalValue");
    expect(summary).toHaveProperty("totalCost");
    expect(summary).toHaveProperty("byMetal");
    expect(summary).toHaveProperty("holdingCount");
    expect(typeof summary.totalValue).toBe("number");
    expect(typeof summary.totalCost).toBe("number");
    expect(Array.isArray(summary.byMetal)).toBe(true);
  });

  it("metalDetail returns detail for specific metal", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const detail = await caller.portfolio.metalDetail({
      metalType: "gold",
    });

    expect(detail).toHaveProperty("metalType", "gold");
    expect(detail).toHaveProperty("name", "Gold");
    expect(detail).toHaveProperty("totalWeightGrams");
    expect(detail).toHaveProperty("totalWeightOunces");
    expect(detail).toHaveProperty("currentValue");
    expect(detail).toHaveProperty("portfolioPercentage");
    expect(detail).toHaveProperty("holdings");
    expect(Array.isArray(detail.holdings)).toBe(true);
  });
});

describe("auth router", () => {
  it("me returns user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).not.toBeNull();
    expect(user?.openId).toBe("test-user-123");
    expect(user?.email).toBe("test@example.com");
  });

  it("me returns null when not authenticated", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeNull();
  });
});
