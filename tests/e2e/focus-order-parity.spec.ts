import { expect, test } from "@playwright/test";

// Focus-order parity (session 16) — the Tab-sequence behavioral census, the
// first instrument to WALK the focus order on both sides. Live-measured
// 2026-10-06 (agent-browser, viewport 1280×900; the e2e runs 1280×720 — the
// focus order is DOM order, viewport-independent for the visible desktop
// chrome; FO5 sets 390×844 for the drawer):
//
//   * Every interactive surface's Tab walk is IDENTICAL on both sides:
//     the landing's 40 stops (logo, 5 nav, BOOK NOW, hero CTA, 3 category
//     cards, read-story, carousel prev + 4 dots + next, follow-along + 6
//     instagram tiles, newsletter input + Claim button, 6 footer nav,
//     tel/mailto/instagram, 4 legal — then wraps to body), /login's 6 stops
//     (Google, email, password, Sign in, Forgot password, Sign up), /book's
//     17 stops (return + logo, name/email/phone, stylist + service selects,
//     the native date input's 4 SEGMENT stops, the native time input's 4
//     SEGMENT stops — browser-native internal segmentation, identical on
//     both sides — the notes textarea, the submit), /services' 20 stops
//     (header 7, 4 filter pills, 8 service cards in seed order, the bottom
//     CTA).
//
//   * The mobile drawer's focus layer is at parity too — and it is the
//     reference's OWN posture, not an a11y ideal: focus-on-open STAYS on the
//     toggle button (no auto-focus into the drawer), the in-drawer walk is
//     logo → Close menu → 5 nav links → CTA (8 stops), there is NO focus
//     trap (the 9th Tab escapes to the page content behind the full-screen
//     overlay — the reference behaves identically), and close-via-button
//     lands focus on BODY (no focus restoration on either side). The live's
//     drawer also has NO Escape-close (live-measured — focus on the toggle
//     AND inside the drawer; it stays open) while its lightbox DOES close on
//     Escape; the clone's drawer Escape-close is the pinned a11y enhancement
//     (mobile-navigation.spec.ts "Escape closes the drawer (a11y
//     enhancement)") — the asymmetry is the reference's own a11y debt,
//     documented here, not a clone divergence.
//
//   * The only live/clone deltas in the walk are the clone's aria-labels on
//     the instagram tiles and the newsletter input (the documented
//     a11y-addition family — invisible to the order) and the dev-mode
//     NEXTJS-PORTAL (absent in this production build).
//
// Same rule as every parity spec: if this fails, the code drifted (or the
// DOM gained/lost a focusable element), not the spec.

// A compact per-stop signature: tag + the identifying attribute(s). NOTE:
// the INPUT signature uses the .type PROPERTY, not the attribute — React
// omits the default type="text" attribute from the DOM (the engine fact
// pinned by form-parity), while the property still reads "text".
async function activeSignature(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return "NONE";
    if (el === document.body) return "BODY";
    const tag = el.tagName;
    if (tag === "A") return `A:${el.getAttribute("href") ?? ""}`;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
      return `${tag}:type=${(el as HTMLInputElement).type}`;
    }
    // BUTTON (or anything else interactive): aria-label, else text.
    const aria = el.getAttribute("aria-label");
    if (aria) return `${tag}:aria=${aria}`;
    return `${tag}:text=${(el.textContent || "").trim()}`;
  });
}

async function walk(page: import("@playwright/test").Page, stops: number) {
  const out: string[] = [];
  for (let i = 0; i < stops; i += 1) {
    await page.keyboard.press("Tab");
    out.push(await activeSignature(page));
  }
  return out;
}

test.describe("focus-order parity (the Tab-walk census)", () => {
  test("FO1: the landing's focus order — 40 stops, then the wrap to body", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => document.body.focus());

    const seq = await walk(page, 41);

    // The census (live-measured 2026-10-06; identical on the clone):
    const expected = [
      "A:/", // logo
      "A:/services",
      "A:/gallery",
      "A:/team",
      "A:/about",
      "A:/contact",
      "A:/book", // header BOOK NOW pill
      "A:/book", // hero circle CTA (Book a Treatment)
      "A:/services?category=hair",
      "A:/services?category=skin",
      "A:/services?category=nails",
      "A:/about", // Read our full story
      "BUTTON:aria=Previous",
      "BUTTON:aria=Testimonial 1",
      "BUTTON:aria=Testimonial 2",
      "BUTTON:aria=Testimonial 3",
      "BUTTON:aria=Testimonial 4",
      "BUTTON:aria=Next",
      "A:https://instagram.com/", // Follow along
      "A:https://instagram.com/", // 6 instagram tiles
      "A:https://instagram.com/",
      "A:https://instagram.com/",
      "A:https://instagram.com/",
      "A:https://instagram.com/",
      "A:https://instagram.com/",
      "INPUT:type=email", // the newsletter capture
      "BUTTON:text=Claim 15% off",
      "A:/services", // footer nav
      "A:/team",
      "A:/gallery",
      "A:/about",
      "A:/contact",
      "A:/book",
      "A:tel:123-456-7890",
      "A:mailto:info@mysite.com",
      "A:https://instagram.com/", // footer Instagram
      "A:/privacy",
      "A:/terms",
      "A:/accessibility",
      "A:/refund",
      "BODY", // the wrap (no dev portal in the production build)
    ];
    expect(seq).toEqual(expected);
  });

  test("FO2: the login surface's focus order — 6 stops", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => document.body.focus());

    const seq = await walk(page, 7);

    expect(seq).toEqual([
      "BUTTON:text=Continue with Google",
      "INPUT:type=email",
      "INPUT:type=password",
      "BUTTON:text=Sign in",
      "BUTTON:text=Forgot password?",
      "BUTTON:text=Need an account? Sign up",
      "BODY",
    ]);
  });

  test("FO3: the booking form's focus order — 17 stops incl. the native date/time segment stops", async ({
    page,
  }) => {
    await page.goto("/book");
    await page.evaluate(() => document.body.focus());

    const seq = await walk(page, 18);

    // The 4 consecutive date stops and 4 consecutive time stops are the
    // NATIVE inputs' internal segment navigation (month/day/year,
    // hour/minute/meridian) — browser-native, identical on both sides
    // (live-measured). The two header links come first.
    expect(seq).toEqual([
      "A:/", // ← Return to site
      "A:/", // the BookHeader logo
      "INPUT:type=text", // name (the property reads text — React omits the attribute)
      "INPUT:type=email",
      "INPUT:type=tel",
      "SELECT:type=select-one", // stylist (No preference first)
      "SELECT:type=select-one", // service (Select a service first)
      "INPUT:type=date",
      "INPUT:type=date",
      "INPUT:type=date",
      "INPUT:type=date",
      "INPUT:type=time",
      "INPUT:type=time",
      "INPUT:type=time",
      "INPUT:type=time",
      "TEXTAREA:type=textarea", // Notes
      "BUTTON:text=Request appointment",
      "BODY",
    ]);
  });

  test("FO4: the services grid's focus order — 20 stops (header, pills, the 8 cards in seed order, the bottom CTA)", async ({
    page,
  }) => {
    await page.goto("/services");
    await page.evaluate(() => document.body.focus());

    const seq = await walk(page, 21);

    expect(seq).toEqual([
      "A:/",
      "A:/services",
      "A:/gallery",
      "A:/team",
      "A:/about",
      "A:/contact",
      "A:/book", // header BOOK NOW
      "BUTTON:text=All",
      "BUTTON:text=Hair",
      "BUTTON:text=Skin",
      "BUTTON:text=Nails",
      "A:/services/balayage",
      "A:/services/precision-cut",
      "A:/services/glossing-treatment",
      "A:/services/hydrafacial",
      "A:/services/signature-facial",
      "A:/services/gel-manicure",
      "A:/services/signature-pedicure",
      "A:/services/bridal-package",
      "A:/book", // the bottom "Book an appointment" CTA
      "A:/services", // the footer nav begins (the census continues there)
    ]);
  });

  test("FO5: the mobile drawer's focus layer — toggle focus on open, the 8-stop walk, NO trap, BODY after close", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => document.body.focus());

    // Open the drawer — focus STAYS on the toggle (no auto-focus into the
    // overlay; the live behaves identically).
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator(".fixed.inset-0")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.activeElement?.getAttribute("aria-label") || "",
      ),
    ).toBe("Open menu");

    // The in-drawer walk: logo → Close menu → 5 nav links → CTA.
    const seq = await walk(page, 9);
    expect(seq.slice(0, 8)).toEqual([
      "A:/", // drawer logo
      "BUTTON:aria=Close menu",
      "A:/services",
      "A:/gallery",
      "A:/team",
      "A:/about",
      "A:/contact",
      "A:/book", // the drawer CTA
    ]);

    // NO focus trap — the 9th Tab escapes to the page content behind the
    // full-screen overlay (the reference's own posture, replicated).
    const ninth = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? !!el.closest(".fixed.inset-0") : false;
    });
    expect(ninth).toBe(false);

    // Close via the Close button — the overlay unmounts and focus lands on
    // BODY (no focus restoration on either side).
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.locator(".fixed.inset-0")).toHaveCount(0);
    expect(await activeSignature(page)).toBe("BODY");
  });
});
