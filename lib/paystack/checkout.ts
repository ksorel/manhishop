import { paystackFetch } from "./client";
import type { PreparedOrder } from "@/lib/orders/types";
import type { Locale } from "@/lib/catalogue/types";

interface InitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Paystack (Côte d'Ivoire, Ghana, Nigeria...) — Doc :
 * https://paystack.com/docs/api/transaction/#initialize
 * Important : même pour le XOF (devise sans sous-unité), Paystack exige
 * le montant multiplié par 100 comme pour les autres devises.
 */
export async function createPaystackCheckoutSession(
  order: PreparedOrder,
  opts: { locale: Locale; baseUrl: string },
) {
  const response = await paystackFetch<InitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: order.contactEmail,
      amount: Math.round(order.total) * 100,
      currency: "XOF",
      reference: order.orderId,
      callback_url: `${opts.baseUrl}/${opts.locale}/confirmation/${order.orderId}?token=${order.accessToken}`,
      metadata: { order_id: order.orderId },
    }),
  });

  return { url: response.data.authorization_url };
}
