I'll continue the task from where we left off. Let me start by checking the current workspace state and refreshing from the remote.
The workspace has been reset — no beauty-salon repo locally. I'll clone it fresh and check the uploaded files.
Clone successful. Let me set up the task plan and review the repo state.
Repo is at session 12 state — sessions 1-11 all completed and pushed. Let me read the key session documents.
Session 11 is complete and pushed. Now let me review the remediation plan and worklog.
Now let me read the five core documents.
文档与 session-11 状态一致（v1.8.0，153 项测试）。现在让我对照代码库验证理解并检查 skills 目录。
Structure verified — matches documented architecture. The `db/` folder is empty (git-ignored, fresh clone). Let me set up the environment.
Database seeded. Now let me run the baseline audit gates (Phase 1: lint + typecheck).
Phase 1 clean. Now Phase 2 (security) + Phase 4 (unit tests).
Unit 61/61 ✓, advisories unchanged (accepted-risk). Now build + e2e baseline.
**Baseline fully green** — lint ✓ · tsc ✓ · unit 61/61 · build 27/27 · e2e 92/92 (153 total), exactly matching the documented session-11 state. Now let me load agent-browser for the live parity work.
Now let me start the dev server and check agent-browser availability.
Dev server up. Now let me open the live reference and log in.
Logged in — redirects to `/` (consistent). Now the session-12 sweep: the **form-control/placeholder census** (the session-11 suggested candidate). Let me first find all form-bearing routes on the live side.
Live census captured. Now the local side.
**Census diff found divergences!** (1) Local newsletter input carries `aria-label="Your email"` (live has none); (2) live `/book` textarea has `resize-none` — local lacks it. Let me verify both in detail.
Live newsletter input is fully unlabeled (no label/aria-label/labelledby) — the clone added an aria-label. Let me check how the local code and the accepted-divergence register document this.
The newsletter aria-label belongs to the documented invisible-a11y family. The real finding is the **`resize-none` divergence** on the booking textarea. Let me deepen the census — select options and computed styles.
Select options identical. Now computed styles for the book form controls both sides.
**Key findings**: (1) textarea `resize: vertical` local vs `none` live — F1 confirmed; (2) date/time input heights differ (live 48/48 vs local 46/47); (3) font-family string carries the next/font fallback artifact. Let me investigate the date/time height delta.
Same classes but live date/time are 2px taller (48 vs 46). Let me inspect the picker indicator and parent structure.
The indicator mirrors the height — need the root cause. Let me empirically test the font-stack hypothesis on the local date input.
Font stack isn't the cause. Let me probe the date input's inner value pseudo-element metrics.
Live clientHeight=46 + border 2 = rect 48; local rect=46. The live date input content is 2px taller. Let me dump the live date input's full HTML + inline styles.
Live height = padding + border + lineHeight + 2px consistently. Let me find what adds 2px — testing candidate drivers on local.
clientHeight is 46 on live too — the 48 rect may come from a transform or indicator overflow. Let me check offsetHeight vs rect and transforms.
Layout-level difference confirmed (no transforms). Let me test whether font-size drives the live's extra 2px.
A constant +2px on live date/time inputs. It must be a CSS rule in the live's stylesheets. Let me hunt for it.
No author rules for date inputs on live. Let me do a full computed-style diff between live and local date inputs — systematic approach.
The live's used height is 48px with identical paddings. Let me get the full diff properly.
All properties identical except height + font-family. Let me run one clean cross-test: force Arial on live's fresh date input; force live-stack on local's.
Font isn't the driver. Let me test a bare date input (no classes) appended to both pages — isolating page context.
Bare inputs identical. Controlled experiment: fresh bare inputs with each side's exact font stack + the app's box metrics.
Same on local: 46 with any stack. Now the same controlled experiment on the LIVE page.
**Breakthrough** — fresh bare inputs measure 48 on live page vs 46 on local page with identical metrics. Page-level driver. Checking color-scheme and root styles.
Same browser/DPR/viewport. An `!important` stylesheet rule could beat inline styles. Let me re-hunt stylesheets without the length filter.
No matching rules at all. Let me dump the full computed style of the FRESH input on both pages and diff every property.
Fresh input diff: `display` — inline (live) vs **block (local)**! A local stylesheet rule overrides display on inputs. Let me hunt the LOCAL stylesheets.
The hunt missed nested rules (@layer blocks). Let me recurse into group rules on the local page.
Display is likely a red herring for height. Let me isolate: fresh inputs with ONLY box metrics (no font props) on both pages.
Isolated: `box+font(14px/20px)` → live 48, local 46. Let me split font-size vs line-height.
Live's date content height = line-height + 2px; local's = exactly line-height. The inner editor must be styled on live. Recursive hunt on the LIVE page now.
No author CSS explains it. Critical control: I've been testing the local **dev** server — let me check the production standalone build (the real parity target).
Production build confirms both findings (date 46 vs live 48; time 47; textarea resizable). Let me test if `::-webkit-date-and-time-value` padding 1px 0 replicates the +2px on local.
**Replication found**: `::-webkit-datetime-edit { padding: 1px 0 }` → 48/48. Let me find where the live gets it — checking for CORS-blocked stylesheets.
Only one same-origin stylesheet (913 rules) — but let me grep the raw CSS file directly to be certain.
Live CSS has zero datetime rules. Let me re-verify the Arial override carefully — does it reach the inner edit?
Font reaches the edit but height stays 48. Decisive cross-check: open the LOCAL app inside the LIVE session (same browser context).
Local app in live-session browser still measures 46 — the cause is IN the live page itself. Checking shadow DOM.
Not shadow DOM. Full computed diff of the `::-webkit-datetime-edit` pseudo both sides.
The live's exact mechanism is unattributable to any author CSS — but the visual contract is measurable (48/48 vs 46/46.7) and replicable. Now let me complete the census: the labels + validation states on /book.
Labels match (trailing-space artifacts are the documented inert family). Now the second candidate: the newsletter POST surface. Let me watch the live's network on newsletter submit.
**Major finding** — the live's newsletter success message differs from the clone's! Let me extract the exact live contract.
**F3 confirmed** — the live's success state: lucide `Check h-4 w-4` + "You're in. Check your inbox for your 15% code." in sage `inline-flex` row. The clone renders entirely different text/markup. Let me check the live's JS bundle for the error path too.
**The live's full newsletter contract extracted** — states idle/loading/success with `catch → success` (NO error state), "Sending..." loading text, arrow icon always rendered, payload `{email, source: "homepage_15off"}`. Let me see the local's full file.
All divergences confirmed. Let me check the local's newsletter section wrapper (Reveal parity) in the landing page.
The live uses framer-motion reveals (duration 1s, delay .15). The local's 100ms vs 150ms delay delta is a transient INFO item. Now the booking form's error/POST behavior on the live — extracting its handler from the bundle.
**F4 found** — the live's booking submit swallows all errors (`catch {}`) and **always navigates** to the confirmation. Let me check the local's handler.
The local surfaces API errors; the live always navigates (fire-and-forget). Let me check the local's date/time input attributes and button loading text.
Now the live's booking button loading text + icon behavior from the bundle.
The live's booking button: "Reserving..." + icon always shown. Same pattern family. Now the login error path on the live — extracting its handler.
The live login is platform infrastructure (Tailwind CDN + separate shell). Let me test its wrong-password error UI directly.
**Live login error**: shadcn Alert toast (`bg-red-50/70 border-red-200 rounded-xl`, red-700 text, `role="alert"`) in the Notifications region. Let me check the local's login error UI.
Local: inline red text in form. Live: a red Alert toast. Let me measure the toast's position visually.
The live's login error is a red Alert card above the Sign In button. Let me also check the live login button's loading state from the platform bundle.
Local: "Signing in…" with inputs enabled. Live: "Signing in..." with inputs disabled. Let me also check the live's Forgot password click behavior.
Forgot/Sign-up buttons are inert on live (documented stance holds). Let me verify the newsletter input height both sides, then compile the findings.
Newsletter input identical. Now the standing mobile drawer check @390×844 both sides (the task brief's emphasis).
Drawer verified identical both sides — no v4 regression. Now let me measure the live login error card's computed colors (trap-6 check for the red scale).
Live error card: `rgba(254,242,242,.7)` / `rgb(254,202,202)` / `rgb(185,28,28)` — v3 sRGB reds. Let me check the current globals.css slate-pinning pattern.
The plan is shaping up. Let me check which existing specs touch the surfaces I'll change (conflict check).
The API's 401 message has a trailing period the live lacks. Let me check the booking specs for error-path tests before finalizing the plan.
The API test posts directly (no UI) — no conflict. I now have the complete findings register. Let me write the remediation plan.
Plan saved. Now T1 (RED) — let me study the existing spec conventions first.
Conventions clear. Now writing the form-parity spec (T1 RED).
Now the RED run against the pre-fix build.
RED confirmed — 10 failed. The newsletter guard failure is likely a spec-side regex order issue. Let me check.
Spec-side shaping needed (class order). Fixing.
**RED confirmed exactly as predicted**: 9 failed (F1–F9 all actionable) + 3 guards green, after one spec-side shaping. Now T2 (GREEN) — applying the fixes.
BookingForm done. Now the NewsletterForm rewrite (F3, F4, F8).
Now the LoginForm fixes (F6 Alert card + F7 loading state).
Now the API message fix + globals.css (red pinning + datetime-edit rule).
Now the datetime-edit rule — let me find the right spot in globals.css.
Now the landing.spec.ts text correction (the session-5 precedent).
All fixes applied. Early verification: lint + typecheck.
One tsc error in the spec — fixing the type cast.
Build clean. Now the GREEN check on the new spec.
10/12 green. Two remain — let me inspect both failures.
F2 returned null for `input[type=text]`, and F6's class regex misses `text-red-700` (it's on the inner div). Let me check the spec source.
`input[type=text]` matches nothing — React omits the default `type="text"` attribute! Let me confirm the live's name input too (attribute parity).
Confirmed — attribute parity holds (React omits it on both sides). Two spec-side shapings needed: positional locator for F2, correct class regex for F6.
**GREEN — 12/12.** Now T3: the full gate — unit tests + complete e2e suite.
**FULL GATE GREEN** — lint ✓ · tsc ✓ · unit 61/61 · build 27/27 · e2e **104/104** (165 total). Now T4: live re-verification. Restarting the dev server fresh.
F1+F2 verified. Now the newsletter success contract on the fixed build.
F3 verified value-by-value. Now the login error card (F6) + loading (F7).
F6 verified (oklab trap-7, exact rgb border/text, 54px, above button). Now F7/F8 loading states via route interception.
F7 verified. Now F8 (newsletter loading) and F9 (booking loading).
All loading/success/error states verified. Now the screenshot re-capture — checking the canonical set first.
Re-capturing the canonical 15 on the remediated build — desktop set first.
15/15 captured — mobile-menu 26124B **byte-identical** (the pixel signal holds). But 03 and 13 have big size deltas — let me verify their dimensions/state.
03 needs the full-page capture (session-11 convention). Let me redo 03 and verify 13's lightbox state.
Now VLM-verifying the key captures with constrained prompts (the documented failure-mode handling).
VLM gives ambiguous reads on 13/14 — the documented failure mode. Let me verify via DOM state directly.
The policy link is confirmed in the DOM (the VLM misread the 12px arrow — the documented failure mode). Now let me re-verify capture 13 with a pixel-level check.
The lightbox has no `role=dialog` — my earlier compound selector matched `.fixed.inset-0`. Re-checking.
The first `.fixed.inset-0` match is the hidden drawer — the lightbox is the `z-[70]` one. Checking properly.
My click hit the hidden menu button — the earlier 13 capture had no lightbox (the VLM was right). Clicking an actual tile now.
Capture 13 pixel-verified (dark backdrop corners). One more constrained VLM check — 02's services CTA.
**T4 complete.** Now T5: documentation alignment. Starting with README.
Partial state — the badge and feature row applied. Finishing the remaining two edits.
README aligned. Extending the trap-6 line for the reds, then AGENTS.md.
Now AGENTS.md — the new invariants + contract line + quirk.
Now CLAUDE.md — counts + the parity list.
Now the PAD — §7 inventory + session-12 ledger.
Now beauty-salon_SKILL.md → v1.9.0.
SKILL.md v1.9.0 done. `.env.example` unchanged (truthful — no env changes). Now the proper session-12 record.
Now the remediation plan's executed results.
Now the worklog entry.
All docs aligned. Now T6: the push sequence. First, a final gate re-confirmation (docs changed since the last unit run — repo-hygiene scans them).
Change set reviewed — 27 files (09/10/11 screenshots byte-identical, skipped by git). Now the secret scan.
The single match is the documented scan-description prose — clean. Committing now.
Committed as `8e15453`. Now the SSH push — materializing the operator key and verifying the fingerprint per the runbook.
**Fingerprint verified** — matches the sessions 1–11 record. Now the wrapper push (dry-run first).
Dry-run clean (`da96302..8e15453` fast-forward). Real push now.
**Push verified** — remote main @ `8e15453` == local HEAD. Independent re-confirmation + key cleanup.
Remote == local confirmed byte-exact, key shredded. Now the follow-up commit recording the push evidence (the sessions 8–11 pattern).
Now the follow-up commit + push (re-materializing the key for this push only).
**Follow-up push verified** — remote @ `5715776` == local, byte-exact. Final cleanup and verification.
**Session 12 complete** — all work committed and pushed to `main` (`8e15453` + `5715776`, remote == local verified byte-exact, keys shredded).

**What this session found & fixed** (the first-ever both-sides **form-control census** + the **POST-failure states** — the two session-11 suggested candidates):

1. **Newsletter success state** — was entirely clone-authored; now the live's sage row with the lucide Check icon and "You're in. Check your inbox for your 15% code."
2. **Fire-and-forget forms** — the reference's deobfuscated bundle swallows POST failures (newsletter `catch → success`; booking always navigates); the clone's error UIs removed, API validation retained.
3. **Login error** — now the reference's red shadcn Alert card (reds pinned to sRGB, trap 6); "Signing in..." with inputs disabled while loading.
4. **Date/time inputs** — the live's unattributable +2px height replicated via `::-webkit-datetime-edit` padding (48 vs 46).
5. **Notes textarea** `resize-none` + ASCII-dot loading texts with always-rendered arrows.

**Gate:** lint ✓ · tsc ✓ · unit 61/61 · build 27/27 · e2e **104/104 (165 total)** · drawer verified both sides @390×844 (no v4 regression) · 15 screenshots re-captured (mobile-menu byte-identical).

**Suggested next steps:** visit `/` and subscribe to the newsletter to see the new success state, or try a wrong password on `/login` for the red Alert card. If a session 13 is desired, candidate directions: a keyboard/focus-ring census (Tab order + focus-visible styles both sides), or the confirmation page's ICS download under edge dates (year boundaries, DST).
