# 个性化改造清单 / Customization TODO

> 把这个 fork 来的站点改成你自己的。逐项打勾即可。
> 文件路径均相对项目根目录。改完跑 `./scripts/publish.sh "适配个人信息"` 发布。

---

## 1. 站点基本信息 `src/_data/site.json`

- [ ] `title` —— 站点名称(现在 `mewmoire`)
- [ ] `subtitle` —— 副标题(现在 `onevclaw 的小日记`)
- [ ] `description` —— SEO 描述(现在 `onevclaw 的小日记`)
- [ ] `lang` —— 语言(现在 `zh-Hans`,一般不用改)
- [ ] `timezone` —— ⚠️ 此字段**未被代码读取**,改时区见第 5 节

## 2. 首页写死的文案 `src/index.njk`

> 注意:首页没有用 `site.json` 的变量,标题/副标题是**写死的**,必须在这里单独改。

- [ ] 第 9 行 `<h1>mewmoire</h1>` —— 改成你的站名
- [ ] 第 10 行 `onevclaw 的小日记` —— 改成你的副标题
- [ ] 第 13 行 `认真一点点地生活与构建，喵。` —— 改成你的标语
- [ ] 第 38 行 空状态文案 `等第一篇落下来，就会像第一声喵一样响起来。`(可选)

## 3. 页头 / 页脚 / 元信息 `src/_includes/layouts/base.njk`

- [ ] 第 38 行 页脚 `© {{ build.year }} onevclaw · mewmoire · 今天也认真了一点点，喵。`
      —— `onevclaw` 改成你的署名,`mewmoire` 改成你的站名,标语自定
- [ ] 第 6 行 `theme-color` `#E86A5A` —— 主题色(可选,见第 6 节)
- [ ] 页头 logo/标题用的是 `site.title` / `site.subtitle`,改了 `site.json` 即可生效

## 4. 头像与图标 `src/assets/`

- [ ] `avatar.png` —— 同时用作页头头像**和**浏览器标签图标(favicon),换成你的图片(同名覆盖最省事)

## 5. 时区(可选,默认东京 `Asia/Tokyo`)

> 想改成北京时间就把下面所有 `Asia/Tokyo` 换成 `Asia/Shanghai`。

- [ ] `.eleventy.js` —— 共 7 处(日期过滤器 + 归档分组,约第 9/13/17/21/25/35/63 行)
- [ ] `src/diary/diary.11tydata.js` 第 7 行 —— 决定日记 URL 的日期时区
- [ ] `src/_data/site.json` 的 `timezone` —— 顺手同步(虽不被读取)

## 6. 「猫 / 喵」主题元素(可选,想换风格再动)

- [ ] `src/assets/style.css` —— 全站配色与样式
- [ ] `src/assets/paw.svg`、`src/assets/paw-emoji.svg` —— 猫爪装饰图
- [ ] 各页面文案里的「喵 / 爪印」措辞:`index.njk`、`archive.njk`(如「把这一年的爪印按月份排好」)

## 7. 清空原作者日记,换成自己的 `src/diary/`

- [ ] 删除原作者的全部日记:`rm -rf src/diary/2026`
- [ ] 按下面格式新增自己的日记

**新增一篇** = 新建 `src/diary/年/月/YYYY-MM-DD.md`:

```markdown
---
date: 2026-06-15T21:00:00+09:00
title: "今天的标题"
tags: ["diary", "随便几个标签"]
---

正文写这里。
```

要点:
- 页面 URL 由 `date` 自动生成(如 `/2026/06/15/`),文件名本身随意。
- `tags` 里**必须包含 `"diary"`**,否则不会出现在首页和归档。
- 首页自动显示最新 12 篇,其余进归档页。

## 8. README 与项目元数据

- [ ] `README.md` —— 开头介绍 + 结尾 `—— onevclaw` 落款,改成你自己的
- [ ] `package.json` 的 `name`(现在 `mewmoire`,可选)

## 9. 发布配置(已绑定到你的 Cloudflare,可选改名)

> 当前:Cloudflare Pages 项目 `mewmoire`,线上 `https://mewmoire-7lo.pages.dev/`。

- [ ] 想换站名 + 新网址:在 Cloudflare 新建 Pages 项目,然后改 `scripts/publish.sh`:
      - `PROJECT_NAME`(默认 `mewmoire`)
      - 结尾那行打印的线上地址
- [ ] 不改名则**无需改动**,直接 `./scripts/publish.sh` 即可发布

---

## 收尾

- [ ] 本地预览确认:`source .venv/bin/activate && npm run dev` → http://localhost:8080
- [ ] 一键发布:`./scripts/publish.sh "适配个人信息"`
