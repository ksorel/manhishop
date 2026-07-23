import { NextResponse } from "next/server";

/**
 * Initialisation d'un paiement Mobile Money via l'agrégateur (CinetPay).
 * Implémentation prévue en Phase 3 : commande créée en statut `pending`,
 * redirection vers la page de paiement hébergée par l'agrégateur.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Phase 3" },
    { status: 501 },
  );
}
