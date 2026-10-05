# Remediation Plan — Session 3 (Parity Re-Verification & Auth-Shell Font Fix)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `23d8f6f` (remediation commit `8a4c77f` + session-2 log)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (5-phase pipeline + checklist runner, `skills/` excluded); live parity re-verified against `https://luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app/` with `skills/agent-browser` (login → landing, mobile drawer computed styles, services content, login-surface font chain). Plan validated against the codebase before execution (§5).

---

## 1. Executive Summary

The session-2 release (`8a4c77f`) re-validates **fully green** on every automated gate this session: ESLint clean, `tsc --noEmit` clean, 47/47 Vitest unit tests, 27-route production build, 40/40 Playwright e2e specs (including the mobile-navigation computed-style parity contract). The live reference was re-measured: the mobile drawer still matches the pinned contract byte-for-byte, the eight services are unchanged, and the login flow works.

The audit surfaced **one MEDIUM-severity parity finding (F1)**: the reference's `/login` surface renders in a **separate CSS context** (the base44 auth shell) that never loads the brand typography — its entire font chain (body, h1, p, input, button, label) computes to **Tailwind's default sans stack** (`ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`) with `font-feature-settings: normal` and `-webkit-font-smoothing: auto`. The clone's login page instead inherits the app-wide brand system: Mulish body text (via `font-sans` on `<body>`), Cormorant Garamond on the h1 (via the global `h1–h5` base rule), Mulish's `"ss01","cv11"` feature settings, and `antialiased` smoothing. Visually both are humanist sans/serif pairs, but the *computed* contract differs — and computed parity is this project's requirement.

Two lower-severity items round out the register: the carried dependency advisories (re-verified — still no upstream fix) and a cosmetic local-only `.env` header. No other gaps were found: the global heading rule (`h1–h5 → serif + −0.01em`) was re-confirmed as **matching the live site's own mechanism** (live footer h4s without `font-serif` compute to Cormorant; live untracked headings compute exactly −0.01em), so it stays.

---

## 2. Findings Register

| ID | Severity | Category | Finding | Evidence |
|----|----------|----------|---------|----------|
| F1 | **MEDIUM** | Visual parity (auth surface) | The login surface's font context diverges from the reference. Live auth shell: entire chain = Tailwind default sans stack, feature-settings `normal`, smoothing `auto`. Clone: body/p/input = Mulish, h1 = Cormorant (global heading rule), feature-settings `"ss01","cv11"`, smoothing `antialiased`. | agent-browser computed-style extraction on live `/login` (two independent measurements, stable across loads): body/h1/p/input/button/label all `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`; vs clone `/login` measured h1 = `"Cormorant Garamond", …` 30px/700/−0.75px. Root cause: the base44 login is a separate shell without the brand font CSS; the single-app clone shares one root layout, so the brand context leaks into `/login`. |
| F2 | MEDIUM (carried, accepted) | Supply chain (dev-only) | `braces ≤3.0.3` (via `eslint-config-next › fast-glob › micromatch`) and `deepmerge-ts <8` (via `prisma › @prisma/config`) — dev-only transitive chains; zero runtime exposure. | Re-verified this session: `bun pm view braces` → latest **3.0.3** (still no patched upstream); `deepmerge-ts` 8.0.2 exists but forcing it overrides Prisma CLI internals across a major version (rejected, session-2 rationale stands). Status: accepted + documented risks. |
| F3 | — | Verified conforming (no action) | Checklist runner non-benign findings are false-positives / documented: `data.ts:67` "Unsafe JSON.parse" is inside `safeParse()` (try/catch → `[]`); `playwright.config.ts:51` `AUTH_SECRET` + `auth.spec.ts:6` `DEMO_PASSWORD` are e2e-only constants (documented). Remaining 222 findings: stylistic noise (200× "PascalCase const" = React components; CAPS comments; null-return idioms). | `checklist_runner.py` JSON output filtered to non-`skills/` paths: 228 findings, 2 "critical" both known-benign |
| F4 | LOW (local hygiene) | Untracked-file drift | The local git-ignored `.env` still carries the session-1-era `# ORBITAL — environment configuration` header (the tracked `.env.example` was renamed to "Maison Luminaire" in session 1). Values are correct (`DATABASE_URL="file:../db/custom.db"`); no repo impact. | Read of `<repo>/.env` (untracked) vs `.env.example` |
| F5 | — | Verified conforming (no action) | Mobile drawer re-measured on live: `fixed inset-0 z-[60]`, `rgb(250,248,245)`, link container `flex flex-col gap-2` → gap **8px** measured, 5 links @ 48px Cormorant, tracking **−1.2px**, CTA gap **48px** (gap-2 + mt-10), no scroll lock, link tap closes + navigates — byte-match with the pinned e2e contract (40/40 green this session). Services content parity: same 8 service names live vs `db/custom.db`. Ambient `DATABASE_URL` still injected by the platform; the wrapper defense remains load-bearing (workspace-level `db/` absent; repo DB seeded). | This session's audit passes |

**Explicitly out of scope (per instructions):** the `skills/` folder is excluded from code checking, testing, and compilation.

**Accepted, imperceptible difference (documented, not fixed):** the live login shell's `<body>` background is `rgb(255,255,255)`; the clone's root body is the cream `hsl(44 29% 97%)`. The login `<main>` covers the viewport with the pinned slate gradient, so the body color is only reachable via macOS rubber-band overscroll — same class of documented engine/context difference as v4's `rounded-full` 33554400px (AGENTS.md quirks).

---

## 3. Root-Cause Analysis — F1

The reference is a base44 SPA: the marketing site and the auth surface are **two CSS contexts**. The marketing context loads the brand fonts (Cormorant Garamond + Mulish), applies a global `h1–h5 { font-family: serif; letter-spacing: −0.01em }` base rule, `font-feature-settings "ss01","cv11"`, and antialiased smoothing. The auth shell (`/login`) does none of this — it renders with Tailwind's defaults end to end. Both were measured directly this session:

| Property | Live `/login` | Live marketing | Clone `/login` (today) |
|---|---|---|---|
| body font | default sans stack | Mulish | **Mulish** ✗ |
| h1 font | default sans stack | Cormorant (global rule + `font-serif`) | **Cormorant** ✗ |
| feature settings | `normal` | `"ss01","cv11"` | **`"ss01","cv11"`** ✗ |
| smoothing | `auto` | `antialiased` | **`antialiased`** ✗ |
| h1 size/weight/tracking | 30px / 700 / −0.75px | (n/a) | 30px / 700 / −0.75px ✓ |

The clone is a **single Next.js app with one root layout**, so the brand context (body `font-sans`, the global heading rule) correctly serves every marketing page — and incorrectly leaks into `/login`. Session 1 captured the login surface's slate palette (the gradient wash is pinned by e2e) but did not compare the auth shell's **font chain**, because the brand fonts were assumed global; the existing parity specs (`auth.spec.ts:44`) assert the palette only. The gap is therefore un-pinned, not un-fixed-by-design.

**Design constraints (validated against the codebase):**

1. The global `h1–h5` rule in `globals.css` **stays** — live's own marketing context has the same rule (footer h4s without `font-serif` compute to Cormorant; untracked headings compute exactly −0.01em, both measured this session). Removing it would break marketing parity.
2. The fix must be **scoped to `/login` only** — every other surface (marketing, booking, 404) is brand-context on live too.
3. The marketing pages' explicit `font-serif` classes (already mirroring the live DOM) remain untouched.
4. Production and dev flows, DB seams, and the e2e infrastructure are not touched by a CSS + one-page change.

---

## 4. Remediation Design

### 4.1 New `@utility` in `src/app/globals.css`

```css
/* Auth-shell font context — the reference's /login renders in a separate
   CSS context that never loads the brand fonts: the whole surface computes
   to Tailwind's DEFAULT font stack with default feature settings and
   smoothing. Pinning that context keeps the auth surface out of the brand
   typography systems (the slate card is a third visual language by design). */
@utility font-shell {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-feature-settings: normal;
  -webkit-font-smoothing: auto;
}
```

The stack is byte-identical to the value measured on live (Chromium serializes the same token list identically). `@utility` places it in the utilities layer, so it beats the base layer both on layer order and specificity.

### 4.2 Apply to the login surface (`src/app/login/page.tsx`)

- `<main>` gains `font-shell` — covers the entire subtree by inheritance (p, inputs, buttons, dividers all have no font-family of their own).
- The `<h1>` gains `font-shell` **directly** — inheritance cannot beat the base-layer `h1 { font-family: var(--font-serif) }` rule; a direct utility can (and does).

### 4.3 New parity spec (`tests/e2e/login-parity.spec.ts`)

Mirrors the `mobile-navigation.spec.ts` pattern (computed-style contract against live-measured values):

1. `the login surface renders in the default sans stack, not the brand fonts` — h1, `main p`, and the email input all compute to the exact default stack string; `main` computes `font-feature-settings: normal` and `-webkit-font-smoothing: auto`.
2. `the login h1 keeps the reference's bold/tight treatment` — 30px / 700 / −0.75px (protective pin; passes before and after).

### 4.4 F2 — carried advisories

Re-verified: no upstream `braces` fix exists (latest 3.0.3); `deepmerge-ts` 8.x stays rejected (Prisma-CLI-internal major override). No action; the register above is the documentation.

### 4.5 F4 — local `.env` header

Refresh the untracked local `.env` header text to match `.env.example` (local hygiene only; nothing enters git).

### 4.6 Documentation alignment (post-fix)

- `README.md`: badge 87 → 89; design-system note — the auth shell renders in Tailwind's default font stack; testing table + e2e file list gains `login-parity.spec.ts` (42 e2e).
- `AGENTS.md`: architecture invariants ("two visual systems" → three font contexts: cream editorial brand system, slate auth shell on the default stack, booking chrome on brand); testing conventions mention the login-parity contract.
- `CLAUDE.md`: testing table counts (42 e2e / 89 total).
- `Project_Architecture_Document.md`: §5 design system (auth-shell font context ADR note), §7 test inventory.
- `beauty-salon_SKILL.md`: §4 design system (the three font contexts), Appendix B inventory, Appendix C audit history.
- `docs/screenshots/`: re-capture (the login capture changes visually; refresh the full set for consistency).

---

## 5. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| `@utility` pattern is native to this codebase | `globals.css` already defines `tracking-editorial`, `glass`, `prism-gradient`, `breathe` via `@utility` | ✓ |
| Login h1 is the only heading on `/login` | `src/app/login/page.tsx` — single `<h1>`; no other h1–h5 | ✓ |
| Everything else on `/login` inherits from `<main>` | `LoginForm.tsx` fieldClass/button classes carry no `font-family`/`font-feature-settings`/smoothing utilities; the `<p>` "Sign in to continue" has none | ✓ |
| Utility beats the global heading rule | Tailwind v4 layer order (base < utilities) + specificity `.font-shell` (0,1,0) > `h1` (0,0,1) | ✓ |
| `tracking-tight` on the login h1 still wins for letter-spacing | Utility layer beats the base `−0.01em`; measured −0.75px @ 30px today, unchanged by the fix | ✓ |
| New spec is picked up by Playwright, not Vitest | `playwright.config.ts` `testDir: ./tests/e2e`; `vitest.config.ts` matches `*.test.ts` only | ✓ |
| e2e viewport supports the 30px expectation | Desktop Chrome project (1280×720) → `sm:text-3xl` = 30px (measured) | ✓ |
| Marketing surfaces untouched | Only `/login` page changes; no shared component edits (`SiteFooter` h4s keep the global serif — matching live) | ✓ |
| Spec count math for docs | 40 e2e + 2 new = 42; 47 unit + 42 = 89 total | ✓ |

---

## 6. ToDo List (execution order, TDD)

- [x] **T1.** RED — write `tests/e2e/login-parity.spec.ts`; run it against the current build; confirm the font-context test fails (h1 = Cormorant, input = Mulish) while the size/weight/tracking pin passes. *(Executed: 1 failed / 1 passed exactly as predicted.)*
- [x] **T2.** GREEN — add `@utility font-shell` to `globals.css`; apply to `<main>` + `<h1>` in `src/app/login/page.tsx`; rebuild; rerun the spec → green. *(Executed: 2/2 green; one iteration needed — the first draft read `webkitFontSmoothing` directly (TS2339: not on `CSSStyleDeclaration`) and via `getPropertyValue` outside the evaluate (Playwright strips prototype methods when serializing) — final form reads both properties inside the evaluate.)*
- [x] **T3.** Full gate: `lint ✓ · typecheck ✓ · unit 47/47 ✓ · build 27 routes ✓ · e2e 42/42 ✓`. *(Verified twice — after the fix and after the spec's typecheck repair.)*
- [x] **T4.** F4: refresh the local untracked `.env` header (no git impact).
- [x] **T5.** Re-capture the 14 dev-server screenshots on the remediated build (login capture changes; full set refreshed for consistency); dev log clean. *(10 re-rendered, 4 byte-identical to the prior captures; VLM-verified the login card renders clean with the sans heading; mobile-menu capture byte-identical size to the session-2 verified capture.)*
- [x] **T6.** Documentation alignment per §4.6 (README, AGENTS, CLAUDE, PAD, beauty-salon_SKILL.md, .env.example if needed).
- [x] **T7.** Session-3 record: `docs/session_3.md` + `worklog.md` append.
- [x] **T8.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local.

## 7. Acceptance Criteria (definition of done)

1. ✅ `/login` computes to the reference auth shell's font context: default sans stack on h1/p/input, `font-feature-settings: normal`, `-webkit-font-smoothing: auto` — pinned by `tests/e2e/login-parity.spec.ts` (RED confirmed on the pre-fix build; GREEN after; VLM visual check of the re-captured screenshot confirms the sans heading).
2. ✅ Marketing parity unchanged: all 40 pre-existing e2e specs green untouched; drawer re-verified byte-identical on the live reference this session.
3. ✅ Full gate green with the expanded suite: lint ✓ · typecheck ✓ · unit 47/47 ✓ · build 27 routes ✓ · e2e 42/42 ✓.
4. ✅ Docs, screenshots (14 re-captured), SKILL (v1.1.0), and session logs reflect the remediated codebase.
5. ✅ Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## 8. Rollback

Three-file revert: delete `tests/e2e/login-parity.spec.ts`, remove `font-shell` from `login/page.tsx` (2 class tokens), remove the `@utility font-shell` block from `globals.css`. No schema, data, API, or infrastructure change is involved.

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| Auth-shell font-context utility | `src/app/globals.css` |
| Login surface scoping | `src/app/login/page.tsx` |
| Login parity contract | `tests/e2e/login-parity.spec.ts` (new, 2 specs) |
| Screenshots re-capture | `docs/screenshots/*.png` (14) |
| Documentation alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` |
| This plan + session log | `docs/remediation-plan-session-3.md`, `docs/session_3.md`, `worklog.md` |
