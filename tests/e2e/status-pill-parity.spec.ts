import { expect, test } from "@playwright/test";

// Status-pill parity — the TIME-AWARE four-state machine (session 20).
//
// The pin-revalidation sweep (session-19's suggested candidate 1) found the
// reference's StatusPill is NOT the day-only "Open today / Closed today"
// artifact earlier sessions sampled: it is a four-state machine keyed on
// the day's opening window, and it re-evaluates LIVE at minute granularity.
// Live-measured with a controlled clock (page.clock.install + fastForward,
// 22 probes — docs/remediation-plan-session-20.md F20-A):
//
//   open day, t < open        → "Opens today at {open}"  (the day's own time)
//   open day, open ≤ t < close → "Open · closes {close}"  (U+00B7 middle dot)
//   open day, t ≥ close        → "Closed for the day"
//   closed day (Sun/Mon)       → "Closed today"
//
// Boundary semantics (live-verified at 10:00 and 19:00): the open minute is
// INCLUSIVE of the during state; the close minute is INCLUSIVE of the
// after-close state. Both boundary flips land LIVE within the minute they
// cross (stepped-clock measurement) — the clone replicates via the 60s
// render ticker in StatusPill.tsx.
//
// The pill renders on every chrome instance — header, footer (the
// text-background/80 + /70 pair variant), and the contact page's Hours
// row — and every instance shows the SAME state at every measured probe.
// The footer variant's computed color is the reference's /80 winner
// (rgba(250, 248, 245, 0.8) — F20-H, read as resolved channels per the
// trap-7 convention: the clone's v4 serializes as oklab, the reference's
// v3 as rgba; the resolved alpha is the parity signal).
//
// The clone's model (statusForNow in src/lib/hours.ts) is the same
// unit-tested source the links-parity innerText census derives from.
// If a change breaks this spec, the change is wrong — not the spec.

const readPills = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[class*=breathe]")).map(
      (el) => el.closest("div")?.textContent ?? "",
    ),
  );

test.describe("status-pill parity (the time-aware four-state machine)", () => {
  test("SP1: before open — \"Opens today at {open}\" on every pill instance", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-06T03:00:00") }); // Tuesday, small hours
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual([
      "Opens today at 10:00",
      "Opens today at 10:00",
    ]);

    // The contact page carries a third instance (the Hours row) — all agree.
    await page.goto("/contact");
    await expect.poll(() => readPills(page)).toEqual([
      "Opens today at 10:00",
      "Opens today at 10:00",
      "Opens today at 10:00",
    ]);
  });

  test("SP2: during open — \"Open · closes {close}\" with the day's own close time", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-06T12:00:00") }); // Tuesday → closes 19:00
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Open · closes 19:00", "Open · closes 19:00"]);

    // Saturday closes at 18:00; Thursday at 20:00 (the per-day windows).
    await page.clock.install({ time: new Date("2026-10-03T10:00:00") }); // Saturday
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Open · closes 18:00", "Open · closes 18:00"]);

    await page.clock.install({ time: new Date("2026-10-08T15:00:00") }); // Thursday
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Open · closes 20:00", "Open · closes 20:00"]);
  });

  test("SP3: at/after close — \"Closed for the day\"", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-06T21:00:00") }); // Tuesday, after 19:00
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Closed for the day", "Closed for the day"]);
  });

  test("SP4: closed days — \"Closed today\" at any time of day", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-05T12:00:00") }); // Monday
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Closed today", "Closed today"]);

    await page.clock.install({ time: new Date("2026-10-04T23:00:00") }); // Sunday, late
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Closed today", "Closed today"]);
  });

  test("SP5: the open boundary flips LIVE within the minute (the 60s ticker)", async ({ page }) => {
    // Mount just before opening; step the virtual clock past 10:00; the
    // pill must flip without a reload (the reference's measured stance).
    await page.clock.install({ time: new Date("2026-10-06T09:58:00") }); // Tuesday
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Opens today at 10:00", "Opens today at 10:00"]);

    await page.clock.fastForward("03:00"); // now ~10:01 — past the boundary
    await expect.poll(() => readPills(page)).toEqual(["Open · closes 19:00", "Open · closes 19:00"]);
  });

  test("SP6: the close boundary flips LIVE within the minute (the 60s ticker)", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-06T18:56:00") }); // Tuesday, before 19:00
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Open · closes 19:00", "Open · closes 19:00"]);

    await page.clock.fastForward("05:00"); // now ~19:01 — past the boundary
    await expect.poll(() => readPills(page)).toEqual(["Closed for the day", "Closed for the day"]);
  });

  test("SP7: the midnight rollover flips to the new day's window LIVE", async ({ page }) => {
    // Monday 23:58 → step past midnight → Tuesday's before-open state.
    await page.clock.install({ time: new Date("2026-10-05T23:58:00") });
    await page.goto("/");
    await expect.poll(() => readPills(page)).toEqual(["Closed today", "Closed today"]);

    await page.clock.fastForward("03:00"); // now ~Tuesday 00:01
    await expect.poll(() => readPills(page)).toEqual(["Opens today at 10:00", "Opens today at 10:00"]);
  });

  test("SP8: the footer variant computes the reference's /80 winner (F20-H, trap-7 channels)", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-06T12:00:00") });
    await page.goto("/");
    // The reference's footer pill: the class pair
    // "text-background/80 text-background/70" with the /80 winning the
    // cascade — computed rgba(250, 248, 245, 0.8) on its v3. The clone's
    // v4 serializes the same resolved color as oklab(L a b / 0.8); the
    // parity signal is the resolved ALPHA channel (the trap-7 convention:
    // assert channels, not strings).
    const footerPill = page.locator("footer [class*=breathe]").locator("xpath=ancestor::div[1]");
    await expect(footerPill).toHaveClass(/text-background\/80 text-background\/70/);
    const color = await footerPill.evaluate((el) => getComputedStyle(el).color);
    // oklab(0.97… 0.00… 0.00… / 0.8) or rgba(250, 248, 245, 0.8)
    const alpha = Number(/(?:\/|,)\s*(0\.\d+|1(?:\.0+)?)\s*\)$/.exec(color)?.[1] ?? "0");
    expect(alpha).toBeGreaterThan(0.79);
    expect(alpha).toBeLessThan(0.81);
    // Near-white lightness (the background token over the dark footer).
    if (color.startsWith("oklab(")) {
      const l = Number(/oklab\((\d\.\d+)/.exec(color)?.[1] ?? "0");
      expect(l).toBeGreaterThan(0.97);
    } else {
      expect(color).toContain("250, 248, 245");
    }
  });
});
