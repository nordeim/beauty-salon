import { expect, test } from "@playwright/test";

// v2.7 parity (measured on the re-deployed live, 2026-09-23):
//
// 1. ANCHOR NAVIGATION: every view-switch surface on the live is now a real
//    <a href> link — sidebar nav ×6 (+ brand + TASKS STATUS widget), mobile
//    tab bar ×4 (More stays a button), 768 pill nav ×6, MORE sheet rows ×3,
//    dashboard stat wells ×3, goal wells, "Full log" ×2, the New Goal pill
//    (/goals?new=true), and the goals-view cards (/goals/<id>).
// 2. NEW VIEW /tasks: the all-tasks view (h1 "Tasks" + "31 total tasks
//    across all goals" + five count chips + TaskCard rows WITHOUT action
//    squares; the row click is inert on the live — a WIP seam faithfully
//    replicated). No mobile tab is active on /tasks.
// 3. The Home tab icon is lucide layout-dashboard (was layout-grid).
// 4. The dashboard completion RING is a plain cursor-pointer div whose
//    click does nothing (the live's ring is dead; the user pill's Log Out
//    popover still works on both).
// 5. The mobile app-bar brand is not clickable.

test.describe("anchor navigation (v2.7)", () => {
  test("the sidebar nav renders real links with the reference href map", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();
    // The sidebar carries TWO nav groups (Workspace + Management) — six
    // links total across both.
    const links = sidebar.locator("nav a");
    await expect(links).toHaveCount(6);
    await expect(links.nth(0)).toHaveAttribute("href", "/");
    await expect(links.nth(1)).toHaveAttribute("href", "/goals");
    await expect(links.nth(2)).toHaveAttribute("href", "/my-tasks");
    await expect(links.nth(3)).toHaveAttribute("href", "/activity");
    await expect(links.nth(4)).toHaveAttribute("href", "/team");
    await expect(links.nth(5)).toHaveAttribute("href", "/settings");
    // The labels keep the sidebar wording.
    await expect(links.nth(3)).toContainText("Agent Activity");
  });

  test("the sidebar brand and TASKS STATUS widget are links", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("aside").first();
    const brand = sidebar.locator('a[href="/"]').first();
    await expect(brand).toBeVisible();
    // The TASKS STATUS widget is a link (NOT the nav's My Tasks item —
    // filter by its text to dodge the strict-mode collision).
    const status = sidebar.locator('a[href="/my-tasks"]').filter({ hasText: "Tasks Status" });
    await expect(status).toBeVisible();
  });

  test("dashboard stat wells, goal wells, Full log, and New Goal render links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("ACTIVE GOALS", { exact: false }).filter({ visible: true }).first()).toBeVisible();

    // Stat wells: Active Goals -> /goals; Blocked + Completed -> /my-tasks.
    const main = page.locator("main");
    await expect(main.locator('a[href="/goals"]').filter({ hasText: "Active Goals" })).toBeVisible();
    await expect(main.locator('a[href="/my-tasks"]').filter({ hasText: "Blocked Tasks" })).toBeVisible();
    await expect(main.locator('a[href="/my-tasks"]').filter({ hasText: "Completed Tasks" })).toBeVisible();

    // Goal wells -> /goals/<id> (the seeded goals).
    const goalLinks = main.locator('a[href^="/goals/"]');
    await expect(goalLinks.filter({ hasText: "Product Onboarding Redesign" })).toBeVisible();

    // Full log x2 -> /activity and /goals.
    await expect(main.locator('a[href="/activity"]').filter({ hasText: "Full log" })).toBeVisible();
    await expect(main.locator('a[href="/goals"]').filter({ hasText: "Full log" })).toBeVisible();

    // The New Goal pill -> /goals?new=true.
    await expect(page.locator('a[href="/goals?new=true"]').filter({ hasText: "New Goal" })).toBeVisible();
  });

  test("goals-view cards are links to /goals/<id>", async ({ page }) => {
    await page.goto("/goals");
    await expect(page.getByRole("heading", { name: "Goals", exact: true }).filter({ visible: true }).first()).toBeVisible();
    // Role queries exclude the hidden mobile/desktop variants — the first
    // visible card link is the desktop one.
    const card = page.getByRole("link", { name: /Product Onboarding Redesign/ }).first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("href", /^\/goals\/[a-z0-9]+$/);
    await card.click();
    await expect(page).toHaveURL(/\/goals\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "Product Onboarding Redesign" }).filter({ visible: true }).first()).toBeVisible();
  });

  test("the New Goal link navigates to /goals and opens the wizard (soft nav)", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/goals?new=true"]').filter({ hasText: "New Goal" }).click();
    await expect(page).toHaveURL(/\/goals\?new=true$/);
    // The wizard overlay opens (the "Tell me about your goal" panel).
    await expect(page.getByText(/tell me about your goal/i).first()).toBeVisible();
  });

  test("/goals?new=true auto-opens the wizard on a hard load", async ({ page }) => {
    await page.goto("/goals?new=true");
    // The wizard overlay auto-opens on the hard load. The modal dialog
    // hides the background from role queries — assert the dialog itself
    // (not the covered h1).
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/tell me about your goal/i);
    await expect(page).toHaveURL(/\/goals\?new=true/);
  });
});

test.describe("the /tasks view (v2.7)", () => {
  test("serves the all-tasks view with counts from the data", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.getByRole("heading", { name: "Tasks", exact: true }).filter({ visible: true }).first()).toBeVisible();
    // The subtitle + five chips carry the workspace counts. Derive them
    // from the API so the assertions stay order-independent when earlier
    // specs create or delete tasks (the seed baseline: 31 / 2 / 1 / 2 / 26).
    const res = await page.request.get("/api/tasks");
    const tasks = (await res.json()).data as Array<{ status: string }>;
    await expect(page.getByText(`${tasks.length} total tasks across all goals`).filter({ visible: true }).first()).toBeVisible();
    const count = (status: string) => tasks.filter((t) => t.status === status).length;
    await expect(page.getByRole("button", { name: new RegExp(`^All \\(${tasks.length}\\)`) }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^Pending \\(${count("pending")}\\)`) }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^In Progress \\(${count("in_progress")}\\)`) }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^Blocked \\(${count("blocked")}\\)`) }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^Done \\(${count("done")}\\)`) }).filter({ visible: true }).first()).toBeVisible();
  });

  test("rows render the TaskCard stack with NO action squares and an inert click", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.getByText("total tasks across all goals").filter({ visible: true }).first()).toBeVisible();
    // The rows are plain divs (cursor-pointer), not buttons/links.
    const rowButtons = page.locator('main button').filter({ hasText: /Open task/ });
    await expect(rowButtons).toHaveCount(0);
    // No edit/delete action squares in the list (unlike goal-detail).
    await expect(page.locator('main button[aria-label^="Edit task"]')).toHaveCount(0);
    await expect(page.locator('main button[aria-label^="Delete task"]')).toHaveCount(0);
    // Clicking a row opens no dialog (the live's inert seam).
    const firstRow = page.locator("main h4").first();
    await firstRow.click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // The row card geometry: pad 14/18, radius 14.
    const cardBox = await page.evaluate(() => {
      const h4 = document.querySelector("main h4");
      if (!h4) return null;
      let el: HTMLElement = h4 as HTMLElement;
      while (el && getComputedStyle(el).padding !== "14px 18px") el = el.parentElement as HTMLElement;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { pad: cs.padding, radius: cs.borderRadius, cursor: cs.cursor, tag: el.tagName };
    });
    expect(cardBox).toMatchObject({ pad: "14px 18px", radius: "14px", cursor: "pointer", tag: "DIV" });
  });

  test("the status filter chips switch the visible rows", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.getByText("total tasks across all goals").filter({ visible: true }).first()).toBeVisible();
    // Derive the blocked count from the API (order-independent).
    const res = await page.request.get("/api/tasks");
    const tasks = (await res.json()).data as Array<{ status: string }>;
    const blockedCount = tasks.filter((t) => t.status === "blocked").length;
    await page.getByRole("button", { name: new RegExp(`^Blocked \\(${blockedCount}\\)`) }).filter({ visible: true }).first().click();
    // The blocked tasks render (seed: "Review Q3 project milestones").
    const rows = page.locator("main h4");
    expect(await rows.count()).toBe(blockedCount);
    if (blockedCount > 0) {
      await expect(rows.first()).toContainText(/milestones|task/i);
    }
  });

  test("the mobile MORE sheet links Tasks to /tasks and no tab is active there", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    // click (not tap): this describe's context has no hasTouch.
    await page.getByRole("button", { name: "More", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    // The rows are links now: Tasks -> /tasks, Team -> /team, Settings -> /settings.
    await expect(sheet.getByRole("link", { name: "Tasks", exact: true })).toHaveAttribute("href", "/tasks");
    await expect(sheet.getByRole("link", { name: "Team", exact: true })).toHaveAttribute("href", "/team");
    await expect(sheet.getByRole("link", { name: "Settings", exact: true })).toHaveAttribute("href", "/settings");
    await sheet.getByRole("link", { name: "Tasks", exact: true }).click();
    await expect(page).toHaveURL(/\/tasks\/?$/);
    await expect(page.getByRole("heading", { name: "Tasks", exact: true }).filter({ visible: true }).first()).toBeVisible();
    // While on /tasks NO mobile tab carries the active well.
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.locator(".orb-nav-active")).toHaveCount(0);
    // And the list renders rows (order-independent: match the API).
    const res = await page.request.get("/api/tasks");
    const tasks = (await res.json()).data as unknown[];
    await expect(page.locator("main h4").first()).toBeVisible();
    expect(await page.locator("main h4").count()).toBe(tasks.length);
  });
});

test.describe("dead interaction seams (v2.7)", () => {
  test("the completion ring is a plain cursor-pointer div that does not navigate", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("84%", { exact: false }).filter({ visible: true }).first()).toBeVisible();
    const ring = await page.evaluate(() => {
      const mains = [...document.querySelectorAll("main")].filter((m) => m.getBoundingClientRect().height > 100);
      const main = mains[0];
      if (!main) return null;
      const el = [...main.querySelectorAll("div")].find(
        (d) => Math.round(d.getBoundingClientRect().width) === 180 && Math.round(d.getBoundingClientRect().height) === 180,
      );
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { tag: el.tagName, cursor: cs.cursor, role: el.getAttribute("role"), label: el.getAttribute("aria-label") };
    });
    expect(ring).toMatchObject({ tag: "DIV", cursor: "pointer", role: null });
    // Clicking the ring does NOT navigate away from the dashboard.
    await page.evaluate(() => {
      const mains = [...document.querySelectorAll("main")].filter((m) => m.getBoundingClientRect().height > 100);
      const main = mains[0];
      const el = [...main!.querySelectorAll("div")].find(
        (d) => Math.round(d.getBoundingClientRect().width) === 180 && Math.round(d.getBoundingClientRect().height) === 180,
      );
      el!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      el!.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/\/$/);
  });

  test("the mobile app-bar brand is not a clickable control", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const banner = page.getByRole("banner");
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("button", { name: /orbital home/i })).toHaveCount(0);
    await expect(banner.getByRole("link", { name: /orbital/i })).toHaveCount(0);
  });
});

test.describe("mobile + pill nav anchor census (v2.7)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the four view tabs are links with the reference hrefs; More stays a button", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Goals", exact: true })).toHaveAttribute("href", "/goals");
    await expect(nav.getByRole("link", { name: "My Tasks", exact: true })).toHaveAttribute("href", "/my-tasks");
    await expect(nav.getByRole("link", { name: "Agent", exact: true })).toHaveAttribute("href", "/activity");
    await expect(nav.getByRole("button", { name: "More", exact: true })).toBeVisible();
  });

  test("the Home tab icon is lucide layout-dashboard (v2.7 swap)", async ({ page }) => {
    await page.goto("/");
    const icon = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Home", exact: true }).locator("svg").first();
    await expect(icon).toHaveClass(/lucide-layout-dashboard/);
    // v2.9: computed stroke 1.5 (the live's inline-style override).
    await expect(icon).toHaveCSS("stroke-width", "1.5px");
  });
});

test.describe("pill nav anchor census (768)", () => {
  test.use({ viewport: { width: 768, height: 844 } });

  test("the six pill items are links with the reference hrefs", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Goals", exact: true })).toHaveAttribute("href", "/goals");
    await expect(nav.getByRole("link", { name: "Tasks", exact: true })).toHaveAttribute("href", "/my-tasks");
    await expect(nav.getByRole("link", { name: "Activity", exact: true })).toHaveAttribute("href", "/activity");
    await expect(nav.getByRole("link", { name: "Team", exact: true })).toHaveAttribute("href", "/team");
    await expect(nav.getByRole("link", { name: "Settings", exact: true })).toHaveAttribute("href", "/settings");
  });
});
