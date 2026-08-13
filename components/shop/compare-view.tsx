"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { useCompare } from "@/components/compare/compare-provider";
import { getCompareProducts } from "@/lib/compare/actions";
import { formatPrice } from "@/lib/format";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";

export function CompareView() {
  const t = useTranslations("compare");
  const locale = useLocale();
  const { ids, remove } = useCompare();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCompareProducts(ids, locale as Locale).then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [ids, locale]);

  if (products === null) return null;

  if (products.length === 0) {
    return <Card className="p-6 text-muted-foreground">{t("empty")}</Card>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] border-separate border-spacing-2">
        <tbody>
          <tr>
            {products.map((product) => (
              <td key={product.id} className="w-1/4 align-top">
                <Card className="relative flex flex-col gap-2 p-3">
                  <Link href={`/produit/${product.slug}`} className="relative block aspect-square">
                    <Image
                      src={product.image ?? "/img/placeholder-product.svg"}
                      alt={product.name}
                      fill
                      sizes="25vw"
                      className="rounded object-cover"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={t("remove")}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-error"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                  <Link href={`/produit/${product.slug}`} className="text-sm font-medium text-foreground">
                    {product.name}
                  </Link>
                </Card>
              </td>
            ))}
          </tr>
          <tr>
            {products.map((product) => (
              <td key={product.id} className="p-3 text-sm text-foreground">
                <span className="font-semibold">
                  {formatPrice(product.promoPrice ?? product.price, locale as Locale)}
                </span>
              </td>
            ))}
          </tr>
          <tr>
            {products.map((product) => (
              <td key={product.id} className="p-3 text-sm">
                {product.stock > 0 ? (
                  <span className="text-foreground">{t("inStock")}</span>
                ) : (
                  <span className="font-medium text-error">{t("outOfStock")}</span>
                )}
              </td>
            ))}
          </tr>
          <tr>
            {products.map((product) => (
              <td key={product.id} className="p-3 text-sm text-muted-foreground">
                {product.hasSizes ? t("hasSizes") : t("noSizes")}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
