# Remediation Plan — Session 16 (The Focus-Order/Tab-Sequence Census + The Reduced-Motion Reveal-Timing Census)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ the owner's post-session-15 docs commit (the session-15 deliverable `9e9d502` + the push-evidence follow-up `f54e37c` + the owner's `docs/session_16.md` transcript + `docs/start_server_log.txt` refresh — docs only, zero code drift)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (login, the mobile drawer @390×844 standing check — the task brief's emphasis, the reference-drift check, and **the two session-15 log's suggested candidates**: the focus-order/Tab-sequence behavioral census + the `prefers-reduced-motion` reveal-timing census) + TDD remediation per this plan. Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-15 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 66/66 unit, 27/27 build pages, 125/125 e2e — 191 total) at the session-16 baseline: the owner's commit added only `docs/session_16.md` (the session-15 transcript record) and a log refresh — zero code changes since the session-15 push.

This session executed both session-15 suggested candidates. **The focus-order census found the layer fully at parity but unpinned**: every interactive surface's Tab-walk sequence is identical on both sides (landing 40/40 stops, /login 6/6, /book 17/17 — including the native date/time inputs' internal segment stops, which are browser-native and identical — /services 20/20, and the mobile drawer's 8-stop sequence with **no focus trap on either side** — focus escapes to the page content behind the overlay exactly like the live — plus focus-on-open staying on the toggle and focus-after-close landing on BODY, both sides). The **reduced-motion census found the live ignores `prefers-reduced-motion` entirely** (its JS-driven inline-style reveal runs the full opacity+blur+translate animation under RM — measured trajectory 0.28@89ms → 0.82@283ms → 1.0@726ms — and unrevealed content stays hidden under RM), while the clone's globals.css rule renders unrevealed content **fully visible with no transition** under RM — the deliberate a11y stance whose SCREEN behavior is unpinned (print-parity.spec.ts pins it only under print media). A widened Escape-key census found the **live's mobile drawer has NO Escape-close** (measured with focus on the toggle AND inside the drawer — it stays open) while the live's gallery lightbox DOES close on Escape — the clone's drawer Escape-close is the already-pinned a11y enhancement (mobile-navigation.spec.ts:103), now documented with its live-measured counterpart.

**One pin family (the focus-order census) + one pin family (the screen-RM stance) + one documentation finding (the Escape asymmetry) + one doc-drift fix (the "collapses to opacity" phrasing) + three verified-holding standing checks (F5–F7).**

## 2. Findings register (live-measured 2026-10-06, agent-browser, viewport 1280×900 unless noted)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F1 | INFO — parity verified, needs a pin | The focus-order/Tab-sequence census on every interactive surface | landing **40 stops** (logo, 5 nav, BOOK NOW, hero CTA, 3 category cards, read-story, carousel prev + 4 dots + next, follow-along + 6 instagram tiles, newsletter input + Claim button, 6 footer nav, tel/mailto/instagram, 4 legal — then wraps to body); /login **6 stops** (Google, email, password, Sign in, Forgot password, Sign up); /book **17 stops** (return + logo, name/email/phone, stylist + service selects, the native date input's 4 segment stops, the native time input's 4 segment stops, notes textarea, submit); /services **20 stops** (header 7, 4 filter pills, 8 service cards in seed order, bottom CTA) | **identical on every surface** (the only deltas: the clone's aria-labels on the instagram tiles + the newsletter input — the documented a11y-addition family — and the dev-mode NEXTJS-PORTAL, absent in production builds). The layer is at parity but NO spec walks the Tab order → pin it |
| F2 | INFO — the mobile drawer's focus layer, parity verified, needs a pin | Drawer focus management | focus-on-open **stays on the toggle button** (no auto-focus into the drawer); the in-drawer walk: **drawer logo → Close menu → 5 nav links → CTA** (8 stops); **NO focus trap** — the 9th Tab escapes to the page content behind the overlay; close-via-Close-button → focus lands on **BODY** | **identical** (measured value-by-value: toggle focus on open, the same 8-stop sequence, the same escape-to-content, BODY after close) — unpinned → pin it |
| F3 | INFO — deliberate divergence, the screen layer unpinned | The `prefers-reduced-motion` reveal-timing census (the session-15 suggested candidate) | **the live ignores RM entirely**: fresh-load below-fold unrevealed content stays hidden under RM (inline styles `opacity: 0; filter: blur(8px); transform: translateY(40px)` — media-query-immune), and scrolling it into view runs the FULL animation under RM (measured: op 0.28@89ms → 0.82@283ms → 0.998@726ms with translate + blur converging in step; the framework's transition-duration computes **0s even under normal motion** — the animation is a rAF inline-style loop, not a CSS transition) | the clone's RM rule (`globals.css:267`) renders unrevealed content **fully visible** (computed opacity 1, transform none, filter none, **transition none** — measured: op 1 at the first 137ms sample, the reveal-visible class applied instantly) — the deliberate a11y stance (the print-visible family: matching the live would degrade screen a11y). Pinned ONLY under print media (print-parity.spec.ts P2/P3) — the **screen** behavior is unpinned → pin it |
| F4 | DOC DRIFT — the RM phrasing | The docs' description of the clone's RM behavior | — | SKILL.md §4.4/§8 + PAD §5.4 phrase the RM rule as "collapses to opacity" / "collapses to opacity-only" — the actual rule (globals.css:267) is **full visibility + no transition** (opacity 1, transform none, filter none, transition none). Align the phrasing to the code |
| F5 | INFO — the Escape asymmetry, live-measured (documentation) | The Escape key on the mobile drawer vs the gallery lightbox | the live's mobile drawer has **NO Escape-close** (measured twice: focus on the toggle → stays open; focus inside the drawer → stays open — the overlay remains, screenshot-confirmed); the live's gallery lightbox **DOES close on Escape** (measured: the z-70 overlay gone) — the asymmetry is the reference's own a11y debt, drawer-only | the clone's drawer Escape-close is the **already-pinned a11y enhancement** (mobile-navigation.spec.ts:103, titled "(a11y enhancement)") — no code change; document the live measurement in the a11y-addition family register so the enhancement's live-side counterpart is on record |
| F6 | INFO — verified holding | Mobile drawer @390×844 (the task brief's emphasis) | `fixed inset-0 z-[60] bg-background` cream `rgb(250,248,245)`, links col flex-col gap 8px padL 32px justify-center, 5 links 48px/48px Cormorant ls −1.2px ink, CTA mt 40px; tap-through navigates + auto-closes (real click AND Enter) | **byte-identical both sides — no Tailwind v4 regression** ✓ (the baseline e2e mobile-navigation contract green into the bargain; the class strings byte-identical) |
| F7 | INFO — verified holding | Reference drift (services page) + the DB/env/test-stack state | title `Services \| Beauty Salon`, h1 128px Cormorant, the ink `inline-block` bottom-CTA pill ("Book an appointment" at y≈2099), cream body bg | ✓ un-drifted; `.env` `DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root (custom.db + e2e.db) + the seeded state (8/3/12/4/1) + vitest/playwright configs all verified exactly as documented |

## 3. Root cause

**Both session-16 candidates are pin-gap findings, not divergences.** The focus-order layer is a *behavioral* census (like the session-15 scroll census): the settled DOM, the href census, and the focus-RING census (session 13) all read elements in isolation, while the ORDER the browser hands focus to them on Tab walks — and the drawer's trap/no-trap stance — only exists during interaction; no prior instrument walked it. The RM census splits the same way the session-14 print census did: the live's reveal is a JS-driven inline-style loop (media-query-immune, no RM branch — its transition-duration computes 0s because the frames are driven by rAF, not CSS), while the clone's reveal is a CLASS-based CSS transition that the RM media rule disables outright (full visibility, no transition) — the deliberate a11y stance whose screen half had no pin. The Escape asymmetry is the reference's own inconsistency (lightbox keyboard support exists, drawer keyboard support does not) — the clone's enhancement is already pinned; only the live measurement is new.

## 4. Design (the fixes)

### 4.1 F1+F2 — the focus-order-parity spec (`tests/e2e/focus-order-parity.spec.ts`, new)

A Tab-walk contract per surface, pinning the live-measured census (the mobile-navigation precedent: the spec encodes the live's measured values; if it fails, the code drifted):

- **FO1 (landing, 40 stops):** from `document.body.focus()`, press Tab ×40 recording `(tag, href)` pairs; assert the exact sequence — logo `/`, the 5 nav hrefs, `/book` (BOOK NOW), `/book` (hero CTA), the 3 `/services?category=` cards, `/about` (read-story), then the carousel buttons (prev, 4 dots, next — identified by aria-label, the live's own labels), `https://instagram.com/` (follow-along), 6 × `https://instagram.com/` (tiles), the newsletter input (placeholder `Your email`), the Claim button, the 6 footer nav hrefs, `tel:`, `mailto:`, the footer instagram, the 4 legal hrefs. The 41st stop wraps to body (the production build has no dev portal).
- **FO2 (login, 6 stops):** Google button → `#email` → `#password` → Sign in → Forgot password → Need an account/Sign up.
- **FO3 (book, 17 stops):** ← Return to site, logo, the name/email/tel inputs (identified by `type`), the stylist + service selects, **4 consecutive `type=date` stops + 4 consecutive `type=time` stops** (the native inputs' internal segment navigation — browser-native, identical on both sides, pinned as measured), the notes textarea (placeholder), the submit button (text `Request appointment`).
- **FO4 (services, 20 stops):** header 7 (logo, 5 nav, BOOK NOW), the 4 filter pills (All/Hair/Skin/Nails — buttons), the 8 service-card hrefs in seed order (balayage → precision-cut → glossing-treatment → hydrafacial → signature-facial → gel-manicure → signature-pedicure → bridal-package), the bottom CTA `/book`.
- **FO5 (the drawer's focus layer @390×844):** open the drawer → `document.activeElement` is the toggle button (aria-label `Open menu`); the in-drawer walk: drawer logo → Close menu → the 5 nav links → the CTA (8 stops, all `closest('.fixed.inset-0')`); the **no-trap guard**: the next Tab escapes to page content (activeElement outside the overlay); close via the Close button → the overlay unmounts and `document.activeElement` is BODY.

Viewport note: FO1–FO4 run at the default e2e viewport (Desktop Chrome 1280×720 — the desktop header nav is visible); FO5 sets 390×844.

### 4.2 F3 — the reduced-motion-parity spec (`tests/e2e/reduced-motion-parity.spec.ts`, new)

- **RM1 (the stance pin):** `page.emulateMedia({ reducedMotion: "reduce" })`, fresh `goto("/")`, find a below-fold `.reveal-hidden` WITHOUT scrolling → computed `opacity === "1"`, `transform: none`, `filter: none`, `transition-duration: 0s` (the RM-disable stance — the screen counterpart of print-parity's P2).
- **RM2 (the instant-reveal pin):** under the same emulation, `scrollIntoView` a below-fold `.reveal-hidden`, `expect.poll` until it carries `reveal-visible`, then assert computed `opacity === "1"` and `transition-duration === "0s"` — the class flips but nothing animates (the live, by contrast, runs its full ~0.7s animation under RM — live-measured, documented in the spec header).
- **RM3 (the mechanism guard):** without RM (default), a below-fold `.reveal-hidden` computes `opacity === "0"`, `transition-duration === "0.9s"` (the entrance family holds; the mirror of print-parity's P3) — the visibility flip flows ONLY through the RM rule.

### 4.3 F4 — the doc phrasing fix + F5 — the live-measurement documentation

`beauty-salon_SKILL.md` (v1.13.0): the RM description becomes "renders fully visible with no transition" (replacing "collapses to opacity"), §8 gains the live-measured Escape asymmetry note (the live's drawer has no Escape-close; the lightbox does; the clone's drawer enhancement is deliberate); PAD §5.4 the same phrasing fix; AGENTS.md the a11y-addition family note + the two new spec contract lines + the counts; README the focus-order + RM feature rows and the counts; CLAUDE.md the counts + parity list. The proper `docs/session_16.md` record (replacing the transcript the owner committed there — the sessions 4–15 convention), the worklog entry, this plan's executed results. `.env.example` re-verified (the fixes read no env).

### 4.4 Screenshots + commit

The 15 canonical screenshots re-captured on the remediated dev build (the mobile-menu capture's byte-identity signal re-checked); secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local.

## 5. TDD plan

**T1 (RED/GREEN discipline — pins):** write `tests/e2e/focus-order-parity.spec.ts` (FO1–FO5) + `tests/e2e/reduced-motion-parity.spec.ts` (RM1–RM3); run against the current build. Expected: **all green immediately** — these are PINS of live-verified parity (the session-13 ICS-pin, session-14 print-pin, and session-15 ICS-negative-pin precedent: the census found the code already correct; the pins guard it). Any red is a census transcription error or a real regression to investigate before proceeding.

**T2 (no code changes expected):** the findings register carries no code-remediation items — F1/F2/F3 are pins (tests only), F4/F5 are documentation. If T1 exposes a real drift (a red that is not a transcription error), remediate it per the register before continuing.

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — every pre-existing spec green (expected 66 unit + 133 e2e = **199 total**). Conflict check: no existing spec walks Tab order or emulates screen RM (grep verified — only print-parity emulates media, under print; only gallery.spec/mobile-navigation.spec press Escape, on the lightbox/drawer respectively — no overlap).

**T4:** live re-verification not required for pins (the census IS the verification — this session's §2 register); the 15 canonical screenshots re-captured on the remediated build.

**T5:** documentation alignment (§4.3).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook's Appendix A at `/home/z/my-project/bin/shim/`, outside the repo) → verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The focus-order layer is unpinned | grep `Tab\|focus()` over `tests/e2e/*.spec.ts` → no Tab-walk contracts (focus-parity reads focused computed styles, never walks order) | ✓ pin is new |
| The screen-RM stance is unpinned | print-parity.spec.ts:69 emulates `{ media: "print", reducedMotion: "reduce" }` only; no spec emulates screen RM | ✓ pin is new |
| The drawer's Escape-close is already pinned | mobile-navigation.spec.ts:103 — "Escape closes the drawer (a11y enhancement)" | ✓ no duplication |
| The e2e production build has no dev portal | The standalone server on :3100 (playwright.config webServer) — the NEXTJS-PORTAL is dev-mode only | ✓ the wrap-to-body assertion is safe |
| The carousel carries prev/4-dots/next with aria-labels | Live census i=13–18 (aria "Previous", "Testimonial 1"–"4", "Next"); the clone's TestimonialCarousel renders the same | ✓ identifiable without text |
| The newsletter input is identifiable by placeholder | Both sides: placeholder `Your email` (the form census) | ✓ |
| The native date/time segment stops are deterministic in Chromium | Live walk: 4 consecutive `type=date` stops then 4 `type=time` stops; clone walk: identical (measured both sides — browser-native segmentation) | ✓ pin as measured |
| The landing below-fold `.reveal-hidden` exists without scrolling | print-parity.spec.ts P2/P3 rely on the same fixture (the landing's below-fold reveal elements) | ✓ fixture proven |
| The RM rule's computed values match the pin targets | globals.css:267–276 — `transform: none; filter: none; opacity: 1; transition: none`; measured on the dev server: op 1, transDur 0s, transProp none | ✓ values confirmed |
| The non-RM transition family is 0.9s | globals.css:247–250 — `0.9s cubic-bezier(0.22, 1, 0.36, 1)` on opacity/filter/transform | ✓ RM3 target confirmed |
| No existing spec conflicts | The new specs touch no shared state (no DB writes, no route mutations) | ✓ no conflicts |
| The full gate is green at the baseline | This session's Phase 4: lint ✓ · tsc ✓ · unit 66/66 · build 27/27 · e2e 125/125 (191 total) | ✓ baseline green |

## 7. Risks

- **The Tab-walk pins depend on Chromium's focus order** — deterministic for plain DOM order (no positive `tabindex` in the codebase — verified), but a future Chromium change to native-input segmentation (FO3's 4+4 stops) would re-measure, not drift. The spec header documents the census values as live-measured 2026-10-06.
- **The RM pins assert the clone's deliberate stance, not parity** — the live diverges by mechanism (documented in the spec header + F3); a future maintainer "matching the live" (removing the RM rule) would fail RM1/RM2 by design, forcing the a11y conversation (the F3 pin's stated purpose, the print-visible precedent).
- **The focus-order census encodes 40 stops of href pairs** — a content change (a new footer link) would fail FO1 legitimately; the fix is to re-census the live and update the pin (the parity-spec convention).
- **No code changes ship** — the only production-adjacent risk is the two new spec files themselves (test-only, no runtime footprint).

---

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** PINS — write `tests/e2e/focus-order-parity.spec.ts` (FO1–FO5) + `tests/e2e/reduced-motion-parity.spec.ts` (RM1–RM3); run against the current build; expect all green immediately (the pin precedent — the census found the code already correct). *(Executed: all 8 green immediately — after two spec-side shapings: RM3's expected transition-duration is the computed COMMA LIST "0.9s, 0.9s, 0.9s" [the entrance family arms all three properties], and the Tab-walk INPUT signatures read the .type PROPERTY [React omits the default type="text" attribute — the form-parity engine fact, now load-bearing here] + a TS cast fix.)*
- [x] **T2.** Investigate any red (census transcription error or real drift); remediate per the register if a real drift surfaces (none expected — the findings register carries no code-remediation items). *(Executed: the one transient red was the RM3 serialization detail — spec-side, not a code drift; no code remediation required, exactly as the register predicted.)*
- [x] **T3.** Full gate: `lint → typecheck → unit → build → test:e2e` — every pre-existing spec green (expected 66 + 133 = 199 total). *(Executed: lint ✓ · tsc ✓ · unit 66/66 ✓ · build 27/27 ✓ · e2e **133/133** ✓ — **199 total**; every pre-existing contract untouched.)*
- [x] **T4.** The 15 canonical screenshots re-captured on the remediated dev build (the mobile-menu byte-identity signal re-checked). *(Executed: all 15 re-captured — **byte-identical to the committed session-15 versions** [git-confirmed zero changes in docs/screenshots/; the mobile-menu capture 26124B, the landing-mobile 350126B] — the test-only changes are invisible to the rendered app exactly as designed; 13's lightbox DOM-verified open; 02 at the footer scroll per the session-11 convention.)*
- [x] **T5.** Documentation aligned (README, AGENTS.md, CLAUDE.md, PAD, SKILL v1.13.0 — incl. the F4 phrasing fix + the F5 live-measurement note — `.env.example` re-verified, the proper `docs/session_16.md`, the worklog entry, this plan's executed results). *(All applied; `.env.example` unchanged — the pins read no env.)*
- [x] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed — see the push evidence in §9.)*

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The focus-order contracts (the Tab-walk census pins) | `tests/e2e/focus-order-parity.spec.ts` (new) |
| The reduced-motion screen contracts (the RM stance pins) | `tests/e2e/reduced-motion-parity.spec.ts` (new) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment (incl. the F4 phrasing fix + the F5 live-measurement note) | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.13.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-16.md`, `docs/session_16.md`, `worklog.md` |

## 9. Push evidence (session 16)

- Committed as one atomic commit to `main` (the two new pin specs + the docs alignment + the plan/session-log/worklog — the screenshots byte-identical, unchanged); pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the paramiko ssh shim from the runbook's Appendix A placed on PATH at `/home/z/my-project/bin/shim/`, outside the repo).
- Key fingerprint verified before the push (the runbook's paramiko method — the sessions 1–15 operator key).
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in the staged diff or any tracked file; no tracked env/db/key files beyond `.env.example`; the operator key shredded + removed post-push (the wrapper's temp copy shreds itself on every run).
