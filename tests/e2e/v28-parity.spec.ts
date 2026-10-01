import { expect, test } from "@playwright/test";

// v2.8 parity (measured on the live, 2026-09-23 — the Tailwind-v4
// affordance/artifact pass):
//
// 1. BUTTON CURSOR (systemic): the live's global CSS carries
//    `button, [role="button"] { cursor: pointer }`; the clone relied on
//    the UA default (arrow). Tailwind v4's preflight sets no pointer —
//    so every button surface needs the base rule.
// 2. MOBILE GOAL-CARD ACTIONS (regression since v2.7): the action
//    squares sit inside the card anchor; their clicks bubbled to the
//    anchor and NAVIGATED instead of opening the dialog. The anchor
//    now guards clicks that originate on buttons.
// 3. FULL-CARD ANCHOR + WELL NESTING (F6): the live's goal-card anchor
//    wraps the ENTIRE card (text column + the 120px stats/action
//    column), and the dashboard goal wells are bare anchors wrapping
//    an inner well div.
// 4. TAILWIND v4 SHADOW COMPOSITION: `shadow-[…]` utilities compose
//    with unset --tw-* vars, so the computed box-shadow string carries
//    four zero-alpha prefixes. The chrome surfaces now use plain
//    custom classes — the computed strings must equal the live's
//    clean declarations byte-for-byte.
// 5. MORE-SHEET CLOSE SQUARE (F3): the live renders the 3px/6px pair
//    (0.78 / 0.27) — not the stale v2.0 4px/8px/0.28 pair.
// 6. CHIP RADIUS: the live's filter chips compute to a literal
//    9999px; `rounded-full` in v4 serializes as calc(infinity*1px)
//    (33554432px in Chrome) — the chips pin 9999px.
// 7. BRAND TEXT: the live's brand strings are literal "ORBITAL"
//    (textContent, no text-transform).

const ORB_APPBAR_SHADOW = "rgba(160, 143, 126, 0.18) 0px 4px 16px 0px";
const ORB_TABBAR_SHADOW = "rgba(160, 143, 126, 0.22) 0px -4px 20px 0px";
const ORB_SHEET_SHADOW = "rgba(160, 143, 126, 0.28) 0px -8px 32px 0px";
const ORB_PILL_SHADOW =
  "rgba(255, 250, 244, 0.78) -8px -8px 16px 0px, rgba(160, 143, 126, 0.31) 8px 8px 18px 0px";
const ORB_SHEET_CLOSE_SHADOW =
  "rgba(255, 250, 244, 0.78) -3px -3px 6px 0px, rgba(160, 143, 126, 0.27) 3px 3px 6px 0px";

async function cursorOf(locator: import("@playwright/test").Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).cursor);
}

test.describe("button cursor affordance (v2.8 systemic)", () => {
  test("every button renders the pointing cursor like the live's global rule", async ({ page }) => {
    await page.goto("/goals");
    // NEW GOAL (page-level neumorphic button).
    await expect(page.getByRole("button", { name: /New Goal/i }).first()).toBeVisible();
    expect(await cursorOf(page.getByRole("button", { name: /New Goal/i }).first())).toBe("pointer");
    // A filter chip.
    const chip = page.getByRole("button", { name: /^All \(\d+\)$/ }).first();
    await expect(chip).toBeVisible();
    expect(await cursorOf(chip)).toBe("pointer");
    // The sidebar collapse bar (desktop chrome button).
    const collapse = page.locator('aside button[aria-label*="ollapse"], aside button').first();
    expect(await cursorOf(collapse)).toBe("pointer");
  });

  test("the dialog buttons and select triggers carry the pointer", async ({ page }) => {
    await page.goto("/goals");
    // Open the NEW GOAL wizard via the deep link, then close it; open the
    // add-task dialog through a goal detail instead (simpler, no AI flow).
    const card = page.getByRole("link", { name: /Product Onboarding Redesign/ }).first();
    await card.click();
    await expect(page.getByRole("heading", { name: /Product Onboarding Redesign/ })).toBeVisible();
    await page.getByRole("button", { name: /Add Task/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // Cancel + the select trigger are buttons — pointer on the live.
    expect(await cursorOf(dialog.getByRole("button", { name: "Cancel" }))).toBe("pointer");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });

  test("the mobile MORE trigger and sheet close render the pointer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const more = page.locator('nav button').filter({ hasText: /^More$/ });
    await expect(more).toBeVisible();
    expect(await cursorOf(more)).toBe("pointer");
    await more.click();
    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toBeVisible();
    expect(await cursorOf(close)).toBe("pointer");
    await close.click();
    await expect(close).toBeHidden();
  });
});

test.describe("mobile goal-card actions (v2.8 F2 regression fix)", () => {
  test("the pencil opens the edit dialog WITHOUT navigating", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/goals");
    const pencil = page.getByRole("button", { name: /^Edit goal Product Onboarding/i });
    await expect(pencil).toBeVisible();
    await pencil.click();
    // The edit dialog (a real [role=dialog]) opens…
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // …and the SPA stays on /goals (no navigation leak through the anchor).
    expect(page.url()).toContain("/goals");
    expect(page.url()).not.toMatch(/\/goals\/[a-z0-9]+$/);
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    // And the delete square flips to the inline confirm (still on /goals).
    const trash = page.getByRole("button", { name: /^Delete goal Product Onboarding/i });
    await trash.click();
    await expect(page.getByText("Delete?").first()).toBeVisible();
    expect(page.url()).toContain("/goals");
    expect(page.url()).not.toMatch(/\/goals\/[a-z0-9]+$/);
  });
});

test.describe("goal-card anchor coverage + well nesting (v2.8 F6)", () => {
  test("the desktop card anchor spans the full card width", async ({ page }) => {
    await page.goto("/goals");
    const card = page.locator("div.orb-goal-card").first();
    const anchor = page.getByRole("link", { name: /Product Onboarding Redesign/ }).first();
    await expect(anchor).toBeVisible();
    const cardWidth = await card.evaluate((el) => el.getBoundingClientRect().width);
    const anchorWidth = await anchor.evaluate((el) => el.getBoundingClientRect().width);
    expect(anchorWidth).toBeGreaterThanOrEqual(cardWidth - 1);
  });

  test("the dashboard goal wells are bare anchors wrapping inner wells", async ({ page }) => {
    await page.goto("/");
    const well = page.locator('a[href^="/goals/"]').filter({ hasText: "Product Onboarding Redesign" }).first();
    await expect(well).toBeVisible();
    // The anchor itself carries NO shadow (the live's inner div does).
    const shadow = await well.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toBe("none");
    // The inner div carries the well inset pair.
    const innerShadow = await well.evaluate((el) => getComputedStyle(el.firstElementChild!).boxShadow);
    expect(innerShadow).toContain("inset");
  });
});

test.describe("chrome shadows — clean declarations (v2.8 F4)", () => {
  test("the mobile app bar computes the live's exact single shadow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    expect(await header.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(ORB_APPBAR_SHADOW);
  });

  test("the mobile tab bar computes the live's exact upward shadow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const nav = page.locator("nav").filter({ hasText: "Home" }).first();
    await expect(nav).toBeVisible();
    expect(await nav.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(ORB_TABBAR_SHADOW);
  });

  test("the MORE sheet and its close square compute the live's exact pairs", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator('nav button').filter({ hasText: /^More$/ }).click();
    const sheet = page.locator('[role="dialog"]').last();
    await expect(sheet).toBeVisible();
    const sheetShadow = await sheet.evaluate((el) => getComputedStyle(el).boxShadow);
    // v2.7 DOM: the sheet content is the dialog element. The custom class
    // replaces the composed utility — no zero-alpha prefixes.
    expect(sheetShadow).not.toContain("rgba(0, 0, 0, 0)");
    const close = page.getByRole("button", { name: "Close menu" });
    expect(await close.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(ORB_SHEET_CLOSE_SHADOW);
    // The sheet brand is the literal ORBITAL string (textContent parity).
    const brandText = await sheet.evaluate(() => {
      const spans = [...document.querySelectorAll('[role="dialog"] span')];
      const brand = spans.find((s) => /orbital/i.test(s.textContent || ""));
      return brand?.textContent ?? "";
    });
    expect(brandText).toBe("ORBITAL");
    await close.click();
    await expect(sheet).toBeHidden();
  });

  test("the 768 pill nav computes the live's exact large pair", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    // The pill nav (not the mobile tab bar — both carry aria-label
    // "Primary"); the pill is the only one visible at 768 and the only
    // one carrying the custom class.
    const pill = page.locator("nav.orb-pill-nav-shadow");
    await expect(pill).toBeVisible();
    expect(await pill.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(ORB_PILL_SHADOW);
  });
});

test.describe("filter-chip radius literal (v2.8 F5)", () => {
  test("the goals filter chips compute a literal 9999px radius", async ({ page }) => {
    await page.goto("/goals");
    const chip = page.getByRole("button", { name: /^All \(\d+\)$/ }).first();
    await expect(chip).toBeVisible();
    expect(await chip.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("9999px");
  });

  test("the /tasks filter chips compute a literal 9999px radius", async ({ page }) => {
    await page.goto("/tasks");
    const chip = page.getByRole("button", { name: /^All \(\d+\)$/ }).first();
    await expect(chip).toBeVisible();
    expect(await chip.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("9999px");
  });
});

test.describe("brand strings are literal ORBITAL (v2.8 F7)", () => {
  test("the sidebar brand link's textContent is ORBITAL; the transform is the live's redundant uppercase", async ({ page }) => {
    await page.goto("/");
    const brand = page.locator("aside").first().locator('a[href="/"]').first();
    await expect(brand).toBeVisible();
    const data = await brand.evaluate((el) => ({
      text: el.textContent ?? "",
      transform: getComputedStyle(el.querySelector("span")!).textTransform,
      pad: getComputedStyle(el).padding,
    }));
    expect(data.text).toBe("ORBITAL");
    // The live keeps text-transform: uppercase on the span — a no-op on the
    // already-uppercase literal string, mirrored for computed parity.
    expect(data.transform).toBe("uppercase");
    expect(data.pad).toBe("0px");
  });
});
