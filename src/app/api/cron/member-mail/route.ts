// src/app/api/cron/member-mail/route.ts
// 会員メール（#264 スライス1）の送る処理。Vercel Cron（月曜・火曜 8:00 JST）と、手動の実行（同じ CRON_SECRET）から GET で叩く。
// 既存 cron と同じ型（CRON_SECRET の Bearer 検証・fail-closed / force-dynamic）。
//
// やること:
// 1. 送り始めてよい文面（scheduled_at <= 今）ごとに、スイッチに合わせて対象を選ぶ
//    （人数だけ → 人数を記録して運用 Slack へ / オーナーだけ・全員 → 送信の記録に書く）
// 2. 送信の記録から1回分（数十人・1日の上限・8〜21時）を送る
// 返す JSON は件数だけ（個人情報なし）。

import { NextRequest, NextResponse } from "next/server";
import { prepareCampaign, runSendBatch, type PrepareResult } from "@/lib/member-mail/process";
import { createMailDeps } from "@/lib/member-mail/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deps = createMailDeps();
  if (!deps) return NextResponse.json({ skipped: "not_configured" });

  try {
    const campaigns = await deps.store.listDueCampaigns(deps.now());
    const prepared: { campaignId: string; outcome: PrepareResult["outcome"]; detail?: unknown }[] = [];
    for (const campaign of campaigns) {
      const result = await prepareCampaign(deps, campaign);
      prepared.push({
        campaignId: campaign.id,
        outcome: result.outcome,
        detail:
          result.outcome === "counted"
            ? result.count
            : result.outcome === "enqueued"
              ? { audience: result.audience, inserted: result.inserted }
              : result.outcome === "blocked"
                ? result.reason
                : undefined,
      });
    }
    const batch = deps.mail ? await runSendBatch(deps) : { skippedReason: "mail_not_configured" };
    return NextResponse.json({ prepared, batch });
  } catch (error) {
    console.error("[member-mail] cron failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "member_mail_failed" }, { status: 500 });
  }
}
