# Session 4 — Hygiene Audit: Dead Scaffold Scripts & Phantom Env Var (2026-10-05)

**Baseline:** remote `main` @ `af7b800` · **Deliverable commit:** see `git log` (scaffold-script removal, metadataBase wiring, hygiene + site-url test contracts, docs + screenshots refresh)
**Method:** Mode C audit (`skills/code-review-and-audit` pipeline + `checklist_runner.py`, `skills/` excluded) + live parity re-verification with `skills/agent-browser` + TDD remediation per `docs/remediation-plan-session-4.md`.

> Note: this file previously held a Chinese-language process transcript of session 3 (committed at `af7b800` as an interim log). It has been replaced by this proper session-4 record; session 3's authoritative log remains `docs/session_3.md`.

## What this session set out to do

Refresh the workspace, re-validate the documented architecture against the codebase, audit the session-3 changes (the "recent code changes"), re-verify visual/functional parity against the live reference — mobile navigation and Tailwind v4 trap behavior first — then remediate anything found, re-capture screenshots, align documentation, and push to `main`.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 2 (security):** `bun audit` shows the same two dev-only transitive advisories as sessions 2–3 (braces ≤3.0.3 via the eslint chain; deepmerge-ts <8 via the Prisma CLI) — accepted-risk stance re-verified unchanged. No secrets tracked.
- **Phase 3 (checklist runner):** 234 non-`skills/` findings — the identical noise register session 3 documented (2 "criticals" = the documented e2e-only constants `AUTH_SECRET`/`DEMO_PASSWORD`; `data.ts:67` JSON.parse = false positive inside `safeParse()`; 211 PascalCase = React components; "Returning null" = documented idiom). No new actionable findings.
- **Phase 4 (tests):** baseline fully green — unit 47/47, build 27 routes, e2e 42/42.
- **Session-3 diff re-review:** `font-shell` utility, login-page scoping, `login-parity.spec.ts` — all match the documented design; invariants hold (`content.ts` client-safe, zero client `data.ts` imports, test seams correct, `allowedDevOrigins` present).

## Live parity re-verification (agent-browser)

- Login works on the reference (`sepnetflix2023@outlook.com` → redirects to the landing surface; the GitHub dashboard image still does not exist — the live site remains the source of truth).
- **Mobile drawer (390×844): byte-identical to the pinned contract.** Drawer `fixed inset-0 z-[60]`, background `rgb(250,248,245)`; link container `flex-1 flex flex-col justify-center px-8 md:px-20 gap-2` → measured gap **8px**; five links at 48px Cormorant Garamond, **−1.2px** tracking, `rgb(26,26,26)`; CTA gap **48px**; no scroll lock; link tap closes the drawer and navigates. The clone measured **identical on every value** (same container class string, same gap, same CTA offset, same tap behavior).
- **Login font context:** live and local byte-identical — whole surface on Tailwind's default sans stack, `font-feature-settings: normal`, `-webkit-font-smoothing: auto` (24px/700/−0.6px at mobile width on both). Session-3's fix holds.
- **Landing hero tokens (1280×720):** body `rgb(250,248,245)`/`rgb(26,26,26)`; h1 Cormorant Garamond 102.4px/400/−2.56px; fixed 80px transparent header — identical on both.
- **Services content:** the same eight treatment names live and on the local `/services` render.

**Conclusion: no parity remediation required** — the audit's findings were hygiene defects, not parity gaps.

## Findings and the TDD fix

- **F1 (S1, MEDIUM) — 14 dead pre-clone scaffold scripts.** Session 1 rebuilt the app in place, but `scripts/` was only ever added to: 14 of its 15 files were relics of the old project-management app — ten dereference Prisma models that no longer exist (`Goal`/`Task`/`ActivityLog`) and would crash if run; four are old-app capture/probe tools. Referenced by nothing except one stale `docs/DEPLOYMENT.md` line. Fix (RED→GREEN): `tests/repo-hygiene.test.ts` pins three guards — (1) no retired-model references in code dirs (failed exactly as predicted against the relics), (2) every script referenced by operational docs exists, (3) every script referenced by `package.json` exists — then the 14 files were deleted (`scripts/` now holds exactly `with-repo-db.ts`).
- **F2 (S5, MEDIUM-LOW) — `NEXT_PUBLIC_SITE_URL` documented but unused.** Four docs described it (one claiming it feeds sitemap/robots — neither exists), yet no code read it. Fix (RED→GREEN): `src/lib/site.ts` (`siteUrl()` — trim, absolute-http(s) check via `URL` parse, localhost fallback, never throws) wired into the root layout's `metadataBase`; pinned by `tests/site-url.test.ts` (5 specs). Verified the live reference emits no canonical/og tags — so the invisible wiring is the parity-preserving design.
- **F3 (S2, LOW) — DEPLOYMENT.md pre-clone remnants.** "ORBITAL ships…" header, "16 API route handlers" (actual: 6), `orbital.example.com` + sitemap/robots claim, `file:/var/lib/orbital/…` example, and the §6 smoke-test.sh reference. All corrected.
- **F4 (S3, LOW) — this file** replaced with the proper session-4 log.
- **F5 (S4, carried) — advisories.** braces/deepmerge-ts: no upstream fix exists; the session-2 accepted-risk stance stands (dev-only transitive chains, zero runtime exposure).
- Test-shaping notes (both test-side, no assertion weakened): the retired-model regex initially self-matched the hygiene test's own comment examples (reworded); the doc-scan needed a historical-record exclusion (session logs and remediation plans legitimately name removed artifacts) and dropped an over-constrained refs>0 sanity assertion (operational docs referencing zero scripts is a valid state).

## Everything else shipped this session

- **Full gate green with the expanded suite:** lint ✓ · typecheck ✓ · unit **55/55** (47 + 3 hygiene + 5 site-url) · build 27 routes ✓ · e2e **42/42** ✓ (all parity contracts untouched).
- 14 dev-server screenshots re-captured on the remediated build; the mobile-menu capture is 26124B — byte-identical in size to the session-2/3 verified captures (pixel-consistent drawer render). VLM-verified the login capture (centered card, sans heading, no glitches) and the mobile-menu capture (cream overlay, giant serif links, CTA separation, close X).
- `.env.example` made truthful: SITE_URL comment now names its real consumer; the postgres example lost its `project_management` remnant. Verified against the codebase.
- Documentation aligned: README (badge 97, 55/97 counts, env + testing tables), AGENTS.md (Environment: SITE_URL wiring, scripts inventory, hygiene guard), CLAUDE.md (counts, env purpose, `src/lib` map + `site`), PAD (§7 inventory 55/97 + session-4 verification ledger), `beauty-salon_SKILL.md` **v1.2.0** (project_state, pre-ship checklist — also fixing a session-3 miss where it said "40 specs", Appendix B rows, Appendix C session-4 row).
- The remediation plan (`docs/remediation-plan-session-4.md`) with its findings register, plan-vs-codebase validation matrix, and executed ToDo results; this session log; the worklog record.

## Carried / accepted (unchanged)

- `braces` and `deepmerge-ts` advisories — dev-only transitive chains, no upstream fix / not safe to force; documented in `docs/remediation-plan-session-2.md` §4.4 and re-verified in sessions 3–4.
- The login shell's `<body>` background overscroll difference (PAD §5.5) — unreachable outside macOS rubber-band; accepted.
- The in-memory rate limiter, inert Google OAuth, notice-only Forgot-password/Sign-up, and the remaining PAD §10 deferred items — by design, mirroring the reference.
