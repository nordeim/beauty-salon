---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs-single-app
version: 1.0.0
last_updated: 2026-10-06
---

# Maison Luminaire — Beauty Salon

A self-hosted clone of the Maison Luminaire beauty-salon experience: an editorial marketing site, a booking scheduler with ICS calendar downloads, and cookie-session auth — Next.js 16 App Router + React 19 + Tailwind CSS 4 (CSS-first) + Prisma/SQLite, with design tokens extracted to byte-parity from the live reference.

## Core Identity & Purpose

**What**: 13 public routes reproducing the reference app — landing (7 sections), services grid + 8 SSG detail pages, filterable gallery with lightbox, team, about, contact (map), booking + confirmation, login, 4 legal pages, 404 — plus 6 typed JSON API endpoints.
**Why**: a faithful, self-hosted, production-grade replica whose visual output matches the reference's computed styles, on a maintainable SSR substrate.
**Maintained by**: solo engineering with AI-agent assistance; `main`-only, Conventional Commits.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the relevant page/component/lib file in full plus `AGENTS.md` invariants before writing. Identify the reference behavior being touched (the live-extracted spec is the source of truth).
2. **PLAN** — State the smallest correct path; name every file touched.
3. **VALIDATE** — Confirm scope for anything touching `globals.css` tokens, the mobile drawer spacing, auth, or the booking contract before coding.
4. **IMPLEMENT** — Server Components by default; client islands only for interactivity; typed DTOs from `src/lib/content.ts`.
5. **VERIFY** — Run the full gate: `bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e`. Claims of "works" require executed evidence.
6. **DELIVER** — Note what was verified, what was not, and any deferred work.

### Project-Specific Principles

- **Parity is the requirement.** Visual/behavioral fidelity to the reference outranks refactors. The computed-style e2e specs are the contract.
- **Tokens are pinned, never defaulted.** Tailwind v4's defaults drift from the reference palette (trap 2); `globals.css` is the single source.
- **Font contexts are per-surface.** Brand typography (Mulish body, Cormorant headings) serves marketing + booking; the auth shell (`/login`) renders in Tailwind's default sans stack (`font-shell`) — the reference's login is a separate CSS context. `login-parity.spec.ts` pins it.
- **Client/server module discipline.** `content.ts` client-safe; `data.ts` server-only; a single wrong value import panics the build (see AGENTS.md).
- **Evidence-based verification.** Label claims Verified / Reasoned / Assumed. If it wasn't executed, say so.

## Implementation Standards

### TypeScript
- Strict mode; prefer `interface` for object shapes, `type` for unions; early returns.
- DTOs live in `src/lib/content.ts`; API route bodies validate and narrow `unknown` before use — never trust `req.json()` shapes.

### React / Next.js 16
- Server Components by default; `"use client"` only for interactive leaves (header, drawer, carousels, filters, forms).
- `params`, `searchParams`, `cookies()` are **async — always `await`**.
- Page files export only `default` + metadata exports; extra exports fail the build.
- Server components never carry event handlers — push interactive fragments into a client island (pattern: `LoginCardBody`).
- No sync `setState` inside effect bodies (`react-hooks/set-state-in-effect` enforced); see `Reveal.tsx` (timer/IO callbacks) / `StatusPill.tsx` (the `useSyncExternalStore` minute-tick store — the NotFoundBody "client value the static shell cannot know" idiom) for the sanctioned idioms.
- Handle loading/empty/error states explicitly; disable buttons during async operations; `role="alert"` for errors, `role="status"` for notices.

### Tailwind CSS v4 (CSS-first)
- No `tailwind.config.*`. Tokens + `@utility` customs live in `src/app/globals.css`.
- Read the trap log (`docs/Tailwind-V4-Validation-Report.md`) before touching theme tokens, the mobile drawer, shadows, gradients, or transform-bearing surfaces. The eight traps: full-`hsl()` theme values; pinned palette; oklab gradients (use arbitrary `bg-[linear-gradient(…)]` for computed parity); `space-y` `:where()` rewrite (the drawer is `gap-2` + `mt-10` by design); pinned `--shadow-sm`; the slate scale pinned to sRGB hex (v4's oklch palette serializes as `lab()`/`oklch()`, not the reference's `rgb()` string); the opacity modifier emitting `color-mix(in oklab, …)` → `oklab(L a b / α)` where v3 emitted `rgba()` (pixels identical — assert channels, not strings); and the individual-transform properties (`scale-*` writes the `scale` property, not `transform` — a v3-era inline `transform: none` does not neutralize it; the hero's settled state needs `scale: none`).
- Class sets mirror the reference DOM (`tracking-editorial`, `glass`, `prism-gradient`, `breathe` are `@utility` definitions).

### Data Access
- Reads: server components call `src/lib/data.ts` (Prisma). Client components receive plain DTOs as props — never import `data.ts` from a client file.
- Writes: POST to `/api/*` route handlers with explicit validation; the appointment + newsletter endpoints are the only write paths.
- Schema edits: `prisma/schema.prisma` → `bun run db:push` → update `prisma/seed.ts` → `bun run db:seed` (idempotent).

## Development Workflow

### Environment Setup
```bash
bun install
cp .env.example .env    # AUTH_SECRET=$(openssl rand -hex 32)
bun run db:push && bun run db:seed
```

### Build Commands
| Command | Purpose |
|---|---|
| `bun run dev` | Dev server :3000 |
| `bun run lint` / `typecheck` | ESLint 9 flat / tsc |
| `bun run test` | Vitest unit (84) |
| `bun run build` | Standalone production build (29 routes) |
| `bun run test:e2e` | Playwright Chromium (158 specs; needs build first) |
| `bun scripts/capture-screenshots.mjs` | The canonical screenshot set — standalone server on :3200, fresh contexts, `animations: "disabled"` (the byte-deterministic convention, session 19) |
| `bun run db:push` / `db:seed` | Schema + reference content |

Clean-check order: `lint → typecheck → test → build → test:e2e`.

## Testing Strategy

| Level | Tool | Location | Notes |
|---|---|---|---|
| Unit | Vitest | `tests/*.test.ts` | db-path (anchors, dotenv parsing, dev-time env-file-first precedence), hours, ICS (the fixed 90-minute block + raw commas + the year-boundary rollover + the session-17 no-params now-stamp fallback), auth (scrypt/HMAC), seo (the sitemap/robots builders’ byte format), repo hygiene (no retired scaffold-model references; doc/package script references resolve; no live AUTH_SECRET in tracked files) — pure seams only |
| E2E | Playwright | `tests/e2e/*.spec.ts` | Production standalone server :3100, isolated `db/e2e.db`, `workers: 1` — 158 specs incl. the head-boilerplate negative-pin family (session 18: zero JSON-LD / og-twitter / PWA metas / canonical — the live's route-invariant registry artifacts, deliberately not replicated, absence pinned) and the authed-state census (session 19: the logged-in chrome neutrality — post-login target, login-renders-when-auth'd, auth-neutral header/drawer/footer, no-prefill book, the auth'd 404) and the status-pill state-machine census (session 20: the time-aware four states — "Opens today at {open}" / "Open · closes {close}" / "Closed for the day" / "Closed today" — the live minute-granularity boundary flips, the footer's /80 variant) |

- Import `describe/it/expect` from `vitest` explicitly.
- `mobile-navigation.spec.ts` pins the drawer's computed styles, `login-parity.spec.ts` the auth shell's default font stack + slate-900 read-back (`rgb(15, 23, 42)`), `not-found-parity.spec.ts` the 404's slate centered card (path-interpolated message with the leading slash stripped — the live-measured edge matrix — and the Go Home button), `service-detail-parity.spec.ts` the detail page's first-sentence heading + check-icon prep grid + exclusive-open FAQ accordion + Ready-to-begin CTA, `legal-parity.spec.ts` the legal structure (accessibility checklist, note variant, mt-3, br coordinator, privacy/terms hoisting), `booking-parity.spec.ts` the booking form's nested-grid structure + Notes placeholder + Calendar icon + the decoded-ICS fixed 90-minute block, `icon-parity.spec.ts` the lucide icon layer on every route (class sizing — never `size` props, the sage stars, hover-rotate arrows, footer/Reach-us/MapPin/login icon sets, no eye toggle), `confirmation-parity.spec.ts` the confirmation route (the flower2 watermark at responsive class sizing + stroke 0.5, the invisible decorative ring, the /contact policy link with its trailing arrow), `head-parity.spec.ts` the head layer (the declared favicon + the declared-but-dead manifest link), `links-parity.spec.ts` the links/routing census (the services grid's bottom CTA, the accessibility article's dead `#` link, the unknown-service "Service not found" state, case-insensitive + trailing-slash routing via `src/proxy.ts`, the landing/gallery href sequences), `form-parity.spec.ts` the form-control census + state layer + wire payloads (the fire-and-forget POST-failure behavior, the `You're in…` success contract with the sage Check, the ASCII-dot loading texts with arrows always rendered, the login Alert error card with the sRGB-pinned reds, the non-resizable textarea, the 48px date/time inputs, the newsletter `{ email, source: "homepage_15off" }` + booking nine-field snake_case wire contracts), `focus-parity.spec.ts` the focus-ring census (the login inputs' slate-400 ring + the Sign in button's zinc-950 ring on the shell's white offset — trap 9 + the shell token scope; the marketing border→ink/no-ring stance + the preserved UA outlines), `print-parity.spec.ts` the print-media census (zero `@media print` rules both sides + the deliberate print-visible stance under Chromium's forced-reduced-motion print pipeline + the mechanism guard), `scroll-parity.spec.ts` the navigation-scroll policy (the kept-and-clamped offset + the exact popstate restores + the dead-# click semantics), `focus-order-parity.spec.ts` the Tab-walk census (the landing 40 / login 6 / book 17 incl. the native date-time segment stops / services 20 stop sequences + the drawer's no-trap focus layer), `reduced-motion-parity.spec.ts` the screen-RM stance (full visibility + instant flip under reduce; the 0.9s entrance family guard without it), `head-boilerplate-parity.spec.ts` the negative-pin family (zero JSON-LD / og-twitter / PWA metas / canonical links on the four chrome-representative routes — the live's route-invariant registry artifacts, deliberately not replicated), `status-pill-parity.spec.ts` the time-aware pill machine (the four controlled-clock states, the per-day times, the live boundary flips, the footer /80 variant), and the landing.spec.ts session-10 contracts the hero's settled proportion (the scale-125 class neutralized — the v4 individual-scale trap — with the img at 1.08) + the category images' computed 150ms default-ease hover zoom — all against live-measured reference values. If any fails, the code drifted, not the spec.
- Never skip/weaken a test to pass the gate; fix the cause or flag the debt.

## Code Quality Standards

- No `console.log` in shipped code paths (`console.error` with context on failures is correct).
- No placeholder values; no dead code; no speculative configuration.
- Errors: explicit messages naming what failed and what to do; secrets never logged.
- Images: `next/image` with `fill` + a positioned parent + explicit `sizes`; alt text mandatory.

## Git & Version Control

- Branch `main` only; atomic Conventional Commits (`feat(booking): …`, `fix(header): …`).
- Never commit `.env*` (except `.env.example`), keys, or `db/*.db`.
- Pushes use `docs/ssh_git_wrapper_v3.py` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`); the gate must be green first.

## Error Handling & Debugging

- API routes catch once at the boundary, return typed `{ error }` JSON with correct status codes (400 validation / 401 auth / 429 rate-limit / 500 logged-internal).
- Debug order: reproduce with the exact command → read `dev.log` → isolate (the Turbopack `node:fs` panic and the hydration attribute mismatch were both found this way; see AGENTS.md quirks).
- Cap speculative fixes at two attempts, then switch to systematic isolation.

## Project-Specific Standards

### Architecture
```
src/app/(site)/     marketing chrome — landing, services(+[slug]), gallery, team, about, contact, legal
src/app/book/       scheduler + confirmation (BookHeader chrome)
src/app/login/      auth card (standalone slate system)
src/app/api/        health · auth/{login,logout,me} · appointments · newsletter
src/components/     layout chrome + client islands (LoginForm, BookingForm, FaqAccordion, NotFoundBody…) + LegalPage
src/lib/            content (client-safe, incl. firstSentence) · data (server) · auth · ics · hours · db · site · legal (block model)
prisma/             schema + seed (the content source — services incl. faqs)
tests/              unit + e2e
```

### API Design
Route handlers only; no REST for UI mutations beyond the documented endpoints. All bodies validated/narrowed server-side. Auth: httpOnly `ml_session` cookie (HMAC `userId.exp.mac`), 7-day TTL, timing-safe compares.

### Database / Data Layer
Prisma 6 + SQLite. `DATABASE_URL="file:../db/custom.db"` resolves against `prisma/schema.prisma` for CLI and runtime (db-path seam, unit-tested). The dev-time scripts (`dev`/`build`/`start`/`db:push`/`db:seed`/`db:migrate`/`db:reset`) run through `scripts/with-repo-db.ts`, which prefers the repo `.env`'s value over any ambient `DATABASE_URL` process variable (sandboxed-shell defense; `devDatabaseUrl` in `src/lib/db-path.ts`). Production: absolute path, standard env-var precedence.

### Environment Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file URL | `file:../db/custom.db` |
| `AUTH_SECRET` | Session HMAC key (≥32 chars in prod) | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin — resolves `metadataBase` (`src/lib/site.ts`) | `http://localhost:3000` |
| `DEMO_USER_PASSWORD` | Optional seed-time override | — |

## Anti-Patterns to Avoid

- Importing `@/lib/data` (or anything transitively pulling `node:fs`) from a client component.
- Converting the mobile drawer's `gap-2` + `mt-10` to `space-y-*` (trap 4 regresses the 48px CTA gap).
- "Simplifying" `@theme` colors to bare triplets or v4 default palette entries.
- Sync `setState` in effect bodies; environment-dependent `useState` initializers.
- Inline event handlers in server components.
- Weakening lint/type/test gates to make the build pass.
