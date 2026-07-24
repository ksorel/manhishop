import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getWishlist } from "@/lib/wishlist/actions";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");

  const products = await getWishlist(locale as Locale);
  if (products === null) redirect(`/${locale}/connexion`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        {products.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
