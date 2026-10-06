import { expect, test } from "@playwright/test";

// Auth'd-state parity — the logged-in links-layer census (session 19).
//
// The session-18 candidate list flagged the unmeasured surface: every
// prior census ran logged-out (or login-SURFACE-only — the card, the
// focus rings, the error states). This spec is the logged-in walk,
// measured on the live reference (agent-browser, the task brief's
// credentials, 2026-10-06):
//
//   - the live lands on "/" after sign-in (the marketing landing page —
//     the "dashboard" of the task brief's reference image; no separate
//     dashboard surface exists)
//   - /login re-renders the FULL sign-in card when auth'd — no redirect,
//     no "already signed in" state
//   - the header, mobile drawer, and footer carry their standard
//     logged-out sets with NO account/logout affordance anywhere
//   - /book does not prefill from the session (every field stays empty)
//   - unknown routes render the standard 404 slate card when auth'd
//     (probed /account /dashboard /profile /logout /admin /settings —
//     every one renders the 404 state; no auth'd-only routes exist)
//
// The live's auth'd state is INVISIBLE on the app surface: the base44
// platform authenticates (the httpOnly cookie) but the app never reads
// it — no route, chrome element, form, or fallback branches on the
// session. The clone matches every measured behavior (auth-neutral
// chrome, router.push("/"), no prefill). These assertions make the
// invisibility an executable contract: a future "improvement" (an
// account link, a login redirect, a prefill) fails here instead of
// silently diverging from the measured reference.
//
// The pin-gap pattern (sessions 16/18): the code already holds every
// stance — the spec lands green immediately; if it ever fails, the code
// drifted, not the spec.
//
// Rate-limiter note: the UI sign-in here is one more POST against
// checkRateLimit's 10-attempt/15-min/IP window (~5 used across the
// whole suite) — documented so a future tightening re-checks the budget.

const DEMO_EMAIL = "sepnetflix2023@outlook.com";
const DEMO_PASSWORD = "$Abcd1234";

test.describe("authed-state parity (the logged-in chrome census)", () => {
  test("AS1: the UI sign-in lands on the marketing landing page (the live's post-login target)", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // The live-measured post-login target: "/" with the site banner.
    // (Overlaps auth.spec.ts's transition contract deliberately — this
    // spec's subject is the auth'd STATE; the transition is its entry.)
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Boost Your Natural Beauty" })).toBeVisible();

    // AS3's census needs the session cookie to persist for the rest of
    // the walk — the context carries it from here on.
  });

  test("AS2: /login re-renders the full sign-in card when auth'd — no redirect", async ({ page }) => {
    // Establish the auth'd state, then revisit /login.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    await page.goto("/login");
    // The live re-renders the card; the URL stays /login.
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome to Beauty Salon" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("AS3: the auth'd chrome carries the standard sets — no account affordance anywhere", async ({ page }) => {
    // Establish the auth'd state.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    // Header: the standard set — brand + the five nav links + BOOK NOW.
    // NO account/logout/sign-out element.
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("link", { name: "Maison Luminaire" })).toBeVisible();
    for (const item of ["Treatments", "Gallery", "Atelier", "Story", "Visit"]) {
      await expect(banner.getByRole("link", { name: item, exact: true })).toBeVisible();
    }
    await expect(banner.getByRole("link", { name: "BOOK NOW" })).toBeVisible();
    // The drawer toggle is the mobile-only surface (lg:hidden — hidden at
    // the desktop viewport; the live's button is likewise a CSS-hidden
    // DOM node at desktop, as the live census's programmatic click
    // demonstrated). It becomes visible below lg — asserted in the drawer
    // section after the viewport resize.
    await expect(banner.getByRole("button", { name: "Open menu" })).toBeHidden();

    // The census: nothing in the banner matches the account family.
    const bannerText = await banner.innerText();
    expect(bannerText.toLowerCase()).not.toMatch(/account|log\s?out|sign\s?out|profile/);

    // Mobile drawer (mobile viewport): the standard item set, no account.
    // Scoped to the drawer container (the mobile-navigation convention) —
    // the footer behind the overlay carries matching link texts.
    await page.setViewportSize({ width: 390, height: 844 });
    const menuToggle = page.getByRole("button", { name: "Open menu" });
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    const drawer = page.locator("div.fixed.inset-0.z-\\[60\\]");
    await expect(drawer).toBeVisible();
    // The five nav links + the drawer CTA ("Book an appointment" — the
    // raw accessible text; the CSS uppercase transform is display-only).
    const drawerItems = ["Treatments", "Gallery", "Atelier", "Story", "Visit"];
    for (const item of drawerItems) {
      await expect(drawer.getByRole("link", { name: item, exact: true })).toBeVisible();
    }
    await expect(drawer.getByRole("link", { name: "Book an appointment" })).toBeVisible();
    const drawerText = await drawer.innerText();
    expect(drawerText.toLowerCase()).not.toMatch(/account|log\s?out|sign\s?out|profile/);

    // Footer: the standard link set (nav + socials + the four legal
    // links — title-case raw text; the CSS uppercase transform is
    // display-only) — no account items.
    await page.setViewportSize({ width: 1280, height: 900 });
    const footer = page.getByRole("contentinfo");
    for (const item of ["Book", "Services", "Team", "Gallery", "About", "Contact"]) {
      await expect(footer.getByRole("link", { name: item, exact: true })).toBeVisible();
    }
    for (const item of ["Privacy", "Terms", "Accessibility", "Refund"]) {
      await expect(footer.getByRole("link", { name: item, exact: true })).toBeVisible();
    }
    const footerText = await footer.innerText();
    expect(footerText.toLowerCase()).not.toMatch(/account|log\s?out|sign\s?out|profile/);
  });

  test("AS4: /book does not prefill from the session — every field stays empty", async ({ page }) => {
    // Establish the auth'd state.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    await page.goto("/book");
    const values = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input, select, textarea")).map((el) => ({
        kind: `${el.tagName.toLowerCase()}:${(el as HTMLInputElement).type || "-"}`,
        value: (el as HTMLInputElement).value,
      })),
    );
    // The live-measured stance: no session prefill anywhere.
    expect(values.length).toBeGreaterThan(5);
    for (const v of values) {
      expect(v.value, `${v.kind} must stay empty`).toBe("");
    }
  });

  test("AS5: an unknown route while auth'd renders the standard 404 slate card", async ({ page }) => {
    // Establish the auth'd state.
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(DEMO_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    // The not-found-parity convention: the path interpolation is a
    // post-hydration client patch — assert on the paragraph with the
    // retrying toContainText.
    const p = page.locator("main p.text-slate-600");
    await expect(p).toContainText('The page "account" could not be found in this application.');
    await expect(page.getByRole("button", { name: "Go Home" })).toBeVisible();
  });
});
