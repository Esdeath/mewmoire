# Pinned Row Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared pinned section occupy the same full content row as the homepage feed and archive list.

**Architecture:** Keep the shared Nunjucks component unchanged and alter only its desktop width rule in the existing global stylesheet. The existing mobile media query remains the source of truth for the 92% mobile content width.

**Tech Stack:** Eleventy 3, Nunjucks, CSS

## Global Constraints

- Desktop pinned-section width is `80%`.
- Mobile pinned-section width remains `92%` at viewports up to 520px.
- Homepage and archive pages continue using the same pinned-section component.
- Typography, colors, borders, filtering, templates, and diary content do not change.

---

### Task 1: Align the Shared Pinned Row

**Files:**
- Modify: `src/assets/style.css:416`

**Interfaces:**
- Consumes: `.pinned-section` markup from `src/_includes/components/pinnedSection.njk`.
- Produces: A shared `.pinned-section` layout that aligns to the site's desktop and mobile content columns.

- [ ] **Step 1: Run a failing CSS assertion**

```bash
node -e "const fs=require('fs');const css=fs.readFileSync('src/assets/style.css','utf8');const rule=css.match(/\.pinned-section\s*\{([^}]*)\}/)[1];if(!/width:\s*80%/.test(rule)||/width:\s*fit-content/.test(rule))process.exit(1)"
```

Expected: exit code 1 because the desktop rule still uses `width: fit-content`.

- [ ] **Step 2: Implement the desktop content width**

Replace the beginning of the shared rule with:

```css
.pinned-section{
  width: 80%;
  margin: 26px auto 0;
```

Remove the obsolete `max-width` constraint so the row matches the established `.home-feed .entry` and `.entry-archive` widths.

- [ ] **Step 3: Run the CSS assertion again**

Run the command from Step 1.

Expected: exit code 0.

- [ ] **Step 4: Build the production site**

```bash
source .venv/bin/activate && npm run build
```

Expected: Eleventy completes successfully and writes `_site/`.

- [ ] **Step 5: Verify generated page coverage and responsive layout**

Confirm `_site/index.html` and `_site/archive/index.html` contain `pinned-section`. Start a local Eleventy server and inspect both pages at desktop and mobile viewport sizes, confirming that the pinned row aligns with the primary content column and does not overflow.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/assets/style.css docs/superpowers/plans/2026-07-17-pinned-row-alignment.md
git commit -m "fix: align pinned section with content"
```
