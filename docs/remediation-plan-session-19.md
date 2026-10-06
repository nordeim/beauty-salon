# Remediation Plan — Session 19 (The Font-Rendering Census + The Auth'd-State Census)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `e3ba432` (the session-18 deliverable `7a45c93` + the T6-executed docs follow-up `dbaa668` + the owner's docs-only commit bringing `docs/session_19.md` — the raw session-18 transcript — and the refreshed `docs/start_server_log.txt` deployment verification)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (the lint/typecheck/unit/build/e2e gate as the baseline; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (the logged-in walk) + the capture-convention experiment per `skills/evidence-driven-testing` (the deterministic-instrument discipline) + the TDD pin discipline per `skills/tdd`.

---

## 1. Executive Summary

The session-18 release re-validates **fully green** on every automated gate at the session-19 baseline (ESLint clean, `tsc --noEmit` clean, 80/80 unit, 29/29 build routes, 144/144 e2e — **224 total**): zero drift from the documented session-18 state. The owner's docs-only commit brought zero code changes; `docs/start_server_log.txt` records a successful end-to-end deployment verification (fresh install → `db:push` → `db:seed` → build 29/29 → standalone start) on a second machine — the environment contract holding outside this workspace. The environment checklist from the task brief holds: `.env` `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful, vitest + playwright configured and green.

This session executed the **two suggested next-session candidates from session 18** as measured censuses, plus the task brief's standing emphases:

- **The font-rendering state census (candidate 1): REAL measurement, a deliberate convention change.** The committed screenshot set was captured from the DEV server — its bytes encode the dev-only font-download raster state and the Next dev-tools overlay badge (the bottom-left band on every dev capture), so no fresh environment can reproduce them (session 18 measured three distinct deterministic-per-ENVIRONMENT renderings). The experiment this session: capture the 15-shot canonical set from the STANDALONE production server with Playwright's `animations: "disabled"` (finite reveal animations fast-forward to their settled state; the infinite breathing-dot animation freezes at its deterministic initial phase). **Measured result: byte-deterministic across two fresh-context passes AND across a full rebuild — 14/15 captures hash-identical** (the one exception, `07-contact-desktop`, embeds the EXTERNAL Google Maps iframe — irreducible on any environment, equally non-deterministic on the live reference; the documented noise class). Without `animations: "disabled"` the same experiment yields only 9/15 with sub-60px noise on the remainder (the breathing dot's sampled frame + reveal-timing edges — pixel-diff-measured). **Decision: the canonical capture convention switches from dev captures to standalone captures**, delivered as an executable repo script (`scripts/capture-screenshots.mjs` — boots the standalone server on :3200 through the `with-repo-db.ts` wrapper, captures in fresh contexts, kills the whole process tree) + the re-captured canonical set.
- **The auth'd links-layer deep census (candidate 2): REAL measurement, VERIFIED parity, now PINNED.** Every prior census ran logged-out (or login-surface-only). This session walked the live logged-in (agent-browser, the task brief's credentials): the live navigates to `/` after sign-in (the marketing landing page — the "dashboard" of the task brief's reference image); `/login` re-renders the full sign-in card when auth'd (no redirect); the header, mobile drawer, and footer carry their standard logged-out sets with NO account/logout affordance anywhere; `/book` does not prefill from the session; unknown routes render the standard 404 slate card when auth'd. The live's auth'd state is **invisible on the app surface** — the base44 platform authenticates without changing the app's public chrome. The clone matches every measured behavior (auth-neutral chrome, `router.push("/")`, no prefill). **Decision: pin it** — `tests/e2e/authed-state-parity.spec.ts` (the session-16/18 pin-gap pattern: the code already holds the stance; the spec makes it a regression gate).

Net: **one real parity fix** (the 404 path interpolation — the auth'd census walk's discovery, F19-C below) + the convention switch (script + canonical set) + the auth'd-state pin + the census records + documentation alignment + the push.

> **Post-writing amendment (F19-C — found during T1 execution, the census walk's own discovery):** writing the auth'd-state spec's AS5 (the auth'd 404) surfaced a REAL parity divergence in the 404 message's path interpolation — the live renders the attempted path WITHOUT the leading slash (five live probes: `"some-unknown-path"`, `"foo/bar"`, `"ACCOUNT-TEST"` [case preserved], `"unknown-trailing/"` [trailing preserved], `"unknown-query"` [query excluded — pathname only]); the clone rendered the full pathname `"/account"` WITH the slash — and the session-6 pin had encoded the wrong rule (`"/definitely-not-a-page"`). The TDD sequence executed RED→GREEN: the corrected pin + a new edge-matrix test failed against the code, the `readAttemptedPath` fix (`pathname.replace(/^\//, "")`) turned them green. F19-C is folded into the findings register below and the T1/T3/T5 results.

## 2. Findings register (live-measured 2026-10-06, agent-browser logged-in + the capture experiment)

| # | Severity | Surface | Live / experiment (measured) | Clone (current) | Decision |
|---|---|---|---|---|---|
| F19-A1 | INFO — real measurement, deliberate convention change | the screenshot capture pipeline | (clone-side machinery; the live's captures are not the reference here — the SIGNAL is) | the committed set = DEV captures: the environment-dependent font raster + the dev-tools overlay badge (bottom-left band, pixel-diff-measured on the new-vs-committed comparison) | **Convention switched to standalone captures** with `animations: "disabled"`: measured 14/15 byte-identical across passes AND rebuilds; the repo script + the re-captured set |
| F19-A2 | INFO — documented | the contact-page map capture | the external Google Maps iframe tiles vary per capture (12.8% of the frame across two same-build passes) | same (the parity iframe, `MAP_EMBED`) | **Documented noise class** — irreducible on both sides (the live reference embeds the same external dependency); the one capture excluded from the byte-determinism signal |
| F19-B1 | VERIFIED OK — now pinned | the auth'd navigation target | the live lands on `/` after sign-in (the marketing landing page) | `router.push("/", { scroll: false })` — matches (already pinned by `auth.spec.ts:33`; re-anchored as the new spec's setup assertion) | **Pinned** (AS1) |
| F19-B2 | VERIFIED OK — now pinned | `/login` when auth'd | re-renders the full sign-in card — NO redirect, NO "already signed in" state | renders the card unconditionally (no auth check in `page.tsx`) — matches | **Pinned** (AS2) |
| F19-B3 | VERIFIED OK — now pinned | the auth'd chrome (header + drawer + footer) | the standard logged-out sets; NO account/logout/sign-out affordance anywhere (element census, logged-in) | auth-neutral chrome (zero session reads in any marketing component) — matches | **Pinned** (AS3) |
| F19-B4 | VERIFIED OK — now pinned | `/book` when auth'd | every field stays EMPTY (no session prefill of name/email/phone) | no prefill (the form reads only searchParams) — matches | **Pinned** (AS4) |
| F19-B5 | VERIFIED OK — now pinned | unknown routes when auth'd | the standard 404 slate card (probed `/account`, `/dashboard`, `/profile`, `/logout`, `/admin`, `/settings` — every one renders the 404 state; no auth'd-only routes exist) | the standard 404 (no auth branch) — matches | **Pinned** (AS5) |
| F19-C | **REAL BUG — found during the census walk, FIXED** | the 404 message's path interpolation | the live strips ONLY the leading slash: `"some-unknown-path"`, `"foo/bar"` (nested preserved), `"ACCOUNT-TEST"` (case preserved), `"unknown-trailing/"` (trailing preserved), `"unknown-query"` (query excluded) — five live probes | rendered the FULL pathname `"/account"` WITH the leading slash; the session-6 pin (`"/definitely-not-a-page"`) had encoded the wrong rule | **FIXED** — `readAttemptedPath` in `NotFoundBody.tsx` now strips the leading slash; the pin corrected + the edge-matrix test added (TDD RED→GREEN) |
| F19-M | VERIFIED OK | mobile navigation (the task brief's standing emphasis) | the auth'd drawer = the standard item set (censused logged-in this session); the computed contract re-measured session 18 | `mobile-navigation.spec.ts` green at baseline (part of the 144) | No changes — zero Tailwind v4 regression |
| F19-E | VERIFIED OK | the environment checklist | — | `.env` `file:../db/custom.db` + `db/` at root + `.env.example` truthful + vitest/playwright green; the owner's `start_server_log.txt` verifies the same flow on a second machine | No changes |

## 3. Root cause / analysis

- **F19-A (the capture pipeline):** the byte-identity signal was never a property of the APP — it was a property of the app PLUS the rendering pipeline that produced the pixels. The dev pipeline carries two environment-dependent injectors: next/font's dev-mode on-demand Google fetch (the raster state differs per font-download cache state — session 18 measured this directly) and the dev-tools overlay badge (painted into every dev capture's bottom-left band). The standalone pipeline removes both — the fonts are baked into the build at compile time and no overlay exists — but the census found a THIRD noise source the convention must also control: never-settling animations. The header's breathing dot (an infinite `animate-breathe` pulse) samples at a different frame phase per capture, and the reveal-timing edges shift sub-60px bands; `animations: "disabled"` freezes both deterministically (finite → settled end state, which the wait-based convention was already approximating; infinite → the deterministic initial phase). The result is a capture that is a pure function of the build — proven by the rebuild experiment (the same hashes from a fresh `next build`). The 07 exception is structural: an external iframe's tiles are served by Google's CDN and vary per request — no local convention can (or should) control that; it stays in the documented noise class, exactly like the live reference's own captures would.
- **F19-B (the auth'd layer):** the unmeasured surface was never a page — it was a STATE overlaying every page. The base44 platform's authentication is real (the httpOnly cookie, the login flow) but the APP never reads it: no route, chrome element, form, or fallback branches on the session. The "dashboard" of the task brief's reference image is simply the marketing landing page post-login. The clone's architecture already arrived at the same shape for its own reasons (the auth seam exists — `/api/auth/*`, the cookie, the demo user — but the marketing surfaces are auth-neutral). The census therefore closes not with a fix but with a PIN: the auth'd invisibility is now an executable contract, so a future "improvement" (an account link in the header, a login redirect, a prefill) fails the gate instead of silently diverging from the measured reference.

## 4. Design (the deliverables)

### 4.1 The auth'd-state parity spec — `tests/e2e/authed-state-parity.spec.ts`

Five contracts, one describe, executed as a logged-in walk (the UI sign-in with the seeded demo credentials — the same flow `auth.spec.ts` drives; one additional POST against the rate limiter's 10-attempt window, ~5 total across the suite):

- **AS1 (setup + the transition anchor):** the UI sign-in lands on `/` with the site banner visible (the live-measured post-login target; overlaps `auth.spec.ts:33` deliberately — this spec's subject is the auth'd STATE, and the transition is its entry condition).
- **AS2:** navigating to `/login` while auth'd re-renders the full sign-in card (the h1, the Email/Password fields, the Sign in button) and the URL stays `/login` — no redirect.
- **AS3:** the auth'd chrome census — the header's interactive set is exactly the standard one (brand + the five nav links + BOOK NOW + the Open-menu button; NO element whose accessible text matches account/logout/sign-out/profile patterns), the footer's link set is the standard one (Book/Services/Team/Gallery/About/Contact + the socials + the four legal links; no account items), and the mobile drawer opens to the standard item set (Treatments/Gallery/Atelier/Story/Visit + BOOK AN APPOINTMENT; no account items).
- **AS4:** `/book` while auth'd renders every field EMPTY (name/email/phone/selects/date/time/notes all `""`) — no session prefill.
- **AS5:** an unknown route while auth'd renders the standard 404 slate card (the 404 heading, Page Not Found, the attempted path, the Go Home button) — the same surface `not-found-parity.spec.ts` pins logged-out.

The spec header documents the census (the measured live behaviors, the probe list, the platform-vs-app separation). Expected to land **GREEN immediately** (the pin-gap pattern — the code already holds every stance).

### 4.2 The capture convention — `scripts/capture-screenshots.mjs` + the canonical set

The repo script (the executable convention): boots the standalone server on :3200 through `scripts/with-repo-db.ts` (the repo `.env`'s `DATABASE_URL` — the documented dev-DB source of truth), waits on `/api/health`, captures the 15 canonical shots in fresh browser contexts (1280×900 desktop / 390×844 mobile, `deviceScaleFactor: 1`) with `animations: "disabled"`, and kills the whole process tree (`detached` + the process-group kill — killing only the wrapper orphans the server on the port, the bug the census run itself surfaced and fixed). Usage: `bun scripts/capture-screenshots.mjs [--out <dir>] [--port <port>]`; prerequisites: `bun run build` (+ the seeded repo DB). The canonical set re-captured with the script's default `--out docs/screenshots` so the committed artifacts are literally the script's output.

### 4.3 Documentation

- `docs/session_19.md` — the proper session-19 record (replacing the owner's raw transcript file, the sessions-4–18 convention);
- this plan (`docs/remediation-plan-session-19.md`) with the executed-results column;
- `README.md` — the capture-convention note (the testing/evidence section) + the auth'd-state feature row + the counts (149 e2e);
- `AGENTS.md` — the commands-table row for `bun scripts/capture-screenshots.mjs` + the auth'd-state invariant + the new spec contract line + the counts;
- `CLAUDE.md` — the counts + the spec list;
- `Project_Architecture_Document.md` — the two census records (the verification ledger + the testing table + the capture-convention note);
- `beauty-salon_SKILL.md` → v1.16.0 — the project_state, Appendix B inventory, Appendix C history;
- `worklog.md` — the session-19 entry.

## 5. TDD plan

**T1 (the pin):** write `tests/e2e/authed-state-parity.spec.ts` (AS1–AS5). Run against the current build — expected **GREEN immediately** (the pin-gap pattern, the session-18 HB precedent: the code already holds every stance; a pin-only deliverable with no RED phase because there is no bug).

**T2 (the convention):** `scripts/capture-screenshots.mjs` verified by the census evidence itself (the a2==b2==c hash experiment) + lint clean (the script is a tracked, linted file) + the repo-hygiene secret scan (it carries no env values). The canonical set re-captured via the script into `docs/screenshots/`.

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — expected 80/80 unit, 29/29 routes, **149/149 e2e** (144 + 5 new AS specs) = **229 total**, every pre-existing contract untouched.

**T4:** the screenshots — the standalone canonical set (delivered by T2's default-`--out` run; the byte-determinism signal now holds for 14/15 with 07 the documented map-noise class).

**T5:** documentation alignment (§4.3).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook) → verify remote == local → shred the operator key.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The clone's `/login` page has no auth-state redirect | `src/app/login/page.tsx` renders the card unconditionally — no `redirect()`, no session read | ✓ AS2 will pin |
| The marketing chrome reads no session | grep over `src/components/**`: zero `useSession`/`/api/auth/me`/`isLoggedIn` hits (the "session" matches are doc-comment references only) | ✓ AS3 will pin |
| The book form prefills from searchParams only | `BookingForm.tsx` initializes fields from the URL params; no session/user fetch | ✓ AS4 will pin |
| The 404 surface has no auth branch | the `not-found` route renders from `usePathname`/`useSyncExternalStore`; no session logic | ✓ AS5 will pin |
| The demo user is seeded for the e2e DB | `prisma/seed.ts` upserts the demo user; `global-setup.ts` seeds `db/e2e.db` (the seed log: users: 1) | ✓ the UI sign-in will work |
| The rate limiter tolerates one more login POST | `checkRateLimit`: 10 attempts / 15 min / IP; the suite's login POSTs total ~5 after the addition | ✓ no cross-spec interference |
| The standalone build exists and serves | the baseline gate's `test:e2e` booted `.next/standalone/server.js` on :3100 (144/144) | ✓ the capture server will boot |
| The capture script is lint-clean and secret-free | `bun run lint` green with the script present; the script reads no env values (PORT/NODE_ENV only) | ✓ the hygiene scan will pass |
| The `.mjs` script escapes tsc but is linted | tsconfig `include`: `**/*.ts`/`**/*.tsx` only; eslint ignores exclude `skills`/`node_modules`/`.next` — `scripts/**` linted | ✓ the gate composition holds |
| The breathing-dot + reveal noise is the residual non-determinism | the a-vs-b experiment (no `animations` option): 9/15 identical; the 5 others differ by 0.00% pixels in sub-60px bands (the dot at the header's pill, reveal edges) | ✓ the `animations: "disabled"` design is targeted |
| The convention change is reproducible | the a2==b2==c experiment: 14/15 hash-identical across two passes AND a full rebuild; 07 differs (the external map) | ✓ the convention is proven |
| The e2e suite counts 144 today | the baseline gate: 144/144; +5 AS specs → 149 | ✓ the count math holds |

## 7. Risks

- **`animations: "disabled"` changes the canonical pixels** (the dot frozen at its initial phase; finite reveals fast-forwarded to settled): the new set intentionally differs from the committed dev set by the measured noise classes (the dev-overlay band, the font raster, the dot phase) — mean colors verified identical (±1/channel), and the definitive correctness check stays the computed-style parity specs (green on the standalone server). If a future capture looks wrong, the specs fail first — the screenshots are evidence, not the contract.
- **The auth'd-state spec signs in through the UI** (a real POST): a future rate-limiter tightening could make the suite's login POSTs collide — the spec documents the budget (10/15min; ~5 used).
- **The capture script spawns a process tree**: killing only the wrapper orphans the server on :3200 (the census run surfaced this); the `detached` + process-group kill handles it, and the default port avoids the e2e suite's :3100 and dev's :3000.
- **The 07-contact capture stays non-deterministic** by design: nobody should "fix" it by stubbing the map (that would fake the parity surface); the noise class is the honest record.

## 8. ToDo List (execution order) — executed results

- [x] **T1.** The pin — `tests/e2e/authed-state-parity.spec.ts` (AS1–AS5) written and run: **GREEN, 5/5** (the pin-gap pattern as predicted — with two spec-side conventions learned en route: the drawer/footer assertions scope to their containers and assert raw accessible text [the CSS `uppercase` transform is display-only], and the 404 assertion uses the retrying `toContainText` convention). **The RED phase came from AS5's comparison instead: F19-C** — the live's 404 message strips the leading slash, the clone's kept it; the not-found pin corrected + the edge-matrix test added → RED (2 failed) → the `readAttemptedPath` fix → GREEN. *(Executed — see §9.)*
- [x] **T2.** The convention — `scripts/capture-screenshots.mjs` (in-repo, lint-clean, the process-tree-kill bug found and fixed during the census run itself) + the canonical set re-captured into `docs/screenshots/` via the script's default `--out` (13/15 hash-identical to the census pass; 07 = the external map; 15 = the F19-C content change — the diff confined to the message line, pixel-verified). *(Executed.)*
- [x] **T3.** Full gate: lint ✓ (0 errors) · typecheck ✓ · unit 80/80 ✓ · build 29/29 routes ✓ · e2e **150/150** (144 + 5 AS + 1 edge matrix) = **230 total** — every pre-existing contract untouched. *(Executed.)*
- [x] **T4.** The screenshots — the standalone canonical set committed (the byte-determinism signal: 14/15 across passes and rebuilds; 07 the documented map-noise class). *(Executed.)*
- [x] **T5.** Documentation aligned: README (the auth'd-state + capture-convention rows, the counts 230/150), AGENTS.md (the capture-screenshots command row, the auth'd-state invariant, the corrected 404 strip rule, the counts), CLAUDE.md (the counts, the spec list), PAD (the session-19 ledger + the testing table + the authed-state family), SKILL.md → v1.16.0, `docs/session_19.md` (proper record), this plan, the worklog. *(Executed.)*
- [ ] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local → shred the operator key.

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The 404 path-interpolation fix (F19-C) | `src/components/NotFoundBody.tsx` (`readAttemptedPath` — strip only the leading slash) |
| The auth'd-state pin family | `tests/e2e/authed-state-parity.spec.ts` (new — AS1–AS5) |
| The corrected 404 pin + the edge matrix | `tests/e2e/not-found-parity.spec.ts` |
| The executable capture convention | `scripts/capture-screenshots.mjs` (new) |
| The canonical set (standalone captures) | `docs/screenshots/*.png` (re-captured) |
| The census records + doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.16.0) |
| The session record + plan + worklog | `docs/session_19.md` (proper record), `docs/remediation-plan-session-19.md`, `worklog.md` |

## 10. Push evidence (session 19)

(to be filled at T6)
