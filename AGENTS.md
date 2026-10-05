# AGENTS.md

Instructions for AI coding agents working in this repository. Every line answers: "would you get this wrong without being told?" Verified against the toolchain on 2026-10-05.

## Commands

Run from the repo root. **Bun** is the runtime (never `npm`/`pnpm` here).

| Command | What it does |
|---|---|
| `bun run dev` | Dev server on :3000 (logs to `dev.log`) — via `scripts/with-repo-db.ts`, which pins `DATABASE_URL` to the repo `.env`'s value (see Environment) |
| `bun run build` | Production standalone build (`.next/standalone/server.js` + static assets copied in); SSG reads run through the same wrapper |
| `bun run start` | Run the standalone build (`NODE_ENV=production`); with a repo `.env` present it pins the repo DB, without one it is a transparent 12-factor passthrough |
| `bun run lint` / `bun run typecheck` | ESLint 9 flat / `tsc --noEmit` |
| `bun run test` | Vitest unit layer (`src/**/*.test.ts`, `tests/*.test.ts`) |
| `bun run test:e2e` | Playwright e2e — requires a prior `bun run build`; boots the standalone server on :3100 with its own `db/e2e.db` (pushed + seeded by global-setup) |
| `bun run db:push` / `db:seed` | Prisma schema push / idempotent seed (reference content + demo user) — wrapped so the DB always lands at `<repo>/db/custom.db` |
| Single unit test | `bunx vitest run tests/ics.test.ts` |
| Single e2e spec | `bunx playwright test tests/e2e/mobile-navigation.spec.ts` |

Order for a clean check: `bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e`. There is no hosted CI — the local gate is the only gate.

## Architecture invariants

- **Client-safe vs server-only modules**: `src/lib/content.ts` holds DTOs + `formatPrice` and MUST stay free of db/node imports — client components import from it. `src/lib/data.ts` is the server-only Prisma read seam. A single value import of `data.ts` from a client component drags `node:fs` (via `db-path.ts`) into the browser graph and panics Turbopack ("chunking context does not support external modules (request: node:fs)").
- **Two visual systems, two chromes**: the marketing site (cream editorial, `(site)` route group: SiteHeader + SiteFooter) vs the auth surface (slate/white card, `/login`, standalone). `/book` + `/book/confirmation` use the third chrome (BookHeader: always-glass, h-16, "← Return to site").
- **Route structure**: `(site)` group for chrome-wrapped marketing pages; `services/[slug]` is SSG via `generateStaticParams` over the DB rows; `/services` + `/book/confirmation` are dynamic (read `searchParams` — **async in Next 16, always `await`**).
- **Booking contract**: POST `/api/appointments` validates + persists, then the client routes to `/book/confirmation?name=&date=&time=&service=` — the same query-string contract as the reference. The confirmation page regenerates the ICS data-URI from the service's duration.
- **The seed is the content source**: services/stylists/gallery/testimonials mirror the reference app exactly. Changing copy = editing `prisma/seed.ts` and re-running `bun run db:seed` (idempotent upserts).

## Framework quirks (verified the hard way)

- **Tailwind v4 is CSS-first**: all tokens live in `src/app/globals.css` `@theme`; there is no `tailwind.config.js`. Five v3→v4 engine traps are pinned in this codebase — read `docs/Tailwind-V4-Validation-Report.md` Appendix (Project Trap Log) BEFORE touching `globals.css`, the mobile drawer, or shadows:
  1. `@theme` colors must be FULL `hsl(…)` values — a bare triplet resolves to transparent.
  2. The palette is pinned to the reference's exact HSL — don't "simplify" to v4 defaults (oklch drift).
  3. `bg-gradient-to-*` interpolates in oklab and Chrome reports `lab()` stops — for computed-color parity use the arbitrary `bg-[linear-gradient(…)]` form (see `/login` main).
  4. v4's `space-y` uses `:where()` (zero specificity) — a child's `mt-*` WINS, the opposite of v3. The mobile drawer is `gap-2` + `mt-10` BY DESIGN; do not convert to `space-y-*`.
  5. v4's `shadow-sm` is one notch heavier than v3's — `--shadow-sm` is pinned in `@theme inline`. Also: v4 `rounded-full` computes to `33554400px` (v3: `9999px`), and `border-foreground/5` reports as `color-mix(in oklab, …)` — both fine, don't "fix" them.
- **`react-hooks/set-state-in-effect` is enforced**: no sync `setState` inside effect bodies. The sanctioned patterns are in `Reveal.tsx` (state init constant, IO callback flips it) and `StatusPill.tsx` (render-time computation + `suppressHydrationWarning` — the next-themes idiom).
- **Hydration-sensitive initializers**: `useState(() => typeof IntersectionObserver === …)` evaluates differently on server vs client and produces an attribute-mismatch warning — keep initial state environment-independent.
- **`next/image` `fill` requires a positioned parent** (`relative`/`absolute`/`fixed`); every `aspect-*` container that holds a fill image must carry `relative`.
- **Next 16 dev-origin protection**: `allowedDevOrigins: ["127.0.0.1"]` in `next.config.ts` is load-bearing — without it dev chunks silently fail on the loopback origin (unhydrated pages, native form GET fallbacks).
- **Page-file exports**: only `default` + `metadata`/`generateMetadata`/`revalidate`/`dynamic` — anything else fails the build.
- **Server components cannot carry event handlers** — inline `onClick` in a server page 500s at request time (the login Google button lives in the `LoginCardBody` client island for this reason).

## Testing conventions

- E2E specs share ONE seeded SQLite file and run with `workers: 1` — don't add `test.describe.parallel`.
- `mobile-navigation.spec.ts` is the parity contract: computed-style assertions against values measured on the live reference (gap 8px, mt-10 40px, 48px Cormorant Garamond, 2.64px tracking, exact rgb colors). If a styling change breaks it, the change is wrong, not the spec.
- Unit tests import from `vitest` explicitly (no globals); the vitest config matches `*.test.ts` only, so Playwright's `*.spec.ts` files never double-run.
- A red test is a regression or a wrong test — never skip to pass; never weaken an assertion to ship.

## Environment

`.env.example` documents every variable; `AUTH_SECRET` gates production session signing (`openssl rand -hex 32`). SQLite lives at `db/custom.db` (git-ignored); a RELATIVE `file:` URL resolves against `prisma/schema.prisma` for CLI and runtime alike (`src/lib/db-path.ts`, pinned by `tests/db-path.test.ts`).

**Ambient-env trap (verified the hard way):** process env beats `.env` files, and sandboxed shells may export an absolute `DATABASE_URL` pointing OUTSIDE the repo — silently relocating the dev database. The dev-time scripts (`dev`/`build`/`start`/`db:push`/`db:seed`/`db:migrate`/`db:reset`) run through `scripts/with-repo-db.ts`, which resolves the repo `.env`'s `DATABASE_URL` FIRST (`devDatabaseUrl` in `db-path.ts`) and sets it explicitly for the child process. The application runtime (`src/lib/db.ts`) deliberately keeps 12-factor env-var precedence — never "fix" the wrapper by changing it, and never call the Prisma CLI/seed with an ambient env you don't control.

## Reference

- `docs/Tailwind-V4-Validation-Report.md` — the five-trap log + methodology (read before CSS work)
- `Project_Architecture_Document.md` — ADRs, layer model, data + security architecture
- `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — the SSH push runbook (`docs/ssh_git_wrapper_v3.py`); keys are NEVER committed
- `docs/screenshots/` — the running app, desktop + mobile
