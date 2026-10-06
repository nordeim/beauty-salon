I'll continue with the multi-stage task. Let me set up a todo list and start by refreshing the workspace.
No existing repo in workspace — I'll clone it fresh.
Repo cloned on main. Now let me review the core documents.
All docs present. Reading the core documents now.
Let me read AGENTS.md directly in chunks.
Now reading README.md and Project_Architecture_Document.md.
Now reading the Project Architecture Document.
Now reading the beauty-salon_SKILL.md.
Core docs read. Now the status docs: session_20, remediation-plan-session-20, worklog, session_21.
Status docs read. The repo is at post-session-20 state (pill state-machine fix delivered & pushed). Now let me validate my understanding against the codebase.
The `.env` and `db/` are git-ignored (fresh clone). Let me examine the configs and session-20 code changes.
Codebase matches documented state. Let me check the repo skills catalog for the audit workflow.
Let me check the e2e global-setup and auth spec to understand env handling before creating the local `.env`.
Environment facts confirmed: e2e expects `NEXT_PUBLIC_SITE_URL=http://localhost:3000` baked at build and the default demo password (so local `.env` must NOT set `DEMO_USER_PASSWORD`). Setting up the environment now:
DB at repo root, seeded. Now running the baseline audit gate (Mode C — lint, typecheck, unit):
Lint ✓ · typecheck ✓ · unit 84/84 ✓. Now the build:
Build ✓ 29/29 routes. Now the e2e suite (158 specs):
**Baseline gate GREEN: 242 total** (lint ✓ · tsc ✓ · unit 84/84 · build 29/29 · e2e 158/158) — zero drift from documented session-20 state. Now auditing the recent (session-20) code changes:
Session-20 changes audit clean. Let me verify the current footer pill wiring and the screenshot-diff script:
All audited clean. Now the live-site census with agent-browser. Let me load the repo's agent-browser skill:
Deployment healthy. Now the key session-21 check — has the deployment been refreshed with the session-20 build (the pill state machine)? The raw HTML will tell (new build renders the pill text EMPTY pre-JS):
**Key finding:** The deployment HAS been refreshed with the session-20 build — the raw HTML shows the pill text span EMPTY (`<span></span>`, the new pre-JS static shell contract) and the footer carries the `/80+/70` pair. Session-20's suggested candidate (deployment-refresh verification of the pill) can now be executed. Let me census the deployed site with agent-browser:
**Deployment-refresh verification GREEN** — the deployed pill now shows the time-aware four-state machine ("OPENS TODAY AT 10:00", both header + footer instances agreeing, the footer /80 variant). Now the route census on the deployment:
All routes green. Now verifying the deployment's **live pill ticker** with a Date patch near the open boundary:
**Live ticker verified on the deployment** — after the clock patch crossed the open boundary, both pills flipped to "OPEN · CLOSES 19:00" within the 60s tick. Now the mobile navigation check (the standing emphasis) at 390×844:
Mobile drawer matches every pinned computed style (cream bg, 8px gap, 40px CTA margin, 48px Cormorant, −1.2px tracking, ink, z-60). Testing drawer navigation:
Drawer navigation works (→ /services, drawer closed). Now the login flow on the deployment:
Login works (deployed demo password honored), lands on `/` per the pinned contract, auth-neutral chrome intact. Now the booking happy path + ICS:
Still on /book — checking what happened:
The service select was empty (native validation blocked submit). Selecting a service and resubmitting:
Booking happy path works — full query string carried. Verifying the receipt + ICS download:
ICS verified — fixed 90-minute block (14:00→15:30), raw commas, 13-line contract. Now newsletter + gallery lightbox:
Newsletter success contract confirmed (CSS-uppercased "YOU'RE IN. CHECK YOUR INBOX…"). Now the gallery lightbox:
部署普查已完成 —— 全部通过。现在进行参考站点对比。根据任务要求，登录到参考站点：
Logged into the reference — post-login lands on `/` (the "dashboard" = the marketing landing, matching the pinned contract), and the reference pill also shows "OPENS TODAY AT 10:00" — identical to the deployment right now. Let me verify the reference's mobile drawer, then run the timezone sweep:
The drawer opened — I read the brand link (20px). Let me read the actual nav links (the 48px serif set):
Reference drawer matches the deployment (48px Cormorant, −1.2px tracking, 48px line-height, ink, 40px CTA margin) — mobile nav parity confirmed. Now the **pill timezone sweep** (session-20's suggested candidate 1) — the proper instrument is Playwright with `timezoneId` contexts:
The "ref==model: NO" is only the CSS-uppercased rendering (innerText) vs raw model text — semantically **5/5 TZ probes agree: reference == deployed clone at every timezone** (UTC before-open, Auckland/Tokyo/Sydney during-open, LA on its local Monday = closed). The pill's local-clock stance is confirmed as the reference's own behavior. Let me also do a quick landing innerText comparison (reference vs deployment):
**Landing innerText: reference = 2088 = deployment = 2088** — identical. Now checking the capture-diff gate on this fresh environment (the set was captured on the session-20 machine — the byte-determinism signal is environment-scoped):
**Capture-diff gate GREEN on this environment** (14/14 byte-identical) — the canonical set reproduces here. A few more deployment spot-checks (404 strip rule, login error card, unknown-service state):
404 strip rule holds (`nope/deep/path` — leading slash stripped, query excluded). Now the login error card:
Login error card verified ("Invalid email or password", the shadcn Alert contract). The census is complete — one actionable pin-gap found (the pill's timezone stance). Let me read the existing status-pill spec to design the new pin consistently:
The census is complete. Before writing the remediation plan, let me verify a latent e2e-hermeticity issue I spotted: the e2e global-setup seeds via `bun prisma/seed.ts`, and **bun auto-loads the repo `.env`** — so a `.env` matching the production one (which sets `DEMO_USER_PASSWORD="Abce1234"`) would seed the e2e DB with the wrong password and break `auth.spec`. Demonstrating the leak (RED evidence):
auth.spec unexpectedly passed — the reused server/DB may mask the leak. Let me check how seed.ts upserts the user:
The seed only creates the user if absent — the leak needs a **fresh** e2e DB. Re-demonstrating properly:
**RED evidence confirmed** — a production-shaped `.env` breaks the e2e suite on a fresh DB (finding F21-B: e2e hermeticity leak). Now let me prototype the timezone pin spec before writing the plan (plan-vs-codebase validation):
Prototype GREEN — the composition works. Now validating the pin catches a real regression (sabotage: UTC methods in statusForNow):
The sabotage didn't fail because **e2e runs the standalone build** — I must rebuild after the code change. Redoing properly:
Validation cycle complete: **GREEN** (current code holds the stance) + **RED** (UTC-sabotaged build fails both specs — the pin guards a real regression). Working tree clean. Now writing the session-21 remediation plan:
Plan saved. Executing **T1 — the timezone pin** (SP9/SP10):
T1 done. Now **T2 — the global-setup hermeticity fix**:
Now verifying T2's GREEN proof — re-run the exact RED scenario (fresh `db/e2e.db` + production-shaped `.env`):
**T2 GREEN proof complete** — the exact RED scenario (fresh DB + production-shaped `.env`) now passes 10/10. Now **T3 — the full gate**:
**T3 full gate GREEN: 244 total** (e2e 160/160 — SP9/SP10 in). Now **T4 — canonical capture + diff gate** (the repo's screenshot convention — standalone build, never dev server):
T4 GREEN — 14/15 byte-identical (07-contact re-captured: the documented map-noise class). Now **T5 — documentation alignment**. Updating README first:
README done. Now AGENTS.md:
Now CLAUDE.md:
Now the PAD — updating the verification ledger and testing table:
The unicode escapes landed literally — fixing:
PAD fixed. Now SKILL.md → v1.18.0:
SKILL.md → v1.18.0 done. Now the proper session-21 record (replacing the raw transcript in `docs/session_21.md`):
Now updating the remediation plan's ToDo list with executed results:
The first edit applied; the plan has no §10 yet. Adding the push-evidence section:
Plan updated. Now appending the session-21 entry to the repo worklog:
Writing the outer worklog, then running the final gate re-verification (docs changed — the hygiene test scans them):
Final gate green (84/84 — the hygiene test scans the changed docs). Change set is complete. Now **T6 — the push sequence**. Reading the SSH wrapper runbook:
Runbook internalized. Executing the T6 sequence — secret scan first, then key materialization:
All scans clean; paramiko 5.0.0 installed. Materializing the operator key and deploying the shim:
Fingerprint matches the sessions 1–20 operator key record (`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`). Deploying the shim:
Shim deployed. Now the atomic commit to main:
Commit `c9d0122` created. Now the dry-run, then the real push:
**Push verified** — remote `refs/heads/main @ c9d0122 == local HEAD`. Independent re-confirmation + key shred:
Push complete, key shredded, remote == local at `c9d0122`. Recording the final worklog entry and the push evidence in the plan:
The push-evidence follow-up needs its own commit (the established convention). Verifying the gate on the doc-only change and pushing:
Both pushes verified byte-exact. Finalizing the outer worklog and closing the browser session:
Session 21 complete and pushed. Here's the wrap-up:

## What was done

**Audit (all green):** Fresh clone validated against every documented contract — baseline gate 242 total, zero drift. The **live deployment was walked end-to-end with agent-browser**: it now runs the session-20 build (the pill's four-state machine + **live minute-tick flip verified on production**), and every functional surface works — a production-ready superset with visual parity (landing innerText 2088 == 2088, drawer styles pinned both sides).

**Two remediations (TDD):**
1. **F21-A pin-gap** — a 5-timezone sweep proved the pill reads the visitor's *local* clock (reference == clone at every TZ, LA day-boundary crossing included) → pinned as SP9/SP10, validated GREEN + sabotage-RED
2. **F21-B real latent bug** — bun's `.env` auto-load leaked `DEMO_USER_PASSWORD` into the e2e seed (a production-shaped `.env` broke auth.spec on a fresh DB, demonstrated RED) → fixed in global-setup, re-verified GREEN

**Delivered:** full gate **244 total** (84 unit + 160 e2e), canonical screenshots re-captured with the diff gate green, docs aligned to SKILL v1.18.0, and both commits (`c9d0122` + the evidence follow-up `aabf69f`) pushed to main via the SSH wrapper with byte-exact remote verification and keys shredded.

**Suggested next:** the pill is now fully pinned across time, day, and timezone — the strongest remaining candidates are a reference-drift watch (automated probes between sessions) and re-verifying the ICS contract after any reference-side platform update.
