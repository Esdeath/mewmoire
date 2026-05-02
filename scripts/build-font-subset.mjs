#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT_DIR, "src");
const OUTPUT_DIR = join(ROOT_DIR, "src", "assets", "fonts");
const OUTPUT_FONT = join(OUTPUT_DIR, "lxgw-wenkai-regular.subset.woff2");
const META_FILE = join(OUTPUT_DIR, "lxgw-wenkai-regular.subset.meta.json");

const FONT_VERSION = process.env.LXGW_WENKAI_VERSION || "v1.521";
const FONT_URL =
  process.env.LXGW_WENKAI_URL ||
  `https://github.com/lxgw/LxgwWenKai/releases/download/${FONT_VERSION}/LXGWWenKai-Regular.ttf`;

const SOURCE_FONT_CACHE_DIR = join(ROOT_DIR, ".cache", "fonts");
const SOURCE_FONT = join(SOURCE_FONT_CACHE_DIR, `LXGWWenKai-Regular-${FONT_VERSION}.ttf`);
const BUILD_CACHE_DIR = join(ROOT_DIR, ".cache", "font-subset");
const CHARS_FILE = join(BUILD_CACHE_DIR, "chars.txt");

const TEXT_EXTENSIONS = new Set([".md", ".njk", ".json", ".js", ".css", ".txt", ".html"]);
const ASCII_CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(0x20 + i)).join("");
const EXTRA_CHARS = "，。！？、；：‘’“”（）《》【】「」『』—…·￥";

function walkFiles(dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
      continue;
    }
    if (!TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
    files.push(fullPath);
  }
}

function collectCharacters() {
  const files = [];
  walkFiles(SOURCE_DIR, files);

  const chars = new Set([...ASCII_CHARS, ...EXTRA_CHARS]);
  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    for (const ch of content) {
      const codepoint = ch.codePointAt(0);
      if (codepoint === undefined) continue;
      if (codepoint < 0x20 || (codepoint >= 0x7f && codepoint <= 0x9f)) continue;
      chars.add(ch);
    }
  }

  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("");
}

function readMeta() {
  if (!existsSync(META_FILE)) return null;
  try {
    return JSON.parse(readFileSync(META_FILE, "utf8"));
  } catch {
    return null;
  }
}

function ensureSourceFont() {
  mkdirSync(SOURCE_FONT_CACHE_DIR, { recursive: true });
  if (existsSync(SOURCE_FONT)) return;

  console.log(`Downloading source font: ${FONT_URL}`);
  execFileSync("curl", ["-L", "--fail", "--retry", "3", "--retry-delay", "2", "-o", SOURCE_FONT, FONT_URL], {
    stdio: "inherit"
  });
}

function hasCommand(command) {
  try {
    execFileSync(command, ["--help"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function nixPythonPackagePaths(packageNames) {
  const storeDir = "/nix/store";
  if (!existsSync(storeDir)) return [];

  const paths = [];
  for (const entry of readdirSync(storeDir)) {
    if (!packageNames.some((name) => entry.includes(`-${name}-`))) continue;
    const match = entry.match(/python(\d+\.\d+)-/);
    if (!match) continue;

    const sitePackages = join(storeDir, entry, "lib", `python${match[1]}`, "site-packages");
    if (existsSync(sitePackages)) paths.push(sitePackages);
  }
  return paths;
}

function runSubset() {
  const subsetArgs = [
    SOURCE_FONT,
    `--text-file=${CHARS_FILE}`,
    `--output-file=${OUTPUT_FONT}`,
    "--flavor=woff2",
    "--layout-features=*",
    "--name-IDs=*",
    "--name-legacy",
    "--name-languages=*",
    "--glyph-names",
    "--symbol-cmap",
    "--legacy-cmap",
    "--notdef-glyph",
    "--notdef-outline",
    "--recommended-glyphs"
  ];

  try {
    if (hasCommand("pyftsubset")) {
      const extraPythonPath = nixPythonPackagePaths(["brotli", "brotlicffi"]);
      const pythonPath = [process.env.PYTHONPATH, ...extraPythonPath].filter(Boolean).join(":");
      execFileSync("pyftsubset", subsetArgs, {
        stdio: "inherit",
        env: { ...process.env, ...(pythonPath ? { PYTHONPATH: pythonPath } : {}) }
      });
    } else {
      execFileSync("python3", ["-m", "fontTools.subset", ...subsetArgs], { stdio: "inherit" });
    }
  } catch {
    throw new Error(
      "Font subset build failed. Please install pyftsubset or python3 + fonttools + brotli (pip install -r requirements-fonts.txt)."
    );
  }
}

function writeMeta(hash, charsCount) {
  const outputSizeBytes = statSync(OUTPUT_FONT).size;
  const meta = {
    fontVersion: FONT_VERSION,
    sourceUrl: FONT_URL,
    charsCount,
    charsHash: hash,
    outputFile: "src/assets/fonts/lxgw-wenkai-regular.subset.woff2",
    outputBytes: outputSizeBytes
  };
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2) + "\n", "utf8");
  console.log(`Subset font generated: ${Math.round(outputSizeBytes / 1024)} KiB`);
}

function main() {
  mkdirSync(BUILD_CACHE_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const chars = collectCharacters();
  writeFileSync(CHARS_FILE, chars + "\n", "utf8");

  const charsHash = createHash("sha256").update(chars).digest("hex");
  const existingMeta = readMeta();
  const isUpToDate =
    existsSync(OUTPUT_FONT) &&
    existingMeta &&
    existingMeta.charsHash === charsHash &&
    existingMeta.fontVersion === FONT_VERSION &&
    existingMeta.sourceUrl === FONT_URL;

  if (isUpToDate) {
    console.log("Subset font is up to date.");
    return;
  }

  ensureSourceFont();
  runSubset();
  writeMeta(charsHash, [...chars].length);
}

main();
