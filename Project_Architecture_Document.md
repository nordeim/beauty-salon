# Maison Luminaire — Master Project Architecture Document (PAD) v1.0

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION-LOCKED BLUEPRINT
**Companion Documents:** `README.md` (onboarding) · `AGENTS.md` (agent instructions) · `CLAUDE.md` (conventions) · `docs/Tailwind-V4-Validation-Report.md` (engine trap log)
**Last Updated:** 2026-10-05
**Audience:** Senior Engineers, Tech Leads, DevOps, and Onboarding Engineers
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

---

## Table of Contents

1. [System Overview & Decisions](#1-system-overview--decisions)
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Application Architecture](#3-application-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Design System Reference](#5-design-system-reference)
6. [Security Architecture](#6-security-architecture)
7. [Testing Strategy](#7-testing-strategy)
8. [Build, Deployment & Operations](#8-build-deployment--operations)
9. [Developer Handbook](#9-developer-handbook)
10. [Known Issues & Deferred Work](#10-known-issues--deferred-work)

---

## 1. System Overview & Decisions

### 1.1 Document Metadata & Purpose

This PAD is the single source of truth for the Maison Luminaire clone: a self-hosted replica of a base44 beauty-salon application (marketing site + booking scheduler + auth), rebuilt as a single Next.js application with byte-parity design tokens. New engineers should read §1–§3 then §9; debugging starts at §3.3 and §10; reviewers evaluating a technical choice start at the ADR that introduced it.

The reference application is a client-rendered SPA. The clone's defining constraint: **visual and behavioral fidelity to the reference's computed output** — measured, not approximated — while upgrading the substrate to server-rendered, typed, tested code. Where the two goals conflict (e.g., SSR vs the reference's CSR-only scroll reveal), the clone adopts the SSR-safe idiom that preserves the visual result and documents the divergence.

### 1.2 Technology Stack Summary

| Layer | Technology | Version | Key Rationale |
|---|---|---|---|
| Web framework | Next.js (App Router, standalone) | ^16.1.1 | Server-rendered marketing pages with client islands; SSG for the 8 service details; route handlers for the typed JSON API; `output: standalone` for deploy-anywhere |
| UI runtime | React | ^19.0.0 | Required by Next 16; Server Components by default keep the marketing surface JS-light |
| Language | TypeScript (strict) | ^5 | Compile-time DTO discipline; `noEmit` gate in CI-parity check |
| Styling | Tailwind CSS (CSS-first) | ^4 | The reference is v3-built; v4 requires the trap-log discipline (§5.5). Tokens in `@theme`, customs in `@utility` — no config file |
| Fonts | next/font (Cormorant Garamond + Mulish) | bundled | Self-hosted; eliminates the reference's external Google Fonts request |
| ORM / DB | Prisma 6 + SQLite | ^6.11.1 | Zero-config local dev; the db-path seam makes one relative URL work for CLI + dev + standalone runtime alike |
| Unit tests | Vitest | ^5.0.1 | Fast, ESM-native, path-alias aware |
| E2E tests | Playwright (Chromium) | ^1.63.0 | Computed-style assertions (the parity contract) need a real browser |
| Runtime / PM | Bun | 1.3.x | Install, scripts, TS seed execution, standalone server host |
| Auth | node:crypto (scrypt + HMAC) | built-in | Zero extra dependencies; auditable primitives; timing-safe verification |

### 1.3 Architecture Decision Records

**ADR-001: Single Next.js application (not a Vite SPA like the reference)**

- **Context:** The reference is a base44-generated React SPA. A byte-faithful clone could reuse that shape, but the goal includes production-grade operability (SEO, no-JS content, typed API, tests).
- **Decision:** One Next.js 16 App Router app: `(site)` route group for marketing chrome, `/book` + `/login` as separate chrome surfaces, `/api/*` route handlers for writes.
- **Rationale:** Server rendering makes the marketing content crawlable and instant while keeping the reference's visual output; route handlers give the booking/newsletter/auth writes a typed, validatable seam; one deployable simplifies operations.
- **Consequences:** Two rendering paths to reason about (SSR + client islands); hydration-sensitive patterns need discipline (§3.3). Positive: SSG service pages, standalone deploy, no client-side data fetching for content.
- **Alternatives Rejected:** Vite SPA (no SSR/SEO, no route handlers); Next Pages Router (legacy); monorepo storefront+admin (overkill for one surface).

**ADR-002: Prisma + SQLite with the db-path resolution seam**

- **Context:** The scaffold's proven pattern (unit-tested in `tests/db-path.test.ts`): a relative `file:../db/custom.db` must resolve identically for the Prisma CLI, `next dev`, `next build`, and the standalone server (`process.chdir`'d into `.next/standalone`).
- **Decision:** `src/lib/db-path.ts` anchors relative `file:` URLs against the first candidate root containing `prisma/schema.prisma` (module root → standalone detector → CWD fallback); `src/lib/db.ts` applies it before constructing the Prisma client.
- **Rationale:** One database file across every execution context regardless of working directory; the standalone build's virtual import path cannot fool it (existence-checked).
- **Consequences:** SQLite caps write concurrency — acceptable for a salon's booking volume; production can swap `provider` + an absolute/Postgres URL without touching the seam.
- **Alternatives Rejected:** Hardcoded absolute paths (break portability); Postgres-only (adds infra to a demo-scale app).

**ADR-002b: The dev-time DATABASE_URL pinner (`scripts/with-repo-db.ts`)** — added in the session-2 audit (see `docs/remediation-plan-session-2.md` F1)

- **Context:** Standard dotenv precedence (process env beats `.env`) means a sandboxed/managed shell that exports an ambient absolute `DATABASE_URL` pointing outside the repo silently relocates the dev database — observed in the wild: `dev`, `build` SSG, `db:push`, and `db:seed` all read/wrote `<workspace>/db/custom.db` instead of `<repo>/db/custom.db`, while e2e stayed correct only because it pins its env explicitly.
- **Decision:** The dev-time scripts (`dev`/`build`/`start`/`db:push`/`db:seed`/`db:migrate`/`db:reset`) run through `scripts/with-repo-db.ts`, which resolves the repo `.env` file's `DATABASE_URL` FIRST (`parseDotenvValue` + `devDatabaseUrl`, both pure and unit-tested in `tests/db-path.test.ts`), then spawns the wrapped command with the resolved URL set explicitly in its environment — generalizing the e2e suite's proven explicit-env pattern.
- **Rationale:** Explicitly-set child env beats ambient noise; the repo `.env` is the documented source of truth for local development, so the fix cannot drift from the configuration users actually edit.
- **Consequences:** An operator wanting a one-off dev override must edit `.env` (or call the CLI directly) — documented in AGENTS.md. With no `.env` shipped (production), the wrapper is a transparent passthrough: the 12-factor env-var precedence is preserved for the standalone runtime (`src/lib/db.ts` deliberately does NOT use the env-file-first rule — the e2e webServer's explicit `file:../db/e2e.db` relies on process-env precedence).
- **Alternatives Rejected:** Changing `db.ts` to env-file-first (breaks the e2e contract and production rotation); baking the URL into `next.config.ts` `env` (same conflict); warning-only (silent wrong-DB is worse than a deterministic pin).

**ADR-003: Cookie-session auth with scrypt + HMAC (no auth library)**

- **Context:** The reference login is a base44-hosted surface (Google OAuth + email/password). The clone must offer working sign-in without third-party identity dependencies.
- **Decision:** `src/lib/auth.ts` — scrypt(N=16384,r=8,p=1) password hashing with `scrypt$salt$hash` storage; sessions as `userId.exp.hmac` tokens in an httpOnly `ml_session` cookie (7-day TTL, SHA-256 HMAC under `AUTH_SECRET`); timing-safe MAC and password comparison; per-IP 10/15-min rate limit; identical error for unknown-user and wrong-password.
- **Rationale:** Built-in Node crypto, no supply-chain surface, every primitive auditable; the token format is stateless (no session table to sweep) yet revocable-by-expiry.
- **Consequences:** No server-side revocation (a leaked token lives ≤7 days); acceptable for this surface, documented in §6.4. Google button renders but is inert-and-honest (no provider configured).
- **Alternatives Rejected:** NextAuth/better-auth (dependency weight for a single demo credential set); JWT libraries (same crypto, more API); bcryptjs (extra dep for equal security).

**ADR-004: Client-safe content module split (`content.ts` vs `data.ts`)**

- **Context:** The interactive surfaces (services filter, gallery lightbox, booking form) need DTO types and `formatPrice` in the browser. The first implementation imported them from the data module — Turbopack panicked: "the chunking context does not support external modules (request: node:fs)" (the db client's path seam imports `node:fs`).
- **Decision:** `src/lib/content.ts` holds DTO interfaces + `formatPrice` with zero db/node imports; `src/lib/data.ts` (server-only) re-exports the types and owns every Prisma read. Client components import ONLY from `content.ts`.
- **Rationale:** The dependency boundary is enforceable by grep (`from "@/lib/data"` inside `src/components/**` must be type-only or absent) and prevents a whole class of bundler panics.
- **Consequences:** Two files where one felt natural; the split is documented in AGENTS.md as an invariant.
- **Alternatives Rejected:** `prisma generate --no-engine` in client (absurd); duplicating types (drift risk); `server-only` package marker (helps, but the node:fs panic comes from a transitive import the marker wouldn't catch before the bundler does).

**ADR-005: Tailwind v4 trap-pinning strategy (the five-trap discipline)**

- **Context:** The reference was built on Tailwind v3; the clone targets v4. The repo's own validation report documents five engine-level differences that silently alter computed output (docs/Tailwind-V4-Validation-Report.md, Project Trap Log).
- **Decision:** (1) `@theme` colors as full `hsl(…)` values; (2) exact reference palette pinned (never v4 defaults); (3) computed-parity gradients use arbitrary `bg-[linear-gradient(…)]`; (4) the mobile drawer's spacing is flex `gap-2` + `mt-10` — never `space-y-*`; (5) `--shadow-sm` pinned to the v3 geometry in `@theme inline`. Each pin is asserted by e2e computed-style specs.
- **Rationale:** Traps 1/4/5 change *layout or visibility*, not just color strings; the e2e layer converts them from folklore into regressions.
- **Consequences:** `globals.css` carries explanatory comments and is a protected file; reviewers must consult the trap log before token changes.
- **Alternatives Rejected:** Tailwind v3 (abandons the v4 migration intent and the scaffold's toolchain); accepting v4 defaults (computed drift from the reference).

**ADR-006: Playwright computed-style parity as the acceptance contract**

- **Context:** "Looks the same" is unverifiable prose. The reference's live DOM was measured during research (research/target-app-spec.md): fonts, sizes, spacings, colors of the mobile drawer, header, and hero.
- **Decision:** `tests/e2e/mobile-navigation.spec.ts` asserts the drawer's computed styles against those measured values (gap 8px, CTA wrapper 40px, 48px Cormorant Garamond line-height 48px, letter-spacing −1.2px, exact rgb colors, ≥9999px radius).
- **Rationale:** Turns visual fidelity into an executable gate; the spec header documents which trap each assertion pins.
- **Consequences:** Styling refactors that "improve" the drawer fail CI-parity — by design.
- **Alternatives Rejected:** Visual screenshot diffing (flaky across font rendering; weaker diagnosis); manual QA (non-repeatable).

**ADR-007: Deep-link query-string confirmation flow (no server round-trip for the receipt)**

- **Context:** The reference redirects to `/book/confirmation?name=&date=&time=&service=` after booking — the receipt is a pure function of the query string, with the ICS regenerated client-side-linkable.
- **Decision:** Mirror the contract: POST `/api/appointments` validates + persists; the client pushes the same query shape; the confirmation page (dynamic, server) reads `searchParams` and renders, generating the ICS as a `data:text/calendar` download link via `src/lib/ics.ts`. **Session-8 correction (live-measured):** the reference does NOT resolve the service for the ICS — its download carries a **fixed 90-minute event block** (`APPOINTMENT_BLOCK_MIN`) regardless of the service's advertised duration (bookings advertising 210/60/180 minutes all produced 90-minute events), and it performs **no RFC 5545 comma escaping** (LOCATION and comma-bearing names pass through raw). The page needs no DB read; byte-parity of the download outranks RFC correctness (documented divergence), pinned by `tests/e2e/booking-parity.spec.ts` + the rewritten `tests/ics.test.ts`.
- **Rationale:** Byte-parity URL contract; the ICS builder stays a pure, unit-tested module (fixed 90-minute block, UTC stamps, midnight rollover, raw-comma text, data-URI).
- **Consequences:** The confirmation page is shareable/bookmarkable with arbitrary params (harmless — it renders a receipt, not PII beyond the passed name); unknown service slugs render verbatim (no duration lookup to fall back).
- **Alternatives Rejected:** Server-rendered receipt from the appointment row (changes the URL contract); client-side-only ICS (untestable seam); RFC-5545-escaped output (diverges from the reference's actual download bytes).

---

## 2. High-Level System Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│ Browser (desktop / mobile)                                          │
│  · Marketing pages — SSR HTML + client islands (header/drawer,      │
│    carousels, filters, forms, lightbox)                             │
│  · /login — client form island → POST /api/auth/login               │
│  · /book — client form island → POST /api/appointments              │
└───────────────┬─────────────────────────────────────────────────────┘
                │ HTTPS (static assets: /images/* self-hosted, fonts
                │         self-hosted via next/font)
┌───────────────▼─────────────────────────────────────────────────────┐
│ Next.js standalone server (Node/Bun, PORT)                          │
│  · App Router pages — (site) group · /book · /login · not-found     │
│  · Route handlers — /api/health · /api/auth/* · /api/appointments   │
│                     /api/newsletter                                 │
│  · src/lib — content (client-safe) · data (Prisma reads) · auth     │
│              (scrypt/HMAC/rate-limit) · ics · hours                 │
└───────────────┬─────────────────────────────────────────────────────┘
                │ Prisma 6 (libsql adapter protocol)
┌───────────────▼─────────────────────────────────────────────────────┐
│ SQLite file — db/custom.db (dev) / db/e2e.db (e2e) / absolute (prod)│
│  Service · Stylist · GalleryItem · Testimonial · Appointment ·      │
│  NewsletterSubscriber · User                                        │
└─────────────────────────────────────────────────────────────────────┘
External (render-time, optional): Google Maps iframe embed on /contact
```

Scaling characteristics: single-writer SQLite suits a single-salon booking volume (tens of writes/day). The read path is per-request Prisma queries against an indexed local file — sub-millisecond. Horizontal scale requires only swapping `DATABASE_URL` (ADR-002).

---

## 3. Application Architecture

### 3.1 The Layer Model

```
Layer 0: Browser        — React 19 hydration of client islands only. Rule: no data fetching; islands receive DTO props.
Layer 1: Pages (RSC)    — src/app/**. Rule: compose chrome + sections, await async params/searchParams, call Layer 3 reads; never import node built-ins.
Layer 2: Route handlers — src/app/api/**. Rule: validate every body (unknown → narrowed), single catch at the boundary, typed { error } JSON.
Layer 3: Domain/lib     — src/lib/content (client-safe DTO+format), data (server reads), auth, ics, hours. Rule: pure where possible; every seam unit-tested.
Layer 4: Persistence    — Prisma client (src/lib/db.ts) + db-path resolution. Rule: relative file: URLs resolve through the seam only.
```

**Golden Rule:** dependencies point strictly downward; the only module a client component may import from the data domain is `src/lib/content.ts` (ADR-004).

### 3.2 Annotated Directory Structure

```
src/
├── app/
│   ├── layout.tsx                  # fonts (next/font vars), metadata, <noscript> reveal fallback
│   ├── globals.css                 # Tailwind v4 @theme (traps 1/2/5/6: brand HSL + slate sRGB pins) + @utility customs + reveal CSS
│   ├── not-found.tsx               # 404: site chrome around the NotFoundBody island (slate card, live-measured)
│   ├── (site)/                     # marketing chrome group: SiteHeader + main + SiteFooter
│   │   ├── layout.tsx
│   │   ├── page.tsx                # landing — hero, disciplines, story, interior, testimonials, instagram, newsletter
│   │   ├── services/page.tsx       # grid + filter (dynamic: reads ?category=)
│   │   ├── services/[slug]/page.tsx# 8 SSG detail pages + sticky treatment card + prep list
│   │   ├── gallery/page.tsx        # filterable grid + lightbox (client island)
│   │   ├── team/page.tsx           # grayscale→color hover member cards
│   │   ├── about/page.tsx          # story + Four commitments (dark section)
│   │   ├── contact/page.tsx        # address/reach/hours + Google Maps embed
│   │   └── privacy|terms|accessibility|refund/page.tsx  # LegalPage over lib/legal content
│   ├── book/
│   │   ├── page.tsx                # Seamless Scheduler (BookHeader chrome, prism wash)
│   │   └── confirmation/page.tsx   # receipt + ICS data-URI (ADR-007)
│   ├── login/page.tsx              # slate/white auth card (standalone chrome)
│   └── api/
│       ├── health/route.ts         # liveness + db probe
│       ├── auth/login|logout|me/   # scrypt verify, cookie set/clear, session read
│       ├── appointments/route.ts   # POST — full validation → Prisma create
│       └── newsletter/route.ts     # POST — idempotent upsert
├── components/
│   ├── layout/SiteHeader.tsx       # fixed header + scroll glass + full-screen mobile drawer (trap-4-safe)
│   ├── layout/BookHeader.tsx       # always-glass h-16 "← Return to site" chrome
│   ├── layout/SiteFooter.tsx       # dark footer + hours + legal bar
│   ├── Reveal.tsx                  # IO scroll reveal (lint-safe, hydration-safe)
│   ├── StatusPill.tsx              # Open/Closed today (render-time day + suppressHydrationWarning)
│   ├── TestimonialCarousel.tsx     # 4-quote rotating carousel w/ dots
│   ├── GalleryGrid.tsx            # pills + grid + keyboard lightbox (exports GalleryExperience)
│   ├── ServicesExperience.tsx      # pills + hairline grid
│   ├── BookingForm.tsx             # native date/time, deep-link preselect, POST + redirect
│   ├── LoginForm.tsx               # LoginCardBody island (Google btn + divider + form)
│   └── LegalPage.tsx               # shared legal layout (h2 section grouping)
└── lib/
    ├── content.ts                  # CLIENT-SAFE DTOs + formatPrice (ADR-004)
    ├── data.ts                     # server-only Prisma read seam
    ├── auth.ts                     # scrypt, HMAC sessions, rate limiter
    ├── ics.ts                      # ICS builder (fixed 90-min block) + data-URI
    ├── hours.ts                    # opening-hours model + status logic
    ├── legal.ts                    # verbatim reference legal content
    ├── utils.ts                    # cn()
    └── db.ts / db-path.ts          # Prisma client + URL resolution seam
```

### 3.3 Critical Code Patterns

**Pattern A — the trap-4-safe mobile drawer spacing (SiteHeader)**

```tsx
{/* The links column uses flex gap (8px) + the CTA wrapper's explicit mt-10
    (40px) = 48px total. Under Tailwind v3, a space-y container would have
    OVERIDDEN a child's mt-*; under v4's :where() rewrite the child wins —
    the two engines disagree. flex gap + margin is engine-stable, and the
    computed result is pinned by tests/e2e/mobile-navigation.spec.ts. */}
<div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-2">
  {NAV_ITEMS.map(...) /* 48px Cormorant links */}
  <div className="mt-10">
    <Link href="/book">…Book an appointment…</Link>
  </div>
</div>
```

*Why this pattern:* the reference's drawer spacing is the single highest-regression surface of the port (the repo's trap log documents a real 405px vs 413px panel-height bug in a prior session). Encoding the spacing as gap+margin makes the layout identical on both engines and assertable.

**Pattern B — the client-safe/server-only split (content vs data)**

```ts
// src/lib/content.ts — importable from client components; ZERO db/node imports
export interface ServiceDto { slug: string; /* … */ priceCents: number }
export function formatPrice(cents: number): string { /* … */ }

// src/lib/data.ts — server-only; re-exports the types, owns the reads
import { db } from "./db";
export type { ServiceDto } from "./content";
export async function getServices(category?: string): Promise<ServiceDto[]> { /* Prisma read */ }
```

*Why this pattern:* a single value import of `data.ts` from a client component transitively pulls `node:fs` into the browser chunk graph and panics Turbopack (verified failure; AGENTS.md documents it). The split makes the boundary greppable.

**Pattern C — lint-and-hydration-safe state initialization (Reveal / StatusPill)**

```tsx
// Environment-INDEPENDENT initial state (a `typeof IntersectionObserver`
// initializer evaluates differently on server vs client → attribute mismatch):
const [visible, setVisible] = React.useState(false);
React.useEffect(() => {
  if (typeof IntersectionObserver === "undefined") {
    const t = setTimeout(() => setVisible(true), 0); // async callback — allowed
    return () => clearTimeout(t);
  }
  const io = new IntersectionObserver(/* flips state in the external callback */);
  io.observe(el);
  return () => io.disconnect();
}, [visible]);
```

*Why this pattern:* `react-hooks/set-state-in-effect` forbids sync setState in effect bodies; the timer callback and IO callback are the sanctioned external-system paths. No-JS users are covered by the `<noscript>` style override in the root layout.

**Pattern D — validated write endpoint (appointments)**

```ts
// Narrow unknown → typed, validate shapes (not just presence), THEN persist.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) return badRequest(/* … */);
const service = await db.service.findUnique({ where: { slug: serviceSlug } });
if (!service) return NextResponse.json({ error: "Unknown service." }, { status: 400 });
await db.appointment.create({ data: { /* … */ } });
```

*Why this pattern:* every write crosses a trust boundary; regex shape + semantic parse + existence check + single catch with a logged, customer-safe error.

---

## 4. Data Architecture

### 4.1 Database Schema

```mermaid
erDiagram
  Service ||..|| Appointment : "serviceSlug"
  Stylist ||..o| Appointment : "stylistSlug (nullable)"
  Service {
    string slug UK
    string name
    string category "hair | skin | nails"
    string tagline
    string description
    string longDescription
    int priceCents
    int durationMin
    string prep "JSON array"
    string faqs "JSON array of { q, a } — default '[]'" @default("[]")
    string image
    int sortOrder
  }
  Stylist {
    string slug UK
    string name
    string title
    string eyebrow "01 / 14 yrs"
    string bio1
    string bio2
    string imageGray
    string imageColor
  }
  GalleryItem {
    string title
    string category "skin | bridal | cuts | color | nails"
    string description
    string image
    string fullImage
    int sortOrder
  }
  Testimonial {
    string quote
    string attribution
    int sortOrder
  }
  Appointment {
    string name
    string email
    string phone
    string stylistSlug
    string serviceSlug
    string date "YYYY-MM-DD"
    string time "HH:MM"
    string notes
    datetime createdAt
  }
  NewsletterSubscriber {
    string email UK
  }
  User {
    string email UK
    string passwordHash "scrypt$salt$hash"
    string name
  }
```

### 4.2 Data Models

DTO shapes live in `src/lib/content.ts` (client-safe). Notable modeling decisions: prices are **integer cents** (`priceCents`) — money never touches floats; `prep` is a JSON-encoded `string[]` (SQLite-friendly, parsed defensively in the read seam); the booking's `date`/`time` are the reference's wire format strings, validated by regex + `Date.parse` at the boundary.

### 4.3 Persistence Strategy

Single Prisma client singleton (`globalThis` cache in dev; error-only logging in production). No connection pool needed (SQLite). Migrations: `prisma db push` for this app's lifecycle (schema is young, no production data); forward-only `prisma migrate` becomes appropriate once the first deployed DB exists. The seed is idempotent (natural-key upserts for services/stylists; delete-and-recreate by title for gallery/testimonials which lack natural keys) and refuses nothing — it is content, not state.

---

## 5. Design System Reference

### 5.1 Typographic System

- **Display serif** — Cormorant Garamond (300/400/500/600 + italic), self-hosted, `--font-cormorant`. All headings (`h1–h5` carry `font-family: var(--font-serif); letter-spacing: -0.01em` from the base layer), the logo, big price numerals, drawer links (48px at 390w), quotes.
- **UI sans** — Mulish (300–600), self-hosted, `--font-mulish`, `font-feature-settings: "ss01", "cv11"` on body. Eyebrows, nav, buttons, form labels.
- **Editorial tracking** — `tracking-editorial` (`@utility`, 0.22em) on every uppercase label; headline tracking is `tracking-tight` (−0.025em).
- **Auth-shell font context (session-3 finding F1)** — the brand system covers marketing + booking ONLY. The reference's `/login` is a separate base44 CSS context that never loads the brand fonts: its whole chain (body, h1, inputs, buttons) computes to Tailwind's **default sans stack** with `font-feature-settings: normal` and `-webkit-font-smoothing: auto`. The clone pins that context with the `font-shell` `@utility` on the login `<main>` (+ directly on the `<h1>`, because the global heading base rule beats inheritance); `tests/e2e/login-parity.spec.ts` asserts the computed values.

### 5.2 Color Tokens (pinned, trap 1 + 2)

| Token | Value (hsl) | Computed | Use |
|---|---|---|---|
| `background` | `hsl(44 29% 97%)` | `rgb(250, 248, 245)` | page + drawer + cards on hairline grids |
| `foreground` | `hsl(0 0% 10%)` | `rgb(26, 26, 26)` | ink, primary buttons, footer bg |
| `secondary` | `hsl(134 11% 33%)` | `rgb(75, 93, 79)` | sage — italic headline spans, hover fills, testimonial wash |
| `accent` | `hsl(27 48% 84%)` | `rgb(255, 210, 172)` | peach — hero blur orbs, newsletter wash, card hover wash |
| `muted` | `hsl(40 20% 93%)` | `rgb(237, 232, 224)` | image placeholders, drawer preview panel |
| `border` | `hsl(30 15% 86%)` | `rgb(223, 218, 211)` | hairlines |

Contrast: foreground on background ≈ 17:1 (AAA); `foreground/60` eyebrows ≈ 8:1 (AA); `text-background/60` on the dark footer ≈ 9:1 (AA).

### 5.3 Component Primitives

Hand-rolled shadcn-style primitives only where the reference uses them (pill button `rounded-full bg-foreground text-background hover:bg-secondary`, `rounded-sm` inputs, hairline `gap-px bg-foreground/10` grids). Radix-style `group-hover` patterns; lucide icons at 14–20px stroke 2. The glass header (`glass`: `rgba(250,248,245,0.6)` + `blur(20px) saturate(140%)`) activates on scroll > 24px.

### 5.4 Motion

- **Scroll reveal** — `.reveal-hidden` (opacity 0, blur 8px, translateY 24/40/50px by variant) → `.reveal-visible` via IntersectionObserver (threshold 0.1, rootMargin −10%), 0.9s `cubic-bezier(0.22,1,0.36,1)`; `prefers-reduced-motion` collapses to opacity; `<noscript>` renders visible.
- **breathe** — status-dot pulse: 2.4s ease-in-out infinite (0.6→1 opacity, 1→1.15 scale).
- **Header** — transparent → glass transition, 500ms.
- **Hover grammar** — 700ms image scales (`group-hover:scale-110`), 500ms color transitions on pills, drawer link `hover:italic`.

### 5.5 The Tailwind v4 Trap Log (authoritative copy)

1. **Bare-HSL transparent theme** — full `hsl(…)` values only in `@theme`.
2. **oklch palette drift** — exact reference HSL pinned; v4 defaults forbidden.
3. **oklab gradient interpolation** — computed-parity gradients use `bg-[linear-gradient(…)]` (the `/login` wash).
4. **space-y `:where()` rewrite** — drawer spacing is `gap-2` + `mt-10`; `space-y-*` with `mt-*` children is engine-ambiguous.
5. **shadow-scale shift** — `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)` pinned in `@theme inline`.
6. **oklch palette serialization** — the slate scale pinned to the reference's sRGB hex (session 5; slate-900 digit corrected + read-back contract session 6).
7. **opacity-modifier serialization** — v4's `/α` emits `color-mix(in oklab, …)` → `oklab(L a b / α)` where v3 emitted `rgba()`; pixels identical — assert resolved channels, not strings (session 7).
8. **individual-transform properties** — v4's `scale-*` writes the individual CSS `scale` property, not `transform`: a v3-era inline `transform: none` does NOT neutralize it (the landing hero's settled state needs `scale: none` alongside the reference's own inline `transform: none`), and `transition-transform` transitions `transform, translate, scale, rotate` where v3 transitioned `transform` (session 10).

Accepted, visually-equivalent engine differences (do not "fix"): `rounded-full` → 33554400px (v3: 9999px); `border-foreground/5` → `color-mix(in oklab, …)` string form; the login shell's `<body>` background (reference white vs shared-root cream) is reachable only via macOS rubber-band overscroll — the pinned slate gradient covers the viewport.

---

## 6. Security Architecture

### 6.1 Security Rules

| Rule | Enforcement |
|---|---|
| No secrets in code or logs | `.env` git-ignored; `.gitignore` rejects `*.key`, `ssh-key.txt`; wrapper shreds temp keys |
| Passwords never stored raw | scrypt with 16-byte random salt; `scrypt$salt$hash` format; `verifyPassword` timing-safe |
| Sessions signed, not encrypted-but-trusted | HMAC-SHA256 over `userId.exp`; verification recomputes + timing-safe compare + expiry check |
| Cookies | `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`, 7-day max-age |
| All API input is untrusted | Body parsing into `unknown`, per-field narrowing, regex + semantic date/time validation, service/stylist existence checks |
| No account enumeration | Identical 401 body/timing shape for unknown-user vs wrong-password |
| Login rate limiting | 10 attempts / 15 min / IP (in-memory; per-instance, documented) |
| Output encoding | React JSX escaping by default; the only `dangerouslySetInnerHTML` is none — zero usages |
| Dependency hygiene | `bun pm trust` gate on postinstalls; lockfile committed |

### 6.2 Security Utilities

`src/lib/auth.ts` — `hashPassword` / `verifyPassword` (scrypt, timing-safe), `createSessionToken` / `verifySessionToken` (HMAC, timing-safe, expiry), `getSessionUser` (cookie → user), `sessionCookie` (options object), `checkRateLimit` (fixed window per IP).

### 6.3 Authentication & Authorization

Public marketing + booking surface (matches the reference — nothing is gated). The login exists to mirror the reference surface and demonstrate the flow: POST `/api/auth/login` → httpOnly cookie → redirect `/`; GET `/api/auth/me` returns the session user or 401; POST `/api/auth/logout` clears. There is no RBAC surface to administer.

### 6.4 Threat Model

| Vector | Mitigation | Residual |
|---|---|---|
| Credential stuffing | Rate limit + scrypt cost + no enumeration | Per-instance limiter resets on restart (acceptable for this scale) |
| Session forgery | HMAC + timing-safe compare + expiry | Tokens are stateless: no server-side kill switch (≤7-day exposure; accepted, ADR-003) |
| Malicious booking payloads | Field-by-field validation + existence checks + length caps (notes ≤2000) | Public endpoint by design (matches reference) |
| XSS | JSX escaping; no raw HTML injection points | — |
| SQLi | Prisma parameterized queries exclusively | — |
| Open redirect | No `?redirect=` handling exists | — |

---

## 7. Testing Strategy

| Level | Tool | Count | What it locks |
|---|---|---|---|
| Unit | Vitest, `tests/*.test.ts` | 61 | db-path resolution contract (anchor rules + dotenv parsing + dev-time env-file-first precedence); hours model (formats + status per day); ICS builder (envelope, UTC stamps, the fixed 90-minute block, midnight rollover, raw-comma LOCATION + names, data-URI); auth primitives (scrypt round-trip/salt/reject, session round-trip/tamper/expiry); repo hygiene (no retired scaffold-model references; doc/package script references resolve); canonical-origin resolution (`siteUrl` default/blank/malformed/non-absolute fallbacks); the service-detail first-sentence splitter (`. ` boundary, no-boundary, trailing-only, empty) |
| E2E | Playwright, `tests/e2e/*.spec.ts` | 81 | mobile-navigation computed-style parity (traps), login parity (auth shell = default sans stack + the slate-900 sRGB read-back), not-found parity (slate centered card, 72px light slate-300 Cormorant 404, divider, path-interpolated message, Go Home button), service-detail parity (first-sentence description H2, check-icon prep grid, exclusive-open FAQ accordion with item 0 default-open, Ready-to-begin dark CTA with the lowercase reserve line, seed-correction read-backs), legal parity (accessibility 8-item checklist + note variant + mt-3 + br coordinator + privacy/terms top-level hoisting + text-correction read-backs), booking parity (nested-grid form + computed 20/40px margins, the Notes placeholder, the Calendar icon, the decoded-ICS fixed 90-minute block + raw commas), icon parity (the lucide class layer on every route — glyph/class-set/computed size-color-margin: the sage testimonial stars, the hover-rotate service arrows, the team `group/btn` named group, the footer + Reach-us phone/mail/instagram sets, the MapPin directions glyph, the login `left-3 text-slate-500` icons, the absent eye toggle), confirmation parity (the flower2 watermark at responsive class sizing + stroke 0.5 + sage/30 oklab channels, the invisible decorative ring, the /contact policy link with its trailing arrow + auto underline offset, the Calendar + innerText contracts), head parity (the declared favicon with the reference's svg-type artifact + the declared-but-dead manifest link), the landing session-10 contracts (the hero settled state — transform/scale none per trap 8, 457×610 @1280, the img at scale 1.08 — + the category images' computed 150ms default-ease hover zoom via the inert `duration-s]` token, with the gallery tiles' 700ms guard), landing structure + carousel rotation + newsletter, booking flow end-to-end (deep links, submission, confirmation, ICS href), gallery (filter counts, lightbox + keyboard), auth (login surface, demo credentials, no-enumeration), route matrix + 404 + team |

E2E runs the **production standalone build** on :3100 against an isolated seeded `db/e2e.db` (global-setup: `db push` + seed), single worker (shared SQLite file), `reuseExistingServer` locally. The gate order — `lint → typecheck → test → build → test:e2e` — is the only CI (no hosted pipelines).

Verification ledger for this release (session 10): lint ✓ (0 errors), typecheck ✓, unit 61/61 ✓, build 27/27 pages ✓, e2e **81/81** ✓ (142 total), live-parity verification ✓ (the confirmation route — the one the session-9 icon census skipped — measured both sides: the flower2 watermark, the invisible decorative ring, the /contact policy link with its trailing arrow, innerText 536/536; the landing hero's SETTLED state at 1280 and 390 — the reference's animation framework neutralizes the parent's scale-125 class at rest (inline transform: none) and scales the img itself to 1.08; the mobile drawer re-verified @390×844 on both sides; the head layer — the reference's declared favicon + its declared-but-dead manifest link). Session-10 remediation: the confirmation decorative layer rebuilt to the live-measured contract (flower2 at responsive class sizing + stroke 0.5 in sage/30; the circle settled invisible at opacity 0; the policy link converted from mailto to the /contact route link with inline-flex gap-1 classes + the trailing arrow-right h-3 w-3); the landing hero's settled state replicated (transform: none + scale: none neutralizing the scale-125 class — TRAP 8 discovered: v4's scale utilities write the individual `scale` property, which a v3-era inline `transform: none` cannot neutralize — plus the img at scale 1.08; the box now renders 457×610 @1280 / 366×488 @390, exactly the reference, vs the clone's previous 25%-too-large active scale); the category images' hover timing replicated (the reference's own corrupted `duration-s]` token kept inert so transition-transform's built-in 150ms + default ease stands — the clone's previous 700ms editorial glide was an unauthorized "fix"; the dead-on-live ease token dropped as it would generate in v4); the head layer added (favicon = the self-hosted logo with the reference's own svg-type artifact; manifest link declared with a deliberately dead target, mirroring the reference's own SPA-fallback dead link). Lesson: two more DOM layers were invisible to every existing instrument — the HEAD layer (innerText/computed specs read document.body only; the favicon is the one browser-visible head element) and the SETTLED-STATE TRANSFORM layer (the reference's animation framework writes runtime inline styles that class-string comparison cannot see; only a settled-state both-sides rect/computed read reveals that the effective box is 25% smaller than the class list implies). Each new layer got its own extraction pass + read-back contract (head-parity.spec.ts, confirmation-parity.spec.ts, the landing session-10 contracts). Historical ledger — session 9: lint ✓, typecheck ✓, unit 61/61 ✓, build 27/27 ✓, e2e 70/70 ✓ (131 total); remediation: the icon class layer rebuilt to the reference's class-sizing convention across 12 files (the sage testimonial stars; the gallery-preview hover icons at 24px with opacity-0 group-hover:opacity-100; the services arrows' group-hover:rotate-45 hover animation; the team buttons' named group/btn + arrow-up-right; the footer + contact Reach-us phone/mail/instagram icons; the MapPin directions glyph; the login icons at left-3 text-slate-500 + the password eye toggle REMOVED as an undocumented visible divergence); the contact Hours section restructured to the reference's flex items-center justify-between mb-4 row with the StatusPill. Lesson: innerText parity is blind to the icon layer — svg class sets, glyphs, and hover behaviors need their own extraction pass + read-back contracts (icon-parity.spec.ts); the session-8 Calendar finding was a single instance of this whole unmeasured layer. Session 8: lint ✓, typecheck ✓, unit 61/61 ✓, build 27/27 pages ✓, e2e 62/62 ✓ (123 total), live-parity verification ✓ (mobile drawer both sides; booking form structure + validation branches + deep links + happy-path submissions both sides; the ICS download decoded on both sides — fixed 90-minute block + raw commas now byte-parity; gallery lightbox keyboard + filter scoping both sides). Session-8 remediation: the ICS contract rebuilt to the live-measured download (fixed 90-minute event block replacing the service-duration DTEND; raw-comma LOCATION/names replacing RFC 5545 escaping; the confirmation page's dead `getService` lookup removed); the booking form rebuilt to the reference's DOM (block-level glass card + nested 2-col grid + the Notes label/button row as outside block siblings with mt-5/mt-10; the Notes placeholder added); the Add-to-calendar icon corrected to lucide `Calendar` at h-4 w-4; the GalleryGrid doc-name drift fixed (README/PAD). Lesson: the session-6 read-back rule extends to downloads — an ICS href was regex-checked for `balayage` presence for six green sessions while its payload was never decoded against the reference. Session 7: lint ✓, typecheck ✓, unit 60/60 ✓, build 27/27 ✓, e2e 58/58 ✓ (118 total); remediation: the service detail pages rebuilt to the reference's six-section contract (the first-sentence description H2 via `firstSentence`; the check-icon prep grid; the exclusive-open `FaqAccordion` island + per-service FAQ data as a `faqs` JSON column; the Ready-to-begin dark CTA; three session-1 longDescription transcription errors corrected); the legal pages rebuilt on the `LegalBlock` model (the accessibility 8-item checklist, the note variant, mt-3 in-section spacing, the br coordinator block, privacy/terms top-level paragraph hoisting; three transcription errors corrected); trap 7 discovered + documented (v4's opacity modifier serializes as `oklab(L a b / α)` where the reference's v3 emitted `rgba()` — pixels identical; the specs assert resolved channels; this also revealed the login input's `bg-slate-50/50` had always computed oklab — a session-6 verification blind spot, now documented). Session 6: lint ✓, typecheck ✓, unit 55/55 ✓, build 27/27 ✓, e2e 46/46 ✓ (101 total); remediation: the trap-6 slate-900 digit corrected (`#0f172e` → `#0f172a`) + the login-parity read-back contract (lesson: every pinned value needs a test that reads it back). Session 5: lint ✓, typecheck ✓, unit 55/55 ✓, build 27/27 ✓, e2e 45/45 ✓; remediation: the 404 surface rebuilt to the live-measured reference contract (slate centered card; `src/components/NotFoundBody.tsx` island reading `window.location` via `useSyncExternalStore`, pinned by `tests/e2e/not-found-parity.spec.ts`); the slate scale pinned to the reference's sRGB hex in `@theme` (trap 6); the clone-authored 404 assertions in `auth.spec.ts` corrected to the live contract. Session 4: lint ✓, typecheck ✓, unit 55/55 ✓, build 27 routes ✓, e2e 42/42 ✓, live parity byte-identical (drawer, login font chain, landing tokens, 8/8 services); remediation: 14 pre-clone scaffold scripts removed, `NEXT_PUBLIC_SITE_URL` wired to `metadataBase` via `src/lib/site.ts`, DEPLOYMENT.md pre-clone remnants corrected. Session 3: lint ✓, typecheck ✓, unit 47/47 ✓, build 27 routes ✓, e2e 42/42 ✓, auth-shell font parity fix (`font-shell` utility, pinned by `tests/e2e/login-parity.spec.ts`).

---

## 8. Build, Deployment & Operations

- **Build**: `bun run build` → `.next/standalone/server.js` (+ static assets copied by the package script). 27 routes; 8 service pages pre-rendered from DB rows at build time (DB required at build).
- **Run**: `PORT=… DATABASE_URL=file:/abs/path.db AUTH_SECRET=… bun .next/standalone/server.js`.
- **Health**: `GET /api/health` → `{"status":"ok","db":true}` (503 + `db:false` when the DB probe fails).
- **Ops runbook**: `docs/DEPLOYMENT.md`; SSH push via `docs/ssh_git_wrapper_v3.py` (operator contract in `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — key never inside the repo, temp key shredded after push, remote ref verified post-push).
- **Observability**: Prisma logs queries in dev, errors-only in production; API failures log with context (`console.error` + operation name) before returning customer-safe JSON.

---

## 9. Developer Handbook

**Daily loop**: `bun run dev` (:3000) → edit → the e2e-relevant surfaces hot-reload; run the focused spec (`bunx playwright test <spec> -g "<name>"`) before the full gate. Content edits go in `prisma/seed.ts` → `bun run db:seed` (idempotent) — never hand-edit the DB.

**Adding a marketing page**: create `src/app/(site)/<route>/page.tsx` (inherits chrome), export `metadata`, read via `src/lib/data.ts`, compose `Reveal` sections; add the route to the e2e route-matrix test; add nav/footer links only if the reference has them.

**Adding a service/stylist/gallery item**: append to `prisma/seed.ts` (mind `sortOrder`), re-seed; service detail pages pick up automatically via `generateStaticParams` (re-run build).

**Changing tokens**: read `docs/Tailwind-V4-Validation-Report.md` first; edit `globals.css` `@theme`; run `bun run test:e2e -- mobile-navigation` — the parity spec is the arbiter.

**Commit standard**: atomic Conventional Commits; the gate must be green before push; never bundle unrelated changes.

---

## 10. Known Issues & Deferred Work

- **In-memory rate limiter** — per-instance, resets on restart. Upgrade path: a `LoginAttempt` table or shared store when multi-instance.
- **Google OAuth is inert** — the reference's button renders with an honest no-op (no provider configured); wiring a real provider is additive (route + button handler).
- **"Forgot password" / "Sign up" surface notices only** — mirrors the reference's links without the flows; both disclose their state inline.
- **In-app admin surface absent** — the reference has none either; appointments are readable via the DB. A future admin would follow the `(site)` chrome pattern with an auth-gated group.
- **Static-build status pill** — the footer's "Open/Closed today" text is computed at request/build time on the server (the header's pill is client-live). A cross-midnight-cached static page could show a stale footer label until revalidation; acceptable (the reference recomputes client-side; the header pill covers the live behavior).
- **Map iframe** — the /contact Google Maps embed is the reference's (external, lazy); a self-hosted tile layer would remove the third-party request.
- **Two near-duplicate hero images** — `glossing-treatment` reuses the balayage hero, exactly as the reference does (kept for parity).
