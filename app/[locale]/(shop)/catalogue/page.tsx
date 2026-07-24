import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories, getProducts } from "@/lib/catalogue/queries";
import { parseCatalogueSearchParams } from "@/lib/catalogue/parse-search-params";
import { CategoryPills } from "@/components/shop/category-pills";
import { CatalogueFilters } from "@/components/shop/catalogue-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function CataloguePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("catalogue");

  const filters = parseCatalogueSearchParams(resolvedSearchParams);
  const [categories, products] = await Promise.all([
    getCategories(locale as Locale),
    getProducts(locale as Locale, filters),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <div className="mt-4">
        <CategoryPills categories={categories} />
      </div>

      <div className="mt-4">
        <CatalogueFilters />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {t("results", { count: products.length })}
      </p>

      <div className="mt-4">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
