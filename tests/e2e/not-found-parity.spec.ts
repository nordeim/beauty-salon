import { expect, test } from "@playwright/test";

// 404-surface parity — the reference's not-found page is NOT the cream
// editorial system: it is a slate-centered card (bg-slate-50, max-w-md)
// inside the marketing chrome, with the attempted path interpolated into
// the message and a real <button> Go Home (white, bordered, rounded-lg).
// These assertions pin the computed values measured on the live reference
// (2026-10-05, agent-browser @1280x720) so the surface cannot drift again.
// Mirrors the mobile-navigation.spec.ts / login-parity.spec.ts pattern:
// if a styling change breaks this, the change is wrong, not the spec.

test.describe("not-found parity (the 404 surface)", () => {
  test("the 404 body renders the reference's slate centered card", async ({ page }) => {
    await page.goto("/definitely-not-a-page");

    // Outer wrapper: full-viewport slate-50 panel, centered content.
    const outer = page.locator("main .bg-slate-50");
    await expect(outer).toBeVisible();
    const outerCs = await outer.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        padding: cs.padding,
        bg: cs.backgroundColor,
      };
    });
    expect(outerCs.display).toBe("flex");
    expect(outerCs.alignItems).toBe("center");
    expect(outerCs.justifyContent).toBe("center");
    expect(outerCs.padding).toBe("24px");
    expect(outerCs.bg).toBe("rgb(248, 250, 252)");

    // h1 "404": 72px light slate-300 Cormorant (global heading rule —
    // the 404 runs in the MARKETING font context, unlike /login).
    const h1 = page.getByRole("heading", { name: "404", exact: true });
    const h1Cs = await h1.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
        family: cs.fontFamily,
        tracking: cs.letterSpacing,
      };
    });
    expect(h1Cs.size).toBe("72px");
    expect(h1Cs.weight).toBe("300");
    expect(h1Cs.color).toBe("rgb(203, 213, 225)");
    expect(h1Cs.family).toContain("Cormorant Garamond");
    expect(h1Cs.tracking).toBe("-0.72px");

    // The divider under the 404: 2px x 64px slate-200, centered. (Selected
    // structurally — the h-0.5 class name needs CSS escaping in selectors.)
    const divider = page.locator("main div.space-y-2 > div");
    const dividerCs = await divider.evaluate((el) => {
      const cs = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return { h: box.height, w: box.width, bg: cs.backgroundColor, ml: cs.marginLeft, mr: cs.marginRight };
    });
    expect(dividerCs.h).toBe(2);
    expect(dividerCs.w).toBe(64);
    expect(dividerCs.bg).toBe("rgb(226, 232, 240)");
    expect(dividerCs.ml).toBe(dividerCs.mr); // mx-auto — centered

    // h2 "Page Not Found": 24px medium slate-800 Cormorant.
    const h2 = page.getByRole("heading", { name: "Page Not Found" });
    const h2Cs = await h2.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { size: cs.fontSize, weight: cs.fontWeight, color: cs.color, tracking: cs.letterSpacing };
    });
    expect(h2Cs.size).toBe("24px");
    expect(h2Cs.weight).toBe("500");
    expect(h2Cs.color).toBe("rgb(30, 41, 59)");
    expect(h2Cs.tracking).toBe("-0.24px");

    // The message: 16px slate-600 Mulish, relaxed leading (26px).
    const p = page.locator("main p.text-slate-600");
    const pCs = await p.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { size: cs.fontSize, color: cs.color, family: cs.fontFamily, lineH: cs.lineHeight };
    });
    expect(pCs.size).toBe("16px");
    expect(pCs.color).toBe("rgb(71, 85, 105)");
    expect(pCs.family).toContain("Mulish");
    expect(pCs.lineH).toBe("26px");

    // The Go Home control: a real BUTTON (not a link) — white bg, 1px
    // slate-200 border, rounded-lg, 14px medium slate-700 Mulish.
    const btn = page.getByRole("button", { name: "Go Home" });
    await expect(btn).toBeVisible();
    const btnCs = await btn.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
        family: cs.fontFamily,
        transform: cs.textTransform,
        pad: cs.padding,
        border: cs.border,
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
      };
    });
    expect(btnCs.size).toBe("14px");
    expect(btnCs.weight).toBe("500");
    expect(btnCs.color).toBe("rgb(51, 65, 85)");
    expect(btnCs.family).toContain("Mulish");
    expect(btnCs.transform).toBe("none");
    expect(btnCs.pad).toBe("8px 16px");
    expect(btnCs.border).toBe("1px solid rgb(226, 232, 240)");
    expect(btnCs.radius).toBe("8px");
    expect(btnCs.bg).toBe("rgb(255, 255, 255)");
  });

  test("the message interpolates the attempted path", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    // The reference renders the requested path inside the message:
    // The page "<path>" could not be found in this application.
    // (Asserted post-hydration — the static /_not-found shell bakes a
    // different path server-side; the client patch is the truth.)
    const p = page.locator("main p.text-slate-600");
    await expect(p).toContainText('The page "/definitely-not-a-page" could not be found in this application.');
    // …with the path carried by a font-medium slate-700 span.
    const span = p.locator("span");
    await expect(span).toHaveText('"/definitely-not-a-page"');
    const spanCs = await span.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { weight: cs.fontWeight, color: cs.color };
    });
    expect(spanCs.weight).toBe("500");
    expect(spanCs.color).toBe("rgb(51, 65, 85)");
  });

  test("the Go Home button navigates home", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await page.getByRole("button", { name: "Go Home" }).click();
    await expect(page).toHaveURL("/");
  });
});
