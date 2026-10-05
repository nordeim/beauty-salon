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

  // ── Session-10 contracts: the hero settled state + the category hover ──

  test("hero: the image box settles at the reference proportion (scale-125 neutralized)", async ({
    page,
  }) => {
    // The reference's animation framework neutralizes the parent's
    // scale-125 class at settle (inline transform: none) and scales the
    // IMG itself by 1.08. The clone replicates the settled DOM: box at
    // layout size (457×610 @1280), img scaled 1.08 and cropped.
    const box = page.locator("div.aspect-\\[3\\/4\\]").first();
    await expect(box).toHaveClass(/scale-125 origin-center/);

    const boxRead = await box.evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { transform: cs.transform, scaleProp: cs.scale, w: r.width, h: r.height };
    });
    // the scale-125 class is neutralized by the settled inline styles —
    // transform: none (the reference's settled string) AND scale: none
    // (TRAP 8: v4's scale-125 writes the individual `scale` property,
    // which `transform: none` alone cannot neutralize)
    expect(boxRead.transform).toBe("none");
    expect(boxRead.scaleProp).toBe("none");
    // the reference's settled layout size at 1280 (457×610, ±2px)
    expect(Math.round(boxRead.w)).toBeGreaterThanOrEqual(455);
    expect(Math.round(boxRead.w)).toBeLessThanOrEqual(459);
    expect(Math.round(boxRead.h)).toBeGreaterThanOrEqual(608);
    expect(Math.round(boxRead.h)).toBeLessThanOrEqual(612);

    const heroImg = box.locator("img");
    const imgRead = await heroImg.evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { transform: cs.transform, w: r.width };
    });
    // the img itself settles at scale(1.08) — wider than its parent,
    // cropped by overflow-hidden (494px @1280)
    expect(imgRead.transform).toContain("1.08");
    expect(Math.round(imgRead.w)).toBeGreaterThanOrEqual(490);
    expect(Math.round(imgRead.w)).toBeLessThanOrEqual(498);
  });

  test("category images hover-zoom at the reference's computed 150ms default ease", async ({
    page,
  }) => {
    // The reference's class string carries its own corrupted `duration-s]`
    // token (no CSS generated) so transition-transform's built-in default
    // stands: 150ms + cubic-bezier(0.4, 0, 0.2, 1). The ease-[…] sibling
    // token is equally dead on the reference. The clone keeps the inert
    // duration-s] token and drops the ease token (it would GENERATE in
    // v4 and change the computed timing). Do not "fix" duration-s].
    // attribute-contains selector: the `]` in `duration-s]` makes a plain
    // class selector awkward; this matches ONLY the 3 category images (the
    // 6 gallery-preview tiles carry duration-700 instead)
    const catImgs = page.locator("img[class*='duration-s]']");
    const count = await catImgs.count();
    expect(count).toBe(3);

    for (let i = 0; i < count; i++) {
      const img = catImgs.nth(i);
      const cls = (await img.getAttribute("class")) ?? "";
      expect(cls).toContain("transition-transform");
      expect(cls).toContain("group-hover:scale-110");
      expect(cls).not.toContain("duration-700");
      expect(cls).not.toContain("ease-[");
      const read = await img.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          dur: cs.transitionDuration,
          fn: cs.transitionTimingFunction,
          prop: cs.transitionProperty,
        };
      });
      expect(read.dur).toBe("0.15s");
      expect(read.fn).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
      // v4's transition-transform serializes the property list with the
      // individual transform properties (the live's v3 emitted plain
      // `transform` — same pixels, the trap-7 serialization family)
      expect(read.prop).toBe("transform, translate, scale, rotate");
    }
  });

  test("gallery-preview tiles keep their 700ms hover zoom (regression guard)", async ({
    page,
  }) => {
    const tiles = page.locator("img.duration-700");
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(6);
    const read = await tiles.first().evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(read).toBe("0.7s");
  });
});
