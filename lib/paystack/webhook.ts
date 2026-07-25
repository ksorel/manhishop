import { createHmac } from "node:crypto";
import { paystackFetch } from "./client";

/**
 * x-paystack-signature = HMAC SHA512 du corps brut de la requête, signé
 * avec la clé secrète. https://paystack.com/docs/payments/webhooks/
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;

  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

interface VerifyResponse {
  status: boolean;
  data: { status: string; reference: string; channel?: string };
}

/**
 * Reconfirme le statut réel de la transaction auprès de Paystack — ne
 * jamais se fier uniquement au contenu du webhook. `channel` (ex.
 * "card", "mobile_money") permet de renseigner orders.payment_method
 * a posteriori, puisque le choix se fait sur la page Paystack.
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<{ isPaid: boolean; paymentMethod: "card" | "mobile_money" | null }> {
  const response = await paystackFetch<VerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );

  const channel = response.data.channel;
  const paymentMethod = channel === "mobile_money" ? "mobile_money" : channel === "card" ? "card" : null;

  return { isPaid: response.data.status === "success", paymentMethod };
}
