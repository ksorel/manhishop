"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminPromoCode, AdminPromoCodeInput, DiscountType } from "@/lib/admin/promo-codes";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function PromoCodeForm({
  initialPromoCode,
  onSubmit,
  onCancel,
}: {
  initialPromoCode?: AdminPromoCode;
  onSubmit: (input: AdminPromoCodeInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.promoCodes");
  const [code, setCode] = useState(initialPromoCode?.code ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    initialPromoCode?.discountType ?? "percent",
  );
  const [discountValue, setDiscountValue] = useState(
    initialPromoCode?.discountValue?.toString() ?? "",
  );
  const [active, setActive] = useState(initialPromoCode?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(initialPromoCode?.expiresAt?.slice(0, 10) ?? "");
  const [maxUses, setMaxUses] = useState(initialPromoCode?.maxUses?.toString() ?? "");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const input: AdminPromoCodeInput = {
      code,
      discountType,
      discountValue: Number(discountValue),
      active,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      maxUses: maxUses ? Number(maxUses) : null,
    };

    try {
      await onSubmit(input);
    } catch {
      setFormError(t("saveError"));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("code")}</span>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("discountType")}</span>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className={inputClass}
          >
            <option value="percent">{t("percent")}</option>
            <option value="fixed">{t("fixed")}</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("discountValue")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground">{t("maxUses")}</span>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("expiresAt")}</span>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-5"
        />
        {t("active")}
      </label>

      {formError && <p className="text-sm font-medium text-error">{formError}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {t("save")}
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonVariants({ variant: "text" })}>
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
