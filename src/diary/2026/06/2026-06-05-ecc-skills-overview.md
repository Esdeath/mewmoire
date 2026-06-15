---
date: 2026-06-05T16:21:02+08:00
title: "ECC Skills 全景概览：命令型与知识型技能分类"
slug: ecc-skills-overview
description: "梳理 ECC 提供的两大类 skills——命令型工作流与领域知识技能，按用途分组速查。"
---

> 记录时间：2026-06-05 16:21:02

## 问题

ECC（Claude Code 增强工具集）注册了数量庞大的 skills。需要把这些 `ecc:` 开头的技能系统地列举出来并简要说明，弄清它们各自的用途，方便按需调用。

## ECC Skills 的两大类型

ECC 的 skills 分为两类：

- **命令型 skills**：通过 `/ecc:xxx` 显式调用的工作流或操作命令。
- **知识型 skills**：按当前任务领域自动加载的领域知识，不需要手动触发。

## 一、命令型 skills（工作流 / 操作命令）

### 规划与开发流程

| Skill | 说明 |
|---|---|
| `ecc:plan` / `ecc:plan-prd` | 制定实现计划 / 基于 PRD 的计划 |
| `ecc:feature-dev` / `ecc:quick-dev` | 端到端功能开发 / 快速开发小任务 |
| `ecc:prp-prd` / `prp-plan` / `prp-implement` / `prp-commit` / `prp-pr` | PRP 工作流五件套：需求→计划→实现→提交→PR |
| `ecc:multi-plan` / `multi-backend` / `multi-frontend` / `multi-execute` / `multi-workflow` | 多智能体并行的规划/前后端/执行编排 |
| `ecc:plan-orchestrate` | 编排多步计划 |

### 构建 / 审查 / 测试（按语言）

| 类别 | Skill |
|---|---|
| 构建修复 | `build-fix`, `cpp-build`, `flutter-build`, `go-build`, `gradle-build`, `kotlin-build`, `react-build`, `rust-build` |
| 代码审查 | `code-review`, `cpp-review`, `fastapi-review`, `flutter-review`, `go-review`, `kotlin-review`, `python-review`, `react-review`, `rust-review`, `review-pr` |
| 测试 | `cpp-test`, `flutter-test`, `go-test`, `kotlin-test`, `react-test`, `test-coverage` |

### 质量 / 安全 / 重构

| Skill | 说明 |
|---|---|
| `ecc:quality-gate` | 质量门禁检查 |
| `ecc:security-scan` | 安全扫描 |
| `ecc:refactor-clean` | 死代码清理与重构 |
| `ecc:prune` | 精简代码 / 依赖 |

### 会话 / 状态管理

| Skill | 说明 |
|---|---|
| `save-session` / `resume-session` / `sessions` | 保存 / 恢复 / 列出会话 |
| `checkpoint` / `checkpoint-preview` | 创建检查点 / 预览 |
| `cost-report` / `model-route` | 成本报告 / 模型路由 |

### 自动化 / 学习 / 钩子

| Skill | 说明 |
|---|---|
| `hookify` / `hookify-configure` / `hookify-list` / `hookify-help` | 把重复行为固化成 hook |
| `learn` / `learn-eval` | 持续学习与评估 |
| `instinct-export` / `import` / `status` | 导出 / 导入「直觉」经验 |
| `evolve` / `promote` | 技能进化 / 提升 |
| `loop-start` / `loop-status` / `santa-loop` | 自治循环任务 |

### 项目 / 文档 / 集成

| Skill | 说明 |
|---|---|
| `project-init` / `projects` | 项目初始化 / 列表 |
| `update-docs` / `update-codemaps` | 更新文档 / 代码地图 |
| `pr` / `jira` / `pm2` | 创建 PR / Jira / 进程管理 |
| `marketing-campaign` | 营销活动策划 |
| `skill-create` / `skill-health` | 创建技能 / 健康检查 |
| `ecc-guide` | ECC 使用向导 |
| `gan-design` / `gan-build` | GAN 式生成-评估编排 |
| `harness-audit` | 审计 agent harness 配置 |

## 二、知识型 skills（领域知识，按需自动加载）

### 语言 / 框架模式

- **前端**：`react-patterns`, `react-performance`, `react-testing`, `nextjs-turbopack`, `vite-patterns`, `nuxt4-patterns`, `angular-developer`, `frontend-patterns`, `frontend-a11y`, `ui-to-vue`
- **后端**：`backend-patterns`, `fastapi-patterns`, `django-patterns`, `django-celery`, `nestjs-patterns`, `laravel-patterns`, `springboot-patterns`, `quarkus-patterns`, `golang-patterns`, `rust-patterns`, `python-patterns`, `kotlin-patterns`, `dotnet-patterns`
- **数据库**：`postgres-patterns`, `mysql-patterns`, `redis-patterns`, `prisma-patterns`, `jpa-patterns`, `clickhouse-io`, `database-migrations`
- **移动端**：`swiftui-patterns`, `swift-concurrency-6-2`, `android-clean-architecture`, `compose-multiplatform-patterns`, `dart-flutter-patterns`

### 架构 / 工程实践

`api-design`, `architecture-decision-records`, `hexagonal-architecture`, `error-handling`, `deployment-patterns`, `docker-patterns`, `coding-standards`, `git-workflow`, `github-ops`, `mcp-server-patterns`

### AI / Agent 工程（ECC 特色）

`agentic-engineering`, `agentic-os`, `ai-first-engineering`, `autonomous-agent-harness`, `autonomous-loops`, `continuous-agent-loop`, `agent-architecture-audit`, `agent-eval`, `agent-introspection-debugging`, `team-agent-orchestration`, `prompt-optimizer`, `context-budget`, `token-budget-advisor`, `cost-aware-llm-pipeline`, `eval-harness`, `continuous-learning`(-v2)

### 测试 / 质量

`tdd-workflow`, `e2e-testing`, `browser-qa`, `ai-regression-testing`, `production-audit`, `security-review`, `security-scan`, `security-bounty-hunter`，以及各语言 `*-testing`

### 行业 / 业务领域

- **物流贸易**：`customs-trade-compliance`, `logistics-exception-management`, `carrier-relationship-management`, `returns-reverse-logistics`, `inventory-demand-planning`
- **医疗**：`healthcare-emr-patterns`, `healthcare-cdss-patterns`, `healthcare-phi-compliance`, `hipaa-compliance`
- **金融 / Web3**：`defi-amm-security`, `evm-token-decimals`, `prediction-market-*`, `llm-trading-agent-security`, `finance-billing-ops`
- **科研**：`scientific-db-pubmed-database`, `scientific-db-uspto-database`, `scientific-thinking-literature-review`

### 网络 / 运维 / Homelab

`cisco-ios-patterns`, `network-bgp-diagnostics`, `network-config-validation`, `netmiko-ssh-automation`, `homelab-*`（VLAN / WireGuard / Pi-hole / DNS 等）

### 内容 / 营销 / 设计

`article-writing`, `brand-voice`, `content-engine`, `seo`, `marketing-campaign`, `market-research`, `design-system`, `liquid-glass-design`, `motion-*`（动效系列）, `manim-video`, `remotion-video-creation`, `investor-materials`, `investor-outreach`

### 工具集成 / 平台

`exa-search`, `fal-ai-media`, `videodb`, `x-api`, `google-workspace-ops`, `email-ops`, `messages-ops`, `nutrient-document-processing`

## 小结

ECC 技能总数超过 200 个，核心思路是「命令型负责怎么做（工作流），知识型负责知道什么（领域模式）」。日常使用时只需记住几个高频命令型 skill（如 `plan`、`feature-dev`、`code-review`、`save-session`），领域知识型 skill 会在匹配任务时自动加载。

对当前这个 Nuxt 3 内容站点，最相关的知识型 skills 是 `nuxt4-patterns`、`seo`、`frontend-a11y` 与 `frontend-patterns`。
