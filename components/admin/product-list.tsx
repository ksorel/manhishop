"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { bulkDeleteProducts, bulkUpdateProductStatus } from "@/lib/admin/products";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { AdminProductSummary } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function ProductList({
  initialProducts,
  locale,
}: {
  initialProducts: AdminProductSummary[];
  locale: string;
}) {
  const t = useTranslations("admin.products");
  const confirm = useConfirm();
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  async function handleBulkStatus(status: "active" | "draft") {
    const ids = [...selected];
    setPending(true);
    setError(null);
    try {
      await bulkUpdateProductStatus(ids, status);
      setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
      setSelected(new Set());
    } catch {
      setError(t("bulkError"));
    } finally {
      setPending(false);
    }
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    if (!(await confirm({ message: t("confirmBulkDelete", { count: ids.length }), danger: true }))) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await bulkDeleteProducts(ids);
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelected(new Set());
    } catch {
      setError(t("bulkError"));
    } finally {
      setPending(false);
    }
  }

  if (products.length === 0) {
    return <Card className="mt-6 p-6 text-muted-foreground">{t("empty")}</Card>;
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          aria-label={t("selectAll")}
          className="size-5 shrink-0"
        />
        <span className="text-sm text-muted-foreground">{t("selectAll")}</span>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-surface p-3">
          <span className="text-sm font-medium text-foreground">
            {t("selectedCount", { count: selected.size })}
          </span>
          <Button
            type="button"
            variant="secondary"
            loading={pending}
            onClick={() => handleBulkStatus("active")}
            className="text-xs"
          >
            {t("bulkActivate")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={pending}
            onClick={() => handleBulkStatus("draft")}
            className="text-xs"
          >
            {t("bulkDraft")}
          </Button>
          <button
            type="button"
            disabled={pending}
            onClick={handleBulkDelete}
            className="flex min-h-11 items-center rounded px-3 text-xs font-medium text-error hover:bg-error/10 disabled:pointer-events-none disabled:opacity-50"
          >
            {t("bulkDelete")}
          </button>
        </div>
      )}

      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <ul className="flex flex-col gap-2">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.has(product.id)}
              onChange={() => toggle(product.id)}
              aria-label={product.nameFr}
              className="size-5 shrink-0"
            />
            <Link href={`/admin/produits/${product.id}`} className="min-w-0 flex-1">
              <Card
                className={cn(
                  "flex items-center justify-between gap-3 p-3 text-sm hover:bg-surface",
                  selected.has(product.id) && "border-primary",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{product.nameFr}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.categoryName ?? "—"} · {t(`${product.status}`)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs">
                  <span className="text-foreground">
                    {formatPrice(product.price, locale as Locale)}
                  </span>
                  <span
                    className={product.stock <= 0 ? "font-medium text-error" : "text-muted-foreground"}
                  >
                    {t("stock")}: {product.stock}
                  </span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
