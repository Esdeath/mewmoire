---
date: 2026-05-06T00:00:00+08:00
title: "巴菲特模块侧边栏布局重构笔记"
slug: buffett-sidebar-layout
description: "记录巴菲特模块从卡片平铺改为侧边栏+文章详情双栏布局的过程，以及修复侧边栏无法滚动的三个 CSS 坑。"
---

> 记录时间：2026-05-06

## 背景

巴菲特模块有 284 篇文章（致股东信 100 篇、访谈与文章 151 篇、股东大会 33 篇），原本全部以卡片网格平铺在 `/buffett` 页面上，页面极长，浏览体验差。

目标：改为类似文档站的双栏布局——左侧固定侧边栏显示分类目录，右侧显示文章详情，两侧独立滚动。

## 实现方案

### 布局结构

```
┌──────────────────────────────────────────┐
│  Header (sticky)                         │
├──────────┬───────────────────────────────┤
│ 侧边栏    │  文章内容                      │
│ (260px)  │  (overflow-y: auto)           │
│          │                               │
│ ▼ 致股东信 │  标题 / 描述                   │
│   1956…  │  ─────────                    │
│   1957…  │  正文 (ContentRenderer)        │
│          │                               │
│ ▶ 访谈    │                               │
│ ▶ 股东大会 │                               │
│          │                               │
│ (独立滚动) │  (独立滚动)                    │
└──────────┴───────────────────────────────┘
```

### 关键文件

| 文件 | 作用 |
|------|------|
| `app/components/BuffettSidebar.vue` | 新建，侧边栏组件 |
| `app/pages/buffett/[slug].vue` | 重构为双栏布局 |
| `app/pages/buffett/index.vue` | 改为重定向到第一篇文章 |
| `app/assets/css/main.css` | 新增 `--header-h` 变量 |

## 踩过的三个坑

### 坑 1：`position: sticky` 劫持滚动

**现象：** 侧边栏内容超出屏幕后无法滚动，鼠标滚轮只滚动右侧文章区。

**原因：** 最初侧边栏使用 `position: sticky`，它仍然处于页面的滚动流中。浏览器滚动事件优先作用于页面（即右侧内容区），而不是侧边栏内部的 `overflow-y: auto` 子元素。

**修复：** 放弃 sticky 方案，改为双面板独立滚动模型：

```css
.buffett-layout {
  height: calc(100vh - var(--header-h));
  overflow: hidden;  /* 父容器不滚动 */
}

.buffett-content {
  overflow-y: auto;  /* 右侧独立滚动 */
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;  /* 左侧独立滚动 */
}
```

### 坑 2：Grid 子项 `min-height: auto` 撑破容器

**现象：** 改为双面板后侧边栏依然不滚动。

**原因：** CSS Grid 子项的默认 `min-height` 是 `auto`（由内容撑开），即使父容器有固定高度，子项也会被内容撑出去，`overflow` 无法生效。

**修复：** 给 grid 子项加 `min-height: 0`：

```css
.desktop-sidebar {
  min-height: 0;  /* 允许 Grid 子项被约束 */
}
```

### 坑 3：Vue scoped CSS `display` 属性覆盖

**现象：** 加了 `min-height: 0` 后还是不滚动。移动端抽屉正常，桌面端不行。

**原因：** 父组件 `[slug].vue` 的 scoped CSS 给 `.desktop-sidebar` 设了 `display: block`，子组件 `BuffettSidebar.vue` 给 `.sidebar` 设了 `display: flex`。两者同级优先级（都是一个 class + 一个 `[data-v-xxx]` 属性选择器），源码加载顺序决定了 `display: block` 胜出。

`display: block` 下，`flex: 1` 和 `flex-direction: column` 全部失效，`.sidebar-nav` 没有被约束高度，`overflow-y: auto` 无法触发滚动。

**修复：** 移除父组件中多余的 `display: block`：

```css
/* 之前 */
.desktop-sidebar {
  display: block;    /* 覆盖了子组件的 display: flex */
  min-height: 0;
}

/* 修复后 */
.desktop-sidebar {
  min-height: 0;     /* 只保留必要属性 */
}
```

### 额外：分类折叠状态重置

**现象：** 点击文章链接后，所有分类都自动展开。

**原因：** `<details open>` 是硬编码属性，NuxtLink 导航导致组件重新渲染，所有 `open` 重置。

**修复：** 用 Vue ref（`Set<string>`）管理每个分类的展开状态，初始只展开当前文章所在分类，通过 `@toggle` 事件同步状态。

## 经验

- **双栏独立滚动**不要用 `position: sticky`，应该让父容器固定高度 + `overflow: hidden`，两个子面板各自 `overflow-y: auto`。
- Grid 布局中如果子项需要被约束高度（内部有 `overflow` 滚动），必须给子项加 `min-height: 0`。
- Vue scoped CSS 中，父组件和子组件对同一元素设置同一属性时会产生优先级竞争。最佳实践：父组件只设置布局相关属性（`margin`、`grid-area`），不要覆盖子组件的 `display` 等核心属性。
- 调试 CSS 滚动问题时，从最内层的滚动容器开始检查：它是否有固定高度？它的每一层祖先是否都正确约束了高度？任何一层"漏掉"都会导致 `overflow` 失效。
