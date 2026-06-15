---
date: 2026-06-05T00:00:00+08:00
title: "ECC 插件用法详解与完整实战用例"
slug: ecc-plugin-usage-guide
description: "梳理 ECC（Everything Claude Code）这套 harness 原生的 agent 操作系统：安装方式、skills/agents/hooks/rules/MCP 五大能力面，以及常用斜杠命令，并给出一个从 onboarding 到提 PR 的完整开发实战流程。"
---

> 记录时间：2026-06-05

## 问题

ECC（Everything Claude Code）是什么、怎么安装和使用？它提供的 skills、agents、hooks、命令分别是干什么的？能否给出一个从需求规划到提交 PR 的完整实战用例，把这些能力串起来？

## ECC 是什么

ECC 自我定位是「a harness-native operator system for agentic work」——一套面向 AI agent 的操作系统，而不只是一堆配置文件。它把作者 10 个多月每天用 AI 写真实产品的工作流，沉淀成可复用的 skills、agents、hooks、rules、MCP 配置和遗留命令 shim。

关键特征：

- **跨 harness**：同一套能力可在 Claude Code、Codex、Cursor、OpenCode、Gemini、Zed、GitHub Copilot 等多种 agent 宿主里使用。
- **能力规模大**：当前 OSS 版本约 251 个 skills、63 个 agents、79 个遗留命令 shim，外加一批 hooks 和 MCP server。
- **MIT 开源**：仓库永久免费；另有付费的 ECC Pro（托管 GitHub App，处理私有仓库）和赞助渠道供养护项目。

> 三个公开标识符不可互换：GitHub 源仓库是 `affaan-m/ECC`，Claude 插件标识是 `ecc@ecc`，npm 包是 `ecc-universal`。

## 安装

### 推荐：插件方式（2 分钟）

```bash
# 1. 添加 marketplace
/plugin marketplace add https://github.com/affaan-m/ECC

# 2. 安装插件
/plugin install ecc@ecc

# 3. 重载使其生效
/reload-plugins
```

安装后会看到类似 `Reloaded: ... skills · ... agents · ... hooks · ... MCP servers` 的提示，说明各能力面已加载。

### 重要原则：不要叠加安装方式

最常见的故障是先 `/plugin install`、又跑 `install.sh --profile full`（或 `npx ecc-install --profile full`），会把同样的 skills/hooks 复制进用户目录，造成重复。**插件路径下只手动拷你需要的 `rules/` 目录**即可：

```bash
git clone https://github.com/affaan-m/ECC.git && cd ECC
mkdir -p ~/.claude/rules/ecc
cp -R rules/common ~/.claude/rules/ecc/        # 通用规则，建议必装
cp -R rules/typescript ~/.claude/rules/ecc/    # 再按需加一个语言包
```

### 低上下文 / 不要 hooks

如果觉得 hooks 太「全局」，用最小手动 profile（不含 `hooks-runtime`）：

```bash
./install.sh --profile minimal --target claude
```

### 不确定装哪个？问内置顾问

```bash
npx ecc consult "security reviews" --target claude
```

它会返回匹配的组件、相关 profile 以及预览/安装命令。

## 五大能力面

| 能力面 | 作用 | 形态 |
|--------|------|------|
| **Skills** | 主要工作流入口，可直接调用、自动建议、被 agent 复用 | `skills/*/SKILL.md` |
| **Agents** | 受委派的专职角色（如 planner、code-reviewer、security-reviewer） | `agents/*.md` |
| **Hooks** | 在工具事件（Edit/Bash 等）上触发的护栏与检查 | `hooks/hooks.json` |
| **Rules** | 始终遵守的准则，分 `common/`（语言无关）+ 各语言目录 | `rules/` |
| **MCP** | 外接能力（context7 文档、exa 搜索、github、playwright 等） | MCP server |

其中 **skills 是规范的工作流入口**，命令 shim 只是迁移期的兼容层；新工作流优先以 skill 形式落地。

### Hooks 是什么感觉

Hooks 会在你操作时主动拦截。例如 ECC 的 GateGuard 会在本会话第一次跑 Bash 前要求你先声明「这条命令验证/产出什么」（fact-forcing gate），逼你把意图讲清楚再执行。可用 `ECC_GATEGUARD=off` 或 `ECC_DISABLED_HOOKS` 临时关闭。

## 常用命令速查

| 我想做… | 用这个 | 背后的 agent |
|---------|--------|--------------|
| 规划新功能 | `/ecc:plan "Add auth"` | planner |
| 先写测试再写代码 | `tdd-workflow` skill | tdd-guide |
| 审查刚写的代码 | `/code-review` | code-reviewer |
| 修复构建失败 | `/build-fix` | build-error-resolver |
| 跑端到端测试 | `e2e-testing` skill | e2e-runner |
| 找安全漏洞 | `/security-scan` | security-reviewer |
| 清理死代码 | `/refactor-clean` | refactor-cleaner |
| 更新文档 | `/update-docs` | doc-updater |
| 探索/熟悉一个新项目 | `/project-init`、`codebase-onboarding` skill | — |
| 检查仓库就绪度 | `/harness-audit` | — |
| 找对应的 ECC 能力 | `/ecc-guide find: <关键词>` | — |

`/ecc-guide` 本身是一张「能力地图」：无参数给菜单，`/ecc-guide skills` 看 skills 概览，`/ecc-guide find: oauth` 跨 skills/commands/agents/rules 搜索。

## 完整实战用例：给本站加一个「笔记标签」功能

下面把 ECC 的能力面串成一条从零到 PR 的开发流程，以本 Nuxt 内容站为例。

### 第 0 步：熟悉项目

```text
/project-init
```

让 ECC 做 stack 感知的 onboarding，识别出这是 Nuxt 3 + Vue 3 + Markdown 内容站，把约定（content collections、file-based routing）摸清楚，避免后续乱改。

### 第 1 步：规划

```text
/ecc:plan "给 notes 集合加 tags 字段，并新增 /tags/[tag] 标签聚合页"
```

planner agent 会产出实现蓝图：要改 `content.config.ts` 的 Zod schema、加 frontmatter 字段、写 `app/pages/tags/[tag].vue`、用 `queryCollection()` 过滤、补 sitemap。先看蓝图、确认方向，再动手。

### 第 2 步：测试先行

```text
tdd-workflow skill
```

tdd-guide 强制「先写失败测试（RED）→ 最小实现（GREEN）→ 重构（IMPROVE）→ 验证覆盖率」。哪怕本项目没有现成测试框架，这一步也会先把「标签过滤应返回哪些笔记」的预期固化下来。

### 第 3 步：实现

按蓝图改 schema、页面、查询逻辑。期间若构建报错：

```text
/build-fix
```

build-error-resolver 用最小 diff 把 TypeScript / 构建错误修绿，不做架构性改动。

### 第 4 步：自审与安全

```text
/code-review
/security-scan
```

code-reviewer 检查正确性、复用与简化空间；security-reviewer 扫注入、SSRF、密钥泄漏等。内容站重点关注 Markdown 渲染与动态路由是否引入 XSS。

### 第 5 步：文档与提交

```text
/update-docs
/pr
```

doc-updater 同步 README / 文档，`/pr` 整理出规范的 PR 标题与描述。

> 这条链路的核心顺序：**先想（plan）→ 先测（tdd）→ 再写 → 后审（review/security）→ 才提（pr）**，与 ECC 的设计哲学一致——把意图前置、把验证前置，而不是写完再补。

## 小结

ECC 不是单纯的配置集合，而是一套把「真实 agent 开发工作流」产品化的操作系统：用 **skills** 承载工作流、**agents** 承载专职角色、**hooks/rules** 承载护栏、**MCP** 承载外接能力。

实用建议：

- 用插件方式安装，**不要再叠加 full 安装**，rules 按需手动拷。
- 不确定用什么就 `/ecc-guide find:` 或 `npx ecc consult`。
- 真正干活时，让 `/ecc:plan → tdd-workflow → /code-review → /security-scan → /pr` 这条链路替你把流程跑顺。
