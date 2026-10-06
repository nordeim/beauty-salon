// The SEO layer — sitemap.xml + robots.txt generation (session 17, F07).
//
// The live reference — although a client-rendered base44 SPA — serves both
// files as static assets (curl-measured 2026-10-06):
//   /sitemap.xml: 12 URLs (ordered below), every entry
//     <changefreq>weekly</changefreq>, <priority>1.0</priority> for / and
//     <priority>0.8</priority> for the rest, 4-space-indented <url> blocks,
//     LF endings, NO trailing newline after </urlset>
//   /robots.txt: "User-agent: *\nAllow: /\n\nSitemap: <origin>/sitemap.xml"
//     (no trailing newline)
//
// The builders are pure and unit-tested (tests/seo.test.ts pins the byte
// format; tests/e2e/seo-parity.spec.ts pins the served contract). The
// origin is interpolated by the route handlers from siteUrl() — each site's
// sitemap lists its own canonical domain (the property that matters for a
// self-hosted deployment; the live hardcodes its own base44 origin).
//
// The route layer (src/app/sitemap.xml/route.ts + robots.txt/route.ts) is a
// GET handler pair wiring these builders; the standard content-types
// (application/xml / text/plain) are an accepted divergence from the live's
// text/html artifacts — the same "correct substrate" class as the SSR
// per-route titles (the live's own serving layer quirks are not replicated
// when the clone's substrate does it right).

// The live-measured ordered census: / first, then the 11 remaining routes
// in the reference's file order. NOT included: /login (an auth surface, not
// content) and the 8 per-service SSG detail pages (the reference's sitemap
// lists its 12 top-level routes only).
export const SITEMAP_PATHS: readonly string[] = [
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

/** The home entry's priority (the reference's literal "1.0" string). */
const HOME_PRIORITY = "1.0";
/** Every other entry's priority. */
const ROUTE_PRIORITY = "0.8";

export function buildSitemapXml(origin: string): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const path of SITEMAP_PATHS) {
    // The home loc keeps the reference's trailing-slash form; the rest do
    // not (the live's exact shape).
    const loc = path === "/" ? `${origin}/` : `${origin}${path}`;
    lines.push("    <url>");
    lines.push(`        <loc>${loc}</loc>`);
    lines.push("        <changefreq>weekly</changefreq>");
    lines.push(`        <priority>${path === "/" ? HOME_PRIORITY : ROUTE_PRIORITY}</priority>`);
    lines.push("    </url>");
  }
  lines.push("</urlset>");
  // No trailing newline — the reference's file ends at </urlset>.
  return lines.join("\n");
}

export function buildRobotsTxt(origin: string): string {
  // The reference's exact body (no trailing newline).
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml`;
}
