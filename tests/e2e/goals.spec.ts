import { expect, test } from "@playwright/test";

// Goals surface: the seeded demo workspace lists its goals in the live
// app's order (v2.3 seed fix), the blocked count renders lowercase inside
// the otherwise-uppercase chip, goal cards navigate to the detail view,
// and deletes confirm inline (never in a modal). Contexts arrive
// AUTHENTICATED (setup-project storageState).

test.describe("goals view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/goals");
  });

  test("lists the seeded goals in the reference order", async ({ page }) => {
    const titles = page
      .locator("main h2, main p, main div")
      .getByText(/^(Product Onboarding Redesign|Launch new landing page|Q3 Content Marketing Campaign)$/)
      .filter({ visible: true });
    // Wait for the store's async fetch to render the seeded cards before
    // reading the order (count() does not auto-wait).
    await expect(titles.nth(0)).toBeVisible();
    const seen: string[] = [];
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = (await titles.nth(i).textContent())?.trim();
      if (text && !seen.includes(text)) seen.push(text);
    }
    // v2.3: sortOrder 1/2/3 = Product Onboarding, Launch, Q3 — the live's
    // display order (the API orders by sortOrder asc, createdAt desc).
    expect(seen.slice(0, 3)).toEqual([
      "Product Onboarding Redesign",
      "Launch new landing page",
      "Q3 Content Marketing Campaign",
    ]);
  });

  test("the blocked count renders uppercase with the chip's tracking (v2.6)", async ({ page }) => {
    const blocked = page.getByText(/· \d+ blocked/).filter({ visible: true }).first();
    await expect(blocked).toBeVisible();
    // v2.6: the re-deployed live renders the DESKTOP chip's blocked count
    // with the chip's own uppercase + 0.88 tracking — the v2.3 normal-case
    // reading retired (the MOBILE card's blocked span keeps normal-case,
    // pinned in the mobile describe below).
    await expect(blocked).toHaveCSS("text-transform", "uppercase");
    await expect(blocked).toHaveCSS("letter-spacing", "0.88px");
    await expect(blocked).toHaveText(/· 2 blocked/);
  });

  test("goal cards navigate to the detail view", async ({ page }) => {
    // v2.7: the goal cards are real <a href="/goals/<id>"> links now.
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await expect(page).toHaveURL(/\/goals\/[a-z0-9]+/i);
    await expect(page.getByRole("heading", { name: "Product Onboarding Redesign" })).toBeVisible();
  });
});

test.describe("mobile goal cards (v2.4)", () => {
  // The live's mobile card (re-measured 2026-09-22): the status renders as
  // BARE text (dot + 11px uppercase label, NO pill background) and the
  // percentage moves into a small WELL CHIP — bg #EBE7E2, radius 8, pad
  // 3px 10px, the 2px inset pair. The desktop card keeps the pill status
  // chip + bare 42px pct (unchanged since v1.6).
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test.beforeEach(async ({ page }) => {
    await page.goto("/goals");
  });

  test("the status is bare text and the percentage carries the well chip", async ({ page }) => {
    // Wait for the seeded cards.
    const firstCard = page.getByRole("link", { name: /Product Onboarding Redesign/ }).first();
    await expect(firstCard).toBeVisible();

    // The percentage: a well chip (v2.4) — bg, radius 8, inset pair.
    const pct = firstCard.getByText("67%", { exact: true });
    await expect(pct).toBeVisible();
    await expect(pct).toHaveCSS("background-color", "rgb(235, 231, 226)");
    await expect(pct).toHaveCSS("border-radius", "8px");
    await expect(pct).toHaveCSS("padding", "3px 10px");
    const shadow = await pct.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgba(255, 250, 244, 0.8)");
    expect(shadow).toContain("rgba(160, 143, 126, 0.28)");
    expect(shadow).toContain("inset");

    // The status label: BARE text — no pill background, no padding. (The
    // span wraps dot + label + blocked count, so match by containment.)
    const status = firstCard.locator("span").filter({ hasText: "Active" }).first();
    await expect(status).toBeVisible();
    await expect(status).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(status).toHaveCSS("padding", "0px");
    await expect(status).toHaveCSS("text-transform", "uppercase");
  });
});

test.describe("goal detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/goals");
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await expect(page.getByRole("heading", { name: "Product Onboarding Redesign" })).toBeVisible();
  });

  test("add-task dialog opens, validates, and creates a task", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Validation: an empty title keeps the submit disabled.
    const submit = dialog.getByRole("button", { name: "Add Task" });
    await expect(submit).toBeDisabled();

    await dialog.getByLabel("Title").fill("E2E verification task");
    await submit.click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText("E2E verification task").filter({ visible: true }).first()).toBeVisible();

    // Cleanup (v2.7): delete the scratch task so later specs — /tasks
    // counts, activity feed floors — see the pristine seed counts.
    const list = (await (await page.request.get("/api/tasks")).json()).data as Array<{ id: string; title: string }>;
    const scratch = list.find((t) => t.title === "E2E verification task");
    if (scratch) await page.request.delete(`/api/tasks/${scratch.id}`);
  });

  test("deletes confirm inline and remove the goal", async ({ page }) => {
    // Create a scratch goal through the API so seeded data stays intact.
    const res = await page.request.post("/api/goals", {
      data: { title: "E2E scratch goal", description: "created by Playwright" },
    });
    expect(res.ok()).toBeTruthy();
    const { id } = (await res.json()).data as { id: string };

    await page.goto(`/goals/${id}`);
    await expect(page.getByRole("heading", { name: "E2E scratch goal" })).toBeVisible();

    // Inline confirm — no AlertDialog. The goal header's DELETE pill swaps
    // for the confirm pair (task-card deletes carry "Delete task …" labels,
    // so the exact "Delete" name is unique).
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Delete goal & all tasks?")).toBeVisible();
    await page.getByRole("button", { name: "Yes, Delete" }).click();

    await expect(page).toHaveURL(/\/goals\/?$/);
    await expect(page.getByText("E2E scratch goal")).toHaveCount(0);
  });
});
