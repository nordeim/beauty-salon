# Session 3 — Parity Re-Audit & Auth-Shell Font Fix (2026-10-05)

**Baseline:** remote `main` @ `23d8f6f` · **Deliverable commit:** see `git log` (auth-shell font parity, +2 e2e, docs + screenshots refresh)
**Method:** Mode C audit (`skills/code-review-and-audit` pipeline + `skills/code-review-checklist` runner, `skills/` excluded) + live re-verification with `skills/agent-browser` + TDD remediation per `docs/remediation-plan-session-3.md`.

## What this session set out to do

Refresh the workspace, re-validate the documented architecture against the codebase, audit the recent (session-2) changes, re-verify visual/functional parity against the live reference — with particular attention to the mobile navigation and Tailwind v4 trap behavior — then remediate anything found, re-capture screenshots, align documentation, and push.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 2 (security):** `bun audit` shows the same two dev-only transitive advisories as session 2 (braces ≤3.0.3 via the eslint chain; deepmerge-ts <8 via the Prisma CLI). Re-verified **no upstream fix exists** (braces latest is still 3.0.3) and forcing deepmerge-ts 8.x across Prisma CLI internals remains rejected — the accepted-risk stance stands. No secrets tracked (`.env`, `db/*.db`, key files all ignored; the two key-marker literals are the documented wrapper design).
- **Phase 3 (checklist runner):** 228 non-`skills/` findings; every non-benign one is a false positive or documented: `data.ts:67` "Unsafe JSON.parse" sits inside `safeParse()` (try/catch → `[]`); `playwright.config.ts` `AUTH_SECRET` and `auth.spec.ts` `DEMO_PASSWORD` are e2e-only constants. The remaining 225 are stylistic noise (200× PascalCase React components flagged as "should be camelCase", CAPS comments, null-return idioms).
- **Phase 4 (tests):** baseline fully green — unit 47/47, build 27 routes, e2e 40/40.
- **Recent-changes review (session-2 diff):** db-path seam v2.4, `with-repo-db` wrapper, script rewiring, and the +14 tests all re-reviewed — implementation matches the documented design; invariants hold (`content.ts` client-safe, no client `data.ts` imports, exactly two `new PrismaClient()` sites).

## Live parity re-verification

- Login works on the reference (redirects to the landing surface; the GitHub dashboard image still does not exist — the live site remains the source of truth).
- **Mobile drawer: byte-identical to the pinned contract.** Re-measured at 390×844: `fixed inset-0 z-[60]`, background `rgb(250,248,245)`, link container `flex flex-col gap-2` → measured gap **8px**, five links at 48px Cormorant Garamond with **−1.2px** tracking and `rgb(26,26,26)` ink, CTA gap **48px** (gap-2 + mt-10), no scroll lock, link tap closes the drawer and navigates.
- Services content parity: the same eight treatment names live and in `db/custom.db`.
- **Discovery:** mapping the live login page's font chain element by element revealed the reference's auth shell renders in a **separate CSS context** — body, h1, p, input, button, and label all compute to Tailwind's default sans stack (`ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`) with `font-feature-settings: normal` and `-webkit-font-smoothing: auto`. The clone's `/login` was rendering the brand fonts (Mulish body, Cormorant h1 via the global heading rule).
- Cross-check that validated the clone's existing global heading rule: the live footer h4s (no `font-serif` class) compute to Cormorant, and untracked live headings compute exactly −0.01em — the reference's marketing context carries the same `h1–h5` base rule the clone has. Serif per-heading is explicit on live's marketing headings; the global rule + explicit classes are both real. The gap was strictly the auth shell.

## The fix (TDD)

- **RED:** `tests/e2e/login-parity.spec.ts` — asserts the whole `/login` surface (h1, `main p`, email input) computes to the exact default stack string, plus `font-feature-settings: normal` and `-webkit-font-smoothing: auto` on `<main>`, plus a protective pin of the h1's 30px/700/−0.75px treatment. Ran against the pre-fix build: 1 failed (h1 = Cormorant) / 1 passed, exactly as predicted.
- **GREEN:** `@utility font-shell` in `globals.css` (the default stack + `normal` features + `auto` smoothing, byte-identical to the live-measured values) applied to the login `<main>` (covers the subtree by inheritance) and directly to the `<h1>` (the global heading base rule beats inheritance, so the heading needs the explicit utility). Two spec iterations were needed: `webkitFontSmoothing` isn't on TS's `CSSStyleDeclaration` type, and Playwright strips prototype methods when serializing a computed style object across the evaluate bridge — the final form reads both properties inside the evaluate.
- **Full gate green:** lint ✓ · typecheck ✓ · unit 47/47 ✓ · build 27 routes ✓ · e2e **42/42** ✓ (all 40 pre-existing specs untouched).

## Everything else shipped this session

- 14 dev-server screenshots re-captured on the remediated build (10 re-rendered, 4 byte-identical to the session-2 set); the login capture VLM-verified (card clean, sans heading, no glitches).
- Documentation aligned: README (badge 89, three-font-contexts note, testing table), AGENTS.md (visual-systems invariant now names the two FONT contexts; login-parity added as a parity contract), CLAUDE.md (per-surface font principle, counts), PAD (§5.1 auth-shell context, §5.5 accepted body-bg overscroll difference, §7 inventory 42 + refreshed verification ledger — also fixing a stale session-2 "unit 33/33" ledger line), `beauty-salon_SKILL.md` v1.1.0 (§4.2 third font context, §4.3 five utilities, §9 "Bug 0" lesson, Appendix B 89 total, Appendix C session-3 row).
- Local hygiene: the untracked `.env` header refreshed from the stale session-1 "ORBITAL" text to the current Maison Luminaire template (values unchanged; nothing entered git).
- This plan + this session log + the worklog record.

## Carried / accepted (unchanged)

- `braces` and `deepmerge-ts` advisories — dev-only transitive chains, no upstream fix / not safe to force; documented in `docs/remediation-plan-session-2.md` §4.4 and re-verified this session.
- The login shell's `<body>` background (reference white vs shared-root cream) is reachable only via macOS rubber-band overscroll — added to the PAD's accepted-differences list.
