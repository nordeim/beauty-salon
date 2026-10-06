I'll continue the task from where we left off. Let me start by checking the current workspace state and refreshing it.
The workspace exists with prior work. Let me check the git state and understand what's been done so far.
The repo is 2 commits behind origin. Let me pull the latest changes (which should include session_17 and the gap analysis doc).
Latest changes pulled successfully. Now let me set up the task plan and start the meticulous document review.
Now let me read the newest session documents first to understand the current state:
I now understand the state: Session 16 completed (199 tests green, pushed to main), and the owner has provided session_17 transcript + a gap analysis with findings F04, F05, F07 to validate. Let me read the core documents.
Let me read AGENTS.md in chunks directly:
Lines are very long. Let me use bash to read with line wrapping:
Now let me read CLAUDE.md and the session-16 documents:
Now let me check the worklog tail and verify the current environment state:
Session 16 is fully complete and pushed. Now I understand the Session 17 task: validate the gap-analysis findings (F04, F05, F07) against the codebase. Let me examine the relevant code areas:
Let me read the ICS file and confirmation page more carefully:
Now let me check the metadata/titles setup across routes and look at the e2e spec inventory:
Let me check the skills catalog and the reference site's SEO surface (sitemap, robots, titles):
The relevant skills exist (`code-review-and-audit`, `agent-browser`, `tdd`, `clone-app-pat-pro`). Now let me run the baseline gates to confirm the session-16 state:
单元测试通过 (66/66)。现在让我运行构建 + e2e 以完成基线验证：
**Baseline fully green**: lint ✓ · tsc ✓ · unit 66/66 · build 27/27 pages · e2e 133/133 = **199 total** — exactly the documented session-16 state, zero drift. Now let me load the agent-browser skill for live verification of the findings:
Now let me verify the live reference's SEO surface (sitemap, robots, title) — the F07 claims:
The live has both sitemap.xml and robots.txt. Let me get the complete list:
F07 confirmed: the live has a 12-URL sitemap (weekly, 1.0/0.8 priorities) + robots.txt. Now let me check the live's homepage title and the contact page (F04):
The live is a SPA — let me check its HTML shell and rendered title via browser:
F07's sitemap gap is confirmed. Now let me check what the session-15 "ICS negative pins" cover and how the no-params confirmation case behaves:
The no-params confirmation case is unpinned. Now let me verify the live's bare `/book/confirmation` behavior with agent-browser:
Logged into the live. Now let me inspect the live's bare `/book/confirmation` (no params):
**关键实时发现**：线上的无参数 ICS 携带 `DTSTART=DTSTAMP=now`、`DTEND=now+90min`、`SUMMARY="…— Appointment"` 以及 `DESCRIPTION="Reservation for you."`。让我检查一下线上的无参数卡片状态：
**Major divergence found**: The live's bare confirmation omits the "Reserved for" card entirely and renders "Thank you." (no name). Let me probe the live's conditional boundaries:
The live's conditional logic is emerging. Let me probe two more boundary cases:
The live's ICS fallback requires BOTH date+time; either missing → now-stamps. Now let me verify the live's /contact (F04) and its noscript block (F07):
The live /contact matches the clone's IA exactly. Now let me check the live's noscript block and then verify the local clone's SSR output:
No noscript on the live shell. Now let me verify the clone's SSR contact output by starting the standalone build server:
**F04 validated as NOT a codebase issue** — the clone's raw SSR HTML contains the full contact module. Let me check the head-parity spec's approach for raw-HTML pin precedent:
Let me check the confirmation-parity spec's card pin and look at the booking form's POST handler:
The appointments API already persists (F05's "persist submissions" is satisfied). Let me check the live's sitemap/robots headers and the existing screenshots convention:
Let me check the playwright config and global-setup to understand the e2e environment:
The e2e env doesn't set NEXT_PUBLIC_SITE_URL (falls back to :3000). Let me check the vitest config and the screenshot capture convention:
Let me find the exact screenshot capture commands used in prior sessions:
I now have complete validation of all findings. Let me write the session-17 remediation plan:
Plan saved. Now let me study the existing spec conventions before writing the new specs (T1 RED):
Let me check the live's sitemap tail bytes for the exact format, then write the new specs:
已捕获精确的字节格式（sitemap: 4/8 空格缩进，`</urlset>` 后无尾随换行符；robots: 无尾随换行符）。现在开始编写 T1 RED 规范：
Now the seo-parity spec:
Now the unit tests — first the seo builder contract:
Now the ics.test.ts fallback extensions:
Let me verify the ics.test.ts tail is clean:
RED confirmed, but there's a scoping bug (`base` is scoped to the first describe). Let me fix that:
**T1 红灯确认** — 5 个 ICS 回退测试 + seo 导入失败（模块不存在）；所有 66 个原有测试全部通过。现在，让我针对当前构建验证 e2e 红灯：
**T1 RED perfect**: CF1–CF4 + S1/S2 red, S3 (contact SSR guard) already green — exactly as the plan predicted. Now T2 GREEN — implementing the fixes. First the ICS fallback layer:
Now the confirmation page conditional rendering:
Let me update the ICS call comment in the page, then create the SEO lib:
Now the SEO lib (F07):
Now the two route handlers:
Now the playwright config env pin:
All T2 changes in place. Now run the unit tests (expecting GREEN):
Three test-side expectation errors (my bugs, not implementation bugs). Let me fix them:
Now fix the seo.test.ts prologue assertion:
**Unit GREEN: 80/80**. Now the build + full e2e gate:
The new routes are static-prerendered — the origin may be baked at build time. Let me verify what the prerendered output contains:
The static prerender baked the build-time origin. The routes must read the runtime env (force-dynamic) so the e2e origin pin and runtime deployments work:
CF1–CF4 now pass. S1/S2 still red — let me inspect the failure detail (likely a stale reused server):
The origin is still :3000. Let me check if a stale server is running or if the env is build-time inlined:
`.env` was copied into standalone output, and the earlier server may be stale. Let me kill it and re-run:
No stale server. Let me test the env flow directly — start the standalone server with the env var set:
The runtime env doesn't flow — NEXT_PUBLIC vars are build-time inlined. Let me confirm the mechanism with a quick experiment:
Definitive: the origin is **build-time inlined** (Turbopack inlines NEXT_PUBLIC_* in server bundles too). The correct architecture: static routes with the build-baked origin — mirroring the live's static files. Let me adjust:
Now revert the playwright config and update the spec's origin expectation:
Now rebuild and re-run the new specs:
**All 7 new e2e specs GREEN**. Now T3 — the full gate:
**T3 FULL GATE GREEN: 140/140 e2e**. Let me re-verify lint + typecheck + unit after all changes:
Full gate green: **lint ✓ · tsc ✓ · unit 80/80 · e2e 140/140 = 220 total**. Now T4 — screenshots. Starting the dev server:
01 captured. Continuing with the desktop captures:
08 and 09 are byte-identical. Let me re-capture 07 (map iframe likely needed more load time) and check 02's scroll convention:
Map loads fine (tile variance is network-dependent — not a regression). Continuing with mobile captures:
**10-landing-mobile byte-identical (350126B)**. Now the mobile menu:
**11-mobile-menu byte-identical (26124B)** — the mobile drawer shows zero drift. Continuing:
12-book-mobile byte-identical. Now finding the gallery lightbox trigger:
Now the confirmation capture (with-params — the parity-spec URL):
14 is close but not identical. Let me check capture stability and the dev-portal artifact:
The committed capture predates my session. Let me pixel-diff to find what changed:
Every pixel differs — likely a different page state entirely. Let me compare mean colors and structure:
Same rendering with sub-pixel gradient noise. Let me check if the prism-gradient is animated (timing-dependent):
Static gradient — the noise is backdrop-filter rasterization (glass card). The DOM contract is pinned green by the specs. Let me capture 15-not-found to finish:
Let me verify 02 and 15's diffs are benign (scroll-position/animation state, not content):
02 shows a different scroll convention (prior showed the dark footer). Let me fix 02 and investigate 15's localized diff:
15's diffs are thin text-rasterization bands (benign). Now re-capturing 02 with the prior scroll convention (bottom CTA + dark footer):
Let me analyze the committed 02's light/dark boundary to replicate the exact scroll:
The capture came out 577px (viewport glitch). Let me measure the footer position and replicate the committed scroll precisely:
The committed 02 is scrolled to the page bottom (footerTop−maxScroll = 429 exactly). Re-capturing with the correct viewport:
02 now matches the convention exactly. Let me verify all capture dimensions:
All dimensions correct. Let me check 02's remaining diff vs committed (should now be small noise):
02 now matches (0.2% pixel noise). T4 complete. Now T5 — documentation alignment. Let me examine the current docs' key sections:
Now let me make the README updates:
Now the README testing table row and AGENTS.md:
README done. Now AGENTS.md:
The edit glued the truncated tail incorrectly. Let me repair lines 46-48:
Now add the new spec contract lines to AGENTS.md testing conventions:
Now CLAUDE.md updates:
Now the PAD — let me find the layer sections and session ledger:
Now the SKILL.md update to v1.14.0:
Let me check SKILL.md's ICS section for the fallback documentation:
There's a glued remnant in the ics row. Let me fix it and update the e2e row with the new spec families:
Now enhance the .env.example with the build-time note:
Now the proper session_17.md record (replacing the owner's transcript):
Now update the remediation plan with executed results:
Now the worklog entry:
Now the final full gate re-verification (docs changed — the hygiene test scans them):
One test failed — the services innerText length. Let me inspect the failure:
The 4-char delta is the StatusPill day-change (Mon "Closed today" → Tue "Open today" ×2 = −4). Sessions 1–16 all ran on closed days. Let me check the hours logic:
Only this spec is day-flaky (first open-day the suite has ever run on). Let me fix it day-aware:
Day-aware fix verified. Running the complete final e2e gate:
**Final gate fully green: 220 total**. Let me document the day-flake discovery, then proceed to T6:
Now T6 — the push sequence. Let me read the SSH wrapper runbook:
The shim is deployed. Now the secret scan and commit:
Secret scan clean. Committing the session-17 deliverable:
Committed as `9f50f39`. Now the SSH push sequence — materializing the operator key and verifying the fingerprint:
Fingerprint matches the sessions 1–16 operator key record. Now the dry-run:
Dry-run clean. Executing the real push:
**Push verified byte-exact** (remote == local @ `9f50f39`), key shredded. Now the final worklog entry and the T6-executed docs follow-up commit:
All pushes verified. Let me finalize the todos and clean up:
**Session 17 complete** — all work committed and pushed to `main` (remote == local verified byte-exact, keys shredded).

## What was accomplished

I validated the owner's gap analysis against both the codebase and the live reference (logged in, measured):

- **F04 (contact visibility)**: Not a code issue — the raw SSR HTML carries the full module; now pinned with a crawler-visibility guard
- **F05 (scheduler)**: Real booking engine rejected per parity; but probing exposed a **genuine bug** — the no-params confirmation page diverged (comma artifact, empty card, malformed ICS). Fixed to the live's five-probe-measured fallback contract
- **F07 (SEO)**: Real gap — built the sitemap (12 routes, weekly, exact byte format) + robots.txt, with the build-time origin story
- **Bonus catch**: a calendar-surfaced test flake (the suite's first "open day") — made day-aware

**Gate: 220 tests green** (80 unit + 140 e2e); mobile-menu screenshot byte-identical (no Tailwind v4 regression); docs aligned to SKILL v1.14.0.

**Next steps**: consider a structured-data (JSON-LD) census or an HTTP-header census for the next session — both unmeasured layers adjacent to this SEO work.
