"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useCompare } from "@/components/compare/compare-provider";

export function CompareBar() {
  const t = useTranslations("compare");
  const { ids, clear } = useCompare();

  if (ids.length < 2) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 sm:bottom-4">
      <div className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2 shadow-lg">
        <span className="text-sm font-medium text-foreground">
          {t("barCount", { count: ids.length })}
        </span>
        <Link href="/comparateur" className={buttonVariants({ variant: "primary", className: "text-xs" })}>
          {t("viewButton")}
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label={t("clear")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
