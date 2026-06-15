---
date: 2026-06-05T00:00:00+08:00
title: "BMAD-METHOD 全面指南：从想法到上线的多 Agent 开发框架"
slug: bmad-method-guide
description: "全面介绍 BMAD-METHOD —— 一套用多个角色 Agent 接力完成调研、产品、设计、开发、验收全流程的 AI 驱动开发框架，包含安装步骤、工作流、44 个 Skill 分类，以及与 Spec Kit、Superpowers 的对比。"
---

> 记录时间：2026-06-05

## 问题

在寻找类似 Superpowers 的、能覆盖「从项目开始 → 调研 → 产品 → 设计 → 开发」完整流程的 Claude Code 工具时，BMAD-METHOD 是其中最贴合「全流程」需求的一个。本文全面介绍 BMAD 是什么、如何安装、它提供哪些能力，以及该如何选用。

## 什么是 BMAD-METHOD

BMAD（**B**reakthrough **M**ethod for **A**gile **A**I-**D**riven Development，敏捷 AI 驱动开发的突破性方法）把 AI 从「一次性写代码的助手」变成一条**结构化、可审计的工作流**，模拟一个真实的产品团队。

它要解决的核心问题是「抽象但失控」：自然语言 prompt 加速了产出，却隐藏了意图、决策历史和约束，导致难以治理的黑盒代码。BMAD 用三件事来重建控制力：

- **角色化 Agent**：把开发拆给一组专业「人格」(分析师、PM、架构师等)
- **强规划文档**：每一步产出文档，喂给下一步
- **版本化治理**：决策可追溯、可复盘

GitHub 约 37,000 stars，是仅次于 GitHub Spec Kit 的主流 spec-driven 框架。

## 核心工作流：PRD → 架构 → 开发

BMAD 最大的特点是一条**专业 Agent 流水线**，每个角色产出一个文档作为下一步的输入：

```
分析师(项目简报)→ PM(写 PRD)→ 架构师(系统设计)
→ UX(用户流程)→ Scrum Master(拆 Sprint 故事)
→ 开发(实现故事)→ QA(验收)→ 迭代(回到故事，进入下一 Sprint)
```

这种「先把所有必要文档建好并验证，再写第一行代码」的方式，确保每一步都有明确目的。

### 关键机制：文档分片(sharding)

传统 AI 编码工具会随项目变复杂而出现「上下文坍塌」—— 理解力逐渐下降，开发者不得不反复向 AI 重新解释需求，导致实现不一致、架构漂移。

BMAD 通过 **epic sharding** 解决：把规划阶段产出的完整 PRD 系统性地拆成聚焦的、自包含的开发单元，每个单元上下文独立，互不干扰。

### 新项目 vs 已有代码库

- **Greenfield(新项目)**：从高层想法一路走到成品
- **Brownfield(已有代码库)**：两种切入方式
  - Code-First：先分析现有代码，再规划改动
  - PRD-First：先定义想改什么，再映射到现有架构
  - 还提供 Flattener 工具，帮 AI 快速「吃透」现有代码库

## 安装步骤

### 前置要求

- **Node.js 20+**(安装时唯一强制要求)

### 基础交互安装

在项目目录下运行：

```bash
npx bmad-method install
```

按提示选择：

1. **Installation Type** → `Complete installation (recommended)`
2. **IDE** → `Claude Code`

### 一行非交互安装(CI/CD 或一键装)

```bash
npx bmad-method install --directory . --modules bmm --tools claude-code --yes
```

可用 `--set <module>.<key>=<value>` 覆盖任意配置，例如：

```bash
npx bmad-method install --yes --modules bmm --tools claude-code \
  --set bmm.project_knowledge=research --set bmm.user_skill_level=expert
```

### 装完生成的目录

| 目录 | 作用 |
|------|------|
| `_bmad/` | 核心 agent、任务，`bmm` 模块文件(含 `config.yaml`)，`_config/` 清单 |
| `_bmad-output/` | 生成的规划产物(PRD、架构等) |
| `.claude/commands/` | slash 命令桩，让 BMAD agent 出现在 Claude Code 命令面板 |

### 常用补充命令

```bash
npx bmad-method install --list-tools   # 查看支持的所有工具
npx bmad-method@next install           # 最新预览版(更新频繁)
npx bmad-method install                # 再跑一次即可更新，不丢自定义
```

> 提示：匿名 GitHub API 每小时限 60 次，装多了报错时设置 `GITHUB_TOKEN` 环境变量可提到 5000 次/小时。

## 全部 Skill 一览(共 44 个)

装好后 BMAD 会在 Claude Code 中注册一批 skill，按生命周期分类如下。

### 角色 Agent（可切换的「人格」）

| Skill | 角色 |
|-------|------|
| `bmad-agent-analyst` | 分析师(调研、项目简报) |
| `bmad-agent-pm` | 产品经理(写 PRD) |
| `bmad-agent-architect` | 架构师(系统设计) |
| `bmad-agent-ux-designer` | UX 设计师 |
| `bmad-agent-dev` | 开发 |
| `bmad-agent-tech-writer` | 技术文档 |

### 1. 调研 / 发现阶段

- `bmad-market-research` — 市场调研
- `bmad-domain-research` — 领域调研
- `bmad-technical-research` — 技术调研
- `bmad-brainstorming` — 头脑风暴
- `bmad-advanced-elicitation` — 深度需求挖掘
- `bmad-investigate` — 调查
- `bmad-document-project` — 给已有代码库做文档(brownfield 用)
- `bmad-generate-project-context` — 生成项目上下文

### 2. 产品 / 规划阶段

- `bmad-product-brief` — 产品简报
- `bmad-create-prd` / `bmad-prd` — 创建 PRD
- `bmad-edit-prd` — 编辑 PRD
- `bmad-validate-prd` — 校验 PRD
- `bmad-prfaq` — 亚马逊式 PR/FAQ
- `bmad-spec` — 规格

### 3. 设计阶段

- `bmad-ux` — UX 设计
- `bmad-create-architecture` — 架构设计

### 4. 拆解 / Sprint 计划

- `bmad-create-epics-and-stories` — 拆 Epic 和用户故事
- `bmad-create-story` — 创建单个故事
- `bmad-sprint-planning` — Sprint 规划
- `bmad-shard-doc` — 文档分片(把大 PRD 拆成小单元)
- `bmad-index-docs` — 文档索引

### 5. 开发阶段

- `bmad-dev-story` — 按故事开发
- `bmad-quick-dev` — 快速开发
- `bmad-check-implementation-readiness` — 检查是否可以开工
- `bmad-checkpoint-preview` — 检查点预览

### 6. 评审 / 质量阶段

- `bmad-code-review` — 代码评审
- `bmad-review-adversarial-general` — 对抗式评审
- `bmad-review-edge-case-hunter` — 边界情况猎手
- `bmad-editorial-review-prose` — 文字润色评审
- `bmad-editorial-review-structure` — 结构评审
- `bmad-qa-generate-e2e-tests` — 生成端到端测试

### 7. 迭代 / 管理

- `bmad-sprint-status` — Sprint 状态
- `bmad-correct-course` — 纠偏(中途调整方向)
- `bmad-retrospective` — 复盘
- `bmad-customize` — 自定义配置
- `bmad-party-mode` — 多 agent 协作模式

### 入口

- **`bmad-help`** — **从这里开始**，它会告诉你当前该做什么、下一步是什么。也可以直接提问，例如「bmad-help 我刚做完架构，下一步干嘛？」

## 完整实战：从立项到上线再到维护

光看 skill 列表很难体会流程，下面用一个虚构但完整的项目走一遍：**「晨间习惯打卡」Web App**（用户每天打卡晨跑/冥想/读书，看连续天数和统计）。这是一个 greenfield（全新）项目。

### 心智模型：四个阶段 + 一个故事循环

BMAD 把工作分成四个带编号的阶段（外加随时可用的 `anytime` 工具），每个阶段有「必做（required，硬门槛）」和「选做」之分：

```
1-分析 → 2-规划 → 3-方案设计 → 4-实现(故事循环) →(上线)→ 维护(回到某个阶段重来)
```

> **贯穿全程的两条铁律**
> 1. **每个 skill 都开一个全新的 context window 跑**——这是 BMAD 避免「上下文坍塌」的关键，别在一个长对话里把所有阶段做完。
> 2. **每个阶段之间先调 `bmad-help`**——它会读 `_bmad-output/` 里已生成的产物，判断你走到哪、还差什么必做项，并直接提议下一步。下面每个阶段我都从它开始。

产物分两类落盘：规划类（PRD、架构、epics…）进 `planning_artifacts`，实现类（story、测试、复盘…）进 `implementation_artifacts`（即 `_bmad-output/` 下对应目录）。

### 阶段 1 — 立项 / 分析（1-analysis）

目标：把「我想做个打卡 App」这句话，变成一份经得起推敲的产品简报。全是选做项，但 greenfield 强烈建议至少做简报。

| 步骤 | 菜单码 | Skill | 做什么 | 产物 |
|------|--------|-------|--------|------|
| ① | `BP` | `bmad-brainstorming` | 主持式头脑风暴：打卡机制、激励设计、差异点 | 头脑风暴记录 |
| ② | `MR` | `bmad-market-research` | 竞品（小日常、习惯类 App）、用户需求、趋势 | 市场调研文档 |
| ③ | `TR` | `bmad-technical-research` | 技术可行性：用 Nuxt 还是纯前端？数据存哪？ | 技术调研文档 |
| ④ | `CB` | `bmad-product-brief` | 把以上收敛成产品简报（也可换 `WB`/PRFAQ 做更狠的压力测试） | 产品简报 |

实操示例：

```
（新开对话）→ bmad-help            # 它说：你在 1-analysis，建议先 BP/MR，最终产出 CB 简报
（新开对话）→ bmad-brainstorming   # 跑完，记录落到 planning_artifacts
（新开对话）→ bmad-product-brief   # 拿前面的调研当输入，产出 product-brief
```

> 决策点：`CB`（产品简报，已笃定概念时用）和 `WB`（PRFAQ，亚马逊式「working backwards」，想被狠狠质疑时用）二选一即可。

### 阶段 2 — 产品规划（2-planning）

| 步骤 | 菜单码 | Skill | 必做？ | 说明 |
|------|--------|-------|--------|------|
| ⑤ | `PRD` | `bmad-prd` | **必做** | 教练式问答产出 PRD；同一 skill 还能编辑、按 checklist 校验并出 HTML 报告。**前置：产品简报** |
| ⑥ | `CU` | `bmad-ux` | 选做（有 UI 强烈建议） | 用户流程、界面结构。**前置：PRD** |

打卡 App 有明显界面，所以 ⑥ 也要做：

```
（新开对话）→ bmad-prd     # 产出 prd.md（必做的第一个硬门槛）
（新开对话）→ bmad-ux      # 产出 UX 设计：打卡首页、连续天数视图、统计页
```

> `bmad-prd` 是整条流水线第一个 `required=true` 的门槛。PRD 没定稿，后面架构和拆故事都会落空。

### 阶段 3 — 方案设计（3-solutioning）

这一阶段三步全是**必做**，且严格按顺序（后一步以前一步为前置）：

| 步骤 | 菜单码 | Skill | 说明 |
|------|--------|-------|------|
| ⑦ | `CA` | `bmad-create-architecture` | 把技术决策写成文档：Nuxt 3 + 本地存储 / 后端 API、数据模型、目录结构 |
| ⑧ | `CE` | `bmad-create-epics-and-stories` | 把 PRD 拆成 Epic（如「打卡核心」「统计」「提醒」）和一条条用户故事。**前置：架构** |
| ⑨ | `IR` | `bmad-check-implementation-readiness` | 对齐校验：PRD、UX、架构、Epics/Stories 是否自洽，不一致就在这里挡住。**前置：Epics** |

```
（新开对话）→ bmad-create-architecture        # 产出 architecture.md
（新开对话）→ bmad-create-epics-and-stories    # 产出 epics-and-stories
（新开对话）→ bmad-check-implementation-readiness  # 产出 readiness 报告——绿灯才动手写代码
```

> 这正是「先把所有文档建好并验证，再写第一行代码」的体现。`IR` 报告就是开工前的总检查。
> 如果 PRD/架构文档超过 ~500 行变得难管，用 `SD`（`bmad-shard-doc`）把它分片成自包含小单元——也就是前文说的 epic sharding，给开发阶段提供独立上下文。

### 阶段 4 — 实现（4-implementation，核心是「故事循环」）

先做一次 Sprint 规划，之后就是对每个故事重复一个固定循环。

**先规划（必做一次）：**

```
（新开对话）→ bmad-sprint-planning   # 产出 sprint 状态文件，排好所有故事的实现顺序
```

**然后每个故事跑一遍「故事循环」：**

```
CS 创建故事 → VS 校验故事 → DS 开发(写代码+测试) → CR 代码评审
   ├─ 评审有问题 → 回到 DS 修
   ├─ 评审通过 + Epic 还没完 → 下一个 CS
   └─ 评审通过 + Epic 完成 → ER 复盘
```

| 菜单码 | Skill | 在循环里的角色 | 必做？ |
|--------|-------|----------------|--------|
| `CS` | `bmad-create-story`（create） | 取 sprint 计划里下一个故事，准备好上下文 | **必做** |
| `VS` | `bmad-create-story`（validate） | 开发前校验故事是否就绪、完整 | 选做（建议） |
| `DS` | `bmad-dev-story` | 真正执行实现任务 + 写测试 | **必做** |
| `CR` | `bmad-code-review` | 代码评审；内部会自动跑对抗式评审 | 选做（强烈建议） |
| `QA` | `bmad-qa-generate-e2e-tests` | 为已实现代码生成 API / E2E 测试 | 选做 |

以「打卡核心」Epic 的第一个故事「用户能为今天打一次卡」为例：

```
（新开对话）→ bmad-create-story        # 取出该故事并补全上下文
（新开对话）→ bmad-create-story (VS)    # 校验：验收标准清楚吗？依赖齐了吗？
（新开对话）→ bmad-dev-story            # 写 Nuxt 组件 + composable + 测试
（新开对话）→ bmad-code-review          # 评审；不过则回 DS，过了进下一个 CS
```

随时可用的辅助：
- `SS`（`bmad-sprint-status`）——忘了进度时看一眼当前 sprint 走到哪、下一步该干嘛。
- `CK`（`bmad-checkpoint-preview`）——给某次 commit / 分支 / PR 做人类可读的变更走查，**适合上线前的人工 review**。
- `IN`（`bmad-investigate`）——开发中遇到诡异 bug，做证据分级的取证式调查。

### 上线（Launch）

BMAD 本身不负责部署（部署仍走你自己的 Nuxt `npm run generate` + Cloudflare/Vercel 那套），但它提供上线前的质量收口：

```
（新开对话）→ bmad-qa-generate-e2e-tests   # QA：补齐关键路径的 E2E 测试
（新开对话）→ bmad-checkpoint-preview       # CK：对准备上线的 PR 做最终人工走查
（新开对话）→ bmad-retrospective            # ER：Epic 收尾复盘，沉淀经验
→ 你自己的 CI/CD 部署
```

`ER`（复盘）在每个 Epic 结束时做最有价值：回顾完成的工作、教训，并决定进入下一个 Epic，或者——如果发现大方向出了问题——转去 `CC` 纠偏。

### 维护与迭代（上线后）

上线后代码库已经存在，这时项目从 greenfield 变成 **brownfield（已有代码库）**，BMAD 有专门的切入工具：

| 场景 | 菜单码 | Skill | 做什么 |
|------|--------|-------|--------|
| 让 AI 重新「吃透」现有代码 | `GPC` | `bmad-generate-project-context` | 扫描代码库生成精简的 `project-context.md`，**brownfield 必备** |
| 给老代码补文档 | `DP` | `bmad-document-project` | 分析现有项目产出有用文档 |
| 需求/方向有大变动 | `CC` | `bmad-correct-course` | 评估重大变更，给出「改 PRD / 重做架构 / 重排 sprint / 修 epics」的变更提案 |
| 临时小需求，懒得走全流程 | `QQ` | `bmad-quick-dev` | 「意图进、代码出」的一体化快速通道：澄清→规划→实现→评审 |

典型的「加个新功能（比如『好友排行榜』）」迭代路径：

```
（新开对话）→ bmad-generate-project-context  # 先让 BMAD 理解现在的代码长什么样
（新开对话）→ bmad-help                       # 问它：我要加排行榜功能，从哪开始？
（新开对话）→ bmad-prd                        # 用编辑模式把新需求并入 PRD
（新开对话）→ bmad-create-epics-and-stories   # 为新功能补 Epic / 故事
（新开对话）→ bmad-sprint-planning            # 排新 sprint
   → 再走一遍 CS → VS → DS → CR 故事循环
```

> 小修小补不必每次都走完整流水线——单个 bug 修复或一次性小需求，`QQ`（Quick Dev）一步到位即可；只有当变更足够大、会动到产品/架构层面时，才值得回到 PRD 重新走流程。

### 一图流总览

```
立项  →  BP/MR/TR  →  CB 简报
规划  →  PRD(必)   →  CU UX
方案  →  CA 架构(必) → CE 故事(必) → IR 就绪检查(必)
实现  →  SP 规划(必) → [ CS → VS → DS → CR ]×N → QA → ER
上线  →  QA + CK 走查 → 你的 CI/CD
维护  →  GPC/DP 吃透代码 → CC 纠偏 / QQ 快速开发 → 回到对应阶段
        ↑ 每一步都开新 context、阶段间先问 bmad-help
```

## 与 Spec Kit、Superpowers 的对比

| 维度 | BMAD-METHOD | GitHub Spec Kit | Superpowers |
|------|-------------|-----------------|-------------|
| 模型 | 多 Agent 角色(PM、架构师、Dev、QA…) | 单 Agent、命令驱动，用户当总指挥 | 轻量 skill，自动触发 |
| 流程 | 完整敏捷生命周期：PRD→架构→故事→开发 | 门控四阶段：Spec→Plan→Tasks→Implement | brainstorm→plan→implement→review |
| 适合 | 复杂、多仓库项目；企业级治理与可追溯 | 快速上手、规格要给人看、跨工具不锁定 | 给 Claude 加纪律、别一上来就写代码 |
| 重量 | 最重，前期投入大、控制力强 | 中等，学习曲线平缓 | 最轻 |
| Stars | ~37,000 | ~80,000 | — |

三者哲学一致：都反对「vibe coding」，用文档/规格当唯一事实来源。社区共识是「原型用 vibe code，生产代码用 spec-driven」。

## 小结

- BMAD 是「一整个产品团队装进盒子」，最适合需要完整流程(调研/PRD/架构/UX 都有专门角色)、且重视治理和可追溯的复杂项目。
- 安装只需一条 `npx bmad-method install`，选 Complete + Claude Code 即可。
- 不必记 44 个 skill 名，装完直接调用 `bmad-help`，让它带你走流程。
- 代价：这类 spec-driven 流程每个 feature 的 token 消耗比直接写代码高约 20–40%(每轮要读 spec/plan/tasks)。
- 对中小型项目(如内容驱动的静态站)而言 BMAD 可能偏重；想给单个具体功能走完整流程时，Spec Kit 或 Superpowers 往往已经够用。
