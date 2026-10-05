I'll start by internalizing this complex task and setting up a structured plan. This is a comprehensive codebase remediation task with very explicit instructions, so I'll proceed directly.
The workspace is a fresh git repo. Now let me clone the beauty-salon repository:
Repo cloned successfully. Now let me review the core documentation files:
Let me read the architecture document in sections:
Now let me read the beauty-salon_SKILL.md:
Core documentation reviewed. Now let me examine the session docs and worklog:
All session docs reviewed. Now let me validate understanding against the codebase:
Now let me validate key code files against the documented architecture:
Codebase matches documented architecture. Now let me set up the environment and run baseline verification:
The `.env` already carries `DATABASE_URL="file:../db/custom.db"` (the requested value — resolving against `prisma/schema.prisma` puts the db at the repo root's `db/` folder). Let me push and seed:
Database seeded at the repo root `db/custom.db`. Now running the baseline audit gates (Phase 1 + 4):
Build clean — 27 routes. Now the e2e baseline:
**Baseline fully green** — lint ✓ · tsc ✓ · unit 61/61 · build 27/27 · e2e 104/104 (165 total) — exactly matching the documented session-12 state. Now let me examine recent code changes and review the relevant repo skills:
Important finding — the last 3 commits (`330bdc3`, `3130c44`, `dceec22`) are post-session-12 owner commits including package.json changes. Let me examine those diffs:
Note: `start_server_log.txt` contains a committed real AUTH_SECRET — a security hygiene issue to flag in the audit. Now let me review the key repo skills:
Now let me run Phase 2 (security scan) of the audit and review the mobile-nav skill guidance:
Phase 2 findings registered — including a **new secret leak**: `start_server_log.txt` carries a real committed AUTH_SECRET. Now let me review the mobile-nav/Tailwind v4 skill guidance:
Let me verify the actual SiteHeader mobile drawer implementation and its parity spec:
SiteHeader matches the trap-4-safe documented pattern. Now let me clone the scandihaven reference repo and review its patterns:
The skills catalogs are essentially the same collection. Now let me read the agent-browser skill for the live parity verification:
agent-browser is available. Let me start the dev server and access the reference site:
Logged into the reference site. Let me capture the reference state and verify the mobile navigation:
Live mobile drawer contract verified — matches all pinned values (gap 8px, px-8, mt-10 40px, 48px serif, −1.2px tracking). Let me test drawer navigation behavior and check the reference for drift:
Live reference verified — no drift; parity contracts hold. Now let me verify the clone's mobile menu on the local dev server:
Clone drawer is byte-identical to the live reference. Let me verify tap-through navigation:
Mobile menu verified working on both sides. Now let me complete the Phase 3 audit checklist and check current screenshots/docs state:
paramiko 5.0.0 installed. Let me read the full shim implementation from Appendix A:
Now let me deploy the SSH shim (per the runbook) and then conduct the session-13 candidate audit — the keyboard/focus-ring census. First, the shim:
Shim deployed. Now the session-13 candidate audit — the keyboard/focus-ring census (both sides). Live reference first:
**Focus-layer divergence detected!** The live login shows a shadcn focus ring (slate-400 border + 2px offset ring); the clone shows none. Let me inspect the clone's LoginForm classes:
Both sides show focus rings — the earlier "none" was a live-CSSStyleDeclaration measurement trap. Let me do the precise focus census comparison:
The focus census begins. Let me systematically measure all focus surfaces on the live reference:
The `transition` class causes synchronous read artifacts. Let me redo the census with transitions neutralized:
Now the same census on the clone's /book:
/book focus parity is identical. Now the login focus census with the frozen-transition method, both sides:
Focus-ring divergences found on the login shell. Let me get the live's exact class lists to design the fix:
The input class strings are byte-identical — this is a **new Tailwind v4 engine trap** (same classes, different focus-ring color resolution). Let me verify the remaining details:
Marketing-surface focus parity is identical. Let me complete the census with the remaining login elements and drawer links:
Live drawer focus measured (UA default outlines). Now the clone:
Focus census complete — the only gap is the login shell's focus rings. Now let me check the second session-13 candidate (ICS edge dates):
The audit is complete. Let me validate the fix design against the existing specs before writing the remediation plan:
No conflicts with existing specs. Let me examine globals.css for the fix location:
The fix design is validated. Let me confirm the login main carries the font-shell scope:
All validated. Let me review the repo-hygiene test to extend it consistently:
Now I have everything needed. Let me write the comprehensive remediation plan:
Remediation plan saved and validated. Now executing **T1 (RED)** — writing the focus-parity spec:
Now the repo-hygiene secret scan extension and the ICS year-boundary test:
Let me fix the `require` usage with a proper ESM import:
Now the ICS year-boundary test:
Now running the RED phase — unit tests first (secret scan should be RED):
**RED confirmed** — the secret scan flags exactly the predicted file. Now the e2e RED phase against the pre-fix build:
The two guard failures are transition artifacts (reads during the 150ms border transition). Let me freeze transitions in the spec — matching the live-measurement method:
**RED confirmed exactly as predicted** — 4 actionable failures (F2×2, F3, F4), all guards green, and the class-census guard proves the classes are byte-identical (trap-9 premise). Now **T2 (GREEN)**:
Now the LoginForm button class fix:
Now the start_server_log.txt secret redaction:
All fixes applied. Verifying the unit layer first:
Unit 63/63 green. Rebuilding for the e2e GREEN check:
**GREEN — 10/10 focus-parity specs pass.** Now **T3** — the full gate:
**FULL GATE GREEN** — lint ✓ · tsc ✓ · unit 63/63 · build 27/27 · e2e 114/114 (**177 total**). Now **T4** — live re-verification of the fixed surfaces:
**Fixed focus rings verified value-by-value** — exact match with the live reference on every element. Now the drawer standing check and screenshots:
Drawer standing check holds. Now capturing the 15 canonical screenshots:
All 15 captured — and `11-mobile-menu-open.png` is **26124B, the byte-identical pixel-consistency signal** from every prior session. Let me verify:
Byte-identity confirmed — `11-mobile-menu-open.png` and `09-login-desktop.png` are unchanged from HEAD (proving the settled login rendering is untouched; only the focused state changed). Let me VLM-verify the two key changed captures per the repo convention:
The VLM shows the bottom CTA is below the fold — session-11's convention captures 02 scrolled to the CTA. Let me re-capture:
T4 complete. Now **T5 — documentation alignment**. Starting with README:
Now the README trap log and testing sections:
README aligned. Now AGENTS.md:
Now CLAUDE.md:
Now the PAD — version table, §7 inventory, and session-13 ledger:
PAD clean. Now the SKILL.md → v1.10.0:
Now adding the Appendix C session-13 row:
SKILL v1.10.0 complete. Now the proper session_13.md record:
Now updating the remediation plan with executed results:
Now the worklog entries:
Both worklogs updated. Now the final gate re-verification (docs changed since the last unit run — the hygiene test scans them):
Change set complete. Now **T6** — secret scan, commit, and push:
Secret fully purged. Committing:
Committed as `512814e`. Now the SSH push sequence per the runbook — key materialization and fingerprint verification:
**Fingerprint verified** — `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` matches the sessions 1–12 record. Dry-run next:
Dry-run clean (fast-forward `dceec22..512814e`). Real push:
**Remote == local verified byte-exact** (`512814e...`). Now shredding the operator key:
Push complete. Now recording the push evidence (the sessions 8–12 follow-up pattern):
**Session 13 complete** — both commits pushed and verified byte-exact, keys shredded. Final cleanup and verification:
Session 13 complete — all work committed and pushed to `main` (remote == local verified byte-exact, keys shredded).

**What this session found & fixed:**

1. **Focus-ring parity gap (the session-12 suggested candidate)** — a first-ever both-sides focus census found the login inputs rendering an ink ring where the reference renders slate-400, from *byte-identical class strings*: **a new Tailwind v4 engine trap (#9 — variant-ordering conflicts)**. Fixed via the auth-shell token scope; pinned by 10 new e2e specs.
2. **A committed real AUTH_SECRET** in `start_server_log.txt` — redacted (rotate your deployed instance's key) + a tracked-files secret-scan guard added.
3. **Mobile menu re-verified byte-identical** both sides @390×844 — no v4 regression (your emphasis).
4. Validated the owner's dependency bump (Next 16.3.8/Prisma 6.19.3) — full gate green: **lint · tsc · 63 unit · 27 pages · 114 e2e = 177 tests**.

**Suggested next steps:** visit `/login` and Tab through the fields to see the corrected focus rings, or review `docs/remediation-plan-session-13.md`. For a session 14, candidates: a print stylesheet census, or the newsletter `source: "homepage_15off"` payload registration.
