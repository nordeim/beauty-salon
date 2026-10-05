# Remediation Plan — Session 15 (The Scroll-Restoration Census + The ICS STATUS/TRANSP Census)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `ea159ef` (session-14 deliverable `3a2894e` + the push-evidence follow-up `19630a3` + the owner's session-log commit — docs only: `docs/session_15.md` transcript added, zero code drift)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (login, the mobile drawer @390×844 standing check — the task brief's emphasis, the reference-drift check, and **the two session-14 log's suggested candidates**: the ICS `STATUS`/`TRANSP` field census + the scroll-restoration/popstate behavior census, extended with the dead-`#`-link click census in the same SPA-routing family) + TDD remediation per this plan. Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-14 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 63/63 unit, 27/27 build pages, 119/119 e2e — 182 total) at the session-15 baseline: the owner's `ea159ef` commit added only `docs/session_15.md` (the session-14 transcript record) — zero code changes since the session-14 push.

This session executed both session-14 suggested candidates and found **one real behavioral divergence in the scroll family**: the reference's SPA router NEVER resets scroll on in-app navigation (the offset carries across routes and clamps to the target page's height — landing@2000 → `/services` lands at 1830, the services page's max scrollable), while the clone's Next.js App Router scrolls to top on every `<Link>`/`router.push` navigation. The **popstate half is already at parity** (both sides restore the exact saved offset on back/forward — browser-native `history.scrollRestoration: 'auto'`). The **ICS census found the clone already byte-identical** — the reference's download carries NEITHER `STATUS` NOR `TRANSP` (and neither does the clone) — but the negative contract was unpinned, so an RFC-minded maintainer could silently break parity by "improving" the file. The widened dead-`#`-link census found a second small divergence in the SPA-routing family: the reference's router resolves the dead `#` href to the current path (no URL change, no history entry, instant scroll-to-top) while the clone's browser-default anchor semantics append `#` and push a history entry.

**One actionable scroll finding (F1) + one routing finding (F2) + one ICS pin (F3) + three verified-holding standing checks (F4–F6).**

## 2. Findings register (live-measured 2026-10-06, agent-browser, viewport 1280×900 unless noted)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F1 | MEDIUM — scroll parity | In-app SPA navigation scroll behavior | Scroll offset KEPT across in-app navigations: landing scrolled to 2000 → clicking the header `/services` link lands at **1830 = the services page's max scrollable** (clamped, not reset); `history.scrollRestoration: 'auto'` | Scroll RESET to 0 on every `<Link>`/`router.push` navigation (the Next.js App Router default: `routerScroll = scroll ?? true`); the popstate half already matches (back → exact 2000 restore) |
| F2 | LOW-MEDIUM — routing parity | The dead `#` article link (accessibility page) | Click → **no URL change** (no `#` appended), **no history entry** (+0), **instant** scroll to top (read `y=0` synchronously after the click) — the SPA router resolves `#` to the current path and applies its scroll-top policy | Click → `#` appended to the URL, +1 history entry, scroll to top (the browser's default anchor semantics — the visible scroll matches, the URL/history do not) |
| F3 | INFO — parity verified, needs a pin | ICS `STATUS`/`TRANSP` field census (the session-14 suggested candidate; captured via the reference's own booking flow → the confirmation's Add-to-calendar `data:text/calendar` href, decoded) | The download carries NEITHER `STATUS:` NOR `TRANSP:`; field order: `VCALENDAR / VERSION:2.0 / PRODID:-//Maison Luminaire//EN / VEVENT / UID:{Date.now()}@maisonluminaire / DTSTAMP / DTSTART / DTEND(+90min — 14:30→16:00) / SUMMARY:Maison Luminaire — {slug} / DESCRIPTION:Reservation for {name}. We will confirm within 2 business hours. / LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013 (raw commas) / END:VEVENT / END:VCALENDAR` | `src/lib/ics.ts` is ALREADY byte-parity: the same sequence, the same fixed 90-minute block, the same em-dash SUMMARY with the slug, the same DESCRIPTION sentence, the same raw-comma LOCATION, no STATUS/TRANSP — pin the negative contract so nobody "improves" RFC 5545 compliance by adding them |
| F4 | INFO — verified holding | Mobile drawer @390×844 (the task brief's emphasis) | fixed z-60 cream `rgb(250,248,245)`, 390×844, flex-col gap 8px, padL 32px, 5 links 48px Cormorant lh 48px ls −1.2px ink, CTA mt 40px, tap-through → `/services` | **byte-identical both sides — no Tailwind v4 regression** ✓ (the baseline e2e mobile-navigation contract green into the bargain) |
| F5 | INFO — verified holding | Reference drift (services page) | title `Services \| Beauty Salon`, h1 128px Cormorant, the ink `inline-block` bottom-CTA pill, cream body bg | ✓ un-drifted |
| F6 | INFO — re-verified live | Fire-and-forget booking navigation | the booking POST (200) → `/book/confirmation?name=&date=&time=&service=` — the query-string contract, in that order | ✓ (pinned since session 12; re-verified live this session) |

## 3. Root cause

**The scroll family splits into two layers, like every prior census:** the *popstate* layer (back/forward) is browser-native on both sides (`history.scrollRestoration: 'auto'`) and was already at parity; the *navigation* layer is a router policy difference. The reference is a client-rendered SPA whose router swaps content in-place with **no scroll management at all** — the document scroll offset simply survives the DOM swap, and the browser clamps it when the new content is shorter (2000 → 1830). The clone's Next.js App Router applies an explicit scroll-to-top policy on every push navigation (`routerScroll = scroll ?? true` in the Link/router source) — a deliberate framework default that diverges from the reference's absent management. The dead-`#`-link finding is the same family at a finer grain: the reference's router intercepts ALL anchor clicks (resolving `#` to the current path, preventDefault-ing the browser's anchor semantics — no URL change, no history entry — and applying a scroll-top policy for the same-page resolution), while the clone renders the dead link as a plain `<a href="#">` whose default semantics append the hash and push a history entry.

The session-14 lesson generalizes: **navigation-policy parity is invisible to every census that reads the DOM at rest** — the settled DOM, the href census, and the class census all pass identically while the router's scroll/hash policies diverge on interaction. Each needs its own interaction instrument (this session's: programmatic scroll + link click + scrollY reads; hash-link dispatch + URL/history reads).

## 4. Design (the fixes)

### 4.1 F1 — the scroll-keep navigation policy (`scroll={false}` on every in-app navigation)

Next 16's `<Link>` supports a **`scroll?: boolean` prop** (verified in `node_modules/next/dist/client/link.js` + `.d.ts`: destructured from props, `const routerScroll = scroll ?? true`, threaded into `linkClicked` → `router.push(…, { scroll: routerScroll })`), and the imperative `router.push(href, { scroll: false })` carries the same option. Two verified source facts make the declarative prop safe with the existing handlers: the user's `onClick` runs BEFORE the `defaultPrevented` check (the drawer's `onClick={() => setOpen(false)}` still fires), and `isModifiedEvent`/`download` clicks fall through to the browser (new-tab semantics preserved). The prop works in server components too (it serializes like any prop) — no client-island conversion needed.

**The inventory (18 `<Link>` JSX sites across 9 files + 3 `router.push` sites):**

| File | Sites |
|---|---|
| `src/components/layout/SiteHeader.tsx` | 6 — logo, desktop nav map, BOOK NOW, drawer logo, drawer nav map, drawer CTA |
| `src/components/layout/SiteFooter.tsx` | 2 — NAV_LINKS map, LEGAL_LINKS map |
| `src/components/layout/BookHeader.tsx` | 2 — ← Return to site, logo |
| `src/components/ServicesExperience.tsx` | 2 — service-card map, bottom CTA |
| `src/app/(site)/page.tsx` | 3 — hero circle CTA, CATEGORY_CARDS map, Read-our-full-story |
| `src/app/(site)/services/[slug]/page.tsx` | 4 — Service-not-found return, ← All treatments, Book-this-treatment ×2 |
| `src/app/(site)/team/page.tsx` | 1 — Book-with-{stylist} map |
| `src/app/(site)/contact/page.tsx` | 1 — Reserve an appointment |
| `src/app/book/confirmation/page.tsx` | 1 — Return home |
| `src/components/BookingForm.tsx` | `router.push(/book/confirmation?…)` → `{ scroll: false }` |
| `src/components/LoginForm.tsx` | `router.push("/")` → `{ scroll: false }` |
| `src/components/NotFoundBody.tsx` | `router.push("/")` (Go Home) → `{ scroll: false }` |

Unaffected by design: the external/functional anchors (`tel:`, `mailto:`, the Google Maps directions link — plain `<a>`, no router involvement), the category pills (state buttons, no navigation), and the popstate path (browser-native on both sides — `scroll={false}` only affects push navigations).

### 4.2 F2 — the dead-`#`-link contract (`src/components/DeadHashLink.tsx`, new client island + `LegalPage.tsx`)

A tiny client component replacing the plain `<a href="#">` in `LegalPage`'s `LegalPBlock.link` rendering:

```tsx
"use client";
// The reference's SPA router resolves the dead "#" href to the current path:
// no URL change (no hash appended), no history entry, instant scroll to top
// (live-measured session 15). The browser default would append "#" and push
// a history entry — replicate the router's semantics, not the browser's.
export function DeadHashLink({ text, className }: { text: string; className?: string }) {
  return (
    <a
      href="#"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
      }}
    >
      {text}
    </a>
  );
}
```

`LegalPage.tsx` renders `<DeadHashLink text={link.text} className={link.className} />` where it currently renders the plain `<a>` (the `LoginCardBody` island pattern — server page, client leaf). The href attribute stays `#` in the DOM (the links-parity href census stays green); only the click semantics change.

### 4.3 F3 — the ICS negative pins (`tests/ics.test.ts`, extended)

Two unit tests: (1) the built ICS contains no `STATUS:` and no `TRANSP:` line (the live-measured census — the reference's download omits both; adding either would break byte-parity); (2) the field-order census — the line-key sequence equals `["BEGIN:VCALENDAR","VERSION","PRODID","BEGIN:VEVENT","UID","DTSTAMP","DTSTART","DTEND","SUMMARY","DESCRIPTION","LOCATION","END:VEVENT","END:VCALENDAR"]` exactly (the live capture's order, `UID` before `DTSTAMP` included). Pins, not fixes — green immediately (the session-13 ICS-pin and session-14 print-pin precedent).

### 4.4 The e2e scroll contracts (`tests/e2e/scroll-parity.spec.ts`, new)

- **P1 (the navigation contract, RED today):** on the landing, scroll to 2000, click the header `/services` link, then assert `scrollY === maxHeight` (the services page's `scrollHeight − innerHeight`, computed at runtime — the clamp) and `scrollY > 0` — the offset carried and clamped, NOT reset.
- **P2 (the popstate guard, GREEN today):** `goBack()` → the landing restores the exact 2000.
- **P3 (the forward guard, GREEN today):** `goForward()` → the services page restores its saved offset.
- **P4 (the top-nav indistinguishability guard):** navigate from `y=0` → the target starts at 0 (identical under both policies — the divergence only exists for scrolled origins).
- **P5 (the deep-link query nav, RED today):** on `/services/balayage` scrolled to 2000, click the Book-this-treatment CTA (`/book?service=balayage`) → the offset carries and clamps to the book page's max scrollable.
- **P6 (the dead-`#`-link contract, RED today):** on `/accessibility` scrolled to 1200, click the article link → `page.url()` gains no `#`, `history.length` unchanged, `scrollY === 0`.

Viewport note: the e2e runs `devices["Desktop Chrome"]` (1280×720) — every clamp value is computed at runtime (`scrollHeight − innerHeight`), never hardcoded.

### 4.5 Documentation alignment (README, AGENTS.md, CLAUDE.md, PAD, SKILL v1.12.0, session_15.md, worklog)

README (the scroll-behavior feature row + the ICS-census note + counts), AGENTS.md (the scroll-policy invariant + the dead-`#`-link click contract + the scroll-parity contract line + the ICS negative-pin note), CLAUDE.md (counts + the parity list), PAD (§3 the navigation-policy note, §7 inventory + the session-15 ledger), `beauty-salon_SKILL.md` **v1.12.0** (project_state, Appendix B counts, Appendix C session-15 row), the proper `docs/session_15.md` record (replacing the transcript the owner committed there — the sessions 4–14 convention), the worklog entry, this plan's executed results. `.env.example` re-verified (the fixes read no env).

## 5. TDD plan

**T1 (RED):** write `tests/e2e/scroll-parity.spec.ts` (6 contracts) + the two ICS pins in `tests/ics.test.ts`; run against the current build. Expected: P1/P5/P6 RED exactly as the register predicts (the clone resets scroll; the dead link appends `#`); P2/P3/P4 GREEN (already at parity — guards); the ICS pins GREEN immediately (pins, not fixes — the session-13/14 pin precedent).

**T2 (GREEN):** apply §4.1 (the `scroll={false}` inventory) + §4.2 (the `DeadHashLink` island) — no schema changes, no `db:push` needed.

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — every pre-existing spec green (conflict check: zero existing specs read `scrollY` or assume post-nav scroll position — verified by grep; the landing rect reads are w/h-only on fresh `goto`s; Playwright's auto-scroll-into-view makes element assertions scroll-independent).

**T4:** live re-verification (agent-browser): the clone-side scroll census re-measured value-by-value (the kept-and-clamped navigation, the exact popstate restores, the dead-`#` semantics); the drawer standing check; the 15 canonical screenshots re-captured on the remediated build.

**T5:** documentation alignment (§4.5).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook's Appendix A at `/home/z/my-project/bin/shim/`, outside the repo) → verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The clone resets scroll on `<Link>` navigation | Measured on the dev server: landing@2000 → header `/services` click → `scrollY = 0` (the live: 1830 clamped) | ✓ gap confirmed |
| The clone's popstate restore already matches | Measured: back → exact 2000 on the clone (the live: exact 2000) | ✓ guard confirmed |
| `<Link>` supports the `scroll` prop in this stack | `node_modules/next/dist/client/link.d.ts:31` — `scroll?: boolean`; `link.js:137` destructures it, `:107` `routerScroll = scroll ?? true` | ✓ mechanism confirmed |
| The user's onClick still runs (drawer close) | `link.js:362-374` — `onClick(e)` runs BEFORE the `defaultPrevented` check | ✓ safe with handlers |
| The `router.push` option exists | `BookingForm.tsx:81` uses `router.push(url)` today; the App Router API accepts `{ scroll: false }` | ✓ rename scope confirmed |
| The dead `#` link renders as a plain `<a>` | `LegalPage.tsx:61` — `<a href={link.href} className={link.className}>` (server component; `link.href = "#"` from `legal.ts:77`) | ✓ island scope confirmed |
| The clone's `#` click appends the hash + pushes history | Measured: after a real `MouseEvent` dispatch — `href=…/accessibility#`, `hist +1`, `y=0` (the live: no hash, +0, `y=0`) | ✓ gap confirmed |
| The live's `#` scroll is instant | Measured: `scrollY = 0` read SYNCHRONOUSLY after the click dispatch (no smooth animation) | ✓ instant scrollTo confirmed |
| The clone's ICS already omits STATUS/TRANSP | `src/lib/ics.ts:48-66` — the 13-line sequence carries neither field | ✓ pin is green-able |
| The live's ICS field order matches the clone's | The live capture decoded: VCALENDAR/VERSION/PRODID/VEVENT/UID/DTSTAMP/DTSTART/DTEND/SUMMARY/DESCRIPTION/LOCATION/END:VEVENT/END:VCALENDAR — identical to `ics.ts`'s `lines` array | ✓ census confirmed |
| No existing spec reads scroll position | grep `scrollY\|scrollTo\|scroll(` over `tests/e2e/` → zero hits | ✓ no conflicts |
| The e2e viewport makes the clamps runtime-computed | The spec computes `scrollHeight − innerHeight` at runtime; the services page is scrollable at 1280×720 (measured max 1830 @ 1280×900; the 720 viewport is taller-scrollable) | ✓ no hardcoded values |
| The category pills don't navigate | `ServicesExperience.tsx:47-60` — state `button`s with `setCategory` (no router) | ✓ out of scope |
| The full gate is green at the baseline | This session's Phase 4: lint ✓ · tsc ✓ · unit 63/63 · build 27/27 · e2e 119/119 (182 total) | ✓ baseline green |

## 7. Risks

- **The `scroll={false}` sweep touches 12 files** — mitigated by the mechanical, reviewable nature of the change (one prop per Link site), the full-gate re-run, and the new e2e contracts pinning the behavior.
- **The kept-scroll policy can land users mid/bottom-page on navigation** (e.g., footer@max-scroll → a short page lands at its bottom) — this is the reference's own UX, replicated deliberately (the fire-and-forget precedent: parity outranks robustness). The popstate restore is unaffected.
- **The dead-`#` island changes click semantics only** — the href attribute stays `#` (the links-parity href census stays green); a hash-link with modifiers/middle-click falls through to the browser default exactly as before (the island only handles plain left-clicks).
- **The scroll e2e clamps depend on page heights** — all computed at runtime; a layout change that alters heights cannot false-fail the *mechanism* assertions (only the exact clamp values, which the spec never hardcodes).
- **The ICS pins assert a negative** — a future `STATUS:` addition (e.g., for cancellation flows) would fail them by design, forcing the parity conversation (the F3 pin's stated purpose).

---

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** RED — write `tests/e2e/scroll-parity.spec.ts` (P1–P6) + the two ICS pins in `tests/ics.test.ts`; run against the current build; expect P1/P5/P6 red exactly as the register predicts, P2/P3/P4 + the ICS pins green immediately. *(Executed: P1/P5/P6 failed exactly as predicted [the navigation reset, the deep-link reset, the dead-# hash-append]; P2/P3/P4 green guards; the 3 ICS pins green immediately — after two spec-side shapings: the popstate restores needed settled-value polls [they are smooth and asynchronous], and the P5 contract needed a dispatched-event click [Playwright's actionability scrollIntoView destroyed the scrolled origin — the "2000 → 63 anchoring" was that mid-flight origin, not app behavior].)*
- [x] **T2.** GREEN — apply §4.1 (the `scroll={false}` inventory across 12 files) + §4.2 (the `DeadHashLink` island in `LegalPage`). *(Executed: 18 Link JSX sites + 3 router.push sites + the island; lint + tsc clean. An `overflow-anchor: none` html rule was trialed against the "anchoring" and REMOVED — with a settled origin the production build clamps cleanly to max exactly like the live [423/427 measured on both], so the rule addressed a test artifact, not app behavior.)*
- [x] **T3.** Full gate: `lint → typecheck → unit → build → test:e2e` — every pre-existing spec green. *(Executed: lint ✓ · tsc ✓ · unit 66/66 ✓ · build 27/27 ✓ · e2e **125/125** ✓ — **191 total**; every pre-existing contract untouched.)*
- [x] **T4.** Live re-verification of the scroll contracts (clone-side value-by-value) + the drawer standing check + the 15 screenshots re-captured. *(Executed: the clone's navigation lands at 1830 = the services max [the live's exact value]; back → exact 2000; forward → exact 1830; the dead-# click: no hash, +0 history, instant top; the drawer standing check all pinned values identical both sides @390×844; 15 captures re-taken — the mobile-menu capture 26124B byte-identical, 08/09/10/12/14 also byte-identical [git-confirmed]; 02 + 14 VLM-verified; 13's lightbox DOM-verified open.)*
- [x] **T5.** Documentation aligned (README, AGENTS.md, CLAUDE.md, PAD, SKILL v1.12.0, `.env.example` re-verified, the proper `docs/session_15.md`, the worklog entry, this plan's executed results). *(All applied; `.env.example` unchanged — the fixes read no env.)*
- [x] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed — see the push evidence in §9.)*

## 9. Push evidence (session 15)

- Committed as one atomic commit to `main` (the scroll-policy sweep + the DeadHashLink island + the scroll-parity spec + the ICS pins + the docs alignment + the screenshots + the plan/session-log/worklog); pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the paramiko ssh shim from the runbook's Appendix A placed on PATH at `/home/z/my-project/bin/shim/`, outside the repo).
- Key fingerprint verified before the push (the runbook's paramiko method — the sessions 1–14 operator key).
- Dry-run clean (fast-forward); real push exit 0 with the wrapper's own remote verification + the tracking-ref sync; independent re-confirmation via `git ls-remote`.
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in the staged diff or any tracked file; no tracked env/db/key files beyond `.env.example`; the operator key shredded + removed post-push (the wrapper's temp copy shreds itself on every run).

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The navigation scroll policy (`scroll={false}` everywhere + `{ scroll: false }` on router.push) | `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `BookHeader.tsx`, `src/components/ServicesExperience.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/services/[slug]/page.tsx`, `src/app/(site)/team/page.tsx`, `src/app/(site)/contact/page.tsx`, `src/app/book/confirmation/page.tsx`, `src/components/BookingForm.tsx`, `src/components/LoginForm.tsx`, `src/components/NotFoundBody.tsx` |
| The dead-`#` click semantics (the router's resolution, not the browser's) | `src/components/DeadHashLink.tsx` (new), `src/components/LegalPage.tsx` |
| The ICS negative pins (no STATUS / no TRANSP / the field-order census) | `tests/ics.test.ts` |
| The scroll contracts | `tests/e2e/scroll-parity.spec.ts` (new) |
| Screenshots | `docs/screenshots/*.png` (re-captured; 7 byte-identical incl. the 26124B mobile-menu signal) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.12.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-15.md`, `docs/session_15.md`, `worklog.md` |
