import { expect, test } from "@playwright/test";

// The day-aware status pill's model — the services innerText census
// derives its expected length from the same unit-tested source the
// StatusPill reads (see the day-adjusted test below).
import { statusForDay } from "../../src/lib/hours";

// Links parity — the first-ever both-sides href census + the routing edge
// matrix (session 11). The census instrument: enumerate every <a href> on
// every route on both sides (agent-browser), diff the sequences. 14/16
// routes were identical; the four divergences found are pinned here.
// Values measured on the reference app (see docs/remediation-plan-session-11.md
// §2). If a change breaks this spec, the change is wrong — not the spec.
//
// Measured contracts (live):
// - /services carries a bottom CTA the clone lacked: the last child of the
//   pb-28 section is <div class="mt-20 text-center"> wrapping
//   <a class="inline-block" href="/book"> + the standard dark pill span
//   ("Book an appointment") — the same pill idiom as the contact page's
//   "Reserve an appointment"
// - /accessibility wraps the article title in a dead <a href="#"> with
//   "underline hover:text-foreground" (the reference's own dead link —
//   replicated faithfully like the dead manifest declaration)
// - an unknown service slug renders the DEDICATED "Service not found" state
//   inside the site chrome (HTTP 200), not the generic slate 404:
//   <section class="pt-40 px-6 max-w-3xl mx-auto text-center">
//     <h1 class="font-serif text-4xl mb-6">Service not found</h1>
//     <a class="text-[11px] uppercase tracking-editorial underline" href="/services">
//       Return to the almanac</a></section>
// - the reference's SPA router matches routes case-INSENSITIVELY (URL
//   preserved) and keeps trailing slashes; case-variant SLUGS still fail
//   their lookup → the Service-not-found state. The clone replicates via
//   the src/middleware.ts rewrite (never a redirect).
// Accepted divergence (documented): the reference's per-page <title> on
// case-variant URLs derives from the raw path (startCase — "/SeRvIcEs" →
// "Se Rv Ic Es"); the clone renders the route's canonical title.

test.describe("links parity (the services CTA + the article link)", () => {
  test("the services grid carries the reference's bottom CTA (F1)", async ({ page }) => {
    await page.goto("/services");

    // The pb-28 section has TWO children: the grid + the CTA wrapper.
    const section = page.locator("section.pb-28");
    await expect(section).toHaveCount(1);
    await expect(section.locator("> div")).toHaveCount(2);

    // The wrapper: mt-20 text-center (computed 80px top margin @1280).
    const wrap = section.locator("div.mt-20.text-center");
    await expect(wrap).toHaveCount(1);
    await expect
      .poll(async () => await wrap.evaluate((el) => getComputedStyle(el).marginTop))
      .toBe("80px");

    // The link: inline-block, /book, the standard pill span, exact text.
    const link = wrap.locator("> a");
    await expect(link).toHaveAttribute("href", "/book");
    await expect(link).toHaveClass(/inline-block/);
    const span = link.locator("> span");
    await expect(span).toHaveText("Book an appointment");
    await expect(span).toHaveClass(
      /inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary/,
    );

    // The /book href now appears 3× on the page: header, CTA, footer.
    await expect(page.locator('a[href="/book"]')).toHaveCount(3);
  });

  test("the services page innerText now matches the reference length (1942 closed-day @1280, day-adjusted)", async ({ page }) => {
    await page.goto("/services");
    // Session-11 census: live 1942 chars vs the pre-fix clone's 1922 — the
    // delta was exactly the missing CTA ("BOOK AN APPOINTMENT\n" = 20).
    // The census was measured on a CLOSED day: the page renders the
    // day-aware StatusPill twice (header + footer), and "Closed today" is
    // 2 chars longer than "Open today" — so an OPEN day measures 1942 - 4.
    // (Sessions 1-16 all ran Sat/Sun/Mon — closed days; the first Tuesday
    // run surfaced the day dependence. The expectation is derived from the
    // same unit-tested hours model the pill itself reads.)
    const pill = statusForDay(new Date().getDay());
    const expected = pill === "Closed today" ? 1942 : 1942 - 4;
    const len = await page.evaluate(() => document.body.innerText.length);
    expect(len).toBe(expected);
  });

  test("the accessibility article title is the reference's dead # link (F2)", async ({ page }) => {
    await page.goto("/accessibility");

    const link = page.locator('a[href="#"]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveClass("underline hover:text-foreground");
    await expect(link).toHaveText('"Accessibility: Adding an Accessibility Statement to Your Site"');

    // The paragraph text is UNCHANGED (the innerText contract holds) — the
    // link is pure markup inside the same sentence.
    const p = link.locator("xpath=..");
    await expect(p).toHaveText(
      'To learn more about this, check out our article "Accessibility: Adding an Accessibility Statement to Your Site".',
    );

    // Computed: underlined, offset auto (Chrome reports the used keyword).
    await expect
      .poll(async () => await link.evaluate((el) => getComputedStyle(el).textDecorationLine))
      .toContain("underline");
    await expect
      .poll(async () => await link.evaluate((el) => getComputedStyle(el).textUnderlineOffset))
      .toBe("auto");
  });
});

test.describe("the unknown-service state (F3)", () => {
  test("an unknown slug renders Service not found inside the site chrome, HTTP 200", async ({ page }) => {
    const res = await page.goto("/services/not-a-real-service");
    expect(res?.status()).toBe(200);

    const section = page.locator("section.pt-40.px-6.max-w-3xl");
    await expect(section).toHaveCount(1);
    await expect(section).toHaveClass(/text-center/);

    const h1 = section.locator("> h1");
    await expect(h1).toHaveText("Service not found");
    await expect(h1).toHaveClass("font-serif text-4xl mb-6");

    const back = section.locator("> a");
    await expect(back).toHaveAttribute("href", "/services");
    await expect(back).toHaveText("Return to the almanac");
    await expect(back).toHaveClass("text-[11px] uppercase tracking-editorial underline");

    // Inside the site chrome: the site footer is present (the generic 404
    // is a standalone slate card without it).
    await expect(page.locator("footer")).toHaveCount(1);

    // The reference's title for this state is the SERVICES page title.
    await expect(page).toHaveTitle(/Services \| Beauty Salon/);
  });
});

test.describe("case-insensitive routing + trailing slashes (F4)", () => {
  test("uppercase route variants render their pages with the URL preserved", async ({ page }) => {
    await page.goto("/SERVICES");
    await expect(page.locator("h1")).toContainText("Our Signature");
    expect(page.url().toLowerCase()).toContain("/services");
    expect(await page.evaluate(() => location.pathname)).toBe("/SERVICES");

    await page.goto("/TEAM");
    await expect(page.locator("h1")).toContainText("The hands behind");
    expect(await page.evaluate(() => location.pathname)).toBe("/TEAM");
  });

  test("a case-variant SLUG fails its lookup and renders Service not found (as on the reference)", async ({
    page,
  }) => {
    await page.goto("/SERVICES/BALAYAGE");
    await expect(page.locator("h1")).toHaveText("Service not found");
    await expect(page.locator("section.pt-40 a")).toHaveAttribute("href", "/services");
    expect(await page.evaluate(() => location.pathname)).toBe("/SERVICES/BALAYAGE");
  });

  test("case-variant subroutes render (BOOK/CONFIRMATION)", async ({ page }) => {
    await page.goto("/BOOK/CONFIRMATION?name=A&date=2026-10-06&time=10:00&service=Signature%20Balayage");
    // Playwright text matching normalizes whitespace — the h1 renders
    // "Your transformation\nbegins soon."
    await expect(page.locator("h1")).toContainText("begins soon");
    expect(await page.evaluate(() => location.pathname)).toBe("/BOOK/CONFIRMATION");
  });

  test("trailing-slash URLs render without a redirect (URL preserved)", async ({ page }) => {
    await page.goto("/services/balayage/");
    await expect(page.locator("h1")).toContainText("Signature Balayage");
    expect(await page.evaluate(() => location.pathname)).toBe("/services/balayage/");
  });
});

test.describe("links census regression guards", () => {
  test("the landing page carries the reference's 33-link census sequence", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href") ?? ""),
    );
    // The live-measured sequence (session-11 census, identical both sides):
    expect(hrefs).toEqual([
      "/",
      "/services",
      "/gallery",
      "/team",
      "/about",
      "/contact",
      "/book",
      "/book",
      "/services?category=hair",
      "/services?category=skin",
      "/services?category=nails",
      "/about",
      "https://instagram.com/",
      "https://instagram.com/",
      "https://instagram.com/",
      "https://instagram.com/",
      "https://instagram.com/",
      "https://instagram.com/",
      "https://instagram.com/",
      "/services",
      "/team",
      "/gallery",
      "/about",
      "/contact",
      "/book",
      "tel:123-456-7890",
      "mailto:info@mysite.com",
      "https://instagram.com/",
      "/privacy",
      "/terms",
      "/accessibility",
      "/refund",
    ]);
  });

  test("the gallery page keeps its known link census", async ({ page }) => {
    await page.goto("/gallery");
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href") ?? ""),
    );
    // 20 links: 7 header + 6 footer nav + tel + mailto + instagram + the 4
    // legal links — the 12 gallery tiles are NOT <a> (they open the lightbox).
    // The count and the anchors are the stable census contract.
    expect(hrefs).toHaveLength(20);
    expect(hrefs[0]).toBe("/");
    expect(hrefs).toContain("tel:123-456-7890");
    expect(hrefs).toContain("mailto:info@mysite.com");
    expect(hrefs.slice(-4)).toEqual(["/privacy", "/terms", "/accessibility", "/refund"]);
  });

  test("non-service unknown paths still render the generic 404 (the not-found contract)", async ({ page }) => {
    // F3 is services-scoped ONLY — /definitely-not-a-page keeps the slate
    // 404 contract (not-found-parity.spec.ts pins its details). The marker:
    // the slate-50 centered card + the "404" h1 (the not-found page keeps
    // its own SiteHeader/footer — the discriminator is the slate card).
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
    await expect(page.locator("main .bg-slate-50")).toBeVisible();
    await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  });
});
