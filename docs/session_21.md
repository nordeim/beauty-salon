I'll continue with the task. Let me set up a task list and start by refreshing the workspace.
The workspace exists. Let me refresh it with git pull and check its current state.
Pull succeeded — `docs/session_20.md` was added. Now let me review the repo structure and core documents.
Now let me read the core documents in parallel.
The file has very long lines. Let me read it via bash in chunks.
Now let me read README.md and Project_Architecture_Document.md.
Now the Project Architecture Document and beauty-salon_SKILL.md:
Now let me read the beauty-salon_SKILL.md and the session status documents.
Now let me check the outer worklog and the repo skills catalog:
The SSH shim exists. Now let me check the repo skills catalog:
Environment verified. Let me validate my understanding against the codebase — package.json, configs, and recent session-19 changes:
Configs verified. Now let me update the todo list and run the baseline audit gate (Mode C):
Lint ✓ · typecheck ✓ · unit 80/80 ✓. Now the build:
Build ✓ 29/29 routes. Now the e2e suite (150 specs — this takes a while):
**Full baseline gate GREEN: 230 total** (lint ✓ · tsc ✓ · unit 80/80 · build 29/29 · e2e 150/150) — exactly the documented session-19 state, zero drift. Now let me audit the session-19 code changes:
Session-19 changes audited clean. Now the **new session-20 work**: the deployed-site census. Let me check the live deployment at `https://beauty-salon.jesspete.shop/`:
Deployed site is healthy — sitemap carries the correct canonical origin. Let me census all routes on the deployment:
Routing behaviors verified on the deployment. Now let me use agent-browser for the visual/functional census:
The deployed landing page renders the full marketing surface. Now the mobile navigation check (the task brief's standing emphasis):
The mobile drawer opens correctly on the deployment. Let me verify computed styles and drawer navigation:
Drawer styles match (bg, 40px CTA margin, 48px Cormorant, -1.2px tracking, ink color). Let me verify the gap-2 flex column and test drawer navigation:
Drawer navigation works — `/services` reached, drawer closed. Mobile nav is fully working on the deployment. Now the login flow:
Login works on the deployment (demo user `Abce1234` per the deployed `.env`) and lands on `/` — matching the reference. Now the booking flow:
The booking POST + confirmation navigation works (fire-and-forget contract held). The empty `date=&time=` suggests my direct `.value` set didn't reach React state — let me redo properly with native setters to verify the happy path:
Happy path confirmed — full query string carried. Let me verify the confirmation receipt + ICS download:
Full receipt + ICS 90-minute block verified on the deployment. Now the newsletter and gallery lightbox:
Newsletter success contract confirmed (CSS-uppercased rendering). Now key computed-style pins on the deployed site — login font context and 404:
Deployed site matches all pinned contracts (login font context, 404 with F19-C fix live, slate pins). Now the **reference-site pin-revalidation sweep** (session-19 candidate 1) — re-measuring the highest-risk pins against the live reference:
Logged in to the reference. Now the pin-revalidation sweep — first the 404 path-interpolation edge matrix:
404 edge matrix re-verified — matches the F19-C pins exactly. Now the ICS byte-format re-measurement:
The reference SPA reset my programmatic name/email values. Let me use proper typing via fill:
ICS byte-format re-verified — matches the pinned 13-line contract exactly (raw commas, no STATUS/TRANSP, 90-min block). Now the innerText censuses:
The reference services innerText measures 1466 chars vs the pinned 1942. Let me check what exactly the pin measures:
The pin measures `document.body.innerText` (full body). Let me re-measure correctly:
Reference measures 1958 vs clone's 1938 (the pinned open-day value). Let me find the exact delta:
The reference pill shows "OPENS TODAY AT 10:00" — a time-of-day variant. Let me check the clone's StatusPill states:
This is a real divergence signal — the reference pill is time-aware ("OPENS TODAY AT 10:00" before opening), the clone's is day-only. Let me check the existing pins:
The pins only cover day-awareness — the reference's time-of-day states were never measured. Let me find the reference pill's DOM and build a clock-controlled census:
**MAJOR FINDING (F20-A)**: The reference's StatusPill is a full **time-aware state machine** — live-measured with controlled clock probes:

| Time condition | Reference pill text | Clone pill text (day-only) |
|---|---|---|
| Before open (open day) | `OPENS TODAY AT 10:00` | `OPEN TODAY` ❌ |
| During open hours | `OPEN · CLOSES 19:00` | `OPEN TODAY` ❌ |
| After close (open day) | `CLOSED FOR THE DAY` | `OPEN TODAY` ❌ |
| Closed day (Sun/Mon) | `CLOSED TODAY` | `CLOSED TODAY` ✓ |

Let me capture the raw (pre-CSS-uppercase) text and the /services body census:
Raw text confirmed: "Opens today at 10:00" with identical pill classes. Let me capture all four states' raw texts exactly:
Complete state machine mapped. Now let me test whether the reference updates the pill **live** at time boundaries (Playwright clock API):
The pill flips **live** at the open boundary but apparently not at close. Let me verify with finer steps to rule out fastForward artifacts:
**Both boundaries flip live** — the reference pill is a minute-level interval-driven state machine (the earlier non-flip was a coarse fastForward artifact). Now let me continue the pin-revalidation sweep on the href censuses:
Let me re-verify the href censuses on the reference and the deployed clone:
Href censuses re-verified — identical. Let me confirm the pill gap is live-observable on the deployed clone right now:
Confirmed — the deployed clone shows "Open today" at 03:22 UTC while the reference shows "Opens today at 10:00". **F20-A is a live-observable parity gap.** Let me finish the sweep with the remaining text-format pins:
All text pins re-verified (login error, newsletter success). Let me check the reference's header pill mobile-visibility classes vs the clone's:
The pill gap is confirmed everywhere. Let me measure the reference's tick granularity precisely (15s vs 60s interval):
I now have the complete picture. Let me check for any other innerText-length pins affected by the pill change:
The footer's pill is a server component (build-time-baked) — but the reference's footer pill is live. Let me verify this second facet of the gap on the deployed site:
Both pills are live and time-aware on the reference; both are day-only on the clone. Let me verify the reference footer pill's color classes for the variant:
A second micro-finding: the reference footer pill carries `text-background/80 text-background/70` (computed alpha 0.8) vs the clone's `/70` (0.7). Let me check the reference's contact-page pill too:
Let me empirically check v4's utility ordering for same-utility-different-modifiers in the deployed CSS:
v4 compiles same-utility modifiers in ascending order — `/80` would win, matching the reference's computed 0.8. All findings are now mapped. Let me check the repo-hygiene test constraints before writing the plan:
Hygiene constraints understood (no secrets in docs; script refs must resolve). Let me read the current hours unit test to plan the TDD extension:
Now let me write the session-20 remediation plan:
Plan saved. Now **T1 — the unit RED phase** (statusForNow contracts before implementation):
Now run the RED phase — the tests should fail (module-level RED: `statusForNow` doesn't exist):
**RED confirmed** — 5 failed (statusForNow doesn't exist). Now the GREEN phase — implement in `hours.ts`:
**T1 GREEN** (8/8). Now **T2 — the StatusPill component** with the live ticker and variant prop:
Now the SiteFooter swap — replace the inline pill markup + FooterStatus with the live client island:
Wait — `cn()` uses tailwind-merge which would **collapse the /80+/70 pair** (conflict resolution keeps only the last). Let me fix with plain concatenation to preserve the pair byte-exactly:
Let me verify lint + typecheck on the T2 changes:
As expected — links-parity still imports `statusForDay`. Now **T3 — the time-aware innerText census**:
T3 done. Now **T4 — the new status-pill-parity spec** (the state-machine pin):
The multiline parameter lost its `=>`. Let me fix:
Gates clean. Now rebuild and run the new spec (T4):
5 failed / 3 passed — the RED phase is revealing behavior. Let me examine the failures:
The failures reveal the real issue: React's hydration **keeps the server-baked text** inside `suppressHydrationWarning` (the static shell bakes the build-time state), and the 60s ticker never fires within the poll window. SP1/SP5 passed only because the fake state coincided with the build-time state. The fix: the **NotFoundBody pattern** — `useSyncExternalStore` with a stable server snapshot (`""`) and a minute-tick subscription, so React's post-hydration store check adopts the client-clock state immediately:
**All 8 SP tests GREEN.** Now the full e2e suite to check for regressions:
**Full e2e suite GREEN: 158/158** (150 + 8 new SP specs) — every pre-existing contract held. Now the complete gate:
**T5 full gate GREEN: 242 total** (lint ✓ · tsc ✓ · unit 84/84 · build 29/29 · e2e 158/158). Now **T6 — the capture-diff gate script**:
Let me clean up the import structure:
Now let me check the capture script's waiting convention (the pill must be post-hydration in captures):
The capture waits ensure post-hydration state. Now re-capture the canonical set with the remediated build:
9 captures changed (exactly the pill-bearing pages; `/book`, `/login`, mobile shots carry no visible pill). Now validate the diff gate GREEN against the fresh canonical set:
Let me validate the drift detection actually fails on a corrupted byte (then restore):
The drift detection works — the "EXIT: 0" is `tail`'s exit code, not the script's. Let me verify properly:
Exit 1 confirmed. Now restore the canonical set:
**T6 complete** — the tripwire validates both GREEN and RED. Now **T7 — documentation alignment**. Starting with README:
Now AGENTS.md:
Now CLAUDE.md:
Now the PAD:
Now the SKILL.md → v1.17.0:
Now the proper session-20 record (replacing the owner's raw transcript):
Now update the remediation plan with executed results:
Now append the session-20 entry to the repo worklog:
Now the final gate re-verification (the hygiene test scans the changed docs):
The change-set is complete. Now **T8 — the push sequence**. First, the runbook and secret scan:
Secret scan clean. Now the atomic commit to `main`:
Commit `494b2d6` created. Now materialize the operator key and verify the fingerprint:
Fingerprint matches the sessions 1–19 operator key record. Now the dry-run:
**Push verified** — remote @ `494b2d6` == local HEAD. Now the independent re-confirmation and key shred:
Push verified byte-exact, key shredded. Now the T8 evidence documentation follow-up (the established convention):
All pushed. Let me record the outer worklog and finalize:
## Session 20 — Delivered & Pushed ✅

**Audit & Verification (all green):**
- Baseline gate on the pulled state: lint ✓ · tsc ✓ · unit 80/80 · build 29/29 · e2e 150/150 = **230 total** — zero drift; environment checklist verified (`.env` DB path, `db/` at root, vitest + playwright, `.env.example`)

**The deployed-site census (the new task-brief element):** `https://beauty-salon.jesspete.shop/` verified **functionally complete end-to-end** — all routes, proxy rewrites, canonical-origin sitemap/robots, the mobile drawer at its pinned computed styles (**zero Tailwind v4 regression**), login, booking + ICS, newsletter, lightbox. It is a production-ready superset of the reference.

**The headline finding (pin-revalidation sweep, controlled-clock measurement):** the reference's StatusPill is a **time-aware four-state machine** ("Opens today at 10:00" / "Open · closes 19:00" / "Closed for the day" / "Closed today") that flips **live at minute granularity** — the clone's pill was day-only, live-observable on the deployment. **Fixed via TDD** (RED→GREEN): `statusForNow` + the `useSyncExternalStore` minute-tick store on every chrome instance, the footer's live island with the reference's own `/80+/70` class pair.

**Also delivered:** the capture-diff regression gate (`screenshot-diff.mjs`, validated GREEN + RED) + the re-captured canonical set.

**Final state:** gate **242 total** (158 e2e), docs aligned to SKILL v1.17.0, committed `494b2d6` + `584b275` and pushed to main via the SSH wrapper (remote == local verified byte-exact, keys shredded).

**Suggested next:** redeploy the site with this build and re-check the pill on production (it should now show the four states + live flips); consider a timezone sweep of the pill as the next census candidate.
