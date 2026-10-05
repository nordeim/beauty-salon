# Remediation Plan — Session 14 (The Wire-Payload Census + The Print-Media Census)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `5914450` (session-13 deliverable `512814e` + the push-evidence follow-up `6e62509` + the owner's session-log commit `5914450` — docs only, zero code drift)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (login, the mobile drawer @390×844 standing check — the task brief's emphasis — and **the two session-13 log's suggested candidates**: the print stylesheet census and the newsletter `source: "homepage_15off"` payload registration, extended into a full **wire-payload census** of both write paths via request interception) + TDD remediation per this plan. Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-13 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 63/63 unit, 27/27 build pages, 114/114 e2e — 177 total) at the session-14 baseline: the owner's `5914450` commit added only `docs/session_14.md` (the session-13 transcript record) — zero code changes since the session-13 push.

This session executed both session-13 suggested candidates and found the **payload layer** — the JSON bodies the reference's forms actually send, never before censured (session 12 censused the controls and the states; the wire was only INFO-registered) — carrying **two real divergences**: the newsletter POST misses the live's `source: "homepage_15off"` field, and the booking POST uses a completely different field naming (`client_name`/`service_slug`/`requested_date`/`status: "pending"` — the reference's entity wire schema, snake_case with `""` for empties) than the clone's camelCase `{name, email, phone, …}` with `null`s. The **print census** found the author layer at parity (ZERO `@media print` rules on both sides) but the print *rendering* diverging by mechanism: the live's unrevealed animation content stays invisible in print (inline-style hidden states are media-query-immune), while the clone's reveals everything (its `prefers-reduced-motion` collapse — the clone's own a11y addition — fires under Chromium's forced-reduced-motion print pipeline). The mobile drawer re-verified **byte-identical** @390×844 both sides, the fire-and-forget contracts re-verified live (a route-aborted booking POST still navigated to the confirmation on the reference itself), and the reference verified un-drifted.

**Two actionable payload findings (F1, F2) + two print findings (F3 pin, F4 documented accepted divergence) + three verified-holding standing checks (F5–F7).**

## 2. Findings register (live-measured 2026-10-06, agent-browser, viewport 1280×900 unless noted; network capture via request interception)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F1 | MEDIUM — payload parity | Newsletter POST body (captured via the reference's own submission, request log) | `{"email":"…","source":"homepage_15off"}` — exactly two fields, `email` then `source`; the response echoes the stored entity (`{"email":"…","source":"homepage_15off","id":"…","created_date":"…",…}` — the reference PERSISTS the source) | `JSON.stringify({ email })` — the `source` field missing entirely (session-12's INFO registration, now actionable) |
| F2 | MEDIUM — payload parity | Booking POST body (captured via a route-aborted submission — zero writes to the reference) | `{"client_name":"Session Fourteen","client_email":"…","client_phone":"+1 555 0100","service_slug":"balayage","stylist_slug":"","requested_date":"2026-11-15","requested_time":"14:30","notes":"","status":"pending"}` — nine fields, snake_case, `""` (never null) for unset phone/stylist/notes, `status` always `"pending"` | `JSON.stringify({ name, email, phone: phone \|\| null, stylistSlug: stylist \|\| null, serviceSlug: service, date, time, notes: notes \|\| null })` — camelCase names, `null` for empties, no `status` field |
| F3 | INFO — parity verified, needs a pin | Author print rules (`@media print`) | ZERO print rules in the live's single 913-rule stylesheet | ZERO print rules in the clone's compiled CSS (204KB, 21 media queries — the hover/forced-colors/RM/breakpoint families) ✓ parity — pin it so no future change adds print rules the live doesn't have |
| F4 | INFO — documented accepted divergence | Print-media rendering (PDF captures of both landings, Chromium printToPDF) | Fresh-load print = 13 letter pages carrying ONLY the repeated fixed header + footer bits; unrevealed body content stays INVISIBLE (the animation framework hides via INLINE styles `opacity: 0; filter: blur(8px); transform: translateY(40px)` — media-query-immune; revealed elements carry `opacity: 1` inline, also media-immune) | 11 letter pages with the FULL body content visible: the clone's `.reveal-hidden` (a CLASS, same values) is collapsed by the `prefers-reduced-motion: reduce` rule, and Chromium's print pipeline forces reduced-motion → everything reveals in print. Root cause = the clone's own a11y addition (the documented invisible-additions family) acquiring a print-visible consequence. NOT replicated: matching would require either removing the RM collapse (degrading screen a11y) or adding print rules the live doesn't have (breaking F3 parity); after normal use (scroll-through) both sites print identically — the divergence exists only for never-revealed content. Document + pin the deliberate stance |
| F5 | INFO — verified holding | Fixed header in print | `position: fixed` header repeats on every printed page ("BOOK NOW" ×13 / "Maison Luminaire" ×12 across 13 pages) | same behavior ("BOOK NOW" ×11 across 11 pages) ✓ |
| F6 | INFO — verified holding | Mobile drawer @390×844 (the task brief's emphasis) | all pinned values identical: fixed z-60, cream `rgb(250,248,245)`, 390×844, flex gap 8px, padL 32px, 5 links 48px Cormorant lh 48px ls −1.2px ink, CTA mt 40px, tap-through → `/services` | **byte-identical both sides — no Tailwind v4 regression** ✓ |
| F7 | INFO — re-verified live | Fire-and-forget contracts | the route-aborted Booking POST on the reference STILL navigated to `/book/confirmation?name=…&date=…&time=…&service=balayage` (session 12's deobfuscated bundle behavior, re-measured this session); the confirmation query-string contract confirmed: `name`, `date`, `time`, `service` (slug) in that order | ✓ (pinned since session 12 by form-parity.spec.ts F5) |

## 3. Root cause

The session-12 lesson gains its own layer: **wire-payload parity is invisible to every census that reads the DOM** — the form-control census read attributes/placeholders/classes, the state census read rendered text after interaction, but the JSON body a form POSTs is only observable on the network (devtools/request interception), and no prior instrument captured it. F1/F2 are exactly that layer, and F2 shows the reference's wire schema is its own naming convention (`client_name`, `requested_date` — the base44 entity field names flowing through to the browser's fetch call), not the clone's idiomatic camelCase. The print findings split the same way: the author layer (F3) is at parity because neither engine emits print rules unprompted, but the live's animation framework writes INLINE styles (both hidden and revealed states — `opacity: 0` → `opacity: 1`, never removed) while the clone's Reveal uses CLASSES; inline styles are immune to media queries, classes are not — and the clone's own `prefers-reduced-motion` collapse (an a11y addition the reference lacks) responds to Chromium's forced-RM print pipeline. The divergence is therefore *state-dependent* (fresh-load print differs; post-scroll print matches) and *mechanism-caused* (inline vs class), not a styling error.

## 4. Design (the fixes)

### 4.1 F1 — the newsletter wire payload (`src/components/NewsletterForm.tsx`, `prisma/schema.prisma`, `src/app/api/newsletter/route.ts`)

- The form's fetch body becomes `JSON.stringify({ email, source: "homepage_15off" })` — the live's exact two fields, `email` first (`JSON.stringify` preserves insertion order — the devtools-visible key order matches).
- `NewsletterSubscriber` gains `source String?` (nullable — direct API callers without a source stay legal; the reference persists the field, so the clone stores it too).
- The API route narrows the new field — `typeof body.source === "string" ? body.source.trim().slice(0, 100) : null` — and persists it on create (`create: { email, source }`); the upsert's `update: {}` idempotent no-op stays (the reference's duplicate-subscribe semantics are unmeasured; the clone's documented "Idempotent subscribe" contract holds). Response shape unchanged (`{ ok: true }` 201 — the UI is fire-and-forget and never reads it; the documented divergence family).

### 4.2 F2 — the booking wire payload (`src/components/BookingForm.tsx`, `src/app/api/appointments/route.ts`, `prisma/schema.prisma`)

- The form's fetch body becomes the live's exact nine-field schema, in the live's exact order:

```ts
body: JSON.stringify({
  client_name: name,
  client_email: email,
  client_phone: phone,
  service_slug: service,
  stylist_slug: stylist,
  requested_date: date,
  requested_time: time,
  notes,
  status: "pending",
}),
```

  — `""` (never null) for unset phone/stylist/notes (the form's state is already `""`-initialized, so the `|| null` coercions simply drop).
- The API route reads the wire names (`body.client_name` … `body.status`), keeps every existing validation semantic (required name/email/service/date/time; slug existence checks; notes ≤ 2000), maps wire → DB columns at the create boundary (`name: client_name`, `phone: client_phone || null`, …), and accepts `status` — `typeof body.status === "string" ? body.status.trim().slice(0, 30) : ""`, persisted as `status: status || "pending"` (the route-idiom narrowing, lenient like every other optional field).
- `Appointment` gains `status String @default("pending")` (the reference's Booking entity carries the workflow field; the wire value persists instead of being silently dropped).
- The DB schema (column names `name`/`email`/…) is DELIBERATELY unchanged — parity at the observable wire boundary, substrate freedom behind it (the same split as the fonts: `font-shell` at the boundary, next/font behind it). The confirmation navigation contract (`?name=&date=&time=&service=` — verified live this session) is untouched.

### 4.3 F3 + F4 — the print-media pins (`tests/e2e/print-parity.spec.ts`, new)

- **P1 (the parity pin):** the served stylesheet contains no `@media print` — fetch the page's `<link rel=stylesheet>` CSS text and assert `/@media\s+print/` never matches. The census fact: the live's 913-rule sheet has zero print rules; the clone's 204KB compiled CSS has zero. If anyone later adds print styles, this goes red and forces the parity conversation.
- **P2 (the deliberate-stance pin):** under `page.emulateMedia({ media: "print", reducedMotion: "reduce" })` — approximating Chromium's print pipeline, which forces reduced-motion when printing — a below-fold `.reveal-hidden` element computes `opacity: 1` (the RM collapse = the clone's a11y addition; its print consequence is now a pinned, deliberate contract).
- **P3 (the mechanism guard):** under `page.emulateMedia({ media: "print" })` alone (no RM) a below-fold `.reveal-hidden` computes `opacity: 0` — proving the print visibility flows through the RM collapse, not through any print rule (which would break P1). The mechanism pin, honestly split.
- Both P2/P3 pick below-fold elements without scrolling (scrolling would reveal them): query `.reveal-hidden` elements whose `getBoundingClientRect().top` exceeds the viewport height.

### 4.4 The e2e payload contracts (`tests/e2e/form-parity.spec.ts`, extended)

Two new tests in the form-parity suite (the state-layer suite — the payload layer is its missing half):

- **The newsletter payload (F1):** subscribe via the real UI with `page.waitForResponse("**/api/newsletter")`; assert `postData` byte-equals `JSON.stringify({ email: "<filled>", source: "homepage_15off" })` (raw string compare — key order pinned, the class-string-census precedent) and the response status is 201 (the API accepts the new shape — the fire-and-forget UI would mask a 400, so the acceptance needs its own assertion).
- **The booking payload (F2):** submit a booking via the real UI with `page.waitForResponse("**/api/appointments")`; assert `postData` byte-equals the nine-field JSON with the live's exact key order, `""` for the unset phone/stylist/notes, and `"status": "pending"`; response 201.

### 4.5 Documentation alignment (README, AGENTS.md, CLAUDE.md, PAD, SKILL v1.11.0, session_14.md, worklog)

README (the payload-layer feature row + the print-census note + counts), AGENTS.md (the booking-contract invariant gains the wire schema; the print-census facts + the RM/print stance; the payload-parity contract lines), CLAUDE.md (counts + parity list), PAD (§4 the two new columns + the wire-schema note at §3.4's route pattern, §5.5 the print findings, §7 inventory + the session-14 ledger), `beauty-salon_SKILL.md` **v1.11.0** (project_state, Appendix B counts, Appendix C session-14 row), the proper `docs/session_14.md` record (replacing the transcript the owner committed there — the sessions 4–13 convention), the worklog entry, this plan's executed results. `.env.example` re-verified (the fixes read no env).

## 5. TDD plan

**T1 (RED):** write the two form-parity payload tests + the three print-parity specs; run against the current build. Expected: the two payload tests RED exactly as the register predicts (the newsletter body lacks `source`; the booking body is camelCase/null/no-status); the three print specs GREEN immediately (pins, not fixes — the session-13 ICS-pin precedent).

**T2 (GREEN):** apply §4.1 + §4.2 (three source files + the schema), `bun run db:push` (the dev DB gains the two columns; the e2e DB re-pushes via its global-setup on every run).

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — every pre-existing spec green (conflict check: no existing spec reads POST bodies — verified by grep `postData|waitForResponse` over `tests/` → zero hits; the form-parity F3/F5/F8/F9 tests intercept or await URL changes only; the booking-parity spec posts via the form → flows through the renamed wire automatically; no test posts directly to either API with old field names — verified).

**T4:** live re-verification (agent-browser): the clone-side submissions re-captured (both payloads now byte-match the live's measured bodies); the drawer standing check; the 15 canonical screenshots re-captured on the remediated build.

**T5:** documentation alignment (§4.5).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook's Appendix A at `/home/z/my-project/bin/shim/`, outside the repo) → verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The newsletter form POSTs `{ email }` only | `NewsletterForm.tsx:23` — `body: JSON.stringify({ email })` | ✓ gap confirmed |
| The booking form POSTs camelCase + nulls, no status | `BookingForm.tsx:59-68` — `{ name, email, phone: phone \|\| null, stylistSlug: stylist \|\| null, serviceSlug: service, date, time, notes: notes \|\| null }` | ✓ gap confirmed |
| The appointments route validates the camelCase names | `route.ts:14-21` reads `body.name`…`body.notes`; creates `{ name, email, phone: phone \|\| null, … }` | ✓ rename scope confirmed |
| The Appointment model lacks `status` | `prisma/schema.prisma:67-80` — id/name/email/phone?/stylistSlug?/serviceSlug/date/time/notes?/createdAt | ✓ column addition confirmed |
| The NewsletterSubscriber model lacks `source` | `prisma/schema.prisma:82-86` — id/email/createdAt | ✓ column addition confirmed |
| The seed creates no appointments/subscribers | `prisma/seed.ts` — no `appointment`/`newsletterSubscriber` writes (prose mentions only); dev DB counts 0/0 | ✓ no seed changes |
| The e2e global-setup re-pushes the schema | `tests/e2e/global-setup.ts` runs `prisma db push --skip-generate` + the seed on every run against `db/e2e.db` | ✓ schema flows automatically |
| No existing spec pins POST bodies | grep `postData\|waitForResponse\|body\.json` over `tests/` → zero hits | ✓ no conflicts |
| The form-parity interception patterns exist to extend | F4/F8/F5/F9 use `page.route` abort/fulfill; the new tests use `waitForResponse` (no interception — real API flow) | ✓ consistent extension |
| The compiled CSS carries no print rules | the dev-server stylesheet (204841 bytes) — 21 media queries, zero `@media print` | ✓ pin is green-able |
| The RM collapse exists and is the only print-relevant reveal rule | `globals.css:267-275` — `@media (prefers-reduced-motion: reduce)` collapses `.reveal-hidden` to visible | ✓ mechanism confirmed |
| The reveal-hidden elements sit below the fold un-revealed on load | `Reveal.tsx` — initial `visible=false`, IO flips on intersect; below-fold elements keep `.reveal-hidden` | ✓ measurable without scrolling |
| The live's payloads were captured this session | the request log: newsletter postData `{email, source:"homepage_15off"}` + response echo; booking postData (9 snake_case fields, `""` empties, `status:"pending"`) via route-abort (no writes) | ✓ measured |
| The full gate is green at the baseline | this session's Phase 4: lint ✓ · tsc ✓ · unit 63/63 · build 27/27 · e2e 114/114 (177 total) | ✓ baseline green |

## 7. Risks

- **The API wire rename (F2)** changes the clone's own API contract — mitigated by the single-caller reality (the form is the only client; no other tests or code POST to `/api/appointments` with old names — verified by grep), and by the response shape staying `{ ok: true }`. Old camelCase callers would now 400 with the field-specific messages — acceptable for a demo-scale app whose only documented caller ships in the same commit.
- **The `status` column addition** requires a `db:push` — additive (a new nullable-less column with a default); SQLite handles it without data migration; the dev/e2e DBs carry zero appointments at rest.
- **The print-stance pin (P2)** asserts a *deliberate divergence* from the reference's blank print — if a future maintainer disagrees, the spec failing forces the conscious decision (and the F3 pin guards the no-print-rules invariant either way). The PDF artifacts backing the census live outside the repo (`/home/z/my-project/scripts/s14/`); the findings are documented in this plan + the session log.
- **The below-fold `.reveal-hidden` selection in P2/P3** could flake if the viewport reveals everything — mitigated by selecting elements by `getBoundingClientRect().top > innerHeight` (the landing is ~6900px tall; dozens of below-fold reveals exist at 1280×720).
- **Screenshots after the payload changes** — the visible UI is untouched (payloads + schema only), so the captures should be byte-stable; re-captured fresh and verified as usual regardless.

---

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** RED — write the two payload contracts in `tests/e2e/form-parity.spec.ts` + the three specs in `tests/e2e/print-parity.spec.ts`; run against the current build; expect the two payload tests red exactly as the register predicts, the three print pins green immediately. *(Executed: P1/P2 failed exactly as predicted [the newsletter body lacked `source`; the booking body was camelCase/null/no-status]; the three print pins green immediately — the session-13 ICS-pin precedent.)*
- [x] **T2.** GREEN — apply §4.1 (NewsletterForm + newsletter route + the source column) + §4.2 (BookingForm + appointments route + the status column); `bun run db:push`. *(Executed: all five files changed; `db:push` clean — `Appointment.status` + `NewsletterSubscriber.source` verified present in `db/custom.db`; the e2e DB re-pushed by its global-setup.)*
- [x] **T3.** Full gate: `lint → typecheck → unit → build → test:e2e` — every pre-existing spec green. *(Executed: lint ✓ · tsc ✓ · unit 63/63 ✓ · build 27/27 ✓ · e2e **119/119** ✓ — **182 total**; every pre-existing contract untouched.)*
- [x] **T4.** Live re-verification of both payloads (clone-side capture) + the drawer standing check + the 15 screenshots re-captured. *(Executed: the clone's newsletter POST body `{"email":"s14-clone-clean@…","source":"homepage_15off"}` → 201 → persisted; the clone's booking POST body byte-identical to the live's measured schema [only the probe values differ] → 201 → persisted with `status: 'pending'`; the confirmation URL identical to the live's contract; the drawer standing check all pinned values identical both sides @390×844; 15 captures re-taken — the mobile-menu capture 26124B byte-identical [md5-confirmed], 08/09/10/12 also byte-identical [08+09 = the two form surfaces the fixes touched, proving the changes are invisible to the settled DOM]; 02 + 14 VLM-verified; 13's lightbox DOM-verified open.)*
- [x] **T5.** Documentation aligned (README, AGENTS.md, CLAUDE.md, PAD, SKILL v1.11.0, `.env.example` re-verified, the proper `docs/session_14.md`, the worklog entry, this plan's executed results). *(All applied; `.env.example` unchanged — the fixes read no env.)*
- [x] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed — see the push evidence in §9.)*

## 9. Push evidence (session 14)

- Committed as one atomic commit **`3a2894e`** to `main` (25 files changed: 4 code + the schema + 1 new spec + 1 extended spec + 6 docs + the new plan + worklog + 10 re-captured screenshots [08/09/10/11/12 byte-identical — skipped by git]); pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the paramiko ssh shim from the runbook's Appendix A placed on PATH at `/home/z/my-project/bin/shim/`, outside the repo).
- Key fingerprint verified before the push: **`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`** (the runbook's paramiko method — matches the sessions 1–13 record; the same operator key).
- Dry-run clean (`5914450..3a2894e` fast-forward); real push exit 0 with the wrapper's own remote verification **`refs/heads/main @ 3a2894e == local HEAD`** + the tracking-ref sync.
- Independent re-confirmation via `git ls-remote` (shim + key): `3a2894e65326392745185d3c303d1dedcd8c1f6c refs/heads/main` — byte-exact == local HEAD.
- Change-set secret scan clean pre-commit: no `AUTH_SECRET="<hex32+>"` material in the staged diff or any tracked file; no tracked env/db/key files beyond `.env.example`; the operator key shredded + removed post-push (the wrapper's temp copy shreds itself on every run).

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The newsletter wire payload (`source: "homepage_15off"`) + persistence | `src/components/NewsletterForm.tsx`, `src/app/api/newsletter/route.ts`, `prisma/schema.prisma` |
| The booking wire payload (the live's nine-field snake_case schema + `status: "pending"`) + persistence | `src/components/BookingForm.tsx`, `src/app/api/appointments/route.ts`, `prisma/schema.prisma` |
| The print-media pins (zero print rules + the RM-print stance + the mechanism guard) | `tests/e2e/print-parity.spec.ts` (new) |
| The wire-payload contracts | `tests/e2e/form-parity.spec.ts` (extended) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.11.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-14.md`, `docs/session_14.md`, `worklog.md` |
