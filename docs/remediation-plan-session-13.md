# Remediation Plan — Session 13 (The Focus-Ring Census + Post-Bump Hygiene)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `dceec22` (session-12 deliverable `8e15453` + `5715776` + the owner's post-session commits `330bdc3`/`3130c44`/`dceec22` — the session-12 session-log commit, the dependency-bump commit, and the start-server-log commits)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (Phase 3 as the targeted lightweight checklist; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (login, the mobile drawer @390×844 both sides — the task brief's emphasis, and **the first-ever both-sides focus-ring census** — the session-12 log's suggested candidate: every interactive surface's focused computed styles on `/`, `/book`, `/login`, and the mobile drawer) + TDD remediation per this plan. Plan validated against the codebase before execution (§6).

---

## 1. Executive Summary

The session-12 release re-validates **fully green** on every automated gate (ESLint clean, `tsc --noEmit` clean, 61/61 unit, 27/27 build pages, 104/104 e2e — 165 total) **on the owner's bumped dependency stack** (commit `3130c44`: next `^16.1.1`→`^16.3.8`, prisma `^6.11.1`→`^6.19.3`, react `^19.0.0`→`^19.3.0`, tailwindcss `^4`→`^4.3.3`, radix/lucide/zustand/etc. — plus a `package-lock.json` alongside `bun.lock`; the start_server_log.txt documents the stack booting clean, and this session's full gate re-confirms it).

This session's sweep executed the session-12 log's suggested candidate: **a keyboard/focus-ring census** — the first instrument to enumerate every interactive surface's *focused* computed styles on both sides. The marketing surface's focus behavior is **identical** (book inputs' border→ink with no ring, the UA-default outlines preserved on links/buttons/drawer controls, the newsletter input's border→ink), and the mobile drawer re-verified **byte-identical** @390×844 both sides (gap 8px, px-8, 48px Cormorant lh 48, ls −1.2px, ink/CTA colors — no Tailwind v4 regression; the task brief's emphasis). But the **auth shell's focus rings diverge visibly**: the live's login inputs render a **slate-400** ring with a **white** offset while the clone renders an **ink** ring with a **cream** offset — from byte-identical class strings. This is a **new engine trap (#9)**: v4's variant ordering resolves `focus-visible:ring-ring` over `focus:ring-slate-400` where the reference's v3 engine resolves the opposite. The Sign in button's ring likewise resolves to the brand ink where the platform shell's `--ring` is zinc-950.

**Five actionable findings** (one security-hygiene relic from the owner's post-session commits, one MEDIUM visible focus divergence with two sub-findings, one class-parity gap, one docs-drift cluster, one convention item) + a verified-holding census (F6) + one cheap hardening candidate (F7).

## 2. Findings register (live-measured 2026-10-06, agent-browser, viewport 1280×900 unless noted; transitions frozen for synchronous reads)

| # | Severity | Surface | Live (measured) | Clone (current) |
|---|---|---|---|---|
| F1 | MEDIUM — security hygiene | `docs/start_server_log.txt` (owner commit `dceec22`) | n/a (repo hygiene) | carries a **real AUTH_SECRET** committed to the tree (`AUTH_SECRET="4439ce…"…784b5e"` — a 64-hex session-signing key) alongside the owner's deployment URL. Violates the repo's own never-commit-secrets rule (AGENTS.md §Git; the pre-ship security sweep). Practical exposure is bounded (a private repo, an HMAC session key for the deployed instance), but the rule is the rule — redact + rotate + guard |
| F2 | MEDIUM — visible focus parity (the census's key finding) | `/login` email + password inputs, focused | ring **slate-400** `rgb(148, 163, 184) 0px 0px 0px 4px` + **white** offset `rgb(255, 255, 255) 0px 0px 0px 2px`; border `rgb(148,163,184)` | ring **ink** `rgb(26, 26, 26) 0px 0px 0px 4px` + **cream** offset `rgb(250, 248, 245) 0px 0px 0px 2px`; border `rgb(148,163,184)` ✓. The input class strings are **byte-identical** — the divergence is pure engine resolution (**trap 9**: v4 orders `focus-visible:ring-ring` over `focus:ring-slate-400`; v3 the opposite), plus the shell-context token difference (the platform's `--background` is white; the brand's is cream) |
| F3 | LOW-MEDIUM — subtle focus parity | `/login` Sign in button, focused | ring **zinc-950** `rgb(9, 9, 11) 0px 0px 0px 4px` + white offset (the platform shell's `--ring`/`--background`), border `rgb(229,231,235)` (inert — width 0) | ring **ink** `rgb(26, 26, 26)` + cream offset (the brand `--color-ring`/`--color-background`), border `rgb(225,219,214)` (inert — width 0) |
| F4 | LOW — class parity | `/login` Sign in button class string | carries `[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` between `disabled:opacity-50` and `px-3 py-2` (inert — the settled button renders no svg child, innerHTML = `Sign in`) | missing the three variants (the class-parity convention: replicate inert variants verbatim — the session-12 Alert-card precedent) |
| F5 | MEDIUM-LOW — docs drift | PAD §1.2 version table; CLAUDE.md/SKILL stack references | n/a | the owner's `3130c44` bumped every dependency and added `package-lock.json`; the PAD still pins `^16.1.1`/`^6.11.1`/`^19.0.0`/`^4`, and no doc records the npm lockfile's coexistence with `bun.lock` (Bun remains the sanctioned runtime; the npm lockfile is the owner's deliberate addition — document, do not remove) |
| F6 | INFO — verified holding | the complete focus census | every other surface identical both sides: `/book` inputs (border→ink on `focus:border-foreground`, no ring, the v3-transparent vs v4-none outline form — both invisible); `/book` submit (UA `outline: auto 1px`); landing nav links, footer links, drawer links/CTA/close (UA outline); Google button (UA outline, border slate-200 ✓); forgot/signup links (UA outline, slate-500 text ✓); newsletter input (border→ink, no ring); hamburger (border `rgba(26,26,26,.2)` vs the clone's `oklab(... / 0.2)` — trap 7, pixels identical); **the mobile drawer @390×844 re-verified both sides** (gap 8px, px-8, 48px Cormorant lh 48, ls −1.2px, ink/CTA colors, tap-through navigation) — **no Tailwind v4 regression** (the task brief's emphasis); the reference itself has not drifted (services title/h1/bottom-CTA verified) | same |
| F7 | LOW — cheap hardening (the session-12 log's second candidate) | ICS year boundary | n/a (pure logic) | `addMinutes` uses `Date.UTC` arithmetic — year rollover works; a unit pin makes the contract explicit (the midnight-rollover precedent) |

## 3. Root cause

The session-12 lesson gains a fourth instance: **focus parity is invisible to every census that reads the settled DOM *and* to every interaction census that reads only text/state** — the ring only exists on `:focus`/`:focus-visible`, and prior instruments never measured computed styles *while focused*. F2/F3 are exactly that layer, and F2 sharpens it into an engine trap: **byte-identical class strings that resolve differently across the v3/v4 engines** (the variant-ordering conflict between `focus:ring-slate-400` and `focus-visible:ring-ring` — both set `--tw-ring-color`, and the engines disagree on the winner). The shell-context token family (the platform's white `--background` / zinc-950 `--ring` vs the brand cream/ink) is the session-3 `font-shell` precedent applied to a new property — the auth shell is a separate CSS context, and its *token values* had never been pinned, only its fonts. F1 is the classic post-deliverable relic: an operator's honest start-server log pasted with real values into a tracked file.

## 4. Design (the fixes)

### 4.1 F2 + F3 — the auth-shell focus-ring block (`src/app/globals.css`)

A scoped custom-property block beside the `font-shell` utility (the established auth-shell scope — the login `<main>` + `<h1>`):

```css
/* Auth-shell focus rings (live-measured session 13): the platform shell's
   token context renders --ring as zinc-950 and --background as WHITE —
   and its v3 engine resolves focus:ring-slate-400 OVER
   focus-visible:ring-ring on the inputs (trap 9: v4 orders the variants
   the opposite way). Pin the computed outcome inside the shell scope. */
.font-shell {
  --color-ring: #09090b;
  --color-background: #ffffff;
}
.font-shell input:focus {
  --tw-ring-color: #94a3b8;
}
```

Mechanics (validated): `ring-offset-background` compiles to `--tw-ring-offset-color: var(--color-background)` — the var resolves per-element through inheritance, so the shell scope's white wins for both inputs and the button (the only `--color-background` consumers in the login shell are the two `ring-offset-background` tokens — verified by grep; `bg-card`/`--color-primary-foreground` are literal theme values, unaffected). `focus-visible:ring-ring` on the button compiles to `--tw-ring-color: var(--color-ring)` → zinc-950. The input's ring color is forced by `.font-shell input:focus` (specificity (0,2,1)) which beats both ring-color utilities ((0,2,0) each) in either engine order — making the v3/v4 conflict moot for the inputs. Result: inputs render `rgb(255,255,255) 0 0 0 2px, rgb(148,163,184) 0 0 0 4px`; the button renders `rgb(255,255,255) 0 0 0 2px, rgb(9,9,11) 0 0 0 4px` + the pinned shadow-sm — the live's exact shadows. No marketing surface can regress (`.font-shell` exists only on `/login`); the 404's slate card lives outside the scope.

### 4.2 F4 — the Sign in button's inert svg variants (`src/components/LoginForm.tsx`)

Insert `[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ` between `disabled:opacity-50` and `px-3 py-2` — the live's exact class-string position. Inert on both sides (the settled button renders no svg child); replicated verbatim per the class-parity convention.

### 4.3 F1 — the start-server-log redaction + the hygiene guard (`docs/start_server_log.txt`, `tests/repo-hygiene.test.ts`)

- Replace the committed real `AUTH_SECRET="4439ce…"` value with `<redacted-session-13 — rotate the deployed instance's key>` in the log (the log keeps its documentary value; the value goes).
- Extend the repo-hygiene suite with a tracked-files secret scan: no tracked file may carry `AUTH_SECRET="<64-hex>"` (a real hex value ≥32 chars — `.env.example`'s empty `AUTH_SECRET=""` and prose mentions stay legal). RED against the current tree, GREEN after the redaction.

### 4.4 F5 — the docs alignment (README, AGENTS.md, CLAUDE.md, PAD, SKILL)

PAD §1.2's version column refreshes to the bumped stack (`^16.3.8` / `^6.19.3` / `^19.3.0` / `^4.3.3`); the lockfile note records `package-lock.json`'s coexistence with `bun.lock` (owner-added; Bun remains the sanctioned runtime). README badge + test counts refresh to the post-T1 numbers; AGENTS.md gains the trap-9 quirk + the focus-parity contract line; CLAUDE.md's parity list + counts; SKILL bumps to v1.10.0 with the session-13 row.

### 4.5 F7 — the ICS year-boundary pin (`tests/ics.test.ts`)

One unit test: `2026-12-31T23:30` + the fixed 90-minute block → `DTSTART:20261231T233000Z` / `DTEND:20270101T010000Z` (the UTC arithmetic already rolls; the pin makes it a contract).

## 5. TDD plan

**T1 (RED):** write `tests/e2e/focus-parity.spec.ts`:
- **F2:** the focused login email + password inputs compute box-shadow `rgb(255, 255, 255) 0px 0px 0px 2px, rgb(148, 163, 184) 0px 0px 0px 4px…` (white offset + slate-400 ring; string-containment on the two stops) and border `rgb(148, 163, 184)`
- **F3:** the focused Sign in button computes the white offset + `rgb(9, 9, 11)` ring stops
- **F4:** the Sign in button's class string byte-contains `[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` in the live's position (after `disabled:opacity-50`); the login input class strings byte-match the live's (the census guard)
- **Guards (the holding contracts):** the book text input focused → border `rgb(26, 26, 26)` + `box-shadow: none` (the marketing stance — no ring); the book submit focused → `outline-style: auto` (the UA default preserved); the Google button focused → `outline-style: auto`; the newsletter input focused → border `rgb(26, 26, 26)` + no ring; the login forgot link focused → `outline-style: auto` + color `rgb(100, 116, 139)`
- Plus the unit layer: the repo-hygiene secret scan (RED against the current tree) + the ICS year-boundary pin (GREEN immediately — hardening, not a divergence)

**T2 (GREEN):** apply §4.1 → §4.3.

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — every pre-existing spec green (conflict check: no existing spec pins the login focus rings, the Sign in button's class string, or `--color-ring`/`--color-background` inside the shell — verified by grep; the login-parity slate-900 read-backs and the form-parity Alert-card reds read different tokens; the button census guards pin input attributes/placeholders, not button classes).

**T4:** live re-verification (agent-browser): the value-by-value focus checks + the drawer standing check + the 15 canonical screenshots re-captured.

**T5:** documentation alignment (§4.4) + the proper `docs/session_13.md` record (replacing the session-12 transcript the owner committed there — the sessions 4–12 convention) + the worklog entry + `.env.example` re-verified (the fixes read no env).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim from the runbook's Appendix A at `/home/z/my-project/bin/shim/`, outside the repo) → verify remote == local.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The login input class string byte-matches the live | `LoginForm.tsx:13` vs the live's measured class string — identical except nothing (inputs) | ✓ matches |
| The Sign in button misses exactly the 3 `[&_svg]` variants | `LoginForm.tsx:155` vs the live's measured string — the only delta, positioned between `disabled:opacity-50` and `px-3 py-2` | ✓ matches |
| The live's button renders no svg child (the variants are inert) | live innerHTML = `Sign in` (measured) | ✓ inert both sides |
| `.font-shell` is the auth-shell scope on the login main + h1 | `src/app/login/page.tsx:21,41` | ✓ scope exists |
| Only `ring-offset-background` consumes `--color-background` in the login shell | grep `bg-background|text-background|border-background` in `src/components/LoginForm.tsx` + `src/app/login/` → none; `--color-card`/`--color-primary-foreground` are literal theme values | ✓ no collateral |
| No existing spec pins the login focus rings | grep `ring|boxShadow|focus` in form-parity.spec.ts / login-parity.spec.ts → no focus-ring assertions | ✓ no conflicts |
| No existing spec pins the Sign in button's class string | form-parity's guards pin input ids/types/placeholders + the newsletter pill + the Alert's classes — not the button's | ✓ no conflicts |
| slate-400 is already pinned sRGB | `globals.css:72` `--color-slate-400: #94a3b8` | ✓ reuse-free (the fix uses the literal in the scoped rule) |
| The `.font-shell input:focus` specificity beats the ring-color utilities | (0,2,1) vs the utilities' (0,2,0) | ✓ wins in both engine orders |
| The hygiene scan roots at tracked files only | new test uses `git ls-files` output — `docs/start_server_log.txt` is tracked; `.env` is not | ✓ correct target |
| The ICS year-boundary arithmetic already rolls | `ics.ts:31-40` uses `Date.UTC` + `new Date(start + minutes*60_000)` | ✓ pin-only |
| The PAD §1.2 versions drift from package.json | PAD pins `^16.1.1`/`^6.11.1`/`^19.0.0`/`^4`; package.json carries `^16.3.8`/`^6.19.3`/`^19.3.0`/`^4.3.3` (owner commit `3130c44`) | ✓ drift confirmed |
| The full gate is green on the bumped stack | this session's baseline: lint ✓ · tsc ✓ · unit 61/61 · build 27/27 · e2e 104/104 | ✓ baseline green |

## 7. Risks

- **The scoped `--color-background` override** touches a broad-semantic token — mitigated by the grep proof that the login shell's only consumer is `ring-offset-background`, and by the focus-parity + login-parity + form-parity read-backs that would catch any collateral. The 404 surface and every marketing route live outside `.font-shell`.
- **The `.font-shell input:focus` rule pins `--tw-ring-color` directly** — a v4-internal custom property. If Tailwind renames that internal in a future minor, the focus-parity spec goes red and points exactly here (the pinned-value-needs-a-read-back rule).
- **The redaction leaves the deployed instance's key stale-but-rotating** — the log's replacement text says so explicitly; the operator rotates at their leisure (the commit message will repeat it).
- **Screenshots after dependency bumps** — font rendering could shift pixels; the captures are re-taken fresh and VLM/DOM-verified as usual.

---

## 8. ToDo List (execution order, TDD) — executed results

- [x] **T1.** RED — write `tests/e2e/focus-parity.spec.ts` (F2/F3/F4 + the holding guards) + extend `tests/repo-hygiene.test.ts` (the tracked-docs secret scan) + add `tests/ics.test.ts` year-boundary pin; run against the current build; expect F2/F3/F4 + the secret scan red exactly as the register predicts. *(Executed: 4/4 actionable e2e groups failed exactly as predicted [F2 ×2, F3, F4] + the secret scan red against the live tree, after ONE spec-side shaping — the guards needed transitions FROZEN before the focused reads (`page.addStyleTag`) because a mid-transition read captures the pre-transition value (the book inputs' `transition` class animates the measured border); the ICS pin green immediately as designed; all 6 guards green incl. the class-string census proving the trap-9 premise.)*
- [x] **T2.** GREEN — apply §4.1 (globals.css) + §4.2 (LoginForm) + §4.3 (start_server_log redaction). *(Executed: the `.font-shell` token scope + the scoped `input:focus` rule; the three inert `[&_svg]` variants in the live's position; the AUTH_SECRET value redacted with the rotation note.)*
- [x] **T3.** Full gate: `lint → typecheck → unit → build → test:e2e` — every pre-existing spec green. *(Executed: lint ✓ · tsc ✓ · unit 63/63 ✓ · build 27/27 ✓ · e2e **114/114** ✓ — **177 total**; every pre-existing contract untouched.)*
- [x] **T4.** Live re-verification of every remediated surface + the drawer standing check + the 15 screenshots re-captured. *(Executed: the login inputs' focused shadow value-by-value = the live exact (`rgb(255,255,255) 0 0 0 2px, rgb(148,163,184) 0 0 0 4px` + border); the button's `rgb(9,9,11)` ring + shadow-sm; the drawer standing check all pinned values identical; 15 captures re-taken — the mobile-menu capture 26124B byte-identical (md5-confirmed), 01/08/09/10/12 also byte-identical [09 proves the settled login unchanged — only the focused state changed]; 02 re-captured scrolled to the below-fold CTA + VLM-verified; 13's lightbox DOM-verified (z-70) before capture; 14 VLM-verified.)*
- [x] **T5.** Documentation aligned (README, AGENTS.md, CLAUDE.md, PAD §1.2 + §5.5 + §7, SKILL v1.10.0, `.env.example` re-verified, the proper `docs/session_13.md`, the worklog entry, this plan's executed results). *(All applied; `.env.example` unchanged — the fixes read no env.)*
- [ ] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local. *(Pending — see §9.)*

## 9. Push evidence (session 13)

*(to be completed at T6)*

## 10. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The auth-shell focus-ring block (trap 9 + the shell tokens) | `src/app/globals.css` |
| The Sign in button's inert `[&_svg]` variants | `src/components/LoginForm.tsx` |
| The committed-secret redaction + the tracked-files secret guard | `docs/start_server_log.txt`, `tests/repo-hygiene.test.ts` |
| The ICS year-boundary pin | `tests/ics.test.ts` |
| Parity contracts | `tests/e2e/focus-parity.spec.ts` (new) |
| Screenshots | `docs/screenshots/*.png` (re-captured) |
| Doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.10.0) |
| This plan + session log + worklog | `docs/remediation-plan-session-13.md`, `docs/session_13.md`, `worklog.md` |
