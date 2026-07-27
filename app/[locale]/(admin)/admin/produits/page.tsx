import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminProducts } from "@/lib/admin/products";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.products");

  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <Link href="/admin/produits/nouveau" className={buttonVariants({ variant: "primary" })}>
          {t("add")}
        </Link>
      </div>

      {products.length === 0 ? (
        <Card className="mt-6 p-6 text-muted-foreground">{t("empty")}</Card>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/admin/produits/${product.id}`}>
                <Card className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-surface">
                  <div>
                    <p className="font-medium text-foreground">{product.nameFr}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.categoryName ?? "—"} · {t(`${product.status}`)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-foreground">
                      {formatPrice(product.price, locale as Locale)}
                    </span>
                    <span
                      className={product.stock <= 0 ? "font-medium text-error" : "text-muted-foreground"}
                    >
                      {t("stock")}: {product.stock}
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
