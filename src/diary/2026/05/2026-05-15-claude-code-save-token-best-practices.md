---
date: 2026-05-15T00:00:00+08:00
title: "Claude Code 省 Token 最佳实践（带案例）"
slug: claude-code-save-token-best-practices
description: "系统梳理 Claude Code 使用过程中省 token 的实战方法，覆盖模型分层、上下文管理、subagent 隔离、prompt 习惯、配置优化与 cache 友好节奏。"
---

> 记录时间：2026-05-15

## 问题

使用 Claude Code 时如何在不牺牲性能的前提下显著降低 token 消耗？需要一份带具体案例的实战手册，能直接对照执行。

## 一、模型分层使用

不同任务用不同模型，差价 5-15 倍。

| 任务类型 | 推荐模型 | 原因 |
|---|---|---|
| 架构设计、疑难 bug、代码审查 | Opus | 推理深 |
| 日常开发、重构、写功能 | Sonnet（默认） | 性价比最高 |
| 文件搜索、格式调整、改文案 | Haiku | 快且便宜 |

**案例 ❌ 浪费版：**

```
"帮我把 content/notes/ 下所有 .md 文件的 author 字段从 'rui' 改成 'Rui Min'"
→ 默认 Sonnet 跑了 30 个文件编辑，花了几万 token
```

**案例 ✅ 优化版：**

```bash
claude --model haiku
"批量替换 content/notes/*.md 里的 author: rui → author: Rui Min"
→ Haiku 一样能做，成本 1/5
```

**进阶玩法**：让 Sonnet 规划任务 + 分派 Haiku subagent 执行，主上下文只保留结论。

## 二、上下文管理（最大的隐形浪费）

每轮对话都会把**全部历史**再发一次给模型。100 轮对话不清理 = 第 100 轮要重读前 99 轮。

### 何时该 `/clear`

- 切换到完全无关的新任务时
- 一个 PR 做完，准备下一个 PR
- 调试一个 bug 超过 20 轮还没进展（清掉重新整理思路）

**案例：**

```
上午：调试登录 bug（30 轮对话，上下文 50k token）
下午想：顺便改下首页文案
❌ 不清理：每轮都带着登录调试的 50k 历史
✅ /clear 后再问：上下文从 0 开始，省 50k/轮
```

### 何时该 `/compact`

- 长任务进行到一半，发现上下文快满了
- 主动压缩比自动压缩更可控（你可以指定保留什么）

```
/compact 只保留：当前文件结构、已确定的方案、待办列表；丢掉调试中间过程
```

### 别让 Claude 读巨型文件

**❌ 反例：**

```
"读一下 package-lock.json 看看依赖"
→ 几万行涌入上下文
```

**✅ 正例：**

```
"用 grep 在 package-lock.json 里找 react 相关的版本"
→ 只返回 10 行
```

同理：日志文件用 `tail` / `grep`，大 JSON 用 `jq` 过滤后再读。

## 三、Subagent 隔离上下文（强烈推荐）

Subagent 在独立上下文里跑完，只返回**结论摘要**给主 agent。相当于把脏活外包，主上下文保持干净。

### 案例 1：代码探索

**❌ 直接搜：**

```
"在整个项目里找所有用到 useAsyncData 的地方，告诉我它们的用法模式"
→ 主上下文吞下 50 个文件片段
```

**✅ 用 Explore agent：**

```
"用 Explore agent 调研项目里 useAsyncData 的使用模式，返回总结"
→ 主上下文只多了一段 300 字总结
```

### 案例 2：并行任务

你要同时做 3 件独立的事：

- 检查 TS 类型错误
- 跑测试
- 审查最近 5 个 commit

❌ 串行让主 agent 做 → 主上下文塞满输出
✅ 一条消息里起 3 个 subagent 并行 → 各跑各的，最后汇总

### 案例 3：研究型问题

```
❌ "Nuxt 3 的 SSG 和 SSR 在 SEO 上有啥区别？"（主 agent 自己搜）
✅ "派个 general-purpose agent 调研 Nuxt 3 SSG vs SSR 的 SEO 差异"
```

## 四、Prompt 写法

### 给路径，不要让它找

**❌：** "改一下首页的标题样式"
**✅：** "改 app/pages/index.vue 第 45 行附近的 `.hero-title` 样式，字号加大到 3rem"

省的不是这一次的 token，是省**它满项目找路径的来回**。

### 一次说清，避免来回

**❌ 挤牙膏式：**

```
你：加个搜索框
Claude：好，放哪里？
你：顶部
Claude：要不要带图标？
你：要
Claude：搜索什么内容？
你：文章标题
→ 5 轮对话每轮都重读全部历史
```

**✅ 一次到位：**

```
"在 app/components/Header.vue 里加搜索框，放在 logo 右侧，
带放大镜图标，回车后跳转到 /search?q=xxx，搜索 notes 集合的 title"
```

### 复杂任务先 Plan

改 3 个文件以上、涉及架构决策时：

```
/plan 然后描述需求
```

确认方案后再写代码。**避免写完发现方向错了从头来过**（这才是最大浪费）。

简单改动（改个文案、调个样式）别开 plan mode，纯属浪费。

## 五、配置层优化（一次配好长期受益）

### Permissions allowlist

跑 `/fewer-permission-prompts` skill，让常用只读命令（`git status`、`ls`、`grep`）免确认。

**节省的不只是 token**：每次权限弹窗，Claude 都要重新组织一轮对话流。

### Hooks 自动化

比如「每次写完文件自动跑 prettier」，配 hook 而不是每次让 Claude 记得。

### `.claude/settings.json` 项目级配置

团队共享的规则放这里，比每次在 prompt 里说一遍省 token。

## 六、Cache 友好的工作节奏

Anthropic prompt cache **TTL 5 分钟**。意思是：5 分钟内连续对话，前缀重复部分**不收费或半价**。

### ❌ 反模式

做一半切去回邮件 10 分钟，回来继续 → cache 失效，全量重读。

### ✅ 正模式

集中半小时干完一个任务再切走。中途如果必须中断，回来时可以：

```
/clear 然后简述上下文重新开始
```

比让它重新加载几万 token 的历史更省。

## 七、针对本项目（学习它）的具体建议

### 1. 加新笔记/模型 → Haiku

```bash
claude --model haiku "在 content/notes/ 新建 xxx.md，按现有 frontmatter schema"
```

### 2. 调样式 → Sonnet + 具体路径

```
"调 app/assets/css/main.css 的 --color-primary，从 #xxx 改成 #yyy，
顺便确认 app/components/ 下用到这个变量的地方颜色对比度还够"
```

### 3. 内容批量处理 → Subagent

```
"派 Explore agent 检查 content/models/ 下所有 md 文件的 frontmatter，
列出缺字段的文件清单"
```

### 4. SEO/sitemap 调整 → Plan 模式

涉及 `server/routes/` 的改动会影响构建产物，先 plan 再动手。

## 小结

```
省 token = 短上下文 × 选对模型 × subagent 外包 × 减少来回
```

**优先级排序**（按性价比）：

1. 🥇 **频繁 `/clear`**（零成本，立刻见效）
2. 🥈 **Explore subagent 做探索**（保护主上下文）
3. 🥉 **简单任务切 Haiku**（5 倍价差）
4. **Prompt 一次说清**（减少对话轮数）
5. **配 permissions + hooks**（一次配好长期受益）

最容易被忽略的是「频繁 `/clear`」和「Explore agent」，这两个一起用，省得最猛。
