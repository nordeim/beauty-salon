# Remediation Plan — Session 8 (Booking Form Structure + the ICS Contract + the Confirmation Icon)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `3d49bbc` (session-7 deliverable `af928bd` + `63e9d53` + the `docs/session_8.md` transcript commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as a targeted lightweight checklist — the runner destabilized shells in session 4; `skills/` excluded) + live parity verification with `skills/agent-browser` (drawer @390×844 live+local, booking form live+local including validation branches + deep links + happy-path submissions on both sides, ICS downloads decoded on both sides, confirmation surface live+local, gallery + lightbox keyboard live+local). Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-7 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 60/60 unit, 27/27 build pages, 58/58 e2e — 118 total) and every pinned parity surface holds byte-identical live and local (drawer, login, landing, 404, status pill, service detail pages, legal pages). This session widened the sweep to the surfaces the session-7 log flagged as candidates — **the booking form's validation/interaction branches and the gallery lightbox keyboard details** — plus a first-ever live decode of the **ICS calendar download** that the confirmation page emits.

The gallery lightbox passes completely (structure, filter pills, prev/next + arrow-key navigation, Escape close, wrap-around at both ends, filter-scoped navigation — all byte-identical both sides). The booking surface holds on its labels, input classes, option lists, native-validation blocking, deep-link preselection, invalid-param fallback, happy-path URL contract, and visible confirmation content (525/525 innerText). But the sweep found **three visible parity gaps and one structural divergence** the prior sessions never measured, plus the usual doc drift:

1. **The ICS download emits the wrong event length** — the reference produces a **fixed 90-minute event block** regardless of service (verified across three bookings whose advertised durations are 210/60/180 minutes — all produce exactly 90-minute events); the clone uses the service's `durationMin` (a 3.5-hour event for balayage).
2. **The ICS LOCATION string escapes commas** the reference leaves raw — the reference emits `LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013` and an **unescaped** client name in DESCRIPTION (`Anna Marx, Jr.`); the clone escapes per RFC 5545. The downloaded bytes differ.
3. **The booking form's Notes textarea lacks the reference's placeholder** (`Anything we should know — inspiration, allergies, previous treatments...`), and the form's DOM nesting differs: the reference nests its 7 fields inside a `grid` div and places the Notes label (`block mt-5`) and the button row (`mt-10`, computed 40px) OUTSIDE it as block siblings; the clone makes the `<form>` itself the grid and spans Notes + button row across it (`md:col-span-2`, effective 36px button-row gap — a 4px visible delta).
4. **The confirmation's Add-to-calendar icon is the wrong glyph at the wrong size** — the reference renders lucide `Calendar` at `h-4 w-4` (16px, settled state verified across 6 loads); the clone renders `CalendarPlus` at 14px.

All four trace to the same root cause as the session-5 404 and session-7 service-detail findings: session-1 built these surfaces from unmeasured assumptions, and the tests were written against the clone's own output — never against live-measured values. The session-6 lesson ("a pin is only as good as its verification") extends to downloads: the ICS href was regex-checked for `balayage` presence only, never decoded and compared.

---

## 2. Findings Register

| ID | Severity | Surface | Finding (live-measured) |
|----|----------|---------|--------------------------|
| F1 | S2 (MEDIUM) | ICS DTEND | Live: `DTEND = DTSTART + 90 minutes` — a **fixed block**, invariant across services (balayage advertised 210 → 90; gel-manicure 60 → 90; bridal-package 180 → 90). Clone: `DTEND = start + serviceRow.durationMin` (210 for balayage → a 3.5-hour event). Every downloaded `.ics` differs for all 8 services. |
| F2 | S3 (LOW) | ICS text escaping | Live: **no RFC 5545 comma escaping** anywhere — `LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013` (raw commas) and `DESCRIPTION:Reservation for Anna Marx, Jr..` (a comma-bearing name passes through raw). Clone: LOCATION escapes commas (`\,`); the name would pass raw (DESCRIPTION is unescaped in the clone too). |
| F3 | S3 (MEDIUM) | Booking Notes field | Live textarea: `placeholder="Anything we should know — inspiration, allergies, previous treatments..."` (U+2014 em dash, three ASCII dots) + `rows=4`. Clone: no placeholder (rows already 4). |
| F4 | S4 (LOW) | Booking form DOM/spacing | Live: `<form class="glass border border-foreground/10 rounded-sm p-6 md:p-12 max-w-3xl mx-auto" style=display:block>` with THREE children — `div.grid.grid-cols-1.md:grid-cols-2.gap-5` (7 field labels, class `block `), `label.block.mt-5` (Notes, computed margin-top 20px), `div.mt-10.flex.flex-col.sm:flex-row…gap-6` (button row, computed margin-top 40px). Clone: the form IS the grid; Notes = `block md:col-span-2` inside; button row = `md:col-span-2 mt-4` inside (effective 36px gap). Visible delta: 4px on the button row; DOM shape differs. |
| F5 | S3 (MEDIUM) | Confirmation icon | Live Add-to-calendar: lucide **`Calendar`** (`lucide lucide-calendar h-4 w-4`, computed 16px; settled state stable across 6 measured loads). Clone: `CalendarPlus` `size={14}`. The decorative 96px `CalendarPlus` (stroke 0.75) matches on both sides and stays. |
| F6 | S5 (INFO) | a11y additions (accepted) | The clone adds `aria-label` on gallery tiles, `aria-pressed` on filter pills, `autoComplete` on booking inputs — all invisible, none present on the reference. Keep (the `document.title` precedent: deliberate accessibility improvements, documented divergences). |
| F7 | S5 (docs) | Doc drift | `README.md` (hierarchy) and `Project_Architecture_Document.md` (§3.2) reference `GalleryExperience.tsx`; the component is `GalleryGrid.tsx` (exports `GalleryExperience`). Align the doc names. |
| F8 | carried | advisories | `braces` + `deepmerge-ts` dev-only transitive advisories — accepted-risk stance re-verified this session (no upstream fix). |
| — | accepted | label class artifact | Live field labels carry a trailing space (`block ` — a template-literal artifact); computed output identical to the clone's `block`. No action. |
| — | accepted | live icon transient | The live confirmation button briefly renders `calendar-plus` mid-initialization (1 of 7 loads, pre-settle); the settled state is `calendar h-4 w-4`. The spec pins the settled state (with a settle wait). |

**Verified holding (no action):** the mobile drawer (every pinned value + tap-close-navigate, live+local @390×844), booking labels/option lists/input classes/submit-button classes/policy line, native HTML5 validation blocking (no `novalidate`, no custom error UI), deep-link preselection (`?service=&stylist=`) and unknown-param fallback (both sides), happy-path redirect URL (exact query-string contract, no stylist param), confirmation visible surface (innerText 525/525), ICS envelope + PRODID + UID format + DTSTAMP format + SUMMARY/DESCRIPTION templates, gallery filter pills (labels/classes/counts), lightbox structure + Close/Prev/Next buttons + arrow-key navigation + Escape + wrap-around at both ends + filter-scoped navigation, decorative confirmation icon.

---

## 3. Root-Cause Analysis

**Why the ICS divergences survived six green sessions.** The ICS builder was built in session 1 as a pure, unit-tested module — and its tests pinned the *assumed* behavior ("carries the booking as UTC stamps with **the service duration**", "escapes the LOCATION commas **per RFC 5545**") before anyone had ever downloaded the reference's `.ics`. `booking.spec.ts` then checked only that the data-URI href *contains* `balayage`. No test ever decoded the payload — so the single most user-visible artifact of the booking flow (the calendar file a client actually downloads) was never compared. The same unmeasured-assumption pattern as the session-5 404 and the session-7 FAQ/CTA omissions.

**Why the form structure diverged.** Session 1 reproduced the *rendered* layout (a 2-column field grid at md) but flattened the DOM: instead of the reference's block-level `<form>` containing a nested grid div + two block siblings, the clone put the grid classes directly on the form and used `md:col-span-2` to span Notes and the button row. The rendering is close (the only measurable delta is the 4px button-row gap: 40px live vs 36px effective local) but the DOM shape — which the parity specs exist to pin — differs, and the Notes placeholder was simply never extracted.

**Why the icon diverged.** The live SPA renders its Add-to-calendar link only after client initialization, and one pre-settle load serves a transient `calendar-plus`; session 1's extraction evidently caught the transient (or the assumption) — 14px `CalendarPlus` — while the settled state across 6 loads is `Calendar` at `h-4 w-4`.

---

## 4. The Fixes (Design)

### 4.1 F1 + F2 — the ICS contract (`src/lib/ics.ts`, `src/app/book/confirmation/page.tsx`)

**Builder.** Replace the `durationMin` input with a module constant — the reference's fixed appointment block:

```ts
// The reference's ICS carries a FIXED 90-minute event block — the service's
// advertised duration never enters the download (live-measured session 8:
// bookings whose advertised durations are 210/60/180 minutes all produced
// exactly 90-minute events).
const APPOINTMENT_BLOCK_MIN = 90;
```

`addMinutes(date, time, APPOINTMENT_BLOCK_MIN)` keeps the midnight rollover. The `IcsInput` interface drops `durationMin`. The LOCATION line loses the `\\,` escapes: `LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013` (the reference performs no RFC 5545 comma escaping anywhere — verified with a comma-bearing client name; the payload is a template concatenation, and byte-parity of the download outranks RFC correctness here — the divergence is noted in-code).

**Confirmation page.** The `getService(service)` lookup existed solely to feed `durationMin` into the ICS — with the fixed block it is dead code; remove the lookup, the import, and the `durationMin` local. The page still renders the service slug from the query string (unchanged). Net effect: one less DB read per confirmation view.

**ADR-007 update (docs).** The decision record's "resolves the service (for duration)" clause is corrected to the measured contract: the receipt is a pure function of the query string; the ICS carries a fixed 90-minute block; no service resolution occurs.

### 4.2 F3 + F4 — the booking form DOM (`src/components/BookingForm.tsx`)

Restructure to the reference's exact nesting (computed margins measured live):

```tsx
<form className="glass border border-foreground/10 rounded-sm p-6 md:p-12 max-w-3xl mx-auto" onSubmit={onSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {/* 7 field labels, className="block" — unchanged contents */}
  </div>
  <label className="block mt-5">
    {/* Notes eyebrow + textarea rows=4 placeholder="Anything we should know — inspiration, allergies, previous treatments..." */}
  </label>
  <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
    {/* policy line + submit button — unchanged contents */}
  </div>
  {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
</form>
```

Changes: form drops the grid classes (block); the 7 fields nest inside the grid div; the Notes label drops `md:col-span-2` for `mt-5`; the button row drops `md:col-span-2 mt-4` for `mt-10`; the error `<p>` drops `md:col-span-2`. The `autoComplete` attributes stay (F6, accepted). The submit handler, deep-link preselection, native validation, and API contract are untouched.

### 4.3 F5 — the confirmation icon (`src/app/book/confirmation/page.tsx`)

`CalendarPlus size={14}` → `Calendar className="h-4 w-4"` on the Add-to-calendar link (the reference's `lucide-calendar h-4 w-4`, 16px). The decorative 96px `CalendarPlus strokeWidth={0.75}` is already correct and stays.

### 4.4 F7 — doc names

`README.md` hierarchy + PAD §3.2: `GalleryExperience` → `GalleryGrid.tsx` (the component file's actual name; the exported symbol remains `GalleryExperience`).

### 4.5 Tests (TDD — the new parity contracts)

- **Unit `tests/ics.test.ts` (rewritten to the live-measured contract):** (1) the VCALENDAR envelope (kept); (2) **DTEND = DTSTART + 90 minutes fixed** (11:30 → 13:00 — regardless of any service); (3) midnight rollover under the fixed block (23:30 → 01:00 next day); (4) SUMMARY/DESCRIPTION/UID templates (kept) **plus the comma-bearing name passes through raw** (`Anna Marx, Jr.` — no `\,`); (5) **LOCATION carries raw commas** (no `\,` anywhere); (6) the data-URI prefix (kept).
- **E2E `tests/e2e/booking-parity.spec.ts` (new — the live-measured structural contract):** (1) the form is block-level with the nested 2-col grid holding exactly 7 labels; the Notes label is a direct form child with computed margin-top 20px; the button wrapper is a direct form child with computed margin-top 40px; (2) the Notes textarea carries the exact placeholder string + `rows=4`; (3) the Add-to-calendar icon is `lucide-calendar` at computed 16px (with a settle wait for the local render); (4) the ICS read-back — decode the confirmation page's data-URI href and assert `DTSTART:…T143000Z` + `DTEND:…T153000Z` (the fixed 90-minute block), the raw-comma LOCATION, and no `\,` anywhere in the payload.

Expected RED state: the new/rewritten assertions fail against the current build (DTEND 18:00 not 15:30; LOCATION escaped; no placeholder; icon calendar-plus; Notes label inside the grid; button wrapper 36px).

### 4.6 Documentation alignment (post-fix)

README (testing table + booking-feature row: the fixed ICS block + placeholder + structure), AGENTS.md (booking-contract invariant: the fixed 90-minute ICS block + the nested-grid form + the Notes placeholder; the ICS escaping divergence note), CLAUDE.md (booking contract line + counts), PAD (ADR-007 correction, §7 inventory + session-8 ledger, §3.2 GalleryGrid name), `beauty-salon_SKILL.md` v1.5.0 (project_state, §5.5 booking contract, Appendix B/C), `.env.example` re-verify (no env change — expected unchanged).

### 4.7 Screenshots

Re-capture the 15 canonical captures on the remediated dev build (08-book-desktop, 12-book-mobile, 14-confirmation-desktop change; the rest expected byte-identical or near-identical re-renders). VLM-verify the book capture (placeholder + spacing) + the confirmation capture (icon) + the standing mobile-menu check.

---

## 5. Live-Extracted Reference Data (this session's measurements)

### 5.1 The ICS payload contract (3 bookings decoded live)

| Field | Live value (verbatim) |
|---|---|
| Envelope | `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Maison Luminaire//EN\r\nBEGIN:VEVENT` |
| UID | `<Date.now()>@maisonluminaire` |
| DTSTAMP | `<now>Z` UTC, `YYYYMMDDTHHMMSSZ` |
| DTSTART | `<booking wall-time>Z` (the picked time treated as UTC) |
| **DTEND** | **`DTSTART + 90 minutes` — fixed, service-independent** (210→90, 60→90, 180→90) |
| SUMMARY | `Maison Luminaire — <service slug>` |
| DESCRIPTION | `Reservation for <name>. We will confirm within 2 business hours.` — **raw commas** |
| LOCATION | `24 Rue Lumière, Suite 3, New York, NY 10013` — **raw commas** |

### 5.2 The booking form structure (settled, live)

```
form.glass.border.border-foreground/10.rounded-sm.p-6.md:p-12.max-w-3xl.mx-auto   (display: block)
├── div.grid.grid-cols-1.md:grid-cols-2.gap-5
│   └── 7 × label "block "   (Full name*/Email*/Phone/Stylist/Service*/Preferred date*/Preferred time*)
│       └── each: span.block.text-[10px].uppercase.tracking-editorial.text-foreground/60.mb-2 + input/select
├── label.block.mt-5          (Notes; computed margin-top 20px)
│   └── textarea rows=4 placeholder="Anything we should know — inspiration, allergies, previous treatments..."
└── div.mt-10.flex.flex-col.sm:flex-row.items-start.sm:items-center.justify-between.gap-6   (computed margin-top 40px)
    ├── p.text-[11px].uppercase.tracking-editorial.text-foreground/50.max-w-sm.leading-relaxed
    └── button.inline-flex.items-center.gap-3.rounded-full.bg-foreground.text-background.px-8.py-4.text-[11px].uppercase.tracking-editorial.hover:bg-secondary.transition.disabled:opacity-60  ("Request appointment" + arrow icon)
```

Placeholder exact bytes: `Anything we should know — inspiration, allergies, previous treatments...` (U+2014 between "know" and "inspiration"; three ASCII `.` at the end).

### 5.3 The confirmation icon (settled, live — 6/6 loads)

`<svg class="lucide lucide-calendar h-4 w-4" …>` — computed 16×16px, on the Add-to-calendar link. (One pre-settle load served `calendar-plus` @14px transiently — a hydration race on the reference SPA; the settled state is the contract.)

### 5.4 Gallery lightbox (verified holding — recorded for the ledger)

`fixed inset-0 z-[70] bg-foreground/95 flex items-center justify-center p-6`; Close (`absolute top-6 right-6 h-10 w-10`), Prev (`absolute left-6 md:left-10 h-12 w-12`), Next (`absolute right-6 md:right-10 h-12 w-12`); caption `max-w-[90vw] max-h-[85vh]` > img (`max-w-full max-h-[80vh] object-contain`) + `mt-4 text-background/80 text-center` (eyebrow `text-[10px] uppercase tracking-editorial text-background/50 mb-1`, title `font-serif text-2xl`, desc `text-background/70 text-sm mt-1 max-w-md mx-auto`). Keyboard: ArrowRight/ArrowLeft step within the **filtered** set with wrap-around at both ends; Escape closes. Filter pills: `text-[11px] uppercase tracking-editorial rounded-full px-5 py-2.5 border transition` (active `bg-foreground text-background border-foreground`; inactive `border-foreground/20 hover:border-foreground/60`).

---

## 6. Plan-vs-Codebase Validation (pre-execution)

| Plan element | Codebase fact checked | Aligned |
|---|---|---|
| The ICS duration flows from `serviceRow.durationMin` | `src/app/book/confirmation/page.tsx:32-39` — `getService(service)` → `durationMin = serviceRow?.durationMin ?? 60` → `buildIcs({…durationMin…})`; `getService` used nowhere else on the page | ✓ |
| `buildIcs` computes DTEND from the input | `src/lib/ics.ts:41` — `addMinutes(date, time, durationMin)`; the interface documents the input at lines 9-10 | ✓ |
| LOCATION escaping lives in one line | `src/lib/ics.ts:55` — the hardcoded `"LOCATION:24 Rue Lumière\\, Suite 3\\, New York\\, NY 10013"` string | ✓ |
| The current unit tests pin the wrong behavior | `tests/ics.test.ts:21-32` (210-min DTEND + rollover via `durationMin`), `:41-44` (escaped LOCATION) — both to be rewritten to the measured contract | ✓ |
| The booking form is the grid | `src/components/BookingForm.tsx:83` — form carries `grid grid-cols-1 md:grid-cols-2 gap-5`; Notes `block md:col-span-2` (line 185); button row `md:col-span-2 mt-4` (line 197) | ✓ |
| The textarea lacks the placeholder | `BookingForm.tsx:189-194` — `rows={4}`, no `placeholder` attribute | ✓ |
| The confirmation button icon is CalendarPlus@14 | `confirmation/page.tsx:95` — `<CalendarPlus size={14} aria-hidden />`; the decorative 96px icon (line 55) is correct | ✓ |
| The lucide `Calendar` icon is available | `lucide-react` already a dependency (used across components — e.g. `Check`, `ChevronDown`, `X`) | ✓ |
| The e2e booking spec won't break | `booking.spec.ts` asserts labels/options/URL/`balayage`-in-href/`Wednesday, November 18` — all survive (labels unchanged; the placeholder doesn't affect `getByLabel`; the ICS regex still matches); the submission test's `2026-11-18`/`14:30` doesn't assert DTEND | ✓ |
| `booking.spec.ts` uses `getByLabel(/Notes/i)` | Label text "Notes" is unchanged by the restructure (only the wrapper classes change) | ✓ |
| Removing `getService` from the confirmation page won't break other tests | `grep getService src/app` — the confirmation page is the only caller outside the services pages; no spec imports it | ✓ |
| The notes-length cap / API contract unaffected | The API route (`/api/appointments`) is untouched — validation, persistence, and the e2e invalid-submission spec stay green | ✓ |
| No other component renders an ICS link | `grep -r "icsDataUri\|buildIcs" src/` — only the confirmation page | ✓ |
| Doc names to fix | `README.md:61` + `Project_Architecture_Document.md:199` both say `GalleryExperience`; `ls src/components/` → `GalleryGrid.tsx` | ✓ |
| `.env` / db / wrapper defense intact | `.env` `DATABASE_URL="file:../db/custom.db"` ✓; repo `db/custom.db` seeded 8/3/12/4/1 (faqs populated, verified this session); the ambient absolute `DATABASE_URL` is present in this sandbox and the wrapper defense is holding (dev server renders seeded content; health `{"status":"ok","db":true}`) | ✓ |

---

## 7. ToDo List (execution order, TDD)

- [x] **T1.** RED — rewrite `tests/ics.test.ts` to the live-measured contract (fixed 90-min DTEND, raw-comma LOCATION, raw comma-name, rollover at 90) + write `tests/e2e/booking-parity.spec.ts` (form nesting + computed margins, placeholder bytes, icon glyph/size, decoded-ICS read-back); run: expect all new/rewritten specs red against the current build, pre-existing 113 green. *(Executed: unit 3/7 failed exactly as predicted — the comma-name case passed because the clone's DESCRIPTION never escaped names, per the validation matrix; e2e 4/4 failed exactly as predicted. Two spec-side shapings: a `getByRole` options-object type error, and one arithmetic correction — 14:30+90 = 16:00, re-derived from the live measurement.)*
- [x] **T2.** GREEN (ICS) — `src/lib/ics.ts`: drop `durationMin` from `IcsInput`, add `APPOINTMENT_BLOCK_MIN = 90`, unescape LOCATION; `src/app/book/confirmation/page.tsx`: drop the `getService` lookup + import. *(Executed as designed; one import-path typo caught and fixed before the gate.)*
- [x] **T3.** GREEN (form) — `BookingForm.tsx`: nested-grid restructure + `mt-5` Notes label + the exact placeholder + `mt-10` button row. *(Executed as designed.)*
- [x] **T4.** GREEN (icon) — `Calendar` `h-4 w-4` on the Add-to-calendar link. *(Executed as designed.)*
- [x] **T5.** Full gate: `lint ✓ · typecheck ✓ · unit 61/61 ✓ · build 27/27 pages ✓ · e2e 62/62 ✓` (123 total; all pre-existing contracts untouched). *(Executed.)*
- [x] **T6.** Live re-verification of the remediated surfaces (side-by-side ICS decode, form structure/placeholder, icon) + re-capture the 15 screenshots on the remediated dev build; VLM-verify book + confirmation + mobile-menu. *(Executed: the local ICS decodes identical to the live payload for the same booking; the form + placeholder verified in-DOM; a full submission smoke test passes; 15 captures re-taken — the mobile-menu 26124B byte-identical to all prior verified sessions, 09/10 byte-identical, 12-book-mobile documents the placeholder; VLM-verified 08/12/14/11. First capture pass had gone to the daemon cwd — redone with absolute paths; the canonical viewport-only style replicated.)*
- [x] **T7.** Documentation aligned (README/AGENTS/CLAUDE/PAD incl. ADR-007 + GalleryGrid names/SKILL v1.5.0); `.env.example` re-verified. *(All applied; `.env.example` unchanged — truthful.)*
- [x] **T8.** Replace `docs/session_8.md` with the proper session log; append the worklog record; mark this plan's ToDo results. *(Done.)*
- [ ] **T9.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Pending — executed at session close.)*

## 8. Acceptance Criteria (definition of done)

1. A booking's downloaded `.ics` decodes to `DTSTART + 90 minutes` DTEND with raw-comma LOCATION — pinned by the rewritten unit tests and the decoded-href e2e read-back.
2. `/book` renders the reference's nested form structure with the exact Notes placeholder and 40px button-row spacing — pinned by `booking-parity.spec.ts` computed-style assertions.
3. The Add-to-calendar link renders lucide `Calendar` at 16px.
4. Full gate green with zero weakened assertions; all pre-existing parity contracts untouched.
5. Screenshots re-captured on the remediated build; book + confirmation + mobile-menu captures VLM-verified.
6. Docs aligned (incl. ADR-007's duration clause and the GalleryGrid name fixes); `.env.example` truthful.
7. Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py`; remote == local verified post-push.

## 9. Rollback

Revert the commit: restore `src/lib/ics.ts` (durationMin input + escaped LOCATION), `src/app/book/confirmation/page.tsx` (getService lookup + CalendarPlus), `src/components/BookingForm.tsx` (flat grid), the rewritten `tests/ics.test.ts`, the new `tests/e2e/booking-parity.spec.ts`, and the doc alignments. No schema, seed, API, auth, or infrastructure change is involved.

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| ICS contract (fixed block + raw commas) | `src/lib/ics.ts`, `src/app/book/confirmation/page.tsx` |
| Booking form structure + placeholder | `src/components/BookingForm.tsx` |
| Confirmation icon | `src/app/book/confirmation/page.tsx` |
| Parity contracts | `tests/ics.test.ts` (rewritten), `tests/e2e/booking-parity.spec.ts` (new) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.5.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-8.md`, `docs/session_8.md`, `worklog.md` |
