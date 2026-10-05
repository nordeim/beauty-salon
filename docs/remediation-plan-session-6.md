# Remediation Plan — Session 6 (Audit: The Session-5 Slate Pin, One Digit Off)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `ca7e0e9` (session-5 parity remediation `ec461ac` + the `session_6.md` transcript commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as a targeted lightweight checklist — the runner destabilized shells in session 4; `skills/` excluded) + live parity verification with `skills/agent-browser` (login surface slate palette, mobile drawer @390×844, landing hero tokens @1280×720, 404 full panel contract, local side-by-side). Plan validated against the codebase before execution (§5).

---

## 1. Executive Summary

The session-5 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 55/55 unit, 27/27 build pages, 45/45 e2e), and the session-5 diff (the 404 rebuild, the trap-6 slate pin, the corrected auth.spec assertions) matches the documented design. The live parity sweep this session re-confirmed every pinned surface byte-identical **except one value inside the fix session 5 itself shipped**: the slate scale pinned in `@theme` to make computed colors deterministic contains a one-hex-digit transcription error at `slate-900`.

- **F1 (S1, MEDIUM — a parity gap introduced by the session-5 trap-6 fix):** `--color-slate-900` is pinned as `#0f172e`, but the reference's v3 slate-900 is `#0f172a` (live-measured this session: the reference's login `h1` (text-slate-900) and Sign In button (`bg-slate-900`) both compute to `rgb(15, 23, 42)`; the clone renders `rgb(15, 23, 46)` on both). The comment in `globals.css` says "pinned to the reference's exact sRGB values (v3 hex)" — the intent is right, one digit is not.
- **F2 (S2, LOW):** `docs/session_6.md` (as pulled) is a raw process transcript of session 5 — the standing session-log finding; replaced at wrap-up with the proper session-6 log.
- **F3 (S3, carried, accepted):** the two dev-only transitive advisories (`braces` via the eslint chain, `deepmerge-ts` via the Prisma CLI chain) — re-verified; the session-2 accepted-risk stance stands.

F1 is fixed TDD-style this session: the auth-shell parity contract (`tests/e2e/login-parity.spec.ts`) gains a computed-color test pinning slate-900 on the two visible elements that use it (the h1 and the Sign In button — live-measured values), which goes RED first, then the one-character hex fix makes it green.

---

## 2. Findings Register

| ID | Severity | Category | Finding | Evidence |
|----|----------|----------|---------|----------|
| F1 / S1 | **MEDIUM** | Parity gap (session-5 regression in the trap-6 pin) | `src/app/globals.css:72` pins `--color-slate-900: #0f172e`; the true v3/reference value is `#0f172a`. Visible divergence on the auth shell: the login `h1` (`text-slate-900`) and the Sign In button (`bg-slate-900`) render `rgb(15, 23, 46)` instead of the reference's `rgb(15, 23, 42)`. All nine other slate pins verified correct this session (50/200/300 live-measured on the 404 panel + e2e-pinned; 400/500/600 live-measured on the login form; 700/800 e2e-pinned; 100 unused as a class and matches v3). | agent-browser @1280×720: live `h1` color `rgb(15, 23, 42)`, live Sign In button bg `rgb(15, 23, 42)`; local `h1` color `rgb(15, 23, 46)`, local button bg `rgb(15, 23, 46)`. Tailwind v3 palette: slate-900 = `#0f172a`. |
| F2 / S2 | LOW | Doc structure | `docs/session_6.md` (pulled at `ca7e0e9`) is a raw English process transcript of session 5, not a session-6 log — same class as session 4's F4 and session 5's F2. | Read of `docs/session_6.md`. |
| F3 / S3 | MEDIUM (carried, accepted) | Supply chain (dev-only) | `braces ≤3.0.3` (eslint chain) + `deepmerge-ts <8` (Prisma CLI chain) — dev-only transitive; no runtime exposure; no upstream fix exists. | `bun audit` this session: exactly the two documented advisories; session-2/3/4/5 rationale re-verified unchanged. |
| F4 | — | Verified conforming (no action) | Baseline gate green (lint ✓ · tsc ✓ · unit 55/55 · build 27/27 pages ✓ · e2e 45/45 ✓). Invariants hold: `content.ts` client-safe; zero client `data.ts` imports; `allowedDevOrigins` present; scripts inventory = exactly `with-repo-db.ts`; no `console.log`/TODO/`any` in `src/`; secret scan clean; `.env` correct (`DATABASE_URL="file:../db/custom.db"`); repo DB seeded (8/3/12/4/1). Session-5 diff re-reviewed: `NotFoundBody.tsx` (clean client island — `useSyncExternalStore` with the `""` server snapshot), the rewritten `not-found.tsx` (default export only), the slate pin block, the corrected `auth.spec.ts` 404 assertions — all match the documented design. Live parity byte-identical on every OTHER measured surface: mobile drawer (fixed inset-0 z-60 cream `rgb(250,248,245)`, 5 links 48px Cormorant Garamond −1.2px `rgb(26,26,26)` weight 400 line-height 48px, CTA wrapper `mt-10` 40px, no scroll lock), login font context (h1 default sans stack, `normal` features, `auto` smoothing), login slate-400/500/600 values (icons `rgb(148,163,184)`, prose `rgb(100,116,139)`, placeholder `rgb(71,85,105)`, input border `rgb(226,232,240)`, input bg `rgba(248,250,252,0.5)`), landing hero tokens (h1 102.4px Cormorant −2.56px, body cream `rgb(250,248,245)`/ink `rgb(26,26,26)`), the 404 panel end-to-end (bg `rgb(248,250,252)`, pad 24px, h1 72px/300/`rgb(203,213,225)`/Cormorant, path-interpolated message, white/bordered/rounded-8px Go Home button — local == live on every value). | This session's audit + agent-browser measurements (both sides). |

**Explicitly out of scope (per instructions):** the `skills/` folder is excluded from code checking, testing, and compilation (honored by `eslint.config.mjs` ignores + `tsconfig.json` exclude + test-dir seams).

---

## 3. Root-Cause Analysis

**F1 (the one-digit pin error).** Session 5's trap-6 fix pinned the entire slate scale 50–900 to sRGB hex in one `@theme` block. Nine of the ten values were transcribed correctly; `slate-900` was not. The error survived because:

1. **The 404 surface (the spec that motivated the pin) doesn't use slate-900** — its classes stop at slate-800, so `not-found-parity.spec.ts` passes regardless of the slate-900 value.
2. **The auth-shell parity spec pins fonts, not colors** — `login-parity.spec.ts` was written in session 3 to close the font-context gap; its scope deliberately didn't include computed colors (the trap-6 report even says so: "The auth shell (`/login`, `text-slate-*`) had never tripped this because its parity spec pins fonts, not colors"). When session 5 later pinned the slate scale specifically so computed-color assertions WOULD be deterministic, the login surface itself — the only surface with visible `slate-900` elements — never got the matching color assertions.
3. **The divergence is sub-perceptual** (4/255 in the blue channel): every screenshot re-capture passed visual review, as it necessarily would.

The lesson generalizes the session-5 one: **a pin is only as good as its verification — every pinned value needs a test that reads it back**, or transcription errors live in the "protected" layer itself. The fix therefore adds the missing read-back contract, not just the corrected digit.

**F2 (transcript).** The prior session committed its working transcript as `session_6.md` (the established hand-off convention — sessions 4 and 5 did the same and replaced theirs at wrap-up). Same treatment here.

---

## 4. Remediation Design

### 4.1 F1 — the read-back contract, then the corrected digit (TDD)

**RED — extend `tests/e2e/login-parity.spec.ts`** with a third test, `the auth shell's slate-900 surfaces compute to the reference's exact sRGB`, pinning the live-measured values:

- h1 (`text-slate-900`): `color` = `rgb(15, 23, 42)`
- Sign In button (`bg-slate-900`): `backgroundColor` = `rgb(15, 23, 42)`
- (Both elements' font assertions already covered by the two existing tests.)

Expected RED state: both color assertions fail with `rgb(15, 23, 46)` (the bad pin) — the two pre-existing tests stay green.

**GREEN — one character in `src/app/globals.css`:** `--color-slate-900: #0f172e` → `--color-slate-900: #0f172a`, and tighten the block comment to note the read-back contract.

**Why this design (validated):** the login surface is the only surface with visible slate-900 elements (the h1 + the Sign In button), the values were live-measured this session on the reference, and the spec file is the documented home of the auth-shell parity contract. No other surface needs new assertions — the 404's slate values are already pinned by `not-found-parity.spec.ts`, and the remaining slate classes on the login form (400/500/600/200/50) were verified correct this session against live values (their pins match; adding read-backs for every one of them is optional hardening this plan deliberately does not do — the erroneous one was 900, and the sweep proved the rest correct against the live reference).

### 4.2 F2 — session log

Replace `docs/session_6.md`'s transcript content with the proper session-6 log at wrap-up (same format as `docs/session_4.md` / `docs/session_5.md`).

### 4.3 F3 — carried advisories

Re-verified this session; no upstream fix exists. No action; the register documents the stance.

### 4.4 Documentation alignment (post-fix)

- `docs/Tailwind-V4-Validation-Report.md`: append a session-6 correction note to the trap-6 appendix (the pin's slate-900 digit; the read-back lesson).
- `beauty-salon_SKILL.md`: version bump v1.3.0 → v1.3.1; project_state note; Appendix B (e2e 45 → 46); Appendix C session-6 row.
- `README.md`: testing-table e2e count 45 → 46; tests badge 100 → 101.
- `AGENTS.md`: testing conventions — the login-parity contract description gains "fonts AND the slate-900 read-back" wording.
- `CLAUDE.md`: testing counts (46 e2e / 101 total).
- `Project_Architecture_Document.md`: §7 test inventory (46 e2e, 101 total) + session-6 verification ledger row.
- `.env.example`: re-verify truthful (no env change this session — expected unchanged).

### 4.5 Screenshots

Re-capture the dev-server screenshots on the remediated build (the login capture's h1/button colors change by the corrected digit — sub-perceptual but the capture should reflect the remediated state; the rest are expected to re-render byte-identical or near-identical). VLM-verify the login capture + the mobile-menu capture (the two most parity-critical).

---

## 5. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| The bad pin is the only occurrence of the wrong hex | `rg '0f172e'` across tracked code/docs → exactly `src/app/globals.css:72` | ✓ |
| The reference's slate-900 is `#0f172a` | Live-measured this session: reference login h1 + Sign In button both `rgb(15, 23, 42)` = `#0f172a`; Tailwind v3's documented slate-900 | ✓ |
| The login h1 + Sign In button are the only visible slate-900 elements | Grep `slate-900` in `src/` → `login/page.tsx:41` (`text-slate-900` on h1), `LoginForm.tsx:156` (`bg-slate-900` on the Sign In button); no other surface uses the class | ✓ |
| The nine other slate pins are correct | Live-measured this session: 50 `rgb(248,250,252)`, 200 `rgb(226,232,240)`, 400 `rgb(148,163,184)`, 500 `rgb(100,116,139)`, 600 `rgb(71,85,105)` (placeholder) + e2e-pinned 300/600/700/800 passing; 100 unused as a class, matches v3 | ✓ |
| Extending login-parity.spec.ts won't break vitest | `vitest.config.ts` matches `*.test.ts` only; the file is `tests/e2e/*.spec.ts` | ✓ |
| The new assertions fail pre-fix and pass post-fix | Current computed value (measured on the dev server this session): `rgb(15, 23, 46)` on both elements → RED against the pinned `rgb(15, 23, 42)` | ✓ |
| Spec-count math | 55 unit (unchanged) + 45 e2e + 1 new = **46 e2e**, **101 total** | ✓ |
| The slate block comment claims live-measured pinning | Read of `globals.css` — the comment says "pinned to the reference's exact sRGB values (v3 hex)"; the fix makes that true for all ten values | ✓ |

---

## 6. ToDo List (execution order, TDD)

- [x] **T1.** RED — extend `tests/e2e/login-parity.spec.ts` with the slate-900 read-back test; build + run the file: expect the new test red on both color assertions (`rgb(15, 23, 46)`), the two pre-existing tests green. *(Executed exactly as predicted: 1 failed on the h1 color assertion, 2 pre-existing passed.)*
- [x] **T2.** GREEN — correct `--color-slate-900` to `#0f172a` in `src/app/globals.css`; re-run the spec file: 3/3 green. *(One character + the read-back note in the block comment; rebuild + rerun: 3/3.)*
- [x] **T3.** Full gate: `lint ✓ · typecheck ✓ · unit 55/55 ✓ · build 27/27 pages ✓ · e2e 46/46 ✓` (all pre-existing contracts untouched). *(Executed: 101 total, exactly as planned.)*
- [x] **T4.** Re-capture the dev-server screenshots on the remediated build; VLM-verify the login + mobile-menu captures. *(All 15 captured; mobile-menu 26124B — byte-identical size to the session-2/3/4/5 verified captures; contact also VLM-checked — the "missing hours" was the viewport fold, hours verified identical in the DOM on both sides.)*
- [x] **T5.** Documentation aligned: trap log correction note, SKILL v1.3.1, README/AGENTS/CLAUDE/PAD counts, `.env.example` re-verified. *(All applied; `.env.example` unchanged — truthful.)*
- [x] **T6.** Replace `docs/session_6.md` with the proper session log; append the worklog record (Task ID 9); mark this plan's ToDo results. *(Done.)*
- [ ] **T7.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed: change-set scan clean (no key material, no tracked env/db/key files); committed as one atomic commit `205e437`; fingerprint verified `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (matches the session-1/2/3/4/5 record); dry-run clean (`ca7e0e9..205e437` fast-forward, remote untouched); real push exit 0 with the wrapper's own remote verification `refs/heads/main @ 205e437 == local HEAD` + tracking-ref sync; operator key shredded.)*

## 7. Acceptance Criteria (definition of done)

1. The login h1 and Sign In button compute to `rgb(15, 23, 42)` — identical to the live reference — and the values are pinned by `tests/e2e/login-parity.spec.ts` (the read-back contract).
2. Full gate green: lint · typecheck · unit 55/55 · build 27/27 · e2e **46/46** (101 total) — no pre-existing assertion weakened.
3. Screenshots re-captured on the remediated build; critical captures VLM-verified.
4. Docs aligned (README/AGENTS/CLAUDE/PAD/SKILL v1.3.1/trap-log note); `.env.example` truthful.
5. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 8. Rollback

Revert the commit: restore the hex in `globals.css` (`#0f172e`), remove the new login-parity test, revert the doc alignments. No schema, data, API, or infrastructure change is involved.

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| Slate-900 pin corrected | `src/app/globals.css` (one character + comment) |
| Slate-900 read-back contract | `tests/e2e/login-parity.spec.ts` (one new test) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.3.1), `docs/Tailwind-V4-Validation-Report.md` |
| This plan + session log + worklog | `docs/remediation-plan-session-6.md`, `docs/session_6.md`, `worklog.md` |
