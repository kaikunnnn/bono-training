#!/usr/bin/env node
/* ============================================================
   check-citations.mjs — A-1 / A-2 / A-3 / A-4（記事コンフィグ駆動）
   A-1 出典カバー率: 各項目の事実主張(span[data-type=fact])を含む項目が
                     出典チップ(a.cite[data-ledger])を持つ割合 = 100%。
   A-2 事実/解釈の分離: 全項目が fact と interpretation の両ラベルを保有 = 100%。
   A-3 反例の存在: data-role="counterexample" が1件以上（各記事）。
   A-4 出典の実在性: 全記事の全 data-ledger ID が台帳md（docs/10-ledger/）に実在。
   J3: 記事の data-ledger は F/S/Q のみ（③層 洗練/A は本文言及に留める）。
   Node標準モジュールのみ。
   ============================================================ */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ARTICLES } from "./config.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const LEDGER = join(ROOT, "..", "docs", "10-ledger");

const itemRe = /<section class="item"[^>]*data-item="(\d+)"[^>]*>([\s\S]*?)<\/section>/g;
const factRe = /<span[^>]*data-type="fact"[^>]*>/g;
const interpRe = /<span[^>]*data-type="interpretation"[^>]*>/g;
const citeRe = /<a[^>]*class="cite"[^>]*data-ledger="([^"]+)"[^>]*>/g;
const citeRe2 = /<a[^>]*data-ledger="([^"]+)"[^>]*class="cite"[^>]*>/g;
const count = (re, s) => (s.match(re) || []).length;

/* --- 台帳の実在ID集合（A-4 用・全記事共通） --- */
const ledgerIds = new Set();
for (const f of readdirSync(LEDGER)) {
  if (!f.endsWith(".md")) continue;
  const md = readFileSync(join(LEDGER, f), "utf8");
  for (const m of md.matchAll(/^#{2,4}\s*([FSQ]-\d{2})\b/gm)) ledgerIds.add(m[1]);
  for (const m of md.matchAll(/\*\*([FSQ]-\d{2})\*\*/g)) ledgerIds.add(m[1]);
}

console.log("=== check-citations.mjs (A-1..A-4) ===");
console.log(`台帳から検出したID数 = ${ledgerIds.size}`);

let anyFail = false;

for (const art of ARTICLES) {
  const html = readFileSync(join(ROOT, art.file), "utf8");
  const items = [];
  for (const m of html.matchAll(itemRe)) items.push({ n: Number(m[1]), body: m[2] });

  let totalFacts = 0;
  let itemsWithFactAndCite = 0;
  let itemsWithBothLabels = 0;
  const usedIds = new Set();

  for (const it of items) {
    const facts = count(factRe, it.body);
    const interps = count(interpRe, it.body);
    const cites = [...it.body.matchAll(citeRe), ...it.body.matchAll(citeRe2)];
    totalFacts += facts;
    if (facts >= 1 && cites.length >= 1) itemsWithFactAndCite++;
    if (facts >= 1 && interps >= 1) itemsWithBothLabels++;
  }
  /* 記事全体の cite（項目外の導入・クイズ含む）も A-4 用に収集 */
  for (const m of html.matchAll(citeRe)) usedIds.add(m[1]);
  for (const m of html.matchAll(citeRe2)) usedIds.add(m[1]);

  const counterexamples = count(/data-role="counterexample"/g, html);
  const missing = [...usedIds].filter((id) => !ledgerIds.has(id));

  const a1 = items.length > 0 ? (itemsWithFactAndCite / items.length) * 100 : 0;
  const a2 = items.length > 0 ? (itemsWithBothLabels / items.length) * 100 : 0;

  const pass =
    items.length === art.expectedItems &&
    a1 === 100 &&
    a2 === 100 &&
    counterexamples >= 1 &&
    missing.length === 0;
  if (!pass) anyFail = true;

  console.log(`\n--- ${art.file} ---`);
  console.log(`項目数 = ${items.length}（期待${art.expectedItems}） / 事実span総数 = ${totalFacts} / 使用出典ID = ${usedIds.size}`);
  console.log(`A-1 出典カバー率 = ${a1.toFixed(1)}%（要求100%）  ${itemsWithFactAndCite}/${items.length}`);
  console.log(`A-2 事実/解釈 両ラベル保有 = ${a2.toFixed(1)}%（要求100%）  ${itemsWithBothLabels}/${items.length}`);
  console.log(`A-3 反例マーカー = ${counterexamples} 件（要求≥1）`);
  console.log(`A-4 台帳未実在の出典ID = ${missing.length} 件（要求0）${missing.length ? " → " + missing.join(", ") : ""}`);
  console.log(`  ${pass ? "PASS" : "FAIL"}`);
}

console.log(anyFail ? "\nRESULT: FAIL" : "\nRESULT: PASS");
process.exit(anyFail ? 1 : 0);
