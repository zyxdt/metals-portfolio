import { callDataApi } from "./_core/dataApi";
import { 
  upsertMetalPrice, 
  getLatestPrices, 
  bulkInsertPriceHistory,
  getLatestPriceByMetal 
} from "./db";

// Troy ounce to grams conversion
const TROY_OUNCE_TO_GRAMS = 31.1035;

// Yahoo Finance symbols for precious metals
const METAL_SYMBOLS: Record<string, string> = {
  gold: 'GC=F',
  silver: 'SI=F',
  platinum: 'PL=F',
  palladium: 'PA=F',
};

// Metal display names
export const METAL_NAMES: Record<string, string> = {
  gold: 'Gold',
  silver: 'Silver',
  platinum: 'Platinum',
  palladium: 'Palladium',
};

// Metal colors for charts
export const METAL_COLORS: Record<string, string> = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  platinum: '#E5E4E2',
  palladium: '#CED0DD',
};

export interface MetalPriceData {
  metalType: string;
  name: string;
  symbol: string;
  pricePerOunce: number;
  pricePerGram: number;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  changePercent: number | null;
  currency: string;
  fetchedAt: Date;
}

export interface PriceHistoryPoint {
  date: Date;
  pricePerOunce: number;
  pricePerGram: number;
}

/**
 * Fetch current price for a single metal from Yahoo Finance
 */
export async function fetchMetalPrice(metalType: string): Promise<MetalPriceData | null> {
  const symbol = METAL_SYMBOLS[metalType];
  if (!symbol) {
    console.error(`Unknown metal type: ${metalType}`);
    return null;
  }

  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbol,
        region: 'US',
        interval: '1d',
        range: '1d',
      },
    }) as any;

    if (!response?.chart?.result?.[0]) {
      console.error(`No data returned for ${metalType}`);
      return null;
    }

    const result = response.chart.result[0] as any;
    const meta = result.meta;

    const pricePerOunce = meta.regularMarketPrice || 0;
    const pricePerGram = pricePerOunce / TROY_OUNCE_TO_GRAMS;
    const previousClose = meta.previousClose || null;
    const changePercent = previousClose 
      ? ((pricePerOunce - previousClose) / previousClose) * 100 
      : null;

    return {
      metalType,
      name: METAL_NAMES[metalType],
      symbol,
      pricePerOunce,
      pricePerGram,
      previousClose,
      dayHigh: meta.regularMarketDayHigh || null,
      dayLow: meta.regularMarketDayLow || null,
      changePercent,
      currency: meta.currency || 'USD',
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error fetching price for ${metalType}:`, error);
    return null;
  }
}

/**
 * Fetch prices for all metals
 */
export async function fetchAllMetalPrices(): Promise<MetalPriceData[]> {
  const metals = Object.keys(METAL_SYMBOLS);
  const prices: MetalPriceData[] = [];

  for (const metal of metals) {
    const price = await fetchMetalPrice(metal);
    if (price) {
      prices.push(price);
    }
  }

  return prices;
}

/**
 * Fetch and cache all metal prices to database
 */
export async function refreshMetalPrices(): Promise<MetalPriceData[]> {
  const prices = await fetchAllMetalPrices();

  for (const price of prices) {
    await upsertMetalPrice({
      metalType: price.metalType as any,
      pricePerOunce: price.pricePerOunce.toFixed(4),
      pricePerGram: price.pricePerGram.toFixed(4),
      currency: price.currency,
      previousClose: price.previousClose?.toFixed(4) || null,
      dayHigh: price.dayHigh?.toFixed(4) || null,
      dayLow: price.dayLow?.toFixed(4) || null,
      changePercent: price.changePercent?.toFixed(4) || null,
      fetchedAt: price.fetchedAt,
    });
  }

  return prices;
}

/**
 * Fetch price history for a metal
 */
export async function fetchPriceHistory(
  metalType: string, 
  range: '1d' | '1w' | '1mo' | '1y' = '1mo'
): Promise<PriceHistoryPoint[]> {
  const symbol = METAL_SYMBOLS[metalType];
  if (!symbol) {
    console.error(`Unknown metal type: ${metalType}`);
    return [];
  }

  // Map range to Yahoo Finance parameters
  const rangeMap: Record<string, { range: string; interval: string }> = {
    '1d': { range: '1d', interval: '5m' },
    '1w': { range: '5d', interval: '15m' },
    '1mo': { range: '1mo', interval: '1d' },
    '1y': { range: '1y', interval: '1d' },
  };

  const params = rangeMap[range] || rangeMap['1mo'];

  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbol,
        region: 'US',
        interval: params.interval,
        range: params.range,
      },
    }) as any;

    if (!response?.chart?.result?.[0]) {
      console.error(`No history data returned for ${metalType}`);
      return [];
    }

    const result = response.chart.result[0] as any;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];

    const history: PriceHistoryPoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const pricePerOunce = closes[i];
      if (pricePerOunce != null) {
        history.push({
          date: new Date(timestamps[i] * 1000),
          pricePerOunce,
          pricePerGram: pricePerOunce / TROY_OUNCE_TO_GRAMS,
        });
      }
    }

    return history;
  } catch (error) {
    console.error(`Error fetching price history for ${metalType}:`, error);
    return [];
  }
}

/**
 * Get cached prices or fetch fresh ones if stale
 * Prices are considered stale after 5 minutes
 */
export async function getCachedOrFreshPrices(): Promise<MetalPriceData[]> {
  const cachedPrices = await getLatestPrices();
  
  // Check if we have all metals and if data is fresh (less than 5 minutes old)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const allMetals = Object.keys(METAL_SYMBOLS);
  
  const hasFreshData = cachedPrices.length === allMetals.length && 
    cachedPrices.every(p => new Date(p.fetchedAt) > fiveMinutesAgo);

  if (hasFreshData) {
    // Convert cached data to MetalPriceData format
    return cachedPrices.map(p => ({
      metalType: p.metalType,
      name: METAL_NAMES[p.metalType],
      symbol: METAL_SYMBOLS[p.metalType],
      pricePerOunce: parseFloat(p.pricePerOunce),
      pricePerGram: parseFloat(p.pricePerGram),
      previousClose: p.previousClose ? parseFloat(p.previousClose) : null,
      dayHigh: p.dayHigh ? parseFloat(p.dayHigh) : null,
      dayLow: p.dayLow ? parseFloat(p.dayLow) : null,
      changePercent: p.changePercent ? parseFloat(p.changePercent) : null,
      currency: p.currency,
      fetchedAt: new Date(p.fetchedAt),
    }));
  }

  // Fetch fresh prices
  return await refreshMetalPrices();
}

/**
 * Calculate portfolio value based on holdings and current prices
 */
export function calculatePortfolioValue(
  holdings: Array<{ metalType: string; weightGrams: string }>,
  prices: MetalPriceData[]
): {
  totalValue: number;
  byMetal: Record<string, { value: number; weight: number; percentage: number }>;
} {
  const priceMap = new Map(prices.map(p => [p.metalType, p.pricePerGram]));
  
  let totalValue = 0;
  const byMetal: Record<string, { value: number; weight: number; percentage: number }> = {};

  for (const holding of holdings) {
    const pricePerGram = priceMap.get(holding.metalType) || 0;
    const weight = parseFloat(holding.weightGrams);
    const value = weight * pricePerGram;

    totalValue += value;

    if (!byMetal[holding.metalType]) {
      byMetal[holding.metalType] = { value: 0, weight: 0, percentage: 0 };
    }
    byMetal[holding.metalType].value += value;
    byMetal[holding.metalType].weight += weight;
  }

  // Calculate percentages
  for (const metal of Object.keys(byMetal)) {
    byMetal[metal].percentage = totalValue > 0 
      ? (byMetal[metal].value / totalValue) * 100 
      : 0;
  }

  return { totalValue, byMetal };
}
