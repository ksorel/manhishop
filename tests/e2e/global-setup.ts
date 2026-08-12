import { chromium, type FullConfig } from "@playwright/test";

const ADMIN_AUTH_FILE = "tests/e2e/.auth/admin.json";

// Authentifie une fois un compte admin dédié aux tests (voir
// scripts/create-e2e-admin.mjs) et sauvegarde la session : les specs
// admin réutilisent ce fichier via `test.use({ storageState: ... })`
// plutôt que de se reconnecter à chaque test.
export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[e2e] E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD absents (.env.local) — les tests admin échoueront.",
    );
    return;
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto("/fr/connexion");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/admin$/);

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
  await browser.close();
}
