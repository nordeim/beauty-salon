import { expect, test } from "@playwright/test";

// SEO parity — the sitemap/robots census + the contact SSR visibility
// guard (session 17, F07 + F04). The head census (session 10) covered the
// favicon/manifest links but nobody had ever fetched the reference's
// /sitemap.xml or /robots.txt. The live (a client-rendered base44 SPA)
// serves both as static files:
//
//   /sitemap.xml — 12 URLs, all <changefreq>weekly</changefreq>, priority
//     1.0 for / and 0.8 for the rest, 4-space indented <url> blocks,
//     <?xml prologue, no trailing newline after </urlset>
//   /robots.txt — "User-agent: *\nAllow: /\n\nSitemap: <origin>/sitemap.xml"
//     (no trailing newline)
//
// The clone serves the same contracts from the canonical-origin seam
// (NEXT_PUBLIC_SITE_URL — the same variable that resolves
// metadataBase/canonical URLs). That origin is INLINED AT BUILD TIME
// (Next inlines NEXT_PUBLIC_* in server bundles too — verified: neither
// the runtime process env nor the standalone .env copy changes the served
// locs), so the e2e build bakes the repo .env's documented value
// (http://localhost:3000) exactly as a production build bakes the deployed
// origin — the .env.example contract ("set NEXT_PUBLIC_SITE_URL to the
// deployed URL in production" BEFORE the build). ORIGIN below pins that
// build-time value; it is NOT the e2e port.
//
// Two accepted divergences from the live, both in the "correct substrate"
// class (the dead-manifest precedent): the standard content-types (the
// live serves text/html for both — its platform's artifact) and the
// clone's own canonical origin in the locs (the live hardcodes its own
// base44 origin — each site's sitemap lists its own domain).
//
// F04 guard (S3): the owner's gap analysis observed Site B's /contact body
// missing from non-JS fetches. The clone's route is a Server Component —
// its raw SSR HTML (no JS execution — the crawler/fetcher view) carries the
// full semantic module. This contract pins that visibility property.
// If a change breaks this spec, the change is wrong — not the spec.

// The canonical origin baked at build time from the repo .env's
// NEXT_PUBLIC_SITE_URL (see above — the documented default).
const ORIGIN = "http://localhost:3000";

// The live-measured ordered census (curl, 2026-10-06): 12 routes, / first.
const SITEMAP_PATHS = [
  "/",
  "/services",
  "/book",
  "/book/confirmation",
  "/about",
  "/team",
  "/gallery",
  "/contact",
  "/privacy",
  "/terms",
  "/accessibility",
  "/refund",
];

function parseUrlBlocks(body: string): string[] {
  return [...body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]!);
}

test.describe("seo parity (the sitemap + robots + the contact SSR guard)", () => {
  test("S1: /sitemap.xml serves the reference's 12-route weekly census under the canonical origin", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");

    const body = await res.text();
    expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);

    // The exact ordered path census.
    const blocks = parseUrlBlocks(body);
    expect(blocks).toHaveLength(12);
    const paths = blocks.map((block) => {
      const loc = /<loc>([\s\S]*?)<\/loc>/.exec(block)![1]!.trim();
      return new URL(loc).pathname;
    });
    expect(paths).toEqual(SITEMAP_PATHS);

    // Every entry is weekly (the reference's uniform changefreq).
    for (const block of blocks) {
      expect(/<changefreq>weekly<\/changefreq>/.test(block)).toBe(true);
    }

    // The priority census: 1.0 for / and 0.8 for the rest.
    for (const [i, block] of blocks.entries()) {
      const priority = parseFloat(/<priority>([\s\S]*?)<\/priority>/.exec(block)![1]!);
      expect(priority).toBe(i === 0 ? 1 : 0.8);
    }

    // Every loc carries the canonical origin (baked at build from
    // NEXT_PUBLIC_SITE_URL — see the header comment).
    for (const block of blocks) {
      const loc = /<loc>([\s\S]*?)<\/loc>/.exec(block)![1]!.trim();
      expect(loc.startsWith(ORIGIN)).toBe(true);
    }

    // The home loc keeps the reference's trailing-slash form; the rest do
    // not (the live's exact shape).
    const homeLoc = /<loc>([\s\S]*?)<\/loc>/.exec(blocks[0]!)![1]!.trim();
    expect(homeLoc).toBe(`${ORIGIN}/`);
    const servicesLoc = /<loc>([\s\S]*?)<\/loc>/.exec(blocks[1]!)![1]!.trim();
    expect(servicesLoc).toBe(`${ORIGIN}/services`);
  });

  test("S2: /robots.txt allows all and points at the sitemap with the canonical origin", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");

    // The live's exact body (no trailing newline).
    expect(await res.text()).toBe(
      `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml`,
    );
  });

  test("S3: the /contact raw SSR HTML carries the full semantic module (the F04 fetcher/crawler guard)", async ({
    request,
  }) => {
    const res = await request.get("/contact");
    expect(res.status()).toBe(200);

    // No JS execution — the response body IS the fetcher's view. The F04
    // finding's worry: "If the body is missing or non-semantic, the
    // primary conversion-adjacent page is broken. If it is canvas/shadow-
    // DOM only, it is invisible to assistive tech and crawlers." The
    // module must be semantic, server-rendered HTML.
    const html = await res.text();
    for (const needle of [
      "Find us in the light",
      "500 Terry Francine Street San Francisco, CA 94158",
      'href="tel:123-456-7890"',
      'href="mailto:info@mysite.com"',
      "@maisonluminaire",
      "Get directions",
      "Address",
      "Reach us",
    ]) {
      expect(html).toContain(needle);
    }
  });
});
