#!/usr/bin/env node
/* ============================================================
   check-content.mjs — C-1 / C-3 / E-1（記事コンフィグ駆動）
   C-1 本文文字数: <main> のテキストから タグ・script・style・svg・
       出典チップ文言・理解度クイズ・HOW TOボックス を除いた非空白文字数（4,000〜6,000字）。
       ※ クイズ(section.quiz)は「本文(記事プロース)」ではなくトレーニング要素
         のため C-1 の字数対象から除外する（check-quiz.mjs が別途検査）。
       ※ HOW TOボックス(div.howto)も同様に、流れる本文プロースではなく「まず
         やること」を提示する指示型UI要素のため C-1 の字数対象から除外する
         （2026-09-01 の Tak フィードバック起点の HOW TO先行再構成で追加。
          クイズ除外と同じ扱い。判断は 01-eval-log.md に記録）。
   C-3 図解比率: 全項目に <svg> or <figure> が1つ以上。
   E-1 一次ソース比率: 出典チップ(a.cite)のURLを一次/二次に分類し ≥90%。
   Node標準モジュールのみ。
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ARTICLES } from "./config.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const PRIMARY = [
  "w3.org", "developer.android.com", "developer.apple.com",
  "design-system.service.gov.uk", "gov.uk", "nngroup.com", "lawsofux.com",
  "m3.material.io", "m1.material.io", "support.google.com",
  "raw.githubusercontent.com/uber/baseweb", "github.com/uber/baseweb",
  "material-components/material-web",
];

const itemRe = /<section class="item"[^>]*data-item="(\d+)"[^>]*>([\s\S]*?)<\/section>/g;
const citeHrefRe = /<a[^>]*class="cite"[^>]*href="([^"]+)"/g;
const citeHrefRe2 = /<a[^>]*href="([^"]+)"[^>]*class="cite"/g;

console.log("=== check-content.mjs (C-1 / C-3 / E-1) ===");
let anyFail = false;

for (const art of ARTICLES) {
  const html = readFileSync(join(ROOT, art.file), "utf8");

  /* --- C-1: 本文文字数（クイズ除外） --- */
  const mainM = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let main = mainM ? mainM[1] : html;
  main = main
    .replace(/<section[^>]*class="[^"]*\bquiz\b[^"]*"[^>]*>[\s\S]*?<\/section>/gi, " ") // クイズ除外
    .replace(/<div[^>]*class="[^"]*\bhowto\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi, " ") // HOW TOボックス除外
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<a[^>]*class="cite"[^>]*>[\s\S]*?<\/a>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z]+;/g, "")
    .replace(/&#\d+;/g, "");
  const charCount = main.replace(/\s+/g, "").length;

  /* --- C-3: 各項目の図解数 --- */
  const itemFig = [];
  for (const m of html.matchAll(itemRe)) {
    const body = m[2];
    const figs = (body.match(/<svg\b/gi) || []).length + (body.match(/<figure\b/gi) || []).length;
    itemFig.push({ n: Number(m[1]), figs });
  }
  const itemsWithFig = itemFig.filter((i) => i.figs >= 1).length;

  /* --- E-1: 一次ソース比率 --- */
  const hrefs = [];
  for (const m of html.matchAll(citeHrefRe)) hrefs.push(m[1]);
  for (const m of html.matchAll(citeHrefRe2)) hrefs.push(m[1]);
  let primary = 0;
  const secondary = [];
  for (const h of hrefs) {
    if (PRIMARY.some((d) => h.includes(d))) primary++;
    else secondary.push(h);
  }
  const e1 = hrefs.length ? (primary / hrefs.length) * 100 : 0;

  const c1ok = charCount >= 4000 && charCount <= 6000;
  const c3ok = itemFig.length === art.expectedItems && itemsWithFig === art.expectedItems;
  const e1ok = e1 >= 90;
  if (!(c1ok && c3ok && e1ok)) anyFail = true;

  console.log(`\n--- ${art.file} ---`);
  console.log(`C-1 本文文字数 = ${charCount} 字（要求 4,000〜6,000・クイズ除外） ${c1ok ? "PASS" : "FAIL"}`);
  console.log(`C-3 図解を持つ項目 = ${itemsWithFig}/${itemFig.length}（要求 全項目≥1） ${c3ok ? "PASS" : "FAIL"}`);
  for (const i of itemFig) if (i.figs === 0) console.log(`     - 項目${i.n} に図解なし`);
  console.log(`E-1 一次ソース比率 = ${e1.toFixed(1)}%（要求≥90） 一次${primary}/総${hrefs.length} ${e1ok ? "PASS" : "FAIL"}`);
  for (const s of secondary) console.log(`     - 二次ソース疑い: ${s}`);
}

console.log(anyFail ? "\nRESULT: FAIL" : "\nRESULT: PASS");
process.exit(anyFail ? 1 : 0);
