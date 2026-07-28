"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import type { Locale, ProductSummary } from "@/lib/catalogue/types";

const AUTOPLAY_DELAY_MS = 5000;

export function PromoCarousel({ products }: { products: ProductSummary[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % products.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTOPLAY_DELAY_MS);
    return () => clearInterval(interval);
  }, [products.length, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    function handleScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = track;
        if (!el) return;
        const index = Math.round(el.scrollLeft / el.clientWidth);
        setActiveIndex((current) => (current === index ? current : index));
      });
    }

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => {
          const hasPromo = product.promoPrice !== null;
          return (
            <Link
              key={product.id}
              href={`/produit/${product.slug}`}
              className="flex w-full shrink-0 snap-start flex-col overflow-hidden bg-surface"
            >
              <div className="relative aspect-[2/1] w-full bg-surface">
                <Image
                  src={product.image ?? "/img/placeholder-product.svg"}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  className="object-contain p-4"
                  priority={product === products[0]}
                />
                {hasPromo && (
                  <span className="absolute left-3 top-3 rounded bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">
                    {t("promo")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(hasPromo ? product.promoPrice! : product.price, locale)}
                  </span>
                  {hasPromo && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.price, locale)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length > 1 && (
        <div className="mt-1 flex justify-center">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? "w-6 bg-primary" : "w-2 bg-border"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
