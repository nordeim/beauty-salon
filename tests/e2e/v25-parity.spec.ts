import { expect, test } from "@playwright/test";

// v2.5 parity (measured on the re-deployed live, 2026-09-22):
//
// 1. The activity view renders the hero entry AGAIN as the first row of
//    its date group — "Online · N" equals the number of `… ago` rows
//    (the old clone sliced the hero out of the groups).
// 2. The dashboard's Agent Activity panel caps at 20 rows.
// 3. The logged-out LOG IN button carries the live's spec — r12 / pad
//    11px 20px / the standard raised pair at desktop, r10 / pad 6px 14px /
//    the small -3px pair in the mobile app bar.
// 4. The seed mirrors the live's regenerated workspace data: a 36-entry
//    feed (3 goal_analyzed + 3 tasks_generated + 30 task_assigned, one
//    "Thu Jul 16 2026" group), goal 2's new 9-task plan (Templates
//    Base44's overdue A/B task), and goal 3's new 10-task plan (the
//    manual "Draft Q3 blog post calendar").
//
// The feed/seed describes run AUTHENTICATED (the setup project's
// storageState); the logged-out describe opts out with an empty state.

test.describe("activity feed (v2.5 parity)", () => {
  test("the hero entry also renders in its date group — Online · N == N ago rows", async ({ page }) => {
    await page.goto("/activity");
    await expect(
      page.getByRole("heading", { name: "Agent Activity", exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    // Wait for the FEED CONTENT (the heading/pill render on the static
    // shell — the rows arrive with the store's fetch; reading the pill
    // count before that races and sees "Online · 0").
    await expect(page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();

    // The pill's count — the v2.5 seed carries 36 entries; earlier specs in
    // the suite may have legitimately added feed rows (the add-task and
    // scratch-goal checks in goals.spec), so the floor — not the exact
    // count — is what stays stable in a full run.
    // v2.10: the pill is a DIV (mirroring the live's DOM; it was a <p>
    // before the re-probe).
    const pill = page.locator("div.orb-well-pill").filter({ hasText: "Online" }).first();
    await expect(pill).toBeVisible();
    const pillText = await pill.innerText();
    const online = parseInt((pillText.match(/(\d+)/) ?? ["0"])[0]!, 10);
    expect(online).toBeGreaterThanOrEqual(36);

    // Every feed entry renders a timestamped group row — the hero (no
    // timestamp of its own) included. The old clone rendered N−1 rows.
    const agoRows = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return 0;
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let count = 0;
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (/\bago$/.test((node.textContent ?? "").trim())) count += 1;
      }
      return count;
    });
    expect(agoRows).toBe(online);

    // The hero's message repeats as the FIRST row of its date group (the
    // v2.5 semantic, measured on the live) — robust to feed additions.
    const heroMsg = await page.locator(".orb-row-card").filter({ hasText: "Last agent action" }).first().innerText();
    const firstRow = await page.locator("main section[aria-label] li").first().innerText();
    expect(firstRow).toContain(heroMsg.split("\n")[0]!.trim());
  });

  test("the seeded feed carries the goal-analysis hero and 12-task generation", async ({ page }) => {
    await page.goto("/activity");
    // The v2.5 seed's newest entry — present as a feed row regardless of
    // later additions by the suite's mutating specs.
    await expect(
      page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText('Generated 12 tasks for "Product Onboarding Redesign"').filter({ visible: true }).first(),
    ).toBeVisible();
  });

  test("the dashboard activity panel caps at 20 rows", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AGENT ACTIVITY", { exact: false }).filter({ visible: true }).first()).toBeVisible();
    // Wait for the feed itself (the panel header renders on the static
    // shell — the rows arrive with the store's fetch).
    await expect(page.getByText("Analyzed goal: Product Onboarding Redesign").filter({ visible: true }).first()).toBeVisible();
    const agoRows = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return 0;
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let count = 0;
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (/\bago$/.test((node.textContent ?? "").trim())) count += 1;
      }
      return count;
    });
    expect(agoRows).toBe(20);

    // v2.5: the NPA derives from the first blocked TASK in display order
    // (the live's semantics — its feed has no status updates).
    await expect(
      page.getByText('Resolve blocker on "Review Q3 project milestones"').filter({ visible: true }).first(),
    ).toBeVisible();
  });

  test("goal 2 detail renders the regenerated landing-page plan", async ({ page }) => {
    await page.goto("/goals");
    await page.getByText("Launch new landing page").filter({ visible: true }).first().click();
    await expect(
      page.getByRole("heading", { name: "Launch new landing page", exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    // The live's new task set incl. the Templates Base44 A/B task.
    await expect(page.getByText("Set up A/B test for landing page hero").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Templates Base44").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Write homepage copy").filter({ visible: true }).first()).toBeVisible();
  });

  test("goal 3 detail renders the regenerated content-campaign plan", async ({ page }) => {
    await page.goto("/goals");
    await page.getByText("Q3 Content Marketing Campaign").filter({ visible: true }).first().click();
    await expect(
      page.getByRole("heading", { name: "Q3 Content Marketing Campaign", exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("Draft Q3 blog post calendar").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Write 4 long-form blog posts").filter({ visible: true }).first()).toBeVisible();
  });
});

test.describe("logged-out shell (v2.5 parity)", () => {
  // These tests probe the logged-out surface — no shared session cookie.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.describe("desktop", () => {
    test("LOG IN carries the live's desktop spec (r12 · pad 11/20 · raised pair)", async ({ page }) => {
      await page.goto("/");
      const btn = page.getByRole("button", { name: "Log in" }).filter({ visible: true }).first();
      await expect(btn).toBeVisible();

      const spec = await btn.evaluate((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return { radius: cs.borderRadius, pad: cs.padding, shadow: cs.boxShadow, h: rect.height };
      });
      // v2.5 (measured live at 1440 and 768): radius 12, vertical padding
      // 11px (content-driven h40 = 11 + lh18 + 11 — no fixed height), the
      // standard raised pair. The clone's rounded-xl resolved to 20px
      // through the shadcn --radius override.
      expect(spec.radius).toBe("12px");
      expect(spec.pad).toBe("11px 20px");
      expect(spec.shadow).toContain("rgba(255, 250, 244, 0.78)");
      expect(spec.shadow).toContain("rgba(160, 143, 126, 0.27)");
      expect(Math.round(spec.h)).toBe(40);
    });
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    test("LOG IN carries the live's mobile app-bar spec (r10 · small pair)", async ({ page }) => {
      await page.goto("/");
      const btn = page.getByRole("button", { name: "Log in" }).filter({ visible: true }).first();
      await expect(btn).toBeVisible();

      const spec = await btn.evaluate((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return { radius: cs.borderRadius, pad: cs.padding, shadow: cs.boxShadow, h: rect.height };
      });
      // v2.5 (measured live at 390): radius 10, pad 6px 14px (h≈28.5),
      // the SMALL -3px/-3px 6px raised pair.
      expect(spec.radius).toBe("10px");
      expect(spec.pad).toBe("6px 14px");
      expect(spec.shadow).toContain("rgba(255, 250, 244, 0.78)");
      expect(spec.shadow).toContain("rgba(160, 143, 126, 0.22)");
      expect(Math.round(spec.h)).toBeLessThanOrEqual(29);
    });
  });
});
