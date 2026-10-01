import { expect, test } from "@playwright/test";

// Workspace shell at desktop width: the path routes serve the SPA, the
// dashboard renders the seeded demo workspace, and unknown paths 404.
// Contexts arrive AUTHENTICATED (the setup project's storageState — see
// playwright.config.ts). The app renders several responsive DOM subtrees
// (mobile / md / lg), so text assertions filter to the VISIBLE match.

test.describe("workspace shell (desktop)", () => {
  test("dashboard renders the seeded demo workspace", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Good ", { exact: false }).filter({ visible: true }).first()).toBeVisible();
    // The three dashboard stat panels are present with their numerals.
    await expect(page.getByText("ACTIVE GOALS", { exact: false }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("AGENT ACTIVITY", { exact: false }).filter({ visible: true }).first()).toBeVisible();
    // The seeded goals surface in the Goals panel.
    await expect(page.getByText("Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();
  });

  for (const [path, heading] of [
    ["/goals", "Goals"],
    ["/my-tasks", "My Tasks"],
    ["/tasks", "Tasks"],
    ["/activity", "Agent Activity"],
    ["/team", "Team"],
    ["/settings", "Settings"],
  ] as const) {
    test(`path route ${path} serves the ${heading} view`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, exact: true }).filter({ visible: true }).first()).toBeVisible();
      // Anchor the pattern so /tasks does not also match /my-tasks.
      await expect(page).toHaveURL(new RegExp(`^.*${path.replace("/", "\\/")}\\/?$`));
    });
  }

  test("unknown paths return 404 without serving the shell", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-route");
    expect(res?.status()).toBe(404);
  });

  test("browser back/forward re-derives view state from the URL", async ({ page }) => {
    await page.goto("/goals");
    await expect(page.getByRole("heading", { name: "Goals", exact: true }).filter({ visible: true }).first()).toBeVisible();
    await page.goto("/team");
    await expect(page.getByRole("heading", { name: "Team", exact: true }).filter({ visible: true }).first()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/goals\/?$/);
    await expect(page.getByRole("heading", { name: "Goals", exact: true }).filter({ visible: true }).first()).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/team\/?$/);
  });
});
