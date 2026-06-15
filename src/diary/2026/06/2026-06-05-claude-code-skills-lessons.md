---
date: 2026-06-05T00:00:00+08:00
title: "构建 Claude Code 的经验：我们如何使用 Skills"
slug: claude-code-skills-lessons
description: "Anthropic 工程师 Thariq 分享内部使用数百个 Skills 的经验：Skills 不是一堆 markdown 文件，而是文件夹；内部 Skills 聚类出的九大类别框架，以及编写高质量 Skill 的最佳实践。"
---

> 记录时间：2026-06-05
>
> 本文翻译并整理自 Anthropic 博客 [Lessons from building Claude Code: How we use skills](https://claude.com/blog/lessons-from-building-claude-code-how-we-use-skills)，作者 Thariq Shihipar（Anthropic 技术团队成员，Claude Code 方向）。

## 概述

Skills 已经成为 Claude Code 中最常用的扩展方式之一。在 Anthropic 内部，我们大量使用 Skills，目前有数百个 Skill 处于活跃使用状态。本文分享我们在用 Skills 加速研发过程中积累的一些经验。

简单来说，**Skill 是一组指令、脚本和资源的集合**，agent 可以发现并使用它们，从而把事情做得更准确、更高效。

## 最大的误区：Skills 不是「一堆 markdown 文件」

关于 Skills，最常见的误解是认为它们「只是一些 markdown 文件」。

实际上，Skill 是**文件夹**，里面可以包含脚本、资源文件、数据等，agent 能够发现、浏览并操作这些内容。在 Claude Code 里，Skill 还有一系列配置选项，比如注册动态 hooks。一些最有效的 Skill，恰恰是充分利用了这些配置选项和文件夹结构。

换句话说：把整个文件系统当作一种**上下文工程（context engineering）**和**渐进式披露（progressive disclosure）**的手段。

## 九大类别框架

把内部所有 Skill 都整理一遍后，我们注意到它们大致聚成九个类别。**最好的 Skill 都干净地落在某一个类别里；那些想做太多事情的 Skill 往往横跨多个类别，反而让 agent 困惑。**

这不是一份权威清单，但它是一个有用的框架，可以帮你发现自己 Skill 库里的空白。

### 1. 库 / API 参考（Library & API Reference）

讲清楚如何正确使用某个库、CLI 或 SDK——既包括内部的库，也包括 Claude Code 有时处理不好的常见库。这类 Skill 通常会带一个参考代码片段文件夹，以及一份「坑点清单」帮 Claude 规避错误。

- `billing-lib`：你们内部计费库的边界情况、隐藏陷阱等
- `internal-platform-cli`：内部 CLI 封装的每一个子命令，附带何时使用的示例
- `frontend-design`：让 Claude 更好地适配你们的设计系统

### 2. 产品验证（Product Verification）

描述如何测试或验证代码是否正常工作，通常会搭配 Playwright、tmux 等外部工具来完成验证。验证类 Skill 对于**确保 Claude 输出正确**极其有用——值得让一名工程师花上一周时间，专门把验证 Skill 打磨到极致。技巧包括：让 Claude 录下它运行结果的视频，方便你看清它到底测了什么；或者在每一步对状态做程序化断言。

- `signup-flow-driver`：在无头浏览器里跑通 注册 → 邮箱验证 → 引导流程，每一步都有 hook 断言状态
- `checkout-verifier`：用 Stripe 测试卡驱动结账 UI
- `tmux-cli-driver`：用于需要 TTY 的交互式 CLI 测试

### 3. 数据获取与分析（Data Fetching & Analysis）

连接你们的数据栈和监控栈。这类 Skill 可能包含带凭证拉取数据的库、特定的 dashboard ID，以及常见工作流或取数方式的说明。

- `funnel-query`：「要看 注册 → 激活 → 付费，应该 join 哪些事件」
- `cohort-compare`：比较两个 cohort 的留存或转化，标记出有统计显著性的差异
- `grafana`：数据源 UID、集群名、「问题 → dashboard」的查找表

### 4. 业务流程与团队自动化（Business Process & Team Automation）

把重复的工作流自动化成一条命令。这类 Skill 的指令通常比较简单，但可能依赖其他 Skill 或 MCP。对它们来说，**把以往执行结果保存到日志文件**有助于模型保持一致，并能反思过往的执行。

- `standup-post`：聚合你的工单系统、GitHub 动态和此前的 Slack，输出格式化的站会汇报
- `create-<ticket-system>-ticket`：强制工单 schema，并执行创建后的后续流程
- `weekly-recap`：每周回顾

### 5. 脚手架与模板（Scaffolding & Templates）

为代码库中某类特定功能生成框架样板代码。可以把这类 Skill 与可组合的脚本结合起来。当你的脚手架带有「无法纯靠代码覆盖的自然语言需求」时，它们尤其有用。

- `new-<framework>-workflow`：按你们的约定脚手架出一个新 service / workflow / handler
- `new-migration`：你们的迁移文件模板，外加常见坑点
- `create-app`：预置好鉴权、日志、部署配置的新内部应用

### 6. 代码质量与评审（Code Quality & Review）

在组织内部强制代码质量、并帮助评审代码。这类 Skill 可以包含确定性的脚本或工具以求最大鲁棒性。你可能想把它们作为 hooks 自动运行，或放进 GitHub Action 里。

- `adversarial-review`：派出一个「全新视角」的 subagent 来批判代码，实现修复并迭代，直到剩下的只是吹毛求疵的小问题
- `code-style`：强制代码风格，尤其是 Claude 默认做不好的那些风格
- `testing-practices`：测试实践

### 7. CI/CD 与部署（CI/CD & Deployment）

帮你在代码库里拉取、推送和部署代码。这类 Skill 可能会引用其他 Skill 来收集数据。

- `babysit-pr`：盯着一个 PR → 重试不稳定的 CI → 解决合并冲突 → 开启自动合并
- `deploy-<service>`：构建 → 冒烟测试 → 逐步放量，出现回归时自动回滚
- `cherry-pick-prod`：隔离的 worktree → cherry-pick → 解冲突 → 按模板提 PR

### 8. 运行手册（Runbooks）

输入一个「症状」（比如一条 Slack 讨论串、一个告警、一段错误签名），走完一套多工具的排查流程，最后产出一份结构化报告。

- `service-debugging`：为你们流量最大的服务建立「症状 → 工具 → 查询模式」的映射
- `oncall-runner`：拉取告警 → 检查常见嫌疑点 → 格式化结论
- `log-correlator`：给定一个 request ID，从所有可能经手过它的系统里拉取匹配日志

### 9. 基础设施运维（Infrastructure Operations）

执行例行维护和运维流程——其中一些是**破坏性操作**，特别需要护栏（guardrails）。这类 Skill 让工程师在关键操作中更容易遵循最佳实践。

- `resource-orphans`：找到孤立的 pod / volume → 发到 Slack → 静默观察期 → 用户确认 → 级联清理
- `dependency-management`：你们组织的依赖审批流程
- `cost-investigation`：「为什么我们的存储 / 出口流量账单暴涨」，附带具体的 bucket 和查询模式

## 编写 Skill 的最佳实践

### 不要陈述显而易见的内容

Claude Code 已经很懂你的代码库，整体编码能力也不错，还自带很多默认观点。所以 Skill 的重点应该放在**能把 Claude 推出默认思维定式之外**的信息上。

`frontend-design` 就是个好例子：它由 Anthropic 的一名工程师与客户反复迭代打磨而成，专门提升 Claude 的设计品味，避开诸如 Inter 字体、紫色渐变这类「一眼 AI」的套路。

### 把 Gotchas（坑点）章节放在最高优先级

任何 Skill 里信号最强的内容就是 Gotchas 章节。它应该从 Claude 使用该 Skill 时反复踩的坑中积累出来——理想情况下，你会随时间不断更新 Skill，把新发现的坑都收进去。

### 利用文件系统做渐进式披露

Skill 是文件夹，不是单个 markdown 文件。把整个文件系统当作上下文工程和渐进式披露的工具：告诉 Claude 你的 Skill 里有哪些文件，它会在合适的时机去读。最简单的形式就是指向其他 markdown 文件，比如把详细的函数签名和用法示例拆到 `references/api.md` 里。

### 不要把 Claude 框死在轨道上

正因为 Skill 高度可复用，要小心指令写得过于具体。**给 Claude 它需要的信息，同时留给它根据情境灵活调整的空间。**

### 想清楚初始化设置

有些 Skill 需要用户提供初始化上下文。一个好做法是把这类设置信息存在 Skill 目录下的 `config.json` 里。如果配置还没设置好，agent 可以向用户询问；你可以指示 Claude 用 `AskUserQuestion` 工具来问结构化的多选题。

### description 字段是写给模型看的

Claude Code 启动会话时，会把每个可用 Skill 及其 description 列成一份清单。Claude 正是扫描这份清单来判断「这个请求有没有对应的 Skill」。所以 **description 不是内容摘要，而是「何时触发这个 Skill」的描述**。请为模型而写。

## 进阶技巧

### 记忆与数据存储

有些 Skill 可以通过在内部存储数据来实现某种「记忆」——简单到一个 append-only 的文本日志或 JSON 文件，复杂到一个 SQLite 数据库都可以。

例如 `standup-post` 可以维护一份 `standups.log`，记录它写过的每一条汇报；下次运行时，Claude 读取自己的历史，就能判断相比昨天有哪些变化。

**注意：** 存在 Skill 目录里的数据在你升级该 Skill 时可能被删除。所以应使用 `${CLAUDE_PLUGIN_DATA}`——这是每个插件专属的稳定目录——来存放数据。

### 按需触发的 Hooks

Skill 可以携带 hooks，这些 hooks 仅在该 Skill 被调用时激活，并在本次会话期间持续生效。这对于那些「不想一直跑、但偶尔极其有用」的较强约束性 hook 很合适。

例如 `/careful` 通过对 Bash 的 `PreToolUse` matcher，拦截 `rm -rf`、`DROP TABLE`、强制推送（force-push）和 `kubectl delete`。

## 如何分享 Skill：去中心化的市场

在 Anthropic，没有一个中心化的团队来决定哪些 Skill 进入市场；我们让最有用的 Skill **自然地涌现**。

如果有人想让大家试用某个 Skill，可以把它上传到 GitHub 的一个沙盒文件夹，并在 Slack 里把链接发出去。等这个 Skill 获得一定关注度后，再提一个 PR 把它移进正式市场。

## 小结

这篇文章的核心可以浓缩为几点：

1. **Skill 是文件夹，不是 markdown**——把文件系统当作上下文工程的手段。
2. **九大类别框架**（库参考、产品验证、数据分析、流程自动化、脚手架、代码评审、CI/CD、运行手册、基础设施运维）可以用来盘点你 Skill 库的空白；好 Skill 只做一类事。
3. **写作要点**：别说废话、把 Gotchas 放第一位、用渐进式披露、别框死 Claude、description 是写给模型的触发条件。
4. **进阶**：用文件实现记忆、用按需 hooks 加护栏。

Anthropic 还发布了 **Skill Creator**，让在 Claude Code 里创建 Skill 更加简单。
