"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BellRing } from "lucide-react";
import { subscribeToStockNotification } from "@/lib/stock-notifications/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotifyBackInStockButton({
  productId,
  sizeId,
  label,
  className,
}: {
  productId: string;
  sizeId: string | null;
  label: string;
  className?: string;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setPending(true);
    setError(false);
    try {
      const result = await subscribeToStockNotification(productId, sizeId);
      if (result.status === "unauthenticated") {
        window.location.href = `/${locale}/connexion`;
        return;
      }
      setSubscribed(true);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  if (subscribed) {
    return <p className={cn("text-sm font-medium text-primary", className)}>{t("notifySubscribed")}</p>;
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(buttonVariants({ variant: "secondary" }), "disabled:opacity-60")}
      >
        <BellRing className="size-4" aria-hidden="true" />
        {label}
      </button>
      {error && <p className="mt-1 text-xs font-medium text-error">{t("notifyError")}</p>}
    </div>
  );
}
