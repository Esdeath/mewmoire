---
name: publish-diary-note
description: >-
  Turn a piece of content — usually an answer, explanation, or discussion from
  the current conversation — into a properly formatted note on this mewmoire
  Eleventy diary site, then build and deploy it to Cloudflare Pages. Use this
  whenever the user says things like 保存成笔记 / 发布成一篇笔记 / 整理成笔记发布 /
  把这个发到博客 / "save this as a note" / "publish this" / "post this to the
  blog", or otherwise wants something we just discussed written up and shipped.
  Also use it when the user only says "保存并发布" or "发布" with no other object —
  in this project that means publishing the latest answer as a diary note.
---

# Publishing a note to the mewmoire diary site

This project (`mewmoire`) is a personal Chinese-language diary/notes site built
with Eleventy and deployed to Cloudflare Pages. The recurring task is: take
something we just produced in the conversation (a structured answer, a translated
article, a reflection) and turn it into one published note.

The two things that are easy to get wrong — and the reason this skill exists — are
(1) the exact file location and frontmatter the build expects, and (2) the
publish command. Everything else is just writing good Markdown in the site's
voice.

## Step 1 — Confirm the content and get the current time

The note body is usually the answer you just gave the user, lightly adapted for a
reader who wasn't in the conversation (add a one-line lead-in, drop any
"as I said above" references). If it isn't obvious what content to publish, ask.

Get a real timestamp — never invent one. The site is in `Asia/Shanghai` (UTC+8):

```bash
date '+%Y-%m-%dT%H:%M:%S+08:00'   # for the `date:` frontmatter field
date '+%Y-%m-%d %H:%M:%S'          # for the 记录时间 line and commit message
date '+%Y/%m'                      # for the folder path
```

## Step 2 — Create the note file

Notes live at `src/diary/<YYYY>/<MM>/<YYYY-MM-DD>-<slug>.md`. The folder is the
year/month from the date; the filename starts with the full date.

```
src/diary/2026/06/2026-06-18-why-we-feel-pain-over-money-not-time.md
```

`layout` and `tags: ["diary"]` are injected automatically by
`src/diary/diary.11tydata.js`, so **do not** put them in the note. The note's
frontmatter has exactly four fields:

```yaml
---
date: 2026-06-18T13:29:12+08:00
title: "为什么我们心疼钱，却不心疼时间"
slug: why-we-feel-pain-over-money-not-time
description: "一句话概括这篇笔记讲了什么，给搜索引擎和列表页用，控制在一两句话。"
---
```

Why each field matters:

- **date** — drives both sort order and the URL. The permalink is built from the
  date as `/YYYY/MM/DD/<slug>/`, so the date here must match the date in the
  folder path and filename, or the published URL won't line up with where the
  file lives.
- **title** — keep it quoted (Chinese titles often contain `：` or `，`, which
  break unquoted YAML). This is the `<h1>` and the list-page title.
- **slug** — short, lowercase, English, hyphenated. It becomes the last URL
  segment and **must be unique among notes on the same day** (two notes dated the
  same day with no slug, or the same slug, would collide on `/YYYY/MM/DD/`).
- **description** — one or two sentences in Chinese summarizing the note; used for
  SEO and link previews. Look at a recent note in `src/diary/2026/06/` if you want
  to match the register.

### Body conventions

Open the body with a blockquote that records when it was written, and (when the
content is adapted from a discussion or an external source) a one-line note about
where it came from. Then write the note with `##` section headings.

```markdown
> 记录时间：2026-06-18 13:29:12
>
> 这篇笔记整理自一次关于「……」的讨论。

## 第一节标题

正文……
```

Match the surrounding notes' voice: Chinese full-width punctuation (，。：「」),
`##`/`###` headings, `**bold**` for key terms, `>` blockquotes for the lead-in and
for pull-quote conclusions. Markdown bodies are **not** run through the Nunjucks
template engine, so `{{ }}` / `{% %}` in code samples are safe and need no
escaping. Read one recent note end-to-end before writing if you're unsure of the
house style.

## Step 3 — Publish

Publishing is a single command. It activates the Python venv (needed for font
subsetting), commits all changes, pushes to `origin/master`, builds the Eleventy
site, and deploys `_site/` to Cloudflare Pages:

```bash
npm run deploy -- "publish: 2026-06-18 13:29:12 心疼钱不心疼时间"
```

- The `--` is required so the message reaches `scripts/publish.sh`.
- Follow the existing commit-message convention seen in `git log`:
  `publish: <YYYY-MM-DD HH:MM:SS> <short Chinese description>`.
- This pushes to the live branch and deploys to the public internet. It's the
  user's own site and they asked to publish, so that's expected — but it is an
  outward-facing action, so run it only once the note file is ready, and don't
  re-run it on a whim.

If you only want to preview locally without shipping, `npm run build` builds into
`_site/` and `npm run dev` serves with live reload — but the user's request is
normally to publish, so default to `npm run deploy`.

## Step 4 — Report back

After deploy succeeds, tell the user concretely:

- the note's title and file path,
- the commit hash (from the command output),
- the live URL of the new note:
  `https://mewmoire-7lo.pages.dev/<YYYY>/<MM>/<DD>/<slug>/`.

The deploy output also prints a deployment-specific preview URL
(`https://<hash>.mewmoire-7lo.pages.dev`) and the site root
`https://mewmoire-7lo.pages.dev/` — both worth including.

## Quick checklist

- [ ] Real timestamp from `date`, consistent across frontmatter / 记录时间 / path
- [ ] File at `src/diary/<YYYY>/<MM>/<YYYY-MM-DD>-<slug>.md`
- [ ] Frontmatter has only `date`, `title` (quoted), `slug` (unique that day),
      `description` — no `layout`/`tags`
- [ ] Body opens with the `> 记录时间：…` blockquote, then `##` sections
- [ ] `npm run deploy -- "publish: <ts> <desc>"`
- [ ] Reported title, path, commit, and live URL
