import { NextResponse } from "next/server";

/**
 * Webhook de confirmation de paiement Mobile Money (CinetPay). Implémentation
 * prévue en Phase 3 : vérification de signature/hash fournisseur et
 * idempotence avant de faire passer la commande en statut `paid`.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Phase 3" },
    { status: 501 },
  );
}
