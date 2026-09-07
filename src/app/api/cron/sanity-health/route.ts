// src/app/api/cron/sanity-health/route.ts
// Sanity API のヘルスチェック。無料プラン移行後の枠超過（402 plan_limit_reached）を
// 早期検知し、Slack（OPSチャンネル）へ復旧リンク付きで通知する。
// 毎日1回 Vercel Cron から GET で叩かれる想定。
// 関連: rebono/issues/200-sanity-health-monitoring.md / issue #163（7月の402事件）
//
// チェック先は非CDNの api.sanity.io（枠停止の影響を最初に受けるエンドポイント）。
// 1日1回の最小GROQなので枠消費は無視できる。

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MANAGE_URL = "https://www.sanity.io/manage";

type HealthStatus = "ok" | "quota_exceeded" | "error";

async function sendSlackAlert(
  webhookUrl: string,
  status: HealthStatus,
  detail: string
): Promise<void> {
  const isQuota = status === "quota_exceeded";
  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: isQuota
            ? "🚨 Sanity APIの利用枠が上限に達しました"
            : "⚠️ Sanity APIヘルスチェック失敗",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: isQuota
            ? "無料プランの枠超過（402）です。新規コンテンツの取得と掲示板が止まっている可能性があります。既存ページのキャッシュ表示は継続します。"
            : `Sanity APIへの疎通に失敗しました。\n\`\`\`${detail.slice(0, 300)}\`\`\``,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*復旧手順:* <${MANAGE_URL}|manage.sanity.io> → 対象プロジェクト → Plan からアップグレードすると即時復旧します。`,
        },
      },
    ],
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}

export async function GET(request: NextRequest) {
  // Vercel Cron 規約: CRON_SECRET が設定されていれば Bearer で検証する
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

  if (!projectId || !dataset) {
    return NextResponse.json(
      { error: "Sanity の環境変数が設定されていません" },
      { status: 500 }
    );
  }

  // 最小コストのGROQ（ドキュメント1件のIDのみ取得）
  const query = encodeURIComponent("*[_id != ''][0]._id");
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`;

  let status: HealthStatus = "ok";
  let detail = "";

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (res.status === 402) {
      status = "quota_exceeded";
      detail = await res.text().catch(() => "402 Payment Required");
    } else if (!res.ok) {
      status = "error";
      detail = `HTTP ${res.status}: ${await res.text().catch(() => "")}`;
    }
  } catch (err) {
    status = "error";
    detail = err instanceof Error ? err.message : String(err);
  }

  let alerted = false;
  if (status !== "ok") {
    console.error(
      JSON.stringify({
        level: "error",
        category: "sanity_health",
        status,
        detail: detail.slice(0, 500),
        timestamp: new Date().toISOString(),
      })
    );

    // 運用アラートは OPS チャンネルへ集約（未設定時は共有チャンネルへフォールバック）
    const webhookUrl =
      process.env.SLACK_OPS_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await sendSlackAlert(webhookUrl, status, detail);
        alerted = true;
      } catch (err) {
        console.error("Failed to send sanity health Slack alert:", err);
      }
    } else {
      console.log("Slack webhook not configured, skipping sanity health alert");
    }
  }

  return NextResponse.json({ status, alerted, checkedAt: new Date().toISOString() });
}
