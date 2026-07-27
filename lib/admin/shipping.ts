"use server";

import { createClient } from "@/lib/supabase/server";
import type { ShippingRate, ShippingRateInput } from "@/lib/shipping/types";

function toShippingRate(row: { id: string; country: string; city: string | null; fee: number }): ShippingRate {
  return { id: row.id, country: row.country, city: row.city, fee: Number(row.fee) };
}

export async function getAdminShippingRates(): Promise<ShippingRate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("id, country, city, fee")
    .order("country", { ascending: true })
    .order("city", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data ?? []).map(toShippingRate);
}

export async function createShippingRate(input: ShippingRateInput): Promise<ShippingRate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .insert({ country: input.country, city: input.city || null, fee: input.fee })
    .select("id, country, city, fee")
    .single();

  if (error) throw error;
  return toShippingRate(data);
}

export async function updateShippingRate(
  id: string,
  input: ShippingRateInput,
): Promise<ShippingRate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .update({ country: input.country, city: input.city || null, fee: input.fee })
    .eq("id", id)
    .select("id, country, city, fee")
    .single();

  if (error) throw error;
  return toShippingRate(data);
}

export async function deleteShippingRate(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("shipping_rates").delete().eq("id", id);
  if (error) throw error;
}
