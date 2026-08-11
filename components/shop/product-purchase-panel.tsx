"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { SizeSelector } from "@/components/shop/size-selector";
import { SizeGuideModal } from "@/components/shop/size-guide-modal";
import type { Product, ProductSize } from "@/lib/catalogue/types";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const t = useTranslations("product");
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const requiresSize = product.sizes.length > 0;

  return (
    <div className="mt-6 flex flex-col gap-4">
      {requiresSize && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <SizeSelector
              sizes={product.sizes}
              selectedSizeId={selectedSize?.id ?? null}
              onSelect={setSelectedSize}
            />
          </div>
          {product.sizeGuide && <SizeGuideModal guide={product.sizeGuide} />}
          {!selectedSize && (
            <p className="text-xs text-muted-foreground">{t("sizeRequired")}</p>
          )}
        </div>
      )}

      <AddToCartButton
        product={product}
        size={selectedSize}
        disabled={requiresSize && !selectedSize}
        className="w-full sm:w-auto"
      />
    </div>
  );
}
