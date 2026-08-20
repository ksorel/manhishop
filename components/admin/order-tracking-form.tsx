"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateOrderTracking } from "@/lib/admin/orders";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function OrderTrackingForm({
  orderId,
  initialTrackingInfo,
}: {
  orderId: string;
  initialTrackingInfo: string | null;
}) {
  const t = useTranslations("admin.orders");
  const [trackingInfo, setTrackingInfo] = useState(initialTrackingInfo ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      await updateOrderTracking(orderId, trackingInfo);
      setMessage(t("trackingSaved"));
    } catch {
      setMessage(t("bulkError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("trackingLabel")}</span>
        <input
          type="text"
          value={trackingInfo}
          onChange={(e) => setTrackingInfo(e.target.value)}
          className={inputClass}
        />
      </label>
      {message && <p className="text-sm text-success">{message}</p>}
      <Button type="submit" loading={pending} className="self-start">
        {t("trackingSave")}
      </Button>
    </form>
  );
}
