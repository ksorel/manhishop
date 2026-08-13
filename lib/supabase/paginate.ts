// PostgREST plafonne chaque requête à 1000 lignes par défaut, sans erreur ni
// avertissement — un .select() sans .range() sur une table qui dépasse ce
// seuil tronque silencieusement le résultat. À utiliser pour toute lecture
// qui doit couvrir *toutes* les lignes (pas les listes déjà paginées côté UI).
const PAGE_SIZE = 1000;

export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
