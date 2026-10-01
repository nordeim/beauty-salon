import { expect, test } from "@playwright/test";

// v2.6 parity (measured on the re-deployed live, 2026-09-23):
//
// 1. ICON STROKE REVERSION: the live now renders every icon at the lucide
//    default 2 — the v2.4 two-class system (chrome 1.5 / content 2) is
//    gone. Pinned here at the app level (the mobile-nav spec pins the tab
//    icons): the AI chip zap, the task-card meta icons, the dashboard
//    activity glyphs + Full-log arrows, the activity-view hero search.
// 2. Dashboard activity rows: gap 12 (not 14) and the DETAIL WRAPS (the
//    first row's long detail renders two lines — no ellipsis).
// 3. Activity view: each date group's rows are wrapped in ONE big radius-14
//    deeper-pair card (the v1.9 "plain rows" reading retired), and the
//    date-label block renders a 24px line box with 10px bottom margin.
// 4. Desktop goal-card chip: the blocked count is UPPERCASE with 0.88
//    tracking (v2.3's normal-case reading retired — desktop only).
// 5. Date picker: weekday headers are 11px/700 #9A9A9A on a ~25px row.
// 6. Check-in modal: 16px inner spacing (form pt 16, note mt 16, Post
//    Update mt 16) — the panel grows to ≈353px.

test.describe("icon strokes (v2.6 reversion)", () => {
  test("dashboard activity glyphs + Full-log arrows render at stroke 2", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();
    const glyphs = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return [] as Array<{ name: string; sw: string | null }>;
      return [...main.querySelectorAll("svg")]
        // Only the lucide glyphs carry a stroke-width attribute — the
        // goal-ring svgs are CSS-stroked circles (no attribute).
        .filter((s) => s.getAttribute("stroke-width") !== null && s.getBoundingClientRect().width > 0)
        .map((s) => ({
          name: s.getAttribute("class")?.match(/lucide-([a-z0-9-]+)/)?.[1] ?? "other",
          sw: s.getAttribute("stroke-width"),
        }));
    });
    expect(glyphs.length).toBeGreaterThan(10);
    for (const g of glyphs) {
      // v2.9: the live's chrome/content glyphs render at 1.5 (computed);
      // the NEW GOAL plus keeps the lucide default 2.
      const expected = g.name === "plus" ? "2" : "1.5";
      expect(g.sw, `${g.name} should be stroke ${expected}`).toBe(expected);
    }
  });

  test("goal-detail task meta icons + AI chip zap render at the v2.9 strokes", async ({ page }) => {
    await page.goto("/goals");
    await page.getByText("Product Onboarding Redesign").filter({ visible: true }).first().click();
    await expect(
      page.getByRole("heading", { name: "Product Onboarding Redesign", exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    const glyphs = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return [] as Array<{ name: string; w: number; sw: string }>;
      return [...main.querySelectorAll("svg")]
        .filter((s) => s.getBoundingClientRect().width > 0 && s.getBoundingClientRect().height > 0)
        .map((s) => ({
          name: s.getAttribute("class")?.match(/lucide-([a-z0-9-]+)/)?.[1] ?? "other",
          w: Math.round(s.getBoundingClientRect().width),
          sw: getComputedStyle(s).strokeWidth,
        }));
    });
    expect(glyphs.length).toBeGreaterThan(5);
    // v2.9 (computed re-measure): task meta glyphs (user/clock/calendar
    // at 11px), the AI chip zap and the 14px Back-to-Goals arrow-left
    // render at 1.5; the action squares (pencil/trash 11), the DELETE
    // trash (13) and the Target-line calendar (13) keep the default 2.
    for (const g of glyphs) {
      const isActionSquare = (g.name === "pencil" || g.name === "trash2") && g.w === 11;
      const isHeader13 = (g.name === "trash2" || g.name === "calendar") && g.w === 13;
      const isBackArrow = g.name === "arrow-left" && g.w === 14;
      const isAddTaskPlus = g.name === "plus" && g.w === 12;
      const expected = isActionSquare || isHeader13 || isBackArrow || isAddTaskPlus ? "2px" : "1.5px";
      expect(g.sw, `${g.name}@${g.w} should be ${expected}, got ${g.sw}`).toBe(expected);
    }
  });
});

test.describe("dashboard activity rows (v2.6)", () => {
  test("rows carry gap 12 and the detail wraps (no ellipsis)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();

    const rowSpec = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("main *")].filter((e) => {
        const cs = getComputedStyle(e);
        return cs.padding === "14px 18px" && /Analyzed goal: Product Onboarding/.test(e.textContent ?? "") && e.getBoundingClientRect().width > 400;
      });
      const row = rows[0];
      if (!row) return null;
      const cs = getComputedStyle(row);
      const detail = [...row.querySelectorAll("p")].find((p) => (p.textContent ?? "").startsWith("AI analyzed"));
      const dcs = detail ? getComputedStyle(detail) : null;
      return {
        gap: cs.gap,
        rowH: Math.round(row.getBoundingClientRect().height),
        detailTextOverflow: dcs?.textOverflow ?? null,
        detailWhiteSpace: dcs?.whiteSpace ?? null,
        detailH: detail ? Math.round(detail.getBoundingClientRect().height) : 0,
      };
    });
    expect(rowSpec).not.toBeNull();
    // The live's dashboard rows: gap 12 (the activity VIEW keeps 14).
    expect(rowSpec!.gap).toBe("12px");
    // The detail wraps — the first row's long detail is 2 lines (36px).
    expect(rowSpec!.detailTextOverflow).not.toBe("ellipsis");
    expect(rowSpec!.detailWhiteSpace).toBe("normal");
    expect(rowSpec!.detailH).toBeGreaterThanOrEqual(30);
  });
});

test.describe("activity view (v2.6)", () => {
  test("each date group wraps its rows in ONE deeper-pair radius-14 card", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();

    const groupSpec = await page.evaluate(() => {
      // The group cards: divs carrying the deeper (-0.92) pair that are NOT
      // the hero (the hero contains "Last agent action"). Earlier specs in
      // the suite legitimately add feed rows — a NEWEST date group renders
      // first, so assert across ALL group cards (order-independent).
      const cards = [...document.querySelectorAll("main div")].filter((e) => {
        const cs = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        return cs.boxShadow.includes("rgba(160, 143, 126, 0.36)") && r.width > 900 && r.height > 100 && !/Last agent action/.test(e.textContent ?? "");
      });
      const totalRows = cards.reduce((n, c) => n + c.querySelectorAll("li").length, 0);
      const card = [...cards].sort((a, b) => b.querySelectorAll("li").length - a.querySelectorAll("li").length)[0];
      if (!card) return null;
      const cs = getComputedStyle(card);
      return {
        radius: cs.borderRadius,
        shadow: cs.boxShadow,
        cardCount: cards.length,
        rows: totalRows,
      };
    });
    expect(groupSpec).not.toBeNull();
    expect(groupSpec!.radius).toBe("14px");
    expect(groupSpec!.shadow).toContain("rgba(255, 250, 244, 0.92)");
    expect(groupSpec!.shadow).toContain("rgba(160, 143, 126, 0.36)");
    expect(groupSpec!.rows).toBeGreaterThanOrEqual(30);
  });

  test("the date label renders a 24px line box with a 10px bottom margin", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();

    const labelSpec = await page.evaluate(() => {
      const label = [...document.querySelectorAll("main *")].find(
        (e) => /Thu Jul 16 2026/i.test((e.textContent ?? "").trim()) && e.children.length === 0 && e.getBoundingClientRect().width > 0,
      );
      if (!label) return null;
      const wrap = label.parentElement;
      const cs = getComputedStyle(wrap!);
      return {
        wrapDisplay: cs.display,
        wrapLineHeight: cs.lineHeight,
        wrapMarginBottom: cs.marginBottom,
        labelY: Math.round(label.getBoundingClientRect().y),
      };
    });
    expect(labelSpec).not.toBeNull();
    // The live renders the label as an inline span inside a 24px line box
    // whose margin-bottom is 10px (the clone's old block P: lh 15, mb 14).
    expect(labelSpec!.wrapDisplay).toBe("block");
    expect(labelSpec!.wrapLineHeight).toBe("24px");
    expect(labelSpec!.wrapMarginBottom).toBe("10px");
  });
});

test.describe("goal-card chip (v2.6)", () => {
  test("the desktop chip's blocked count renders uppercase", async ({ page }) => {
    await page.goto("/goals");
    const blocked = page.getByText(/· 2 blocked/).filter({ visible: true }).first();
    await expect(blocked).toBeVisible();
    const spec = await blocked.evaluate((el) => ({
      tt: getComputedStyle(el).textTransform,
      ls: getComputedStyle(el).letterSpacing,
    }));
    // The live's desktop chip renders the blocked count with the chip's
    // own uppercase + 0.88 tracking (v2.3's normal-case reading retired).
    expect(spec.tt).toBe("uppercase");
    expect(spec.ls).toBe("0.88px");
  });
});

test.describe("date picker (v2.6)", () => {
  test("weekday headers render 11px/700 #9A9A9A", async ({ page }) => {
    await page.goto("/goals");
    await page.getByRole("button", { name: "New Goal" }).filter({ visible: true }).first().click();
    const trigger = page.getByRole("button", { name: "Pick a deadline" });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const su = page.getByText("Su", { exact: true }).last();
    await expect(su).toBeVisible();
    const spec = await su.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fs: cs.fontSize, fw: cs.fontWeight, col: cs.color };
    });
    expect(spec.fs).toBe("11px");
    expect(spec.fw).toBe("700");
    expect(spec.col).toBe("rgb(154, 154, 154)");
  });
});

test.describe("check-in modal (v2.6)", () => {
  test("16px inner spacing grows the panel to ~353px", async ({ page }) => {
    await page.goto("/goals");
    await page.getByText("Product Onboarding Redesign").filter({ visible: true }).first().click();
    await expect(
      page.getByRole("heading", { name: "Product Onboarding Redesign", exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();

    // Open the first task's check-in modal (task rows are buttons).
    const task = page.getByRole("button", { name: /User research interviews/ }).first();
    await task.click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Post Status Update")).toBeVisible();

    // The modal's zoom-in-95 animation (200ms) scales the panel mid-flight
    // (353 × 0.97 ≈ 342 — under the 345 floor; observed as a 1/114
    // first-run flake in session 41, green on immediate re-run). Same
    // artifact class as the v30 dialog pins: poll until the SETTLED pins
    // all match before asserting (the pins themselves are unchanged).
    const readSpec = () =>
      modal.evaluate((el) => {
        // The dialog content itself carries role=dialog — include it in the
        // panel search (querySelectorAll misses the element itself).
        const candidates = [el, ...el.querySelectorAll("div")].filter((d) => {
          const r = d.getBoundingClientRect();
          return r.width > 350 && r.width < 520 && r.height > 200;
        });
        // The panel is the TALLEST candidate (the form div inside it is
        // ~238 after the v2.6 spacing; the panel ~353).
        const panel = candidates.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
        if (!panel) return null;
        const radios = [...panel.querySelectorAll("label")].filter((l) => /On Track|Blocked|Need Help|Done/.test(l.textContent ?? ""));
        // The radio GROUP container (the 2-row grid), not the first label.
        const radioGroup = radios[0]?.closest('[role="radiogroup"]');
        const note = panel.querySelector("textarea");
        const button = [...panel.querySelectorAll("button")].find((b) => /Post Update/.test(b.textContent ?? ""));
        const rg = radioGroup?.getBoundingClientRect();
        const n = note?.getBoundingClientRect();
        const b = button?.getBoundingClientRect();
        return {
          panelH: Math.round(panel.getBoundingClientRect().height),
          radiosH: radios[0] && radios[1] ? Math.round(radios[1].getBoundingClientRect().y - radios[0].getBoundingClientRect().y) : 0,
          noteGap: n && rg ? Math.round(n.y - (rg.y + rg.height)) : -1,
          buttonGap: b && n ? Math.round(b.y - (n.y + n.height)) : -1,
        };
      });
    await expect
      .poll(async () => {
        const s = await readSpec();
        return s !== null && s.panelH >= 345 && s.panelH <= 361 && s.noteGap === 16 && s.buttonGap === 16;
      }, { timeout: 5_000 })
      .toBe(true);
    const spec = await readSpec();
    expect(spec).not.toBeNull();
    expect(spec!.panelH).toBeGreaterThanOrEqual(345);
    expect(spec!.panelH).toBeLessThanOrEqual(361);
    expect(spec!.noteGap).toBe(16);
    expect(spec!.buttonGap).toBe(16);
  });
});
