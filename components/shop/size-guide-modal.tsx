"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ruler, X } from "lucide-react";
import { SizeGuideTable } from "@/components/shop/size-guide-table";
import type { SizeGuide } from "@/lib/catalogue/types";

export function SizeGuideModal({ guide }: { guide: SizeGuide }) {
  const t = useTranslations("product");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Ruler className="size-4" aria-hidden="true" />
        {t("sizeGuide")}
      </button>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={guide.title}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-background p-5 shadow-xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">{guide.title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("sizeGuideClose")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4">
              <SizeGuideTable content={guide.content} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
