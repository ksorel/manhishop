"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SizeGuideForm } from "@/components/admin/size-guide-form";
import { createSizeGuide, deleteSizeGuide, updateSizeGuide } from "@/lib/admin/size-guides";
import type { AdminSizeGuide, AdminSizeGuideInput } from "@/lib/admin/types";

export function SizeGuideManager({ initialGuides }: { initialGuides: AdminSizeGuide[] }) {
  const t = useTranslations("admin.sizeGuides");
  const confirm = useConfirm();
  const [guides, setGuides] = useState(initialGuides);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(input: AdminSizeGuideInput) {
    const created = await createSizeGuide(input);
    setGuides((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
    setAdding(false);
  }

  async function handleUpdate(id: string, input: AdminSizeGuideInput) {
    const updated = await updateSizeGuide(id, input);
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? updated : g)).sort((a, b) => a.displayOrder - b.displayOrder),
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteSizeGuide(id);
    setGuides((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {guides.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {guides.map((guide) =>
        editingId === guide.id ? (
          <Card key={guide.id} className="p-4">
            <SizeGuideForm
              initialGuide={guide}
              onSubmit={(input) => handleUpdate(guide.id, input)}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={guide.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <span className="text-foreground">
              {guide.titleFr} <span className="text-muted-foreground">({guide.slug})</span>
            </span>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setEditingId(guide.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(guide.id)}
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
          <SizeGuideForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
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
