import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getAllCategories,
  getCategories,
  getCategoryBySlug,
  getProducts,
} from "@/lib/catalogue/queries";
import { getAncestorChain, getCategoryChildren } from "@/lib/catalogue/category-tree";
import { parseCatalogueSearchParams } from "@/lib/catalogue/parse-search-params";
import { CategoryPills } from "@/components/shop/category-pills";
import { CategoryBreadcrumb } from "@/components/shop/category-breadcrumb";
import { CatalogueFilters } from "@/components/shop/catalogue-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug, locale as Locale);
  if (!category) return {};

  return { title: `${category.name} — Manhishop` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("catalogue");

  const category = await getCategoryBySlug(categorySlug, locale as Locale);
  if (!category) notFound();

  const filters = {
    ...parseCatalogueSearchParams(resolvedSearchParams),
    categorySlug,
  };
  const [categories, allCategories, products] = await Promise.all([
    getCategories(locale as Locale),
    getAllCategories(locale as Locale),
    getProducts(locale as Locale, filters),
  ]);

  const ancestors = getAncestorChain(allCategories, category.id);
  const children = getCategoryChildren(allCategories, category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CategoryBreadcrumb ancestors={ancestors} current={category} />

      <h1 className="mt-1 text-2xl font-semibold text-foreground">{category.name}</h1>

      <div className="mt-4">
        <CategoryPills categories={categories} activeSlug={category.slug} />
      </div>

      {children.length > 0 && (
        <div className="mt-2">
          <CategoryPills categories={children} activeSlug={category.slug} showAllPill={false} />
        </div>
      )}

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
