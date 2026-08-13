import { createClient } from "@/lib/supabase/server";

export { POINTS_TO_FCFA, EARN_RATE_FCFA_PER_POINT, REFERRAL_BONUS_POINTS } from "./constants";

export async function getLoyaltyBalance(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .select("points")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.points, 0);
}
