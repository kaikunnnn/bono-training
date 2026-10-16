#!/usr/bin/env node
/* ============================================================
   check-spacing.mjs — D-1 / D-3（記事コンフィグ駆動）
   D-1: tokens.css / index.html / 各記事HTML の margin・padding・gap への
        「生px/rem直書き」を検出する。var(--space-*) 以外は fail。
        例外: カスタムプロパティ定義、border幅、SVG内部（属性ジオメトリ）。
   D-3: 本文 line-height ≥ 1.5（--leading-body トークン）＋各記事が本文へ適用。
   Node標準モジュールのみ・ゼロインストール。
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ARTICLES } from "./config.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

const PROPS = [
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "gap", "row-gap", "column-gap",
];
const PROP_RE = new RegExp(
  `(?:^|[;{]|\\*/)\\s*(${PROPS.join("|")})\\s*:\\s*([^;}]+)`,
  "gi"
);
const BAD_UNIT_RE = /\d(?:\.\d+)?\s*(px|rem|em|ch|vh|vw|vmin|vmax|pt)\b/i;
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

function cssFromHtml(html) {
  const chunks = [];
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) chunks.push(m[1]);
  for (const m of html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) chunks.push("x{" + m[1] + "}");
  return chunks.join("\n");
}

const targets = [
  { name: "tokens.css", css: read("tokens.css") },
  { name: "index.html", css: cssFromHtml(read("index.html")) },
];
for (const art of ARTICLES) targets.push({ name: art.file, css: cssFromHtml(read(art.file)) });

let scanned = 0;
const violations = [];
for (const t of targets) {
  const css = stripComments(t.css);
  for (const m of css.matchAll(PROP_RE)) {
    const prop = m[1].toLowerCase();
    const value = m[2].trim();
    scanned++;
    const tokens = value.split(/[\s,]+/).filter(Boolean);
    for (const tok of tokens) {
      if (/^var\(/.test(tok)) continue;
      if (tok === "0" || tok === "auto") continue;
      if (/^(inherit|initial|unset|revert)$/.test(tok)) continue;
      if (/^-?\d+(\.\d+)?%$/.test(tok)) continue;
      if (BAD_UNIT_RE.test(tok)) {
        violations.push(`${t.name}: ${prop}: ${value}  →  生の値「${tok}」`);
      }
    }
  }
}

/* --- D-3: line-height --- */
const tokensCss = read("tokens.css");
const lbMatch = tokensCss.match(/--leading-body\s*:\s*([0-9.]+)/);
const leadingBody = lbMatch ? parseFloat(lbMatch[1]) : NaN;
const bodyApplies = [];
for (const art of ARTICLES) {
  const uses = /line-height\s*:\s*var\(--leading-body\)/.test(read(art.file));
  bodyApplies.push({ file: art.file, uses });
}
const allApply = bodyApplies.every((b) => b.uses);

console.log("=== check-spacing.mjs (D-1 / D-3) ===");
if (scanned === 0) {
  console.log("FAIL: margin/padding/gap 宣言が1件も見つからない（パーサ不具合の疑い）");
  process.exit(1);
}
console.log(`D-1: 走査した margin/padding/gap 宣言数 = ${scanned}`);
console.log(`D-1: トークン外の生px/rem直書き = ${violations.length} 件`);
for (const v of violations) console.log("     - " + v);

const d3ok = Number.isFinite(leadingBody) && leadingBody >= 1.5 && allApply;
console.log(`D-3: --leading-body = ${leadingBody}（≥1.5 必須）`);
for (const b of bodyApplies) console.log(`     - ${b.file} 本文適用 = ${b.uses}`);

const pass = violations.length === 0 && d3ok;
console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
process.exit(pass ? 0 : 1);
