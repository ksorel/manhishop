import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const outOfStock = product.stock <= 0;
  const hasPromo = product.promoPrice !== null;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link href={`/produit/${product.slug}`} className="relative block aspect-square">
        <Image
          src={product.image ?? "/img/placeholder-product.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
        />
        {hasPromo && (
          <span className="absolute left-2 top-2 rounded bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">
            {t("promo")}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded bg-error px-2 py-0.5 text-xs font-medium text-error-foreground">
            {t("outOfStock")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/produit/${product.slug}`} className="text-sm font-medium text-foreground">
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-foreground">
            {formatPrice(hasPromo ? product.promoPrice! : product.price, locale)}
          </span>
          {hasPromo && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price, locale)}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled
          title={t("addToCartComingSoon")}
          className={buttonVariants({
            variant: "secondary",
            className: "mt-auto w-full opacity-60",
          })}
        >
          {t("addToCart")}
        </button>
      </div>
    </Card>
  );
}
