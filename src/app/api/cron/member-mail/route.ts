// src/app/api/cron/member-mail/route.ts
// 会員メール（#264 スライス1）の送る処理。Vercel Cron（月曜・火曜の 8:00 / 9:00 / 10:00 JST。1回で送り切れない分を次の回で送る）と、
// 手動の実行（同じ CRON_SECRET）から GET で叩く。?run= は cron の区別用で、処理には使わない。
//
// 常設の文面（327-D〜。入会2日後の朝の「はじめの案内」など）は毎朝 8:00 JST に選んで送る:
// - 月曜・火曜は上の run=8 の回が、1回分の文面と一緒に扱う
// - 水曜〜日曜は ?only=standing の回（vercel.json）。常設の文面だけを選び、常設の文面の行だけを送る
//   （週1回のメルマガの残りを平日に送ったり、承認の遅れた号を週の途中に書き出したりしない＝今の weekly の動きを変えない）
// 1日の通数は member_mail_settings.daily_limit（既定80）で止まる（264 決定: Resend 無料枠のため2日に分けて送る）。
// 対象が 上限×2 を超えると火曜に送り切れず、次の月曜の回で残りが送られる。その前に上限の見直しが要る。
// 既存 cron と同じ型（CRON_SECRET の Bearer 検証・fail-closed / force-dynamic）。
//
// やること:
// 1. 送り始めてよい文面（scheduled_at <= 今）ごとに、スイッチに合わせて対象を選ぶ
//    （人数だけ → 人数を記録して運用 Slack へ / オーナーだけ・全員 → 送信の記録に書く）
// 2. 常設の文面ごとに、今日が送る日の人を選ぶ（1つめと別に失敗を受け止め、weekly を巻き込まない）
// 3. 送信の記録から1回分（数十人・1日の上限・8〜21時）を送る
// 返す JSON は件数だけ（個人情報なし）。

import { NextRequest, NextResponse } from "next/server";
import { prepareCampaign, runSendBatch, type MailDeps, type PrepareResult } from "@/lib/member-mail/process";
import { createMailDeps } from "@/lib/member-mail/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** 1通の処理中に締め切りを超えても60秒に収まるよう、新しい1通に着手するのはここまで */
const SEND_BUDGET_MS = 45_000;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deps = createMailDeps();
  if (!deps) return NextResponse.json({ skipped: "not_configured" });
  const standingOnly = request.nextUrl.searchParams.get("only") === "standing";

  try {
    const prepared: PreparedItem[] = [];
    if (!standingOnly) {
      const campaigns = await deps.store.listDueCampaigns(deps.now());
      for (const campaign of campaigns) {
        prepared.push(describe(campaign.id, await prepareCampaign(deps, campaign)));
      }
    }
    const standing = await prepareStanding(deps, prepared);
    // 対象の書き出しに使った時間を差し引いて、maxDuration（60秒）に収める
    const timeBudgetMs = SEND_BUDGET_MS - (Date.now() - startedAt);
    let batch: unknown;
    if (!deps.mail) batch = { skippedReason: "mail_not_configured" };
    else if (standingOnly && standing.campaignIds === null) batch = { skippedReason: "standing_unavailable" };
    else
      batch = await runSendBatch(deps, {
        timeBudgetMs,
        ...(standingOnly ? { campaignIds: standing.campaignIds ?? [] } : {}),
      });
    return NextResponse.json({ prepared, batch });
  } catch (error) {
    console.error("[member-mail] cron failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "member_mail_failed" }, { status: 500 });
  }
}

type PreparedItem = { campaignId: string; outcome: PrepareResult["outcome"] | "error"; detail?: unknown };

function describe(campaignId: string, result: PrepareResult): PreparedItem {
  return {
    campaignId,
    outcome: result.outcome,
    detail:
      result.outcome === "counted"
        ? result.count
        : result.outcome === "enqueued"
          ? { audience: result.audience, inserted: result.inserted }
          : result.outcome === "blocked"
            ? result.reason
            : undefined,
  };
}

/**
 * 常設の文面を選ぶ。失敗しても weekly の送信は続ける（例: マイグレーション前で standing_key の列が無い）。
 * 返す campaignIds は、常設の文面だけを送るときの絞り込み。読めなかったら null。
 */
async function prepareStanding(deps: MailDeps, prepared: PreparedItem[]): Promise<{ campaignIds: string[] | null }> {
  let campaigns;
  try {
    campaigns = await deps.store.listStandingCampaigns(deps.now());
  } catch (error) {
    console.error("[member-mail] standing list failed:", error instanceof Error ? error.message : "unknown");
    return { campaignIds: null };
  }
  for (const campaign of campaigns) {
    try {
      prepared.push(describe(campaign.id, await prepareCampaign(deps, campaign)));
    } catch (error) {
      console.error("[member-mail] standing prepare failed:", error instanceof Error ? error.message : "unknown");
      prepared.push({ campaignId: campaign.id, outcome: "error" });
    }
  }
  return { campaignIds: campaigns.map((c) => c.id) };
}
