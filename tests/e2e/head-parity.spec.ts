import { expect, test } from "@playwright/test";

// Head parity — the live-measured favicon + manifest contract (session 10).
// The <head> layer is invisible to every innerText/computed-style
// instrument (they read document.body), yet the favicon is the one
// browser-VISIBLE head element: the reference shows its logo in the tab,
// the clone showed the browser default. Values measured on the reference
// app with agent-browser (see docs/remediation-plan-session-10.md §5.5).
// If a change breaks this spec, the change is wrong — not the spec.
//
// Measured contract (live):
// - <link rel="icon" type="image/svg+xml" href="…/logo.png"> — the SAME
//   logo asset the clone self-hosts at /images/logo.png (1024×1024 PNG);
//   the type="image/svg+xml" hint is the reference's own artifact (it
//   serves a PNG) — replicated faithfully
// - <link rel="manifest" href="/manifest.json"> — declared but DEAD on the
//   reference (the target returns the base44 SPA fallback HTML, an invalid
//   manifest); the clone declares the same link with a 404 target — both
//   "no PWA", functionally identical. Serving a real manifest would
//   EXCEED the reference (a divergence in the other direction).
// - the og:*/twitter:*/PWA metas are base44 platform boilerplate —
//   accepted divergence (documented), not replicated.

test.describe("head parity (favicon + manifest link)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("declares the logo favicon with the reference's type artifact", async ({ page }) => {
    const icon = page.locator('link[rel="icon"]');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute("href", /\/images\/logo\.png$/);
    await expect(icon).toHaveAttribute("type", "image/svg+xml");
  });

  test("declares the manifest link (dead target, as on the reference)", async ({ page }) => {
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveCount(1);
    await expect(manifest).toHaveAttribute("href", /\/manifest\.json$/);

    // The declared target serves no real manifest — on the reference it
    // returns the SPA fallback HTML; on the clone it 404s. Both are
    // "no valid manifest": assert ours stays dead (a real manifest file
    // would exceed the reference).
    const status = await page.evaluate(async () => {
      const res = await fetch("/manifest.json");
      return res.status;
    });
    expect(status).toBe(404);
  });

  test("the favicon asset is served and is the self-hosted logo", async ({ page }) => {
    const ok = await page.evaluate(async () => {
      const res = await fetch("/images/logo.png");
      return res.ok && res.headers.get("content-type")?.includes("image/png");
    });
    expect(ok).toBe(true);
  });
});
