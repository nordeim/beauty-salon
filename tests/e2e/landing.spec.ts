import { expect, test } from "@playwright/test";

// Landing page structure — section order, copy anchors, and the theme
// tokens (trap 1: full hsl values; trap 2: exact palette).

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("body carries the reference cream + Mulish + Cormorant system", async ({ page }) => {
    const body = page.locator("body");
    await expect(body).toHaveCSS("background-color", "rgb(250, 248, 245)");
    await expect(body).toHaveCSS("color", "rgb(26, 26, 26)");
    await expect(body).toHaveCSS("font-family", /Mulish/);
    const h1 = page.getByRole("heading", { name: /Boost Your/ });
    await expect(h1).toHaveCSS("font-family", /Cormorant Garamond/);
  });

  test("hero: eyebrow, headline, round CTA, scroll cue", async ({ page }) => {
    await expect(page.getByText("Aesthetics & wellness").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Boost Your Natural Beauty/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a Treatment" })).toBeVisible();
    await expect(page.getByText("Scroll to explore ↓").first()).toBeVisible();
  });

  test("three disciplines cards link to the category-filtered services", async ({ page }) => {
    for (const [name, href] of [
      ["Hair", "/services?category=hair"],
      ["Skin", "/services?category=skin"],
      ["Nails", "/services?category=nails"],
    ] as const) {
      const card = page.locator(`a[href="${href}"]`);
      await expect(card).toBeVisible();
      await expect(card.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });

  test("story section leads to /about", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Results-driven treatments/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Read our full story/ })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  test("testimonial carousel renders a quote, attribution and controls", async ({ page }) => {
    const carousel = page.locator("section.bg-secondary\\/5");
    await expect(carousel).toBeVisible();
    await expect(carousel.getByRole("blockquote")).toContainText(/Amelia didn't give me a hair color/);
    await expect(carousel.getByText("ELENA M. · SIGNATURE BALAYAGE")).toBeVisible();
    await expect(carousel.getByRole("button", { name: "Previous" })).toBeVisible();
    await expect(carousel.getByRole("button", { name: "Next" })).toBeVisible();
    for (let i = 1; i <= 4; i++) {
      await expect(carousel.getByRole("button", { name: `Testimonial ${i}` })).toBeVisible();
    }
  });

  test("carousel dots rotate the quotes", async ({ page }) => {
    const carousel = page.locator("section.bg-secondary\\/5");
    await carousel.getByRole("button", { name: "Testimonial 3" }).click();
    await expect(carousel.getByRole("blockquote")).toContainText(
      /skin had exhaled/,
      { timeout: 10_000 },
    );
    await expect(carousel.getByText("PRIYA S. · HYDRAFACIAL RITUAL")).toBeVisible();
  });

  test("instagram strip renders six tiles linking out", async ({ page }) => {
    const tiles = page.locator('a[href="https://instagram.com/"].group');
    await expect(tiles).toHaveCount(6);
  });

  test("newsletter form subscribes via the API", async ({ page }) => {
    const email = `e2e-${Date.now()}@maisonluminaire.test`;
    await page.getByPlaceholder("Your email").fill(email);
    await page.getByRole("button", { name: /Claim 15% off/ }).click();
    await expect(page.getByText(/Welcome to the atelier/)).toBeVisible({ timeout: 10_000 });
  });

  test("footer: statement, hours, contact, legal links", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("heading", { name: /Begin your/ })).toBeVisible();
    await expect(footer.getByText("Tuesday")).toBeVisible();
    await expect(footer.getByText("10:00–19:00").first()).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(footer.getByRole("link", { name: "Refund" })).toHaveAttribute("href", "/refund");
  });

  test("the status pill renders Open/Closed today after hydration", async ({ page }) => {
    await expect(page.getByText(/today/, { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
