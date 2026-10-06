import { expect, test } from "@playwright/test";

// Head-boilerplate parity — the negative-pin family (session 18).
//
// The session-17 suggested candidate "a structured-data census" measured
// the live reference's <head> (agent-browser, logged in, 2026-10-06):
//   - TWO JSON-LD blocks, injected once by the base44 platform shell:
//       WebSite      { name: "Beauty Salon", url: <origin> }
//       Organization { name: "Beauty Salon", logo: <platform media logo>, url: <origin> }
//   - a STATIC root-only <link rel="canonical" href="<origin>"> — never
//     per-route (verified: /services still shows the ROOT canonical, the
//     same two blocks, and the root og:url)
//   - the og:*/twitter:* metas and the PWA metas (mobile-web-app-capable,
//     apple-mobile-web-app-*) — censused session 10
// All of these are ROUTE-INVARIANT platform-registry boilerplate: the
// registry name ("Beauty Salon" — the app-registry entry, NOT the brand
// "Maison Luminaire"), the platform media logo URL, and the platform
// origin, identical on every route and identical across every base44 app.
// They are the same family session 10 REJECTED for the og/twitter/PWA
// metas ("base44 platform boilerplate — accepted divergence").
//
// The clone deliberately carries NONE of that family. This spec pins the
// absence — the session-16 "pin-gap" pattern applied to the head layer:
// the divergence was previously documented only in comments (layout.tsx,
// head-parity.spec.ts); these assertions make it an executable contract.
//
// Why each absence is correct:
//   HB1 (JSON-LD): the live's blocks carry registry data, not app content
//       — the session-17 SEO work replicated app-CONTENT surfaces (the
//       12-route sitemap, the robots body) but registry metadata is the
//       rejected og-family (og:title "Beauty Salon" carries the same
//       registry name). Adding clone JSON-LD would replicate the platform,
//       not the app.
//   HB2/HB3 (og/twitter/PWA): the session-10 decision, now executable.
//   HB4 (canonical): the live's is a shell-static ROOT-ONLY declaration
//       (an SPA artifact — the crawler only ever sees index.html). On the
//       clone's SSR substrate a root-only canonical would declare every
//       real page a duplicate of "/" — actively SEO-harmful; a per-route
//       canonical would EXCEED parity (the live has none). The deliberate
//       stance: metadataBase only, no canonical emitted.
//
// Coverage: the four representative routes spanning all three chromes
// (marketing landing, auth shell, booking, services-SSG family) — on the
// live the shell boilerplate is identical on every route, so the
// family-level pin suffices. If an HB assertion fails, a head layer the
// parity framework rejects was added — the change is wrong, not the spec
// (unless a future live re-census revises the family deliberately).

const ROUTES = ["/", "/login", "/book", "/services"];

test.describe("head-boilerplate parity (the platform-registry family, pinned absent)", () => {
  for (const route of ROUTES) {
    test(`carries no platform-boilerplate head layer on ${route}`, async ({ page }) => {
      await page.goto(route);

      // HB1 — zero JSON-LD structured-data blocks (the live's two
      // WebSite/Organization registry blocks are the rejected family).
      const ldJson = await page.locator('script[type="application/ld+json"]').count();
      expect(ldJson).toBe(0);

      // HB2 — zero og:/twitter: metas (the session-10 rejection).
      const socialMetas = await page
        .locator('meta[property^="og:"], meta[name^="twitter:"]')
        .count();
      expect(socialMetas).toBe(0);

      // HB3 — zero PWA metas (the session-10 rejection).
      const pwaMetas = await page
        .locator(
          'meta[name="mobile-web-app-capable"], meta[name^="apple-mobile-web-app"]',
        )
        .count();
      expect(pwaMetas).toBe(0);

      // HB4 — no canonical link (the live's is shell-static root-only; see
      // the header note for why neither root-only nor per-route is right).
      const canonical = await page.locator('link[rel="canonical"]').count();
      expect(canonical).toBe(0);
    });
  }
});
