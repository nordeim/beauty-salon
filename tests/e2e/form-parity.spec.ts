import { expect, test } from "@playwright/test";

// Form-control parity (session 12) — the first both-sides form census went
// beyond the settled DOM into the STATE layer: what each form renders while
// submitting, on success, and on failure. The live reference (measured
// 2026-10-05, agent-browser, plus its deobfuscated bundle) is fire-and-forget
// — POST failures are swallowed and treated as success — its success and
// loading texts are ASCII-dot forms, its login error is a red shadcn Alert
// card, and its date/time inputs sit 2px taller than the clone's via a
// UA-intrinsic mechanism (replicated via `::-webkit-datetime-edit` padding
// in globals.css — see docs/remediation-plan-session-12.md §2 F2 for why the
// mechanism itself is unattributable). Same rule as every parity spec:
// if this fails, the code drifted, not the spec.

const NOTES_PLACEHOLDER =
  "Anything we should know — inspiration, allergies, previous treatments...";

// trap 7: v4's opacity modifier serializes as oklab channels where the
// live's v3 emitted rgba() — pixels identical. bg-red-50/70: the red-50
// base (#fef2f2 — pinned in @theme) has an oklab lightness ~0.977, far
// from every other red shade; the alpha is exact.
function expectRed50Alpha70(color: string) {
  const m = /^oklab\(([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) \/ ([\d.]+)\)$/.exec(color);
  expect(m, `expected an oklab red-50 color, got: ${color}`).not.toBeNull();
  expect(Number(m![4])).toBe(0.7);
  expect(Number(m![1])).toBeGreaterThan(0.96);
  expect(Number(m![1])).toBeLessThan(0.99);
}

test.describe("form parity (the control census + the loading/success/failure states)", () => {
  // ── F1 + F2: the book form's control metrics ────────────────────────────

  test("F1: the Notes textarea is not resizable (resize-none)", async ({ page }) => {
    await page.goto("/book");
    const notes = page.getByPlaceholder(NOTES_PLACEHOLDER);
    await expect(notes).toBeVisible();
    const resize = await notes.evaluate((el) => getComputedStyle(el).resize);
    expect(resize).toBe("none");
  });

  test("F2: the date and time inputs render 2px taller than the text fields (48 vs 46)", async ({
    page,
  }) => {
    await page.goto("/book");
    // NOTE: React omits the default type="text" attribute on the name
    // input (the live reference's DOM is identical — verified), so the
    // census reads the .type PROPERTY by position instead of attribute
    // selectors.
    const readings = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input")) as HTMLInputElement[];
      const byType = (t: string) => inputs.find((el) => el.type === t) ?? null;
      return {
        text: byType("text")?.offsetHeight ?? 0,
        email: byType("email")?.offsetHeight ?? 0,
        date: byType("date")?.offsetHeight ?? 0,
        time: byType("time")?.offsetHeight ?? 0,
      };
    });
    // The live reference: content box = line-height + 2px on the UA-widget
    // inputs only (48px), while the plain text inputs stay at 46px.
    expect(readings.text).toBe(46);
    expect(readings.email).toBe(46);
    expect(readings.date).toBe(48);
    expect(readings.time).toBe(48);
  });

  // ── The census guards (the settled control layer, pinned as a net) ─────

  test("guard: the book form's control census (order, types, required flags, options)", async ({
    page,
  }) => {
    await page.goto("/book");
    const census = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input,select,textarea")).map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: (el as HTMLInputElement).type,
        required: (el as HTMLInputElement).required,
      })),
    );
    expect(census).toEqual([
      { tag: "input", type: "text", required: true },
      { tag: "input", type: "email", required: true },
      { tag: "input", type: "tel", required: false },
      { tag: "select", type: "select-one", required: false },
      { tag: "select", type: "select-one", required: true },
      { tag: "input", type: "date", required: true },
      { tag: "input", type: "time", required: true },
      { tag: "textarea", type: "textarea", required: false },
    ]);

    const selects = page.locator("select");
    const stylistOpts = await selects.nth(0).locator("option").allTextContents();
    expect(stylistOpts).toEqual([
      "No preference",
      "Amelia Voss",
      "Julian Reyes",
      "Nadia Okafor",
    ]);
    const serviceOpts = await selects.nth(1).locator("option").allTextContents();
    expect(serviceOpts[0]).toBe("Select a service");
    expect(serviceOpts).toHaveLength(9);
    expect(serviceOpts[8]).toBe("Bridal Atelier · $750");
  });

  test("guard: the login input census (ids, types, placeholders)", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator("input#email");
    const password = page.locator("input#password");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("placeholder", "you@example.com");
    await expect(password).toHaveAttribute("type", "password");
    await expect(password).toHaveAttribute("placeholder", "••••••••");
  });

  test("guard: the newsletter input census (placeholder, pill shape, height)", async ({
    page,
  }) => {
    await page.goto("/");
    const input = page.getByPlaceholder("Your email");
    await expect(input).toHaveClass(/px-6 py-4 rounded-full/);
    const h = await input.evaluate((el) => (el as HTMLInputElement).offsetHeight);
    expect(h).toBe(54);
  });

  // ── F3: the newsletter success state (a real subscribe) ────────────────

  test("F3: a real subscribe renders the reference's success contract", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Your email").fill(`e2e-form-${Date.now()}@maisonluminaire.test`);
    await page.getByRole("button", { name: /Claim 15% off/ }).click();

    const success = page.locator("div.mt-12 > div.inline-flex");
    await expect(success).toBeVisible({ timeout: 10_000 });

    // The exact text node (leading space included — byte-parity with the
    // live's JSX children join) and the sage color.
    const text = await success.evaluate((el) => el.textContent);
    expect(text).toBe(" You're in. Check your inbox for your 15% code.");
    await expect(success).toHaveClass(
      /inline-flex items-center gap-3 text-\[11px\] uppercase tracking-editorial text-secondary/,
    );
    const color = await success.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(75, 93, 79)"); // sage — text-secondary

    // The lucide Check icon at the reference's class sizing.
    const check = success.locator("svg");
    await expect(check).toHaveClass(/lucide-check h-4 w-4/);
  });

  // ── F4: the newsletter error path (fire-and-forget → success) ──────────

  test("F4: a failed newsletter POST still renders the success state", async ({ page }) => {
    await page.route("**/api/newsletter", (route) => route.abort());
    await page.goto("/");
    await page.getByPlaceholder("Your email").fill("abort-me@maisonluminaire.test");
    await page.getByRole("button", { name: /Claim 15% off/ }).click();

    // The reference swallows POST failures (catch → success) — no error UI
    // exists anywhere in its bundle.
    await expect(page.getByText(/You're in\. Check your inbox/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Something went wrong/)).toHaveCount(0);
  });

  // ── F8: the newsletter loading state ───────────────────────────────────

  test("F8: the newsletter button says Sending... and keeps its arrow while loading", async ({
    page,
  }) => {
    await page.route("**/api/newsletter", async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto("/");
    await page.getByPlaceholder("Your email").fill("loading-state@maisonluminaire.test");
    const button = page.getByRole("button", { name: /Claim 15% off|Sending/ });
    await button.click();

    // ASCII dots (the reference's bundle) + the arrow stays rendered.
    await expect(button).toContainText("Sending...");
    await expect(button.locator("svg.lucide-arrow-right")).toBeVisible();
    await expect(button).toBeDisabled();
  });

  // ── F5: the booking error path (fire-and-forget → always navigate) ─────

  test("F5: a failed booking POST still navigates to the confirmation", async ({ page }) => {
    await page.route("**/api/appointments", (route) => route.abort());
    await page.goto("/book");
    await page.getByLabel(/Full name/i).fill("Form Parity");
    await page.getByLabel(/Email/i).fill("form-parity@maisonluminaire.test");
    await page.getByLabel(/Service/i).selectOption("balayage");
    await page.getByLabel(/Preferred date/i).fill("2026-11-12");
    await page.getByLabel(/Preferred time/i).fill("14:30");
    await page.getByRole("button", { name: /Request appointment/ }).click();

    // The reference's submit: try { POST } catch {} → navigate regardless.
    await expect(page).toHaveURL(/\/book\/confirmation/, { timeout: 10_000 });
    const params = new URL(page.url()).searchParams;
    expect(params.get("name")).toBe("Form Parity");
    expect(params.get("date")).toBe("2026-11-12");
    expect(params.get("time")).toBe("14:30");
    expect(params.get("service")).toBe("balayage");
    // No error UI ever renders.
    await expect(page.locator("form [role=alert]")).toHaveCount(0);
  });

  // ── F9: the booking loading state ──────────────────────────────────────

  test("F9: the booking button says Reserving... and keeps its arrow while submitting", async ({
    page,
  }) => {
    await page.route("**/api/appointments", async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto("/book");
    await page.getByLabel(/Full name/i).fill("Loading State");
    await page.getByLabel(/Email/i).fill("loading@maisonluminaire.test");
    await page.getByLabel(/Service/i).selectOption("hydrafacial");
    await page.getByLabel(/Preferred date/i).fill("2026-11-13");
    await page.getByLabel(/Preferred time/i).fill("10:00");
    const button = page.getByRole("button", { name: /Request appointment|Reserving/ });
    await button.click();

    await expect(button).toContainText("Reserving...");
    await expect(button.locator("svg.lucide-arrow-right")).toBeVisible();
    await expect(button).toBeDisabled();

    // The delayed fulfill completes → the navigation still happens.
    await expect(page).toHaveURL(/\/book\/confirmation/, { timeout: 10_000 });
  });

  // ── F6: the login error state (the red Alert card) ─────────────────────

  test("F6: wrong credentials render the reference's red Alert card", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("nobody@maisonluminaire.test");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    const alert = page.locator("main [role=alert]");
    await expect(alert).toBeVisible({ timeout: 10_000 });

    // The text has no trailing period (the live's toast text, byte-exact).
    expect((await alert.textContent())?.trim()).toBe("Invalid email or password");

    // The reference's shadcn Alert class set (the [&>svg] arbitrary variants
    // are inert without an svg child — replicated verbatim; text-red-700
    // lives on the INNER div, read back below).
    await expect(alert).toHaveClass(/bg-red-50\/70 border-red-200 rounded-xl/);
    await expect(alert).toHaveClass(/\[\&>svg\]:absolute/);

    const cs = await alert.evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        bg: c.backgroundColor,
        border: c.borderColor,
        radius: c.borderRadius,
        padding: c.padding,
      };
    });
    expectRed50Alpha70(cs.bg); // trap 7: rgba(254,242,242,.7) pixels
    expect(cs.border).toBe("rgb(254, 202, 202)"); // red-200 pinned sRGB
    expect(cs.radius).toBe("12px");
    expect(cs.padding).toBe("16px");

    const inner = alert.locator("div");
    const innerColor = await inner.evaluate((el) => getComputedStyle(el).color);
    expect(innerColor).toBe("rgb(185, 28, 28)"); // red-700 pinned sRGB
  });

  // ── F7: the login loading state ────────────────────────────────────────

  test("F7: the login button says Signing in... and disables its inputs while loading", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid email or password" }),
      });
    });
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("loading@maisonluminaire.test");
    await page.getByLabel("Password", { exact: true }).fill("whatever");
    const button = page.locator("button[type=submit]");
    await button.click();

    // ASCII dots + BOTH inputs disabled (the platform shell's behavior).
    await expect(button).toContainText("Signing in...");
    await expect(button).toBeDisabled();
    await expect(page.locator("input#email")).toBeDisabled();
    await expect(page.locator("input#password")).toBeDisabled();

    // The delayed 401 lands → the Alert card renders (no rate-limit hit —
    // the interception fulfills before the server sees the request).
    await expect(page.locator("main [role=alert]")).toBeVisible({ timeout: 10_000 });
  });
});
