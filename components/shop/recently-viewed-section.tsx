"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { readRecentlyViewed } from "@/lib/recently-viewed/storage";
import { getRecentlyViewedProducts } from "@/lib/recently-viewed/actions";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";

/** N'affiche rien tant qu'il n'y a pas d'historique — pas d'état vide
 * intrusif sur l'accueil ou une fiche produit. */
export function RecentlyViewedSection({ excludeProductId }: { excludeProductId?: string }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ids = readRecentlyViewed().filter((id) => id !== excludeProductId);
    getRecentlyViewedProducts(ids, locale as Locale).then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [excludeProductId, locale]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-foreground">{t("recentlyViewed")}</h2>
      <div className="mt-4">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
