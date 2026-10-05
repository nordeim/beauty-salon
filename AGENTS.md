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
- **Two visual systems, two chromes — and two FONT contexts**: the marketing site (cream editorial, `(site)` route group: SiteHeader + SiteFooter) vs the auth surface (slate/white card, `/login`, standalone). `/book` + `/book/confirmation` use the third chrome (BookHeader: always-glass, h-16, "← Return to site"). Brand typography (body Mulish, `h1–h5` Cormorant via the globals base rule) covers marketing + booking ONLY — the reference's auth shell never loads the brand fonts, so `/login` renders in Tailwind's default sans stack (`font-shell` utility on `<main>` + the `<h1>`; pinned by `tests/e2e/login-parity.spec.ts`). Don't "fix" the login page back to Cormorant/Mulish.
- **Route structure**: `(site)` group for chrome-wrapped marketing pages; `services/[slug]` is SSG via `generateStaticParams` over the DB rows; `/services` + `/book/confirmation` are dynamic (read `searchParams` — **async in Next 16, always `await`**).
- **Booking contract**: POST `/api/appointments` validates + persists, then the client routes to `/book/confirmation?name=&date=&time=&service=` — the same query-string contract as the reference. The confirmation page regenerates the ICS data-URI from the service's duration.
- **The seed is the content source**: services/stylists/gallery/testimonials mirror the reference app exactly (including the per-service FAQ accordion data and the first-sentence-of-longDescription heading convention). Changing copy = editing `prisma/seed.ts` and re-running `bun run db:seed` (idempotent upserts).
- **The service detail page has six sections** (hero + treatment card, image, description, prep, FAQ, Ready-to-begin): the description H2 renders `firstSentence(longDescription)` — NOT a composed name/tagline — and the FAQ is an exclusive-open `FaqAccordion` client island (item 0 open by default, collapsed items unmount their answer). The legal pages render from the `LegalBlock` model (`src/lib/legal.ts`): privacy/terms HOIST later paragraphs to the top level; accessibility keeps them in-section with `mt-3`, carries the 8-item checklist `ul`, the `note` variant, and the `<br>`-separated coordinator block — don't flatten the model back to plain p/h2.

## Framework quirks (verified the hard way)

- **Tailwind v4 is CSS-first**: all tokens live in `src/app/globals.css` `@theme`; there is no `tailwind.config.js`. Seven v3→v4 engine traps are pinned in this codebase — read `docs/Tailwind-V4-Validation-Report.md` Appendix (Project Trap Log) BEFORE touching `globals.css`, the mobile drawer, or shadows:
  1. `@theme` colors must be FULL `hsl(…)` values — a bare triplet resolves to transparent.
  2. The palette is pinned to the reference's exact HSL — don't "simplify" to v4 defaults (oklch drift).
  3. `bg-gradient-to-*` interpolates in oklab and Chrome reports `lab()` stops — for computed-color parity use the arbitrary `bg-[linear-gradient(…)]` form (see `/login` main).
  4. v4's `space-y` uses `:where()` (zero specificity) — a child's `mt-*` WINS, the opposite of v3. The mobile drawer is `gap-2` + `mt-10` BY DESIGN; do not convert to `space-y-*`.
  5. v4's `shadow-sm` is one notch heavier than v3's — `--shadow-sm` is pinned in `@theme inline`. Also: v4 `rounded-full` computes to `33554400px` (v3: `9999px`), and `border-foreground/5` reports as `color-mix(in oklab, …)` — both fine, don't "fix" them.
  6. v4's default palette serializes as oklch — a class like `bg-slate-50` computes to `lab(…)`/`oklch(…)`, not the reference's v3 `rgb()` string (pixels identical, string unstable). The slate scale is pinned to the reference's sRGB hex in `@theme` so computed-color parity assertions are deterministic — don't remove that block.
  7. v4's opacity modifier (`/75`, `/50`, `/10`…) emits `color-mix(in oklab, …)`, which Chrome reports as `oklab(L a b / α)` — the reference's v3 emitted `rgba(r, g, b, α)` (e.g. `bg-slate-50/50` on the login input, `text-foreground/75` on legal prose). Pixels are identical; the parity specs assert the resolved lightness + alpha channels (`expectInkAlpha` in the service-detail/legal specs), not the string — don't "fix" the classes to arbitrary values, the reference's DOM carries the modifier syntax.
- **`react-hooks/set-state-in-effect` is enforced**: no sync `setState` inside effect bodies. The sanctioned patterns are in `Reveal.tsx` (state init constant, IO callback flips it) and `StatusPill.tsx` (render-time computation + `suppressHydrationWarning` — the next-themes idiom).
- **Hydration-sensitive initializers**: `useState(() => typeof IntersectionObserver === …)` evaluates differently on server vs client and produces an attribute-mismatch warning — keep initial state environment-independent.
- **`next/image` `fill` requires a positioned parent** (`relative`/`absolute`/`fixed`); every `aspect-*` container that holds a fill image must carry `relative`.
- **Next 16 dev-origin protection**: `allowedDevOrigins: ["127.0.0.1"]` in `next.config.ts` is load-bearing — without it dev chunks silently fail on the loopback origin (unhydrated pages, native form GET fallbacks).
- **Page-file exports**: only `default` + `metadata`/`generateMetadata`/`revalidate`/`dynamic` — anything else fails the build.
- **Server components cannot carry event handlers** — inline `onClick` in a server page 500s at request time (the login Google button lives in the `LoginCardBody` client island for this reason).

## Testing conventions

- E2E specs share ONE seeded SQLite file and run with `workers: 1` — don't add `test.describe.parallel`.
- `mobile-navigation.spec.ts` is the parity contract: computed-style assertions against values measured on the live reference (gap 8px, mt-10 40px, 48px Cormorant Garamond, 2.64px tracking, exact rgb colors). If a styling change breaks it, the change is wrong, not the spec.
- `login-parity.spec.ts` is the auth-shell contract: the whole `/login` surface computes to Tailwind's default sans stack (`font-feature-settings: normal`, `-webkit-font-smoothing: auto`) — the reference's login is a separate CSS context without the brand fonts — AND its slate-900 elements (h1 text, Sign In button bg) compute to the live-measured `rgb(15, 23, 42)` (the trap-6 read-back; session 6 caught a one-digit pin error there). Same rule: if it fails, the code drifted, not the spec.
- `not-found-parity.spec.ts` is the 404 contract: the reference's not-found is a slate centered card (not the cream editorial system) with the attempted path interpolated into the message and a real Go Home `<button>` — measured live, pinned. The path comes from `window.location` via `useSyncExternalStore` (the static `/_not-found` shell makes `usePathname` return the shell path, not the attempted URL). Same rule: if it fails, the code drifted, not the spec.
- `service-detail-parity.spec.ts` is the detail-page contract: the first-sentence description H2, the check-icon prep grid (no numbered markers), the exclusive-open FAQ accordion (item 0 open by default; collapsed items render no wrapper), and the Ready-to-begin dark CTA with the lowercase `Reserve {service} with the next available stylist.` line — all live-measured. Same rule: if it fails, the code drifted, not the spec.
- `legal-parity.spec.ts` is the legal-structure contract: the accessibility page's 8-item `list-disc` checklist, the `text-sm text-foreground/50 italic` note variant, in-section `mt-3` spacing, the `<br>` coordinator block, and privacy/terms' top-level paragraph hoisting (side-agnostic 40px — trap 4 swaps the margin side). Same rule: if it fails, the code drifted, not the spec.
- Unit tests import from `vitest` explicitly (no globals); the vitest config matches `*.test.ts` only, so Playwright's `*.spec.ts` files never double-run.
- A red test is a regression or a wrong test — never skip to pass; never weaken an assertion to ship.

## Environment

`.env.example` documents every variable; `AUTH_SECRET` gates production session signing (`openssl rand -hex 32`). SQLite lives at `db/custom.db` (git-ignored); a RELATIVE `file:` URL resolves against `prisma/schema.prisma` for CLI and runtime alike (`src/lib/db-path.ts`, pinned by `tests/db-path.test.ts`). `NEXT_PUBLIC_SITE_URL` resolves the root layout's `metadataBase` via `src/lib/site.ts` (localhost fallback, never throws — `tests/site-url.test.ts`). `scripts/` holds exactly ONE dev-time script (`with-repo-db.ts`) — the pre-clone scaffold's 14 utility scripts were removed in session 4, and `tests/repo-hygiene.test.ts` guards against relics creeping back (retired `Goal/Task/ActivityLog` model references, doc/package script references that don't resolve).

**Ambient-env trap (verified the hard way):** process env beats `.env` files, and sandboxed shells may export an absolute `DATABASE_URL` pointing OUTSIDE the repo — silently relocating the dev database. The dev-time scripts (`dev`/`build`/`start`/`db:push`/`db:seed`/`db:migrate`/`db:reset`) run through `scripts/with-repo-db.ts`, which resolves the repo `.env`'s `DATABASE_URL` FIRST (`devDatabaseUrl` in `db-path.ts`) and sets it explicitly for the child process. The application runtime (`src/lib/db.ts`) deliberately keeps 12-factor env-var precedence — never "fix" the wrapper by changing it, and never call the Prisma CLI/seed with an ambient env you don't control.

## Reference

- `docs/Tailwind-V4-Validation-Report.md` — the five-trap log + methodology (read before CSS work)
- `Project_Architecture_Document.md` — ADRs, layer model, data + security architecture
- `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — the SSH push runbook (`docs/ssh_git_wrapper_v3.py`); keys are NEVER committed
- `docs/screenshots/` — the running app, desktop + mobile
