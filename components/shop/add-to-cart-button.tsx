"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/lib/catalogue/types";

export function AddToCartButton({
  product,
  size = null,
  disabled = false,
  className,
}: {
  product: ProductSummary;
  size?: { id: string; label: string; stock: number } | null;
  disabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = size ? size.stock <= 0 : product.stock <= 0;

  async function handleClick() {
    await addItem(product, 1, size);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={outOfStock || disabled}
      className={cn(buttonVariants({ variant: "primary" }), "disabled:opacity-60", className)}
    >
      {justAdded ? t("added") : outOfStock ? t("outOfStock") : t("addToCart")}
    </button>
  );
}
