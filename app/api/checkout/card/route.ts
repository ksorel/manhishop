import { NextResponse } from "next/server";

/**
 * Création de session de paiement Stripe (carte). Implémentation prévue
 * en Phase 3 : recalcul serveur du total à partir du panier, jamais du
 * prix envoyé par le client.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Phase 3" },
    { status: 501 },
  );
}
