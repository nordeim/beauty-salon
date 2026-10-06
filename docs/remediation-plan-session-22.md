# Remediation Plan — Session 22 (The Reference-Drift Watch + The PAD §10 Doc Repair)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `535cc7b` (the session-21 deliverable `c9d0122` + the evidence follow-up `aabf69f` + the owner's docs-only commit bringing `docs/session_22.md` — the raw session-21 transcript — and `docs/prompt-to-review-4.md`)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (the lint/typecheck/unit/build/e2e gate as the baseline; `skills/` excluded from code checking) + the deployed-site census on `https://beauty-salon.jesspete.shop/` and the reference re-verification on `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` + the TDD/instrument-validation discipline per `skills/tdd` and `skills/evidence-driven-testing` (the same GREEN/RED validation the `screenshot-diff` gate received in session 20).

---

## 1. Executive Summary

The session-21 release re-validates **fully green** on every automated gate at the session-22 baseline (ESLint clean, `tsc --noEmit` clean, 84/84 unit, 29/29 build routes, 160/160 e2e — **244 total**): zero drift from the documented session-21 state. The only commits since the session-21 baseline are session 21's own two test-layer files (re-audited clean this session) and the owner's docs-only transcript commit — **no application code has changed**, so no deployment refresh is required (verified live: the deployment still runs the session-20/21 build — the pill's pre-JS empty static shell + the footer `/80+/70` pair confirmed in the raw HTML).

**The deployed-site census (the task brief's standing element) is green end-to-end:** all 27 route probes (20 public routes + the 404 + the proxy's case-insensitive/trailing-slash rewrites with `redirect: manual` proving the URL bar stays as typed + the unknown-service soft-404 + sitemap/robots under the production origin), the mobile drawer at its pinned computed styles (cream `rgb(250,248,245)`, z-60, 48px Cormorant, lh 48px, −1.2px tracking, ink, nav `gap 8px`, CTA wrapper `mt 40px`) with working navigation, the login (the deployment's `DEMO_USER_PASSWORD` honored → lands on `/`, auth-neutral chrome, the session verified via `/api/auth/me`), the booking happy path (the full query-string contract on the confirmation) + the ICS fixed 90-minute block, the newsletter success state, the gallery lightbox + Escape close, the login error card (the trap-7 oklab serialization of red-50/70), and the 404 leading-slash strip rule. **The reference re-verification: parity holding everywhere measured** — the pill ("OPENS TODAY AT 10:00" both sides at the same instant), the landing innerText **2088 == 2088** (after the full-reveal scroll convention; a pre-reveal read shows a transient 3-char deficit — unrevealed animation content, not drift), the services innerText **1958 == 1958** (the `1918 + 2 × len(pill)` time-aware formula holding on both sides), the drawer's pinned computed styles identical, the login error card identical (the bg differing only in the v3-rgba vs v4-oklab STRING — pixels identical, the trap-7 class), and the newsletter success state (the CSS-uppercased "YOU'RE IN…" row).

**Session-21's suggested candidate 2 EXECUTED (F22-C): the ICS contract re-verified on the reference** — a fresh reference booking (2026-11-10 @ 14:00, balayage) produced a byte-format-identical download: the 13-line census, the fixed 90-minute block (`DTSTART 20261110T140000Z` → `DTEND 20261110T153000Z`), the raw-comma LOCATION, no STATUS/TRANSP, and the same confirmation query-string contract. The reference's platform has NOT changed the event duration — the clone's pinned byte-parity contract remains valid.

**Session-21's suggested candidate 1 is this session's headline remediation (F22-B): the reference-drift watch.** Every census so far is a point-in-time measurement; the reference has been stable across sessions 18–22's sweeps, but drift is only caught at the NEXT session's manual walk. This session converts the suggestion into an executable tripwire: `scripts/reference-drift-watch.mjs` + the committed census record `docs/reference-census.json` — a read-only Playwright probe that pins the browser clock + timezone to the census instant, walks the reference's public parity surfaces (the pill's four-state text, the landing/services innerText censuses, the mobile drawer's pinned computed styles), diffs against the committed record, and exits non-zero on drift. It is an **ad-hoc network instrument, deliberately NOT part of the automated 244-test gate** (the gate stays hermetic/offline), validated both GREEN (against the live reference) and RED (a corrupted record must trip it) before commit — the same discipline the capture-diff gate received.

**One real documentation defect found (F22-A):** `Project_Architecture_Document.md` §10 (Known Issues & Deferred Work) still carries the pre-session-20 "Static-build status pill" entry — "the footer's … text is computed at request/build time on the server … a cross-midnight-cached static page could show a stale footer label" — which **contradicts the F20-B remediation** (session 20 replaced the footer pill with the same live `StatusPill` client island the header uses; `SiteFooter.tsx` imports and renders it, and `status-pill-parity.spec.ts` SP3/SP8 pin both instances). The entry is stale doc drift: a reader consulting §10 today would believe a defect that was fixed two sessions ago still exists. Fix: replace the entry with the accurate residual (none for the pill; the known-issues list keeps the other six standing entries).

Net: **one instrument deliverable + one doc repair + the census records + documentation alignment + the push.** No application code changes — the app layer is at parity everywhere this session measured (F22-C/D/E).

## 2. Findings register (live-measured 2026-10-06, agent-browser + the baseline gate)

| # | Severity | Surface | Live (measured) | Clone (current) | Decision |
|---|---|---|---|---|---|
| F22-A | **DOC DRIFT — the repair** | PAD §10 Known Issues | — | the "Static-build status pill" entry describes the pre-session-20 footer (server-baked text) — stale since F20-B made it a live client island (pinned by SP3/SP8) | **FIX** — replace the entry; the pill has no open known issue |
| F22-B | **INSTRUMENT GAP — the headline** | reference-drift detection between sessions | stable across sessions 18–22's point-in-time sweeps | no executable probe exists — reference drift is caught only at the next session's manual census | **ADD** — `scripts/reference-drift-watch.mjs` + `docs/reference-census.json` (session-21's suggested candidate 1; read-only probes, clock+TZ pinned, exit 1 on drift, exit 2 on instrument failure) |
| F22-C | VERIFIED OK | the reference's ICS contract (session-21 suggested candidate 2) | re-booked live: the 13-line census, fixed 90-min block, raw commas, no STATUS/TRANSP — byte-format identical | matches (the pinned `tests/ics.test.ts` + `booking-parity.spec.ts` contracts remain valid) | documented — candidate 2 executed, no drift |
| F22-D | VERIFIED OK | the deployed-site census | — | every functional surface green (27 route probes, drawer at pinned styles + navigation, login → `/` auth-neutral, booking + ICS, newsletter, lightbox, error card, 404 strip rule) | documented — a production-ready superset with visual parity |
| F22-E | VERIFIED OK | the reference re-verification | pill "OPENS TODAY AT 10:00" · landing 2088 (post-reveal) · services 1958 · drawer styles identical · login error card identical · newsletter success identical | matches at every probe | documented — parity holding |
| F22-F | VERIFIED OK | the baseline audit gate | — | lint ✓ · tsc ✓ · unit 84/84 · build 29/29 · e2e 160/160 = **244 total** — zero drift from the documented session-21 state | documented |
| F22-G | VERIFIED OK | the environment checklist | — | `.env` (`DATABASE_URL="file:../db/custom.db"`, localhost origin, locally-generated `AUTH_SECRET`), `db/` at the repo root, `.env.example` truthful, vitest + playwright configured and green | documented — the task brief's checklist all holding |

## 3. Root cause / analysis

- **F22-A (the stale entry):** session 20's F20-B remediation updated the PAD's verification ledger and testing tables but not the §10 Known Issues list — the "Static-build status pill" bullet survived the fix that obsoleted it. The hygiene test scans docs for resolving script references, not for semantic staleness, so nothing automated could catch it; only a line-by-line doc-vs-code pass does (this audit's method). The repair is a straight replacement — the pill layer has no open issue since F20-B (both chrome instances are the same live island; the four-state text + the minute-tick flips + the timezone stance are all pinned).
- **F22-B (the instrument gap):** the parity framework's reference-side evidence is entirely point-in-time (each session's census) or clone-side-pinned (the 244-test gate asserts the clone against RECORDED reference values). If the reference's platform updates between sessions (a copy change, a token edit, a pill-state machine change — exactly the F20-A class), every existing instrument still passes while the clone silently diverges from the live reference. The missing piece is a cheap, repeatable, read-only probe against the LIVE reference diffed against the last recorded census — the same tripwire pattern `scripts/screenshot-diff.mjs` applies to the clone's own pixels. The design constraints: deterministic (pin the clock + timezone so the pill's four-state text and the innerText censuses are constants), read-only (GET navigation only — no form POSTs; the login-error/newsletter/ICS contracts stay session-census activities because they require side-effect-ful submissions), offline-independent (NOT wired into the 244-test gate — the gate must never depend on the network), and self-validating (the `--record` override enables the RED proof without touching the committed record).
- **Why the app layer needs no changes:** every functional and visual surface this session measured agrees between the reference and the deployment (F22-C/D/E) — including the candidate-2 deep probe (the ICS). The session's remediations are instrument-layer + doc-layer only.

## 4. Design (the deliverables)

### 4.1 The drift-watch instrument — `scripts/reference-drift-watch.mjs`

A Playwright (chromium, from `@playwright/test` — the `capture-screenshots.mjs` import pattern) probe over the reference's PUBLIC parity surfaces, in a fresh context with `timezoneId: "UTC"` and the browser clock pinned to the census instant (`page.clock.install`) so every time-derived probe is a deterministic constant:

- **P1 — the pill's four-state text:** the reference's landing header innerText must contain the census pill text (`OPENS TODAY AT 10:00` at the pinned instant — Tuesday 05:00 UTC, the before-open state; the header renders it CSS-uppercased).
- **P2 — the landing innerText census:** after the full-reveal scroll convention (scroll to bottom → settle → scroll to top → settle — the reference's animation framework hides unrevealed content from innerText; the convention eliminated the transient 3-char deficit measured this session), `document.body.innerText.length === 2088`.
- **P3 — the services innerText census + the formula:** the same convention on `/services` → length `1958`, AND the time-aware formula re-derived: `1918 + 2 × len(pill text)` (the pill renders twice — header + footer).
- **P4 — the mobile drawer's pinned computed styles:** at 390×844, open the drawer, discover the fixed z≥60 overlay with ≥5 links, and assert the pinned set: bg `rgb(250, 248, 245)`, z `60`, first nav link Cormorant Garamond 48px / line-height 48px / letter-spacing −1.2px / color `rgb(26, 26, 26)`, the nav container's `gap: 8px`, and the CTA wrapper's `margin-top: 40px`.

Report + exit codes (the `screenshot-diff` convention): `PASS`/`DRIFT` per probe, exit `0` GREEN, exit `1` DRIFT (with the drifted probe names + expected/actual), exit `2` instrument failure (navigation timeout / probe exception — "the probe failed" is not "drift was detected"). Flags: `--record <path>` (the census record to diff against — defaults to `docs/reference-census.json`; the RED-validation path), `--url <base>` (the reference origin — defaults to the base44 app URL). The header comment documents the design + the deliberate non-integration with the automated gate.

### 4.2 The census record — `docs/reference-census.json`

The committed last-known-good census: the census instant (`2026-10-06T05:00:00Z`), the timezone pin (`UTC`), the reference URL, the four probes' expected values (the pill text, 2088, 1958, the formula basis `1918`, the drawer style set), and `last_verified: "2026-10-06"` (this session's census — every value in the record was measured live this session). The remediation path for INTENTIONAL reference changes (a real platform update): re-census manually, update the record, review, commit — the record's own comment field documents this.

### 4.3 The PAD §10 repair — `Project_Architecture_Document.md`

Replace the stale "Static-build status pill" bullet with the accurate state: the pill layer carries no open issue since F20-B (both chrome instances are the same live `StatusPill` island; the four states, the minute-tick flips, and the visitor-local-clock timezone stance are pinned by `status-pill-parity.spec.ts` SP1–SP10). The other six §10 entries (rate limiter, inert Google OAuth, forgot-password/sign-up notices, no admin surface, the map iframe, the duplicate hero image) re-verified still-accurate this session — unchanged.

### 4.4 The blast radius (validated)

- The instrument imports only `@playwright/test`'s chromium (already a devDependency — the capture script's exact pattern) and node builtins; it adds no dependency, touches no application code, and is not referenced by any test (the 244 gate is unchanged).
- The hygiene test (`tests/repo-hygiene.test.ts`) requires every `scripts/…` path referenced in the non-historical docs to exist — the AGENTS.md command row + the README/PAD mentions will reference `scripts/reference-drift-watch.mjs`, which will exist; `docs/reference-census.json` is a data file, no guard applies.
- The PAD §10 edit is doc-only; the unit gate re-runs over it (the hygiene test scans the docs — the edit introduces no script references).
- No pixel-bearing surface changes → the canonical capture set is unaffected (T4 re-verifies via the diff gate).

## 5. TDD plan

**T1 (the instrument, GREEN/RED):** build the instrument + record → run against the live reference → **GREEN** (every probe PASS — the record's constants were measured live this session); then the **RED proof** — run with `--record` pointed at a corrupted copy (a wrong landing length + a wrong drawer gap) → must exit `1` naming both drifted probes; then re-run the committed record → GREEN again. **T2 (the doc repair):** the PAD §10 replacement (doc-only — verified by re-reading; the unit gate re-runs over the changed docs). **T3:** the full gate — `lint → typecheck → test → build → test:e2e` — expected **244 total**, every pre-existing contract untouched. **T4:** the canonical capture re-run + the diff gate (an instrument/docs-only change set must not move pixels — the gate re-verified GREEN; the committed set stays canonical). **T5:** documentation alignment (§4.5). **T6:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local → shred the operator key.

### 4.5 Documentation

- `docs/session_22.md` — the proper session-22 record (replacing the owner's raw session-21 transcript file, the sessions-4–21 convention);
- this plan (`docs/remediation-plan-session-22.md`) with the executed-results column;
- `README.md` — the reference-drift-watch feature row (the parity-maintenance family) + the instrument mention;
- `AGENTS.md` — the command-table row for `bun scripts/reference-drift-watch.mjs` (the ad-hoc network-instrument class, deliberately outside the gate);
- `CLAUDE.md` — the build-commands table row;
- `Project_Architecture_Document.md` — the §10 repair + the session-22 verification ledger + the testing-table note (the watch as the reference-side tripwire complement);
- `beauty-salon_SKILL.md` → v1.19.0 — the project_state, Appendix B/C (the instrument in the inventory + the session-22 history row);
- `worklog.md` — the session-22 entry.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The instrument's import pattern works | `scripts/capture-screenshots.mjs:32` imports `{ chromium } from "@playwright/test"` — the same dependency the watch uses | ✓ no new dependency |
| The exit-code/report convention has a precedent | `scripts/screenshot-diff.mjs` uses exit 0/1/2 (green/drift/instrument-failure) with the PASS/DRIFT report — the watch mirrors it | ✓ consistent |
| The census constants are current | measured live this session: pill "OPENS TODAY AT 10:00" both sides; landing 2088 == 2088 (post-reveal); services 1958 == 1958 = 1918 + 2×20; drawer styles identical (bg/z/font/lh/tracking/color/gap/mt) | ✓ the record encodes this session's census |
| The clock pin works on the reference | session 20's F20-A census measured the reference's pill with the controlled clock (22 probes — the four-state machine live-measured that way); the SPA reads the page's `Date` | ✓ the primitive is proven |
| The timezone pin is required | the pill reads the visitor's LOCAL clock (the session-21 SP9/SP10 stance) — an unpinned context TZ would render a different day's state on a non-UTC machine | ✓ `timezoneId: "UTC"` is load-bearing |
| No test references the new script | the 244-test gate has no network dependency by design; the watch is invoked only via `bun scripts/reference-drift-watch.mjs` | ✓ the gate stays hermetic |
| The hygiene test accepts the doc references | `tests/repo-hygiene.test.ts` requires doc-referenced `scripts/…` paths to exist — the script will exist before the docs land in the same commit | ✓ atomic commit ordering |
| The PAD §10 entry is really stale | `SiteFooter.tsx:5,43` imports + renders the live `StatusPill` island (F20-B); SP3/SP8 pin both chrome instances agreeing; the §10 bullet describes the pre-F20-B server-baked footer | ✓ confirmed stale |
| The app layer needs no changes | F22-C/D/E: every measured surface agrees (incl. the candidate-2 ICS deep probe) | ✓ instrument/docs-only session |

## 7. Risks

- **The watch depends on the reference's availability** (a third-party app behind Cloudflare) — by design it is an ad-hoc instrument with exit 2 for instrument failure, never part of the automated gate; a transient outage reads as "probe failed," not "drift."
- **The innerText censuses depend on the reveal convention** (scroll-to-bottom → settle → read) — an under-scrolled read measures the transient deficit (3 chars observed this session on the reference's landing). The convention is baked into the instrument; a future reference-side animation change that alters reveal behavior would surface as drift — which is exactly the tripwire's job.
- **The census record pins a specific instant + timezone** — the constants are only meaningful under the pinned clock/TZ (both stored IN the record, applied BY the instrument). An operator running a modified instrument without the pins would see false drift; the header comment warns.
- **The record's constants age with real reference changes** — the designed remediation path (re-census → update the record → review → commit) is documented in the record itself; the watch's failure output names expected vs actual to make that review mechanical.
- **Read-only scope means the deepest contracts stay manual** (the login-error card, the newsletter success state, the ICS byte format — all POST-bearing) — accepted: they were re-verified live this session (F22-C/E) and the highest-drift-risk surfaces (content lengths, the pill machine, the drawer styles) are exactly the read-only ones.

## 8. ToDo List (execution order)

- [x] **T1.** The drift-watch instrument: `scripts/reference-drift-watch.mjs` (P1–P4, the clock+TZ pins, the exit-code convention, `--record`/`--url` flags) + `docs/reference-census.json` (this session's measured constants). Validated GREEN against the live reference (exit 0, 14/14 probes); RED against a corrupted record copy (exit 1, both seeded corruptions named — the landing length + the drawer gap); the instrument-failure path validated too (an unreachable URL → exit 2). *(Executed.)*
- [x] **T2.** The PAD §10 repair: the stale "Static-build status pill" bullet removed (the pill layer carries no open issue since F20-B — SP1–SP10 pin the layer). *(Executed.)*
- [x] **T3.** Full gate: `lint → typecheck → test → build → test:e2e` — lint 0 errors · tsc clean · unit 84/84 · build 29/29 routes · e2e 160/160 = **244 total**. *(Executed.)*
- [x] **T4.** The canonical capture re-run + the diff gate — the set re-captured (14/15 byte-identical; 07-contact re-captured as the documented noise class) and the gate **GREEN** (14/14). *(Executed.)*
- [x] **T5.** Documentation alignment: README (the feature row + the instrument paragraph) · AGENTS.md (the command row) · CLAUDE.md (the commands row) · PAD (§10 repaired + the instruments note + the session-22 ledger) · SKILL.md → v1.19.0 · `docs/session_22.md` (the proper record) · this plan (the executed results) · `worklog.md`. *(Executed.)*
- [x] **T6.** Secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`) → verify remote == local → shred the operator key. *(Executed — see §10.)*

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The reference-drift watch | `scripts/reference-drift-watch.mjs` + `docs/reference-census.json` (new) |
| The PAD §10 repair | `Project_Architecture_Document.md` |
| The census records + doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `beauty-salon_SKILL.md` (v1.19.0) |
| The session record + plan + worklog | `docs/session_22.md` (the proper record), `docs/remediation-plan-session-22.md`, `worklog.md` |

## 10. Push evidence (session 22)

- Committed as one atomic commit `bc18a42` to `main` (11 files: the drift-watch instrument + the census record + the PAD §10 repair + the 4 doc alignments [README/AGENTS/CLAUDE/SKILL v1.19.0] + the proper session-22 record + this plan + the re-captured 07-contact noise-class shot + the worklog).
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in any tracked file or the staged diff; no tracked env/db/key files beyond `.env.example` (the only tracked `.env*` file).
- Key fingerprint verified before the push: `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (the sessions 1-21 operator key record — the same operator key).
- Dry-run clean (`535cc7b..bc18a42` fast-forward); real push exit 0 with the wrapper's own remote verification (`refs/heads/main @ bc18a42 == local HEAD`) + the tracking-ref sync; independent re-confirmation via `git ls-remote` (shim + key): `bc18a42e53d2741fc23dbcbcc4fb4a0d22dc4ba3 refs/heads/main` — byte-exact == local HEAD; the operator key shredded post-push (the wrapper's temp copy shreds itself on every exit; the operator copy at `/tmp/ml-deploy-s22.key` overwritten with 399 random bytes then removed).
- This evidence section itself follows the established two-commit convention (the plan/worklog records of the executed push land as the follow-up commit, as in sessions 19-21).
