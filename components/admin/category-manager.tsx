"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin/categories";
import { buildCategoryTree, MAX_CATEGORY_DEPTH, type CategoryTreeNode } from "@/lib/admin/category-tree";
import type { AdminCategory, AdminCategoryInput } from "@/lib/admin/types";

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const t = useTranslations("admin.categories");
  const confirm = useConfirm();
  const [categories, setCategories] = useState(initialCategories);
  const [addingRoot, setAddingRoot] = useState(false);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleAdd(input: AdminCategoryInput) {
    const created = await createCategory(input);
    setCategories((prev) => [...prev, created]);
    setAddingRoot(false);
    setAddingChildOf(null);
  }

  async function handleUpdate(id: string, input: AdminCategoryInput) {
    const updated = await updateCategory(id, input);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    setDeleteError(null);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setDeleteError(t("deleteBlockedError"));
    }
  }

  const tree = buildCategoryTree(categories);

  return (
    <div className="flex flex-col gap-4">
      {categories.length === 0 && !addingRoot && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {deleteError && <p className="text-sm font-medium text-error">{deleteError}</p>}

      {tree.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          editingId={editingId}
          addingChildOf={addingChildOf}
          onEdit={setEditingId}
          onCancelEdit={() => setEditingId(null)}
          onAddChild={setAddingChildOf}
          onCancelAddChild={() => setAddingChildOf(null)}
          onDelete={handleDelete}
          onSubmitEdit={handleUpdate}
          onSubmitAdd={handleAdd}
        />
      ))}

      {addingRoot ? (
        <Card className="p-4">
          <CategoryForm parentId={null} onSubmit={handleAdd} onCancel={() => setAddingRoot(false)} />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAddingRoot(true)}
          className={buttonVariants({ variant: "secondary", className: "self-start" })}
        >
          {t("add")}
        </button>
      )}
    </div>
  );
}

function CategoryNode({
  node,
  editingId,
  addingChildOf,
  onEdit,
  onCancelEdit,
  onAddChild,
  onCancelAddChild,
  onDelete,
  onSubmitEdit,
  onSubmitAdd,
}: {
  node: CategoryTreeNode;
  editingId: string | null;
  addingChildOf: string | null;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onAddChild: (id: string) => void;
  onCancelAddChild: () => void;
  onDelete: (id: string) => void;
  onSubmitEdit: (id: string, input: AdminCategoryInput) => Promise<void>;
  onSubmitAdd: (input: AdminCategoryInput) => Promise<void>;
}) {
  const t = useTranslations("admin.categories");
  const canAddChild = node.depth < MAX_CATEGORY_DEPTH;

  return (
    <div className="flex flex-col gap-3" style={{ marginLeft: (node.depth - 1) * 24 }}>
      {editingId === node.id ? (
        <Card className="p-4">
          <CategoryForm
            initialCategory={node}
            onSubmit={(input) => onSubmitEdit(node.id, input)}
            onCancel={onCancelEdit}
          />
        </Card>
      ) : (
        <Card className="flex flex-col gap-3 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground">
              {node.nameFr} <span className="text-muted-foreground">({node.slug})</span>
            </span>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => onEdit(node.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => onDelete(node.id)}
                className="text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </div>
          {canAddChild && (
            <button
              type="button"
              onClick={() => onAddChild(node.id)}
              className={buttonVariants({
                variant: "secondary",
                className: "self-start px-3 text-xs",
              })}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              {t("addSubcategory")}
            </button>
          )}
        </Card>
      )}

      {addingChildOf === node.id && (
        <Card className="p-4" style={{ marginLeft: 24 }}>
          <CategoryForm
            parentId={node.id}
            parentName={node.nameFr}
            onSubmit={onSubmitAdd}
            onCancel={onCancelAddChild}
          />
        </Card>
      )}

      {node.children.map((child) => (
        <CategoryNode
          key={child.id}
          node={child}
          editingId={editingId}
          addingChildOf={addingChildOf}
          onEdit={onEdit}
          onCancelEdit={onCancelEdit}
          onAddChild={onAddChild}
          onCancelAddChild={onCancelAddChild}
          onDelete={onDelete}
          onSubmitEdit={onSubmitEdit}
          onSubmitAdd={onSubmitAdd}
        />
      ))}
    </div>
  );
}
