import { NextResponse } from "next/server";
import { buildRobotsTxt } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// The robots route — allows all crawlers and points at the sitemap with the
// site's canonical origin (session 17, F07; the reference's exact body,
// pinned by tests/seo.test.ts + tests/e2e/seo-parity.spec.ts). The live
// serves text/html (its platform's artifact); the clone serves the standard
// text/plain — the "correct substrate" stance.
//
// Same static-prerender + build-time-origin story as the sitemap route
// (NEXT_PUBLIC_SITE_URL is inlined at build — see that route's comment).
export async function GET() {
  const txt = buildRobotsTxt(siteUrl());
  return new NextResponse(txt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
