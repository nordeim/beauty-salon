import { expect, test } from "@playwright/test";

// Gallery — filter pills, grid, and the z-[70] lightbox.

test.describe("gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/gallery");
  });

  test("headline and the six category pills render", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Transformations in lived-in light/ })).toBeVisible();
    for (const label of ["All", "Color", "Cuts", "Bridal", "Nails", "Skin"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
  });

  test("twelve tiles render under All", async ({ page }) => {
    await expect(page.locator("button.aspect-square")).toHaveCount(12);
  });

  test("filtering narrows the grid", async ({ page }) => {
    await expect(page.locator("button.aspect-square")).toHaveCount(12);
    await page.getByRole("button", { name: "Bridal", exact: true }).click();
    const tiles = page.locator("button.aspect-square");
    await expect(tiles).toHaveCount(2);
    await expect(tiles.first()).toContainText("Bridal Chignon");
  });

  test("a tile opens the lightbox with caption + prev/next", async ({ page }) => {
    await page.locator("button.aspect-square").first().click();
    const lightbox = page.locator("div.fixed.inset-0.z-\\[70\\]");
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByRole("img", { name: "Radiance Facial" })).toBeVisible();
    await expect(lightbox.getByText("Hydrating vitamin C facial with luminous results.")).toBeVisible();
    await expect(lightbox.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(lightbox.getByRole("button", { name: "Previous" })).toBeVisible();
    await expect(lightbox.getByRole("button", { name: "Next" })).toBeVisible();

    await lightbox.getByRole("button", { name: "Next" }).click();
    await expect(lightbox.getByRole("img", { name: "Bridal Chignon" })).toBeVisible();

    await lightbox.getByRole("button", { name: "Close" }).click();
    await expect(lightbox).toHaveCount(0);
  });

  test("Escape closes the lightbox", async ({ page }) => {
    await page.locator("button.aspect-square").first().click();
    const lightbox = page.locator("div.fixed.inset-0.z-\\[70\\]");
    await expect(lightbox).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(lightbox).toHaveCount(0);
  });
});
