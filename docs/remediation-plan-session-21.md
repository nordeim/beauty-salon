# Remediation Plan — Session 21 (The Timezone Sweep + The E2E Hermeticity Fix)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `8aa2203` (the session-20 deliverable `494b2d6` + the T8-executed docs follow-up `584b275` + the owner's docs-only commit `8aa2203` bringing `docs/session_21.md` — the raw session-20 transcript)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (the lint/typecheck/unit/build/e2e gate as the baseline; `skills/` excluded from code checking) + the deployed-site census on `https://beauty-salon.jesspete.shop/` and the reference re-verification on `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` + the **boundary-timezone sweep** (session-20's suggested candidate 1) with Playwright `timezoneId` contexts + the TDD/pin-gap discipline per `skills/tdd` and `skills/evidence-driven-testing`.

---

## 1. Executive Summary

The session-20 release re-validates **fully green** on every automated gate at the session-21 baseline (ESLint clean, `tsc --noEmit` clean, 84/84 unit, 29/29 build routes, 158/158 e2e — **242 total**): zero drift from the documented session-20 state. The environment checklist holds: the local `.env` carries `DATABASE_URL="file:../db/custom.db"`, `db/` lives at the repo root (`custom.db` + `e2e.db`, both git-ignored), the db-path seam anchors relative URLs exactly as documented, vitest + playwright are configured and green, and `.env.example` is truthful.

**The deployed-site census (the task brief's standing element) is green — and the deployment now runs the session-20 build:** the raw HTML's pill text span renders EMPTY pre-JS (the `useSyncExternalStore` "" server-snapshot contract) and the footer carries the `text-background/80 text-background/70` pair — the F20-A/B/H remediation is live on production. The pill was walked end-to-end on the deployment: the four-state text ("OPENS TODAY AT 10:00" at Tuesday 05:12 UTC), every chrome instance agreeing, AND the **live minute-tick flip** (a page-level clock patch past the open boundary → both pills flipped to "OPEN · CLOSES 19:00" within the 60s tick — the reference's measured live granularity, verified on production). Every functional surface re-verified green: all 16 public routes + the 404 (the F19-C strip rule holding), the proxy's case-insensitive + trailing-slash rewrites, `/api/health`, the canonical-origin sitemap/robots, the mobile drawer at its pinned computed styles (cream bg, 8px gap, 40px CTA margin, 48px Cormorant at −1.2px tracking, ink) with working navigation, the login (the deployment's `DEMO_USER_PASSWORD` honored, auth-neutral chrome, lands on `/`), the booking happy path + the confirmation receipt + the ICS 90-minute block, the newsletter success contract, the gallery lightbox, and the login error card. The reference re-verification: login lands on `/` (the "dashboard" = the marketing landing, the pinned contract), the drawer's computed styles match, and the landing `innerText` length is **2088 == 2088** (reference == deployment, byte-length identical). The capture-diff gate runs **GREEN on this environment** (14/14 byte-identical — the canonical set reproduces here).

**The session-20 suggested candidates both landed:**

1. **The boundary-timezone sweep of the pill (candidate 1) — executed, and it found a pin-gap.** A 5-probe sweep (Playwright `timezoneId` contexts: UTC · Pacific/Auckland · America/Los_Angeles · Asia/Tokyo · Australia/Sydney) measured the reference's pill and the deployed clone's pill at the same instant: **they agree at every timezone** — UTC renders Tuesday's before-open "OPENS TODAY AT 10:00", Auckland/Tokyo/Sydney render Tuesday's during-open "OPEN · CLOSES 19:00", and Los Angeles renders its LOCAL Monday "CLOSED TODAY" (the day-boundary crossing — a visitor in LA sees the salon's closed Monday while a UTC visitor sees Tuesday's before-open state). This CONFIRMS the local-clock stance is the reference's own (its SPA reads the browser clock), and the clone's `statusForNow(new Date())` matches it everywhere. **But the stance is UNPINNED**: every existing spec runs in the default context where local == UTC, so a regression that switched the pill to UTC methods (or to a fixed salon timezone) would be invisible to the 158-spec suite. Per the repo's pin-gap discipline (sessions 16–20: "a measured behavior is debt until it is pinned"), this session adds the timezone contracts.
2. **The deployment-refresh verification (candidate 2) — executed, green** (the paragraph above).

**One real (latent) bug found in the e2e hermeticity layer (F21-B):** the Playwright `globalSetup` seeds `db/e2e.db` via `bun prisma/seed.ts`, and **bun auto-loads the repo `.env`** into that child process. A `.env` shaped like the production one from the task brief (which sets `DEMO_USER_PASSWORD="Abce1234"`) leaks into the e2e seed on a **fresh** `db/e2e.db` (the seed only creates the demo user when absent, so the leak is masked on an already-seeded DB): the demo user is seeded with the wrong password and `auth.spec.ts`'s demo-credentials login fails — **demonstrated RED**: fresh `db/e2e.db` + `DEMO_USER_PASSWORD="Abce1234"` in `.env` → `auth › demo credentials sign in…` FAILED. The e2e suite must be hermetic against the repo `.env` it happens to sit next to (the same class of defense as ADR-002b's ambient-env trap, one layer up: the wrapper defends the dev scripts; the global-setup must defend the e2e seed).

Net: **two test-layer remediations (the timezone pin + the e2e-seed hermeticity fix) + the census records + documentation alignment + the push.** No application code changes — the app layer is at parity everywhere this session measured.

## 2. Findings register (live-measured 2026-10-06, agent-browser + Playwright timezoneId contexts)

| # | Severity | Surface | Live (measured) | Clone (current) | Decision |
|---|---|---|---|---|---|
| F21-A | **PIN-GAP — the headline** | the pill's local-clock (timezone) stance | reads the browser's LOCAL clock: 5/5 TZ probes agree ref == deployed clone (UTC "OPENS TODAY AT 10:00" · Auckland/Tokyo/Sydney "OPEN · CLOSES 19:00" · LA "CLOSED TODAY" — its local Monday while UTC is Tuesday) | `statusForNow(new Date())` matches everywhere — but NO spec pins the stance (all 158 run where local == UTC; a UTC-methods regression is invisible) | **PIN** — SP9/SP10 in `tests/e2e/status-pill-parity.spec.ts` (per-describe `timezoneId` contexts + the controlled clock; the day-boundary-crossing probe + the during-open offset probe) |
| F21-B | **REAL BUG (latent, e2e hermeticity)** | the e2e seed's `DEMO_USER_PASSWORD` leak | — | `global-setup.ts` runs `bun prisma/seed.ts` with `...process.env`; bun auto-loads the repo `.env` → a production-shaped `.env` (`DEMO_USER_PASSWORD="Abce1234"`) seeds the e2e demo user with the wrong password on a fresh DB → `auth.spec.ts` fails (**demonstrated RED**) | **FIX** — the global-setup pins `DEMO_USER_PASSWORD: "$Abcd1234"` in the seed env (the same explicit-env defense ADR-002b applies to the dev scripts; auth.spec's documented credential becomes the e2e contract, independent of the repo `.env`) |
| F21-C | VERIFIED OK | the deployment-refresh (session-20 candidate 2) | — | the deployment runs the session-20 build: the pill's static shell renders EMPTY pre-JS, the footer carries the `/80+/70` pair, the four states render, and the **live minute-tick flip** verified on production (clock patch → both pills flipped within the tick) | documented — the remediation-to-production loop closed |
| F21-D | VERIFIED OK | the deployed-site census | — | every functional surface green (routes, proxy rewrites, health, sitemap/robots, the drawer at pinned styles + navigation, login, booking + ICS, newsletter, lightbox, the 404 strip rule, the unknown-service state, the login error card) | documented — a production-ready superset |
| F21-E | VERIFIED OK | the reference re-verification | login → `/` (the "dashboard" = the landing); the drawer's pinned computed styles (48px Cormorant, −1.2px, 48px line-height, ink, 40px CTA margin); the landing innerText 2088 | matches (2088 == 2088) | documented |
| F21-F | VERIFIED OK | the capture-diff gate | — | GREEN on this environment (14/14 byte-identical; 07-contact the designed exclusion) — the canonical set reproduces byte-for-byte here | documented — the set stays canonical; T4 re-verifies after the change set |
| F21-G | VERIFIED OK | the environment checklist | — | `.env` (`DATABASE_URL="file:../db/custom.db"`, localhost origin, a locally-generated `AUTH_SECRET`), `db/` at the repo root, `.env.example` truthful, vitest + playwright configured | documented — the task brief's checklist all holding |

## 3. Root cause / analysis

- **F21-A (the pin-gap):** the session-20 measurement mapped the four-state machine along the TIME-OF-DAY axis but every probe ran in ONE timezone — the local-clock stance (which timezone's "now" the pill reads) was under-sampled, exactly the way TIME-OF-DAY itself was under-sampled in sessions 1–19 (the F20-A lesson). The sweep closes the axis: 5 contexts, both sites, every state agreeing. The remaining debt is that no executable contract encodes the stance — the suite's default context makes local == UTC, so the local-clock behavior is unobservable to it. The pin composes the two existing instruments (`page.clock` from the session-20 spec + `timezoneId` contexts) into the missing axis.
- **F21-B (the e2e leak):** the standalone-server env is already explicit (`DATABASE_URL`, `AUTH_SECRET` pinned in `playwright.config.ts` webServer), but the SEED child process inherits `...process.env` plus only `DATABASE_URL` — and bun's dotenv auto-loading merges the repo `.env` into that child. The seed's create-only-if-absent user upsert makes the leak invisible on a warm DB (the earlier green runs) and fatal on a cold one (the fresh-clone / post-reset case — precisely the state a fresh checkout produces). The fix mirrors ADR-002b one layer up: the test infrastructure owns its contract values explicitly instead of trusting ambient configuration.
- **Why the app layer needs no changes:** every functional and visual surface this session measured agrees between the reference and the deployment (F21-C/D/E) — the session-20 remediation closed the last known gap (the pill), and the timezone sweep confirms the fix holds across the visitor-timezone axis. The session's remediations are therefore test-layer-only: they convert the new measurements into executable contracts and repair the test infrastructure's own hermeticity.

## 4. Design (the deliverables)

### 4.1 The timezone pin — `tests/e2e/status-pill-parity.spec.ts` (SP9 + SP10)

A new describe block per timezone context (Playwright's per-describe `test.use({ timezoneId })`):

- **SP9 (America/Los_Angeles — the day-boundary crossing):** clock pinned to `2026-10-06T05:00:00Z` — Monday 22:00 in LA, Tuesday 05:00 in UTC. The pill must render the VISITOR's local day's state: `"Closed today"` (LA's Monday) — the sharpest probe (the same instant renders a different DAY, not just a different time).
- **SP10 (Pacific/Auckland — the during-open offset):** the same instant renders Tuesday 18:00 in Auckland — within the 10:00–19:00 window → `"Open · closes 19:00"` (the time-of-day state under a large offset).

Both read every pill instance (the shared `readPills` helper) so header + footer agreement stays pinned inside the TZ contexts. The header comment documents the sweep basis (5/5 probes, ref == clone at every TZ, the LA local-Monday crossing measured live). **Validated GREEN (the code holds the stance) and RED (the UTC-methods sabotage fails both specs — proven on a rebuilt standalone bundle before this plan's execution; the sabotage then reverted and the build restored).**

### 4.2 The e2e hermeticity fix — `tests/e2e/global-setup.ts`

The seed env gains the explicit pin:

```ts
const env = {
  ...process.env,
  DATABASE_URL: "file:../db/e2e.db",
  DEMO_USER_PASSWORD: "$Abcd1234", // auth.spec's documented credential — the e2e
  // seed must be hermetic against a repo .env that overrides it (bun
  // auto-loads .env into this child; the production-shaped .env sets
  // "Abce1234" — the fresh-DB RED is documented in session 21)
} as NodeJS.ProcessEnv;
```

The comment records the trap. The RED is already demonstrated (§1); the GREEN proof re-runs the failing scenario with the fix in place (fresh `db/e2e.db` + the production-shaped `.env` → `auth › demo credentials…` passes), then restores the dev `.env`.

### 4.3 The pins' blast radius (validated)

- No existing spec touches `timezoneId` (grep: zero hits) — the new describe blocks cannot perturb the shared-default-context specs.
- `links-parity`'s time-aware innerText census runs in the DEFAULT context and derives its expectation from `statusForNow(new Date())` at Node-side read time — Node's TZ equals the default browser context's TZ (both the machine's) — unaffected by the new TZ-scoped describes.
- The global-setup pin affects only the seed child process; the webServer env (already explicit for `DATABASE_URL`/`AUTH_SECRET`) is untouched; the application runtime keeps its documented env precedence.

## 5. TDD plan

**T1 (the pin, pin-gap pattern):** add SP9/SP10 → expected GREEN (the prototype already validated GREEN on the standalone build, and RED under the UTC-methods sabotage after a rebuild — the pin guards a real regression). **T2 (the fix, red-green):** RED already demonstrated (the fresh-DB + production-shaped `.env` failure); apply the global-setup pin → re-run the exact failing scenario → GREEN → restore the dev `.env` and the fresh DB. **T3:** the full gate — `lint → typecheck → test → build → test:e2e` — expected 84 unit + **160 e2e** (158 + SP9/SP10) = **244 total**. **T4:** the canonical capture re-run + the diff gate (a test-only change set must not move pixels — the gate re-verified GREEN; the committed set stays canonical). **T5:** documentation alignment (§4.4). **T6:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local → shred the operator key.

### 4.4 Documentation

- `docs/session_21.md` — the proper session-21 record (replacing the owner's raw session-20 transcript file, the sessions-4–20 convention);
- this plan (`docs/remediation-plan-session-21.md`) with the executed-results column;
- `README.md` — the testing-table counts (160/244) + the timezone-stance row in the pill feature family + the e2e-hermeticity note;
- `AGENTS.md` — the timezone-pin convention line (the spec list entry) + the global-setup pin note + the counts;
- `CLAUDE.md` — the counts + the spec list;
- `Project_Architecture_Document.md` — the session-21 verification ledger + the testing-table counts;
- `beauty-salon_SKILL.md` → v1.18.0 — the project_state, Appendix B inventory, Appendix C history;
- `worklog.md` — the session-21 entry.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The timezone pin composes with the existing instruments | prototype SP9/SP10 run on the standalone build: GREEN; the UTC-methods sabotage (rebuilt) fails both; restored + rebuilt → GREEN again | ✓ validated both directions |
| No existing spec uses `timezoneId` | grep over `tests/e2e/*`: zero hits | ✓ no perturbation |
| The e2e leak is real and cold-DB-only | fresh `db/e2e.db` + `DEMO_USER_PASSWORD="Abce1234"` in `.env` → `auth › demo credentials…` FAILED (demonstrated); a warm DB masks it (the seed's create-only-if-absent upsert) | ✓ RED demonstrated |
| The global-setup pin is the right seam | `global-setup.ts:14-17` builds the seed env; the seed reads `process.env.DEMO_USER_PASSWORD` (`prisma/seed.ts:301`); auth.spec pins `$Abcd1234` (`auth.spec.ts:6`) | ✓ one env entry |
| The canonical capture is unaffected by a test-only change set | the diff gate GREEN on this environment pre-change (14/14); the change set touches only `tests/` + docs | ✓ T4 re-verifies |
| The `.env.example` stays truthful | no env-var changes this session (the fix pins a value INSIDE the test infrastructure, not a new variable) | ✓ unchanged, verified |
| The app layer needs no changes | F21-C/D/E: every measured surface agrees (the deployment = the reference at every probe incl. the TZ sweep) | ✓ test-layer-only session |

## 7. Risks

- **SP9/SP10 depend on Playwright's timezoneId fidelity** (the ICU TZ rendering of a controlled-clock instant) — the same primitive the sweep instrument used, and the sweep's reference-side reads used it too (a systematic TZ rendering error would cancel on both sides). The pin asserts the CLONE side against the model; the reference side is documented in the session record (the sweep evidence).
- **The hermeticity fix pins `$Abcd1234` in two places** (auth.spec + global-setup) — if the documented credential ever changes, both must move together; the global-setup comment points at auth.spec. (The alternative — deriving one from the other across processes — adds coupling for no hermeticity gain.)
- **The residual e2e-build coupling (documented, not fixed):** `seo-parity.spec.ts` expects the localhost origin baked at build time; an operator who builds with a production-shaped `.env` (`NEXT_PUBLIC_SITE_URL=https://…`) gets a failing seo-parity. That is the documented build-time-baking contract (the deployment sets the origin BEFORE `next build` by design) — the e2e gate requires a dev-shaped build. Documented in the session record; not a defect.
- **The e2e webServer's other env vars** remain process-env-inherited (except the two pinned) — acceptable: bun's `.env` auto-load cannot override an explicitly-set webServer env value, and the runtime variables that matter (`DATABASE_URL`, `AUTH_SECRET`) are already pinned.

## 8. ToDo List (execution order)

- [x] **T1.** The timezone pin: SP9 (America/Los_Angeles — the day-boundary crossing, `"Closed today"`) + SP10 (Pacific/Auckland — the during-open offset, `"Open · closes 19:00"`) in `tests/e2e/status-pill-parity.spec.ts`, per-describe `timezoneId` contexts + the controlled clock, every pill instance read. Validated GREEN (the prototype) — re-verified in the full suite. *(Executed — green in the 160-spec suite.)*
- [x] **T2.** The e2e hermeticity fix: `DEMO_USER_PASSWORD: "$Abcd1234"` pinned in `global-setup.ts`'s seed env + the trap comment; the RED scenario re-run GREEN (fresh `db/e2e.db` + the production-shaped `.env` → auth.spec 10/10 passed); the dev `.env` restored. *(Executed.)*
- [x] **T3.** Full gate: `lint → typecheck → test → build → test:e2e` — lint 0 errors · tsc clean · unit 84/84 · build 29/29 routes · e2e **160/160** (158 + 2) = **244 total**. *(Executed.)*
- [x] **T4.** The canonical capture re-run (`bun scripts/capture-screenshots.mjs`) + the diff gate (`bun scripts/screenshot-diff.mjs`) — 14/15 byte-identical (a test-only change set; 07-contact re-captured as the documented map-noise class); the gate **GREEN** (14/14). *(Executed.)*
- [x] **T5.** Documentation alignment: README · AGENTS.md · CLAUDE.md · PAD · SKILL.md → v1.18.0 · `docs/session_21.md` (the proper record) · this plan (the executed results) · `worklog.md`. *(Executed.)*
- [x] **T6.** Secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`) → verify remote == local → shred the operator key. *(Executed — see §10.)*

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The timezone pin | `tests/e2e/status-pill-parity.spec.ts` (SP9 + SP10 + the sweep-basis comment) |
| The e2e hermeticity fix | `tests/e2e/global-setup.ts` |
| The census records + doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.18.0) |
| The session record + plan + worklog | `docs/session_21.md` (the proper record), `docs/remediation-plan-session-21.md`, `worklog.md` |
| The re-captured noise-class shot | `docs/screenshots/07-contact-desktop.png` (the documented external-map noise class — the canonical re-capture's output) |

## 10. Push evidence (session 21)

- Committed as one atomic commit to `main` (the two test-layer remediations + the census records + the doc alignments + the plan/session-log/worklog + the re-captured 07-contact noise-class shot).
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in any tracked file or the staged diff; no tracked env/db/key files beyond `.env.example`.
- Pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the paramiko shim per the runbook) — the wrapper's own remote verification + the tracking-ref sync; independent re-confirmation via `git ls-remote` (remote == local, byte-exact); the operator key shredded post-push (the wrapper's temp copy shreds itself on every exit).
