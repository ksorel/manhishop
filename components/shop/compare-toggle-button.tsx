"use client";

import { useTranslations } from "next-intl";
import { Scale } from "lucide-react";
import { useCompare } from "@/components/compare/compare-provider";
import { cn } from "@/lib/utils";

export function CompareToggleButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const t = useTranslations("compare");
  const { isSelected, toggle, isFull } = useCompare();
  const selected = isSelected(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      disabled={!selected && isFull}
      aria-label={selected ? t("remove") : t("add")}
      aria-pressed={selected}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full bg-background/80 text-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-40",
        selected && "text-primary",
        className,
      )}
    >
      <Scale className="size-5" aria-hidden="true" />
    </button>
  );
}
