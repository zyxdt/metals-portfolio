import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getCachedOrFreshPrices,
  fetchPriceHistory,
  calculatePortfolioValue,
  METAL_NAMES,
  METAL_COLORS,
} from "./metalsPriceService";
import {
  getHoldingById,
  getUserHoldingsByMetal,
  getUserPortfolioSummary,
} from "./db";
import {
  getUserSettings,
  updateUserSettings,
  createHolding,
  updateHolding,
  deleteHolding,
  getUserHoldings,
  updatePriceCache,
  getPriceCache,
} from "./supabase";

// Middleware to extract Supabase user from request
function getSupabaseUser(ctx: any) {
  const authHeader = ctx.req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  
  // In a real implementation, you'd verify the JWT token here
  // For now, we'll rely on Supabase client-side auth
  return null;
}

// Protected procedure that requires Supabase auth
const supabaseProtectedProcedure = publicProcedure.use(({ ctx, next }) => {
  const userId = ctx.req.headers["x-user-id"];
  if (!userId) {
    throw new Error("Unauthorized - no user ID");
  }
  return next({ ctx: { ...ctx, userId } });
});

export const supabaseRouter = router({
  // ============ PRICES (Public) ============
  prices: router({
    getAll: publicProcedure.query(async () => {
      const prices = await getCachedOrFreshPrices();
      return prices.map(p => ({
        ...p,
        name: METAL_NAMES[p.metalType],
        color: METAL_COLORS[p.metalType],
      }));
    }),

    getHistory: publicProcedure
      .input(z.object({
        metalType: z.enum(["gold", "silver", "platinum", "palladium"]),
        range: z.enum(["1d", "1w", "1mo", "1y"]).default("1mo"),
      }))
      .query(async ({ input }) => {
        const history = await fetchPriceHistory(input.metalType, input.range);
        return history;
      }),
  }),

  // ============ SETTINGS (Protected) ============
  settings: router({
    get: supabaseProtectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.userId as string);
      return settings || {
        currency: "USD",
        weightUnit: "grams" as const,
      };
    }),

    update: supabaseProtectedProcedure
      .input(
        z.object({
          currency: z.string().length(3).optional(),
          weightUnit: z.enum(["grams", "ounces"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const success = await updateUserSettings(
          ctx.userId as string,
          input.currency,
          input.weightUnit
        );
        return { success };
      }),
  }),

  // ============ HOLDINGS (Protected) ============
  holdings: router({
    list: supabaseProtectedProcedure.query(async ({ ctx }) => {
      const holdings = await getUserHoldings(ctx.userId as string);
      return holdings;
    }),

    get: supabaseProtectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const holdingId = parseInt(input.id, 10);
        const userId = parseInt(ctx.userId as string, 10);
        const holding = await getHoldingById(holdingId, userId);
        if (!holding) {
          throw new Error("Holding not found");
        }
        return holding;
      }),

    create: supabaseProtectedProcedure
      .input(
        z.object({
          metalType: z.enum(["gold", "silver", "platinum", "palladium"]),
          weightGrams: z.number().positive(),
          buyPricePerGram: z.number().optional(),
          buyDate: z.string().datetime().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const holding = await createHolding(
          ctx.userId as string,
          input.metalType,
          input.weightGrams,
          input.buyPricePerGram,
          input.buyDate ? new Date(input.buyDate) : undefined,
          input.notes
        );
        return holding;
      }),

    update: supabaseProtectedProcedure
      .input(
        z.object({
          id: z.string(),
          weightGrams: z.number().positive().optional(),
          buyPricePerGram: z.number().optional(),
          buyDate: z.string().datetime().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const holdingId = parseInt(input.id, 10);
        const userId = parseInt(ctx.userId as string, 10);
        const holding = await getHoldingById(holdingId, userId);
        if (!holding) {
          throw new Error("Holding not found");
        }

        const updates: any = {};
        if (input.weightGrams !== undefined) updates.weight_grams = input.weightGrams;
        if (input.buyPricePerGram !== undefined) updates.buy_price_per_gram = input.buyPricePerGram;
        if (input.buyDate !== undefined) updates.buy_date = new Date(input.buyDate).toISOString();
        if (input.notes !== undefined) updates.notes = input.notes;

        const updated = await updateHolding(input.id, updates);
        return updated;
      }),

    delete: supabaseProtectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const holdingId = parseInt(input.id, 10);
        const userId = parseInt(ctx.userId as string, 10);
        const holding = await getHoldingById(holdingId, userId);
        if (!holding) {
          throw new Error("Holding not found");
        }

        const success = await deleteHolding(input.id);
        return { success };
      }),
  }),

  // ============ PORTFOLIO (Protected) ============
  portfolio: router({
    summary: supabaseProtectedProcedure.query(async ({ ctx }) => {
      const holdings = await getUserHoldings(ctx.userId as string);
      const prices = await getCachedOrFreshPrices();

      const byMetal = [
        { metalType: "gold", name: "Gold", color: "#FFD700" },
        { metalType: "silver", name: "Silver", color: "#C0C0C0" },
        { metalType: "platinum", name: "Platinum", color: "#E5E4E2" },
        { metalType: "palladium", name: "Palladium", color: "#71797E" },
      ].map(metal => {
        const metalHoldings = holdings.filter(h => h.metal_type === metal.metalType);
        const totalWeight = metalHoldings.reduce((sum, h) => sum + h.weight_grams, 0);
        const price = prices.find(p => p.metalType === metal.metalType);
        const value = totalWeight * (price?.pricePerGram || 0);

        return {
          metalType: metal.metalType,
          name: metal.name,
          color: metal.color,
          weight: totalWeight,
          value,
          percentage: 0,
        };
      });

      const totalValue = byMetal.reduce((sum, m) => sum + m.value, 0);
      const totalCost = holdings.reduce((sum, h) => sum + (h.buy_price_per_gram || 0) * h.weight_grams, 0);
      const gainLoss = totalValue - totalCost;
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

      // Calculate percentages
      byMetal.forEach(m => {
        m.percentage = totalValue > 0 ? (m.value / totalValue) * 100 : 0;
      });

      return {
        totalValue,
        totalCost,
        gainLoss,
        gainLossPercent,
        byMetal,
      };
    }),

    metalDetail: supabaseProtectedProcedure
      .input(z.object({ metalType: z.enum(["gold", "silver", "platinum", "palladium"]) }))
      .query(async ({ ctx, input }) => {
        const holdings = await getUserHoldings(ctx.userId as string);
        const metalHoldings = holdings.filter(h => h.metal_type === input.metalType);
        const prices = await getCachedOrFreshPrices();
        const price = prices.find(p => p.metalType === input.metalType);

        const totalWeight = metalHoldings.reduce((sum, h) => sum + h.weight_grams, 0);
        const totalCost = metalHoldings.reduce((sum, h) => sum + (h.buy_price_per_gram || 0) * h.weight_grams, 0);
        const currentValue = totalWeight * (price?.pricePerGram || 0);
        const gainLoss = currentValue - totalCost;

        return {
          metalType: input.metalType,
          name: METAL_NAMES[input.metalType as keyof typeof METAL_NAMES],
          totalWeight,
          currentValue,
          totalCost,
          gainLoss,
          holdings: metalHoldings,
          price: price?.pricePerOunce || 0,
          pricePerGram: price?.pricePerGram || 0,
        };
      }),
  }),
});

export type SupabaseRouter = typeof supabaseRouter;
