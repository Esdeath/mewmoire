---
date: 2026-05-06T00:00:00+08:00
title: "修复巴菲特模块 SSG 预渲染 500 错误"
slug: fix-buffett-prerender-500
description: "记录巴菲特模块全部页面在 npm run generate 时返回 500 的排查过程、根本原因和修复方案。"
---

> 记录时间：2026-05-06

## 问题

运行 `./deploy.sh`（内部执行 `npm run generate`）时，巴菲特模块全部 284 个页面预渲染失败，返回 `[500]` 错误，导致构建中断：

```
[nitro]   ├─ /buffett/2005年伯克希尔股东大会 (507ms)
  │ ├── [500]
  │ └── Linked from /buffett
```

其他模块（思维模型、大道总纲、个人笔记）均正常生成。

## 原因

**根本原因：Markdown 文件的 slug 使用了中文字符。**

巴菲特模块的 slug 形如 `2005年伯克希尔股东大会`，URL 路径中包含非 ASCII 字符。Nuxt/Nitro 在 SSG 预渲染阶段处理这类 URL 时失败，返回 500。

对比其他正常的模块：

| 模块 | slug 示例 | 预渲染结果 |
|------|----------|-----------|
| 大道总纲 | `benfen`、`anquanbianji` | 正常 |
| 个人笔记 | `flutter-interview` | 正常 |
| 思维模型 | `fail-safe` | 正常 |
| 巴菲特 | `2005年伯克希尔股东大会` | 500 |

此外，有 2 个文件的 slug 包含 `--`（双连字符），如 `巴菲特：2023年初学者如何投资--3 条简单的规则`。`--` 是 SQL 注释语法，触发了 Nuxt Content 的安全检查，报错 `Invalid query: SQL comments are not allowed`。

### 排查过程中的干扰项

- 开发模式（`npm run dev`）下页面正常返回 200，问题仅在预渲染阶段出现。
- Nitro 的预渲染日志只显示 `[500]`，不输出具体错误信息，需要手动添加 server plugin 捕获错误。
- 即使把 `[slug].vue` 页面组件清空为空模板，500 依然存在，说明问题不在页面逻辑而在 URL 层面。

## 修复

使用 `transliteration` 库将 284 个文件批量处理：

1. **frontmatter `slug` 字段**：中文转拼音（如 `2005年伯克希尔股东大会` → `2005nian-bo-ke-xi-er-gu-dong-da-hui`）
2. **文件名**：同步重命名为对应拉丁化名称

修复后 `npm run generate` 成功预渲染 936 个路由，零错误。

## 经验

- Nuxt Content v3 的 SSG 预渲染对 URL 中的非 ASCII 字符支持有问题，slug 应始终使用拉丁字母。
- slug 中避免使用 `--`，它会被 Nuxt Content 的 SQL 层识别为注释语法并拒绝执行。
- 开发模式正常不代表生产构建正常，涉及新模块时应尽早跑一次 `npm run generate` 验证。
