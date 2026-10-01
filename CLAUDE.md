---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs
version: 1.0.0
framework_version: "16.1"
last_updated: 2026-09-17
---

# ORBITAL — AI Project Management Workspace

Self-hosted project management workspace where teams define goals and an AI agent drafts their task plans. Two-route Next.js SPA (workspace page + `/login`) with cookie-session auth, Prisma/SQLite persistence, and a typed JSON API. Maintained by Pete A (`pete@pop-os`).

**Tech Stack**: Next.js 16.1 (App Router, standalone output), React 19, TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui (Radix), Zustand 5, Prisma 6 + SQLite, z-ai-web-dev-sdk (server-side LLM), Vitest 5 (unit tests), lucide-react.

## Core Identity & Purpose

ORBITAL is a faithful clone of the reference Base44 project-management app, rebuilt as one deployable Next.js unit. The domain model is deliberately small — Goals → Tasks → TaskUpdates, with People/TeamMembers for assignment, an ActivityLog that narrates every mutation, and singleton WorkspaceSettings. The product promise: describe a goal, get a planned, assigned, scheduled task list, then track it to done through check-ins.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the existing view/dialog/route you are touching plus its store action. The Zustand store is the single source of client truth; changes ripple through refresh calls.
2. **PLAN** — Map the change across the four layers it will touch: schema (`prisma/schema.prisma`) → route handler (`src/app/api/…`) → domain types (`src/lib/orbital.ts` / pure lib modules) → store action + view/dialog.
3. **VALIDATE** — Confirm the plan preserves the API envelope and the activity-feed invariant before coding. Pure logic goes in `src/lib/*.ts` with a Vitest test — write the failing test first.
4. **IMPLEMENT** — One layer at a time; keep the build green (`bun run build`) between layers.
5. **VERIFY** — Run the full gate: `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh && bun run test:e2e` (138 unit + 30 smoke + 115 Playwright checks required).
6. **DELIVER** — Conventional Commit on `main`, push via the SSH wrapper runbook.

### Project-Specific Principles

- **The workspace stays a single-page app with path URLs; `/login` is the only other route.** View switching is client-side; `/goals/<id>`, `/my-tasks`, `/tasks`, … are rewrites onto the one page (`src/lib/router.ts`) — never add per-view routes or change the URL shape. **v2.7: every view-switch surface renders a REAL ANCHOR** (`<a href>` + a click contract that preventDefaults plain left clicks and calls the store's `navigate`, falling through on modified/middle clicks): sidebar nav ×6 + brand + TASKS STATUS widget, mobile tab bar ×4 (MORE stays a button; the Home icon is lucide `layout-dashboard`), 768 pill nav ×6, MORE sheet rows (`Tasks → /tasks` — the all-tasks view), dashboard stat/goal wells + Full log ×2 + the New Goal pill (`/goals?new=true` — the wizard auto-opens on soft nav AND hard loads via the store's `newGoalIntent` flag), and the goals-view cards (`/goals/<id>`); the goals-view NEW GOAL button stays a button, the mobile app-bar brand is inert (measured), and the dashboard ring is a PLAIN cursor-pointer div (measured — the reference's ring is dead). v2.8: every button computes `cursor: pointer` via the base-layer rule the reference itself ships (`button, [role="button"] { cursor: pointer }` — Tailwind v4's preflight sets no pointer, so without it every button renders the UA arrow); the goal-card anchors wrap the ENTIRE card (desktop 1072px — text column + stats/action column) and GUARD button-origin clicks (closest("button") → preventDefault + return) so the action squares open dialogs without navigating; the dashboard goal wells are bare anchors wrapping inner well divs; the brand strings are the literal ORBITAL (with the reference's redundant uppercase transform mirrored); and the chrome shadows (app bar / tab bar / MORE sheet / pill nav / sheet close) use plain-declaration custom classes (`.orb-appbar-shadow` etc.) because Tailwind v4's `shadow-[…]` composition emits zero-alpha prefixes that diverge from the reference's computed strings — the filter chips likewise pin `rounded-[9999px]` (v4's `rounded-full` serializes as calc(infinity*1px)). Unauthenticated visits render the shell with a LOG IN header pill (nullable-user pattern; v2.5 measured spec: r12 pad `11px 20px` standard pair at ≥768, r10 pad `6px 14px` small pair in the mobile app bar — `rounded-xl` is a trap: the shadcn `--radius: 1rem` override resolves it to 20px); `/login` is a real route (excluded from rewrites) with sign-in / sign-up / forgot states and `?from_url=` return handling; v2.9 re-measured the redesigned page: a slate gradient canvas (from-slate-50 to-slate-100, p-4) carrying the card (rounded-2xl, 95% white over a 4px backdrop blur, overflow-hidden, a 4px top gradient bar, responsive pad p-8 sm:p-10 md:pt-12/pb-10/px-10) with a CENTERED column (items-center text-center) — the logo is a CIRCULAR white chip (rounded-full + ring-4 ring-white/50 + shadow-lg, 80px below sm / 96px from sm) carrying the purple 1-2-3 dot pyramid, wrapped in a group with a blurred gradient halo; the Google button carries a 20px glyph in a -ml-4 wrapper (the shadcn Button forces 16px on svgs without a size-* class — opt out with size-5); input glyphs are 16px; the footer is sm:flex-row with a combined "Need an account? Sign up" button.
- **Every mutation narrates itself.** An API change without its `ActivityLog` write is incomplete.
- **The AI features may degrade, never fail.** `clarify` (wizard questions) and `generate-tasks` fall back to deterministic outputs; preserve that guarantee when touching them.
- **No new state libraries.** Server state flows through the Zustand store's refresh pattern.
- **Test at the pure seams.** Router mapping, clarify questions, plan sanitization, check-in mapping, auth rate limiting, team-form normalization, the dashboard's next-planned-action derivation (v2.5: task-based — the first blocked TASK in display order, taking the task list + goals, not the activity feed), the logo dot geometry, the date-picker calendar grid + long date format (`formatLongDate`), the activity feed's date grouping (`groupActivityByDate`), the activity type-tag mapping (`activityTypeTag`), the dashboard greeting boundaries (`greetingFor` — 05:00/12:00/18:00), the date-fns long-form distance (`formatDistance`/`relativeTime`), and the date-card photo rotation (`dayImageFor` in `src/lib/day-image.ts` — 5/11/17/21 hour boundaries) live in `src/lib/*.ts` (or `logo.tsx`/`orbital.ts`) with Vitest specs — TDD (red → green) is the default for changes there.
- **Deletes confirm inline, not in modals.** Goal cards, the goal-detail header, and task cards swap their action icons for inline confirm pairs ("Delete / Cancel", "Yes, Delete / Cancel", "Delete? Yes / No") — the reference pattern; `AlertDialog` confirms were removed in v1.3.
- **Auth endpoints are rate-limited; auth navigation uses `router.refresh()`.** 10 attempts/IP/15 min on login + register (`429 RATE_LIMITED`); login success and Log Out swap the header (UserMenu ↔ LOG IN) via a server session re-resolve, never `window.location` assignments. "Continue with Google" renders for parity but degrades to a toast — no OAuth credentials in a self-hosted clone (documented deviation).
- **The visual system is neumorphic (measured, v1.4–v1.7) with THREE card tiers.** Tokens and primitive classes in `globals.css`: `.orb-raised` / `.orb-raised-lg` / `.orb-raised-btn` / `.orb-well` / `.orb-well-pill` / `.orb-task-blocked` / `.orb-btn-dark` / `.orb-btn-post` / `.orb-btn-cancel` / `.orb-btn-submit` / `.orb-btn-cancel-std` (v2.0 standard-dialog pair) / `.orb-pill-round` / `.orb-pill-outline-lg` (v2.2 dashboard 132×40 pill) / `.orb-row-card` (deeper r14) / `.orb-goal-card` (deeper r16) / `.orb-panel` (large r16). Tiers (measured on the live app): standard pair `-5px 0.78` (buttons), deeper pair `-5px 0.92` (row cards), large pair `-8px 0.31` (view panels). **Labels are a two-tier system (v1.7): `.orb-label` 11px/600/ls 1.1px `#6E6E6E`; `.orb-label-sm` 10px/600/ls 1.2px `#767676`. The destructive red is `#BD3228`. Never pair an arbitrary `shadow-[…]`, `rounded-*`, or `h-*` utility with a custom class that sets that property** (`.orb-card`/`.orb-raised`/`.orb-btn-*`/`.orb-pill-*`) on the same element — custom layer classes are emitted after generated utilities and win the cascade; use a dedicated custom class for overrides (`.orb-task-blocked` and `.orb-btn-post` exist for exactly this — the once-documented `.orb-pill-outline-sm` never existed; the mobile NEW GOAL button is the base `.orb-pill-outline`).
- **Dialogs ship TWO button systems** (v2.0/v2.1, measured): standard form dialogs (add-task/task-edit at 500px, goal-edit at 480px) use radius-20 panels (pad 28/28/24, 15px/600 headings, 30px r8 raised close) with 12px/600 normal-case submits (`.orb-btn-submit` — add-task "Add Task" + task-edit "Save Changes" at pad 8/22 via INLINE STYLE since the unlayered custom-class padding beats Tailwind px utilities; goal-edit reads "Save" at 8/20) + 12px/500 cancels (`.orb-btn-cancel-std`); **panels carry NO box-shadow (v2.1)** and scrims are per-kind — 0.3 for add-task/goal-edit/task-edit + the wizard, 0.25 for check-in + invite (all `rgba(46,42,38,α)` + 12px blur). **Dialog controls (v2.1): select controls h35 (v2.9: the DIALOG selects are NATIVE `<select>` elements — add-task/task-edit status + assignee, goal-edit status — 216×35, bg #EBE7E2, r10, 13px, `.orb-select`; goal-edit carries NO close square and no heading icon per the v2.9 measure, and the SETTINGS selects keep their shadcn triggers); date inputs h38; textareas 13px pad 8/12 (min-h 72 on goal-edit/task-edit/add-task); text/number inputs h36; the check-in's Send icon has mr-[4px].** The wizard keeps 11px/600 uppercase pills (`.orb-btn-dark`, gap 6, pad 9/18) and 37.5px pad-9/14 inputs; the invite dialog is 384px/p24 with 36px 13px buttons; Post Update stays `.orb-btn-post` (32px, r14, pad 0/12). Page-level actions stay neumorphic raised. The New Goal wizard is a 680px r24 conversational wrapper (32px bot avatar + speech bubble above the 624px r16 form panel, 32px r9 close square, form gaps 15/23/22, label mb 7). The shell clamps all main content to `max-w-[1200px]` over a canvas washed with a fixed purple radial glow CENTERED in the viewport (no `at` clause, v2.2 pixel-verified); don't add per-view max-widths. The dashboard is a 2×2 grid (date card + 180px CSS-circle ring card (p-6) | stats panel with CENTERED columns (pad-10 inner blocks, **numerals in 88px well squares — `bg-orb-well` + 3px inset pair, r12 at md+ / FLUID SQUARES below md (104→199), numerals 30px/400 below md, clamp(28px,3.5vw,52px)/300 from md (v2.2)**, 12px `#665F57` subs, 16px gap); activity + goals below — 20px gaps, `.orb-panel` tier, activity card p-0 with full-width rows (30px solid icon circles, **row gap 12 with the detail sub-line WRAPPING to two lines — no truncate, v2.6 measured**, lh 20/18, timestamp in-row; the panel caps at 20 rows — v2.5, the full feed lives on the Activity view) and the 10px small-label "Next Planned Action" + 13px value (v2.5: derived from the first blocked TASK in display order — the tested `next-action.ts` seam fed by the store's `allTasks` slice, not the feed), goals card p 20/18/0 with header mb 20, inset-well rows (13px/500 titles, 11px meta, 14px/500 ring pct) + 60px rings); the greeting is 28px/leading-1.2 Title Case with a period. The check-in modal is 448px/radius 16/p24 (h2 16px/500 lh 16, "Post Status Update" 12px/600/ls 0.96/mb 12, description 13px `#6E6E6E`; v2.6 measured: radio grid → textarea mt 16 → Post Update mt 16, radio labels CONTENT-WIDTH blocks with the input as sibling — panel ~353 tall). Task cards are flat radius-14 deeper-tier rows (p 14/18, gray 11px status chip + dot, **6px chip→title gap, 4px title mb**, 14px/500 titles (`#BD3228` when blocked), 12px one-line descriptions, 11px meta, solid AI chip) with 26px action squares pinned outside the card, 2px apart. My Tasks ships five filter tabs (no Need Help; ls 0.72px 600-weight chips, pad 7/14, **single non-wrapping row with shrink-0 chips**); empty states render directly on the canvas with a plain `#B3B3B3` icon and 15px/400 title. The desktop sidebar is STICKY (aside top-0, height viewport−40px; the `.orb-raised-lg` panel owns the padding; compact 13px/600 brand, `.orb-label-sm` sections, 39px nav rows, plain Tasks Status link with 11px/700 numbers beside the 80px clock). The activity feed carries an inset-well "Online · N" pill, a 36px-icon hero card with the "Last agent action" caption, and 10px/600 `#B3B3B3` type tags on every group row; the hero ALSO repeats as the first row of its date group, so "Online · N" equals the count of timestamped rows (v2.5, measured); each date group's rows wrap in ONE big radius-14 deeper-pair card with the label as an inline span in a 24px line box, mb 10 (v2.6, measured). Mobile is FULL-BLEED below `md` (v2.2 — the live's crossover; no `sm:` growth through 767) with the padding split like the live (v2.1): main 16/6/90 + per-view containers (dashboard wrapper +16/+12 → hero x22/y90; list views +12/+24 → h1 x18/y102): app bar (logo + user pill; v2.9: rounded bottom corners 0 0 20 20, pad 14/20, CONTENT-DRIVEN height 56.5 logged-out / 62 authenticated, the literal ORBITAL brand) + a FULL-WIDTH bottom-attached tab bar (`rounded-t-[20px]`, upward shadow, content-height 73.5, 20px icons at the computed stroke 1.5 — v2.9 re-measure, 9px/600 labels; every view tab's chip STRETCHES THE FULL TAB WIDTH — `.orb-nav-active` r14 pad 8/4 on the active one; the MORE button carries its own pad + an 8px flex basis so it renders ~6.4px wider, color-only) + side-by-side 150px hero cards + COMPACT single-column mobile goal cards (v2.4: BARE status label — 7px status dot, gap 6, 11px/600 uppercase, no pill — beside a well-chipped percentage r8 pad 3/10 13px/500; 16px title; meta row with date + actions; v2.6: the DESKTOP goal-card chip's blocked count renders uppercase with 0.88 tracking, the MOBILE card's stays normal-case; every lucide glyph computes at the live's measured stroke — v2.9: 1.5 chrome/content via inline-style overrides, 2 on the action-button set, 1.8 back-chevron, 1.6 wizard bot) + non-wrapping filter chips + the MORE sheet (v2.0: r24, pad 20/20/40, upward shadow, 32px r10 raised close, 9px brand + Archivo 12px/600 ORBITAL, plain 16px/400 rows h 49, 20px list-todo glyphs, 20% + 4px-blur scrim). **768–1023 is a THIRD chrome state (v2.2): no sidebar/app bar — the desktop greeting header + a 52px Dashboard-back strip + desktop content (x48, main 12/20/100 list · 24/20/100 dashboard) + a FLOATING CENTERED PILL NAV (494×71 r20 z-[100], pad 10/16, gap 4, large panel shadow; brand 9px mark + 1px right divider + 11px ORBITAL ls 0.18em; SIX desktop tabs, each an anchor wrapping a chip span — min-width 52, r12, pad 8/12 — whose active state is the inset-well with a 9px/600 uppercase label)**; content transitions (88px wells, full labels, desktop goal cards, settings 2-col, ring 180) all fire at `md`.

## Implementation Standards

### Next.js 16 Specifics

- App Router; `src/app/page.tsx` (force-dynamic) passes a **nullable user** to the client shell — the workspace renders for unauthenticated visitors with empty states + LOG IN; `src/app/login/page.tsx` is a real route rendering the `LoginCard` for EVERY visitor (v2.11/F13: the live renders the card for authenticated users too — no redirect; re-sign-in lands on the workspace via the client flow, pinned in auth.spec). The view paths (`/goals`, `/goals/:goalId`, `/my-tasks`, `/tasks`, `/activity`, `/team`, `/settings`) are `rewrites()` in `next.config.ts` onto `/` — keep them in sync with `src/lib/router.ts`; `/login` must stay excluded from the rewrites.
- All server logic lives in route handlers under `src/app/api/`; there are no server actions.
- Client components are explicit: `orbital-app.tsx`, all views, dialogs, and the store carry `"use client"`.
- `next/font` loads DM Sans / DM Mono; do not import fonts any other way.
- `next.config.ts` pins `outputFileTracingRoot` — keep it; standalone deploys depend on it.
- Background/decorative images use plain `<img>` with `alt=""` + `aria-hidden` (deliberate; ESLint rule is off for this case).

### TypeScript Standards

- `strict: true` with `noImplicitAny: false` (intentional sandbox default).
- Domain types and DTOs are centralized in `src/lib/orbital.ts` — add new ones there, not ad-hoc in components.
- Route handlers cast parsed bodies to typed shapes and validate manually (trim, length caps, enum membership, existence checks). Follow that style; do not introduce Zod halfway.

### Tailwind CSS 4 + shadcn/ui

- App palette = `orb-*` utilities, defined as CSS variables in `src/app/globals.css` (neumorphic tokens: `--orb-canvas` `#EBE7E2`, `--orb-raised` `#EEEAE6`, `--orb-well` `#EBE7E2`, `--orb-track` `#DDD8D0`, plus the status colors) and mapped via `@theme inline`.
- `tailwind.config.ts` is legacy support for shadcn/ui HSL tokens and `tailwindcss-animate` — extend the CSS variables, not new config keys.
- Use shadcn primitives from `src/components/ui/` before writing bespoke UI; bespoke styling is the exception.

## Development Workflow

### Environment Setup

```bash
bun install
cp .env.example .env
bun run db:push
bun run db:seed
bun run dev          # http://localhost:3000 — demo@orbital.app / Demo1234!
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Development server (port 3000, logs to `dev.log`) |
| `bun run build` | Production build + standalone assembly |
| `bun run start` | Serve the standalone build (must run from repo root) |
| `bun run lint` | ESLint (flat config) |
| `bun run typecheck` | `tsc --noEmit` — the build sets `ignoreBuildErrors`, so this is the type gate |
| `bunx prisma generate` | Regenerate client after schema edits |
| `bun run db:push` | Apply schema to SQLite (no migrations folder) |
| `bun run db:seed` | Idempotent demo data reset |

## Testing Strategy

- **Unit layer** (`bun run test`, Vitest): 138 checks pinning the pure domain seams (incl. `src/lib/db-path.ts` — the SQLite URL resolution with the standalone-server chdir trap — pinned by `tests/db-path.test.ts`; `src/lib/router.test.ts` covers the `/tasks` view mapping since v2.7) — `src/lib/router.test.ts` (view ↔ path mapping incl. legacy `?view=` links), `clarify.test.ts` (wizard questions: fallback + LLM bounds), `domain.test.ts` (plan sanitizer, template fallback, check-in status mapping), `rate-limit.test.ts` (fixed-window buckets, eviction, retry-after), `team.test.ts` (email → display-name derivation, agent-field normalization), `next-action.test.ts` (dashboard next-planned-action: the first blocked task in display order — goal order then task order, unknown goals last, fallback), `logo-geometry.test.ts` (six-dot ring + 1-2-3 pyramid geometry), `calendar.test.ts` (month-grid math: boundaries, leap February, 6-row invariant, `isSameDay`; `formatLongDate` ordinals: 1st/2nd/3rd, 11th–13th, 21st/22nd/23rd, all twelve months), `activity-groups.test.ts` (feed date grouping: order, labels, midnight boundaries, "Today"), `activity-tags.test.ts` (feed type-tag mapping: underscores → spaces, unknown passthrough), `greeting.test.ts` (dashboard greeting: Title Case strings, 05:00/12:00/18:00 boundaries — the small hours greet evening), `relative-time.test.ts` (date-fns long-form distance: minute/hour/day/month/year bands, calendar-months path, singular/plural), `day-image.test.ts` (date-card photo rotation: four lighting variants, 5/11/17/21 boundaries, small hours = night).
- **End-to-end smoke suite** (`scripts/smoke-test.sh`): boots the production standalone server and runs 30 checks — health, auth (valid/invalid/unauthenticated), all read endpoints, task create, invalid-status rejection, check-in round-trip (status flip + update recorded), delete, logout invalidation, page render, path-route serving (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings` + 404 guard), the clarify endpoint (3 questions + validation), team validation (invalid email, agent without name), and the login rate limit (429 `RATE_LIMITED`). Exits non-zero on failure.
- **Pre-push gate** (mandatory, no CI exists): `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh && bun run test:e2e`.
- **Browser layer** (`bun run test:e2e`, Playwright — 115 checks in `tests/e2e/*.spec.ts`): boots the production standalone server on :3100 against an isolated `db/e2e.db` (global setup pushes + seeds it); a setup project signs the demo user in ONCE and shares the cookie via storageState because the auth rate limiter (10/IP/15min) makes per-test logins a trap. Pins the login round-trip, the SPA path routes + back/forward, the goals surface (seed order, blocked-count typography, add-task dialog, inline delete, the mobile goal-card chip inversion), the mobile/tablet navigation chrome (full-tab-width active chip, the wider MORE tab, MORE sheet, 768 pill nav), the v2.5 semantics — the hero-in-group feed rows ("Online · N" == timestamped rows), the dashboard's 20-row activity cap + task-based NPA, the regenerated seed plans (goals 2–3), and the logged-out LOG IN pill's measured spec (r12/pad 11-20 desktop · r10/small pair mobile) — and the v2.6 pins: the icon-stroke census (updated to the v2.9 computed values), the activity group card + label block, the dashboard row wrap, the desktop goal-chip blocked-count case, the date-picker weekday headers, and the check-in modal spacing — and the v2.7 pins: the anchor-navigation census (sidebar/tabs/pill/MORE-sheet/dashboard wells/Full log/New Goal/goal cards all carry real hrefs), the /tasks all-tasks view (counts, inert rows, no active tab), the /goals?new=true wizard deep link (soft nav + hard load), the layout-dashboard Home icon, the dead ring, and the inert mobile brand — and the v2.8 pins: every button computes cursor: pointer (the reference's global rule, re-added to the base layer — Tailwind v4's preflight sets no pointer), the goal-card anchors wrap the whole card with a button-origin click guard (the mobile edit/delete squares open dialogs WITHOUT navigating — a fixed v2.7 regression), the chrome shadows render clean single declarations (custom classes replacing the composed `shadow-[…]` utilities whose unset --tw-* vars emit zero-alpha prefixes), the MORE-sheet close's re-measured 3px/6px pair, the filter chips' literal 9999px radius, and the literal ORBITAL brand strings — and the v2.9 pins: the computed-stroke censuses at three widths (1.5 chrome / 2 action set / 1.8 back-chevron / 1.6 wizard bot), the login redesign (gradient page, top gradient bar, centered heading, 20px Google glyph, 16px input glyphs, responsive padding), the NATIVE dialog selects, the app-bar rounded bottom corners + content-driven height + ORBITAL brand, the pill-nav brand divider + chip min-width 52 + z-100, the goal-edit no-close, and the user-menu radius/name/LogOut specs — and the v2.10 pins: the scrim-flex dialog generation (z-200 flex root + relative panel child, the P 15/600 lh-22.5 mb-20 heading, the gap-14 form, the .orb-label-dlg lh-16.5/ls-0.88 labels, the mt-4/gap-10 button row, the 13px #5A5A5A close X, the goal-edit Draft|Active|Paused|Completed order + no asterisk), the check-in 5% anchor + 9999px radios + 16px textarea, the wizard r24/z-100/50% avatar, the z census (tab bar 100, sheet overlay 200), the clean .orb-chip-active/.orb-back-btn/.orb-clock/.orb-panel-shadow declarations, the sidebar brand x50 + collapse pad 8, the activity pill's [dot][Online][· N] flex structure (span-pinned; the count is a floor), the group-label lh 15, the Settings save 14, the invite 16/500 spec, the login explicit-margin mirror (card 746, blur 4px, inline labels, mt 6/16/20/12, field blocks 78), and the user-popover sideOffset 8 — with expect.poll settles on animation-affected reads.
- Manual QA matrix: every changed dialog must be exercised in both desktop and mobile layouts (full-width bottom tab bar + app bar + MORE sheet below `md`; floating pill nav + back strip at 768–1023).

## Code Quality Standards

```bash
bun run lint        # must exit 0 with no errors
bun run typecheck   # must exit 0 (the build won't catch type errors)
bun run test        # 138 unit checks must pass
bun run test:e2e    # 115 Playwright checks must pass
bun run build       # must compile clean
```

- No `TODO`/`FIXME`/placeholder text in shipped code (form `placeholder=` attributes are fine).
- Comments explain *why*, especially in `db.ts` (URL normalization) and `generate-tasks` (fallback logic).

## Git & Version Control

- **Branching**: `main` only — no feature branches.
- **Commits**: Conventional Commits with emoji prefixes — `:art: feat: …`, `:memo: docs: …`, `:bug: fix: …`. Atomic, one logical change each.
- **Identity**: `Pete A <pete@pop-os>`.
- **Push**: SSH wrapper from repo root — `python3 docs/ssh_git_wrapper_v3.py --key-file <key-outside-repo> --remote git@github.com:nordeim/project-management.git` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).
- **Never commit**: `.env`, `*.key`, `db/*.db`, screenshots of the reference app beyond `docs/screenshots/`.

## Error Handling & Debugging

- **Server**: every handler returns the envelope — `ok(data, status)` or `fail(code, message, status)`. Never throw across a handler boundary.
- **Client**: the store's `call()` converts failures into destructive toasts and returns `null`; actions treat `null` as "abort silently" — never re-throw into render.
- **Debugging**: `bun run dev` tails `dev.log`; production logs to `server.log`. Prisma queries log in dev, errors only in production (`src/lib/db.ts`).
- **Common failure**: `Error code 14: Unable to open the database file` = server started outside the repo root. Restart via npm scripts.

## Communication & Documentation

- `README.md` = user-facing entry; `Project_Architecture_Document.md` = engineering reference; this file = agent contract; `AGENTS.md` = compact operator notes.
- Update `src/lib/orbital.ts` metadata (labels/colors) whenever a status vocabulary changes, and reflect API changes in the README endpoint table.

## Project-Specific Standards

### Architecture

Four layers, strictly downward: schema → route handlers → domain types/DTOs + pure lib modules → store + views. Views never fetch directly; they read the store and call its actions. Pure domain logic (routing, clarify, sanitization, check-in mapping) lives in `src/lib/*.ts` with unit tests — route handlers stay thin DB wrappers.

### API Design

REST-ish resource routes under `/api` (auth, goals, clarify, tasks, team, activity, stats, settings, health). Filters via query params (`assignee=me`, `status=`, `goal=`). Validation is manual and returns `400` with a specific code; unknown ids return `404`; auth gaps return `401`. Generating tasks for an already-planned goal returns `409 ALREADY_PLANNED`. The wizard's clarify endpoint accepts a goal draft (`title`, optional `description`) and returns three questions; `generate-tasks` accepts optional `answers` from that step to sharpen the plan.

### Data Layer

Prisma + SQLite at `db/custom.db` (gitignored; recreate with `db:push` + `db:seed`). Eight models; `Task.goal` cascades on goal delete; `Task.assignee` nulls on person delete. `TeamMember` carries optional `description`/`instructions` for AI agents (v1.2). `WorkspaceSetting` is a fixed `singleton` row.

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file; relative paths resolve against `prisma/` | `file:../db/custom.db` |
| `AUTH_SECRET` | HMAC session secret — **required in production** | `openssl rand -hex 32` |

## Anti-Patterns to Avoid

- Adding per-view `app/` routes or changing the URL shape (breaks the SPA contract; the rewrite list in `next.config.ts` and `src/lib/router.ts` must stay in sync).
- Bypassing the store with ad-hoc `fetch` in components.
- Constructing `PrismaClient` anywhere but `src/lib/db.ts`.
- Letting `clarify` or `generate-tasks` hard-fail when the SDK is unavailable.
- Skipping the `ActivityLog` write in a mutating endpoint.
- Mixing the three status vocabularies (task vs goal vs check-in).
- Inlining logic that belongs in a tested `src/lib` seam.
