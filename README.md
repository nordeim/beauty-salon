# Maison Luminaire — Beauty Salon

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)
![Tests](https://img.shields.io/badge/tests-244_passing-brightgreen)

A production-grade, self-hosted clone of the **Maison Luminaire** beauty-salon experience — an editorial cream-and-ink marketing site, a Seamless Scheduler booking flow with ICS calendar downloads, and a cookie-session auth surface — rebuilt as a single Next.js application on Prisma/SQLite with byte-parity design tokens.

## Overview

The reference app is a base44 SPA serving a hair / skin / nails salon brand: a seven-section landing page, eight treatment detail pages, a filterable gallery with lightbox, a team page, an about page, a contact page with map, a booking scheduler, and a login surface. This clone reproduces every route, every section's exact class structure, and the reference's computed design tokens (fonts, colors, spacing, motion) — extracted directly from the live DOM — while upgrading the substrate to Next.js 16 App Router with server-rendered pages, typed JSON APIs, and a real database.

## Key Features

| Feature | Description |
|---------|-------------|
| 🎨 **Editorial design system** | Cormorant Garamond + Mulish on warm cream `hsl(44 29% 97%)` with sage secondary and peach accent — every token pinned in Tailwind v4 `@theme` (see [Design System](#design-system)) |
| 📱 **Full-screen mobile menu** | The reference's giant-serif overlay drawer, engineered around the Tailwind v3→v4 `space-y` selector rewrite (flex `gap` + explicit `mt-10`) with computed-style parity pinned by e2e |
| 📅 **The Seamless Scheduler** | Booking form with deep-link preselection (`/book?service=…&stylist=…`), the reference's exact field structure (nested 2-column grid + outside Notes/CTA rows) and Notes placeholder, full server-side validation, and a confirmation page that generates the reference's ICS calendar download — a **fixed 90-minute event block** with raw-comma text, byte-parity with the live `.ics` (pinned by `tests/e2e/booking-parity.spec.ts`) |
| 🖼️ **Filterable gallery + lightbox** | Twelve works across five categories with keyboard-navigable prev/next lightbox |
| 🔐 **Cookie-session auth** | scrypt password hashing, HMAC-signed httpOnly sessions, rate limiting, no account enumeration — and the reference auth shell's own font **and token** context (Tailwind's default stack + the shell's white `--background` / zinc-950 `--ring`, pinned by e2e) |
| ✨ **The icon layer** | Every lucide icon mirrors the reference's exact class set — class-based sizing (`h-4 w-4`…), the sage testimonial stars, hover-rotate arrows under named groups (`group/btn`), the footer/contact phone-mail-instagram icons, and the MapPin directions link — censused live on both sides and pinned by e2e |
| 🌸 **The confirmation watermark + settled states** | The reference's large pale `flower2` watermark (responsive class sizing, stroke 0.5, sage/30) over an invisible decorative ring, and the landing hero's animation-settled proportion (the `scale-125` class neutralized at rest — the Tailwind v4 individual-`scale` trap) — both live-measured and pinned by e2e |
| 🧭 **The head layer** | The reference's declared favicon (the self-hosted logo, with the reference's own svg-type artifact) and its declared-but-dead manifest link — the one browser-visible `<head>` surface, pinned by e2e — plus the **negatively pinned platform-boilerplate family** (zero JSON-LD, zero og/twitter/PWA metas, no canonical link: the live's registry-injected blocks are route-invariant shell artifacts, and its root-only canonical would be SEO-harmful on SSR — measured + rejected + pinned by e2e) |
| 📡 **The HTTP-header census** | The serving layer measured on both sides: the live's chain serves everything `text/html` (the SPA fallback — even sitemap/robots/images-on-origin) with Cloudflare security headers and no caching; the clone serves standard content-types + substrate-native caching, with the security-header chain belonging to its deployment edge (documented in DEPLOYMENT.md §6) |
| 🔐 **The auth'd-state census** | The logged-in walk of the reference (session 19): its auth'd state is **invisible on the app surface** — post-login lands on `/` (the marketing landing page), `/login` re-renders the sign-in card when auth'd, the header/drawer/footer keep their standard sets with no account/logout affordance, `/book` never prefills, and unknown routes keep the standard 404. The clone matches everywhere (auth-neutral chrome) — pinned by `tests/e2e/authed-state-parity.spec.ts` |
| 🔗 **The links layer + SPA routing behavior** | Every route's `<a href>` census verified both sides (the services grid's bottom `Book an appointment` CTA, the accessibility article's dead `#` link), the reference's dedicated **"Service not found"** state for unknown slugs (inside the site chrome, HTTP 200 — not the generic 404), and its **case-insensitive route matching + trailing-slash preservation** (a `src/proxy.ts` rewrite — the Next 16 proxy convention) — pinned by `tests/e2e/links-parity.spec.ts`
| 📝 **The form-control layer + the POST-failure states** | Every input/select/textarea/label censused both sides (placeholders, ids, option sets, computed metrics), plus the state layer no settled-DOM census could see: the reference's fire-and-forget forms (**POST failures render success** — the newsletter's `catch → success`, the booking's swallow-and-navigate), its success/loading texts (`You're in. Check your inbox…` · `Sending...` · `Signing in...` · `Reserving...` with the arrow always rendered), the login's red shadcn Alert error card (the red scale pinned to sRGB — trap 6), the non-resizable Notes textarea, and the date/time inputs' UA-intrinsic +2px height (`::-webkit-datetime-edit` padding) — pinned by `tests/e2e/form-parity.spec.ts` |
| ⌨️ **The focus-ring layer** | Every interactive surface's **focused** computed styles censused both sides — the marketing surface's border→ink with no ring and the preserved UA-default outlines, and the auth shell's slate-400 input ring / zinc-950 button ring on a white offset (the platform shell's token context — trap 9: byte-identical class strings that resolve differently across the v3/v4 engines) — pinned by `tests/e2e/focus-parity.spec.ts` |
| 📡 **The wire-payload layer** | The JSON bodies the forms POST, censused on the reference itself via request capture — the newsletter's `{ email, source: "homepage_15off" }` attribution and the booking's nine-field snake_case entity schema (`client_name` … `status: "pending"`, `""` for unset optionals, key order included), both persisted (the `source`/`status` columns) — pinned by `tests/e2e/form-parity.spec.ts` |
| 🖱️ **The navigation scroll policy + the dead-# click** | The reference's SPA router never resets scroll on in-app navigation — the offset carries across route swaps and the browser clamps it to the target page's height (live-measured: landing@2000 → /services lands at 1830, the page's max scrollable), while popstate restores are browser-native and exact on both sides — replicated via `scroll={false}` on every in-app `<Link>` + `{ scroll: false }` on every `router.push`, pinned by e2e; plus the dead `#` article link's click semantics (no URL change, no history entry, instant scroll-to-top — the reference's router resolving `#` to the current path, replicated by the `DeadHashLink` island) |
| 🖨️ **The print-media layer** | The `@media print` census — zero print rules on both sides (pinned), and the deliberate print-visible stance: the reference's unrevealed animation content stays invisible in print (inline-style hidden states are media-query-immune) while the clone's reduced-motion full-visibility rule fires under Chromium's forced-RM print pipeline (the a11y-addition family, documented accepted divergence) — pinned by `tests/e2e/print-parity.spec.ts` |
| ⌨️ **The focus-order layer** | Every interactive surface's **Tab-walk sequence** censused live on both sides — the landing's 40 stops, the login's 6, the booking form's 17 (including the native date/time inputs' internal segment stops — browser-native, identical), the services grid's 20, and the mobile drawer's 8-stop walk with **no focus trap on either side** (focus escapes to the page content behind the overlay — the reference's own posture, replicated) plus toggle-focus-on-open and BODY-after-close — pinned by `tests/e2e/focus-order-parity.spec.ts` |
| 🕊️ **The reduced-motion layer** | The `prefers-reduced-motion` reveal-timing census, live-measured: the reference **ignores RM entirely** (its JS-driven inline-style reveal runs the full opacity/blur/translate animation under RM — media-query-immune, no RM branch), while the clone's RM rule renders unrevealed content **fully visible with no transition** — the deliberate a11y stance (the print-visible family), now pinned on the **screen** axis too by `tests/e2e/reduced-motion-parity.spec.ts` |
| 🗺️ **The SEO layer** | The reference's sitemap/robots census (curl-measured): a 12-route `sitemap.xml` (all `weekly`, priority 1.0 for `/` and 0.8 for the rest, the reference's exact 4-space-indented byte format) and a `robots.txt` allowing all + pointing at the sitemap — served from the `NEXT_PUBLIC_SITE_URL` canonical-origin seam (build-time-baked, the same variable that resolves `metadataBase`), pinned by `tests/e2e/seo-parity.spec.ts` + `tests/seo.test.ts` |
| 🧾 **The confirmation-fallback layer** | The no/partial-params `/book/confirmation` census (five live probes): "Thank you." without the name-comma artifact, the Reserved-for glass card **omitted** without a date (its time/service lines render iff present), and the Add-to-calendar ICS falling back to now-stamps (`DTSTART = DTSTAMP`, `DTEND` +90min) with the "Appointment"/"you" textual fallbacks — pinned by `tests/e2e/confirmation-fallback-parity.spec.ts` + the `tests/ics.test.ts` fallback block |
| ✉️ **Newsletter capture** | Idempotent upserts into the database (with the reference's `homepage_15off` source attribution persisted) |
| 🚦 **Time-aware status pill** | The reference's four-state machine, live-measured with a controlled clock: "Opens today at 10:00" before opening, "Open · closes 19:00" during (U+00B7), "Closed for the day" after close, "Closed today" on closed days — flipping LIVE at minute granularity on every chrome instance (header, footer, the contact Hours row) via the `useSyncExternalStore` minute-tick store (`statusForNow`), pinned by e2e — **including the local-clock TIMEZONE stance** (the session-21 5-timezone sweep: the pill renders the visitor's local day's state, the LA day-boundary crossing pinned by SP9/SP10) |
| 📸 **The capture-diff regression gate** | `scripts/screenshot-diff.mjs` re-runs the canonical capture instrument into a temp dir and hash-diffs it against `docs/screenshots/` — a visual-drift tripwire complementing the computed-style specs (14/15 byte-comparable; the contact page's external map excluded as the documented noise class; exit 1 on drift) |
| 🧪 **Evidence-backed parity** | 84 unit tests + 160 Playwright e2e specs, including computed-style assertions against live-extracted reference measurements (mobile drawer, login font context + slate-900 read-back, the 404 slate card, the service detail FAQ/CTA surfaces, the legal page structure, the booking form structure + decoded-ICS contract, the icon layer — glyph/class/size/color on every route, the confirmation decorative layer + policy link, the hero settled state, the head layer, the links/routing census — href sequences, the unknown-service state, case-insensitive routing — the form-control census + the loading/success/failure states, the focus-ring census, the wire payloads, the print media, the focus-order Tab-walk census, the reduced-motion reveal-timing stance, the sitemap/robots SEO census, the confirmation no-params fallback, the head-boilerplate absence family, the auth'd-state census — the logged-in chrome neutrality, and the time-aware status-pill state machine incl. its local-clock timezone stance) |

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router, standalone output) | Server-rendered marketing pages, API routes |
| UI runtime | React 19 | Server Components by default; client islands for interactivity |
| Language | TypeScript 5 (strict) | Type-safe data access + DTOs |
| Styling | Tailwind CSS 4 (CSS-first `@theme`) | Design tokens + `@utility` customs (`tracking-editorial`, `glass`, `prism-gradient`, `breathe`) |
| Fonts | next/font (Cormorant Garamond, Mulish) | Self-hosted — no external font requests |
| Database | Prisma 6 + SQLite | Services (with FAQ accordion data), stylists, gallery, testimonials, appointments, subscribers, users |
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
    📄 TestimonialCarousel / GalleryGrid / ServicesExperience / BookingForm / LoginForm / StatusPill / LegalPage
  📂 lib/
    📄 content.ts            CLIENT-SAFE DTOs + formatPrice (no db imports)
    📄 data.ts               Server-only Prisma read seam
    📄 auth.ts               scrypt + HMAC sessions + rate limiter
    📄 ics.ts                ICS builder (the reference's fixed 90-minute block)
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
bun run db:push               # create db/custom.db at the repo root
bun run db:seed               # reference content + demo user
bun run dev                   # http://localhost:3000
```

The `db:push` / `db:seed` / `dev` / `build` / `start` scripts run through `scripts/with-repo-db.ts`, which resolves `DATABASE_URL` from the repo's own `.env` — so the database always lands at `<repo>/db/custom.db`, even in sandboxed shells that export an ambient absolute `DATABASE_URL` (process env normally beats `.env` files). Production keeps standard env-var precedence.

**Verify setup:**

```bash
curl -s localhost:3000/api/health
# {"status":"ok","db":true}

bun run lint && bun run typecheck && bun run test
# eslint clean · tsc clean · 84 tests passed

bun run build && bun run test:e2e
# 29 routes built · 160 e2e specs passed
```

The canonical screenshot set (`docs/screenshots/`) is captured from the **standalone production server** — not the dev server — via `bun scripts/capture-screenshots.mjs` (boots the build on :3200 through the `with-repo-db.ts` wrapper, fresh browser contexts, `animations: "disabled"`). The convention is byte-deterministic: the same build reproduces 14/15 captures hash-identically across passes and rebuilds (the contact page alone embeds the external Google Maps iframe — the one documented noise class, equally non-deterministic on the live reference). The **capture-diff regression gate** (`bun scripts/screenshot-diff.mjs`, run after a build on the same environment that captured the set) turns that signal into a visual-drift tripwire: it re-captures into a temp dir, hash-diffs against the committed set, and exits non-zero on drift.

Demo login (seeded): `sepnetflix2023@outlook.com` / `$Abcd1234` (override at seed time with `DEMO_USER_PASSWORD`).

## Environment Variables

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DATABASE_URL` | SQLite file URL | Default `file:../db/custom.db` — resolves against `prisma/schema.prisma` (see `src/lib/db-path.ts`); use an absolute path in production. Note: an ambient `DATABASE_URL` env var beats `.env` — the wrapped dev scripts defend against that (see Quick Start) |
| `AUTH_SECRET` | HMAC key for session cookies | Generate with `openssl rand -hex 32`; falls back to a dev-only constant |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin | Resolves the app's `metadataBase` (`src/lib/site.ts`); falls back to `http://localhost:3000` when unset or malformed |
| `DEMO_USER_PASSWORD` | Seed-time demo password | Optional; defaults to the documented demo credential |

## Testing

| Layer | Command | Scope |
|-------|---------|-------|
| Unit | `bun run test` | 84 Vitest tests: db-path resolution (anchor rules, dotenv parsing, dev-time env-file-first precedence), hours model (the time-aware four-state pill status — the boundary minutes, the per-day windows, the U+00B7 glyph), ICS builder (the fixed 90-minute block, midnight + year-boundary rollover, raw-comma LOCATION + names, the no-params now-stamp fallback), scrypt/HMAC auth, repo hygiene (retired-model scan + script-reference guards + the tracked-files secret scan), canonical-origin resolution, the service-detail first-sentence splitter, the sitemap/robots byte-format builders |
| E2E | `bun run test:e2e` | 160 Playwright specs: mobile-navigation parity (the Tailwind v4 trap contract), login parity (the auth shell’s default font stack + the slate-900 sRGB read-back), not-found parity (the reference’s slate centered 404 card with the attempted path interpolated minus its leading slash — the live-measured strip rule with its edge matrix), service-detail parity (the first-sentence description heading, the check-icon prep grid, the exclusive-open FAQ accordion, the Ready-to-begin CTA), legal parity (the accessibility checklist + note/mt-3/br conventions, the privacy/terms top-level paragraph hoisting), booking parity (the nested-grid form + computed margins, the Notes placeholder, the Calendar icon, the decoded-ICS fixed 90-minute block), **icon parity (the lucide class layer on every route — glyph, class set, computed size/color/margin, the sage stars, the hover-rotate arrows, the footer/contact/reach-us icon sets, the MapPin directions link, the login icon contract + the absent eye toggle)**, **confirmation parity (the flower2 watermark at responsive class sizing + stroke 0.5, the invisible decorative ring, the /contact policy link with its trailing arrow, the Calendar + innerText contracts)**, **head parity (the declared favicon + the declared-but-dead manifest link)**, **links parity (the links/routing census — the services grid’s bottom CTA, the accessibility article’s dead `#` link, the unknown-service “Service not found” state, case-insensitive + trailing-slash routing via `src/proxy.ts`, the landing/gallery href sequences)**, **form parity (the control census + the state layer — the fire-and-forget newsletter + booking POST-failure behavior, the “You’re in…” success contract with the sage Check icon, the Sending…/Signing in…/Reserving… loading texts with the arrow always rendered, the red Alert login error card with the sRGB-pinned red scale, the non-resizable Notes textarea, the 48px date/time inputs, the census guards, and the wire-payload contracts — the newsletter’s `source: "homepage_15off"` + the booking’s nine-field snake_case schema with `status: "pending"`)**, **focus parity (the both-sides focus-ring census — the login inputs’ slate-400 ring + the Sign in button’s zinc-950 ring on the shell’s white offset [trap 9], the marketing surface’s border→ink + no-ring stance + the preserved UA-default outlines, the class census guards)**, **print parity (the @media print census — zero print rules both sides; the deliberate print-visible stance under Chromium’s forced-reduced-motion print pipeline, with the mechanism guard)**, **focus-order parity (the Tab-walk census — the landing’s 40-stop / login 6-stop / book 17-stop incl. the native date/time segment stops / services 20-stop sequences, and the drawer’s focus layer: toggle focus on open, the 8-stop walk, the no-trap escape, BODY after close)**, **reduced-motion parity (the screen RM census — the full-visibility stance, the instant reveal flip, and the no-RM mechanism guard with the 0.9s entrance family)**, **seo parity (the sitemap/robots census — the 12-route weekly sitemap under the canonical origin, the robots allow-all + sitemap line, and the /contact raw-SSR visibility guard)**, **confirmation-fallback parity (the no/partial-params census — the "Thank you." paragraph, the omitted glass card, the conditional time/service lines, and the now-stamped fallback ICS with the Appointment/you texts)**, **head-boilerplate parity (the negatively pinned platform-registry family — zero JSON-LD, zero og/twitter/PWA metas, no canonical link, over the four chrome-representative routes; the live's registry-injected blocks are route-invariant shell artifacts, measured session 18)**, **authed-state parity (the logged-in census — the post-login landing target, the login-renders-when-auth'd stance, the auth-neutral header/drawer/footer with no account affordance, the no-prefill book form, and the auth'd 404)**, **status-pill parity (the time-aware four-state machine — the controlled-clock on-load states, the per-day open/close times, the LIVE open/close/midnight boundary flips via the 60s tick, the footer variant's /80 color winner, and the local-clock TIMEZONE stance — SP9/SP10, the session-21 boundary-timezone sweep pin: per-describe `timezoneId` contexts prove the pill renders the VISITOR's local day's state, validated both GREEN and against a UTC-methods sabotage RED)**, the landing hero settled state (the scale-125 class neutralized — the v4 individual-scale trap — with the img at 1.08) + the category images’ computed 150ms default-ease hover zoom, landing, booking flow, gallery, auth, route matrix, team |

E2E boots the **production standalone server** on port 3100 with its own scratch database (`db/e2e.db`) — run `bun run build` first. A single spec: `bunx playwright test tests/e2e/mobile-navigation.spec.ts`. The e2e seed is **hermetic against the repo `.env`** (session 21): the global-setup pins `DEMO_USER_PASSWORD` to auth.spec's documented credential — bun's dotenv auto-load cannot leak a production-shaped `.env` into the e2e database (the fresh-DB trap, demonstrated RED then fixed).

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
- **Three font contexts**: marketing + booking run the brand system (body Mulish, `h1–h5` Cormorant via a global base rule that mirrors the reference’s own); the auth shell (`/login`) renders in Tailwind’s **default sans stack** with default feature settings — the reference’s login is a separate CSS context that never loads the brand fonts (`font-shell` utility, pinned by `tests/e2e/login-parity.spec.ts`)
- **Palette** (extracted from the reference's `:root`, pinned as full `hsl()` values in `@theme`): background `hsl(44 29% 97%)` · foreground `hsl(0 0% 10%)` · secondary sage `hsl(134 11% 33%)` · accent peach `hsl(27 48% 84%)` · muted `hsl(40 20% 93%)` · border `hsl(30 15% 86%)`
- **Custom utilities**: `tracking-editorial` (0.22em) · `glass` (cream 60% + blur 20px saturate 140%) · `prism-gradient` (135° three-stop wash) · `breathe` (2.4s status-dot pulse)
- **Motion**: scroll reveal via IntersectionObserver (opacity/blur/translate, 0.9s `cubic-bezier(0.22,1,0.36,1)`), `prefers-reduced-motion` renders content fully visible with no transition
- **Chrome**: fixed header (transparent → `glass` on scroll), full-screen mobile drawer at <lg with giant serif links

## The Tailwind v4 Trap Log

Porting the v3-built reference to v4 reproduced nine engine-level differences, all documented with fixes in `docs/Tailwind-V4-Validation-Report.md` and pinned by tests:

1. **Bare-HSL transparent theme** — `@theme` tokens must be full `hsl()` values (pinned in `globals.css`)
2. **oklch palette drift** — the reference palette is pinned, not defaulted
3. **oklab gradient interpolation** — the login wash uses the arbitrary sRGB `bg-[linear-gradient(…)]` form
4. **`space-y` selector rewrite** — the mobile drawer uses flex `gap-2` + `mt-10`, engine-stable; computed 48px CTA gap asserted by e2e
5. **`shadow-sm` scale shift** — `--shadow-sm` pinned to the v3 geometry in `@theme inline`
6. **oklch palette serialization** — the slate scale is pinned to the reference's sRGB hex in `@theme` so computed-color assertions are deterministic (session 5; the slate-900 digit corrected + read-back contract added session 6), as are the login error card's red-50/200/700 (session 12 — `form-parity.spec.ts` reads them back)
7. **opacity-modifier serialization** — v4's `/α` modifier emits `color-mix(in oklab, …)`, which Chrome reports as `oklab(L a b / α)` where v3 emitted `rgba(r, g, b, α)` (e.g. `bg-slate-50/50`, `text-foreground/75`); pixels are identical, so the parity specs assert the resolved lightness + alpha channels, not the string (session 7)
8. **individual-transform properties** — v4's `scale-*` utilities write the INDIVIDUAL CSS `scale` property, not `transform`, so a v3-era inline `transform: none` does not neutralize them: the landing hero's settled state needs `scale: none` alongside the reference's own inline `transform: none` (session 10; likewise v4's `transition-transform` transitions `transform, translate, scale, rotate` where v3 transitioned `transform`)
9. **variant-ordering conflicts** — when two utilities set the same custom property under different pseudo-class variants (`focus:ring-slate-400` vs `focus-visible:ring-ring`), v4's variant ordering picks a different winner than v3's did: the byte-identical login input class string renders an ink ring on v4 where the reference's v3 renders slate-400 (session 13; the fix pins the outcome via the scoped `.font-shell input:focus` rule — `tests/e2e/focus-parity.spec.ts`)

## Deployment

`bun run build` emits `.next/standalone/server.js` (port via `PORT`, DB via `DATABASE_URL` — absolute path recommended). See `docs/DEPLOYMENT.md`. Pushes to the canonical remote use `docs/ssh_git_wrapper_v3.py` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## License

Private project — all rights reserved.
