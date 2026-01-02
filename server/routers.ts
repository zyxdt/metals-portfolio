import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserSettings,
  upsertUserSettings,
  getUserHoldings,
  getHoldingById,
  createHolding,
  updateHolding,
  deleteHolding,
  getUserHoldingsByMetal,
  getUserPortfolioSummary,
  getPortfolioSnapshots,
} from "./db";
import {
  getCachedOrFreshPrices,
  fetchPriceHistory,
  calculatePortfolioValue,
  METAL_NAMES,
  METAL_COLORS,
} from "./metalsPriceService";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ SETTINGS ============
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      return settings || {
        currency: 'USD',
        weightUnit: 'grams' as const,
      };
    }),

    update: protectedProcedure
      .input(z.object({
        currency: z.string().length(3).optional(),
        weightUnit: z.enum(['grams', 'ounces']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertUserSettings({
          userId: ctx.user.id,
          currency: input.currency || 'USD',
          weightUnit: input.weightUnit || 'grams',
        });
        return { success: true };
      }),
  }),

  // ============ PRICES ============
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
        metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
        range: z.enum(['1d', '1w', '1mo', '1y']).default('1mo'),
      }))
      .query(async ({ input }) => {
        const history = await fetchPriceHistory(input.metalType, input.range);
        return {
          metalType: input.metalType,
          name: METAL_NAMES[input.metalType],
          color: METAL_COLORS[input.metalType],
          data: history,
        };
      }),
  }),

  // ============ HOLDINGS ============
  holdings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserHoldings(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getHoldingById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
        weightGrams: z.number().positive(),
        buyPricePerGram: z.number().positive().optional(),
        buyDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createHolding({
          userId: ctx.user.id,
          metalType: input.metalType,
          weightGrams: input.weightGrams.toFixed(4),
          buyPricePerGram: input.buyPricePerGram?.toFixed(4) || null,
          buyDate: input.buyDate || null,
          notes: input.notes || null,
        });
        return { id, success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']).optional(),
        weightGrams: z.number().positive().optional(),
        buyPricePerGram: z.number().positive().optional().nullable(),
        buyDate: z.date().optional().nullable(),
        notes: z.string().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, any> = {};
        
        if (data.metalType) updateData.metalType = data.metalType;
        if (data.weightGrams) updateData.weightGrams = data.weightGrams.toFixed(4);
        if (data.buyPricePerGram !== undefined) {
          updateData.buyPricePerGram = data.buyPricePerGram?.toFixed(4) || null;
        }
        if (data.buyDate !== undefined) updateData.buyDate = data.buyDate;
        if (data.notes !== undefined) updateData.notes = data.notes;

        await updateHolding(id, ctx.user.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteHolding(input.id, ctx.user.id);
        return { success: true };
      }),

    byMetal: protectedProcedure
      .input(z.object({
        metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
      }))
      .query(async ({ ctx, input }) => {
        return await getUserHoldingsByMetal(ctx.user.id, input.metalType);
      }),
  }),

  // ============ PORTFOLIO ============
  portfolio: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const [holdings, prices, dbSummary] = await Promise.all([
        getUserHoldings(ctx.user.id),
        getCachedOrFreshPrices(),
        getUserPortfolioSummary(ctx.user.id),
      ]);

      const { totalValue, byMetal } = calculatePortfolioValue(holdings, prices);

      // Calculate total cost basis
      let totalCost = 0;
      for (const holding of holdings) {
        if (holding.buyPricePerGram) {
          totalCost += parseFloat(holding.weightGrams) * parseFloat(holding.buyPricePerGram);
        }
      }

      const gainLoss = totalCost > 0 ? totalValue - totalCost : null;
      const gainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : null;

      return {
        totalValue,
        totalCost,
        gainLoss,
        gainLossPercent,
        byMetal: Object.entries(byMetal).map(([metal, data]) => ({
          metalType: metal,
          name: METAL_NAMES[metal],
          color: METAL_COLORS[metal],
          ...data,
        })),
        holdingCount: holdings.length,
      };
    }),

    history: protectedProcedure
      .input(z.object({
        range: z.enum(['1w', '1mo', '3mo', '1y']).default('1mo'),
      }))
      .query(async ({ ctx, input }) => {
        const now = new Date();
        const rangeMap: Record<string, number> = {
          '1w': 7,
          '1mo': 30,
          '3mo': 90,
          '1y': 365,
        };
        const days = rangeMap[input.range] || 30;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const snapshots = await getPortfolioSnapshots(ctx.user.id, startDate, now);
        return snapshots.map(s => ({
          date: s.snapshotDate,
          totalValue: parseFloat(s.totalValueUsd),
          gold: s.goldValueUsd ? parseFloat(s.goldValueUsd) : 0,
          silver: s.silverValueUsd ? parseFloat(s.silverValueUsd) : 0,
          platinum: s.platinumValueUsd ? parseFloat(s.platinumValueUsd) : 0,
          palladium: s.palladiumValueUsd ? parseFloat(s.palladiumValueUsd) : 0,
        }));
      }),

    metalDetail: protectedProcedure
      .input(z.object({
        metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
      }))
      .query(async ({ ctx, input }) => {
        const [holdings, prices, allHoldings] = await Promise.all([
          getUserHoldingsByMetal(ctx.user.id, input.metalType),
          getCachedOrFreshPrices(),
          getUserHoldings(ctx.user.id),
        ]);

        const price = prices.find(p => p.metalType === input.metalType);
        const pricePerGram = price?.pricePerGram || 0;

        // Calculate this metal's totals
        let totalWeight = 0;
        let totalCost = 0;
        for (const h of holdings) {
          const weight = parseFloat(h.weightGrams);
          totalWeight += weight;
          if (h.buyPricePerGram) {
            totalCost += weight * parseFloat(h.buyPricePerGram);
          }
        }

        const currentValue = totalWeight * pricePerGram;

        // Calculate portfolio contribution
        const { totalValue } = calculatePortfolioValue(allHoldings, prices);
        const portfolioPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

        return {
          metalType: input.metalType,
          name: METAL_NAMES[input.metalType],
          color: METAL_COLORS[input.metalType],
          totalWeightGrams: totalWeight,
          totalWeightOunces: totalWeight / 31.1035,
          currentValue,
          totalCost,
          gainLoss: totalCost > 0 ? currentValue - totalCost : null,
          gainLossPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : null,
          portfolioPercentage,
          currentPricePerGram: pricePerGram,
          currentPricePerOunce: price?.pricePerOunce || 0,
          priceChangePercent: price?.changePercent || null,
          holdings,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
