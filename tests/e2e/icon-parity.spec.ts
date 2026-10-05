import { expect, test } from "@playwright/test";

// Icon parity — the live-measured icon-layer contract (session 9). Every
// lucide icon on every route was censused on the reference app with
// agent-browser (glyph, class set, computed size/color/margin — see
// docs/remediation-plan-session-9.md §5.1). If a styling change breaks this
// spec, the change is wrong — not the spec.
//
// Why this spec exists: innerText parity is blind to the icon layer — svg
// class sets never appear in text comparisons, and lucide's `size` prop
// renders the right pixels through the wrong DOM (attribute sizing vs the
// reference's class sizing, with hover classes the attribute path cannot
// carry). Session 9's both-sides census found 19 divergent icon sites; this
// spec pins the remediated contract.
//
// Measured contract (highlights):
// - the testimonial stars are SAGE (fill-secondary text-secondary →
//   rgb(75, 93, 79) — the same sage pin as the service-detail check icons)
// - the gallery-preview hover icons are 24px and opacity-0 until hover
// - the services cards' arrows rotate 45° on hover (named group on team)
// - the footer + contact Reach-us blocks carry phone/mail/instagram icons
// - the contact Get-directions glyph is MapPin; the login input icons sit at
//   left-3 in slate-500 and there is NO password eye toggle

const SAGE = "rgb(75, 93, 79)";
const SLATE_500 = "rgb(100, 116, 139)";

test.describe("icon parity (the lucide class layer, live-measured)", () => {
  test("the landing testimonial stars are sage at 14px", async ({ page }) => {
    await page.goto("/");
    const stars = page.locator("svg.lucide-star");
    expect(await stars.count()).toBe(5);
    const first = stars.first();
    await expect(first).toHaveClass(/h-3\.5 w-3\.5/);
    await expect(first).toHaveClass(/fill-secondary/);
    await expect(first).toHaveClass(/text-secondary/);
    const cs = await first.evaluate((s) => ({
      w: getComputedStyle(s).width,
      fill: getComputedStyle(s).fill,
      stroke: getComputedStyle(s).stroke,
    }));
    expect(cs.w).toBe("14px");
    expect(cs.fill).toBe(SAGE);
    expect(cs.stroke).toBe(SAGE);
  });

  test("the landing follow-along icon is 16px and the gallery-preview hover icons are 24px + hover-gated", async ({ page }) => {
    await page.goto("/");

    const follow = page.getByRole("link", { name: /Follow along/ }).locator("svg");
    await expect(follow).toHaveClass(/lucide-instagram h-4 w-4/);
    expect(await follow.evaluate((s) => getComputedStyle(s).width)).toBe("16px");

    // The 6 gallery-preview tiles' instagram icons: 24px, hidden until hover.
    const hoverIcons = page.locator("svg.lucide-instagram.h-6");
    expect(await hoverIcons.count()).toBe(6);
    const icon = hoverIcons.first();
    await expect(icon).toHaveClass(/text-background/);
    await expect(icon).toHaveClass(/opacity-0/);
    await expect(icon).toHaveClass(/group-hover:opacity-100/);
    await expect(icon).toHaveClass(/transition-opacity/);
    const cs = await icon.evaluate((s) => ({
      w: getComputedStyle(s).width,
      opacity: getComputedStyle(s).opacity,
    }));
    expect(cs.w).toBe("24px");
    expect(cs.opacity).toBe("0");
  });

  test("the services card arrows carry the hover rotation (landing mt-2, grid no-mt + duration-500)", async ({ page }) => {
    await page.goto("/");
    const landingArrows = page.locator("svg.lucide-arrow-up-right.h-5");
    expect(await landingArrows.count()).toBe(3);
    const la = landingArrows.first();
    await expect(la).toHaveClass(/mt-2/);
    await expect(la).toHaveClass(/text-foreground\/40/);
    await expect(la).toHaveClass(/transition-all/);
    await expect(la).toHaveClass(/group-hover:rotate-45/);
    await expect(la).toHaveClass(/group-hover:text-foreground/);
    expect(await la.evaluate((s) => getComputedStyle(s).marginTop)).toBe("8px");
    expect(await la.evaluate((s) => getComputedStyle(s).width)).toBe("20px");

    await page.goto("/services");
    const gridArrows = page.locator("svg.lucide-arrow-up-right.h-5");
    expect(await gridArrows.count()).toBe(8);
    const ga = gridArrows.first();
    await expect(ga).toHaveClass(/transition-all duration-500/);
    await expect(ga).toHaveClass(/group-hover:rotate-45/);
    await expect(ga).toHaveClass(/group-hover:text-foreground/);
    expect(await ga.evaluate((s) => getComputedStyle(s).marginTop)).toBe("0px");
  });

  test("the team Book-with buttons use arrow-up-right under a named group", async ({ page }) => {
    await page.goto("/team");
    const buttons = page.getByRole("link", { name: /Book with / });
    expect(await buttons.count()).toBe(3);
    const btn = buttons.first();
    await expect(btn).toHaveClass(/group\/btn/);
    const icon = btn.locator("svg");
    await expect(icon).toHaveClass(/lucide-arrow-up-right/);
    await expect(icon).not.toHaveClass(/lucide-arrow-right/);
    await expect(icon).toHaveClass(/h-3\.5 w-3\.5/);
    await expect(icon).toHaveClass(/transition-transform/);
    await expect(icon).toHaveClass(/group-hover\/btn:rotate-45/);
    expect(await icon.evaluate((s) => getComputedStyle(s).width)).toBe("14px");
  });

  test("the contact page carries MapPin directions, Reach-us icons, and the Hours status pill row", async ({ page }) => {
    await page.goto("/contact");

    // Get directions — the glyph is MapPin at 14px.
    const directions = page.getByRole("link", { name: /Get directions/ });
    const pin = directions.locator("svg");
    await expect(pin).toHaveClass(/lucide-map-pin/);
    await expect(pin).not.toHaveClass(/lucide-arrow-up-right/);
    await expect(pin).toHaveClass(/h-3\.5 w-3\.5/);
    expect(await pin.evaluate((s) => getComputedStyle(s).width)).toBe("14px");

    // Reach us — every serif anchor leads with its icon (16px, muted).
    // (Scoped to the gap-3 variants — the header logo is also font-serif
    // text-xl but carries no gap.)
    const reach = page.locator("a.flex.items-center.gap-3.font-serif.text-xl");
    expect(await reach.count()).toBe(3);
    for (const cls of ["lucide-phone", "lucide-mail", "lucide-instagram"]) {
      const icon = reach.locator(`svg.${cls}`);
      expect(await icon.count()).toBe(1);
      await expect(icon).toHaveClass(/h-4 w-4/);
      await expect(icon).toHaveClass(/text-foreground\/60/);
      expect(await icon.evaluate((s) => getComputedStyle(s).width)).toBe("16px");
    }

    // The Hours block — eyebrow + StatusPill in a flex row (mb-4); the ul
    // carries no margin of its own.
    const row = page.locator("div.flex.items-center.justify-between.mb-4", {
      hasText: "Hours",
    });
    await expect(row).toBeVisible();
    expect(await row.locator("div", { hasText: /today/i }).count()).toBeGreaterThan(0);
    expect(await row.evaluate((r) => getComputedStyle(r).marginBottom)).toBe("16px");
    const ul = row.locator("xpath=following-sibling::ul");
    expect(await ul.evaluate((u) => getComputedStyle(u).marginTop)).toBe("0px");
  });

  test("the footer Contact links carry phone/mail/instagram icons at 14px", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    for (const [href, cls] of [
      ['a[href="tel:123-456-7890"]', "lucide-phone"],
      ['a[href="mailto:info@mysite.com"]', "lucide-mail"],
      ['a[href="https://instagram.com/"]', "lucide-instagram"],
    ] as const) {
      const icon = footer.locator(href).locator(`svg.${cls}`);
      expect(await icon.count()).toBe(1);
      await expect(icon).toHaveClass(/h-3\.5 w-3\.5/);
      expect(await icon.evaluate((s) => getComputedStyle(s).width)).toBe("14px");
    }
  });

  test("the login input icons sit at left-3 in slate-500 and there is no eye toggle", async ({ page }) => {
    await page.goto("/login");

    for (const cls of ["lucide-mail", "lucide-lock"]) {
      const icon = page.locator(`svg.${cls}`);
      expect(await icon.count()).toBe(1);
      await expect(icon).toHaveClass(/absolute left-3 /);
      await expect(icon).toHaveClass(/h-4 w-4/);
      await expect(icon).toHaveClass(/text-slate-500/);
      const cs = await icon.evaluate((s) => ({
        w: getComputedStyle(s).width,
        left: getComputedStyle(s).left,
        color: getComputedStyle(s).color,
      }));
      expect(cs.w).toBe("16px");
      expect(cs.left).toBe("12px");
      expect(cs.color).toBe(SLATE_500);
    }

    // The reference has NO right-side element in either input wrapper —
    // the clone's eye toggle was a visible divergence and is removed.
    const emailWrapper = page.locator("div:has(> input#email)");
    const passwordWrapper = page.locator("div:has(> input#password)");
    expect(await emailWrapper.locator("button").count()).toBe(0);
    expect(await passwordWrapper.locator("button").count()).toBe(0);
    expect(await page.locator("svg.lucide-eye, svg.lucide-eye-off").count()).toBe(0);
  });

  test("the book submit arrow and the header menu icon carry class sizing", async ({ page }) => {
    await page.goto("/book");
    const submit = page.getByRole("button", { name: /Request appointment/ });
    const arrow = submit.locator("svg.lucide-arrow-right");
    // The class set is the contract here: the svg is a flex item inside the
    // inline-flex button, so its USED width shrinks with the row layout
    // (live-measured 15.3125px on the reference at desktop width — NOT the
    // nominal 16px — the clone computes the identical shrunk value; only
    // the class pin is stable across viewports).
    await expect(arrow).toHaveClass(/h-4 w-4/);
    expect(await arrow.getAttribute("width")).toBe("24");

    await page.goto("/");
    const menu = page.locator('header button[aria-label="Open menu"] svg');
    await expect(menu).toHaveClass(/lucide-menu h-4 w-4/);
    expect(await menu.evaluate((s) => getComputedStyle(s).width)).toBe("16px");
  });
});
