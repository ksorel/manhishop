"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateOrderStatus } from "@/lib/admin/orders";
import type { OrderStatus } from "@/lib/orders/queries";

const UPDATABLE_STATUSES: OrderStatus[] = ["shipped", "delivered", "cancelled"];

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const t = useTranslations("orders.status");
  const tAdmin = useTranslations("admin.orders");
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChange(next: OrderStatus) {
    await updateOrderStatus(orderId, next);
    setStatus(next);
    setMessage(tAdmin("statusUpdated"));
  }

  // Une commande non encore payée (webhook) ou déjà annulée ne peut pas
  // être passée à expédiée/livrée depuis le back-office.
  if (status === "pending" || status === "cancelled") return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{tAdmin("updateStatus")}</span>
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as OrderStatus)}
          className={inputClass}
        >
          {status === "paid" && (
            <option value="paid" disabled>
              {t("paid")}
            </option>
          )}
          {UPDATABLE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      {message && <p className="text-sm text-success">{message}</p>}
    </div>
  );
}
