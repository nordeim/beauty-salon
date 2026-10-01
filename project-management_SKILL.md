---
name: project-management
description: "ORBITAL — AI project management workspace (Next.js 16 + React 19 + Tailwind CSS 4 + Prisma/SQLite). Complete engineering reference distilled from 43 build/remediation sessions: SPA-with-path-URLs architecture, neumorphic three-tier design system, three-state responsive chrome, hand-rolled cookie auth with rate limiting, AI task planning with degrade-never-fail fallbacks, the SQLite db-path resolution seam (incl. the Next standalone chdir trap), and the full test pyramid (138 Vitest unit + 115 Playwright browser + 30 curl smoke checks)."
version: 1.0.0
last_updated: 2026-09-30
---

# ORBITAL — Project Management Workspace: Complete Engineering Skill

> Distilled from sessions 1–43 (v1.0 → v2.15) of cloning and remediating the
> reference Base44 app as a self-hosted Next.js unit. Every fact below is
> codebase-verified; measured values come from computed-style probes against
> the live reference app (two authenticated browser sessions, 390/768/1440).

## Table of Contents

1. Project Identity & Design Philosophy
2. Tech Stack & Environment
3. Bootstrapping & Configuration
4. The Design System (Code-First, Neumorphic)
5. Component Architecture & Patterns
6. State Management Deep Dive
7. The AI Planning Pipeline
8. Auth & Security Implementation
9. Anti-Patterns & Common Bugs
10. Debugging Guide
11. Pre-Ship Checklist
12. Lessons Learnt & How to Avoid Them
13. Pitfalls to Avoid
14. Best Practices
15. Coding Patterns
16. Coding Anti-Patterns
17. Responsive Breakpoint Reference (the Three-State Chrome)
18. Z-Index Layer Map
19. Color & Token Reference (Complete)
20. The Complete TypeScript Interface Reference

Appendices: A. The Meticulous Approach — B. Quick Reference Card

---

## §1 Project Identity & Design Philosophy

ORBITAL is a faithful, self-hosted clone of the reference Base44
project-management app, rebuilt as ONE deployable Next.js unit. The domain
is deliberately small — Goals → Tasks → TaskUpdates, with People/TeamMembers
for assignment, an ActivityLog that narrates every mutation, and a singleton
WorkspaceSetting. The product promise: describe a goal in natural language,
get a planned/assigned/scheduled task plan from an AI agent, then track it
to done through status check-ins.

Design philosophy, in priority order:

1. **Measured parity over taste.** Every visual token was measured against
   the live reference with computed-style probes (VLM screenshots LIE —
   15+ misreads disproven by measurement across sessions). When the live
   app changes, the clone re-measures and follows (the v2.3 active-tab well
   replaced the v1.7 "color-only" reading).
2. **One deployable unit.** No microservices, no external auth, no Redis —
   SQLite file + cookie sessions + optional LLM SDK. `bun run build`
   produces a standalone server.
3. **Degrade, never fail.** The AI features fall back to deterministic
   outputs when the SDK is down; the app never 500s on an AI outage.
4. **Pure seams, tested.** Routing, sanitization, rate limiting, path
   resolution — all logic that could break silently lives in `src/lib/*.ts`
   with Vitest specs. Route handlers are thin DB wrappers.
5. **SPA with real URLs.** One workspace page, seven path rewrites, zero
   per-view routes. Browser back/forward works via the History API.

## §2 Tech Stack & Environment

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Web framework | Next.js (App Router) | 16.1+ | `output: "standalone"`, `outputFileTracingRoot` pinned |
| UI runtime | React | 19 | Client components explicit via `"use client"` |
| Language | TypeScript | 5 | `strict: true` + `noImplicitAny: false` (sandbox default, intentional) |
| Styling | Tailwind CSS | 4 | CSS-first: tokens in `globals.css` `@theme inline`; `tailwind.config.ts` is shadcn-legacy only |
| Components | shadcn/ui on Radix | — | dialog, sheet, select, popover, radio, toast + custom date-picker |
| State | Zustand | 5 | ONE store; server state via fetch + refresh slices |
| ORM | Prisma | 6 | `db push` (no migrations folder), seed via `bun prisma/seed.ts` |
| Database | SQLite | — | `<repo>/db/custom.db` (gitignored) |
| Auth | Node `crypto` | — | scrypt + HMAC stateless cookie (`orbital_session`, 7-day TTL) |
| AI | z-ai-web-dev-sdk | 0.0.x | Server-side only; deterministic fallbacks |
| Icons | lucide-react | 0.5.x | `square-check-big` for tasks everywhere |
| Unit tests | Vitest | 5 | 138 checks, `src/**/*.test.ts` + `tests/**/*.test.ts` |
| Browser tests | Playwright | 1.63 | 73 checks, `tests/e2e/*.spec.ts`, own port + scratch DB |
| Runtime | Bun (or Node ≥ 20) | 1.3+ | Scripts run from repo root — this matters (see §10) |

Environment contract (`.env`, gitignored; see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | `file:../db/custom.db` — relative URLs resolve against `prisma/` (CLI rule); `src/lib/db-path.ts` implements the same rule at runtime |
| `AUTH_SECRET` | Production | HMAC secret; `openssl rand -hex 32`; insecure dev fallback when unset |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `metadataBase` + `sitemap.xml` origin |

## §3 Bootstrapping & Configuration

```bash
bun install
cp .env.example .env        # DATABASE_URL="file:../db/custom.db"
bun run db:push             # schema → db/custom.db (db push, not migrate)
bun run db:seed             # idempotent demo data (wipes domain tables)
bun run dev                 # :3000 — demo@orbital.app / Demo1234!
```

Production: `bun run build && bun run start` (standalone server; MUST start
from the repo root — `docs/DEPLOYMENT.md` documents the absolute-path
alternative for exotic service managers).

Config files that carry non-obvious weight:

- `next.config.ts` — the seven path rewrites (`/goals`, `/goals/:goalId`,
  `/my-tasks`, `/tasks`, `/activity`, `/team`, `/settings` → `/`) MUST stay
  in sync with `src/lib/router.ts`; `/login` stays excluded. `ignoreBuildErrors`
  is set — `bun run typecheck` is the real type gate.
- `vitest.config.ts` — includes `tests/**/*.test.ts` (the db-path seam)
  and never matches Playwright's `*.spec.ts`.
- `playwright.config.ts` — setup project + storageState (see §15), webServer
  on :3100 with `DATABASE_URL=file:../db/e2e.db`.
- `eslint.config.mjs` — ignores `skills/` (operator catalog, not app code).

## §4 The Design System (Code-First, Neumorphic)

Canvas `#EBE7E2`, raised surfaces `#EEEAE6`, wells `#EBE7E2` (the same
hex as canvas — depth comes only from the shadow pairs). THREE measured
card tiers:

| Tier | Class | Shadow pair | Radius | Used by |
|---|---|---|---|---|
| Standard | `.orb-raised` / `.orb-card` | `-5px -5px 10px 0.78` / `5px 5px 12px 0.27` | 16 | buttons, small UI |
| Deeper | `.orb-row-card` (r14) / `.orb-goal-card` (r16) | `-5px -5px 10px 0.92` / `5px 5px 12px 0.36` | 14/16 | task/goal/activity rows |
| Large | `.orb-panel` / `.orb-raised-lg` | `-8px -8px 16px 0.78` / `8px 8px 18px 0.31` | 16/20 | view panels, sidebar, dialogs |

Inset wells invert the pair: `.orb-well` / `.orb-well-pill`
(`inset -3px -3px 6px rgba(255,250,244,0.68)` / `inset 3px 3px 6px
rgba(160,143,126,0.24)`), and the BRIGHTER `.orb-nav-active` pair
(`rgba(255,252,248,0.75)` / `rgba(180,165,150,0.32)`) for active nav chips
(sidebar rows, mobile tab bar, pill nav).

Labels are a two-tier system: `.orb-label` = 11px/600/ls 1.1px `#6E6E6E`
uppercase (panel headers, chip labels); `.orb-label-sm` = 10px/600/ls 1.2px
`#767676` (sidebar sections, activity dates).

**The cascade trap (the #1 Tailwind v4 gotcha in this repo):** custom
classes in `@layer utilities` are emitted AFTER Tailwind's generated
utilities, so an arbitrary `shadow-[…]` / `rounded-*` / `h-*` / `px-*`
utility on an element that ALSO carries `.orb-card` / `.orb-raised` /
`.orb-btn-*` / `.orb-pill-*` LOSES the cascade. Override with a dedicated
custom class (that's why `.orb-task-blocked`, `.orb-btn-post`, and
`.orb-pill-outline-lg` exist) or an INLINE style (the add-task submit's
`px-[22px]` uses inline style because the unlayered class padding wins).
Pairing a COLOR utility (`bg-orb-well`) with `shadow-[…]` is fine.

Dialog button systems: standard form dialogs submit in 12px/600 normal-case
charcoal pills (`.orb-btn-submit`, pad 8/20–22, NO shadow) with 12px/500
cancels (`.orb-btn-cancel-std`); the wizard keeps 11px/600 uppercase
(`.orb-btn-dark` / `.orb-btn-raised-cancel`); Post Update stays the 32px
r14 dark pill (`.orb-btn-post`); page-level actions stay neumorphic raised.
Dialog panels carry NO box-shadow — depth comes from the blurred scrim
alone (per-kind alpha: 0.3 form dialogs + wizard, 0.25 check-in + invite).

## §5 Component Architecture & Patterns

Four layers, strictly downward:

```
prisma/schema.prisma        8 models (User, Person, TeamMember, Goal,
                            Task, TaskUpdate, ActivityLog, WorkspaceSetting)
        ↓
src/app/api/**/route.ts     16 route handlers — thin DB wrappers with
                            hand-rolled validation (trim, caps, enums)
        ↓
src/lib/*.ts                Domain types/DTOs (orbital.ts) + pure seams
                            (router, clarify, plan-sanitizer, checkin,
                            rate-limit, team, next-action, calendar,
                            activity-groups, activity-tags, day-image,
                            db-path) — ALL unit-tested
        ↓
src/components/orbital/**   store.ts (Zustand) + views/ + dialogs/ +
                            shell (orbital-app, sidebar, user-menu, logo)
```

Rules that keep the architecture honest:

- **Views never fetch.** They read the store and call its actions; the
  store's `call()` helper is the ONLY sanctioned API client (unwraps the
  `{ok, data} | {ok, error}` envelope, converts failures to toasts).
- **Every mutation writes an ActivityLog row** — an endpoint without its
  feed entry is incomplete by definition.
- **Deletes confirm INLINE** (goal card, goal-detail header, task cards
  swap icons for confirm pairs) — never in an `AlertDialog`.
- **Background images use plain `<img>`** with `alt=""` + `aria-hidden`
  (deliberate; the ESLint rule is configured off for this).
- **Fonts load ONLY via `next/font`** (DM Sans variable + opsz axis, DM
  Mono, Archivo 600) — the numeral geometry depends on the opsz axis.

## §6 State Management Deep Dive

ONE Zustand store (`src/components/orbital/store.ts`) holds all server
state (user, people, members, goals, tasks, activity, settings) + view
state. No React Query, no SWR, no server actions. The pattern:

1. An action calls `call("<endpoint>", init)` — the envelope helper.
2. On success it `set()`s the affected slice AND refreshes dependent
  slices (e.g. task mutations refresh the goal's counts + the activity
  feed).
3. On failure `call()` shows a destructive toast and returns `null`;
  actions treat `null` as "abort silently" — never re-throw into render.

View↔URL sync: `src/lib/router.ts` maps `ViewId` ↔ `location.pathname`
(`parseUrl` / `toPath`); the shell pushes state on navigation and re-derives
on `popstate`. Legacy `?view=` links still resolve. The nullable-user
pattern: `page.tsx` (force-dynamic) resolves the session server-side and
passes `user | null` down — the shell renders for logged-out visitors with
empty states + LOG IN, and the store skips fetches while `user` is null.
Auth navigation uses `router.refresh()`, never `window.location` (ESLint
flags it) so the header swaps without a full reload.

Sidebar collapse uses `useSyncExternalStore` over a persisted external
store (`sidebar-collapse.ts`, localStorage `orbital-sidebar-collapsed`) —
NOT `useState`-in-`useEffect` (React 19's lint rules reject that for
hydrated state).

## §7 The AI Planning Pipeline

Two server-side AI features, both degrade-never-fail:

- `POST /api/goals/clarify` — takes a goal draft (title, optional
  description), returns exactly 3 clarifying questions. LLM output passes
  through `src/lib/clarify.ts` (bounds + sanitizer); on SDK failure it
  returns 3 deterministic title-derived questions.
- `POST /api/goals/[id]/generate-tasks` — takes optional `answers` from
  the clarify step, returns a 6–9 task plan. `src/lib/plan-sanitizer.ts`
  bounds the plan (titles, hours, deadlines, assignee matching against
  known people); on failure a deterministic 8-step template plan ships.
  Returns `409 ALREADY_PLANNED` for a goal that already has tasks.

The wizard UI is a 680px r24 conversational wrapper (bot avatar + speech
bubble above the 624px r16 form panel). AI-attribution: tasks generated by
the pipeline carry `ai: true` and render the solid `#EEEAE6` AI chip (r6, pad 1/5, a 9px ZAP glyph at the computed stroke 1.5 beside 10px/500 `#996CE4` text with 0.5px letter-spacing — v2.4: the live swapped sparkles for a lightning bolt; v2.9: the computed re-split).

## §8 Auth & Security Implementation

- scrypt password hashes (per-user salt); sessions are HMAC-signed
  stateless tokens in an httpOnly cookie (`orbital_session`, 7-day TTL).
  `requireSession()` guards every route handler except `/api/health` and
  the login/register endpoints.
- Rate limiting (`src/lib/rate-limit.ts`): fixed-window per-IP buckets,
  10 attempts / 15 min on login + register → `429 RATE_LIMITED` with
  `Retry-After`. Per-process (single-node deploy — documented limitation).
- `AUTH_SECRET` must stay stable across restarts (cookie invalidation
  otherwise). Production requires it; the dev fallback constant is
  documented as insecure.
- "Continue with Google" renders for parity but degrades to an explanatory
  toast — no OAuth credentials in a self-hosted clone (documented
  deviation).
- `/login` renders the `LoginCard` for EVERY visitor — authenticated ones
  included (v2.11/F13, measured on the live: no redirect; re-sign-in lands
  on the workspace via the client flow). The v1.4–v2.10 authed redirect
  was a behavioral drift, closed and pinned in `auth.spec.ts`.
- Validation is hand-rolled in route handlers (no Zod — pruned in v1.2 by
  design): trim, length caps, enum membership, referential checks, email
  format. Unknown ids → 404; auth gaps → 401; bad input → 400 with a
  specific code.

## §9 Anti-Patterns & Common Bugs

1. Adding per-view `app/` routes or changing the URL shape — breaks the
   SPA contract (rewrites ↔ `router.ts` must stay in sync).
2. Bypassing the store with ad-hoc `fetch` in components.
3. Constructing `PrismaClient` anywhere but `src/lib/db.ts`.
4. Pairing arbitrary `shadow-[…]`/`rounded-*`/`h-*` utilities with custom
   `.orb-*` classes on the same element (cascade loss — see §4).
5. Letting `clarify`/`generate-tasks` hard-fail when the SDK is down.
6. Skipping the `ActivityLog` write in a mutating endpoint.
7. Mixing the three status vocabularies (task: pending/in_progress/
   blocked/need_help/done; goal: active/done/draft/paused; check-in:
   on_track/blocked/need_help/done — metadata in `orbital.ts`).
8. `window.location.href` assignments for auth navigation (breaks the
   header swap; ESLint flags them).
9. `useState`-in-`useEffect` for hydrated persisted state (React 19 lint
   rejects; use `useSyncExternalStore`).
10. Forgetting `.env`'s `DATABASE_URL` beats nothing — an absolute value in
    the SHELL environment overrides the file everywhere (dotenv never
    overrides existing process env). Symptom: the app reads a DIFFERENT
    database than `db:seed` wrote.
11. Per-test logins in browser tests — the rate limiter (10/IP/15min)
    poisons the suite. Use one storageState (see §15).
12. Editing `package.json` dependencies by hand — use `bun add`.
13. Trusting VLM screenshot comparisons without computed-style
    verification (15+ disproven misreads across sessions).

## §10 Debugging Guide

| Symptom | Root cause | Fix |
|---|---|---|
| `Error code 14: Unable to open the database file` | Server started where no anchor has `prisma/schema.prisma` (see §15 db-path), or the parent dir of the target file doesn't exist | Start via npm scripts from repo root, or set an absolute `file:` URL |
| Server reads the WRONG db (data "missing") | Shell env `DATABASE_URL` (absolute) overrides `.env` | `env -u DATABASE_URL bun run …`, or fix the shell |
| Standalone server resolves db into `.next/standalone/db/…` | Pre-v2.3 CWD rule + `process.chdir(__dirname)` in server.js (fixed by `standaloneRepoRoot` detector) | Keep `src/lib/db-path.ts` in the import chain — never inline resolution in `db.ts` again |
| Login loops to `/login` | `AUTH_SECRET` changed between restarts | Keep the secret stable |
| Sudden 429s | Per-IP fixed window engaged | Wait `Retry-After` or restart (clears in-memory buckets) |
| Playwright: `browserType.launch … Target page closed` | Sandbox thread limits with several Chromium instances running | Close extra browser sessions before the run |
| Playwright: `tap: page does not support tap` | Context lacks `hasTouch` | `test.use({ viewport, hasTouch: true, isMobile: true })` |
| Playwright: strict-mode violation on text | The app renders 2–3 responsive DOM subtrees (`md:hidden` / `hidden md:block lg:hidden`) | `.filter({ visible: true }).first()` |
| Playwright: `devices["iPhone 13"]` wants webkit | Device descriptors switch browsers | Set viewport/hasTouch explicitly on the chromium project |
| A11y-tree probe finds no element that IS in the DOM | `display:none` subtrees are excluded from roles | Use CSS selectors + visible filters, or `page.locator` |
| `rounded-full` computed as `33554432px` | Tailwind v4 `calc(infinity * 1px)` | Assert radius > 1000, not an exact string |
| `ring-white/50` computed in oklab() | Tailwind v4 color serialization | Match `/0\.5\) 0px 0px 0px 4px/`, not an rgba string |
| Next.js dev badge pollutes screenshots | Dev-mode indicator | Capture docs screenshots from the production build |

Diagnostic doctrine (Appendix B of the operating contract): reproduce
before trusting, classify the gate (install/type/lint/test/build/db),
prefer machine-readable diagnostics (computed styles, structured JSON,
`/proc/<pid>/environ`), fix at the source, and never weaken a guardrail to
make a gate pass.

## §11 Pre-Ship Checklist

```bash
bun run lint           # 0 errors
bun run typecheck      # 0 errors (the build won't catch types)
bun run test           # 138 unit checks
bun run build          # clean compile + standalone assembly
./scripts/smoke-test.sh  # 30 curl checks against the standalone build
bun run test:e2e       # 115 Playwright checks (needs the build)
```

Then: re-probe any changed surface against the live reference at
390/768/1440 (computed styles are ground truth), regenerate the affected
`docs/screenshots/*.png` from the PRODUCTION build, align README/AGENTS/
CLAUDE/PAD revision blocks, write the session log, and push via the SSH
wrapper runbook (`docs/how-to-git-push-using-ssh-wrapper_SKILL.md`) —
`main` only, Conventional Commits with emoji prefixes, never commit
`.env`/`*.key`/`db/*.db`.

## §12 Lessons Learnt & How to Avoid Them

1. **The standalone server chdirs before your code runs.** Next's
   standalone `server.js` executes `process.chdir(__dirname)` on line 6 —
   by the time any module initializes, `process.cwd()` is
   `.next/standalone`, and the file tracer has copied `prisma/schema.prisma`
   there. Any CWD-based path resolution silently targets the BUILD OUTPUT.
   Fix: `standaloneRepoRoot()` detects the in-repo standalone dir (basename
   + server.js + grandparent schema) and returns the real repo two levels
   up. Deployed copies (no repo above) intentionally keep the CWD rule.
2. **Bundlers rewrite `import.meta.url` into virtual paths.** Turbopack's
   standalone runtime maps module ids to `<standalone>/src/lib/db-path.ts`
   — a path that exists ONLY in the chunk map. The module anchor must be
   validated by the source file existing ON DISK before it is trusted.
3. **dotenv never overrides the shell.** An absolute `DATABASE_URL` in the
   environment beats every `.env` — check `env | grep DATABASE` and
   `/proc/<pid>/environ` before suspecting the resolution code.
4. **VLM screenshots misread ~30% of micro-styling claims.** Colors,
   shadows, and "missing" elements need computed-style proof. Measure
   first, then believe.
5. **The rate limiter is load-bearing for tests too.** A browser suite
   that logs in per-test self-destructs at test #11. One setup-project
   login + storageState is the pattern.
6. **Tailwind v4's cascade order makes utility overrides of custom-layer
   classes silently fail.** Dedicated custom classes (or inline styles)
   are the sanctioned override path.
7. **Re-measure when parity drifts.** The live app is a moving target —
   the v1.7 mobile-tab reading was correct once and wrong by v2.3.
8. **Anchor navigation and SPA state can coexist (v2.7).** When the
   reference converts its buttons to real `<a href>` links, mirror the
   DOM — but keep the SPA: `preventDefault` + the store's `navigate` on
   plain left clicks, and let modified/middle clicks fall through so the
   truthful href opens a real tab. Deep-linkable wizard state
   (`/goals?new=true`) belongs in the STORE (an intent flag read at
   boot/applyUrlState and cleared on dialog close) — never in a
   mount-time `useEffect` setState (the `react-hooks/set-state-in-effect`
   lint rule forbids it, and deriving the dialog's open state from the
   flag avoids hydration races).
9. **Replicate the reference's dead seams faithfully (v2.7).** When the
   live leaves an affordance unwired (the completion ring, the /tasks row
   clicks — both `cursor: pointer` with inert handlers), the parity-
   correct clone does the same. Pin the deadness with e2e (click → no
   navigation, no dialog) so a future live fix surfaces as drift instead
   of a silent mismatch. Verify suspected-dead controls with a FULL
   mousedown/mouseup/click sequence before declaring them dead — a plain
   `.click()` can miss popover triggers (the live's user pill needed the
   full sequence).
10. **Re-crawl before every remediation pass.** Specs age between
    sessions; the sessions that skip the re-crawl inherit stale specs.
11. **Derive UI text from the data it describes, not from a sibling feed
    (v2.5).** The dashboard's "Next Planned Action" was read off
    `status_update` activity rows — correct only because the OLD reference
    data happened to log a blocked check-in. The regenerated live carries
    zero status updates yet still shows the blocked-task NPA: the seam now
    takes the task list + goals. Same class of bug as reading layout off
    screenshots: the input must be the SOURCE of the fact.
12. **A "duplicate" row can be the spec (v2.5).** The activity view's hero
    looked like it should be sliced out of the date groups — it renders in
    BOTH places on the live ("Online · N" == timestamped rows). Verify
    count invariants against the reference before deduplicating.
13. **`rounded-xl` is not 12px here.** The shadcn `--radius: 1rem` token
    override makes Tailwind's `rounded-xl` compute to 20px — the logged-out
    LOG IN pill needed explicit `rounded-[12px]`/`rounded-[10px]` values
    to match the measured reference.
14. **Prefer library defaults over bespoke micro-styling (v2.6).** The
    live reference flipped its icon strokes twice in three deploys (v2.4
    split chrome/content at 1.5/2; v2.6 reverted everything to the lucide
    default 2). Custom stroke values on ~33 sites meant 33 edits to
    re-sync; deleting the `strokeWidth` prop (default applies) would have
    meant zero. When a reference detail sits at the library default,
    inheriting the default is the drift-resistant choice — bespoke values
    are a maintenance liability. Run a named-glyph stroke census BEFORE
    any survey so a systemic flip is caught in one pass.

15. **Audit Tailwind v4's computed-style serialization against the
    reference, not just the visuals (v2.8).** Three v4 artifacts had no
    visual signature yet failed a computed-style probe: (a) the preflight
    sets NO `cursor: pointer` on buttons — the reference's own global
    `button, [role="button"] { cursor: pointer }` rule must be re-added
    or every button renders the UA arrow; (b) every `shadow-[…]` utility
    composes with the unset `--tw-*` ring/inset vars, emitting four
    zero-alpha prefixes in the computed box-shadow string (the reference
    renders clean single declarations — plain-declaration custom classes
    byte-match them); (c) `rounded-full` serializes as `calc(infinity *
    1px)` = 33554432px in Chrome while the reference computes a literal
    9999px. Paired computed-style censuses (cursor / shadow / radius)
    are the detectors — screenshots and VLM see none of these.

16. **Anchor-wrapped interactive children need a button-origin click
    guard WITH preventDefault (v2.8).** Converting a card to an anchor
    (v2.7) silently broke the action buttons INSIDE it: their clicks
    bubbled to the anchor's navigate handler. The guard is
    `if (e.target.closest("button")) { e.preventDefault(); return; }` —
    the preventDefault is mandatory: returning early WITHOUT it lets the
    browser follow the anchor's href as the DEFAULT action (a full page
    load, worse than the original bug). Any time an anchor gains
    interactive descendants, pin the child controls' behavior with e2e
    (click child → dialog opens, URL unchanged).

17. **Presentation attributes are the LOWEST cascade tier — read
    COMPUTED styles, never the attribute (v2.9).** The v2.6 "universal
    stroke 2" census read `svg.getAttribute("stroke-width")` and
    concluded the reference had reverted to the lucide default; the
    reference had actually stamped inline `style="stroke-width: 1.5"`
    on every icon (CSS beats presentation attributes), so the COMPUTED
    stroke was 1.5 the whole time — three sessions of specs were pinned
    to a methodology artifact. The detection rule: for ANY
    attribute-backed style (stroke-width, fill, width/height), probe
    `getComputedStyle(el).<prop>` on the reference before writing a
    pin, and disambiguate same-glyph-different-role icons by rendered
    SIZE in the census (calendar@11 renders 1.5 but calendar@13 stays
    2 on the reference — the glyph name alone is not a key).
18. **Tailwind v4's space-y flips the margin onto the EARLIER child
    (v2.10).** v3's `space-y-*` wrote `margin-top` on `* + *` (the
    later siblings); v4 writes `margin-block-end` on
    `:not(:last-child)` (the earlier ones). Same visual rhythm,
    DIFFERENT computed layout — so a v3-authored reference and a v4
    clone disagree on which element carries every gap (the login form:
    label mb 6 vs input-wrapper mt 6; field mb 16 vs block mt 16), and
    a wrapper-level space-y silently ADDS to explicit my-* utilities
    (the google→divider gap grew 12px). When a reference ships
    space-y-based rhythm and the pin asserts COMPUTED margins, mirror
    with explicit mt utilities on the later children — and remember an
    `inline` label's strut line box (the block's fs/lh) inflates the
    field block by the leading the flex base was hiding (70 → 78).
19. **Pin the count-independent structure, not the rendered total
    (v2.10).** An "Online · 36" pill pin broke twice in one suite run:
    earlier specs legitimately append feed rows (36 → 40), and the
    total width follows the count's DIGITS (proportional figures:
    "· 36" renders 103px, "· 40" renders 101px). The stable pins are
    the child spans (dot 7×7, "Online" 40 @ 11/600/ls 0.66), the gap,
    and the padding; totals get a floor + a sanity range. Same rule for
    any data-derived width.

20. **Behavioral parity includes AUTH-STATE routing — probe every route
    both ways (v2.11).** The clone's `/login` had redirected
    authenticated visitors to `/` since v1.4, and nobody noticed for
    ten revisions because every probe and spec measured the LOGGED-OUT
    surface only. The live renders the full card to authenticated
    visitors (no redirect — measured as F13). The survey rule: for
    every route, visit it BOTH signed-out AND signed-in against the
    reference and diff the behavior (URL, render, nav), not just the
    logged-out geometry. Same class as lesson 17's "read the computed
    value": the measurement must cover the full state space the
    reference occupies, and a redirect that fires only in one auth
    state is invisible to a logged-out-only census.

21. **A reseed invalidates every live browser session (v2.12).**
    `bun run db:seed` wipes the `user` table and re-creates it with
    fresh ids, so any session cookie minted before the reseed points
    at a user that no longer exists. The symptom is misleading: the
    shell renders normally but every view comes up EMPTY ("All (0)",
    no goals, no tasks) because `requireSession()` fails silently on
    each store fetch — the DB itself is fine (3/31/36 via
    `check-db-state.mjs`). The rule: after ANY reseed, re-login before
    probing the UI, and never diagnose "empty views + healthy DB" as
    a data bug until the cookie has been refreshed. Same session also
    re-confirmed: `./scripts/smoke-test.sh` leaves its round-trip
    rows in `db/custom.db`'s activity feed (36 → 40) — reseed before
    regenerating screenshots.

22. **Pin the environment INSIDE the script, not per-command (v2.14).**
    The sandbox shell exports an absolute `DATABASE_URL` pointing into
    a parent-workspace path that does not exist; a script that boots
    the standalone server WITHOUT pinning its own value inherits it,
    `resolveProcessDatabaseUrl` passes absolute URLs through
    untouched, and every authenticated endpoint fails with "Error
    code 14: Unable to open the database file" — reproduced as 12/30
    smoke failures in session 41 after three sessions of per-command
    neutralization. The rule: any script that boots the server (or
    runs Prisma directly) pins `DATABASE_URL` explicitly — the same
    discipline `playwright.config.ts` always had, now carried by
    `smoke-test.sh` and `capture-all.sh`. Companion rule: agent-tool
    background servers do not SURVIVE between shell invocations in
    this sandbox, so multi-step capture flows must run in ONE
    invocation (`scripts/capture-all.sh` boots, captures, cleans,
    reseeds, and shuts down in a single process tree); and a
    `set viewport` issued while the session's implicit browser launch
    is still racing can be DROPPED — re-assert the viewport after the
    first `open` (observed as 1280×577 wizard shots vs the committed
    1440×900).

23. **When a count changes, grep EVERY doc for the old number in the
    same commit (v2.15).** v2.7 added `/tasks` as the seventh path
    rewrite, and AGENTS/CLAUDE/README were corrected — but the PAD's
    ADR-001 Decision, the PAD's §2 Application layer, the SKILL's §1
    philosophy, and the SKILL's §3 config notes all kept saying "six"
    through three subsequent docs passes (v2.10, v2.12, v2.14 — each
    fixed OTHER stale spots while checking only the docs it was
    editing). Count-claims drift independently across doc copies;
    the repair is a repo-wide `grep -rn "<old number>"` over the doc
    set whenever a count changes (rewrites, routes, test totals,
    model counts), in the SAME commit as the change that moved the
    number. Same class as lesson 10's "re-crawl before every
    remediation pass", applied to documentation instead of the live
    app: stale specs inherit silently.

## §13 Pitfalls to Avoid

- Don't add `sm:` growth to the mobile shell — the live keeps the fixed
  mobile spec through 767 (transitions fire at `md`).
- Don't reintroduce `AlertDialog` confirms — deletes confirm inline.
- Don't hand-place logo dots — the geometry is pure, tested helpers in
  `logo.tsx` (hex ring for the sidebar, 1-2-3 pyramid for the login chip).
- Don't ship screenshots from `next dev` (the dev badge leaks in).
- Don't run `server.js` from outside the repo root AND a relative
  `DATABASE_URL` at the same time on a deployed copy — use an absolute
  path (DEPLOYMENT.md §4).
- Don't let the pill nav and the mobile tab bar drift apart — both derive
  active state from the same `tabActive` helper.

## §14 Best Practices

- TDD at the pure seams: write the failing `*.test.ts` first (red), create
  the module (green), then wire it into the route/component.
- Keep route handlers thin: parse → validate → prisma → ActivityLog →
  `ok(data)`. Anything smarter belongs in `src/lib` with a spec.
- Use the store's `call()` for EVERY fetch; treat `null` as abort.
- Prefer dedicated custom classes over utility overrides for the neumorphic
  system (see §4's cascade trap).
- Re-verify with computed styles after every visual change; keep the probe
  scripts in `research/` (never committed).
- Update the PAD revision block + AGENTS/CLAUDE/README in the SAME commit
  as the behavior change — docs drift is how parity debt compounds.

## §15 Coding Patterns

**The API envelope** (`src/lib/api.ts`):

```ts
// Route handlers ALWAYS return ok() / fail() — never throw across the boundary.
return ok({ people: peopleDTO, members: memberDTO });
return fail("BAD_REQUEST", "kind must be human or agent", 400);
```

**The store call pattern** (`store.ts`):

```ts
const payload = await call<{ people: PersonDTO[]; members: TeamMemberDTO[] }>("/api/team");
if (payload) set({ people: payload.people, members: payload.members });
// failures already toasted inside call(); null means "abort silently"
```

**The db-path seam** (`src/lib/db-path.ts` — pure, fixture-tested):

```ts
// Relative file: URLs resolve against the first anchor owning prisma/schema.prisma
resolveDatabaseUrl("file:../db/custom.db", [repoRoot])
  // → "file:<repoRoot>/db/custom.db"
resolveDatabaseUrl("file:/abs/path/prod.db", [repoRoot])  // absolute → passthrough
// Anchor order: standaloneRepoRoot(cwd) → module root (disk-validated) → cwd
```

**The Playwright auth pattern** (`playwright.config.ts` + `auth.setup.ts`):

```ts
// One login per RUN, shared via storageState — the rate limiter makes
// per-test logins a trap. Specs that need the logged-out surface opt out:
test.use({ storageState: { cookies: [], origins: [] } });
```

**The multi-subtree locator pattern** (three responsive DOM subtrees):

```ts
// The app renders md:hidden / hidden md:block lg:hidden / hidden lg:block
// variants — always filter to the visible match:
await expect(page.getByText("ACTIVE GOALS").filter({ visible: true }).first()).toBeVisible();
```

## §16 Coding Anti-Patterns

- `new PrismaClient()` outside `src/lib/db.ts`.
- `fetch()` inside a view component.
- `text-transform`/`tracking` inherited into a chip fragment that the live
  renders in body case (the "· N blocked" span needs `normal-case
  tracking-normal`).
- `flex-wrap` on headers whose reference stays single-row (Team h1, AI
  Agents) — wrap moves the button to its own line and breaks parity.
- Fixed pixel sizes where the live is fluid (mobile stat wells are
  `aspect-square`, not fixed 104).
- Non-responsive action labels where the live swaps them (INVITE below sm,
  INVITE MEMBER from sm).

## §17 Responsive Breakpoint Reference (the Three-State Chrome)

| Range | Chrome | Notes |
|---|---|---|
| < 768 (`md`) | Mobile: app bar 62px (logo + user pill, sticky, bottom shadow) + full-width bottom tab bar (`rounded-t-[20px]`, upward shadow, pad 8/8/12, content-height 73.5; every view tab = flex-column chip gap 4 pad 8/4 r14 that STRETCHES THE FULL TAB WIDTH — ACTIVE = `.orb-nav-active` inset well; the MORE button carries its own pad + an 8px flex basis so it renders ~6.4px wider, never welled; icons at the computed stroke 1.5 — v2.9 re-split) + MORE bottom sheet (r24, pad 20/20/40, 20% + 4px-blur scrim) | Full-bleed; main 16/6/90 + per-view containers (dashboard +16/+12 → hero x22/y90; lists +12/+24 → h1 x18/y102); mobile goal cards = BARE status label (7px dot, gap 6, no pill) beside a well-chipped pct (r8 pad 3/10, 13px/500) |
| 768–1023 (`md`–`lg`) | Middle state: NO sidebar/app bar — desktop greeting header + 52px Dashboard-back strip on list views + FLOATING CENTERED PILL NAV (~494×71 r20, brand + six desktop tabs, active = inset-well chip r12 pad 8/12) | Desktop content components; main 12/20/100 (list) · 24/20/100 (dashboard) |
| ≥ 1024 (`lg`) | Desktop: sticky sidebar (aside top-0, height viewport−40px; 240px ⇄ 64px rail; clock + TASKS STATUS + collapse bar) | Canvas p-6; content max-w 1200 |

Content transitions (stat wells 104→88, ring→180px, desktop goal cards,
settings 2-col) fire at `md`, NEVER `sm`. Desktop dashboard tracks are
asymmetric below 1280 (`minmax(0,1fr) / minmax(438px,1fr)`).

## §18 Z-Index Layer Map

Current since v2.10 (the pre-v2.10 40/50 map is retired):

| Layer | z-index | Element |
|---|---|---|
| Canvas glow | 0 (fixed, pointer-events-none) | `.orbital-app` glow div |
| Content | 1 (`relative z-[1]`) | shell + main |
| Check-in / task-detail dialog | 50 (Radix portal overlay + content) | default `Dialog` tier |
| Bottom tab bar / pill nav | 100 (fixed) | mobile + tablet chrome |
| Wizard scrim | 100 | `new-goal-dialog` overlay |
| Toasts | 100 | Toaster viewport |
| Form dialogs (add-task / task-edit / goal-edit) | 200 (scrim) | scrimFlex overlays |
| MORE sheet | 200 (overlay) / 201 (panel) | mobile sheet |
| Date-picker popover | 210 | above every dialog |

## §19 Color & Token Reference (Complete)

```css
--orb-canvas:   #EBE7E2;  /* page canvas — also the inset-well tone */
--orb-surface:  #EEEAE6;  /* raised neumorphic panels */
--orb-raised:   #EEEAE6;  /* raised surface (sidebar, cards, buttons) */
--orb-well:     #EBE7E2;  /* inset surface */
--orb-track:    #DDD8D2;  /* progress track */
--orb-heading:  #3A3A3A;  /* headings / button text */
--orb-body:     #2F2823;  /* primary text */
--orb-muted:    #6E6E6E;  /* secondary text */
--orb-green:    #2ECC8A;  --orb-green-deep:   #1F8F5F;
--orb-purple:   #996CE4;  --orb-purple-deep:  #6B4BBF;
--orb-coral:    #FF8077;  --orb-coral-deep:   #BD3228;  /* destructive */
--orb-pink:     #FFCBDE;  /* demo avatar */
--orb-tan:      #C4996A;  --orb-lavender: #C9B3F5;  --orb-amber: #F5B841;
```

Status vocabularies (labels + colors live in `TASK_STATUS_META` /
`GOAL_STATUS_META` / `UPDATE_STATUS_META` in `src/lib/orbital.ts`):
task `pending | in_progress | blocked | need_help | done`; goal
`active | done | draft | paused`; check-in `on_track | blocked | need_help
| done`. Blocked task cards add the coral inset ring
(`rgba(255,128,119,0.18)`).

## §20 The Complete TypeScript Interface Reference

Domain types + DTOs are centralized in `src/lib/orbital.ts` — add new ones
there, never ad-hoc in components. Core shapes:

```ts
type ViewId = "dashboard" | "goals" | "goal-detail" | "my-tasks" | "activity" | "team" | "settings";

interface PersonDTO   { id: string; name: string; avatarColor: string; userId: string | null }
interface TeamMemberDTO {
  id: string; name: string; email: string | null; role: string | null;
  avatarColor: string; kind: "human" | "agent";
  agentRole: string | null; description: string | null; instructions: string | null;
}
interface GoalDTO     { id: string; title: string; description: string | null; status: GoalStatus;
                        targetDate: string | null; sortOrder: number; createdAt: string;
                        taskCount: number; doneCount: number; blockedCount: number }
interface TaskDTO     { id: string; goalId: string; title: string; description: string | null;
                        status: TaskStatus; deadline: string | null; assignee: string | null;
                        hours: number | null; ai: boolean; createdAt: string }
interface ActivityDTO { id: string; type: string; message: string; detail: string | null;
                        createdAt: string; taskId: string | null; goalId: string | null }

// API envelope — every handler returns one or the other:
type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
```

The db-path seam's public surface: `resolveDatabaseUrl(envUrl: string |
undefined, anchors: string[]): string`, `standaloneRepoRoot(dir: string):
string | null`, `candidateRoots(): string[]`,
`resolveProcessDatabaseUrl(): string`.

---

## Appendix A — The Meticulous Approach (six-phase workflow)

1. **ANALYZE** — read the view/dialog/route you're touching + its store
   action before planning.
2. **PLAN** — map the change across schema → route handler → domain
   types/pure lib → store action → view/dialog.
3. **VALIDATE** — the plan preserves the API envelope + the
   activity-feed invariant; pure logic lands in `src/lib` with a failing
   test written FIRST.
4. **IMPLEMENT** — one layer at a time; keep `bun run build` green
   between layers.
5. **VERIFY** — the full gate (§11) + computed-style re-probe of changed
   surfaces against the live reference.
6. **DELIVER** — Conventional Commit on `main`, push via the SSH wrapper
   runbook, verify the remote ref, shred the key.

## Appendix B — Quick Reference Card

| Need | Where |
|---|---|
| Run everything | `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh && bun run test:e2e` |
| Demo login | `demo@orbital.app` / `Demo1234!` |
| Path rewrites | `next.config.ts` ↔ `src/lib/router.ts` (keep in sync) |
| Status metadata | `src/lib/orbital.ts` (`*_STATUS_META`) |
| Neumorphic classes | `src/app/globals.css` `@layer utilities` |
| DB resolution | `src/lib/db-path.ts` (tested by `tests/db-path.test.ts`) |
| Unit tests | `src/**/*.test.ts` + `tests/**/*.test.ts` (138) |
| Browser tests | `tests/e2e/*.spec.ts` (115) — scratch DB `db/e2e.db`, port 3100 |
| Smoke tests | `scripts/smoke-test.sh` (30, curl, port 3000) |
| Screenshots | `docs/screenshots/*.png` — ALWAYS from the production build |
| Deployment | `docs/DEPLOYMENT.md` (§4 = database location) |
| Push runbook | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` |
| Session history | `docs/session_*.md` + `docs/worklog.md` |
