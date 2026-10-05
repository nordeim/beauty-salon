import { expect, test } from "@playwright/test";

// Scroll parity (session 15) — the scroll-restoration/popstate census, the
// first instrument to look at the ROUTER'S SCROLL POLICY on both sides.
// Live-measured 2026-10-06 (agent-browser, viewport 1280×900; the e2e runs
// 1280×720 — every page-dependent value below is computed at runtime, never
// hardcoded):
//
//   * The NAVIGATION layer diverged: the reference's SPA router has NO
//     scroll management — the document scroll offset simply survives the
//     in-place DOM swap (clamped by the browser when the target page is
//     shorter: live-measured landing@2000 → /services landed at 1830 =
//     the live services page's max scrollable — NOT reset). The clone's
//     Next.js App Router applied its scroll-to-top policy on every push
//     navigation (routerScroll = scroll ?? true) — a SMOOTH scroll to 0
//     under the shared html { scroll-behavior: smooth } (measured
//     trajectory 1877 → 902 → 290 → 113 → 38 → 3 → 0). P1/P5 pin the
//     reference's kept-and-clamped policy — every in-app <Link> carries
//     scroll={false}, every router.push passes { scroll: false } — via
//     SETTLED reads (a fixed settle wait, then a direct assertion: the
//     pre-fix smooth reset must be allowed to complete, else a transient
//     mid-animation value could false-pass; the origin 2000 sits BELOW the
//     e2e viewport's services max scrollable so the clamp never masks the
//     reset — the measured false-green trap).
//
//   * The POPSTATE layer (back/forward) is browser-native on both sides
//     (`history.scrollRestoration: 'auto'`), and both sites set
//     `html { scroll-behavior: smooth }`, so the restores animate; the
//     specs read SETTLED values via expect.poll (monotonic convergence —
//     poll-safe). P2 pins the back guard (the exact saved offset — green
//     pre-fix too: the entry saves the scroll at click time). P3 pins the
//     forward guard: pre-fix the services entry's saved offset is an
//     arbitrary mid-animation point of the reset's smooth scroll (the
//     spec cannot assert it); post-fix it is the carried offset, restored
//     exactly — the pin turns green only when the whole policy holds.
//
//   * The dead-#-link click semantics (the SPA-routing family, the same
//     census widened): the reference's router resolves '#' to the current
//     path — NO URL change (no hash appended), NO history entry, INSTANT
//     scroll to top (scrollY reads 0 synchronously after the click; the
//     instant read distinguishes it from the smooth restores). The
//     clone's browser-default anchor semantics appended '#' and pushed a
//     history entry. P6 pins the router's semantics via the DeadHashLink
//     island (preventDefault + instant scrollTo(0, 0)).
//
//   * P4 guards the indistinguishable case: navigating from y=0 starts the
//     target at 0 under both policies (the divergence only exists for
//     scrolled origins).
//
// Same rule as every parity spec: if this fails, the code drifted, not the
// spec.

const SCROLL_ORIGIN = 2000; // the live census's own origin; below the e2e services max — no clamp masking
const SETTLE_MS = 1500; // the pre-fix smooth reset completes in ~700ms measured; 1500 is settle-safe

test.describe("scroll parity (the navigation scroll policy + the popstate restores + the dead-# click)", () => {
  test("P1: in-app navigation keeps the scroll offset (clamped only when the target page is shorter) — the reference's SPA router never resets scroll", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate((y) => window.scrollTo(0, y), SCROLL_ORIGIN);
    // Let the scroll settle before navigating (an unsettled scrollTo can
    // read stale on tall pages).
    await page.waitForTimeout(300);

    // The desktop header's /services link (the header nav is visible at
    // the e2e viewport width).
    await page.locator('header nav a[href="/services"]').click();
    await page.waitForURL("**/services");

    // SETTLED read: any pre-fix smooth reset must complete first (a
    // transient mid-animation value could false-pass — the measured
    // false-green trap).
    await page.waitForTimeout(SETTLE_MS);

    const read = await page.evaluate(() => ({
      y: window.scrollY,
      max: document.documentElement.scrollHeight - window.innerHeight,
    }));
    // The offset carried across the navigation — clamped only if the
    // target page is shorter than the origin (computed at runtime), NOT
    // reset to 0.
    expect(read.y).toBe(Math.min(SCROLL_ORIGIN, read.max));
    expect(read.y).toBeGreaterThan(0);
  });

  test("P2: popstate (back) restores the exact saved offset — browser-native on both sides", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate((y) => window.scrollTo(0, y), SCROLL_ORIGIN);
    await page.waitForTimeout(300);
    await page.locator('header nav a[href="/services"]').click();
    await page.waitForURL("**/services");
    await page.waitForTimeout(300);

    await page.goBack();
    await page.waitForURL("http://localhost:**/");

    // The landing restores the exact offset the user left at (polled: the
    // restore is a smooth scroll under both sites' scroll-behavior — the
    // settled value is the contract; the convergence is monotonic so the
    // poll cannot false-pass).
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBe(SCROLL_ORIGIN);
  });

  test("P3: popstate (forward) restores the exact saved offset (the carried offset post-fix)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate((y) => window.scrollTo(0, y), SCROLL_ORIGIN);
    await page.waitForTimeout(300);
    await page.locator('header nav a[href="/services"]').click();
    await page.waitForURL("**/services");
    await page.waitForTimeout(300);
    await page.goBack();
    await page.waitForURL("http://localhost:**/");

    // Let the landing's smooth restore settle before going forward (an
    // unsettled origin would save a mid-animation offset into the entry).
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBe(SCROLL_ORIGIN);

    await page.goForward();
    await page.waitForURL("**/services");

    // Post-fix the services entry's saved offset is the carried offset
    // (clamped only if the page is shorter) — restored exactly. Pre-fix
    // it is an arbitrary mid-animation point of the reset's smooth scroll
    // (unassertable); this pin turns green only when the whole navigation
    // policy holds.
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBe(Math.min(SCROLL_ORIGIN, max));
  });

  test("P4: navigating from the top starts the target at the top (indistinguishable under both policies)", async ({
    page,
  }) => {
    await page.goto("/");
    // No scrolling: y=0 origin.
    await page.locator('header nav a[href="/services"]').click();
    await page.waitForURL("**/services");
    await page.waitForTimeout(300);

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("P5: the deep-link query navigation (/book?service=…) keeps the scroll offset too", async ({
    page,
  }) => {
    await page.goto("/services/balayage");
    await page.evaluate((y) => window.scrollTo(0, y), SCROLL_ORIGIN);
    // Let the smooth programmatic scroll settle fully (html has
    // scroll-behavior: smooth on both sites — the origin must be the
    // settled SCROLL_ORIGIN when the navigation fires).
    await page.waitForTimeout(500);

    // Click via a dispatched event, NOT page.click(): the CTA sits near
    // the page top, so Playwright's actionability scrollIntoView would
    // SMOOTH-SCROLL UP to it first — destroying the scrolled origin this
    // contract pins (the measured 2000 -> 63 artifact was exactly that
    // mid-flight origin, not app behavior; with a settled origin the
    // production build clamps cleanly to max, matching the live's
    // live-measured clean clamp). The JS click exercises the same React
    // handler chain on the same DOM node.
    await page.evaluate(() => {
      const a = [...document.querySelectorAll('main a[href="/book?service=balayage"]')][0] as
        | HTMLAnchorElement
        | undefined;
      a?.click();
    });
    await page.waitForURL("**/book?service=balayage");

    expect(page.url()).toContain("/book?service=balayage");

    // SETTLED read like P1 (any residual animation must complete).
    await page.waitForTimeout(SETTLE_MS);
    const read = await page.evaluate(() => ({
      y: window.scrollY,
      max: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(read.max).toBeGreaterThan(0);
    // The offset carried — clamped only if the book page is shorter than
    // the origin (computed at runtime), NOT reset to 0.
    expect(read.y).toBe(Math.min(SCROLL_ORIGIN, read.max));
    expect(read.y).toBeGreaterThan(0);
  });

  test("P6: the dead-# article link resolves to the current path — no URL change, no history entry, instant scroll to top", async ({
    page,
  }) => {
    await page.goto("/accessibility");
    const historyBefore = await page.evaluate(() => history.length);
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(300);

    // The article link (the reference's own dead "#" href — the links
    // census pinned the ATTRIBUTE; this census pins the CLICK semantics).
    await page.locator('main a[href="#"]').first().click();
    await page.waitForTimeout(300);

    const read = await page.evaluate(() => ({
      href: window.location.href,
      hash: window.location.hash,
      y: window.scrollY,
      historyLength: history.length,
    }));
    // No hash appended, no history entry pushed, instant top.
    expect(read.hash).toBe("");
    expect(read.href).not.toContain("#");
    expect(read.historyLength).toBe(historyBefore);
    expect(read.y).toBe(0);
  });
});
