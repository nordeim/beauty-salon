# Maison Luminaire — Beauty Salon

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)
![Tests](https://img.shields.io/badge/tests-73_passing-brightgreen)

A production-grade, self-hosted clone of the **Maison Luminaire** beauty-salon experience — an editorial cream-and-ink marketing site, a Seamless Scheduler booking flow with ICS calendar downloads, and a cookie-session auth surface — rebuilt as a single Next.js application on Prisma/SQLite with byte-parity design tokens.

## Overview

The reference app is a base44 SPA serving a hair / skin / nails salon brand: a seven-section landing page, eight treatment detail pages, a filterable gallery with lightbox, a team page, an about page, a contact page with map, a booking scheduler, and a login surface. This clone reproduces every route, every section's exact class structure, and the reference's computed design tokens (fonts, colors, spacing, motion) — extracted directly from the live DOM — while upgrading the substrate to Next.js 16 App Router with server-rendered pages, typed JSON APIs, and a real database.

## Key Features

| Feature | Description |
|---------|-------------|
| 🎨 **Editorial design system** | Cormorant Garamond + Mulish on warm cream `hsl(44 29% 97%)` with sage secondary and peach accent — every token pinned in Tailwind v4 `@theme` (see [Design System](#design-system)) |
| 📱 **Full-screen mobile menu** | The reference's giant-serif overlay drawer, engineered around the Tailwind v3→v4 `space-y` selector rewrite (flex `gap` + explicit `mt-10`) with computed-style parity pinned by e2e |
| 📅 **The Seamless Scheduler** | Booking form with deep-link preselection (`/book?service=…&stylist=…`), full server-side validation, and a confirmation page that generates RFC 5545 ICS calendar files |
| 🖼️ **Filterable gallery + lightbox** | Twelve works across five categories with keyboard-navigable prev/next lightbox |
| 🔐 **Cookie-session auth** | scrypt password hashing, HMAC-signed httpOnly sessions, rate limiting, no account enumeration — mirrors the reference login surface |
| ✉️ **Newsletter capture** | Idempotent upserts into the database |
| 🚦 **Open/Closed status** | Day-aware "Open today / Closed today" pill with the reference's breathing amber dot |
| 🧪 **Evidence-backed parity** | 33 unit tests + 40 Playwright e2e specs, including computed-style assertions against live-extracted reference measurements |

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router, standalone output) | Server-rendered marketing pages, API routes |
| UI runtime | React 19 | Server Components by default; client islands for interactivity |
| Language | TypeScript 5 (strict) | Type-safe data access + DTOs |
| Styling | Tailwind CSS 4 (CSS-first `@theme`) | Design tokens + `@utility` customs (`tracking-editorial`, `glass`, `prism-gradient`, `breathe`) |
| Fonts | next/font (Cormorant Garamond, Mulish) | Self-hosted — no external font requests |
| Database | Prisma 6 + SQLite | Services, stylists, gallery, testimonials, appointments, subscribers, users |
| Tests | Vitest (unit) + Playwright (e2e, Chromium) | `tests/*.test.ts` + `tests/e2e/*.spec.ts` |
| Runtime | Bun | Install, scripts, seed, standalone server |

## File Hierarchy

```
📂 src/
  📂 app/
    📂 (site)/            Marketing chrome (header + footer) route group
      📄 page.tsx           Landing — 7 sections in contractual order
      📂 services/          Services grid + 8 SSG detail pages
      📂 gallery/ team/ about/ contact/ privacy/ terms/ accessibility/ refund/
    📂 book/               Booking + /book/confirmation (ICS)
    📂 login/              Slate/white auth card
    📂 api/                health · auth/{login,logout,me} · appointments · newsletter
    📄 layout.tsx           Fonts, metadata, <noscript> reveal fallback
    📄 globals.css          Tailwind v4 @theme — traps 1/2/5 pinned here
    📄 not-found.tsx        404 with site chrome
  📂 components/
    📂 layout/             SiteHeader (scroll + drawer), BookHeader, SiteFooter
    📄 Reveal.tsx            IntersectionObserver scroll reveal
    📄 TestimonialCarousel / GalleryExperience / ServicesExperience / BookingForm / LoginForm / StatusPill / LegalPage
  📂 lib/
    📄 content.ts            CLIENT-SAFE DTOs + formatPrice (no db imports)
    📄 data.ts               Server-only Prisma read seam
    📄 auth.ts               scrypt + HMAC sessions + rate limiter
    📄 ics.ts                RFC 5545 ICS builder
    📄 hours.ts              Opening-hours model + status logic
    📄 db.ts / db-path.ts    Prisma client + SQLite path resolution
📂 prisma/                  schema.prisma + seed.ts (reference content)
📂 tests/                   unit (Vitest) + e2e (Playwright)
📂 docs/                    screenshots/, Tailwind-V4 validation report, SSH runbook
📂 public/images/           39 reference images (self-hosted)
```

## Quick Start

Requires **Bun ≥ 1.3** (or Node ≥ 20 with npm equivalents) and an ARM64/x64 POSIX shell.

```bash
bun install
cp .env.example .env          # then set AUTH_SECRET: openssl rand -hex 32
bun run db:push               # create db/custom.db from prisma/schema.prisma
bun run db:seed               # reference content + demo user
bun run dev                   # http://localhost:3000
```

**Verify setup:**

```bash
curl -s localhost:3000/api/health
# {"status":"ok","db":true}

bun run lint && bun run typecheck && bun run test
# eslint clean · tsc clean · 33 tests passed

bun run build && bun run test:e2e
# 27 routes built · 40 e2e specs passed
```

Demo login (seeded): `sepnetflix2023@outlook.com` / `$Abcd1234` (override at seed time with `DEMO_USER_PASSWORD`).

## Environment Variables

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DATABASE_URL` | SQLite file URL | Default `file:../db/custom.db` — resolves against `prisma/schema.prisma` (see `src/lib/db-path.ts`); use an absolute path in production |
| `AUTH_SECRET` | HMAC key for session cookies | Generate with `openssl rand -hex 32`; falls back to a dev-only constant |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin | Used for metadata; defaults to `http://localhost:3000` |
| `DEMO_USER_PASSWORD` | Seed-time demo password | Optional; defaults to the documented demo credential |

## Testing

| Layer | Command | Scope |
|-------|---------|-------|
| Unit | `bun run test` | 33 Vitest tests: db-path resolution, hours model, ICS builder, scrypt/HMAC auth |
| E2E | `bun run test:e2e` | 40 Playwright specs: mobile-navigation parity (the Tailwind v4 trap contract), landing, booking, gallery, auth, 404 |

E2E boots the **production standalone server** on port 3100 with its own scratch database (`db/e2e.db`) — run `bun run build` first. A single spec: `bunx playwright test tests/e2e/mobile-navigation.spec.ts`.

## API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | public | Liveness + DB probe |
| `/api/auth/login` | GET | public | ⚠️ POST — validates credentials, sets `ml_session` cookie |
| `/api/auth/logout` | POST | public | Clears the session cookie |
| `/api/auth/me` | GET | session | Current user or 401 |
| `/api/appointments` | POST | public | ⚠️ Creates a booking (full validation) |
| `/api/newsletter` | POST | public | ⚠️ Idempotent subscribe |

## Design System

- **Type**: Cormorant Garamond (display serif, weights 300–600 + italic) · Mulish (UI sans, 300–600, `font-feature-settings "ss01","cv11"`)
- **Palette** (extracted from the reference's `:root`, pinned as full `hsl()` values in `@theme`): background `hsl(44 29% 97%)` · foreground `hsl(0 0% 10%)` · secondary sage `hsl(134 11% 33%)` · accent peach `hsl(27 48% 84%)` · muted `hsl(40 20% 93%)` · border `hsl(30 15% 86%)`
- **Custom utilities**: `tracking-editorial` (0.22em) · `glass` (cream 60% + blur 20px saturate 140%) · `prism-gradient` (135° three-stop wash) · `breathe` (2.4s status-dot pulse)
- **Motion**: scroll reveal via IntersectionObserver (opacity/blur/translate, 0.9s `cubic-bezier(0.22,1,0.36,1)`), `prefers-reduced-motion` collapses to opacity
- **Chrome**: fixed header (transparent → `glass` on scroll), full-screen mobile drawer at <lg with giant serif links

## The Tailwind v4 Trap Log

Porting the v3-built reference to v4 reproduced five engine-level differences, all documented with fixes in `docs/Tailwind-V4-Validation-Report.md` and pinned by tests:

1. **Bare-HSL transparent theme** — `@theme` tokens must be full `hsl()` values (pinned in `globals.css`)
2. **oklch palette drift** — the reference palette is pinned, not defaulted
3. **oklab gradient interpolation** — the login wash uses the arbitrary sRGB `bg-[linear-gradient(…)]` form
4. **`space-y` selector rewrite** — the mobile drawer uses flex `gap-2` + `mt-10`, engine-stable; computed 48px CTA gap asserted by e2e
5. **`shadow-sm` scale shift** — `--shadow-sm` pinned to the v3 geometry in `@theme inline`

## Deployment

`bun run build` emits `.next/standalone/server.js` (port via `PORT`, DB via `DATABASE_URL` — absolute path recommended). See `docs/DEPLOYMENT.md`. Pushes to the canonical remote use `docs/ssh_git_wrapper_v3.py` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## License

Private project — all rights reserved.
