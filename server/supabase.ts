import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  ENV.supabaseUrl || "",
  ENV.supabaseServiceRoleKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Types for database tables
export type User = {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  weight_unit: string;
  created_at: string;
  updated_at: string;
};

export type Holding = {
  id: string;
  user_id: string;
  metal_type: "gold" | "silver" | "platinum" | "palladium";
  weight_grams: number;
  buy_price_per_gram: number | null;
  buy_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceCache = {
  id: string;
  metal_type: "gold" | "silver" | "platinum" | "palladium";
  price_per_ounce: number;
  price_per_gram: number;
  day_high: number | null;
  day_low: number | null;
  change_percent: number | null;
  cached_at: string;
  expires_at: string;
};

// Database helper functions
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as User;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name?: string
): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert([
      {
        email,
        password_hash: passwordHash,
        name: name || null,
        currency: "USD",
        weight_unit: "grams",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return data as User;
}

export async function getUserHoldings(userId: string): Promise<Holding[]> {
  const { data, error } = await supabaseAdmin
    .from("holdings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching holdings:", error);
    return [];
  }

  return (data || []) as Holding[];
}

export async function createHolding(
  userId: string,
  metalType: "gold" | "silver" | "platinum" | "palladium",
  weightGrams: number,
  buyPricePerGram?: number,
  buyDate?: Date,
  notes?: string
): Promise<Holding | null> {
  const { data, error } = await supabaseAdmin
    .from("holdings")
    .insert([
      {
        user_id: userId,
        metal_type: metalType,
        weight_grams: weightGrams,
        buy_price_per_gram: buyPricePerGram || null,
        buy_date: buyDate?.toISOString() || null,
        notes: notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating holding:", error);
    return null;
  }

  return data as Holding;
}

export async function updateHolding(
  holdingId: string,
  updates: Partial<Holding>
): Promise<Holding | null> {
  const { data, error } = await supabaseAdmin
    .from("holdings")
    .update(updates)
    .eq("id", holdingId)
    .select()
    .single();

  if (error) {
    console.error("Error updating holding:", error);
    return null;
  }

  return data as Holding;
}

export async function deleteHolding(holdingId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("holdings")
    .delete()
    .eq("id", holdingId);

  if (error) {
    console.error("Error deleting holding:", error);
    return false;
  }

  return true;
}

export async function getPriceCache(
  metalType: "gold" | "silver" | "platinum" | "palladium"
): Promise<PriceCache | null> {
  const { data, error } = await supabaseAdmin
    .from("price_cache")
    .select("*")
    .eq("metal_type", metalType)
    .single();

  if (error) {
    return null;
  }

  return data as PriceCache;
}

export async function updatePriceCache(
  metalType: "gold" | "silver" | "platinum" | "palladium",
  priceData: Omit<PriceCache, "id" | "cached_at" | "metal_type">
): Promise<PriceCache | null> {
  const { data, error } = await supabaseAdmin
    .from("price_cache")
    .upsert(
      {
        metal_type: metalType,
        ...priceData,
        cached_at: new Date().toISOString(),
      },
      { onConflict: "metal_type" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error updating price cache:", error);
    return null;
  }

  return data as PriceCache;
}

export async function getUserSettings(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("currency, weight_unit")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }

  return data;
}

export async function updateUserSettings(
  userId: string,
  currency?: string,
  weightUnit?: string
): Promise<boolean> {
  const updates: any = {};
  if (currency) updates.currency = currency;
  if (weightUnit) updates.weight_unit = weightUnit;

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user settings:", error);
    return false;
  }

  return true;
}
