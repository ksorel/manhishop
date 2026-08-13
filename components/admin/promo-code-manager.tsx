"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { PromoCodeForm } from "@/components/admin/promo-code-form";
import {
  createPromoCode,
  deletePromoCode,
  updatePromoCode,
  type AdminPromoCode,
  type AdminPromoCodeInput,
} from "@/lib/admin/promo-codes";

export function PromoCodeManager({ initialPromoCodes }: { initialPromoCodes: AdminPromoCode[] }) {
  const t = useTranslations("admin.promoCodes");
  const confirm = useConfirm();
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(input: AdminPromoCodeInput) {
    const created = await createPromoCode(input);
    setPromoCodes((prev) => [created, ...prev]);
    setAdding(false);
  }

  async function handleUpdate(id: string, input: AdminPromoCodeInput) {
    const updated = await updatePromoCode(id, input);
    setPromoCodes((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deletePromoCode(id);
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {promoCodes.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {promoCodes.map((promo) =>
        editingId === promo.id ? (
          <Card key={promo.id} className="p-4">
            <PromoCodeForm
              initialPromoCode={promo}
              onSubmit={(input) => handleUpdate(promo.id, input)}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={promo.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">
                {promo.code}{" "}
                <span className="text-muted-foreground">
                  ({promo.discountType === "percent" ? `${promo.discountValue}%` : `${promo.discountValue} FCFA`})
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {promo.active ? t("active") : t("inactive")} · {t("usedCount", { count: promo.usedCount })}
                {promo.maxUses !== null && ` / ${promo.maxUses}`}
                {promo.expiresAt && ` · ${t("expiresAt")}: ${new Date(promo.expiresAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setEditingId(promo.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(promo.id)}
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
          <PromoCodeForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
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
