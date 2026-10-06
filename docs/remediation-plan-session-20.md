# Remediation Plan — Session 20 (The Deployed-Site Census + The Pill State-Machine Re-Measurement)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `d228bd2` (the session-19 deliverable `079cb9f` + the T6-executed docs follow-up `8e3ea7b` + the owner's docs-only commit bringing `docs/session_20.md` — the raw session-19 transcript)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (the lint/typecheck/unit/build/e2e gate as the baseline; `skills/` excluded from code checking) + the **deployed-site functional census** on `https://beauty-salon.jesspete.shop/` with `skills/agent-browser` (the task brief's new live-deployment surface) + the **pin-revalidation sweep** on the reference (session-19's suggested candidate 1) with controlled-clock measurement (`page.clock`) + the TDD pin discipline per `skills/tdd`.

---

## 1. Executive Summary

The session-19 release re-validates **fully green** on every automated gate at the session-20 baseline (ESLint clean, `tsc --noEmit` clean, 80/80 unit, 29/29 build routes, 150/150 e2e — **230 total**): zero drift from the documented session-19 state. The owner's docs-only commit brought zero code changes.

**The new work this session (the task brief's new element): the deployed-site census.** The codebase is now live at `https://beauty-salon.jesspete.shop/`. The census walked every functional surface of the deployment: all 16 public routes return 200 (+ the 404 for unknown paths), the proxy's case-insensitive + trailing-slash rewrites work, `/api/health` reports `{"status":"ok","db":true}`, the sitemap/robots serve the 12-route census under the correct canonical origin (`NEXT_PUBLIC_SITE_URL` baked at build time — the deployment contract held), the mobile drawer opens with the pinned computed styles (cream bg, `gap-2` 8px, `mt-10` 40px CTA, 48px Cormorant links at −1.2px tracking, ink color) and navigates, the login works (the seeded demo user, `DEMO_USER_PASSWORD` honored — lands on `/` per the pinned contract), the booking happy path carries the full query string to the confirmation receipt with the ICS 90-minute block, the newsletter renders the success contract, and the gallery lightbox opens. **The deployment is functionally complete — a production superset with the API/validation layer the reference outsources to its platform.**

**The pin-revalidation sweep (session-19's suggested candidate 1) found one real drift — and it is the headline finding of this session (F20-A):** the reference's **StatusPill is a time-aware four-state machine that updates live**, and the clone's pill is day-only. Measured with a controlled clock (`page.clock.install` + `fastForward`, 22 probes across the state space):

| Clock condition | Reference (measured) | Clone (current) |
|---|---|---|
| open day, `t < open` | `Opens today at 10:00` (the day's open time) | `Open today` ❌ |
| open day, `open ≤ t < close` | `Open · closes 19:00` (U+00B7, the day's close time) | `Open today` ❌ |
| open day, `t ≥ close` | `Closed for the day` | `Open today` ❌ |
| closed day (Sun/Mon) | `Closed today` | `Closed today` ✓ |

AND the reference's pill **flips live at minute granularity** — both the open boundary (09:58 mount → flips to "Open · closes 19:00" within the minute past 10:00) and the close boundary (18:59 mount → flips to "Closed for the day" at 19:00) were verified by stepping the virtual clock. The clone renders the pill once (day-only, no ticker). The gap is **live-observable on the deployment right now** (e.g. at 03:22 UTC on a Tuesday the deployment says "Open today" while the reference says "Opens today at 10:00").

The sweep also re-verified every other high-risk text-format pin — all holding: the 404 path interpolation's leading-slash strip rule (five probes, byte-identical), the ICS byte format (the 13-line field-order census, the fixed 90-minute block, raw commas, no STATUS/TRANSP), the landing 32-href + gallery 20-href censuses (identical), the login error text, and the newsletter success text.

Two secondary findings ride the pill census: **F20-B** — the clone's FOOTER pill is a server component (its text bakes at build/prerender time and never updates client-side; the reference's footer pill is live and identical to its header pill at every probe) — the fix makes the footer use the same client island; **F20-H** — the reference's footer pill carries the redundant class pair `text-background/80 text-background/70` and the computed winner is **/80** (`rgba(250, 248, 245, 0.8)`; the clone renders /70 — a 0.7 alpha). The fix replicates the class pair: Tailwind v4 emits same-utility opacity modifiers in ascending order (verified in the deployed compiled CSS: `.text-foreground\/40 … \/70` ascending), so `/80` lands after `/70` and wins — byte-parity with the reference's DOM **and** its computed outcome.

**Session-19's suggested candidate 2 is also delivered:** the **capture-diff regression gate** (`scripts/screenshot-diff.mjs`) — the visual-drift tripwire that re-captures the canonical set via the existing capture instrument into a temp dir and hash-diffs it against `docs/screenshots/` (14/15 comparable; 07-contact excluded as the documented map-noise class; non-zero exit on drift).

Net: **one real parity fix (the pill state machine, three code surfaces + the pins)** + the capture-diff gate + the deployment-census record + documentation alignment + the push.

## 2. Findings register (live-measured 2026-10-06, agent-browser + controlled clock)

| # | Severity | Surface | Live (measured) | Clone (current) | Decision |
|---|---|---|---|---|---|
| F20-A | **REAL BUG — parity gap, live-observable** | the StatusPill state machine | time-aware, four states: `Opens today at {open}` / `Open · closes {close}` / `Closed for the day` / `Closed today`; flips LIVE at minute granularity (both boundaries, clock-verified); boundary semantics: `t < open` → before, `open ≤ t < close` → during (inclusive at open), `t ≥ close` → after (inclusive at close); the open/close times are the day's own (Sat 09:00, Thu 20:00 verified) | day-only two states (`Open today` / `Closed today`), computed once at render, no live updates | **FIX** — `statusForNow` in `src/lib/hours.ts` + the 60s render ticker in `StatusPill.tsx` + the updated/new pins |
| F20-B | **REAL BUG — facet of A** | the footer's pill instance | live and identical to the header pill at every probe (client-side) | a server component (`FooterStatus`) — the text bakes at build/prerender time; static pages carry the build-time state indefinitely | **FIX** — the footer embeds the same `StatusPill` client island (the `text-background/*` variant) |
| F20-H | **REAL BUG — micro (computed color)** | the footer pill's text color | the class pair `text-background/80 text-background/70`, computed `rgba(250, 248, 245, 0.8)` (the /80 wins) | `text-background/70` only — computed alpha 0.7 | **FIX** — replicate the class pair (v4's ascending modifier emission makes /80 win — verified against the deployed compiled CSS) |
| F20-C | VERIFIED OK | the 404 path interpolation | strips only the leading slash; nested/case/trailing preserved, query excluded (five probes) | matches (the F19-C fix) | re-verified, no change |
| F20-D | VERIFIED OK | the ICS byte format | the 13-line census, 90-minute block, raw commas, no STATUS/TRANSP | matches | re-verified, no change |
| F20-E | VERIFIED OK | the href + text censuses | landing 32 hrefs + gallery 20 hrefs identical; the login error + newsletter success texts byte-identical | matches | re-verified, no change |
| F20-F | INFO — the deployment census | `https://beauty-salon.jesspete.shop/` | every functional surface works (routes, proxy rewrites, health, sitemap/robots under the canonical origin, login, booking + ICS, newsletter, lightbox, the mobile drawer at pinned computed styles) | — | documented (the session-20 record); no code changes |
| F20-G | DOC NIT | the links-parity test title + README/AGENTS/SKILL labels say "33-link / 33-href census" | 32 hrefs measured (and the pinned array holds 32) | 32 pinned (the label is stale) | fix the labels (33 → 32) |
| F20-I | DELIVERABLE — session-19 candidate 2 | the capture-diff regression gate | — | absent | **BUILD** — `scripts/screenshot-diff.mjs` + docs |

## 3. Root cause / analysis

- **F20-A (the pill):** the pill was censused in sessions 1–17 only as a DAY-level artifact — every prior measurement happened to run either on closed days (sessions 1–16: Sat/Sun/Mon, where the two-state model IS the reference's behavior) or during open hours without reading the pill's own text (the session-17 "day dependence" was derived from the CLONE's own hours model, not from a live re-measurement of the reference's open-day pill text). The un-measured dimension was TIME OF DAY. The controlled-clock census this session (22 probes) maps the full machine: four states keyed on the day's window, with live minute-granularity re-evaluation. The clone's `statusForDay(day)` encoded the two states that closed days and same-text open hours happen to share. The lesson is the same as F19-C's: **every pinned value needs periodic live re-measurement against the dimension it did not vary over** — a pin faithfully guards the rule it encodes, including when the rule is under-sampled.
- **F20-B (the footer instance):** the clone's footer rendered its pill server-side for the documented reason "the header's StatusPill island covers the live behavior" — an approximation that holds only when the two-state text is stable across the build/request/browser clocks (true for day-only text, false for time-aware text). The reference's footer pill is client-live (measured: identical to the header at every probe, including under controlled clocks). The time-aware fix makes the approximation untenable (a static page's footer would freeze at the build-time state while the header ticks) — so the footer now embeds the same client island.
- **F20-H (the color):** the reference's own DOM carries the redundant `text-background/80 text-background/70` pair (the same family as its inert `duration-s]` token — the platform's own class-string artifacts). In its v3 engine the /80 rule wins (computed 0.8). The clone's port collapsed the pair to /70. Tailwind v4 emits same-utility opacity modifiers in ascending order (verified in the deployed CSS: `.text-foreground\/40{…} … .text-foreground\/70{…}` ascending), so replicating the pair byte-for-byte yields the same winner — no scoped-rule pin needed.
- **F20-F (the deployment):** the census validates the deployment contract end-to-end — the build-time baking of `NEXT_PUBLIC_SITE_URL` (the sitemap/robots carry the deployed origin), the DB wiring (`/api/health` green), the seed (the demo user honors `DEMO_USER_PASSWORD`), and every interactive surface. The deployment is the production superset the task brief defines: the reference's platform-backed surfaces (auth, booking persistence, newsletter capture) all have working substrate equivalents here.

## 4. Design (the deliverables)

### 4.1 The time-aware status model — `src/lib/hours.ts`

`statusForDay(day)` is REPLACED by `statusForNow(now: Date): string` (the old function has no remaining callers — no dead code):

```ts
// The pill's time-aware status (live-measured session 20, controlled clock):
// before open → "Opens today at {open}"; during → "Open · closes {close}"
// (U+00B7 middle dot); at/after close → "Closed for the day"; closed day →
// "Closed today". Boundaries: t < open → before; open ≤ t < close → during
// (inclusive at the open minute); t ≥ close → after (inclusive at the close
// minute) — both boundary semantics live-verified at 10:00 and 19:00.
```

### 4.2 The live pill — `src/components/StatusPill.tsx`

The component gains (a) the `statusForNow` render-time computation (the same SPA stance — server render bakes the build-time state, hydration re-renders with the browser clock, `suppressHydrationWarning` absorbs the mismatch — the existing pattern, now time-sensitive), (b) a 60-second render ticker (the sanctioned external-callback setState — the `Reveal.tsx` idiom; the initial state is environment-independent so the state itself never mismatches), and (c) a `className` prop for the footer's `text-background/*` variant (the header/contact default stays `text-foreground/70`). The footer's variant carries the reference's own redundant pair `text-background/80 text-background/70`.

### 4.3 The footer swap — `src/components/layout/SiteFooter.tsx`

The inline footer pill markup + the `FooterStatus` server component are replaced by `<StatusPill className="text-background/80 text-background/70" />` — the footer's pill becomes live, matching the reference's measured behavior (identical to the header at every probe) and its computed color (alpha 0.8).

### 4.4 The pins

- `tests/hours.test.ts` — the `statusForDay` block is replaced by the `statusForNow` contracts: the four states, the boundary minutes (10:00 inclusive-open, 19:00 inclusive-close), the per-day times (Sat 09:00, Thu 20:00), the U+00B7 codepoint, the midnight-adjacent before-open state (00:30), and the closed-day any-time state.
- `tests/e2e/links-parity.spec.ts` — the services innerText census becomes **time-aware**: the expectation derives from `statusForNow(new Date())` (the same unit-tested model the pill reads — the existing derivation pattern, extended from day to time), with the pill text converged post-hydration (the retrying convention — the static shell bakes the build-time state) before the body length is read. Basis (live-measured, controlled clock): closed-day 1942; before-open 1958; during-open 1956; after-close 1954 — i.e. `1918 + 2 × len(pill text)` (the pill renders twice: header + footer). The stale "33-link" title is corrected to the measured 32.
- `tests/e2e/status-pill-parity.spec.ts` (NEW) — the state-machine pin, driven with `page.clock`: the four on-load states (header AND footer pills), the per-day open/close times, the two live boundary flips (fastForward past open / past close), and the midnight day-rollover flip. Plus the footer variant's computed color (the /80 winner, read as resolved alpha channels per the trap-7 convention).

### 4.5 The capture-diff gate — `scripts/screenshot-diff.mjs` (session-19 candidate 2)

The visual-drift tripwire: boots nothing itself — it re-runs the canonical capture instrument (`bun scripts/capture-screenshots.mjs --out <tmp>`) and hash-diffs the temp set against `docs/screenshots/` (14/15 comparable; `07-contact-desktop` excluded as the documented map-noise class). Exit 0 with a per-file PASS/SKIP report when clean; exit 1 naming every drifted file otherwise. Documented as the post-build verification step (the same-environment discipline — the byte-determinism signal is environment-scoped, so the tripwire compares captures made by the same machine that made the canonical set).

### 4.6 The canonical set — re-captured

The pill text appears in the committed captures (01-landing, 02-services, 07-contact, 10-landing-mobile carry the header pill; 06-about/others carry the footer pill) — the time-aware fix changes those pixels, so the canonical set is re-captured via the script's default `--out docs/screenshots` after the gate (the session-19 convention: the committed artifacts are literally the script's output).

## 5. TDD plan

**T1 (RED → GREEN):** extend `tests/hours.test.ts` with the `statusForNow` contracts against the current `hours.ts` (which lacks the function — module-level RED), then implement `statusForNow` (+ remove `statusForDay`) → unit layer green.

**T2 (the component):** `StatusPill.tsx` (ticker + variant prop) + the `SiteFooter` swap. Verified by the new e2e spec (T4) and the re-run of the full suite — the component's render-time + interval pattern follows the sanctioned `Reveal.tsx` idiom (lint-clean by construction; `bun run lint` gates it).

**T3 (the updated pin):** the links-parity services innerText census re-derived from `statusForNow` with the post-hydration convergence poll.

**T4 (the new pin):** `tests/e2e/status-pill-parity.spec.ts` — expected GREEN after T1+T2 (the pin-gap pattern: the code now holds every stance; the spec makes it a regression gate). The four states, the live flips, the rollover, and the footer color.

**T5:** full gate — `lint → typecheck → test → build → test:e2e` — executed: 84 unit (80 + 4 net new), 29/29 routes, 158 e2e (150 + 8 SP) = **242 total**, every pre-existing contract untouched.

**T6:** `scripts/screenshot-diff.mjs` + the canonical set re-captured + the tripwire validated GREEN against the fresh set.

**T7:** documentation alignment (§4.7 below).

**T8:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook) → verify remote == local → shred the operator key.

### 4.7 Documentation

- `docs/session_20.md` — the proper session-20 record (replacing the owner's raw transcript file, the sessions-4–19 convention);
- this plan (`docs/remediation-plan-session-20.md`) with the executed-results column;
- `README.md` — the pill feature row + the capture-diff gate row + the counts + the 33→32 label fix;
- `AGENTS.md` — the pill invariant (the time-aware machine + the live ticker + the footer variant) + the screenshot-diff command row + the counts;
- `CLAUDE.md` — the counts + the spec list + the pill note;
- `Project_Architecture_Document.md` — the session-20 verification ledger + the testing-table counts + the pill family;
- `beauty-salon_SKILL.md` → v1.17.0 — the project_state, Appendix B inventory, Appendix C history;
- `worklog.md` — the session-20 entry.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| `statusForDay` has no remaining callers after the swap | `src/components/StatusPill.tsx:17` + `src/components/layout/SiteFooter.tsx:131` + `tests/hours.test.ts` + `tests/e2e/links-parity.spec.ts:6` — all four are touched by this plan | ✓ removal is clean |
| The footer pill's markup is inline in SiteFooter (the swap is mechanical) | `SiteFooter.tsx:35-43` — the pill div + `FooterStatus` at :41 | ✓ |
| The contact page's pill is already the client island | `src/app/(site)/contact/page.tsx:82` — `<StatusPill />` | ✓ untouched |
| The confirmation page carries no pill (its 536 innerText pin is unaffected) | `/book/confirmation` renders BookHeader + main only (the census snapshot; no `[class*=breathe]` on the route) | ✓ the pin stands |
| No other spec pins the pill text or a body-length that includes it | grep over `tests/e2e/*`: pill text hits only in links-parity; body-length pins only links-parity (services) + confirmation-parity (536, pill-free) | ✓ the blast radius is the one spec |
| The reference's footer pill computes alpha 0.8 and v4 will reproduce it via the class pair | live-computed `rgba(250, 248, 245, 0.8)`; the deployed CSS emits `text-foreground\/40…\/70` ascending — /80 lands after /70 | ✓ pair wins, no scoped rule needed |
| `page.clock` is available in the repo's Playwright | `@playwright/test` ^1.63.0 (clock API stable since 1.45) | ✓ the spec can drive it |
| The capture instrument supports `--out` (the diff gate can reuse it unmodified) | `scripts/capture-screenshots.mjs:45` — `argValue("--out") ?? docs/screenshots` | ✓ |
| The e2e DB/server boot is unaffected by the pill change | the pill is a client island + a pure function — no DB/API surface | ✓ |
| The canonical captures will change (the pill text) — the set must be re-captured | the pill renders in 01/02/06/07/10 (header and/or footer instances) | ✓ T6 |

## 7. Risks

- **The innerText census is now time-sensitive**: the test derives its expectation from the model at read time and converges the pill first (post-hydration) — a boundary crossed between the Node read and the browser read converges on the next poll (250ms cadence). The residual flake window is a test starting within ~250ms of a salon boundary minute (10:00/19:00/09:00/18:00/20:00 local) — the same character of risk the day-aware version already carried.
- **The ticker runs forever on every page** (a 60s interval per mounted pill — up to 3 instances: header, footer, contact): each tick re-renders one tiny component; the cost is negligible, and the reference's own pill ticks at the same granularity (measured).
- **The class pair relies on v4's ascending modifier emission**: verified against the deployed compiled CSS today. If a future Tailwind upgrade reorders same-utility modifiers, the new footer-color pin (resolved alpha 0.8) fails loudly — the tripwire is the pinned outcome, and the fix would become the scoped-rule pattern (trap 9's precedent).
- **The canonical set re-capture changes committed bytes**: expected — the pill text in captures becomes the capture-moment state (a pure function of the capture clock; the determinism convention is unaffected — the same build + the same clock state reproduces the same bytes).

## 8. ToDo List (execution order)

- [x] **T1.** Unit RED → GREEN: the `statusForNow` contracts (the four states, the boundary minutes, the per-day windows, the U+00B7 glyph, the midnight-adjacent state, the closed-day any-time state) — RED (5 failed, the function absent) → the implementation (+ `statusForDay` removed) → **GREEN 8/8**. *(Executed.)*
- [x] **T2.** The component — executed with a RED-phase lesson: the first cut (render-time + `suppressHydrationWarning` + a 60s state ticker) failed 5/8 specs — **React's hydration KEEPS mismatched text inside `suppressHydrationWarning`**, so the static shell's build-time state persisted (the old day-only pill had the same character; its e2e passed only because the gate rebuilds the same day). The fix: the **NotFoundBody idiom** — `useSyncExternalStore` with the stable `""` server snapshot (the static shell renders the pill text empty — the reference's own pre-JS state — and React's post-hydration store check adopts the live-clock state immediately) + the 60s subscribe tick for the live boundary flips. The footer swapped to the same live island with the reference's own `text-background/80 text-background/70` pair (plain concatenation, NOT `cn()` — tailwind-merge would collapse the pair). *(Executed.)*
- [x] **T3.** The updated pin: the services innerText census re-derived from `statusForNow` (`1918 + 2 × len(pill text)`) with the post-hydration convergence poll + the atomic (pill, length) snapshot read; the stale "33-link" title corrected to the measured 32. *(Executed — green in the full suite.)*
- [x] **T4.** The new pin: `tests/e2e/status-pill-parity.spec.ts` (SP1–SP8 — the four on-load states with every chrome instance agreeing incl. the contact page's third pill, the per-day close times, the closed-day states, the LIVE open/close/midnight flips, the footer variant's /80 computed color) — **8/8 GREEN** after the T2 idiom fix. *(Executed.)*
- [x] **T5.** Full gate: lint ✓ (0 errors) · typecheck ✓ · unit **84/84** · build **29/29 routes** · e2e **158/158** (150 + 8 SP) = **242 total** — every pre-existing contract untouched. *(Executed.)*
- [x] **T6.** `scripts/screenshot-diff.mjs` delivered (lint-clean) + the canonical set re-captured with the remediated build (9 pill-bearing captures updated — exactly the pages whose chrome carries a visible pill; `/book`, `/login`, and the mobile shots carry none) + the tripwire **validated GREEN** (14/14 byte-identical on a fresh pass — the pill renders deterministically from the capture clock) **and RED** (a corrupted byte in one capture → the gate fails with exit 1 + the drifted filename → the canonical set re-captured to restore). *(Executed.)*
- [x] **T7.** Documentation aligned: README (the time-aware pill + capture-diff feature rows, the counts, the 32-href label), AGENTS.md (the pill invariant + the screenshot-diff command row + the spec convention line + the counts), CLAUDE.md (the counts, the spec list, the uSES idiom note), PAD (the session-20 ledger + the testing table), SKILL.md → v1.17.0 (the project_state, Appendix B 158/242, Appendix C session-20 row), `docs/session_20.md` (the proper record), this plan, the worklog. *(Executed.)*
- [x] **T8.** *(Executed — see §10.)*

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The time-aware status model | `src/lib/hours.ts` (`statusForNow`; `statusForDay` removed) |
| The live pill + the variant | `src/components/StatusPill.tsx` |
| The footer's live pill | `src/components/layout/SiteFooter.tsx` |
| The unit contracts | `tests/hours.test.ts` |
| The time-aware innerText census | `tests/e2e/links-parity.spec.ts` |
| The state-machine pin | `tests/e2e/status-pill-parity.spec.ts` (new) |
| The capture-diff gate | `scripts/screenshot-diff.mjs` (new) |
| The canonical set (re-captured) | `docs/screenshots/*.png` |
| The census records + doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.17.0) |
| The session record + plan + worklog | `docs/session_20.md` (proper record), `docs/remediation-plan-session-20.md`, `worklog.md` |

## 10. Push evidence (session 20)

- Committed as one atomic commit `494b2d6` to `main` (24 files: the three pill code surfaces + the two test files + the new spec + the new gate script + the 9 re-captured screenshots + the 6 doc alignments + the plan/session-log/worklog).
- Key fingerprint verified before the push: `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (the sessions 1–19 operator key record — the same operator key).
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in any tracked file or the staged diff; no tracked env/db/key files beyond `.env.example`; the "BEGIN OPENSSH" text hits are the runbook/prior-plan documentation of the method itself, not key material (the standing accepted convention).
- Dry-run clean (`d228bd2..494b2d6` fast-forward); real push exit 0 with the wrapper's own remote verification (`refs/heads/main @ 494b2d6 == local HEAD`) + the tracking-ref sync.
- Independent re-confirmation via `git ls-remote` (shim + key): `494b2d60c7c41a72999ef6e7bd5ada399e221c7b refs/heads/main` — byte-exact == local HEAD.
- The wrapper's temp key copy shreds itself on every exit; the operator copy at `/tmp/ml-deploy-s20.key` overwritten with random bytes then removed.
