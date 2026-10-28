// src/app/api/cron/slack-member-sync/route.ts
// Slack を課金メンバーだけに保つ定期整理（#263）。日次の Vercel Cron から GET で叩かれる。
// 既存 cron と同じ型を踏襲（CRON_SECRET の Bearer 検証・fail-closed / force-dynamic）。
//
// やること（詳細は src/lib/slack-member-sync/process.ts）:
// 1. Slack のメンバー一覧を取り、BONO の課金と照合して一人ずつ判定する
// 2. モード（slack_member_sync_settings.mode）に応じて、つなぐお願い・外れるお知らせの DM を送る
// 3. 外す日が来た人・確認が必要な人がいれば、カイクンに自分宛てDMで報告する
// Slack から人を外す操作はしない（無料プランでは API がない。管理画面で手作業）。
// 返す JSON は件数だけ（個人情報なし）。

import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/slack-member-sync/process";
import { createSyncDeps, getSyncStore } from "@/lib/slack-member-sync/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 約700人の users.list（4ページ）＋ 1回最大100通の DM（1通あたり約1.5秒）が収まる長さ
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Vercel Cron 規約: CRON_SECRET で Bearer 検証（fail-closed: env未設定でも拒否）
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deps = createSyncDeps(getSyncStore());
  if (!deps) {
    // 本番化前（トークン未設定）は何もしない
    return NextResponse.json({ skipped: "not_configured" });
  }

  try {
    const result = await runSync(deps);
    return NextResponse.json(result, { status: result.error ? 502 : 200 });
  } catch (error) {
    console.error("[slack-member-sync] run failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
