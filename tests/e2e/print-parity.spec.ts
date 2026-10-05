import { expect, test } from "@playwright/test";

// Print-media parity (session 14) — the print-stylesheet census, the first
// instrument to look at @media print on both sides AND at what the print
// pipeline actually renders. Live-measured 2026-10-06 (agent-browser + PDF
// captures of both landings):
//
//   * The AUTHOR layer is at parity: the live's single 913-rule stylesheet
//     carries ZERO @media print rules, and so does the clone's compiled CSS
//     (204KB, 21 media queries — the hover/forced-colors/reduced-motion/
//     breakpoint families). P1 pins that: no print rules may creep in.
//
//   * The RENDERING layer diverges by mechanism, deliberately: the live's
//     animation framework hides unrevealed content with INLINE styles
//     (opacity: 0; filter: blur(8px); transform: translateY(40px)) — inline
//     styles are media-query-immune, so a fresh-load print of the reference
//     carries ONLY the repeated fixed header + footer bits (13 letter pages,
//     body text invisible). The clone's Reveal uses the .reveal-hidden CLASS
//     (identical values), which the prefers-reduced-motion collapse rule
//     flips to visible — and Chromium's print pipeline forces
//     reduced-motion, so the clone prints the full content (11 pages).
//     P2/P3 pin this as a deliberate contract: the print-visible stance is
//     the clone's a11y-addition family acquiring a print consequence, NOT
//     replicated (matching would mean removing the reduced-motion collapse
//     — degrading screen a11y — or adding print rules the live doesn't
//     have, which P1 forbids). After a normal scroll-through both sites
//     print identically; the divergence exists only for never-revealed
//     content. The fixed position:fixed header repeats on every printed
//     page on both sides (verified: BOOK NOW ×13/×11).
//
// Same rule as every parity spec: if this fails, the code drifted (or the
// print stance was changed without updating the census), not the spec.

test.describe("print parity (the @media print census + the print-media reveal stance)", () => {
  test("P1: the served stylesheet carries zero @media print rules (the live's census)", async ({
    page,
  }) => {
    await page.goto("/");

    // Every stylesheet the page links (the standalone build serves one CSS
    // chunk; the loop future-proofs against chunk splitting).
    const cssTexts = await page.evaluate(async () => {
      const links = Array.from(document.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"][href]',
      ));
      const texts: string[] = [];
      for (const link of links) {
        const res = await fetch(link.href);
        texts.push(await res.text());
      }
      return texts;
    });

    expect(cssTexts.length).toBeGreaterThan(0);
    for (const css of cssTexts) {
      expect(
        css.includes("@media print"),
        `the clone must not gain print rules the live reference does not have (found @media print in a ${css.length}-byte sheet)`,
      ).toBe(false);
    }
  });

  test("P2: under print + forced reduced-motion, unrevealed content computes visible (the deliberate print stance)", async ({
    page,
  }) => {
    // Approximate Chromium's print pipeline: page.pdf() forces
    // prefers-reduced-motion while printing (the PDF captures of session 14
    // proved it — below-fold .reveal-hidden text printed). Emulate both axes.
    await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
    await page.goto("/");

    // A below-fold reveal-hidden element, found WITHOUT scrolling (scrolling
    // would reveal it through the IntersectionObserver path).
    const opacity = await page.evaluate(() => {
      const belowFold = Array.from(document.querySelectorAll(".reveal-hidden")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      if (belowFold.length === 0) return "NO_BELOW_FOLD_ELEMENTS";
      return getComputedStyle(belowFold[belowFold.length - 1]).opacity;
    });

    // The reduced-motion collapse fires under print conditions → the clone
    // prints its full content (the accepted-divergence stance).
    expect(opacity).toBe("1");
  });

  test("P3 (guard): print media alone does NOT reveal — the mechanism is the RM collapse, not a print rule", async ({
    page,
  }) => {
    // The honest mechanism split: without the reduced-motion axis, print
    // media changes nothing (P1 proved there are no print rules) and the
    // unrevealed content stays hidden — exactly like the live's inline
    // styles. The print visibility flows ONLY through the RM collapse.
    await page.emulateMedia({ media: "print" });
    await page.goto("/");

    const opacity = await page.evaluate(() => {
      const belowFold = Array.from(document.querySelectorAll(".reveal-hidden")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      if (belowFold.length === 0) return "NO_BELOW_FOLD_ELEMENTS";
      return getComputedStyle(belowFold[belowFold.length - 1]).opacity;
    });

    expect(opacity).toBe("0");
  });
});
