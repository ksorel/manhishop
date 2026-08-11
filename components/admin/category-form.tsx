"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import type { AdminCategory, AdminCategoryInput } from "@/lib/admin/types";

const inputClass =
  "min-h-11 rounded border border-border bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CategoryForm({
  initialCategory,
  parentId = null,
  parentName,
  onSubmit,
  onCancel,
}: {
  initialCategory?: AdminCategory;
  parentId?: string | null;
  parentName?: string;
  onSubmit: (input: AdminCategoryInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations("admin.categories");
  const [nameFr, setNameFr] = useState(initialCategory?.nameFr ?? "");
  const [nameEn, setNameEn] = useState(initialCategory?.nameEn ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    initialCategory?.displayOrder?.toString() ?? "0",
  );
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    try {
      await onSubmit({
        // Le slug est dérivé du nom par le système, jamais saisi à la
        // main (évite les slugs invalides) — figé après création pour
        // ne pas casser les liens déjà partagés d'une catégorie renommée.
        slug: initialCategory ? initialCategory.slug : slugify(nameFr),
        nameFr,
        nameEn,
        displayOrder: Number(displayOrder),
        parentId: initialCategory ? initialCategory.parentId : parentId,
      });
    } catch {
      setFormError(t("saveError"));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {!initialCategory && parentName && (
        <p className="text-sm text-muted-foreground">{t("subcategoryOf", { name: parentName })}</p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("nameFr")}</span>
        <input
          type="text"
          required
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("nameEn")}</span>
        <input
          type="text"
          required
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-foreground">{t("displayOrder")}</span>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          className={inputClass}
        />
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
