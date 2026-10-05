# Remediation Plan — Session 12 (The Form-Control Census + the POST-Failure States)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `da96302` (session-11 deliverable `b463d93` + `7900130` + the session-log commit)
**Date:** 2026-10-05
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded) + live parity verification with `skills/agent-browser` (login, the mobile drawer @390×844, and **the first-ever both-sides form-control census** — every input/select/textarea/label on every form-bearing route, plus their option sets, computed metrics, loading states, and **the POST-failure behavior of all three forms** — the two session-11 suggested candidates). Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-11 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 61/61 unit, 27/27 build pages, 92/92 e2e — 153 total) and the noise register is unchanged (the same two dev-only advisories; the secret-scan matches are the documented placeholder + prose; tracked env/db/key = only `.env.example`).

This session's sweep followed the session-11 log's suggested candidates: **(a) a form-control/placeholder census** — the first instrument to enumerate every form control on every route on both sides, and **(b) the newsletter/POST surface behavior under error paths** — widened to the booking and login forms' error paths too. The static census found the controls nearly identical (classes, placeholders, ids, options, labels, computed styles — the documented trap-7/fallback-string families aside), but the **state layer** — what each form renders while submitting, on success, and on failure — had never been measured on the live reference, and it diverges materially: the reference's forms are **fire-and-forget** (POST failures are swallowed and treated as success), its success/loading texts differ, its login error renders as a red shadcn Alert card, and its date/time inputs sit 2px taller via a UA-intrinsic mechanism absent from the clone.

**Nine actionable findings** (three content/behavior divergences of substance, six smaller deltas) + three INFO registrations + a verified-holding census (F13).

## 2. Findings register (live-measured 2026-10-05, agent-browser, viewport 1280×900 unless noted)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F1 | LOW-MEDIUM — visible control affordance | `/book` Notes textarea | class string ends `…transition resize-none`; computed `resize: none` (no resize handle) | no `resize-none`; computed `resize: vertical` (handle visible at 670px width) |
| F2 | LOW-MEDIUM — subtle height delta | `/book` date + time inputs | **48px / 48px** offsetHeight (content box = line-height + 2px; text siblings 46px). Mechanism unattributable: no author CSS in the single enumerable same-origin stylesheet (913 rules, zero date/picker/datetime selectors — verified by recursive walk + raw-file grep), no adoptedStyleSheets, no shadow DOM, no font dependency (Arial/Georgia/font-size overrides leave it), no transform/zoom/DPR delta, no `!important`, and a fresh `all:initial` date input appended to the live body reproduces it while the same input on the clone's page (in the same browser session) does not. Replicable exactly via `::-webkit-datetime-edit { padding: 1px 0 }` (verified: 48/48, min-height stays 0px, intrinsic behavior preserved) | 46px / 46.7px (fractional on time) — content = line-height exactly |
| F3 | HIGH — visible content divergence | newsletter success state (after a real subscribe) | `<div class="mt-12">` → `<div class="inline-flex items-center gap-3 text-[11px] uppercase tracking-editorial text-secondary">` → lucide **Check** `h-4 w-4` + text node `" You're in. Check your inbox for your 15% code."` (leading space; sage color) | `<div class="mt-12">` → `<p class="text-[11px] uppercase tracking-editorial text-foreground/70">Welcome to the atelier — your 15% code is on its way.</p>` — wrong text, wrong element, wrong color (/70 ink vs sage), no icon. **The clone's text was authored, never live-measured** (the success state requires a real submission — no prior census instrument covered it) |
| F4 | MEDIUM-HIGH — behavior under failure | newsletter POST error path | `try { await NewsletterSubscriber.create({email, source:"homepage_15off"}) → success } catch { → success }` — **POST failure renders the SUCCESS state**; no error UI exists anywhere in the bundle ("went wrong"/"try again" absent from the 581KB chunk) | `catch → error` state + visible `role="status"` message "Something went wrong — please try again." (clone-authored error UI the reference does not have) |
| F5 | MEDIUM — behavior under failure | booking POST error path | `try { await Booking.create({...form, status:"pending"}) } catch {} → **always** router.push('/book/confirmation?name&date&time&service')` — errors swallowed, navigation unconditional; no error UI | `catch → setError` — the API's error message renders in a `role="alert"` `text-destructive` paragraph and navigation is blocked |
| F6 | MEDIUM — visible error UI | login error state (wrong credentials) | a red shadcn **Alert card** in the Notifications region, visually above the Sign In button: `<div role="alert" class="relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground bg-red-50/70 border-red-200 rounded-xl"><div class="[&_p]:leading-relaxed text-red-700 text-sm">Invalid email or password</div></div>` — computed bg `rgba(254,242,242,.7)`, border `rgb(254,202,202)`, radius 12px, padding 16px, text `rgb(185,28,28)` 14px, h 54px. The text has **no trailing period** | inline `<p role="alert" class="text-sm text-red-600 font-medium">` — plain red-600 text (and the API's message carries a trailing period: "Invalid email or password.") |
| F7 | LOW — loading state | login loading | button text **"Signing in..."** (three ASCII dots) + disabled; **both inputs disabled** during the request | "Signing in…" (U+2026 ellipsis) + disabled button; inputs stay enabled |
| F8 | LOW — loading state | newsletter button | `children: [loading ? "Sending..." : "Claim 15% off", <ArrowRight h-3.5 w-3.5/>]` — ASCII dots + **the arrow renders in BOTH states** | "Claiming…" (U+2026) + the arrow is hidden while loading |
| F9 | LOW — loading state | booking button | `children: [loading ? "Reserving..." : "Request appointment", <ArrowRight h-4 w-4/>]` — ASCII dots + **the arrow renders in BOTH states** | "Requesting…" (U+2026) + the arrow is hidden while submitting |
| F10 | INFO — registration only | newsletter POST payload | `{ email, source: "homepage_15off" }` — the platform tracks the source | `{ email }` — no visible parity impact; the API stays as-is (documented) |
| F11 | INFO — registration only | newsletter reveal wrapper | framer-motion `delay: .15` (150ms) | `Reveal delay={100}` (100ms) — transient, sub-perceptual; the reveal-timing family was settled in session 1; registered, no change |
| F12 | INFO — registration only | newsletter input a11y | fully unlabeled on the live (no label / aria-label / aria-labelledby — the reference's own a11y failure) | `aria-label="Your email"` — the documented **invisible-a11y additions** family (sessions 8/9); now explicitly registered as a member |
| F13 | INFO — verified holding | the rest of the census | login inputs (types/placeholders/ids/classes byte-identical); `/contact` has NO form controls; book field set/order/types/required flags identical; both selects' option lists identical (incl. `disabledFirst: false`); labels identical (the live's `"block "` + span trailing-space artifacts = the documented inert family); computed styles identical (bg `oklab(...)` = trap 7; font-family string = the next/font adjusted-fallback artifact); newsletter input 54×307 both sides; **the mobile drawer @390×844 re-verified both sides** — gap 8px, px-8, 48px Cormorant lh 48, ls −1.2px, ink/CTA colors — **no Tailwind v4 regression** (the task brief's emphasis); native validation (type=email + required) blocks empty/invalid submits identically | same |

## 3. Root cause

The session-11 lesson gains a third instance: **state-parity is invisible to every census that reads the settled DOM.** All eleven prior instruments measured the pages at rest — but a form's loading text, its success state, and its failure behavior only exist *after* interaction, and none of the prior sessions' instruments ever submitted a live form and read back what rendered. F3/F4/F5/F7–F9 are exactly that layer. F2 is the session-10 pattern again at a finer grain: two inputs with **identical computed styles** render different heights because the difference lives inside the UA's inner editor — below the reach of `getComputedStyle(input)` and only replicable (and pinnable) at the pseudo-element level. And F6 existed because the clone's error UI was authored from taste, never extracted — the same class of error the 404 surface had in session 5.

## 4. Design (the fixes)

### 4.1 F1 — the textarea's `resize-none` (`src/components/BookingForm.tsx`)

The textarea is the one field that must NOT take the shared `inputClass` verbatim: `className={`${inputClass} resize-none`}` — appending, exactly as the live's own class string orders it (`…transition resize-none`).

### 4.2 F2 — the date/time input height (`src/app/globals.css`)

A pinned pseudo-element rule in the base layer:

```css
/* The reference's date/time inputs render 2px taller than their text
   siblings (content = line-height + 2px → 48px vs 46px). Live-measured
   session 12; the mechanism is unattributable (no author CSS, no font
   dependency — see docs/remediation-plan-session-12.md §2 F2) — this
   padding on the UA's inner editor replicates the exact heights. */
input[type="date"]::-webkit-datetime-edit,
input[type="time"]::-webkit-datetime-edit {
  padding: 1px 0;
}
```

The app's only date/time inputs are the booking form's — no other surface can regress. `min-height` stays 0px; the intrinsic character of the height is preserved (verified: lh 18 → 46, lh 22 → 50, exactly the live's curve).

### 4.3 F3 + F4 + F8 — the newsletter form (`src/components/NewsletterForm.tsx`)

The live's exact state machine (from the deobfuscated bundle): `idle | loading | success`, submit guarded only by the native `required` + a non-empty email, `catch → success`, and:

- **Success:** `<div className="mt-12"><div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-editorial text-secondary"><Check className="h-4 w-4" aria-hidden />{" You're in. Check your inbox for your 15% code."}</div></div>` — the lucide `Check` at class sizing, the leading space preserved (byte-parity with the live's text node), sage via `text-secondary`.
- **Loading:** text `"Sending..."` (ASCII dots) and the `ArrowRight` stays rendered.
- **The error state and its UI are removed entirely** (the API is still called — fire-and-forget: the result no longer changes the UI).

The `aria-hidden` on the Check icon and the `aria-label` on the input are the clone's documented invisible-a11y family (F12) — kept, now registered.

### 4.4 F5 + F9 — the booking form (`src/components/BookingForm.tsx`)

- Submit becomes fire-and-forget: `try { await fetch(...) } catch { /* the reference swallows POST failures */ }` → the `URLSearchParams` navigation runs **unconditionally**. The `error` state, its `role="alert"` paragraph, and the `setError` plumbing are removed. The API route keeps its full server-side validation (the `booking.spec.ts` direct-API 400 test stays green) — garbage still never persists; only the *UI stance* changes to match the reference.
- Button children: `{submitting ? "Reserving..." : "Request appointment"}` + the `ArrowRight h-4 w-4` **always** rendered.

### 4.5 F6 + F7 — the login form (`src/components/LoginForm.tsx`, `src/app/globals.css`, `src/app/api/auth/login/route.ts`)

- The error paragraph becomes the live's Alert card (exact class set, `role="alert"`, the inner `[&_p]:leading-relaxed text-red-700 text-sm` div) in the same position (between the fields and the Sign In button — the live's toast region renders visually there, VLM-verified).
- The API's 401 message loses its trailing period → `"Invalid email or password"` (the live's visible toast text, byte-exact; one source of truth — the UI renders the API's message).
- Loading: `"Signing in..."` (ASCII) + `disabled={loading}` on both inputs.
- **Trap-6 pinning:** the reds join the slate block in `@theme` — `--color-red-50: #fef2f2; --color-red-200: #fecaca; --color-red-700: #b91c1c;` (the live's login shell computes the v3 sRGB values; v4's default oklch reds would drift — the same reasoning as the slate pin, and `bg-red-50/70` will then serialize as oklab channels per trap 7: pixels identical, specs assert channels).

### 4.6 F10–F12 — registrations only

Documented in this plan + the session log + the SKILL/pad updates; no code change.

## 5. TDD plan

**T1 (RED):** write `tests/e2e/form-parity.spec.ts`:
- **F1:** the Notes textarea computes `resize: none`
- **F2:** date + time inputs `offsetHeight === 48` (guard: the text/email/tel inputs stay 46)
- **F3:** a real subscribe → the success div: the Check svg (`h-4 w-4` class sizing), the `" You're in…"` text (leading space), `text-secondary` computed sage, `inline-flex items-center gap-3`, inside `div.mt-12`
- **F4:** `page.route("**/api/newsletter", abort)` → submit → **the success state still renders**
- **F5:** `page.route("**/api/appointments", abort)` → fill the form → submit → `expect(page).toHaveURL(/\/book\/confirmation\?name=…/)`
- **F6:** wrong credentials → the alert div's class set + computed bg/border/text channels (oklab per trap 7) + radius 12px + padding 16px + text `Invalid email or password` (no period)
- **F7:** `page.route("**/api/auth/login", delayed-401)` → during the wait: button text `Signing in...` + disabled + both inputs disabled
- **F8:** `page.route("**/api/newsletter", delayed-200)` → during the wait: `Sending...` + the arrow svg still present
- **F9:** `page.route("**/api/appointments", delayed-201)` → during the wait: `Reserving...` + the arrow svg still present
- **Guards:** the login input census (email `you@example.com` / password `••••••••` placeholders + ids + `h-11 sm:h-12` class strings), the book field census (8 controls in order: text/email/tel/select/select/date/time/textarea with the required flags), the select option lists, the Notes placeholder, the newsletter input census (placeholder/classes/54px height)

**T2 (GREEN):** apply §4.1 → §4.5 (+ the one spec-side correction: `landing.spec.ts`'s newsletter test asserts the live text `/You're in/` instead of the clone-authored `/Welcome to the atelier/` — the session-5 precedent for correcting clone-authored assertions to the live contract).

**T3:** full gate — `lint → typecheck → test (61 unit) → build (27 pages) → test:e2e` — every pre-existing spec green (verified conflict-free: `booking.spec.ts`'s 400 test posts directly to the API; `auth.spec.ts` asserts response shape only; no other spec pins the loading/success/error texts).

**T4:** live re-verification (agent-browser): the value-by-value checks of every fixed surface + the drawer standing check + 15 screenshots re-captured.

**T5:** documentation alignment — README (badge + feature row + counts), AGENTS.md (the new invariants + contract line), CLAUDE.md (counts + parity list), PAD (§7 inventory + the session-12 ledger), `beauty-salon_SKILL.md` v1.9.0, `.env.example` re-verified, the proper `docs/session_12.md` record, the worklog entry.

**T6:** commit + SSH-wrapper push to `main`; verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| F1 fix site: the textarea takes `inputClass` | `BookingForm.tsx:204` — `className={inputClass}` on the textarea; `inputClass` (line ~34) has no `resize-none` | ✓ matches |
| F2 fix site: no existing date/time pseudo rules | `globals.css` — no `datetime-edit`/`date` selectors; only the reveal keyframes + utilities | ✓ clean slate |
| F2 scope: only /book has date/time inputs | `rg 'type="date"|type="time"' src/` → only BookingForm | ✓ no collateral |
| F3 fix site: the success block | `NewsletterForm.tsx:29-37` — the clone-authored block; `Check` not imported | ✓ matches |
| F4 fix site: the catch → error | `NewsletterForm.tsx:24-26` + the error UI at `:58-62` | ✓ matches |
| F5 fix site: the catch → setError | `BookingForm.tsx:65-78` + the error UI at `:222-226` | ✓ matches |
| F6 fix site: the error paragraph | `LoginForm.tsx:130-134` — `text-red-600 font-medium`; the API message with period at `api/auth/login/route.ts:36` | ✓ matches |
| F7 fix site: inputs not disabled | `LoginForm.tsx:95-104,113-124` — no `disabled` attr; button text U+2026 at `:147` | ✓ matches |
| The existing newsletter test pins the OLD text | `landing.spec.ts:80` — `/Welcome to the atelier/` (clone-authored; corrected in T2) | ✓ conflict known |
| No other spec pins the changing texts | `rg "Claiming|Requesting|Signing in|Something went wrong|Welcome to the atelier" tests/` → only landing.spec.ts:80 | ✓ no other conflicts |
| The reds are not pinned in @theme | `globals.css:54-77` — the slate block only; no `--color-red-*` | ✓ pin needed |
| The booking 400 test bypasses the UI | `booking.spec.ts:67-77` — `page.request.post` direct | ✓ unaffected |
| The auth spec's error test bypasses the UI | `auth.spec.ts:18-25` — API-level only | ✓ unaffected |
| The e2e environment supports route interception | Playwright `page.route` on the standalone server — standard | ✓ |

## 7. Risks

- **Fire-and-forget hides real failures from the user** (F4/F5): a genuinely broken backend now shows the confirmation anyway. This is *exactly* the reference's behavior (measured from its bundle: `catch {}` → navigate) — parity outranks robustness here, and the API still logs server-side. Documented so a future agent doesn't "fix" it back.
- **The F2 pseudo-element rule is engine-specific** (`-webkit-` prefix): the app targets Chromium (Playwright + the parity substrate); Firefox's date inputs render differently — out of scope (the reference's own behavior is what's replicated).
- **The red-scale pinning** (trap 6) touches `@theme` — the pin is additive (3 tokens) and read back by the new spec's computed-channel assertions.
- **The F6 class set contains arbitrary-variant selectors** (`[&>svg~*]:pl-7` etc.) — inert without an svg child (the live renders none); replicated verbatim per the class-parity convention.

---

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** RED — write `tests/e2e/form-parity.spec.ts` (the F1–F9 groups + the census guards); run against the current build; expect every actionable group red exactly as the register predicts. *(Executed: 9/9 actionable tests failed exactly as predicted after two spec-side shapings — the newsletter pill's class-order regex (`px-6 py-4 rounded-full`, not the reverse) and the date/time census switched from `input[type=text]` attribute selectors (which match NOTHING — **engine fact: React omits the default type="text" attribute**; the live's DOM is identical) to positional property reads; all census guards green.)*
- [x] **T2.** GREEN — apply §4.1–§4.5 (+ the landing.spec.ts text correction). *(Executed: BookingForm [resize-none + fire-and-forget + Reserving.../arrow], NewsletterForm [the full state-machine rewrite: catch→success, the sage Check row, Sending.../arrow], LoginForm [the Alert card + disabled inputs + Signing in...], the API 401's trailing period dropped, globals.css [the datetime-edit rule + the red-50/200/700 sRGB pinning]; landing.spec.ts's newsletter assertion corrected to the live text — the session-5 auth.spec precedent.)*
- [x] **T3.** Full gate: `lint → typecheck → unit 61/61 → build 27/27 pages → e2e` (92 pre-existing + 12 new, all green; no weakened assertions). *(Executed: lint ✓ · tsc ✓ · unit 61/61 ✓ · build 27/27 ✓ · e2e **104/104** ✓ — **165 total**; every pre-existing contract untouched.)*
- [x] **T4.** Live re-verification of every remediated surface + the drawer standing check + the 15 screenshots re-captured; VLM-verify the key captures. *(Executed: the textarea resize:none; 46/48/48 input heights; the newsletter success value-by-value (leading-space text, sage rgb(75,93,79), gap 12px, inline-flex, lucide-check h-4 w-4 at sage stroke); the Alert card (no-period text, oklab bg, rgb(254,202,202) border, rgb(185,28,28) inner, 12px radius, 16px padding, 54px, above the button); Signing in.../Sending.../Reserving... + arrows + disabled (via a slowed fetch); the drawer @390×844 all pinned values identical (no v4 regression); 15 captures re-taken — mobile-menu 26124B byte-identical (the pixel signal), 10 byte-identical; 03 re-taken --full; 13's lightbox pixel-verified after a capture-process fix (a click that had hit the hidden menu button + a check whose compound selector matched the hidden drawer); VLM-verified 02, 08 (no resize handle — the F1 visual), 13, 14-flower/calendar.)*
- [x] **T5.** Documentation aligned (README, AGENTS.md, CLAUDE.md, PAD, SKILL v1.9.0, `.env.example` re-verified, the proper `docs/session_12.md`, the worklog entry). *(All applied; `.env.example` unchanged — the fixes read no env.)*
- [x] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Executed — see the push evidence in §9.)*

## 9. Push evidence (session 12)

- Committed as one atomic commit **`8e15453`** to `main` (27 files changed: 5 code + 1 new spec + the API route + globals.css + 6 docs + worklog + this plan + 13 re-captured screenshots [09/10/11 byte-identical — skipped by git]); pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the wrapper's default remote is the runbook's task-management origin — the sessions 8–11 note; the paramiko ssh shim from the runbook's Appendix A placed on PATH at `/home/z/my-project/bin/shim/`, outside the repo).
- Key fingerprint verified before the push: **`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`** (the runbook's paramiko method — matches the sessions 1–11 record; the same operator key).
- Dry-run clean (`da96302..8e15453` fast-forward); real push exit 0 with the wrapper's own remote verification **`refs/heads/main @ 8e15453 == local HEAD`** + the tracking-ref sync.
- Independent re-confirmation via `git ls-remote` (shim + key): `8e15453fe34496b80b1ce69cc138865ac45cce66 refs/heads/main` — byte-exact == local HEAD.
- Change-set secret scan clean pre-commit: the single `BEGIN OPENSSH PRIVATE KEY` match in the change set is `docs/session_12.md`'s own scan-description prose (the sessions 8–11 documented pattern); no tracked env/db/key files beyond `.env.example`; the operator key shredded + removed post-push (the wrapper's temp copy shreds itself on every run).

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The non-resizable Notes textarea | `src/components/BookingForm.tsx` |
| The date/time +2px height replication | `src/app/globals.css` (the `::-webkit-datetime-edit` rule) |
| The fire-and-forget booking submit + `Reserving...`/arrow | `src/components/BookingForm.tsx` |
| The newsletter state-machine rebuild (success row + catch→success + `Sending...`/arrow) | `src/components/NewsletterForm.tsx` |
| The login Alert error card + disabled inputs + `Signing in...` + the no-period 401 | `src/components/LoginForm.tsx`, `src/app/api/auth/login/route.ts` |
| The red scale pinned to sRGB (trap 6) | `src/app/globals.css` |
| Parity contracts | `tests/e2e/form-parity.spec.ts` (new, +12 e2e) + the landing.spec.ts text correction |
| Screenshots | `docs/screenshots/*.png` (re-captured; 03 full-page; 13 lightbox pixel-verified) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.9.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-12.md`, `docs/session_12.md`, `worklog.md` |
