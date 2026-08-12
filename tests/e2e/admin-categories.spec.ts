import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/admin.json" });

// Un suffixe unique par exécution évite un conflit de slug si une
// exécution précédente a échoué avant son nettoyage en fin de test.
test("admin can create a subcategory, collapse/expand it, then delete both", async ({ page }) => {
  const suffix = Date.now();
  const rootName = `E2E Racine ${suffix}`;
  const childName = `E2E Sous ${suffix}`;

  await page.goto("/fr/admin/categories");
  await expect(page.getByRole("heading", { name: "Catégories" })).toBeVisible();

  await page.getByRole("button", { name: "Ajouter une catégorie" }).click();
  await page.getByLabel("Nom (FR)").fill(rootName);
  await page.getByLabel("Nom (EN)").fill(`${rootName} EN`);
  await page.getByRole("button", { name: "Enregistrer" }).click();

  const rootCard = page.locator('[data-testid^="category-card-"]').filter({ hasText: rootName });
  await expect(rootCard).toBeVisible();

  await rootCard.getByRole("button", { name: "Ajouter une sous-catégorie" }).click();
  await page.getByLabel("Nom (FR)").fill(childName);
  await page.getByLabel("Nom (EN)").fill(`${childName} EN`);
  await page.getByRole("button", { name: "Enregistrer" }).click();

  const childCard = page
    .locator('[data-testid^="category-card-"]')
    .filter({ hasText: childName });
  await expect(childCard).toBeVisible();

  // Replier la racine cache la sous-catégorie ; la déplier la fait
  // réapparaître (components/admin/category-manager.tsx).
  await rootCard.getByRole("button", { name: "Replier" }).click();
  await expect(childCard).toBeHidden();
  await rootCard.getByRole("button", { name: "Déplier" }).click();
  await expect(childCard).toBeVisible();

  // Nettoyage : la sous-catégorie d'abord (une catégorie avec des
  // enfants ne peut pas être supprimée), puis la racine.
  await childCard.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Confirmer" }).click();
  await expect(childCard).toBeHidden();

  await rootCard.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Confirmer" }).click();
  await expect(rootCard).toBeHidden();
});
