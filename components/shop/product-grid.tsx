import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/shop/product-card";
import type { ProductSummary } from "@/lib/catalogue/types";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  const t = useTranslations("catalogue");

  if (products.length === 0) {
    return <Card className="p-6 text-muted-foreground">{t("empty")}</Card>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
