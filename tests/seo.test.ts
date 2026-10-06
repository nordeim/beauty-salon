import { describe, expect, it } from "vitest";
import { buildRobotsTxt, buildSitemapXml } from "@/lib/seo";

// The SEO-layer byte contract — the live reference's exact sitemap.xml and
// robots.txt formats (curl-measured 2026-10-06, session 17 / F07):
//   - the XML prologue + urlset envelope, 4-space-indented <url> blocks,
//     8-space-indented children, LF endings, NO trailing newline after
//     </urlset>
//   - priorities serialize as the reference's literal "1.0" and "0.8"
//     strings (not "1")
//   - the home loc carries the trailing slash; the other 11 do not
//   - robots: "User-agent: *\nAllow: /\n\nSitemap: <origin>/sitemap.xml"
//     with NO trailing newline
// The e2e layer (tests/e2e/seo-parity.spec.ts) pins the semantic contract
// against the running server; this layer pins the byte format of the
// builders themselves.
describe("the sitemap builder", () => {
  const ORIGIN = "https://example.com";
  const xml = buildSitemapXml(ORIGIN);

  it("opens with the reference's prologue and envelope", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    expect(
      xml.startsWith(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
      ),
    ).toBe(true);
  });

  it("closes with the reference's tail (no trailing newline)", () => {
    expect(xml.endsWith("    </url>\n</urlset>")).toBe(true);
  });

  it("emits exactly the 12-route census in the reference's order", () => {
    const paths = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) => m[1]!);
    expect(paths).toEqual([
      "https://example.com/",
      "https://example.com/services",
      "https://example.com/book",
      "https://example.com/book/confirmation",
      "https://example.com/about",
      "https://example.com/team",
      "https://example.com/gallery",
      "https://example.com/contact",
      "https://example.com/privacy",
      "https://example.com/terms",
      "https://example.com/accessibility",
      "https://example.com/refund",
    ]);
  });

  it("marks every route weekly", () => {
    const freqs = [...xml.matchAll(/<changefreq>([\s\S]*?)<\/changefreq>/g)].map((m) => m[1]!);
    expect(freqs).toHaveLength(12);
    expect(freqs.every((f) => f === "weekly")).toBe(true);
  });

  it("serializes the priorities as the reference's literal 1.0 / 0.8 strings", () => {
    const priorities = [...xml.matchAll(/<priority>([\s\S]*?)<\/priority>/g)].map((m) => m[1]!);
    expect(priorities[0]).toBe("1.0");
    expect(priorities.slice(1).every((p) => p === "0.8")).toBe(true);
  });

  it("formats the first url block in the reference's 4/8-space indentation", () => {
    const firstBlock =
      "    <url>\n" +
      `        <loc>${ORIGIN}/</loc>\n` +
      "        <changefreq>weekly</changefreq>\n" +
      "        <priority>1.0</priority>\n" +
      "    </url>";
    expect(xml).toContain(firstBlock);
  });
});

describe("the robots builder", () => {
  it("emits the reference's exact body (no trailing newline)", () => {
    expect(buildRobotsTxt("https://example.com")).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
    );
  });

  it("interpolates the given origin", () => {
    const body = buildRobotsTxt("http://localhost:3100");
    expect(body).toContain("Sitemap: http://localhost:3100/sitemap.xml");
  });
});
