#!/usr/bin/env node
/* ============================================================
   check-contrast.mjs — D-2（記事コンフィグ駆動）
   tokens.css の色トークンから WCAG コントラスト比を「丸めずに」計算し
   （F-01: 4.499:1 は 4.5:1 を満たさない）、chromeテキストの前景/背景の組を検査。
   さらに:
   - <style>内の生hex（トークン由来でない色使用）を STYLE_HEX_FILES で検査。
   - SVG内の生hex（fill/stroke/stop-color/style属性）を svgHexCheck=true の記事で検査。
     specimen色も tokens.css の --swatch-* を var() で参照させ、生hex直書きをゼロにする。
   Node標準モジュールのみ。
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ARTICLES, STYLE_HEX_FILES, CONTRAST_PAIRS } from "./config.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

const tokensCss = read("tokens.css");
const colors = {};
for (const m of tokensCss.matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})\b/g)) {
  colors[m[1]] = m[2];
}

function srgbToLin(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function contrast(fgTok, bgTok) {
  const L1 = luminance(colors[fgTok]);
  const L2 = luminance(colors[bgTok]);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

console.log("=== check-contrast.mjs (D-2) ===");
if (Object.keys(colors).length === 0) {
  console.log("FAIL: tokens.css から色トークンを1件も取得できない");
  process.exit(1);
}

/* --- コントラストペア（chromeテキストのみ・両記事共通） --- */
let fails = 0;
for (const p of CONTRAST_PAIRS) {
  if (!colors[p.fg] || !colors[p.bg]) {
    console.log(`FAIL: トークン未定義 ${p.fg} / ${p.bg}`);
    fails++;
    continue;
  }
  const ratio = contrast(p.fg, p.bg);
  const ok = ratio >= p.min;
  if (!ok) fails++;
  console.log(
    `${ok ? "OK  " : "FAIL"} ${ratio.toFixed(3)}:1 (要求${p.min}) ` +
    `${p.fg}(${colors[p.fg]}) / ${p.bg}(${colors[p.bg]})  — ${p.note}`
  );
}

/* --- <style>内の生hex --- */
const styleHex = [];
for (const f of STYLE_HEX_FILES) {
  const html = read(f);
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const h of m[1].matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) styleHex.push(`${f} <style>: ${h[0]}`);
  }
}
console.log(`\nHTMLの<style>内の生hex = ${styleHex.length} 件（色はトークン経由が原則。0件が理想）`);
for (const r of styleHex) console.log("     - " + r);

/* --- SVG内の生hex（fill/stroke/stop-color/style属性）: svgHexCheck=true の記事のみ --- */
const svgHex = [];
const ATTR_RE = /(?:fill|stroke|stop-color)\s*=\s*"([^"]*)"/gi;
const STYLE_ATTR_RE = /style\s*=\s*"([^"]*)"/gi;
const HEX_RE = /#[0-9A-Fa-f]{3,8}\b/g;
for (const art of ARTICLES) {
  if (!art.svgHexCheck) continue;
  const html = read(art.file);
  for (const svg of html.matchAll(/<svg[\s\S]*?<\/svg>/gi)) {
    const block = svg[0];
    for (const m of block.matchAll(ATTR_RE)) {
      for (const h of m[1].matchAll(HEX_RE)) svgHex.push(`${art.file} SVG fill/stroke: ${h[0]}`);
    }
    for (const m of block.matchAll(STYLE_ATTR_RE)) {
      for (const h of m[1].matchAll(HEX_RE)) svgHex.push(`${art.file} SVG style="": ${h[0]}`);
    }
  }
}
const svgTargets = ARTICLES.filter((a) => a.svgHexCheck).map((a) => a.file).join(", ") || "（なし）";
console.log(`\nSVG内の生hex（対象: ${svgTargets}）= ${svgHex.length} 件（すべて var(--swatch-*) 経由が必須。0件が理想）`);
for (const r of svgHex) console.log("     - " + r);

const pass = fails === 0 && styleHex.length === 0 && svgHex.length === 0;
console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
process.exit(pass ? 0 : 1);
