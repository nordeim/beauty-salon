import { expect, test } from "@playwright/test";

// Confirmation parity — the live-measured decorative-layer + policy-link
// contract for /book/confirmation (session 10). The session-9 icon census
// covered /book ("book 1/1" — the submit arrow) but never the confirmation
// route; this spec closes that gap. Values measured on the reference app
// with agent-browser (see docs/remediation-plan-session-10.md §5). If a
// styling change breaks this spec, the change is wrong — not the spec.
//
// Measured contract (settled state, live):
// - the decorative watermark is lucide FLOWER2, class-sized
//   h-64 w-64 md:h-96 md:w-96 (256px @390 / 384px @1280) with
//   stroke-width 0.5, colored sage at 30% (rgba(75, 93, 79, 0.3)) inside
//   the `absolute top-28 left-1/2 -translate-x-1/2 text-secondary/30` wrap
//   — NOT a calendar glyph, NOT attribute-sized
// - the decorative circle (rounded-full border) settles at opacity: 0 —
//   invisible on the reference (only a wasted scale loop runs beneath it);
//   the clone renders the element (class parity) at the same settled
//   opacity 0
// - the cancellation-policy link is a ROUTE link (href="/contact", not
//   mailto:) with classes `underline hover:text-foreground inline-flex
//   items-center gap-1`, underline-offset auto, and a trailing
//   lucide-arrow-right h-3 w-3 at computed 12px
// - the Add-to-calendar icon stays lucide Calendar h-4 w-4 (session 8)
// - the body innerText is a pure function of the query string (536 chars
//   with the canonical test payload — measured identical both sides)

const CONFIRM_QUERY =
  "/book/confirmation?name=Test%20Session&date=2026-10-21&time=14%3A30&service=Signature%20Balayage";

// The live reference (Tailwind v3) computes text-secondary/30 as
// rgba(75, 93, 79, 0.3); the clone (v4) serializes the same pixels as
// oklab(L a b / 0.3) — trap 7. Assert the resolved channels: the sage
// base's oklab lightness (~0.459 — the ink foreground's is ~0.22, so the
// range is unambiguous) + the exact alpha.
function expectSageAlpha30(color: string) {
  const m = /^oklab\(([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) \/ ([\d.]+)\)$/.exec(color);
  expect(m, `expected an oklab sage color, got: ${color}`).not.toBeNull();
  expect(Number(m![4])).toBe(0.3);
  expect(Number(m![1])).toBeGreaterThan(0.44);
  expect(Number(m![1])).toBeLessThan(0.48);
}

test.describe("confirmation parity (the decorative layer + the policy link)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONFIRM_QUERY);
  });

  test("the decorative watermark is the flower2 glyph at responsive class sizing", async ({
    page,
  }) => {
    const watermark = page.locator("div.text-secondary\\/30 > svg").first();
    await expect(watermark).toHaveClass(/lucide-flower2/);
    await expect(watermark).toHaveClass(/h-64 w-64 md:h-96 md:w-96/);
    await expect(watermark).not.toHaveClass(/lucide-calendar-plus/);
    await expect(watermark.locator("..")).toBeVisible();

    const readings = await watermark.evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        stroke: el.getAttribute("stroke-width"),
        color: cs.color,
        w: r.width,
        h: r.height,
      };
    });
    // stroke-width is an svg ATTRIBUTE on the reference (0.5, not 0.75)
    expect(readings.stroke).toBe("0.5");
    // sage at 30% — the same sage family as the stars/check icons
    // (trap 7: the clone serializes as oklab channels; the live's v3
    // string was rgba(75, 93, 79, 0.3) — pixels identical)
    expectSageAlpha30(readings.color);
    // responsive class sizing: 384px at the 1280 desktop viewport (the
    // md:h-96 md:w-96 variant) — NOT the fixed 96px attribute size
    expect(Math.round(readings.w)).toBeGreaterThanOrEqual(384);
    expect(Math.round(readings.h)).toBeGreaterThanOrEqual(384);
  });

  test("the decorative circle settles invisible (opacity 0), as on the reference", async ({
    page,
  }) => {
    const circle = page.locator("div.rounded-full.border.border-secondary\\/30").first();
    await expect(circle).toHaveClass(/h-64 w-64 md:h-96 md:w-96/);
    await expect(circle).toHaveCSS("opacity", "0");
  });

  test("the cancellation-policy link is a /contact route link with the trailing arrow", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: /concierge@maisonluminaire\.com/ });
    await expect(link).toHaveAttribute("href", "/contact");
    await expect(link).toHaveClass(/underline hover:text-foreground inline-flex items-center gap-1/);
    // the reference has NO underline-offset-4 (Chrome reports the used
    // keyword `auto`, not a resolved 0px)
    await expect(link).toHaveCSS("text-underline-offset", "auto");

    const arrow = link.locator("svg");
    await expect(arrow).toHaveClass(/lucide-arrow-right/);
    await expect(arrow).toHaveClass(/h-3 w-3/);
    const w = await arrow.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(w)).toBe(12);
    // inline-flex row with the 4px gap (gap-1) between text and icon
    await expect(link).toHaveCSS("display", "inline-flex");
    await expect(link).toHaveCSS("gap", "4px");
  });

  test("the Add-to-calendar icon stays lucide Calendar at h-4 w-4 (session-8 contract)", async ({
    page,
  }) => {
    const icon = page.locator("a[href^='data:text/calendar'] svg");
    await expect(icon).toHaveClass(/lucide-calendar h-4 w-4/);
    await expect(icon).not.toHaveClass(/lucide-calendar-plus/);
  });

  test("the body innerText is a pure function of the query string (live-measured 536)", async ({
    page,
  }) => {
    const len = await page.evaluate(() => document.body.innerText.length);
    expect(len).toBe(536);
  });
});
