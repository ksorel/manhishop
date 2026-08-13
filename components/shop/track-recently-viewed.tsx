"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed/storage";

/** Composant sans rendu : enregistre le produit courant dans l'historique
 * local dès que la page produit est visitée. */
export function TrackRecentlyViewed({ productId }: { productId: string }) {
  useEffect(() => {
    addRecentlyViewed(productId);
  }, [productId]);

  return null;
}
