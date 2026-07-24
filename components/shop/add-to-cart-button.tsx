"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/lib/catalogue/types";

export function AddToCartButton({
  product,
  className,
}: {
  product: ProductSummary;
  className?: string;
}) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  async function handleClick() {
    await addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={outOfStock}
      className={cn(buttonVariants({ variant: "primary" }), "disabled:opacity-60", className)}
    >
      {justAdded ? t("added") : outOfStock ? t("outOfStock") : t("addToCart")}
    </button>
  );
}
