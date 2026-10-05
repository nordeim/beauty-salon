import { expect, test } from "@playwright/test";

// Login-surface font-context parity — the reference's auth shell renders in
// a separate CSS context from the marketing site: Tailwind's DEFAULT font
// stack (no brand fonts, no ss01/cv11 feature settings, no antialiased
// smoothing — and the global heading serif rule does not reach it). These
// assertions pin the computed values measured on the live reference
// (2026-10-05, agent-browser) so the login surface cannot drift back into
// the brand typography systems. Mirrors the mobile-navigation.spec.ts
// pattern: computed-style contracts against live-measured values.

const DEFAULT_SANS =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", ' +
  '"Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

test.describe("login font context (auth-shell parity)", () => {
  test("the login surface renders in the default sans stack, not the brand fonts", async ({ page }) => {
    await page.goto("/login");
    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { name: "Welcome to Beauty Salon" }),
    ).toBeVisible();

    const fontFamilyOf = (selector: string) =>
      page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);

    // h1: the global h1–h5 serif rule must NOT reach the auth shell.
    expect(await fontFamilyOf("h1")).toBe(DEFAULT_SANS);
    // Body copy and controls inherit the same stack — no Mulish anywhere
    // on this surface (the reference shell never loads the brand fonts).
    expect(await fontFamilyOf("main p")).toBe(DEFAULT_SANS);
    expect(await fontFamilyOf("input[type=email]")).toBe(DEFAULT_SANS);

    // Feature settings + smoothing match the reference shell (the app-wide
    // body carries Mulish's "ss01","cv11" and `antialiased`; the shell does
    // not). Both reads happen inside the evaluate: Playwright serializes the
    // returned CSSStyleDeclaration to a plain object, which strips prototype
    // methods — and -webkit-font-smoothing needs getPropertyValue (the
    // WebKit-prefixed property is not on the CSSStyleDeclaration type).
    const shellCs = await main.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        fontFeatureSettings: cs.fontFeatureSettings,
        webkitFontSmoothing: cs.getPropertyValue("-webkit-font-smoothing"),
      };
    });
    expect(shellCs.fontFeatureSettings).toBe("normal");
    expect(shellCs.webkitFontSmoothing).toBe("auto");
  });

  test("the login h1 keeps the reference's bold/tight treatment", async ({ page }) => {
    await page.goto("/login");
    const h1 = page.getByRole("heading", { name: "Welcome to Beauty Salon" });
    const cs = await h1.evaluate((el) => getComputedStyle(el));
    // sm:text-3xl at the desktop project viewport; font-bold; tracking-tight
    // (−0.025em × 30px) — the tracking utility wins over the base heading
    // rule's −0.01em, exactly as on the reference.
    expect(cs.fontSize).toBe("30px");
    expect(cs.fontWeight).toBe("700");
    expect(cs.letterSpacing).toBe("-0.75px");
  });

  test("the auth shell's slate-900 surfaces compute to the reference's exact sRGB", async ({ page }) => {
    await page.goto("/login");
    // The two visible slate-900 elements (live-measured on the reference,
    // 2026-10-05: both compute to rgb(15, 23, 42) — v3's slate-900). This
    // is the trap-6 read-back: session 5 pinned the slate scale to sRGB hex
    // in @theme, and session 6's audit found one transcription error in
    // that very block (slate-900 pinned #0f172e -> rgb(15, 23, 46)). A pin
    // is only as good as its verification — every pinned value needs a
    // test that reads it back.
    const h1 = page.getByRole("heading", { name: "Welcome to Beauty Salon" });
    const h1Cs = await h1.evaluate((el) => getComputedStyle(el).color);
    expect(h1Cs).toBe("rgb(15, 23, 42)"); // text-slate-900

    const signin = page.getByRole("button", { name: "Sign in" });
    const btnCs = await signin.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(btnCs).toBe("rgb(15, 23, 42)"); // bg-slate-900
  });
});
