"use client";

// The reference's not-found body (live-measured 2026-10-05): a slate
// centered card — NOT the cream editorial system. Full-viewport bg-slate-50
// panel, max-w-md column: "404" (text-7xl light slate-300 — Cormorant via
// the global heading rule, the MARKETING font context, unlike /login), a
// centered slate divider, "Page Not Found" (text-2xl medium slate-800), a
// message that interpolates the attempted path, and a real <button> Go
// Home (white, bordered, rounded-lg) that routes home.
//
// Client island (the LoginCardBody pattern) because both dynamic behaviors
// need client APIs: the button from useRouter() — server components cannot
// carry event handlers (AGENTS.md) — and the path from the browser
// location.
//
// The path read is useSyncExternalStore, NOT usePathname: the root
// not-found is served as the statically prerendered /_not-found shell, so
// the client router's pathname is "/_not-found" — NOT the URL the user
// attempted. The reference SPA reads window.location directly; the client
// snapshot does the same. The server snapshot returns "" (matching the
// static shell exactly, so hydration has no mismatch at all); after
// hydration React re-reads the client snapshot and re-renders with the
// real path — the sanctioned divergence pattern, no
// suppressHydrationWarning needed.
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};
const readAttemptedPath = () => window.location.pathname;
const readServerPath = () => "";

export function NotFoundBody() {
  const router = useRouter();
  const pathname = useSyncExternalStore(
    subscribeToNothing,
    readAttemptedPath,
    readServerPath,
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <p className="text-slate-600 leading-relaxed">
              The page{" "}
              <span className="font-medium text-slate-700">
                &quot;{pathname}&quot;
              </span>{" "}
              could not be found in this application.
            </p>
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
