"use server";

import { createClient } from "@/lib/supabase/server";

export type DiscountType = "percent" | "fixed";

export interface AdminPromoCodeInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  active: boolean;
  expiresAt: string | null;
  maxUses: number | null;
}

export interface AdminPromoCode extends AdminPromoCodeInput {
  id: string;
  usedCount: number;
}

function toAdminPromoCode(row: {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
}): AdminPromoCode {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    active: row.active,
    expiresAt: row.expires_at,
    maxUses: row.max_uses,
    usedCount: row.used_count,
  };
}

const COLUMNS = "id, code, discount_type, discount_value, active, expires_at, max_uses, used_count";

export async function getAdminPromoCodes(): Promise<AdminPromoCode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAdminPromoCode);
}

export async function createPromoCode(input: AdminPromoCodeInput): Promise<AdminPromoCode> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: input.code.trim().toUpperCase(),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      active: input.active,
      expires_at: input.expiresAt,
      max_uses: input.maxUses,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminPromoCode(data);
}

export async function updatePromoCode(
  id: string,
  input: AdminPromoCodeInput,
): Promise<AdminPromoCode> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .update({
      code: input.code.trim().toUpperCase(),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      active: input.active,
      expires_at: input.expiresAt,
      max_uses: input.maxUses,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toAdminPromoCode(data);
}

export async function deletePromoCode(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw error;
}
