"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ShippingRateForm } from "@/components/admin/shipping-rate-form";
import {
  createShippingRate,
  deleteShippingRate,
  updateShippingRate,
} from "@/lib/admin/shipping";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { ShippingRate, ShippingRateInput } from "@/lib/shipping/types";

export function ShippingRateManager({ initialRates }: { initialRates: ShippingRate[] }) {
  const t = useTranslations("admin.shipping");
  const tCountries = useTranslations("checkout.countries");
  const locale = useLocale() as Locale;
  const [rates, setRates] = useState(initialRates);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(input: ShippingRateInput) {
    const created = await createShippingRate(input);
    setRates((prev) => [...prev, created]);
    setAdding(false);
  }

  async function handleUpdate(id: string, input: ShippingRateInput) {
    const updated = await updateShippingRate(id, input);
    setRates((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    await deleteShippingRate(id);
    setRates((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {rates.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {rates.map((rate) =>
        editingId === rate.id ? (
          <Card key={rate.id} className="p-4">
            <ShippingRateForm
              initialRate={rate}
              onSubmit={(input) => handleUpdate(rate.id, input)}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={rate.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <span className="text-foreground">
              {tCountries(rate.country)}
              {rate.city ? ` — ${rate.city}` : ` — ${t("defaultRate")}`}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">
                {formatPrice(rate.fee, locale)}
              </span>
              <button
                type="button"
                onClick={() => setEditingId(rate.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(rate.id)}
                className="text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </Card>
        ),
      )}

      {adding ? (
        <Card className="p-4">
          <ShippingRateForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={buttonVariants({ variant: "secondary", className: "self-start" })}
        >
          {t("add")}
        </button>
      )}
    </div>
  );
}
