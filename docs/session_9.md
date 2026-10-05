# Session 9 — Audit: The Icon Layer + the Contact Structure (2026-10-05)

**Baseline:** remote `main` @ `dcdea6a` · **Deliverable commit:** see `git log` (the icon class layer rebuilt to the live-measured census across 12 files, the contact Hours status-pill row, the login eye toggle removed, docs + screenshots refresh)
**Method:** Mode C audit (`skills/code-review-and-audit` pipeline — Phase 3 as a targeted lightweight checklist; `skills/` excluded) + live parity verification with `skills/agent-browser` (login, all 13 routes, the drawer @390×844, the gallery lightbox, and a first-ever **both-sides icon census** — every `svg.lucide` glyph/class/computed size/color/margin extracted from the live reference and compared against the local DOM page by page) + TDD remediation per `docs/remediation-plan-session-9.md`.

> Note: this file previously held the raw process transcript of session 8 (committed at `dcdea6a`). It has been replaced by this proper session-9 record — the same convention sessions 4–8 applied to their own transcript files.

## What this session set out to do

Refresh the workspace (continuation session — the environment, `.env`, and seeded DB were intact; `git pull` brought in `docs/session_9.md`), re-validate the documented architecture against the codebase, audit the session-8 changes, then — following the session-8 log's suggested candidates — verify the contact page's map embed and widen the sweep to the one DOM layer no prior audit had ever measured: **the lucide icon layer**. Remediate everything found via TDD, re-capture screenshots, align documentation, push to `main`.

## Audit results (all phases)

- **Phase 1 (lint + typecheck):** clean — ESLint 0 errors, `tsc --noEmit` clean.
- **Phase 2 (security):** `bun audit` shows the same two dev-only transitive advisories as sessions 2–8 (`braces`, `deepmerge-ts`) — the accepted-risk stance re-verified unchanged. Secret scan clean: the single `BEGIN OPENSSH PRIVATE KEY` match is the wrapper's redacted placeholder constant (`[REDACTED:ssh_private_key]`, verified). Tracked env/db/key files: only `.env.example`.
- **Phase 3 (lightweight checklist):** the targeted greps reproduce the established noise register exactly — `console.log`/TODO absent from `src/`; `scripts/` = exactly `with-repo-db.ts`; zero client `data.ts` imports.
- **Phase 4 (tests):** baseline fully green — unit 61/61, build 27/27 pages, e2e 62/62 (123 total).
- **Session-8 diff re-review:** the ICS `APPOINTMENT_BLOCK_MIN` constant, the raw-comma LOCATION, the confirmation page's dead-`getService` removal, the `Calendar h-4 w-4` icon, and the BookingForm nested-grid restructure all match the documented design; the codebase validates against every doc claim.

## Live parity verification (agent-browser)

**The contact map embed — this session's first candidate — VERIFIED HOLDING byte-identical:** the iframe's src URL (`!4v1700000000000` placeholder and all — the reference's own URL), `title="Map"`, `w-full h-full`, the inline `border: 0px; filter: grayscale(0.2) contrast(1.05);`, `loading="lazy"`, `referrerpolicy`, and the parent `aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-sm border border-foreground/10 bg-muted` all match exactly. **The session-8 log's "self-hosting the map" suggestion is rejected**: the reference itself loads the external Google Maps embed — replacing it would be a divergence, not a fix. The known screenshot drift is Google's per-load tile variance (inherent, accepted).

**The widened sweep — the first-ever both-sides icon census** — found the real gap family: the session-1 surfaces render icons via lucide `size={N}` attributes with authored class fragments; the reference uses class-based sizing with per-surface class sets including hover animations. The census (every `svg.lucide` on every route) found 19 divergent icon sites, several plainly visible:

- **F1a (MEDIUM — the testimonial stars):** live renders **sage** (`h-3.5 w-3.5 fill-secondary text-secondary`, computed `rgb(75, 93, 79)` — the same sage pin as the service-detail check icons); the clone rendered **ink** (`fill-foreground text-foreground`). A visible color divergence on the landing page.
- **F1b (MEDIUM-LOW):** the follow-along Instagram icon computes 16px live vs 14px in the clone.
- **F1c (MEDIUM — the gallery-preview hover icons):** live renders 24px icons that **fade in on hover** (`h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500`); the clone rendered 20px icons **permanently visible** over the tile images.
- **F1d (MEDIUM — the services card arrows):** live carries `h-5 w-5 … transition-all group-hover:rotate-45 group-hover:text-foreground` (landing variant `mt-2` = 8px; grid variant no-mt + `duration-500`); the clone had **no hover animation** and `mt-1` (4px).
- **F1e (MEDIUM — the team Book-with buttons):** live uses the **arrow-up-right** glyph with a **named group** (`group/btn` on the anchor, `group-hover/btn:rotate-45` on the icon); the clone used arrow-right with no group.
- **F1f (MEDIUM — the contact Get-directions glyph):** live renders **MapPin** at `h-3.5 w-3.5`; the clone rendered ArrowUpRight at `size={14}`.
- **F1g (MEDIUM — the footer Contact column, every page):** live renders phone/mail/Instagram icons at `h-3.5 w-3.5` inside the three contact links; the clone had **none** (the links' `inline-flex items-center gap-2` classes existed for these icons all along).
- **F1h (MEDIUM — the contact Reach-us block):** live renders phone/mail/Instagram at `h-4 w-4 text-foreground/60` inside the serif anchors; the clone had none.
- **F1i (MEDIUM-LOW — the login input icons):** live `absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500` (computed left 12px, `rgb(100, 116, 139)`); the clone `left-3.5` (14px) in `text-slate-400` — 2px off, one shade light.
- **F1j (MEDIUM — the login eye toggle):** the clone rendered a password visibility toggle the reference does not have — an undocumented **visible** divergence (the live password wrapper has no right-side element at all). Removed: parity outranks the UX nicety; the invisible additions (`autoComplete`, `aria-*`) stay per the session-8 F6 precedent.
- **F1k–F1m (class-set alignments, computed identical):** the book submit arrow (`h-4 w-4`), the header menu/X + lightbox X/chevrons + story/newsletter arrows + detail back-arrow (`h-3.5 w-3.5`/`h-4 w-4`/`h-5 w-5`), and the login GoogleIcon's missing wrapper `div.transition-transform.duration-200.-ml-4` + `xmlns`.
- **F2 (MEDIUM — the contact Hours section):** live wraps the Hours eyebrow and a **StatusPill** in `flex items-center justify-between mb-4`; the hours ul carries **no margin**. The clone rendered a bare eyebrow + `mt-3` on the ul and no pill — a 13-char innerText delta (exactly `CLOSED TODAY\n`).
- **F3 (INFO — verified holding):** the map embed (above). Also verified holding: the mobile drawer (every pinned value + the drawer X icon at 16px), the login font context + slate-900 read-back, the booking/ICS/Calendar contracts (session 8), the gallery lightbox icons + keyboard + wrap-around + filter scoping, the session-7 service-detail icons (the check/chevron class sets match exactly — the one surface this family spares, because session 7 extracted them live), the stars wrapper, the follow-along anchor classes, and every page's innerText (except the contact 13-char delta, now closed).
- **F4 (carried):** the `braces` + `deepmerge-ts` advisories stand.

## Findings and the TDD fixes

All 19 icon sites + the Hours row fixed per the plan across 12 files:

- **The icon class layer:** every session-1 icon converted from `size` props to the reference's exact class sets (see the plan's §4.1 table) — the sage stars, the hover-gated 24px gallery-preview icons, the hover-rotating service arrows (both variants), the team `group/btn` + arrow-up-right, the MapPin directions link + the icon-text space byte, the footer + Reach-us icon sets, the login `left-3 text-slate-500` icons + the eye-toggle removal + the GoogleIcon wrapper, and the class-sizing alignments (book/header/lightbox/detail/story/newsletter/carousel).
- **The contact Hours row:** restructured to the `flex items-center justify-between mb-4` row with the existing `StatusPill` client island; the ul's `mt-3` dropped (the row's `mb-4` provides the 16px gap). The contact page's innerText now measures **808/808 — exact parity**.

**RED evidence:** the new `tests/e2e/icon-parity.spec.ts` failed **8/8** against the pre-fix build, exactly as the plan predicted (every assertion group red). **GREEN:** 8/8 after the fixes. Two spec-side shapings mid-run, both documented in the spec comments: (1) the Reach-us selector needed scoping to the `gap-3` variants (the header logo is also `font-serif text-xl`); (2) the book submit arrow's computed-width assertion was replaced by the class + `width="24"`-attr read-back — the svg is a flex item inside the inline-flex button, so its **used** width shrinks with the row layout (live-measured 15.3125px at desktop width — NOT the nominal 16px; the clone computes the identical shrunk value, so only the class pin is stable across viewports — the session-8 "settle-state" lesson in a new guise: assert what the engine actually computes, not the nominal).

## Everything else shipped this session

- **Full gate green with the expanded suite:** lint ✓ · typecheck ✓ · unit **61/61** · build 27/27 pages ✓ · e2e **70/70** ✓ (**131 total**) — every pre-existing parity contract untouched; no assertion weakened.
- **Post-fix live re-verification:** the both-sides icon census re-run — **every route's icon list now fully identical** (landing 23/23, services 12/12, gallery 4/4, team 7/7, about 4/4, book 1/1, login 2/2, contact 8/8 — the last straggler, the testimonial carousel chevrons, caught by the census re-run and fixed). The contact Hours row verified in-DOM (row mb-4 16px, pill `CLOSED TODAY`, ul mt 0px); the contact innerText 808/808.
- 15 dev-server screenshots re-captured on the remediated build (canonical viewport-only style, absolute paths; the full-page 03). The mobile-menu capture is **26124B — byte-identical to every prior verified session** (the pixel-consistency signal). VLM-verified: the contact capture (Reach-us icons + MapPin confirmed; the Hours pill row confirmed in a scrolled capture), the landing footer icons + the sage stars (VLM read the 14px sage as "charcoal" — pixel-sampled the capture to confirm sage `(80, 97, 83)` and the DOM computed value is the pinned `rgb(75, 93, 79)`), and the standing mobile-menu check (cream overlay, serif links, CTA separation, close X, no glitches).
- Documentation aligned: README (badge 131, 61/70 counts, the icon-layer feature row + testing table), AGENTS.md (the icon invariant + the icon-parity contract line), CLAUDE.md (counts + the parity line), PAD (§7 inventory 61/70 + the session-9 ledger), `beauty-salon_SKILL.md` **v1.6.0** (project_state, §14 icon best-practice, Appendix B/C — the icon-layer lesson). `.env.example` re-verified truthful (unchanged — no env-relevant change this session).
- The remediation plan (`docs/remediation-plan-session-9.md`) with its findings register, plan-vs-codebase validation matrix, and executed ToDo results; this session log; the worklog record.

## The lesson (recorded in SKILL v1.6.0 + PAD)

**InnerText parity is blind to the icon layer.** Eight green sessions compared text (landing 1198/1198, legal 1822/2053/3372/1629, confirmation 525/525…) and pinned computed styles on the elements prior sessions touched — but svg class sets never appear in innerText, and lucide's `size` prop renders right-sized pixels through the wrong DOM (attribute sizing, no hover classes). The glyph choice, color token, opacity behavior, and hover animations were invisible to every instrument. The icon layer needed its own extraction pass (this session's census) and its own read-back contract (`icon-parity.spec.ts`) — extending the session-6 (pins need read-backs) and session-8 (decode the download) lessons: **every DOM layer that text comparisons flatten needs a dedicated census + spec.** Session 8's Calendar finding was a single instance of what was really a whole unmeasured layer.

## Carried / accepted (unchanged)

- `braces` and `deepmerge-ts` advisories — dev-only transitive chains, no upstream fix / not safe to force; documented in `docs/remediation-plan-session-2.md` §4.4 and re-verified in sessions 3–9.
- The clone's invisible a11y additions (`aria-hidden` on icons, `aria-label` on the stars wrapper/gallery tiles/filter pills, `autoComplete` on inputs) and the per-page `document.title` — deliberate improvements, documented divergences. The eye toggle is NOT in this family (it was visible + behavioral) — removed.
- The reference's own inconsistencies replicated faithfully: the NY-pointing map embed under the SF address, the ICS's New York LOCATION, the trailing-space class artifacts (`block `, `text-foreground/70 `), the raw-comma ICS text.
- The opacity-modifier oklab serialization (trap 7), the login shell's `<body>` overscroll difference, the in-memory rate limiter, the inert Google OAuth, notice-only Forgot-password/Sign-up, and the remaining PAD §10 deferred items — by design, mirroring the reference.
