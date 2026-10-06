import { NextResponse } from "next/server";
import { buildSitemapXml } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// The sitemap route — serves the reference's 12-route weekly census under
// the site's canonical origin (session 17, F07; the builder's byte format
// is pinned by tests/seo.test.ts, the served contract by
// tests/e2e/seo-parity.spec.ts). The live serves its sitemap with
// content-type text/html (a base44 platform artifact); the clone serves the
// standard application/xml — the same "correct substrate" stance as the
// SSR per-route titles.
//
// The route prerenders STATIC (like the reference's own static file): the
// GET handler reads no request data, so Next bakes it at build time. The
// origin comes from NEXT_PUBLIC_SITE_URL — an env var Next INLINES at
// BUILD time (NEXT_PUBLIC_* is inlined in server bundles too — verified:
// neither the runtime process env nor the standalone .env copy changes the
// served locs). The deployment contract is therefore the .env.example one:
// set NEXT_PUBLIC_SITE_URL to the deployed origin BEFORE `next build` (the
// same variable that resolves metadataBase/canonical URLs — one origin,
// every surface, baked together).

export async function GET() {
  const xml = buildSitemapXml(siteUrl());
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
