#!/usr/bin/env node
/* ============================================================
   check-quiz.mjs — 理解度クイズの機械検査（記事コンフィグ駆動）
   §9 仕様の検査:
   - 問数 = 5（クイズを持つ記事）
   - 各問に解説（.explain）がある
   - 各問の解説に台帳ID出典（data-ledger）がある
   - 各問の正解フラグ（data-correct）がちょうど1つ
   クイズを持たない記事（spacing.html 等）はスキップ扱い（ループ2候補）。
   Node標準モジュールのみ。
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ARTICLES } from "./config.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

const EXPECTED_QUESTIONS = 5;

console.log("=== check-quiz.mjs (理解度クイズ §9) ===");
let anyFail = false;

for (const art of ARTICLES) {
  const html = read(art.file);
  const quizM = html.match(/<section[^>]*class="[^"]*\bquiz\b[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
  if (!quizM) {
    console.log(`\n--- ${art.file} ---`);
    console.log("  クイズなし → スキップ（ループ2候補）");
    continue;
  }
  const quiz = quizM[1];

  /* data-q マーカーで設問セグメントに分割 */
  const parts = quiz.split(/<div class="q"/i).slice(1); // 先頭はクイズ見出し等
  const nQuestions = parts.length;

  let withExplain = 0;
  let withLedger = 0;
  let oneCorrect = 0;
  const perQ = [];
  parts.forEach((seg, i) => {
    const hasExplain = /class="explain"/i.test(seg);
    const hasLedger = /data-ledger="/i.test(seg);
    const correctN = (seg.match(/data-correct/gi) || []).length;
    if (hasExplain) withExplain++;
    if (hasLedger) withLedger++;
    if (correctN === 1) oneCorrect++;
    perQ.push({ q: i + 1, hasExplain, hasLedger, correctN });
  });

  const pass =
    nQuestions === EXPECTED_QUESTIONS &&
    withExplain === nQuestions &&
    withLedger === nQuestions &&
    oneCorrect === nQuestions;
  if (!pass) anyFail = true;

  console.log(`\n--- ${art.file} ---`);
  console.log(`  問数 = ${nQuestions}（要求${EXPECTED_QUESTIONS}）`);
  console.log(`  解説あり = ${withExplain}/${nQuestions} / 解説に出典ID = ${withLedger}/${nQuestions} / 正解フラグ=1 = ${oneCorrect}/${nQuestions}`);
  for (const p of perQ) {
    if (!(p.hasExplain && p.hasLedger && p.correctN === 1)) {
      console.log(`     - Q${p.q}: explain=${p.hasExplain} ledger=${p.hasLedger} correct=${p.correctN}`);
    }
  }
  console.log(`  ${pass ? "PASS" : "FAIL"}`);
}

console.log(anyFail ? "\nRESULT: FAIL" : "\nRESULT: PASS");
process.exit(anyFail ? 1 : 0);
