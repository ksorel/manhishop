import { test, expect } from "@playwright/test";

// Dépend des données de démonstration ajoutées dans supabase/seed.sql
// (guide "demo-vetements" relié au produit exemple-robe-ete, tailles
// S/M/L) — voir la note en fin de fichier seed.sql.
test("requires a size before adding to cart, shows the size guide, and carries the size to the cart", async ({
  page,
}) => {
  await page.goto("/fr/produit/exemple-robe-ete");

  // La section "Produits similaires" a aussi un bouton "Ajouter au
  // panier" (pour un produit sans taille, donc non désactivé) : on
  // cible le premier, celui du produit principal, avant cette section
  // dans le DOM (même piège que tests/e2e/purchase-flow.spec.ts).
  const addToCart = page.getByRole("button", { name: /ajouter au panier/i }).first();
  await expect(addToCart).toBeDisabled();
  await expect(page.getByText(/choisissez une taille/i)).toBeVisible();

  await page.getByRole("button", { name: /guide des tailles/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("M", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /fermer/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(page.getByText(/choisissez une taille/i)).toBeHidden();
  await expect(addToCart).toBeEnabled();

  await addToCart.click();
  await expect(page.getByRole("button", { name: /ajouté au panier/i })).toBeVisible();

  await page.goto("/fr/panier");
  await expect(page.getByText(/Robe d'été/i)).toBeVisible();
  await expect(page.getByText(/Taille\s*:\s*M/i)).toBeVisible();
});
