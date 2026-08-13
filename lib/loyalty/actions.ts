"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { getLoyaltyBalance, POINTS_TO_FCFA } from "./queries";

export interface LoyaltySummary {
  balance: number;
  balanceValueFcfa: number;
  referralLink: string;
  referredCount: number;
}

export async function getMyLoyaltySummary(): Promise<LoyaltySummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const balance = await getLoyaltyBalance(user.id);

  // Compte de filleuls récompensés : nécessite de lire des profils autres
  // que le sien, ce que la RLS de profiles (select own uniquement)
  // n'autorise pas — client service-role, comme pour les autres lectures
  // cross-utilisateur de ce projet (ex. lib/stock-notifications/notify.ts).
  const admin = createAdminClient();
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", user.id)
    .eq("referral_rewarded", true);

  return {
    balance,
    balanceValueFcfa: balance * POINTS_TO_FCFA,
    referralLink: `${SITE_URL}/fr/inscription?ref=${user.id}`,
    referredCount: count ?? 0,
  };
}
