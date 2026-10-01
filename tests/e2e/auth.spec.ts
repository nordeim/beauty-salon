import { expect, test } from "@playwright/test";

// Login surface: the /login route renders the reference auth card, rejects
// bad credentials, signs the demo user in, and honors authenticated visits.
// This file OPTS OUT of the shared storageState (empty cookies) because it
// tests the logged-out surface. (Deliberately does NOT probe the rate
// limiter — 10 attempts/IP/15 min would poison the whole suite.)

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login route", () => {
  test("renders the auth card with the circular logo chip", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Project Management App" })).toBeVisible();

    // v2.3: the logo is a white CIRCULAR chip (rounded-full + ring-4
    // ring-white/50 + shadow-lg), not the retired rounded-square mark.
    // (Tailwind v4 computes rounded-full as calc(infinity * 1px) → Chrome
    // reports 33554432px, and ring-white/50 serializes in oklab() — so the
    // assertions check the geometry and the 4px ring, not exact strings.)
    const chip = page.locator("span.rounded-full.ring-4").first();
    await expect(chip).toBeVisible();
    const radius = await chip.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(radius).toBeGreaterThan(1000);
    const shadow = await chip.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toMatch(/0\.5\) 0px 0px 0px 4px/);
  });

  test("wrong password is rejected without a session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@orbital.app");
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    // .first(): a double-render of the toast (observed once in a full-suite
    // run) must not turn the rejection check into a strict-mode violation —
    // any visible instance proves the 401 path.
    await expect(page.getByText("Incorrect email or password").first()).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid credentials sign in and land on the workspace", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@orbital.app");
    await page.getByLabel("Password").fill("Demo1234!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    // Desktop chrome: the sticky sidebar (not the mobile app bar) is the
    // visible landmark once signed in.
    await expect(page.locator("aside")).toBeVisible();
  });

  test("authenticated visits render the login card (the live's behavior — no redirect)", async ({ page }) => {
    // F13/v2.11 (measured on the live 2026-09-24): the reference renders
    // the FULL login card for authenticated visitors — the URL stays on
    // /login, the card is byte-identical to the logged-out one, and
    // signing in from that state lands on the workspace. The clone
    // redirected authenticated visitors to / from v1.4 to v2.10; that
    // drift is now closed (the page renders the card unconditionally).
    const res = await page.request.post("/api/auth/login", {
      data: { email: "demo@orbital.app", password: "Demo1234!" },
    });
    expect(res.ok()).toBeTruthy();
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Welcome to Project Management App" })).toBeVisible();
    // Re-signing in from the authenticated state lands on the workspace
    // (the live's flow: POST → router lands on from_url, default "/").
    await page.getByLabel("Email").fill("demo@orbital.app");
    await page.getByLabel("Password").fill("Demo1234!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  });
});
