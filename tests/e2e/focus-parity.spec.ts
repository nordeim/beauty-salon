import { expect, test } from "@playwright/test";

// Focus-ring parity (session 13) — the first both-sides FOCUS census: every
// interactive surface's computed styles WHILE FOCUSED (the session-12 log's
// suggested candidate — the layer no settled-DOM or text/state census can
// see). Live-measured 2026-10-06 (agent-browser, transitions frozen for the
// synchronous reads):
//
//   * The marketing surface's focus behavior is IDENTICAL both sides — the
//     book inputs' border→ink with NO ring (focus:outline-none
//     focus:border-foreground), the UA-default outlines preserved on the
//     links/buttons/drawer controls, the newsletter input's border→ink.
//   * The auth shell (/login) DIVERGES — the live's inputs render a
//     slate-400 ring (rgb(148,163,184)) with a WHITE offset where the clone
//     rendered the brand ink ring on the brand cream offset, from
//     byte-identical class strings: TRAP 9 — v4's variant ordering resolves
//     focus-visible:ring-ring OVER focus:ring-slate-400 where the
//     reference's v3 engine resolves the opposite. The Sign in button's
//     ring resolves to the platform shell's --ring (zinc-950, rgb(9,9,11))
//     with a white offset.
//
// The fix pins the computed outcome inside the .font-shell scope (globals.css):
//   .font-shell { --color-ring: #09090b; --color-background: #ffffff; }
//   .font-shell input:focus { --tw-ring-color: #94a3b8; }
//
// Same rule as every parity spec: if this fails, the code drifted, not the
// spec.

// Freeze transitions + animations before reading focused computed styles —
// the live measurements were taken with transitions frozen (a synchronous
// read mid-transition captures the pre-transition value; the book inputs'
// `transition` class animates the very border this spec reads).
async function freezeMotion(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: "* { transition: none !important; animation: none !important; }",
  });
}

test.describe("focus parity (the both-sides focus-ring census)", () => {
  // ── F2: the login inputs' focus ring (slate-400 + white offset) ─────────

  test("F2: the focused login email input renders the live's slate-400 ring on a white offset", async ({
    page,
  }) => {
    await page.goto("/login");
    await freezeMotion(page);
    const email = page.locator("input#email");
    await email.focus();

    const cs = await email.evaluate((el) => {
      const c = getComputedStyle(el);
      return { border: c.borderColor, shadow: c.boxShadow };
    });
    // The live's exact stops: a 2px WHITE offset ring then the 2px
    // slate-400 ring (spread 4px). Containment, not equality — v4 composes
    // the full shadow stack with leading transparent resets.
    expect(cs.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(cs.shadow).toContain("rgb(148, 163, 184) 0px 0px 0px 4px");
    // focus:border-slate-400 — already correct pre-fix, pinned here as the
    // census's border contract.
    expect(cs.border).toBe("rgb(148, 163, 184)");
  });

  test("F2: the focused login password input renders the same ring contract", async ({
    page,
  }) => {
    await page.goto("/login");
    await freezeMotion(page);
    const password = page.locator("input#password");
    await password.focus();

    const cs = await password.evaluate((el) => {
      const c = getComputedStyle(el);
      return { border: c.borderColor, shadow: c.boxShadow };
    });
    expect(cs.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(cs.shadow).toContain("rgb(148, 163, 184) 0px 0px 0px 4px");
    expect(cs.border).toBe("rgb(148, 163, 184)");
  });

  // ── F3: the Sign in button's focus ring (zinc-950 + white offset) ───────

  test("F3: the focused Sign in button renders the platform shell's zinc-950 ring on a white offset", async ({
    page,
  }) => {
    await page.goto("/login");
    await freezeMotion(page);
    const button = page.getByRole("button", { name: "Sign in", exact: true });
    await button.focus();

    const cs = await button.evaluate((el) => {
      const c = getComputedStyle(el);
      return { shadow: c.boxShadow };
    });
    // The platform shell's --ring is zinc-950 (rgb(9,9,11)); its offset is
    // white. The shadow-sm geometry (the trap-5 pin) rides along in the
    // composed stack.
    expect(cs.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(cs.shadow).toContain("rgb(9, 9, 11) 0px 0px 0px 4px");
    expect(cs.shadow).toContain("rgba(0, 0, 0, 0.05) 0px 1px 2px 0px");
  });

  // ── F4: the Sign in button's class census (the inert svg variants) ──────

  test("F4: the Sign in button carries the live's inert [&_svg] variants in the live's position", async ({
    page,
  }) => {
    await page.goto("/login");
    const button = page.getByRole("button", { name: "Sign in", exact: true });
    // The live's class string carries the three svg variants between
    // disabled:opacity-50 and px-3 py-2 — inert (the settled button renders
    // no svg child; its innerHTML is exactly "Sign in"), replicated verbatim
    // per the class-parity convention (the session-12 Alert-card precedent).
    await expect(button).toHaveClass(
      /disabled:opacity-50 \[\&_svg\]:pointer-events-none \[\&_svg\]:size-4 \[\&_svg\]:shrink-0 px-3 py-2/,
    );
    // And the button renders no svg child — the inertness premise.
    await expect(button.locator("svg")).toHaveCount(0);
  });

  test("F4: the login input class strings byte-match the live's (the census guard)", async ({
    page,
  }) => {
    await page.goto("/login");
    const email = page.locator("input#email");
    // The live's measured class string — byte-identical modulo the class
    // attribute's internal ordering, which React renders in source order.
    await expect(email).toHaveClass(
      /^flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50\/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600$/,
    );
  });

  // ── Guards: the marketing focus stance (verified holding — pinned as a net)

  test("guard: the book text input focuses border→ink with NO ring", async ({ page }) => {
    await page.goto("/book");
    await freezeMotion(page);
    const name = page.getByLabel(/Full name/i);
    await name.focus();
    const cs = await name.evaluate((el) => {
      const c = getComputedStyle(el);
      return { border: c.borderColor, shadow: c.boxShadow };
    });
    expect(cs.border).toBe("rgb(26, 26, 26)"); // focus:border-foreground
    expect(cs.shadow).toBe("none"); // no ring on the marketing surface
  });

  test("guard: the book submit button keeps the UA-default focus outline", async ({ page }) => {
    await page.goto("/book");
    await freezeMotion(page);
    const button = page.getByRole("button", { name: /Request appointment/ });
    await button.focus();
    const outline = await button.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).toBe("auto"); // the reference preserves the UA outline
  });

  test("guard: the login Google button keeps the UA-default focus outline", async ({ page }) => {
    await page.goto("/login");
    await freezeMotion(page);
    const button = page.getByRole("button", { name: /Continue with Google/ });
    await button.focus();
    const outline = await button.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).toBe("auto");
  });

  test("guard: the login forgot-password link keeps the UA outline and slate-500 text", async ({
    page,
  }) => {
    await page.goto("/login");
    await freezeMotion(page);
    const link = page.getByRole("button", { name: /Forgot password/ });
    await link.focus();
    const cs = await link.evaluate((el) => {
      const c = getComputedStyle(el);
      return { outline: c.outlineStyle, color: c.color };
    });
    expect(cs.outline).toBe("auto");
    expect(cs.color).toBe("rgb(100, 116, 139)"); // slate-500
  });

  test("guard: the newsletter input focuses border→ink with NO ring", async ({ page }) => {
    await page.goto("/");
    await freezeMotion(page);
    const input = page.getByPlaceholder("Your email");
    await input.focus();
    const cs = await input.evaluate((el) => {
      const c = getComputedStyle(el);
      return { border: c.borderColor, shadow: c.boxShadow };
    });
    expect(cs.border).toBe("rgb(26, 26, 26)");
    expect(cs.shadow).toBe("none");
  });
});
