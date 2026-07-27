import { test, expect } from "@playwright/test";

test("home page renders in French and exposes the theme toggle", async ({ page }) => {
  // Navigation explicite vers /fr : la redirection depuis "/" dépend de
  // la langue négociée par le navigateur (Accept-Language), ce qui est
  // voulu (section 6.6 du cahier des charges) mais pas déterministe
  // pour un test automatisé.
  await page.goto("/fr");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /changer de th[eè]me/i }),
  ).toBeVisible();
});
