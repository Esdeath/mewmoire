---
date: 2026-06-05T00:00:00+08:00
title: "Superpowers 插件全部 Skill 作用详解"
slug: superpowers-plugin-skills
description: "梳理 Claude Code 的 Superpowers 插件 14 个 Skill 的作用，按需求规划、执行、调试、审查收尾等开发工作流阶段分组，呈现其先想后做、先测后写、先验证后宣称完成的设计理念。"
---

> 记录时间：2026-06-05

## 问题

Claude Code 安装了 Superpowers 插件后，想了解它提供的所有 Skill 分别是做什么的，以及它们之间如何配合。

## Skill 总览

Superpowers 插件共提供 14 个 Skill。直接从各 Skill 的 frontmatter 描述提炼，按「开发工作流的阶段」分组如下。

### 入口 / 元能力

| Skill | 作用 |
|-------|------|
| **using-superpowers** | 整套体系的入口。规定在任何对话开始时，先查找并调用合适的 Skill，再回应——确保其他 Skill 被正确触发。 |
| **writing-skills** | 用来创建、编辑、验证 Skill 本身（写新技能或改进已有技能的「元技能」）。 |

### 需求与规划阶段

| Skill | 作用 |
|-------|------|
| **brainstorming** | 任何创造性工作（做新功能、建组件、改行为）**之前**必用。先厘清意图、需求和设计，再动手写代码。 |
| **writing-plans** | 当有了规格 / 需求、要做多步骤任务时，在碰代码前先写出一份结构化的实施计划。 |

### 执行阶段

| Skill | 作用 |
|-------|------|
| **executing-plans** | 拿着一份写好的实施计划，在独立会话里逐步执行，并带有审查检查点。 |
| **subagent-driven-development** | 在当前会话内，把计划里相互独立的任务交给子代理来实现。 |
| **dispatching-parallel-agents** | 面对 2 个以上彼此独立、无共享状态 / 无先后依赖的任务时，并行派发多个代理同时处理。 |
| **using-git-worktrees** | 开始需要隔离的功能开发（或执行计划）前，创建独立的 git worktree，带智能目录选择和安全校验，避免污染当前工作区。 |
| **test-driven-development** | 实现任何功能或修 bug 时，先写测试再写实现（TDD 流程）。 |

### 调试

| Skill | 作用 |
|-------|------|
| **systematic-debugging** | 遇到任何 bug、测试失败或异常行为时，在提出修复方案之前，先用系统化方法定位根因。 |

### 审查与收尾阶段

| Skill | 作用 |
|-------|------|
| **requesting-code-review** | 任务完成、实现重要功能、或合并前，主动发起代码审查以核验是否满足需求。 |
| **receiving-code-review** | 收到审查反馈后、动手改之前使用。强调技术上的严谨核实——尤其当反馈不清晰或可疑时，不盲从、不敷衍式同意。 |
| **verification-before-completion** | 在声称「完成 / 已修复 / 通过」之前必用。要求先真正运行验证命令、确认输出，**先有证据再下结论**。 |
| **finishing-a-development-branch** | 实现完成、测试通过后，引导决定如何收尾整合工作——给出合并、提 PR 或清理分支等结构化选项。 |

## 设计思路

这套 Skill 构成一条强制的开发纪律链：

```
brainstorming（想清楚）
  → writing-plans（写计划）
  → worktree / TDD / 子代理（隔离地实现）
  → systematic-debugging（理性排错）
  → verification（用证据验收）
  → code-review（审查）
  → finishing-branch（收尾）
```

## 实战示例：从立项到上线维护的完整流程

下面用一个贯穿始终的真实场景，演示这些 Skill 在一个功能的**完整生命周期**里如何被一个个触发、如何配合。

> **场景**：给本网站（Nuxt 3 内容站）新增一个「笔记全文搜索」功能——用户能在站内输入关键词，实时检索所有笔记标题与正文并跳转。

整个过程分成五个阶段：立项澄清 → 计划 → 隔离实现 → 验证审查 → 收尾上线，最后是上线后的维护与迭代。

### 阶段 0：立项与需求澄清 —— `brainstorming`

不要一上来就写代码。任何「做个新功能」的请求都先进 `brainstorming`，把模糊想法逼成清晰规格。

```
你：我想给网站加个笔记搜索功能。
Claude：[调用 brainstorming]
```

这一步要逼出来的关键问题：

- **范围**：只搜标题，还是标题 + 正文 + 描述？要不要搜 models 集合，还是只搜 notes？
- **交互**：独立搜索页 `/search`，还是顶栏一个搜索框 + 下拉结果？
- **技术约束**：本站是 **SSG 静态生成**（`npm run generate`），没有后端服务器——所以搜索必须是**纯前端**的（构建期生成索引 JSON，客户端用 Fuse.js 之类做模糊匹配），不能依赖服务端接口。
- **验收标准**：输入「复利」能秒级返回所有相关笔记并高亮命中。

> 产出：一份双方确认的需求规格。**这一步省下的返工，比后面所有阶段加起来都多。**

### 阶段 1：写实施计划 —— `writing-plans`

需求清晰后，进 `writing-plans`，把它拆成有顺序、可验证的步骤，落成一份计划文档（而不是直接动手）。

一份合格的计划长这样：

```markdown
## 笔记搜索功能实施计划

1. 构建期生成搜索索引
   - 在 content.config.ts 确认 notes 集合字段
   - 写一个 Nitro 预渲染钩子 / server route，输出 /search-index.json
   - 验证：generate 后 .output/public/search-index.json 存在且含全部笔记

2. 搜索 UI 组件
   - app/components/SearchBox.vue：输入框 + 结果下拉
   - 集成 Fuse.js 做模糊匹配 + 命中高亮
   - 验证：本地 dev 下输入关键词有实时结果

3. 接入布局
   - 在 default.vue 顶栏挂载 SearchBox
   - 验证：每个页面都能用

4. SEO / 可访问性
   - 键盘可导航、aria 标签
   - 验证：Tab 能聚焦、Esc 能关闭
```

> 产出：一份 `plans/notes-search.md`。每一步都自带「验证」子句——这是为后面 `verification` 埋的伏笔。

### 阶段 2：隔离地实现

#### 2a. 开 worktree —— `using-git-worktrees`

动代码前，先用 `using-git-worktrees` 拉一个独立工作区，避免污染主分支、便于随时丢弃：

```bash
# Skill 会带安全校验地创建，类似：
git worktree add ../website_investor-search -b minrui/notes-search
```

#### 2b. 先写测试 —— `test-driven-development`

每个步骤都遵循 TDD：**先写一个会失败的测试，再写实现让它通过**。比如索引生成逻辑：

```ts
// 先写测试（RED）
test('search index includes every note', async () => {
  const index = await buildSearchIndex()
  expect(index.length).toBe(allNotes.length)
  expect(index[0]).toHaveProperty('title')
  expect(index[0]).toHaveProperty('body')
})
// → 运行，失败 → 再写 buildSearchIndex 实现 → 跑绿（GREEN）→ 重构（REFACTOR）
```

#### 2c. 多任务并行 —— `subagent-driven-development` / `dispatching-parallel-agents`

计划里有些步骤彼此独立、无共享状态，可以并行派发子代理同时做，缩短墙钟时间：

- 代理 A：写 `SearchBox.vue` 组件
- 代理 B：写索引生成的 server route
- 代理 C：补可访问性测试

> 判断标准：**只有当任务之间没有先后依赖、不碰同一批文件时**才并行；否则按计划串行，让前一步的产物喂给后一步。

### 阶段 3：理性排错 —— `systematic-debugging`

实现途中必然踩坑。比如：`npm run generate` 后 `/search-index.json` 是空的。

不要瞎改。进 `systematic-debugging`，先定位根因再谈修复：

```
1. 复现：generate 后 cat .output/public/search-index.json → 确实是 []
2. 假设：queryCollection 在构建钩子里执行时机太早，content 还没就绪
3. 验证假设：在钩子里打日志，确认拿到的 notes 数组长度为 0
4. 根因：钩子挂在了错误的 Nitro 生命周期事件上
5. 修复：改挂到 'prerender:routes' 之后 → 再次验证不为空
```

> 核心：**先有证据指向根因，再动手**，而不是「试试这个、试试那个」。

### 阶段 4：验证与审查

#### 4a. 用证据验收 —— `verification-before-completion`

在说「做完了」之前，进 `verification-before-completion`，**真正跑命令、看输出**：

```bash
npm run typecheck          # 类型无误
npm run generate           # 构建成功
ls .output/public/search-index.json   # 索引存在
npm run preview            # 起预览，手动搜「复利」确认有结果
```

只有每条命令都给出预期输出，才算通过——不靠「我觉得应该没问题」。

#### 4b. 发起 & 接收审查 —— `requesting-code-review` / `receiving-code-review`

- `requesting-code-review`：主动发起审查，核对是否满足阶段 0 定下的验收标准。
- `receiving-code-review`：拿到反馈后**先核实再改**。比如审查者说「Fuse.js 太重，应该自己写匹配」——不盲从，先验证 bundle 体积影响，确认建议成立才采纳；不合理就摆证据反驳。

### 阶段 5：收尾上线 —— `finishing-a-development-branch`

测试全绿、审查通过后，进 `finishing-a-development-branch`，它会给出结构化的收尾选项：

```
- 合并到 master？
- 提一个 PR 等人 review？
- 清理 worktree 和临时分支？
```

选「提 PR」→ 合并 → 触发部署（本站为 Cloudflare Pages / Vercel 静态部署）→ 功能正式上线。

```bash
# 收尾后清理隔离工作区
git worktree remove ../website_investor-search
```

### 阶段 6：上线后的维护与迭代

功能上线**不是终点**。后续每一次维护，仍然复用同一套纪律链——只是规模更小：

| 维护场景 | 触发的 Skill |
|----------|-------------|
| 用户反馈「搜中文标点会漏」这个 bug | `systematic-debugging`（定位根因）→ `test-driven-development`（写一个能复现的失败测试再修）→ `verification`（确认修好） |
| 想加「搜索结果高亮」增强 | `brainstorming`（小范围澄清）→ 直接小步实现 → `verification` |
| 重构索引生成逻辑 | `writing-plans`（若改动大）→ `using-git-worktrees` 隔离 → TDD 保证行为不变 |
| 例行依赖升级后回归 | `verification-before-completion`（跑全套构建 + 预览确认没回归） |

> **关键认知**：维护期不是「跳过流程随手改」，而是**同一条链的轻量循环**。bug 修复尤其要走 `debugging → TDD → verification`，否则容易按下葫芦浮起瓢。

### 一图看懂这个例子里的 Skill 触发顺序

```
立项   brainstorming
  │
计划   writing-plans
  │
实现   using-git-worktrees → test-driven-development
       └─（独立任务）→ subagent-driven-development / dispatching-parallel-agents
  │
排错   systematic-debugging
  │
验收   verification-before-completion
审查   requesting-code-review → receiving-code-review
  │
上线   finishing-a-development-branch
  │
维护   （回到 debugging / brainstorming，轻量循环）
```

## 小结

Superpowers 的核心理念是 **先想后做、先测后写、先验证后宣称完成**：用流程约束来取代「想当然」，从而减少返工。14 个 Skill 并非孤立工具，而是覆盖了从需求澄清到分支收尾的完整开发生命周期，每个阶段都有对应的纪律性 Skill 把关。
