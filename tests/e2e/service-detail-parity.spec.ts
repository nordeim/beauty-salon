import { expect, test } from "@playwright/test";

// Service-detail parity — the reference's detail page has SIX sections
// (hero + card, image, description, prep, FAQ, Ready-to-begin). Sessions
// 1-6 shipped four of them, two structurally divergent. These assertions
// pin the values measured on the live reference (2026-10-05,
// agent-browser @1280x720, all 8 slugs) so the surface cannot drift again.
// Same rule as mobile-navigation/login-parity/not-found-parity: if a
// styling change breaks this, the change is wrong, not the spec.

const BALAYAGE_FIRST_SENTENCE =
  "Our Signature Balayage is a freehand color application performed by our master colorists.";

// Trap 7 (session 7): v4's opacity modifier (/75, /80, /10…) emits
// color-mix(in oklab, …), which Chrome serializes as oklab(L a b / α) —
// the reference's v3 emitted rgba(26, 26, 26, α). Pixels are identical
// (the pinned sRGB token round-trips through oklab); only the string
// differs. Assert the resolved lightness channel (#1a1a1a ≈ L 0.2178)
// plus the exact alpha — the mobile-navigation border-width precedent,
// hardened.
function expectInkAlpha(color: string, alpha: number) {
  const m = /^oklab\(([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) \/ ([\d.]+)\)$/.exec(color);
  expect(m, `expected an oklab ink color, got: ${color}`).not.toBeNull();
  expect(Number(m![4])).toBe(alpha);
  expect(Number(m![1])).toBeGreaterThan(0.2);
  expect(Number(m![1])).toBeLessThan(0.24);
}

test.describe("service-detail parity (the description, prep, FAQ and CTA surfaces)", () => {
  test("the description section renders the first sentence of longDescription as the H2", async ({
    page,
  }) => {
    await page.goto("/services/balayage");

    // The H2 is the live-measured first sentence — NOT a composed
    // "name — tagline" line (which appears nowhere in the reference).
    const h2 = page.locator("h2", { hasText: "Our Signature Balayage" }).first();
    await expect(h2).toHaveText(BALAYAGE_FIRST_SENTENCE);
    const h2Cs = await h2.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight };
    });
    expect(h2Cs.family).toContain("Cormorant Garamond");
    expect(h2Cs.size).toBe("60px");
    expect(h2Cs.weight).toBe("400");

    // The paragraph below carries the FULL longDescription (which starts
    // with the same first sentence — the reference repeats it).
    const p = page.locator("main p", { hasText: "Includes consultation, color service, gloss treatment" });
    await expect(p).toHaveCount(1);
    await expect(p).toContainText(BALAYAGE_FIRST_SENTENCE);
    const pCs = await p.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { mt: cs.marginTop, family: cs.fontFamily, lineH: cs.lineHeight, color: cs.color };
    });
    expect(pCs.mt).toBe("40px"); // mt-10
    expect(pCs.family).toContain("Mulish");
    expect(pCs.lineH).toBe("28.8px"); // leading-[1.8] at 16px
    expectInkAlpha(pCs.color, 0.75); // text-foreground/75 (trap 7)
  });

  test("the prep list is a check-icon bordered grid, not a numbered list", async ({ page }) => {
    await page.goto("/services/balayage");

    const ul = page.locator("section ul.grid");
    await expect(ul).toBeVisible();
    const ulCs = await ul.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { mt: cs.marginTop, cols: cs.gridColumnGap, rows: cs.gridRowGap, display: cs.display };
    });
    expect(ulCs.display).toContain("grid");
    expect(ulCs.mt).toBe("48px"); // mt-12
    expect(ulCs.cols).toBe("40px"); // gap-x-10
    expect(ulCs.rows).toBe("20px"); // gap-y-5

    // 4 items — each a reveal div wrapper holding an li…
    const items = ul.locator("> div > li");
    await expect(items).toHaveCount(4);

    // …carrying a Check icon + a bordered row + the 80% ink span.
    const first = items.first();
    const firstCs = await first.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { pb: cs.paddingBottom, bb: cs.borderBottom, gap: cs.columnGap };
    });
    expect(firstCs.pb).toBe("20px"); // pb-5
    expect(firstCs.bb).toContain("1px solid"); // border-b — trap 7: the color serializes as oklab(… / 0.1), pixels identical
    expect(firstCs.gap).toBe("16px");

    const icon = first.locator("svg");
    const iconCs = await icon.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { w: cs.width, h: cs.height, color: cs.color };
    });
    expect(iconCs.w).toBe("16px"); // h-4 w-4
    expect(iconCs.color).toBe("rgb(75, 93, 79)"); // text-secondary (sage, pinned hsl)

    const span = first.locator("span");
    const spanCs = await span.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, lineH: cs.lineHeight };
    });
    expectInkAlpha(spanCs.color, 0.8); // text-foreground/80 (trap 7)
    expect(spanCs.lineH).toBe("25.6px"); // leading-[1.6] at 16px

    // No numbered "01" markers — the reference's rows are icon-led.
    await expect(ul.locator("span", { hasText: /^01$/ })).toHaveCount(0);
  });

  test("the FAQ section is an exclusive-open accordion with item 0 open by default", async ({
    page,
  }) => {
    await page.goto("/services/balayage");

    await expect(page.getByRole("heading", { name: "Frequently asked." })).toBeVisible();

    // 3 questions for balayage, each a py-2 item with a full-width button.
    const items = page.locator("div.py-2");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0).locator("button span")).toHaveText("How long does balayage last?");
    await expect(items.nth(1).locator("button span")).toHaveText("Will it damage my hair?");
    await expect(items.nth(2).locator("button span")).toHaveText("Can I do this on dark hair?");

    // The question is 30px serif (text-3xl at md) inside the py-6 button.
    const qCs = await items.nth(0).locator("button span").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { family: cs.fontFamily, size: cs.fontSize };
    });
    expect(qCs.family).toContain("Cormorant Garamond");
    expect(qCs.size).toBe("30px");

    // Item 0 is open by default: the answer wrapper exists and shows the
    // live-measured answer; the chevron carries rotate-180.
    const answer0 = items.nth(0).locator("button ~ div p");
    await expect(answer0).toHaveText(
      "Depending on home care, most clients return every 10\u201314 weeks for a refresh.",
    );
    const chev0 = items.nth(0).locator("button svg");
    await expect(chev0).toHaveClass(/rotate-180/);

    // Items 1 and 2 are collapsed — the answer wrapper is UNMOUNTED
    // (the reference renders no wrapper div when closed).
    await expect(items.nth(1).locator("button ~ div")).toHaveCount(0);
    await expect(items.nth(2).locator("button ~ div")).toHaveCount(0);

    // Exclusive-open: clicking item 1 closes item 0 and opens item 1.
    await items.nth(1).locator("button").click();
    await expect(items.nth(1).locator("button ~ div p")).toHaveText(
      "We use bond-building systems throughout the service to preserve integrity and shine.",
    );
    await expect(items.nth(0).locator("button ~ div")).toHaveCount(0);
    await expect(items.nth(1).locator("button svg")).toHaveClass(/rotate-180/);
    await expect(chev0).not.toHaveClass(/rotate-180/);

    // Clicking the open item closes it (toggle, all collapsed).
    await items.nth(1).locator("button").click();
    await expect(items.nth(1).locator("button ~ div")).toHaveCount(0);
  });

  test("a single-item FAQ service renders its question open by default", async ({ page }) => {
    await page.goto("/services/precision-cut");
    const items = page.locator("div.py-2");
    await expect(items).toHaveCount(1);
    await expect(items.nth(0).locator("button span")).toHaveText("How often should I cut?");
    await expect(items.nth(0).locator("button ~ div p")).toHaveText(
      "We typically recommend every 8\u201310 weeks for shape retention.",
    );
  });

  test("the seeded longDescriptions match the reference verbatim (session-7 corrections)", async ({
    page,
  }) => {
    // Session 7 found three session-1 transcription errors in the seed;
    // this is their read-back contract (the session-6 lesson: every
    // corrected value needs a test that reads it back).
    const corrections: Array<[string, string]> = [
      ["/services/precision-cut", "Includes shampoo, scalp massage, cut, and a signature blow-dry."],
      [
        "/services/hydrafacial",
        "You'll leave with skin that feels quieter, brighter, and profoundly hydrated.",
      ],
      ["/services/signature-pedicure", "Finished with your choice of classic or gel polish."],
    ];
    for (const [path, phrase] of corrections) {
      await page.goto(path);
      await expect(page.locator("main p", { hasText: phrase })).toHaveCount(1);
    }
  });

  test("the Ready-to-begin section carries the inverted CTA and the lowercase reserve line", async ({
    page,
  }) => {
    await page.goto("/services/balayage");

    const section = page.locator("section.bg-foreground");
    await expect(section).toBeVisible();
    const secCs = await section.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, pt: cs.paddingTop };
    });
    expect(secCs.bg).toBe("rgb(26, 26, 26)"); // bg-foreground
    expect(secCs.color).toBe("rgb(250, 248, 245)"); // text-background
    expect(secCs.pt).toBe("96px"); // py-24

    await expect(section.getByRole("heading", { name: "Ready to begin?" })).toBeVisible();
    await expect(section.locator("p")).toHaveText(
      "Reserve signature balayage with the next available stylist.",
    );

    const cta = section.getByRole("link", { name: "Book this treatment" });
    await expect(cta).toHaveAttribute("href", "/book?service=balayage");
    const pillCs = await cta.locator("span").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, px: cs.paddingLeft };
    });
    expect(pillCs.bg).toBe("rgb(250, 248, 245)"); // bg-background (inverted)
    expect(pillCs.color).toBe("rgb(26, 26, 26)"); // text-foreground
    // rounded-full: v3 computed 9999px; v4 emits calc(infinity*1px) —
    // Chrome reports 3.35544e+07px via evaluate. Fully round either way.
    expect(parseFloat(pillCs.radius)).toBeGreaterThanOrEqual(9999);
    expect(pillCs.px).toBe("36px"); // px-9
  });
});
