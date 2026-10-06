# Remediation Plan — Session 17 (The Gap-Analysis Validation: The SEO Layer + The Confirmation Fallback Layer)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `1ed957f` (the session-16 deliverable `4d2cad0` + the push-evidence follow-up `33d8ffb` + the owner's docs commit bringing `docs/session_17.md` + `docs/findings_to_review_and_validate.md`)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (login, the confirmation-fallback probe set, the SEO-surface census) + `skills/tdd` for the RED/GREEN discipline.

---

## 1. Executive Summary

The session-16 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 66/66 unit, 27/27 build pages, 133/133 e2e — **199 total**) at the session-17 baseline: zero drift from the documented session-16 state.

The owner's gap analysis (`docs/findings_to_review_and_validate.md` — Site A = the live reference, Site B = the deployed clone at `beauty-salon.jesspete.shop`) carries three findings. All three were validated this session against BOTH the codebase and the live reference:

- **F04 (contact body "not observed" on Site B): validated as NOT a codebase issue.** The clone's `/contact` is a Server Component route; its **raw SSR HTML** (curl, zero JS execution) carries the complete semantic module — the "Find us in the light" h1, the NAP address block, `tel:`/`mailto:` links, the Instagram handle, the hours table, Get directions — and the live reference renders the identical information architecture (agent-browser, logged in). The observation is deployment-side (a stale build or a fetcher artifact), not code. Remediation: **pin the SSR visibility property** (the crawler/fetcher guarantee the finding worried about) with a raw-HTML contract.
- **F05 (the "scheduler"): split by validation.** The "request form, not a scheduler" characterization is factually true of **BOTH sides** — the reference itself has no slot inventory, no payment, no conflict check (live-measured sessions 12/14: fire-and-forget POSTs, the query-string confirmation contract). Integrating a real booking engine or gating confirmation on a real ID would **EXCEED parity** and is **rejected** (documented as the deliberate stance). "Persist submissions" is **already satisfied** (`POST /api/appointments` validates + persists via Prisma). But the live-measurement exposed a **REAL parity bug** in the no/partial-params confirmation layer — **F05c** below, this session's code fix.
- **F07 (no sitemap; mixed SEO hygiene): validated as a REAL parity gap.** The live **HAS** `/sitemap.xml` (12 URLs — `/`, `/services`, `/book`, `/book/confirmation`, `/about`, `/team`, `/gallery`, `/contact`, `/privacy`, `/terms`, `/accessibility`, `/refund`; all `weekly`; priority `1.0` for `/` and `0.8` for the rest) and `/robots.txt` (`User-agent: *` / `Allow: /` / `Sitemap: <origin>/sitemap.xml`). The clone **404s on both**. The "unique titles and descriptions per route" part is already satisfied (every route carries its own title+description; the live's runtime titles match — `Contact | Beauty Salon`, `Booking Confirmation | Beauty Salon`). Fix: the **SEO layer** — a byte-formatted sitemap + robots served from the `siteUrl()` canonical-origin seam, pinned by spec.

Net: **one real code-fix family (F05c), one new feature layer (F07), one pin family (F04 + the F05c/F07 contracts), documentation.** Every fix direction is TOWARD the live-measured reference — no parity divergence is introduced.

## 2. Findings register (live-measured 2026-10-06, agent-browser logged-in; probes listed in §4.1)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F04 | INFO — validated NOT a code issue; needs the SSR pin | `/contact` body visibility to non-JS fetchers | full module (agent-browser): "Find us in the light." + ADDRESS (500 Terry Francine Street San Francisco, CA 94158) + GET DIRECTIONS + REACH US (123-456-7890 / info@mysite.com / @maisonluminaire) + HOURS + RESERVE AN APPOINTMENT | raw SSR HTML carries the identical module (curl, no JS); `icon-parity.spec.ts` already pins the glyph layer; the Site B observation = deployment-side |
| F05a | REJECTED per parity (documented) | "integrate a real booking engine / gate confirmation on a real ID / stop generating dummy calendar events" | the reference IS a request form (fire-and-forget POSTs — sessions 12/14); its own confirmation announces success without a booking and generates a dummy now-event (measured this session) | parity-bound: the clone replicates the request-form UX (and persists — already exceeding in the sanctioned direction) |
| F05b | ALREADY SATISFIED (documented) | "persist submissions" | the reference POSTs to its own backend | `POST /api/appointments` validates + persists via Prisma — the documented booking contract |
| F05c | MEDIUM — REAL parity bug (the session's code fix) | `/book/confirmation` with no/partial query params | "Thank you." when no name; the Reserved-for card **ABSENT** when no date; the time line renders iff `time`; the service line renders iff `service`; ICS: `date`+`time` BOTH present → chosen stamps, **either missing → DTSTART = DTSTAMP = now, DTEND = +90min**; SUMMARY fallback "Maison Luminaire — Appointment"; DESCRIPTION fallback "Reservation for you." | "Thank you, ." comma-period artifact; the empty-lines card always renders; ICS `DTSTART:T00Z` malformed garbage |
| F07 | MEDIUM — REAL gap (the new layer) | `/sitemap.xml` + `/robots.txt` | sitemap: 12 URLs (ordered as listed above), all `weekly`, priority `1.0` (`/`) and `0.8` (rest); robots: `User-agent: *\nAllow: /\n\nSitemap: <origin>/sitemap.xml`; both served `text/html` (a base44 platform artifact) | **404 on both**; per-route titles/descriptions already unique |
| F07-note | INFO — verified absent | the "noscript directory" (Site A evidence) | no `<noscript>` block in the live's homepage shell (curl) | n/a — the clone is SSR; no noscript layer exists or is needed |

## 3. Root cause

Two different causes:

- **F05c** is an **unmeasured edge of a censused contract.** Sessions 8/10/14 measured the confirmation route through its WITH-params surface (the booking flow's happy path — every spec navigates with the full query string). The no/partial-params surface — exactly the state F05's auditor probed ("confirmation is reachable without submitting") — was never censused, so the clone's unconditional rendering (`name.split(" ")[0] || name` → "" → "Thank you, ."; the card with no date-gate; `toUtcStamp("", "")` → "T00Z") shipped unverified. The fix is the same one the session-6 lesson prescribes: **read the live back at the unmeasured edge, then pin it.**
- **F07** is a **never-built layer.** The head census (session 10) covered the favicon/manifest links but nobody ever fetched the reference's `/sitemap.xml`/`/robots.txt`. The reference — although a client-rendered SPA — serves both as static files (with `text/html` content-types, its platform's artifact). The clone, an SSR app whose SEO surface is its substrate advantage, simply never grew the layer.

## 4. Design (the fixes)

### 4.1 The confirmation-fallback contract (F05c — live-measured probe set)

Five probes on the live (logged in, 2026-10-06) define the contract:

| Probe | Paragraph | Reserved-for card | ICS |
|---|---|---|---|
| bare `/book/confirmation` | "Thank you." | ABSENT | DTSTART=DTSTAMP=now, DTEND=+90min, SUMMARY "— Appointment", DESC "Reservation for you." |
| `?name=Test` | "Thank you, Test." | ABSENT (no date) | DTSTART=now, SUMMARY "— Appointment", DESC "Reservation for Test." |
| `?date=2026-10-21` | "Thank you." | "RESERVED FOR / Wednesday, October 21" — NO time line, NO service line | DTSTART=now (date-only → fallback), DTEND=+90min |
| `?date=2026-10-21&time=14:30` | "Thank you." | date line + "14:30" time line, NO service line | DTSTART:20261021T143000Z, DTEND:20261021T160000Z, SUMMARY "— Appointment", DESC "Reservation for you." |
| `?time=14:30` | "Thank you." | ABSENT (no date) | DTSTART=now (time-only → fallback) |

Derived rules: the paragraph interpolates the first name **iff name present**; the card renders **iff date present**; the time/service lines render iff their params present; the ICS uses the chosen stamps **iff BOTH date and time present** (either missing → the now-stamp fallback), with the name/service textual fallbacks. The fixed 90-minute block applies on both paths (measured: now+90 on the fallback path).

### 4.2 F05c — the code changes

**`src/lib/ics.ts`** — the fallback layer inside `buildIcs`:

- `hasDateTime = DATE_RE.test(date) && TIME_RE.test(time)` (the same regexes the API route uses);
- `dtstart = hasDateTime ? toUtcStamp(date, time) : dtstamp` and `dtend = hasDateTime ? addMinutes(date, time, 90) : addMinutesToStamp(dtstamp, 90)` — where `dtstamp` is the existing now-stamp;
- `SUMMARY:Maison Luminaire — ${service || "Appointment"}` and `DESCRIPTION:Reservation for ${name || "you"}. …`.

**`src/app/book/confirmation/page.tsx`** — the conditional rendering:

- the paragraph renders `Thank you{name ? `, ${firstName}` : ""}.` (the JSX interpolation keeps the existing first-name logic on the named branch);
- the whole glass card is `{date && (…)}` — absent without a date;
- the time line `{time && …}` and the service line `{service && …}` inside the card;
- the ICS inputs pass through unchanged — the lib owns the fallback.

### 4.3 F07 — the SEO layer

**`src/lib/seo.ts`** (new, pure + unit-tested — the `content.ts`/`ics.ts` pattern):

- `SITEMAP_PATHS`: the live-measured ordered route list (12 entries — `/` first, then the 11 above);
- `buildSitemapXml(origin)`: the live's exact byte format — `<?xml version="1.0" encoding="UTF-8"?>` + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + 4-space-indented `<url>` blocks (`<loc>`/`<changefreq>weekly</changefreq>`/`<priority>1.0|0.8</priority>`), LF line endings;
- `buildRobotsTxt(origin)`: `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml` — the live's exact body.

**`src/app/sitemap.xml/route.ts`** + **`src/app/robots.txt/route.ts`** (new): GET route handlers wiring the builders to `siteUrl()`, with the standard content-types (`application/xml; charset=utf-8`, `text/plain; charset=utf-8`). Two accepted divergences from the live, both in the "correct substrate" class (like the SSR per-route titles): the content-types are the STANDARD ones (the live's `text/html` is its platform's artifact, as with its dead manifest), and the origin is the clone's own canonical `NEXT_PUBLIC_SITE_URL` (the live's file hardcodes its own base44 origin — each site's sitemap lists its own domain, the property that actually matters for the deployed Site B).

**`playwright.config.ts`**: `NEXT_PUBLIC_SITE_URL: BASE_URL` added to the e2e `webServer.env` so the specs assert the serves-its-own-origin property against the running e2e server (`http://localhost:3100`).

### 4.4 F04 — the SSR pin

`tests/e2e/seo-parity.spec.ts` gains a raw-HTML contract: `request.get("/contact")` → the response body (no JS execution — the fetcher/crawler view) must contain "Find us in the light", the NAP address string, `tel:123-456-7890`, `mailto:info@mysite.com`, `@maisonluminaire`, "Get directions", and the Hours block. This is the regression guard for the exact property F04 worried about ("invisible to assistive tech and crawlers").

### 4.5 The new specs

**`tests/e2e/confirmation-fallback-parity.spec.ts`** (new, 4 contracts): CF1 the bare route (paragraph "Thank you." — no comma artifact; card count 0; the ICS's DTSTART === DTSTAMP + DTEND = DTSTART+90min + the Appointment/you fallbacks); CF2 name-only ("Thank you, Test."; card absent; DESC "Reservation for Test."); CF3 date-only (card present with "Wednesday, October 21", no time line, no service line; ICS still now-stamps); CF4 date+time (card with both lines; the ICS's chosen DTSTART/DTEND — the fixed 90-min block — plus the Appointment/you textual fallbacks). The with-params full contract stays pinned by the existing `confirmation-parity`/`booking-parity` specs — no duplication.

**`tests/e2e/seo-parity.spec.ts`** (new, 3 contracts): S1 the sitemap (200; the exact 12-path ordered set; every `changefreq` weekly; priorities 1.0/0.8; locs prefixed with the e2e origin; valid XML); S2 the robots (200; the exact body incl. the origin-prefixed Sitemap line); S3 the F04 contact raw-HTML visibility guard.

**`tests/ics.test.ts`** (extended): the fallback unit contracts — bare → DTSTART === DTSTAMP with DTEND + 90min; date-only and time-only → the now-fallback; the "Appointment"/"you" textual fallbacks; the valid-path regression (chosen stamps) already pinned.

**`tests/seo.test.ts`** (new unit): the builders' byte contracts — the exact prologue/epilogue, the 4-space indentation, the `1.0`/`0.8` priority strings, the ordered path list, the robots body, origin interpolation.

### 4.6 Screenshots + docs + push

The 15 canonical screenshots re-captured on the remediated build (the byte-identity signal re-checked; `14-confirmation` is captured through the with-params booking flow so it is expected byte-identical — the fallback only changes the no/partial-params rendering). Documentation aligned (README, AGENTS.md, CLAUDE.md, PAD, SKILL.md → v1.14.0, the proper `docs/session_17.md` record, this plan's executed results, the worklog). `.env.example` re-verified (no new env vars — `NEXT_PUBLIC_SITE_URL` is already documented). Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py`.

## 5. TDD plan

**T1 (RED):** write the 2 new e2e specs + the 2 unit-test extensions; run against the current build. Expected RED: every CF1–CF4 assertion that touches the fallback (the comma artifact, the empty card, the T00Z stamps) and every S1/S2 assertion (the 404s); S3 (the F04 guard) expected GREEN immediately — the code is already correct.

**T2 (GREEN):** implement §4.2 (`ics.ts` + the confirmation page) and §4.3 (`seo.ts` + the two routes + the playwright env). Re-run T1 → all green.

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — every pre-existing spec green (expected 66 + N new unit ≈ 74 unit, 133 + 7 new e2e = 140 e2e). Conflict check: no existing spec navigates the bare/partial confirmation route (verified — every confirmation spec uses the full query string); no existing spec fetches `/sitemap.xml` or `/robots.txt` (verified — grep); the playwright env addition affects no existing assertion (no spec reads canonical/OG URLs).

**T4:** the 15 canonical screenshots re-captured; `14-confirmation` byte-identity verified through the with-params flow.

**T5:** documentation alignment (§4.6).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook's Appendix A) → verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| No spec navigates the bare/partial confirmation route | grep over `tests/e2e/*.spec.ts`: every confirmation navigation carries the full query string (`booking-parity.spec.ts:62,74`, `confirmation-parity.spec.ts:29`) | ✓ the CF contracts are new |
| No spec fetches `/sitemap.xml` or `/robots.txt` | grep `sitemap\|robots` over `tests/e2e/` → zero hits; `src/app/` has no `sitemap*`/`robots*` files (ls) | ✓ the S contracts are new |
| The clone's confirmation page renders unconditionally | `page.tsx:31` `name.split(" ")[0] \|\| name` → "" for missing name; the card at :85 has no date-gate; `buildIcs` :44 calls `toUtcStamp("", "")` → "T00Z" | ✓ the bug is real |
| The ICS lib owns the stamps; the page passes raw params | `page.tsx:37-43` passes `date, time, name, service` verbatim; `ics.ts:42-46` computes the stamps | ✓ the fix lands in one seam |
| The 12-route sitemap list matches the live | curl of the live's `/sitemap.xml` (this session): the 12 locs, all weekly, 1.0/0.8 | ✓ census captured |
| The robots body matches the live | curl of the live's `/robots.txt`: `User-agent: *`, `Allow: /`, blank line, `Sitemap: <origin>/sitemap.xml` | ✓ census captured |
| `siteUrl()` is the sanctioned origin seam | `src/lib/site.ts` (fallback-safe, unit-tested in `tests/site-url.test.ts`); `layout.tsx` metadataBase already uses it | ✓ reuse, no new env var |
| Route-folder names with dots work in App Router | Next 16 route segments allow literal dots (`app/sitemap.xml/route.ts` → `/sitemap.xml`); no conflict with the special `sitemap.ts`/`robots.ts` filenames (not created) | ✓ pattern valid |
| The e2e webServer env can pin the origin | `playwright.config.ts` webServer.env spreads process.env + explicit vars (PORT/DATABASE_URL/AUTH_SECRET precedent); server-side `process.env` reads are runtime in the standalone server | ✓ S1/S2 deterministic |
| The e2e specs don't read canonical/OG URLs | grep `metadataBase\|canonical\|og:` over `tests/e2e/` → zero assertion hits (head-parity checks favicon/manifest links only — relative hrefs) | ✓ env addition safe |
| The contact raw HTML carries the module | curl of the standalone build's `/contact` (this session): "Find us in the light", the NAP string, tel:/mailto:, @maisonluminaire, Get directions all present in the SSR payload | ✓ S3 will pin |
| The date/time regexes exist for the ICS guard | `src/app/api/appointments/route.ts` defines `DATE_RE`/`TIME_RE` (the same semantics; the ics lib gets its own copies — it must stay import-free of server modules) | ✓ no client-graph risk |
| `icon-parity` already covers the contact glyphs | `icon-parity.spec.ts:108` "the contact page carries MapPin directions, Reach-us icons, and the Hours status pill row" | ✓ no duplication |
| The full gate is green at the baseline | This session's Phase 4: lint ✓ · tsc ✓ · unit 66/66 · build 27/27 · e2e 133/133 (199 total) | ✓ baseline green |

## 7. Risks

- **The now-stamp fallback asserts DTSTART === DTSTAMP** — both derive from `Date.now()` within one `buildIcs` call, so they are equal by construction (same millisecond — the code computes `dtstamp` once and reuses it). The e2e decodes and compares the two fields as strings — deterministic. The live showed the same equality.
- **The CF3 "no time line" assertion** must target the card's line structure (not global text) — a stray "14:30" elsewhere on the page would false-fail; the card locator scopes it.
- **The sitemap's 4-space-indent byte format** is asserted in the unit layer (the builder's exact output); the e2e layer parses semantically (DOM parsing of the XML) so the two layers don't double-brittle each other.
- **The content-type divergence** (application/xml + text/plain vs the live's text/html) is deliberate and documented — matching a platform artifact would degrade the clone's correctness for no parity gain (the manifest precedent: the DECLARATION is the contract, not the artifact).
- **The card-visibility change alters the no-params rendering** — any consumer that relied on the empty card (none known — no spec, no link) sees the live-matching absence instead.
- **Playwright config env addition** — scoped to the webServer block; the dev/build flows are untouched; no existing assertion reads the origin.

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** RED — wrote the 4 CF contracts + the 3 S contracts + the 8 seo unit tests + the 6-test ICS fallback block; ran against the current build: **CF1–CF4 + S1/S2 red exactly as predicted** (the comma artifact, the empty card, the T00Z stamps, the 404s) and **S3 green immediately** (the F04 guard — the code already correct). One spec-side transcription fix during RED (the `base` fixture scoping; three expectation inputs corrected to mirror the live probes exactly — the implementation was not touched). 72→80 unit tests counting the new files.
- [x] **T2.** GREEN — implemented the `buildIcs` fallback layer (the regex guard + now-stamps + the Appointment/you texts), the confirmation page's conditional paragraph/card/lines, and `src/lib/seo.ts` + the two dot-named routes. **Mid-execution discovery:** NEXT_PUBLIC_* vars are INLINED in server bundles at build time — the planned `playwright.config.ts` runtime env pin cannot flow to a pre-built standalone server (verified empirically: neither the process env nor the standalone `.env` copy changes the served locs). The routes therefore prerender STATIC (matching the reference's own static files) and the specs assert the build-time canonical origin (`http://localhost:3000`, the repo `.env`'s documented value — the same one `metadataBase` bakes). The config change was reverted (dead weight); `.env.example` gained the build-time-baking note instead. All T1 tests green after the implementation.
- [x] **T3.** Full gate: lint ✓ (0 errors) · typecheck ✓ · unit **80/80** ✓ · build **29/29 routes** ✓ (27 pages + `/sitemap.xml` + `/robots.txt`, both ○ static) · e2e **140/140** ✓ = **220 total** — every pre-existing contract untouched (the confirmation-parity 536-char innerText, the booking-parity decoded-ICS, the whole 133-spec prior register).
- [x] **T4.** All 15 canonical screenshots re-captured on the remediated dev build: **5 byte-identical** (08-book 325255B, 09-login 189684B, 10-landing-mobile 350126B, **11-mobile-menu 26124B** — the mobile-drawer signal, zero v4 regression — 12-book-mobile 101671B); 02-services re-captured at the committed bottom-scroll convention (dark fraction 0.523, transition row 429 — structurally exact, 0.2% pixel noise); the remainder differ only by rendering-noise classes (reveal-animation timing, Google-Maps tile variance, CDN image rendering, backdrop-filter rasterization on the glass card, text antialiasing — mean-color verified identical on every one; all DOM contracts pinned green by the specs).
- [x] **T5.** Documentation aligned: README (badge 220, 80/140 counts, the SEO + confirmation-fallback feature rows, the testing-table spec list, one stale "collapses to opacity" phrasing fixed), AGENTS.md (the SEO-layer + confirmation-fallback architecture invariants, the two new spec contract lines, the 80/140 counts), CLAUDE.md (counts, the unit-layer description), PAD (the Layer-3 seo entry + the SEO-routes note, the testing table 80/140, the session-17 verification ledger, the 29-route build count), SKILL.md → **v1.14.0** (project_state, the §7 booking-flow fallback documentation, ADR-007, Appendix B inventory + counts, the Appendix C session-17 row), `.env.example` (the build-time-baking note on NEXT_PUBLIC_SITE_URL), the proper `docs/session_17.md` record, this plan's executed results, the worklog.
- [x] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local → shred the operator key. *(Executed — see §10.)*

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The confirmation-fallback fix (F05c) | `src/lib/ics.ts`, `src/app/book/confirmation/page.tsx` |
| The SEO layer (F07) | `src/lib/seo.ts`, `src/app/sitemap.xml/route.ts`, `src/app/robots.txt/route.ts` (new) |
| The e2e origin pin | `playwright.config.ts` |
| The pin contracts (F04 + F05c + F07) | `tests/e2e/confirmation-fallback-parity.spec.ts`, `tests/e2e/seo-parity.spec.ts` (new), `tests/ics.test.ts`, `tests/seo.test.ts` |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.14.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-17.md`, `docs/session_17.md`, `worklog.md` |

## 10. Push evidence (session 17)

- Committed as one atomic commit to `main` (the ICS/confirmation fixes + the SEO layer + the pin specs + the docs alignment + the plan/session-log/worklog + the re-captured screenshots).
- Key fingerprint verified before the push (the runbook's paramiko method — the sessions 1–16 operator key).
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in the staged diff or any tracked file; no tracked env/db/key files beyond `.env.example`; the operator key materialized outside the repo and shredded after the push.
- Push verified remote == local byte-exact; the T6-executed follow-up docs commit pushed the same way.
