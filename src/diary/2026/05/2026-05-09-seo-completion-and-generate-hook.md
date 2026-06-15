---
date: 2026-05-09T00:00:00+08:00
title: "SEO 缺失项补全与 generate 产物自动同步"
slug: seo-completion-and-generate-hook
description: "梳理网站 SEO 关键词分布，补全 meta keywords、Twitter Card、JSON-LD 结构化数据等缺失项，并配置 PostToolUse hook 实现 generate 后自动同步产物。"
---

> 记录时间：2026-05-09

## 问题

1. 梳理本站 SEO 关键词分布在哪些地方
2. 将分析出的 SEO 缺失项全部实现（keywords、Twitter Card、JSON-LD、ogImage、全局默认 meta、面包屑 Schema）
3. 每次 `npm run generate` 后自动将 `.output/public/` 复制到部署仓库 `mental-model-public/`

## SEO 关键词分布分析

### 现有分布层级

| 层级 | 位置 | 内容 |
|------|------|------|
| 全局配置 | `nuxt.config.ts` | `lang: zh-CN`、favicon、字体预加载 |
| 内容 Schema | `content.config.ts` | 定义 `seoTitle` / `seoDescription` 字段 |
| Markdown frontmatter | `content/**/*.md` | 每篇文章的 `seoTitle` + `seoDescription`（关键词最密集） |
| 静态页面 | `pages/*.vue` | 硬编码 `title` / `description` / OG 标签 |
| Composable | `useArticlePage.ts` | 动态文章页的 SEO 复用逻辑 |
| 服务端路由 | `server/routes/` | `sitemap.xml` / `robots.txt` 动态生成 |

### 缺失项（改动前）

- `<meta name="keywords">` — 未设置
- Twitter Card (`twitter:card`) — 未设置
- JSON-LD 结构化数据 — 未实现
- `ogImage` — 未设置
- 全局默认 `title` / `description` — 未设置
- 面包屑 BreadcrumbList Schema — 未实现

## SEO 缺失项实现

### 全局配置 — `nuxt.config.ts`

在 `app.head.meta` 中添加：

```ts
{ name: 'keywords', content: '段永平,大道,芒格,查理芒格,巴菲特,价值投资,安全边际,商业模式,生意模式,企业文化,管理层,价值观,能力圈' },
{ name: 'description', content: '整理跨学科思维模型，用普通读者能理解的方式解释判断、决策、系统和心理误判。' },
{ property: 'og:site_name', content: '多元思维模型' },
{ property: 'og:locale', content: 'zh_CN' },
```

在 `app.head.script` 中添加 WebSite JSON-LD：

```ts
{
  type: 'application/ld+json',
  innerHTML: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '多元思维模型',
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://munger-models.example.com',
    description: '整理跨学科思维模型…',
    inLanguage: 'zh-CN'
  })
}
```

### 页面级 — Twitter Card + ogImage

所有页面的 `useSeoMeta()` 追加两个字段：

```ts
twitterCard: 'summary',
ogImage: '/og-image.png'
```

涉及 6 处：`index.vue`、`library/index.vue`、`notes/index.vue`、`about.vue`、`library/[slug].vue`、`useArticlePage.ts`。

### 文章页 — Article + BreadcrumbList JSON-LD

在 `library/[slug].vue` 和 `useArticlePage.ts` 的 `useHead()` 中注入两段结构化数据：

```ts
// Article schema
{ '@type': 'Article', headline: title, description, url, inLanguage: 'zh-CN' }

// BreadcrumbList schema
{ '@type': 'BreadcrumbList', itemListElement: [
  { position: 1, name: '首页', item: siteUrl },
  { position: 2, name: '价值投资', item: `${siteUrl}/library` },
  { position: 3, name: page.title }
]}
```

## generate 产物自动同步

### Claude Code Plan 文件存储位置

Plan 文件保存在用户主目录 `~/.claude/plans/` 下（全局），不在项目的 `.claude/` 中。如需保留某次 plan，可手动复制到项目目录。

### PostToolUse Hook 配置

在 `.claude/settings.local.json` 中添加 hook，在 `npm run generate` 完成后自动 rsync：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(jq -r '.tool_input.command' 2>/dev/null); if echo \"$cmd\" | grep -q 'npm run generate'; then rsync -a --delete .output/public/ /Users/ruimin/Desktop/code/mental-model-public/; fi"
          }
        ]
      }
    ]
  }
}
```

关键点：
- Hook 的输入通过 **stdin JSON** 传递，不是环境变量，需要用 `jq` 解析
- `rsync -a --delete` 完整同步，但不会删除目标目录的 `.git/`（因为源目录没有 `.git`）
- `matcher: "Bash"` 仅匹配 Bash 工具调用

## 小结

- SEO 关键词主要分布在 Markdown frontmatter（`seoTitle` / `seoDescription`）和各页面的 `useSeoMeta()` 中
- 补全后新增了全局 keywords、Twitter Card、ogImage、WebSite/Article/BreadcrumbList JSON-LD
- 需要在 `public/` 下放置 `og-image.png`（1200×630）供社交分享使用
- Claude Code hook 使用 stdin JSON 传递工具输入，配置时需用 `jq` 解析
