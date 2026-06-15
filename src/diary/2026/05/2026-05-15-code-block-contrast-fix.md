---
date: 2026-05-15T00:00:00+08:00
title: "修复代码块文字与背景对比度不足的问题"
slug: code-block-contrast-fix
description: "为亮色和暗色模式分别设置代码块背景与文字颜色，解决 ContentRenderer 中代码块可读性差的问题"
---

> 记录时间：2026-05-15

## 问题

在 Nuxt Content 的 `ContentRenderer` 渲染的笔记页面中，代码块（`<pre>`）的文字颜色与背景色对比度不足，导致代码难以阅读。原始样式只有一套颜色（深色背景 `#282c34` + 浅灰文字 `#abb2bf`），没有区分亮色/暗色模式，切换主题后问题更加明显。

## 解决方案

### 核心思路：为亮色和暗色模式分别定义代码块样式

原来的 `.prose pre` 只有一套配色，无论亮色还是暗色模式都使用相同的背景和文字颜色。修复方式是将其拆分为两套：

```css
/* 亮色模式：浅背景 + 深色文字 */
.prose pre {
  overflow-x: auto;
  margin: 1em 0;
  padding: 16px 20px;
  background: #f5f5f5;
  color: #1a1a2e;
  border-radius: 6px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 暗色模式：深背景 + 亮色文字 */
html.dark .prose pre {
  background: #1e1e2e;
  color: #e0e0e8;
}
```

### 对比度变化

| 模式 | 修改前 | 修改后 |
|------|--------|--------|
| 亮色 | 未区分，对比度低 | `#f5f5f5` 背景 + `#1a1a2e` 文字，对比度 ≈ 14:1 |
| 暗色 | `#282c34` + `#abb2bf`，对比度 ≈ 4.5:1 | `#1e1e2e` + `#e0e0e8`，对比度 ≈ 10:1 |

### 修改文件

- `app/assets/css/main.css` — 修改 `.prose pre` 样式，新增 `html.dark .prose pre` 覆盖规则

## 小结

代码块样式需要跟随网站的亮色/暗色主题切换。使用 `html.dark` 选择器为暗色模式单独定义背景和文字颜色，确保两种模式下对比度都达到 WCAG AA 标准（≥ 4.5:1），推荐达到 7:1 以上以获得更好的阅读体验。
