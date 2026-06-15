---
date: 2026-05-20T00:00:00+08:00
title: "提升内容站点 GEO（生成式引擎优化）的实践清单"
slug: website-geo-optimization
description: "针对 Nuxt 3 + Markdown 内容站，梳理被 ChatGPT、Perplexity、Claude、Google AI Overviews 等 AI 引擎引用的关键优化杠杆，按改动成本排序。"
---

> 记录时间：2026-05-20

## 问题

如何提升一个基于 Nuxt 3 + Markdown 的个人内容站点的 GEO？GEO（Generative Engine Optimization）和传统 SEO 的差别在于：目标不是争 Google 第一名，而是争被 ChatGPT、Perplexity、Claude、Google AI Overviews 等 AI 引擎**引用**进它们生成的答案里。

## 立刻能改的（半小时内完工）

### 1. `robots.txt` 显式放行 AI 爬虫

默认的 `User-agent: *` 虽然允许所有爬虫，但显式声明更安全，避免 CDN 或平台后续默认拦截。需要显式 `Allow` 的爬虫：

- `GPTBot`（OpenAI）
- `ClaudeBot` / `anthropic-ai`（Anthropic）
- `PerplexityBot`（Perplexity）
- `Google-Extended`（Google AI / Bard）
- `CCBot`（Common Crawl，多数模型训练数据来源）
- `Bytespider`（字节豆包/Doubao）

### 2. 修掉 `nuxt.config.ts` 的瑕疵

常见的两个坑：

- meta description 里把 `iOS` 写成了 `iO` 之类的笔误，AI 抓到会原样吃进上下文
- 默认 `siteUrl` 还是 `example.com` 占位域名，如果生产环境忘记设 `NUXT_PUBLIC_SITE_URL`，sitemap 和 JSON-LD 会全部指向假域名，AI 引擎无法回链

### 3. 增加 `llms.txt`

这是 Anthropic 推动的新标准，LLM 抓站时会优先读 `/llms.txt` 和 `/llms-full.txt` 来理解站点结构。模板很短：站点简介 + 分组列出所有内容的标题和 URL。可以在 build 时基于 `content/notes/*.md` 自动生成。

### 4. 每篇文章注入 Article / BlogPosting JSON-LD

如果根目录只有 `WebSite` schema，文章页缺少结构化数据，AI 引擎判断"是否值得引用"会很依赖以下字段：

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "author": { "@type": "Person", "name": "...", "sameAs": ["https://github.com/..."] },
  "datePublished": "...",
  "dateModified": "...",
  "about": "...",
  "citation": ["..."]
}
```

在 `pages/notes/[slug].vue` 里通过 `useHead` 注入文章级 JSON-LD。

## 内容层杠杆（GEO 的核心）

### 5. 结构调整为「答案在前，论证在后」

LLM 摘录答案时偏好**第一段就是 TL;DR**：一句话结论 + 关键数字 / 要点，然后才展开论证。把笔记开头的「问题」段改成「答案」段，原问题作为副标题或导语即可。

### 6. 引入 FAQPage schema

Q&A 形态的笔记非常适合加 `FAQPage` 结构化数据，AI Overviews 和 Perplexity 特别偏好这种格式。可以在 frontmatter 增加可选字段：

```yaml
faq:
  - q: "..."
    a: "..."
```

再在渲染时同步生成 `FAQPage` JSON-LD。

### 7. E-E-A-T 信号：作者页 + 引用源

AI 引擎对 Experience / Expertise / Authoritativeness / Trustworthiness 的判断比传统 SEO 更细：

- `about` 页加作者 bio、专业背景、外链（GitHub / Twitter / 掘金等）
- 笔记里引用外部资料时，显式列 `## 参考资料` 并附原始链接 — LLM 训练时会把"会引用源"识别为高质量信号

## 技术与抓取

### 8. sitemap 加 `lastmod`

检查 sitemap 是否为每个 URL 输出 `<lastmod>`，没有的话 AI 爬虫无法判断内容新鲜度，会倾向不引用。

### 9. OpenGraph 完整化

文章页需要补齐：

- `og:title`
- `og:description`
- `og:image`
- `og:type=article`
- `article:published_time`
- `article:modified_time`

用 `useSeoMeta()` 一次配齐。

### 10. 内部链接与 `related` 字段落地

把 frontmatter 里的 `related` 字段渲染成文章末尾的相关阅读区块，构建主题簇（topic cluster），帮助 AI 引擎建立"这个站点是 X 领域的权威"的认知。

## 小结

按"改动成本 / 收益"排序，建议从 **1 + 2 + 3 + 4** 开始（robots、修瑕疵、llms.txt、文章 JSON-LD），半小时内完工就能立刻被新爬到的 AI 引擎消化。后面 5 / 6（答案前置、FAQ schema）属于内容写作风格的调整，可以沉淀进笔记模板，让以后写的每篇笔记天然 GEO 友好。
