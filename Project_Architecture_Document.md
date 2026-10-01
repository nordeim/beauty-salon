# ORBITAL — Master Project Architecture Document (PAD) v2.15

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION-LOCKED BLUEPRINT
**Companion Documents:** `README.md` (user-facing), `CLAUDE.md` (agent contract), `AGENTS.md` (operator notes)
**Last Updated:** 2026-09-30
**Audience:** Senior Engineers, Tech Leads, DevOps, and Onboarding Engineers
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

#### Revision Block — v2.15

- `[NOTE]` **Parity verification (fourth consecutive clean paired survey — session 43, 2026-09-30)**: zero drift on every pinned surface, re-verified live (agent-browser, 390/768/1440, authenticated) AND on the clone's production build (`scripts/paired-probe-v214.mjs`): the mobile tab census (nav [0,770.5,390,73.5] z100 r20-top, four anchors 73.2×53.5 stroke 1.5 + MORE 81.2×53.5, active inset chip r14), the MORE sheet (overlay z200 `rgba(0,0,0,0.2)`, panel z201 [0,541,390,303] r24-top pad 20/20/40, rows → `/tasks`·`/team`·`/settings`, navigation functional on both apps), the 768 pill nav (494.3×70.5 z100 r20 pad 10/16 gap 4, six chips min-w52 r12), the desktop sidebar ([24,24,240,860] sticky, h39 rows), the New Goal pill (132.3×40 r12 pad 11/20), all six view h1s, the activity pill (99.7×30.5 pad 7/12 gap 6), the wizard deep link (scrim z100 `rgba(46,42,38,0.3)`, panel [380,174,680,552] r24 pad 28/28/24), the login card (448×746 r16 blur 4px), F13 (authenticated `/login` renders the card). Mobile navigation — the operator's named focus — confirmed byte-identical and functional on BOTH apps. F1–F13 closed, F14 the deliberate a11y keep.
- `[MOD]` **ADR-001 + §2 rewrite-count claims repaired (docs-only)**: the PAD's ADR-001 Decision, ADR-001 History, and §2 Application layer said "six" view paths/rewrites — stale since v2.7 added `/tasks` as the seventh; AGENTS/CLAUDE/README were already correct. Now "seven" with `/tasks` in both parenthetical lists + a v2.7 History note. Root cause recorded as SKILL lesson 23: count-claims drift independently across doc copies — grep every doc for the old number in the SAME commit a count changes.
- `[NOTE]` **Tailwind v4 audit (code-level, five checks)**: no regressions — the `button, [role="button"] { cursor: pointer }` base rule holds (`globals.css`); filter chips keep literal `rounded-[9999px]`; every remaining `rounded-full` site is circle-semantics only; the remaining `shadow-[…]` compositions carry fully-qualified rgba values; no `sm:` growth in the mobile shell.
- `[NOTE]` **Code-quality sweep clean**: no TODO/FIXME, no `console.log`, no `any` in `src/`, no skipped tests; security seams verified (scrypt + `timingSafeEqual` + HMAC + the fixed-window rate limiter); 16 route handlers as documented; rewrites ↔ `router.ts` in sync.
- `[NOTE]` **Verification**: full gate green on the pulled tree — lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke **from the trap-carrying shell with no per-command override** (the v2.14 G-1 immunity re-proven) · 115/115 Playwright; DB reseeded pristine 3/31/36 after the run (P-2 discipline). No source changes warranted. Tracked in `docs/parity-remediation-v2.15.md`.

#### Revision Block — v2.14

- `[NOTE]` **Parity verification (third consecutive clean paired survey)**: zero drift on every pinned surface (mobile tab census, MORE sheet + navigation, 768 pill nav, desktop sidebar/New Goal/F14 surfaces, six view h1s, activity pill, wizard deep link, add-task dialog, login card, F13 authed `/login`); F1–F13 stay closed, F14 stays the only recorded deviation (the deliberate a11y keep). The survey ran through a new self-contained paired probe (`scripts/paired-probe-v214.mjs`) that boots the production server as a child process — background servers do not survive between shell invocations in the sandbox.
- `[MOD]` **`scripts/smoke-test.sh` pins its own `DATABASE_URL`**: an inherited ABSOLUTE shell value (the sandbox exports a parent-workspace path that does not exist) passes through `resolveProcessDatabaseUrl` untouched and boots the server against a missing database — reproduced as 12/30 smoke failures in session 41. The script now pins `DATABASE_URL="file:../db/custom.db"` before the server boot (the same discipline `playwright.config.ts` always carried); the gate is immune to shell env traps without per-command neutralization.
- `[MOD]` **The v2.6 check-in panel-height pin settles through `expect.poll`** (`tests/e2e/v26-parity.spec.ts`): the last bare `evaluate` on an animation-affected surface — the modal's zoom-in-95 animation scales 353→~342 mid-flight, under the 345 floor (observed as a 1/114 first-run flake, green on re-run; pins unchanged, 10/10 repeated runs green after).
- `[MOD]` **`scripts/capture-all.sh` — one-invocation screenshot regeneration**: reseeds to pristine, boots the standalone server (pinned env), captures the 14 standard shots + the wizard pair with a real AI plan, cleans the scratch goal, verifies 3/31/36, shuts down — the whole capture pass shares one process tree. `scripts/capture-wizard.sh` re-asserts its 1440×900 viewport AFTER the first page open (a racing implicit browser launch could drop the resize, leaving 1280×577 shots).
- `[NOTE]` **Docs aligned**: README Playwright count (115, was stale at 73), SKILL §18 z-map (the v2.10 system: 50/100/200/201/210, was the retired 40/50 map), SKILL sessions 1–41 + lesson 22 (pin the env INSIDE the script), PAD §4.1 seeded ActivityLog rows (36 since the v2.5 seed regeneration, was 22).
- `[NOTE]` **Verification**: full gate green on the shipped tree — lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke (from the trap-carrying shell, no per-command override) · 115/115 Playwright; 16/16 screenshots regenerated.

#### Revision Block — v2.13

- `[NOTE]` **Verification pass** (session 39, 2026-09-24): the live byte-stable for the second consecutive survey — no drift on any pinned surface (mobile navigation re-verified byte-identical and functional on both apps); N-2 re-confirmed (the live's Team-view empty state is the reference account's data, not chrome); NO source changes warranted; 16 screenshots regenerated; infra re-verified (`.env` `DATABASE_URL="file:../db/custom.db"`, db/ at the repo root, vitest + playwright functional, `.env.example` tracked). Tracked in `docs/parity-remediation-v2.13.md`.

#### Revision Block — v2.12

- `[NOTE]` **Verification pass** (session 37, 2026-09-23): the first clean paired survey — zero drift; P-1 (reseed invalidates browser sessions — fresh user ids) and P-2 (smoke run leaves 4 activity rows, 36→40) recorded as process notes; 16 screenshots regenerated; no source changes warranted. Tracked in `docs/parity-remediation-v2.12.md`.

#### Revision Block — v2.11

- `[MOD]` **F13 closed — the authenticated `/login` behavioral drift**: the LIVE renders the full login card for AUTHENTICATED visitors (URL stays on `/login`, card byte-identical to the logged-out one; signing in from that state lands on the workspace). The clone had redirected authenticated visitors to `/` since v1.4 (pinned by auth.spec, documented across four docs). `src/app/login/page.tsx` now renders the `LoginCard` unconditionally — the page is session-independent (no `getSessionUser()` call), `safeFromUrl` + `force-dynamic` stay, `?from_url=` is honored after sign-in, and the client flow (`POST /api/auth/login` → `router.replace(fromUrl)` + `router.refresh()`) already produced the live's land-on-workspace behavior for authenticated re-sign-ins. The auth.spec pin inverted: authenticated visit → the card renders at `/login`; re-sign-in → `/` (115 e2e total).
- `[NOTE]` **F14 recorded (not fixed)**: the live's desktop user pill is a plain inline-styled DIV (pad 11/16 · `var(--radius-button)` · well bg · the 0.68/0.24 inset pair · cursor pointer · user-select none — a Base44 platform artifact). The clone keeps its Radix `PopoverTrigger` `<button>` with byte-equal computed geometry as a deliberate a11y deviation (the same class of keep as `aria-current="page"`).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke · **115/115 Playwright** — plus a paired re-probe of the changed surface (authenticated `/login` renders the card on BOTH apps; re-sign-in lands on `/` on both) and the mobile-navigation focus re-verified byte-identical (390 tab census, MORE sheet 200/201 with functional rows, 768 pill nav 494.3×70.5). All 16 screenshots regenerated from the production build.

#### Revision Block — v2.10

- `[MOD]` **Dialog form generation re-built (measured on the live)**: the standard form dialogs (add-task / task-edit / goal-edit) render the scrim-flex root — `fixed inset-0 z-[200] flex items-center justify-center p-[24px_16px]` with the per-kind 0.3 scrim — whose CHILD is the relative panel (r20, max-w 500/480, pad 28/28/24, NO panel shadow). Inside: `<p>` 15/600 lh 22.5 mb-20 headings (DialogTitle keeps no base typography — the Radix Slot concatenates classes without tailwind-merge, so the old `text-lg leading-none` base beat the per-use leading in v4 stylesheet order), `flex flex-col gap-[14px]` forms, `.orb-label-dlg` labels (11/600/uppercase/ls 0.88/lh 16.5/mb 6/`display: block` — the shadcn Label flex base would size the box to the font's ascent box, 16 not 17), h-35.5 inputs / h-37.5 dates, mt-4/gap-10 button rows (goal-edit mt-6), the 13px `#5A5A5A` close X, and goal-edit's Draft|Active|Paused|Completed option order with no Title asterisk. The invite dialog carries the 16/500/lh-16/ls-0.4 H2, 12/500 normal-case labels and 36px role toggles.
- `[MOD]` **Coherent z-system**: tab bar 40→100 · MORE-sheet overlay 50→200 (panel 201) · form-dialog roots 50→200 · wizard scrim 50→100 · date-picker popover 50→210 (it portals to `<body>` while the live's picker lives inside its dialog's stacking context — a documented structural deviation that keeps the picker ABOVE the z-200 dialogs).
- `[MOD]` **Check-in modal re-anchored**: `top-[5%]` below sm (centered from sm), literal-9999px radio circles with content-width label rows, a 16px note textarea, and the canvas-bg close square.
- `[MOD]` **Wizard chrome**: r24 at every width, z-100 scrim, 50%-radius bot avatar, 14px title-input pad-x.
- `[MOD]` **Remaining v4 serialization sites cleaned**: `.orb-chip-active` (768 pill chip), `.orb-back-btn` (back strip), `.orb-clock` + `rounded-[50%]` (sidebar clock), `.orb-panel-shadow` (picker inner card) + r16 chevrons — plain declarations that byte-match the live.
- `[MOD]` **Login form mirrors the live's COMPUTED margins (the space-y flip)**: Tailwind v4's `space-y-*` applies `margin-block-end` to `:not(:last-child)` — v3 applied margin-top to the later siblings — so the clone's v4 space-y rendered identical VISUAL gaps on the WRONG elements (label mb 6 vs the live's input-wrapper mt 6; field-block mb 16 vs password-block mt 16; the google→divider gap grew 12px under a wrapper space-y). The form now uses explicit mt utilities (input wrapper mt-[6px], field blocks mt-3/sm:mt-4, bottom block mt-4/sm:mt-5, footer mt-3) + `inline leading-5` labels whose 24px strut line box (block fs 16/lh 24) makes each field block 78 tall — the card lands at exactly 746 over the 4px backdrop blur.
- `[MOD]` **Activity pill**: a DIV carrying [7px dot][Online][· N] flex children, ls 0.66px on "Online" only. The live computes 101×30.5 — its width delta vs the clone's 103 is the FONT: the live serves no DM Sans file (font-family falls back to system-ui — a Base44 platform artifact like its public-read API); the clone's self-hosted DM Sans advances ~2px wider at identical fs/fw/ls. Documented deviation; the e2e pin asserts the child spans (count-independent), not the total width (the count digits are proportional).
- `[MOD]` **Assorted**: Settings save glyph 14px (explicit `size-3.5` opts out of the shadcn Button's 16px svg base), sidebar brand x50 + p-2 collapse bar, user popover sideOffset 8 (the live measures pill-bottom 92 → popover-top 100 exactly).
- `[NOTE]` **Finding F13 (RESOLVED in v2.11)**: the LIVE's `/login` renders the login card for AUTHENTICATED visitors (no redirect) — the clone redirected to `/` (pinned by auth.spec + documented since v1.4). Closed by the v2.11 revision: the page now renders the card unconditionally and the auth.spec pin asserts the live's behavior.
- `[NOTE]` **Measurement-artifact class (pinned in the specs with expect.poll)**: the dialogs/popovers animate (zoom-in-95 + slide-in) — mid-flight reads under-measure boxes by the scale factor (label 17→16, check-in 42.2→49, button row 34→33, popover gap 8→6.3). The pins stay at the settled values; the specs poll until the transform finishes.

#### Revision Block — v2.9

- `[MOD]` **Icon stroke system re-split (COMPUTED-STYLE parity — the v2.6 census was a methodology artifact)**: the reference's icons render at computed 1.5px — every lucide svg carries an inline `stroke-width: 1.5` style while the presentation attribute stays "2" (CSS beats presentation attributes; `getAttribute` misses the override — always read `getComputedStyle(svg).strokeWidth`). ~45 sites across 15 files now pass `strokeWidth={1.5}` (sidebar, tab bar, pill nav, MORE sheet rows, feed rows, task meta, the AI zap, empty states, Full-log arrows, the wizard's deadline calendar); the measured ACTION-BUTTON set keeps the lucide default 2 (NEW GOAL plus, card action squares pencil/trash, goal-detail DELETE + Target calendar, Team plus buttons, Settings chevron-downs + save, dialog close Xs, the check-in Send, the wizard X + sparkles, the date-picker popover chevrons, login mail/lock, the popover LogOut); two specials — the 768 back-strip chevron-left renders 1.8 and the wizard's bot avatar 1.6.
- `[MOD]` **Login page restyled to the reference's redesign**: slate gradient canvas (from-slate-50 to-slate-100, p-4); the card gains a 4px top gradient bar, backdrop-blur-sm, overflow-hidden, and responsive padding (p-8 / sm:p-10 / md:48-40-40); the content column is CENTERED (items-center text-center) with `text-2xl sm:text-3xl` heading; the logo chip sits in a group wrapper with a blurred gradient halo; the Google button carries a 20px glyph (the shadcn Button's `[&_svg:not([class*='size-'])]:size-4` base forces 16px — the glyph opts out with `size-5`); input glyphs are 16px; the footer is sm:flex-row with a combined "Need an account? Sign up" button. The state logic (signin/signup/forgot, toasts, ?from_url) is unchanged.
- `[MOD]` **Mobile app bar**: rounded bottom corners (`rounded-b-[20px]`), `p-[14px_20px]` with a CONTENT-DRIVEN height (56.5 logged-out / 62 authenticated — the fixed h-[62px] removed), and the literal ORBITAL brand string.
- `[MOD]` **768 pill nav**: the brand wrapper gains a 1px right divider (rgba(160,143,126,0.18)); every tab restructures to anchor > CHIP span (min-width 52, r12, pad 8/12, transition 150ms) with the ACTIVE well on the chip (the pill now renders 494 wide like the reference); the nav computes z-100.
- `[MOD]` **Dialog corrections**: goal-edit drops its close square AND its heading icon circle (the reference's Edit Goal panel carries zero svgs — only the status control + Cancel + Save); the dialog form selects (add-task status/assignee, task-edit status/assignee, goal-edit status) convert to NATIVE `<select>` elements (216×35, bg #EBE7E2, r10, 13px — the new `.orb-select` class); the SETTINGS selects keep their shadcn triggers (their chevron-downs are measured live at stroke 2).
- `[MOD]` **User menu**: the pill computes radius 12 (the `rounded-xl` shadcn `--radius` trap resolved to 20px) with pad 11/16 and a 12px/500 `#6E6E6E` name; the popover computes radius 12, opens 8px below the pill, and its LogOut glyph renders at 14px (was 24).
- `[MOD]` **Remaining v4 shadow-composition artifacts eliminated**: `.orb-inset` (the standard 3px 0.68/0.24 inset well pair) replaces the `shadow-[inset…]` utilities on the input/textarea/select-trigger/date-picker-trigger primitives and both user pills; `.orb-pop-shadow` cleans the user popover's raised pair; the MORE sheet computes z-[201] (over the dialogs' z-50, mirroring the reference's 201-over-200 order).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke · **91/91 Playwright** (73 prior + 18 net-new v2.9 pins) — plus computed-style re-probes EXACT on every changed surface (stroke censuses 30/30 at 1440, 29/29 at 768, 27/27 at 390 sheet-adjusted; the app bar, the pill nav 494, the back-chevron 1.8, the wizard icon set, the goal-edit controls, the LogOut row, the sheet z 201, the clean inset declarations) and a VLM sanity pass on the regenerated screenshots.

#### Revision Block — v2.8

- `[MOD]` **Button cursor affordance (systemic, Tailwind-v4 regression class)**: the reference's global stylesheet carries `button, [role="button"] { cursor: pointer }` (read out of its CSSOM); Tailwind v4's preflight sets no pointer, so the clone's buttons silently rendered the UA arrow. The base layer in `globals.css` now mirrors the reference's exact rule — every button (NEW GOAL, filter chips, action squares, dialog controls, selects, MORE trigger/close, the user pill) computes `cursor: pointer`.
- `[FIX]` **Mobile goal-card action regression (introduced by v2.7's anchor conversion)**: the edit/delete squares sat INSIDE the card anchor and their clicks bubbled into `navigate("goal-detail")` — clicking edit NAVIGATED instead of opening the dialog. Both card anchors now guard button-origin clicks: `e.target.closest("button")` → `preventDefault()` + return (the preventDefault matters — without it the browser follows the anchor's href as the default action).
- `[MOD]` **Goal-card anchor coverage (measured)**: the reference's card anchor wraps the ENTIRE card — text column AND the 120px stats/action column (1072px at 1440). The desktop anchor is now the full-width flex row; the dashboard goal wells nest as BARE anchors wrapping inner well divs (the anchor's own computed shadow stays `none`).
- `[MOD]` **Tailwind v4 shadow/radius serialization artifacts eliminated on the chrome**: v4 composes every `shadow-[…]` utility with unset `--tw-*` ring/inset vars, so computed box-shadow strings carried four zero-alpha prefixes; `rounded-full` serializes as `calc(infinity*1px)` (33554432px in Chrome). The chrome (app bar, mobile tab bar, MORE sheet, 768 pill nav, sheet close) uses plain-declaration custom classes (`.orb-appbar-shadow` / `.orb-tabbar-shadow` / `.orb-sheet-shadow` / `.orb-pill-nav-shadow` / `.orb-sheet-close`) that byte-match the reference's computed strings; the filter chips (goals / my-tasks / tasks) pin `rounded-[9999px]`. The sheet close square also moves to the re-measured 3px/6px `0.78/0.27` pair (the v2.0 4px/8px/0.28 reading retired).
- `[MOD]` **Brand strings render the literal `ORBITAL`** (sidebar + MORE sheet + pill nav): the reference's textContent is the uppercase string with a redundant `text-transform: uppercase` on the span — mirrored exactly (the clone previously rendered "Orbital" + the transform). The sidebar brand anchor drops its `pl-2.5 rounded-xl` (hit area 101.3 → 91.3, matching the reference's classless pad-0 anchor).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke · **73/73 Playwright** (59 prior + 14 net-new v2.8 pins: the cursor census, the mobile-pencil-dialog fix, the full-card anchor coverage, the well nesting, the five exact chrome-shadow strings, the close-square pair, the chip radius, the brand textContent) — plus computed-style re-probes EXACT on every changed surface (cursor census 17A/2B pointer on both apps; goal wells 490×84 anchor-shadow-none/inner-well on both; card anchors 1072×166 on both; chips 9999px pointer on both; brand ORBITAL/uppercase/pad-0 on both) and a VLM sanity pass on the regenerated screenshots.

#### Revision Block — v2.7

- `[MOD]` **Navigation is ANCHOR-BASED (measured on the re-deployed live, 2026-09-23)**: every view-switch surface renders a real `<a href>` — sidebar nav ×6 + the brand + the TASKS STATUS widget, the mobile tab bar ×4 (MORE stays a `<button>`; the Home icon swaps `layout-grid` → `layout-dashboard`), the 768 pill nav ×6 (its "Tasks" targets `/my-tasks`), the MORE sheet rows ×3, the dashboard stat wells (`/goals`, `/my-tasks` ×2) + goal wells (`/goals/<id>`) + "Full log" ×2 (`/activity`, `/goals`) + the New Goal pill, and the goals-view cards (`/goals/<id>`). The clone keeps the SPA: a shared click contract (`preventDefault` + store `navigate` on plain left clicks; modified/middle clicks fall through so the truthful href opens a real tab).
- `[ADD]` **The all-tasks view at `/tasks`** (the live's new view): h1 "Tasks" + "{n} total tasks across all goals", the My-Tasks five-chip filter row with workspace-wide counts, and TaskCard-content rows as PLAIN `cursor-pointer` divs — NO action squares, NO open-on-click (the reference's row click is inert — their WIP seam, replicated). Entry point: the mobile MORE sheet's "Tasks" row ONLY; no navigation surface lights up on it. `router.ts`/`next.config.ts` gain the `/tasks` mapping; the store's `allTasks` slice feeds it.
- `[ADD]` **The `/goals?new=true` deep link**: the dashboard's New Goal link navigates to goals AND auto-opens the wizard — soft nav via the store's `newGoalIntent` flag (`openNewGoal()`), hard loads/popstate via `boot()`/`applyUrlState()` URL parsing; the GoalsView dialog derives its open state from the flag (no mount-time state write — the dialog closes clear the intent), and `syncUrl` keeps `?new=true` in the URL like the reference.
- `[MOD]` **Dead interaction seams replicated (measured)**: the dashboard completion ring is a PLAIN `cursor-pointer` div with no click handler (the live's ring does nothing on click — the v1.5 "Open goals" affordance is gone; the user pill's Log Out popover still works on both and stays), and the mobile app-bar brand is a plain element (not clickable). The TaskCard button gains `cursor-pointer` (the live's rows show the pointer cursor).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · **138/138 unit** (the `/tasks` router mapping pinned) · build clean · 30/30 smoke · **60/60 Playwright** (44 + 16 net-new v2.7 checks: the anchor census across every surface, the `/tasks` view, the wizard deep link on soft nav AND hard load, the layout-dashboard Home icon, the dead ring, the inert mobile brand) — plus computed-style re-probes EXACT on every changed surface (sidebar href map, tab census with anchors, `/tasks` chips + rows, MORE sheet hrefs, the wizard auto-open, the ring's DIV/pointer/dead state) and a VLM sanity pass on the regenerated screenshots (16-tasks.png added).

#### Revision Block — v2.6

- `[MOD]` **Icon strokes are SINGLE-CLASS: every lucide glyph renders at the DEFAULT strokeWidth 2** (measured on the re-deployed live, 2026-09-23 — retires v2.4's two-class chrome-1.5/content-2 split; the live has flipped strokes twice in three deploys): mobile tabs ×4 (20px), MORE sheet rows ×3 (20), pill tabs ×6 (18), sidebar nav ×6 (16) + collapse chevron (14), the 768 back-strip chevron (15, was 1.8), dashboard activity glyphs (13) + "Full log" arrows (12), activity-view hero Search (16), task-card meta User/Calendar/Clock (11), the AI-chip Zap (9), the date-picker trigger Calendar (14), the wizard Bot (was 1.6) — ~33 sites across 13 files normalized, mostly by DELETING the `strokeWidth` prop so the lucide default applies (the durable convention — the simplest reading survives re-deploys).
- `[MOD]` **Dashboard activity rows: gap 12 + the detail WRAPS** (measured): `ActivityRow` gap 14→12 (`gap-[12px]`) and the detail sub-line no longer truncates — the live's long first row renders 86.5px (two 18px lines); the divider reading is border-bottom `rgba(163,163,163,0.18)` on all but the last row (the earlier border-top `#D8D4CF` was an inert declaration, verified equal).
- `[MOD]` **Activity view: each date group's rows wrap in ONE big radius-14 deeper-pair card** (measured — retires the v1.9 "plain rows, no card wrapper" reading and finally aligns the code with what AGENTS.md has claimed since v1.9): the card spans the full content width and carries `.orb-row-card` (the existing primitive); rows inside keep pad 14/18, gap 14, border-bottom `rgba(160,143,126,0.15)` dividers. The date label renders as an inline span inside a 24px line box with margin-bottom 10px (the text sits ~7px lower than a plain block P; the old P was lh 15 + mb 14).
- `[MOD]` **Desktop goal-card chip: the blocked count renders UPPERCASE with 0.88 tracking** (measured — retires the v2.3 normal-case reading for the DESKTOP chip; live inner span 73px vs the clone's 56px, same 11px/500 `#BD3228`): the MOBILE goal card's blocked count stays normal-case (verified equal on the live). The mobile pct chip gains `tracking-[-0.01em]` (−0.13px at 13px, measured).
- `[MOD]` **Date picker: weekday headers 11px/700 `#9A9A9A` on a 25px row** (measured; was 500 `#6E6E6E` on 21px) with the month-row margin rebalanced so the popover height matches the live's 271px (was 275).
- `[MOD]` **Check-in modal spacing**: the radio grid → textarea → Post Update stack uses margin-top 16 (was mb 8), and the radio labels render as CONTENT-WIDTH blocks with the input as a sibling (grid columns auto; was fixed 196px flex labels) — panel 353px tall (was 322).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · **137/137 unit** · build clean · 30/30 smoke · **44/44 Playwright** (36 + 8 net-new v2.6 checks; the four v2.4-era stroke assertions rewritten to stroke 2 in place) — plus computed-style re-probes of every changed surface (stroke census IDENTICAL via named-glyph scan on both apps; dashboard rows 86.5 wrap exact; group card + label block exact; chip exact; picker 271 + headers 700 `#9A9A9A` exact; modal 352≈353 exact; mobile tabs 73×4+81 at stroke 2 identical) and a VLM sanity pass on the regenerated screenshots.

#### Revision Block — v2.5

- `[MOD]` **Activity feed: the hero entry ALSO renders in its date group** (measured on the re-deployed live, 2026-09-22 — retires the v1.9 `slice(1)` reading): the most recent entry appears BOTH as the standalone "Last agent action" hero card AND as the first timestamped row of its date group — `activity-view.tsx` now groups the FULL feed (`groupActivityByDate(activity)`), so the "Online · N" pill count equals the number of `… ago` rows (live: 36/36; the old clone rendered N−1).
- `[MOD]` **The dashboard's Agent Activity panel CAPS AT 20 ROWS** (measured): `dashboard-view.tsx` slices `activity.slice(0, 20)` — the full feed lives on the Activity view ("Full log"). With the new 36-entry seed the panel renders exactly 20 rows on both apps.
- `[MOD]` **Next Planned Action derives from BLOCKED TASKS, not the feed** (the regenerated live carries zero status-update rows yet still shows `Resolve blocker on "Review Q3 project milestones"`): `src/lib/next-action.ts` rewritten as a task-based seam — `nextPlannedAction(tasks, goals)` sorts blocked tasks by display order (goal order via the goals list, then task `sortOrder`; unknown goals last) and surfaces the first; fallback unchanged. The store gained an `allTasks` slice (`/api/tasks`) refreshed at every activity-refresh site (12 call sites), and the dashboard passes `allTasks + goals`.
- `[MOD]` **Logged-out LOG IN pill re-measured** (first crawl of the logged-out shell ≥1024 — the state v2.4 flagged as uncrawled): desktop/tablet (≥768) = radius **12**, pad **11px 20px** (content-driven h40 = 11 + lh18 + 11), the STANDARD raised pair; mobile app-bar variant = radius **10**, pad **6px 14px** (h≈28.5), the SMALL pair `-3px -3px 6px rgba(255,250,244,0.78) / 3px 3px 6px rgba(160,143,126,0.22)`. Trap: `rounded-xl` resolves to 20px through the shadcn `--radius: 1rem` token — use explicit `rounded-[12px]`/`rounded-[10px]`.
- `[MOD]` **Seed data regenerated to mirror the live's new workspace**: goal 2 "Launch new landing page" (new description + a new 9-task plan — 8 done + Templates Base44's overdue in-progress A/B task); goal 3 "Q3 Content Marketing Campaign" (new description + a new 10-task plan — all done, incl. the manual no-AI "Draft Q3 blog post calendar"); people directory += "Templates Base44" + "Content Team" (11 named people); activity feed = **36 entries** (3 `goal_analyzed` + 3 `tasks_generated` at 12/9/10 + 30 `task_assigned`, all 2026-07-16, one "Thu Jul 16 2026" group, newest-first).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · **137/137 unit** (next-action seam rewritten under TDD: 6 checks) · build clean · 30/30 smoke · **36/36 Playwright** (29 + 7 new v2.5 checks) — plus computed-style re-probes of every changed surface (activity view 36 rows + single date label exact on both apps; dashboard cap 20 + NPA string exact; goals 2–3 detail text IDENTICAL word-for-word; goal-detail named-glyph census identical; LOG IN pill exact at 1440/768/390).

#### Revision Block — v2.4

- `[MOD]` **Mobile bottom-nav chips STRETCH THE FULL TAB WIDTH** (re-measured on the re-deployed live, 2026-09-22 — retires v2.3's content-width reading): the view-tab buttons carry NO padding (and NO min-height — the bar is content-height driven at 73.5 = pad 8/12 + chip 53.5); every tab's chip (gap 4, pad 8/4, r14, transition 150ms) fills the entire tab (73.2 of 73.2 at 390, 67.2 at 360 — scales with viewport); the ACTIVE chip keeps the `.orb-nav-active` bright inset pair. The MORE button carries its OWN pad 8/4 plus an 8px flex basis (`flex-[1_1_8px]`, mirroring the live's content-box basis participation) so it renders ~6.4px WIDER than each view tab (81.2 vs 73.2 — verified at 390 and 360) and never carries the well. Pinned by three new Playwright checks (full-width chip, wider MORE, 1.5 stroke).
- `[MOD]` **Icon strokes are a two-class system** (live re-deploy normalization): NAV CHROME renders lucide glyphs at strokeWidth **1.5** — mobile tabs (20px), MORE-sheet rows (20px), pill tabs (18px), sidebar nav (16px) + the inline panel glyph (18px), dashboard "Full log" arrows (also resized 14→12px), the AI-chip zap, and every empty-state icon (22/28px). CONTENT icons use the lucide DEFAULT **2** — task/goal edit-delete pencils+trash, login Mail/Lock, the wizard's sparkles/X, the NEW GOAL plus (the dashboard pill's plus is the LUCIDE glyph at 13px@2 — the hand-rolled 14-viewBox plus was fuller). Exceptions: the 768 back-strip chevron stays **1.8** (verified equal on the live); the wizard's Bot avatar is **1.6**. Glyph swaps: date glyphs are plain `Calendar` (NOT `CalendarDays`) everywhere (picker trigger 14px `#9A9A9A`@1.5, task meta 11px, goal-detail target line 13px); the AI chip carries a `Zap` (NOT `Sparkles`) at 9px/1.5 with 0.5px letter-spacing. Trap fixed en route: the shadcn Button base `[&_svg:not([class*='size-'])]:size-4` forces 16px on child glyphs — the wizard's 13px icons now opt out via an explicit `size-[13px]` class.
- `[MOD]` **Mobile goal-card top row is INVERTED vs v2.1's reading** (live re-measurement): the status renders as BARE text — 7px status-colored dot (gap 6) + 11px/600/uppercase/ls 0.88 `#6E6E6E` + normal-case coral blocked count, NO pill — and the percentage moves into a SMALL WELL CHIP: bg `#EBE7E2`, radius 8, pad 3/10, the 2px inset pair rgba(255,250,244,0.8)/rgba(160,143,126,0.28), 13px/500 `#3A3A3A` (h25.5; verified on all three seeded goals). The row carries mb 10 and the title mt 0 (card h≈136). The DESKTOP card keeps the pill status chip + bare 42px pct (v1.6, unchanged — re-verified).
- `[MOD]` **Wizard micro-spec**: close X color `#5A5A5A`; close-square dark-shadow blur 10px; CONTINUE/GENERATE sparkles at 13px (size-class opt-out above).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · **137/137 unit** · build clean · 30/30 smoke · **29/29 Playwright** (26 + 3 new) — plus computed-style re-probes of every changed surface at 390/768/1440 (tab census EXACT: [73.2×4, 81.2] both apps; goal-card internals exact to the decimal; named-glyph censuses identical across goals/goal-detail/dashboard/team/my-tasks/wizard; AI chip zap/1.5/ls-0.5 exact) and a VLM sanity pass (goal-card pair MATCH; tab-bar VLM claims contradicted by bounding-box measurement — documented misreads).

#### Revision Block — v2.3

- `[MOD]` **Mobile bottom-nav ACTIVE tab carries an INSET-WELL chip** (re-measured on the live after the v1.7 "color-only active state" reading stopped matching): EVERY tab wraps its icon+label in a `flex column center` chip (gap 4, pad 8/4, radius 14); the ACTIVE tab's chip gets the BRIGHT inset pair — `bg #EBE7E2`, `inset -3px -3px 6px rgba(255,252,248,0.75)`, `inset 3px 3px 6px rgba(180,165,150,0.32)` (the `.orb-nav-active` pair) — inactive chips stay transparent. The MORE tab NEVER carries the well (its active state remains color-only). Pinned by the Playwright mobile-navigation spec.
- `[MOD]` **Team view (v2.3, measured)**: the INVITE button label is RESPONSIVE — `<Plus 12/> <span class="hidden sm:inline">Invite Member</span><span class="sm:hidden">Invite</span>` (w≈96 below sm, w≈150 from sm; aria-label "Invite Member"); both the Team h1 header and the AI-Agents section header are NO-WRAP `flex … justify-between` rows with `shrink-0` buttons (the AI-Agents NEW AGENT pill stays inline right at every width — the old `flex-wrap` dropped it below at 390).
- `[MOD]` **Goal-card blocked count renders in BODY CASE + NORMAL TRACKING** (`normal-case tracking-normal` on the "· N blocked" span — measured w55.9 vs the uppercase 73.1; the surrounding status chip stays uppercase/ls 0.08em).
- `[MOD]` **Seed goal order matches the live**: Product Onboarding Redesign (sortOrder 1) → Launch new landing page (2) → Q3 Content Marketing Campaign (3); the API orders by `sortOrder asc, createdAt desc`.
- `[MOD]` **Login logo is a CIRCULAR chip** (v2.3 re-measurement retires the v1.9 rounded-square reading): `rounded-full ring-4 ring-white/50 shadow-lg`, 80px below sm / 96px from sm, same purple 1-2-3 dot pyramid.
- `[NEW]` **SQLite URL resolution extracted into `src/lib/db-path.ts`** (pure seam, pinned by `tests/db-path.test.ts` — 15 checks): relative `file:` URLs resolve against the first anchor containing `prisma/schema.prisma`. Anchor order: (1) the standalone-detector root — Next's standalone `server.js` runs `process.chdir(__dirname)` into `.next/standalone` BEFORE modules execute, and the file tracer copies `prisma/schema.prisma` into that folder, so the plain CWD rule resolves against the BUILD OUTPUT; the detector (`standaloneRepoRoot`) recognizes the in-repo standalone dir (basename + server.js + grandparent schema) and returns the real repo two levels up; (2) the module's own repo root, validated by the source file existing on disk (the Turbopack standalone runtime rewrites `import.meta.url` into a VIRTUAL `<standalone>/src/lib/db-path.ts` that must be ignored); (3) the CWD (pre-v2.3 behavior, kept as fallback — deployed copies own their CWD; `docs/DEPLOYMENT.md` §4 tells production to use absolute URLs).
- `[NEW]` **Playwright E2E layer** (`tests/e2e/`, 26 checks — `bun run test:e2e`): boots the production standalone server on :3100 with an isolated `db/e2e.db` (global setup pushes + seeds), a setup project signs the demo user in ONCE via storageState (per-test logins trip the 10/IP/15min auth rate limiter), and the specs pin the login round-trip, SPA path routes + back/forward, goals surface (seed order, blocked typography, add-task dialog, inline delete) and the mobile + 768 navigation chrome.
- `[NEW]` **Site metadata wired**: `metadataBase` from `NEXT_PUBLIC_SITE_URL` in `layout.tsx` + `src/app/sitemap.ts` — the `.env.example` contract now matches the code; `docs/DEPLOYMENT.md` added (§4 = database location).
- `[NOTE]` **Verification**: full gate green — lint 0 · typecheck 0 · **137/137 unit** (122 + 15 db-path) · build clean · 30/30 smoke · **26/26 Playwright** — plus a two-session computed-style re-probe of every changed surface at 390/1440 (tab-bar chip exact; INVITE x276.4 y102 w95.6 exact; NEW AGENT x243.3 inline exact; blocked span w55.9 ls-normal exact; login chip 96px circular) and a VLM sanity pass (NEAR-IDENTICAL on all four changed mobile surfaces; 9 VLM misreads disproven by measurement across the session).

#### Revision Block — v2.2

- `[NEW]` **The shell has a THREE-state chrome** (bisected on the live app; the clone previously jumped mobile→desktop at `lg`): **< 768** mobile (app bar 62 + full-width bottom tab bar); **768–1023** the MIDDLE STATE — no sidebar, no app bar: the desktop greeting header renders on the dashboard, list views carry a 52px strip with a "Dashboard" back button (chevron-left 15 `#9A9A9A` + 13px/500 `#6E6E6E`, ~112×34 raised r10), main pads `12/20/100` (list) · `24/20/100` (dashboard), content = the DESKTOP components (goal cards 672×166, settings 2-col, 88px wells) at x48, and navigation is a FLOATING CENTERED PILL (~494×71, `fixed bottom-4 left-1/2 -translate-x-1/2`, pad 10/16, gap 4, `bg-orb-raised` r20, LARGE panel shadow pair) holding the brand (9px mark + ORBITAL 11px/600/ls 0.18em, brand `mr-1`) and SIX desktop tabs (18px icons, column gap 3, pad 8/12, r12; ACTIVE = inset-well chip `bg-orb-well` + the 3px inset pair, 9px/600/ls 0.36px uppercase label `#3A3A3A`; inactive `#767676`/400); **≥ 1024** the desktop sidebar. The live renders three DOM subtrees (`md:hidden` / `hidden md:block lg:hidden` / `hidden lg:block`); the clone mirrors the geometry with `md:`/`lg:` utility boundaries.
- `[MOD]` **All content-component transitions moved `sm:` → `md:`** (the live keeps the FULL mobile spec through 767 — main 16/6/90, no `sm:` growth): stat wells 104→88, short→full labels, ring 48%→180px, stats panel 10/14→20/24, mobile→desktop goal cards, settings 1→2 col, greeting header visibility, app bar/tab bar `md:hidden`.
- `[MOD]` **Mobile stat wells are FLUID SQUARES** (`aspect-square`, ~104 at 390 → 199 at 700 — replaces v2.1's fixed `w-[104px]`), and the md+ numeral floor drops to **28** (`clamp(28px,3.5vw,52px)`/300 from md; mobile stays fixed 30/400) — numerals 28px at 768, 35.8 at 1024, 50.4 at 1440.
- `[MOD]` **Desktop grid tracks are ASYMMETRIC below 1280**: `lg:grid-cols-[minmax(0,1fr)_minmax(438px,1fr)]` — date column 198 at 1024 (the date card starves to ~2px and clips invisible under overflow-hidden, like the live), 374 at 1200, equal halves ≥1280 (the old `lg:grid-cols-2` was equal at every width). The date card also drops a vestigial `p-[10px_12px]` (both children absolutely positioned — the padding only created a 24px flex floor) and gains `lg:flex-1` + `min-w-0` so it starves like the live's.
- `[MOD]` **The canvas glow is CENTERED at every breakpoint**: `radial-gradient(600px, rgba(201,179,245,0.35) 0%, rgba(0,0,0,0) 70%)` with NO `at` clause — verified by an isolated-layer pixel analysis (hide every off-chain sibling, screenshot, centroid). The earlier `87.44% 95.38%` (v1.5) and `59.17% 29.89%` (v1.8) readings were content-pollution artifacts.
- `[MOD]` **Goal-detail**: stats grid ALWAYS 2-col `2.04fr:1fr` (209+97 side by side even at 390 — the `sm:` stacking was wrong); view root keeps `px-7 pt-6` at mobile (content x34, unlike list views' x18); header = `mt-6 flex items-start justify-between` with NO gap/wrap — the title block (`flex-1 min-w-0`, chip at +5px, desc mt 5, Target mt 8) takes every leftover px beside the 102×40 DELETE pill.
- `[MOD]` **Rhythm micro-sweep**: mobile hero cards `flex 1 1 50%` (equal halves at every mobile width); mobile dashboard wrapper pad is fluid `3vw 4vw 12px`; stats panel gap 7→8; dashboard greeting New Goal pill = LARGE variant (`.orb-pill-outline-lg` 132×40, pad 11/20, 12px — every other page pill stays 121×35); the goals-view mobile pill label swaps "New" → "New Goal" at `sm` (640) like the live; sidebar nav glyphs 16px (was 17); all three navs use lucide `square-check-big` for My Tasks (was `CheckSquare`); middle-state list views' back button is a raised neumorphic pill (r10, pad 7/14/7/10); demo user avatar color seeded to the reference's `#FFCBDE`.
- `[NOTE]` **Verification**: full gate green (lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke) and a fresh two-session computed-style sweep at 390/700/768/1024/1200/1440 — every probe matches the live (the floating pill's total width differs by ~5px from a live-side sub-pixel quirk on one tab chip + brand rounding; geometry/centering identical). VLM sanity pass: NEAR-IDENTICAL at 768 and 390 (differences are data-only). Unit count unchanged at **122** — v2.2 is presentation-layer (the pill nav reuses the tested `tabActive` helper; no new logic seams).

#### Revision Block — v2.1

- `[MOD]` **Dashboard stat numerals sit in WELL squares** (the v2.0 crawl read the box as transparent): 88×88 `bg-orb-well` r12 desktop / 104×104 r10 mobile with the 3px inset pair `rgba(255,250,244,0.68) -3px -3px 6px / rgba(160,143,126,0.24) 3px 3px 6px` — and mobile numerals are 30px/400 (the clamp floor was raised 28 → 30; desktop stays 50.4/300).
- `[MOD]` **Dialog panels carry NO box-shadow** — measured `box-shadow: none` on every live panel (add-task 500 / goal-edit 480 / check-in 448 / invite 384 / wizard 680); depth comes from the blurred scrim alone. The `-8px` pair was removed from the base `DialogContent`. **Scrims are per-kind: 0.3 for add-task / goal-edit / task-edit / wizard; 0.25 for check-in / invite** (the live's closed dialogs leave stale 0.3 scrim divs mounted — the check-in's own scrim is the LAST one; probe all scrims and take the newest when re-measuring).
- `[MOD]` **Standard-dialog control spec**: select triggers h35 pad 8/12 (base `SelectTrigger`; settings passes `size="sm"` + its own px so it is unaffected); date inputs h38; textareas 13px pad 8/12 with min-h 72 on goal-edit/task-edit/add-task (base `Textarea`; the check-in's bordered textarea keeps its own spec); text/number inputs h36.
- `[MOD]` **Submit pill spec**: add-task "Add Task" and task-edit "Save Changes" render pad 8/22 (w 96.5/124.9) — applied via INLINE STYLE because the unlayered `.orb-btn-submit` padding beats Tailwind px utilities in the cascade; goal-edit's label is literally "Save" at 8/20 (w 67.5); the check-in's Send icon carries `mr-[4px]` (icon→text 12px total with the 8px gap).
- `[MOD]` **The date picker is a TWO-LAYER card** (corrects the single-card reading): outer 262px radius-14 `#ECEBE9` (1px `#D8D4CF` border, Material drop shadow `0 4px 6px -1px / 0 2px 4px -2px rgba(0,0,0,0.1)`, p-0) wrapping an inner radius-16 `#EEEAE6` card (pad 16/18) that carries the neumorphic `-8px` pair; day cells are 32px radius-16 (not full-round). A 4px inner-height residual (table vs CSS-grid row rhythm) is accepted as sub-visual.
- `[MOD]` **Mobile shell geometry splits like the live**: `main` pads `16px 6px 90px`; the dashboard wrapper adds `px-16 pt-12 pb-12` (hero x22/y90; the pb also lands the desktop grid at 711.4) and every list view adds `px-12 pt-24` (h1 x18/y102).
- `[NEW]` **Mobile goal cards are a COMPACT single-column layout** (the desktop two-column card was being reused at 390px): pad 14/16 — chip + 13px/500 pct top row, full-width 16px/500 title, 6px track, meta row (fraction left; date + 23px edit/delete right). The mobile chip pip is STATUS-COLORED (green `#2ECC8A` for active, light purple otherwise) — unlike the desktop's always-purple pip.
- `[MOD]` **Filter chips never wrap** (goals + my-tasks): the live's chip row is `nowrap` — chips keep full size (`whitespace-nowrap shrink-0`) and overflow the right edge; wrapping made the clone's chips squash (text reflow, 50px height).
- `[MOD]` **Rhythm micro-sweep**: task-card chip→title gap 6px with 4px title mb (card 117.2 like the live); goals cards container mt 26 (first card y 186.6); the goals header row is items-START (the New Goal pill top-aligns with the h1 at y 48); the check-in description is 13px `#6E6E6E`.
- `[NOTE]` **Six VLM misreads disproven by computed styles this session** (app-bar "lavender" — both `#EEEAE6`; tab-icon fill state; goal-card layout claims on a mis-viewport screenshot; ring internals; wizard halo; check-in radio preselection). Computed styles remain ground truth. Unit count unchanged at **122** — the v2.1 changes are presentation-layer (verified by probes + smoke, not new logic seams).

#### Revision Block — v2.0

- `[MOD]` **Goal cards return to `p-[18px_20px]`** — v1.9's "pad-top 23px" was a mis-read of the live's computed style (today's measurement: inner column padding `18px 20px`, card height 165.75px both sides). The chip row carries mb 12 and the progress track mb 8 (meta mt 0); the filter-chip row and card grid land at the live's measured offsets (mt 22 / mt 24).
- `[MOD]` **Standard form dialogs split from the wizard button system**: the base `DialogContent` is now radius 20 / pad 28/28/24 with a 30px r8 raised close square; add-task + task-edit stay 500px, goal-edit is 480px, headings drop to 15px/600, inputs to 36px pad 8/12, and their buttons render 12px normal-case (`.orb-btn-submit` pad 8/20 no-shadow + `.orb-btn-cancel-std` pad 8/18) — distinct from the wizard's 11px/600 uppercase `.orb-btn-dark` (gap 6). The invite dialog is its own compact variant (384px/p24, 36px 13px buttons, 12px/500 labels).
- `[MOD]` **Wizard vertical rhythm**: bubble row mb 24 → form panel; form inter-block gaps 15/23/22px; label mb 7; date trigger 37.5px/13px; Continue px 18 (with `px-[18px]!` to beat the Button base's `:has()` specificity bump).
- `[MOD]` **The calendar grid renders ONLY the weeks a month needs** — `monthGrid` now returns `ceil((offset + days)/7)` rows (Sep 2026 = 5 rows/35 cells, Aug 2026 = 6/42). TDD: the 6×7 spec was rewritten red-first. The popover opens CENTERED under the trigger and grows downward (`align=center`, `avoidCollisions=false` — overflowing the dialog like the live), pad 16/18, raised 28px chevron circles.
- `[MOD]` **Mobile MORE sheet re-measured**: radius 24, pad 20/20/40 (+ safe area), upward-only shadow, 4px `#CCC7C0` handle, 32px r10 raised close (the duplicate built-in sheet close removed via `showCloseButton={false}`), 9px brand mark + "ORBITAL" Archivo 12px/600/ls 2.16, plain 16px/400 `#2F2823` rows (h 49, 8px gaps, list-todo/users/settings 20px) over a `rgba(0,0,0,0.2)` + 4px-blur scrim.
- `[MOD]` **Check-in modal**: h2 line-height 16 (was 22), "Post Status Update" at 12px/600/ls 0.96/lh 18/mb 12 (between the old 11px label tier and body), Post Update pad 0/12 (121px).
- `[MOD]` **Login card rhythm**: 14px/16 labels, logo-block mb 32, OR→label 28, label→input 10, block gaps 20, footer links lh 20 — the card now measures 746px like the live.
- `[MOD]` **Micro-sweep**: goal-detail header (h1 mb 6 → subtitle, Target mt 8, TASKS section mt 23); activity hero message mb 2 and row detail mt 3 (row 89px like the live); settings AI-Tone gap 18; shared `Input` h-36 pad 8/12; `.orb-btn-dark` gap 6; `.orb-btn-post` pad 0/12.
- `[NOTE]` **Two VLM readings disproven by computed styles** (the established noise rules hold): team empty-state icons ARE `#B3B3B3` (SVG `stroke` attr — the probe's `.color` read the inherited text color) and the mobile tab icons match (`#C9B3F5` 30px circles). Unit count unchanged at **122** (one calendar spec rewritten).

#### Revision Block — v1.9

- `[NEW]` **Date-card photo rotates by time of day** (extracted from the live bundle's `XF()`): `5–11 → day-hills-morning.jpg`, `11–17 → noon`, `17–21 → dusk`, else night — four lighting variants of the same rolling-hills artwork shipped in `public/`, selected by the new TDD seam `src/lib/day-image.ts` (`dayImageFor`, 3 specs).
- `[MOD]` **Relative timestamps render date-fns `formatDistanceToNow` long form** ("3 minutes ago", "about 2 hours", "2 months ago", "over 2 years") — the live bundle's distance algorithm (minute thresholds 1/45/90/1440/2520/43200/86400 + calendar-months path with the Feb-27 rule) re-implemented as the pure `formatDistance` core in `orbital.ts` with 12 specs; the old abbreviated "3m ago" style is gone.
- `[MOD]` **Greeting boundaries**: the live `QF()` starts the morning band at hour 5 — 05:00–11:59 morning, 12:00–17:59 afternoon, else evening. `greeting.test.ts` updated (04:59 → evening, 05:00 → morning).
- `[MOD]` **The New Goal wizard re-measured as a CONVERSATIONAL WRAPPER** (corrects v1.8's "no bot intro" reading): a 680px radius-24 panel (pad 28/28/24) carrying the 32px bot avatar (purple-tinted light shadow) + a 400px speech bubble (radius `0 14 14 14`, pad 10/16, 13px/400 `#3A3A3A`) above the 624px radius-16 form panel; a 32px radius-9 close square sits top-right. All dialogs now share the reference's scrim: `rgba(46,42,38,0.25)` + 12px backdrop blur (the wizard's is 0.3); base panels drop the drop-shadow layer and go radius 16.
- `[MOD]` **Login page**: white route, card shadow `0 25px 50px −12px rgba(0,0,0,0.25)`, inner pad 48/40/40, the logo re-measured as the reference's `Frame24.svg` — a WHITE ROUNDED SQUARE (rx 98/1200) carrying the 1-2-3 pyramid, no shadow; title ls −0.75px; subtitle 16px/500 left-aligned; all controls radius 12 (explicit — the theme's `rounded-xl` computes to 20px); footer "Need an account?" 400 `#64748B` + "Sign up" 500 `#334155`.
- `[MOD]` **Dashboard activity panel rhythm**: rows start flush at the NPA well's bottom (no list margin), detail lines carry a 2px top margin, message line-height is 19.5px (13 × 1.5), and row icons use `#2A2A2A` glyphs.
- `[MOD]` **Micro-parity sweep**: activity feed rows gap 14px, hero row centered, type tags ls 1px/mt 4px, online pill pad 7/12 gap 6 with the count at 400 `#767676`; goals/my-tasks h1s to `tracking-[-0.01em]`; goal cards pad-top 23px; `--orb-track` `#DDD8D2`; goal-detail header +5px, DELETE py 11, ADD TASK py 7, blocked well r12 (explicit styles — the `.orb-well` cascade trap), stat grid 2.04fr:1fr; task-card actions at 10px, status→title 5px; settings selects 36px (size=sm) pad 8/12 with the measured spacing rhythm; team empty-state offsets; sidebar brand inset 10px/gap 8; mobile brand = 9px mark + Archivo 12px/600; mobile user pill r10 with an 11px/500 `#6E6E6E` name; avatars `#5A5350` text.
- `[NEW]` Three TDD seams + spec updates — **107 → 122 unit checks**.

#### Revision Block — v1.8

- `[MOD]` **Viewport-filling dashboard**: the desktop shell pins `h-screen`; the dashboard grid's bottom row is `1fr` and the Agent Activity panel renders ALL entries inside an `overflow-hidden` container (clipped at the viewport like the live app).
- `[MOD]` **Stats columns**: 88px flex-centered number boxes (104px mobile) with 10px label margins; DM Sans **300** loaded (the light-numeral face, variable font with the opsz axis); **Archivo 600** for the "ORBITAL" wordmark.
- `[MOD]` **Canvas glow** moved to `59.17% 29.89%` (upper-middle-right, visible on Team/Settings).
- `[MOD]` **Activity feed structure**: plain date-group rows with `rgba(160,143,126,0.15)` hairlines (no card wrapper), a hero card with a fixed Search glyph, and the icon seam `src/lib/activity-icons.ts` (TDD, 4 specs).
- `[MOD]` **Login page** rebuilt as the slate design; the wizard opened directly on "Goal Details"; dialogs re-measured (v1.9 corrected both readings against a fresh crawl).

#### Revision Block — v1.7

- `[MOD]` **Label typography re-measured into a TWO-TIER system** (side-by-side probes on the live app): `.orb-label` = 11px/600/ls 1.1px `#6E6E6E` uppercase (panel headers, stat-column labels, "PROGRESS", "TASKS", chip labels); new `.orb-label-sm` = 10px/600/ls 1.2px `#767676` uppercase (sidebar WORKSPACE/MANAGEMENT, "NEXT PLANNED ACTION", activity date labels, sidebar TASKS STATUS). The v1.6 single 12px/500 label was retired along with its `!text-[12px]` overrides.
- `[MOD]` **The destructive red is darker: `--orb-coral-deep` `#C9574E` → `#BD3228`** (blocked task titles, "· N blocked" counts, overdue text) — measured on the live app.
- `[MOD]` **Dashboard stats panel rebuilt**: columns are CENTER-aligned links with no outer padding wrapping `pad 10px` inner blocks — label (11px/600/1.1px), number at `clamp(28px,3.5vw,52px)`/300 (the same face as the date card — 50.4px at 1440), sub 12px `#665F57`; column gap 16px. Replaces the v1.6 left-aligned `justify-between` columns with 44px numerals. The ring card's "done" caption is 10px/400/0.6px `#767676`; the date square stacks day + month flush (80px tall).
- `[MOD]` **Sidebar re-spec**: the sticky `aside` pins `top-0` with `height calc(100vh-40px)` and NO padding — the `.orb-raised-lg` panel is the full sticky height (860px on a 900px viewport) carrying its own 28/16/16 padding. Compact brand (16px six-dot mark + "ORBITAL" 13px/600/ls 2.34px `#2F2823`), `.orb-label-sm` sections, 39px nav rows (inactive 14px/400), and a PLAIN Tasks Status block (no well — 11px/700 numbers, 11px/400 `#767676` captions) beside the 80px clock, 10px apart.
- `[MOD]` **Mobile chrome corrected — the tab bar is a FULL-WIDTH bottom-attached bar**, not the v1.6 "floating rounded-24 pill": `fixed inset-x-0 bottom-0`, `border-radius: 20px 20px 0 0` (top corners only), upward shadow `0 -4px 20px rgba(160,143,126,0.22)`, pad `8px 8px 12px`; tabs carry 20px icons and 9px/600/ls 0.45px uppercase labels with a COLOR-ONLY active state (no inset highlight). The mobile shell is FULL-BLEED below `lg` (no outer canvas padding; content pads ~22px) and the mobile hero cards are 150px tall. The goals-view NEW GOAL button shortens to "New" at 35px on mobile (`.orb-pill-outline-sm`).
- `[MOD]` **Activity feed re-spec**: the header's online indicator is an inset well pill (h 31px, 7px dot, "Online · N" 11px/600 `#3A3A3A`); the hero card uses a 36px icon and the caption "Last agent action" (12px/400 `#767676`) instead of the entry detail, with no timestamp; every group row ends with a TYPE TAG — 10px/600 `#B3B3B3` uppercase, derived by the new TDD seam `src/lib/activity-tags.ts` (`activityTypeTag`, underscores → spaces; live shows "task assigned", "tasks generated", "goal analyzed"). Rows: 12px icon gap, message lh 20 / detail lh 18, timestamp inside the message flex row.
- `[MOD]` **Greeting + h1 rhythm**: the dashboard greeting is Title Case with a period ("Good Evening.") via the shared, now-tested `greetingFor` seam (`greeting.test.ts`); every view h1 carries `leading-[1.2]` (33.6px at 28px) matching the live app. Filter chips (goals + my-tasks) carry ls 0.72px with 600 weight on all states and `py 7px px 14px`.
- `[MOD]` **Settings/dialog typography**: field labels 12px/600 `#6E6E6E`, hints 11px/400 `#9A9A9A`, Start/End sub-labels 11px/500; the check-in modal's h2 is 16px/500 with a 16px Send icon; the add-task description textarea is 72px/13px. Empty states render a PLAIN `#B3B3B3` icon (no circle wrapper) with a 15px/400 title and 13px/400 `#767676` sub; the agents empty well holds only icon + two lines (no button).
- `[NEW]` Two pure seams with TDD specs: `activity-tags.test.ts` (4 checks) + `greeting.test.ts` (4 checks) — **93 → 101 unit checks**.

#### Revision Block — v1.6

- `[MOD]` **Card system re-measured into THREE tiers** (side-by-side computed-style probes on the live app): standard pair `-5px/-5px/10px 0.78` + `5px/5px/12px 0.27` (buttons, small ui); deeper row pair at alpha `0.92`/`0.36` (goal cards r16 `.orb-goal-card`, task cards + activity feed r14 `.orb-row-card`); large panel pair `-8px/-8px/16px 0.78` + `8px/8px/18px 0.31` (dashboard panels, settings cards, goal-detail stat cards — `.orb-panel` r16). `.orb-task-blocked` re-scoped to the coral inset ring only (composes with `.orb-row-card`); `.orb-pill-round` re-measured as a radius-12 rectangle (NOT a round pill).
- `[MOD]` **The desktop sidebar is STICKY** (measured: `position: sticky; top: 0; height ≈ viewport − 40px`, clock block via `mt-auto`) — the clock / TASKS STATUS / collapse control stay visible while main scrolls. Previously the sidebar stretched with the page and the clock sat below the fold.
- `[MOD]` **Task cards rebuilt flat** (measured): radius-14 deeper card (`p 14px 18px`) holding only [gray 11px/500 status chip + colored dot | 14px/500 title (coral when blocked) | 12px one-line description | 11px meta with 11px lucide icons]; the AI badge becomes a solid `#EEEAE6` chip (r6, 10px/500 `#996CE4`, no icon); the 26px radius-7 raised action squares sit OUTSIDE the shadowed card, pinned top-right. The whole row opens the check-in modal. (Also fixed a latent cascade bug: `orb-card rounded-[14px]` rendered radius 16 — the custom class won.)
- `[MOD]` **Activity feed rebuilt** (TDD): the most recent entry renders as a standalone hero card; the rest group under uppercase 10px/600 date labels ("THU JUL 16 2026") with each day wrapped in one big radius-14 deeper card; the online indicator shows the count only ("Online · 36"). New pure seam `src/lib/activity-groups.ts` (`groupActivityByDate`) with 8 specs — 85 → 93 unit checks.
- `[MOD]` **Mobile chrome matches the reference**: a sticky full-bleed app bar (ORBITAL logo + user pill, 62px, bottom drop shadow) replaces the desktop greeting header below `lg`; the date card + ring sit side-by-side even at 390px; the bottom tab bar is a floating rounded-24 raised pill with the active tab on an inset well highlight.
- `[MOD]` **Dashboard panel internals**: grid gap 16 → 20px; ring card `p-6` (inner circle 156px); stats panel `p 20/24` with `p 10/8` columns; the activity card goes `p-0` with full-width rows (`p 14/18`, 30px solid icon circles `#C9B3F5`/`#2ECC8A` with 13px `square-check-big` glyphs); the goals card `p 20/18/0` with inset-well rows (`p 12/14`) and 60px SVG rings. Goal-detail stat cards move to the large tier at a 2:1 ratio (pct 24px, blocked count 26px `#FF7043`); settings cards to the large tier (`p 22/24`, headers 13px, inputs 38px/13px, "Active Window" 12px/600 Title Case above the description); the goals-view card splits into a 952px left column + 120px stats column with a 42px/500 percentage and flat gray 29×23 actions.

#### Revision Block — v1.5

- `[MOD]` **Dark primary action hierarchy measured and adopted**: every in-dialog primary submit — the check-in modal's "Post Update" (`#2F2823`, radius 14, 32px, literal Title Case + Send icon, content-sized), the wizard's "Continue" and the Add/Edit dialogs' submits (`#3A3A3A` bg, `#F1F1F0` text, radius 10) — renders a charcoal pill; dialog "Cancel" buttons are soft inset wells. Page-level actions (NEW GOAL, ADD TASK, DELETE, Team's round Invite/New Agent pills) stay neumorphic raised. New primitives: `.orb-btn-dark`, `.orb-btn-post`, `.orb-btn-cancel`, `.orb-pill-round`.
- `[MOD]` **Shell: 1200px content clamp + canvas glow**: all main content wraps in `max-w-[1200px]` (the shell owns the clamp — per-view max-widths removed), and the canvas carries a fixed decorative purple radial gradient (`radial-gradient(600px at 87.44% 95.38%, rgba(201,179,245,0.35), transparent 70%)`, pointer-events none) under the content.
- `[MOD]` **Dashboard rebuilt as a 2×2 grid**: top-left cell = date card (330×180; bright `day-hills.jpg` photo extracted from the reference, 0.8 opacity; raised date square radius 12 with `clamp(28px,3.5vw,52px)` fw-300 numerals) beside a 180×180 ring card holding a **plain CSS inset circle** (no SVG ring — `FaintRing` deleted); top-right = the three-column stats panel (526×180); bottom row = Agent Activity + Goals at equal widths. The greeting is 28px at every breakpoint.
- `[MOD]` **Check-in (task-detail) modal**: 448px / radius 16 (the measured exception to the 500px/radius-20 form-dialog base); plain radio labels (no card wrappers); bordered transparent textarea (1px `#D8D4CF`, radius 14, 80px); dark content-sized "Post Update" pill.
- `[MOD]` **Goals card polish**: status chip = inset well pill with a **light-purple pip (`#C9B3F5`) for every status**, gray `#6E6E6E` label, inline red "· N blocked" count, trailing `›`; meta stacks task fraction and date on two lines; the 6px progress track reads as pressed-in (inset shadow pair).
- `[MOD]` **Date picker**: raised `#EEEAE6` popover (260px, radius 16 — was a 292px white card); today renders as bold purple `#996CE4` text; new pure seam `formatLongDate` (TDD, 80 → 85 unit checks) produces the reference's long trigger format ("September 20th, 2026").
- `[MOD]` **View-level parity**: My Tasks ships five filter tabs (All / Pending / In Progress / Blocked / Done — no "Need Help"); empty states render directly on the canvas (no card wrapper); Settings gains the "Active Window" sub-header; the user-menu Log Out icon sized 24px; the Agent Activity live dot is a 7px `#2ECC8A` pulse (`.orb-live-dot`), not an expanding ping.

#### Revision Block — v1.4

- `[MOD]` **The visual system was re-measured and rebuilt as neumorphic** (fresh crawl of the reference, 28 captures + computed-style dumps): the outer rounded surface panel is gone — the page is a beige canvas (`#EBE7E2`, 24px padding) on which every surface is a raised `#EEEAE6` panel (radius 16–20) with dual embossed shadows, or an inset `#EBE7E2` well (inputs, chips, clock, status pills); progress tracks are `#DDD8D0`. Tokens + primitive classes live in `globals.css` (`.orb-raised`, `.orb-raised-lg`, `.orb-raised-btn`, `.orb-well`, `.orb-well-pill`, `.orb-task-blocked`). Sidebar re-measured: 240px expanded / 64px collapsed; dialogs normalized to 500px radius-20 panels.
- `[FIX]` CSS cascade trap found and fixed during verification: custom classes in `@layer utilities` are emitted AFTER Tailwind's generated utilities, so an arbitrary `shadow-[…]` utility paired with `.orb-card` silently loses — the blocked-task coral inset ring never rendered. Fixed with the dedicated `.orb-task-blocked` class (declared after `.orb-card`); the rule is documented in AGENTS.md/CLAUDE.md.
- `[MOD]` **Auth flow rebuilt to match the reference's current behavior**: unauthenticated visits render the workspace shell (nullable user) with a **LOG IN** button in the header; login is a real `/login?from_url=…` route rendering a centered white card with three states (sign-in / sign-up / forgot-password) and a "Continue with Google" option that degrades to an explanatory toast (no OAuth credentials — same doctrine as the AI fallbacks). The old full-screen dusk-hills login page is retired (the hills image now only lives on the dashboard date card).
- `[NEW]` Custom date picker (`ui/date-picker.tsx`): "Pick a deadline" well-style trigger opening a popover calendar (month chevrons, Su–Sa headers, 7×6 grid, today ringed, click-to-select-and-close) — replaces the wizard's native `<input type="date">`. Grid math lives in the pure seam `src/lib/calendar.ts` (`monthGrid`, `isSameDay`), written TDD red → green (71 → 80 unit checks).
- `[MOD]` Copy + micro-parity: task-detail modal shows only "Assigned to: …" (Goal/Deadline lines removed) with the Title Case "Post Status Update" label; My Tasks empty copy shortened; mobile stat cards carry abbreviated sub-labels ("31 tasks" / "26 done" / "84% total"); mobile goal-card meta includes the blocked count.

#### Revision Block — v1.3

- `[FIX]` Dashboard NEXT PLANNED ACTION text corruption: `String.replace` with a capture group left the person prefix in place (`Resolve blocker on "Shelly GenosarReview Q3 project milestones"`). Extracted to the pure seam `src/lib/next-action.ts` (`nextPlannedAction`) with a regression spec; fixed with `String.match` (61 → 71 unit checks total incl. logo geometry).
- `[MOD]` Brand marks re-measured by pixel-level connected-component analysis (VLM counts proved unreliable): sidebar mark = **six** dots in a hexagonal ring (12/2/4/6/8/10 o'clock); login card = **six** dots in a 1-2-3 pyramid inside a white circle. v1.2's "8-dot constellation" was a miscount. Geometry lives as pure helpers (`ringDotPositions` / `pyramidDotPositions`) with `logo-geometry.test.ts`; `public/orbital-logo.svg` + `logo.svg` regenerated.
- `[MOD]` Delete confirmations moved from centered `AlertDialog` modals to the reference app's **inline** pattern: goal cards swap icons for "Delete / Cancel", the goal-detail header swaps DELETE for "Delete goal & all tasks? · Yes, Delete | Cancel", task cards swap icons for "Delete? | Yes | No". `alert-dialog.tsx` no longer has app consumers.
- `[MOD]` Task cards: blocked titles render in the alert coral; edit/delete icon buttons sit on soft rounded squares (always visible). Dialog headers (Add/Edit Task) are plain titles — icon-circle embellishments removed. Task-detail modal assignee renders plain "Assigned to: Name".
- `[MOD]` Login screen: sentence-case labels ("Email" / "Password"), in-field envelope/padlock icons, "Sign in" Title Case submit, "OR" divider, `you@example.com` placeholder.
- `[MOD]` Mobile tab bar: HOME → `LayoutGrid` (four squares), MORE → `Menu` (three lines), matching the reference icons.

#### Revision Block — v1.2

- `[MOD]` Parity remediation against a second live-app capture (2026-09-17, 21 screenshots + VLM analysis): sidebar analog clock + desktop collapse (`sidebar-clock.tsx`, `sidebar-collapse.ts` — `useSyncExternalStore` + localStorage), 8-dot constellation logo, unified dashboard stats card + faint DONE ring, goal-card redesign (horizontal progress bar, always-visible actions), goal-detail 2-stat layout + inline ADD TASK, team dialogs rebuilt (email+role invite; agent name/description/instructions), wizard copy + bot avatars, settings 2-column layout.
- `[NEW]` ADR-009: fixed-window per-IP rate limiting on the auth endpoints (`src/lib/rate-limit.ts`, 10 attempts/15 min → `429 RATE_LIMITED` + `Retry-After`) — closes the §10 HIGH item.
- `[MOD]` `TeamMember` schema extended with `description` / `instructions` for AI agents; `/api/team` POST and the New Agent dialog share the new `src/lib/team.ts` seams.
- `[MOD]` Dependency prune (859 → 193 packages): zod, framer-motion, React Query, dnd-kit, react-hook-form, next-auth, recharts and other unused template extras removed; 35 unused vendored shadcn/ui components deleted (12 remain); dead `use-mobile` hook removed.
- `[MOD]` Auth navigation switched from `window.location` hard reloads to `router.refresh()` session re-resolution (ESLint-clean under Next 16 rules).
- `[MOD]` Verification gate now includes `bun run typecheck` (the build sets `ignoreBuildErrors`); unit layer 43 → 61 checks (rate-limit + team seams), smoke suite 27 → 30 checks (team validation + rate limit).

#### Revision Block — v1.1

- `[MOD]` Parity remediation against a fresh live-app capture (2026-09-17): path-based URLs (ADR-001 revised), three-step wizard with AI clarifying questions + `POST /api/goals/clarify`, user menu with Log Out, mobile bottom tab bar + MORE sheet, direct edit/delete row actions, copy alignment (title, dashboard subtitle, stat-card sub-labels).
- `[NEW]` ADR-008: Vitest unit layer on the pure domain seams (router, clarify, plan sanitizer, check-in mapping) — 43 checks; smoke suite extended 18 → 27.

#### Revision Block — v1.0

- `[SYN]` Initial PAD authored from the shipped v1.0 codebase, grounded in source inspection and an 18-check end-to-end smoke run against the production build.
- `[SR]` Stack versions verified against `package.json` / `bun.lock` and the live build log (Next.js 16.1.3, Prisma Client 6.19.2, React 19, Zustand 5.0.10).
- `[SR]` Line counts in §11 measured with `wc -l` on the committed tree.

---

## Table of Contents

1. [System Overview & Decisions](#1-system-overview--decisions)
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Application Architecture](#3-application-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Design System Reference](#5-design-system-reference)
6. [Security Architecture](#6-security-architecture)
7. [Testing Strategy](#7-testing-strategy)
8. [Build & Deployment](#8-build--deployment)
9. [Developer Handbook](#9-developer-handbook)
10. [Known Issues & Outstanding Tasks](#10-known-issues--outstanding-tasks)
11. [Key Files Reference](#11-key-files-reference)
12. [Glossary](#12-glossary)

*(Worker / background-service architecture is not applicable: the system runs no queues, cron jobs, or async workers. The AI planner executes inline within a request; see ADR-005.)*

---

## 1. System Overview & Decisions

### 1.1 Document Metadata & Purpose

ORBITAL is a self-hosted AI project management workspace — a functional clone of the reference Base44 application, rebuilt as a single deployable Next.js unit. Teams describe **goals** in natural language; a server-side AI planner drafts a **task plan** (assigned across people, spread over the timeline); execution is tracked through status **check-ins**; and every mutation is narrated in an **agent activity feed**. This PAD is the engineering source of truth for onboarding, debugging, and replication. New engineers should read §3 first; DevOps should start at §8; anyone touching authentication or the AI planner must read §6 before changing anything.

### 1.2 Technology Stack Summary

| Layer | Technology | Version | Key Rationale |
|-------|-----------|---------|---------------|
| Web framework | Next.js (App Router) | 16.1.1 (resolved 16.1.3) | One deployable unit for page shell + API routes; standalone output yields a portable production artifact |
| UI runtime | React | 19.x | Required by Next 16; the client store model fits React 19 fine-grained re-renders |
| Language | TypeScript | 5.x, `strict: true` (`noImplicitAny: false`) | End-to-end typing from Prisma models through DTOs to the client store |
| Styling | Tailwind CSS | 4.x (CSS-first tokens) | `--orb-*` design tokens declared in `globals.css` and mapped via `@theme inline`; no runtime CSS cost |
| Components | shadcn/ui on Radix | vendored, `src/components/ui/` (11 primitives) | Accessible primitives (dialog, select, radio-group, sheet, toast…) owned as source, not a versioned dependency; unused template components pruned in v1.2 |
| Client state | Zustand | 5.0.6 (resolved 5.0.10) | One store for all server state with explicit refresh composition; no cache-heuristics layer to tune |
| Unit tests | Vitest | 5.0.1 | Pins the pure domain seams (router, clarify, sanitizer, check-in mapping) without a browser or DB |
| ORM | Prisma | 6.11.1 (client resolved 6.19.2) | Typed, schema-first modeling; `db push` matches SQLite's no-migration workflow |
| Database | SQLite | file-based, `db/custom.db` | Zero-config persistence; single gitignored file; trivially reseeded to a canonical demo state |
| Auth | Node `crypto` | built-in (scrypt, HMAC-SHA256) | Stateless verifiable cookie sessions with no external auth dependency |
| AI planner | z-ai-web-dev-sdk | 0.0.18 | Server-side chat completion for task-plan generation; deterministic fallback keeps the feature alive without it |
| Icons | lucide-react | 0.525.x | Tree-shakeable; 35 component files import from it |
| Fonts | next/font | DM Sans, DM Mono | Self-hosted, zero layout shift, matches the reference typography |
| Runtime | Bun ≥ 1.1 / Node ≥ 20 | — | Bun runs TS scripts (seed) directly; the standalone server runs on either runtime |

### 1.3 Architecture Decision Records (ADRs)

**ADR-001: Single-page app with path-based URLs (rewrites + History API)**

- **Context:** The reference app is a browser SPA — sidebar/bottom-tab navigation, view switches without page reloads, deep-linkable URLs at real paths (`/goals/<id>`), working browser back/forward. A conventional multi-page Next.js app would change the UX contract and add route transitions the original does not have.
- **Decision:** One page (`src/app/page.tsx`, `force-dynamic`) resolves the session server-side, then renders the client shell. The seven view paths (`/goals`, `/goals/:goalId`, `/my-tasks`, `/tasks`, `/activity`, `/team`, `/settings`) are mapped onto `/` with `rewrites()` in `next.config.ts`; view state syncs with `location.pathname` through `src/lib/router.ts` (`parseUrl` / `toPath`) using `history.pushState`, and a `popstate` listener re-derives state on back/forward. Legacy `?view=…&goal=…` links still resolve for pre-v1.1 deep links.
- **Rationale:** Preserves the reference UX and URL contract exactly (the address bar shows the same paths as the original) while keeping a server-rendered auth gate and one client bundle. Unknown paths still 404 at the HTTP layer — the rewrites are an explicit allow-list, not a blanket proxy.
- **Consequences:** The rewrite list and `router.ts` must stay in sync (both cite each other); every navigation is a real history entry. Trade-off: the whole app ships as one client bundle — no per-view code splitting.
- **Alternatives Rejected:** Query-param URLs (`?view=goals` — v1.0 behavior; the reference app uses paths, and `replaceState` broke back/forward); Next.js pages per view (breaks SPA feel, duplicates the store's navigation); react-router inside Next (duplicates the router Next already provides).
- **History:** v1.0 shipped `?view=` query params with `replaceState`; revised in v1.1 after fresh capture of the live app confirmed path URLs. v2.7 added `/tasks` (the live's all-tasks view) as the seventh rewrite — doc count claims updated to match in v2.15.

**ADR-002: Prisma + SQLite with `db push` (no migrations)**

- **Context:** A fresh checkout must reach a running demo with no database server and no migration history to replay.
- **Decision:** Prisma ORM over a gitignored SQLite file; schema applied with `prisma db push`; canonical demo data via an idempotent TS seed (`bun run db:seed` wipes and reseeds domain tables).
- **Rationale:** Zero-config bootstrap; typed queries, cascades, and indexes from the Prisma schema; moving to Postgres later is a `datasource` block change, not a rewrite.
- **Consequences:** No production schema-history artifacts; SQLite's single-writer model caps write concurrency (acceptable for a team workspace).
- **Alternatives Rejected:** Drizzle (same benefit, fewer generated conveniences at this scale); Postgres (breaks the zero-config story); in-memory store (not production-grade).

**ADR-003: Hand-rolled cookie sessions (scrypt + HMAC-SHA256)**

- **Context:** Email/password auth is required; external auth services, JWT libraries, and NextAuth's OAuth machinery are not.
- **Decision:** `src/lib/auth.ts` (91 lines) implements scrypt password hashing (`salt:hash`, 64-byte key), stateless session tokens `userId.expiry.signature` signed with HMAC-SHA256, delivered as an httpOnly `orbital_session` cookie (7-day TTL, `SameSite=Lax`, `Secure` in production).
- **Rationale:** Auditable crypto code using Node built-ins; tokens verify without a session store; `timingSafeEqual` on both password and signature comparisons closes timing oracles.
- **Consequences:** No MFA/OAuth/social flows; rotating `AUTH_SECRET` invalidates every session (documented in README troubleshooting).
- **Alternatives Rejected:** NextAuth v4 (template-era dependency, pruned in v1.2 — heavy for email/password only); JWT libraries (unnecessary for cookie-carried claims); server-side session table (adds state for no benefit).

**ADR-004: Zustand as the single client-state container**

- **Context:** All server data (goals, tasks, team, activity, settings, stats) is shared across views and must refresh coherently after each mutation.
- **Decision:** One store (`store.ts`, 356 lines) holds every DTO collection plus `view`/`goalId`. Actions call the API through a `call()` envelope-unwrapper, then `Promise.all` the exact refresh set the mutation touches.
- **Rationale:** A single source of client truth; post-mutation consistency is explicit (each action lists which slices it refreshes); nothing to invalidate heuristically.
- **Consequences:** Slight over-fetching (collections refresh whole); every new endpoint must wire its refresh calls into the relevant actions.
- **Alternatives Rejected:** React Query (template-era dependency, pruned in v1.2 — cache semantics unnecessary at this scale); React Context (coarser re-renders, more boilerplate).

**ADR-005: AI features that degrade, never fail (clarify + task planning)**

- **Context:** The product's differentiator is a conversational planner: the agent asks clarifying questions about a goal draft, then drafts a task plan. Both LLM dependencies must not be able to take the feature down.
- **Decision:** `POST /api/goals/clarify` (wizard step 2) and `POST /api/goals/[id]/generate-tasks` call `z-ai-web-dev-sdk` server-side. Clarify sanitizes LLM questions (≤3, 200 chars each) and falls back to three deterministic template questions; generate-tasks sanitizes its JSON (≤10 tasks, 160-char titles, 1–40h clamp) and falls back to a deterministic 8-step template plan. The wizard passes the user's answers into the generation prompt. Generated tasks are round-robin assigned across people and spread between "now" and the goal's target date (or +45 days).
- **Rationale:** Degrade-not-fail keeps the core workflow usable in any environment; sanitization bounds what prompt-injected LLM output can write to the database or show to the user.
- **Consequences:** Environments without SDK access get generic (but useful) questions and plans; both fallback paths are unit-tested (`clarify.test.ts`, `domain.test.ts`); the clarify step logs a `goal_analyzed` activity entry either way.
- **Alternatives Rejected:** Hard SDK dependency (breaks self-hosting); client-side generation (exposes prompting and validation to the browser).

**ADR-006: Uniform API envelope `{ ok, data } | { ok, error }`**

- **Context:** Sixteen route handlers must return predictable, typed JSON that one client helper can unwrap.
- **Decision:** `src/lib/api.ts` exports `ok(data, status)` / `fail(code, message, status)`; every handler returns one of these. The store's `call()` unwraps success data or surfaces a destructive toast and returns `null`.
- **Rationale:** One response contract for all endpoints; errors carry a machine code plus a human message; the client never throws across render.
- **Consequences:** Handlers must be disciplined about using the helpers; the contract is enforced by convention (and the smoke suite asserts the envelope).
- **Alternatives Rejected:** HTTP-status-only error signalling (loses the code/message pair); throwing and catching centrally (Next route handlers have no error boundary to rely on).

**ADR-007: Standalone output with pinned file-tracing root**

- **Context:** Production must run from a portable artifact; Next's standalone tracing rewrites output paths when a parent workspace lockfile exists (observed: server landing at `.next/standalone/<nested-path>/server.js`).
- **Decision:** `output: "standalone"` with `outputFileTracingRoot` pinned to the project directory in `next.config.ts`; the build script copies `.next/static` and `public/` into `.next/standalone/`; `start` runs `server.js` from the repo root.
- **Rationale:** Guarantees the canonical `.next/standalone/server.js` layout regardless of where the repo is cloned; the artifact carries only traced runtime deps.
- **Consequences:** The server must start from the project root (npm scripts guarantee it; see also the SQLite path normalization in §3.3); `.env` is not auto-copied into the standalone tree.
- **Alternatives Rejected:** `next start` (requires the full framework in production); Docker-only packaging (adds operational weight this clone does not need — Dockerfile listed in §10 as an open item).

**ADR-008: Vitest unit layer on the pure domain seams**

- **Context:** v1.0's only verification was the 18-check E2E smoke suite — regressions in pure logic (status mapping, URL parsing, LLM-output bounds) could only be caught end-to-end, and the v1.1 remediation plan called for TDD.
- **Decision:** A Vitest layer (`bun run test`) covers exactly the pure modules: `src/lib/router.ts` (view ↔ path mapping, legacy links), `src/lib/clarify.ts` (question fallback + LLM bounds), `src/lib/plan-sanitizer.ts` (task-plan bounds + template), `src/lib/checkin.ts` (check-in → task-status mapping). Route handlers were refactored to import these modules instead of inlining the logic.
- **Rationale:** Tests at pre-agreed seams verify behavior through public interfaces; the modules are pure (no DB, no React, no Next runtime), so the suite runs in ~0.4s with zero infrastructure; red → green drove every v1.1 logic change.
- **Consequences:** New pure logic belongs in `src/lib/` with a spec; component/DB behavior stays covered by the smoke suite (now 30 checks). No coverage thresholds yet — the seam list is deliberately small and complete. v1.2 added `rate-limit.test.ts` and `team.test.ts` (43 → 61 checks); v1.3 added `next-action.test.ts` and `logo-geometry.test.ts` (61 → 71).
- **Alternatives Rejected:** Component testing (Testing Library) — the views are thin over the store, and the smoke suite already exercises them against the real server; Jest (slower, more config for the same result).

**ADR-009: Fixed-window per-IP rate limiting on the auth endpoints**

- **Context:** §6.4 flagged unthrottled `POST /api/auth/login` / `register` as the top brute-force surface (HIGH, open since v1.0). The fix had to work with zero infrastructure (no Redis) and stay testable.
- **Decision:** `src/lib/rate-limit.ts` implements a pure fixed-window limiter — `checkRate(buckets, key, limit, windowMs, now)` over a `Map` of counters with opportunistic eviction of expired entries. Route handlers call `authRateLimit(ip)` (10 attempts / 15 min per IP, IP from `x-forwarded-for` / `x-real-ip` with a trusted single proxy assumed); a throttled request gets `429 RATE_LIMITED` plus a `Retry-After` header, both through the standard envelope.
- **Rationale:** Pure-function core keeps the window math and eviction unit-testable without timers; the fixed window is the simplest policy that materially raises brute-force cost; the envelope keeps client behavior uniform (the store's `call()` already toasts errors).
- **Consequences:** Buckets live in process memory — per-instance only; a multi-instance deployment would need a shared store (documented in §6.4). Restarting the server clears buckets. Legitimate users who fat-finger a password 10 times in 15 minutes see a 429 with a countdown.
- **Alternatives Rejected:** Sliding window (more state for marginal gain here); middleware-based blocking (Next middleware runs on the edge runtime, and the limiter needs Node process memory); Redis-backed store (breaks the zero-config story).
- **History:** Added in v1.2; the smoke suite pins the behavior with a rapid-fire-login 429 check.

---

## 2. High-Level System Topology

```mermaid
flowchart TB
    subgraph Client
        B["Browser<br/>single-page app<br/>(Zustand store, path URLs)"]
    end
    subgraph Edge
        C["CDN / reverse proxy<br/>(static chunks, images)"]
    end
    subgraph App["Next.js standalone server (:3000)"]
        P["GET / + rewrites (/goals, /my-tasks, …)<br/>server component — session (nullable user)<br/>GET /login — real auth-card route"]
        A["API route handlers ×16<br/>/api/*"]
    end
    subgraph Data
        D[("SQLite<br/>db/custom.db<br/>via Prisma Client")]
    end
    subgraph External
        Z["z-ai-web-dev-sdk<br/>(LLM chat completion)<br/>server-side only"]
    end
    B -->|"HTML + JS bundle"| C
    B -->|"fetch JSON, cookie auth"| A
    C --> B
    P --> B
    A --> D
    A -->|"clarify + generate-tasks"| Z
```

- **Client layer** — a standard browser; no PWA/service worker. All interactivity is client-side after the initial server-rendered shell.
- **Edge layer** — optional; any static file server or CDN in front of the Node process. The app itself has no edge middleware.
- **Application layer** — one Node process serving the page (plus its seven view-path rewrites) and 16 API routes. Stateless between requests (sessions are cookie-carried), so horizontal scaling is trivial behind a load balancer.
- **Data layer** — a single SQLite file on local disk. Write concurrency is serialized by SQLite; this is the layer to swap (Postgres) if the workspace outgrows a single team.
- **External services** — only the AI planner call, invoked inline during `generate-tasks` with a deterministic fallback; its absence never blocks a request.

---

## 3. Application Architecture

### 3.1 The Layer Model

```
Layer 0: Prisma schema (prisma/schema.prisma) — the source of truth for the domain.
         Rule: every entity starts here; regenerate the client after any change.

Layer 1: Route handlers (src/app/api/**/route.ts) — validation, persistence,
         activity logging. Rule: business logic lives here and only here;
         no handler exports anything shared with the client bundle.

Layer 2: Domain types & DTOs (src/lib/orbital.ts) — the shared vocabulary
         (GoalDTO, TaskDTO, status metadata, labels, colors).
         Rule: views never import Prisma types; DTOs are the contract.

Layer 3: Client store (src/components/orbital/store.ts) — the ONLY client
         that talks to the API. Rule: actions fetch, then refresh affected
         slices; components never fetch directly.

Layer 4: Views & dialogs (src/components/orbital/views|dialogs) — pure
         presentation over store state. Rule: read the store, call actions,
         render; no fetch, no direct DB concepts.
```

**Golden Rule:** dependencies point downward only. A change flows schema → handler → DTO → store action → view. A view never reaches past the store; a handler never imports a component.

### 3.2 Annotated Directory Structure

```
├── prisma/
│   ├── schema.prisma              ← 8 models; status vocabularies in comments
│   └── seed.ts                    ← idempotent demo workspace (wipes + reseeds)
├── public/
│   ├── orbital-logo.svg           ← brand mark (sidebar, login)
│   ├── logo.svg                   ← favicon
│   ├── day-hills-{morning,noon,   ← dashboard date-card photos — the
│   │                 dusk,night}.jpg  reference artwork in four lighting
│   │                                 variants, rotated by hour (v1.9)
│   ├── dusk-hills.jpg             ← legacy landscape (unused)
│   └── robots.txt
├── scripts/
│   └── smoke-test.sh              ← 27-check E2E suite; boots the prod server
├── src/
│   ├── app/
│   │   ├── page.tsx               ← the workspace page: session → OrbitalApp
│   │                            (nullable user — shell renders either way)
│   │   ├── login/page.tsx         ← real /login route: LoginCard, 3 states,
│   │                            ?from_url handling, authed → redirect /
│   │   ├── layout.tsx             ← DM Sans/Mono via next/font; global styles
│   │   ├── globals.css            ← Tailwind 4 @theme tokens + neumorphic
│   │                            primitive classes (.orb-raised/.orb-well/…)
│   │   └── api/
│   │       ├── health/route.ts            ← liveness probe (public)
│   │       ├── auth/{register,login,logout,me}/route.ts
│   │       ├── goals/route.ts             ← list / create
│   │       ├── goals/clarify/route.ts      ← wizard step: AI clarifying questions
│   │       ├── goals/[id]/route.ts        ← detail(+tasks) / patch / delete
│   │       ├── goals/[id]/generate-tasks/route.ts  ← the AI planner (ADR-005)
│   │       ├── tasks/route.ts             ← list (assignee/status/goal filters) / create
│   │       ├── tasks/[id]/route.ts        ← detail / patch / delete
│   │       ├── tasks/[id]/updates/route.ts ← post check-in; flips task status
│   │       ├── team/route.ts              ← people + members / invite
│   │       ├── activity/route.ts          ← feed, latest 50
│   │       ├── stats/route.ts             ← dashboard aggregates
│   │       └── settings/route.ts          ← workspace singleton get/patch
│   ├── components/
│   │   ├── orbital/
│   │   │   ├── orbital-app.tsx    ← app shell (nullable user); desktop sidebar +
│   │   │   │                        mobile bottom tab bar + MORE sheet
│   │   │   ├── login-screen.tsx   ← LoginCard — the /login auth card (3 states)
│   │   │   ├── store.ts           ← THE Zustand store (Layer 3); skips fetches
│   │   │   │                        while user is null
│   │   │   ├── user-menu.tsx      ← UserMenuOrLogin: avatar popover w/ Log Out,
│   │   │   │                        or LOG IN button when unauthenticated
│   │   │   ├── sidebar.tsx        ← nav: Dashboard, Goals, My Tasks | Agent
│   │   │   │                        Activity, Team, Settings; collapsible
│   │   │   ├── sidebar-clock.tsx   ← neumorphic analog clock (SVG, 15s tick)
│   │   │   ├── sidebar-collapse.ts ← collapse state: useSyncExternalStore
│   │   │   │                        + localStorage (orbital-sidebar-collapsed)
│   │   │   ├── task-card.tsx      ← status dot, AI badge, assignee, deadline,
│   │   │   │                        direct edit/delete buttons + inline
│   │   │   │                        "Delete? Yes No" confirm
│   │   │   ├── progress-ring.tsx  ← SVG completion ring (incl. faint variant)
│   │   │   ├── widgets.tsx        ← stat cards, tasks-status panel
│   │   │   ├── empty-state.tsx    ← illustrated empty screens
│   │   │   ├── logo.tsx           ← brand marks: 6-dot ring + 1-2-3 pyramid
│   │   │   │                        (pure geometry helpers, unit tested)
│   │   │   ├── views/             ← dashboard, goals, goal-detail, my-tasks,
│   │   │   │                        activity, team, settings (7 views)
│   │   │   └── dialogs/           ← new-goal (3-step wizard + DatePicker),
│   │   │                            goal-edit, add-task, task-edit, task-detail,
│   │   │                            invite-member
│   │   └── ui/                    ← shadcn/ui primitives (vendored, 12 in use)
│   │                                + the custom date-picker
│   ├── hooks/                     ← use-toast
│   └── lib/
│       ├── orbital.ts             ← domain types, DTOs, status metadata
│       ├── router.ts              ← view ↔ path mapping (ADR-001) + unit tests
│       ├── clarify.ts             ← wizard questions: bounds + fallback
│       ├── plan-sanitizer.ts      ← AI plan bounds + template fallback
│       ├── checkin.ts             ← check-in → task-status mapping
│       ├── calendar.ts            ← month-grid math for the date picker — unit
│       │                            tested (monthGrid, isSameDay)
│       ├── activity-groups.ts      ← activity feed date grouping — unit
│       │                            tested (groupActivityByDate, v1.6)
│       ├── rate-limit.ts          ← fixed-window auth throttling (ADR-009)
│       ├── team.ts                ← invite/agent form normalization — unit tested
│       ├── next-action.ts         ← dashboard next-planned-action derivation — unit tested
│       ├── api.ts                 ← ok()/fail() envelope + requireSession()
│       ├── auth.ts                ← scrypt + HMAC sessions (ADR-003)
│       ├── db.ts                  ← Prisma singleton + URL normalization
│       └── utils.ts               ← cn() class merge
├── docs/
│   ├── screenshots/               ← app screenshots used by README
│   ├── ssh_git_wrapper_v3.py      ← operator SSH push tool
│   └── how-to-git-push-using-ssh-wrapper_SKILL.md ← its runbook
└── skills/                        ← operator skill catalog (not app code;
                                    eslint-ignored, do not import from src/)
```

### 3.3 Critical Code Patterns

**Pattern A — The response envelope and its single client-side consumer**

```typescript
// src/lib/api.ts — every handler returns one of these two shapes.
export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ ok: true as const, data }, { status: init ?? 200 });
}
export function fail(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false as const, error: { code, message } }, { status });
}

// src/components/orbital/store.ts — the ONLY sanctioned API client.
async function call<T>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, { ...init, /* JSON headers when body */ });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    toast({ title: "Something went wrong", description: /* server message */ });
    return null;                     // actions treat null as "abort silently"
  }
  return payload.data ?? null;
}
```

*Why this pattern:* one contract for 15 endpoints; failures degrade to a toast and a `null` return, so a network or validation error can never throw into React render. The smoke suite asserts the envelope on every endpoint it touches.

**Pattern B — SQLite URL normalization (the two-anchor problem)**

```typescript
// src/lib/db.ts — the Prisma CLI resolves relative file: URLs against
// prisma/schema.prisma; the runtime engine anchors them against CWD.
// Normalize to an absolute path BEFORE the first client is constructed.
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return `file:${path.resolve(process.cwd(), 'prisma', '../db/custom.db')}`;
  if (/^file:/i.test(url)) {
    const raw = url.replace(/^file:/i, '');
    if (path.isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw)) return `file:${raw}`;
    return `file:${path.resolve(process.cwd(), 'prisma', raw)}`; // CLI rule
  }
  return url; // non-SQLite URLs pass through untouched
}
process.env.DATABASE_URL = resolveDatabaseUrl();
```

*Why this pattern:* without it, `db:push`/`db:seed` (CLI anchor) and the standalone server (CWD anchor) can open *different* database files — the exact failure observed during delivery verification (`Error code 14: Unable to open the database file`). Centralizing the fix in the module that owns the client means no other code needs to care.

**Pattern C — Degrade-not-fail AI generation**

```typescript
// src/app/api/goals/[id]/generate-tasks/route.ts (abridged)
const generated = (await generateWithSdk(goal.title, goal.description))
  ?? templatePlan(goal.title);          // deterministic 8-step fallback
// generateWithSdk() returns null on: SDK import failure, empty completion,
// malformed JSON, or fewer than 4 sanitized tasks — never throws.
```

*Why this pattern:* the feature must work in every environment the app can be cloned into. The sanitizer also clamps titles to 160 chars, descriptions to 500, hours to 1–40, and caps the plan at 10 tasks — bounding what untrusted LLM output can persist.

**Pattern D — Mutations narrate themselves**

```typescript
// Every mutating handler ends with an activity write, e.g. tasks/[id]/updates:
await db.activityLog.create({
  data: {
    type: "status_update",
    message: `${session.name} set "${task.title}" to ${status.replace("_", " ")}`,
    detail: `...full sentence for the feed's expanded view...`,
    taskId: task.id, goalId: task.goalId,
  },
});
```

*Why this pattern:* the activity feed is a product surface (the "agent activity" panel), not a debug log. Omitting the write in a new endpoint silently degrades the UX contract — hence its status as an architectural invariant, enforced in review and visible in the smoke suite's task pipeline.

---

## 4. Data Architecture

### 4.1 Database Schema

```mermaid
erDiagram
    User ||--o| Person : "linked login identity"
    Person ||--o{ Task : assigns
    Goal ||--{ Task : contains
    Task ||--{ TaskUpdate : "check-in history"
    Task ||--o{ ActivityLog : references
    Goal ||--o{ ActivityLog : references
    TeamMember {
        string kind "human | agent"
    }
    WorkspaceSetting {
        string id "singleton row"
    }
```

| Model | Rows (seeded demo) | Purpose |
|-------|--------------------|---------|
| `User` | 1 | Login identity: email (unique), name, scrypt hash, avatar color |
| `Person` | 10 | Assignable entity; seeded demo people + 1 row linked to the login user via `userId` (drives "My Tasks") |
| `TeamMember` | 0 | Starts empty (fresh workspace, like the reference app); humans (`kind: "human"`) and AI agents (`kind: "agent"`, with `agentRole`) accrue through invites |
| `Goal` | 3 | title, description, status (2 active + 1 done), targetDate, sortOrder |
| `Task` | 31 | title, description, status (26 done, 2 blocked, 3 pending), deadline, assigneeId, estimatedHours, `createdByAi`, sortOrder |
| `TaskUpdate` | 0 | Check-ins: status + optional note, newest first. The seed sets task statuses directly rather than synthesizing history; rows accrue through real use |
| `ActivityLog` | 36 | The feed: type, message, detail, task/goal refs, createdAt (36 since the v2.5 seed regeneration; the pre-v2.5 seed wrote 22) |
| `WorkspaceSetting` | 1 | Fixed `singleton` id: name, workStart/workEnd, pingFrequency, aiTone |

### 4.2 Data Models — Status Vocabularies

Three distinct, non-interchangeable vocabularies (canonical metadata: `TASK_STATUS_META` / `GOAL_STATUS_META` / `UPDATE_STATUS_META` in `src/lib/orbital.ts`):

| Vocabulary | Values | Set by |
|------------|--------|--------|
| Task status | `pending` `in_progress` `blocked` `need_help` `done` | Task create/patch; also flipped by check-ins |
| Goal status | `active` `done` `draft` `paused` | Goal create/patch |
| Check-in status | `on_track` `blocked` `need_help` `done` | `POST /api/tasks/[id]/updates` |

Posting a check-in syncs the task's workflow status: `done`/`blocked`/`need_help` map identity onto the task, while `on_track` keeps the current status and only un-blocks (`blocked`/`need_help` → `in_progress`; a check-in is not work starting, so `pending` stays `pending`). Completing the **last open task** in an active goal auto-completes the goal and logs `goal_completed` — one API call can update the update history, the task, the goal, and the feed.

### 4.3 Persistence Strategy

- **Client singleton:** exactly one `PrismaClient` per process, memoized on `globalThis` in dev to survive HMR (§ Pattern B covers URL normalization).
- **Schema evolution:** `prisma db push` (no `migrations/` folder by design — ADR-002). The seed is idempotent: it wipes all domain tables then reinserts the canonical demo workspace.
- **Referential actions:** `Task.goal` → `Cascade` (deleting a goal deletes its tasks); `Task.assignee` → `SetNull` (deleting a person orphans tasks, never blocks); `TaskUpdate.task` → `Cascade`.
- **Indexes:** `Person.name`; `Goal.status`; `Task.{goalId, assigneeId, status}`; `TaskUpdate.taskId`; `ActivityLog.createdAt` — matching the list endpoints' filter and sort shapes.
- **Query logging:** Prisma logs queries in development, errors only in production (`src/lib/db.ts`).

---

## 5. Design System Reference

### 5.1 Typographic System

| Face | Weights | Usage |
|------|---------|-------|
| **DM Sans** | variable | All UI text; loaded via `next/font` (`--font-dm-sans`), mapped to Tailwind `font-sans` |
| **DM Mono** | variable | Numeric and date accents (`--font-dm-mono`, `font-mono`) |

Both are self-hosted by `next/font` at build time — no runtime Google Fonts request, no layout shift.

### 5.2 Color Tokens

Declared as CSS variables in `src/app/globals.css`, exposed to Tailwind 4 via `@theme inline` (`orb-*` utilities). v1.4 re-measured the reference and rebuilt the surface system as **neumorphic** — a soft-beige scheme where raised panels carry dual embossed shadows (light `rgba(255,250,244,…)` top-left, dark `rgba(160,143,126,…)` bottom-right) and inset wells carry the same pair inverted:

| Token | Hex | Usage |
|-------|-----|-------|
| `--orb-canvas` | `#EBE7E2` | Page canvas (24px padding, no outer panel) |
| `--orb-raised` | `#EEEAE6` | Raised surfaces: sidebar, cards, dialogs, buttons |
| `--orb-well` | `#EBE7E2` | Inset wells: inputs, chips, clock face, icon squares |
| `--orb-track` | `#DDD8D2` | Progress track behind the green fill |
| `--orb-body` | `#2F2823` | Primary text |
| `--orb-heading` | `#3A3A3A` | Headings / button text |
| `--orb-muted` | `#6E6E6E` | Secondary text |
| `--orb-green` / `-deep` | `#2ECC8A` / `#1F8F5F` | Done / active / success; deep for text on light |
| `--orb-purple` / `-deep` | `#996CE4` / `#6B4BBF` | In-progress, AI accents |
| `--orb-coral` / `-deep` | `#FF8077` / `#C9574E` | Blocked / destructive; blocked task cards add a coral inset ring (`rgba(255,128,119,0.18)`, `.orb-task-blocked`) |
| `--orb-amber` | `#F5B841` | Pending status dot |
| `--orb-pink` | `#FFCBDE` | Need-help status dot |
| `--orb-sand` | `#C4996A` | Paused goal |

Status → color binding is centralized in `TASK_STATUS_META` (dot + text colors per status), so a status never renders with an ad-hoc color. The legacy `tailwind.config.ts` carries only shadcn/ui HSL tokens and `tailwindcss-animate`.

**Primitive classes** (same file, `@layer utilities`) across **three measured card tiers** (v1.6) and a **two-tier label system** (v1.7): `.orb-raised` (radius 16, standard pair — buttons/small ui), `.orb-raised-lg` (radius 20 — sidebar), `.orb-panel` (radius 16, large pair — dashboard/settings/stat panels), `.orb-row-card` (radius 14, deeper pair — task cards, activity feed), `.orb-goal-card` (radius 16, deeper pair — goal cards), `.orb-raised-btn` (radius 12 buttons), `.orb-well` (radius 10 insets), `.orb-well-pill` (full-radius chips), `.orb-card` (legacy standard alias), `.orb-task-blocked` (blocked-card coral ring), `.orb-pill-outline-sm` (35px mobile NEW GOAL variant), the label tiers `.orb-label` (11px/600/ls 1.1px `#6E6E6E`) and `.orb-label-sm` (10px/600/ls 1.2px `#767676`), plus the `.orb-pill` action family. **Cascade rule:** these custom classes are emitted after Tailwind's generated utilities — never pair an arbitrary `shadow-[…]`/`rounded-*`/`h-*` utility with `.orb-card`/`.orb-raised`/`.orb-btn-*`/`.orb-pill-*` on one element (the utility loses); use a dedicated custom class for overrides.

### 5.3 Component Primitives

shadcn/ui (Radix-based), vendored under `src/components/ui/` (12 in use): `button`, `dialog` (all modals — 500px radius-20 neumorphic panels — including the conversational New Goal wizard), `input` (well-styled), `label`, `popover` (user menu + date picker), `radio-group` (check-in radios), `select` (assignee/status pickers), `sheet` (mobile MORE sheet), `textarea` (well-styled), and `toast` (via `use-toast` + `toaster`), plus the bespoke `date-picker` (popover calendar on the `calendar.ts` seam). Bespoke ORBITAL components (`task-card`, `progress-ring`, `widgets`, `empty-state`, `logo`) are built on these primitives, not around them. Deletes confirm inline in the cards themselves (v1.3), so no alert-dialog primitive is needed.

### 5.4 Motion / Animation

Deliberately restrained, all CSS-based: the mobile bottom tab bar, the MORE bottom sheet (slide-in from Radix primitives), dialog enter/exit, toast slide-ins, and hover transitions on cards/buttons. `framer-motion` was pruned with the other unused template extras in v1.2. A `prefers-reduced-motion: reduce` media query in `globals.css` disables animations and transitions for users who opt out.

---

## 6. Security Architecture

### 6.1 Security Rules

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | Every API route (except `/api/health` and `/api/auth/*`) requires a valid session | `requireSession()` first line of each handler; 401 envelope otherwise |
| 2 | Passwords are never stored or logged in plaintext | scrypt with per-user 16-byte salt, 64-byte key (`src/lib/auth.ts`) |
| 3 | Session tokens cannot be forged or altered | HMAC-SHA256 over `userId.expiry` with `AUTH_SECRET`; verified with `timingSafeEqual` |
| 4 | Cookies are invisible to scripts and scoped | `httpOnly`, `SameSite=Lax`, `Secure` in production, `path=/`, 7-day TTL |
| 5 | All input is validated server-side | Manual guards in every handler: trim, length caps, enum membership, referential existence |
| 6 | SQL injection is structurally impossible | All queries through Prisma's parameterized client |
| 7 | No secrets in the repository | `.gitignore` rejects `.env`, `*.key`, `ssh-key.txt`; keys supplied out-of-band per the SSH-wrapper runbook |
| 8 | LLM output is treated as untrusted | `sanitizeTasks()` clamps count/lengths/hours in `generate-tasks` |
| 9 | Auth endpoints are throttled per IP | Fixed-window limiter (ADR-009): 10 attempts/15 min → `429 RATE_LIMITED` + `Retry-After`; in-memory, single-node |

### 6.2 Security Utilities

| Utility | Location | Responsibility |
|---------|----------|----------------|
| `hashPassword` / `verifyPassword` | `src/lib/auth.ts` | scrypt hash + timing-safe verification |
| `createSessionToken` / `parseSessionToken` | `src/lib/auth.ts` | HMAC sign/verify of stateless tokens |
| `setSessionCookie` / `clearSessionCookie` | `src/lib/auth.ts` | Cookie lifecycle with hardening flags |
| `requireSession` | `src/lib/api.ts` | Route-handler guard returning the session user |
| `sanitizeTasks` | `generate-tasks/route.ts` | Bounds LLM-generated data before persistence |
| `checkRate` / `authRateLimit` / `clientIpOf` | `src/lib/rate-limit.ts` | Fixed-window per-IP throttling for the auth routes (ADR-009) |
| `resolveDatabaseUrl` | `src/lib/db.ts` | Path normalization (prevents accidental cross-location DB access) |

### 6.3 Authentication & Authorization

Single-workspace model with no RBAC: any authenticated user has full read/write access to all goals, tasks, team, and settings. Registration (`/api/auth/register`) is open; email is unique, password minimum length enforced (8). "My Tasks" resolves through the `Person` row linked to the login user (`Person.userId`), not through a role. Adding RBAC would mean a role column on `User` plus a check in `requireSession` — deliberately out of scope for v1.0 (see §10).

v1.4 auth surface (mirrors the reference): unauthenticated visits render the workspace shell with a LOG IN header button (the store skips data fetches while `user` is null — reads/mutations stay session-gated, so nothing leaks); `/login` is a real route serving the `LoginCard` (sign-in / sign-up / forgot states, `?from_url=` return handling) to EVERY visitor — authenticated ones included (v2.11/F13, measured on the live: no redirect; re-sign-in lands on the workspace). "Continue with Google" is rendered for visual parity but carries no credentials — it degrades to an explanatory toast, the same degrade-not-fail doctrine as the AI features. The reference's public-read API behavior is a Base44 platform artifact and a documented deviation.

### 6.4 Threat Model

| Vector | Mitigation | Residual risk |
|--------|------------|---------------|
| Session forgery | HMAC-SHA256 + timing-safe compare; 64-hex signatures | Weak `AUTH_SECRET` in prod if operator ignores the README warning |
| Password brute force | scrypt (memory-hard) per attempt + per-IP rate limit (ADR-009) | Buckets are per-process — a multi-instance deploy needs a shared store |
| CSRF | `SameSite=Lax` + JSON-only bodies (no form-encoded mutations) | Lax allows top-level GET navigations only; all mutations are POST/PATCH/DELETE with JSON |
| XSS | React auto-escaping; no `dangerouslySetInnerHTML` anywhere in `src/` | None known |
| SQLi | Prisma parameterization throughout | None known |
| Prompt-injected LLM output | Sanitizer clamps (≤10 tasks, 160-char titles, 1–40 h) | Malicious-but-well-formed content can still appear as task text (user-deletable) |
| Open registration | By design (demo parity) | Any visitor can create an account — §10 lists gating options |

---

## 7. Testing Strategy

### 7.1 Test Distribution

| Category | Files | Checks | Location | Framework |
|----------|-------|--------|----------|-----------|
| End-to-end API smoke | 1 (`scripts/smoke-test.sh`) | 30 | `scripts/` | Bash + curl + python3 (no test framework needed) |
| Unit (pure domain seams) | 15 (`src/lib/*.test.ts`, `tests/db-path.test.ts`) | 138 | `src/lib/` + `tests/` | Vitest 5 (`bun run test`) |

### 7.2 Test Patterns

The unit layer (`bun run test`, ~1.2s, zero infrastructure) pins the pure seams: `router.test.ts` (view ↔ path mapping incl. legacy `?view=` links and unknown-path fallback), `clarify.test.ts` (deterministic questions + LLM-output bounds), `domain.test.ts` (plan sanitizer clamps, template fallback, check-in → task-status mapping incl. the on_track unblock rule), `rate-limit.test.ts` (fixed-window accounting, expired-bucket eviction, limit boundary, retry-after math), `team.test.ts` (email → display-name derivation, agent-field normalization bounds), `next-action.test.ts` (next-planned-action extraction incl. the v1.3 name-prefix regression), `logo-geometry.test.ts` (six-dot ring angles, 1-2-3 pyramid rows), `calendar.test.ts` (month-grid boundaries, leap February, the 6-row invariant, `isSameDay`, and — added v1.5 — `formatLongDate` ordinals: 1st/2nd/3rd, 11th–13th, 21st/22nd/23rd, all twelve months), `activity-groups.test.ts` (added v1.6: feed date grouping — order, labels, midnight boundaries, the "Today" group), `activity-tags.test.ts` (added v1.7: feed type-tag mapping — underscores → spaces, unknown-type passthrough), `greeting.test.ts` (v1.7: the dashboard greeting — Title Case strings; v1.9: 05:00 boundary), `relative-time.test.ts` (v1.9: the date-fns long-form distance — minute/hour/day/month/year bands, the calendar-months path, singular/plural), `day-image.test.ts` (v1.9: the date-card photo rotation — four lighting variants, 5/11/17/21 boundaries). All v1.1–v1.9 logic changes were written red → green at these seams.

The smoke suite boots the **production standalone server** (not dev mode), polls `/api/health` until ready, then exercises: login (valid / wrong password / unauthenticated), all six read endpoints (envelope asserted), task creation, invalid-status rejection (400), the full check-in round-trip (task status flips + update recorded), deletion, logout invalidation, page render, **path-route serving** (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings` each return the app shell; an unknown path must 404), the **clarify endpoint** (three questions returned; title-less payload rejected 400), **team validation** (invite with an invalid email rejected 400; agent without a name rejected 400), and the **login rate limit** (rapid-fire attempts earn `429 RATE_LIMITED`). Each step prints `PASS:`/`FAIL:`; the script exits non-zero on any failure and kills the server on exit. Artifacts land in `/tmp/smoke-*` for post-mortem.

### 7.3 Coverage Thresholds

- **Gate (mandatory before push):** `bun run lint` → `bun run typecheck` → `bun run test` (**138/138**) → `bun run build` → `./scripts/smoke-test.sh` with **30/30 PASS**. There is no hosted CI; this local gate is the only gate. The `typecheck` step is not optional: `next.config.ts` sets `ignoreBuildErrors`, so the build alone will not surface type errors.
- Line/branch coverage is not measured — the seam list is small and deliberately complete (see ADR-008).

### 7.4 Pre-Push Checklist

- [ ] `bun run lint` exits 0
- [ ] `bun run typecheck` exits 0
- [ ] `bun run build` compiles clean
- [ ] `bun run test` → 138/138 PASS
- [ ] `./scripts/smoke-test.sh` → 30/30 PASS
- [ ] `bun run test:e2e` → 115/115 PASS (needs `bun run build` first)
- [ ] New/changed endpoints write their `ActivityLog` entries (Pattern D)
- [ ] Schema changes regenerated (`bunx prisma generate`) and reseeded (`db:push` + `db:seed`)
- [ ] No `.env`, keys, or `db/*.db` staged (`git status` review)
- [ ] Commit message follows `:art: feat:` / `:memo: docs:` / `:bug: fix:` convention on `main`

---

## 8. Build & Deployment

### 8.1 Production Build

```bash
bun run build
# = next build
#   && cp -r .next/static .next/standalone/.next/
#   && cp -r public .next/standalone/
bun run start    # NODE_ENV=production bun .next/standalone/server.js  (port 3000)
```

The standalone tree contains the traced `node_modules`, the static chunks, and `public/` — a self-sufficient artifact. `outputFileTracingRoot` (ADR-007) pins the layout; the server **must** start from the repo root so the SQLite path normalization (Pattern B) resolves.

### 8.2 Environment Variables

| Name | Required | Description | Default |
|------|----------|-------------|---------|
| `DATABASE_URL` | Yes | SQLite file. Relative `file:` paths resolve against `prisma/` (CLI rule), normalized to absolute at runtime by `src/lib/db.ts`. | `file:../db/custom.db` |
| `AUTH_SECRET` | Production | HMAC secret for session tokens (`openssl rand -hex 32`). Unset ⇒ insecure dev-only constant is used (by design, loudly documented). | — |

### 8.3 Docker Configuration

None — no `Dockerfile` or compose file ships with v1.0. The standalone artifact is Docker-ready (single Node entrypoint, no build tools needed at runtime); containerization is tracked in §10.

### 8.4 CI/CD Pipeline

No hosted CI (no `.github/workflows`). The pipeline is the local gate (§7.3) followed by an authenticated push: `python3 docs/ssh_git_wrapper_v3.py --key-file <key outside the repo> --remote git@github.com:nordeim/project-management.git`. The wrapper materializes the key into a 0600 temp file, preflights auth with `ls-remote`, pushes `HEAD:refs/heads/main`, verifies the remote ref equals local HEAD, syncs the origin tracking ref, then shreds the key. Full runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.

---

## 9. Developer Handbook

### 9.1 Local Setup

```bash
git clone https://github.com/nordeim/project-management.git && cd project-management
bun install                # or: npm install
cp .env.example .env       # defaults are correct for local use
bun run db:push            # create db/custom.db from the schema
bun run db:seed            # canonical demo workspace
bun run dev                # http://localhost:3000
```

Demo login: `demo@orbital.app` / `Demo1234!`. Full verification: `bun run build && ./scripts/smoke-test.sh` (expects 30/30 PASS; unit layer via `bun run test`, 138/138; browser layer 115/115).

### 9.2 Common Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Dev server on :3000, logs to `dev.log` |
| `bun run build` | Production build + standalone assembly |
| `bun run start` | Serve the standalone build (from repo root only) |
| `bun run lint` | ESLint (flat config; `skills/`, `docs/` build dirs ignored) |
| `bun run typecheck` | `tsc --noEmit` — the type gate (build sets `ignoreBuildErrors`) |
| `bunx prisma generate` | Regenerate the client after schema edits |
| `bun run db:push` | Apply schema changes to SQLite |
| `bun run db:seed` | Idempotent reset to demo data |
| `bunx prisma studio` | Inspect data in a browser (optional convenience) |
| `bun run test` | Vitest unit suite (138 checks, pure seams) |
| `./scripts/smoke-test.sh` | 30-check E2E suite against the production build |

### 9.3 Code Style Rules

- TypeScript strict (with the deliberate `noImplicitAny: false`); ESLint flat config extends `eslint-config-next` core-web-vitals + TS presets.
- Enforcement: the §7.3 gate — nothing merges or pushes without lint+build+smoke green.
- Conventions that matter in review: the layer model (§3.1), the envelope (Pattern A), the activity invariant (Pattern D), centralized status metadata (`src/lib/orbital.ts`).

### 9.4 Git Workflow

- **`main` only** — no feature branches (operator contract).
- **Commits:** Conventional Commits with emoji prefixes: `:art: feat: …`, `:memo: docs: …`, `:bug: fix: …`. Identity: `Pete A <pete@pop-os>`.
- **Push:** via `docs/ssh_git_wrapper_v3.py` with an externally supplied key (§8.4) — never a resident `~/.ssh` dependency.
- **Never committed:** `.env`, `*.key`, `db/*.db`, `node_modules/`, `dev.log`/`server.log` (all gitignored).

---

## 10. Known Issues & Outstanding Tasks

| Priority | Issue | Impact | Status |
|----------|-------|--------|--------|
| ~~HIGH~~ | ~~No rate limiting on `/api/auth/login` / `/api/auth/register`~~ | ~~Online brute-force surface~~ | **Closed in v1.2** — ADR-009 fixed-window limiter (in-memory, single-node; swap for a shared store if scaling out) |
| MEDIUM | Open registration (any visitor can create an account) | Workspace open to the public internet once deployed | Open — gate behind invite codes or an `ALLOW_REGISTRATION` env flag |
| LOW | Unit layer covers pure seams only (no component tests) | View-layer regressions surface via the smoke suite, not a fast unit run | Partially closed in v1.1 (ADR-008); component tests remain open |
| ~~LOW~~ | ~~Template dependencies unused in `package.json`~~ | ~~Larger install footprint; misleading stack claims~~ | **Closed in v1.2** — pruned 859 → 193 packages; 35 unused vendored ui components and the dead `use-mobile` hook deleted |
| LOW | `tsconfig.json` sets `noImplicitAny: false` | Weaker inference checks than full strict | Accepted (template default); tighten when convenient |
| ~~LOW~~ | ~~No `prefers-reduced-motion` handling~~ | ~~Accessibility gap in animations~~ | **Closed** — `globals.css` ships the media query (animations/transitions disabled) |
| LOW | No Dockerfile / hosted CI | Deployment and gate rely on the operator machine | Open — standalone artifact is Docker-ready; a lint+typecheck+build+smoke workflow mirrors §7.3 |
| INFO | AI generation falls back to the 8-step template when the SDK is unavailable | Generic (but usable) plans offline | By design (ADR-005) |
| INFO | "Continue with Google" renders but degrades to a toast | No OAuth credentials in a self-hosted clone | By design (v1.4 parity decision); wire a real provider if needed |
| INFO | `AUTH_SECRET` dev fallback constant | Insecure sessions if deployed without setting it | By design; README + §8.2 warn loudly |

---

## 11. Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/orbital/store.ts` | 374 | The Zustand store: all server state, `call()` envelope client, every action + refresh set; skips fetches while `user` is null |
| `prisma/seed.ts` | 265 | Idempotent demo workspace: user, 10 people, 3 goals, 31 tasks, 22 activity rows |
| `src/app/globals.css` | 575 | Tailwind 4 `@theme` tokens, neumorphic primitive classes, the two-tier label system, base styles, reduced-motion query |
| `src/components/orbital/views/dashboard-view.tsx` | 299 | Dashboard: greeting card, centered stats panel, activity preview with in-row timestamps, goals panel |
| `src/components/orbital/login-screen.tsx` | 290 | LoginCard — the `/login` auth card: sign-in / sign-up / forgot states, Google degrade |
| `src/components/orbital/orbital-app.tsx` | 268 | App shell (nullable user): sticky sidebar, full-bleed mobile chrome + bottom tab bar + MORE sheet, popstate wiring |
| `src/components/orbital/views/goals-view.tsx` | 250 | Goals grid: neumorphic cards, filter chips, inline delete confirm |
| `src/components/orbital/views/goal-detail-view.tsx` | 217 | Goal detail: centered stat cards, inline ADD TASK, header inline delete confirm |
| `src/components/orbital/views/settings-view.tsx` | 231 | Settings: 2-column layout (Workspace + Hours / AI Assistant), well inputs |
| `src/components/orbital/dialogs/new-goal-dialog.tsx` | 291 | 3-step AI wizard: describe (+ DatePicker) → clarifying questions → generate |
| `src/app/login/page.tsx` | 20 | Real `/login` route: auth-card shell for every visitor (no authed redirect — v2.11/F13), `?from_url` handling |
| `src/components/ui/date-picker.tsx` | 139 | Custom date picker: well trigger + popover calendar on the `calendar.ts` seam |
| `src/lib/calendar.test.ts` | 121 | Month-grid specs: boundaries, leap February, 6-row invariant, `isSameDay` |
| `src/lib/calendar.ts` | 70 | Pure month-grid math (`monthGrid`, `isSameDay`) — unit tested |
| `src/lib/activity-groups.ts` | 56 | Activity feed date grouping (`groupActivityByDate`) — unit tested |
| `src/lib/activity-groups.test.ts` | 71 | Feed grouping specs: order, labels, midnight boundaries, "Today" |
| `src/lib/activity-tags.ts` | 9 | Feed type-tag mapping (`activityTypeTag`, underscores → spaces) — unit tested |
| `src/lib/activity-tags.test.ts` | 26 | Type-tag specs: known types, multi-underscore, unknown passthrough |
| `src/lib/greeting.test.ts` | 30 | Greeting specs: Title Case strings, 12:00/18:00 boundaries |
| `src/components/orbital/sidebar.tsx` | 190 | Collapsible nav: compact brand, sections, clock + plain tasks-status row, chevron toggle |
| `src/lib/router.ts` | 91 | View ↔ path mapping (`parseUrl` / `toPath`), legacy link support — unit tested |
| `src/lib/orbital.ts` | 212 | Domain types, DTOs, status metadata (labels + colors), overdue helper, the tested `greetingFor` |
| `src/app/api/goals/[id]/generate-tasks/route.ts` | 130 | AI planner: SDK call (with clarifying answers), sanitizer, template fallback, assignment + scheduling |
| `src/app/api/goals/clarify/route.ts` | 81 | Wizard step: AI clarifying questions + fallback + `goal_analyzed` activity |
| `src/lib/rate-limit.ts` | 59 | Fixed-window per-IP auth throttling (ADR-009) — unit tested |
| `scripts/smoke-test.sh` | 166 | 30-check E2E suite against the production server |
| `prisma/schema.prisma` | 123 | 8 models (TeamMember incl. agent description/instructions), relations, indexes |
| `src/components/orbital/sidebar-clock.tsx` | 70 | Neumorphic analog clock (SVG, 15s tick) |
| `src/lib/auth.ts` | 91 | scrypt hashing, HMAC session tokens, cookie lifecycle |
| `src/lib/plan-sanitizer.ts` | 54 | AI task-plan bounds + deterministic template — unit tested |
| `src/components/orbital/user-menu.tsx` | 78 | UserMenuOrLogin: neumorphic trigger + Log Out popover, or LOG IN button |
| `src/components/orbital/task-card.tsx` | 149 | Task row: status, AI badge, coral blocked title + `.orb-task-blocked` ring, inline "Delete? Yes No" confirm |
| `src/components/orbital/dialogs/invite-member-dialog.tsx` | 207 | Invite Member (email + role) / Create AI Agent (name/description/instructions) |
| `src/components/orbital/sidebar-collapse.ts` | 37 | Collapse state: `useSyncExternalStore` + localStorage |
| `src/lib/db.ts` | 51 | Prisma singleton + SQLite URL normalization (Pattern B) |
| `src/lib/team.ts` | 35 | Invite/agent form normalization — unit tested |
| `src/lib/clarify.ts` | 36 | Wizard question fallback + LLM bounds — unit tested |
| `src/components/orbital/logo.tsx` | 78 | Brand marks: 6-dot ring + 1-2-3 pyramid — geometry unit tested |
| `src/lib/next-action.ts` | 20 | Dashboard next-planned-action derivation — unit tested |
| `src/lib/api.ts` | 30 | `ok()` / `fail()` envelope + `requireSession()` guard |
| `src/lib/checkin.ts` | 24 | Check-in → task-status mapping — unit tested |
| `src/app/page.tsx` | 17 | The workspace page: session (nullable user) → OrbitalApp |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **Goal** | A dated outcome a team commits to; container and scheduler for its task plan |
| **Task** | A unit of work inside a goal, with status, deadline, assignee, estimated hours, and an AI-attribution flag (`createdByAi`) |
| **Check-in (TaskUpdate)** | A status report posted on a task (`on_track` / `blocked` / `need_help` / `done`, optional note); also flips the task's live status |
| **Person** | An assignable entity — seeded demo people plus one linked to each login user (`userId`), which powers "My Tasks" |
| **TeamMember** | An invited human or a configured AI agent (`kind`, `agentRole`, optional `description`/`instructions`) shown on the Team page |
| **ActivityLog** | The append-only feed narrating every mutation (create/assign/status/invite/settings) |
| **Envelope** | The uniform API response `{ ok, data }` or `{ ok, error: { code, message } }` |
| **The planner** | `POST /api/goals/[id]/generate-tasks` — LLM-backed task-plan generation (clarifying answers in, sanitized tasks out) with deterministic fallback |
| **Deep link** | A shareable view URL (`/goals/<id>`, `/my-tasks`, …) — rewrites serve the shell, `router.ts` restores the view (legacy `?view=` links still resolve) |
| **Smoke suite** | `scripts/smoke-test.sh` — the 30-check production-server verification gate |
| **Inline confirm** | The reference app's delete pattern: the action icons swap in place for a confirm pair ("Delete / Cancel", "Yes, Delete / Cancel", "Delete? Yes / No") instead of opening a modal |
| **Neumorphic** | The reference's visual system: soft-beige surfaces on a same-tone canvas, with dual embossed shadows (raised) or their inversion (inset) creating depth without borders |
| **Well** | An inset neumorphic surface (`.orb-well`) — inputs, chips, the clock face, icon squares; carries inverted shadows so it reads as pressed into the panel |
| **Raised** | A neumorphic panel (`.orb-raised` / `.orb-raised-lg`) — sidebar, cards, dialogs, buttons; carries the light top-left / dark bottom-right shadow pair |
| **SSH wrapper** | `docs/ssh_git_wrapper_v3.py` — key-materializing authenticated push tool with post-push remote verification |

