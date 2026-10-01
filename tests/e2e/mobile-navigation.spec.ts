import { expect, test } from "@playwright/test";

// Mobile navigation (390×844 — the reference's mobile chrome, v1.7–v2.7):
// the full-bleed app bar, the bottom tab bar with the ACTIVE tab's
// inset-well chip, the MORE bottom sheet, and the 768 middle state's
// floating pill nav. This is the highest-regression-risk chrome — the
// active-tab well was added in v2.3 after re-measuring the live app, and
// v2.4 pinned the chip's FULL-TAB WIDTH (the live's chips stretch across
// the whole tab; the More button renders 8px wider via its flex basis).
// v2.7 (measured live): the four view tabs are now real <a href> links
// (the MORE button stays a button); the Home icon is layout-dashboard.
// Contexts arrive AUTHENTICATED (setup-project storageState).

// A touch-enabled 390×844 chromium context (the iPhone geometry without
// switching browsers — locator.tap needs hasTouch).
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("app bar and bottom tab bar render", async ({ page }) => {
    const bar = page.getByRole("banner");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS("height", "62px");

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    // v2.7: the four view tabs are LINKS; More stays a button.
    for (const label of ["Home", "Goals", "My Tasks", "Agent"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("button", { name: "More", exact: true })).toBeVisible();
  });

  test("the ACTIVE tab carries the inset-well chip (v2.3/v2.4 parity)", async ({ page }) => {
    const home = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Home", exact: true });
    const chip = home.locator("span").first();

    // The wrapper chip: well background + the BRIGHT inset pair.
    await expect(chip).toHaveCSS("background-color", "rgb(235, 231, 226)");
    await expect(chip).toHaveCSS("border-radius", "14px");
    const shadow = await chip.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgba(255, 252, 248, 0.75)");
    expect(shadow).toContain("rgba(180, 165, 150, 0.32)");
    expect(shadow).toContain("inset");

    // v2.4 (measured live): the chip FILLS the tab — the live's tab anchors
    // carry no padding and the inner chip stretches to the full tab width
    // (73.2 of 73.2 at 390). A content-width chip (the v2.3 clone bug) is
    // ~36px — half the tab.
    const chipBox = await chip.boundingBox();
    const tabBox = await home.boundingBox();
    expect(chipBox).not.toBeNull();
    expect(tabBox).not.toBeNull();
    expect(Math.abs((chipBox?.width ?? 0) - (tabBox?.width ?? 0))).toBeLessThan(2);
  });

  test("the MORE tab renders wider than the view tabs (v2.4 flex-basis parity)", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const home = nav.getByRole("link", { name: "Home", exact: true });
    const more = nav.getByRole("button", { name: "More", exact: true });
    const homeBox = await home.boundingBox();
    const moreBox = await more.boundingBox();
    expect(homeBox).not.toBeNull();
    expect(moreBox).not.toBeNull();
    // The live's More button carries 8px of horizontal padding that
    // participates in its flex basis (content-box sizing), rendering it
    // ~6.4px wider than each view tab (81.2 vs 73.2 at 390).
    expect((moreBox?.width ?? 0) - (homeBox?.width ?? 0)).toBeGreaterThan(4);
  });

  test("tab bar icons render at the live's computed stroke 1.5 (v2.9)", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const home = nav.getByRole("link", { name: "Home", exact: true });
    const icon = home.locator("svg").first();
    await expect(icon).toBeVisible();
    // v2.9 (computed-style re-measure): the live stamps inline
    // `stroke-width: 1.5` styles on every chrome icon — the attribute
    // reads 2 but CSS beats presentation attributes, so the COMPUTED
    // stroke is 1.5 (the v2.6 attribute census missed the override).
    await expect(icon).toHaveCSS("stroke-width", "1.5px");
    // The bar is content-height driven: pad 8/12 + chip 53.5 = 73.5 (the
    // v2.3 clone's min-h-[54px] forced 74).
    const bar = nav;
    await expect(bar).toHaveCSS("padding", "8px 8px 12px");
  });

  test("INACTIVE tabs render no well", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const goalsChip = nav.getByRole("link", { name: "Goals", exact: true }).locator("span").first();
    await expect(goalsChip).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const shadow = await goalsChip.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toBe("none");
  });

  test("tab taps switch views and move the well", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Goals", exact: true }).tap();
    await expect(page).toHaveURL(/\/goals\/?$/);
    await expect(page.getByRole("heading", { name: "Goals", exact: true }).filter({ visible: true }).first()).toBeVisible();

    const goalsChip = nav.getByRole("link", { name: "Goals", exact: true }).locator("span").first();
    await expect(goalsChip).toHaveCSS("background-color", "rgb(235, 231, 226)");
    // Home lost the well.
    const homeChip = nav.getByRole("link", { name: "Home", exact: true }).locator("span").first();
    await expect(homeChip).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("MORE opens the bottom sheet and navigates; never carries the well", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const more = nav.getByRole("button", { name: "More", exact: true });

    // MORE has no well wrapper at all (its active state is color-only).
    await expect(more.locator("span.orb-nav-active")).toHaveCount(0);

    await more.tap();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    // v2.8 (measured live): the brand textContent is the literal "ORBITAL"
    // (no text-transform — the old "Orbital" + uppercase reading retired).
    await expect(sheet).toContainText("ORBITAL");
    // v2.7: the sheet rows are real links now; Tasks targets the new
    // /tasks (all-tasks) view.
    await expect(sheet.getByRole("link", { name: "Tasks", exact: true })).toHaveAttribute("href", "/tasks");

    await sheet.getByRole("link", { name: "Team", exact: true }).tap();
    await expect(page).toHaveURL(/\/team\/?$/);
    await expect(page.getByRole("heading", { name: "Team", exact: true }).filter({ visible: true }).first()).toBeVisible();
    // The sheet closed on navigation.
    await expect(page.getByRole("dialog")).toBeHidden();

    // MORE stays well-free while Team is active.
    await expect(more.locator("span.orb-nav-active")).toHaveCount(0);
  });

  test("mobile team header shows the short INVITE label; AI Agents header stays inline", async ({ page }) => {
    await page.goto("/team");
    // The header pill (aria-label "Invite Member") is the FIRST match — the
    // empty-state button carries the same visible text.
    const invite = page.getByRole("button", { name: "Invite Member" }).first();
    await expect(invite).toBeVisible();
    // v2.3: below sm the visible label is just "Invite" (the long text is
    // the accessible name; the sm:hidden span carries the short one).
    await expect(invite.getByText("Invite Member")).toBeHidden();
    await expect(invite.getByText("Invite", { exact: true })).toBeVisible();

    // v2.3: the NEW AGENT button stays on the AI Agents header row.
    const agentsHeading = page.getByRole("heading", { name: "AI Agents" });
    const newAgent = page.getByRole("button", { name: "New Agent" });
    const headingBox = await agentsHeading.boundingBox();
    const buttonBox = await newAgent.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs((headingBox?.y ?? 0) - (buttonBox?.y ?? 0))).toBeLessThan(40);
    expect(buttonBox!.x).toBeGreaterThan(200); // right-aligned on the row
  });
});

test.describe("middle state (768) navigation", () => {
  test.use({ viewport: { width: 768, height: 844 } });

  test("the floating pill nav carries the six desktop tabs with an inset-well active chip", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    // v2.7: the pill items are links (the pill's "Tasks" targets
    // /my-tasks, NOT the /tasks view — measured live).
    for (const label of ["Home", "Goals", "Tasks", "Activity", "Team", "Settings"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    const home = nav.getByRole("link", { name: "Home", exact: true });
    // v2.9: the active well treatment lives on the INNER chip (the
    // anchor is a bare flex wrapper — the live's A > chip structure).
    const chip = home.locator("span").first();
    await expect(chip).toHaveCSS("background-color", "rgb(235, 231, 226)");
    const box = await nav.boundingBox();
    expect(box?.width).toBeGreaterThan(400);
    expect(box?.width).toBeLessThan(560);
    expect(box?.x).toBeGreaterThan(100); // centered, not full-width
  });

  test("no app bar and no bottom tab bar at md", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeHidden();
    // The mobile bottom bar is the Primary nav that CONTAINS the More
    // button — it stays in the DOM (display:none) at md, so assert it is
    // hidden rather than absent.
    const mobileBar = page
      .locator('nav[aria-label="Primary"]')
      .filter({ has: page.getByRole("button", { name: "More", exact: true }) });
    await expect(mobileBar).toBeHidden();
  });
});
