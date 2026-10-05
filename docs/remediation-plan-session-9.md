# Remediation Plan — Session 9 (The Icon Layer + the Contact Structure)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `dcdea6a` (session-8 deliverable `8b841b4` + `20fa947` + the `docs/session_9.md` transcript commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as a targeted lightweight checklist — the runner destabilized shells in session 4; `skills/` excluded) + live parity verification with `skills/agent-browser` (login, all 13 routes, the drawer @390×844, the gallery lightbox, and a **full both-sides icon audit** — every `svg.lucide` glyph/class/size/color extracted from live and compared against the local DOM page by page). Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-8 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 61/61 unit, 27/27 build pages, 62/62 e2e — 123 total) and every pinned parity surface holds byte-identical live and local (drawer, login font context + slate-900, landing text, 404, status pill, service detail, legal, booking form + ICS + confirmation, gallery lightbox keyboard behavior). The contact map embed — this session's first candidate — **verifies holding exactly** (URL, inline style, container classes byte-identical both sides); the session-8 log's "self-hosting" suggestion is **rejected**: the reference itself loads the external Google Maps embed, so self-hosting would be a divergence, not a fix.

The session's widened sweep — a first-ever **icon-layer audit** comparing every lucide icon on every page both sides — found the real gap family: **the icon class layer was never extracted in session 1**. The clone renders icons via lucide `size={N}` attributes with authored class fragments; the reference uses class-based sizing (`h-3.5 w-3.5`, `h-4 w-4`…) with specific per-surface class sets including **hover animations the clone lacks entirely**. Several instances are plainly visible:

1. **The testimonial stars are the wrong color** — live: sage (`fill-secondary text-secondary`, `rgb(75, 93, 79)`); clone: ink (`fill-foreground text-foreground`).
2. **The gallery-preview hover icons misbehave** — live: 24px icons that fade in on hover (`opacity-0 group-hover:opacity-100`); clone: 20px icons **permanently visible**.
3. **The footer Contact column and the contact page's Reach-us block have no icons at all** — live renders `phone`/`mail`/`instagram` icons in both.
4. **The contact "Get directions" and team "Book with" links use the wrong glyphs** — live: `map-pin` and `arrow-up-right` (with hover-rotate); clone: `arrow-up-right`@14 and `arrow-right`@14.
5. **The contact Hours section lacks the status pill** the live renders in a `flex items-center justify-between mb-4` row with the Hours eyebrow.
6. **The login inputs' icons sit 2px off in the wrong shade** (`left-3.5 text-slate-400` vs live `left-3 text-slate-500`) and the clone **adds a password eye-toggle the reference does not have**.
7. **The services cards' arrows lack the live's hover animation** (`group-hover:rotate-45 group-hover:text-foreground`) and carry the wrong margin (`mt-1` vs live `mt-2` landing / no-mt grid).

All of it traces to one root cause, the same as the session-5 404, session-7 FAQ, and session-8 ICS findings: **session 1 authored these surfaces instead of measuring them, and every parity check since was structurally blind to the icon layer** — `innerText` comparisons cannot see svg class sets, and no spec ever pinned an icon's classes (session 7 extracted the service-detail icons properly, which is the one surface this family spares; session 8's Calendar fix was a single instance of the same family).

---

## 2. Findings Register

| ID | Severity | Surface | Finding (live-measured) |
|----|----------|---------|--------------------------|
| F1a | S2 (MEDIUM) | Landing · testimonial stars | Live: `lucide-star h-3.5 w-3.5 fill-secondary text-secondary` — **sage** `rgb(75, 93, 79)`, matching the service-detail check icons' pinned sage. Clone: `fill-foreground text-foreground` (ink) at size=14 attr. Visible color divergence on the landing's testimonial section. |
| F1b | S3 (MEDIUM-LOW) | Landing · follow-along | Live: `lucide-instagram h-4 w-4` (computed 16px). Clone: size=14 (computed 14px). Visible 2px size divergence. |
| F1c | S2 (MEDIUM) | Landing · gallery preview tiles (6×) | Live: `lucide-instagram h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500` — 24px, **hidden until hover**. Clone: size=20 `text-background`, no opacity classes — 20px and **permanently visible** over the tile images. Visible size + behavior divergence. |
| F1d | S2 (MEDIUM) | Services cards' arrows (landing 3× + grid 8×) | Live landing: `arrow-up-right h-5 w-5 mt-2 text-foreground/40 transition-all group-hover:rotate-45 group-hover:text-foreground` (computed mt 8px). Live grid: same but **no mt** + `transition-all duration-500`. Clone (both surfaces): size=20 `mt-1 shrink-0 text-foreground/40` (mt 4px) — **no hover animation at all**. Visible hover-behavior + margin divergence. |
| F1e | S2 (MEDIUM) | Team · "Book with" buttons (3×) | Live: `arrow-up-right h-3.5 w-3.5 transition-transform group-hover/btn:rotate-45` and the anchor carries **`group/btn`**. Clone: `arrow-right` size=14 (wrong glyph, no hover rotate) and the anchor lacks `group/btn`. Visible glyph + behavior divergence. |
| F1f | S2 (MEDIUM) | Contact · Get directions | Live: `lucide-map-pin h-3.5 w-3.5` (computed 14px) with a **space text node** between icon and label (`</svg> Get directions`). Clone: `arrow-up-right` size=14 — **wrong glyph**. Visible divergence. |
| F1g | S2 (MEDIUM) | Footer · Contact column (every page) | Live: `lucide-phone/mail/instagram h-3.5 w-3.5` (14px) inside the three contact links (whose `inline-flex items-center gap-2` classes exist in the clone **for these icons**). Clone: no icons. Visible absence on all 13 routes. |
| F1h | S2 (MEDIUM) | Contact · Reach us block | Live: `lucide-phone/mail/instagram h-4 w-4 text-foreground/60` (16px, muted) inside the three serif anchors (whose `flex items-center gap-3` classes exist in the clone **for these icons**). Clone: no icons. Visible absence. |
| F1i | S3 (MEDIUM-LOW) | Login · input icons | Live: `lucide-mail` / `lucide-lock` with `absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500` (computed left 12px, `rgb(100, 116, 139)`). Clone: `left-3.5 text-slate-400` (14px, one shade lighter), no `transform`/`h-4 w-4`. Visible 2px position + shade divergence. |
| F1j | S2 (MEDIUM) | Login · password eye toggle | Live: **no** right-side element in either input wrapper. Clone: renders an `Eye`/`EyeOff` toggle button (`absolute right-3 …`) — a **visible element + behavior the reference does not have**, never documented as an accepted divergence. Remove (parity outranks the UX nicety; the invisible additions — `autoComplete`, `aria-*` — stay per the session-8 F6 precedent). |
| F1k | S4 (LOW) | Book · submit arrow | Live: `lucide-arrow-right h-4 w-4`. Clone: size=14. Class-set divergence (16px vs 14px computed). |
| F1l | S5 (class-string only — computed identical) | Header menu/X, drawer X, lightbox X + chevrons, story/newsletter arrows, service-detail back-arrow | Live uses class sizing (`h-4 w-4` / `h-5 w-5` / `h-3.5 w-3.5`) with default `width="24" height="24"` attrs; clone uses `size={N}` attrs (renders `width="14"…`). Computed output identical; DOM class/attr structure differs. Align for DOM parity (the project's own standard: "reproduces every section's exact class structure"). |
| F1m | S5 (LOW) | Login · Google button svg | Live wraps the Google svg in `<div class=" transition-transform duration-200 -ml-4">` (leading space = the reference's template-literal artifact) and the svg carries `xmlns`. Clone: `-ml-4` directly on the svg, no wrapper, no xmlns. Mirror the structure (minus the stray leading space — the `block ` trailing-space precedent: computed identical). |
| F2 | S2 (MEDIUM) | Contact · Hours section | Live: the Hours eyebrow and a **StatusPill** sit in `flex items-center justify-between mb-4`; the hours `ul` carries **no margin** (spacing = the row's `mb-4` 16px). Clone: bare eyebrow div + `mt-3` on the ul (12px gap), **no pill**. The pill's class set matches the clone's existing `StatusPill` component exactly (`inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/70` + the amber breathe dot) — the component simply isn't rendered here. Visible structural divergence (13-char innerText delta = exactly `CLOSED TODAY\n`). |
| F3 | INFO (verified holding) | Contact · map embed | The iframe's src URL, `title="Map"`, `w-full h-full`, inline `border: 0px; filter: grayscale(0.2) contrast(1.05);`, `loading="lazy"`, `referrerpolicy`, and the parent `aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-sm border border-foreground/10 bg-muted` — **all byte-identical both sides**. The session-8 suggestion to self-host the map is rejected: the reference itself loads the external Google Maps embed (the `!4v1700000000000` placeholder URL is the reference's own); self-hosting would introduce a divergence. The known screenshot drift comes from Google's per-load tile variance — inherent, accepted. |
| F4 | carried | advisories | `braces` + `deepmerge-ts` dev-only transitive advisories — accepted-risk stance re-verified this session (`bun audit` unchanged from sessions 2–8). |

**Verified holding (no action):** the mobile drawer (every pinned value @390×844, icons included — the drawer X computes 16px both sides), the login font context + slate-900 read-back, the booking form structure + placeholder + Calendar icon + decoded ICS (session-8 contracts), the gallery lightbox (icons `x h-4 w-4` / chevrons `h-5 w-5`, keyboard + wrap-around + filter scoping — session-8 verified), the service detail page's `check h-4 w-4 mt-1 text-secondary flex-shrink-0` and `chevron-down h-5 w-5 flex-shrink-0 transition-transform duration-500` classes (session-7 extracted — the icon audit confirms they match exactly), the map embed (F3), the map tile img classes, the follow-along anchor classes, the stars wrapper (`flex justify-center gap-1 mb-8`), the footer/CTA structure, the 404, and every page's innerText (except the contact 13-char pill delta).

**Accepted divergences (stand, now explicitly enumerated):** the clone's `aria-hidden` on decorative svgs, `aria-label="5 out of 5 stars"` on the stars wrapper, `autoComplete` on login/booking inputs, `aria-pressed` on filter pills, per-page `document.title` — all invisible; the live icons carry no aria attributes at all.

---

## 3. Root-Cause Analysis

**Why an entire visual layer survived eight green sessions.** Every parity instrument in this project is text- or property-scoped: the innerText comparisons (landing 1198/1198, about, team, legal 1822/2053/3372/1629, confirmation 525/525) flatten the DOM to text — svg class sets are invisible to them; the computed-style specs pin the elements prior sessions touched (drawer links, login h1, 404 card, prep rows, chevrons, form grid) — no spec ever selected an icon on a session-1 surface; and `size={N}` renders the *right pixel size* by the attribute path, so even pixel-level screenshot review sees "an arrow, 14px, looks fine." The glyph choice (arrow-right vs arrow-up-right), the color token (ink vs sage), the opacity behavior (always-on vs hover-fade), and the hover animations (`group-hover:rotate-45`) are all invisible to every existing instrument. The icon layer needed its own extraction pass — this session performed it (every `svg.lucide` on every route, both sides).

**Why session-7 surfaces are exempt.** Session 7 built the service-detail page from live DOM extraction *after* the measurement discipline was established (sessions 5–6); its icons (`check`, `chevron-down`) carry the reference's exact class sets. Session 1's surfaces (landing, contact, footer, login, team, book, gallery chrome, header) predate that discipline — they render icons via the `size` prop, an authored convention that produces correct pixels but the wrong DOM.

**Why the eye toggle must go but autoComplete stays.** The doctrine's line is visibility: `autoComplete`, `aria-*`, and `document.title` change nothing a reference visitor could see or click; the eye toggle renders a visible 16px icon inside the password field and changes the field's behavior — it is a functional divergence, not an accessibility improvement. It was never documented as accepted (unlike the F6 family), so it falls to the parity rule.

---

## 4. The Fixes (Design)

### 4.1 The icon class sets (11 files)

Convert every session-1 icon to the live-measured class sizing (drop the `size` prop; the lucide default `width="24" height="24"` attrs then match the reference DOM). Per-surface class sets, verbatim from the live audit:

| File | Element | New classes |
|---|---|---|
| `TestimonialCarousel.tsx` | Star ×5 | `className="h-3.5 w-3.5 fill-secondary text-secondary"` |
| `(site)/page.tsx` | landing services ArrowUpRight | `className="h-5 w-5 mt-2 text-foreground/40 transition-all group-hover:rotate-45 group-hover:text-foreground"` |
| `(site)/page.tsx` | story ArrowRight | `className="h-3.5 w-3.5"` |
| `(site)/page.tsx` | follow-along Instagram | `className="h-4 w-4"` |
| `(site)/page.tsx` | gallery-preview Instagram | `className="h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500"` |
| `ServicesExperience.tsx` | grid ArrowUpRight ×8 | `className="h-5 w-5 text-foreground/40 group-hover:rotate-45 group-hover:text-foreground transition-all duration-500"` (no mt) |
| `(site)/team/page.tsx` | button | add `group/btn` to the anchor's classes |
| `(site)/team/page.tsx` | ArrowUpRight (was ArrowRight) ×3 | `className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-45"` |
| `(site)/contact/page.tsx` | Get directions MapPin (was ArrowUpRight) | `className="h-3.5 w-3.5"` + a space text node before the label |
| `(site)/contact/page.tsx` | Reach-us Phone/Mail/Instagram | `className="h-4 w-4 text-foreground/60"` (inside the existing serif anchors, before the text) |
| `SiteFooter.tsx` | Phone/Mail/Instagram ×3 | `className="h-3.5 w-3.5"` (inside the existing `inline-flex items-center gap-2` links) |
| `LoginForm.tsx` | Mail + Lock | `className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"` |
| `LoginForm.tsx` | eye toggle | **removed** (state, button, imports) |
| `LoginForm.tsx` | GoogleIcon | wrapped in `<div className="transition-transform duration-200 -ml-4">`; svg keeps `className="h-5 w-5"` + gains `xmlns` |
| `BookingForm.tsx` | submit ArrowRight | `className="h-4 w-4"` |
| `NewsletterForm.tsx` | ArrowRight | `className="h-3.5 w-3.5"` |
| `SiteHeader.tsx` | Menu + X | `className="h-4 w-4"` (keep `strokeWidth={2}` — the live svg carries `stroke-width="2"`) |
| `GalleryGrid.tsx` | lightbox X / chevrons | `h-4 w-4` / `h-5 w-5` |
| `(site)/services/[slug]/page.tsx` | back ArrowLeft | `className="h-3.5 w-3.5"` |

The `aria-hidden` props stay (invisible, accepted). The named-group `group/btn` + `group-hover/btn:rotate-45` syntax is Tailwind v4-native (supported since v3.2, unchanged in v4 — no trap applies; these are sizing/transform utilities, not colors).

### 4.2 F2 — the contact Hours row (`(site)/contact/page.tsx`)

```tsx
<div>
  <div className="flex items-center justify-between mb-4">
    <div className="text-[10px] uppercase tracking-editorial text-foreground/50">Hours</div>
    <StatusPill />
  </div>
  <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
    {/* unchanged rows */}
  </ul>
</div>
```

The ul drops `mt-3` (the row's `mb-4` provides the 16px gap). The page imports `StatusPill` (client island inside a server page — the `Reveal`/`TestimonialCarousel` composition precedent; `StatusPill` is already a client component).

### 4.3 Tests (TDD — the new parity contract)

**New e2e spec `tests/e2e/icon-parity.spec.ts`** (the icon-layer read-back — extends the session-6/8 read-back rule to the one DOM layer innerText cannot see):

1. **Landing:** the 5 testimonial stars carry `fill-secondary` + `text-secondary` and compute to `rgb(75, 93, 79)` (the sage pin — same value as the service-detail check icons); the follow-along Instagram computes to 16px; each gallery-preview hover icon carries `opacity-0` + `group-hover:opacity-100` and computes to 24px; the landing services arrows carry `group-hover:rotate-45` + `transition-all` + computed `margin-top: 8px` (mt-2).
2. **Services grid:** the card arrows carry `group-hover:rotate-45` + `duration-500` + computed `margin-top: 0px`.
3. **Team:** each Book-with anchor carries `group/btn` and its svg is `lucide-arrow-up-right` (not arrow-right) with `group-hover/btn:rotate-45`, computed 14px.
4. **Contact:** the Get-directions svg is `lucide-map-pin` at computed 14px with a text node following it; the three Reach-us anchors each contain an svg (phone/mail/instagram, 16px, `text-foreground/60`); the Hours block renders the pill row — `flex items-center justify-between mb-4` with a StatusPill whose innerText is `Closed today`/`Open today`, and the ul computes `margin-top: 0px`.
5. **Footer (any page):** the three contact links each contain their icon at computed 14px (`h-3.5 w-3.5`).
6. **Login:** the mail/lock svgs carry `left-3` (computed left 12px) + `text-slate-500` (computed `rgb(100, 116, 139)`); **no eye button exists** in either input wrapper (`button` count in the password wrapper = 0).
7. **Book:** the submit svg carries `h-4 w-4` (computed 16px).
8. **Header/drawer:** the hamburger svg carries `h-4 w-4` (computed 16px).

Expected RED state pre-fix: every assertion above fails except the header/drawer class check (both compute 16px — but the class assertion `h-4 w-4` fails) — i.e. all 8 groups red.

No new unit tests: the icons are presentational; the e2e read-back is the contract layer per project convention (booking-parity precedent). The `hours` pill logic is already unit-tested via `statusForDay`.

### 4.4 Documentation alignment (post-fix)

README (features + testing table + trap-log note unchanged — add the icon-parity contract line + 123→ new e2e count), AGENTS.md (testing conventions: the icon-parity contract; the invariant "icons carry the reference's class sizing, never `size` props"), CLAUDE.md (counts + the parity contract list), PAD (§7 inventory + session-9 ledger), `beauty-salon_SKILL.md` **v1.6.0** (project_state, §4 design-system icon table, §5.2 component inventory, Appendix B/C — the icon-layer lesson). `.env.example` re-verify (no env change — expected unchanged).

### 4.5 Screenshots

Re-capture the 15 canonical captures on the remediated build (07-contact changes — the Hours pill + icons; 01/02-landing change — sage stars + hover-icon behavior + footer icons; 04-gallery-lightbox unchanged; the rest expected byte-identical or near-identical). VLM-verify the contact capture (pill + icons) + the landing capture (sage stars) + the standing mobile-menu check.

---

## 5. Live-Extracted Reference Data (this session's measurements)

### 5.1 The icon class census (live, settled)

| Surface | Icon | Live class set | Computed |
|---|---|---|---|
| Header hamburger | menu | `h-4 w-4` | 16px |
| Drawer close | x | `h-4 w-4` | 16px |
| Landing services arrows | arrow-up-right | `h-5 w-5 mt-2 text-foreground/40 transition-all group-hover:rotate-45 group-hover:text-foreground` | 20px, mt 8px |
| Services grid arrows | arrow-up-right | `h-5 w-5 text-foreground/40 group-hover:rotate-45 group-hover:text-foreground transition-all duration-500` | 20px, mt 0 |
| Story / newsletter arrows | arrow-right | `h-3.5 w-3.5` | 14px |
| Testimonial stars ×5 | star | `h-3.5 w-3.5 fill-secondary text-secondary` | 14px, sage |
| Carousel chevrons | chevron-left/right | `h-4 w-4` | 16px |
| Follow-along | instagram | `h-4 w-4` | 16px |
| Gallery-preview hover ×6 | instagram | `h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500` | 24px, hover-fade |
| Team book-with | arrow-up-right | `h-3.5 w-3.5 transition-transform group-hover/btn:rotate-45` (anchor: `group/btn`) | 14px |
| Detail back-link | arrow-left | `h-3.5 w-3.5` | 14px |
| Detail prep rows | check | `h-4 w-4 mt-1 text-secondary flex-shrink-0` | 16px (already matching) |
| FAQ chevrons | chevron-down | `h-5 w-5 flex-shrink-0 transition-transform duration-500` (+ `rotate-180` open) | 20px (already matching) |
| Lightbox close / nav | x / chevrons | `h-4 w-4` / `h-5 w-5` | 16 / 20px |
| Get directions | map-pin | `h-3.5 w-3.5` | 14px |
| Reach-us ×3 | phone/mail/instagram | `h-4 w-4 text-foreground/60` | 16px |
| Footer contact ×3 | phone/mail/instagram | `h-3.5 w-3.5` | 14px |
| Login input icons | mail/lock | `absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500` | 16px, left 12px |
| Login Google svg | (custom) | wrapper `div.transition-transform.duration-200.-ml-4` + `svg.h-5.w-5[xmlns]` | 20px |
| Book submit | arrow-right | `h-4 w-4` | 16px |

All live svgs carry the lucide-default `width="24" height="24" viewBox="0 0 24 24"` attributes with class-based sizing; none carry `aria-hidden`.

### 5.2 The contact Hours row (live, verbatim)

```html
<div><div class="flex items-center justify-between mb-4"><div class="text-[10px] uppercase tracking-editorial text-foreground/50">Hours</div><div class="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/70 "><span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 breathe"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span></span><span>Closed today</span></div></div><ul class="divide-y divide-foreground/10 border-y border-foreground/10">…</ul></div>
```

(The pill's trailing space in `text-foreground/70 ` is the reference's template-literal artifact — same precedent as the `block ` labels; computed identical.)

---

## 6. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| Stars render ink at size=14 | `src/components/TestimonialCarousel.tsx:49` — `<Star key={i} size={14} className="fill-foreground text-foreground" aria-hidden />` ×5 in `flex justify-center gap-1 mb-8` | ✓ |
| Landing services arrow = mt-1, no hover | `src/app/(site)/page.tsx:140-144` — `<ArrowUpRight size={20} className="mt-1 shrink-0 text-foreground/40" aria-hidden />` | ✓ |
| Follow-along icon = size 14 | `page.tsx:218` — `<Instagram size={14} aria-hidden />` | ✓ |
| Gallery-preview icon always-visible | `page.tsx:240` — `<Instagram size={20} className="text-background" aria-hidden />`; overlay `page.tsx:239` already carries `bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500` | ✓ |
| Grid arrows = mt-1, no hover | `src/components/ServicesExperience.tsx:82` — `<ArrowUpRight size={20} className="mt-1 shrink-0 text-foreground/40" aria-hidden />` | ✓ |
| Team button lacks group/btn + wrong glyph | `src/app/(site)/team/page.tsx:63-69` — anchor classes (no `group/btn`), `<ArrowRight size={14} aria-hidden />` | ✓ |
| Get directions = ArrowUpRight@14 | `src/app/(site)/contact/page.tsx:41` — `<ArrowUpRight size={14} aria-hidden />` | ✓ |
| Reach-us anchors icon-less | `contact/page.tsx:51-70` — three anchors `flex items-center gap-3 font-serif text-xl hover:text-secondary transition`, text-only children | ✓ |
| Hours = bare eyebrow + mt-3 ul, no pill | `contact/page.tsx:74-86` — `<div className="text-[10px] …">Hours</div>` + `<ul className="divide-y divide-foreground/10 border-y border-foreground/10 mt-3">`; `StatusPill` not imported | ✓ |
| Footer links icon-less | `src/components/layout/SiteFooter.tsx:80-99` — three `inline-flex items-center gap-2 hover:text-background` links, text-only | ✓ |
| Login icons left-3.5 slate-400 | `src/components/LoginForm.tsx:92-96,114-117` — `className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"` `size={16}` | ✓ |
| Eye toggle exists | `LoginForm.tsx:53,120-136` — `showPassword` state + the toggle button (`Eye`/`EyeOff` imports line 10) | ✓ |
| GoogleIcon unwrapped | `LoginForm.tsx:183` — `<svg className="h-5 w-5 -ml-4" viewBox="0 0 24 24" aria-hidden>` (no xmlns, no wrapper div) | ✓ |
| Book submit arrow size=14 | `src/components/BookingForm.tsx:218` — `<ArrowRight size={14} aria-hidden />` | ✓ |
| Newsletter arrow size=14 | `src/components/NewsletterForm.tsx:56` — `<ArrowRight size={14} aria-hidden />` | ✓ |
| Menu/X sized by attrs | `src/components/layout/SiteHeader.tsx:89,107` — `size={16} strokeWidth={2}` | ✓ |
| Lightbox icons sized by attrs | `src/components/GalleryGrid.tsx:114,126,134` — `X size={16}`, chevrons `size={20}` | ✓ |
| Detail back-arrow sized by attr | `src/app/(site)/services/[slug]/page.tsx:43` — `<ArrowLeft size={14} aria-hidden />` | ✓ |
| Session-7 icons already match | Icon audit: `check h-4 w-4 mt-1 text-secondary flex-shrink-0` + `chevron-down h-5 w-5 … duration-500` — identical class sets both sides (matrix: services-balayage divergences = menu/arrow-left/footer only) | ✓ |
| `StatusPill` is a client island usable in the server contact page | `src/components/StatusPill.tsx` — `"use client"`, zero props, self-contained (the `TestimonialCarousel`-in-server-page precedent) | ✓ |
| The named-group syntax won't trip v4 | Tailwind v4 supports `group/btn` + `group-hover/btn:` natively (no trap applies — sizing/transform utilities, not colors) | ✓ |
| The mobile-nav parity spec won't break | `tests/e2e/mobile-navigation.spec.ts` pins the drawer's computed styles (gap 8px, mt 40px, 48px serif, colors) — the Menu/X class change keeps computed 16px; no icon-class assertions in the spec | ✓ |
| The login-parity / auth specs won't break | `login-parity.spec.ts` pins fonts + slate-900; `auth.spec.ts` fills inputs by label + submits — no eye-button usage | ✓ |
| The booking-parity spec won't break | pins the Calendar icon on the confirmation page (untouched) + form structure (untouched) | ✓ |
| `lucide-react` exports MapPin/Phone/Instagram/ArrowUpRight | standard lucide icons — already used across the codebase (`ArrowUpRight` in `page.tsx`; `Phone`/`Mail`/`MapPin` are core exports) | ✓ |
| `.env` / db / wrapper defense intact | `.env` `DATABASE_URL="file:../db/custom.db"` ✓; repo `db/custom.db` seeded 8/3/12/4/1 (verified via Prisma this session); ambient absolute `DATABASE_URL` present in this sandbox, wrapper defense holding (dev server renders seeded content; health `{"status":"ok","db":true}`) | ✓ |

---

## 7. ToDo List (execution order, TDD)

- [x] **T1.** RED — write `tests/e2e/icon-parity.spec.ts` (the 8 assertion groups above); run it against the current build; expect all groups red. Record the exact failure census. *(Executed: 8/8 failed exactly as predicted — every assertion group red against the pre-fix build.)*
- [x] **T2.** GREEN — apply the §4.1 class-set conversions (11 files) + the §4.2 Hours-row restructure + the eye-toggle removal + the GoogleIcon wrapper. *(Executed across 12 files; two spec-side shapings mid-run — the Reach-us selector scoped to the gap-3 variants (the header logo is also font-serif text-xl), and the book arrow's computed-width assertion replaced by the class + width-attr read-back (the svg is a flex item — its USED width shrinks with the row layout: live-measured 15.3125px, clone identical; the class set is the viewport-stable contract). The census re-run also caught one straggler the plan's table missed: the testimonial carousel chevrons — fixed.)*
- [x] **T3.** Full gate: `lint → typecheck → unit 61/61 → build 27/27 pages → e2e` (62 pre-existing + the new icon-parity specs, all green; no weakened assertions). *(Executed: lint ✓ · tsc ✓ · unit 61/61 ✓ · build 27/27 ✓ · e2e 70/70 ✓ — 131 total.)*
- [x] **T4.** Live re-verification of the remediated surfaces (both-sides icon census re-run — every route's icon list identical; the contact Hours row + Reach-us + Get-directions surfaces checked in-DOM) + re-capture the 15 screenshots on the remediated dev build; VLM-verify contact + landing + mobile-menu. *(Executed: census identical on every route (23/12/4/7/4/1/2/8 icons); contact innerText 808/808; Hours row verified in-DOM (mb 16px, pill present, ul mt 0); 15 captures re-taken — mobile-menu 26124B byte-identical signal holds; VLM-verified contact (icons + MapPin + the Hours pill via scrolled capture), footer icons, sage stars (pixel-sampled (80,97,83) + computed rgb(75,93,79)), mobile-menu.)*
- [x] **T5.** Documentation aligned (README/AGENTS/CLAUDE/PAD/SKILL v1.6.0 — the icon-parity contract + the icon-layer lesson); `.env.example` re-verified. *(All applied; `.env.example` unchanged — truthful.)*
- [x] **T6.** Replace `docs/session_9.md` with the proper session log; append the worklog record; mark this plan's ToDo results. *(Done.)*
- [x] **T7.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed — see the session log.)*

## 8. Acceptance Criteria (definition of done)

1. Every lucide icon on every route carries the reference's exact class set (glyph, size classes, color tokens, hover/transition classes, named groups) — pinned by `tests/e2e/icon-parity.spec.ts` computed-style + class read-backs.
2. The testimonial stars render sage; the gallery-preview icons are hover-gated at 24px; the footer + contact Reach-us blocks render their icons; the contact Hours row renders the StatusPill; the login carries no eye toggle and its input icons sit at `left-3` in `slate-500`.
3. Full gate green with zero weakened assertions; all 62 pre-existing parity contracts untouched.
4. Screenshots re-captured on the remediated build; contact + landing + mobile-menu captures VLM-verified.
5. Docs aligned (the icon-parity contract registered in every doc's testing section); `.env.example` truthful.
6. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 9. Rollback

Revert the commit: restore the 11 icon-bearing files (`size`-prop rendering), the contact Hours block (bare eyebrow + `mt-3` ul), `LoginForm.tsx` (eye toggle + `left-3.5` icons), and delete `tests/e2e/icon-parity.spec.ts`. No schema, seed, API, auth, or infrastructure change is involved.

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The icon class layer (19 icon sites) | `TestimonialCarousel.tsx`, `ServicesExperience.tsx`, `SiteFooter.tsx`, `LoginForm.tsx`, `BookingForm.tsx`, `NewsletterForm.tsx`, `GalleryGrid.tsx`, `SiteHeader.tsx`, `(site)/page.tsx`, `(site)/team/page.tsx`, `(site)/contact/page.tsx`, `(site)/services/[slug]/page.tsx` |
| The contact Hours row + pill | `(site)/contact/page.tsx` |
| Parity contract | `tests/e2e/icon-parity.spec.ts` (new) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.6.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-9.md`, `docs/session_9.md`, `worklog.md` |
