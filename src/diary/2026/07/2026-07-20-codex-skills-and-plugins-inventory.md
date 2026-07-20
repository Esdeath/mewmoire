---
date: 2026-07-20T16:39:46+08:00
title: "我的 Codex 工具箱：当前安装的 Skills 与 Plugins"
slug: codex-skills-and-plugins-inventory
description: "盘点当前 Codex 环境中启用的 15 个 Plugins 与全部独立 Skills，按实际工作流中的预期使用频率排序，并说明每项工具的用途。"
---

> 记录时间：2026-07-20 16:39:46
>
> 这篇笔记来自对当前 Codex 配置、插件清单、技能目录和本轮实际可用能力的一次盘点。

## 先说明「使用频率」怎么算

Codex 没有向我提供一份可信的 Skill 调用次数统计。因此，下面的「高频、中频、低频或专项」不是历史调用排行榜，而是根据三件事作出的**实用分级**：触发范围有多广、与我当前的写作及开发流程有多接近、日常任务遇到它的概率有多大。

本次确认到 **15 个当前可用的 Plugins**。其中 13 个明确写在本机 Codex 配置中并处于启用状态，GitHub 与 Gmail 则作为当前会话可用的连接器插件出现。插件内部带有的 Skills 全部放在对应插件下面，不再进入后面的独立 Skills 清单。

## Plugins：高频

### 1. Superpowers

它是一套贯穿软件开发全过程的方法库，也是覆盖面最广的插件。它规定如何澄清需求、写计划、测试、调试、审查和交付。

插件内含 14 个 Skills：

- `using-superpowers`：每轮任务开始时先判断应该调用哪些 Skills。
- `brainstorming`：在写代码前澄清目标、约束、成功标准与方案取舍。
- `writing-plans`：把已经确认的规格拆成可以逐步执行的实现计划。
- `executing-plans`：按现成计划分阶段实施，并在检查点复核结果。
- `test-driven-development`：先写失败测试，再写最少实现，最后整理代码。
- `systematic-debugging`：从复现、证据和根因入手处理 Bug 与异常结果。
- `verification-before-completion`：在声称完成以前重新运行验证命令，用输出证明结果。
- `requesting-code-review`：完成重要改动后发起独立代码审查。
- `receiving-code-review`：先验证审查意见的技术正确性，再决定如何修改。
- `finishing-a-development-branch`：在功能完成后整理合并、PR 或分支清理步骤。
- `using-git-worktrees`：用 Git Worktree 隔离功能开发，减少对当前工作区的干扰。
- `dispatching-parallel-agents`：把互不依赖的任务交给多个代理并行处理。
- `subagent-driven-development`：让子代理按任务块实现，并穿插规格与质量审查。
- `writing-skills`：创建、修改和验证 Skill 本身。

### 2. GitHub

用于读取仓库、Issue、Pull Request 与评论，也能结合本地 `git` 和 `gh` 完成发布、审查与 CI 修复。

插件内含 4 个 Skills：

- `github`：GitHub 任务的总入口，负责仓库、Issue 和 PR 的查询与分流。
- `gh-address-comments`：读取未解决的 PR 审查线程，落实选定的修改意见。
- `gh-fix-ci`：检查 GitHub Actions 失败日志，定位原因并修复 CI。
- `yeet`：确认改动范围后创建分支、提交、推送并打开 Draft PR。

### 3. Browser

插件内的 `control-in-app-browser` 用于控制 Codex 内置浏览器。它可以打开本地页面、点击、输入、截图和检查交互状态，尤其适合前端完成后的本地验收。

### 4. Computer Use

插件内的 `computer-use` 通过 macOS 图形界面操作本机应用。终端、API 或专用连接器无法完成任务时，它可以读取窗口、点击控件和输入内容。

### 5. Frontend Design

插件内的 `frontend-design` 用于设计或重塑前端界面。它关注视觉方向、字体、布局、层级和产品气质，帮助页面摆脱默认模板感。

## Plugins：中频

### 6. Chrome

插件内的 `control-chrome` 操作我已经登录的 Chrome，包括现有标签页、Cookie、扩展和登录状态。需要使用真实账户环境时，它比新的无状态浏览器更合适。

### 7. Sites

这是 OpenAI 的网站构建与托管插件。它只在带有 `.openai/hosting.json` 的 Sites 项目中强制使用。

- `sites-building`：构建网站、仪表盘、作品集、门户和内部工具。
- `sites-hosting`：发布网站并管理 Sites 托管状态。

### 8. Visualize

插件内的 `visualize` 用于在对话中制作交互式图表、地图、流程图、模拟器、数据探索器和 3D 模型。需要「看见并调节」一个概念时，它比纯文字解释更有效。

### 9. Documents

插件内的 `documents` 用于创建、编辑、批注和红线修改 `.docx`。它要求把文档渲染成页面图片做视觉检查，适合正式 Word 文档。

### 10. PDF

插件内的 `pdf` 读取、生成、拆分、合并和检查 PDF，并通过页面渲染确认文字、分页与版式没有出错。

### 11. Spreadsheets

用于创建、分析和验证 Excel 或 Google Sheets 兼容工作簿。

- `Spreadsheets`：处理独立的 `.xlsx`、`.xls`、`.csv` 与 `.tsv` 文件。
- `excel-live-control`：通过 Excel 加载项控制正在打开的工作簿与活动会话。

### 12. Gmail

用于搜索邮箱、阅读邮件线程、提取行动项和起草回复。发送、归档、删除或修改标签等动作仍需要明确意图。

- `gmail`：邮箱搜索、线程摘要、回复草稿、转发与邮件整理的总入口。
- `gmail-inbox-triage`：把收件箱分成紧急、需要回复、等待中与仅供了解等队列。

## Plugins：低频或专项

### 13. Presentations

插件内的 `Presentations` 用于创建、编辑、渲染和导出 PowerPoint 或 Google Slides 演示文稿。只有需要正式幻灯片产物时才会触发。

### 14. Template Creator

插件内的 `template-creator` 从现有 Word、PowerPoint 或 Excel 文件制作可复用的个人模板 Skill。它服务于长期重复使用的版式，不负责普通的一次性文档。

### 15. Skill Creator

插件内的 `skill-creator` 用于创建或改进 Skills，并通过评测、基准测试与方差分析检查效果。Codex 还带有一个同名的系统 Skill，提供创建 Skill 的基础规范；两者用途重叠，所以统一放在这里说明，不在独立清单重复列出。

## 独立 Skills：高频

### 1. `publish-diary-note`

把当前讨论整理成符合 mewmoire 约定的 Markdown 日记，取得真实时间，生成四字段 Frontmatter，然后构建并发布到 Cloudflare Pages。这篇文章正在使用它。

### 2. `publish-article`

把网页、粘贴内容、主题简报、本地笔记或当前对话改写成中文文章，并发布到同一个 Eleventy 日记站。它更适合有明确来源、需要翻译或改编的长文。

### 3. `stop-slop`

清理 AI 写作痕迹：删除空话、套路式对照、机械排比、虚假强调和过度解释，让文字更直接、更像真实作者。

### 4. `agent-reach`

负责互联网检索与研究。它把搜索分发到合适渠道，适合查新闻、论文、社交平台讨论、代码资料和其他会随时间变化的信息。

### 5. `cloudflare`

Cloudflare 平台的总入口，覆盖 Workers、Pages、KV、D1、R2、AI、Vectorize、网络、安全与基础设施即代码。当前站点部署在 Cloudflare Pages，因此使用机会较多。

### 6. `wrangler`

在运行 Wrangler CLI 前提供正确命令和操作规范，用于开发、部署和管理 Workers、Pages、D1、R2、KV、Queues、Workflows 等资源。

### 7. `workers-best-practices`

编写或审查 Cloudflare Workers 时检查生产实践，包括流式响应、悬空 Promise、全局可变状态、Secrets、Bindings 与可观测性。

### 8. `openai-docs`

回答 OpenAI API、模型、Codex 与提示词升级问题时，优先读取最新官方文档并给出引用，避免依赖已经过期的记忆。

## 独立 Skills：中频

### 9. `imagegen`

生成或编辑位图资产，包括照片、插画、纹理、透明背景素材、产品图和 UI Mockup。普通图片任务默认调用内置图像生成工具。

### 10. `web-perf`

用 Chrome DevTools 分析 LCP、INP、CLS、FCP、TBT、缓存、网络依赖和布局偏移，适合网站速度与 Core Web Vitals 优化。

### 11. `agents-sdk`

在 Cloudflare Workers 上构建有状态 AI Agent、WebSocket 应用、定时任务、工作流、MCP Server 与语音代理。

### 12. `durable-objects`

设计和审查 Durable Objects，适合聊天室、多人协作、预订系统、SQLite 状态、Alarms 与 WebSocket 协调。

### 13. `chatgpt-apps`

构建 ChatGPT Apps SDK 项目，把 MCP Server 与 Widget UI 连接起来，并处理资源注册、Bridge、CSP、Domain 和兼容性配置。

### 14. `find-skills`

当我想知道「有没有一个 Skill 能做某件事」时，用它搜索可安装能力并给出安装方向。

### 15. `skill-installer`

从 OpenAI 的 curated 或 experimental 清单，以及公开或私有 GitHub 仓库，把 Skill 安装到 `$CODEX_HOME/skills`。

### 16. `plugin-creator`

创建 Codex Plugin 的目录、`.codex-plugin/plugin.json`、可选结构和个人 Marketplace 条目，也负责开发期间的重新安装流程。

## 独立 Skills：低频或专项

### 17. `cloudflare-email-service`

为 Workers 或其他应用接入 Cloudflare Email Sending 与 Email Routing，并处理 SPF、DKIM、DMARC 和投递问题。

### 18. `cloudflare-one`

处理 Cloudflare One、Zero Trust 与 SASE，包括 Access、Gateway、WARP、Tunnel、DLP、CASB、设备姿态和身份系统。

### 19. `cloudflare-one-migrations`

把 Zscaler、Palo Alto、传统 VPN、SWG 或其他 SASE 架构迁移到 Cloudflare One，负责差距分析、策略映射和分阶段上线计划。

### 20. `sandbox-sdk`

构建安全执行不受信任代码的应用，例如代码解释器、在线开发环境、AI 执行器和 CI/CD 隔离环境。

### 21. `turnstile-spin`

端到端配置 Cloudflare Turnstile：创建 Widget、部署 `siteverify` Worker、接入前端、验证结果并保存可复用配置。

### 22. `hk-value-snapshot`

用真实财报与行情数据为港股公司生成「价值线企业快照版」，同时输出 HTML 与 Markdown，适合三十秒基本面筛选和价值投资研究。

### 23. `review-agent`

这是系统内置、主要供审查代理调用的只读 Skill。它检查指定 Diff、Commit 或分支变化，按严重度报告可执行缺陷，不直接修改代码。

## 缓存不等于已经安装

本机插件缓存中还能看到 `openai-templates`、`build-web-apps`、`build-ios-apps`、`build-macos-apps` 和 `expo` 等目录，也有不同来源的 `superpowers` 副本。它们没有出现在当前启用配置或本轮可用插件清单中，因此这次没有把它们列为已安装插件。

以后再次盘点时，应继续以三类证据交叉确认：Codex 的启用配置、本轮暴露的 Skills 与连接器、磁盘上的实际 Skill 文件。只看缓存目录，很容易把下载过、暂存过或已经停用的插件误算成当前工具。
