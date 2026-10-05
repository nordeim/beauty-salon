import { NextRequest, NextResponse } from "next/server";

// Case-insensitive route matching + trailing-slash preservation
// (live-measured session 11 — the links/redirect census).
//
// NOTE: Next 16 deprecates the `middleware` file convention — this file
// uses the `proxy` convention (src/proxy.ts, exported as `proxy`). The
// trailing-slash rewrite requires `skipTrailingSlashRedirect: true` in
// next.config.ts — without it, the router's 308 fires BEFORE the proxy.
//
// The reference is a client-rendered SPA whose router resolves paths
// case-INSENSITIVELY and never canonicalizes trailing slashes:
//   /SERVICES            → the services page renders (URL preserved)
//   /BOOK/CONFIRMATION   → the confirmation page renders
//   /SERVICES/BALAYAGE   → the ROUTE matches, but the slug lookup is
//                          case-sensitive → the "Service not found" state
//   /services/balayage/  → the detail page renders, URL kept (no redirect)
// Next's file router is case-sensitive and 308-normalizes trailing slashes.
// This middleware rewrites (never redirects — the URL bar stays exactly as
// typed, as on the reference):
//   1. A path containing uppercase rewrites to its lowercase form — EXCEPT
//      under /services/…, where only the FIRST segment is lowercased so the
//      slug's case is preserved for the (case-sensitive) lookup, exactly
//      reproducing the reference's split behavior.
//   2. A trailing-slash path rewrites to its slashless form (URL preserved).
//
// Guards: _next assets and /api routes are untouched (they never match the
// two rewrite classes — the app's asset paths are all lowercase and
// slashless; the matcher excludes them anyway). Route existence is NOT
// checked: an unknown path like /Nonexistent rewrites to /nonexistent and
// still 404s — the same outcome as no rewrite (the reference renders its
// own 404 view for it too).
//
// Accepted divergence (documented): the reference's per-page <title> on
// case-variant URLs derives from the RAW path segment (startCase —
// "/SeRvIcEs" → "Se Rv Ic Es | Beauty Salon"); the clone renders the
// route's canonical title. The title layer is the documented per-page-title
// divergence family (the clone's titles are deliberately better).

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let target = pathname;

  // (2) Trailing slashes: /services/balayage/ → /services/balayage
  // (the root path "/" itself is never rewritten).
  if (pathname.length > 1 && pathname.endsWith("/")) {
    target = pathname.replace(/\/+$/, "");
  }

  // (1) Case variants: lowercase the path — but under /services/… keep the
  // slug's original case so the DB lookup fails exactly as on the reference.
  if (target !== target.toLowerCase()) {
    const segments = target.split("/");
    const first = (segments[1] ?? "").toLowerCase();
    if (first === "services" && segments.length > 2) {
      // /SERVICES/BALAYAGE → /services/BALAYAGE (slug case preserved)
      target = "/services/" + segments.slice(2).join("/");
    } else {
      target = target.toLowerCase();
    }
  }

  if (target === pathname || target === "") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = target;
  return NextResponse.rewrite(url);
}

export const config = {
  // Never touch Next internals or the API routes — only page paths.
  matcher: ["/((?!_next|api).*)"],
};
