"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import type { ShippingRate, ShippingRateInput } from "@/lib/shipping/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const COUNTRIES = ["ci", "sn", "ml", "bf", "tg", "bj"] as const;

export function ShippingRateForm({
  initialRate,
  onSubmit,
  onCancel,
}: {
  initialRate?: ShippingRate;
  onSubmit: (input: ShippingRateInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.shipping");
  const tCountries = useTranslations("checkout.countries");
  const [country, setCountry] = useState(initialRate?.country ?? "ci");
  const [city, setCity] = useState(initialRate?.city ?? "");
  const [fee, setFee] = useState(initialRate?.fee?.toString() ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    await onSubmit({ country, city: city || undefined, fee: Number(fee) });
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("country")}</span>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>
          {COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {tCountries(code)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("city")}</span>
        <input
          type="text"
          placeholder={t("cityPlaceholder")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-muted-foreground">{t("cityHint")}</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("fee")}</span>
        <input
          type="number"
          min={0}
          required
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={buttonVariants({ variant: "primary" })}>
          {t("save")}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonVariants({ variant: "text" })}>
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
