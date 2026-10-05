import { expect, test } from "@playwright/test";

// Legal-page parity — the reference's Wix-template legal pages carry
// structure the old p/h2 block model could not express: the accessibility
// checklist (a ul), the small-italic note variant, <br>-separated
// coordinator lines, in-section mt-3 spacing, and the privacy/terms
// convention of hoisting later paragraphs to the top level. These
// assertions pin the values measured on the live reference (2026-10-05,
// agent-browser @1280x720) so the surfaces cannot drift again. Same rule
// as the other parity specs: if a styling change breaks this, the change
// is wrong, not the spec.

// Trap 7 (session 7): v4's opacity modifier (/75, /50…) emits
// color-mix(in oklab, …), which Chrome serializes as oklab(L a b / α) —
// the reference's v3 emitted rgba(26, 26, 26, α). Pixels are identical
// (the pinned sRGB token round-trips through oklab); only the string
// differs. Assert the resolved lightness channel (#1a1a1a ≈ L 0.2178)
// plus the exact alpha.
function expectInkAlpha(color: string, alpha: number) {
  const m = /^oklab\(([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) \/ ([\d.]+)\)$/.exec(color);
  expect(m, `expected an oklab ink color, got: ${color}`).not.toBeNull();
  expect(Number(m![4])).toBe(alpha);
  expect(Number(m![1])).toBeGreaterThan(0.2);
  expect(Number(m![1])).toBeLessThan(0.24);
}

test.describe("legal parity (the four legal pages)", () => {
  test("the accessibility page renders the reference's 8-item adjustments checklist", async ({
    page,
  }) => {
    await page.goto("/accessibility");

    const ul = page.locator("main ul.list-disc");
    await expect(ul).toBeVisible();
    await expect(ul.locator("li")).toHaveCount(8);
    await expect(ul.locator("li").first()).toHaveText(
      "Used the Accessibility Wizard to find and fix potential accessibility issues",
    );
    await expect(ul.locator("li").last()).toHaveText(
      "Ensured all videos, audio, and files on the site are accessible",
    );

    const ulCs = await ul.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { listStyle: cs.listStyleType, pl: cs.paddingLeft, mt: cs.marginTop };
    });
    expect(ulCs.listStyle).toBe("disc");
    expect(ulCs.pl).toBe("24px"); // pl-6
    expect(ulCs.mt).toBe("12px"); // mt-3

    // space-y-1 between items (4px), inherited ink-75 16px/1.8 items.
    const liCs = await ul.locator("li").first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fs: cs.fontSize, lh: cs.lineHeight, color: cs.color };
    });
    expect(liCs.fs).toBe("16px");
    expect(liCs.lh).toBe("28.8px");
    expectInkAlpha(liCs.color, 0.75); // inherited text-foreground/75 (trap 7)
  });

  test("the accessibility page uses the reference's note styling, mt-3 spacing and br coordinator block", async ({
    page,
  }) => {
    await page.goto("/accessibility");

    // The "[only add if relevant]" notes render as the reference's small
    // italic 50%-ink variant (14px italic), not plain prose.
    const notes = page.locator("main p.text-sm");
    await expect(notes).toHaveCount(3); // intro *Note + two section notes
    for (const note of await notes.all()) {
      const cs = await note.evaluate((el) => {
        const s = getComputedStyle(el);
        return { fs: s.fontSize, style: s.fontStyle, color: s.color };
      });
      expect(cs.fs).toBe("14px");
      expect(cs.style).toBe("italic");
      expectInkAlpha(cs.color, 0.5); // text-foreground/50 (trap 7)
    }

    // In-section subsequent paragraphs sit mt-3 (12px) below the first —
    // NOT the old mt-4 (16px).
    const weAt = page.locator("p", { hasText: "We at [enter organization" });
    const weAtCs = await weAt.evaluate((el) => getComputedStyle(el).marginTop);
    expect(weAtCs).toBe("12px");

    // The coordinator block keeps its four bracket lines on separate
    // lines (br-joined) — four <br>-separated segments, mt-3.
    const coord = page.locator("p", { hasText: "[Name of the accessibility coordinator]" });
    const brCount = await coord.locator("br").count();
    expect(brCount).toBe(3);
    const coordCs = await coord.evaluate((el) => getComputedStyle(el).marginTop);
    expect(coordCs).toBe("12px");

    // The intro renders P1 as PLAIN prose (the serif-xl italic disclaimer
    // styling belongs to the other three pages' "A legal disclaimer").
    const p1 = page.locator("main p", { hasText: "The purpose of the following template" });
    const p1Cs = await p1.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fs: cs.fontSize, style: cs.fontStyle };
    });
    expect(p1Cs.fs).toBe("16px");
    expect(p1Cs.style).toBe("normal");
  });

  test("the privacy page hoists its second paragraph to the top level", async ({ page }) => {
    await page.goto("/privacy");

    // "Different jurisdictions…" is a DIRECT child of the prose div (a
    // sibling of the section elements), separated by space-y-10's 40px.
    // Trap 4: v3's space-y carried the 40px on margin-top; v4's :where()
    // rewrite puts it on margin-bottom of the non-last children — the gap
    // is 40px either way, so assert the side-agnostic spacing.
    const p = page.locator("p", { hasText: "Different jurisdictions" });
    await expect(p).toBeVisible();
    const info = await p.evaluate((el) => {
      const parent = el.parentElement;
      const cs = getComputedStyle(el);
      return {
        parentTag: parent?.tagName,
        parentCls: parent?.className,
        mt: cs.marginTop,
        mb: cs.marginBottom,
      };
    });
    expect(info.parentTag).toBe("DIV");
    expect(info.parentCls).toContain("space-y-10"); // the prose div itself
    expect(info.mt === "40px" || info.mb === "40px").toBe(true);
  });

  test("the terms page hoists its second and third paragraphs to the top level", async ({
    page,
  }) => {
    await page.goto("/terms");

    for (const text of ["T&C should be defined", "T&C provide you as the website owner"]) {
      const p = page.locator("p", { hasText: text });
      await expect(p).toBeVisible();
      const info = await p.evaluate((el) => {
        const parent = el.parentElement;
        const cs = getComputedStyle(el);
        return {
          parentTag: parent?.tagName,
          parentCls: parent?.className,
          mt: cs.marginTop,
          mb: cs.marginBottom,
        };
      });
      expect(info.parentTag).toBe("DIV");
      expect(info.parentCls).toContain("space-y-10");
      expect(info.mt === "40px" || info.mb === "40px").toBe(true); // trap 4
    }
  });

  test("the refund page keeps its single-paragraph section structure unchanged", async ({
    page,
  }) => {
    await page.goto("/refund");

    // The disclaimer line keeps the serif-xl italic styling on this page.
    const disclaimer = page.locator("main p.font-serif");
    await expect(disclaimer).toHaveText("A legal disclaimer");
    const cs = await disclaimer.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fs: s.fontSize, style: s.fontStyle, family: s.fontFamily };
    });
    expect(cs.fs).toBe("20px"); // text-xl
    expect(cs.style).toBe("italic");
    expect(cs.family).toContain("Cormorant Garamond");

    // Three sections, each exactly one paragraph.
    const sections = page.locator("main section section");
    await expect(sections).toHaveCount(3);
    for (const section of await sections.all()) {
      await expect(section.locator(":scope > p")).toHaveCount(1);
    }
  });

  test("the legal texts match the reference verbatim (session-7 corrections)", async ({ page }) => {
    // Session 7 found three session-1 transcription errors; this is their
    // read-back contract (the session-6 lesson: every corrected value
    // needs a test that reads it back).
    await page.goto("/privacy");
    await expect(page.locator("p", { hasText: "Different jurisdictions" })).toHaveText(
      "Different jurisdictions have different legal obligations of what must be included in a Privacy Policy. You are responsible to make sure you are following the relevant legislation to your activities and location.",
    );

    await page.goto("/refund");
    await expect(page.locator("p", { hasText: "specific refund policies" })).toContainText(
      "between your business and your customers. We recommend",
    );

    await page.goto("/accessibility");
    await expect(page.locator("p", { hasText: "Enter a description" })).toContainText(
      "(e.g., the parking lot and / or public transportation stations)",
    );
  });
});
