const STORAGE_KEY = "manhishop_recently_viewed_v1";
const MAX_ENTRIES = 12;

export function readRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Ajoute un produit en tête de liste (le plus récent en premier), sans
 * doublon, plafonné à MAX_ENTRIES. */
export function addRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  const current = readRecentlyViewed().filter((id) => id !== productId);
  const next = [productId, ...current].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
