const assert = require("node:assert/strict");
const eleventyConfig = require("../.eleventy.js");

const olderPinned = {
  date: new Date("2026-01-01T00:00:00+08:00"),
  data: { pinned: true }
};
const newerRegular = {
  date: new Date("2026-07-15T00:00:00+08:00"),
  data: { pinned: false }
};

const sorted = eleventyConfig.sortDiaryEntries([newerRegular, olderPinned]);

assert.equal(sorted[0], olderPinned, "pinned diary entries should sort first");
assert.equal(sorted[1], newerRegular, "regular entries should follow pinned entries");

console.log("diary ordering test passed");
