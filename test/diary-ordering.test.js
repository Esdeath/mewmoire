const assert = require("node:assert/strict");
const fs = require("node:fs");
const eleventyConfig = require("../.eleventy.js");

const olderPinned = {
  date: new Date("2026-01-01T00:00:00+08:00"),
  data: { pinned: true }
};
const newerRegular = {
  date: new Date("2026-07-15T00:00:00+08:00"),
  data: { pinned: false }
};
const newerPinned = {
  date: new Date("2026-06-01T00:00:00+08:00"),
  data: { pinned: true }
};

const sorted = eleventyConfig.sortDiaryEntries([olderPinned, newerRegular]);

assert.equal(sorted[0], newerRegular, "the main diary feed should stay date-sorted");
assert.equal(sorted[1], olderPinned, "the main diary feed should ignore pinned status");

const pinned = eleventyConfig.getPinnedDiaryEntries([
  olderPinned,
  newerRegular,
  newerPinned
]);

assert.deepEqual(
  pinned,
  [newerPinned, olderPinned],
  "the pinned module should contain only pinned entries in date order"
);

const note = fs.readFileSync(
  "src/diary/2026/07/2026-07-15-personal-mission-vision-values.md",
  "utf8"
);
assert.doesNotMatch(
  note,
  /\*\*[^*\n]+\*\*[\u3400-\u9fff]/,
  "bold Markdown markers must not touch the following Chinese text"
);
assert.doesNotMatch(
  note,
  /^# 我的个人使命、愿景与原则$/m,
  "the diary body should not repeat the old article heading"
);

const pinnedTemplate = fs.readFileSync(
  "src/_includes/components/pinnedEntry.njk",
  "utf8"
);
assert.match(pinnedTemplate, /class="pinned-marker"/, "pinned rows need a pin label");
assert.match(pinnedTemplate, /item\.data\.title/, "pinned rows need the article title");
assert.doesNotMatch(pinnedTemplate, /item\.data\.description/, "pinned rows should not show descriptions");
assert.doesNotMatch(pinnedTemplate, /dateReadable|pinned-entryLink/, "pinned rows should not show extra metadata or links");

console.log("diary ordering test passed");
