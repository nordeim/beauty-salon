# Session 17 — Audit: The Owner Gap-Analysis Validation (The SEO Layer + The Confirmation Fallback Layer) (2026-10-06)

**Baseline:** remote `main` @ `1ed957f` (the session-16 deliverable `4d2cad0` + the push-evidence follow-up `33d8ffb` + the owner's docs commit bringing `docs/session_17.md` and `docs/findings_to_review_and_validate.md`).

**Method:** Mode C audit (`skills/code-review-and-audit` pipeline — Phase 3 as the targeted lightweight checklist; `skills/` excluded) + live parity verification with `skills/agent-browser` (login, the five-probe confirmation-fallback census, the sitemap/robots curl census) + `skills/tdd` (RED/GREEN discipline).

> Note: this file previously held the raw process transcript of session 16 (committed by the owner). It has been replaced by this proper session-17 record — the same convention sessions 4–16 applied to their own transcript files.

## What this session set out to do

Pull the workspace fresh (`git pull` — fast-forward: the owner's docs-only commit, zero code drift), re-validate the documented architecture against the codebase, re-run the Mode C audit baseline, then **validate the owner's gap analysis** (`docs/findings_to_review_and_validate.md` — three findings, F04/F05/F07, comparing Site A = the live reference against Site B = the deployed clone at `beauty-salon.jesspete.shop`) against BOTH the codebase and the live reference — and remediate what turns out to be real.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 4 (tests):** baseline fully green — unit 66/66, build 27/27 pages, e2e 133/133 (**199 total**) — exactly the documented session-16 state, zero drift.
- **Environment verified:** `.env` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET` + `NEXT_PUBLIC_SITE_URL`), `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful, vitest + playwright configured — the task brief's checklist items all holding.

## The gap-analysis validation (the live measurements)

**F04 (contact body "not observed" on Site B) — NOT a codebase issue.** The clone's `/contact` is a Server Component route; its **raw SSR HTML** (curl of the standalone build, zero JS execution) carries the complete semantic module — "Find us in the light", the NAP address block, `tel:`/`mailto:` links, the Instagram handle, the hours table, Get directions — and the live reference renders the identical IA (agent-browser, logged in: the full address/tel/mail/Instagram/hours/directions module, title `Contact | Beauty Salon`). The observation is deployment-side (a stale build or a fetcher artifact). Remediation: the **raw-SSR visibility pin** (the crawler/fetcher guarantee the finding worried about).

**F05 (the "scheduler") — split by validation.** The "request form, not a scheduler" characterization is factually true of BOTH sides — the reference itself has no slot inventory, no payment, no conflict check (sessions-12/14 deobfuscation: fire-and-forget POSTs, the query-string confirmation contract), and its own confirmation announces success without a booking while generating a **dummy now-event ICS** (measured this session). Integrating a real booking engine or gating confirmation on a real ID would EXCEED parity — **rejected, documented**. "Persist submissions" is **already satisfied** (`POST /api/appointments` validates + persists via Prisma). But probing the live at the unmeasured edge exposed **a REAL parity bug**:

**F05c — the no/partial-params confirmation layer diverged (the session's code fix).** Five live probes (logged in, agent-browser) measured the contract:

| Probe | Paragraph | Card | ICS |
|---|---|---|---|
| bare | "Thank you." | ABSENT | DTSTART=DTSTAMP=now, DTEND=+90min, "— Appointment", "for you." |
| `?name=Test` | "Thank you, Test." | ABSENT | now-stamps, "— Appointment", "for Test." |
| `?date=2026-10-21` | "Thank you." | date line ONLY | now-stamps (date-only → fallback) |
| `?date=…&time=14:30` | "Thank you." | date + time lines | chosen stamps + 90-min block, "— Appointment", "for you." |
| `?time=14:30` | "Thank you." | ABSENT | now-stamps |

The clone rendered "Thank you, ." (comma-period artifact), an empty-lines glass card, and a malformed `DTSTART:T00Z` ICS. Every prior confirmation census (sessions 8/10/14/15) measured the WITH-params surface only — the no-params edge (exactly what F05's auditor probed) shipped unverified.

**F07 (no sitemap; mixed SEO hygiene) — a REAL gap.** The live HAS `/sitemap.xml` (12 URLs — `/`, `/services`, `/book`, `/book/confirmation`, `/about`, `/team`, `/gallery`, `/contact`, `/privacy`, `/terms`, `/accessibility`, `/refund`; all `weekly`; priority `1.0` for `/` and `0.8` for the rest; the exact 4-space-indented byte format, no trailing newline) and `/robots.txt` (`User-agent: *\nAllow: /\n\nSitemap: <origin>/sitemap.xml`). The clone 404'd on both. The "unique titles and descriptions per route" part was already satisfied (every route carries its own metadata; the live's runtime titles match). The "noscript directory" evidence: no `<noscript>` in the live's homepage shell (curl) — an SPA artifact the SSR clone doesn't need.

## The remediation (TDD, per `docs/remediation-plan-session-17.md`)

- **T1 RED → T2 GREEN:** `tests/e2e/confirmation-fallback-parity.spec.ts` (CF1–CF4) + `tests/e2e/seo-parity.spec.ts` (S1–S3) + `tests/seo.test.ts` + the `tests/ics.test.ts` fallback block — written first, run red exactly as predicted (S3, the F04 guard, green immediately — the code was already correct), then: the `buildIcs` fallback layer (BOTH date AND time regex-valid → chosen stamps; either missing → `DTSTART = DTSTAMP` with the fixed +90-minute `DTEND`; SUMMARY/DESCRIPTION fall back to "Appointment"/"you"), the confirmation page's conditional card/paragraph, and the SEO layer (`src/lib/seo.ts` + `src/app/sitemap.xml/route.ts` + `src/app/robots.txt/route.ts`).
- **The build-time-origin discovery:** NEXT_PUBLIC_* variables are INLINED in server bundles at build time — verified empirically (neither the runtime process env nor the standalone `.env` copy changes the served locs). The routes therefore prerender static (like the reference's own static files), and the deployment contract is the `.env.example` one: set `NEXT_PUBLIC_SITE_URL` before `next build` (one origin — `metadataBase` + sitemap + robots — baked together). The standard content-types (application/xml / text/plain) are the accepted divergence from the live's text/html platform artifacts.
- **T3 full gate green:** lint ✓ · tsc ✓ · unit **80/80** · build **29/29 routes** (27 pages + `/sitemap.xml` + `/robots.txt`) · e2e **140/140** = **220 total** — every pre-existing contract untouched.
- **A calendar-surfaced spec flake fixed:** the final-gate re-run (after midnight, on Tuesday) tripped `links-parity`'s services-1942 innerText census — measured 1938. The delta is exactly the day-aware StatusPill rendered twice (header + footer): "Closed today" → "Open today" is −2 chars × 2. Sessions 1–16 all ran on Sat/Sun/Mon (closed days); this was the suite's first OPEN day. The spec now derives the expectation from the same unit-tested `statusForDay` model the pill reads (1942 closed-day / 1938 open-day) — the pin is day-aware, not weakened.
- **T4 screenshots:** all 15 canonical captures re-taken on the remediated dev build — **5 byte-identical** (08-book, 09-login, 10-landing-mobile 350126B, **11-mobile-menu 26124B** — the task brief's mobile-drawer emphasis, zero Tailwind v4 regression — and 12-book-mobile); 02-services re-captured at the committed bottom-scroll convention (dark fraction 0.523, transition row 429 — structurally exact, 0.2% pixel noise); the remainder differ only by rendering-noise classes (reveal-animation timing, Google-Maps tiles, CDN images, backdrop-filter rasterization, text antialiasing — mean-color verified identical; every surface's DOM contract pinned green by the specs).
- **T5 documentation aligned:** README (badge 220, 80/140 counts, the SEO + confirmation-fallback feature rows, the testing table, one stale "collapses to opacity" phrasing fixed), AGENTS.md (the SEO-layer + confirmation-fallback invariants, the two new spec contract lines, the counts), CLAUDE.md (counts, the unit-layer description), PAD (the layer model's SEO note, the testing table, the verification ledger, the build-route count), SKILL.md → **v1.14.0** (project_state, §7, ADR-007, Appendix B inventory, Appendix C history), `.env.example` (the build-time-baking note), this session log, the plan's executed results, the worklog.

## Everything else shipped this session

- The plan-vs-codebase validation matrix (13 claims verified before execution — the convention every plan has carried since session 8).
- The findings register records the REJECTED and ALREADY-SATISFIED items (F05a/F05b) with the parity rationale — the next maintainer's answer to "why is there no real booking engine?".

## Carried / accepted (unchanged)

- The two dev-only `bun audit` advisories (`braces`, `deepmerge-ts`) — the accepted-risk stance re-verified.
- The a11y-addition family (drawer Escape-close, aria-labels, the RM-visible stance) — unchanged, still pinned.
- The base44 platform boilerplate (og/twitter/PWA metas) — still not replicated.

## Suggested next-session candidates

1. **A structured-data census** — the live's `<head>` may carry JSON-LD schema.org markup (or none); the clone's equivalent layer is unmeasured either way.
2. **An HTTP-header census** — cache-control/etag/last-modified semantics on the static surfaces (the live's Cloudflare/Caddy chain vs the clone's standalone server) — the serving layer directly adjacent to this session's SEO work.
