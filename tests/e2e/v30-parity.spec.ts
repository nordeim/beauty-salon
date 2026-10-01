import { expect, test } from "@playwright/test";

// v2.10 parity (measured on the live, 2026-09-23 — the dialog-generation +
// z-system + serialization pass):
//
// 1. DIALOG FORM GENERATION (F1): the live re-generated its standard form
//    dialogs — the dialog ROOT is a scrim-flex container (fixed z-200,
//    flex center, pad 24px 16px, bg rgba(46,42,38,0.3)) with the panel as
//    its CHILD (relative, r20, max-w 500, pad 28/28/24, no shadow); the
//    heading is a <p> 15px/600 lh 22.5 mb 20; the form is flex-col gap 14;
//    the labels render 11/600 uppercase ls 0.88px lh 16.5px mb 6px; the
//    button row is mt 4 (goal-edit mt 6) / gap 10; the close X is 13px
//    #5A5A5A.
// 2. CHECK-IN (F3): top-anchored at 5% of the viewport below sm (centered
//    from sm like before), radio circles at literal 9999px with
//    content-width labels, textarea fs 16, close square on the canvas bg
//    with the X at #5A5A5A.
// 3. WIZARD (F4): outer panel r24 at every width, scrim z-100, bot avatar
//    at radius 50%, title input pad-x 14.
// 4. Z SYSTEM (F5): tab bar 100 · form dialogs 200 · wizard 100 · sheet
//    overlay 200 (panel 201) — the live's coherent map.
// 5. V4 SERIALIZATION (F6): the 768 pill-nav active chip, the 768
//    back-strip button, the sidebar clock, and the date-picker inner card
//    render CLEAN declarations (no composed zero-alpha prefixes); the
//    radio circles pin 9999px and the bot avatar 50%.
// 6. LOGIN (F10): the card computes 746 tall (the footer sits inside the
//    form's bottom block at mt 12), the label gap 6 / field gap 16, the
//    card blur 4px.
// 7. ASSORTED: goal-edit option order + no asterisk, the invite dialog's
//    12px/500 labels + 36px role toggles, the activity pill's flex-gap
//    text layout, the Settings save icon at 14px, the sidebar brand at
//    x50, the collapse bar pad 8.

async function styleOf(locator: import("@playwright/test").Locator, prop: keyof CSSStyleDeclaration) {
  return locator.evaluate((el, p) => getComputedStyle(el)[p as string] as string, prop as never);
}

/** Climb from the dialog content to its nearest fixed ancestor (the root). */
async function dialogRootStyle(page: import("@playwright/test").Page) {
  return page.locator('[role="dialog"]').first().evaluate((el) => {
    let node: HTMLElement | null = el as HTMLElement;
    while (node && node !== document.body) {
      if (getComputedStyle(node).position === "fixed") break;
      node = node.parentElement;
    }
    const cs = node ? getComputedStyle(node) : null;
    return {
      found: !!node,
      display: cs?.display ?? "",
      alignItems: cs?.alignItems ?? "",
      justifyContent: cs?.justifyContent ?? "",
      padding: cs?.padding ?? "",
      zIndex: cs?.zIndex ?? "",
      bg: cs?.backgroundColor ?? "",
    };
  });
}

test.describe("dialog form generation (v2.10)", () => {
  test("the add-task root is a scrim-flex container at z-200 with a relative panel child", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const root = await dialogRootStyle(page);
    expect(root.display).toBe("flex");
    expect(root.alignItems).toBe("center");
    expect(root.justifyContent).toBe("center");
    expect(root.padding).toBe("24px 16px");
    expect(root.zIndex).toBe("200");
    expect(root.bg).toBe("rgba(46, 42, 38, 0.3)");
    // the panel itself is relative (not fixed) and carries no shadow
    const panel = await dialog.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { position: cs.position, radius: cs.borderRadius, shadow: cs.boxShadow, pad: cs.padding };
    });
    expect(panel.position).toBe("relative");
    expect(panel.radius).toBe("20px");
    expect(panel.shadow).toBe("none");
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("the heading is a <p> at 15/600 with mb 20 and the form gaps at 14", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // heading: <p>, 15px/600, lh 22.5, mb 20
    const heading = await dialog.evaluate((el) => {
      const h = el.querySelector("h1, h2, h3, p");
      if (!h) return null;
      const cs = getComputedStyle(h);
      return { tag: h.tagName, fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, mb: cs.marginBottom, text: (h.textContent ?? "").slice(0, 10) };
    });
    expect(heading?.tag).toBe("P");
    expect(heading?.fs).toBe("15px");
    expect(heading?.fw).toBe("600");
    expect(heading?.lh).toBe("22.5px");
    expect(heading?.mb).toBe("20px");
    // form: flex column with gap 14 (no per-row margins)
    const form = await dialog.evaluate((el) => {
      const f = el.querySelector("form");
      if (!f) return null;
      const cs = getComputedStyle(f);
      const firstRow = f.firstElementChild as HTMLElement | null;
      return { display: cs.display, gap: cs.rowGap, rowMb: firstRow ? getComputedStyle(firstRow).marginBottom : "" };
    });
    expect(form?.display).toBe("flex");
    expect(form?.gap).toBe("14px");
    expect(form?.rowMb).toBe("0px");
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("the dialog labels render 11/600 uppercase ls 0.88 lh 16.5 mb 6", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // The dialog's zoom-in-95 animation (200ms) scales the panel mid-flight
    // (16.5 × 0.97 ≈ 16) — poll until the transform settles before reading
    // the label box (the pin itself is unchanged: 16.5 → rounds to 17).
    await expect
      .poll(async () =>
        dialog.evaluate((el) => {
          const l = el.querySelector("label");
          if (!l) return null;
          const cs = getComputedStyle(l);
          return { fs: cs.fontSize, fw: cs.fontWeight, tt: cs.textTransform, ls: cs.letterSpacing, lh: cs.lineHeight, mb: cs.marginBottom, h: Math.round(l.getBoundingClientRect().height) };
        }), { timeout: 5_000 })
      .toMatchObject({ fs: "11px", fw: "600", tt: "uppercase", ls: "0.88px", lh: "16.5px", mb: "6px", h: 17 });
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("the button row is mt 4 gap 10 and the close X is 13px #5A5A5A", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // The dialog's zoom-in-95 animation (200ms) scales the panel mid-flight
    // (34 × 0.97 ≈ 33) — poll until the transform settles before reading
    // the row box (the pins themselves are unchanged).
    await expect
      .poll(async () =>
        dialog.evaluate((el) => {
          const btn = [...el.querySelectorAll("button")].find((b) => /^Add Task$/.test((b.textContent ?? "").trim()));
          const row = btn?.parentElement ?? null;
          if (!row) return null;
          const cs = getComputedStyle(row);
          return { mt: cs.marginTop, gap: cs.gap, h: Math.round(row.getBoundingClientRect().height) };
        }), { timeout: 5_000 })
      .toMatchObject({ mt: "4px", gap: "10px", h: 34 });
    // close: 30px r8 square with a 13px X at #5A5A5A
    const close = dialog.locator('[data-slot="dialog-close"]');
    const x = await close.locator("svg").evaluate((s) => {
      const cs = getComputedStyle(s);
      return { w: Math.round(s.getBoundingClientRect().width), color: cs.color };
    });
    expect(x.w).toBe(13);
    expect(x.color).toBe("rgb(90, 90, 90)");
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("goal-edit: option order Draft-Active-Paused-Completed, no Title asterisk, row mt 6", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("button", { name: /^Edit goal Product Onboarding/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const select = dialog.locator("#edit-goal-status");
    const opts = await select.evaluate((s) => Array.from((s as HTMLSelectElement).options).map((o) => o.textContent ?? ""));
    expect(opts).toEqual(["Draft", "Active", "Paused", "Completed"]);
    const title = await dialog.locator("label").first().evaluate((l) => (l.textContent ?? "").trim());
    expect(title).toBe("Title");
    const row = await dialog.evaluate((el) => {
      const btn = [...el.querySelectorAll("button")].find((b) => /^Save$/.test((b.textContent ?? "").trim()));
      const row = btn?.parentElement ?? null;
      return row ? getComputedStyle(row).marginTop : "";
    });
    expect(row).toBe("6px");
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });
});

test.describe("check-in modal (v2.10)", () => {
  async function openCheckIn(page: import("@playwright/test").Page) {
    await page.goto("/goals");
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.getByRole("heading", { name: "Review Q3 project milestones" }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    return dialog;
  }

  test("below sm the modal anchors at 5% of the viewport (centered from sm)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openCheckIn(page);
    // 5% of 844 = 42.2 — the zoom-in animation shifts the top edge mid-flight
    // (scale .9704 → +6.7px), so poll until the transform settles.
    await expect
      .poll(async () => dialog.evaluate((el) => Math.round(el.getBoundingClientRect().y * 10) / 10), { timeout: 5_000 })
      .toBe(42.2);
    await page.keyboard.press("Escape");
  });

  test("radio circles pin literal 9999px with content-width labels", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openCheckIn(page);
    const radios = await dialog.locator("[role=radio]").evaluateAll((els) =>
      els.map((el) => {
        const cs = getComputedStyle(el);
        return { r: cs.borderRadius, w: Math.round(el.getBoundingClientRect().width), color: cs.color, fs: cs.fontSize, fw: cs.fontWeight };
      }),
    );
    expect(radios.length).toBe(4);
    for (const r of radios) {
      expect(r.r).toBe("9999px");
      expect(r.color).toBe("rgb(47, 40, 35)");
    }
    const labels = await dialog.evaluate((el) =>
      [...el.querySelectorAll("label, [data-slot=radio-label], span")]
        .filter((n) => /^(On Track|Blocked|Need Help|Done)$/.test((n.textContent ?? "").trim()))
        .map((n) => Math.round(n.getBoundingClientRect().width)),
    );
    expect(labels.length).toBe(4);
    for (const w of labels) expect(w).toBeLessThan(90); // content-width, not 151px grid cells
    await page.keyboard.press("Escape");
  });

  test("the note textarea renders at 16px and the close square uses the canvas bg", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openCheckIn(page);
    const ta = dialog.locator("textarea");
    expect(await styleOf(ta, "fontSize")).toBe("16px");
    const close = dialog.locator('[data-slot="dialog-close"]');
    const cs = await close.evaluate((el) => {
      const c = getComputedStyle(el);
      const s = el.querySelector("svg");
      return { bg: c.backgroundColor, xColor: s ? getComputedStyle(s).color : "" };
    });
    expect(cs.bg).toBe("rgb(238, 234, 230)");
    expect(cs.xColor).toBe("rgb(90, 90, 90)");
    await page.keyboard.press("Escape");
  });
});

test.describe("wizard chrome (v2.10)", () => {
  test("the outer panel is r24 at mobile with the scrim at z-100", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/goals");
    await page.getByRole("button", { name: /^New$/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const panel = await dialog.evaluate((el) => getComputedStyle(el).borderRadius.split(" ")[0]);
    expect(panel).toBe("24px");
    const scrim = await dialog.evaluate((el) => {
      let node: HTMLElement | null = el as HTMLElement;
      while (node && node !== document.body) {
        if (getComputedStyle(node).position === "fixed") break;
        node = node.parentElement;
      }
      return node ? getComputedStyle(node).zIndex : "";
    });
    expect(scrim).toBe("100");
    await page.keyboard.press("Escape");
  });

  test("the bot avatar computes radius 50% and the title input pad-x is 14", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("button", { name: "New Goal", exact: true }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const avatar = await dialog.evaluate((el) => {
      const svgs = [...el.querySelectorAll("svg")];
      const bot = svgs.find((s) => /lucide-bot/.test(s.getAttribute("class") ?? ""));
      const circle = bot?.parentElement ?? null;
      return circle ? getComputedStyle(circle).borderRadius.split(" ")[0] : "";
    });
    expect(avatar).toBe("50%");
    const input = dialog.locator("#goal-title");
    expect(await styleOf(input, "paddingLeft")).toBe("14px");
    await page.keyboard.press("Escape");
  });
});

test.describe("z-index system (v2.10)", () => {
  test("the mobile tab bar computes z 100", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const z = await page.locator('nav[aria-label="Primary"]').first().evaluate((el) => getComputedStyle(el).zIndex);
    expect(z).toBe("100");
  });

  test("the MORE sheet overlay computes z 200 above the tab bar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).click();
    const overlay = await page.evaluate(() => {
      const els = [...document.querySelectorAll("div")].filter((d) => {
        const cs = getComputedStyle(d);
        const r = d.getBoundingClientRect();
        return cs.position === "fixed" && r.width > 380 && r.height > 800 && cs.backgroundColor === "rgba(0, 0, 0, 0.2)";
      });
      return els.length ? getComputedStyle(els[0]).zIndex : "";
    });
    expect(overlay).toBe("200");
    await page.keyboard.press("Escape");
  });
});

test.describe("v4 serialization cleanups (v2.10)", () => {
  test("the 768 pill-nav active chip renders a clean inset declaration", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const shadow = await page.locator("nav.orb-pill-nav-shadow a").first().evaluate((el) => {
      const chip = el.firstElementChild as HTMLElement | null;
      return chip ? getComputedStyle(chip).boxShadow : "";
    });
    expect(shadow.startsWith("rgba(255, 252, 248, 0.75)")).toBe(true);
    expect(shadow).not.toContain("rgba(0, 0, 0, 0) 0px 0px 0px");
  });

  test("the 768 back-strip button renders a clean raised declaration", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/goals");
    // The back strip renders with the goals view — poll until the Dashboard
    // button exists before reading its shadow (the finder returns null on a
    // not-yet-hydrated page, a sequential-run flake without the poll).
    await expect
      .poll(async () => {
        const btn = await page.evaluate(() => {
          const b = [...document.querySelectorAll("button, a")].find((x) => /Dashboard/i.test(x.textContent ?? "") && x.getBoundingClientRect().width > 50);
          return b ? getComputedStyle(b).boxShadow : null;
        });
        return typeof btn === "string" && btn.length > 0 ? btn : null;
      }, { timeout: 5_000 })
      .toBeTruthy();
    const shadow = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button, a")].find((b) => /Dashboard/i.test(b.textContent ?? "") && b.getBoundingClientRect().width > 50);
      return btn ? getComputedStyle(btn).boxShadow : "";
    });
    expect(shadow.startsWith("rgba(255, 250, 244, 0.78)")).toBe(true);
    expect(shadow).not.toContain("rgba(0, 0, 0, 0) 0px 0px 0px");
  });

  test("the sidebar clock computes radius 50% with a clean inset pair", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const clock = await page.evaluate(() => {
      const els = [...document.querySelectorAll("aside div")].filter((d) => Math.abs(d.getBoundingClientRect().width - 80) < 3);
      return els.length ? { r: getComputedStyle(els[0]).borderRadius.split(" ")[0], sh: getComputedStyle(els[0]).boxShadow } : null;
    });
    expect(clock?.r).toBe("50%");
    expect(clock?.sh.startsWith("rgba(255, 250, 244, 0.8)")).toBe(true);
    expect(clock?.sh).not.toContain("rgba(0, 0, 0, 0) 0px 0px 0px");
  });

  test("the date-picker inner card renders a clean neumorphic pair", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/goals");
    await page.getByRole("button", { name: "New Goal", exact: true }).first().click();
    await page.getByRole("button", { name: "Pick a deadline" }).click();
    const inner = await page.evaluate(() => {
      const chev = [...document.querySelectorAll("button")].find((b) => /month/i.test(b.getAttribute("aria-label") ?? ""));
      if (!chev) return null;
      let node: HTMLElement | null = chev as HTMLElement;
      for (let i = 0; i < 8 && node; i++) {
        if (node.getBoundingClientRect().width > 200 && parseFloat(getComputedStyle(node).borderTopLeftRadius) === 16 && getComputedStyle(node).boxShadow !== "none") break;
        node = node.parentElement;
      }
      return node ? getComputedStyle(node).boxShadow : null;
    });
    expect(inner?.startsWith("rgba(255, 250, 244, 0.78)")).toBe(true);
    expect(inner).not.toContain("rgba(0, 0, 0, 0) 0px 0px 0px");
    await page.keyboard.press("Escape");
  });
});

test.describe("sidebar chrome (v2.10)", () => {
  test("the brand mark sits at x50 and the collapse bar carries pad 8", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const brandX = await page.evaluate(() => {
      const a = [...document.querySelectorAll("aside a")].find((x) => /ORBITAL/i.test(x.textContent ?? "") && x.getBoundingClientRect().height < 20);
      return a ? Math.round(a.getBoundingClientRect().x) : -1;
    });
    expect(brandX).toBe(50);
    const collapse = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("aside button")].filter((b) => Math.abs(b.getBoundingClientRect().width - 208) < 3).pop();
      return btn ? getComputedStyle(btn).padding : "";
    });
    expect(collapse).toBe("8px");
  });
});

test.describe("activity feed (v2.10)", () => {
  test("the Online pill renders the flex-gap dot layout ('Online· N')", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/activity");
    // Poll until the async feed load lands (the count reads '· 0' before the
    // store's refresh resolves). The COUNT is a floor, not an exact value —
    // earlier specs in the suite (goals.spec's create/delete round-trips)
    // legitimately append feed rows before this file runs; 36 is the
    // seeded baseline.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const p = [...document.querySelectorAll("p, span, div")].find((e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 140);
          if (!p) return -1;
          return parseInt(((p.textContent ?? "").match(/(\d+)/) ?? ["0"])[0] ?? "0", 10);
        }), { timeout: 5_000 })
      .toBeGreaterThanOrEqual(36);
    const info = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p, span, div")].find((e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 140);
      if (!p) return null;
      const text = (p.textContent ?? "").replace(/\s+/g, " ").trim();
      const kids = [...p.children].map((c) => {
        const k = c.getBoundingClientRect();
        const kcs = getComputedStyle(c);
        return { text: (c.textContent ?? "").trim(), w: Math.round(k.width), h: Math.round(k.height), fs: kcs.fontSize, fw: kcs.fontWeight, ls: kcs.letterSpacing };
      });
      return { text, tag: p.tagName, w: Math.round(p.getBoundingClientRect().width), gap: getComputedStyle(p).gap, pad: getComputedStyle(p).padding, kids };
    });
    // The structure pin: the flex-gap three-span layout renders "Online· N"
    // (no space before the separator) as [7px dot][Online][· N] spans.
    expect(/^Online· \d+$/.test(info?.text ?? "")).toBe(true);
    expect(info?.tag).toBe("DIV");
    expect(info?.gap).toBe("6px");
    expect(info?.pad).toBe("7px 12px");
    expect(info?.kids?.length).toBe(3);
    expect(info?.kids?.[0]).toMatchObject({ text: "", w: 7, h: 7 }); // the dot
    // v2.10 (re-probed): the live's "Online" span computes 39 wide (11/600
    // ls 0.66px) — the clone's self-hosted DM Sans advances it to 40 (the
    // live serves NO DM Sans file; its font-family falls back to system-ui
    // — a Base44 platform artifact like its public-read API; verified same
    // fs/fw/ls/font-family). Pinned to the clone's stable computed value.
    expect(info?.kids?.[1]).toMatchObject({ text: "Online", w: 40, fs: "11px", fw: "600", ls: "0.66px" });
    expect(info?.kids?.[2]).toMatchObject({ fs: "11px", fw: "400", ls: "normal" });
    // The total width varies with the count's digits (proportional figures:
    // "· 36" renders 103, "· 40" 101) — sanity-bounded, not pinned.
    expect(info?.w ?? 0).toBeGreaterThanOrEqual(95);
    expect(info?.w ?? 0).toBeLessThanOrEqual(110);
  });

  test("the date-group label renders at line-height 15", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/activity");
    // The feed loads async (the store's refresh) — poll until the grouped
    // labels render before reading the line box (the live's span computes
    // lh 15 inside a 24px parent line box).
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const l = [...document.querySelectorAll("span, p")].find((e) => /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().height < 24 && getComputedStyle(e).fontSize === "10px");
          return l ? getComputedStyle(l).lineHeight : null;
        }), { timeout: 5_000 })
      .toBe("15px");
  });
});

test.describe("settings + invite (v2.10)", () => {
  test("the Settings save icon renders at 14px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings");
    // The settings form renders after the async settings load — poll until
    // the Save button + its glyph exist (the shadcn Button base forces 16px
    // on svgs without a size-* class; the explicit size-3.5 opts out).
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const b = [...document.querySelectorAll("button")].find((x) => /Save/i.test(x.textContent ?? "") && x.querySelector("svg"));
          const s = b?.querySelector("svg") ?? null;
          return s ? Math.round(s.getBoundingClientRect().width) : null;
        }), { timeout: 5_000 })
      .toBe(14);
  });

  test("the invite dialog: h2 lh 16, 12px/500 labels, 36px role toggles", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/team");
    await page.getByRole("button", { name: /Invite/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const h2 = await dialog.evaluate((el) => {
      const h = el.querySelector("h2");
      if (!h) return null;
      const cs = getComputedStyle(h);
      return { fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing };
    });
    expect(h2?.fs).toBe("16px");
    expect(h2?.fw).toBe("500");
    expect(h2?.lh).toBe("16px");
    expect(h2?.ls).toBe("-0.4px");
    const label = await dialog.locator("label").first().evaluate((l) => {
      const cs = getComputedStyle(l);
      return { fs: cs.fontSize, fw: cs.fontWeight, tt: cs.textTransform, lh: cs.lineHeight, mb: cs.marginBottom };
    });
    expect(label.fs).toBe("12px");
    expect(label.fw).toBe("500");
    expect(label.tt).toBe("none");
    expect(label.mb).toBe("6px");
    const role = await dialog.evaluate((el) => {
      const b = [...el.querySelectorAll("button")].find((x) => /^member$/i.test((x.textContent ?? "").trim()));
      if (!b) return null;
      const cs = getComputedStyle(b);
      return { h: Math.round(b.getBoundingClientRect().height), fs: cs.fontSize, r: cs.borderRadius.split(" ")[0] };
    });
    expect(role?.h).toBe(36);
    expect(role?.fs).toBe("13px");
    expect(role?.r).toBe("10px");
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });
});

test.describe("user menu popover (v2.10)", () => {
  test("the popover opens 8px below the pill (sideOffset 8)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const pill = page.locator("main button").filter({ hasText: /demo/ }).first();
    await expect(pill).toBeVisible();
    await pill.click();
    const logout = page.getByRole("button", { name: "Log Out" });
    await expect(logout).toBeVisible();
    // v2.10 (F12, measured on the live): the popover panel's top sits
    // EXACTLY 8px below the pill's bottom edge (the live's CSS computes
    // top: calc(100% + 8px); the re-probe measured pill-bottom 92 →
    // popover-top 100). Radix's sideOffset is that gap in px. The enter
    // animation (zoom-in-95 + slide-in-from-top-2) shifts the top edge
    // mid-flight (8 − 1.7 ≈ 6.3 observed) — poll until it settles.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const wrapper = document.querySelector("[data-radix-popper-content-wrapper]");
          const inner = wrapper?.firstElementChild;
          const trigger = [...document.querySelectorAll("main button")].find((b) => /demo/i.test(b.textContent ?? ""));
          if (!inner || !trigger) return null;
          return Math.round((inner.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom) * 10) / 10;
        }), { timeout: 5_000 })
      .toBe(8);
    await page.keyboard.press("Escape");
  });
});

test.describe("login page (v2.10)", () => {
  // These pins measure the LOGGED-OUT card, so they opt out of the shared
  // storageState (same pattern as the v29 login block). v2.11 (F13): /login
  // renders the card for authenticated visitors too — the behavioral pin
  // lives in auth.spec; the geometry below is state-independent.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the card computes 746 tall with a 4px backdrop blur", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    const card = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div")].filter((d) => {
        const cs = getComputedStyle(d);
        const r = d.getBoundingClientRect();
        return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
      });
      return cards.length ? { h: Math.round(cards[0].getBoundingClientRect().height), blur: getComputedStyle(cards[0]).backdropFilter } : null;
    });
    expect(card?.h).toBe(746);
    expect(card?.blur).toBe("blur(4px)");
  });

  test("the footer sits inside the form's bottom block; the live's computed margins", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login");
    // v2.10 (re-probed): the live's form uses v3-style space-y — the
    // margins land on the LATER children: the input wrapper carries
    // mt 6 (the label itself mb 0 — its 6px visual gap is the wrapper's
    // margin), the password block mt 16, the bottom block mt 20, the
    // footer mt 12. The labels render INLINE (the live's shadcn v3 Label
    // carries no flex base) — their 24px strut line box makes each field
    // block 78 tall. Tailwind v4's space-y flips margins onto the EARLIER
    // children, so the clone mirrors the live with explicit mt utilities.
    const data = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;
      const signin = [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim()));
      // The footer STRIP is the direct parent of the "Forgot password?"
      // button (a text-content finder matches the enclosing bottom block
      // first — document order puts ancestors before descendants).
      const forgot = [...form.querySelectorAll("button")].find((b) => /Forgot password\?/.test((b.textContent ?? "").trim()));
      const footer = forgot?.parentElement ?? null;
      const labels = [...form.querySelectorAll("label")];
      const label = labels[1] ?? null;
      const passwordBlock = label?.parentElement ?? null;
      const inputWrap = passwordBlock?.querySelector("div") ?? null;
      const bottomBlock = signin?.parentElement ?? null;
      return {
        labelMb: label ? getComputedStyle(label).marginBottom : "",
        labelDisplay: label ? getComputedStyle(label).display : "",
        inputWrapMt: inputWrap ? getComputedStyle(inputWrap).marginTop : "",
        passwordBlockMt: passwordBlock ? getComputedStyle(passwordBlock).marginTop : "",
        fieldBlockH: passwordBlock ? Math.round(passwordBlock.getBoundingClientRect().height) : 0,
        bottomBlockMt: bottomBlock ? getComputedStyle(bottomBlock).marginTop : "",
        footerInForm: !!footer && form.contains(footer),
        footerMt: footer ? getComputedStyle(footer).marginTop : "",
      };
    });
    expect(data?.labelMb).toBe("0px");
    expect(data?.labelDisplay).toBe("inline");
    expect(data?.inputWrapMt).toBe("6px");
    expect(data?.passwordBlockMt).toBe("16px");
    expect(data?.fieldBlockH).toBe(78);
    expect(data?.bottomBlockMt).toBe("20px");
    expect(data?.footerInForm).toBe(true);
    expect(data?.footerMt).toBe("12px");
  });
});
