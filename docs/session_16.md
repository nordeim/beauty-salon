工作区已被重置 — 本地不存在仓库。让我来克隆它：
仓库已成功克隆。现在让我阅读核心文档。从 AGENTS.md 和 CLAUDE.md 开始：
AGENTS.md 读取完毕 — 一个成熟的 parity-clone 仓库。现在正在读取 CLAUDE.md 和 README.md：
现在让我阅读会话状态文档——session_15（最新）、session_14 以及补救计划：
session_15.md 显示了上一次会话已完成的工作（wire-payload + print census，session 14 的计划已完全执行并推送）。让我阅读 session_14.md 和 remediation-plan-session-14 以了解相关惯例：
惯例现在已明确：`session_15.md` 保存了上一次会话的原始记录（我的简报）。让我阅读一下 `remediation-plan-session-14.md` 和工作日志的末尾：
现在让我检查一下工作日志（末尾是最新的部分）：
已确认第 14 次会话已完全交付并推送。现在让我查看大型架构和 SKILL 文档（策略性阅读）：
现在让我检查 SKILL.md 的项目状态和技能目录：
知识已内化。现在让我对照代码库验证我的理解 —— 检查 `.env`、`package.json`、代码结构以及环境状态：
全新克隆 — 需要进行环境配置。让我先验证 session-14 的代码状态（wire payloads），然后配置环境：
Session-14 状态已确认。现在正在配置环境 —— 创建 `.env`、`db/` 文件夹并安装依赖：
数据库已按记录状态填充（8/3/12/4/1）。现在运行 baseline Phase 1+4 门控：
Build green — 27/27 pages. Now the e2e baseline (119 specs):
**基线完全通过** — lint ✓ · tsc ✓ · unit 63/63 · build 27/27 · e2e 119/119 = **182 个总计** — 正好是已记录的 session-14 状态。让我把进度记录到 worklog 并运行审计的第 2+3 阶段：
审计第 2+3 阶段符合已确定的噪声登记册。现在让我检查一下用于实时在线一致性验证的 agent-browser 技能：
agent-browser v0.38.1 available. Let me log progress to the worklog and start the dev server:
Dev server is up. Now the live parity verification — logging into the reference site:
已成功登录 — 重定向至 `/`。让我检查一下 `dashboard` 参考图像并进行对比：
The reference's post-login surface is the marketing landing (the app itself). Now the standing checks — mobile drawer @390×844 on the live side first:
错误的选择——获取到了页眉元素。让我来正确地检查实际的 drawer DOM：
实时抽屉（Live drawer）状态检查通过（间距 8px，px-8，48px Cormorant lh 48，ls −1.2px，ink links，CTA mt 40px，cream z-60）。点击穿透（Tap-through）检查：
Tap-through verified: drawer → `/services`. Now the reference drift check on the services page:
Reference verified un-drifted (128px h1, ink CTA pill, cream bg). Now **session-15 candidate 1: the ICS STATUS/TRANSP field census** — booking on the reference with route-abort:
The booking POST landed (probe write — noted). Now the key measurement — the reference's ICS download on the confirmation page:
**已捕获参考的 ICS** — 正在解码：没有 `STATUS` 字段，没有 `TRANSP` 字段；字段包括 PRODID, UID(timestamp@maisonluminaire), DTSTAMP, DTSTART, DTEND(+90min), SUMMARY(em-dash), DESCRIPTION, LOCATION。现在让我与克隆版本的 ICS 构建器进行对比：
**ICS 普查结果：已处于对等状态** —— 参考端和克隆端均不包含 `STATUS` 或 `TRANSP` 字段，且字段序列、90 分钟块（block）、em-dash `SUMMARY` 以及原始逗号 `LOCATION` 完全字节匹配。这需要添加一个 negative pin。现在是 **候选 2：scroll-restoration/popstate 普查**：
值得注意：SPA 导航到 /services 保留了滚动位置 (1830 = 限制在页面高度)，而不是重置到顶部。现在测试 popstate 恢复：
Live 行为已测量：SPA 导航保持滚动（未重置），popstate 恢复至 2000 并完全精确。现在在本地服务器上的克隆版本：
滚动读取出现异常 —— 让我用合适的等待时间重新进行克隆测试：
**发现不一致之处**：在 SPA 导航时，克隆版本会重置为 0（Next.js 默认值），而实际运行版本则会保留滚动高度（限制为 1830）。现在来看克隆版本的 popstate 行为：
克隆的 `popstate` 恢复匹配（2000 ✓）。**唯一差异：`SPA-nav` 滚动重置。** 让我检查双方的 `scrollRestoration` 模式和前进行为：
浏览器当前处于克隆环境 — 让我在线重新运行一次干净的多步骤测试：
完整的实时滚动统计：`scrollRestoration: auto`；SPA 导航保持滚动（固定）；后退/前进均精确恢复。克隆版本除了 SPA 导航重置外，其余均匹配。让我检查一下克隆版本如何实现其导航：
克隆使用 `<Link>` + `router.push`。修复设计：一个文档级别的捕获拦截器（`preventDefault` + `router.push(href, {scroll:false})`）。让我验证 Next 16 的 Link 是否遵循 `defaultPrevented`：
The user's onClick runs first, then `if (e.defaultPrevented) return` — the interceptor design is sound. Let me check if Link itself supports a `scroll` prop:
**Key discovery: Next 16's `<Link>` supports a `scroll` prop natively** (`scroll?: boolean` in the d.ts, `routerScroll = scroll ?? true` in the source) — a declarative fix usable even in server components. Let me check the live's hash-link behavior and enumerate the clone's navigation points:
Live hash-link: no URL change, scroll→0. Let me verify the history-state effect and re-measure carefully:
Live hash-link 契约：无 URL 变更，无历史记录条目，滚动 → 0。现在让我梳理克隆项目的 hash-links 和所有应用内导航面：
已找到失效的 `#` 链接（`LegalPage.tsx:61`，纯 `<a>` 标签）。现在测量点击时克隆项目的实际行为：
来自 `clone` 的结果异常（无 `#`，滚动保持，历史记录 +1）。让我用实际点击重新测试并验证细节：
Clone hash-link: `#` appended +1 entry, scroll→0 (vs live: no change, +0, scroll→0) — divergence confirmed. Now let me check the ServicesExperience category filter navigation:
分类胶囊按钮是基于状态的（无需导航）。让我查看剩余的 Link 页面，以完成修复清单：
完整清单已确认。让我检查一下 landing CATEGORY_CARDS 的 hrefs 和确认页面中的 UID 生成：
我来验证一下失效链接的滚动行为是立即生效还是平滑过渡，并运行 `@390×844` 的克隆端抽屉组件检查：
Instant scroll confirmed. Now the clone-side drawer standing check @390×844:
抽屉在@390×844处字节一致（所有值均与线上环境匹配 — 无 v4 回归）。克隆上的点击穿透（Tap-through）：
所有验证检查均已通过。让我运行针对现有 `e2e` 规格的冲突检查，以查看对滚动行为的依赖情况：
冲突检查已通过 — 现有的规范中均未涉及滚动位置。证据已收集完毕。正在记录普查结果并编写补救计划：
现在开始编写 session-15 修复计划：
Plan saved. Now **T1 (RED)** — let me check the existing test conventions first:
现在正在编写 scroll-parity 规范 (T1 RED)：
现在是 ics.test.ts 中的 ICS 负面标记：
现在正在运行 RED 阶段——先进行单元测试（ICS pins 预计为绿色）：
ICS 固定 pin 测试通过（共 11/11 个测试，新增 3 个）。现在针对当前 build 运行 scroll spec —— 预期结果为红色（P1/P5/P6）：
P1/P5/P6 如预期显示为 RED，但 P2/P3 也失败了（原预期是 GREEN 的防护性测试）。让我来检查一下 P2 的失败原因：
P2 恢复到了 1626（而非 2000）——这很可能是与 Next 内部的 popstate 滚动逻辑存在图片加载竞态（image-load race）或冲突。让我调试一下实际机制：
已找到根本原因：恢复是异步的（141 → 1971 → 2000，约 2.6s 内收敛）。P2/P3 需要 settled-state 轮询。让我用 `expect.poll` 重写该 spec：
P2/P4 现已通过。P3 仍然失败 —— 让我检查一下它的具体细节：
已收到 533（非 0，非最大值）—— 可能是 `smooth` 的 `scroll-behavior` 干扰了恢复。让我检查一下：
两侧都设置了 `scroll-behavior: smooth`（保持一致——也是逐渐恢复的原因）。让我直接调试前向流：
P3 的失败源于一个保存偏移的产物。但我需要先解开 96px 产物的谜团——让我以紧凑的间隔调试推送导航滚动轨迹：
轨迹解码：Next 的重置是一个**平滑滚动**（2000→0 需要约 700ms）——“96”是动画中途的快照，污染了前进之前保存的偏移量。重构规范：使用 3000px 的起点，以便进行确定性的截断断言：
P2 现在使用 3000 起点时失败了 —— 让我检查一下原因：
简单的 bug —— 该常量未被序列化到浏览器上下文中。正在通过将其作为参数传递来修复：
3000 的起点创建了一个**虚假的绿色（false green）**——路由交换（route-swap）的 clamp 取消了平滑重置，在 P1/P3 测试中暂时触及了最大值。正在使用 2000 的起点（低于服务的最大值 → 无 clamp 干扰）+ 用于导航契约的稳定读取数据进行重写：
**T1 红色测试集已确认，正如计划中所预测的那样**：P1/P5/P6 呈红色（存在差异），P2/P3/P4 呈绿色（回归防范），ICS 标记呈绿色。现在进入 **T2 (绿色测试) 阶段** —— 在整个清单中应用 `scroll={false}`：
前 3 处修改已应用；抽屉链接还需要该 prop：
SiteHeader 已完成。现在处理 SiteFooter、BookHeader 以及页面文件：
接下来是 3 个 `router.push` 的位置：
所有导航站点已处理完毕。现在开始处理 `DeadHashLink` 客户端岛 (F2)：
Now the GREEN check — typecheck, lint, then rebuild + run the scroll spec:
P5：原点已传递但停留在 63（预计限制在 423）—— 来自 scroll anchoring 的干扰。让我调试一下轨迹：
Clone 在 63 处立即稳定（已启用滚动锚定）。关键问题是：在相同流程下，**live** 会落入什么结果？让我来测量一下：
在线测试准确限制在 427（其最大值）—— 因此该 clone 的 63 是一个真正的差异。clone 的书本页面初始高度一定太短了。让我调查一下：
线上环境整洁地收敛至其最大值 (427) —— 克隆版本必须与之匹配。让我对克隆版本的导航进行检测，以超高分辨率采样页面高度：
**Direct transition: 3827→1143 in one frame, scroll 2000→63** — it's scroll anchoring, not height growth. The live's swap produces the clean clamp. Let me verify the `overflow-anchor: none` hypothesis:
**假设已确认** — 在禁用 anchoring 后，克隆准确落在 423 = max 处（与线上一致）。正在将 mechanism pin 添加到 globals.css：
e2e 依然是 63，尽管手动测试成功了。让我验证一下该 CSS 规则是否确实已编译到构建好的样式表中：
规则已编译但未生效 —— `html-level` 的 `opt-out` 不会排除子元素。让我直接针对生产环境服务器进行测试，以找到正确的 `selector`：
生产服务器通过 `agent-browser` 提供了干净的限制——与 `e2e` 的时间差异（300ms 对比 1000ms 的等待）一定是触发原因。正在复现 `e2e` 的精确时间：
仍然是 423 —— 63 是一个**测试机制带来的副作用**：Playwright 的 `.first()` CTA 选择器触发了 `scrollIntoView`（通过平滑滚动破坏了原点）。让我通过在没有 CSS 规则的情况下进行重建，来验证该规则是否真的起到了承载作用：
**最终结论：无需该 CSS 规则** —— 在 settled origin + JS 点击下，生产环境准确落在 423 处（与线上一致）。之前的 63 纯粹是 Playwright scrollIntoView 机制带来的影响。正在修复 P5 的机制：
现在重新运行完整的 scroll spec（已应用所有修复，不包含 CSS 规则）：
**GREEN — all 6 scroll specs pass.** Now T3 — the full gate:
单元测试 66/66 ✓，但存在一个 TS 错误 —— 即 Element 类型转换。正在修复：
**T3 全量门禁通过：lint ✓ · tsc ✓ · unit 66/66 · build 27/27 · e2e 125/125 = 总计 191 个。** 正在记录进度，随后进行 T4 实时复验：
Let me restart the dev server fresh (to guarantee the remediated code), then verify the clone-side scroll census:
**逐值一致性验证**：导航 → 1830（与实际一致），返回 → 2000（与实际一致），前进 → 1830（与实际一致）。现在是死链 # 验证：
失效的 # 一致性完全匹配（无 hash，+0 历史记录，即时置顶）。现在开始截图——先检查现有的规范：
All 15 captured. **11-mobile-menu = 26124B — the byte-identity signal holds** (no v4 regression). Let me check git's byte-level view:
7 个字节完全相同（包括 11 @ 26124B 和两个表单表面 08/09 — 证明了 scroll prop 在 settled DOM 中是不可见的）。现在按照惯例对这两个关键捕获进行 VLM 验证：
**VLM 已验证两次捕获。T4 已完成。** 现在进行 T5 — 文档对齐。从 README 开始：
CLAUDE.md 已对齐。现在是 PAD —— 导航策略备注和 session-15 账本：
Now the SKILL.md → v1.12.0:
Now writing the proper session_15.md record (replacing the owner's transcript):
Now updating the remediation plan's executed results:
Final gate green. Now T6 — the push. Reading the SSH wrapper runbook first:
Runbook loaded. Now the pre-commit sequence — status check and secret scan:
All files accounted for. The 3 doc matches for "BEGIN OPENSSH" are the runbook's documentation examples (tracked for many sessions, hygiene-scan-clean). Verifying ignores then committing:
Committed as `9e9d502` on main. Now the SSH push sequence — key materialization + fingerprint verification:
**Fingerprint verified** — `SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU` (the sessions 1–14 operator key). Deploying the paramiko shim:
试运行（Dry-run）清理（`ea159ef..9e9d502` 快进）。正式推送：
**已验证推送字节完全一致** — 远程 `9e9d502c69758a8fd1b62b4b166f2d31a3d203dd` == 本地 HEAD。正在销毁操作员密钥：
Key shredded, tree clean. Final worklog entry and cleanup:
**Session 15 complete** — all work committed and pushed to `main` (remote == local verified byte-exact at `f54e37c`, keys shredded).

**What this session found & fixed:**

1. **The scroll-restoration census** (the session-14 suggested candidate — the real finding): the reference's SPA router *never resets scroll* on in-app navigation (landing@2000 → /services lands at 1830, clamped), while the clone reset to top. Fixed via `scroll={false}` on all 18 `<Link>` sites + `{ scroll: false }` on the 3 `router.push` sites; the dead-`#` article link's click semantics (no URL change, no history entry, instant top) rebuilt via the new `DeadHashLink` island.
2. **The ICS STATUS/TRANSP census**: the live's download carries neither field, and the clone already byte-matched — now negatively pinned (3 unit tests) so RFC-minded "improvements" can't silently break parity.
3. **Standing checks**: the mobile menu @390×844 verified **byte-identical both sides** (no Tailwind v4 regression, the 26124B screenshot signal), the reference un-drifted, the fire-and-forget contracts re-verified live.

**Full gate green: lint · tsc · 66 unit · 27 pages · 125 e2e = 191 tests**, docs aligned (SKILL v1.12.0), 15 screenshots re-captured.

**Suggested next steps:** submit the booking form after scrolling mid-page to feel the kept-offset navigation, or review `docs/remediation-plan-session-15.md`. For a session 16, candidates: a `prefers-reduced-motion` reveal-timing census, or a focus-order/Tab-sequence behavioral census.
