"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import type { SortOption } from "@/lib/catalogue/types";

export function CatalogueFilters() {
  const t = useTranslations("catalogue.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const minPrice = form.get("minPrice");
    const maxPrice = form.get("maxPrice");
    const inStockOnly = form.get("inStockOnly");

    updateParams((params) => {
      if (minPrice) params.set("minPrice", String(minPrice));
      else params.delete("minPrice");

      if (maxPrice) params.set("maxPrice", String(maxPrice));
      else params.delete("maxPrice");

      if (inStockOnly) params.set("inStock", "1");
      else params.delete("inStock");
    });
  }

  function handleSortChange(sort: SortOption) {
    updateParams((params) => params.set("sort", sort));
  }

  function handleReset() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t("sort")}</span>
        <select
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="min-h-11 rounded border border-border bg-background px-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="newest">{t("sortNewest")}</option>
          <option value="price-asc">{t("sortPriceAsc")}</option>
          <option value="price-desc">{t("sortPriceDesc")}</option>
        </select>
      </label>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t("priceMin")}</span>
          <input
            type="number"
            name="minPrice"
            min={0}
            defaultValue={searchParams.get("minPrice") ?? ""}
            className="min-h-11 w-24 rounded border border-border bg-background px-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t("priceMax")}</span>
          <input
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            className="min-h-11 w-24 rounded border border-border bg-background px-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="inStockOnly"
            defaultChecked={searchParams.get("inStock") === "1"}
            className="size-5"
          />
          {t("inStockOnly")}
        </label>

        <button
          type="submit"
          className="min-h-11 rounded bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("apply")}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="min-h-11 rounded px-4 text-sm font-medium text-primary hover:underline"
        >
          {t("reset")}
        </button>
      </form>
    </div>
  );
}
