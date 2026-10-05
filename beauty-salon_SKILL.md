---
name: beauty-salon
description: >
  Comprehensive engineering skill for the Maison Luminaire beauty-salon clone:
  a Next.js 16 + React 19 + Tailwind CSS v4 (CSS-first) + Prisma/SQLite
  single application with byte-parity design tokens, a computed-style parity
  e2e contract, and a hardened dev-time database-pinning layer. Distilled
  from two build/remediation sessions using the six-phase process.
version: 1.9.0
last_updated: "2026-10-05"
project_state: "61 unit + 104 e2e tests green; 27 routes; db-path seam v2.4 (env-file-first dev pinning); auth-shell font-context parity (font-shell) + slate-900 sRGB read-back (login-parity); not-found parity (slate card, path-interpolated, NotFoundBody island); service-detail parity (first-sentence H2, check-icon prep grid, exclusive-open FaqAccordion, Ready-to-begin CTA, per-service FAQ data in the faqs column, the dedicated Service-not-found state for unknown slugs); legal parity (LegalBlock model: accessibility checklist + note variant + mt-3 + br coordinator, privacy/terms top-level hoisting, the article's dead # link via LegalPBlock.link); booking parity (nested-grid form + mt-5/mt-10 margins, Notes placeholder, Calendar h-4 w-4 icon, ICS fixed 90-minute block + raw commas — decoded-href read-back); icon parity (the lucide class layer censused live on both sides — class sizing never size props, sage testimonial stars, hover-rotate arrows, team group/btn named group, footer + Reach-us icon sets, MapPin directions, login left-3/slate-500 icons, eye toggle removed); confirmation parity (flower2 watermark at responsive class sizing + stroke 0.5 in sage/30, the invisible decorative circle, the /contact policy link with its trailing arrow); the hero settled state (transform none + scale none — trap 8 — with the img at 1.08; the category images' computed 150ms default-ease hover via the reference's inert duration-s] token); head parity (the declared favicon + the declared-but-dead manifest link); links parity (the first both-sides href census on all 16 routes — the services grid's bottom Book-an-appointment CTA, the 1942-char services innerText, the accessibility article link, the landing 33-href + gallery 20-href sequences); SPA routing behavior replicated (case-insensitive route matching + trailing-slash preservation via src/proxy.ts — the Next 16 proxy convention — with /services slug case preserved so case-variant slugs render the Service-not-found state; skipTrailingSlashRedirect required because the router's 308 fires BEFORE the proxy); contact Hours status-pill row (flex justify-between mb-4 + StatusPill, marginless ul); slate scale pinned to sRGB (trap 6, slate-900 digit corrected session 6 + read-back contract); opacity-modifier oklab serialization documented (trap 7 — assert channels, not strings); individual-transform properties documented (trap 8 — v4's scale utilities write the `scale` property, not `transform`); form parity (the both-sides form-control census + the state layer — the fire-and-forget POST-failure behavior: the newsletter catch→success, the booking swallow-and-navigate; the "You're in…" success contract with the sage Check h-4 w-4; the ASCII-dot loading texts Sending.../Signing in.../Reserving... with the arrows always rendered + the login inputs disabled while loading; the login error as the reference's shadcn Alert card with the red-50/200/700 pinned to sRGB; the Notes textarea's resize-none; the date/time inputs' UA-intrinsic +2px height via the ::-webkit-datetime-edit padding rule — mechanism unattributable, behavior-matched; React omits the default type="text" attribute — locate inputs by property, not attribute); repo hygiene guard (scaffold relics removed); metadataBase wiring (site.ts)"
---

# beauty-salon_SKILL.md — Maison Luminaire Clone

> **How to use this document:** read §1–§3 before making any change (identity, stack, bootstrap); consult §4 before touching CSS, §5–§6 before touching components, §9–§10 when something breaks, and §11 before pushing. Every claim in this file traces to a file path, a command, or a test in this repository — paths are repo-relative.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Client Islands Deep Dive (the hook-equivalents)](#6-client-islands-deep-dive-the-hook-equivalents)
7. [Content Management & Data Ingestion](#7-content-management--data-ingestion)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [The Complete TypeScript Interface Reference](#20-the-complete-typescript-interface-reference)
- [Appendix A: Architecture Decision Records](#appendix-a-architecture-decision-records)
- [Appendix B: Test Inventory](#appendix-b-test-inventory)
- [Appendix C: Audit History](#appendix-c-audit-history)
- [Appendix D: Live-Site Validation Methodology](#appendix-d-live-site-validation-methodology)

---

## 1. Project Identity & Design Philosophy

**What:** a self-hosted, production-grade clone of the base44 "Maison Luminaire" beauty-salon experience — 13 public routes (landing with 7 sections, services grid + 8 SSG detail pages, filterable gallery with lightbox, team, about, contact, booking scheduler + ICS confirmation, login, 4 legal pages, 404) plus 6 typed JSON API endpoints — rebuilt as a single Next.js App Router application on Prisma/SQLite.

**Who/why:** solo engineering with AI-agent assistance; the goal is *visual and behavioral fidelity to the reference's computed output* — measured, not approximated — on a maintainable, typed, tested SSR substrate.

**Design thesis:** editorial cream-and-ink minimalism. Cormorant Garamond display serif over Mulish UI sans, warm cream `hsl(44 29% 97%)` ground, ink `hsl(0 0% 10%)` figure, sage secondary, peach accent. Generous whitespace, `0.22em` editorial tracking on eyebrows, quiet scroll-reveal motion.

**Non-negotiable design rules:**

1. **Parity outranks taste.** The reference DOM's class structure and computed styles are the contract; the e2e specs (`tests/e2e/mobile-navigation.spec.ts`) pin them. If a styling change breaks a parity spec, the change is wrong — not the spec.
2. **Tokens are pinned, never defaulted.** Every `@theme` color is a full `hsl()` value extracted from the live reference `:root`. Tailwind v4 defaults (oklch) are forbidden in this codebase (trap 2).
3. **Two visual systems, two chromes.** Marketing surface = cream editorial (`(site)` route group). Auth surface = slate/white card (`/login`, standalone). Booking = third chrome (always-glass `BookHeader`, `h-16`, "← Return to site").
4. **Anti-generic mandate:** no shadcn-default look, no purple/blue gradient washes, no Inter/Geist, no card-grid sameness. The cream/sage/peach palette and serif-led type are the brand.

**CTA hierarchy:** primary = "BOOK NOW" (header pill + hero + drawer CTA + service detail), secondary = editorial text links ("Explore the studio →"), tertiary = footer/legal links.

---

## 2. Tech Stack & Environment

| Layer | Technology | Version (package.json) | Critical Note |
|---|---|---|---|
| Web framework | Next.js (App Router, `output: standalone`) | `^16.1.1` | `params`/`searchParams`/`cookies()` are async — always `await`; `allowedDevOrigins` in `next.config.ts` is load-bearing for loopback dev |
| UI runtime | React | `^19.0.0` | Server Components by default; `react-hooks/set-state-in-effect` is enforced by ESLint |
| Language | TypeScript (strict) | `^5` | `tsc --noEmit` is a gate; `unknown`-narrowing at every API boundary |
| Styling | Tailwind CSS (CSS-first) | `^4` | **No `tailwind.config.*`** — tokens + `@utility` live in `src/app/globals.css`; eight v3→v4 engine traps pinned (§4.5) |
| Fonts | next/font (Cormorant Garamond 300–600 + italic, Mulish 300–600) | bundled | Self-hosted; `--font-serif`/`--font-sans` wire to next/font CSS vars in `@theme` |
| ORM / DB | Prisma + SQLite | `^6.11.1` | 7 models; relative `file:` URLs anchor at `prisma/schema.prisma`; dev scripts pin the DB inside the repo (§3.4) |
| Unit tests | Vitest | `^5.0.1` | Config matches `*.test.ts` only — Playwright's `*.spec.ts` never double-run |
| E2E tests | Playwright (Chromium) | `^1.63.0` | Boots the **production standalone build** on :3100 with its own seeded `db/e2e.db`, `workers: 1` |
| Runtime / PM | Bun | ≥ 1.3 | Install, scripts, TS seed execution, standalone server host — never `npm`/`pnpm` here |
| Auth | node:crypto (scrypt + HMAC-SHA256) | built-in | No auth library; httpOnly `ml_session` cookie, 7-day TTL, timing-safe compares, per-IP rate limit |
| UI primitives | Radix (alert-dialog, label, popover, radio-group, select, slot, toast) + CVA + clsx + tailwind-merge + lucide-react | pinned in package.json | Present from the scaffold; the marketing surface mostly composes raw semantic HTML + Tailwind |

Environment facts: Node 24 + Bun 1.3 verified; no `ssh` binary in the sandbox (pushes use the paramiko shim — `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`); the platform may inject an ambient `DATABASE_URL` env var (see §3.4 — the wrapped scripts defend against it).

---

## 3. Bootstrapping & Configuration

### 3.1 Fresh checkout → running app

```bash
bun install
cp .env.example .env          # then set AUTH_SECRET: openssl rand -hex 32
bun run db:push               # creates db/custom.db AT THE REPO ROOT
bun run db:seed               # idempotent reference content + demo user
bun run dev                   # http://localhost:3000 (logs tee'd to dev.log)
```

Verify: `curl -s localhost:3000/api/health` → `{"status":"ok","db":true}`.

### 3.2 Configuration files (all verified at repo root)

| File | Purpose | Gotcha |
|---|---|---|
| `next.config.ts` | `output: "standalone"`, `allowedDevOrigins: ["127.0.0.1"]` | Without `allowedDevOrigins`, dev chunks silently fail on the loopback origin (unhydrated pages, native form GET fallbacks) |
| `tsconfig.json` | strict, `@/*` → `src/*` | — |
| `eslint.config.mjs` | ESLint 9 flat + `next/core-web-vitals` + TypeScript rules | `react-hooks/set-state-in-effect` is ON — see §6 for sanctioned idioms |
| `vitest.config.ts` | `include: ["src/**/*.test.ts", "tests/**/*.test.ts"]`, node env, `@` alias | Matches `*.test.ts` ONLY |
| `playwright.config.ts` | `testDir: ./tests/e2e`, `workers: 1`, `fullyParallel: false`, chromium project, `globalSetup`, `webServer` (standalone server :3100, explicit `DATABASE_URL=file:../db/e2e.db`, `AUTH_SECRET=playwright-e2e-session-secret`) | E2E requires a prior `bun run build` |
| `postcss.config.mjs` | `@tailwindcss/postcss` | — |
| `components.json` | shadcn scaffold metadata | The marketing surface does not lean on shadcn components |
| `prisma/schema.prisma` | 7 models, `url = env("DATABASE_URL")` | Relative `file:` URLs resolve against this file's directory |

### 3.3 Environment variables (4 — see `.env.example`)

| Variable | Purpose | Default / behavior |
|---|---|---|
| `DATABASE_URL` | SQLite file URL | `file:../db/custom.db` → `<repo>/db/custom.db`; absolute or `postgresql://` URLs pass through untouched |
| `AUTH_SECRET` | HMAC key for session cookies | Empty → dev-only constant; **required in production** (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata | `http://localhost:3000` |
| `DEMO_USER_PASSWORD` | Seed-time demo password override | Falls back to the documented demo credential |

### 3.4 The dev-time DATABASE_URL pinner (v2.4 — read before any DB work)

Process env beats `.env` files (standard dotenv precedence). Sandboxed shells may export an ambient absolute `DATABASE_URL` pointing **outside the repo** — silently relocating the dev database. Defense (ADR-002b, `docs/remediation-plan-session-2.md` F1):

- `scripts/with-repo-db.ts` wraps the `dev` / `build` / `start` / `db:push` / `db:seed` / `db:migrate` / `db:reset` scripts. It reads the repo `.env`'s `DATABASE_URL` FIRST (`parseDotenvValue`), resolves it through the pure seam (`devDatabaseUrl` → `resolveDatabaseUrl` with `[repoRoot, cwd]` anchors), and spawns the wrapped command with the resolved URL set explicitly in its environment.
- The application runtime (`src/lib/db.ts` → `resolveProcessDatabaseUrl()`) deliberately keeps 12-factor env-var precedence — the e2e webServer's explicit `file:../db/e2e.db` and production absolute URLs rely on it. **Never** "fix" the wrapper by making `db.ts` env-file-first.
- With no `.env` shipped (production), the wrapper is a transparent passthrough.
- Unit contract: `tests/db-path.test.ts` › `parseDotenvValue` (8 cases) + `devDatabaseUrl` (6 cases).

### 3.5 Package scripts (the only sanctioned entry points)

`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:watch` · `test:e2e` · `db:push` · `db:generate` · `db:seed` · `db:migrate` · `db:reset` — all run through Bun from the repo root. Single unit file: `bunx vitest run tests/ics.test.ts`; single e2e spec: `bunx playwright test tests/e2e/mobile-navigation.spec.ts`.

## 4. The Design System (Code-First)

Single source of truth: `src/app/globals.css`. No Tailwind config file exists.

### 4.1 The `@theme` block (verbatim semantics)

```css
@theme {
  --color-background: hsl(44 29% 97%);        /* cream #FAF8F5 */
  --color-foreground: hsl(0 0% 10%);          /* ink #1A1A1A */
  --color-card / --color-popover: hsl(44 29% 97%);
  --color-primary: hsl(0 0% 10%);  --color-primary-foreground: hsl(44 29% 97%);
  --color-secondary: hsl(134 11% 33%);        /* sage */
  --color-secondary-foreground: hsl(44 29% 97%);
  --color-muted: hsl(40 20% 93%);  --color-muted-foreground: hsl(0 0% 35%);
  --color-accent: hsl(27 48% 84%);            /* peach */
  --color-accent-foreground: hsl(0 0% 10%);
  --color-destructive: hsl(0 72% 51%);  --color-destructive-foreground: hsl(0 0% 98%);
  --color-border / --color-input: hsl(30 15% 86%);
  --color-ring: hsl(0 0% 10%);
  --radius-sm: calc(var(--radius) - 4px);  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);  --radius-xl: calc(var(--radius) + 4px);
  --font-serif: var(--font-cormorant), "Cormorant Garamond", serif;
  --font-sans: var(--font-mulish), "Mulish", system-ui, sans-serif;
}
@theme inline {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);   /* trap 5 — v3 geometry */
}
```

`--radius` is set on `:root` (`0.625rem`). Fonts are wired to next/font CSS variables — `@theme inline` is required there (the utility layer must carry the `var()` reference, not a copy of the not-yet-loaded value).

### 4.2 Typography hierarchy

| Role | Font | Weight/size pattern | Tracking |
|---|---|---|---|
| Display / H1 hero | Cormorant Garamond | 300–500, fluid (e.g. `text-5xl md:text-7xl`) | tight (`-tracking-*` on hero) |
| Section headings | Cormorant Garamond | 500, `text-3xl md:text-4xl` | normal |
| Eyebrow / editorial label | Mulish | 500, `text-xs`/`text-sm` uppercase | `tracking-editorial` (0.22em) |
| Body | Mulish | 300–400, `text-sm`/`text-base` | normal (ss01, cv11 feature settings) |
| Mobile drawer links | Cormorant Garamond | 48px, line-height 48px | −1.2px (live-measured) |
| **Auth shell (`/login`)** | **Tailwind default sans stack** (NOT the brand fonts) | `font-bold` h1 30px, `tracking-tight` −0.75px | — |

The auth shell is the reference's **third font context**: the base44 login renders in a separate CSS context that never loads Cormorant/Mulish — everything computes to `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` with `font-feature-settings: normal` and `-webkit-font-smoothing: auto`. Pinned by the `font-shell` utility (`globals.css`) on the login `<main>` + `<h1>` and asserted by `tests/e2e/login-parity.spec.ts` (session-3 finding F1).

### 4.3 Custom `@utility` definitions (5 — all in globals.css)

| Utility | Definition purpose | Line |
|---|---|---|
| `tracking-editorial` | `letter-spacing: 0.22em` — the eyebrow signature | L94 |
| `glass` | cream 60% alpha + `backdrop-blur 20px saturate 140%` — scrolled header / BookHeader | L99 |
| `prism-gradient` | 135° three-stop wash for hero/editorial moments | L108 |
| `breathe` | status-dot pulse animation | L113 |
| `font-shell` | the auth shell's default font context (stack + `normal` features + `auto` smoothing) | L125 |

### 4.4 Keyframes (1)

`@keyframes breathe` (L117) — 2.4s opacity/scale pulse for the open/closed amber dot. The scroll-reveal system lives in plain CSS classes (`.reveal`, `.reveal-visible`) driven by `Reveal.tsx`'s IntersectionObserver — opacity/blur/translate over 0.9s `cubic-bezier(0.22,1,0.36,1)`, collapsing to opacity-only under `prefers-reduced-motion`.

### 4.5 The Tailwind v4 trap log (MUST-READ before CSS edits)

Ported from `docs/Tailwind-V4-Validation-Report.md`; each trap is real, was hit in this codebase, and traps 1/2/4/5/6/7/8 are pinned by e2e assertions:

1. **Bare-HSL transparent theme** — `@theme` colors must be FULL `hsl(…)` values; a bare triplet (`134 11% 33%`) resolves to transparent. Pinned in `globals.css`.
2. **oklch palette drift** — v4's default palette is oklch-based; "simplifying" any token to a default entry changes computed output. The reference palette is pinned, never defaulted.
3. **oklab gradient interpolation** — `bg-gradient-to-*` interpolates in oklab and Chrome reports `lab()` stops; for computed-color parity use the arbitrary form `bg-[linear-gradient(…)]` (see `/login` main wash).
4. **`space-y` selector rewrite** — v4's `space-y` uses `:where()` (zero specificity), so a child's `mt-*` WINS (opposite of v3). The mobile drawer is flex `gap-2` + `mt-10` **by design**; never convert it to `space-y-*`.
5. **`shadow-sm` scale shift** — v4's `shadow-sm` is one notch heavier; `--shadow-sm` is pinned to v3 geometry in `@theme inline`.
6. **oklch palette serialization** — v4's default palette serializes as `lab()`/`oklch()` strings, not v3's `rgb()`; the slate scale is pinned to the reference's sRGB hex so computed-color assertions are deterministic (session 5; the slate-900 digit corrected + read-back contract session 6).
7. **opacity-modifier serialization** — v4's `/α` modifier emits `color-mix(in oklab, …)`, reported by Chrome as `oklab(L a b / α)` where v3 emitted `rgba(r, g, b, α)`; pixels are identical — assert the resolved lightness + alpha channels (`expectInkAlpha`), never the string (session 7).
8. **individual-transform properties** — v4's `scale-*`/`translate-*`/`rotate-*` write the INDIVIDUAL CSS properties (`scale: 1.25`), not `transform`: a v3-era inline `transform: none` does NOT neutralize them (the landing hero's settled state needs `scale: none` alongside the reference's own inline `transform: none`), and `transition-transform` transitions `transform, translate, scale, rotate` where v3 transitioned `transform` (session 10).

Two engine differences that look like bugs but are correct: v4 `rounded-full` computes to `33554400px` (v3: `9999px`); `border-foreground/5` reports as `color-mix(in oklab, …)`. Don't "fix" them.

---

## 5. Component Architecture & Patterns

### 5.1 The layer model (golden rule: imports flow DOWN only)

```
Layer 1: app/            pages (RSC) — data fetching + layout composition
Layer 2: components/     presentation — server components by default
Layer 3: client islands  "use client" leaves for interactivity ONLY
Layer 4: lib/            content (client-safe DTOs) · data (server Prisma) · auth · ics · hours · db
Layer 5: prisma/         schema + seed (the content source)
```

**The client/server module boundary (enforceable by grep):** `src/lib/content.ts` holds the DTO interfaces + `formatPrice` with ZERO db/node imports; `src/lib/data.ts` is the server-only Prisma read seam. A single value import of `data.ts` from a client component drags `node:fs` (via `db-path.ts`) into the browser graph and panics Turbopack — this happened; see §9 Bug 1.

### 5.2 Component inventory (12 files in src/components — 9 client, 3 server)

| File | Mode | Purpose |
|---|---|---|
| `layout/SiteHeader.tsx` | client | Transparent→glass scrolled header; hamburger; full-screen mobile drawer (`fixed inset-0 z-[60]`, giant serif links, `gap-2` + `mt-10`) |
| `layout/BookHeader.tsx` | server | Always-glass booking chrome (`h-16`, "← Return to site") |
| `layout/SiteFooter.tsx` | server | Statement, hours table (en-dash compact format), contact, legal links |
| `Reveal.tsx` | client | IntersectionObserver scroll reveal; a11y-reduced-motion collapse |
| `StatusPill.tsx` | client | Day-aware Open/Closed pill + breathing amber dot; render-time computation + `suppressHydrationWarning` |
| `TestimonialCarousel.tsx` | client | 4-quote rotator |
| `ServicesExperience.tsx` | client | Category filter pills (hair/skin/nails/all) |
| `GalleryGrid.tsx` | client | Filter chips + grid + `z-[70]` lightbox (prev/next + keyboard) |
| `BookingForm.tsx` | client | Native date/time inputs, service/stylist selects, POST → `/api/appointments` → router push to confirmation |
| `LoginForm.tsx` | client | Email/password card; POST `/api/auth/login`; the Google button is inert-and-honest |
| `NewsletterForm.tsx` | client | Footer email capture → POST `/api/newsletter` |
| `LegalPage.tsx` | server | Shared legal prose renderer (h2-grouped sections) |

Plus `src/lib/legal.ts` (the 4 legal pages' content) and 17 page files under `src/app`.

### 5.3 Client/server decision tree

Need an event handler, state, or a browser API? → client island. Otherwise → server component (default). A server page must never carry `onClick` (request-time 500 — §9 Bug 3); push the interactive fragment into a client component (`LoginCardBody`-style island pattern).

### 5.4 Route structure

- `(site)` route group: marketing chrome (SiteHeader + SiteFooter) — landing, services (`[slug]` SSG via `generateStaticParams` over DB rows), gallery, team, about, contact, 4 legal pages.
- `/book` + `/book/confirmation`: BookHeader chrome; both dynamic (`await searchParams`).
- `/login`: standalone slate/white system, no site chrome.
- `/api/*`: 6 route handlers (health, auth/{login,logout,me}, appointments, newsletter).
- `not-found.tsx`: 404 with site chrome.

### 5.5 The booking contract (ADR-007)

POST `/api/appointments` validates + persists → client routes to `/book/confirmation?name=&date=&time=&service=` (the reference's exact query-string contract) → the confirmation page (dynamic, server) renders from the query string alone — **no DB read**: the "Add to calendar" download is the reference's **fixed 90-minute ICS event block** (`APPOINTMENT_BLOCK_MIN` in `src/lib/ics.ts`) with **raw-comma** LOCATION/name text (the reference performs no RFC 5545 escaping — byte-parity of the download outranks RFC correctness; documented divergence), and the link's icon is lucide `Calendar` at `h-4 w-4` (session-8 live-measured — the prior CalendarPlus@14 was a pre-settle artifact). The form mirrors the reference's DOM: a **block-level** glass card, 7 fields in a nested `grid grid-cols-1 md:grid-cols-2 gap-5`, the Notes label (`block mt-5`, placeholder `Anything we should know — inspiration, allergies, previous treatments...`) and button row (`mt-10`) outside the grid — pinned by `tests/e2e/booking-parity.spec.ts`. Deep-link preselection: `/book?service=…&stylist=…`.

---

## 6. Client Islands Deep Dive (the hook-equivalents)

This project has no custom hooks directory; the hard-won client idioms live in two components that set the patterns for everything else.

### 6.1 `Reveal.tsx` — the sanctioned IntersectionObserver pattern

- **State init is a constant** (`useState(false)`), NOT `useState(() => typeof IntersectionObserver === …)` — an environment-dependent initializer produces a server/client hydration attribute mismatch (§9 Bug 2).
- The observer callback flips state (async, not in the effect body) — satisfies `react-hooks/set-state-in-effect`.
- `disconnect()` cleanup on unmount; `prefers-reduced-motion` collapses the animation to opacity-only.

### 6.2 `StatusPill.tsx` — the sanctioned time-dependent render

- Computes the day **at render time** and wraps the output in `suppressHydrationWarning` (the next-themes idiom). The server may render "Closed today" for a Tuesday the client sees as Wednesday — the pill re-renders without a mismatch error.
- Pure logic lives in `src/lib/hours.ts` (`statusForDay`), unit-tested — the component is a thin shell.

### 6.3 Conventions for every client island

1. `"use client"` at line 1; import DTOs/types from `@/lib/content` only.
2. Explicit `role="alert"` for errors, `role="status"` for notices; buttons disabled during async operations.
3. No `console.log` in shipped paths; `console.error` with context on failures.

---

## 7. Content Management & Data Ingestion

**The seed IS the content source** (`prisma/seed.ts`, idempotent natural-key upserts): 8 services, 3 stylists, 12 gallery items, 4 testimonials, 1 demo user — mirroring the reference app exactly (extracted 2026-10-05). Changing copy = edit `prisma/seed.ts` → `bun run db:seed` (safe to re-run).

- **Images**: 39 reference images self-hosted under `public/images/` (no external requests; `next/image` with `fill` + positioned parent + explicit `sizes`).
- **Legal content**: `src/lib/legal.ts` (4 pages, h2-grouped prose).
- **Hours model**: `src/lib/hours.ts` — Sunday + Monday closed; Tue–Wed 10:00–19:00; Thu–Fri 10:00–20:00; Sat 09:00–18:00. Footer renders the en-dash compact form (`10:00–19:00`).
- **Adding a service**: (1) add the object to `prisma/seed.ts` services array (slug/category/price cents/duration/prep JSON/image path); (2) drop the image into `public/images/`; (3) `bun run db:seed`. The services grid, detail SSG route, booking select, and confirmation duration resolution all read from the DB — no other file needs touching.
- **No CMS, no markdown pipeline, no `import.meta.glob`** — DB rows via Prisma are the single content path.

---

## 8. Accessibility Implementation

- **Focus ring**: ring token `hsl(0 0% 10%)` (ink) — visible on cream; no `outline: none` without replacement.
- **Motion**: `prefers-reduced-motion` collapses reveal animations to opacity-only (`.reveal` CSS + `Reveal.tsx`).
- **Keyboard**: gallery lightbox supports Escape/ArrowLeft/ArrowRight (`GalleryGrid.tsx`); mobile drawer closes on Escape AND on link click; the hamburger carries `aria-label="Open menu"` / the close button `"Close menu"`.
- **Semantics**: single `h1` per page; eyebrow labels; `role="alert"`/`role="status"` on async outcomes; the status pill's breathing dot is decorative.
- **Forms**: `label` associations on every input (login email/password, booking date/time/service, newsletter email); native date/time inputs (the reference used MUI segmented pickers — native inputs were chosen for SSR-safety and honesty; documented divergence).
- **Hydration-sensitive rendering** uses `suppressHydrationWarning` only where the value is legitimately environment-dependent (StatusPill).

## 9. Anti-Patterns & Common Bugs

### Bug 1: `node:fs` in the client graph — Turbopack panic (Critical)

**Symptom:** dev/build panic — `the chunking context does not support external modules (request: node:fs)`.
**Root cause:** a client component (`ServicesExperience`, `BookingForm`, `GalleryGrid`) imported `formatPrice` from `@/lib/data`, transitively pulling `db-path.ts`'s `node:fs` into the browser graph.
**Fix:** split the client-safe DTOs + `formatPrice` into `src/lib/content.ts` (zero db/node imports); `data.ts` stays server-only.
**Lesson:** the boundary is enforceable by grep — `from "@/lib/data"` inside `src/components/**` must be type-only or absent.

### Bug 0 (session-3): assuming the brand fonts are app-global (Medium)

**Symptom:** the login page renders its h1 in Cormorant and its body in Mulish — the reference's `/login` computes to Tailwind's default sans stack instead.
**Root cause:** the single-app clone shares one root layout, so the body `font-sans` (Mulish) and the global `h1–h5` serif base rule leak into the auth surface; the reference's login is a separate base44 CSS context that never loads the brand fonts.
**Fix:** the `font-shell` utility (default stack + `normal` features + `auto` smoothing) on the login `<main>` and directly on its `<h1>` (inheritance cannot beat the base-layer heading rule).
**Lesson:** per-surface font contexts must be measured on the live site, not inferred — brand fonts are NOT global. `tests/e2e/login-parity.spec.ts` pins it.

### Bug 2: hydration attribute mismatch from an environment-dependent initializer (High)

**Symptom:** dev overlay "1 Issue"; server/client `class` mismatch on reveal sections.
**Root cause:** `useState(() => typeof IntersectionObserver === "undefined")` evaluates differently on server vs client.
**Fix:** constant initial state; the observer callback flips it (Reveal.tsx pattern).
**Lesson:** never initialize state from an environment probe.

### Bug 3: event handler in a server component (High)

**Symptom:** `/login` 500s at request time.
**Root cause:** inline `onClick` on the Google button in a server page.
**Fix:** `LoginCardBody`-style client island.
**Lesson:** server components cannot carry event handlers — compile passes, request fails.

### Bug 4: `next/image` `fill` without a positioned parent (Medium)

**Symptom:** images overflow/stack; layout shift.
**Root cause:** `fill` requires `relative`/`absolute`/`fixed` on the parent; two `aspect-*` containers missed it.
**Fix:** add `relative` to every fill-image container (2 sites fixed).
**Lesson:** e2e visual pass catches what review misses.

### Bug 5: ambient `DATABASE_URL` relocates the dev database (High — session-2 audit F1)

**Symptom:** `db:push`/`db:seed`/dev/build operate on a database OUTSIDE the repo; app shows empty/stale content.
**Root cause:** platform-injected absolute `DATABASE_URL` process var beats the repo `.env` (standard dotenv precedence).
**Fix:** `scripts/with-repo-db.ts` wrapper (env-file-first via `devDatabaseUrl`); app runtime untouched.
**Lesson:** explicit child-process env beats ambient noise — generalize the e2e suite's pattern.

### Bug 6: gallery pill label drift (Low)

**Symptom:** e2e expected "ALL" but the component rendered different casing.
**Root cause:** filter pill labels diverged from the reference DOM during the build.
**Fix:** align labels to the reference ("ALL", "COLOR", "CUTS", "BRIDAL", "NAILS", "SKIN").
**Lesson:** extract labels from the live DOM, don't paraphrase them.

### Framework gotchas that look like bugs but aren't

- v4 `rounded-full` → `33554400px`; `border-foreground/5` → `color-mix(in oklab, …)` — both asserted in e2e as EXPECTED values.
- Next 16 async `searchParams` — `await` it or get a Promise, not the params.

---

## 10. Debugging Guide

| Symptom | First check | Root cause → fix |
|---|---|---|
| Turbopack `node:fs` panic | Which client file imports `@/lib/data`? | Bug 1 — move DTOs to `content.ts` |
| Page 500s only on interaction-bearing elements | grep `onClick` in RSC files | Bug 3 — client island |
| Dev overlay attribute mismatch | environment-dependent `useState` initializer | Bug 2 — constant init |
| Images overflow containers | parent of `<Image fill>` has `position: static` | Bug 4 — add `relative` |
| Dev chunks not loading on `127.0.0.1` | `next.config.ts` `allowedDevOrigins` | missing entry — loopback origin protection |
| App renders but DB is empty/wrong location | `echo $DATABASE_URL` in the shell | Bug 5 — use wrapped scripts; never bare CLI with ambient env |
| e2e parity spec fails after "styling improvement" | the diff, not the spec | traps §4.5 — revert the improvement |
| `db:seed` says success but data is elsewhere | `ls db/` vs the URL | same as Bug 5 — check `devDatabaseUrl` anchors |
| Fonts flash/fallback | `@theme inline` vs `@theme` for font vars | the utility layer must carry `var()` references |
| Build fails: "Page file exports" | extra exports in a page file | only `default` + metadata exports allowed |

Debug order discipline: reproduce with the exact command → read `dev.log` → isolate → fix the cause → add the regression test → re-run the gate.

---

## 11. Pre-Ship Checklist

```bash
bun run lint          # eslint clean
bun run typecheck     # tsc clean
bun run test          # 61 unit tests green
bun run build         # 27 routes; standalone emitted
bun run test:e2e      # 70 specs green (needs the build)
```

**Security sweep:** `git ls-files | grep -E '^\.env$|\.db$|\.key$'` → empty; demo credential only in seed/tests (documented, `DEMO_USER_PASSWORD`-overridable); AUTH_SECRET set for prod.

**Parity sweep:** `bunx playwright test tests/e2e/mobile-navigation.spec.ts tests/e2e/login-parity.spec.ts` — the drawer's computed styles vs live-measured values (gap 8px, CTA margin 40px, 48px Cormorant, −1.2px tracking, exact rgb colors, `fixed inset-0 z-[60]`, `rgb(250,248,245)` ground) and the auth shell's default sans stack.

**DB sweep:** `db/custom.db` + `db/e2e.db` exist inside the repo; nothing under `<workspace>/db/`.

**Docs sweep:** changed commands/counts reflected in README/AGENTS/CLAUDE/PAD; `.env.example` still matches the code.

**Push:** main only, Conventional Commits, gate green first; SSH wrapper per `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.

---

## 12. Lessons Learnt & How to Avoid Them

1. **Extract, don't approximate.** Every token, label, and structure in this clone came from the live reference's DOM/computed styles. Approximations drift; measurements don't. (Method: Appendix D.)
2. **The bundler enforces the architecture.** The `node:fs` panic (Bug 1) was the codebase telling us the layer boundary was wrong. Keep the boundary grep-able.
3. **Turn folklore into tests.** The five Tailwind v4 traps were prose until e2e specs pinned them; now any regression fails CI-parity by design.
4. **Environment probes break hydration.** Server and client must agree on initial state (Bug 2) — constants only.
5. **e2e needs its own database.** The isolated `db/e2e.db` + explicit env pattern kept the suite deterministic AND became the template for the dev-script fix (Bug 5).
6. **Read the engine's release notes when migrating majors.** All five traps are documented v3→v4 differences; the repo's own validation report was the map.
7. **One atomic commit per coherent change set.** Session 1 shipped app+docs+screenshots together (`acb9532`); session 2 ships the audit + remediation together — bisectable history.
8. **Never weaken a gate to ship.** A red test is a regression or a wrong test — fix the cause (AGENTS.md testing conventions).
9. **Bun's dotenv behavior follows the standard precedence** — process env beats `.env`. In sandboxed shells, that means ambient noise wins; defend at the script layer with explicit child env (Bug 5, ADR-002b).
10. **Pin dev-tooling dependency advisories honestly.** `braces` and `deepmerge-ts` have no in-range fix (no patched upstream for braces at all, latest = 3.0.3); they are dev-only chains with repo-controlled inputs — documented as accepted risks rather than forced overrides (which broke install).

---

## 13. Pitfalls to Avoid

- **Architecture:** don't import `@/lib/data` (or anything transitively touching `node:fs`) from a client component; don't put DB access anywhere but `src/lib/data.ts` + API routes.
- **TypeScript:** no `any` at API boundaries — narrow `unknown`; no `@ts-ignore`; `interface` for object shapes, `type` for unions.
- **Testing:** don't add `test.describe.parallel` (specs share one SQLite file, `workers: 1`); don't skip/weaken assertions to pass; unit tests import from `vitest` explicitly (no globals).
- **Design system:** don't use v4 default palette entries (oklch drift); don't convert the drawer's `gap-2`+`mt-10` to `space-y-*`; don't replace `bg-[linear-gradient(…)]` with `bg-gradient-to-*` on parity-pinned surfaces; don't unpin `--shadow-sm`.
- **Database:** don't call `prisma` CLI or `bun prisma/seed.ts` with an ambient env you don't control; don't hardcode the URL in `db.ts` (breaks prod rotation); don't ship `db/*.db` (git-ignored by design).
- **Security:** don't log secrets; don't differentiate "unknown user" from "wrong password" responses; don't skip the rate limiter on auth routes.
- **Performance:** no client-side data fetching for marketing content (SSR/SSG only); `next/image` everywhere with `sizes`.

---

## 14. Best Practices

- **Directory discipline:** pages in `src/app`, presentation in `src/components`, pure logic in `src/lib`, content in `prisma/seed.ts` — a new engineer should predict where a change lands.
- **TypeScript:** strict mode; early returns; DTOs defined once in `content.ts` and re-exported by `data.ts`.
- **React/Next 16:** Server Components by default; client islands minimal; `await` all async params/cookies; page files export only `default` + metadata.
- **Styling:** class sets mirror the reference DOM; custom utilities are `@utility` definitions (composable, tree-shakeable); every color through a token.
- **Icons:** lucide icons carry the reference's class sizing (`h-4 w-4`…) with the lucide-default `width="24" height="24"` attrs — never `size` props (they render the right pixels through the wrong DOM, and can't carry hover classes like `group-hover:rotate-45`). `tests/e2e/icon-parity.spec.ts` pins the layer; innerText parity cannot see it.
- **Data:** reads via `data.ts` (typed), writes via validated API routes only; schema edits → `db:push` → seed update → `db:seed`.
- **Errors:** catch once at the route boundary; typed `{ error }` JSON with correct status (400/401/429/500); `console.error` with context.
- **Git:** main only; atomic Conventional Commits; never commit `.env*` (except `.env.example`), keys, or databases.
- **Docs:** when behavior changes, update README/AGENTS/CLAUDE/PAD in the same commit (docs drift is technical debt).

## 15. Coding Patterns

### Pattern: the client island (server page + interactive leaf)

```tsx
// src/app/login/page.tsx (server) composes; src/components/LoginForm.tsx ("use client") interacts.
// Rule: the page fetches/data-resolves and passes PLAIN PROPS (DTOs from content.ts);
// the island owns handlers/state and never imports @/lib/data.
```

### Pattern: the db-path seam (pure + fixture-testable)

```ts
// src/lib/db-path.ts
export function resolveDatabaseUrl(envUrl: string | undefined, anchors: string[]): string {
  // first anchor containing prisma/schema.prisma wins; relative file: URLs
  // resolve against <anchor>/prisma; absolute + non-SQLite pass through.
}
export function devDatabaseUrl(input: { envFileUrl?: string; processUrl?: string; anchors: string[] }): string;
// dev scripts: repo .env value WINS over ambient process env; app runtime: resolveProcessDatabaseUrl (process env first).
```

### Pattern: API route (validate → act → typed error)

```ts
// src/app/api/appointments/route.ts — POST:
// 1. parse req.json() as unknown → narrow every field (name/date/time/service/stylist)
// 2. validate against DB rows (service exists, date format, time within reason)
// 3. prisma create; catch once at the boundary → { error } JSON with 400/500
// 4. success → 201 with the created row's public shape
```

### Pattern: auth (scrypt + HMAC, timing-safe)

```ts
// src/lib/auth.ts
hashPassword(pw)                       // scrypt$salt$hash (N=16384, r=8, p=1)
verifyPassword(pw, stored)             // timingSafeEqual
createSessionToken(userId)             // `${userId}.${exp}.${hmac}` (7-day TTL, AUTH_SECRET)
verifySessionToken(token)              // null on any tamper/expiry
checkRateLimit(ip, limit=10, windowMs=15min) // per-IP in-memory bucket
```

### Pattern: the ICS builder (pure, RFC 5545)

```ts
// src/lib/ics.ts — buildIcs({ title, description, date, time, durationMin, url })
// → escaped text, UTC stamps (Z), midnight rollover handled; icsDataUri() → data:text/calendar.
```

### Pattern: idempotent seed (natural-key upserts)

```ts
// prisma/seed.ts — every content row upserts on its unique key (slug/email),
// so `bun run db:seed` is safe to run repeatedly.
```

### Pattern: e2e parity spec (computed styles as the contract)

```ts
// tests/e2e/mobile-navigation.spec.ts — open the drawer at 390×844, then:
expect(gap).toBe("8px");               // trap 4: gap-2, not space-y
expect(ctaMarginTop).toBe("40px");     // mt-10
expect(fontSize).toBe("48px");         // giant serif
expect(letterSpacing).toBe("-1.2px");  // live-measured
expect(color).toBe("rgb(26, 26, 26)"); // exact rgb, not approx
```

---

## 16. Coding Anti-Patterns

| Don't | Do instead | Why |
|---|---|---|
| `import { formatPrice } from "@/lib/data"` in a client component | `from "@/lib/content"` | Bug 1 — `node:fs` panics the client build |
| `onClick={…}` in a server page | extract a client island | Bug 3 — request-time 500 |
| `useState(() => typeof window !== "undefined")` | constant initial state | Bug 2 — hydration mismatch |
| `<Image fill>` in a static parent | add `relative` to the container | Bug 4 — overflow |
| `space-y-2` on the mobile drawer | keep `gap-2` + `mt-10` | trap 4 — specificity rewrite |
| `bg-gradient-to-r from-X to-Y` on parity surfaces | `bg-[linear-gradient(…)]` (sRGB) | trap 3 — oklab interpolation |
| Bare HSL triplets in `@theme` | full `hsl(…)` values | trap 1 — transparent |
| Default palette "simplifications" | pinned reference tokens | trap 2 — oklch drift |
| `DATABASE_URL=<abs>` hardcoded in `db.ts` | the seam + `.env` | breaks prod rotation + portability |
| Differentiating auth error messages | one identical "Invalid email or password" | no account enumeration |
| `console.log` in shipped paths | `console.error` with context | noise + leak risk |
| Modifying the e2e spec to make it pass | fix the code | the spec is the contract |

---

## 17. Responsive Breakpoint Reference

Tailwind v4 defaults (no custom breakpoints). Usage census across `src/**` (by grep): `md:` 131 uses (the primary editorial shift), `sm:` 20, `lg:` 7 (the chrome threshold).

| Breakpoint | Min width | What switches |
|---|---|---|
| (base) | — | Single column; hamburger navigation; drawer links 48px serif |
| `sm` | 40rem (640px) | Early grid promotion on dense sections |
| `md` | 48rem (768px) | Multi-column grids (services/gallery/team), fluid display type scales up |
| `lg` | 64rem (1024px) | **Desktop nav appears, hamburger hides** (SiteHeader); e2e pins the middle state: at 768 the hamburger is still present and the desktop nav stays hidden until lg |

**Mobile testing:** 390×844 (iPhone-class) is the parity viewport — the drawer's computed-style spec and the mobile screenshots use it. Test the 768 middle state when touching the header.

---

## 18. Z-Index Layer Map

| Layer | Element | Location | Purpose |
|---|---|---|---|
| 50 | SiteHeader root | `src/components/layout/SiteHeader.tsx:53` | Fixed transparent→glass header |
| 50 | BookHeader root | `src/components/layout/BookHeader.tsx:7` | Fixed glass booking chrome |
| 60 | Mobile drawer | `src/components/layout/SiteHeader.tsx:96` (`z-[60]`) | Full-screen menu overlay — must cover the header (50) |
| 70 | Gallery lightbox | `src/components/GalleryGrid.tsx:107` (`z-[70]`) | Must cover everything, including the drawer |

Conflict rules: the layering is strictly ordered (50 < 60 < 70) and the arbitrary `z-[N]` values are load-bearing — do not "normalize" them to named utilities (the named scale's semantics differ across Tailwind majors). New overlays must state their layer relative to this map.

---

## 19. Color Reference (Complete)

All values verbatim from `src/app/globals.css` `@theme`; computed RGB from the live reference.

| Token | HSL | Computed RGB | Tailwind class | Usage |
|---|---|---|---|---|
| background | `hsl(44 29% 97%)` | `rgb(250, 248, 245)` | `bg-background` | Page ground, drawer |
| foreground | `hsl(0 0% 10%)` | `rgb(26, 26, 26)` | `text-foreground` | Ink text, drawer links |
| card / popover | `hsl(44 29% 97%)` | same as background | `bg-card` | Scaffold parity |
| primary | `hsl(0 0% 10%)` | `rgb(26, 26, 26)` | `bg-primary text-primary` | Buttons (ink on cream) |
| secondary (sage) | `hsl(134 11% 33%)` | `rgb(75, 94, 77)` | `bg-secondary text-secondary` | Editorial accents, icons |
| muted | `hsl(40 20% 93%)` | — | `bg-muted` | Quiet fills |
| muted-foreground | `hsl(0 0% 35%)` | — | `text-muted-foreground` | Secondary prose |
| accent (peach) | `hsl(27 48% 84%)` | — | `bg-accent` | Highlight washes, active pills |
| destructive | `hsl(0 72% 51%)` | — | `text-destructive` | Errors |
| border / input | `hsl(30 15% 86%)` | — | `border-border` | Hairlines |
| ring | `hsl(0 0% 10%)` | — | `ring-ring` | Focus rings |

**Forbidden:** Tailwind default palette entries (`stone-*`, `neutral-*`, …) on any parity surface; oklch literals. The amber status-dot color is part of the `breathe` utility definition in `globals.css`.

---

## 20. The Complete TypeScript Interface Reference

```ts
// src/lib/content.ts — the client-safe DTOs (single source; data.ts re-exports)
export interface ServiceDto {
  slug: string; name: string; category: "hair" | "skin" | "nails"; tagline: string;
  description: string; longDescription: string; priceCents: number; durationMin: number;
  prep: string[]; image: string;
}
export interface StylistDto {
  slug: string; name: string; title: string; years: number; eyebrow: string;
  bio1: string; bio2: string; imageGray: string; imageColor: string;
}
export interface GalleryDto {
  title: string; category: string; description: string; image: string; alt: string;
}
export interface TestimonialDto { quote: string; name: string; role: string; }

// src/lib/hours.ts
export interface DayHours { day: number; label: string; open: string | null; close: string | null; }

// src/lib/ics.ts
export interface IcsInput { title: string; description: string; date: string; time: string; durationMin: number; url?: string; }

// src/lib/db-path.ts (pure seams)
export function resolveDatabaseUrl(envUrl: string | undefined, anchors: string[]): string;
export function parseDotenvValue(content: string, key: string): string | undefined;
export function devDatabaseUrl(input: { envFileUrl: string | undefined; processUrl: string | undefined; anchors: string[] }): string;

// src/lib/auth.ts (signatures)
export function hashPassword(password: string): string;
export function verifyPassword(password: string, stored: string): boolean;
export function createSessionToken(userId: string): { token: string; maxAge: number };
export function verifySessionToken(token: string | undefined | null): { userId: string } | null;
export function checkRateLimit(ip: string, limit?: number, windowMs?: number): boolean;
```

Prisma models (7 — `prisma/schema.prisma`): `Service` (unique slug), `Stylist` (unique slug), `GalleryItem`, `Testimonial`, `Appointment` (booking writes), `NewsletterSubscriber` (unique email), `User` (unique email, scrypt hash).

---

## Appendix A: Architecture Decision Records

| ADR | Decision | One-line rationale |
|---|---|---|
| ADR-001 | Single Next.js 16 app (not a Vite SPA) | SSR/SEO + typed route handlers + one deployable |
| ADR-002 | Prisma + SQLite with the db-path seam | One relative URL resolves identically for CLI/dev/build/standalone |
| ADR-002b | Dev-time DATABASE_URL pinner (`scripts/with-repo-db.ts`) | Repo `.env` wins over ambient env for dev flows; prod keeps 12-factor |
| ADR-003 | Cookie-session auth, scrypt + HMAC, no library | Auditable primitives, zero supply chain |
| ADR-004 | Client-safe content split (`content.ts` vs `data.ts`) | Keeps `node:fs` out of the browser graph |
| ADR-005 | Tailwind v4 trap-pinning strategy | Five engine differences pinned by tests |
| ADR-006 | Playwright computed-style parity as acceptance | "Looks the same" → executable |
| ADR-007 | Deep-link query-string confirmation flow | Mirrors the reference URL contract; the ICS carries the reference's fixed 90-minute block (session-8 correction — no service resolution, no RFC escaping) |

Full ADRs with alternatives: `Project_Architecture_Document.md` §1.3.

## Appendix B: Test Inventory

| Suite | File | Count | Locks |
|---|---|---|---|
| db-path | `tests/db-path.test.ts` | 29 | Anchor resolution (11), standalone detector (4), dotenv parser (8), dev-time precedence (6) |
| auth | `tests/auth.test.ts` | 8 | scrypt round-trip/salt/reject; session round-trip/tamper/expiry |
| hours | `tests/hours.test.ts` | 4 | Formats + status per day |
| ics | `tests/ics.test.ts` | 7 | Envelope, UTC stamps, the fixed 90-minute block, rollover, raw-comma LOCATION + names, data-URI |
| repo hygiene | `tests/repo-hygiene.test.ts` | 3 | No retired scaffold-model references in code dirs; doc-referenced scripts exist; package.json-referenced scripts exist |
| site-url | `tests/site-url.test.ts` | 5 | `siteUrl()` default/blank fallbacks, well-formed pass-through, malformed + non-absolute fallbacks |
| first-sentence | `tests/first-sentence.test.ts` | 5 | The service-detail description-heading splitter (`. ` boundary, no-boundary, trailing-only, empty) |
| e2e | `tests/e2e/*.spec.ts` | 104 | Mobile-nav parity (10), login parity (3 — font context, h1 treatment, the slate-900 sRGB read-back), not-found parity (3 — the 404 slate card, path interpolation, Go Home button), service-detail parity (6 — first-sentence H2, check-icon prep grid, exclusive-open FAQ accordion, single-item service, Ready-to-begin CTA, seed-correction read-backs), legal parity (6 — accessibility checklist, note/mt-3/br conventions, privacy hoisting, terms hoisting, refund unchanged, text-correction read-backs), booking parity (4 — nested-grid form + computed margins, Notes placeholder, Calendar icon, decoded-ICS fixed block), **icon parity (8 — the lucide class layer: sage stars, follow-along 16px, gallery-preview hover gating, services arrows' hover rotation + margins, team group/btn named group, contact MapPin + Reach-us icons + the Hours status-pill row, footer icon sets, login icon contract + absent eye toggle, book/header class sizing)**, **confirmation parity (5 — the flower2 watermark at responsive class sizing + stroke 0.5 + sage/30 oklab channels, the invisible decorative ring, the /contact policy link with its trailing arrow, the Calendar regression guard, the innerText pure-function length)**, **head parity (3 — the declared favicon with the reference's svg-type artifact, the declared-but-dead manifest link, the self-hosted logo asset)**, **links parity (11 — the services grid's bottom CTA [2 children + mt-20 80px + the pill classes + 3 /book hrefs] + the 1942-char services innerText, the accessibility article's dead `#` link with its exact classes + computed underline/auto offset, the unknown-service "Service not found" state [@200, in-chrome, title Services], case-insensitive routes [/SERVICES + /TEAM], the case-variant slug → Service-not-found, /BOOK/CONFIRMATION, trailing-slash preservation, the landing 33-href census, the gallery 20-href census, the generic-404 guard])**, **form parity (12 — the census guards: the book form's 8-control order/types/required flags + option sets, the login input placeholders/ids, the newsletter pill at 54px; the fire-and-forget contracts: a route-aborted newsletter POST → the success state, a route-aborted booking POST → the confirmation navigation; the `You're in…` success row (sage rgb(75,93,79) + the Check h-4 w-4 + the leading-space text); the ASCII-dot loading texts (Sending.../Signing in.../Reserving...) with the arrows always rendered + the login inputs disabled while loading; the login Alert card (the exact class set, sRGB red-200 border + red-700 text, oklab bg channels per trap 7, radius 12px, padding 16px, no-period text); the resize-none Notes textarea; the 48/48 date/time heights vs the 46px text inputs)**, **the landing session-10 contracts (3 — the hero settled state: transform/scale none + 457×610 @1280 + the img at 1.08; the category images' computed 150ms default-ease hover via the inert duration-s] token; the gallery tiles' 700ms guard)**, landing (10), booking (5), gallery (5), auth (10) |

Total: **165** (61 unit + 104 e2e). Gate: `lint → typecheck → test → build → test:e2e`.

## Appendix C: Audit History

| Date | Audit | Findings → outcome |
|---|---|---|
| 2026-10-05 | Session-12 audit (the form-control census + the POST-failure states) | The first-ever both-sides **form-control census** (every input/select/textarea/label on /, /book, /login, /contact — placeholders, ids, option sets, computed metrics) + the state layer + the POST-failure behavior of all three forms (the session-11 suggested candidates). KEY FINDINGS: F1 the Notes textarea lacked `resize-none` (the live computes resize: none) (LOW-MEDIUM → added); F2 the date/time inputs render 48/48 on the live vs 46/46.7 on the clone — content = line-height + 2px, a UA-intrinsic mechanism unattributable after exhaustive elimination (no author CSS in the single same-origin stylesheet, no font dependency, no transform/zoom/DPR, no !important, no shadow DOM; a fresh all:initial date input reproduces it on the reference's page but not the clone's in the SAME browser session) — replicated via `::-webkit-datetime-edit { padding: 1px 0 }` (behavior-matched: min-height stays 0, the lh curve preserved) (LOW-MEDIUM); F3 the newsletter success state was entirely clone-authored ("Welcome to the atelier…" /70 ink, a plain p) vs the live's sage `inline-flex items-center gap-3` row with the lucide Check h-4 w-4 and " You're in. Check your inbox for your 15% code." (HIGH → rebuilt; the success state requires a real submission — no prior census instrument covered it); F4 the newsletter POST failure renders SUCCESS on the live (`catch → success` in its deobfuscated bundle; no error UI exists) vs the clone's error message (MEDIUM-HIGH → fire-and-forget); F5 the booking POST failure still navigates to the confirmation on the live (`try { POST } catch {} → push`) vs the clone's blocked error state (MEDIUM → fire-and-forget; the API validation retained); F6 the login error is the platform's shadcn Alert card (bg-red-50/70 border-red-200 rounded-xl, inner text-red-700, "Invalid email or password" — no trailing period) vs the clone's plain red-600 p (MEDIUM → rebuilt + the red-50/200/700 pinned to sRGB in @theme, the trap-6 precedent); F7–F9 the loading states ("Signing in..." with BOTH inputs disabled; "Sending..."/"Reserving..." with the arrows always rendered — ASCII dots, not U+2026) (LOW); INFO registered: the newsletter payload's `source: "homepage_15off"`, the reveal delay 150ms vs 100ms, the newsletter aria-label (the invisible-a11y family); verified holding: the login/book/newsletter control censuses identical, select options identical, the computed styles identical (trap-7 oklab + the next/font fallback string), the newsletter pill 54×307 both sides, the drawer @390×844 (the brief's emphasis — no v4 regression); engine fact: React omits the default type="text" attribute (both sides' DOMs identical — attribute selectors match nothing); pinned by `form-parity.spec.ts` (+12 e2e, one landing.spec.ts assertion corrected to the live text); gate green 61 unit + 104 e2e (165 total); lesson: state-parity is invisible to every settled-DOM census — a form's loading/success/failure states only exist after interaction, and each needs interaction-driven instruments (route-abort + delayed-fulfill interception) | 
| 2026-10-05 | Session-11 audit (the links/redirect census + the unknown-service state + case-insensitive routing) | The first-ever both-sides **href census** (every `<a>` on all 16 routes) + the routing edge matrix + the OAuth surface (the session-10 suggested candidates): 14/16 routes identical. KEY FINDINGS: F1 the `/services` grid was missing its bottom CTA — the live's `pb-28` section has two children (grid + the `mt-20 text-center` wrapper → `a.inline-block` → the standard dark pill "Book an appointment"); the clone rendered one; services innerText 1922 vs the live's 1942 — the delta exactly the missing CTA (MEDIUM → added, the pill idiom as the contact page's); F2 the accessibility article title rendered as plain text vs the live's dead `<a href="#">` with `underline hover:text-foreground` inside the text-identical sentence (LOW-MEDIUM → the `LegalPBlock.link` inline field + the Paragraph split-renderer); F3 unknown service slugs fell to the generic slate 404 vs the live's DEDICATED "Service not found" state (a `pt-40 px-6 max-w-3xl mx-auto text-center` section with `font-serif text-4xl mb-6` h1 + the "Return to the almanac" link, in-chrome, HTTP 200, title "Services") (MEDIUM → replaced `notFound()`; deliberate soft-404-for-parity, the reference behaves identically); F4 the reference's SPA router matches routes case-INSENSITIVELY (URL preserved — `/SERVICES`, `/Gallery`, `/BOOK/CONFIRMATION` render; case-variant slugs still fail the case-SENSITIVE lookup → the F3 state) and preserves trailing slashes; the clone 404'd variants and 308-normalized slashes (LOW → `src/proxy.ts` — the Next 16 **proxy** convention, `middleware` deprecated — rewrites never redirects: lowercase paths except `/services/…` slug case; trailing slashes to slashless with `skipTrailingSlashRedirect: true` because the router's 308 fires BEFORE the proxy); F5 the OAuth surface measured precisely for the first time — the live's button navigates to Google via base44 platform OAuth (client_id 185178814199-…, redirect_uri app.base44.com/api/apps/auth/callback, state carrying the reference's own domain/app_id); the clone's inert-button stance re-verified correct and documented with the measurement (INFO); verified holding: the confirmation ICS (modulo per-load UID/DTSTAMP), the mobile drawer @390×844 both sides + tap-through (the brief's emphasis, no v4 regression), gallery unknown-category All-fallback, edge-path 404 views; advisories carried (stands); pinned by `links-parity.spec.ts` (+11 e2e); gate green 61 unit + 92 e2e (153 total); lesson: innerText parity is blind to link MARKUP and route-matrix parity is blind to the router's RESOLUTION behavior — each layer needs its own census instrument (the href enumeration + the routing edge matrix) |
| 2026-10-04 | Session-1 build gate | 32/40 e2e → fixed v4 engine-difference assertions + gallery labels → 40/40 |
| 2026-10-05 | Session-2 release audit | F1 ambient DATABASE_URL (HIGH → fixed, ADR-002b); F2 dev-only advisories braces/deepmerge-ts (MEDIUM → no upstream fix, accepted + documented); F3 stale vitest comment (LOW → fixed); F4 scanner noise (INFO → accepted); baseline gate green throughout; live parity re-verified (mobile drawer byte-match) |
| 2026-10-05 | Session-3 parity re-audit | F1 login font-context gap (MEDIUM → fixed: the reference auth shell renders in Tailwind's default sans stack — `font-shell` utility + `login-parity.spec.ts`, +2 e2e); F2 advisories re-verified (no upstream fix, stands); F3 checklist non-benign findings all false-positives; F4 local .env header refreshed; gate green 47 unit + 42 e2e; drawer + services parity re-confirmed live |
| 2026-10-05 | Session-4 hygiene audit | F1 14 dead pre-clone scaffold scripts in `scripts/` (MEDIUM → removed, `with-repo-db.ts` retained, pinned by `tests/repo-hygiene.test.ts`); F2 `NEXT_PUBLIC_SITE_URL` documented-but-unused (MEDIUM-LOW → wired to `metadataBase` via `src/lib/site.ts`, pinned by `tests/site-url.test.ts`); F3 DEPLOYMENT.md pre-clone remnants — ORBITAL naming, smoke-test reference, sitemap/robots claim (LOW → fixed); F4 advisories carried (stands); live parity re-verified byte-identical (drawer, login font chain, landing tokens, 8/8 services); gate green 55 unit + 42 e2e |
| 2026-10-05 | Session-5 parity audit | F1 the 404 surface never live-measured — clone rendered cream-editorial, reference renders a slate centered card (MEDIUM → rebuilt: `NotFoundBody.tsx` island, path via `useSyncExternalStore`, real Go Home button, pinned by `not-found-parity.spec.ts` +3 e2e; auth.spec 404 assertions corrected from clone-authored to live contract); F2 session_5.md transcript (LOW → proper log); F3 advisories carried (stands); trap 6 found: v4's oklch palette serializes as `lab()`/`oklch()` — slate scale pinned to sRGB hex; live parity byte-identical on every other surface (drawer, login, landing, 8/8 services, 3/3 stylists, 12/12 gallery, booking, deep links); gate green 55 unit + 45 e2e |
| 2026-10-05 | Session-6 audit (the session-5 slate pin) | F1 one-digit transcription error in the trap-6 pin — `--color-slate-900` pinned `#0f172e` vs the reference/v3 `#0f172a`; the login h1 + Sign In button rendered `rgb(15, 23, 46)` vs the live `rgb(15, 23, 42)` (MEDIUM → corrected; the missing read-back contract added to `login-parity.spec.ts` +1 e2e — lesson: every pinned value needs a test that reads it back); F2 session_6.md transcript (LOW → proper log); F3 advisories carried (stands); all nine other slate pins verified correct against live values (50/200/400/500/600 measured live; 300/600/700/800 e2e-pinned); live parity byte-identical everywhere else (drawer, login font context, landing, 404 panel end-to-end, contact content); gate green 55 unit + 46 e2e |
| 2026-10-05 | Session-7 audit (service detail + legal structure) | F1 the service detail pages (8/8) shipped four of the reference's six sections — FAQ + Ready-to-begin missing, description H2 composed instead of the first sentence of longDescription, prep list numbered instead of check-icon rows (MEDIUM → rebuilt: `firstSentence` helper, `FaqAccordion` exclusive-open island, `faqs` JSON column + seed data extracted live, Ready-to-begin dark CTA, check-icon prep grid; pinned by `service-detail-parity.spec.ts` +6 e2e); F2 the legal pages' structure flattened — accessibility's 8-item checklist/note variant/br coordinator/mt-3 and privacy/terms' top-level paragraph hoisting unrepresentable in the old p/h2 model (MEDIUM → `LegalBlock` model + renderer rework, pinned by `legal-parity.spec.ts` +6 e2e); six session-1 transcription errors corrected (3 longDescriptions, 3 legal texts) with read-back contracts; trap 7 found: v4's opacity modifier serializes as `oklab(L a b / α)` where v3 emitted `rgba()` — pixels identical, specs assert resolved channels (also revealed the login input `bg-slate-50/50` had always computed oklab — a session-6 blind spot, documented); F3 advisories carried (stands); live parity: all 8 service pages + all 4 legal pages text-identical both sides; gate green 60 unit + 58 e2e (118 total) |
| 2026-10-05 | Session-8 audit (booking form + ICS contract + confirmation icon) | F1 the ICS download carried the service's advertised duration instead of the reference's FIXED 90-minute event block — live bookings advertising 210/60/180 min all produced 90-min events (MEDIUM → `APPOINTMENT_BLOCK_MIN` in `ics.ts`, the confirmation page's dead `getService` lookup removed; `tests/ics.test.ts` rewritten to the decoded contract); F2 the ICS escaped LOCATION commas per RFC 5545 while the reference escapes nothing — comma-bearing names included (LOW → raw commas, documented divergence); F3 the booking Notes textarea lacked the reference's placeholder (MEDIUM → exact bytes `Anything we should know — inspiration, allergies, previous treatments...`); F4 the form was itself the grid vs the reference's block form + nested grid + outside Notes (`block mt-5`)/button row (`mt-10` 40px vs the clone's 36px) (LOW → restructured); F5 the Add-to-calendar icon was CalendarPlus@14 vs the reference's settled `Calendar` `h-4 w-4` (MEDIUM → corrected; the 14px reading was a pre-settle artifact); F6 the clone's a11y additions (aria-label/aria-pressed/autoComplete) documented as accepted divergences; F7 README/PAD said `GalleryExperience` — the file is `GalleryGrid.tsx` (docs fixed); advisories carried (stands); gallery lightbox verified fully holding (keyboard, wrap-around, filter scoping); lesson: the read-back rule extends to downloads — the ICS href was regex-checked for `balayage` for six green sessions while never being decoded; pinned by `booking-parity.spec.ts` +4 e2e; gate green 61 unit + 62 e2e (123 total) |
| 2026-10-05 | Session-9 audit (the icon layer + the contact structure) | A first-ever both-sides **icon census** (every `svg.lucide` on every route) found the whole session-1 icon layer unmeasured: F1a the testimonial stars rendered ink instead of the reference's SAGE `fill-secondary text-secondary` (MEDIUM → sage, pinned by computed rgb(75,93,79)); F1b the follow-along icon 14px vs 16px; F1c the gallery-preview hover icons 20px always-visible vs 24px `opacity-0 group-hover:opacity-100` (MEDIUM); F1d the services arrows lacked the `group-hover:rotate-45` hover animation + wrong margins (landing mt-2, grid no-mt) (MEDIUM); F1e the team buttons used arrow-right without the `group/btn` named group (MEDIUM → arrow-up-right + `group-hover/btn:rotate-45`); F1f the contact Get-directions glyph was ArrowUpRight instead of MapPin (MEDIUM); F1g the footer Contact column had NO icons (phone/mail/instagram h-3.5 — every page) (MEDIUM); F1h the contact Reach-us block had NO icons (h-4 w-4 text-foreground/60) (MEDIUM); F1i the login input icons at left-3.5/slate-400 vs left-3/slate-500; F1j the login's password EYE TOGGLE was an undocumented visible divergence (MEDIUM → removed — parity outranks the UX nicety; the invisible autoComplete/aria additions stay); F1k–F1m class-set alignments (book arrow, header/lightbox/detail icons, the GoogleIcon wrapper div); F2 the contact Hours section lacked the reference's `flex items-center justify-between mb-4` row with the StatusPill + carried a spurious ul mt-3 (MEDIUM → restructured; contact innerText now 808/808 exact); F3 the contact map embed VERIFIED HOLDING byte-identical (the session-8 self-hosting suggestion rejected — the reference itself loads the external Google embed); advisories carried (stands); root cause: innerText parity is blind to svg class sets and no spec ever pinned an icon — session 8's Calendar fix was one instance of a whole unmeasured layer; pinned by `icon-parity.spec.ts` +8 e2e; gate green 61 unit + 70 e2e (131 total); post-fix icon census: identical on every route both sides |
| 2026-10-05 | Session-10 audit (the confirmation decorative layer + the hero settled state + the head layer) | Three never-measured DOM layers swept: **(a) the /book/confirmation route** — the one the session-9 icon census skipped ("book 1/1" was the /book form): F1 the decorative watermark was `CalendarPlus size={96} strokeWidth={0.75}` vs the reference's `flower2` at `h-64 w-64 md:h-96 md:w-96` + `stroke-width="0.5"` in sage/30 — wrong glyph, a quarter of the size at desktop (MEDIUM → rebuilt); F2 the decorative circle renders VISIBLE in the clone but settles at `opacity: 0` on the reference (stable across 7 samples/35s — only a wasted scale loop beneath) (MEDIUM → `style={{ opacity: 0 }}`); F3 the cancellation-policy link was `mailto:` + `underline-offset-4` + iconless vs the reference's `/contact` ROUTE link with `inline-flex items-center gap-1` + a trailing `arrow-right h-3 w-3` (MEDIUM → rebuilt); **(b) the head layer** — invisible to every instrument that reads `document.body`: F6 no favicon at all (the reference declares its logo — the same asset the clone self-hosts — with its own svg-type artifact) + no manifest link (declared-but-dead on the reference; the clone mirrors the dead declaration — serving a real manifest would EXCEED the reference) (MEDIUM → layout metadata icons + manifest); the og/twitter/PWA metas registered as accepted base44-boilerplate divergence (INFO); **(c) the settled-state transform layer**: F4 the hero image box rendered 25% too large — the reference's animation framework neutralizes the parent's `scale-125` at rest (inline `transform: none`) and scales the img to 1.08; the clone froze the animation's INITIAL state forever (MEDIUM-HIGH → settled inline styles replicated; box now 457×610 @1280 / 366×488 @390 = live); F5 the 3 category images' hover was a 700ms editorial glide vs the reference's computed 150ms default-ease — the reference's class string carries its own corrupted `duration-s]` token (no CSS) with an equally dead `ease-[…]` sibling; the clone had unauthorizedly "fixed" it (MEDIUM-LOW → the inert token kept, the ease token dropped — it WOULD generate in v4 and change the computed timing); **TRAP 8 discovered**: v4's scale utilities write the individual CSS `scale` property, not `transform` — replicating the reference's inline `transform: none` alone did NOT neutralize `scale-125` (offsetWidth 457 but rect 572); the fix needs `scale: none` alongside; likewise v4's `transition-transform` transitions `transform, translate, scale, rotate` where v3 transitioned `transform`; F8 the mobile drawer re-verified @390×844 both sides (all pinned values + tap-through — the task brief's emphasis, no v4 regression); advisories carried (stands); pinned by `confirmation-parity.spec.ts` (+5 e2e) + `head-parity.spec.ts` (+3) + the landing session-10 contracts (+3, one a regression guard); gate green 61 unit + 81 e2e (142 total); lesson: the head layer and the settled-state transform layer each needed their own extraction pass — innerText and class-string comparison are structurally blind to both |

## Appendix D: Live-Site Validation Methodology

The reference (`luminous-sanctuary-copy-copy-c-d44ac1b2.base44.app`) is the source of truth; the dashboard image on GitHub does not exist (404 — verified twice).

1. **Browse** with `agent-browser` (repo skill): login with the demo credentials, walk all 13 routes, set 390×844 for mobile.
2. **Extract, don't screenshot-match:** pull exact DOM structures (`agent-browser get html`), computed styles (`getComputedStyle` via eval), and every image URL; download images locally.
3. **Pin measurements into specs:** the values in `tests/e2e/mobile-navigation.spec.ts` (gap 8px, mt 40px, 48px/−1.2px serif, exact rgb) came from the live drawer — re-verify them against the live site whenever the reference may have changed (re-done in session 2: byte-match confirmed).
4. **Verify behavior, not just looks:** link-click closes+navigates; Escape closes (a11y enhancement); no scroll lock on the reference drawer.
5. **What live testing catches that CI cannot:** reference drift (the live app can change under you), computed-style divergence (oklab/oklch reporting), and honest behavior contracts (drawer close semantics).


