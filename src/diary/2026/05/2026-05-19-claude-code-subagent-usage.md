---
date: 2026-05-19T00:00:00+08:00
title: "Claude Code Subagent 使用指南与项目实例"
slug: claude-code-subagent-usage
description: "记录 Claude Code 中 subagent 的使用步骤、可用类型、并行调度方式，并以本站 notes 增加'相关阅读'模块为例说明使用收益与注意事项。"
---

> 记录时间：2026-05-19

## 问题

想搞清楚 Claude Code 里 subagent 到底怎么用：具体步骤是什么、什么时候该派出去、什么时候不该派；并希望结合本项目（学习它）给一个具体的例子，说明使用 subagent 的好处和需要注意的事项。

## 什么是 Subagent

Subagent 是一个独立的 Claude 实例，有自己的上下文窗口。主 agent 通过 `Agent` 工具派出 subagent 去完成一个**自包含的子任务**，subagent 把结果汇总成一段文字返回，主 agent 的上下文只增加这段汇总，不会被中间过程的文件内容/搜索结果撑爆。

## 可用的 Subagent 类型

| 类型 | 用途 |
|---|---|
| **Explore** | 只读搜索，定位文件 / 符号 / 关键字 |
| **Plan** | 设计实现方案，产出步骤化计划 |
| **general-purpose** | 多步研究 + 写代码的通才 |
| **claude-code-guide** | 回答 Claude Code / SDK / API 的使用问题 |
| **claude** | 兜底 |

## 使用步骤

1. **判断是否值得派出 subagent**
   - 任务自包含、可一段话描述清楚 → 适合
   - 需要读大量文件 / 跨多目录搜索 → 适合（避免污染主上下文）
   - 已知具体文件路径、只改一行 → **不适合**，直接 Read/Edit 更快
2. **挑选合适的 subagent type**：能用 Explore 就别用 general-purpose，只读任务用只读 agent。
3. **写好 prompt（关键）**：subagent 看不到主对话，prompt 必须自包含 —— 说明目标、已知信息、产出格式、字数上限。
4. **并行派单**：多个独立子任务在**同一条消息**里发多个 `Agent` 调用，它们会并行跑。
5. **核对结果**：subagent 的总结描述的是"它打算做什么"，不一定是它真做了什么。涉及代码改动时，自己再 diff 一遍。

## 项目实例：给 notes 加"相关阅读"模块

**场景**：想给 `content/notes/` 下 21 篇笔记加一个"相关阅读"模块，动手前需要搞清楚：

- 哪些笔记主题相近（Claude Code / Flutter / UI 设计 三大簇）
- 现有 frontmatter 是否已有 `related` 字段
- 笔记页 `app/pages/notes/[slug].vue` 当前如何渲染

### 不用 subagent 的做法

依次：`ls notes/` → 逐篇 Read 21 个 md 文件 → Read `[slug].vue` → Read `content.config.ts` → 然后才开始动手。主上下文会塞进 21 个文件全文 ≈ 几万 token，后面真正实现时上下文已经很拥挤。

### 用 subagent 的做法

在一条消息里**并行**派两个 Explore + 一个 Plan：

```text
Agent 1 (Explore):
  "读 content/notes/ 下全部 21 个 md 的 frontmatter，
   按主题聚类，产出'文件名 → 主题标签'的表格，300 字内"

Agent 2 (Explore):
  "查 app/pages/notes/[slug].vue 和 content.config.ts，
   报告 notes 集合的 schema 字段、当前页面渲染了哪些字段、
   是否已有 related 相关代码。200 字内"

Agent 3 (Plan):
  "基于以下假设设计'相关阅读'模块的实现方案：
   notes schema 需新增 related 字段、页面底部展示 3 条……"
```

三段汇总返回后，主上下文只多了 ~700 字，但拿到了所有决策需要的信息，可以直接进入编辑阶段。

## 好处

- **保护主上下文**：21 个文件全文留在 subagent 那边，主 agent 只看到结论。
- **并行加速**：三个任务同时跑，墙钟时间 ≈ 一个任务的时间。
- **专项能力**：Explore 自带搜索心智，Plan 自带架构思考，比通用 prompt 质量更高。

## 注意事项

1. **prompt 必须自包含**：subagent 不知道主对话发生过什么，必须把目标、背景、产出格式都写清楚。
2. **别把"理解"外包**：不要写"根据你的发现去实现 bug 修复"。综合判断由主 agent 做，subagent 只负责取信息或执行明确指令。
3. **小任务别派**：只改一行、路径已知时，Read + Edit 比派 subagent 更快也更省 token。
4. **核对实际改动**：涉及写代码的 subagent，完成后自己 `git diff` 一遍，别只信它的总结。
5. **Explore 有读窗口限制**：它读节选不读全文，不适合做"全文一致性审查"或"设计文档审计"，那种活用 general-purpose 或 review skill。
6. **避免重复劳动**：已经派给 subagent 的搜索，主 agent 就不要再搜一遍。

## 小结

Subagent 的核心价值是**上下文隔离 + 并行化**：把"读很多文件"或"跨目录搜索"这类会污染主上下文的活外包出去，让主 agent 专注于决策和编辑。判断要点是任务能否一段话讲清楚、产出能否压缩成短摘要；判断不该派的要点是路径已知、改动很小、或者需要主 agent 自己做综合判断。
