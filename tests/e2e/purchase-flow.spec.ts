import { test, expect } from "@playwright/test";

test("browse catalogue, add a product to the cart, and reach checkout", async ({ page }) => {
  await page.goto("/fr/catalogue");
  await expect(page.getByRole("heading", { name: "Catalogue" })).toBeVisible();

  await page.getByRole("link", { name: /T-shirt imprimé wax/i }).first().click();
  await expect(page).toHaveURL(/\/produit\/exemple-tshirt-wax/);

  // La fiche produit affiche aussi un bouton "Ajouter au panier" par
  // carte dans la section "Produits similaires" : on cible le premier
  // (celui du produit principal, avant cette section dans le DOM).
  await page.getByRole("button", { name: /ajouter au panier/i }).first().click();
  await expect(page.getByRole("button", { name: /ajouté au panier/i }).first()).toBeVisible();

  await page.goto("/fr/panier");
  await expect(page.getByText(/T-shirt imprimé wax/i)).toBeVisible();

  await page.getByRole("link", { name: /commander/i }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByRole("heading", { name: "Commande" })).toBeVisible();
});
