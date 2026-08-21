"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { OrderStatus, OrderSummary } from "@/lib/orders/queries";

const ALL_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function OrderList({ orders, locale }: { orders: OrderSummary[]; locale: string }) {
  const t = useTranslations("orders");
  const tStatus = useTranslations("orders.status");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!query) return true;
      return order.id.toLowerCase().includes(query);
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-foreground">{t("search")}</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("statusFilter")}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className={inputClass}
          >
            <option value="all">{t("statusAll")}</option>
            {ALL_STATUSES.map((value) => (
              <option key={value} value={value}>
                {tStatus(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-6 text-muted-foreground">{t("noResults")}</Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <li key={order.id}>
              <Link href={`/commandes/${order.id}`}>
                <Card className="flex items-center justify-between gap-3 p-4 hover:bg-surface">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("orderNumber")} {order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(order.total, locale as Locale)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
