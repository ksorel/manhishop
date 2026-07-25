"use server";

import { createClient } from "@/lib/supabase/server";
import type { Address, AddressInput } from "./types";

function toAddress(row: {
  id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  phone: string;
}): Address {
  return {
    id: row.id,
    fullName: row.full_name,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    country: row.country,
    phone: row.phone,
  };
}

export async function getAddresses(): Promise<Address[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("addresses")
    .select("id, full_name, line1, line2, city, country, phone")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAddress);
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      full_name: input.fullName,
      line1: input.line1,
      line2: input.line2 ?? null,
      city: input.city,
      country: input.country,
      phone: input.phone,
    })
    .select("id, full_name, line1, line2, city, country, phone")
    .single();

  if (error) throw error;
  return toAddress(data);
}

export async function updateAddress(id: string, input: AddressInput): Promise<Address> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { data, error } = await supabase
    .from("addresses")
    .update({
      full_name: input.fullName,
      line1: input.line1,
      line2: input.line2 ?? null,
      city: input.city,
      country: input.country,
      phone: input.phone,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, full_name, line1, line2, city, country, phone")
    .single();

  if (error) throw error;
  return toAddress(data);
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
