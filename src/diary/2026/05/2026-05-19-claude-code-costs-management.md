---
date: 2026-05-19T00:00:00+08:00
title: "Claude Code 费用管理与成本追踪指南"
slug: claude-code-costs-management
description: "整理 Claude Code 官方费用管理文档，覆盖 /cost 命令、订阅与 API 用户的差异、成本计算原理、prompt cache 折扣、subagent 成本陷阱，以及团队部署的费用治理。"
---

> 记录时间：2026-05-19
>
> 参考：[Claude Code 官方文档 - 有效管理成本](https://code.claude.com/docs/zh-CN/costs)

## 问题

Claude Code 用一段时间后，账单看不太懂——`/cost` 显示的金额到底是什么口径？订阅用户和 API 用户的费用追踪方式有何不同？怎么把日常使用成本压到合理水位？需要一份对照官方文档的速查笔记。

## 一、`/cost` 命令：会话级费用快照

在 Claude Code 中输入 `/cost`，会得到当前会话的 token 用量与估算费用，典型输出包含：

- **Total cost**：当前会话累计成本（美元）
- **Total duration (API)**：API 调用耗时
- **Total duration (wall)**：实际墙钟时长（含等待）
- **Total code changes**：本会话改动行数
- 按模型拆分的 token 用量：输入、输出、cache read、cache write、各自小计

注意几点：

- 这个金额是 Claude Code **在本地按公开费率估算的**，与最终账单可能有差异；权威数据看 [Claude Console Usage](https://console.anthropic.com)。
- 如果会话中切过模型（如先 Opus 分析、后 Sonnet 实现），每个模型分别列出。
- `/resume` 恢复会话时成本数据会被一起恢复，保持连续；新会话从零开始。

## 二、订阅 vs API：用对命令

官方文档明确：`/cost` 主要为 **API 计费**用户设计。Pro / Max 订阅用户用错命令会被金额误导。

| 你想知道什么 | 用哪个命令 | 适用对象 |
|---|---|---|
| 本会话花了多少美元 | `/cost` | API 用户 |
| 订阅配额还剩多少 | `/usage` 或 `/status` | Pro / Max 订阅 |
| 历史使用模式 | `/stats` | 所有用户 |

口诀：**花费看 `/cost`，配额看 `/usage`，模式看 `/stats`。**

## 三、成本计算公式

```text
Cost =  输入 tokens      × 输入单价
      + 输出 tokens      × 输出单价
      + cache read       × (输入单价 × 10%)
      + cache write      × cache write 单价
      + Web 搜索请求数   × $0.01
```

几个值得记住的细节：

- **Cache read 只算输入价的 10%**。Claude Code 会大量缓存系统 prompt、CLAUDE.md 等长上下文，重复加载几乎免费。
- **Opus 4.6 `/fast` 模式单价是 6 倍**——同模型、更快输出、但每 token 贵 6 倍。短任务可用，长会话别开。
- 每次 API 调用结束后，Claude Code 从响应里读取实际 token 数，乘以模型单价累加到会话总额。

## 四、真实成本水位（企业部署数据）

参考 Anthropic 公布的企业部署数据：

- 开发者**日均成本约 13 美元**
- 90% 的用户**日均 < 30 美元**
- 单会话差异极大：用 Sonnet 4.6（输入 $3/M，输出 $15/M）读 10 万 token 代码 + 生成 2 万 token，约 $0.60

单个会话只要不失控，整月开销并不夸张。

## 五、压低 Token 消耗的杠杆

### 1. 用 `/effort` 调推理深度

四档：`low` / `medium` / `high`（默认）/ `max`（仅 Opus 4.6）。低 effort 每次互动消耗的 thinking token 显著降低，适合机械任务。

### 2. 把 context window 当成持续计费的电表

每条消息、每次文件读取、每个工具输出都留在 context 里，**后续每轮互动都重新发送一次**。2 小时的会话累积 10 万+ token 很常见。

实用节奏：

- **70% 水位 `/compact`**：压缩历史，降低后续输入 token
- **任务切换时 `/clear`**：彻底清空，避免无关上下文继续被计费
- 一整天保持 context 在 40–60% 区间，单日成本能压下来一大截

### 3. 写好 CLAUDE.md 让 prompt cache 干活

把项目规则、技术栈、命令清单等稳定内容放进 CLAUDE.md，每轮调用都走 cache read（10% 价），相当于把固定上下文成本打了一折。

### 4. 谨慎用 subagent

每个 subagent 是独立 Claude 实例，有独立 context window。主 agent + 3 个 subagent 的 token 消耗约等于单会话的 **4 倍**。只在真的需要并行 / 隔离 context 时用。

## 六、团队部署的费用治理

Anthropic Team 计划提供个人订阅没有的费用管控能力：

- 集中计费、统一发票
- 使用仪表板（按成员、按工作区维度）
- **工作区支出限制**：管理员可对单个 workspace 设上限
- 域名捕获自动加入团队成员
- 管理员可控制成员能访问哪些模型 / 功能

**TPM（tokens per minute）配额规划参考**：

| 团队规模 | 建议每位用户 TPM |
|---|---|
| 5–20 人 | 100,000 – 150,000 |
| 50–100 人 | 25,000 – 35,000 |

人多了反而单人 TPM 可以下调——并发使用率随团队规模下降。

## 七、跨会话历史追踪

`/cost` 只看当前会话。要做跨日 / 跨项目分析，可以借助社区工具：

- [**ccusage**](https://github.com/ryoppippi/ccusage)：读取本地 JSONL 日志，按日期、会话、项目聚合
- **Claude-Code-Usage-Monitor**：实时仪表板，含 token 曲线和限额预测

## 小结

- 把 `/cost`、`/usage`、`/stats` 三个命令分清楚
- 默认开 `/effort medium`，长会话 70% 水位 `/compact`、切任务 `/clear`
- CLAUDE.md 写好走 cache，比省任何技巧都狠
- subagent 是 4 倍油耗的工具，按需启动
- 团队部署用 workspace 限额 + TPM 规划，不要靠人肉自觉

把这五条变成肌肉记忆，月底账单基本就能稳定在可预测区间。
