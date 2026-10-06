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
| Web framework | Next.js (App Router, standalone) | ^16.3.8 | Server-rendered marketing pages with client islands; SSG for the 8 service details; route handlers for the typed JSON API; `output: standalone` for deploy-anywhere. *(Bumped from ^16.1.1 by the owner post-session-12; full gate re-verified green on the bumped stack — session 13.)* |
| UI runtime | React | ^19.3.0 | Required by Next 16; Server Components by default keep the marketing surface JS-light |
| Language | TypeScript (strict) | ^5.9.3 | Compile-time DTO discipline; `noEmit` gate in CI-parity check |
| Styling | Tailwind CSS (CSS-first) | ^4.3.3 | The reference is v3-built; v4 requires the trap-log discipline (§5.5). Tokens in `@theme`, customs in `@utility` — no config file |
| Fonts | next/font (Cormorant Garamond + Mulish) | bundled | Self-hosted; eliminates the reference's external Google Fonts request |
| ORM / DB | Prisma 6 + SQLite | ^6.19.3 | Zero-config local dev; the db-path seam makes one relative URL work for CLI + dev + standalone runtime alike |
| Unit tests | Vitest | ^5.0.3 | Fast, ESM-native, path-alias aware |
| E2E tests | Playwright (Chromium) | ^1.63.0 | Computed-style assertions (the parity contract) need a real browser |
| Runtime / PM | Bun | 1.3.x | Install, scripts, TS seed execution, standalone server host — the sanctioned runtime; the owner-added `package-lock.json` (npm) coexists for npm-based tooling but all documented scripts run through Bun |
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
Layer 3: Domain/lib     — src/lib/content (client-safe DTO+format), data (server reads), auth, ics, hours, seo (the sitemap/robots builders). Rule: pure where possible; every seam unit-tested.
Layer 4: Persistence    — Prisma client (src/lib/db.ts) + db-path resolution. Rule: relative file: URLs resolve through the seam only.
```

**Golden Rule:** dependencies point strictly downward; the only module a client component may import from the data domain is `src/lib/content.ts` (ADR-004).

**The SEO routes (session 17):** `src/app/sitemap.xml/route.ts` + `src/app/robots.txt/route.ts` are Layer 2 GET handlers serving Layer 3's `buildSitemapXml`/`buildRobotsTxt` (— the live reference's curl-measured byte formats: 12 routes, all weekly, priority "1.0"/"0.8", the 4-space indent, no trailing newline; robots allow-all + the Sitemap line). The origin resolves through `siteUrl()` — NEXT_PUBLIC_* vars are INLINED AT BUILD TIME in server bundles (verified: runtime env cannot change the served locs), so the deployment contract is the .env.example one: set NEXT_PUBLIC_SITE_URL before `next build` (the same variable that resolves `metadataBase` — one origin, every surface, baked together). The standard content-types (application/xml / text/plain) are the accepted divergence from the live's text/html platform artifacts.

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
    string status @default("pending")
    datetime createdAt
  }
  NewsletterSubscriber {
    string email UK
    string source
  }
  User {
    string email UK
    string passwordHash "scrypt$salt$hash"
    string name
  }
```

### 4.2 Data Models

DTO shapes live in `src/lib/content.ts` (client-safe). Notable modeling decisions: prices are **integer cents** (`priceCents`) — money never touches floats; `prep` is a JSON-encoded `string[]` (SQLite-friendly, parsed defensively in the read seam); the booking's `date`/`time` are the reference's wire format strings, validated by regex + `Date.parse` at the boundary. **The write-path WIRE schemas are the reference's own (session 14, request-captured): `/api/appointments` accepts the nine-field snake_case Booking entity body (`client_name` … `status`, `""` for unset optionals) and `/api/newsletter` the `{ email, source }` attribution body — mapped to the DB columns at the route boundary (parity at the observable wire edge, substrate freedom behind it; the `status`/`source` columns persist the reference's wire values).**

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

- **Scroll reveal** — `.reveal-hidden` (opacity 0, blur 8px, translateY 24/40/50px by variant) → `.reveal-visible` via IntersectionObserver (threshold 0.1, rootMargin −10%), 0.9s `cubic-bezier(0.22,1,0.36,1)`; `prefers-reduced-motion` renders unrevealed content fully visible with NO transition (the RM-disable stance — session-16 live measurement: the reference ignores RM entirely and runs its full inline-style animation under it, the deliberate divergence); `<noscript>` renders visible.
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
9. **variant-ordering conflicts** — when two utilities set the same custom property under different pseudo-class variants (`focus:ring-slate-400` vs `focus-visible:ring-ring`), v4's compiled ordering picks a different winner than v3's: the byte-identical login input class string renders an ink ring on v4 where the reference's v3 renders slate-400 (session 13; fixed by the scoped `.font-shell input:focus` rule, which out-ranks both utilities; pinned by `tests/e2e/focus-parity.spec.ts`).

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
| Unit | Vitest, `tests/*.test.ts` | 84 | db-path resolution contract (anchor rules + dotenv parsing + dev-time env-file-first precedence); hours model (formats + status per day); ICS builder (envelope, UTC stamps, the fixed 90-minute block, midnight + year-boundary rollover, raw-comma LOCATION + names, data-URI, the no-STATUS/no-TRANSP negative pins + the 13-line field-order census); auth primitives (scrypt round-trip/salt/reject, session round-trip/tamper/expiry); repo hygiene (no retired scaffold-model references; doc/package script references resolve; the tracked-files secret scan — no live AUTH_SECRET material); canonical-origin resolution (`siteUrl` default/blank/malformed/non-absolute fallbacks); the service-detail first-sentence splitter (`. ` boundary, no-boundary, trailing-only, empty) |
| E2E | Playwright, `tests/e2e/*.spec.ts` | 160 | mobile-navigation computed-style parity (traps), login parity (auth shell = default sans stack + the slate-900 sRGB read-back), not-found parity (slate centered card, 72px light slate-300 Cormorant 404, divider, path-interpolated message with the leading slash stripped per the live-measured edge matrix, Go Home button), service-detail parity (first-sentence description H2, check-icon prep grid, exclusive-open FAQ accordion with item 0 default-open, Ready-to-begin dark CTA with the lowercase reserve line, seed-correction read-backs), legal parity (accessibility 8-item checklist + note variant + mt-3 + br coordinator + privacy/terms top-level hoisting + text-correction read-backs), booking parity (nested-grid form + computed 20/40px margins, the Notes placeholder, the Calendar icon, the decoded-ICS fixed 90-minute block + raw commas), icon parity (the lucide class layer on every route — glyph/class-set/computed size-color-margin: the sage testimonial stars, the hover-rotate service arrows, the team `group/btn` named group, the footer + Reach-us phone/mail/instagram sets, the MapPin directions glyph, the login `left-3 text-slate-500` icons, the absent eye toggle), confirmation parity (the flower2 watermark at responsive class sizing + stroke 0.5 + sage/30 oklab channels, the invisible decorative ring, the /contact policy link with its trailing arrow + auto underline offset, the Calendar + innerText contracts), head parity (the declared favicon with the reference's svg-type artifact + the declared-but-dead manifest link), links parity (the services grid's bottom CTA + the time-aware innerText census (1918 + 2 × len(pill text) — session 20), the accessibility article's dead `#` link, the unknown-service "Service not found" state inside the site chrome @200, case-insensitive + trailing-slash routing via `src/proxy.ts`, the landing 32-href + gallery 20-href census sequences, the generic-404 guard), form parity (the control census guards — the book form's 8-control order/types/required flags + option sets, the login input placeholders/ids, the newsletter pill — + the state layer: the fire-and-forget POST-failure behavior (route-aborted newsletter → success; route-aborted booking → the confirmation navigation), the "You're in…" success contract with the sage Check icon, the Sending.../Signing in.../Reserving... loading texts with the arrows always rendered, the login's red Alert error card with the sRGB-pinned red-50/200/700 + oklab bg channels, the non-resizable Notes textarea, the 48/48 date/time input heights — + the wire-payload contracts: the newsletter's `{ email, source: "homepage_15off" }` + the booking's nine-field snake_case schema with `""` empties and `status: "pending"`, raw-postData byte-compares with key order pinned, both against the real API → 201), focus parity (the both-sides focus-ring census — the login inputs' slate-400 ring + the Sign in button's zinc-950 ring on the shell's WHITE offset [the `.font-shell` token scope + the trap-9 variant-ordering fix], the inert `[&_svg]` class variants on the Sign in button, the login input class-string census, the marketing border→ink/no-ring stance + the preserved UA-default outlines), print parity (zero `@media print` author rules in the served CSS — the live's census; the deliberate print-visible stance under print + forced reduced-motion; the mechanism guard proving print media alone reveals nothing), scroll parity (the navigation scroll policy — the kept-and-clamped offset across in-app navigations via scroll={false} on every Link + { scroll: false } on every router.push, the exact browser-native popstate restores read as settled values via expect.poll [both sites' html scroll-behavior: smooth animates them], the top-nav indistinguishability guard, the deep-link query navigation clicked via a dispatched event [Playwright's actionability scrollIntoView would destroy the scrolled origin], and the dead-# link's click semantics — no URL change, no history entry, instant top), focus-order parity (the Tab-walk census — the landing 40-stop / login 6-stop / book 17-stop incl. the native date-time segment stops / services 20-stop sequences, and the drawer's focus layer: toggle focus on open, the 8-stop in-drawer walk, the NO-trap escape to page content, BODY after close — INPUT signatures read the .type property), reduced-motion parity (the screen RM census — the full-visibility stance under reduce, the instant reveal flip, and the no-RM mechanism guard with the 0.9s three-property entrance family read as comma-list computed values), the landing session-10 contracts (the hero settled state — transform/scale none per trap 8, 457×610 @1280, the img at scale 1.08 — + the category images' computed 150ms default-ease hover zoom via the inert `duration-s]` token, with the gallery tiles' 700ms guard), **seo parity (session 17 — the 12-route weekly sitemap under the canonical origin with the 1.0/0.8 priorities + the robots allow-all body + the /contact raw-SSR visibility guard)**, **confirmation-fallback parity (session 17 — the five-probe no/partial-params census: the “Thank you.” paragraph, the date-gated glass card, the now-stamped fallback ICS with the Appointment/you texts)**, **head-boilerplate parity (session 18 — the negative-pin family: zero JSON-LD / og-twitter / PWA metas / canonical links over the four chrome-representative routes; the live’s route-invariant registry artifacts, deliberately not replicated, the absence pinned)**, **authed-state parity (session 19 — the logged-in census: the post-login landing target, the login-renders-when-auth’d stance, the auth-neutral header/drawer/footer with no account affordance, the no-prefill book form, the auth’d 404)**, **status-pill parity (session 20 — the time-aware four-state machine + the session-21 local-clock TIMEZONE stance, SP9/SP10: per-describe `timezoneId` contexts proving the pill renders the visitor’s local day’s state, the LA day-boundary crossing; validated GREEN + sabotage-RED; the e2e seed hermetic against the repo `.env` — `DEMO_USER_PASSWORD` pinned in global-setup, session 21)**, landing structure + carousel rotation + newsletter, booking flow end-to-end (deep links, submission, confirmation, ICS href), gallery (filter counts, lightbox + keyboard), auth (login surface, demo credentials, no-enumeration), route matrix + 404 + team |

E2E runs the **production standalone build** on :3100 against an isolated seeded `db/e2e.db` (global-setup: `db push` + seed), single worker (shared SQLite file), `reuseExistingServer` locally. The gate order — `lint → typecheck → test → build → test:e2e` — is the only CI (no hosted pipelines).

Verification ledger for this release (session 21): lint ✓ (0 errors), typecheck ✓, unit 84/84 ✓, build 29/29 routes ✓ (27 pages + `/sitemap.xml` + `/robots.txt`), e2e **160/160** ✓ (**244 total**), live-parity verification ✓ (the **boundary-timezone sweep** — session-20's suggested candidate 1: a 5-probe Playwright `timezoneId` sweep (UTC · Pacific/Auckland · America/Los_Angeles · Asia/Tokyo · Australia/Sydney) measured the reference's pill and the deployed clone at the same instant and they AGREE at every timezone — the pill reads the VISITOR's local clock (LA renders its local closed Monday while UTC renders Tuesday's before-open state); the **deployment-refresh verification** — session-20's suggested candidate 2: the deployment now runs the session-20 build, the pill's four states + the LIVE minute-tick flip verified on production; and the **deployed-site + reference re-census** — every functional surface green, the landing innerText 2088 == 2088 reference == deployment, the drawer at its pinned computed styles both sides, the capture-diff gate GREEN on the audit environment (14/14)). Session-21 remediation: the timezone stance PINNED (SP9/SP10 in `status-pill-parity.spec.ts` — per-describe `timezoneId` contexts + the controlled clock; validated GREEN against the code and RED under a UTC-methods sabotage of a rebuilt bundle) + the **e2e-seed hermeticity fix** (F21-B: bun auto-loads the repo `.env` into the global-setup's seed child — a production-shaped `.env` (`DEMO_USER_PASSWORD="Abce1234"`) broke `auth.spec.ts` on a fresh `db/e2e.db`, demonstrated RED; the global-setup now pins `DEMO_USER_PASSWORD: "$Abcd1234"` — the same explicit-env defense ADR-002b applies to the dev scripts, one layer up). Lesson: the sweep generalizes the F20-A lesson one axis further — the machine was measured along TIME OF DAY in one timezone, and the visitor-timezone axis was under-sampled; and test infrastructure inherits ambient configuration the same way applications do (the `.env` auto-load that ADR-002b defends the dev scripts against also feeds the e2e seed unless the test layer pins its own contract values).

Verification ledger for this release (session 20): lint ✓ (0 errors), typecheck ✓, unit 84/84 ✓, build 29/29 routes ✓ (27 pages + `/sitemap.xml` + `/robots.txt`), e2e **158/158** ✓ (**242 total**), live-parity verification ✓ (the **deployed-site census** — the task brief's new live deployment at `https://beauty-salon.jesspete.shop/`: every functional surface verified working — all 16 public routes, the proxy's case-insensitive + trailing-slash rewrites, `/api/health` green, the sitemap/robots under the correct canonical origin, the mobile drawer at its pinned computed styles, the login (the seeded demo user) landing on `/`, the booking happy path + the ICS 90-minute block, the newsletter success contract, the gallery lightbox; the **pin-revalidation sweep** — the 404 interpolation, the ICS byte format, the landing/gallery href censuses, the login error + newsletter texts all re-verified holding; and the **pill state-machine re-measurement** — the reference's StatusPill is a TIME-AWARE four-state machine with live minute-granularity updates, found live-observable as a divergence on the deployment). Session-20 remediation: the pill rebuilt to the measured machine — `statusForNow` (the four states, inclusive boundaries, per-day times) + the `useSyncExternalStore` minute-tick store (the static shell renders the pill text empty — the reference's own pre-JS state — and React's post-hydration store check adopts the live-clock state; the 60s tick flips the boundaries live) on every chrome instance incl. the footer (previously a server component baking the build-time state); the footer variant's `text-background/80 text-background/70` pair replicated (the /80 computed winner); 5 new unit contracts + 8 new e2e specs (`status-pill-parity.spec.ts` — the controlled-clock states, the live boundary flips, the footer color); the capture-diff regression gate (`scripts/screenshot-diff.mjs`) delivered + validated GREEN and RED; the canonical set re-captured. Lesson: a pin faithfully guards the rule it encodes — including when the rule was under-sampled (the pill was censused only on closed days and same-text open hours for 17 sessions; the un-measured dimension was TIME OF DAY).

Verification ledger for this release (session 19): lint ✓ (0 errors), typecheck ✓, unit 80/80 ✓, build 29/29 routes ✓ (27 pages + `/sitemap.xml` + `/robots.txt`), e2e **150/150** ✓ (**230 total**), live-parity verification ✓ (the **auth’d links-layer census** — the logged-in walk of the live: post-login lands on `/` (the marketing landing page, the task brief’s “dashboard”), `/login` re-renders the sign-in card when auth’d (no redirect), the header/drawer/footer keep their standard sets with no account/logout affordance, `/book` never prefills, unknown routes keep the standard 404 — probed /account /dashboard /profile /logout /admin /settings; the clone matches everywhere, the invisibility pinned by `authed-state-parity.spec.ts` AS1–AS5; the **font-rendering/capture-convention census** — the standalone + `animations: "disabled"` capture convention measured byte-deterministic: 14/15 hash-identical across two fresh-context passes AND a full rebuild, the contact page’s external Maps iframe the one documented noise class, delivered as `scripts/capture-screenshots.mjs` + the re-captured canonical set; the 404 path interpolation re-measured — a REAL fix). Session-19 remediation: the 404 message’s path interpolation corrected to the live-measured strip rule (strip ONLY the leading slash — nested paths, trailing slashes, and letter case preserved, the query excluded; five live probes; `readAttemptedPath` in `NotFoundBody.tsx`; the session-6 pin carried the leading slash and was corrected with the edge matrix added); 6 new e2e contracts — `authed-state-parity.spec.ts` (AS1–AS5) + the not-found edge matrix; the capture convention switched from dev captures to standalone captures (the executable repo script, `animations: "disabled"` freezing the infinite breathing-dot animation deterministically and fast-forwarding finite reveals to their settled state). Lesson: state-parity is invisible to every census that reads the logged-OUT DOM — the auth’d state overlays every page, and only a logged-in walk can measure what the session changes (answer: nothing on the app surface); and the byte-identity of evidence artifacts is a property of the RENDERING PIPELINE, not the app — the dev server’s font-download raster state and dev-tools overlay made the committed screenshots unreproducible in a fresh environment, while the standalone + animations-disabled pipeline is a pure function of the build (proven by the rebuild experiment); the 404 fix also shows why every pinned value needs periodic live re-measurement — the session-6 pin encoded a leading slash the live never rendered. Historical ledger — session 18: lint ✓ (0 errors), typecheck ✓, unit 80/80 ✓, build 29/29 routes ✓ (27 pages + `/sitemap.xml` + `/robots.txt`), e2e **144/144** ✓ (**224 total**), live-parity verification ✓ (the **structured-data/head census** — the live's two route-invariant JSON-LD registry blocks + its static root-only canonical measured and classified into the rejected platform-boilerplate family, the absence now negatively pinned by `head-boilerplate-parity.spec.ts` HB1–HB4; the **HTTP-header census** — the live's chain serves everything `text/html` with Cloudflare security headers and no caching, deployment-chain artifacts documented in DEPLOYMENT.md §6; the mobile drawer re-measured @390×844 on the live — every pinned computed value exact, no Tailwind v4 regression, click-through + close + the no-Escape asymmetry re-verified). Session-18 remediation: a pin-only session — 4 new negative-pin contracts (HB1 zero JSON-LD · HB2 zero og/twitter · HB3 zero PWA metas · HB4 no canonical, over the four chrome-representative routes) converting the documented head-boilerplate divergence into an executable regression gate; the og/twitter/PWA rejection (session 10) extended by measurement to the JSON-LD + canonical family and pinned. Lesson: a documented divergence is debt until it is pinned — the og/twitter/PWA rejection lived as comment-prose for eight sessions; the JSON-LD census could have landed any of them, but only a negative pin makes the family decision survive an enthusiastic future contributor (the same pin-gap pattern sessions 16/17 applied to focus-order, RM, and the contact SSR guard); and the route-invariance check (does the artifact change across routes?) is the decisive classifier between platform-shell boilerplate and app-authored metadata. Historical ledger — session 17: lint ✓ (0 errors), typecheck ✓, unit 80/80 ✓, build 29/29 routes ✓ (27 pages + `/sitemap.xml` + `/robots.txt`), e2e **140/140** ✓ (**220 total**), live-parity verification ✓ (the five-probe confirmation-fallback census + the sitemap/robots curl census) (the **focus-order/Tab-sequence census** + the **prefers-reduced-motion reveal-timing census** — the two session-15 log's suggested candidates, both landing as pin-gap findings: the focus layer fully at parity but unpinned, the RM screen stance deliberate but unpinned; the mobile drawer re-verified @390×844 both sides — no Tailwind v4 regression, the tap-through + Enter + focus posture all re-verified; the reference verified un-drifted; the Escape-key asymmetry live-measured — the reference's drawer has no Escape-close while its lightbox does). Session-16 remediation: 8 new pin contracts — `focus-order-parity.spec.ts` (FO1–FO5: the landing 40-stop / login 6-stop / book 17-stop incl. the native date-time segment stops / services 20-stop Tab-walks, and the drawer's toggle-focus-on-open + 8-stop walk + no-trap escape + BODY-after-close) + `reduced-motion-parity.spec.ts` (RM1–RM3: the screen-RM full-visibility stance, the instant reveal flip, the no-RM 0.9s entrance-family guard); the a11y-addition family register extended with the live measurements (the reference ignores RM entirely — its JS-driven inline-style reveal animates fully under reduce; its drawer has no Escape-close, no focus trap, no focus restoration); the docs' "collapses to opacity" phrasing corrected to the actual rule (full visibility + no transition). Lesson: focus-ORDER parity is invisible to every census that reads elements in isolation — the focus-RING census (session 13) read focused computed styles one surface at a time, but the ORDER the browser hands focus to them only exists during a Tab walk, and the drawer's trap posture only exists in the walk's escape; likewise the RM reveal-timing layer needed its own emulation axis (screen RM, not just Chromium's forced-RM print pipeline) — the live's rAF-driven inline-style animation carries no CSS transition to read, so the census had to sample the trajectory (0.28@89ms → 0.82@283ms → 1.0@726ms) to prove the motion plays under reduce at all. Historical ledger — session 15: lint ✓ (0 errors), typecheck ✓, unit 66/66 ✓, build 27/27 pages ✓, e2e **125/125** ✓ (**191 total**), live-parity verification ✓ (the **scroll-restoration/popstate census** + the **ICS STATUS/TRANSP census** — the two session-14 log's suggested candidates, the latter already at parity and now negatively pinned; the mobile drawer re-verified @390×844 both sides — no Tailwind v4 regression; the reference verified un-drifted; the dead-#-link click census widened from the same SPA-routing family). Session-15 remediation: the navigation scroll policy rebuilt to the reference's SPA behavior — the offset carries across in-app route swaps and the browser clamps it (live-measured landing@2000 → /services at 1830 = the max scrollable) where the App Router's default reset to top — via `scroll={false}` on every in-app `<Link>` (18 JSX sites across 9 files) + `{ scroll: false }` on every `router.push` (BookingForm confirmation, LoginForm post-login, NotFoundBody Go Home); the popstate restores verified already-exact on both sides (browser-native, `scrollRestoration: 'auto'`); the dead `#` article link's click semantics rebuilt to the reference's router resolution (no URL change, no history entry, instant scroll-to-top — the `DeadHashLink` client island; the browser default appended `#` and pushed an entry); the ICS negative pins added (no STATUS, no TRANSP, the 13-line field-order census — the live capture decoded from the reference's own booking). Lesson: navigation-policy parity is invisible to every census that reads the DOM at rest — the settled DOM, the href census, and the class census all pass identically while the router's scroll/hash policies diverge on interaction; and the scroll census itself carried two instrument traps (the smooth-behavior asynchronous restores — read settled values via expect.poll, not snapshots; and Playwright's actionability scrollIntoView destroying a scrolled origin — click via a dispatched event when the origin IS the contract), plus the false-green trap (an origin exceeding the target's max scrollable lets the clamp cancel the mid-flight reset, transiently passing the assertion — the spec uses the live census's own 2000 origin with settled direct reads). An `overflow-anchor: none` rule was trialed and REMOVED: the "2000 → 63 anchoring" it addressed was a test-mechanics artifact, not app behavior — with a settled origin the production build clamps cleanly to max exactly like the live (423/427 measured). Historical ledger — session 14: lint ✓ (0 errors), typecheck ✓, unit 63/63 ✓, build 27/27 pages ✓, e2e **119/119** ✓ (**182 total**), live-parity verification ✓ (the **wire-payload census** — both write paths' POST bodies request-captured on the reference itself [the booking submission route-aborted, zero writes], plus the **print-stylesheet census** — the two session-13 log's suggested candidates; the mobile drawer re-verified @390×844 both sides — no Tailwind v4 regression; the fire-and-forget contracts re-verified live [a route-aborted booking POST on the reference still navigated to the confirmation]; the reference verified un-drifted). Session-14 remediation: the newsletter POST body gained the reference's `source: "homepage_15off"` attribution (persisted on the new `source` column — the reference stores the field on its NewsletterSubscriber entity, response-echo-verified); the booking POST body rebuilt to the reference's nine-field snake_case Booking entity wire schema (`client_name`/`client_email`/`client_phone`/`service_slug`/`stylist_slug`/`requested_date`/`requested_time`/`notes`/`status`, `""` for unset optionals, `status` always `"pending"`, key order pinned — mapped to the DB columns at the route boundary, `status` persisted on the new column); the print census pinned (zero `@media print` rules both sides — the author layer at parity; the print RENDERING divergence documented as the accepted a11y-family divergence: the reference's inline-style hidden states are media-query-immune so its fresh-load print shows only the repeated fixed header + footer [13 letter pages], while the clone's `.reveal-hidden` class collapses under Chromium's forced-reduced-motion print pipeline and prints the full content [11 pages] — matching would degrade screen a11y or add print rules the live lacks; after a scroll-through both print identically). Lesson: wire-payload parity is invisible to every census that reads the DOM — the control census read attributes, the state census read rendered text, but the JSON body a form POSTs is only observable on the network, and no prior instrument captured it (the session-12 INFO registration of `source` was the first glimpse); the print census splits the same way into the author layer (parity) and the rendering layer (mechanism-driven divergence: inline styles vs classes under media conditions). Historical ledger — session 13: lint ✓ (0 errors), typecheck ✓, unit 63/63 ✓, build 27/27 pages ✓, e2e **114/114** ✓ (**177 total**), live-parity verification ✓ (the first-ever both-sides **focus-ring census** — every interactive surface's focused computed styles on /, /book, /login, and the mobile drawer, the session-12 log's suggested candidate; the mobile drawer re-verified @390×844 both sides — no Tailwind v4 regression; the reference itself verified un-drifted) — on the owner's bumped dependency stack (next ^16.3.8 / prisma ^6.19.3 / react ^19.3.0 / tailwind ^4.3.3 + package-lock.json, commits 3130c44/dceec22). Session-13 remediation: the auth-shell focus rings rebuilt to the live-measured contracts (the login inputs' slate-400 ring `rgb(148,163,184)` + the Sign in button's zinc-950 `rgb(9,9,11)` on the shell's WHITE offset — via the `.font-shell` token scope in globals.css [white `--background`, zinc-950 `--ring`] + the scoped `.font-shell input:focus { --tw-ring-color: #94a3b8 }` rule; TRAP 9 discovered: v4's variant ordering resolves `focus-visible:ring-ring` over `focus:ring-slate-400` where v3 resolves the opposite — byte-identical class strings, divergent computed outcome); the Sign in button's inert `[&_svg]` class variants replicated (the class-parity convention); the committed real AUTH_SECRET redacted from `docs/start_server_log.txt` + the tracked-files secret scan added to repo-hygiene (a live `AUTH_SECRET="<hex32+>"` pattern over `git ls-files`); the ICS year-boundary rollover pinned. Lesson: focus parity is invisible to every census that reads the settled DOM AND to every interaction census that reads only text/state — the ring only exists on :focus/:focus-visible, and prior instruments never read computed styles while focused; trap 9 sharpens the session-7 lesson — class-string parity does NOT imply computed parity when two utilities set the same custom property under different variants and the engines order them differently. Historical ledger — session 12: lint ✓ (0 errors), typecheck ✓, unit 61/61 ✓, build 27/27 pages ✓, e2e **104/104** ✓ (**165 total**), live-parity verification ✓ (the first-ever both-sides **form-control census** — every input/select/textarea/label on every form-bearing route (/ , /book, /login, /contact) with their option sets + computed metrics, plus the POST-failure behavior of all three forms — the two session-11 suggested candidates; the mobile drawer re-verified @390×844 both sides — no Tailwind v4 regression). Session-12 remediation: the newsletter success state rebuilt to the live-measured contract (the sage `inline-flex items-center gap-3 text-[11px] uppercase tracking-editorial text-secondary` row with the lucide `Check h-4 w-4` and the text " You're in. Check your inbox for your 15% code." — the clone's "Welcome to the atelier" text had been authored, never measured); both POST forms made fire-and-forget per the reference's deobfuscated bundle (the newsletter's `catch → success` — no error UI exists anywhere in its 581KB chunk; the booking's `try { POST } catch {} → always navigate`; the clone's error UIs removed, the API validation retained); the loading states corrected ("Sending...", "Signing in...", "Reserving..." — ASCII dots — with the submit arrows rendered in both states and the login inputs disabled while loading); the login error surface rebuilt as the reference platform's shadcn Alert card (bg-red-50/70 border-red-200 rounded-xl + the inert [&>svg] variants, inner text-red-700, "Invalid email or password" with no trailing period; the red-50/200/700 tokens pinned to sRGB in @theme — the trap-6 slate precedent); the Notes textarea's `resize-none` added; the date/time inputs' +2px height replicated (`::-webkit-datetime-edit { padding: 1px 0 }` — the reference's UA-intrinsic content height, mechanism unattributable after exhaustive elimination: no author CSS, no font, no transform, no !important, no shadow DOM, reproduced by a fresh all:initial input on the reference's page but not the clone's, same browser session). Engine fact recorded: React omits the default type="text" attribute (the reference's DOM is identical — attribute selectors match nothing; the census reads the .type property). Lesson: state-parity is invisible to every census that reads the settled DOM — a form's loading text, success state, and failure behavior only exist after interaction, and no prior instrument ever submitted a live form and read back what rendered (F3/F4/F5/F7–F9); the +2px date/time height is the session-10 pattern at a finer grain (identical computed styles, different rendered heights — the difference lives below getComputedStyle(input), in the UA's inner editor). Each got its own instrument: form-parity.spec.ts's interaction-driven contracts (route-abort + delayed-fulfill interception). Historical ledger — session 11: lint ✓ (0 errors), typecheck ✓, unit 61/61 ✓, build 27/27 pages ✓, e2e **92/92** ✓ (**153 total**), live-parity verification ✓ (the first-ever both-sides **links/redirect census** — every `<a href>` on all 16 routes: 14/16 identical; the routing edge matrix — case variants, trailing slashes, unknown slugs, unknown categories; the login OAuth surface measured; the mobile drawer re-verified @390×844 both sides + tap-through). Session-11 remediation: the services grid's bottom CTA added (the `mt-20 text-center` wrapper + `a.inline-block` → the standard dark pill "Book an appointment" — the live's `pb-28` section has two children, the clone rendered one; services innerText now 1942 = the live exact, was 1922); the accessibility article title wrapped in the reference's own dead `#` link (`underline hover:text-foreground`, via the new `LegalPBlock.link` inline-link field — the sentence text unchanged); the unknown-service "Service not found" state added (a dedicated `pt-40 px-6 max-w-3xl mx-auto text-center` section inside the site chrome, HTTP 200, title `Services | Beauty Salon` — replacing the `notFound()` fallthrough to the generic slate 404; a deliberate soft-404-for-parity, the reference behaves identically); case-insensitive routing + trailing-slash preservation added (`src/proxy.ts` — the Next 16 **proxy** convention, the `middleware` filename being deprecated — rewriting, never redirecting: uppercase paths lowercase (except `/services/…` slugs, whose case is preserved so case-variant slugs still render the Service-not-found state, the reference's exact split behavior); trailing slashes rewrite to slashless with `skipTrailingSlashRedirect: true`, because the router's 308 fires BEFORE the proxy — both verified live-measured engine facts). The OAuth button's live contract measured precisely for the first time (base44 platform OAuth: client_id 185178814199-…, redirect_uri app.base44.com/api/apps/auth/callback, state carrying the reference's domain/app_id) — the clone's inert-button stance re-verified correct (replicating would authenticate the clone's users against the reference's own platform app) and now documented with the measurement. Lesson: the session-10 rule generalizes — innerText parity is blind to link MARKUP (F2's divergence sits inside a text-identical paragraph) and route-matrix parity is blind to the router's RESOLUTION behavior (both sites "have" `/services/[slug]`, but the SPA resolves case-insensitively and falls back in-page); each needs its own census instrument (the href enumeration + the routing edge matrix), now pinned by links-parity.spec.ts. Historical ledger — session 10: lint ✓, typecheck ✓, unit 61/61 ✓, build 27/27 ✓, e2e 81/81 ✓ (142 total); remediation: the confirmation decorative layer rebuilt (flower2 watermark + the invisible ring + the /contact policy link), the hero settled state replicated (TRAP 8: v4's scale utilities write the individual `scale` property — `transform: none` alone cannot neutralize them), the category images' 150ms default-ease hover, the head layer (favicon + the dead manifest link). Lesson: the head layer and the settled-state transform layer were structurally invisible to every instrument reading document.body — each got its own extraction pass + read-back contract. Session 9: lint ✓, typecheck ✓, unit 61/61 ✓, build 27/27 ✓, e2e 70/70 ✓ (131 total); remediation: the icon class layer rebuilt to the reference's class-sizing convention across 12 files (the sage testimonial stars; the gallery-preview hover icons at 24px with opacity-0 group-hover:opacity-100; the services arrows' group-hover:rotate-45 hover animation; the team buttons' named group/btn + arrow-up-right; the footer + contact Reach-us phone/mail/instagram icons; the MapPin directions glyph; the login icons at left-3 text-slate-500 + the password eye toggle REMOVED as an undocumented visible divergence); the contact Hours section restructured to the reference's flex items-center justify-between mb-4 row with the StatusPill. Lesson: innerText parity is blind to the icon layer — svg class sets, glyphs, and hover behaviors need their own extraction pass + read-back contracts (icon-parity.spec.ts); the session-8 Calendar finding was a single instance of this whole unmeasured layer. Session 8: lint ✓, typecheck ✓, unit 61/61 ✓, build 27/27 pages ✓, e2e 62/62 ✓ (123 total), live-parity verification ✓ (mobile drawer both sides; booking form structure + validation branches + deep links + happy-path submissions both sides; the ICS download decoded on both sides — fixed 90-minute block + raw commas now byte-parity; gallery lightbox keyboard + filter scoping both sides). Session-8 remediation: the ICS contract rebuilt to the live-measured download (fixed 90-minute event block replacing the service-duration DTEND; raw-comma LOCATION/names replacing RFC 5545 escaping; the confirmation page's dead `getService` lookup removed); the booking form rebuilt to the reference's DOM (block-level glass card + nested 2-col grid + the Notes label/button row as outside block siblings with mt-5/mt-10; the Notes placeholder added); the Add-to-calendar icon corrected to lucide `Calendar` at h-4 w-4; the GalleryGrid doc-name drift fixed (README/PAD). Lesson: the session-6 read-back rule extends to downloads — an ICS href was regex-checked for `balayage` presence for six green sessions while its payload was never decoded against the reference. Session 7: lint ✓, typecheck ✓, unit 60/60 ✓, build 27/27 ✓, e2e 58/58 ✓ (118 total); remediation: the service detail pages rebuilt to the reference's six-section contract (the first-sentence description H2 via `firstSentence`; the check-icon prep grid; the exclusive-open `FaqAccordion` island + per-service FAQ data as a `faqs` JSON column; the Ready-to-begin dark CTA; three session-1 longDescription transcription errors corrected); the legal pages rebuilt on the `LegalBlock` model (the accessibility 8-item checklist, the note variant, mt-3 in-section spacing, the br coordinator block, privacy/terms top-level paragraph hoisting; three transcription errors corrected); trap 7 discovered + documented (v4's opacity modifier serializes as `oklab(L a b / α)` where the reference's v3 emitted `rgba()` — pixels identical; the specs assert resolved channels; this also revealed the login input's `bg-slate-50/50` had always computed oklab — a session-6 verification blind spot, now documented). Session 6: lint ✓, typecheck ✓, unit 55/55 ✓, build 27/27 ✓, e2e 46/46 ✓ (101 total); remediation: the trap-6 slate-900 digit corrected (`#0f172e` → `#0f172a`) + the login-parity read-back contract (lesson: every pinned value needs a test that reads it back). Session 5: lint ✓, typecheck ✓, unit 55/55 ✓, build 27/27 ✓, e2e 45/45 ✓; remediation: the 404 surface rebuilt to the live-measured reference contract (slate centered card; `src/components/NotFoundBody.tsx` island reading `window.location` via `useSyncExternalStore`, pinned by `tests/e2e/not-found-parity.spec.ts`); the slate scale pinned to the reference's sRGB hex in `@theme` (trap 6); the clone-authored 404 assertions in `auth.spec.ts` corrected to the live contract. Session 4: lint ✓, typecheck ✓, unit 55/55 ✓, build 27 routes ✓, e2e 42/42 ✓, live parity byte-identical (drawer, login font chain, landing tokens, 8/8 services); remediation: 14 pre-clone scaffold scripts removed, `NEXT_PUBLIC_SITE_URL` wired to `metadataBase` via `src/lib/site.ts`, DEPLOYMENT.md pre-clone remnants corrected. Session 3: lint ✓, typecheck ✓, unit 47/47 ✓, build 27 routes ✓, e2e 42/42 ✓, auth-shell font parity fix (`font-shell` utility, pinned by `tests/e2e/login-parity.spec.ts`).

---

## 8. Build, Deployment & Operations

- **Build**: `bun run build` → `.next/standalone/server.js` (+ static assets copied by the package script). 29 routes (27 pages + the two SEO routes); 8 service pages pre-rendered from DB rows at build time (DB required at build).
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
