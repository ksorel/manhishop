import type { AdminCategory } from "./types";

export const MAX_CATEGORY_DEPTH = 5;

export interface CategoryTreeNode extends AdminCategory {
  depth: number;
  children: CategoryTreeNode[];
}

export function buildCategoryTree(categories: AdminCategory[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, AdminCategory[]>();
  for (const category of categories) {
    const key = category.parentId;
    const siblings = byParent.get(key) ?? [];
    siblings.push(category);
    byParent.set(key, siblings);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  function build(parentId: string | null, depth: number): CategoryTreeNode[] {
    return (byParent.get(parentId) ?? []).map((category) => ({
      ...category,
      depth,
      children: build(category.id, depth + 1),
    }));
  }

  return build(null, 1);
}

export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategoryTree(node.children)]);
}

export function flattenCategoriesWithDepth(
  categories: AdminCategory[],
): { category: AdminCategory; depth: number }[] {
  return flattenCategoryTree(buildCategoryTree(categories)).map((node) => ({
    category: node,
    depth: node.depth,
  }));
}
