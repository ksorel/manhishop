"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { SizeSelector } from "@/components/shop/size-selector";
import { SizeGuideModal } from "@/components/shop/size-guide-modal";
import { NotifyBackInStockButton } from "@/components/shop/notify-back-in-stock-button";
import type { Product, ProductSize } from "@/lib/catalogue/types";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const t = useTranslations("product");
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [notifySize, setNotifySize] = useState<ProductSize | null>(null);
  const requiresSize = product.sizes.length > 0;
  const outOfStock = !requiresSize && product.stock <= 0;

  function handleRequestNotify(size: ProductSize) {
    setNotifySize(size);
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {requiresSize && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <SizeSelector
              sizes={product.sizes}
              selectedSizeId={selectedSize?.id ?? null}
              onSelect={(size) => {
                setSelectedSize(size);
                setNotifySize(null);
              }}
              onRequestNotify={handleRequestNotify}
            />
          </div>
          {product.sizeGuide && <SizeGuideModal guide={product.sizeGuide} />}
          {!selectedSize && !notifySize && (
            <p className="text-xs text-muted-foreground">{t("sizeRequired")}</p>
          )}
          {notifySize && (
            <NotifyBackInStockButton
              productId={product.id}
              sizeId={notifySize.id}
              label={t("notifyForSize", { size: notifySize.label })}
              className="self-start"
            />
          )}
        </div>
      )}

      <AddToCartButton
        product={product}
        size={selectedSize}
        disabled={requiresSize && !selectedSize}
        className="w-full sm:w-auto"
      />

      {outOfStock && (
        <NotifyBackInStockButton
          productId={product.id}
          sizeId={null}
          label={t("notifyMe")}
          className="self-start"
        />
      )}
    </div>
  );
}
