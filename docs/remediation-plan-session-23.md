# Remediation Plan — Session 23 (The Drift-Watch P5 Auth-Shell Probe + The Session-22 Candidates Executed)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `e1bf686` (the session-22 deliverable `bc18a42` + the evidence follow-up `b4cb653` + the owner's docs-only commit bringing `docs/session_23.md` — the raw session-22 transcript)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (the lint/typecheck/unit/build/e2e gate as the baseline; `skills/` excluded from code checking) + the deployed-site census on `https://beauty-salon.jesspete.shop/` and the reference re-verification on `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` + the TDD/instrument-validation discipline per `skills/tdd` and `skills/evidence-driven-testing` (the GREEN/RED/exit-2 validation the drift-watch itself received in session 22, applied to its extension).

---

## 1. Executive Summary

The session-22 release re-validates **fully green** on every automated gate at the session-23 baseline (ESLint 0 errors, `tsc --noEmit` clean, 84/84 unit, 29/29 build routes, 160/160 e2e — **244 total**): zero drift from the documented session-22 state. The only commit since the session-22 push is the owner's docs-only transcript commit — **no application code has changed**, so no deployment refresh is required (verified live: the deployment still runs the session-20/21/22 build — the pill's pre-JS empty static shell + the footer `/80+/70` pair confirmed in the raw HTML; every functional surface re-walked green this session).

**The deployed-site census (the task brief's standing element) is green end-to-end:** all 27 route probes (21 public routes + the 404 + the proxy's case-insensitive/trailing-slash rewrites with `redirect: manual` proving the URL bar stays as typed + the unknown-service soft-404 + sitemap/robots under the production origin), the mobile drawer at its pinned computed styles (cream `rgb(250,248,245)`, z-60, 48px Cormorant Garamond, lh 48px, tracking −1.2px, ink, nav `gap 8px`, CTA wrapper `mt 40px`) with working navigation — **the standing Tailwind v4 watch: zero regression** — the login (the deployment's `DEMO_USER_PASSWORD` honored → lands on `/`, auth-neutral chrome, the session verified via `/api/auth/me`) plus the login error card (the wrong-email attempt re-verified the shadcn Alert contract), the booking happy path (the full query-string contract on the confirmation) + the ICS fixed 90-minute block (13 lines, `DTSTART 20261110T140000Z` → `DTEND 20261110T153000Z`, raw commas, no STATUS/TRANSP), the newsletter success state ("YOU'RE IN…"), the gallery lightbox (opens z-70, closes on Escape), and the same-instant pill parity ("Opens today at 10:00" both sides at the same minute).

**Both session-22 suggested candidates EXECUTED:**
1. **Candidate 1 (the drift-watch cadence run):** `bun scripts/reference-drift-watch.mjs` executed as this session's pre-audit step — **GREEN, 14/14 probes, exit 0** (no reference-side drift). The `last_verified` convention applied (the record's date is this session's re-confirmation).
2. **Candidate 2 (the auth'd-state re-census on the reference):** the session-19 authed-state pins re-walked live on the reference — post-login lands on `/` ✓, `/login` re-renders the sign-in card when auth'd (no redirect) ✓, auth-neutral header/footer (no account/logout affordance) ✓, the no-prefill book form (all 8 controls empty) ✓, the auth'd 404 (the standard slate card with the path interpolated, standard chrome) ✓. **All four pins re-verified GREEN.**

**This session's headline remediation (F23-A): the drift-watch P5 coverage extension — the auth shell's public computed-style surface.** The instrument's four probes (P1 the pill, P2 the landing census, P3 the services census, P4 the drawer styles) cover the reference's MARKETING surfaces; the fifth public parity surface — `/login` — is pinned on the clone side (`login-parity.spec.ts`) but had NO reference-side probe. If the reference's platform updates its auth shell (a shadcn theme change, a token edit), every existing instrument still passes while the clone silently diverges. This session extends the watch with **P5**: six string-stable computed-style constants measured on the reference's `/login` (the h1's default-sans font context, the slate-900 h1 + Sign-in button colors, the white button text, the slate-200 input border, the `you@example.com` placeholder) — read-only (GET navigation only), deterministic (no time-derived content), and deliberately EXCLUDING the input background (the trap-7 v3-`rgba` vs v4-`oklab` string divergence — pixels identical, strings engine-unstable). The probe values were measured live on the reference this session and are committed as the `login_shell` block in `docs/reference-census.json`.

Net: **one instrument extension + the census record extension + the two candidates' execution records + documentation alignment + the push.** No application code changes — the app layer is at parity everywhere this session measured (F23-D/E/F).

## 2. Findings register (live-measured 2026-10-06, agent-browser + the baseline gate)

| # | Severity | Surface | Live (measured) | Clone (current) | Decision |
|---|---|---|---|---|---|
| F23-A | **INSTRUMENT GAP — the headline** | the reference's auth shell (`/login`) has no reference-side drift probe | the shell's computed styles measured live: h1 font `ui-sans-serif…` (the default sans stack), h1 color `rgb(15, 23, 42)`, Sign-in bg `rgb(15, 23, 42)` / text `rgb(255, 255, 255)`, input border `rgb(226, 232, 240)`, placeholder `you@example.com` | the clone's `/login` computes IDENTICALLY at every probed value (measured the same session); pinned clone-side by `login-parity.spec.ts` — but the REFERENCE side had no tripwire | **ADD** — P5 in `scripts/reference-drift-watch.mjs` + the `login_shell` block in `docs/reference-census.json` (validated GREEN/RED) |
| F23-B | VERIFIED OK | session-22 candidate 1 (the drift-watch cadence) | the watch run GREEN: 14/14 probes, exit 0 | n/a (the instrument is clone-agnostic) | documented — no reference drift; the `last_verified` convention applied |
| F23-C | VERIFIED OK | session-22 candidate 2 (the auth'd-state re-census) | all four session-19 pins re-verified on the reference (login-renders-when-auth'd, auth-neutral chrome, no-prefill book, the auth'd 404) | the clone's authed-state parity pinned by `authed-state-parity.spec.ts` (160/160 green) | documented — the POST-bearing surfaces re-walked |
| F23-D | VERIFIED OK | the deployed-site census | — | every functional surface green (27 route probes, drawer at pinned styles + navigation, login → `/` auth-neutral + the error card, booking + ICS, newsletter, lightbox, the 404 strip rule) | documented — a production-ready superset with visual parity |
| F23-E | VERIFIED OK | the reference re-verification | the pill "Opens today at 10:00" both sides at the same instant; the login shell's computed styles identical both sides (the input bg differing only in the trap-7 string class) | matches at every probe | documented — parity holding |
| F23-F | VERIFIED OK | the baseline audit gate | — | lint ✓ · tsc ✓ · unit 84/84 · build 29/29 · e2e 160/160 = **244 total** — zero drift from the documented session-22 state | documented |
| F23-G | VERIFIED OK | the environment checklist | — | `.env` (`DATABASE_URL="file:../db/custom.db"`, localhost origin, locally-generated `AUTH_SECRET`), `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful and the only tracked `.env*` file, vitest + playwright configured and green | documented — the task brief's checklist all holding |

## 3. Root cause / analysis

- **F23-A (the coverage gap):** the drift-watch's probe set was designed in session 22 around the reference's MARKETING parity surfaces (the pill machine, the innerText censuses, the drawer styles) — the surfaces each prior session's census had walked. The `/login` route is the one remaining PUBLIC route with pinned clone-side parity contracts (`login-parity.spec.ts`: the shell's default sans font context + the slate-900 read-back) that the instrument does not probe. The gap matters exactly the way session 22's F22-B did: the reference's auth shell is platform boilerplate (base44's shadcn-derived login card) — the surface MOST likely to change under a platform-side update, and currently the one with no tripwire. The probe design constraints carry over: read-only (GET navigation only — the login ERROR card requires a POST and stays a session-census activity), deterministic (no time-derived content on the route), and string-stable (the input BACKGROUND is excluded — `bg-slate-50/50` serializes as `rgba(248, 250, 252, 0.5)` under the reference's v3 but `oklab(0.98… / 0.5)` under the clone's v4; pixels identical, the trap-7 class — a string probe would false-DRIFT on engine differences, so P5 asserts only the six string-stable constants).
- **Why the app layer needs no changes:** every functional and visual surface this session measured agrees between the reference and the deployment (F23-D/E) — including the login-shell deep probe both sides. The session's remediation is instrument-layer + record-layer + doc-layer only.

## 4. Design (the deliverables)

### 4.1 The P5 probe — `scripts/reference-drift-watch.mjs` (the extension)

After P4 (the drawer), a fifth probe at the desktop viewport (the login card is viewport-independent):

- **P5 — the auth shell's public computed-style surface:** navigate `${BASE}/login`, wait for the sign-in submit button, and assert the six string-stable constants against the record's `login_shell` block:
  - `h1_font_family` — the first entry of the computed stack (`ui-sans-serif` — the shell's default-sans font context, NOT the brand serif; the same split-on-comma normalization P4 applies to the drawer link);
  - `h1_color` — the slate-900 heading (`rgb(15, 23, 42)`);
  - `sign_in_background` — the slate-900 button (`rgb(15, 23, 42)`);
  - `sign_in_color` — the white button text (`rgb(255, 255, 255)`);
  - `input_border_color` — the slate-200 input border (`rgb(226, 232, 240)`);
  - `input_placeholder` — the email input's placeholder (`you@example.com`).

The header comment gains the P5 line + the exclusion note (the input background is the trap-7 string-unstable class — deliberately not probed; the POST-bearing error-card contract stays a session-census activity). The instrument-failure path is unchanged: a P5 navigation/selector failure exits 2 ("the probe failed is not drift evidence").

### 4.2 The census record — `docs/reference-census.json` (the extension)

The `login_shell` block with this session's live-measured constants (measured on the reference with agent-browser, the same session that re-confirmed P1–P4 via the watch's GREEN run), plus the `$comment` notes: the session-23 re-verification (P1–P4 GREEN 14/14 re-run + the four auth'd-state pins re-walked) and the P5 addition (the fifth public surface; the six string-stable constants; the input-bg exclusion rationale).

### 4.3 The documentation alignment

- `docs/session_23.md` — the proper session-23 record (replacing the owner's raw session-22 transcript file, the sessions-4–22 convention);
- this plan (`docs/remediation-plan-session-23.md`) with the executed-results column;
- `README.md` — the reference-drift-watch feature row mentions the fifth surface (the auth shell);
- `AGENTS.md` — the command-table row's probe enumeration extended to the auth shell;
- `CLAUDE.md` — the commands row likewise;
- `Project_Architecture_Document.md` — the instruments note (the watch's probe set now includes the auth shell) + the session-23 verification ledger entry;
- `beauty-salon_SKILL.md` → **v1.20.0** — the project_state, Appendix B (the instrument inventory), Appendix C (the session-23 history row);
- `worklog.md` — the session-23 entry.

### 4.4 The blast radius (validated)

- The instrument imports only `@playwright/test`'s chromium (already a devDependency) and node builtins — unchanged; it touches no application code and is referenced by no test (the 244 gate is unchanged).
- The census record is a data file — no hygiene guard applies to its content; the script references the docs cite already exist (the watch's path is unchanged).
- No pixel-bearing surface changes → the canonical capture set is unaffected (T3 re-verifies via the diff gate).

## 5. TDD plan

**T1 (the P5 extension, GREEN/RED):** add the `login_shell` block to the record (this session's measured constants) → implement P5 in the instrument → run against the live reference → **GREEN** (every probe PASS, P1–P5); then the **RED proof** — run with `--record` pointed at a corrupted copy (a wrong `h1_color` + a wrong `input_border_color`) → must exit `1` naming both seeded corruptions; then the instrument-failure path re-validated (an unreachable URL → exit 2); then re-run the committed record → GREEN again. **T2:** the full gate — `lint → typecheck → test → build → test:e2e` — expected **244 total**, every pre-existing contract untouched. **T3:** the canonical capture re-run + the diff gate (an instrument/docs-only change set must not move pixels — the gate re-verified GREEN; the committed set stays canonical). **T4:** documentation alignment (§4.3). **T5:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local → shred the operator key.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The P5 values are current | measured live this session on the reference with agent-browser: h1 font `ui-sans-serif…`, h1 color `rgb(15, 23, 42)`, Sign-in bg `rgb(15, 23, 42)`, text `rgb(255, 255, 255)`, input border `rgb(226, 232, 240)`, placeholder `you@example.com` — and the clone's `/login` computes identically at every probed value | ✓ the record encodes this session's census |
| The login route is public + deterministic | the reference's `/login` renders the sign-in card without auth (and re-renders it when auth'd — the session-19 pin re-verified this session); no time-derived content on the route | ✓ read-only probe, no clock dependence |
| The probe selectors work both sides | `h1` (the "Welcome to Beauty Salon" heading), `button[type="submit"]` (the Sign in button — the Google button is NOT type=submit), `form input` (the email input, placeholder `you@example.com`) — all verified via agent-browser on both sites this session | ✓ the selectors are stable |
| The input-bg exclusion is required | the reference's v3 serializes `bg-slate-50/50` as `rgba(248, 250, 252, 0.5)`; the clone's v4 emits `oklab(0.984… / 0.5)` (measured both sides this session) — pixels identical, the documented trap-7 class | ✓ string probes exclude it |
| No test references the instrument | the 244-test gate has no network dependency by design; the watch is invoked only via `bun scripts/reference-drift-watch.mjs` | ✓ the gate stays hermetic |
| The exit-code/report convention is unchanged | the `report()` helper + the exit 0/1/2 paths are the session-22 validated code — P5 only adds probe calls inside the same try/catch | ✓ consistent |
| The app layer needs no changes | F23-D/E: every measured surface agrees (incl. the login-shell deep probe both sides) | ✓ instrument/record/docs-only session |

## 7. Risks

- **The watch depends on the reference's availability** — unchanged (exit 2 for instrument failure, never part of the automated gate).
- **The P5 constants could age with a real platform update of the auth shell** — exactly the drift class the probe exists to catch; the remediation path (re-census → update the record → review → commit) is documented in the record's `$comment`.
- **The font-stack probe reads only the FIRST entry** (`ui-sans-serif`) — a platform change that reorders the stack without changing the first entry would pass P5 while changing the tail; accepted (the first entry is the context discriminator the `login-parity.spec.ts` contract actually keys on — the shell is NOT the brand serif).
- **The auth'd-state re-census remains manual** (the POST-bearing login can't be probed read-only) — accepted: re-walked this session (F23-C), and the cadence is now the documented convention (the session-22 suggestion, applied).
- **Read-only scope still excludes the deepest contracts** (the login-error card, the newsletter success, the ICS byte format) — accepted: the login-error card + newsletter were re-verified on the deployment this session (F23-D), and the ICS was re-verified on the reference in session 22 (F22-C).

## 8. ToDo List (execution order)

- [x] **T1.** The P5 probe extension: the `login_shell` block in `docs/reference-census.json` (this session's measured constants) + the P5 implementation in `scripts/reference-drift-watch.mjs` (the six string-stable constants, the input-bg exclusion). Validated GREEN against the live reference (exit 0, **20/20 probes** — P1–P4's 14 + P5's six); RED against a corrupted record copy (exit 1, both seeded corruptions named — the h1 color + the input border color); the instrument-failure path re-validated (an unreachable URL → exit 2). *(Executed.)*
- [x] **T2.** Full gate: `lint → typecheck → test → build → test:e2e` — lint 0 errors · tsc clean · unit 84/84 · build 29/29 routes · e2e 160/160 = **244 total**. *(Executed.)*
- [x] **T3.** The canonical capture re-run + the diff gate — the set re-captured (07-contact re-captured as its noise-class output — an instrument/record-only change set) and the gate **GREEN** (14/14). *(Executed.)*
- [x] **T4.** Documentation alignment: README (the feature row's fifth surface) · AGENTS.md (the command row) · CLAUDE.md (the commands row) · PAD (the instruments note + the session-23 ledger) · SKILL.md → v1.20.0 · `docs/session_23.md` (the proper record) · this plan (the executed results) · `worklog.md`. *(Executed.)*
- [ ] **T5.** Secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`) → verify remote == local → shred the operator key. *(The evidence follow-up commit marks this executed, per the session-21/22 convention.)*

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The P5 auth-shell probe | `scripts/reference-drift-watch.mjs` (extended) |
| The census record extension | `docs/reference-census.json` (the `login_shell` block + the comment notes) |
| The doc alignments | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.20.0) |
| The session record + plan + worklog | `docs/session_23.md` (the proper record), `docs/remediation-plan-session-23.md`, `worklog.md` |

## 10. Push evidence (session 23)

(to be filled after the push — the established two-commit convention)
