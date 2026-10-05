# Remediation Plan — Session 7 (Service Detail Pages + Legal Page Structure)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `e8dfe94` (session-6 slate-900 remediation `205e437` + `3cb1222` + the `docs/session_7.md` transcript commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as a targeted lightweight checklist — the runner destabilized shells in session 4; `skills/` excluded) + live parity verification with `skills/agent-browser` (drawer @390×844 live+local, login slate-900 live+local, landing tokens, 404, status pill, about/team/gallery content, ALL 4 legal pages DOM-level both sides, ALL 8 service detail pages live — including per-item FAQ accordion extraction and animation sampling). Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-6 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 55/55 unit, 27/27 build pages, 46/46 e2e) and every pinned parity surface holds byte-identical live and local (drawer, login font + slate-900, landing, 404, status pill, contact, about, team). But this session widened the sweep to the two surfaces the session-6 log itself flagged as candidates — **the legal pages and the service detail pages** — and both turn out to carry real parity gaps that every previous audit missed because their e2e coverage asserted content presence, not the reference's DOM structure:

- **F1 (MEDIUM, the service detail pages — 8/8 affected):** the reference's detail page has six sections; the clone ships four of them, and two of those four diverge structurally. Missing entirely: the **FAQ section** ("Frequently asked." — an exclusive-open accordion, first item open by default, chevron `rotate-180`, height/opacity mount animation) and the **"Ready to begin?" dark CTA section** (`bg-foreground text-background`, "Reserve {service} with the next available stylist.", an inverted pill). Divergent: the description-section H2 (live renders the **first sentence of `longDescription`**; the clone renders a synthetic `name — tagline.` line that appears nowhere in the reference) and the prep list (live: check icons + `border-b` rows + `text-foreground/80 leading-[1.6]` spans, `gap-x-10 gap-y-5`, each `li` wrapped in a reveal `div` inside the `ul`; clone: numbered `01`–`04` items, `gap-x-12 gap-y-6`, `text-foreground/75 leading-[1.7]`, bare `li`). The clone also renders an extra "Book this treatment" CTA at the end of the prep section that the reference does not have.
- **F2 (MEDIUM, `/accessibility`):** the reference's accessibility statement carries an **8-item adjustments checklist** (`ul.list-disc.pl-6.mt-3.space-y-1`) the clone omits entirely — the clone's `LegalBlock` model supports only `p`/`h2`, so a list is structurally unrepresentable. Also: in-section subsequent paragraphs use `mt-3` (12px) on the reference vs the clone's `mt-4` (16px); the two "[only add if relevant]" notes render as `text-sm text-foreground/50 italic` on the reference vs plain; the coordinator block is a `mt-3` paragraph with `<br>` separators on the reference vs a `mt-4` single-line paragraph in the clone; and the intro block renders as three direct prose-DIV children (plain / `text-sm text-foreground/50 italic` / plain) vs the clone's serif-italic disclaimer styling on P1 + a wrapper `div` around P2/P3.
- **F3 (LOW–MEDIUM, `/privacy` + `/terms`):** on the reference, paragraphs **after the first** paragraph of a section are hoisted to the top level (direct children of the prose DIV, 40px gaps via `space-y-10`); the clone keeps them inside the section at `mt-4` (16px). Content is identical; the DOM shape and the inter-paragraph rhythm differ. `/refund` is unaffected (single-paragraph sections only).
- **F4 (carried, accepted):** the two dev-only transitive advisories (`braces`, `deepmerge-ts`) — re-verified; the session-2 accepted-risk stance stands.
- **F5 (convention):** `docs/session_7.md` as pulled is the raw session-6 process transcript — replaced with the proper session-7 log at wrap-up.

F1–F3 are fixed this session with the established TDD discipline: new parity specs go RED first (pinned to values live-measured this session), then the code changes make them green, then the full gate re-runs, screenshots re-capture on the remediated build, and the docs align.

---

## 2. Findings Register

| ID | Severity | Category | Finding | Evidence |
|----|----------|----------|---------|----------|
| F1a / S1 | **MEDIUM** | Parity gap (all 8 service detail pages) | Description-section H2: the reference renders the **first sentence of `longDescription`** (`mt-6 font-serif text-4xl md:text-6xl leading-tight text-balance`, 60px @1280); the clone renders a synthetic `{name} — {tagline}.` line that exists nowhere in the reference DOM. Verified 8/8: e.g. balayage live H2 = "Our Signature Balayage is a freehand color application performed by our master colorists." (= first sentence of the seed's `longDescription`); bridal-package live H2 = "Designed for the bride who wants to feel unmistakably herself." The paragraph below is the full `longDescription` both sides. | agent-browser @1280×720, all 8 slugs live + seed `prisma/seed.ts` cross-check |
| F1b / S1 | **MEDIUM** | Parity gap (prep list) | Live: `ul.mt-12.grid.grid-cols-1.md:grid-cols-2.gap-x-10.gap-y-5` whose children are reveal `div` wrappers each containing `li.flex.items-start.gap-4.pb-5.border-b.border-foreground/10` with a `Check` icon (`lucide-check h-4 w-4 mt-1 text-secondary flex-shrink-0`) + `span.text-foreground/80.leading-[1.6]`. Clone: bare numbered `li` (`01`–`04` spans), `gap-x-12 gap-y-6`, `text-foreground/75 leading-[1.7]`, no icon, no border. | agent-browser live outerHTML vs `services/[slug]/page.tsx:111-120` |
| F1c / S1 | **MEDIUM** | Parity gap (extra element) | The clone renders a "Book this treatment" pill (`mt-16`) at the end of the prep section; the reference's prep section is exactly H2 + UL (the CTA lives in the treatment card and the Ready-to-begin section only). | live section walk (SECTION `py-20 … bg-accent/20` children = H2 + UL only) |
| F1d / S1 | **MEDIUM** | Missing feature (FAQ section, all 8 pages) | Live section: `SECTION.py-28 px-3 md:px-6` > `DIV.max-w-[900px] mx-auto` > [reveal `div` > `H2.mt-6.font-serif.text-4xl.md:text-6xl` "Frequently asked.", `DIV.mt-16.divide-y.divide-foreground/10.border-y.border-foreground/10` > items]. Each item: `div.py-2` > `button.w-full.flex.items-center.justify-between.gap-6.py-6.text-left` > `span.font-serif.text-2xl.md:text-3xl` (question) + `ChevronDown.h-5.w-5.flex-shrink-0.transition-transform.duration-500` (+`rotate-180` when open); when open a wrapper `div.overflow-hidden` (inline `height: auto; opacity: 1` settled; sampled animation: height 0→auto over ~660ms, opacity 0→1) containing `p.pb-8.text-foreground/75.leading-[1.7].max-w-xl` (answer). **Exclusive-open** (opening item 1 closes item 0); item 0 open by default; collapsed items unmount the answer (no wrapper in the DOM). FAQ data does not exist in the clone (no schema field) — extracted live this session for all 8 services (3 items for balayage + hydrafacial; 1 for each of the other six — full Q/A set in §5.1). | agent-browser live DOM + interaction tests + frame sampling; `prisma/schema.prisma` (no faq field) |
| F1e / S1 | **MEDIUM** | Missing feature (Ready-to-begin CTA, all 8 pages) | Live section: `SECTION.py-24 px-3 md:px-6.bg-foreground.text-background` > `DIV.max-w-[900px] mx-auto.text-center` > `H2.font-serif.text-5xl.md:text-7xl.leading-[0.95]` "Ready to begin?" + `P.mt-6.text-background/70.max-w-md.mx-auto` "Reserve {service name lowercased} with the next available stylist." + `DIV.mt-10` > `A.inline-block` (href `/book?service={slug}`) > pill `span` `…px-9 py-4 bg-background text-foreground hover:bg-accent` "Book this treatment". Verified the lowercase pattern on balayage/precision-cut/bridal-package. | agent-browser live DOM (all classes captured) |
| F2a / S2 | **MEDIUM** | Parity gap (`/accessibility`) | The 8-item adjustments checklist (`ul.list-disc.pl-6.mt-3.space-y-1`, 8 `li`, disc, pl 24px, mt 12px, 4px inter-item via `space-y-1`, li 16px/28.8px `rgba(26,26,26,0.75)`) is absent from the clone — `LegalBlock` supports only `p`/`h2`, so the list is structurally unrepresentable. | live computed styles vs `src/lib/legal.ts:4-7` |
| F2b / S2 | **MEDIUM** | Parity gap (`/accessibility`) | In-section subsequent paragraphs: live `mt-3` (12px) vs clone `mt-4` (16px) — affects "We at [enter organization…]", "The accessibility of certain pages…", "[Enter a description…]", coordinator block. | live computed marginTop vs `LegalPage.tsx:42` (`j > 0 ? "mt-4"`) |
| F2c / S2 | **MEDIUM** | Parity gap (`/accessibility`) | The two "[only add if relevant]" notes render `text-sm text-foreground/50 italic` (mt 0, first in section) on live; plain in the clone. Same variant (but top-level, 40px via `space-y-10`) for the intro "*Note: This page currently has several sections…" paragraph. | live P class dump |
| F2d / S2 | **MEDIUM** | Parity gap (`/accessibility`) | Coordinator block: live `p.mt-3` with the four bracket lines joined by `<br>`; clone `p.mt-4` with `\n`-joined text (HTML collapses to one line). | live innerHTML vs `legal.ts:62` |
| F2e / S2 | **MEDIUM** | Parity gap (`/accessibility`) | Intro block: live renders P1 "The purpose of the following template…" as a **plain** top-level P (the serif-xl-italic disclaimer styling belongs to the OTHER three legal pages' "A legal disclaimer" first line only), P2 "*Note:…" as a top-level `text-sm text-foreground/50 italic` P, P3 "To learn more…" plain — all direct children of the prose DIV. Clone: P1 carries the disclaimer styling; P2/P3 sit inside a wrapper `div`. | live P dump (parents + classes) vs `LegalPage.tsx:27-29,36` |
| F3 / S3 | LOW–MEDIUM | Parity gap (`/privacy`, `/terms`) | Reference convention: a section wraps its H2 + **first** paragraph only; every later paragraph is a **direct child of the prose DIV** (40px gaps). Privacy: "Different jurisdictions…" hoisted; Terms: "T&C should be defined…" + "T&C provide you…" hoisted. Clone: all subsequent paragraphs inside the section at `mt-4`. Content byte-identical (privacy 1808/1808, terms 2035/2035, refund 1613/1613, accessibility Δ401 = exactly the missing checklist + br/spacing deltas). | live P dumps with parents + computed mt |
| F4 / S4 | MEDIUM (carried, accepted) | Supply chain (dev-only) | `braces ≤3.0.3` (eslint chain) + `deepmerge-ts <8` (Prisma CLI chain) — dev-only transitive; no runtime exposure; no upstream fix exists. | `bun audit` this session: exactly the two documented advisories |
| F5 / S5 | LOW | Doc structure | `docs/session_7.md` (pulled at `e8dfe94`) is the raw session-6 transcript — the standing convention; replaced at wrap-up. | read of the file |
| F6 | — | Verified conforming (no action) | Baseline gate green (lint ✓ · tsc ✓ · unit 55/55 ✓ · build 27/27 ✓ · e2e 46/46 ✓). Pinned parity surfaces byte-identical live vs local this session: mobile drawer (fixed inset-0 z-60 cream `rgb(250,248,245)`, 5 links 48px Cormorant −1.2px lh-48 w400 `rgb(26,26,26)`, links container flex-col gap 8px, CTA wrapper mt 40px, no scroll lock, tap closes+navigates — verified on BOTH sides), login (h1 + Sign In `rgb(15, 23, 42)` both sides, default sans stack), landing hero (102.4px/−2.56px/black, cream body), 404 (72px/300/`rgb(203,213,225)` slate card, path-interpolated), status pill ("Closed today" 11px both sides — date-aware), about (1198/1198), team (864/864), gallery h1 (136px Cormorant), legal wrapper classes (`pt-40 md:pt-52 pb-28 px-6 md:px-10` / `max-w-[800px] mx-auto` / `mt-12 space-y-10 text-foreground/75 leading-[1.8]` / h1 `mt-6 font-serif text-5xl md:text-7xl`), service hero + treatment card + image section (all classes byte-identical), refund page structure, session-6 diff re-review (slate-900 pin + read-back contract conform to design). | this session's audit + measurements |

**Explicitly out of scope (per instructions):** the `skills/` folder is excluded from code checking, testing, and compilation (honored by `eslint.config.mjs` ignores + `tsconfig.json` exclude + test-dir seams).

---

## 3. Root-Cause Analysis

**F1 (service detail pages).** Session 1 authored the detail page from the visual sweep of ONE service (balayage) at low depth: the hero, image, description, and prep sections were extracted, but the FAQ and Ready-to-begin sections live below the fold and were never scrolled to; the description-section H2 was *composed* (`name — tagline`) rather than *measured*; the prep list was styled by analogy to other numbered lists in the app instead of reading the reference's own markup. The e2e suite then pinned the clone's own DOM (`auth.spec.ts` asserts the h1, price, duration, card link, "Before your visit" heading — all of which pass on both the reference-shaped and the clone-shaped page), so the gap survived five audits. This is the session-5 404 finding's sibling: **an unmeasured surface drifts, and a spec written against the clone's own DOM cannot catch the drift.** The difference here: the 404 was one surface; this is eight pages carrying two missing features.

**F2/F3 (legal pages).** Session 1 extracted the legal *text* verbatim (content lengths prove it) but flattened the reference's *structure* into a uniform `p`/`h2` block model. The reference's Wix-template pages carry richer structure the model cannot express: the accessibility checklist (a `ul`), the small-italic note variant, the `<br>`-separated coordinator block, the per-page difference between "sections keep their paragraphs" (accessibility) and "sections hoist later paragraphs to the top level" (privacy/terms). `groupBlocks` then silently rewrote the tree into its own shape — a rendering decision, not a parity decision. The lesson generalizes F1's: **content parity without DOM parity is not surface parity** — computed text lengths matched while the rendered page differed.

**F5 (transcript).** The prior session committed its working transcript as `session_7.md` (the established hand-off convention — sessions 4/5/6 did the same and replaced theirs at wrap-up). Same treatment here.

---

## 4. Remediation Design

### 4.1 F1 — the service detail pages

**Schema + seed.** Add `faqs String` to `Service` (JSON array of `{ q, a }` — the `prep` precedent: JSON-array-in-a-text-column, parsed at the read seam). Extend `prisma/seed.ts` with the live-extracted FAQ data for all 8 services (§5.1); `bun run db:push` + `bun run db:seed` (idempotent upserts update the existing rows; the e2e global-setup pushes+seeds `db/e2e.db` itself).

**DTO.** `ServiceDto` (client-safe `content.ts`) gains `faqs: { q: string; a: string }[]`; `data.ts` maps + parses (`safeParse` sibling for object arrays). `firstSentence(text: string): string` helper in `content.ts` (pure, client-safe, unit-testable): returns the text up to and including the first `". "` boundary (whole text if no boundary) — validated 8/8 against live this session.

**Page (`services/[slug]/page.tsx`).**
- Section 3: `<Reveal><h2>{firstSentence(service.longDescription)}</h2></Reveal>` + `<Reveal><p className="mt-10 …">{service.longDescription}</p></Reveal>` (classes unchanged — already byte-identical).
- Section 4: UL → `mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5`; items → `<Reveal>` (default `div`, matching the reference's div-in-ul reveal wrapper) wrapping `<li className="flex items-start gap-4 pb-5 border-b border-foreground/10">` + `<Check className="h-4 w-4 mt-1 text-secondary flex-shrink-0" aria-hidden />` + `<span className="text-foreground/80 leading-[1.6]">{item}</span>`; the extra `mt-16` CTA block is **removed**.
- Section 5 (new): `<section className="py-28 px-3 md:px-6"><div className="max-w-[900px] mx-auto"><Reveal><h2 className="mt-6 font-serif text-4xl md:text-6xl">Frequently asked.</h2></Reveal><FaqAccordion items={service.faqs} /></div></section>`.
- Section 6 (new): the Ready-to-begin section per the measured contract; P text `Reserve ${service.name.toLowerCase()} with the next available stylist.`; pill `bg-background text-foreground hover:bg-accent`.

**`FaqAccordion` (new client island, `src/components/FaqAccordion.tsx`).** State: `openIndex` (init `0` — the reference's default). Click: exclusive toggle (`setOpenIndex(i === openIndex ? -1 : i)`). Markup per the measured contract: `div.mt-16.divide-y.divide-foreground/10.border-y.border-foreground/10` > per item `div.py-2` > button (`w-full flex items-center justify-between gap-6 py-6 text-left`) > `span.font-serif.text-2xl.md:text-3xl` + `ChevronDown` (`h-5 w-5 flex-shrink-0 transition-transform duration-500` + `rotate-180` when open); when open, `div.overflow-hidden` (inline `height: auto; opacity: 1` — the settled live state) with `animation: faq-open …` (a `globals.css` keyframe: max-height 0→320px + opacity 0→1, ~600ms ease — dependency-free approximation of the reference's ~660ms height 0→auto animation; answers measure <100px so 320px never clips) containing `p.pb-8.text-foreground/75.leading-[1.7].max-w-xl`. Collapsed items render no wrapper (matching the reference's unmount-on-collapse).

### 4.2 F2 + F3 — the legal pages

**Model (`src/lib/legal.ts`).** `LegalBlock` becomes a union:
- `{ kind: "p"; text: string; variant?: "plain" | "disclaimer" | "note"; hoist?: boolean; br?: boolean }` — `disclaimer` = `font-serif text-xl italic text-foreground/60` (the "A legal disclaimer" first line of privacy/terms/refund); `note` = `text-sm text-foreground/50 italic`; `hoist` = render as a top-level prose-DIV child (closes the open section — the privacy/terms convention); `br` = render `\n`-separated text with `<br>` (the coordinator block).
- `{ kind: "h2"; text: string }`
- `{ kind: "ul"; items: string[]; className: string }` — the accessibility checklist (`list-disc pl-6 mt-3 space-y-1`).

Data updates: privacy ("Different jurisdictions…" gets `hoist`), terms (two hoisted Ps), accessibility (P1 plain, P2 note, P3 plain — all top-level; the checklist `ul` block after the adjustments paragraph; the two "[only add if relevant]" notes get `variant: "note"`; the coordinator block gets `br: true`; **no** `disclaimer` on this page). Refund unchanged.

**Renderer (`src/components/LegalPage.tsx`).** Flat render into the prose DIV: `h2` opens `<section>` (`<h2 className="font-serif text-2xl mb-3 text-foreground">` + first child, no mt); subsequent in-section children (`p`/`ul`) carry `mt-3`; a `hoist`ed `p` renders as a direct prose-DIV child (no wrapper `div` — the reference has none); the `disclaimer` variant keeps its serif-italic-xl classes; the `note` variant gets `text-sm text-foreground/50 italic`. The headingless-wrapper `div` branch disappears (the reference renders top-level Ps directly).

### 4.3 F5 — session log

Replace `docs/session_7.md`'s transcript with the proper session-7 log at wrap-up.

### 4.4 F4 — carried advisories

Re-verified; no upstream fix exists. No action; the register documents the stance.

### 4.5 Tests (TDD — the new parity contracts)

- **Unit:** `tests/first-sentence.test.ts` — `firstSentence` (basic split / no boundary returns whole text / returns text with the period / empty string). Also `tests/legal-blocks.test.ts` if any pure helpers emerge from the legal rework (the grouping logic is render-side; only `firstSentence` needs a unit seam — keep it honest).
- **E2E `tests/e2e/service-detail-parity.spec.ts`:** (1) the description section renders the first-sentence H2 + full-text P (balayage, exact strings); (2) the prep list contract (2-col grid, `Check` svg present, `li` carries `border-b` + computed `padding-bottom: 20px`, no numbered `01` spans, span color `rgba(26, 26, 26, 0.8)`); (3) the FAQ contract (h2 "Frequently asked.", 3 items for balayage, item 0 open by default with visible answer + chevron `rotate-180`, item 1 collapsed with NO answer wrapper in the DOM, click item 1 → item 0's answer unmounts + item 1's mounts, click item 1 again → all collapse); (4) the Ready-to-begin contract (h2, the exact lowercase reserve sentence, link href `/book?service=balayage`, pill `bg-background` on the dark section) — plus a 1-item-service pass (precision-cut: single FAQ open by default).
- **E2E `tests/e2e/legal-parity.spec.ts`:** (1) accessibility checklist (8 `li`, `ul` classes, computed pl-24px/mt-12px, disc, first + last item text); (2) accessibility notes + spacing (the "[only add if relevant]" Ps compute `font-size: 14px` + italic; in-section second Ps compute `margin-top: 12px`; coordinator block renders 4 lines via `<br>`); (3) privacy hoisting ("Different jurisdictions…" P's parent is the prose DIV, not a `section`, computed mt 40px); (4) terms hoisting (both T&C Ps top-level).

Expected RED state: every new assertion fails against the current build (the FAQ/Ready-to-begin/checklist/hoisting surfaces don't exist; the mt values are 16px; the H2 is the synthetic line).

### 4.6 Documentation alignment (post-fix)

README (features + testing table + badges), AGENTS.md (the first-sentence convention + the FAQ/Ready-to-begin contract + the legal block model), CLAUDE.md (counts + component map), PAD (§4 data architecture `faqs` column, §7 inventory + session-7 ledger), `beauty-salon_SKILL.md` v1.4.0 (project_state, checklist counts, Appendix B/C), `docs/Tailwind-V4-Validation-Report.md` — no new engine trap this session (the div-in-ul reference DOM and the br-coordinator are DOM-shape notes, not v4 behavior; document in SKILL §5 patterns instead). `.env.example` re-verify (no env change — expected unchanged).

### 4.7 Screenshots

Re-capture the 15 canonical captures on the remediated dev build (03-service-detail now shows the FAQ + Ready-to-begin sections; 06-about and others expected byte-identical). VLM-verify the service-detail capture (the most changed surface) + the mobile-menu capture (the standing parity-critical check).

---

## 5. Live-Extracted Reference Data (this session's measurements)

### 5.1 FAQ data (all 8 services, extracted item-by-item from the live accordion)

| slug | Q | A |
|---|---|---|
| balayage | How long does balayage last? | Depending on home care, most clients return every 10–14 weeks for a refresh. |
| balayage | Will it damage my hair? | We use bond-building systems throughout the service to preserve integrity and shine. |
| balayage | Can I do this on dark hair? | Absolutely — we customize lift levels to create dimension on any base tone. |
| precision-cut | How often should I cut? | We typically recommend every 8–10 weeks for shape retention. |
| glossing-treatment | Is it a permanent color? | Gloss is semi-permanent and fades gracefully over 4–6 weeks. |
| hydrafacial | How often should I get a HydraFacial? | Most clients benefit from a treatment every 4 weeks. |
| hydrafacial | Is there any downtime? | None — your skin will look radiant immediately after. |
| hydrafacial | Can I wear makeup after? | We recommend waiting 4–6 hours so serums can fully absorb. |
| signature-facial | Is this good for sensitive skin? | Yes — every protocol is adjusted to your skin's tolerance. |
| gel-manicure | How long does gel last? | Typically 2–3 weeks with proper home care. |
| signature-pedicure | How long does a pedicure last? | With gel polish, expect 3–4 weeks of flawless wear. |
| bridal-package | Do you travel? | Yes, on-location services are available with a travel fee. |

### 5.2 The accessibility checklist (8 items, verbatim)

Used the Accessibility Wizard to find and fix potential accessibility issues · Set the language of the site · Set the content order of the site's pages · Defined clear heading structures on all of the site's pages · Added alternative text to images · Implemented color combinations that meet the required color contrast · Reduced the use of motion on the site · Ensured all videos, audio, and files on the site are accessible

### 5.3 Structural contracts (measured)

- FAQ item: `div.py-2` > `button.w-full.flex.items-center.justify-between.gap-6.py-6.text-left` > `span.font-serif.text-2xl.md:text-3xl` + `ChevronDown.h-5.w-5.flex-shrink-0.transition-transform.duration-500[.rotate-180]`; open wrapper `div.overflow-hidden` style `height: auto; opacity: 1` > `p.pb-8.text-foreground/75.leading-[1.7].max-w-xl`; list `div.mt-16.divide-y.divide-foreground/10.border-y.border-foreground/10`; section `py-28 px-3 md:px-6` > `max-w-[900px] mx-auto`; H2 `mt-6 font-serif text-4xl md:text-6xl` "Frequently asked."
- Ready-to-begin: section `py-24 px-3 md:px-6 bg-foreground text-background` > `max-w-[900px] mx-auto text-center` > H2 `font-serif text-5xl md:text-7xl leading-[0.95]` + P `mt-6 text-background/70 max-w-md mx-auto` + `div.mt-10` > `a.inline-block` > pill `…px-9 py-4 bg-background text-foreground hover:bg-accent`.
- Prep item: `ul.mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5` > reveal `div` > `li.flex.items-start.gap-4.pb-5.border-b.border-foreground/10` > `Check.h-4.w-4.mt-1.text-secondary.flex-shrink-0` + `span.text-foreground/80.leading-[1.6]`.
- Legal: in-section subsequent P/UL `mt-3`; note variant `text-sm text-foreground/50 italic` (computed 14px italic); hoisted Ps are direct children of `div.mt-12.space-y-10.text-foreground/75.leading-[1.8]` (mt 40px); coordinator `p.mt-3` with `<br>` joins; checklist `ul.list-disc.pl-6.mt-3.space-y-1`.

---

## 6. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| FAQ data is absent from the clone | `rg "faq" prisma/ src/` → no schema field, no component, no content — the accordion is unrepresented | ✓ |
| The `faqs`-as-JSON-column pattern fits | `prep String // JSON array` precedent + `data.ts safeParse` seam; no relational queries needed | ✓ |
| `firstSentence` = the live H2 for all 8 services | Seed `longDescription` first sentences compared against live H2s measured this session — 8/8 exact matches (§1 F1a evidence) | ✓ |
| The description H2 classes need no change | Clone `mt-6 font-serif text-4xl md:text-6xl leading-tight text-balance` == live (only the text content changes) | ✓ |
| Hero + treatment card + image section already byte-identical | Live measurements this session vs `page.tsx:36-89` — every class matches; only sections 3–6 change | ✓ |
| The prep reveal wrapper can use the existing `Reveal` | `Reveal` default `as="div"` renders the wrapper; live wrappers carry the same entrance (opacity/blur/translateY 24px) | ✓ |
| `Check`/`ChevronDown` are available | `lucide-react` already a dependency (used across components) | ✓ |
| The FAQ island is the sanctioned pattern | Client component receiving plain DTO props (`LoginCardBody`/`BookingForm` precedent); no `data.ts` import | ✓ |
| Legal rework won't break refund | Live refund = 1 P per section + disclaimer — representable in the new model with zero data changes to that page | ✓ |
| Legal wrapper/h1/prose classes stay | Live `pt-40 md:pt-52…` / `max-w-[800px] mx-auto` / `mt-12 space-y-10 text-foreground/75 leading-[1.8]` / h1 classes == the clone's current `LegalPage` shell | ✓ |
| Existing e2e won't break | `auth.spec.ts:86-99` (h1/price/duration/link/Before-your-visit) all survive the rework; the `Book this treatment` link `.first()` still resolves via the treatment card | ✓ |
| vitest won't double-run the new specs | `vitest.config.ts` matches `*.test.ts` only; new e2e files are `*.spec.ts` | ✓ |
| The FAQ animation approach is lint-safe | Pure CSS keyframes in `globals.css`; no `setState`-in-effect (click handler only) | ✓ |
| Spec-count math | 55 unit + ~4 `firstSentence` + 46 e2e + ~8 new = **~59 unit + ~54 e2e (~113 total)** — final counts reported at execution | ✓ |
| `.env` / db / wrapper defense intact | `.env` `DATABASE_URL="file:../db/custom.db"` ✓; `db/custom.db` seeded ✓; ambient absolute `DATABASE_URL` still injected in the sandbox — dev-time wrapper defense holding (verified via health + seeded rendering) | ✓ |

---

## 7. ToDo List (execution order, TDD)

- [x] **T1.** RED — write `tests/first-sentence.test.ts` + `tests/e2e/service-detail-parity.spec.ts` + `tests/e2e/legal-parity.spec.ts` against the live-measured contracts; build + run: expect all new specs red (missing sections/elements, mt 16px, synthetic H2), pre-existing 101 green. *(Executed: unit 5/5 failed on the missing helper; e2e 9/10 failed exactly as predicted — the one passing spec was the refund regression-guard, green on both sides by design.)*
- [x] **T2.** GREEN (schema + data) — `faqs` column + seed FAQ data; `ServiceDto.faqs` + `data.ts` parser + `firstSentence` in `content.ts`; `db:push` + `db:seed`. *(One schema iteration: `faqs String @default("[]")` so the column lands on populated tables without a reset.)*
- [x] **T3.** GREEN (service page) — sections 3–6 rework + `FaqAccordion` island + `faq-open` keyframes; the prep-list + CTA fixes. *(All as designed.)*
- [x] **T4.** GREEN (legal) — the new `LegalBlock` model + `legal.ts` data updates + `LegalPage` renderer rework. *(Plus six session-1 text transcription errors found by the post-fix both-sides sweep and corrected with read-back contracts — 3 longDescriptions, 3 legal texts.)*
- [x] **T5.** Full gate: `lint ✓ · typecheck ✓ · unit 60/60 ✓ · build 27/27 pages ✓ · e2e 58/58 ✓` (118 total; all pre-existing contracts untouched). *(Executed; two spec-side shapings mid-run — the trap-7 oklab channel idiom and the trap-4 margin-side swap, both per the mobile-navigation precedent.)*
- [x] **T6.** Live re-verification of the remediated surfaces (local vs the live reference) + re-capture the 15 screenshots on the remediated dev build; VLM-verify service-detail + mobile-menu. *(All 8 service pages exact text-length matches; all 4 legal pages raw-innerText IDENTICAL; service-detail capture now full-page (scroll-through first — below-fold reveals stay hidden otherwise); mobile-menu 26124B byte-identical size to prior verified captures; VLM verified both.)*
- [x] **T7.** Documentation aligned (README/AGENTS/CLAUDE/PAD/SKILL v1.4.0 + trap-7 appendix); `.env.example` re-verified. *(All applied; `.env.example` unchanged — truthful.)*
- [x] **T8.** Replace `docs/session_7.md` with the proper session log; append the worklog record; mark this plan's ToDo results. *(Done.)*
- [x] **T9.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed: change-set scan clean (no key material, no tracked env/db/key files); committed as one atomic commit `af928bd`; fingerprint verified `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (matches the session-1/2/3/4/5/6 record); dry-run clean (`e8dfe94..af928bd` fast-forward, remote untouched); real push exit 0 with the wrapper's own remote verification `refs/heads/main @ af928bd == local HEAD` + tracking-ref sync; operator key shredded.)*

## 8. Acceptance Criteria (definition of done)

1. All 8 service detail pages render the reference's six sections; the FAQ accordion is exclusive-open with item 0 open by default; the Ready-to-begin CTA carries the exact lowercase sentence — pinned by `service-detail-parity.spec.ts` against live-measured values.
2. `/accessibility` renders the 8-item checklist with the reference's classes and the note/br/mt-3 conventions; `/privacy` + `/terms` hoist their subsequent paragraphs — pinned by `legal-parity.spec.ts`.
3. Full gate green with zero weakened assertions; the 101 pre-existing tests untouched.
4. Screenshots re-captured on the remediated build; the service-detail + mobile-menu captures VLM-verified.
5. Docs aligned; `.env.example` truthful.
6. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 9. Rollback

Revert the commit: restore `schema.prisma` (drop `faqs`), `seed.ts`, `content.ts`/`data.ts`, the service page, `FaqAccordion.tsx`, `legal.ts`, `LegalPage.tsx`, the new specs, and the doc alignments; re-run `db:push` (the column drops) + `db:seed`. No API, auth, booking, or infrastructure change is involved.

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| FAQ data model | `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/content.ts`, `src/lib/data.ts` |
| Service detail parity (sections 3–6) | `src/app/(site)/services/[slug]/page.tsx`, `src/components/FaqAccordion.tsx`, `src/app/globals.css` (faq-open keyframes) |
| Legal page structure | `src/lib/legal.ts`, `src/components/LegalPage.tsx` |
| Parity contracts | `tests/first-sentence.test.ts`, `tests/e2e/service-detail-parity.spec.ts`, `tests/e2e/legal-parity.spec.ts` |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.4.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-7.md`, `docs/session_7.md`, `worklog.md` |
