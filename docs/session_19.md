# Session 19 — Audit: The Font-Rendering Census + The Auth'd-State Census (2026-10-06)

**Baseline:** remote `main` @ `e3ba432` (the session-18 deliverable `7a45c93` + the T6-executed docs follow-up `dbaa668` + the owner's docs-only commit bringing `docs/session_19.md` — the raw session-18 transcript — and the refreshed `docs/start_server_log.txt`, a successful end-to-end deployment verification on a second machine: fresh install → `db:push` → `db:seed` → build 29/29 → the standalone start, the environment contract holding outside this workspace).

**Method:** Mode C audit (`skills/code-review-and-audit` — the full gate as the baseline; `skills/` excluded) + live parity verification with `skills/agent-browser` (the logged-in walk of the reference) + the capture-convention experiment per `skills/evidence-driven-testing` (the deterministic-instrument discipline) + the TDD pin discipline per `skills/tdd`.

> Note: this file previously held the raw process transcript of session 18 (committed by the owner). It has been replaced by this proper session-19 record — the same convention sessions 4–18 applied to their own transcript files.

## What this session set out to do

Pull the workspace fresh (`git pull` — fast-forward: the owner's docs-only commit, zero code drift), re-validate the documented architecture against the codebase, re-run the full audit gate, then execute the **two suggested next-session candidates from session 18** — the font-rendering state census (the screenshot capture convention) and the auth'd links-layer deep census — plus the task brief's standing emphases: the mobile navigation menu (with the Tailwind v4 watch) and the environment checklist (`.env` DB path, `db/` at the repo root, vitest + playwright suites, `.env.example`).

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 4 (tests):** baseline fully green — unit 80/80, build 29/29 routes, e2e 144/144 (**224 total**) — exactly the documented session-18 state, zero drift. The session-18 code change (`head-boilerplate-parity.spec.ts`) re-reviewed — clean.
- **Environment verified:** `.env` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET` + `NEXT_PUBLIC_SITE_URL`), `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful, vitest + playwright configured and green — the task brief's checklist items all holding (and the owner's `start_server_log.txt` independently verifying the same flow on a second machine).

## The font-rendering state census (session-18 candidate 1) — the capture convention rebuilt

The committed screenshot set had been captured from the **dev server** — its bytes encode two environment-dependent injectors: next/font's dev-mode on-demand Google fetch (the raster state differs per font-download cache state — session 18 had measured three distinct deterministic-per-ENVIRONMENT renderings) and the Next dev-tools overlay badge (the bottom-left band on every dev capture). The experiment this session: capture the 15-shot canonical set from the **standalone production server** with Playwright's `animations: "disabled"`:

- **Without `animations: "disabled"`:** 9/15 byte-identical across two same-build passes; the 5 others differ by 0.00% of pixels in sub-60px bands (pixel-diff-measured: the header status-pill's breathing dot — an infinite `animate-breathe` pulse sampled at a different frame phase per capture — plus reveal-timing edges; the sixth, the contact page, differs by 12.8% — the external Google Maps iframe's tiles).
- **With `animations: "disabled"`** (finite reveals fast-forward to their settled state — which the wait-based convention was already approximating — and the infinite dot frozen at its deterministic initial phase): **14/15 byte-identical across two fresh-context passes AND across a full rebuild** — the capture becomes a pure function of the build. The 07-contact exception is structural (the external Maps iframe — irreducible on any environment, equally non-deterministic on the live reference; the documented noise class).

**Decision: the canonical capture convention switches from dev captures to standalone captures**, delivered as the executable repo script **`scripts/capture-screenshots.mjs`** (boots the standalone build on :3200 through the `with-repo-db.ts` wrapper — the repo `.env`'s `DATABASE_URL`; waits on `/api/health`; captures in fresh browser contexts, 1280×900 desktop / 390×844 mobile, `deviceScaleFactor: 1`; kills the whole process tree — the census run itself surfaced and fixed the orphaned-server bug: killing only the wrapper leaves the standalone server holding the port) + the canonical set re-captured via the script's default `--out docs/screenshots` so the committed artifacts are literally the script's output. The new-vs-committed deltas measured benign: ≤1.13% pixels on every capture (mean colors identical ±1/channel) — the dev-overlay band's absence, the font raster state, the dot freeze, and the map tiles; 13/15 of the new set hash-identical to the census pass, 15 = the F19-C content change (the diff confined to the 404 message line, pixel-verified).

## The auth'd links-layer census (session-18 candidate 2) — verified parity, pinned — and a REAL bug found

Every prior census ran logged-out (or login-surface-only). This session walked the live **logged in** (agent-browser, the task brief's credentials):

- **Post-login navigation → `/`** — the marketing landing page (the "dashboard" of the task brief's reference image; no separate dashboard surface exists — the image is not in the repo and the live-measured behavior is authoritative).
- **`/login` re-renders the full sign-in card when auth'd** — no redirect, no "already signed in" state.
- **The auth'd chrome is the standard chrome**: the header (brand + TREATMENTS/GALLERY/ATELIER/STORY/VISIT + BOOK NOW + the Open-menu button), the mobile drawer (the standard item set), and the footer (the standard nav + socials + legal links) — **no account/logout affordance anywhere** (element censuses, logged-in).
- **`/book` does not prefill from the session** — every field stays empty while auth'd.
- **Unknown routes render the standard 404** — probed `/account`, `/dashboard`, `/profile`, `/logout`, `/admin`, `/settings`: every one renders the 404 slate card; **no auth'd-only routes exist**.

The live's auth'd state is **invisible on the app surface** — the base44 platform authenticates (the httpOnly cookie) but the app never reads it. The clone matches every measured behavior (auth-neutral chrome — zero session reads in any marketing component; `router.push("/")`; no prefill). **Pinned: `tests/e2e/authed-state-parity.spec.ts` (AS1–AS5)** — the pin-gap pattern as predicted (5/5 green after two spec-side convention fixes: container-scoped drawer/footer assertions reading raw accessible text, and the retrying `toContainText` for the post-hydration 404 patch).

**The census walk's own discovery — F19-C, a REAL parity bug, FIXED:** comparing the live's auth'd 404 against the clone's surfaced a divergence in the 404 message's path interpolation. Five live probes measured the rule precisely: the live **strips ONLY the leading slash** — `"some-unknown-path"`, `"foo/bar"` (nested preserved), `"ACCOUNT-TEST"` (case preserved), `"unknown-trailing/"` (trailing preserved), `"unknown-query"` (the query string excluded — pathname only). The clone rendered the full pathname `"/account"` WITH the slash — and the session-6 pin (`"/definitely-not-a-page"`) had encoded the wrong rule. The TDD sequence: the corrected pin + a new edge-matrix test written → **RED** (2 failed against the code) → the `readAttemptedPath` fix in `NotFoundBody.tsx` (`pathname.replace(/^\//, "")`) → **GREEN**. Lesson: every pinned value needs periodic live re-measurement — a pin faithfully guards the rule it encodes, including when the rule is wrong.

## The remediation (per `docs/remediation-plan-session-19.md`)

- **T1 — the pins:** `authed-state-parity.spec.ts` (AS1–AS5) landed green (the pin-gap pattern); the F19-C fix drove the only RED phase — the corrected not-found pin + the edge matrix → RED → the fix → GREEN.
- **T3 — full gate green:** lint ✓ · tsc ✓ · unit **80/80** · build **29/29 routes** · e2e **150/150** (144 + 5 AS + 1 edge matrix) = **230 total** — every pre-existing contract untouched.
- **T2/T4 — the convention + the set:** `scripts/capture-screenshots.mjs` (the executable convention, lint-clean) + the canonical set re-captured from the standalone build (the byte-determinism signal: 14/15 across passes and rebuilds).
- **T5 — documentation aligned:** README (the auth'd-state + capture-convention feature rows, the testing table, the counts 230/150), AGENTS.md (the capture-screenshots command row, the auth'd-state invariant, the corrected 404 strip rule, the counts), CLAUDE.md (the counts, the spec list), PAD (the session-19 verification ledger + the testing table + the authed-state family), SKILL.md → **v1.16.0**, this session log, the plan's executed results, the worklog.
- **T6 — push:** secret scan → atomic commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (the paramiko shim per the runbook) → remote == local verified → key shredded.

## Everything else verified this session

- The mobile navigation menu (the task brief's standing emphasis): `mobile-navigation.spec.ts` green at baseline (part of the 144), the auth'd drawer censused on the live this session (the standard item set) — zero Tailwind v4 regression.
- The scandihaven tech-stack pattern reference (the standing task-brief instruction): the codebase already embodies the pattern family (Next.js 16 App Router + React 19 + Tailwind v4 CSS-first + Prisma/SQLite + Vitest/Playwright + Bun, the strict client/server module discipline) — re-confirmed green across every gate; no stack drift to act on.
- The `skills/` folder remains excluded from code checking, testing, and compilation (Mode C convention; the audit gates never touch it).

## Carried / accepted (unchanged)

- The two dev-only `bun audit` advisories (`braces`, `deepmerge-ts`) — the accepted-risk stance.
- The a11y-addition family (drawer Escape-close, aria-labels, the RM-visible stance) — unchanged, still pinned.
- The og/twitter/PWA + JSON-LD + canonical rejection (sessions 10/18) — unchanged, still negatively pinned.
- The 07-contact screenshot's external-map noise class — now the single documented exception to the byte-determinism signal (irreducible on both sides).

## Suggested next-session candidates

1. **A periodic pin-revalidation sweep** — F19-C showed a faithfully-guarded wrong rule surviving 13 sessions; a scheduled re-measurement of the highest-risk text-format pins (the innerText censuses, the path interpolation, the ICS byte format) against the live would catch any other encoded-wrong or drifted-by-the-platform rule.
2. **A capture-diff regression gate** — with the byte-deterministic convention in place, a lightweight script could hash the canonical set on every build and diff against `docs/screenshots/` (a visual-drift tripwire complementing the computed-style specs — 14/15 hashable, 07 excluded by design).
