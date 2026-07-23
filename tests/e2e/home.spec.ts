import { test, expect } from "@playwright/test";

test("home page loads in French by default and exposes the theme toggle", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /changer de th[eè]me/i }),
  ).toBeVisible();
});
