import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug, getSimilarProducts } from "@/lib/catalogue/queries";
import { getWishlistProductIds } from "@/lib/wishlist/actions";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as Locale);

  if (!product) return {};

  return {
    title: `${product.name} — Manhishop`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");

  const product = await getProductBySlug(slug, locale as Locale);
  if (!product) notFound();

  const [similarProducts, wishlistProductIds] = await Promise.all([
    getSimilarProducts(product.categorySlug, product.id, locale as Locale),
    getWishlistProductIds(),
  ]);

  const outOfStock = product.stock <= 0;
  const hasPromo = product.promoPrice !== null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: hasPromo ? product.promoPrice : product.price,
      availability: outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 sm:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
            <WishlistButton
              productId={product.id}
              initialInWishlist={wishlistProductIds.includes(product.id)}
            />
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl font-semibold text-foreground">
              {formatPrice(hasPromo ? product.promoPrice! : product.price, locale as Locale)}
            </span>
            {hasPromo && (
              <span className="text-muted-foreground line-through">
                {formatPrice(product.price, locale as Locale)}
              </span>
            )}
          </div>

          {outOfStock && (
            <p className="mt-2 text-sm font-medium text-error">{t("outOfStock")}</p>
          )}

          <p className="mt-4 whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>

          <AddToCartButton product={product} className="mt-6 w-full sm:w-auto" />
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">{t("similar")}</h2>
          <div className="mt-4">
            <ProductGrid products={similarProducts} />
          </div>
        </section>
      )}
    </div>
  );
}
