#!/usr/bin/env tsx

/**
 * Supabaseログ確認スクリプト（TypeScript版）
 *
 * 使用方法:
 *   tsx scripts/check-supabase-logs.ts [function-name] [--limit N] [--follow]
 *
 * 例:
 *   tsx scripts/check-supabase-logs.ts create-checkout
 *   tsx scripts/check-supabase-logs.ts create-checkout --limit 50
 *   tsx scripts/check-supabase-logs.ts --all
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

const PROJECT_ID = "fryogvfhymnpiqwssmuu";

interface LogOptions {
  functionName?: string;
  limit?: number;
  follow?: boolean;
  all?: boolean;
}

function parseArgs(): LogOptions {
  const args = process.argv.slice(2);
  const options: LogOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--all" || arg === "-a") {
      options.all = true;
    } else if (arg === "--limit" || arg === "-l") {
      options.limit = parseInt(args[++i] || "20", 10);
    } else if (arg === "--follow" || arg === "-f") {
      options.follow = true;
    } else if (!arg.startsWith("--")) {
      options.functionName = arg;
    }
  }

  return options;
}

function checkSupabaseCLI(): boolean {
  try {
    execSync("which supabase", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkProjectLinked(): boolean {
  try {
    const configPath = join(process.cwd(), "supabase", "config.toml");
    const config = readFileSync(configPath, "utf-8");
    return config.includes(PROJECT_ID);
  } catch {
    return false;
  }
}

function getLogs(options: LogOptions): void {
  if (!checkSupabaseCLI()) {
    console.error("❌ Supabase CLIがインストールされていません");
    console.error("");
    console.error("インストール方法:");
    console.error("  macOS: brew install supabase/tap/supabase");
    console.error("  または: npm install -g supabase");
    console.error("");
    console.error("インストール後、以下でログインしてください:");
    console.error("  supabase login");
    process.exit(1);
  }

  if (!checkProjectLinked()) {
    console.error("❌ Supabaseプロジェクトがリンクされていません");
    console.error(`以下のコマンドでリンクしてください:`);
    console.error(`  supabase link --project-ref ${PROJECT_ID}`);
    process.exit(1);
  }

  const commandParts = ["supabase", "functions", "logs"];

  if (options.functionName && !options.all) {
    commandParts.push(options.functionName);
  }

  if (options.limit) {
    commandParts.push("--limit", options.limit.toString());
  }

  if (options.follow) {
    commandParts.push("--follow");
  }

  console.log("🔍 Supabaseログ確認");
  console.log(`プロジェクトID: ${PROJECT_ID}`);
  if (options.functionName) {
    console.log(`Function: ${options.functionName}`);
  } else {
    console.log("Function: すべて");
  }
  console.log("");

  try {
    const command = commandParts.join(" ");
    console.log(`実行コマンド: ${command}`);
    console.log("");

    execSync(command, { stdio: "inherit" });
  } catch (error: any) {
    if (error.status === 1) {
      console.error("❌ ログの取得に失敗しました");
      console.error("以下を確認してください:");
      console.error("  1. Supabase CLIにログインしているか (supabase login)");
      console.error("  2. プロジェクトがリンクされているか (supabase link)");
      console.error("  3. インターネット接続があるか");
    } else {
      console.error("エラー:", error.message);
    }
    process.exit(1);
  }
}

// メイン処理
const options = parseArgs();
getLogs(options);


