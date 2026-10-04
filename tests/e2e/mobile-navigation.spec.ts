import { expect, test } from "@playwright/test";

// Mobile navigation (390×844) — THE highest-regression-risk chrome and the
// exact surface the Tailwind v3→v4 port traps target
// (docs/Tailwind-V4-Validation-Report.md, traps 1/2/4/5):
//
//   * trap 1 (bare-HSL transparent theme) — the drawer's bg must be the
//     opaque cream rgb(250, 248, 245), never rgba(0, 0, 0, 0);
//   * trap 2 (oklch palette drift) — link ink and CTA colors are pinned to
//     the reference's exact rgb values;
//   * trap 4 (space-y :where() rewrite) — the reference drawer's links
//     column is flex `gap-2` (8px) with the CTA wrapper carrying `mt-10`
//     (40px): 48px total. Under v3 a space-y container would have overridden
//     a child's mt-*; under v4 it would not — gap + margin sidesteps the
//     engine difference entirely, and this spec PINS the computed result;
//   * trap 5 (shadow-scale shift) — shadow tokens are pinned in globals.css.
//
// Reference measurements (extracted live, research/target-app-spec.md):
//   drawer bg rgb(250,248,245) · gap 8px · padding-x 32px · link 48px
//   Cormorant Garamond lh 48px ls -1.2px ink rgb(26,26,26) · CTA wrapper
//   mt 40px · CTA span 12px Mulish ls 2.64px pad 16/36 radius 9999px
//   bg rgb(26,26,26) on cream text.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("header renders logo, Book Now, status pill area and the hamburger", async ({ page }) => {
    const banner = page.getByRole("banner");
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("link", { name: "Maison Luminaire" })).toBeVisible();
    await expect(banner.getByRole("link", { name: "Book Now" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "Open menu" })).toBeVisible();
    // Desktop nav is hidden at 390.
    await expect(banner.getByRole("navigation", { name: "Primary" })).toBeHidden();
  });

  test("hamburger opens the full-screen drawer with the five nav links", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    const drawer = page.locator("div.fixed.inset-0.z-\\[60\\]");
    await expect(drawer).toBeVisible();
    for (const label of ["Treatments", "Gallery", "Atelier", "Story", "Visit"]) {
      await expect(drawer.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(drawer.getByRole("link", { name: "Book an appointment" })).toBeVisible();
    await expect(drawer.getByRole("button", { name: "Close menu" })).toBeVisible();
  });

  test("drawer computed styles match the live reference (traps 1/2/4)", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    const drawer = page.locator("div.fixed.inset-0.z-\\[60\\]");

    // Trap 1 — the theme background must be OPAQUE cream, not transparent.
    await expect(drawer).toHaveCSS("background-color", "rgb(250, 248, 245)");

    const linksCol = drawer.locator(".flex-1.flex.flex-col").first();
    // Trap 4 — gap-based spacing (8px), the engine-stable contract.
    await expect(linksCol).toHaveCSS("display", "flex");
    await expect(linksCol).toHaveCSS("gap", "8px");
    await expect(linksCol).toHaveCSS("padding-left", "32px");
    await expect(linksCol).toHaveCSS("justify-content", "center");

    // Trap 2 — exact reference ink + typography.
    const link = drawer.getByRole("link", { name: "Treatments", exact: true });
    await expect(link).toHaveCSS("font-family", /Cormorant Garamond/);
    await expect(link).toHaveCSS("font-size", "48px");
    await expect(link).toHaveCSS("line-height", "48px");
    await expect(link).toHaveCSS("letter-spacing", "-1.2px");
    await expect(link).toHaveCSS("color", "rgb(26, 26, 26)");
    await expect(link).toHaveCSS("margin-top", "0px");

    // Trap 4 — the CTA wrapper's explicit 40px margin SURVIVES (the v3
    // reference's total gap before the CTA is 8px gap + 40px margin).
    const ctaWrap = drawer.locator(".mt-10").first();
    await expect(ctaWrap).toHaveCSS("margin-top", "40px");

    const ctaSpan = drawer.getByRole("link", { name: "Book an appointment" }).locator("span");
    await expect(ctaSpan).toHaveCSS("font-family", /Mulish/);
    await expect(ctaSpan).toHaveCSS("font-size", "12px");
    await expect(ctaSpan).toHaveCSS("letter-spacing", "2.64px");
    await expect(ctaSpan).toHaveCSS("padding-top", "16px");
    await expect(ctaSpan).toHaveCSS("padding-left", "36px");
    await expect(ctaSpan).toHaveCSS("background-color", "rgb(26, 26, 26)");
    await expect(ctaSpan).toHaveCSS("color", "rgb(250, 248, 245)");
    // rounded-full: v3 computed 9999px; v4 emits calc(infinity*1px) which
    // Chrome reports as 33554400px — both are "fully round" for any box.
    const radius = await ctaSpan.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(parseFloat(radius)).toBeGreaterThanOrEqual(9999);
    await expect(ctaSpan).toHaveCSS("text-transform", "uppercase");
  });

  test("close button dismisses the drawer", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    const drawer = page.locator("div.fixed.inset-0.z-\\[60\\]");
    await expect(drawer).toBeVisible();
    await drawer.getByRole("button", { name: "Close menu" }).tap();
    await expect(drawer).toHaveCount(0);
  });

  test("Escape closes the drawer (a11y enhancement)", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    const drawer = page.locator("div.fixed.inset-0.z-\\[60\\]");
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
  });

  test("nav link taps close the drawer and navigate", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    const drawer = page.locator("div.fixed.inset-0.z-\\[60\\]");
    await drawer.getByRole("link", { name: "Treatments", exact: true }).tap();
    await expect(page).toHaveURL(/\/services\/?$/);
    await expect(drawer).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Our Signature/ }).first(),
    ).toBeVisible();
    // The hamburger returns after navigation.
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("the drawer CTA navigates to /book", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).tap();
    await page.locator("div.fixed.inset-0.z-\\[60\\]").getByRole("link", { name: "Book an appointment" }).tap();
    await expect(page).toHaveURL(/\/book\/?$/);
    await expect(page.getByRole("heading", { name: /Reserve your/ })).toBeVisible();
  });

  test("scrolled header gains the glass treatment (trap 1-adjacent)", async ({ page }) => {
    const banner = page.getByRole("banner");
    await expect(banner).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.mouse.wheel(0, 600);
    await expect(banner).toHaveCSS("background-color", "rgba(250, 248, 245, 0.6)", {
      timeout: 10_000,
    });
    // border-foreground/5: v3 computed rgba(26,26,26,0.05); v4's alpha
    // modifier emits color-mix(in oklab, …) — the visually identical oklab
    // representation. Assert the WIDTH (the hairline exists) instead of the
    // color string; the color token itself is pinned in globals.css.
    await expect(banner).toHaveCSS("border-bottom-width", "1px");
  });
});

test.describe("middle state (768) navigation", () => {
  test.use({ viewport: { width: 768, height: 844 } });

  test("hamburger still present at 768; desktop nav hidden until lg", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  });
});

test.describe("desktop (1280) navigation", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("the five inline nav links render and navigate", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    for (const label of ["Treatments", "Gallery", "Atelier", "Story", "Visit"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveCount(0);

    await nav.getByRole("link", { name: "Atelier", exact: true }).click();
    await expect(page).toHaveURL(/\/team\/?$/);
  });
});
