import { expect, test } from "@playwright/test";

// v2.9 parity (measured on the live, 2026-09-23 — the stroke-system +
// login-redesign pass):
//
// 1. ICON STROKE SYSTEM (systemic): the live stamps an inline
//    `style="stroke-width: 1.5"` on every lucide svg, so the COMPUTED
//    stroke is 1.5px even though the presentation attribute reads 2.
//    The v2.6 "universal 2" census read the attribute and missed the
//    inline override — methodology artifact. The re-split: 1.5px on
//    chrome/content glyphs, 2px on the action-button + form-control
//    set (NEW GOAL plus, card action squares, DELETE, Team plus
//    buttons, Settings chevron-down/save, dialog close Xs, Send,
//    wizard X + sparkles, date-picker chevrons, login mail/lock, the
//    popover LogOut), 1.8px on the 768 back-strip chevron, 1.6px on
//    the wizard bot.
// 2. LOGIN REDESIGN: gradient slate page, card with a 4px top
//    gradient bar + backdrop blur + overflow hidden, responsive
//    padding, CENTERED heading column, logo blur halo, 20px Google
//    glyph, 16px input glyphs, sm:flex-row footer.
// 3. APP BAR: rounded bottom corners (0 0 20 20), pad 14/20
//    content-driven height, brand textContent ORBITAL.
// 4. PILL NAV: brand divider border, chip-wrapped tabs with
//    min-width 52, z-100.
// 5. GOAL-EDIT DIALOG: no close square on the live (only the status
//    select + Cancel + Save).
// 6. USER MENU: pill + popover radius 12 (the rounded-xl 20px trap),
//    12px name #6E6E6E, 14px LogOut glyph.

async function strokeOf(locator: import("@playwright/test").Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).strokeWidth);
}

test.describe("icon stroke system (v2.9 re-split, computed styles)", () => {
  test("sidebar nav + collapse chevron render at 1.5px", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("aside")).toBeVisible();
    const strokes = await page.locator("aside nav svg.lucide").evaluateAll(
      (svgs) => svgs.map((s) => getComputedStyle(s).strokeWidth),
    );
    expect(strokes.length).toBeGreaterThanOrEqual(6);
    for (const sw of strokes) expect(sw, `sidebar icon should be 1.5, got ${sw}`).toBe("1.5px");
    const chevron = page.locator('aside button[aria-label*="ollapse"] svg, aside button svg.lucide-chevron-right').first();
    expect(await strokeOf(chevron)).toBe("1.5px");
  });

  test("mobile tab bar icons render at 1.5px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const nav = page.locator('nav[aria-label="Primary"]').first();
    // four view-tab glyphs + the MORE menu glyph — all 1.5
    const strokes = await nav.locator("a svg.lucide, button svg.lucide").evaluateAll(
      (svgs) => svgs.map((s) => getComputedStyle(s).strokeWidth),
    );
    expect(strokes.length).toBe(5);
    for (const sw of strokes) expect(sw, `tab icon should be 1.5, got ${sw}`).toBe("1.5px");
  });

  test("the 768 pill nav icons render at 1.5px; the back-strip chevron at 1.8px", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/goals");
    const pill = page.locator("nav.orb-pill-nav-shadow");
    await expect(pill).toBeVisible();
    const strokes = await pill.locator("a svg.lucide").evaluateAll(
      (svgs) => svgs.map((s) => getComputedStyle(s).strokeWidth),
    );
    expect(strokes.length).toBe(6);
    for (const sw of strokes) expect(sw, `pill icon should be 1.5, got ${sw}`).toBe("1.5px");
    const back = page.locator('button:has-text("Dashboard") svg.lucide-chevron-left').first();
    await expect(back).toBeVisible();
    expect(await strokeOf(back)).toBe("1.8px");
  });

  test("dashboard: NEW GOAL plus stays 2; Full log arrows are 1.5", async ({ page }) => {
    await page.goto("/");
    const plus = page.getByRole("link", { name: /New Goal/i }).first().locator("svg.lucide-plus");
    expect(await strokeOf(plus)).toBe("2px");
    const arrows = page.locator('a:has-text("Full log") svg.lucide-arrow-right');
    await expect(arrows.first()).toBeVisible();
    const strokes = await arrows.evaluateAll((svgs) => svgs.map((s) => getComputedStyle(s).strokeWidth));
    for (const sw of strokes) expect(sw).toBe("1.5px");
  });

  test("goal detail: task meta + AI zap at 1.5; action squares + DELETE + Target calendar stay 2", async ({ page }) => {
    await page.goto("/goals");
    const card = page.getByRole("link", { name: /Product Onboarding Redesign/ }).first();
    await card.click();
    await expect(page.getByRole("heading", { name: /Product Onboarding Redesign/ })).toBeVisible();
    // meta glyphs (user/clock) inside task cards
    const meta = await page.locator("main svg.lucide-user, main svg.lucide-clock").evaluateAll(
      (svgs) => svgs.map((s) => getComputedStyle(s).strokeWidth),
    );
    expect(meta.length).toBeGreaterThan(4);
    for (const sw of meta) expect(sw, `task meta icon should be 1.5, got ${sw}`).toBe("1.5px");
    // the AI chip zap
    const zap = page.locator("svg.lucide-zap").first();
    expect(await strokeOf(zap)).toBe("1.5px");
    // action squares (pencil/trash on task rows)
    const squares = await page.locator('main button svg.lucide-pencil, main button svg.lucide-trash2').evaluateAll(
      (svgs) => svgs.map((s) => getComputedStyle(s).strokeWidth),
    );
    expect(squares.length).toBeGreaterThan(6);
    for (const sw of squares) expect(sw, `action square should be 2, got ${sw}`).toBe("2px");
    // the DELETE pill's trash + the Target line calendar
    const del = page.locator('button:has-text("Delete") svg.lucide-trash2').first();
    expect(await strokeOf(del)).toBe("2px");
    const cal = page.locator("main svg.lucide-calendar").first();
    expect(await strokeOf(cal)).toBe("2px");
  });

  test("goals view: card action squares stay 2; the NEW pill plus stays 2", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await expect(page.getByRole("link", { name: /Product Onboarding Redesign/ }).first()).toBeVisible();
    const acts = await page.locator('main button svg.lucide-pencil, main button svg.lucide-trash2').evaluateAll(
      (svgs) =>
        svgs
          .filter((s) => s.getBoundingClientRect().width > 0)
          .map((s) => getComputedStyle(s).strokeWidth),
    );
    expect(acts.length).toBe(6);
    for (const sw of acts) expect(sw).toBe("2px");
    const plus = page.locator('main button:has-text("New") svg.lucide-plus, main a:has-text("New Goal") svg.lucide-plus').first();
    expect(await strokeOf(plus)).toBe("2px");
  });

  test("wizard: bot at 1.6, deadline trigger calendar at 1.5, close X + AI sparkles stay 2", async ({ page }) => {
    await page.goto("/goals?new=true");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    expect(await strokeOf(dialog.locator("svg.lucide-bot"))).toBe("1.6px");
    expect(await strokeOf(dialog.locator("svg.lucide-calendar, svg.lucide-calendar-days").first())).toBe("1.5px");
    expect(await strokeOf(dialog.locator("svg.lucide-x"))).toBe("2px");
  });

  test("user popover LogOut glyph renders at 14px stroke 2", async ({ page }) => {
    await page.goto("/");
    const pill = page.locator("main button").filter({ hasText: /demo/ }).first();
    await pill.click();
    const logout = page.getByRole("button", { name: "Log Out" });
    await expect(logout).toBeVisible();
    const box = await logout.locator("svg.lucide-log-out").evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(box)).toBe(14);
    expect(await strokeOf(logout.locator("svg.lucide-log-out"))).toBe("2px");
  });
});

test.describe("mobile app bar (v2.9)", () => {
  test("rounded bottom corners + literal ORBITAL brand + content-driven height", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const header = page.locator('header[aria-label="App bar"]');
    await expect(header).toBeVisible();
    expect(await header.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("0px 0px 20px 20px");
    expect(await header.evaluate((el) => getComputedStyle(el).padding)).toBe("14px 20px");
    expect(await header.evaluate((el) => el.querySelector("span")?.textContent ?? "")).toBe("ORBITAL");
    // content-driven height: logged in the user pill drives ~62
    const h = await header.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBeGreaterThanOrEqual(60);
    expect(h).toBeLessThanOrEqual(64);
  });
});

test.describe("768 pill nav structure (v2.9)", () => {
  test("brand divider + chip min-width 52 + z-index 100", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const pill = page.locator("nav.orb-pill-nav-shadow");
    await expect(pill).toBeVisible();
    expect(await pill.evaluate((el) => getComputedStyle(el).zIndex)).toBe("100");
    // the brand wrapper carries the 1px divider
    const brand = pill.locator("span").first();
    const brandStyle = await brand.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { borderRight: cs.borderRightWidth + " " + cs.borderRightColor, mr: cs.marginRight };
    });
    expect(brandStyle.borderRight).toBe("1px rgba(160, 143, 126, 0.18)");
    // every tab wraps a chip with min-width 52
    const chips = await pill.locator("a > span").evaluateAll(
      (els) => els.map((el) => ({ minW: getComputedStyle(el).minWidth, r: getComputedStyle(el).borderRadius })),
    );
    expect(chips.length).toBe(6);
    for (const c of chips) {
      expect(c.minW, `chip min-width should be 52px, got ${c.minW}`).toBe("52px");
      expect(c.r).toBe("12px");
    }
    // the active chip carries the well background
    const active = await pill.locator('a[aria-current="page"] > span').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(active).toBe("rgb(235, 231, 226)");
  });
});

test.describe("goal-edit dialog close removal (v2.9)", () => {
  test("Edit Goal carries no close square — only the select, Cancel and Save", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await expect(page.getByRole("link", { name: /Product Onboarding Redesign/ }).first()).toBeVisible();
    await page.getByRole("button", { name: /^Edit goal Product Onboarding/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // v2.10: the re-generated form dialogs carry a <p> heading (no heading
    // role semantics) — match by text.
    await expect(dialog.getByText("Edit Goal", { exact: true })).toBeVisible();
    // The clone's dialog-content close carries data-slot="dialog-close".
    expect(await dialog.locator('[data-slot="dialog-close"]').count()).toBe(0);
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("the dialog selects are NATIVE elements styled like the live (v2.9)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("button", { name: /^Edit goal Product Onboarding/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // The live's status control is a native <select> (216×35, bg
    // #EBE7E2, r10, 13px) — not a shadcn button trigger.
    const select = dialog.locator("#edit-goal-status");
    await expect(select).toBeVisible();
    // The dialog's zoom-in-95 animation (200ms) scales the panel mid-flight
    // (35 × 0.97 ≈ 34) — poll until the transform settles before reading
    // the geometry (the pins themselves are unchanged).
    await expect
      .poll(async () =>
        select.evaluate((el) => {
          const s = el as HTMLSelectElement;
          const style = getComputedStyle(s);
          const r = s.getBoundingClientRect();
          return {
            tag: s.tagName,
            h: Math.round(r.height),
            w: Math.round(r.width),
            bg: style.backgroundColor,
            radius: style.borderRadius,
            fs: style.fontSize,
            opts: Array.from(s.options).map((o) => o.textContent ?? ""),
          };
        }), { timeout: 5_000 })
      .toMatchObject({ tag: "SELECT", h: 35, bg: "rgb(235, 231, 226)", radius: "10px", fs: "13px", opts: ["Draft", "Active", "Paused", "Completed"] });
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });
});

test.describe("user menu geometry (v2.9)", () => {
  test("the desktop pill renders radius 12 with a 12px #6E6E6E name", async ({ page }) => {
    await page.goto("/");
    const pill = page.locator("main button").filter({ hasText: /demo/ }).first();
    await expect(pill).toBeVisible();
    expect(await pill.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("12px");
    const name = pill.locator("span").last();
    const nameStyle = await name.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fs: cs.fontSize, color: cs.color };
    });
    expect(nameStyle.fs).toBe("12px");
    expect(nameStyle.color).toBe("rgb(110, 110, 110)");
  });

  test("the popover renders radius 12", async ({ page }) => {
    await page.goto("/");
    const pill = page.locator("main button").filter({ hasText: /demo/ }).first();
    await pill.click();
    const logout = page.getByRole("button", { name: "Log Out" });
    await expect(logout).toBeVisible();
    const pop = logout.locator("xpath=ancestor::div[1]");
    expect(await pop.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("12px");
  });
});

test.describe("login redesign (v2.9)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the page carries the slate gradient background", async ({ page }) => {
    await page.goto("/login");
    const bg = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? getComputedStyle(main).backgroundImage : "NO_MAIN";
    });
    expect(bg).toContain("linear-gradient(to right bottom");
    // Tailwind v4 serializes slate-50/slate-100 as lab() coordinates —
    // the live (same Tailwind) serializes identically.
    expect(bg).toContain("lab(");
  });

  test("the card carries the 4px top gradient bar and centered heading", async ({ page }) => {
    await page.goto("/login");
    const h1 = page.getByRole("heading", { name: "Welcome to Project Management App" });
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    // gradient bar: the first child inside the card, 4px tall
    const bar = page.locator("div").filter({ hasText: /^$/ }).first();
    const barInfo = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll("div")).find(
        (d) => d.className.toString().includes("rounded-2xl") && d.textContent.includes("Welcome"),
      );
      if (!card) return null;
      const first = card.firstElementChild as HTMLElement | null;
      if (!first) return null;
      const r = first.getBoundingClientRect();
      const cs = getComputedStyle(first);
      return { h: Math.round(r.height), w: Math.round(r.width), bg: cs.backgroundImage.slice(0, 80) };
    });
    expect(barInfo).not.toBeNull();
    expect(barInfo!.h).toBe(4);
    expect(barInfo!.bg).toContain("linear-gradient");
  });

  test("the Google glyph renders at 20px and the input glyphs at 16px", async ({ page }) => {
    await page.goto("/login");
    const google = page.getByRole("button", { name: "Continue with Google" }).locator("svg").first();
    const gw = await google.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(gw).toBe(20);
    const mail = page.locator("div svg.lucide-mail").first();
    const mw = await mail.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(mw).toBe(16);
    const lock = page.locator("div svg.lucide-lock").first();
    const lw = await lock.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(lw).toBe(16);
  });

  test("the card padding is responsive (32px below md, 48/40/40 at md+)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    const pad = await page.evaluate(() => {
      const inner = Array.from(document.querySelectorAll("div")).find(
        (d) => /^p-8/.test(d.className.toString()) || /p-8/.test(d.className.toString()),
      );
      return inner ? getComputedStyle(inner).padding : null;
    });
    expect(pad).toBe("32px");
  });
});
