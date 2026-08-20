import { useTranslations } from "next-intl";
import { Check, CreditCard, PackageCheck, ShoppingBag, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/orders/queries";

const STEPS = [
  { key: "ordered", icon: ShoppingBag },
  { key: "paid", icon: CreditCard },
  { key: "shipped", icon: Truck },
  { key: "delivered", icon: PackageCheck },
] as const;

// Index du statut courant dans STEPS ; "pending" = seule la 1ère étape est
// atteinte (commande créée, paiement pas encore confirmé).
const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.timeline");

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
        <XCircle className="size-4 shrink-0" aria-hidden="true" />
        {t("cancelledNotice")}
      </div>
    );
  }

  const currentIndex = STATUS_STEP_INDEX[status];

  return (
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const isLast = index === STEPS.length - 1;
        return (
          <li key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {reached && index < currentIndex ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <step.icon className="size-4" aria-hidden="true" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    index < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-2 max-w-20 text-center text-xs",
                reached ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {t(step.key)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
