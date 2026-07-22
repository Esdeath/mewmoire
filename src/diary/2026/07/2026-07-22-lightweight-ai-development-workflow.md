---
date: 2026-07-22T12:36:12+08:00
title: "给个人项目搭一套轻量 AI 开发工作流"
slug: lightweight-ai-development-workflow
description: "用 AGENTS.md 管项目规则，用 Master Prompt 约束当前任务，让 Skills 回到执行方法的位置。"
---

> 记录时间：2026-07-22 12:36:12
>
> 这篇笔记整理自我对个人项目 AI 开发流程的一次复盘。

## 工具变多以后，我先划清职责

我给 Codex 安装了不少 Plugins 和 Skills。工具一多，同一个任务会触发几套流程：一个 Skill 要写规格，另一个要建计划，还有一个准备创建工作树。项目目录很快多出 `specs/`、`plans/`、`tasks.md` 和检查清单。AI 忙着执行方法，我却要花时间管理 AI 生成的方法文件。

个人项目需要一套边界清楚的分工：

| 层级 | 负责什么 | 生命周期 |
| --- | --- | --- |
| `AGENTS.md` | 项目规则、技术约束、文档位置、禁止事项 | 跟随项目长期维护 |
| Master Prompt | 当前阶段、任务范围、输入、输出和验收标准 | 每个任务写一次 |
| Skill | 设计、测试、调试、审查、发布的方法 | 按需调用 |

我用一句话记住这套分工：**`AGENTS.md` 管长期规则，Master Prompt 管当前任务，Skills 提供执行方法。**

AI 可以承担重复实施、测试和审查。产品方向与范围仍由我决定。这样既能利用工具，也不会让工具替项目建立另一套制度。

## 四个阶段，各自回答一类问题

我把项目推进过程分成四段：

```text
DISCOVERY
产品问题探索
    ↓
PRODUCT_DESIGN
产品流程与静态原型
    ↓
IMPLEMENTATION
框架选择、技术设计与编码
    ↓
RELEASE
Staging、部署、回滚与监控
```

阶段边界可以挡住不少返工。

| 阶段 | 需要回答的问题 | 此时先不做 |
| --- | --- | --- |
| 产品探索 | 用户是谁，遇到什么问题，为什么值得解决 | 技术栈、数据库、API |
| 产品设计 | 用户怎样完成任务，需要哪些页面，MVP 包含什么 | Docker、云部署、生产架构 |
| 工程实现 | 团队怎样用可靠且成本合适的方式实现 | 临时增加产品需求 |
| 发布上线 | 团队怎样验证、部署、观察和回滚 | 临时开发新功能 |

讨论产品时，我把注意力放在用户问题上。进入实现后，我按确认过的范围写代码。发布阶段保留验证和回滚步骤，不用上线压力为新需求开口子。

## 项目文档保持固定

一个个人项目不需要多套平行文档。我长期维护下面这些文件：

```text
README.md
AGENTS.md
CHANGELOG.md

docs/
├── product.md
├── ux.md
├── architecture.md
├── operations.md
├── ai-workflow.md
└── features/
    └── <feature>.md
```

`product.md` 记录用户问题、产品定位、MVP 和明确放弃的范围。`ux.md` 保存用户流程、页面结构与原型结论。`architecture.md` 管技术栈、数据模型、API 和技术决策，`operations.md` 管部署、备份与回滚。

单个功能的需求、计划、验收和状态都放进 `features/<feature>.md`。我在 `ai-workflow.md` 保存可复用的 Prompt 与 Skill 用法，在 `CHANGELOG.md` 记录已经发布的变化。

这套目录也写进 `AGENTS.md`。Skill 默认建议的 `specs/`、`docs/superpowers/`、`plans/`、`tasks.md` 和 `review.md` 不进入项目。AI 要更新文档时，先取得我的确认，再修改指定文件。

## 每个任务用一份 Master Prompt

长期规则无法描述眼前任务。我会在每轮工作开始时补一份任务单：

```text
请先阅读 AGENTS.md，并严格遵守。

当前阶段：
<DISCOVERY / PRODUCT_DESIGN / IMPLEMENTATION / RELEASE>

本次任务：
<一句话说明任务>

输入：
- <相关文档>
- <样例数据或当前代码>

允许使用的 Skills：
- <Skill 1>
- <Skill 2>

本次输出：
1. <结果 1>
2. <结果 2>

明确不包含：
- <范围外事项>

限制：
1. 不创建新的文档目录。
2. 不使用 Skill 的默认文档路径。
3. 不修改与本任务无关的文件。
4. 执行前先给出计划，等我确认。
5. 未经确认，不提交、推送、合并或部署。
6. 完成后列出修改文件、验证结果、尚存风险和人工测试步骤。
```

这份 Prompt 给 AI 一张当前任务单。`AGENTS.md` 不必塞入每次任务的临时要求，任务结束后也不用清理长期规则。

## Skills 按工作风险选择

我保留一组覆盖开发关键环节的 Skills：

| Skill | 使用场景 |
| --- | --- |
| `frontend-design` | 静态原型、页面视觉与组件实现 |
| `web-design-guidelines` | 响应式、可访问性和交互审查 |
| `writing-plans` | 涉及多个文件或模块的功能 |
| `test-driven-development` | 关键业务逻辑与 Bug 修复 |
| `systematic-debugging` | 稳定复现问题并追查根因 |
| `verification-before-completion` | 完成前运行测试和构建 |
| `requesting-code-review` | 用新会话审查 Git Diff |
| `agent-browser` | 在 Staging 检查真实用户流程 |

项目还可以创建少量领域 Skill。例如，内容系统可以用 `content-package-contract` 约束 `manifest.json`、正文、资源、来源和校验和；阿里云项目可以用 `aliyun-release-checklist` 固定镜像、迁移、冒烟测试与回滚步骤。

项目规模增长以后，我再加入分支收尾、代码审查反馈或 Worktree 管理。并行 Agent 与完整规格套件会增加协调成本，当前阶段用不到。

## 插件与单个 Skill 的选择

我用两个条件判断是否安装完整插件：插件需要连接外部系统，或包内大部分 Skills 都会进入日常工作。

GitHub Plugin 值得完整安装。它能读取仓库、Issue、Pull Request 和 CI，外部连接能力构成了插件价值。Superpowers 更适合挑选其中常用的 Skills，例如计划、测试、调试和完成前验证。这样可以避开未使用流程的默认行为。

Spec Kit 暂不加入。它生成的 `spec.md`、`plan.md` 与 `tasks.md` 会和现有文档重复。等项目出现多人协作、跨模块依赖或长周期需求，再评估这套投入。

## 自动调用保持克制

我允许 `verification-before-completion` 自动触发，因为每次交付都需要新鲜的测试或构建证据。`systematic-debugging` 可以自动触发，也可以在出现稳定故障后手动调用。

设计、计划、TDD、代码审查和浏览器验收由我手动指定。这些方法会改变任务节奏，也可能创建文件或扩大工作范围。手动调用让我在使用前先判断成本。

一套适合个人开发者的 AI 工作流，不靠工具数量衡量。规则要稳定，任务要具体，方法要服从当前阶段。我维护这三层边界，AI 才能把时间花在实现、验证与审查上。
