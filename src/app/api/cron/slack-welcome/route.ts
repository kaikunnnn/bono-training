// src/app/api/cron/slack-welcome/route.ts
// Slack ウェルカムDM（#238）の取りこぼし拾い直し。日次の Vercel Cron から GET で叩かれる。
// 既存 cron と同じ型を踏襲（CRON_SECRET の Bearer 検証・fail-closed / force-dynamic）。
//
// やること:
// 1. 送信中（sending）のまま10分以上止まっている行を needs_review にする（自動で送り直さない）
// 2. queued / retry_wait / pending_activation / 期限切れの processing を処理する
//    （送信は受け口の after() と同じ processDelivery を使う）
// 返す JSON は件数だけ（個人情報なし）。

import { NextRequest, NextResponse } from "next/server";
import { runSweep } from "@/lib/slack-welcome/process";
import { createWelcomeDeps, getWelcomeStore } from "@/lib/slack-welcome/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vercel Cron 規約: CRON_SECRET で Bearer 検証（fail-closed: env未設定でも拒否）
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deps = createWelcomeDeps(getWelcomeStore());
  if (!deps) {
    // 本番化前（トークン未設定）は何もしない
    return NextResponse.json({ skipped: "not_configured" });
  }

  try {
    const result = await runSweep(deps);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[slack-welcome] sweep failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "sweep_failed" }, { status: 500 });
  }
}
