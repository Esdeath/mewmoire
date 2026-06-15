---
date: 2026-05-08T00:00:00+08:00
title: "沉浸式阅读网站设计实践"
slug: immersive-reading-design
description: "为思维模型网站设计沉浸式阅读体验，涵盖排版规范、主题切换、自动隐藏导航栏等完整方案。"
---

> 记录时间：2026-05-08

## 问题

为一个基于 Nuxt 3 + Vue 3 的中文内容网站（多元思维模型）设计沉浸式阅读体验。网站以 Markdown 长文为主要内容，需要在排版、配色、交互上全面优化阅读舒适度。

## 设计方向：墨韵（Ink Charm）

整体走温润的书卷气路线，不是冰冷的科技感，而是像翻开一本好书的感觉。

### 核心排版规范

| 项目 | 规范 |
|------|------|
| 中文字体 | 霞鹜文楷（LXGW WenKai TC）—— 温润不刺眼 |
| 英文/数字 | Inter |
| 正文字重 | 400（常规），拒绝粗黑生硬 |
| PC 正文字号 | 17-18px |
| 移动端正文字号 | 16px |
| 行高 | 1.7-1.8（长文不累眼） |
| 段间距 | 上下 1em，留白透气 |
| 首行缩进 | 全局禁止（网文阅读更舒服） |

### 配色方案

**浅色模式：**
- 文字 `#2c2c2c`（非纯黑，护眼）
- 背景 `#fafafa`（低饱和灰白）
- 链接 `#4a7cad`（低饱和蓝，不浮夸）

**深色模式：**
- 文字 `#e5e5e5`
- 背景 `#1a1a1a`（低饱和灰，不刺眼）
- 代码块 `#282c34` 柔和暗色背景

### 标题层级设计

h1 → h6 逐级缩小，不超大加粗，font-weight 统一用 600：

```css
.prose h1 { font-size: 24px; }
.prose h2 { font-size: 20px; }
.prose h3 { font-size: 17px; }
.prose h4 { font-size: 15px; }
.prose h5, .prose h6 { font-size: 14px; }
```

标题和正文之间间距拉开，层级清晰。

### 细节处理

- **图片**：`width: 100%` 自适应 + `border-radius: 6px` 圆角
- **引用块**：浅底色 `var(--surface)` + 左边 3px 细线，不抢视觉
- **代码块**：柔和暗色背景，`white-space: pre-wrap` 自动换行 + `overflow-x: auto` 横向滚动
- **表格/列表**：紧凑但不拥挤

## 交互增强

### 阅读进度条

页面顶部 2px 细条，accent 色，跟随滚动进度缩放：

```typescript
const readingProgress = ref(0)
// 在 scroll 事件中
readingProgress.value = scrollY / (docHeight) // 0~1
```

```html
<div class="reading-progress-bar"
  :style="{ transform: `scaleX(${readingProgress})` }" />
```

### 自动隐藏导航栏

向下滚动超过 200px 后隐藏 header，向上滚动立即恢复。配合毛玻璃效果：

```css
.header {
  backdrop-filter: blur(12px) saturate(1.2);
  transition: transform 0.35s ease;
}
.header--hidden {
  transform: translateY(-100%);
}
```

### 亮色/暗色切换

- 使用 `html.dark` class 控制，替代 `prefers-color-scheme` media query
- localStorage 持久化用户偏好
- nuxt.config 注入内联脚本防止页面闪烁（FOUC）
- 按钮放在导航栏右侧，日/月图标带旋转过渡动画

```typescript
// composables/useTheme.ts
function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
}
```

### 文章目录（TOC）布局

TOC 放在文章右侧比左侧更合理：
- 主内容左对齐符合阅读视线起点
- 目录作为辅助导航放右侧不干扰阅读流
- hover 时右边线高亮（`border-right` 而非 `border-left`）

## 小结

沉浸式阅读的核心不是花哨的动效，而是让读者忘记界面的存在。关键原则：
1. **字体温润**：霞鹜文楷给中文长文最舒适的阅读感
2. **配色克制**：非纯黑文字、低饱和背景、低调链接色
3. **间距透气**：1em 段间距、1.8 行高，长文不累
4. **交互隐身**：导航自动隐藏、进度条极细、主题切换不突兀
