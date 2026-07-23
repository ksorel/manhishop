import { NextResponse } from "next/server";

/**
 * Webhook de confirmation de paiement Stripe. Implémentation prévue en
 * Phase 3 : vérification de la signature (`stripe-signature` header +
 * STRIPE_WEBHOOK_SECRET) et idempotence (un même événement rejoué ne doit
 * jamais créer deux commandes payées) avant de faire passer la commande
 * en statut `paid` via le client Supabase service role.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Phase 3" },
    { status: 501 },
  );
}
