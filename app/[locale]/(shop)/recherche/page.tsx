import { getTranslations, setRequestLocale } from "next-intl/server";
import { searchProducts } from "@/lib/catalogue/queries";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q } = await searchParams;
  const t = await getTranslations("search");

  const products = q ? await searchProducts(locale as Locale, q) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <form action={`/${locale}/recherche`} className="mt-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("placeholder")}
          className="min-h-11 flex-1 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="submit"
          className="min-h-11 rounded bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("submit")}
        </button>
      </form>

      <div className="mt-6">
        {!q ? (
          <p className="text-muted-foreground">{t("prompt")}</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">{t("empty", { query: q })}</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
