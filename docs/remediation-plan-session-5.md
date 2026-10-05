# Remediation Plan — Session 5 (Parity Audit: The Unmeasured 404 Surface)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `36a0f49` (session-4 hygiene remediation `f4e2cd6` + plan-status follow-up)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (5-phase pipeline; Phase 3 run as a targeted lightweight checklist after the checklist runner destabilized shells in session 4; `skills/` excluded) + live parity verification with `skills/agent-browser` (login → post-login surface, mobile drawer computed styles @390×844 + tap behavior, login font chain, landing hero tokens @1280×720, services/stylists/gallery/testimonials content, booking form + deep-link preselection, 404 surface full DOM + computed-style capture). Plan validated against the codebase before execution (§5).

---

## 1. Executive Summary

The session-4 release re-validates **fully green** on every automated gate: ESLint clean, `tsc --noEmit` clean, 55/55 Vitest unit tests, 27-page production build, 42/42 Playwright e2e specs. Live parity re-verification this session covered a **wider surface than any prior session** — adding team, gallery, and testimonial content, the booking form's option set, deep-link preselection (`?service=balayage`), and for the first time a **full measurement of the reference's 404 surface** — and everything measured is byte-identical… except one surface that had never been measured against the live reference: **the 404 page**.

- **F1 (S1, MEDIUM — a real parity gap, the first since session 3):** the clone's 404 renders a cream-editorial giant-serif layout (`text-[20vw] md:text-[12rem]` Cormorant h1, italic serif subtitle, generic message, uppercase pill CTA). The live reference renders a **slate-centered card**: `min-h-screen flex items-center justify-center p-6 bg-slate-50` around a `max-w-md` block — h1 `text-7xl font-light text-slate-300` (72px/300), a `h-0.5 w-16 bg-slate-200 mx-auto` divider, h2 `text-2xl font-medium text-slate-800`, a message that **interpolates the attempted path** (`The page "<path>" could not be found in this application.`), and a real `<button>` Go Home (white/slate bordered, `rounded-lg`), all inside the marketing chrome (header + footer, brand fonts via the global heading rule).
- **F2 (S2, LOW):** `docs/session_5.md` (as pulled) is a raw process transcript of session 4 — the standing session-log finding; replaced at wrap-up with the proper session-5 log.
- **F3 (S3, carried, accepted):** the two dev-only transitive advisories (`braces` via the eslint chain, `deepmerge-ts` via the Prisma CLI chain) — re-verified; the session-2 accepted-risk stance stands.

F1 is fixed TDD-style this session: a new live-measured parity contract (`tests/e2e/not-found-parity.spec.ts`, 3 specs) goes RED first, then the 404 is rebuilt to the reference DOM (a small client island `src/components/NotFoundBody.tsx` for the path interpolation + Go Home button, following the `LoginCardBody`/`StatusPill` patterns), and the session-1-era assertions in `auth.spec.ts` that were authored against the clone instead of the reference are corrected.

---

## 2. Findings Register

| ID | Severity | Category | Finding | Evidence |
|----|----------|----------|---------|----------|
| F1 / S1 | **MEDIUM** | Parity gap (404 surface) | `src/app/not-found.tsx` does not match the live reference. Clone: cream editorial — `pt-40 md:pt-52` section, h1 `font-serif text-[20vw] md:text-[12rem]` tracking-tight, h2 `font-serif text-3xl md:text-5xl italic text-secondary`, generic message "The page you are looking for doesn't exist or has been moved.", uppercase tracking-editorial pill `Link` ("GO HOME"). Reference (live-measured @1280×720, 2026-10-05): `<main class="flex-1">` → `div.min-h-screen.flex.items-center.justify-center.p-6.bg-slate-50` → `div.max-w-md.w-full` → `div.text-center.space-y-6` → [`div.space-y-2` → **h1 `text-7xl font-light text-slate-300`** (72px / weight 300 / `rgb(203,213,225)` / Cormorant Garamond / −0.72px) + **`div.h-0.5.w-16.bg-slate-200.mx-auto`** (2px × 64px, `rgb(226,232,240)`, centered)], [`div.space-y-3` → **h2 `text-2xl font-medium text-slate-800`** (24px / 500 / `rgb(30,41,59)` / Cormorant / −0.24px) + **p `text-slate-600 leading-relaxed`** (16px / 400 / `rgb(71,85,105)` / Mulish / line-height 26px) with the attempted path interpolated inside a `span.font-medium.text-slate-700` (`rgb(51,65,85)` / 500)], [`div.pt-6` → **button** `inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500` (pad 8px 16px, border 1px `rgb(226,232,240)`, radius 8px, bg `rgb(255,255,255)`, 14px/500, line-height 20px, text-transform none, Mulish) → "Go Home", navigating to `/`]. Marketing chrome (header + footer) wraps it on both — the clone has that part right. | agent-browser DOM walk + computed-style capture of `https://luminous-…base44.app/nonexistent-page-xyz`; screenshot `_ref-404.png` (reviewed, not committed); the clone's `not-found.tsx` read in full. |
| F2 / S2 | LOW | Doc structure | `docs/session_5.md` (pulled at `36a0f49`) is a raw English process transcript of session 4's continuation, not a session-5 log — same class as session 4's F4 (the then-`session_4.md` transcript). | Read of `docs/session_5.md`. |
| F3 / S3 | MEDIUM (carried, accepted) | Supply chain (dev-only) | `braces ≤3.0.3` (eslint chain) + `deepmerge-ts <8` (Prisma CLI chain) — dev-only transitive; no runtime exposure; no upstream fix exists. | `bun audit` this session: exactly the two documented advisories; session-2/3/4 rationale re-verified unchanged. |
| F4 | — | Verified conforming (no action) | Baseline gate green (lint ✓ · tsc ✓ · unit 55/55 · build 27/27 pages ✓ · e2e 42/42 ✓). Invariants hold: `content.ts` client-safe; zero client `data.ts` imports; `allowedDevOrigins` present; test seams correct; no `console.log`/TODO/`any` in `src/`; scripts inventory = exactly `with-repo-db.ts`; `.gitignore` covers env/db/logs; secret scan clean (docs key mentions are redacted/instructional). Session-4 diff re-reviewed: `site.ts`, `metadataBase` wiring, hygiene + site-url specs all match the documented design. Live parity byte-identical on every OTHER measured surface: mobile drawer (fixed inset-0 z-60 cream `rgb(250,248,245)`, container `gap-2` gap **8px** px-8, 5 links 48px Cormorant −1.2px `rgb(26,26,26)` weight 400, CTA wrapper `mt-10` 40px → last-link gap **48px**, no scroll lock, tap closes+navigates — identical live and local); login font context (h1/p/label/button all default sans stack, `normal` features, `auto` smoothing; no visible text outside the font-shell main — identical); landing hero tokens (body cream/ink, h1 Cormorant 102.4px/400/−2.56px, fixed 80px transparent header — identical); nav href map (`/services` `/gallery` `/team` `/about` `/contact` `/book` — identical); content parity (8/8 service names + prices, 3/3 stylists, 12/12 gallery titles+categories+order, testimonial attributions); booking form (labels, option set, submit — identical); deep-link preselection (`?service=balayage` → "Signature Balayage · $285" — identical); status pill ("Closed today" both). The GitHub dashboard image referenced in the brief still 404s (checked raw + blob) — the live site remains the source of truth; post-login redirects to the landing surface, and no dashboard exists in the reference. | This session's audit + agent-browser measurements. |

**Explicitly out of scope (per instructions):** the `skills/` folder is excluded from code checking, testing, and compilation (honored by `eslint.config.mjs` ignores + `tsconfig.json` exclude + test-dir seams).

---

## 3. Root-Cause Analysis

**F1 (the unmeasured 404).** The 404 page is the one interactive surface whose design was **authored from assumption in session 1 and never measured** against the live reference — every other surface (landing, services, gallery, team, about, contact, booking, login, legal) was extracted from the reference DOM during the rebuild, and the high-risk surfaces (drawer, login shell) later earned live-measured parity contracts. The 404 slipped through for three compounding reasons: (a) it is a terminal surface no user flow depends on, so no session's parity spot-check list included it; (b) its e2e spec (`auth.spec.ts` "unknown routes render the 404 surface") was **written against the clone's own DOM** — asserting `getByRole("link", { name: "Go Home" })` because that is what the clone happened to render, so the gate stayed green while the surface drifted; (c) both the clone and the reference render "404 / Page Not Found / Go Home" text, so casual text-level comparison passed. The lesson is the one the parity specs already encode: **text presence is not parity — computed styles and DOM shape are**.

**Design constraints (validated against the codebase):**

1. The reference's Go Home control is a real `<button>` (SPA onclick navigation), not a link. Server components cannot carry event handlers (AGENTS.md) — the interactive fragment must be a client island (the `LoginCardBody` pattern).
2. The reference's message interpolates the attempted URL path. `not-found.tsx` is a server component and receives no path prop; `usePathname()` in a client component is the idiomatic source — but the root not-found is served as the statically prerendered `/_not-found` shell, so the server-rendered text can differ from the client's first render. The codebase's sanctioned idiom for exactly this class of server/client divergence is render-time computation + `suppressHydrationWarning` (`StatusPill.tsx`, the next-themes pattern, documented in AGENTS.md). The path span carries the suppression; the client value wins after hydration.
3. The reference 404 runs in the **marketing font context** (unlike `/login`): h1/h2 compute to Cormorant Garamond via the global heading rule (the clone's `globals.css` base rule applies `font-family: var(--font-serif); letter-spacing: -0.01em)` to h1–h5 — 72px × −0.01em = −0.72px, 24px × −0.01em = −0.24px, exactly the measured values), and p/button inherit Mulish from the body. No font utilities needed — do NOT scope `font-shell` here.
4. The slate palette classes (`bg-slate-50`, `text-slate-300/600/700/800`, `bg-slate-200`, `border-slate-200`) are Tailwind default-palette colors — present in v4's default theme, no `@theme` additions needed. This mirrors the login shell's use of default slate classes (same precedent).
5. The reference's `space-y-2/3/6` wrappers have no child margin utilities, so the v4 `:where()` rewrite (trap 4) is not in play — margins apply cleanly and compute identically to the measured 8/12/24px gaps.
6. The e2e 404 assertions in `auth.spec.ts` (role=link + href) are wrong against the reference and must be corrected to role=button + click-navigation. This is not weakening a parity contract — it is replacing clone-authored assumptions with the live-measured contract (the same authority the other parity specs encode).
7. `not-found.tsx` is a special file: only the default export is allowed (page-file export rule) — the current file already complies; the rewrite must too.

**F2 (transcript).** The prior session committed its working transcript as `session_5.md` (the established hand-off convention — session 4 did the same and replaced it at wrap-up). Same treatment here.

---

## 4. Remediation Design

### 4.1 F1 — the 404 parity contract, then the rebuild (TDD)

**RED — new `tests/e2e/not-found-parity.spec.ts`** (3 specs, live-measured values; mirrors the `mobile-navigation.spec.ts` / `login-parity.spec.ts` pattern — computed-style contracts so the surface can never drift again):

1. **"the 404 body renders the reference's slate centered card"** — navigate to an unknown path; assert the outer wrapper (`bg-slate-50` → `rgb(248,250,252)`, `p-6` → 24px padding, flex + items-center + justify-center, min-height = viewport height), the h1 (72px / 300 / `rgb(203,213,225)` / Cormorant / −0.72px), the divider (2px × 64px, `rgb(226,232,240)`, equal left/right margins — centered), the h2 (24px / 500 / `rgb(30,41,59)` / Cormorant / −0.24px), the p (16px / `rgb(71,85,105)` / Mulish / line-height 26px), and the Go Home button (role=button, 14px / 500 / `rgb(51,65,85)` / Mulish, pad 8px 16px, 1px border `rgb(226,232,240)`, radius 8px, bg `rgb(255,255,255)`, text-transform none).
2. **"the message interpolates the attempted path"** — the paragraph text contains `"<attempted-path>"` (post-hydration; Playwright auto-waits past the hydration patch).
3. **"the Go Home button navigates home"** — click → `expect(page).toHaveURL("/")`.

**RED — update `tests/e2e/auth.spec.ts`** (same test, corrected authority): `getByRole("link", { name: "Go Home" })` + `href="/"` → `getByRole("button", { name: "Go Home" })` + click + `toHaveURL("/")`. The heading/banner/contentinfo assertions stay.

**GREEN — new `src/components/NotFoundBody.tsx`** (`"use client"`): `usePathname()` + `useRouter()`; renders the reference DOM exactly — outer `min-h-screen flex items-center justify-center p-6 bg-slate-50` → `max-w-md w-full` → `text-center space-y-6` → [`space-y-2`: h1 `text-7xl font-light text-slate-300` + divider `h-0.5 w-16 bg-slate-200 mx-auto`] → [`space-y-3`: h2 `text-2xl font-medium text-slate-800` + p `text-slate-600 leading-relaxed` with the quoted path in a `span.font-medium.text-slate-700` carrying `suppressHydrationWarning` (StatusPill idiom)] → [`pt-6`: button with the reference's exact class string, `router.push("/")`].

**GREEN — rewrite `src/app/not-found.tsx`** (server): `SiteHeader` + `<main className="flex-1"><NotFoundBody /></main>` + `SiteFooter` — default export only.

### 4.2 F2 — session log

Replace `docs/session_5.md`'s transcript content with the proper session-5 log at wrap-up (same format as `docs/session_4.md`).

### 4.3 F3 — carried advisories

Re-verified this session; no upstream fix exists. No action; the register documents the stance.

### 4.4 Documentation alignment (post-fix)

- `README.md`: testing table e2e 42 → 45 (add the 404 parity contract to the e2e scope description), tests badge 97 → 100; screenshots count 14 → 15 if a 404 capture is added (it is — see §4.5).
- `AGENTS.md`: Testing conventions — add `not-found-parity.spec.ts` to the parity-contract list; Framework quirks — note the 404's static-`/_not-found` hydration handling (StatusPill idiom on the path span).
- `CLAUDE.md`: testing counts (45 e2e / 100 total); components map gains `NotFoundBody`.
- `Project_Architecture_Document.md`: §5 (the 404 surface description), §7 test inventory (45 e2e, 100 total) + session-5 verification ledger row.
- `beauty-salon_SKILL.md`: version bump v1.2.0 → v1.3.0; project_state; test-count appendices; Appendix C session-5 row.
- `.env.example`: unchanged (verified truthful this session — no 404-relevant env).

### 4.5 Screenshots

Re-capture the 14 dev-server screenshots on the remediated build (landing, services, detail, gallery, team, about, contact, book, login, mobile trio, lightbox, confirmation) **plus a new `15-not-found-desktop.png`** documenting the fixed 404 surface; VLM-verify the two most parity-critical captures (login + mobile menu) plus the new 404 capture.

---

## 5. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| The current 404 is the only unmeasured surface | All other surfaces have session-1 extraction records and/or live parity contracts (`mobile-navigation.spec.ts`, `login-parity.spec.ts`); `not-found.tsx` has none — authored at `acb9532`, untouched since | ✓ |
| The reference 404 contract values are viewport-stable | The class set has no responsive prefixes (fixed `text-7xl`/`text-2xl`/`max-w-md`); only the divider's auto margins vary with width → the spec asserts margin equality, not px | ✓ |
| `not-found.tsx` allows only a default export | Current file exports only `default` (special-file rule); the rewrite keeps it | ✓ |
| A client island can host the button + path | `LoginCardBody` precedent (client island inside a server page); `StatusPill` precedent (render-time computation + `suppressHydrationWarning`) | ✓ |
| The global heading rule produces the measured typography | `globals.css` h1–h5 base rule: `var(--font-serif)` + `letter-spacing: -0.01em` → 72px→−0.72px, 24px→−0.24px; body Mulish via `--font-sans` — matches the live measurement | ✓ |
| Slate classes exist in the v4 default theme (no `@theme` edits) | The login shell already uses default slate classes (`bg-[linear-gradient(#f8fafc…)]`, `text-slate-900`); v4 default palette includes 50/200/300/600/700/800 | ✓ |
| `space-y-*` in the 404 has no trap-4 interaction | The reference wrappers' children carry no `mt-*` utilities → `:where()` margins apply cleanly (8/12/24px) | ✓ |
| `usePathname` returns the attempted path client-side | Client router state initializes from the current URL on full page load; the static `/_not-found` shell makes the server text differ → `suppressHydrationWarning` on the path span (sanctioned idiom); the e2e asserts post-hydration text (Playwright auto-wait) | ✓ |
| The auth.spec 404 assertions are clone-authored, not live-measured | `git log` — the spec predates any 404 live measurement; the reference DOM shows BUTTON (measured this session) | ✓ |
| Vitest does not pick up the new spec file | `vitest.config.ts` includes `*.test.ts` only; the new file is `tests/e2e/*.spec.ts` (playwright `testDir`) | ✓ |
| Spec-count math | 55 unit (unchanged) + 42 e2e + 3 new = **45 e2e**, **100 total** | ✓ |

---

## 6. ToDo List (execution order, TDD)

- [x] **T1.** RED — wrote `tests/e2e/not-found-parity.spec.ts` (3 specs) + updated the `auth.spec.ts` 404 assertions; built and ran both files: **4 failed exactly as predicted** (all 3 new specs red — wrong typography/DOM, no path interpolation, link-not-button; the auth 404 spec red on role=button), 9 pre-existing green.
- [x] **T2.** GREEN — implemented `src/components/NotFoundBody.tsx` + rewrote `src/app/not-found.tsx`. *(Two implementation discoveries, both fixed in GREEN and documented: (a) `usePathname` returns the static shell's `/_not-found` path, not the attempted URL — the island reads `window.location.pathname` via `useSyncExternalStore` instead (server snapshot `""` matches the shell exactly — no hydration mismatch at all); (b) `bg-slate-50` computed to `lab(98.14…)` — v4's default palette serializes as oklch/lab (trap 6, pixels identical, string unstable) — fixed by pinning the slate scale 50–900 to the reference's sRGB hex in `@theme`, the trap-2/ADR-005 token-pin precedent. One test-side fix: the divider selector needed a structural form — the `h-0.5` class requires CSS escaping in selectors.)* → both spec files 13/13 green.
- [x] **T3.** Full gate: `lint ✓ · typecheck ✓ · unit 55/55 ✓ · build 27/27 pages ✓ · e2e 45/45 ✓` (all pre-existing parity contracts untouched; 100 total).
- [x] **T4.** Re-captured all 14 dev-server screenshots on the remediated build + the new `15-not-found-desktop.png`; mobile-menu capture 26124B — byte-identical size to the session-2/3/4 verified captures (pixel-consistent drawer); VLM-verified login (centered card, sans heading, no glitches), mobile menu (cream overlay, serif links, CTA separation, close X), and the 404 (centered slate card, light 72px 404, divider, path-interpolated message, outlined Go Home button, marketing header, no glitches).
- [x] **T5.** Documentation aligned: README (badge 100, 45 e2e, parity description), AGENTS.md (six traps — trap 6 slate-pin note; not-found-parity contract + the usePathname/​static-shell gotcha), CLAUDE.md (45/100 counts, six-trap line, components map + NotFoundBody), PAD (§7 inventory 45/100, session-5 ledger, component tree), `beauty-salon_SKILL.md` **v1.3.0** (project_state, quickstart counts, Appendix B 45/100, Appendix C session-5 row), `docs/Tailwind-V4-Validation-Report.md` (trap-6 appendix); `.env.example` re-verified truthful (no 404-relevant env).
- [x] **T6.** Replaced `docs/session_5.md` with the proper session log; appended the worklog record (Task ID 8); marked this plan's ToDo results.
- [ ] **T7.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local.

## 7. Acceptance Criteria (definition of done)

1. The 404 surface renders the reference's slate centered card byte-identically on every pinned value (typography, colors, divider, spacing, button) with the attempted path interpolated and a real Go Home button that navigates home; pinned by `tests/e2e/not-found-parity.spec.ts`.
2. `auth.spec.ts`'s 404 test asserts the live-measured contract (button + navigation), not the clone's old DOM.
3. Full gate green: lint · typecheck · unit 55/55 · build 27/27 · e2e **45/45** (100 total) — no pre-existing assertion weakened.
4. 15 screenshots in `docs/screenshots/` (14 re-captured + the new 404 capture), VLM-verified on the critical captures.
5. Docs aligned (README/AGENTS/CLAUDE/PAD/SKILL v1.3.0/worklog/proper `session_5.md`); `.env.example` truthful.
6. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 8. Rollback

Revert the commit: restore `src/app/not-found.tsx` (previous content), delete `src/components/NotFoundBody.tsx` + `tests/e2e/not-found-parity.spec.ts`, revert the `auth.spec.ts` assertion block and the doc alignments. No schema, data, API, or infrastructure change is involved.

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| 404 parity rebuild | `src/app/not-found.tsx` (rewritten), `src/components/NotFoundBody.tsx` (new) |
| 404 parity contract | `tests/e2e/not-found-parity.spec.ts` (new, 3 specs) |
| 404 assertions corrected to live authority | `tests/e2e/auth.spec.ts` |
| Screenshots | `docs/screenshots/*.png` (14 re-captured + `15-not-found-desktop.png`) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.3.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-5.md`, `docs/session_5.md`, `worklog.md` |
