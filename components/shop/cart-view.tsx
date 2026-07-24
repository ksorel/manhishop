"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { items, totalPrice, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return <Card className="p-6 text-muted-foreground">{t("empty")}</Card>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {items.map((line) => (
          <li key={line.productId}>
            <Card className="flex gap-4 p-3">
              <Link
                href={`/produit/${line.product.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded"
              >
                <Image
                  src={line.product.image ?? "/img/placeholder-product.svg"}
                  alt={line.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/produit/${line.product.slug}`}
                    className="text-sm font-medium text-foreground"
                  >
                    {line.product.name}
                  </Link>
                  <span className="font-semibold text-foreground">
                    {formatPrice(
                      (line.product.promoPrice ?? line.product.price) * line.quantity,
                      locale,
                    )}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="sr-only">{t("quantity")}</span>
                    <input
                      type="number"
                      min={1}
                      max={line.product.stock}
                      value={line.quantity}
                      onChange={(e) =>
                        updateQuantity(line.productId, Number(e.target.value))
                      }
                      className="min-h-11 w-16 rounded border border-border bg-background px-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="min-h-11 px-2 text-sm text-error hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="flex items-center justify-between p-4">
        <span className="text-lg font-semibold text-foreground">{t("total")}</span>
        <span className="text-lg font-semibold text-foreground">
          {formatPrice(totalPrice, locale)}
        </span>
      </Card>

      <Link
        href="/checkout"
        className={buttonVariants({ variant: "primary", className: "w-full" })}
      >
        {t("checkout")}
      </Link>
    </div>
  );
}
