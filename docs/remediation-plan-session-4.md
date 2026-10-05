# Remediation Plan — Session 4 (Hygiene Audit: Dead Scaffold Scripts & Phantom Env Var)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `af7b800` (session-3 font fix `a2793d7` + session log)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (5-phase pipeline + `checklist_runner.py`, `skills/` excluded) + live parity re-verification with `skills/agent-browser` (login → landing, mobile drawer computed styles @390×844, login font chain, landing hero tokens @1280×720, services content, drawer tap behavior). Plan validated against the codebase before execution (§5).

---

## 1. Executive Summary

The session-3 release re-validates **fully green** on every automated gate: ESLint clean, `tsc --noEmit` clean, 47/47 Vitest unit tests, 27-route production build, 42/42 Playwright e2e specs. Live parity was re-measured this session and remains **byte-identical** on every pinned surface: the mobile drawer (the Tailwind v4 trap-4 contract), the login auth-shell font context (session-3's fix), the landing hero tokens, the eight service names, and the drawer's tap-to-close-and-navigate behavior. No visual or behavioral regression exists — **no parity remediation is required**.

The audit instead surfaced **two real hygiene findings the previous sessions missed**:

- **F1 (S1, MEDIUM):** 14 of the 15 files in `scripts/` are dead relics of the **pre-clone scaffold** (the old project-management app): they query Prisma models (`Goal`, `Task`, `ActivityLog`) that no longer exist in the current schema — they would crash if ever run — or they probe the OLD app's parity. They are referenced by nothing except one stale line in `docs/DEPLOYMENT.md`. This violates the repo's own standard ("No placeholder values; no dead code; no speculative configuration" — CLAUDE.md) and it also falsifies the session-3 audit note "exactly two `new PrismaClient()` sites" (the scripts add two more, both dead).
- **F2 (S5, MEDIUM-LOW):** `NEXT_PUBLIC_SITE_URL` is documented in `.env.example`, `README.md`, `CLAUDE.md`, and `docs/DEPLOYMENT.md` (which over-claims it feeds "sitemap.xml and robots.txt" — neither file exists), but **no code reads it**. A documented-but-inert variable means `.env.example` does not match the codebase.

Both are fixed TDD-style this session. Two carried items round out the register (the dependency advisories — re-verified, stance unchanged — and the transcript-style `docs/session_4.md`, replaced at wrap-up with the proper session log).

---

## 2. Findings Register

| ID | Severity | Category | Finding | Evidence |
|----|----------|----------|---------|----------|
| F1 / S1 | **MEDIUM** | Dead code (scaffold relics) | 14 stale scripts in `scripts/`: `check-db-state.mjs`, `wizard-cleanup.mjs`, `capture-screenshots.mjs`, `capture-all.sh`, `capture-screens.sh`, `capture-wizard.sh`, `paired-probe-v214.mjs`, `paired-probe.sh`, `par-compare.sh`, `par-probe.sh`, `par-probe2.sh`, `par-probe3.sh`, `smoke-test.sh`, `vlm-sanity.mjs`. Ten reference the retired schema (`prisma.goal`, `prisma.task`, `prisma.activityLog` — current schema: Service/Stylist/GalleryItem/Testimonial/Appointment/NewsletterSubscriber/User); four are old-app capture/probe tools. Only `scripts/with-repo-db.ts` (session 2) is live. | `grep` reference map: zero callers outside the scripts themselves and `docs/DEPLOYMENT.md:92`; all 14 last touched at pre-clone commit `5384a0c "add tests"`; `check-db-state.mjs` counts `goal/task/activityLog`; `wizard-cleanup.mjs` deletes a `goal` row. |
| F2 / S5 | **MEDIUM-LOW** | Config/doc integrity | `NEXT_PUBLIC_SITE_URL` documented in 4 places but read by nothing: no `metadataBase` in `src/app/layout.tsx`, no sitemap/robots files, zero `src/` references. `docs/DEPLOYMENT.md:37` additionally claims it feeds "sitemap.xml, and robots.txt" — neither exists. | `grep -rn "SITE_URL|metadataBase" src/ next.config.ts` → no matches; `ls src/app | grep sitemap/robots` → none. |
| F3 / S2 | LOW | Doc drift (stale references) | `docs/DEPLOYMENT.md` carries three pre-clone remnants: line 92 `./scripts/smoke-test.sh  # 30 E2E checks` (script is a dead relic of F1); line 37 example `orbital.example.com` + the sitemap/robots claim; line 56 `file:/var/lib/orbital/custom.db` (old app name). | Read of `docs/DEPLOYMENT.md` §3/§4/§6. |
| F4 / S3 | LOW | Doc structure | `docs/session_4.md` (committed at `af7b800`) is a Chinese-language process transcript of session 3, not a session-4 log — duplicate narrative of `docs/session_3.md`. | Read of `docs/session_4.md` vs `docs/session_3.md`. |
| F5 / S4 | MEDIUM (carried, accepted) | Supply chain (dev-only) | `braces ≤3.0.3` (eslint chain) + `deepmerge-ts <8` (Prisma CLI chain) — dev-only transitive; no runtime exposure. | `bun audit` this session: exactly the two documented advisories; session-2/3 rationale (no upstream fix; major-version override rejected) re-verified unchanged. |
| F6 | — | Verified conforming (no action) | Baseline gate green (lint ✓ · tsc ✓ · unit 47/47 · build 27 routes · e2e 42/42). Invariants hold: `content.ts` client-safe; zero client imports of `data.ts`; `allowedDevOrigins` present; test seams correct (vitest `*.test.ts`, playwright `tests/e2e`, `workers: 1`); no `console.log` in `src/`; `.gitignore` covers `.env`, `db/*.db`, logs; ambient-env defense holding (repo `db/custom.db` seeded despite the platform's injected absolute `DATABASE_URL`). Live parity byte-identical: drawer `fixed inset-0 z-[60]` cream `rgb(250,248,245)`, container `flex-1 flex flex-col justify-center px-8 md:px-20 gap-2` gap **8px**, 5 links 48px Cormorant −1.2px `rgb(26,26,26)`, CTA gap **48px**, no scroll lock, tap closes+navigates; `/login` whole chain = default sans stack, `normal` features, `auto` smoothing (24px/700/−0.6px at mobile width, matching live at the same viewport); landing body `rgb(250,248,245)`/`rgb(26,26,26)`, h1 Cormorant 102.4px/400/−2.56px, fixed 80px transparent header; 8/8 service names live == local. | This session's audit + agent-browser measurements (§1). |

**Explicitly out of scope (per instructions):** the `skills/` folder is excluded from code checking, testing, and compilation (already honored by `eslint.config.mjs` ignores + `tsconfig.json` exclude + test-dir seams; `docs/skills-inventory.md` references are skills-folder content, not code).

---

## 3. Root-Cause Analysis

**F1 (dead scripts).** Session 1 rebuilt the app **in place** on top of the old scaffold repo (commit `acb9532` "rebuild as the Maison Luminaire clone"): `src/`, `prisma/`, `tests/`, and the root docs were replaced wholesale, but `scripts/` was only *added to* (`with-repo-db.ts`, session 2) — the scaffold's 14 utility scripts were never re-examined because nothing imports them and every automated gate ignores un-referenced files. The session-2/3 audits' "no dead code" checks focused on `src/`. The finding matters for three reasons: (a) ten of the scripts dereference Prisma models that no longer exist, so a contributor following `docs/DEPLOYMENT.md` §6 would hit a runtime crash; (b) they keep the old app's `goal/task/activityLog` vocabulary alive in a repo whose docs never mention it; (c) the repo's own quality standard forbids dead code.

**F2 (phantom env var).** `.env.example` was authored in session 1 from the repo's documentation template; `NEXT_PUBLIC_SITE_URL` was carried over from the scaffold's convention and documented in four places, but the clone's `layout.tsx` metadata was never given a `metadataBase` (Next.js only warns, never fails, when it is absent), and no sitemap/robots files were ever built (the reference SPA has none). The result is a documented variable with zero effect — exactly the "speculative configuration" the conventions forbid, and it makes `.env.example` (a deliverable of this session) dishonest.

**Design constraints (validated against the codebase):**

1. Deleting the 14 scripts cannot break any gate — nothing references them (§2 F1 evidence; re-verified: the only cross-reference is `docs/DEPLOYMENT.md:92`, fixed together).
2. `with-repo-db.ts` is load-bearing (`dev`/`build`/`start`/`db:*` in `package.json`) and stays untouched.
3. For F2, the minimal honest fix that keeps the documented variable truthful is to wire it where it is *meant* to go: `metadataBase` in the root layout's `metadata` export (canonical-URL resolution for metadata — Next.js's documented use for exactly this variable). Adding sitemap/robots files would be new features the reference does not have — rejected (parity outranks features).
4. The F2 fix must be metadata-only: no visual, behavioral, or hydration impact (parity remains byte-identical).
5. `new URL(...)` throws on malformed input — the helper must sanitize with a localhost fallback so a bad env value cannot 500 the app at build/boot.

---

## 4. Remediation Design

### 4.1 F1 — remove the scaffold relics + pin a hygiene contract (TDD)

**RED** — new `tests/repo-hygiene.test.ts` (3 specs, pure `node:fs` scans over the repo, `skills/` excluded by design because the scan roots are `scripts/`, `src/`, `prisma/`, `tests/` + `docs/*.md`):

1. `live code never references the retired scaffold models` — scan `scripts/**`, `src/**`, `prisma/*.ts`, `tests/**` for the old-model delegate accessors `(prisma|db|p)\.(goal|task|activityLog)\b` (case-insensitive) and assert zero matches. → **fails now** (the stale scripts match).
2. `every script path referenced by the docs exists` — scan `docs/*.md` for `./scripts/<name>` references and assert each file exists. → passes now; **turns red the moment F1's deletion lands** unless the doc is fixed (this is the enforcement hook for F3).
3. `every script referenced by package.json exists` — parse `package.json`'s script bodies for `scripts/<name>` references and assert existence. → passes now; permanent guard.

**GREEN** — delete the 14 relic files (list in §2 F1); `scripts/` retains exactly `with-repo-db.ts`.

### 4.2 F3 — `docs/DEPLOYMENT.md` alignment

- §6 verification checklist: drop the `./scripts/smoke-test.sh` line (its "30 E2E checks" role is served by `bun run test:e2e` on the adjacent line).
- §3 env table: `NEXT_PUBLIC_SITE_URL` description → "Canonical origin — resolves the app's `metadataBase` for metadata URLs" (drop the sitemap/robots claim); example `https://orbital.example.com` → `https://maison-luminaire.example.com`.
- §4 absolute-path example: `file:/var/lib/orbital/custom.db` → `file:/var/lib/maison-luminaire/custom.db`.

### 4.3 F2 — make `NEXT_PUBLIC_SITE_URL` real (TDD)

**RED** — new unit test file `tests/site-url.test.ts` for a new pure helper `src/lib/site.ts`:

```ts
export function siteUrl(): string
```

- returns `http://localhost:3000` when the env var is unset/empty
- returns the env value when it is a well-formed absolute URL
- falls back to `http://localhost:3000` when the env value is malformed (must never throw — a bad env var cannot 500 the app)

**GREEN** — implement the helper; wire `metadataBase: new URL(siteUrl())` into `src/app/layout.tsx`'s `metadata` export. No other code path changes; server-side only, metadata-only.

### 4.4 F4 — session log

Replace `docs/session_4.md`'s transcript content with the proper session-4 log at wrap-up (same format as `docs/session_3.md`).

### 4.5 F5 — carried advisories

Re-verified this session; no upstream fix exists (braces latest 3.0.3; deepmerge-ts 8.x remains a Prisma-CLI-internal major override). No action; the register documents the stance.

### 4.6 Documentation alignment (post-fix)

- `README.md`: unit test count 47 → 55 (hygiene + site-url specs), total badge 89 → 97; env table `NEXT_PUBLIC_SITE_URL` → "resolves `metadataBase`".
- `AGENTS.md`: commands table unchanged (no deleted script was documented); note the scripts-folder inventory (`scripts/with-repo-db.ts` is the only dev-time script) under Environment.
- `CLAUDE.md`: testing table counts (55 unit / 97 total); env var purpose line; `src/lib` map gains `site`.
- `Project_Architecture_Document.md`: §7 test inventory (55 unit, 97 total) + verification ledger row.
- `beauty-salon_SKILL.md`: version bump v1.1.0 → v1.2.0; scripts inventory; test-count appendix.
- `.env.example`: `NEXT_PUBLIC_SITE_URL` comment → "resolves the app's metadataBase (canonical metadata URLs)".

---

## 5. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| The 14 scripts have no live callers | Full-repo grep (all extensions, `skills/` excluded): only self-references + `docs/DEPLOYMENT.md:92` | ✓ |
| `with-repo-db.ts` is the only referenced script | `package.json` references `scripts/with-repo-db.ts` ×7; nothing references the other 14 | ✓ |
| Hygiene test can read the repo from vitest | Existing `tests/db-path.test.ts` already does `node:fs` repo-root scans (precedent) | ✓ |
| `tests/repo-hygiene.test.ts` is picked up by vitest, not playwright | `vitest.config.ts` includes `tests/**/*.test.ts`; playwright `testDir: ./tests/e2e` | ✓ |
| Old-model accessor regex won't false-positive on live code | `src/lib/data.ts`, `prisma/seed.ts` etc. reference only current models; `goal|task|activityLog` appear nowhere in `src/` (verified by grep) | ✓ |
| `layout.tsx` metadata has no `metadataBase` today | Read of `src/app/layout.tsx` (§3) | ✓ |
| `metadataBase` accepts a `URL` object | Next.js `Metadata` type — standard field; no page-level metadata overrides it (each page exports only `title` via the template) | ✓ |
| New `src/lib/site.ts` stays client-safe (no node imports needed — `process.env` works in both) | Server-only usage (layout) — no client import introduced | ✓ |
| Unit test for `siteUrl` can control the env var | Vitest `vi.stubEnv` / direct `process.env` mutation pattern already used by `tests/db-path.test.ts` | ✓ |
| Doc scan finds `./scripts/…` references | `docs/DEPLOYMENT.md:92` is the only one (grep) | ✓ |
| Spec-count math | 47 unit + 3 hygiene specs + 5 site-url specs = **55 unit**; 55 + 42 e2e = **97 total** (siteUrl earned 5 specs — unset, blank, well-formed, malformed, non-absolute) | ✓ |

---

## 6. ToDo List (execution order, TDD)

- [x] **T1.** RED — wrote `tests/repo-hygiene.test.ts` (3 specs) + `tests/site-url.test.ts` (5 specs); ran the unit layer; confirmed the exact predicted failures: retired-models spec failed (the stale scripts matched); site-url failed on the missing module; doc/pkg-script guards green. *(Two iterations during GREEN-shaping, both test-side: the retired-model regex self-matched this test file's own comment examples — reworded; the doc-scan needed a historical-record exclusion — session logs and remediation plans legitimately name removed artifacts — plus removal of an over-constrained refs>0 sanity assertion, since operational docs referencing zero scripts is a valid state.)*
- [x] **T2.** GREEN (F1+F3) — deleted the 14 relic scripts (`scripts/` now holds exactly `with-repo-db.ts`); fixed `docs/DEPLOYMENT.md` §1 (ORBITAL→Maison Luminaire), §1 API count (16→6), §3 env description (drop sitemap/robots claim), §4 example path, §6 verification checklist (smoke-test line dropped). Hygiene specs green.
- [x] **T3.** GREEN (F2) — implemented `src/lib/site.ts` (`siteUrl()`: trim, absolute http/https check via `URL` parse, origin return, never throws); wired `metadataBase: new URL(siteUrl())` into `src/app/layout.tsx`; site-url specs 5/5 green. Verified the live reference emits no canonical/og tags, so the invisible wiring is the parity-preserving design (no observable output change).
- [x] **T4.** Full gate: `lint ✓ · typecheck ✓ · unit 55/55 ✓ · build 27 routes ✓ · e2e 42/42 ✓`; no sitemap/robots files appeared.
- [x] **T5.** Re-captured the 14 dev-server screenshots on the remediated build → `docs/screenshots/` (mobile-menu capture 26124B — byte-identical size to the session-2/3 verified capture); VLM-verified the login capture (centered card, sans heading, no glitches) and the mobile-menu capture (cream overlay, giant serif links, CTA separation, close X); `.env.example` updated (SITE_URL comment + postgres example db name remnant) and verified truthful against the codebase.
- [x] **T6.** Documentation alignment: README (55/97, env table, testing table), AGENTS.md (Environment: SITE_URL + scripts inventory + hygiene guard), CLAUDE.md (55, env purpose, lib map), PAD (§7 inventory + session-4 ledger), `beauty-salon_SKILL.md` v1.2.0 (project_state, checklist counts, Appendix B rows, Appendix C session-4 row; also fixed a session-3 miss — checklist said "40 specs" instead of 42).
- [x] **T7.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed: change-set scan clean (no key material, no tracked env/db/key); committed as one atomic commit; fingerprint verified `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (matches the session-1/2/3 record); dry-run clean (`af7b800..f4e2cd6` fast-forward); real push exit 0 with the wrapper's own remote verification `refs/heads/main @ f4e2cd6 == local HEAD` + tracking-ref sync; operator key shredded.)*

## 7. Acceptance Criteria (definition of done)

1. `scripts/` contains exactly `with-repo-db.ts`; no live code references `Goal`/`Task`/`ActivityLog`; pinned by `tests/repo-hygiene.test.ts`.
2. `docs/DEPLOYMENT.md` references only existing scripts; no `orbital` remnants; env table matches reality.
3. `NEXT_PUBLIC_SITE_URL` resolves the app's `metadataBase` (localhost fallback, malformed-input fallback, never throws); pinned by `tests/site-url.test.ts`; `.env.example` truthful.
4. Full gate green with the expanded suite; e2e 42/42 untouched (parity contracts unmodified — visual output unchanged).
5. Docs, screenshots, SKILL v1.2.0, proper `docs/session_4.md`, and worklog reflect the remediated codebase.
6. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 8. Rollback

Revert the commit: restore the 14 scripts (`git checkout <prev> -- scripts/`), remove `tests/repo-hygiene.test.ts` + `tests/site-url.test.ts` + `src/lib/site.ts`, drop the `metadataBase` line from `layout.tsx`, revert the four doc files + `.env.example`. No schema, data, API, or infrastructure change is involved.

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| Scaffold relic removal | `scripts/` (−14 files; `with-repo-db.ts` retained) |
| Repo hygiene contract | `tests/repo-hygiene.test.ts` (new) |
| Canonical metadata base | `src/lib/site.ts` (new), `src/app/layout.tsx` (+1 line) |
| siteUrl contract | `tests/site-url.test.ts` (new) |
| Doc alignment | `docs/DEPLOYMENT.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md`, `.env.example` |
| Screenshots re-capture | `docs/screenshots/*.png` (14) |
| This plan + session log | `docs/remediation-plan-session-4.md`, `docs/session_4.md`, `worklog.md` |
