---
date: 2026-07-17T20:26:23+08:00
title: "独立开发者的 AI 开发流程：先做产品，再做工程"
slug: solo-ai-product-development-flow
description: "一套适合独立开发者的 AI 产品开发流程：先验证用户问题和静态体验，冻结 MVP 后再进入架构、编码、审查与发布。"
---

> 记录时间：2026-07-17 20:26:23
>
> 这篇笔记整理自一次关于「独立开发者如何使用 AI 从 Idea 走到产品上线」的长讨论。

## 真正的问题不是缺少 Skills

独立开发者懂工程，也能让 AI 快速生成代码。麻烦恰恰来自这种能力：用户问题还没有说清楚，脑中已经开始排列 Nuxt、Flutter、FastAPI、PostgreSQL、Docker 和云服务。

工程进展很具体，容易让人产生项目正在前进的感觉。但如果产品定位错了，完整的架构只会提高改方向的成本。

适合我的纪律是：

> **产品探索阶段不讨论实现；静态原型阶段不建设生产架构；工程阶段不增加 MVP 之外的需求；发布阶段不绕过测试、备份和回滚。**

整个流程只分成三条线：

```text
新项目：问题探索 → 产品规格 → 静态原型 → 冻结 MVP → 技术方案

每个功能：轻量规格 → 计划 → 实现与测试 → 独立审查 → 人工验收

每次发布：Staging → E2E → 人工批准 → 生产部署 → Smoke Test
```

## 一、产品探索：先证明问题存在

### 我的输入

- 产品 Idea；
- 我认为的目标用户；
- 用户现在使用的替代方案；
- 三至五个真实案例或访谈记录。

### Skill + Prompt

`brainstorming` 是可选项。直接使用下面的 Prompt 也足够：

```text
你现在是产品探索顾问，不是技术负责人。

请帮我确认：
1. 目标用户是谁；
2. 用户在什么场景遇到问题；
3. 用户目前怎样解决；
4. 现有方法哪里不够好；
5. 问题的频率和严重程度；
6. 最关键的价值假设是什么；
7. 如何用最低成本验证这个假设。

禁止讨论技术栈、页面实现、数据库、API、架构和部署。
当我开始讨论实现时，提醒我回到用户问题。
```

### AI 做什么

AI 帮我整理假设、指出证据缺口、设计访谈或原型验证方法。它不能替我证明需求存在，也不能用竞品功能清单代替用户证据。

### 输出什么

**结果：**`docs/product/problem.md`

文档只需要写清：目标用户、具体场景、当前做法、核心障碍、价值假设和验证计划。

通过条件是一句没有技术名词的问题定义：

> 某类用户在某个场景下，因为某个障碍，无法完成某个重要目标。

## 二、产品设计：把问题变成可体验的流程

### 我的输入

- 已验证的问题定义；
- 用户最重要的一项任务；
- 第一版要验证的价值；
- 明确不做的功能。

### Skill + Prompt

先用 `speckit-specify` 起草产品规格，再用 `speckit-clarify` 消除歧义：

```text
speckit-specify：
根据已经确认的用户问题定义 MVP。
只描述目标用户、核心任务、用户流程、产品行为、异常场景、
验收标准和明确非范围。禁止讨论数据库、API、框架和部署。
优先删减功能。

speckit-clarify：
检查当前规格中存在多种解释的地方。
重点澄清内容组织、排序筛选、空状态、错误状态、发布下架行为
以及第一版明确不做的能力。把决定更新回规格，仍不讨论实现。
```

接着用 `frontend-design` 制作静态原型。数据可以写死，不连接 API，不建立数据库。页面完成后再用 `web-design-guidelines` 检查语义化 HTML、键盘操作、对比度、响应式、表单标签和长文阅读体验。

### AI 做什么

AI 把产品行为整理成用户故事和验收标准，再把规格变成可以点击的页面。此时的原型用于验证信息架构、页面顺序和阅读体验，不承担生产代码的职责。

### 输出什么

**结果：**

```text
specs/001-mvp/spec.md
docs/product/user-flow.md
docs/product/mvp.md
prototype/
docs/product/prototype-review.md
```

只有当目标用户能通过原型完成核心任务，并且 MVP 已经写清「必须做」和「明确不做」，项目才进入工程阶段。

## 三、工程设计：让技术服务已确认的产品

### 我的输入

- 冻结的 MVP；
- 已验证的静态原型；
- 技术和预算约束；
- 已有内容样本；
- 部署环境限制。

### Skill + Prompt

使用 `speckit-plan`：

```text
产品问题、用户流程、原型和 MVP 已经批准。

请设计满足现有规格的最简单实现方案。
每个技术决策都要注明它解决了哪条产品需求。
不得增加 MVP 之外的功能，不为尚未出现的规模问题设计架构。

输出模块边界、数据模型、API 契约、认证、测试、部署、备份、
回滚、当前不需要的基础设施，以及可以延后决定的问题。
```

投资内容平台还需要一个项目级 `content-package-contract` Skill，统一财报、CEO 演讲和管理层访谈的输出：

```text
manifest.json
content.html
content.json
assets/
source/
```

契约应包含 JSON Schema、版本号、校验脚本和安全 HTML 白名单。网站、管理端和 App 从同一份契约读取内容，避免三个客户端各自猜测格式。

### AI 做什么

AI 设计模块化单体、数据与接口契约、测试策略和部署路径，然后按用户可感知的能力拆成垂直切片。它不应该按「先做完数据库、再做完 API、最后做页面」分层拆任务。

### 输出什么

**结果：**

```text
docs/architecture.md
docs/data-model.md
openapi.yaml
packages/content-contract/schema.json
scripts/validate_content_package.py
specs/001-mvp/tasks.md
```

第一个里程碑只打通一条闭环：生成一篇内容，后台导入和预览，发布后网站与 App 都能打开。

## 四、每个功能：固定使用一条短循环

### 我的输入

每次只给 AI 一个功能：用户要完成什么、验收标准、非范围、对应原型，以及允许修改的模块。

### Skill + Prompt

```text
writing-plans：
阅读 AGENTS.md、功能规格和相关代码，为当前功能写一份短计划。
逐步列出修改文件和验证方法，不加入规格之外的工作。

test-driven-development：
先写关键失败场景测试，确认测试失败，再写最小实现。
数据库变化使用迁移，API 变化同步契约，不做无关重构。

verification-before-completion：
实际运行测试、静态检查、类型检查和构建。
逐项核对验收标准，查看 Git Diff，并报告未覆盖风险。
```

出现失败时才调用 `systematic-debugging`。它要求先稳定复现、收集证据、一次验证一个假设，修复后补回归测试。

### AI 做什么

AI 阅读规则，完成当前切片，运行验证并给出人工测试步骤。它不能自动推送或部署，也不能在编码过程中顺手扩张需求。

### 输出什么

**结果：**功能代码、测试、数据库迁移、更新后的 API 契约、真实命令结果、验收标准核对表和人工测试步骤。

编码完成后，打开一个新会话使用 `requesting-code-review`。审查者只读取规格、Diff 和测试结果，按 Blocker、High、Medium、Low 报告问题，不直接修改代码。修复后再次运行 `verification-before-completion`，最后由我亲自操作验收。

## 五、每次发布：测试环境与生产环境分开

### 我的输入

- Staging 地址和测试账号；
- 核心用户流程；
- 发布版本与 Git commit；
- 数据库备份状态；
- 当前生产镜像版本；
- 明确的发布批准。

### Skill + Prompt

先用 `agent-browser` 在 Staging 完成登录、导入、预览、发布、公开浏览、移动端布局和下架流程。然后调用项目级 `aliyun-release-checklist`：

```text
发布前检查 CI、迁移、备份、环境变量、域名、HTTPS、OSS 和回滚命令。
镜像使用 commit SHA，不使用 latest。

发布时推送镜像，ECS 拉取指定版本，执行迁移，更新容器，
检查 /health、首页、内容详情、管理端和静态资源。

任一步失败就停止，保存日志，恢复上一版本，并重新执行 Smoke Test。
未经我的明确确认，不得发布生产。
```

### AI 做什么

AI 执行可自动化的检查，记录每一步证据，并在失败时停止。最终的 Go 或 No-Go 决定、数据库风险判断和生产发布批准仍由我负责。

### 输出什么

**结果：**Staging E2E 报告、截图、Go／No-Go 结论、发布记录、镜像版本、迁移结果、Smoke Test 结果和可执行的回滚命令。

## 最后保留哪些 Skills

核心 Skills：

```text
speckit-specify
speckit-clarify
speckit-plan
frontend-design
web-design-guidelines
writing-plans
test-driven-development
systematic-debugging
verification-before-completion
requesting-code-review
finishing-a-development-branch
agent-browser
```

项目级 Skills：

```text
content-package-contract
aliyun-release-checklist
```

`brainstorming` 和 `speckit-tasks` 按项目规模使用。`using-git-worktrees`、多 Agent 编排、复杂架构改造等工具，等并行任务和代码规模真的出现后再引入。

Skills 只是把工作方法固化下来。它们不能替代用户证据、产品取舍、亲自验收和生产发布前的判断。对独立开发者而言，最有价值的流程不是调用更多工具，而是在正确的阶段只解决一种问题。
