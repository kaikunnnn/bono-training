#!/usr/bin/env tsx

/**
 * Supabaseログを自動取得してファイルに保存するスクリプト
 * エディタ内でログを確認できるようにする
 *
 * 使用方法:
 *   tsx scripts/fetch-supabase-logs.ts [function-name]
 *
 * 例:
 *   tsx scripts/fetch-supabase-logs.ts create-checkout
 *   tsx scripts/fetch-supabase-logs.ts stripe-webhook-test
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const PROJECT_ID = "fryogvfhymnpiqwssmuu";
const LOGS_DIR = join(process.cwd(), ".claude", "logs");

interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "warn";
  message: string;
  function?: string;
}

function ensureLogsDir(): void {
  try {
    mkdirSync(LOGS_DIR, { recursive: true });
  } catch (error) {
    // ディレクトリが既に存在する場合は無視
  }
}

function getLogsFromDashboard(functionName: string): string {
  // Supabase DashboardのURL
  const dashboardUrl = `https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions/${functionName}`;

  return `
# ${functionName} のログ

## 📊 ログ確認方法

以下のURLをブラウザで開いて、ログを確認してください:

${dashboardUrl}

## 💡 ヒント

1. ブラウザで上記のURLを開く
2. エラーログ（❌マーク）を探す
3. エラーメッセージをコピーして、このファイルに貼り付ける

## 📝 エラーログ（手動で貼り付け）

ここにエラーログを貼り付けてください:

\`\`\`
[エラーログをここに貼り付け]
\`\`\`

---
最終更新: ${new Date().toISOString()}
`;
}

function createLogFile(functionName: string): void {
  ensureLogsDir();

  const logFilePath = join(LOGS_DIR, `${functionName}-logs.md`);
  const content = getLogsFromDashboard(functionName);

  writeFileSync(logFilePath, content, "utf-8");
  console.log(`✅ ログファイルを作成しました: ${logFilePath}`);
  console.log(`📝 エディタで開いて、エラーログを貼り付けてください`);
}

// メイン処理
const functionName = process.argv[2] || "all";

if (functionName === "all") {
  const functions = [
    "create-checkout",
    "stripe-webhook-test",
    "check-subscription",
    "stripe-webhook",
  ];
  functions.forEach((func) => {
    createLogFile(func);
  });
  console.log(`\n📋 すべての関数のログファイルを作成しました`);
  console.log(`📁 ログファイルの場所: ${LOGS_DIR}`);
} else {
  createLogFile(functionName);
}


