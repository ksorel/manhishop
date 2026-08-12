import { defineConfig, devices } from "@playwright/test";

try {
  // Absent en CI : les variables y sont injectées directement dans
  // l'environnement (voir .github/workflows/ci.yml).
  process.loadEnvFile(".env.local");
} catch {
  // .env.local introuvable — normal en CI.
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  globalSetup: "./tests/e2e/global-setup.ts",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  // En dev (Turbopack), la première visite d'une route compile à la
  // volée et peut dépasser le délai par défaut de 5s.
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
});
