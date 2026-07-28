"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin/categories";
import type { AdminCategory, AdminCategoryInput } from "@/lib/admin/types";

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const t = useTranslations("admin.categories");
  const confirm = useConfirm();
  const [categories, setCategories] = useState(initialCategories);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(input: AdminCategoryInput) {
    const created = await createCategory(input);
    setCategories((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
    setAdding(false);
  }

  async function handleUpdate(id: string, input: AdminCategoryInput) {
    const updated = await updateCategory(id, input);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.displayOrder - b.displayOrder),
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {categories.map((category) =>
        editingId === category.id ? (
          <Card key={category.id} className="p-4">
            <CategoryForm
              initialCategory={category}
              onSubmit={(input) => handleUpdate(category.id, input)}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={category.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <span className="text-foreground">
              {category.nameFr} <span className="text-muted-foreground">({category.slug})</span>
            </span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditingId(category.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category.id)}
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
          <CategoryForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
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
