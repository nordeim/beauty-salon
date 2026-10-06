# Session 20 — Audit: The Deployed-Site Census + The Pill State-Machine Re-Measurement (2026-10-06)

**Baseline:** remote `main` @ `d228bd2` (the session-19 deliverable `079cb9f` + the T6-executed docs follow-up `8e3ea7b` + the owner's docs-only commit bringing `docs/session_20.md` — the raw session-19 transcript).

**Method:** Mode C audit (`skills/code-review-and-audit` — the full gate as the baseline; `skills/` excluded) + the deployed-site functional census on `https://beauty-salon.jesspete.shop/` with `skills/agent-browser` (the task brief's new live-deployment surface) + the pin-revalidation sweep on the reference (session-19's suggested candidate 1) with controlled-clock measurement (`page.clock` — the `skills/evidence-driven-testing` deterministic-instrument discipline) + the TDD pin discipline per `skills/tdd`.

> Note: this file previously held the raw process transcript of session 19 (committed by the owner). It has been replaced by this proper session-20 record — the same convention sessions 4–19 applied to their own transcript files.

## What this session set out to do

Pull the workspace fresh (`git pull` — fast-forward: the owner's docs-only commit, zero code drift), re-validate the documented architecture against the codebase, re-run the full audit gate, then execute the **new task-brief element** — the deployed-site census on `https://beauty-salon.jesspete.shop/` (the live deployment, checking for visual and functionality gaps against the reference) — plus **session-19's suggested candidate 1** (the periodic pin-revalidation sweep) and **candidate 2** (the capture-diff regression gate), with the standing emphases (the mobile navigation menu + the Tailwind v4 watch, the environment checklist).

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 4 (tests):** baseline fully green — unit 80/80, build 29/29 routes, e2e 150/150 (**230 total**) — exactly the documented session-19 state, zero drift. The session-19 code changes (`NotFoundBody.tsx`'s strip rule, `authed-state-parity.spec.ts`, `capture-screenshots.mjs`) re-reviewed — clean.
- **Environment verified:** `.env` (`DATABASE_URL="file:../db/custom.db"`), `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful, vitest + playwright configured and green — the task brief's checklist all holding.

## The deployed-site census (the task brief's new element) — the deployment is functionally complete

The codebase's live deployment was walked end-to-end with agent-browser: every functional surface works —
- all 16 public routes return 200 (+ the generic 404 for unknown paths); the proxy's case-insensitive + trailing-slash rewrites work (`/SERVICES` and `/services/` both render the services page with the URL preserved);
- `/api/health` reports `{"status":"ok","db":true}`; the sitemap/robots serve the 12-route census under the correct canonical origin (`NEXT_PUBLIC_SITE_URL` baked at build time — the deployment contract held);
- the mobile drawer opens with the pinned computed styles (cream `rgb(250, 248, 245)` bg, the `gap-2` 8px column, the `mt-10` 40px CTA, 48px Cormorant links at −1.2px tracking in ink) and navigates — **the mobile navigation menu works on the deployment, zero Tailwind v4 regression**;
- the login works (the seeded demo user — the deployment's `DEMO_USER_PASSWORD` honored) and lands on `/` per the pinned contract; the booking happy path carries the full query string to the confirmation receipt with the ICS 90-minute block; the newsletter renders the success contract; the gallery lightbox opens with keyboard navigation;
- the 404 renders the F19-C strip rule correctly (the leading slash stripped) and the login shell keeps its font/token context.

**Verdict: the deployment is a production-ready superset of the reference** — every reference behavior present, plus the substrate the reference outsources to its platform (typed APIs, server-side validation, health checks, standard content-types).

## The pin-revalidation sweep (session-19 candidate 1) — one real drift found

Re-measured against the live reference (logged in, agent-browser + controlled clock):
- **Holding:** the 404 path interpolation's strip rule (five probes — byte-identical), the ICS byte format (the 13-line field-order census, the 90-minute block, raw commas, no STATUS/TRANSP), the landing 32-href + gallery 20-href censuses, the login error text, the newsletter success text.
- **F20-A — a REAL parity gap, live-observable on the deployment:** the reference's **StatusPill is a time-aware four-state machine** — `"Opens today at 10:00"` before opening, `"Open · closes 19:00"` during opening hours (the U+00B7 middle dot, the day's own close time), `"Closed for the day"` at/after close, `"Closed today"` on closed days — measured with a controlled clock (`page.clock.install` + `fastForward`, 22 probes: the boundary semantics are open-minute-inclusive-of-during, close-minute-inclusive-of-after; the per-day windows enter the text — Sat 09:00/18:00, Thu 20:00). And the pill **flips live at minute granularity** — both the open and the close boundary flips verified by stepping the virtual clock (the earlier coarse-jump non-flip was a fastForward artifact, re-measured at 10-second steps). The clone's pill was day-only (`Open today` / `Closed today`, computed once) — at 03:22 UTC on a Tuesday the deployment said "Open today" while the reference said "Opens today at 10:00".
- **Two facets rode the finding:** F20-B — the clone's FOOTER pill was a server component (its text bakes at build/prerender time; the reference's footer pill is live and identical to its header at every probe); F20-H — the reference's footer pill carries the redundant `text-background/80 text-background/70` pair and the computed winner is /80 (`rgba(250, 248, 245, 0.8)`; the clone rendered /70 — a 0.1 alpha).

**Why 17 sessions missed it:** the pill was censused only on closed days (sessions 1–16 — where the two-state model IS the reference's behavior) and during open hours without reading the pill's own text (the session-17 "day dependence" derived from the clone's own model). The un-measured dimension was TIME OF DAY — the same lesson as F19-C: a pin faithfully guards the rule it encodes, including when the rule was under-sampled.

## The remediation (per `docs/remediation-plan-session-20.md`)

- **T1 — RED → GREEN:** the `statusForNow` contracts in `tests/hours.test.ts` (the four states, the boundary minutes, the per-day windows, the U+00B7 glyph, the midnight-adjacent state) — RED (5 failed, the function absent) → the implementation in `src/lib/hours.ts` (+ `statusForDay` removed — no remaining callers) → GREEN (8/8).
- **T2 — the component, with a RED-phase lesson of its own:** the first implementation (render-time computation + `suppressHydrationWarning` + a 60s state ticker) failed 5/8 specs — **React's hydration KEEPS mismatched text inside `suppressHydrationWarning`**, so the static shell's build-time state persisted (the old day-only pill had the same character all along — its e2e passed only because the gate rebuilds on the same day). The fix: the **NotFoundBody idiom** — `useSyncExternalStore` with the stable `""` server snapshot (the static shell renders the pill text empty, matching the reference's own pre-JS state — its CSR shell carries no pill text) and a 60s subscribe tick; React's post-hydration store check adopts the live-clock state immediately. The footer swapped to the same live client island with the reference's own `text-background/80 text-background/70` pair (plain concatenation, NOT `cn()` — tailwind-merge would collapse the pair).
- **T3 — the updated pin:** the links-parity services innerText census re-derived from `statusForNow` (`1918 + 2 × len(pill text)` — the live-measured basis: closed-day 1942 / before-open 1958 / during 1956 / after-close 1954), with the post-hydration convergence poll; the stale "33-link" label corrected to the measured 32.
- **T4 — the new pin:** `tests/e2e/status-pill-parity.spec.ts` (SP1–SP8, `page.clock`-driven): the four on-load states (header AND footer agree, the contact page's third instance included), the per-day close times, the LIVE open/close/midnight boundary flips, and the footer variant's /80 computed color (trap-7 channels) — **8/8 GREEN**.
- **T5 — full gate green:** lint ✓ · tsc ✓ · unit **84/84** · build **29/29 routes** · e2e **158/158** (150 + 8 SP) = **242 total** — every pre-existing contract untouched.
- **T6 — the capture-diff gate (session-19 candidate 2) + the set:** `scripts/screenshot-diff.mjs` (re-runs the capture instrument into a temp dir, hash-diffs against `docs/screenshots/` — 14/15 comparable, 07-contact excluded as the map noise class; **validated GREEN** [14/14 byte-identical] **and RED** [a corrupted byte → exit 1 → the canonical set re-captured to restore]) + the canonical set re-captured with the remediated build (9 pill-bearing captures updated — exactly the pages whose chrome carries a visible pill).
- **T7 — documentation aligned:** README (the time-aware pill + capture-diff rows, the counts 242/158/84, the 32-href label), AGENTS.md (the pill invariant + the screenshot-diff command row + the spec convention line + the counts), CLAUDE.md (the counts, the spec list, the uSES idiom note), PAD (the session-20 ledger + the testing table), SKILL.md → **v1.17.0**, this session log, the plan's executed results, the worklog.
- **T8 — push:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (the paramiko shim per the runbook) → remote == local verified → key shredded.

## Everything else verified this session

- The mobile navigation menu (the standing emphasis): verified working on BOTH the deployment (opens, pinned computed styles, navigates) and re-verified via the pinned e2e contract — zero Tailwind v4 regression.
- The scandihaven tech-stack pattern reference (the standing instruction): the stack already embodies the pattern family (Next.js 16 App Router + React 19 + Tailwind v4 CSS-first + Prisma/SQLite + Vitest/Playwright + Bun) — re-confirmed green across every gate; no stack drift to act on.
- The `skills/` folder remains excluded from code checking, testing, and compilation (Mode C convention; the audit gates never touch it).
- The deployment's `.env` (from the task brief) is consistent with the `.env.example` contract — the DB path, the canonical origin, the auth secret, and the seed-time password override all in their documented roles.

## Carried / accepted (unchanged)

- The two dev-only `bun audit` advisories (`braces`, `deepmerge-ts`) — the accepted-risk stance.
- The a11y-addition family (drawer Escape-close, aria-labels, the RM-visible stance) — unchanged, still pinned.
- The og/twitter/PWA + JSON-LD + canonical rejection (sessions 10/18) — unchanged, still negatively pinned.
- The 07-contact screenshot's external-map noise class — the single documented exception to the byte-determinism signal (now also the diff gate's designed exclusion).

## Suggested next-session candidates

1. **A boundary-timezone sweep of the pill** — the state machine was measured in one timezone; a probe across TZs (the pill reads the LOCAL clock — a visitor in another timezone sees their own local day's window) would confirm the local-clock stance is the reference's own (Reasoned: yes — its SPA reads the browser clock — but un-measured).
2. **A deployment-refresh verification** — after the owner redeploys with this session's build, a quick agent-browser pass over the deployment's pill (it should show the four states + live flips) would close the loop between the remediation and the production surface the task brief cares about.
