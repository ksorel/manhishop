import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminProducts } from "@/lib/admin/products";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ProductList } from "@/components/admin/product-list";

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
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/produits/importer"
            className={buttonVariants({ variant: "secondary" })}
          >
            {t("import")}
          </Link>
          <Link href="/admin/produits/nouveau" className={buttonVariants({ variant: "primary" })}>
            {t("add")}
          </Link>
        </div>
      </div>

      <ProductList initialProducts={products} locale={locale} />
    </div>
  );
}
