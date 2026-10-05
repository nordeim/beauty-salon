# Remediation Plan — Session 2 (Post-Release Audit & Environment-Parity Fix)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `d593089` (app commit `acb9532` + session logs)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (5-phase pipeline) + `skills/code-quality-standards` six-axis lens; parity re-verified against the live reference app with `skills/agent-browser`; plan validated against the codebase before execution (§5).

---

## 1. Executive Summary

The session-1 release (`acb9532`) re-validates **fully green** on every automated gate: ESLint clean, `tsc --noEmit` clean, 33/33 Vitest unit tests, 27-route production build, 40/40 Playwright e2e specs (including the mobile-navigation computed-style parity contract). The live reference app was re-measured during this audit and still matches the pinned tokens byte-for-byte.

The audit surfaced **one HIGH-severity functional finding** (F1): in this workspace's environment, a platform-injected ambient `DATABASE_URL` environment variable (an absolute path pointing *outside* the repository) silently overrides the repo's `.env` for every dev-time flow that does not explicitly set the variable. The consequence: `bun run dev`, `db:push`, `db:seed`, and `build`-time SSG all read/write a database at `<workspace>/db/custom.db` instead of the required `<repo>/db/custom.db` — violating both the user's explicit requirement ("the `db/` folder should be placed at the root folder of the beauty-salon repo codebase") and the documented contract in `.env.example` / `AGENTS.md`.

Two lower-severity findings (dev-only transitive dependency advisories; one stale in-code comment) round out the plan, followed by the documentation, screenshot, skill-distillation, and push tasks requested for this session.

---

## 2. Findings Register

| ID | Severity | Category | Finding | Evidence |
|----|----------|----------|---------|----------|
| F1 | **HIGH** | Environment / DB contract | Ambient absolute `DATABASE_URL=file:/home/z/my-project/db/custom.db` is injected into every shell by the platform. Process env beats `.env` files, so `dev` / `build` (SSG) / `db:push` / `db:seed` resolve the DB *outside* the repo. `unset` does not persist across shells. | `env \| grep DATABASE_URL` shows the var in every fresh shell; controlled probes: explicit-env CLI push → `repo/db/probe-cli.db` (schema-anchored ✓), ambient-inherited push → `<workspace>/db/custom.db` ✗; e2e unaffected (it pins `DATABASE_URL` explicitly in `playwright.config.ts` webServer env + `global-setup.ts`) |
| F2 | MEDIUM | Supply chain (dev-only) | `bun audit`: `braces ≤3.0.3` (via `eslint-config-next › fast-glob › micromatch`) and `deepmerge-ts <8` (via `prisma › @prisma/config`) — both **devDependency transitive chains**; zero production-runtime exposure (standalone build ships no lint/prisma CLI code). | `bun audit` output, 2026-10-05 |
| F3 | LOW | Doc-in-code drift | `vitest.config.ts` header comment describes the *previous* app's seams ("router, clarify questions, plan sanitizer, check-in mapping") — not this app's (db-path, hours, ics, auth). | Read of `vitest.config.ts:3-6` |
| F4 | INFO | Scanner noise (accepted) | 12-category checklist findings in `playwright.config.ts`: e2e-only `AUTH_SECRET` test constant (never used in production — deliberate, mirrors the explicit-env pattern), SCREAMING_SNAKE module constants (convention), "PRODUCTION" emphasis in a comment. All reviewed and accepted; no action. | `checklist_runner.py` output filtered to non-`skills/` paths: 3 findings |
| F5 | — | Verified conforming (no action) | `.env` already `DATABASE_URL="file:../db/custom.db"` ✓; `db/` at repo root ✓; `vitest.config.ts` + `playwright.config.ts` present, wired, and green (33 unit + 40 e2e) ✓; `.env.example` matches the codebase ✓; root docs (README/AGENTS/CLAUDE/PAD) mutually consistent ✓; no `.env`/`db/*.db`/key files tracked ✓; mobile drawer re-measured on the live app — byte-match with the pinned e2e contract (`fixed inset-0`, `z-60`, `rgb(250,248,245)`, flex column `gap 8px`, 48px Cormorant Garamond, `−1.2px` tracking, `rgb(26,26,26)`) ✓ | This session's audit passes |

**Explicitly out of scope (per instructions):** the `skills/` folder is excluded from code checking, testing, and compilation.

---

## 3. Root-Cause Analysis — F1

Prisma, Next.js, and Bun all follow the standard dotenv precedence: **process environment beats `.env` files**. That is the correct 12-factor behavior for production (an operator must be able to override file config with env vars — `docs/DEPLOYMENT.md` §4 relies on it, and the standalone server keeps that contract unchanged).

The failure mode is specific to *development inside this workspace*: the platform exports `DATABASE_URL` with an **absolute path outside the repo**, so every dev-time entry point that inherits the ambient environment resolves the database to `<workspace>/db/custom.db`. The flows divide cleanly:

| Flow | DB used today (this env) | Why |
|------|--------------------------|-----|
| `bun run dev` | `<workspace>/db/custom.db` ✗ | Next loads `.env` but never overrides an existing process var |
| `bun run db:push` / `db:seed` | `<workspace>/db/custom.db` ✗ | Prisma CLI/client read process env first |
| `bun run build` (SSG reads) | `<workspace>/db/custom.db` ✗ | Same |
| `bun run test:e2e` | `<repo>/db/e2e.db` ✓ | `playwright.config.ts` webServer env + `global-setup.ts` set `DATABASE_URL` **explicitly** for every child process |

The e2e suite is the existence proof of the fix: **explicitly setting the resolved URL in the spawned process's environment wins over the ambient var.** The remediation generalizes exactly that pattern to the dev-time scripts, with one refinement — the explicit value is computed *from the repo's own `.env` file* (the documented source of truth for local development), so the fix cannot drift from the configuration users actually edit.

**Design constraints (validated against the codebase):**

1. The standalone **production runtime must not change semantics** (`src/lib/db.ts` → `resolveProcessDatabaseUrl()` keeps process-env precedence — absolute URLs pass through, as required by `DEPLOYMENT.md` and the e2e webServer, which points at `db/e2e.db` via explicit env).
2. The **e2e infrastructure must remain untouched** (`global-setup.ts` seeds via direct `bun prisma/seed.ts` invocation with its own explicit env; the webServer runs `server.js` directly — neither goes through the wrapped scripts).
3. The fix must preserve the documented PostgreSQL swap (a `postgresql://` URL in `.env` passes through the seam untouched).
4. Fresh checkouts in clean environments (no ambient var) must behave exactly as before — the wrapper becomes a no-op passthrough.

---

## 4. Remediation Design

### 4.1 New seam functions (TDD, in `src/lib/db-path.ts`)

```ts
/** Parse `KEY=value` (or `KEY="value"`) from dotenv content; undefined when absent/commented. */
export function parseDotenvValue(content: string, key: string): string | undefined;

/**
 * Dev-time resolution rule: the repo .env file's DATABASE_URL wins over the
 * ambient process env (platform noise); falls back to process env when the
 * file doesn't define it; then through the existing pure anchor resolution
 * (relative URLs anchor at the repo, absolute/postgres URLs pass through).
 */
export function devDatabaseUrl(input: {
  envFileUrl: string | undefined;
  processUrl: string | undefined;
  anchors: string[];
}): string;
```

`devDatabaseUrl` is pure and fixture-testable, exactly like the existing `resolveDatabaseUrl`. It **does not touch** `resolveProcessDatabaseUrl` (the app-runtime contract).

### 4.2 New wrapper script (`scripts/with-repo-db.ts`)

Reads `<repo>/.env` → `parseDotenvValue(content, "DATABASE_URL")` → `devDatabaseUrl({ envFileUrl, processUrl: process.env.DATABASE_URL, anchors: [repoRoot, cwd] })` → spawns `argv` with `DATABASE_URL` set explicitly in the child env (stdio inherited, exit code propagated). ~40 lines, no dependencies.

### 4.3 Script rewiring (`package.json`)

| Script | Before | After |
|--------|--------|-------|
| `dev` | `next dev -p 3000 2>&1 \| tee dev.log` | `bun scripts/with-repo-db.ts next dev -p 3000 2>&1 \| tee dev.log` |
| `build` | `next build && cp …` | `bun scripts/with-repo-db.ts next build && cp …` (the `&&`-chained copies run unwrapped — they don't touch the DB) |
| `start` | `NODE_ENV=production bun .next/standalone/server.js 2>&1 \| tee server.log` | `NODE_ENV=production bun scripts/with-repo-db.ts bun .next/standalone/server.js 2>&1 \| tee server.log` — in production (no `.env` shipped) the wrapper falls back to process env: **identical 12-factor behavior**; locally it pins the repo DB |
| `db:push` | `prisma db push --accept-data-loss` | `bun scripts/with-repo-db.ts prisma db push --accept-data-loss` |
| `db:seed` | `bun prisma/seed.ts` | `bun scripts/with-repo-db.ts bun prisma/seed.ts` |
| `db:migrate` | `prisma migrate dev` | `bun scripts/with-repo-db.ts prisma migrate dev` |
| `db:reset` | `prisma migrate reset` | `bun scripts/with-repo-db.ts prisma migrate reset` |
| `db:generate`, `lint`, `typecheck`, `test`, `test:e2e` | — | **unchanged** (no DB access / already explicit) |

### 4.4 F2 — dependency advisories (dev-only)

Attempt an in-range `bun update` (no `--latest`, no semver-breaking moves); re-run `bun audit` + the full gate. If either advisory has no in-range resolution, record it as an accepted dev-only risk here (zero runtime exposure — the standalone output ships neither chain).

**Outcome (executed 2026-10-05):** `bun update` resolved 62 packages forward but resolved **neither advisory** — the parents (`eslint-config-next` ^16.1.1, `prisma` ^6.11.1) still pin the vulnerable transitive versions. An `overrides` pin for `braces` was attempted and **reverted**: the registry's latest `braces` is 3.0.3 — *no patched release exists upstream* (`bun pm view braces` → latest 3.0.3), so there is nothing to pin to. Both advisories are therefore **accepted, documented dev-only risks**:

- `braces ≤3.0.3` (GHSA-vfj7-8cjw-p6xm) — dev toolchain only (`eslint-config-next › fast-glob › micromatch`); the vulnerable code path requires deeply nested glob patterns, and the inputs are repo-controlled lint globs, not attacker-controlled. No patched upstream version exists; re-check when braces publishes a fix.
- `deepmerge-ts <8` (GHSA-ggr8-5vv4-36mx) — Prisma CLI config merging only (`prisma › @prisma/config`); inputs are the developer's own `prisma.config.ts`. Forcing 8.x would override Prisma CLI internals across a major version — rejected.

Neither chain ships in the production standalone build (`bun run build` output contains no eslint/prisma CLI code). The `bun update` range churn in `package.json` was reverted (`git checkout -- package.json bun.lock`) to keep the change set minimal.

### 4.5 F3 — comment fix

Rewrite the `vitest.config.ts` header comment to describe this app's unit seams (db-path resolution, opening-hours model, ICS builder, scrypt/HMAC auth).

### 4.6 Documentation alignment (post-fix)

- `.env.example` + `AGENTS.md` environment note: process env beats `.env`; in sandboxed/managed environments an ambient `DATABASE_URL` can silently relocate the dev database — the wrapped scripts defend against it (repo `.env` wins for dev flows; production keeps env-var precedence).
- `README.md` quick start + testing sections: mention the wrapper only where it changes user-visible behavior (nothing — commands stay identical).
- `Project_Architecture_Document.md`: amend ADR-002 with the wrapper layer (ADR-002b) and the audit finding.
- `CLAUDE.md`: environment-variable table note.

---

## 5. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| `resolveDatabaseUrl` reusable for `devDatabaseUrl` | `src/lib/db-path.ts` exports the pure resolver + `candidateRoots` (module self-anchor works under `bun` scripts — `import.meta` is not bundled there) | ✓ |
| Wrapper must not touch app runtime | `src/lib/db.ts` calls `resolveProcessDatabaseUrl()` only; e2e webServer runs `server.js` directly (not via `start` script) | ✓ |
| e2e `global-setup.ts` unaffected | It invokes `bunx prisma db push` / `bun prisma/seed.ts` directly with explicit env — never through `package.json` scripts | ✓ |
| Only two `new PrismaClient()` sites | `grep -r "new PrismaClient"` → `src/lib/db.ts`, `prisma/seed.ts` (both covered by the design) | ✓ |
| `&&`-chaining in `build` | Bun's script shell parses `&&`; only `next build` is wrapped; the `cp` steps are env-independent | ✓ |
| Vitest picks up new tests | `vitest.config.ts` includes `tests/**/*.test.ts`; new cases go into `tests/db-path.test.ts` | ✓ |
| `db/*.db` still ignored | `.gitignore` pattern `db/*.db` — the relocated `custom.db` stays untracked | ✓ |

---

## 6. ToDo List (execution order, TDD)

- [x] **T1.** RED — add failing unit tests to `tests/db-path.test.ts`: dotenv parser (quoted/unquoted/commented/absent), `devDatabaseUrl` precedence (env-file wins → falls back to process env → default), relative anchoring at repo, absolute + postgres passthrough. *(14 failing tests confirmed before implementation.)*
- [x] **T2.** GREEN — implement `parseDotenvValue` + `devDatabaseUrl` in `src/lib/db-path.ts` (pure functions; no changes to `resolveProcessDatabaseUrl`). *(47/47 unit tests green.)*
- [x] **T3.** Add `scripts/with-repo-db.ts`; rewire `package.json` scripts per §4.3.
- [x] **T4.** Acceptance (F1): `bun run db:push && bun run db:seed` with the ambient var still present → `<repo>/db/custom.db` created + seeded (8/3/12/4/1 rows); `<workspace>/db/` absent; `bun run dev` → `/api/health` = `{"status":"ok","db":true}`; `/services` renders seeded content.
- [x] **T5.** F2: `bun update` (in-range) → neither advisory resolved; braces override attempted and reverted (no patched upstream exists — latest is 3.0.3); both advisories documented as accepted dev-only risks (§4.4 outcome).
- [x] **T6.** F3: `vitest.config.ts` header comment rewritten to this app's seams.
- [x] **T7.** Full gate: `lint ✓ · typecheck ✓ · unit 47/47 ✓ · build 27 routes ✓ (wrapper-resolved, SSG from `<repo>/db/custom.db`) · e2e 40/40 ✓`.
- [x] **T8.** Re-captured all 14 dev-server screenshots into `docs/screenshots/` (fresh run on the repo-level DB; dev log clean — zero hydration warnings).
- [x] **T9.** Documentation alignment per §4.6: `.env.example` (env-precedence note), `README.md` (counts 47/87 badge, wrapper paragraph, env table note), `AGENTS.md` (commands table + ambient-env trap), `CLAUDE.md` (counts + data-layer note), `Project_Architecture_Document.md` (ADR-002b + test inventory 47).
- [x] **T10.** Created `beauty-salon_SKILL.md` via `skills/distill-codebase-skill` + `skills/to-distill-project-into-skill` (six-phase process; 20 sections + 4 appendices; 0 placeholder text; every referenced path verified to exist; test counts cross-checked).
- [x] **T11.** Session-2 record appended to `worklog.md`; committed to `main`; pushed via `docs/ssh_git_wrapper_v3.py` (see §9).

## 7. Acceptance Criteria (definition of done — verified)

1. ✅ `<repo>/db/custom.db` is the single dev database (created + seeded by the wrapped scripts), with no database materializing outside the repo.
2. ✅ Full gate green: lint ✓ · typecheck ✓ · unit 47 ✓ · build 27 routes ✓ · e2e 40/40 ✓.
3. ✅ Mobile-navigation parity specs green (traps 1/2/4 asserted; live reference re-measured this session — byte-match).
4. ✅ `.env.example`, README, AGENTS, CLAUDE, PAD reflect the wrapper + env-precedence behavior.
5. ✅ `docs/screenshots/` refreshed (14 captures); `beauty-salon_SKILL.md` present and validated; committed and pushed to `main`.

## 8. Rollback

The change set is small and additive: revert `package.json` scripts to their pre-wrapper form, delete `scripts/with-repo-db.ts`, remove the two new seam functions + their tests. No schema, data, or application-code migration is involved.

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| db-path seam v2.4 (dotenv parser + dev-time resolution) | `src/lib/db-path.ts`, `tests/db-path.test.ts` (+14 tests) |
| Dev-time DATABASE_URL pinner | `scripts/with-repo-db.ts` (new) |
| Script rewiring | `package.json` |
| Comment fix | `vitest.config.ts` |
| Screenshots re-capture | `docs/screenshots/*.png` (14) |
| Documentation alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `.env.example` |
| Skill distillation | `beauty-salon_SKILL.md` (new) |
| This plan + session log | `docs/remediation-plan-session-2.md`, `worklog.md` |
