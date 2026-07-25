import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/orders/queries";

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-warning text-warning-foreground",
  paid: "bg-success text-success-foreground",
  shipped: "bg-success text-success-foreground",
  delivered: "bg-success text-success-foreground",
  cancelled: "bg-error text-error-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        STATUS_CLASSES[status],
      )}
    >
      {t(status)}
    </span>
  );
}
