"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin/categories";
import { buildCategoryTree, MAX_CATEGORY_DEPTH, type CategoryTreeNode } from "@/lib/admin/category-tree";
import { cn } from "@/lib/utils";
import type { AdminCategory, AdminCategoryInput } from "@/lib/admin/types";

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const t = useTranslations("admin.categories");
  const confirm = useConfirm();
  const [categories, setCategories] = useState(initialCategories);
  const [addingRoot, setAddingRoot] = useState(false);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
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

  function handleAddChild(id: string) {
    setAddingChildOf(id);
    // Un ancêtre replié ne doit pas cacher le formulaire d'ajout qu'on
    // vient d'ouvrir sous lui.
    setCollapsedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleToggleCollapse(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const tree = buildCategoryTree(categories);

  return (
    <div className="flex flex-col gap-4">
      {categories.length === 0 && !addingRoot && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {deleteError && <p className="text-sm font-medium text-error">{deleteError}</p>}

      <div className="flex flex-col gap-3">
        {tree.map((node) => (
          <CategoryNode
            key={node.id}
            node={node}
            editingId={editingId}
            addingChildOf={addingChildOf}
            collapsedIds={collapsedIds}
            onEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onAddChild={handleAddChild}
            onCancelAddChild={() => setAddingChildOf(null)}
            onToggleCollapse={handleToggleCollapse}
            onDelete={handleDelete}
            onSubmitEdit={handleUpdate}
            onSubmitAdd={handleAdd}
          />
        ))}
      </div>

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
  collapsedIds,
  onEdit,
  onCancelEdit,
  onAddChild,
  onCancelAddChild,
  onToggleCollapse,
  onDelete,
  onSubmitEdit,
  onSubmitAdd,
}: {
  node: CategoryTreeNode;
  editingId: string | null;
  addingChildOf: string | null;
  collapsedIds: Set<string>;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onAddChild: (id: string) => void;
  onCancelAddChild: () => void;
  onToggleCollapse: (id: string) => void;
  onDelete: (id: string) => void;
  onSubmitEdit: (id: string, input: AdminCategoryInput) => Promise<void>;
  onSubmitAdd: (input: AdminCategoryInput) => Promise<void>;
}) {
  const t = useTranslations("admin.categories");
  const canAddChild = node.depth < MAX_CATEGORY_DEPTH;
  const hasChildren = node.children.length > 0;
  const collapsed = collapsedIds.has(node.id);
  const showChildren = hasChildren && !collapsed;

  return (
    <div className="flex flex-col gap-3">
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
            <div className="flex min-w-0 items-center gap-1.5">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggleCollapse(node.id)}
                  aria-label={collapsed ? t("expand") : t("collapse")}
                  aria-expanded={!collapsed}
                  className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  {collapsed ? (
                    <ChevronRight className="size-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="size-4" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <span className="size-8 shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0 truncate text-foreground">
                {node.nameFr} <span className="text-muted-foreground">({node.slug})</span>
              </span>
            </div>
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
              className="ml-8 inline-flex min-h-11 items-center gap-1.5 self-start text-primary hover:underline"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              {t("addSubcategory")}
            </button>
          )}
        </Card>
      )}

      {(showChildren || addingChildOf === node.id) && (
        <div
          className={cn(
            "ml-4 flex flex-col gap-3 border-l border-border pl-4",
            !hasChildren && "border-transparent",
          )}
        >
          {addingChildOf === node.id && (
            <Card className="p-4">
              <CategoryForm
                parentId={node.id}
                parentName={node.nameFr}
                onSubmit={onSubmitAdd}
                onCancel={onCancelAddChild}
              />
            </Card>
          )}

          {showChildren &&
            node.children.map((child) => (
              <CategoryNode
                key={child.id}
                node={child}
                editingId={editingId}
                addingChildOf={addingChildOf}
                collapsedIds={collapsedIds}
                onEdit={onEdit}
                onCancelEdit={onCancelEdit}
                onAddChild={onAddChild}
                onCancelAddChild={onCancelAddChild}
                onToggleCollapse={onToggleCollapse}
                onDelete={onDelete}
                onSubmitEdit={onSubmitEdit}
                onSubmitAdd={onSubmitAdd}
              />
            ))}
        </div>
      )}
    </div>
  );
}
