"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { bulkUpdateOrderStatus } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { AdminOrderSummary } from "@/lib/admin/orders";

type BulkStatus = "shipped" | "delivered" | "cancelled";

export function OrderList({
  initialOrders,
  locale,
}: {
  initialOrders: AdminOrderSummary[];
  locale: string;
}) {
  const t = useTranslations("admin.orders");
  const tStatus = useTranslations("orders.status");
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = orders.length > 0 && selected.size === orders.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));
  }

  async function handleBulkStatus(status: BulkStatus) {
    const ids = [...selected];
    setPending(true);
    setError(null);
    try {
      await bulkUpdateOrderStatus(ids, status);
      setOrders((prev) => prev.map((o) => (ids.includes(o.id) ? { ...o, status } : o)));
      setSelected(new Set());
    } catch {
      setError(t("bulkError"));
    } finally {
      setPending(false);
    }
  }

  if (orders.length === 0) {
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
            onClick={() => handleBulkStatus("shipped")}
            className="text-xs"
          >
            {tStatus("shipped")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={pending}
            onClick={() => handleBulkStatus("delivered")}
            className="text-xs"
          >
            {tStatus("delivered")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={pending}
            onClick={() => handleBulkStatus("cancelled")}
            className="text-xs"
          >
            {tStatus("cancelled")}
          </Button>
        </div>
      )}

      {error && <p className="text-sm font-medium text-error">{error}</p>}

      <ul className="flex flex-col gap-2">
        {orders.map((order) => (
          <li key={order.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.has(order.id)}
              onChange={() => toggle(order.id)}
              aria-label={`${t("orderNumber")} ${order.id.slice(0, 8)}`}
              className="size-5 shrink-0"
            />
            <Link href={`/admin/commandes/${order.id}`} className="min-w-0 flex-1">
              <Card className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-surface">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {t("orderNumber")} {order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.contactEmail} · {new Date(order.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-foreground">
                    {formatPrice(order.total, locale as Locale)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
