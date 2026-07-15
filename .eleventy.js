const { DateTime } = require("luxon");

function sortDiaryEntries(items) {
  return items.sort((a, b) => {
    const pinnedDelta =
      Number(Boolean(b.data && b.data.pinned)) -
      Number(Boolean(a.data && a.data.pinned));
    return pinnedDelta || (b.date - a.date);
  });
}

function configureEleventy(eleventyConfig) {
  // Copy-through
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Date filters
  eleventyConfig.addFilter("dateISO", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "Asia/Shanghai" }).toISODate();
  });

  eleventyConfig.addFilter("dateReadable", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "Asia/Shanghai" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("dateDay", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "Asia/Shanghai" }).toFormat("dd");
  });

  eleventyConfig.addFilter("dateMonthDay", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "Asia/Shanghai" }).toFormat("LL-dd");
  });

  eleventyConfig.addFilter("yearMonth", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "Asia/Shanghai" }).toFormat("yyyy.LL");
  });

  // Group collection items by YYYY.MM (newest-first groups)
  eleventyConfig.addFilter("groupByYearMonth", (items) => {
    if (!Array.isArray(items)) return [];
    const groups = [];
    let current = null;

    for (const item of items) {
      const ym = DateTime.fromJSDate(item.date, { zone: "Asia/Shanghai" }).toFormat("yyyy.LL");
      if (!current || current.ym !== ym) {
        current = { ym, items: [] };
        groups.push(current);
      }
      current.items.push(item);
    }

    return groups;
  });

  // Take first N items (Nunjucks doesn't have JS slice semantics)
  eleventyConfig.addFilter("take", (arr, n) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, n);
  });

  // Diary collection: sorted newest first
  eleventyConfig.addCollection("diary", (collectionApi) => {
    return sortDiaryEntries(collectionApi.getFilteredByTag("diary"));
  });

  // Archive collection grouped by year (newest year first)
  eleventyConfig.addCollection("diaryByYear", (collectionApi) => {
    const items = sortDiaryEntries(collectionApi.getFilteredByTag("diary"));
    const yearMap = new Map();

    for (const item of items) {
      const year = DateTime.fromJSDate(item.date, { zone: "Asia/Shanghai" }).toFormat("yyyy");
      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year).push(item);
    }

    return Array.from(yearMap, ([year, yearItems]) => ({ year, items: yearItems }));
  });

  // Markdown enhancements on top of Eleventy's default markdown-it:
  //  1. Wrap every table in <div class="table-wrap"> so wide tables can
  //     scroll horizontally on narrow screens instead of overflowing.
  //  2. Render GFM task lists (`- [ ]` / `- [x]`) as real checkboxes.
  //     Implemented inline to avoid adding a runtime dependency.
  eleventyConfig.amendLibrary("md", (md) => {
    md.renderer.rules.table_open = () => '<div class="table-wrap">\n<table>\n';
    md.renderer.rules.table_close = () => "</table>\n</div>\n";

    md.core.ruler.after("inline", "task-lists", (state) => {
      const tokens = state.tokens;
      for (let i = 2; i < tokens.length; i++) {
        if (tokens[i].type !== "inline") continue;
        if (tokens[i - 1].type !== "paragraph_open") continue;
        if (tokens[i - 2].type !== "list_item_open") continue;

        const inline = tokens[i];
        const match = /^\[([ xX])\]\s+/.exec(inline.content);
        if (!match) continue;

        const checked = match[1].toLowerCase() === "x";
        inline.content = inline.content.replace(/^\[([ xX])\]\s+/, "");
        const firstChild = inline.children && inline.children[0];
        if (firstChild && firstChild.type === "text") {
          firstChild.content = firstChild.content.replace(/^\[([ xX])\]\s+/, "");
        }

        const checkbox = new state.Token("html_inline", "", 0);
        checkbox.content =
          '<input class="task-list-item-checkbox" type="checkbox" disabled' +
          (checked ? " checked" : "") +
          "> ";
        inline.children.unshift(checkbox);

        tokens[i - 2].attrJoin("class", "task-list-item");
        for (let j = i - 2; j >= 0; j--) {
          if (
            tokens[j].type === "bullet_list_open" ||
            tokens[j].type === "ordered_list_open"
          ) {
            tokens[j].attrJoin("class", "contains-task-list");
            break;
          }
        }
      }
    });
  });

  // Cloudflare Pages uses a root-domain deployment, so no pathPrefix is needed.
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    pathPrefix: "",
    // Markdown bodies are treated as plain Markdown (not Nunjucks), so diary
    // content can freely contain `{{ }}` / `{% %}` (code snippets, configs)
    // without breaking the build. Layouts/pages still use Nunjucks via html engine.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk"
  };
}

module.exports = configureEleventy;
module.exports.sortDiaryEntries = sortDiaryEntries;
