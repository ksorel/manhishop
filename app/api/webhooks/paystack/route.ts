import { NextResponse } from "next/server";
import { verifyPaystackSignature, verifyPaystackTransaction } from "@/lib/paystack/webhook";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import type { PreparedOrder } from "@/lib/orders/types";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.error("Paystack webhook: invalid or missing x-paystack-signature");
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const reference: string | undefined = event?.data?.reference;

  if (event.event !== "charge.success" || !reference) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const admin = createAdminClient();
  const idempotencyKey = `paystack:${reference}`;

  // Idempotence : un même événement rejoué ne doit jamais re-traiter un
  // paiement déjà appliqué.
  const { error: insertEventError } = await admin
    .from("processed_webhook_events")
    .insert({ id: idempotencyKey, provider: "paystack" });

  if (insertEventError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Si quoi que ce soit échoue après avoir réservé la clé d'idempotence
  // (ex. coupure réseau vers l'API Paystack), on la libère avant de
  // renvoyer une erreur — sinon un futur vrai retry du webhook serait
  // ignoré à tort comme "déjà traité" alors que rien n'a été appliqué.
  try {
    // Ne jamais faire confiance au seul contenu du webhook : on
    // reconfirme le statut réel auprès de Paystack.
    const { isPaid, paymentMethod } = await verifyPaystackTransaction(reference);
    if (!isPaid) {
      await admin.from("processed_webhook_events").delete().eq("id", idempotencyKey);
      return NextResponse.json({ received: true, paid: false });
    }

    const { data: order } = await admin
      .from("orders")
      .select(
        "id, status, contact_email, locale, subtotal, delivery_fee, discount_amount, total, access_token, order_items(product_id, product_name, size_label, quantity, unit_price)",
      )
      .eq("id", reference)
      .maybeSingle();

    if (order && order.status === "pending") {
      await admin
        .from("orders")
        .update({
          status: "paid",
          payment_provider: "paystack",
          payment_method: paymentMethod,
          external_transaction_ref: reference,
        })
        .eq("id", order.id)
        .eq("status", "pending");

      const preparedOrder: PreparedOrder = {
        orderId: order.id,
        accessToken: order.access_token,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee),
        discountAmount: Number(order.discount_amount),
        total: Number(order.total),
        contactEmail: order.contact_email,
        locale: order.locale as "fr" | "en",
        lines: (order.order_items ?? []).map((item) => ({
          productId: item.product_id,
          name: item.product_name,
          sizeLabel: item.size_label,
          unitPrice: Number(item.unit_price),
          quantity: item.quantity,
        })),
      };

      await sendOrderConfirmationEmail(preparedOrder, preparedOrder.locale);
    }

    return NextResponse.json({ received: true, paid: true });
  } catch (error) {
    console.error("Paystack webhook processing error:", error);
    await admin.from("processed_webhook_events").delete().eq("id", idempotencyKey);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
