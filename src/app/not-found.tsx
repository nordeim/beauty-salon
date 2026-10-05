// 404 — the reference's not-found surface: marketing chrome (header +
// footer, brand fonts via the global heading rule) around a slate centered
// card. The interactive body (path interpolation + Go Home button) lives
// in the NotFoundBody client island; the computed-style contract is pinned
// by tests/e2e/not-found-parity.spec.ts (live-measured 2026-10-05).
import { NotFoundBody } from "@/components/NotFoundBody";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <NotFoundBody />
      </main>
      <SiteFooter />
    </>
  );
}
