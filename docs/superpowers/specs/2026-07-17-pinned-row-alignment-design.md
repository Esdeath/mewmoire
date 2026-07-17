# Pinned Row Alignment

## Goal

Make the pinned section occupy a full content row and align its left edge with the main content on both the homepage and archive pages.

## Design

- Keep the shared pinned-section component and its current content unchanged.
- Replace the content-sized desktop width with the site's existing content width of `80%`.
- Preserve the existing mobile width of `92%` at viewports up to 520px.
- Keep automatic horizontal margins so the full-width row follows the same centered content column as the homepage feed and archive list.

## Scope

Only the shared `.pinned-section` layout rule changes. Typography, colors, borders, pinned filtering, page templates, and diary content remain unchanged.

## Verification

- Run the Eleventy production build.
- Verify the generated homepage and archive pages both include the shared pinned section.
- Inspect both pages at desktop and mobile widths to confirm the pinned row aligns with their primary content columns and does not overflow.
