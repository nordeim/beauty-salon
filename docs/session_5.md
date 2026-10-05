# Session 5 — Parity Audit: The Unmeasured 404 Surface (2026-10-05)

**Baseline:** remote `main` @ `36a0f49` · **Deliverable commit:** see `git log` (404 parity rebuild + trap-6 slate pin + not-found parity contract, docs + screenshots refresh)
**Method:** Mode C audit (`skills/code-review-and-audit` pipeline — Phase 3 as a targeted lightweight checklist after the checklist runner destabilized shells in session 4; `skills/` excluded) + live parity verification with `skills/agent-browser` (the widest surface sweep yet) + TDD remediation per `docs/remediation-plan-session-5.md`.

> Note: this file previously held the raw process transcript of session 4's continuation (committed at `36a0f49`). It has been replaced by this proper session-5 record — the same convention session 4 applied to its own transcript file.

## What this session set out to do

Refresh the workspace, re-validate the documented architecture against the codebase, audit the session-4 changes (the "recent code changes" — the scaffold-script removal, `site.ts`/`metadataBase` wiring, and the two new guard suites), re-verify visual/functional parity against the live reference with particular attention to the mobile navigation and Tailwind v4 traps, then remediate anything found, re-capture screenshots, align documentation, and push to `main`.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 2 (security):** `bun audit` shows the same two dev-only transitive advisories as sessions 2–4 (`braces` via the eslint chain, `deepmerge-ts` via the Prisma CLI chain) — the accepted-risk stance re-verified unchanged. Secret scan clean: no key material tracked (the docs mentions are redacted/instructional); no env/db/key files in git.
- **Phase 3 (lightweight checklist):** the targeted greps reproduce session-4's noise register exactly — `console.log`/TODO/`any` all absent from `src/`; the two "criticals" remain the documented e2e-only constants; the `data.ts` `JSON.parse` remains the documented `safeParse` false positive; every remaining "orbital"/retired-model match in tracked files is a legitimate historical audit reference. No new actionable findings.
- **Phase 4 (tests):** baseline fully green — unit 55/55, build 27/27 pages (Next's own counter), e2e 42/42.
- **Session-4 diff re-review:** `site.ts` (never-throws origin resolution), the `metadataBase` wiring, `repo-hygiene.test.ts`, `site-url.test.ts`, `.env.example` truthfulness — all match the documented design; invariants hold (`content.ts` client-safe, zero client `data.ts` imports, `allowedDevOrigins`, test seams, `scripts/` = exactly `with-repo-db.ts`).

## Live parity verification (agent-browser) — the widest sweep yet

Login works on the reference (`sepnetflix2023@outlook.com` → post-login redirects to the landing surface; the GitHub dashboard image still 404s — the live site remains the source of truth). Then, live vs local, every measurement byte-identical unless noted:

- **Mobile drawer (390×844):** drawer `fixed inset-0` z-60 `rgb(250,248,245)`; container flex-column gap **8px** px-8 justify-center; five links 48px Cormorant Garamond **−1.2px** `rgb(26,26,26)` weight 400; CTA wrapper `mt-10` (40px) → last-link-to-CTA gap **48px**; no scroll lock; tap closes the drawer and navigates. (CTA text note: "Book an appointment" — a case-sensitive probe substring initially self-tripped.)
- **Login font context:** h1/p/label/button all Tailwind's default sans stack, `normal` features, `auto` smoothing (h1 24px/700/−0.6px at mobile width) — and no visible text outside the `font-shell` main (the `<body>` font difference is unreachable, per the session-3 accepted-difference record).
- **Landing hero tokens (1280×720):** body cream/ink, h1 Cormorant 102.4px/400/−2.56px, fixed 80px transparent header.
- **Nav href map:** `/services`, `/gallery`, `/team`, `/about`, `/contact`, `/book` — identical.
- **Content parity (new this session):** 8/8 service names **and prices**, 3/3 stylists, 12/12 gallery titles + categories + order, testimonial attributions (Elena M./Tobias R. confirmed mid-carousel), "Closed today" status pill both sides.
- **Booking (new this session):** form labels, select option set with prices, submit label — identical; deep-link preselection `?service=balayage` → "Signature Balayage · $285" on both.
- **404 (new this session — the one surface never before measured):** **NOT identical** — see F1 below.

## Findings and the TDD fix

- **F1 (S1, MEDIUM — a real parity gap, the first since session 3): the 404 surface.** The clone rendered a cream-editorial layout (giant-serif `text-[20vw]` h1, italic serif subtitle, generic message, uppercase pill link). The live reference renders a **slate centered card**: `min-h-screen flex items-center justify-center p-6 bg-slate-50` → `max-w-md w-full` → `text-center space-y-6` — h1 `text-7xl font-light text-slate-300` (72px/300/`rgb(203,213,225)`/Cormorant/−0.72px via the global heading rule), divider `h-0.5 w-16 bg-slate-200 mx-auto` (2×64px, centered), h2 `text-2xl font-medium text-slate-800`, message **interpolating the attempted path** (`The page "<path>" could not be found in this application.` with the path in a `font-medium text-slate-700` span), and a real Go Home **`<button>`** (white, 1px slate-200 border, `rounded-lg`, px-4 py-2, text-sm) that routes home — all inside the marketing chrome. Root cause: session 1 authored the 404 from assumption and the e2e spec was written against the clone's own DOM (`role=link` + `href`), so the gate stayed green while the surface drifted. **Fix (RED→GREEN):** `tests/e2e/not-found-parity.spec.ts` (3 specs — the full computed-style card contract, the path interpolation, the button navigation) went red exactly as predicted (plus the corrected `auth.spec.ts` 404 test), then `src/components/NotFoundBody.tsx` (client island) + the rewritten `src/app/not-found.tsx` made them green. Two GREEN-phase discoveries, both now documented:
  1. **`usePathname` returns `/_not-found`** (the static shell's path), not the attempted URL — the island reads `window.location.pathname` via **`useSyncExternalStore`** (server snapshot `""` matches the prerendered shell exactly, so there is no hydration mismatch at all; React re-reads the client snapshot after hydration).
  2. **Trap 6:** `bg-slate-50` computed to `lab(98.1434 …)` — v4's default palette is authored in oklch and serializes as `lab()`/`oklch()`, not the reference's v3 `rgb()` string (pixels identical, string unstable — a cousin of traps 2/3 that the login surface never tripped because its spec pins fonts, not colors). Fix: the slate scale 50–900 pinned to the reference's sRGB hex in `@theme` (the trap-2/ADR-005 token-pin precedent); documented in `AGENTS.md`, `CLAUDE.md`, and the `Tailwind-V4-Validation-Report.md` trap log.
- **F2 (S2, LOW):** this file was a transcript — replaced with this proper log.
- **F3 (S3, carried):** braces/deepmerge-ts advisories — no upstream fix; the session-2 accepted-risk stance stands (dev-only transitive chains, zero runtime exposure).
- **F4:** everything else verified conforming (see the plan's findings register).

## Everything else shipped this session

- **Full gate green with the expanded suite:** lint ✓ · typecheck ✓ · unit **55/55** · build 27/27 pages ✓ · e2e **45/45** ✓ (**100 total**) — every pre-existing parity contract untouched; no assertion weakened (the `auth.spec.ts` change replaced clone-authored assumptions with the live-measured contract).
- 14 dev-server screenshots re-captured on the remediated build + the new **`15-not-found-desktop.png`**; the mobile-menu capture is 26124B — byte-identical in size to the session-2/3/4 verified captures. VLM-verified the login capture (centered card, sans heading, no glitches), the mobile-menu capture (cream overlay, giant serif links, CTA separation, close X), and the new 404 capture (centered slate card, light 72px 404, divider, path-quoted message, outlined Go Home button, marketing header, no glitches).
- Documentation aligned: README (badge 100, 45 e2e, parity scope), AGENTS.md (six traps — the trap-6 slate-pin note; the `not-found-parity.spec.ts` contract; the `usePathname`/static-shell gotcha), CLAUDE.md (45/100 counts, six-trap line, components map + `NotFoundBody`), PAD (§7 inventory 45/100 + component tree + session-5 verification ledger), `beauty-salon_SKILL.md` **v1.3.0** (project_state, quickstart counts, Appendix B/C), `docs/Tailwind-V4-Validation-Report.md` (trap-6 appendix). `.env.example` re-verified truthful (unchanged — no 404-relevant env).
- The remediation plan (`docs/remediation-plan-session-5.md`) with its findings register, plan-vs-codebase validation matrix, and executed ToDo results; this session log; the worklog record.

## Carried / accepted (unchanged)

- `braces` and `deepmerge-ts` advisories — dev-only transitive chains, no upstream fix / not safe to force; documented in `docs/remediation-plan-session-2.md` §4.4 and re-verified in sessions 3–5.
- The login shell's `<body>` background overscroll difference (PAD §5.5) — unreachable outside macOS rubber-band; accepted. (This session additionally confirmed the login `<body>` font-family difference is the same class — no visible text renders outside the `font-shell` main.)
- The `document.title` difference (reference static "Beauty Salon" vs the clone's per-page metadata) — a deliberate, documented clone improvement; the browser tab is not a rendered surface.
- The in-memory rate limiter, inert Google OAuth, notice-only Forgot-password/Sign-up, and the remaining PAD §10 deferred items — by design, mirroring the reference.
