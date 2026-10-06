# Session 21 — Audit: The Boundary-Timezone Sweep + The E2E-Seed Hermeticity Fix (2026-10-06)

**Baseline:** remote `main` @ `8aa2203` (the session-20 deliverable `494b2d6` + the T8-executed docs follow-up `584b275` + the owner's docs-only commit bringing `docs/session_21.md` — the raw session-20 transcript).

**Method:** Mode C audit (`skills/code-review-and-audit` — the full gate as the baseline; `skills/` excluded) + the deployed-site census on `https://beauty-salon.jesspete.shop/` and the reference re-verification on `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` + the **boundary-timezone sweep** (session-20's suggested candidate 1) with Playwright `timezoneId` contexts (`skills/evidence-driven-testing` — the deterministic-instrument discipline) + the TDD/pin-gap discipline per `skills/tdd`.

> Note: this file previously held the raw process transcript of session 20 (committed by the owner). It has been replaced by this proper session-21 record — the same convention sessions 4–20 applied to their own transcript files.

## What this session set out to do

Clone the workspace fresh, re-validate the documented architecture against the codebase, re-run the full audit gate, then execute **session-20's two suggested candidates** — (1) the boundary-timezone sweep of the pill and (2) the deployment-refresh verification — plus the standing emphases (the deployed-site census against the reference, the mobile navigation menu + the Tailwind v4 watch, the environment checklist), with the task brief's standing goal (the live deployment as a production-ready superset with visual parity) as the acceptance frame.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 4 (tests):** baseline fully green — unit 84/84, build 29/29 routes, e2e 158/158 (**242 total**) — exactly the documented session-20 state, zero drift. The session-20 code changes (`statusForNow`, the `StatusPill` `useSyncExternalStore` store, the `SiteFooter` live island, `screenshot-diff.mjs`) re-reviewed — clean.
- **Environment verified:** the local `.env` (`DATABASE_URL="file:../db/custom.db"`, the localhost canonical origin, a locally-generated `AUTH_SECRET`), `db/` at the repo root (`custom.db` pushed + seeded; `e2e.db` created by the suite), `.env.example` truthful, vitest + playwright configured and green — the task brief's checklist all holding.

## The deployment-refresh verification (session-20 candidate 2) — GREEN, and the deployment is a verified superset

The live deployment at `https://beauty-salon.jesspete.shop/` now runs the **session-20 build** — confirmed from the raw HTML itself: the pill's text span renders EMPTY pre-JS (the `useSyncExternalStore` "" server-snapshot contract) and the footer carries the `text-background/80 text-background/70` pair. The pill was then walked end-to-end on production:

- the four-state text renders ("OPENS TODAY AT 10:00" at Tuesday 05:12 UTC — before opening), every chrome instance agreeing (header + footer);
- the **LIVE minute-tick flip verified on the deployment**: a page-level clock patch past the open boundary (10:00:30) → the 60s ticker fired and BOTH pills flipped to "OPEN · CLOSES 19:00" (U+00B7) within the minute — the reference's measured live granularity, now proven on production;
- every functional surface re-verified green: all 16 public routes + the 404 (the F19-C leading-slash strip rule holding — `nope/deep/path`), the proxy's case-insensitive + trailing-slash rewrites (`/SERVICES`, `/services/`, `/SeRvIcEs/balayage` all 200), `/api/health` green, the canonical-origin sitemap/robots, the mobile drawer at its pinned computed styles (cream `rgb(250, 248, 245)` bg, `gap-2` 8px, `mt-10` 40px CTA, 48px Cormorant links at −1.2px tracking, ink, z-60) with working navigation (drawer link click → `/services`, drawer closed), the login (the deployment's `DEMO_USER_PASSWORD` honored → lands on `/`, auth-neutral chrome, no account/logout affordance), the booking happy path (native React setters → the full query string to the confirmation) + the receipt + the ICS fixed 90-minute block (14:00→15:30, raw commas), the newsletter success contract ("YOU'RE IN. CHECK YOUR INBOX FOR YOUR 15% CODE." — the CSS-uppercased rendering), the gallery lightbox (opens z-70, closes on Escape), and the login error card ("Invalid email or password" in the reference's shadcn Alert).

**Verdict: the deployment is a production-ready superset of the reference with visual parity** — every reference behavior present, plus the substrate the reference outsources to its platform.

## The reference re-verification — parity holding

Logged into the reference (`sepnetflix2023@outlook.com`): post-login lands on `/` (the marketing landing — the task brief's "dashboard", the pinned session-19 contract). The reference's mobile drawer matches the deployment's at every pinned computed value (48px Cormorant Garamond, 48px line-height, −1.2px tracking, ink `rgb(26, 26, 26)`, the 40px CTA margin). The landing `innerText` length: **2088 == 2088** (reference == deployment, byte-length identical). The reference's pill renders the same state as the deployment's at the same moment ("OPENS TODAY AT 10:00").

## The boundary-timezone sweep (session-20 candidate 1) — the stance CONFIRMED, and a pin-gap found

A 5-probe Playwright `timezoneId` census (UTC · Pacific/Auckland · America/Los_Angeles · Asia/Tokyo · Australia/Sydney) measured the reference's pill and the deployed clone's pill at the same instant:

| Timezone | Local clock at the instant | Reference pill | Deployed clone pill |
|---|---|---|---|
| UTC | Tue 05:18 (before open) | `OPENS TODAY AT 10:00` | `OPENS TODAY AT 10:00` ✓ |
| Pacific/Auckland | Tue 18:18 (during) | `OPEN · CLOSES 19:00` | `OPEN · CLOSES 19:00` ✓ |
| America/Los_Angeles | **Mon 22:18 (its local Monday)** | `CLOSED TODAY` | `CLOSED TODAY` ✓ |
| Asia/Tokyo | Tue 14:18 (during) | `OPEN · CLOSES 19:00` | `OPEN · CLOSES 19:00` ✓ |
| Australia/Sydney | Tue 16:18 (during) | `OPEN · CLOSES 19:00` | `OPEN · CLOSES 19:00` ✓ |

**5/5 agreement** — the pill reads the VISITOR's local clock (the LA probe is the sharpest: the same instant renders a different DAY — the salon's closed Monday for an LA visitor, Tuesday's before-open state for a UTC visitor). This CONFIRMS the local-clock stance is the reference's own, and the clone's `statusForNow(new Date())` matches it everywhere. **But the stance was UNPINNED**: every existing spec runs in the default context where local == UTC, so a regression that switched the pill to UTC methods (or a fixed salon timezone) would have been invisible to the 158-spec suite — the F20-A lesson one axis further: the machine was measured along TIME OF DAY in ONE timezone, and the visitor-timezone axis was under-sampled.

**Pinned (F21-A):** SP9/SP10 in `tests/e2e/status-pill-parity.spec.ts` — per-describe `timezoneId` contexts + the controlled clock: SP9 (America/Los_Angeles — the day-boundary crossing → "Closed today") and SP10 (Pacific/Auckland — the +13 during-open offset → "Open · closes 19:00"). **Validated both directions**: GREEN against the current code, and RED under a UTC-methods sabotage of `statusForNow` in a rebuilt standalone bundle (both specs failed; the sabotage reverted and the build restored) — the pin guards the stance.

## The e2e-seed hermeticity fix (F21-B — a REAL latent bug, found by audit judgment)

The Playwright `globalSetup` seeds `db/e2e.db` via `bun prisma/seed.ts`, and **bun auto-loads the repo `.env`** into that child process. A `.env` shaped like the production one from the task brief (which sets `DEMO_USER_PASSWORD="Abce1234"`) leaks into a **fresh** `db/e2e.db` — the seed's create-only-if-absent user upsert masks the leak on a warm DB, but the fresh-clone / post-reset state is exactly the cold case:

- **RED (demonstrated):** fresh `db/e2e.db` + `DEMO_USER_PASSWORD="Abce1234"` in `.env` → `auth › demo credentials sign in, set the session, and sign out` **FAILED** (the e2e demo user was seeded with the wrong password);
- **GREEN (the fix):** `tests/e2e/global-setup.ts` now pins `DEMO_USER_PASSWORD: "$Abcd1234"` in the seed env — the exact RED scenario re-run → **10/10 auth.spec passed**; the dev `.env` restored.

The fix mirrors ADR-002b one layer up: the dev scripts defend against ambient env via `with-repo-db.ts`; the e2e seed defends against the repo `.env` via its own explicit pin. The e2e suite is now hermetic against the `.env` it sits next to.

## Everything else verified this session

- The mobile navigation menu (the standing emphasis): verified working on BOTH the deployment (opens, pinned computed styles, navigates) and the reference (the same pinned values) — **zero Tailwind v4 regression**, re-confirmed by the full e2e gate.
- The capture-diff regression gate: **GREEN on this audit environment** (14/14 byte-identical — the canonical set reproduces byte-for-byte here; the environment reproduces the session-20 capture environment's raster state).
- The `skills/` folder remains excluded from code checking, testing, and compilation (Mode C convention; the audit gates never touch it).
- The canonical screenshot set re-captured from the remediated standalone build (the task brief's screenshot deliverable, under the repo's byte-deterministic convention — dev-server captures are explicitly forbidden): 14/15 byte-identical to the committed set, 07-contact re-captured (the documented external-map noise class); the diff gate GREEN after the re-capture.
- The `.env.example` re-verified truthful against the codebase (no env-var changes this session; it is tracked and committed as-is).

## Carried / accepted (unchanged)

- The two dev-only `bun audit` advisories (`braces`, `deepmerge-ts`) — the accepted-risk stance.
- The a11y-addition family (drawer Escape-close, aria-labels, the RM-visible stance) — unchanged, still pinned.
- The og/twitter/PWA + JSON-LD + canonical rejection (sessions 10/18) — unchanged, still negatively pinned.
- The 07-contact screenshot's external-map noise class — the single documented exception to the byte-determinism signal (the diff gate's designed exclusion).
- The residual e2e-BUILD coupling (documented, not a defect): `seo-parity.spec.ts` expects the localhost origin baked at build time — an operator who builds with a production-shaped `.env` gets a failing seo-parity (the build-time-baking contract is the documented deployment behavior).

## The remediation (per `docs/remediation-plan-session-21.md`)

- **T1 — the timezone pin:** SP9 + SP10 in `status-pill-parity.spec.ts` (the sweep-basis comment, per-describe `timezoneId` contexts, the controlled clock, every pill instance read) — validated GREEN (the prototype) and in the full suite.
- **T2 — the e2e hermeticity fix:** the `DEMO_USER_PASSWORD` pin in `global-setup.ts` + the trap comment; the RED scenario re-run GREEN; the dev `.env` restored.
- **T3 — full gate green:** lint ✓ (0 errors) · tsc ✓ · unit **84/84** · build **29/29 routes** · e2e **160/160** (158 + SP9/SP10) = **244 total** — every pre-existing contract untouched.
- **T4 — the canonical capture + the diff gate:** the set re-captured from the remediated build (14/15 byte-identical — a test-only change set; 07-contact the noise class) + the gate **GREEN** (14/14).
- **T5 — documentation aligned:** README (the counts 244/160, the timezone-stance row, the e2e-hermeticity note), AGENTS.md (the pill invariant's timezone clause, the SP9/SP10 spec convention, the e2e-seed env trap, the counts), CLAUDE.md (the counts + the spec list), PAD (the session-21 ledger + the testing table), SKILL.md → **v1.18.0**, this session log, the plan's executed results, the worklog.
- **T6 — push:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (the paramiko shim per the runbook) → remote == local verified → key shredded.

## Suggested next-session candidates

1. **A period-between-probes drift watch on the reference** — the reference has been stable across sessions 18–21's sweeps, but each census is a point-in-time measurement; a lightweight automated probe (a scheduled curl + pill/DOM diff against the last census record) would catch reference drift between sessions instead of at the next session's sweep.
2. **The ICS under a service-duration change** — the fixed 90-minute block is pinned against the reference's current behavior; if the reference's platform ever changes the event duration, the byte-parity download would drift silently (the negative pins would catch it only at the next e2e run — which is the designed tripwire, worth re-verifying after any reference-side deployment).
