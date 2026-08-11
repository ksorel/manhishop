"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/lib/catalogue/types";

export function SizeSelector({
  sizes,
  selectedSizeId,
  onSelect,
}: {
  sizes: ProductSize[];
  selectedSizeId: string | null;
  onSelect: (size: ProductSize) => void;
}) {
  const t = useTranslations("product");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{t("chooseSize")}</span>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const outOfStock = size.stock <= 0;
          const selected = selectedSizeId === size.id;
          return (
            <button
              key={size.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(size)}
              aria-pressed={selected}
              className={cn(
                "min-h-11 min-w-11 rounded border px-3 text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-surface",
                outOfStock && "cursor-not-allowed opacity-40 line-through hover:bg-background",
              )}
            >
              {size.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
