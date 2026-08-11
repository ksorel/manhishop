import type { Category } from "./types";

/** Tous les identifiants d'une catégorie et de ses descendants (elle-même
 * incluse), pour que parcourir une catégorie parente montre aussi les
 * produits rangés dans ses sous-catégories. */
export function getDescendantCategoryIds(
  categories: { id: string; parentId: string | null }[],
  rootId: string,
): string[] {
  const childrenOf = new Map<string, string[]>();
  for (const category of categories) {
    if (category.parentId === null) continue;
    const siblings = childrenOf.get(category.parentId) ?? [];
    siblings.push(category.id);
    childrenOf.set(category.parentId, siblings);
  }

  const ids: string[] = [];
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    ids.push(id);
    queue.push(...(childrenOf.get(id) ?? []));
  }
  return ids;
}

export function getCategoryChildren(categories: Category[], parentId: string): Category[] {
  return categories.filter((category) => category.parentId === parentId);
}

/** Chaîne des ancêtres, de la racine jusqu'au parent direct (sans la
 * catégorie elle-même) — pour un fil d'Ariane. */
export function getAncestorChain(categories: Category[], categoryId: string): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const chain: Category[] = [];
  let current = byId.get(categoryId);
  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }
  return chain;
}
