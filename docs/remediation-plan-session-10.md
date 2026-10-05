# Remediation Plan — Session 10 (The Confirmation Decorative Layer + the Hero Settled State + the Head Layer)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `f0f0298` (session-9 deliverable `da31367` + `699ea6c` + the session_10 transcript commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded) + live parity verification with `skills/agent-browser` (login, the confirmation page via its query-string contract, the landing at 1280 and 390, the drawer @390×844, and a **head-layer + settled-state-transform sweep** — the two DOM layers no prior session ever measured). Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-9 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 61/61 unit, 27/27 build pages, 70/70 e2e — 131 total) and the noise register is unchanged (the same two dev-only advisories; the secret-scan matches are the documented placeholder + prose).

This session's sweep targeted the surfaces prior sessions never measured: **(a) the `/book/confirmation` page** — the session-9 icon census covered `/book` ("book 1/1") but never the confirmation route; **(b) the head layer** (favicon / manifest / og meta — invisible to every innerText and computed-style instrument); and **(c) the settled-state transform layer** (the reference's animation framework neutralizes some classes at runtime with inline styles — a layer class-string comparison cannot see). All three yielded findings:

1. **The confirmation page's decorative glyph is wrong**: the live renders `lucide-flower2` at responsive `h-64 w-64 md:h-96 md:w-96` (256px mobile / 384px desktop) with `stroke-width="0.5"` in sage/30; the clone renders `CalendarPlus` via `size={96} strokeWidth={0.75}` — wrong glyph, a quarter of the size at desktop, wrong stroke.
2. **The confirmation page's decorative circle is invisible on live** (settled `opacity: 0` — sampled stable over 35+ seconds; only a wasted infinite scale oscillation runs beneath it); the clone renders the border visible.
3. **The confirmation policy link is a route link on live** — `href="/contact"` with `inline-flex items-center gap-1` classes and a trailing `arrow-right h-3 w-3` icon; the clone renders a `mailto:` link with `underline-offset-4` and no icon — a behavioral + visual divergence.
4. **The landing hero image box is 25% too large in the clone**: the live's animation framework neutralizes the parent's `scale-125` class at settle (inline `transform: none` — the box renders at layout size 457×610 @1280 / 366×488 @390) and scales the img itself by 1.08; the clone keeps `scale-125` active forever (572×762 / 458×610).
5. **The three category images' hover timing diverges**: the live's class string carries its own corrupted `duration-s]` token (generates no CSS) so the hover zoom runs at `transition-transform`'s built-in default **150ms + default ease** (the sibling `ease-[cubic-bezier(0.22,1,0.36,1)]` token is equally dead on live — neither token generated CSS in the base44 build); the clone "fixed" the corruption to `duration-700 ease-[...]` — a 700ms editorial glide the reference does not have.
6. **The head layer has no icon**: the live declares `<link rel="icon" type="image/svg+xml" href="…/logo.png">` (the same logo asset the clone already self-hosts) and `<link rel="manifest" href="/manifest.json">` (declared but dead — the target serves the base44 SPA fallback HTML); the clone declares neither, so every route shows the browser's default favicon instead of the logo.

All six trace to the same root cause as sessions 5–9: **session 1 authored these surfaces instead of measuring them, and every parity instrument since was blind to the layers they live in** — the confirmation route was skipped by the icon census, the head layer is invisible to innerText and computed-style specs, and the settled-state transform layer only exists as runtime inline styles that class-string comparison cannot see.

---

## 2. Findings Register

| ID | Severity | Surface | Finding (live-measured) |
|----|----------|---------|--------------------------|
| F1 | S2 (MEDIUM — visible on every confirmation) | Confirmation · decorative glyph | Live: `<svg class="lucide lucide-flower2 h-64 w-64 md:h-96 md:w-96" stroke-width="0.5">` (computed 256×256 @390 / 384×384 @1280, `rgba(75, 93, 79, 0.3)` sage/30) inside the `absolute top-28 left-1/2 -translate-x-1/2 text-secondary/30` wrapper. Clone: `<CalendarPlus size={96} strokeWidth={0.75} />` — **wrong glyph** (calendar-plus vs flower2), **fixed 96px instead of responsive 256/384px**, **stroke 0.75 vs 0.5**. Plainly visible: the reference's confirmation watermark is a large pale flower behind the card. |
| F2 | S2 (MEDIUM — visible) | Confirmation · decorative circle | Live settled: `style="opacity: 0"` (sampled stable 35+s across 7 reads — only an infinite scale oscillation runs beneath, `scale` 0.65→2.28 while opacity stays 0). Clone: the `h-64 w-64 md:h-96 md:w-96 rounded-full border border-secondary/30` circle renders **visible** — a sage ring the reference does not show. |
| F3 | S2 (MEDIUM — visible + behavioral) | Confirmation · cancellation-policy link | Live: `<a class="underline hover:text-foreground inline-flex items-center gap-1" href="/contact">concierge@maisonluminaire.com <svg class="lucide lucide-arrow-right h-3 w-3"/></a>` — an internal **route link** (12px computed icon, gap 4px, `text-underline-offset: auto`, color `rgba(26, 26, 26, 0.7)`). Clone: `href="mailto:concierge@…"` + `underline underline-offset-4 hover:text-foreground`, no icon — mailto vs route behavior + 4px underline offset + missing icon. |
| F4 | S2/S1 (MEDIUM-HIGH — visible layout on the landing, every viewport) | Landing · hero image box | Live settled (3 independent reads, stable): the parent (`relative aspect-[3/4] overflow-hidden scale-125 origin-center`) carries inline `style="opacity: 1; filter: blur(0px); transform: none;"` — **the scale-125 class is neutralized at settle** (box = layout size: 457×610 @1280, 366×488 @390) — and the img carries inline `style="transform: scale(1.08)"` (494px wide @1280, cropped by overflow-hidden). Clone: scale-125 active forever → 572×762 / 458×610 — **25% larger than the reference**. |
| F5 | S3 (MEDIUM-LOW — hover behavior) | Landing · three category images | Live class: `w-full h-full object-cover transition-transform duration-s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110`; computed **0.15s + `cubic-bezier(0.4, 0, 0.2, 1)`** (the default) — the `duration-s]` token is the reference's own corrupted class (no CSS generated; `transition-transform`'s built-in 150ms default stands) and the `ease-[…]` token is equally dead in the base44 build. Clone: `duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]` — a 700ms editorial glide. **Computed hover-timing divergence.** |
| F6 | S3 (browser-chrome visible, every route) | Head layer · favicon + manifest | Live: `<link rel="icon" type="image/svg+xml" href="https://media.base44.com/…/c7cd69e41_logo.png">` (the same `logo.png` asset the clone self-hosts at `public/images/logo.png`) + `<link rel="manifest" href="/manifest.json">` (declared but **dead** — the target returns the SPA fallback HTML, `content-type: text/html`). Clone: **neither** — every route shows the default favicon. |
| F7 | INFO (accepted-divergence extension) | Head layer · og/twitter/PWA meta | The live's `og:*`/`twitter:*`/`mobile-web-app-capable`/`apple-mobile-web-app-*` metas are base44 platform boilerplate ("Beauty Salon" branding, "An elegant digital gateway…") — scraper-facing, invisible in-browser. The clone's authored titles/descriptions are the documented accepted-divergence family (per-page `document.title`); this session extends that register to explicitly cover the og/twitter/PWA layer. **No code change.** |
| F8 | INFO (verified holding) | Mobile drawer @390×844 | The task brief's emphasis item, re-verified both sides: `fixed inset-0 z-[60] bg-background` cream `rgb(250, 248, 245)`, list `flex-1 flex flex-col justify-center px-8 md:px-20 gap-2` (gap 8px), 5 giant links 48px/48px/`-1.2px` Cormorant, CTA wrapper `mt-10` 40px, no scroll lock, tap-through closes + navigates (Gallery tap → `/gallery`, drawer unmounted). **No Tailwind v4 regression — trap 4 avoided by design (`gap-2` + `mt-10`, never `space-y`).** |
| F9 | INFO (verified holding) | Adjacent surfaces re-verified | The hero grid classes match exactly (`gap-10 md:gap-24 items-center` — an initial extraction truncation artifact, not a divergence); the story image parent `relative w-full h-[600px] md:h-screen overflow-hidden bg-muted` matches; the 6 gallery-preview tiles' img classes match (`duration-700 group-hover:scale-110`); the confirmation innerText 536/536 (same query string both sides); the Calendar `h-4 w-4` (session-8) holds; the hero `sizes`/priority next/image handling is the documented substrate divergence (source asset 1024×1024 = live's natural size). |
| F10 | carried | advisories | `braces` + `deepmerge-ts` dev-only transitive advisories — accepted-risk stance re-verified unchanged (`bun audit` identical to sessions 2–9). |

---

## 3. Root-Cause Analysis

**Why the confirmation route survived nine green sessions.** Session 8 rebuilt the booking form + ICS contract and verified the confirmation innerText (525/525 then) — but innerText cannot see the decorative watermark's glyph/size, the circle's opacity, or the policy link's href. Session 9's icon census listed "book 1/1" — that count is the `/book` form's submit arrow; **`/book/confirmation` was never in the census** (the plan's route list covered landing/services/gallery/team/about/book/login/contact — eight groups; the confirmation route fell between "book" and the pages session 8 had pinned). The page was doubly protected from scrutiny: its text was already pinned (525/525) and its ICS contract was the session-8 headline — nobody re-opened the decorative layer.

**Why the head layer was never measured.** Every instrument in the project reads `document.body` (innerText) or element computed styles. The `<head>` children — link tags, meta tags, the favicon — are outside every query path. The favicon is the one browser-**visible** head element (the tab icon): a visitor sees the reference's logo vs the clone's default globe. The manifest link is declared-but-dead on the reference (its target serves the SPA fallback) — replicating the link is the parity move; serving a *real* manifest would exceed the reference (a divergence in the other direction).

**Why the hero scale survived.** The reference's framer-motion-style framework animates elements by writing **inline styles at runtime**; at settle, the hero parent's inline `transform: none` overrides its own `scale-125` class. The clone renders server HTML with the class and no inline override — frozen in the animation's *initial* state. Class-string comparison (both sides carry `scale-125` ✓) and innerText are blind to the effective transform; only a settled-state `getBoundingClientRect`/computed-transform read on both sides reveals it. The same mechanism (runtime inline styles) settles the confirmation circle at opacity 0 — an element the clone renders visible because "it's in the class list."

**Why the category-image fix is computed-parity, not token-parity.** The live's class string carries two corrupted/dead tokens (`duration-s]`, and its `ease-[…]` sibling that never generated CSS in the base44 build). Replicating the string verbatim in the clone would keep `duration-s]` inert (equally invalid in v4) — but the `ease-[cubic-bezier(0.22,1,0.36,1)]` token **would** generate CSS in the clone's v4 build (the scanner sees the literal in JSX), producing 150ms + editorial ease where the live computes 150ms + **default** ease. Computed behavior is the contract (the session-6/8/9 lesson: assert what the engine computes) — so the fix replicates the live's *computed* hover (150ms, default curve) and keeps the inert `duration-s]` token for classList parity, dropping the ease token that is dead on live but would be live in the clone. The AGENTS.md invariant records the artifact so no future session "fixes" it.

---

## 4. The Fixes (Design)

### 4.1 F1 + F2 + F3 — the confirmation page (`src/app/book/confirmation/page.tsx`)

```tsx
// F1 — the decorative watermark: flower2, class-sized (responsive), stroke 0.5
<div className="absolute top-28 left-1/2 -translate-x-1/2 text-secondary/30" aria-hidden>
  <Flower2 strokeWidth={0.5} className="h-64 w-64 md:h-96 md:w-96" />
</div>

// F2 — the decorative circle: present in the DOM (class parity) but settled
// invisible, exactly as the reference renders it at rest
<div
  className="absolute top-28 left-1/2 -translate-x-1/2 h-64 w-64 md:h-96 md:w-96 rounded-full border border-secondary/30"
  style={{ opacity: 0 }}
  aria-hidden
/>

// F3 — the policy link: a route link with the trailing arrow
<a
  href="/contact"
  className="underline hover:text-foreground inline-flex items-center gap-1"
>
  concierge@maisonluminaire.com <ArrowRight className="h-3 w-3" aria-hidden />
</a>
```

Notes: `Flower2` replaces the `CalendarPlus` import (the `Calendar h-4 w-4` on the Add-to-calendar button is untouched — session-8 contract); `ArrowRight` joins the import list. The settled-state rule applied: **replicate runtime inline styles when they change computed behavior** (the circle's `opacity: 0`); skip inert ones (the watermark wrapper's settled `opacity: 1; transform: none` matches the defaults — computed identical, omitted like the trailing-space artifacts). The infinite invisible scale oscillation under the live's circle is *not* replicated (a wasted rAF loop on an invisible element — the settled visible state, opacity 0, is the contract).

### 4.2 F4 — the hero settled state (`src/app/(site)/page.tsx`)

```tsx
<div
  className="relative aspect-[3/4] overflow-hidden scale-125 origin-center"
  style={{ opacity: 1, filter: "blur(0px)", transform: "none" }}
>
  <Image
    src="/images/hero-portrait.png"
    alt="Luminous portrait"
    fill
    priority
    sizes="(max-width: 768px) 100vw, 40vw"
    className="object-cover"
    style={{ transform: "scale(1.08)" }}
  />
  …
</div>
```

The parent keeps `scale-125` in the class attribute (the reference's DOM carries it too) with the settled inline `transform: none` neutralizing it — exactly the reference's settled DOM. React serializes the style object as `opacity:1;filter:blur(0px);transform:none` (no spaces after colons) vs the reference's framer serialization (`opacity: 1; filter: blur(0px); transform: none;`) — computed-identical; the trailing-space precedent applies. The img gains inline `transform: scale(1.08)` (next/image passes `style` through to the img). Result: box 457×610 @1280 / 366×488 @390, img scaled 1.08 and cropped — matching the live at both viewports.

### 4.3 F5 — the category images' hover timing (`src/app/(site)/page.tsx`)

```tsx
className="object-cover transition-transform duration-s] group-hover:scale-110"
```

The literal `duration-s]` token is the reference's own corrupted artifact (kept: inert in v4 exactly as in the base44 build — no CSS, so `transition-transform`'s built-in **150ms + default ease** stands). The dead-on-live `ease-[cubic-bezier(0.22,1,0.36,1)]` token is dropped (it generated no CSS in the base44 build but **would** in the clone's v4 — keeping it would change the computed timing; the live's computed curve is the default `cubic-bezier(0.4, 0, 0.2, 1)`). The 6 gallery-preview tiles' `duration-700` is untouched (verified matching).

### 4.4 F6 — the head layer (`src/app/layout.tsx`)

```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Maison Luminaire — Beauty Salon", template: "%s | Beauty Salon" },
  description: "…unchanged…",
  icons: { icon: { url: "/images/logo.png", type: "image/svg+xml" } },
  manifest: "/manifest.json",
};
```

Next emits `<link rel="icon" href="/images/logo.png" type="image/svg+xml"/>` + `<link rel="manifest" href="/manifest.json"/>`. The icon points at the **self-hosted** `public/images/logo.png` (the same asset bytes the reference serves from the base44 CDN — the session-1 self-hosting doctrine); the `type="image/svg+xml"` mirrors the reference's own type-hint artifact (it serves a PNG — replicated faithfully, the map-placeholder precedent). The manifest link mirrors the reference's declared-but-dead manifest (its target on the reference returns the SPA fallback HTML; on the clone it 404s — both invalid, functionally identical "no PWA"). **No `public/manifest.json` is created** — serving a real manifest would exceed the reference.

### 4.5 Tests (TDD — the new contracts)

**New e2e spec `tests/e2e/confirmation-parity.spec.ts`** (the confirmation route's own parity contract — the route the session-9 census skipped; covers F1/F2/F3):

1. **The watermark glyph**: the decorative svg is `lucide-flower2` (not calendar-plus) carrying `h-64 w-64 md:h-96 md:w-96`, computed ≥256px (the responsive floor), color `rgba(75, 93, 79, 0.3)` (sage/30), `stroke-width` attr `0.5`.
2. **The circle**: the `rounded-full border` sibling computes `opacity: 0`.
3. **The policy link**: `href` ends `/contact` (not `mailto:`), classes `inline-flex items-center gap-1`, `text-underline-offset` auto (not 4px), and a trailing `lucide-arrow-right h-3 w-3` at computed 12px.
4. **The Calendar contract (regression guard)**: the Add-to-calendar svg is `lucide-calendar h-4 w-4` (session-8).
5. **The innerText contract (regression guard)**: with the canonical query string, the body innerText length matches the live-measured 536 (the session-8 525 was a different name length; 536 is the same-string both-sides measurement this session).

**Extended `tests/e2e/landing.spec.ts`** (F4/F5 — the settled-state + hover-timing contracts):

6. **The hero box**: the `aspect-[3/4]` parent's computed transform is `none` (the scale-125 class neutralized) and its bounding box ≈ the live-measured layout size (457×610 @1280 — assert width 457±2, height 610±2); the hero img carries inline `transform: scale(1.08)` (`matrix(1.08, …)`) and computes wider than its parent (494±4 — cropped by overflow-hidden).
7. **The category images**: each of the 3 category imgs computes `transition-duration: 0.15s` + `transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)` (the default) + `transition-property: transform`, and its classList carries the inert `duration-s]` token.
8. **The gallery-preview tiles (regression guard)**: the 6 tiles keep `duration-700` (0.7s).

**Extended `tests/e2e/route-matrix`-style head assertions — new spec `tests/e2e/head-parity.spec.ts`** (F6): on `/`, `document.querySelector('link[rel="icon"]')` exists with `href` ending `/images/logo.png` + `type="image/svg+xml"`, and `link[rel="manifest"]` exists with `href` ending `/manifest.json`; a fetch of `/manifest.json` returns 404 (the declared-but-dead contract).

No new unit tests: all fixes are presentational/DOM-layer (the e2e read-back is the contract layer per project convention; the `hours`/ICS/auth seams are untouched).

### 4.6 Documentation alignment (post-fix)

README (features: the confirmation watermark + head-layer rows; testing table + badge 131→134; trap-log unchanged), AGENTS.md (invariants: the confirmation-page contract — flower2 watermark, invisible circle, `/contact` policy link; the hero settled-state rule — runtime inline styles override the class layer, replicate settled behavior; the `duration-s]` artifact warning "do not fix"; the head-layer contract; testing conventions: the three new contract lines), CLAUDE.md (counts + the parity-contract list), PAD (§7 inventory + session-10 ledger), `beauty-salon_SKILL.md` **v1.7.0** (project_state, §5 component inventory, §14 best-practices: the settled-state rule, Appendix B/C — the lesson). `.env.example` re-verify (no env change — expected unchanged).

### 4.7 Screenshots

Re-capture the canonical 15 on the remediated build. Expected changes: `08-book`/`12-book-mobile` unchanged (form untouched); `14-confirmation` changes (the flower2 watermark replaces the small calendar-plus; no sage ring); `01-landing-desktop`/`10-landing-mobile` change (the hero portrait box shrinks to the reference proportion); the rest byte-identical or near-identical. VLM-verify the confirmation capture (watermark + no ring) + the landing captures (hero proportion) + the standing mobile-menu check.

---

## 5. Live-Extracted Reference Data (this session's measurements)

### 5.1 The confirmation decorative layer (live, settled)

```html
<div class="absolute top-28 left-1/2 -translate-x-1/2 text-secondary/30" style="opacity: 1; transform: none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"
       class="lucide lucide-flower2 h-64 w-64 md:h-96 md:w-96">…</svg>
</div>
<div class="absolute top-28 left-1/2 -translate-x-1/2 h-64 w-64 md:h-96 md:w-96 rounded-full border border-secondary/30"
     style="opacity: 0; transform: scale(1.15557);"></div>
```

Computed: the flower 384×384 @1280 (`rgba(75, 93, 79, 0.3)`); the circle opacity 0 (stable across 7 samples / 35s; the scale value oscillates 0.65–2.28 continuously — a wasted loop under an invisible element).

### 5.2 The policy link (live, verbatim)

```html
<a class="underline hover:text-foreground inline-flex items-center gap-1" href="/contact">
  concierge@maisonluminaire.com
  <svg … class="lucide lucide-arrow-right h-3 w-3">…</svg>
</a>
```

Computed: `rgba(26, 26, 26, 0.7)`, `text-underline-offset: auto`, gap 4px, inline-flex, 14px, icon 12×12.

### 5.3 The hero settled state (live, 3 stable reads @1280 + @390)

| Element | Class attr | Settled inline style | Computed @1280 | Computed @390 |
|---|---|---|---|---|
| Parent | `relative aspect-[3/4] overflow-hidden scale-125 origin-center` | `opacity: 1; filter: blur(0px); transform: none;` | 457×610 | 366×488 |
| Img | `absolute inset-0 w-full h-full object-cover` | `transform: scale(1.08)` | 494×659 (cropped) | 395×527 (cropped) |

### 5.4 The category images (live, verbatim class string)

`w-full h-full object-cover transition-transform duration-s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110` — computed `transition-duration: 0.15s`, `transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)`, `transition-property: transform` (both non-standard tokens generate no CSS in the base44 build; the utility's built-in defaults stand).

### 5.5 The head layer (live)

`<link rel="icon" type="image/svg+xml" href="https://media.base44.com/images/public/69e3fe3e053d56de33d4c853/c7cd69e41_logo.png">` + `<link rel="manifest" href="/manifest.json">` (target: HTTP 200, `content-type: text/html` — the SPA fallback; an invalid manifest). The og/twitter/PWA metas are base44 boilerplate (F7 — accepted divergence).

---

## 6. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| Confirmation renders CalendarPlus@96 | `src/app/book/confirmation/page.tsx:55` — `<CalendarPlus size={96} strokeWidth={0.75} />` inside `absolute top-28 … text-secondary/30` | ✓ |
| Circle renders visible | `confirmation/page.tsx:57-60` — `rounded-full border border-secondary/30`, no opacity style | ✓ |
| Policy link is mailto + offset-4 | `confirmation/page.tsx:113-118` — `href="mailto:concierge@maisonluminaire.com"`, `underline underline-offset-4 hover:text-foreground`, text-only | ✓ |
| Calendar h-4 w-4 contract present | `confirmation/page.tsx:95` — `<Calendar className="h-4 w-4" aria-hidden />` (session-8 — untouched by this plan) | ✓ |
| Confirmation innerText contract | Live + local both 536 with `name=Test Session&date=2026-10-21&time=14:30&service=Signature Balayage` (measured this session) | ✓ |
| Hero scale-125 active, no inline style | `src/app/(site)/page.tsx:73` — `relative aspect-[3/4] overflow-hidden scale-125 origin-center`, no `style` prop | ✓ |
| Hero img next/image fill + priority | `page.tsx:74-81` — `fill priority sizes=… className="object-cover"` (the `style` prop passes through to the img — next/image supports it) | ✓ |
| Category imgs duration-700 + ease | `page.tsx:127` — `object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110` | ✓ |
| Gallery tiles duration-700 (no ease) | `page.tsx:231` area — `duration-700 group-hover:scale-110` (verified matching live — untouched) | ✓ |
| Hero not inside Reveal | `page.tsx:50-97` — the hero section renders statically; no Reveal wrapper (inline styles won't conflict with the reveal system) | ✓ |
| layout.tsx has no icons/manifest | `src/app/layout.tsx:24-32` — metadata = metadataBase + title + description only | ✓ |
| logo.png self-hosted | `public/images/logo.png` — 1024×1024 PNG (218,746 B), the reference's favicon asset | ✓ |
| No manifest.json in public | `public/` contains `images/` only — no manifest (the dead-link contract needs none) | ✓ |
| No app-router icon route | `src/app/` — no `icon.*`/`favicon.*`/`apple-icon.*` files (metadata `icons` is the only favicon source) | ✓ |
| `Flower2` exported by lucide-react | `node_modules/lucide-react/dist/lucide-react.d.ts:8441` — `declare const Flower2` ✓ | ✓ |
| Next metadata emits icon + manifest links | Next 16 `Metadata.icons` → `<link rel="icon" …/>`; `Metadata.manifest` → `<link rel="manifest" …/>` (standard App Router behavior) | ✓ |
| v4 `transition-transform` default = 150ms + default ease | Tailwind v4 `--default-transition-duration: 150ms`, `--default-transition-timing-function` = the `ease` curve `cubic-bezier(0.4, 0, 0.2, 1)` — matches the live's computed 0.15s/default; **the spec asserts the computed values** (empirical verification — if v4's default differed, the spec catches it and an explicit `duration-150 ease` replaces the inert token) | ✓ |
| The hero-grid classes match (no fix needed) | Live grid: `…grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-24 items-center` == `page.tsx:62` (earlier truncation artifact resolved) | ✓ |
| The booking-parity spec won't break | It pins the Calendar icon + the form structure + the decoded ICS — all untouched; the confirmation-page innerText check (if any) uses its own query string | ✓ |
| The icon-parity spec won't break | It pins the book submit arrow + the landing/services/team/contact/login icons — none touched; the confirmation route wasn't in it | ✓ |
| The mobile-navigation spec won't break | The drawer is untouched (F8 verified holding) | ✓ |
| `.env` / db / wrapper defense intact | `.env` `DATABASE_URL="file:../db/custom.db"` ✓; `db/custom.db` seeded (8/3/12/4/1 via the e2e baseline green) | ✓ |

---

## 7. ToDo List (execution order, TDD)

- [x] **T1.** RED — write `tests/e2e/confirmation-parity.spec.ts` (§4.5 groups 1–5) + the landing.spec.ts extensions (groups 6–8) + `tests/e2e/head-parity.spec.ts`; run against the current build; expect every new group red exactly as the register predicts. Record the failure census. *(Executed: 7/7 actionable groups failed exactly as predicted — flower2 glyph, circle opacity, policy link, favicon, manifest, hero settled box, category hover timing; all 4 regression guards green (Calendar, innerText 536, favicon asset, gallery tiles) + the 10 pre-existing landing tests.)*
- [x] **T2.** GREEN — apply §4.1 (confirmation: flower2 + circle + policy link), §4.2 (hero settled styles), §4.3 (category-img classes), §4.4 (layout metadata icons + manifest). *(Executed; **trap 8 discovered mid-run**: the first hero fix (inline `transform: none` verbatim) left the box at 572px — v4's `scale-125` writes the individual `scale` property, which `transform: none` cannot neutralize; `scale: "none"` added alongside. Two spec-side shapings documented in the specs: the sage/30 color asserts oklab channels (trap 7 pattern, `expectSageAlpha30`), and `text-underline-offset` reports the used keyword `auto`.)*
- [x] **T3.** Full gate: `lint → typecheck → unit 61/61 → build 27/27 pages → e2e` (70 pre-existing + the new specs, all green; no weakened assertions). *(Executed: lint ✓ · tsc ✓ · unit 61/61 ✓ · build 27/27 ✓ · e2e 81/81 ✓ — 142 total.)*
- [x] **T4.** Live re-verification of the remediated surfaces (the confirmation decorative layer + policy link + innerText; the hero box both viewports; the category hover timing; the head layer) + re-capture the 15 screenshots on the remediated dev build; VLM-verify confirmation + landing + mobile-menu. *(Executed: confirmation verified value-by-value (flower2 384×384 + stroke 0.5 + sage/30; circle opacity 0; /contact + arrow 12px + gap 4px + offset auto; 536/536); hero 457×610 @1280 / 366×488 @390 + img 494/395 @1.08 — exact; 15 captures re-taken, mobile-menu 26124B byte-identical, untouched surfaces byte-identical; VLM-verified confirmation (the ring disproven by pixel-probe + computed opacity 0), landing hero proportion, mobile-menu, lightbox (constrained re-prompt).)*
- [x] **T5.** Documentation aligned (README/AGENTS/CLAUDE/PAD/SKILL v1.7.0 — the new contracts + the settled-state rule + the artifact warnings); `.env.example` re-verified. *(All applied; SKILL §4.5 also brought to the full eight-trap list — a session-6/7 drift where the main list had stayed at five; `.env.example` unchanged — truthful.)*
- [x] **T6.** Replace `docs/session_10.md` with the proper session log; append the worklog record; mark this plan's ToDo results. *(Done.)*
- [x] **T7.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed: change-set scan clean; committed as one atomic commit; fingerprint verified `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (matches the session 1–9 record); dry-run clean; real push exit 0 with the wrapper's remote verification; operator key shredded. See the session log for the exact hashes.)*

## 8. Acceptance Criteria (definition of done)

1. The confirmation page renders the reference's flower2 watermark (responsive class sizing, stroke 0.5, sage/30), an invisible decorative circle (opacity 0), and the `/contact` policy link with its trailing arrow — pinned by `confirmation-parity.spec.ts`.
2. The landing hero box renders at the reference's settled proportion (transform none; 457×610 @1280) with the img scaled 1.08; the category images hover-zoom at 150ms/default ease — pinned by the landing.spec.ts extensions.
3. Every route declares the logo favicon + the manifest link (dead target) — pinned by `head-parity.spec.ts`.
4. Full gate green with zero weakened assertions; all 70 pre-existing e2e contracts untouched.
5. Screenshots re-captured on the remediated build; confirmation + landing + mobile-menu captures VLM-verified.
6. Docs aligned (the three new parity contracts registered in every doc's testing section); `.env.example` truthful.
7. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 9. Rollback

Revert the commit: restore `confirmation/page.tsx` (CalendarPlus watermark, visible circle, mailto policy link), `page.tsx` (active scale-125, duration-700+ease category classes), `layout.tsx` (metadata without icons/manifest); delete the three spec additions. No schema, seed, API, auth, or infrastructure change is involved.

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The confirmation decorative layer + policy link | `src/app/book/confirmation/page.tsx` |
| The hero settled state + category hover timing | `src/app/(site)/page.tsx` |
| The head layer (favicon + manifest) | `src/app/layout.tsx` |
| Parity contracts | `tests/e2e/confirmation-parity.spec.ts` (new), `tests/e2e/head-parity.spec.ts` (new), `tests/e2e/landing.spec.ts` (extended) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.7.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-10.md`, `docs/session_10.md`, `worklog.md` |
