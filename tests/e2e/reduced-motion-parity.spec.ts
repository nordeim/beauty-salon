import { expect, test } from "@playwright/test";

// Reduced-motion parity (session 16) — the prefers-reduced-motion
// reveal-timing census, the SCREEN counterpart of print-parity.spec.ts's
// print-media contracts. Live-measured 2026-10-06 (agent-browser):
//
//   * The LIVE IGNORES prefers-reduced-motion ENTIRELY. Its scroll-reveal is
//     a JS-driven inline-style loop (not a CSS transition — the framework's
//     transition-duration computes 0s even under normal motion; the frames
//     are rAF-driven), and it has no RM branch: fresh-load below-fold
//     unrevealed content stays hidden under RM (inline `opacity: 0; filter:
//     blur(8px); transform: translateY(40px)` — media-query-immune), and
//     scrolling it into view runs the FULL animation under RM (measured
//     trajectory: opacity 0.28@89ms → 0.82@283ms → 0.998@726ms with
//     translate + blur converging in step). The reference's reveal motion
//     plays identically with and without the user's reduced-motion
//     preference — its own a11y debt.
//
//   * The CLONE takes the deliberate opposite stance (the a11y-addition
//     family, the print-visible precedent of session 14): the
//     `@media (prefers-reduced-motion: reduce)` rule in globals.css renders
//     unrevealed content FULLY VISIBLE (opacity: 1, transform: none, filter:
//     none, transition: none) — measured: a below-fold .reveal-hidden
//     computes opacity 1 under screen RM, and the reveal-visible flip on
//     scroll carries NO transition (instant). Matching the live would mean
//     removing the RM rule — degrading screen a11y for motion-sensitive
//     users — the same trade print-parity's P2/P3 already documented for
//     the print pipeline (Chromium forces RM while printing, so the clone
//     prints its full content where the live prints header/footer only).
//
// These contracts pin the SCREEN half of that stance (unpinned until now —
// print-parity emulates RM only under print media). Same rule as every
// parity spec: if this fails, the code drifted (or the RM stance was
// changed without updating the census), not the spec.

test.describe("reduced-motion parity (the screen RM reveal-timing census)", () => {
  test("RM1: under screen reduced-motion, unrevealed content computes fully visible (the deliberate stance)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // A below-fold reveal-hidden element, found WITHOUT scrolling (scrolling
    // would reveal it through the IntersectionObserver path — the same
    // fixture print-parity P2/P3 use).
    const computed = await page.evaluate(() => {
      const belowFold = Array.from(document.querySelectorAll(".reveal-hidden")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      if (belowFold.length === 0) return null;
      const cs = getComputedStyle(belowFold[belowFold.length - 1]);
      return {
        opacity: cs.opacity,
        transform: cs.transform,
        filter: cs.filter,
        transitionDuration: cs.transitionDuration,
        transitionProperty: cs.transitionProperty,
      };
    });

    expect(computed).not.toBeNull();
    // The RM-disable stance: fully visible, no entrance motion. (The live,
    // by contrast, keeps its inline hidden state under RM — measured.)
    expect(computed!.opacity).toBe("1");
    expect(computed!.transform).toBe("none");
    expect(computed!.filter).toBe("none");
    expect(computed!.transitionDuration).toBe("0s");
    expect(computed!.transitionProperty).toBe("none");
  });

  test("RM2: the reveal flip under RM carries no transition — the class swaps, nothing animates", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Scroll a below-fold reveal element into view; under RM the
    // IntersectionObserver still swaps the class (the mechanism is
    // unchanged) but the transition is disabled — the element is already
    // visible and stays visible (the live runs its full ~0.7s inline-style
    // animation here — measured; the deliberate divergence).
    const target = await page.evaluate(() => {
      const belowFold = Array.from(document.querySelectorAll(".reveal-hidden")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      if (belowFold.length === 0) return -1;
      const idx = Array.prototype.indexOf.call(
        document.querySelectorAll(".reveal-hidden"),
        belowFold[belowFold.length - 1],
      );
      (belowFold[belowFold.length - 1] as HTMLElement).scrollIntoView({ block: "center" });
      return idx;
    });
    expect(target).toBeGreaterThanOrEqual(0);

    await expect
      .poll(async () =>
        page.evaluate((i) => {
          const el = document.querySelectorAll(".reveal-hidden")[i];
          return el ? el.classList.contains("reveal-visible") : false;
        }, target),
      )
      .toBe(true);

    // Instant: no animation window exists — the computed opacity reads 1
    // with transition-duration 0s (the stance: nothing ever animates).
    const computed = await page.evaluate((i) => {
      const el = document.querySelectorAll(".reveal-hidden")[i] as HTMLElement;
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, transitionDuration: cs.transitionDuration };
    }, target);
    expect(computed.opacity).toBe("1");
    expect(computed.transitionDuration).toBe("0s");
  });

  test("RM3 (guard): without RM, the hidden state + the 0.9s entrance family hold — the visibility flip flows only through the RM rule", async ({
    page,
  }) => {
    // The honest mechanism split (the mirror of print-parity's P3): with
    // motion preferences at their default, the entrance system is fully
    // armed — below-fold content is hidden and the 0.9s
    // cubic-bezier(0.22,1,0.36,1) family is in effect. The RM-visible
    // stance must flow ONLY through the media rule.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const computed = await page.evaluate(() => {
      const belowFold = Array.from(document.querySelectorAll(".reveal-hidden")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      if (belowFold.length === 0) return null;
      const cs = getComputedStyle(belowFold[belowFold.length - 1]);
      return {
        opacity: cs.opacity,
        filter: cs.filter,
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });

    expect(computed).not.toBeNull();
    expect(computed!.opacity).toBe("0");
    expect(computed!.filter).toBe("blur(8px)");
    // The entrance family arms ALL THREE properties (opacity, filter,
    // transform — globals.css declares each at 0.9s), so the computed
    // transition-duration/timing serialize as comma lists.
    expect(computed!.transitionDuration).toBe("0.9s, 0.9s, 0.9s");
    expect(computed!.transitionTimingFunction).toBe(
      "cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)",
    );
  });
});
