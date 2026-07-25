"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import type { Address, AddressInput } from "@/lib/addresses/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const COUNTRIES = ["ci", "sn", "ml", "bf", "tg", "bj"] as const;

export function AddressForm({
  initialAddress,
  onSubmit,
  onCancel,
}: {
  initialAddress?: Address;
  onSubmit: (input: AddressInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations("addresses");
  const [fullName, setFullName] = useState(initialAddress?.fullName ?? "");
  const [line1, setLine1] = useState(initialAddress?.line1 ?? "");
  const [line2, setLine2] = useState(initialAddress?.line2 ?? "");
  const [city, setCity] = useState(initialAddress?.city ?? "");
  const [country, setCountry] = useState(initialAddress?.country ?? "");
  const [phone, setPhone] = useState(initialAddress?.phone ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    await onSubmit({
      fullName,
      line1,
      line2: line2 || undefined,
      city,
      country,
      phone,
    });
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("fullName")}</span>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("phone")}</span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("line1")}</span>
        <input
          type="text"
          required
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("line2")}</span>
        <input
          type="text"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("city")}</span>
        <input
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("country")}</span>
        <select
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            {t("countrySelect")}
          </option>
          {COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {t(`countries.${code}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ variant: "primary" })}
        >
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
