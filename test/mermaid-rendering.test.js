const assert = require("node:assert/strict");
const fs = require("node:fs");

const articleHtml = fs.readFileSync(
  "_site/2026/07/23/superpowers-development-workflow/index.html",
  "utf8"
);

assert.match(
  articleHtml,
  /<pre class="mermaid">\s*flowchart LR/,
  "Mermaid fences should render as Mermaid diagram containers"
);
assert.doesNotMatch(
  articleHtml,
  /<code class="language-mermaid">/,
  "Mermaid fences should not remain plain code blocks"
);
assert.match(
  articleHtml,
  /mermaid@11\.16\.0\/dist\/mermaid\.esm\.min\.mjs/,
  "Pages should load the pinned Mermaid renderer"
);

console.log("mermaid rendering test passed");
