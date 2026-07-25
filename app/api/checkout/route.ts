import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPendingOrder } from "@/lib/orders/create-order";
import { createPaystackCheckoutSession } from "@/lib/paystack/checkout";
import { checkoutSchema } from "@/lib/orders/checkout-schema";

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const order = await createPendingOrder(parsed.data, user?.id ?? null, parsed.data.locale);

    // Paystack Checkout affiche carte + Mobile Money (Orange, MTN, Wave
    // en Côte d'Ivoire) sur sa propre page hébergée — c'est le client
    // qui choisit là-bas, pas dans notre UI.
    const session = await createPaystackCheckoutSession(order, {
      locale: parsed.data.locale,
      baseUrl: new URL(request.url).origin,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout error:", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
