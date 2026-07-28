import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryPills } from "@/components/shop/category-pills";
import { ProductGrid } from "@/components/shop/product-grid";
import { PromoCarousel } from "@/components/shop/promo-carousel";
import {
  getCategories,
  getFeaturedProducts,
  getPromotedProducts,
} from "@/lib/catalogue/queries";
import { getHomeContent } from "@/lib/content/queries";
import type { Locale } from "@/lib/catalogue/types";

// Lecture Supabase à chaque requête (pas de pré-rendu au build) — ISR à
// envisager en Phase 6 une fois les besoins de perf mesurés.
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [categories, featuredProducts, promotedProducts, homeContent] = await Promise.all([
    getCategories(locale as Locale),
    getFeaturedProducts(locale as Locale),
    getPromotedProducts(locale as Locale),
    getHomeContent(),
  ]);
  const heroTitle = locale === "fr" ? homeContent.heroTitleFr : homeContent.heroTitleEn;
  const heroSubtitle =
    locale === "fr" ? homeContent.heroSubtitleFr : homeContent.heroSubtitleEn;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded bg-surface p-8 text-center sm:p-16">
        <h1 className="text-2xl font-semibold text-foreground sm:text-4xl">
          {heroTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">{heroSubtitle}</p>
        <Link
          href="/catalogue"
          className={buttonVariants({ variant: "primary", className: "mt-6" })}
        >
          {t("hero.cta")}
        </Link>
      </section>

      {promotedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">
            {t("promo.title")}
          </h2>
          <div className="mt-4">
            <PromoCarousel products={promotedProducts} />
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          {t("categories.title")}
        </h2>
        {categories.length === 0 ? (
          <Card className="mt-4 p-6 text-muted-foreground">
            {t("categories.empty")}
          </Card>
        ) : (
          <div className="mt-4">
            <CategoryPills categories={categories} />
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          {t("featured.title")}
        </h2>
        {featuredProducts.length === 0 ? (
          <Card className="mt-4 p-6 text-muted-foreground">
            {t("featured.empty")}
          </Card>
        ) : (
          <div className="mt-4">
            <ProductGrid products={featuredProducts} />
          </div>
        )}
      </section>
    </div>
  );
}
