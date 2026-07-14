
This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

`mewmoire` is a personal Chinese-language diary/notes site (branded "Star" / 滚雪球的Star) built with **Eleventy (11ty) v3** and deployed to **Cloudflare Pages**. There is no application backend and no test suite — it's a static-site generator pipeline. The recurring task is writing a new diary note (Markdown) and publishing it.

## Commands

```bash
npm run dev          # font subset + Eleventy --serve at http://localhost:8080 (live reload)
npm run build        # rm -rf _site, font subset, build static site into _site/
npm run font:subset  # rebuild only the subset font
npm run deploy       # bash scripts/publish.sh — commit + push + build + wrangler deploy
npm run deploy -- "publish: 2026-06-18 13:29:12 短描述"   # with a custom commit message (the -- is required)
```

**Python venv is required for the font build.** Font subsetting calls `pyftsubset` / `python3 -m fontTools.subset`, which need `fonttools` + `brotli` from `.venv`:

```bash
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements-fonts.txt
```

Keep the venv activated when running `dev` / `build` / `font:subset`. `scripts/publish.sh` auto-sources `.venv/bin/activate`.

## Architecture

**Eleventy config (`.eleventy.js`)** is the hub. Input `src/`, output `_site/`, includes `_includes/`, data `_data/`. Key pieces:
- Date filters and the `groupByYearMonth` / `diary` / `diaryByYear` collections all format dates in the **`Asia/Shanghai` (UTC+8)** timezone. Timezone is hardcoded across ~7 spots here — not read from `site.json`.
- `markdownTemplateEngine: false` — diary Markdown bodies are **not** run through Nunjucks, so `{{ }}` / `{% %}` in code samples are safe and need no escaping. Layouts/pages (`.njk`) still use Nunjucks.
- `amendLibrary("md", ...)` adds two markdown-it tweaks inline (no runtime dep): wraps tables in `<div class="table-wrap">` for horizontal scroll, and renders GFM task lists (`- [ ]`) as real checkboxes.

**Diary notes** live at `src/diary/<YYYY>/<MM>/<YYYY-MM-DD>-<slug>.md`. `src/diary/diary.11tydata.js` injects `layout: layouts/diary.njk` and `tags: ["diary"]` into every note — **do not put those in a note's frontmatter**. It also builds the permalink from the note's `date` as `/YYYY/MM/DD/<slug>/`, so the `date` field, the folder path, and the filename must all agree or the URL won't match the file. A note's frontmatter has exactly four fields: `date`, `title` (quote it — Chinese titles contain `：`/`，` that break unquoted YAML), `slug` (short, lowercase, English, unique among same-day notes), `description`.

**Templates:** `src/_includes/layouts/base.njk` (shell — header/footer/`<head>`), `layouts/diary.njk` (single note), `src/index.njk` (home), `src/archive.njk` (archive). Gotcha: the homepage title/subtitle/tagline in `index.njk` are **hardcoded**, not read from `src/_data/site.json` — `site.json` only feeds `base.njk` and SEO meta.

**Font pipeline (`scripts/build-font-subset.mjs`)** scans all text files under `src/`, collects every character used (plus ASCII + common CJK punctuation), and subsets the self-hosted `LXGW WenKai` font to a `woff2` containing only those glyphs. It's incremental: a SHA-256 hash of the charset is stored in `*.subset.meta.json`, and the build is skipped when nothing changed. The source font (~25 MB) is downloaded once to `.cache/fonts/`; set `LXGW_WENKAI_URL` to a mirror (e.g. `gh-proxy.com`) if GitHub is blocked. Subset output (`src/assets/fonts/*.woff2` + `*.meta.json`) is gitignored and regenerated on every build.

**Deploy (`scripts/publish.sh`)**: activates `.venv` → `git commit -am` + `git push origin master` → `npm run build` → `wrangler pages deploy _site --project-name=mewmoire`. Commit-message convention (see `git log`): `publish: <YYYY-MM-DD HH:MM:SS> <short Chinese description>`. This is an outward-facing action — it pushes to the live branch and the public internet; only run it once a note is ready.

## Publishing a note

There's a `publish-diary-note` skill (`.Codex/skills/publish-diary-note/SKILL.md`) for the full workflow when the user says things like 保存成笔记 / 发布 / "publish this". In short: get a real timestamp from `date` (never invent one), create the note file at the path above with the four-field frontmatter, open the body with a `> 记录时间：…` blockquote then `##` sections in the site's voice (Chinese full-width punctuation, `**bold**` for key terms), then `npm run deploy -- "publish: <ts> <desc>"`. The live note URL is `https://mewmoire-7lo.pages.dev/<YYYY>/<MM>/<DD>/<slug>/`.
