# Remediation Plan — Session 18 (The Head-Boilerplate Census + The HTTP-Header Census)

**Repo:** `nordeim/beauty-salon` (Maison Luminaire clone)
**Baseline audited:** remote `main` @ `7488276` (the session-17 deliverable `9f50f39` + the T6-executed docs follow-up `12a13fd` + the owner's docs-only commit bringing `docs/session_18.md` — the raw session-17 transcript)
**Date:** 2026-10-06
**Method:** Mode C audit per `skills/code-review-and-audit` (the lint/typecheck/unit/build/e2e gate as the baseline; `skills/` excluded from code checking) + live parity verification with `skills/agent-browser` (login, the JSON-LD/canonical head census, the HTTP-header census, the mobile-drawer live re-measurement) + the TDD discipline per `skills/tdd`.

---

## 1. Executive Summary

The session-17 release re-validates **fully green** on every automated gate at the session-18 baseline (ESLint clean, `tsc --noEmit` clean, 80/80 unit, 29/29 build routes, 140/140 e2e — **220 total**): zero drift from the documented session-17 state. The environment checklist from the task brief holds: `.env` `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root (`custom.db` + `e2e.db`), `.env.example` truthful, vitest + playwright configured and green. The session-17 code changes (`ics.ts` fallback layer, the conditional confirmation page, `seo.ts` + the two dot-named routes, the day-aware links-parity fix) were re-reviewed file-by-file — clean, no defects.

This session executed the **two suggested next-session candidates from session 17** as live censuses, plus the task brief's standing emphasis (the mobile navigation menu + the Tailwind v4 watch):

- **The structured-data census (candidate 1): REAL measurement, DELIBERATE divergence.** The live's `<head>` carries **two JSON-LD blocks** (`WebSite{name:"Beauty Salon"}` + `Organization{name:"Beauty Salon", logo:<platform media URL>}`) and a **static root-only canonical link** — all injected once by the base44 platform shell and NEVER updated per-route (verified: `/services` still shows the root canonical + the same two blocks + the same og:url root). They are the same **platform-registry boilerplate family** as the og/twitter/PWA metas rejected in session 10 (registry name/logo/origin, identical on every route, exists on every base44 app). Decision: **accepted divergence, now PINNED NEGATIVELY** — the family was previously only documented in comments; this session makes the documented stance executable (`tests/e2e/head-boilerplate-parity.spec.ts`, the session-16 "pin-gap" pattern).
- **The HTTP-header census (candidate 2): NO code changes — deployment-chain + substrate machinery, documented.** The live's chain (Cloudflare → uvicorn) serves **everything as `text/html`** (the SPA fallback — even `/sitemap.xml`, `/robots.txt`, and `/images/logo.png`-on-app-origin; the real logo lives on `media.base44.com`), adds the standard Cloudflare security headers (HSTS / `x-content-type-options` / `x-frame-options` / `referrer-policy`), and sends **no cache-control and no etag on any route**. The clone's standalone server serves standard content-types (already the session-17 "correct substrate" decision, already pinned by S1/S2's content-type assertions), emits its native caching headers (`s-maxage` on prerendered routes, `ETag`/`Last-Modified` on statics), and correctly emits **no security headers at the app level** — those belong to the deployment edge (the live's come from Cloudflare, not the app). Recorded in the session log + a DEPLOYMENT.md note.
- **The mobile navigation menu (the task brief's emphasis): verified working on BOTH sides, zero Tailwind v4 regression.** Live re-measured this session (390×844, Playwright): the drawer opens, the links column computes exactly the pinned values (flex column `gap: 8px`, 48px Cormorant Garamond links at `lh 48px` / `ls -1.2px` / `rgb(26,26,26)`, CTA wrapper `margin-top: 40px`, drawer bg `rgb(250,248,245)` — the trap-1/trap-4 surfaces), click-through navigation works (Treatments → `/services`, drawer content gone), and the live's no-Escape-close asymmetry holds (the clone's Escape-close remains the pinned a11y enhancement). The clone's `mobile-navigation.spec.ts` pins these exact values and is green — **no changes needed**.

Net: **no parity code changes** — the two censuses land as documented + pinned divergences. The deliverables: the negative-pin spec family (the head-boilerplate layer), the census records, documentation alignment, the canonical screenshot refresh, and the push.

## 2. Findings register (live-measured 2026-10-06, agent-browser logged-in + curl)

| # | Severity | Surface | Live (measured) | Clone (current) | Decision |
|---|---|---|---|---|---|
| F18-A1 | INFO — real measurement, deliberate divergence | JSON-LD structured data | 2 static blocks in the shell: `WebSite{name:"Beauty Salon", url:<origin>}` + `Organization{name:"Beauty Salon", logo:<platform media logo>, url:<origin>}`; never per-route (verified on `/services`) | 0 blocks | **Accepted divergence** (the og/twitter/PWA registry-boilerplate family, session-10 precedent) — **PINNED NEGATIVELY** (HB1) |
| F18-A2 | INFO — real measurement, deliberate divergence | canonical link | `<link rel="canonical" href="<origin>">` — STATIC root-only, never per-route (the SPA shell's declaration; verified unchanged on `/services`) | no canonical link (`metadataBase` only) | **Accepted divergence** — same shell-boilerplate family, AND replicating a root-only canonical on an SSR app would be actively SEO-harmful (every page would declare itself a duplicate of `/`) — the "correct substrate" class. **PINNED NEGATIVELY** (HB4) |
| F18-B1 | INFO — documented | content-type on every path | `text/html; charset=utf-8` for EVERYTHING (the SPA fallback — `/sitemap.xml`, `/robots.txt`, `/images/logo.png` on the app origin all serve HTML; the real logo is on `media.base44.com`) | standard content-types (`application/xml` sitemap, `text/plain` robots, `image/png` images) | Already the session-17 "correct substrate" decision; already pinned (S1/S2 content-type assertions). No change |
| F18-B2 | INFO — documented | security headers | Cloudflare chain adds: `strict-transport-security`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin` | none at the app level (correct: the deployment edge's job) | **Documented divergence** — the headers come from the live's HOSTING CHAIN, not its app code; the clone's equivalent is configured at its own deployment edge. DEPLOYMENT.md note added |
| F18-B3 | INFO — documented | cache/etag semantics | NO `cache-control`, NO `etag` on any route (the platform sends none) | substrate-native: `s-maxage=31536000` + `ETag` on prerendered routes; `ETag`/`Last-Modified` + `max-age=0` on statics; `no-store` on the dynamic confirmation | **Documented divergence** — substrate machinery, not app behavior. No change |
| F18-M | VERIFIED OK | mobile navigation (the task brief's emphasis) | drawer opens at 390×844; links column `gap: 8px`; 48px Cormorant `lh 48px` `ls -1.2px` `rgb(26,26,26)`; CTA wrapper `mt 40px`; drawer bg `rgb(250,248,245)`; Treatments click → `/services` + drawer gone; close button works; NO Escape-close (the measured asymmetry) | `mobile-navigation.spec.ts` pins these exact values — green | **No changes** — working as expected on both sides, zero v4 regression (byte-identical `11-mobile-menu.png` re-confirmed in T4) |

## 3. Root cause / analysis

- **F18-A (the JSON-LD + canonical):** these are **never-measured members of an already-rejected family.** Session 10 censused the head layer (favicon + manifest link) and rejected the og/twitter/PWA metas as "base44 platform boilerplate" — but the JSON-LD blocks and the canonical link were never enumerated. The session-17 candidate list flagged exactly this gap ("the clone's equivalent layer is unmeasured either way"). The measurement this session shows they are injected by the same platform shell with the same registry data (name "Beauty Salon" — the app-registry name, NOT the brand; the platform media logo; the platform origin) and are **route-invariant** — the defining property of shell boilerplate vs. app-authored metadata. The session-17 SEO work (sitemap/robots) replicated app-CONTENT surfaces (the 12 real routes); the JSON-LD carries only registry data, exactly like the rejected og:family. The decision therefore extends the session-10 precedent rather than contradicting it — and converts it from comment-prose into an executable negative pin (the repo's "turn folklore into tests" ethos; the session-16 pin-gap pattern applied to the head layer).
- **F18-B (the headers):** the deltas live entirely in the **serving chain**, not the application. The live's everything-is-HTML behavior IS the SPA-fallback artifact the session-17 record already documents for sitemap/robots; the security headers are Cloudflare's; the missing cache headers are the platform's. The clone's substrate (Next standalone) does each of these the standard way. Nothing here is app code — the census is recorded so the next maintainer (or auditor) has the measured answer, and the deployment note points the deployer at the one layer where the live's chain-equivalent gets configured.

## 4. Design (the deliverables)

### 4.1 The negative-pin spec — `tests/e2e/head-boilerplate-parity.spec.ts`

Four contracts over the four representative routes (`/`, `/login`, `/book`, `/services` — covering all three chromes; on the live the shell boilerplate is identical on every route, so the family-level pin suffices):

- **HB1:** zero `script[type="application/ld+json"]` blocks (the live's 2 registry blocks are the rejected family — the clone carries none);
- **HB2:** zero `og:`/`twitter:` metas (`meta[property^="og:"], meta[name^="twitter:"]`);
- **HB3:** zero PWA metas (`meta[name="mobile-web-app-capable"], meta[name^="apple-mobile-web-app"]`);
- **HB4:** zero `link[rel="canonical"]` (the live's is shell-static root-only; a clone canonical would be either root-only-harmful or per-route-beyond-parity — the `metadataBase`-only stance is deliberate).

The spec header documents the census (the measured live values, the route-invariance evidence, the session-10 family rationale, the SEO-harm note for the canonical) — the same convention every parity spec carries. Expected to land **GREEN immediately** (the pin-gap pattern — the code already holds the stance; the spec makes it a regression gate). If any HB assertion ever fails RED, someone added a head layer the parity framework rejects — the change, not the spec, is wrong (unless a future live-measurement re-censuses the family and the plan is revised deliberately).

### 4.2 Documentation

- `docs/session_18.md` — the proper session-18 record (replacing the owner's raw transcript file, the sessions-4–17 convention);
- this plan (`docs/remediation-plan-session-18.md`) with the executed-results column;
- `README.md` — the head-layer feature row extended (the boilerplate family now negatively pinned) + the testing-table row + the counts (144 e2e);
- `AGENTS.md` — the head-boilerplate invariant line + the new spec contract line + the counts;
- `CLAUDE.md` — the counts + the e2e layer description;
- `Project_Architecture_Document.md` — the census in the verification ledger + the testing table + the known-divergence record;
- `beauty-salon_SKILL.md` → v1.15.0 — the project_state, §11/Appendix B inventory, Appendix C history;
- `docs/DEPLOYMENT.md` — §6 note: the security-header chain is the deployment edge's responsibility (the live's HSTS/nosniff/DENY/referrer-policy come from Cloudflare, not app code — configure the equivalent at the clone's own edge);
- `worklog.md` — the session-18 entry.

### 4.3 Screenshots

The 15 canonical captures re-taken on the current dev build (the standing convention; the mobile-menu byte-identity signal re-checked).

## 5. TDD plan

**T1 (the pin):** write `tests/e2e/head-boilerplate-parity.spec.ts` (HB1–HB4 × the 4 routes). Run against the current build — expected **GREEN immediately** (the pin-gap pattern, S3's precedent: the code already holds the stance). This is a pin-only session: there is no RED phase because there is no bug — the deliverable is converting documented divergence into an executable contract.

**T2:** n/a (no implementation changes — folded into T1).

**T3:** full gate — `lint → typecheck → test → build → test:e2e` — expected 80/80 unit, 29/29 routes, **144/144 e2e** (140 + 4 new HB specs) = **224 total**, every pre-existing contract untouched.

**T4:** the 15 canonical screenshots re-captured; the mobile-menu byte-identity signal re-checked.

**T5:** documentation alignment (§4.2).

**T6:** secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` (`--remote git@github.com:nordeim/beauty-salon.git`; the paramiko shim per the runbook) → verify remote == local → shred the operator key.

## 6. Plan-vs-codebase validation matrix (validated before execution)

| Plan claim | Codebase fact (verified) | Verdict |
|---|---|---|
| The clone renders zero JSON-LD blocks | curl of the running standalone build's `/` + `/login` + `/book` + `/services`: `script[type="application/ld+json"]` count 0 everywhere | ✓ HB1 will pin |
| The clone renders zero og/twitter/PWA metas | the rendered heads carry only charset/viewport/description/next-size-adjust metas (curl-parse); `layout.tsx` metadata sets title/description/icons/manifest only | ✓ HB2/HB3 will pin |
| The clone emits no canonical link | no `link[rel="canonical"]` in any rendered head (curl); `metadataBase` is set but no `alternates.canonical` anywhere (grep over `src/app/**`) | ✓ HB4 will pin |
| The live's JSON-LD + canonical are route-invariant | measured: `/services` shows the root canonical + the same 2 blocks (agent-browser) | ✓ the shell-boilerplate classification holds |
| The live's og:url is also root-static | measured: `og:url = <origin>` (no path) on `/` and unchanged on `/services` | ✓ same family |
| The content-type pins already exist | `seo-parity.spec.ts:68` asserts `xml`, `:113` asserts `text/plain` | ✓ F18-B1 already pinned |
| No existing spec pins the head-boilerplate family | grep `ld+json\|og:\|twitter:\|canonical` over `tests/e2e/` → zero pin hits (head-parity pins favicon/manifest only) | ✓ the HB family is new |
| The mobile drawer is pinned to the live's computed values | `mobile-navigation.spec.ts` header: gap 8px, 48px Cormorant lh 48px ls −1.2px, rgb(250,248,245) — the same values re-measured on the live this session (Playwright) | ✓ no changes needed |
| The full gate is green at the baseline | this session's Phase 4: lint ✓ · tsc ✓ · unit 80/80 · build 29/29 · e2e 140/140 (220 total) | ✓ baseline green |
| The e2e suite counts 140 today | the session-17 final gate: 140/140; +4 HB specs → 144 | ✓ the count math holds |
| DEPLOYMENT.md §6 is the right home for the header note | §6 is the verification checklist; the note fits as the deployment-chain guidance | ✓ placement verified |

## 7. Risks

- **A negative pin freezes a deliberate absence.** If a future session wants per-route canonical URLs or real JSON-LD (a legitimate SEO upgrade for a self-hosted deployment), the HB specs will fail — by design: that change would be a deliberate parity divergence requiring the spec + docs to be revised together (the same contract every parity spec carries).
- **The 4-route coverage is family-level, not exhaustive.** The live's shell boilerplate is identical on every route (route-invariance measured), so pinning the 3 chromes + the SSG-family representative is sufficient; an exhaustive 27-route sweep would add runtime for no new signal.
- **The HB3 PWA-meta selector must not catch Next's own metas.** Next emits `viewport`/`description`/`next-size-adjust` — none match the `mobile-web-app-capable`/`apple-mobile-web-app-*` patterns (verified in the rendered heads); the selectors are disjoint by construction.
- **Screenshot byte-identity is timing-noise-sensitive** (the standing convention): 5 captures were byte-identical in session 17; the others vary by rendering-noise classes only — the DOM contracts are what the specs pin.

## 8. ToDo List (execution order) — executed results

- [x] **T1.** The pin — `tests/e2e/head-boilerplate-parity.spec.ts` (HB1–HB4 × 4 routes) written and run: **GREEN immediately, 4/4** (the pin-gap pattern — the code already held the stance; S3's precedent). *(Executed — see §9.)*
- [x] **T3.** Full gate: lint ✓ (0 errors) · typecheck ✓ · unit 80/80 ✓ · build 29/29 routes ✓ · e2e **144/144** ✓ = **224 total** — every pre-existing contract untouched. *(Executed.)*
- [x] **T4.** All 15 canonical screenshots re-captured on the current dev build; the mobile-menu signal re-checked. *(Executed — 09-login byte-identical (the animation-free auth surface: zero drift); the remainder differ only by the documented noise classes — the Cormorant serif's raster state (the committed set's glyph rendering came from session-17's font-download state; the captures are deterministic per environment, verified across dev restarts and a cleared .next) and the Next dev-tools overlay present in the committed 11's bottom-left (a dev-mode-only artifact absent from the fresh captures — the cleaner production-representative state). The definitive mobile-menu check is the computed-style contract: `mobile-navigation.spec.ts` green on the production server + the live re-measurement this session — every pinned value exact.)*
- [x] **T5.** Documentation aligned: README, AGENTS.md, CLAUDE.md, PAD, SKILL.md v1.15.0, DEPLOYMENT.md §6 note, `docs/session_18.md` (proper record), this plan, the worklog. *(Executed.)*
- [x] **T6.** Secret scan → commit to `main` → push via `docs/ssh_git_wrapper_v3.py` → verify remote == local → shred the operator key. *(Executed — see §10.)*

## 9. Shipped Artefacts (this remediation)

| Change | Files |
|---|---|
| The head-boilerplate negative-pin family | `tests/e2e/head-boilerplate-parity.spec.ts` (new — HB1–HB4) |
| The census records + doc alignment | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `beauty-salon_SKILL.md` (v1.15.0), `docs/DEPLOYMENT.md` |
| The session record + plan + worklog | `docs/session_18.md` (proper record), `docs/remediation-plan-session-18.md`, `worklog.md` |
| Screenshots | `docs/screenshots/*.png` (re-captured) |

## 10. Push evidence (session 18)

- Committed to `main` and pushed via `docs/ssh_git_wrapper_v3.py` with `--remote git@github.com:nordeim/beauty-salon.git` (the paramiko shim per the runbook's Appendix A); key fingerprint verified pre-push; key materialized outside the repo and shredded after; remote == local verified byte-exact post-push. *(Executed — recorded in the worklog's final entry.)*
