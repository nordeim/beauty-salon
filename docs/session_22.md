# Session 22 — Audit: The Reference-Drift Watch + The PAD §10 Doc Repair (2026-10-06)

**Baseline:** remote `main` @ `535cc7b` (the session-21 deliverable `c9d0122` + the evidence follow-up `aabf69f` + the owner's docs-only commit bringing `docs/session_22.md` — the raw session-21 transcript — and `docs/prompt-to-review-4.md`).

**Method:** Mode C audit (`skills/code-review-and-audit` — the full gate as the baseline; `skills/` excluded) + the deployed-site census on `https://beauty-salon.jesspete.shop/` and the reference re-verification on `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` + the instrument-validation discipline per `skills/tdd` and `skills/evidence-driven-testing` (the GREEN/RED/exit-2 validation the `screenshot-diff` gate received in session 20, applied to the new instrument).

> Note: this file previously held the raw process transcript of session 21 (committed by the owner). It has been replaced by this proper session-22 record — the same convention sessions 4–21 applied to their own transcript files.

## What this session set out to do

Refresh the workspace (`git pull` brought the owner's transcript commit only — no code changes), re-validate the documented architecture against the codebase, re-run the full audit gate, execute **session-21's two suggested candidates** — (1) the reference-drift watch and (2) the reference-ICS re-verification — plus the standing emphases (the deployed-site census against the reference, the mobile navigation menu + the Tailwind v4 watch, the environment checklist), with the task brief's standing goal (the live deployment as a production-ready superset with visual parity) as the acceptance frame.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 4 (tests):** baseline fully green — unit 84/84, build 29/29 routes, e2e 160/158→160/160 (**244 total**) — exactly the documented session-21 state, **zero drift**. The commits since the session-21 baseline audited: session 21's own two test-layer files (the global-setup hermeticity pin + SP9/SP10, both re-reviewed clean) and the owner's docs-only transcript commit — **no application code changes**, so no deployment refresh was required (verified live below).
- **Recent-code re-review:** the session-21 change set (`tests/e2e/global-setup.ts` + `tests/e2e/status-pill-parity.spec.ts`) matches its documented design exactly (the `DEMO_USER_PASSWORD` pin with the trap comment; the SP9/SP10 per-describe `timezoneId` contexts + the controlled clock). The API routes spot-checked clean (validation narrowing, no account enumeration, rate limiting, typed error codes, no secrets logged).
- **Environment verified:** the local `.env` (`DATABASE_URL="file:../db/custom.db"`, the localhost canonical origin, a locally-generated `AUTH_SECRET`), `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful, vitest + playwright configured and green — the task brief's checklist all holding.

## The deployed-site census — all green, the deployment verified as a production-ready superset

The live deployment at `https://beauty-salon.jesspete.shop/` still runs the current build (the raw HTML carries the pill's pre-JS EMPTY static shell + the footer `/80+/70` pair — the session-20/21 build contract; no app code has changed since, so no refresh was due):

- **27 route probes green:** the 20 public routes, the 404 (`/nope/deep/path` → 404 with the client-rendered message interpolating `nope/deep/path` — the leading slash stripped, inner slashes kept), the proxy rewrites (`/SERVICES` and `/services/` → 200 with `redirect: "manual"` returning `type=basic`, no `Location` header — the URL bar stays as typed), the unknown-service soft-404 (`/services/unknown-xyz` → 200 "Service not found / RETURN TO THE ALMANAC" inside the site chrome), `sitemap.xml` (200 `application/xml`, 12 locs, the production origin first) and `robots.txt` (200 `text/plain`).
- **The mobile drawer (the standing emphasis) at its pinned computed styles:** cream `rgb(250, 248, 245)` bg, z-60 fixed, the five 48px Cormorant Garamond links (line-height 48px, tracking −1.2px, ink `rgb(26, 26, 26)`), the nav container `display: flex; gap: 8px`, the CTA wrapper `margin-top: 40px` — every pinned value holding, and the drawer navigates (Treatments → `/services`, drawer closed). **Zero Tailwind v4 regression.**
- **The login flow:** the deployed `DEMO_USER_PASSWORD` honored → lands on `/` (the pinned post-login contract), auth-neutral chrome (the standard header set, no account/logout affordance), the session verified server-side via `/api/auth/me` → 200 + the demo user.
- **The booking happy path:** the full form (native React setters for the date/time inputs) → `/book/confirmation?name=…&date=2026-11-10&time=14%3A00&service=balayage` with the receipt ("Thank you, Test.", the RESERVED FOR card) and the **ICS download**: the 13-line census, the fixed 90-minute block (`DTSTART 20261110T140000Z` → `DTEND 20261110T153000Z`), raw commas in the LOCATION line, no STATUS/TRANSP.
- **The newsletter success state** ("YOU'RE IN…" — the CSS-uppercased rendering), **the gallery lightbox** (opens z-70, closes on Escape), and **the login error card** ("Invalid email or password", the trap-7 oklab serialization of red-50/70, border `rgb(254, 202, 202)`, radius 12px).

## The reference re-verification — parity holding everywhere measured

Logged into the reference (`sepnetflix2023@outlook.com`): post-login lands on `/` (the "dashboard" = the marketing landing, the pinned session-19 contract). The parity probes at the same instant:

- the pill: **"OPENS TODAY AT 10:00" both sides** (Tuesday before-open);
- the landing innerText: **2088 == 2088** — with a methodological note: a PRE-reveal read on the reference measures 2085 (a transient 3-char deficit — unrevealed animation content excluded from innerText); the full-reveal scroll convention (scroll to bottom → settle → back to top → settle) restores the deterministic 2088 on both sides. The convention is now baked into the drift-watch instrument;
- the services innerText: **1958 == 1958**, the time-aware formula `1918 + 2 × len(pill text)` holding on both sides (the pill renders twice);
- the mobile drawer: **identical at every pinned value** (the same cream bg, z-60, 48px Cormorant set, gap 8px, CTA mt 40px);
- the login error card: identical text/border/radius (the bg differs only in the v3-`rgba` vs v4-`oklab` STRING — pixels identical, the trap-7 class); the newsletter success state: identical (the CSS-uppercased row).

## Session-21's suggested candidates — both executed

1. **Candidate 2 (the reference-ICS re-verification) — EXECUTED, no drift:** a fresh booking on the reference (`2026-11-10` @ 14:00, balayage) produced a **byte-format-identical** ICS download — the same 13-line census, the same fixed 90-minute block (`DTSTART 20261110T140000Z` → `DTEND 20261110T153000Z`), the same raw-comma LOCATION, no STATUS/TRANSP, and the same confirmation query-string contract. The reference's platform has not changed the event duration; the clone's pinned byte-parity contract remains valid.
2. **Candidate 1 (the reference-drift watch) — DELIVERED as this session's headline remediation (F22-B):** `scripts/reference-drift-watch.mjs` + the committed census record `docs/reference-census.json`. A read-only Playwright probe that pins the browser clock to the census instant (`2026-10-06T05:00:00Z`) and the context timezone to UTC (load-bearing — the pill reads the visitor's LOCAL clock per the SP9/SP10 stance, so an unpinned timezone would render a different day's state on a non-UTC machine), walks the reference's four public parity surfaces (P1 the pill's four-state text; P2 the landing innerText census under the full-reveal convention; P3 the services census + the formula re-derived; P4 the drawer's nine pinned computed styles), and diffs against the committed record. **Validated all three paths: GREEN** (exit 0, 14/14 probes against the live reference), **RED** (a corrupted record copy — exit 1, both seeded corruptions [the landing length + the drawer gap] named with expected/actual), and **instrument-failure** (an unreachable URL → exit 2, "the probe failed is not drift evidence"). Deliberately an **ad-hoc network instrument, NOT part of the offline 244-test gate** — the same class as the capture-diff gate, on the reference side.

## The one real defect found — a documentation one (F22-A)

`Project_Architecture_Document.md` §10 (Known Issues & Deferred Work) still carried the pre-session-20 **"Static-build status pill"** entry ("the footer's … text is computed at request/build time on the server … a cross-midnight-cached static page could show a stale footer label") — **stale since F20-B** (session 20 replaced the footer pill with the same live `StatusPill` client island the header uses; `SiteFooter.tsx` imports and renders it; SP3/SP8 pin both chrome instances agreeing). A reader consulting §10 today would believe a fixed-two-sessions-ago defect still exists. **Fixed:** the entry removed; the pill layer carries no open known issue. The lesson: doc staleness survives automated guards — the hygiene test checks that doc REFERENCES resolve, not that doc CONTENT is semantically accurate; only a line-by-line doc-vs-code pass catches a fixed defect still listed as open.

## Everything else verified this session

- The capture-diff regression gate: the canonical set re-captured from the current build (the task brief's screenshot deliverable, under the repo's byte-deterministic standalone-server convention — dev-server captures are explicitly forbidden) and the gate **GREEN** (14/14 byte-identical; 07-contact the documented external-map noise class, re-captured as its noise-class output).
- The `skills/` folder remains excluded from code checking, testing, and compilation (Mode C convention; the audit gates never touch it).
- The `.env.example` re-verified truthful (no env-var changes this session; tracked and committed as-is).
- The vitest + playwright configurations re-verified green through the full gate.

## Carried / accepted (unchanged)

- The two dev-only `bun audit` advisories (`braces`, `deepmerge-ts`) — the accepted-risk stance.
- The a11y-addition family (drawer Escape-close, aria-labels, the RM-visible stance) — unchanged, still pinned.
- The og/twitter/PWA + JSON-LD + canonical rejection (sessions 10/18) — unchanged, still negatively pinned.
- The 07-contact screenshot's external-map noise class — the single documented exception to the byte-determinism signal.
- The residual e2e-BUILD coupling (documented, not a defect): `seo-parity.spec.ts` expects the localhost origin baked at build time.

## The remediation (per `docs/remediation-plan-session-22.md`)

- **T1 — the reference-drift watch:** `scripts/reference-drift-watch.mjs` (P1–P4, the clock+TZ pins, the exit-code convention, `--record`/`--url` flags) + `docs/reference-census.json` (this session's measured constants) — validated GREEN / RED / instrument-failure.
- **T2 — the PAD §10 repair:** the stale "Static-build status pill" entry removed.
- **T3 — full gate green:** lint ✓ (0 errors) · tsc ✓ · unit **84/84** · build **29/29 routes** · e2e **160/160** = **244 total** — every pre-existing contract untouched.
- **T4 — the canonical capture + the diff gate:** the set re-captured (14/15 byte-identical — an instrument/docs-only change set; 07-contact the noise class) + the gate **GREEN** (14/14).
- **T5 — documentation aligned:** README (the reference-drift-watch feature row + the instrument paragraph), AGENTS.md (the command-table row), CLAUDE.md (the commands row), PAD (the §10 repair + the instruments note + the session-22 ledger), SKILL.md → **v1.19.0**, this session log, the plan's executed results, the worklog.
- **T6 — push:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (the paramiko shim per the runbook) → remote == local verified → key shredded.

## Suggested next-session candidates

1. **Run the drift watch on a schedule the operator controls** — the instrument is committed and one command (`bun scripts/reference-drift-watch.mjs`); the natural next step is a cadence (e.g. before each session's audit, or an operator-side cron) plus a convention of recording each GREEN run's date in `docs/reference-census.json`'s `last_verified` field when the census is re-confirmed.
2. **The auth'd-state re-census on the reference** — the session-19 authed-state pins (login-renders-when-auth'd, no-prefill, the auth'd 404) are recorded values; a periodic re-walk after any reference-side platform update would extend the drift-watch's coverage to the POST-bearing surfaces the read-only instrument deliberately excludes.
