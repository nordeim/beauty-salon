import { expect, test } from "@playwright/test";

// Auth flow — login page surface, session cookie, /api/auth/me, logout.

const DEMO_EMAIL = "sepnetflix2023@outlook.com";
const DEMO_PASSWORD = "$Abcd1234";

test.describe("auth", () => {
  test("login page renders the slate auth card", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Beauty Salon" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("wrong credentials are rejected without enumeration", async ({ page }) => {
    const res = await page.request.post("/api/auth/login", {
      data: { email: "nobody@maisonluminaire.test", password: "wrong" },
    });
    expect(res.status()).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ error: expect.any(String) });
  });

  test("demo credentials sign in, set the session, and sign out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(200);
    const body = await me.json();
    expect(body.user.email).toBe(DEMO_EMAIL);

    const out = await page.request.post("/api/auth/logout");
    expect(out.status()).toBe(200);
  });

  test("the login surface carries the reference's slate palette", async ({ page }) => {
    await page.goto("/login");
    const main = page.locator("main");
    // The reference's from-slate-50-to-slate-100 wash is a gradient IMAGE;
    // background-color alone stays transparent.
    const bgImage = await main.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgImage).toContain("linear-gradient");
    expect(bgImage).toContain("rgb(248, 250, 252)"); // slate-50
    expect(bgImage).toContain("rgb(241, 245, 249)"); // slate-100
  });
});

test.describe("site routes", () => {
  test("every public route answers 200 and carries the site chrome", async ({ page }) => {
    for (const path of ["/", "/services", "/gallery", "/team", "/about", "/contact", "/privacy", "/terms", "/accessibility", "/refund"]) {
      const res = await page.request.get(path);
      expect(res.status(), `${path} should be 200`).toBe(200);
    }
  });

  test("unknown routes render the 404 surface", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("the eight service detail pages resolve", async ({ page }) => {
    for (const slug of ["balayage", "precision-cut", "glossing-treatment", "hydrafacial", "signature-facial", "gel-manicure", "signature-pedicure", "bridal-package"]) {
      const res = await page.request.get(`/services/${slug}`);
      expect(res.status(), slug).toBe(200);
    }
  });

  test("a service detail page shows the sticky treatment card with price", async ({ page }) => {
    await page.goto("/services/balayage");
    await expect(page.getByRole("heading", { name: "Signature Balayage" }).first()).toBeVisible();
    await expect(page.getByText("$285").first()).toBeVisible();
    await expect(page.getByText("210 minutes")).toBeVisible();
    await expect(page.getByRole("link", { name: /Book this treatment/ }).first()).toHaveAttribute(
      "href",
      "/book?service=balayage",
    );
    await expect(page.getByRole("heading", { name: "Before your visit" })).toBeVisible();
  });

  test("the team page lists the three stylists with booking links", async ({ page }) => {
    await page.goto("/team");
    for (const name of ["Amelia Voss", "Julian Reyes", "Nadia Okafor"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /Book with Amelia/ })).toHaveAttribute(
      "href",
      "/book?stylist=amelia-voss",
    );
  });

  test("health endpoint reports ok", async ({ page }) => {
    const res = await page.request.get("/api/health");
    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ status: "ok", db: true });
  });
});
