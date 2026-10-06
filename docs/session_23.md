# Session 23 — Audit: The Drift-Watch P5 Auth-Shell Probe + The Session-22 Candidates Executed (2026-10-06)

**Baseline:** remote `main` @ `e1bf686` (the session-22 deliverable `bc18a42` + the evidence follow-up `b4cb653` + the owner's docs-only commit bringing `docs/session_23.md` — the raw session-22 transcript).

**Method:** Mode C audit (`skills/code-review-and-audit` — the full gate as the baseline; `skills/` excluded) + the deployed-site census on `https://beauty-salon.jesspete.shop/` and the reference re-verification on `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` + the instrument-validation discipline per `skills/tdd` and `skills/evidence-driven-testing` (the GREEN/RED/exit-2 validation the drift-watch received in session 22, applied to its P5 extension).

> Note: this file previously held the raw process transcript of session 22 (committed by the owner). It has been replaced by this proper session-23 record — the same convention sessions 4–22 applied to their own transcript files.

## What this session set out to do

Refresh the workspace (`git pull` brought the owner's transcript commit only — no code changes), re-validate the documented architecture against the codebase, re-run the full audit gate, execute **session-22's two suggested candidates** — (1) the drift-watch cadence run and (2) the auth'd-state re-census on the reference — plus the standing emphases (the deployed-site census against the reference, the mobile navigation menu + the Tailwind v4 watch, the environment checklist), with the task brief's standing goal (the live deployment as a production-ready superset with visual parity) as the acceptance frame.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 4 (tests):** baseline fully green — unit 84/84, build 29/29 routes, e2e 160/160 (**244 total**) — exactly the documented session-22 state, **zero drift**. The only commit since the session-22 push audited: the owner's docs-only transcript commit — **no application code changes**, so no deployment refresh was required (verified live below).
- **Environment verified:** the local `.env` (`DATABASE_URL="file:../db/custom.db"`, the localhost canonical origin, a locally-generated `AUTH_SECRET`), `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful and the only tracked `.env*` file, vitest + playwright configured and green — the task brief's checklist all holding.

## The deployed-site census — all green, the deployment verified as a production-ready superset

The live deployment at `https://beauty-salon.jesspete.shop/` still runs the current build (the raw HTML carries the pill's pre-JS EMPTY static shell + the footer `/80+/70` pair — the session-20/21 build contract; no app code has changed since, so no refresh was due):

- **27 route probes green:** the 21 public routes, the 404 (`/nope/deep/path` → 404 with the client-rendered message), the proxy rewrites (`/SERVICES` and `/services/` → 200 with `redirect: "manual"` returning no `Location` header — the URL bar stays as typed), the unknown-service soft-404 (`/services/unknown-xyz` → 200 "Service not found" inside the site chrome), `sitemap.xml` (200 `application/xml`, 12 locs, the production origin first) and `robots.txt` (200 `text/plain`).
- **The mobile drawer (the standing emphasis) at its pinned computed styles at 390×844:** cream `rgb(250, 248, 245)` bg, z-60 fixed, the 48px Cormorant Garamond links (line-height 48px, tracking −1.2px, ink `rgb(26, 26, 26)`), the links column `gap: 8px`, the CTA wrapper `margin-top: 40px` — every pinned value holding, and the drawer navigates (Treatments → `/services`, drawer closed). **Zero Tailwind v4 regression.**
- **The login flow:** the deployed `DEMO_USER_PASSWORD` honored → lands on `/` (the pinned post-login contract), auth-neutral chrome, the session verified server-side via `/api/auth/me` → 200 + the demo user. The deliberate wrong-email attempt re-verified **the login error card** ("Invalid email or password" — the shadcn Alert contract).
- **The booking happy path:** the full form (native React setters for the selects/date/time) → `/book/confirmation?name=…&date=2026-11-10&time=14%3A00&service=balayage` with the receipt, and the **ICS download**: the 13-line census, the fixed 90-minute block (`DTSTART 20261110T140000Z` → `DTEND 20261110T153000Z`), raw commas in the LOCATION line, no STATUS/TRANSP.
- **The newsletter success state** ("YOU'RE IN. CHECK YOUR INBOX FOR YOUR 15% CODE." — the CSS-uppercased rendering), **the gallery lightbox** (opens z-70, closes on Escape), and **the same-instant pill parity** ("Opens today at 10:00" both sides at the same minute — the reference and the deployment probed back-to-back).

## The reference re-verification + both session-22 suggested candidates — executed

Logged into the reference (`sepnetflix2023@outlook.com`): post-login lands on `/` (the "dashboard" = the marketing landing, the pinned session-19 contract).

1. **Candidate 1 (the drift-watch cadence run) — EXECUTED, GREEN:** `bun scripts/reference-drift-watch.mjs` run as this session's pre-audit step — **14/14 probes PASS, exit 0** (the pill text, the landing 2088 / services 1958 censuses, the drawer's nine pinned styles — no reference-side drift). The `last_verified` convention applied (the record's date is this session's re-confirmation).
2. **Candidate 2 (the auth'd-state re-census on the reference) — EXECUTED, all four pins GREEN:** the session-19 authed-state pins re-walked live — post-login lands on `/` ✓; `/login` re-renders the sign-in card when auth'd (the URL stays, the h1 + form present — NO redirect) ✓; the auth-neutral chrome (no logout/account affordance in the header or footer, no account chip) ✓; the no-prefill book form (all 8 controls empty) ✓; the auth'd 404 (the standard slate card with `nope-session23` interpolated, the standard chrome) ✓.
3. **The login-shell computed-style parity measured BOTH sides this session** (the P5 design input): the h1's default-sans font stack, the slate-900 h1 color + Sign-in bg, the white button text, the slate-200 input border, the `you@example.com` placeholder — **identical at every probed value on both sites** (the input BACKGROUND differing only in the v3-`rgba` vs v4-`oklab` STRING — pixels identical, the trap-7 class).

## The remediation (per `docs/remediation-plan-session-23.md`)

- **T1 — the drift-watch P5 auth-shell probe (the headline, F23-A):** `scripts/reference-drift-watch.mjs` extended with P5 — the fifth public parity surface (the reference's `/login`) now has its reference-side tripwire: six string-stable computed-style constants (the default-sans font context, the slate-900 h1 + Sign-in pair, the white button text, the slate-200 input border, the placeholder) committed as the `login_shell` block in `docs/reference-census.json` and probed read-only (GET navigation only; the POST-bearing error-card contract stays a session-census activity; the input background deliberately excluded — the trap-7 string-unstable class, a string probe would false-DRIFT on engine differences). **Validated all three paths: GREEN** (exit 0, **20/20 probes** against the live reference — P1–P4's 14 + P5's six), **RED** (a corrupted record copy — exit 1, both seeded corruptions [the h1 color + the input border color] named with expected/actual), and **instrument-failure** (an unreachable URL → exit 2 — re-validated).
- **T2 — full gate green:** lint ✓ (0 errors) · tsc ✓ · unit **84/84** · build **29/29 routes** · e2e **160/160** = **244 total** — every pre-existing contract untouched.
- **T3 — the canonical capture + the diff gate:** the set re-captured (07-contact re-captured as its noise-class output — an instrument/record-only change set) and the gate **GREEN** (14/14 byte-identical).
- **T4 — documentation aligned:** README (the feature row's fifth surface), AGENTS.md (the command row), CLAUDE.md (the commands row), PAD (the instruments note + the session-23 verification ledger), SKILL.md → **v1.20.0**, this session log, the plan's executed results, the worklog.
- **T5 — push:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (the paramiko shim per the runbook) → remote == local verified → key shredded.

## Carried / accepted (unchanged)

- The two dev-only `bun audit` advisories (`braces`, `deepmerge-ts`) — the accepted-risk stance.
- The a11y-addition family (drawer Escape-close, aria-labels, the RM-visible stance) — unchanged, still pinned.
- The og/twitter/PWA + JSON-LD + canonical rejection (sessions 10/18) — unchanged, still negatively pinned.
- The 07-contact screenshot's external-map noise class — the single documented exception to the byte-determinism signal.
- The residual e2e-BUILD coupling (documented, not a defect): `seo-parity.spec.ts` expects the localhost origin baked at build time.
- The read-only scope of the drift-watch (the POST-bearing contracts — the login-error card, the newsletter success, the ICS byte format — stay session-census activities): the login-error card + newsletter were re-verified on the deployment this session, and the ICS was re-verified on the reference in session 22 (F22-C).

## Suggested next-session candidates

1. **The remaining public-surface probes:** the drift-watch now covers the landing (P1/P2), services (P3), the drawer (P4), and the login shell (P5). The natural extension candidates are the per-route head layer (the favicon + the dead manifest link — read-only computed `<head>` reads) and the gallery/team/about/contact innerText censuses (the same full-reveal convention as P2/P3) — each a read-only, deterministic addition of the same class.
2. **The operator-side cron for the watch:** the cadence is now the documented pre-audit convention; the next step is an operator-controlled schedule (e.g. a weekly cron running `bun scripts/reference-drift-watch.mjs` with the exit codes wired to a notification), plus recording each GREEN run's date in `last_verified` per the session-22 convention.
