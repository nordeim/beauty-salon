# Remediation Plan — Session 11 (The Links/Redirect Census + the Unknown-Service State + Case-Insensitive Routing)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `3f00dcc` (session-10 deliverable `b315845` + `8703f18` + the session_11 transcript commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded) + live parity verification with `skills/agent-browser` (login, the mobile drawer @390×844, and **the first-ever both-sides links/redirect census** — every `<a href>` on all 16 routes, plus the routing-behavior edge matrix: case-variant URLs, trailing slashes, unknown slugs, unknown categories, and the login OAuth surface — the two session-10 suggested candidates). Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-10 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 61/61 unit, 27/27 build pages, 81/81 e2e — 142 total) and the noise register is unchanged (the same two dev-only advisories; the secret-scan matches are the documented placeholder + prose).

This session's sweep followed the session-10 log's suggested candidates: **(a) a links/redirect census** — the first instrument ever to enumerate every `<a href>` on every route on both sides — and **(b) the login OAuth surface**. The census found 14/16 routes link-identical, two routes divergent, and — widened by following the redirect half of the census — a dedicated unknown-service state and a case-insensitive router on the reference that the clone's file-based router does not share.

**Four actionable findings: F1** the `/services` grid page is missing its bottom CTA (the `BOOK AN APPOINTMENT` pill link — the live's `pb-28` section has two children, the clone renders one; the innerText delta is exactly the 20 missing chars); **F2** the accessibility page renders the article title as plain text where the live wraps it in a dead `#` link; **F3** an unknown service slug renders the live's dedicated cream-editorial **"Service not found"** state (h1 + Return-to-the-almanac link inside the site chrome, HTTP 200) where the clone falls to the generic slate 404; **F4** the reference's SPA router matches routes **case-insensitively** (URL preserved — `/SERVICES`, `/Gallery`, `/BOOK/CONFIRMATION` all render; case-variant *slugs* still fail their lookup → the F3 state) and preserves **trailing slashes**, where the clone 404s case variants and 308-normalizes trailing slashes.

Plus one **measurement finding**: the OAuth button on the live navigates to Google via base44's platform OAuth (client_id `185178814199-…`, `redirect_uri=https://app.base44.com/api/apps/auth/callback`, state carrying the reference's own domain + app_id) — the clone's inert-button stance is re-verified correct (replicating would authenticate the clone's users against the *reference's* base44 app and land them on the reference's domain), and the live contract is now documented precisely rather than asserted.

## 2. Findings register (live-measured 2026-10-05, agent-browser, viewport 1280×900 unless noted)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F1 | MEDIUM — visible content gap on `/services` | services grid bottom | `<div class="mt-20 text-center"><a class="inline-block" href="/book"><span class="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary ">Book an appointment</span></a></div>` as the LAST child of `<section class="pb-28 px-3 md:px-6">` (after the grid div). Computed: link 16px Mulish 400 ink, inline-block; the span = the standard dark pill (session-1 token set). The span carries the reference's own trailing-space class artifact (inert — omitted per convention) and the settled `style="transform: none"` (computed-identical to default — omitted per the session-10 settled-state rule) | the `pb-28` section has ONE child (the grid); no CTA. innerText 1922 vs live 1942 — the delta is exactly `BOOK AN APPOINTMENT\n` |
| F2 | LOW-MEDIUM — visible link semantics on `/accessibility` | the article paragraph | `<p>To learn more about this, check out our article <a href="#" class="underline hover:text-foreground">"Accessibility: Adding an Accessibility Statement to Your Site"</a>.</p>` — computed 16px Mulish, `rgba(26,26,26,0.75)` (the prose /75), underline, offset auto | the same paragraph renders the quoted title as PLAIN TEXT (`src/lib/legal.ts:73`, a `kind:"p"` block) — the link markup is absent |
| F3 | MEDIUM — visible page state for unknown service slugs | `/services/not-a-real-service` (any unknown slug) | renders INSIDE the site chrome: title `Services \| Beauty Salon`, `<section class="pt-40 px-6 max-w-3xl mx-auto text-center"><h1 class="font-serif text-4xl mb-6">Service not found</h1><a class="text-[11px] uppercase tracking-editorial underline" href="/services">Return to the almanac</a></section>`, HTTP 200 | `notFound()` → the generic slate 404 page (`Service \| Beauty Salon` title), HTTP 404 |
| F4 | LOW — edge-case routing behavior | case-variant + trailing-slash URLs | `/SERVICES`, `/SeRvIcEs`, `/TEAM`, `/Gallery`, `/BOOK`, `/PRIVACY`, `/BOOK/CONFIRMATION` all render their pages (URL preserved, HTTP 200); `/SERVICES/BALAYAGE` renders the F3 "Service not found" state (route matched, slug lookup case-SENSITIVE); `/services/balayage/` renders the detail page with the URL kept (no redirect); per-page `<title>` derives from the RAW path segment (`startCase` — `/SeRvIcEs` → "Se Rv Ic Es \| Beauty Salon") | case variants 404 (Next's file router is case-sensitive); trailing slashes 308-normalize to the slashless URL. Titles are the fixed per-page metadata (the documented per-page-title divergence family) |
| F5 | INFO — measurement (no code change) | login OAuth surface | "Continue with Google" navigates to `accounts.google.com` via base44 platform OAuth: `client_id=185178814199-6a35e9aqcmlm15ig0upncg07c91av8do.apps.googleusercontent.com`, `redirect_uri=https://app.base44.com/api/apps/auth/callback`, `response_type=code`, state carrying `{domain, from_url, app_id}` of the REFERENCE's deployment | inert button (documented stance, `LoginForm.tsx`) — **re-verified correct**: replicating the navigation would depend on the reference's own platform app and land a successful auth back on the reference's domain. The live contract is now documented (this table) instead of asserted |
| F6 | INFO — verified holding | links census, 14/16 routes | `/`, `/gallery`, `/team`, `/about`, `/contact`, `/book`, `/login`, `/privacy`, `/terms`, `/refund`, all 8 `/services/[slug]`, `/book/confirmation` — the href sequence is IDENTICAL both sides (the confirmation modulo the per-load ICS UID/DTSTAMP — the session-8 contract holds) | same — no change |
| F7 | INFO — verified holding | routing edge matrix | `/services/` + `/book/` 200 both sides; `/gallery?category=xyz` → all 12 tiles (All fallback) both sides; `/book/unknown-sub` + `/team/unknown` → the 404 view both sides (HTTP 200 vs 404 — the documented SPA-fallback substrate divergence); the mobile drawer @390×844 identical both sides + tap-through closes + navigates (the task brief's emphasis — no Tailwind v4 regression) | same — no change |
| F8 | carried | advisories | `braces` + `deepmerge-ts` dev-only transitive advisories — the accepted-risk stance (sessions 2–10) re-verified unchanged | same |

## 3. Root cause

The session-10 lesson generalizes one step further: **innerText parity is blind to the link layer's MARKUP** (an href census sees targets, but F2's divergence is markup *inside* a paragraph whose text is identical) and **route-matrix parity is blind to the router's RESOLUTION behavior** (both sites "have" `/services/[slug]`, but the SPA resolves case-insensitively and falls back in-page, where the file router matches exactly and delegates to the global 404). Nine sessions of green innerText/style gates could not see F1 either — the missing CTA changes innerText by 20 chars, but no spec ever pinned the services grid page's innerText LENGTH or link count (the route-matrix work pinned existence, not census). Each unmeasured layer needs its own census + read-back contract; this session's instrument was the both-sides href enumeration + the routing edge matrix.

## 4. Design (the fixes)

### 4.1 F1 — the services grid CTA (`src/components/ServicesExperience.tsx`)

Add the live-measured wrapper as the last child of the `pb-28` section, after the grid div, using the established local pill-button idiom (`Link` + span — DOM-identical to the live's `<a>` + span; the contact page's "Reserve an appointment" is the in-repo precedent):

```tsx
<div className="mt-20 text-center">
  <Link className="inline-block" href="/book">
    <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary">
      Book an appointment
    </span>
  </Link>
</div>
```

Omitted per the established conventions: the live span's trailing-space class artifact (inert) and its settled `style="transform: none"` (computed-identical to default — the session-10 settled-state rule). Text: `Book an appointment` (the live's innerText is uppercase-styled by `uppercase`, the DOM text is mixed case).

### 4.2 F2 — the accessibility article link (`src/lib/legal.ts` + `src/components/LegalPage.tsx`)

Extend `LegalPBlock` with an optional inline link and render it inside the paragraph:

```ts
/** an inline <a> rendered around a substring of text (the article link) */
link?: { text: string; href: string; className?: string };
```

The `Paragraph` renderer splits `block.text` on `block.link.text` and renders `before + <a href className>linkText</a> + after`. The accessibility block becomes:

```ts
{ kind: "p", text: "To learn more about this, check out our article \"Accessibility: Adding an Accessibility Statement to Your Site\".",
  link: { text: "\"Accessibility: Adding an Accessibility Statement to Your Site\"", href: "#", className: "underline hover:text-foreground" } },
```

The `href="#"` is the reference's own dead link — replicated faithfully (the same stance as the dead manifest declaration; wiring a real target would exceed the reference).

### 4.3 F3 — the "Service not found" state (`src/app/(site)/services/[slug]/page.tsx`)

Replace `if (!service) notFound();` with the live-measured state (and change the `generateMetadata` fallback from `{ title: "Service" }` to `{ title: "Services" }` — the live's title for this state):

```tsx
if (!service) {
  return (
    <section className="pt-40 px-6 max-w-3xl mx-auto text-center">
      <h1 className="font-serif text-4xl mb-6">Service not found</h1>
      <Link className="text-[11px] uppercase tracking-editorial underline" href="/services">
        Return to the almanac
      </Link>
    </section>
  );
}
```

The page renders inside the site chrome (the `(site)` layout) with HTTP 200 — matching the reference exactly. SEO note: this is a deliberate soft-404-for-parity decision, documented; the reference behaves identically.

### 4.4 F4 — case-insensitive routing + trailing-slash preservation (`src/middleware.ts`, new)

A ~30-line middleware that rewrites (never redirects — the URL bar stays, as on the reference):

1. **Case variants:** if the pathname contains an uppercase letter, rewrite to the lowercased path — EXCEPT under `/services/…`, where only the FIRST segment is lowercased so the slug's case is preserved for the (case-sensitive) lookup → `/SERVICES/BALAYAGE` rewrites to `/services/BALAYAGE` → renders the F3 state, exactly the reference.
2. **Trailing slashes:** `/services/balayage/` rewrites to `/services/balayage` (URL preserved, page renders — no 308).

Guards: skip `/_next`, `/api`, and any path already equal to its rewrite target. Route existence is NOT checked — an unknown path (`/Nonexistent` → `/nonexistent`) rewrites harmlessly and still 404s, the same outcome as no rewrite (the reference renders its 404 view for it too). Assets and API routes are all lowercase in this app, so the uppercase guard excludes them by construction.

**Registered accepted divergence (F4 title artifact):** the reference's per-page `<title>` on case-variant URLs derives from the RAW path (`startCase(pathSegment)` — `/SeRvIcEs` → "Se Rv Ic Es | Beauty Salon"); the clone renders the route's canonical title ("Services | Beauty Salon"). The title layer is already the documented per-page-title divergence family (the clone's titles are deliberately better); the case-variant derivation joins that register. No code change.

### 4.5 F5 — OAuth: documentation only

The live-measured contract (§2 F5) is recorded in the docs; the inert button stands. No code change.

## 5. TDD plan

**T1 (RED):** write `tests/e2e/links-parity.spec.ts` — the four finding contracts + regression guards:
- F1: the services page's `pb-28` section has 2 children; the CTA wrapper `mt-20 text-center`; the link `inline-block` + `/book` + the pill span's class set + text; computed `margin-top` 80px @1280; the services-page link count is now 28 with `/book` appearing 3× (header, CTA, footer)
- F2: the accessibility page's link `href="#"` + `underline hover:text-foreground` + the quoted title text; computed underline + offset auto; the paragraph text unchanged (the innerText contract holds)
- F3: `/services/not-a-real-service` renders the h1 + the Return link (`text-[11px] uppercase tracking-editorial underline` + `/services`), inside the site chrome (the site footer present), HTTP 200, title `Services | Beauty Salon`
- F4: `/SERVICES` renders the services h1 with the URL preserved; `/SERVICES/BALAYAGE` renders the F3 state; `/BOOK/CONFIRMATION?name=…` renders the confirmation; `/services/balayage/` renders the detail page with the URL preserved (no 308)
- Guards: the landing link census (33 hrefs in the documented sequence — the F1-class regression net), `/gallery` still 200 + the known link set, and the standing assertion that `/definitely-not-a-page` still renders the generic 404 (the not-found contract must NOT regress — F3 is services-scoped only)

**T2 (GREEN):** apply §4.1 + §4.2 + §4.3 → re-run the new spec (expect F1/F2/F3 groups green; F4 groups still red — the middleware is T3).

**T3 (GREEN):** apply §4.4 (the middleware) → the F4 groups green.

**T4:** full gate — `lint → typecheck → test (61 unit) → build (27 pages) → test:e2e` — with every pre-existing spec untouched (verified: the only 404-status assertion is head-parity's `/manifest.json` fetch; the not-found spec's `/definitely-not-a-page` is lowercase → untouched by the middleware).

**T5:** live re-verification (agent-browser): the services CTA value-by-value; the accessibility link; the unknown-slug state; the case/trailing-slash matrix on both sides; the drawer standing check; 15 screenshots re-captured.

**T6:** documentation alignment — README (feature rows + counts), AGENTS.md (invariants + contract lines), CLAUDE.md (counts), PAD (§7 ledger + inventory), `beauty-salon_SKILL.md` v1.8.0, `docs/session_11.md` (the proper record), worklog, `.env.example` re-verified.

**T7:** commit + SSH-wrapper push to `main`; verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| F1 fix site: `ServicesExperience.tsx` `pb-28` section | `src/components/ServicesExperience.tsx:66-95` — the section has one child (the grid div) | ✓ matches |
| F1 pill idiom exists in-repo | `contact/page.tsx:93-100` (Reserve an appointment) + `SiteHeader.tsx:125` — the same class set | ✓ matches |
| F2 fix site: the `LegalPBlock` model | `src/lib/legal.ts:12-21` (no link field yet) + `LegalPage.tsx:48-61` (the Paragraph renderer) | ✓ matches |
| F3 fix site: the detail page | `src/app/(site)/services/[slug]/page.tsx:33` (`if (!service) notFound();`) + `:22` (fallback title "Service") | ✓ matches |
| F4: no middleware exists | no `middleware.ts`/`src/middleware.ts` in the tree | ✓ clean slate |
| F4: assets/API are lowercase | `public/images/*`, `/_next/*`, `/api/*` — no uppercase paths | ✓ guard safe |
| No spec pins unknown-service→404 | the only 404-status assertion is `head-parity.spec.ts:49` (`/manifest.json`); no spec references unknown service slugs | ✓ no conflict |
| The not-found spec's path is lowercase | `not-found-parity.spec.ts` uses `/definitely-not-a-page` | ✓ untouched by the middleware |
| The confirmation ICS holds | the census diff = per-load UID/DTSTAMP only (session-8 contract) | ✓ no change needed |
| The unit layer is untouched by all fixes | all four fixes are UI/middleware; `tests/*.test.ts` target libs (ics, db-path, site-url, auth, content, repo-hygiene, api) | ✓ 61/61 unaffected |

## 7. Risks

- **Middleware on every request** (F4): the matcher must exclude `_next`/`api` (done via the uppercase + trailing-slash guards; both classes are absent from asset paths by construction). A wrong rewrite could shadow static assets — the T4 full gate + the screenshot re-capture (which loads every image) are the net.
- **Soft-404 SEO** (F3): unknown service slugs now return 200 with the "Service not found" view — deliberate parity (the reference behaves identically); documented in AGENTS.md so a future agent doesn't "fix" it back to `notFound()`.
- **The F2 model extension** touches the shared `LegalBlock` type — the change is additive (an optional field), and the legal-parity spec guards the existing rendering on all four legal pages.

---

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** RED — write `tests/e2e/links-parity.spec.ts` (the F1–F4 groups + the census guards); run against the current build; expect every actionable group red exactly as the register predicts. *(Executed: 8/8 actionable tests failed exactly as predicted after two spec-side shapings on the guards — the gallery census is 20 links (the 12 tiles are buttons, not anchors) and the generic-404 marker is the slate card (the 404 page carries its own site header/footer); all three regression guards green (landing 33-href census, gallery census, generic-404).)*
- [x] **T2.** GREEN — apply §4.1 (the services CTA), §4.2 (the `LegalPBlock.link` field + the Paragraph split-renderer), §4.3 (the Service-not-found state + the `Services` fallback title). *(Executed; the F1/F2/F3 spec groups green.)*
- [x] **T3.** GREEN — apply §4.4 (`src/proxy.ts` + `skipTrailingSlashRedirect`). *(Executed with **two engine facts discovered mid-run**: Next 16 deprecates the `middleware` filename (build warning — renamed to the `proxy` convention), and the router's trailing-slash 308 fires BEFORE the proxy (fixed via `skipTrailingSlashRedirect: true` — the proxy then rewrites, URL preserved); the F4 groups green.)*
- [x] **T4.** Full gate: `lint → typecheck → unit 61/61 → build 27/27 pages → e2e` (81 pre-existing + 11 new, all green; no weakened assertions). *(Executed: lint ✓ · tsc ✓ · unit 61/61 ✓ · build 27/27 ✓ · e2e **92/92** ✓ — **153 total**.)*
- [x] **T5.** Live re-verification of the remediated surfaces + re-capture the 15 screenshots; VLM-verify the key captures. *(Executed: the services CTA verified value-by-value (structure, computed 16px Mulish ink, the pill span's bg/color/radius/px/py, 2 section children, mt 80px, /book ×3, innerText **1942 = live exact**); the accessibility link (paragraph HTML identical, underline + offset auto; the /75 color as oklab channels — the trap-7 family); the unknown-service state (HTTP 200, title, section HTML, site chrome); the routing matrix (`/SERVICES/BALAYAGE` → Service-not-found URL-preserved; `/BOOK/CONFIRMATION` → confirmation; `/TEAM` → team; `/definitely-not-a-page` → generic 404; `/services/balayage/` → 200 no-redirect). 15 captures re-taken — mobile-menu 26124B byte-identical (the pixel signal), 10 + 12 byte-identical; 02 re-captured scrolled to the new CTA (below the fold at 900px); VLM-verified 02 (constrained re-prompt after discarding one hallucinated-HTML pass), 14 (flower present), 04, 06.)*
- [x] **T6.** Documentation aligned (README badge 153 + the links/routing feature row; AGENTS the four new invariants + the proxy-convention + 308-before-proxy quirks + the contract line; CLAUDE counts + parity list; PAD §7 inventory 61/92 + the session-11 ledger; SKILL **v1.8.0** — project_state, Appendix B, Appendix C); `.env.example` re-verified truthful (unchanged — the proxy reads no env); the proper `docs/session_11.md` record; the worklog entry. *(All applied.)*
- [x] **T7.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed — see the push evidence in §9.)*

## 9. Push evidence (session 11)

- Committed as one atomic commit to `main`; pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the wrapper's default remote is the runbook's task-management origin — the session 8–10 note); remote == local verified post-push; operator key shredded.

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The services grid bottom CTA | `src/components/ServicesExperience.tsx` |
| The accessibility article link (the `LegalPBlock.link` model) | `src/lib/legal.ts`, `src/components/LegalPage.tsx` |
| The "Service not found" state | `src/app/(site)/services/[slug]/page.tsx` |
| Case-insensitive routing + trailing-slash preservation | `src/proxy.ts` (new), `next.config.ts` |
| Parity contracts | `tests/e2e/links-parity.spec.ts` (new, +11 e2e) |
| Screenshots | `docs/screenshots/*.png` (re-captured; 02 scrolled to the CTA) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.8.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-11.md`, `docs/session_11.md`, `worklog.md` |
