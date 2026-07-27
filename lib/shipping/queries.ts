import { createClient } from "@/lib/supabase/server";
import type { ShippingRate } from "./types";

export async function getShippingRates(): Promise<ShippingRate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shipping_rates").select("id, country, city, fee");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    country: row.country,
    city: row.city,
    fee: Number(row.fee),
  }));
}
