#!/usr/bin/env node
/* ============================================================
   run-all.mjs — 全記事 × 全チェックを実行し1つのサマリを出す
   ARTICLES（config.mjs）を各 check-*.mjs が内部でループするため、
   ここでは5つのチェックを順に実行し、合否を集約する。
   Node標準モジュールのみ・ゼロインストール。
   ============================================================ */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECKS = [
  "check-citations.mjs",
  "check-content.mjs",
  "check-spacing.mjs",
  "check-contrast.mjs",
  "check-quiz.mjs",
];

const results = [];
for (const c of CHECKS) {
  const r = spawnSync(process.execPath, [join(HERE, c)], { encoding: "utf8" });
  process.stdout.write(r.stdout || "");
  if (r.stderr) process.stderr.write(r.stderr);
  results.push({ check: c, code: r.status });
  console.log("");
}

console.log("================= run-all サマリ =================");
let anyFail = false;
for (const r of results) {
  const ok = r.code === 0;
  if (!ok) anyFail = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.check}`);
}
console.log("=================================================");
console.log(anyFail ? "ALL RESULT: FAIL" : "ALL RESULT: PASS（両記事・全チェック）");
process.exit(anyFail ? 1 : 0);
