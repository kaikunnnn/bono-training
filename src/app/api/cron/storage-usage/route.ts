// src/app/api/cron/storage-usage/route.ts
// Supabase Storage の使用量を集計し、Free 枠の 80%（800MB）を超えたら
// Slack に警告を送る。週1の Vercel Cron から GET で叩かれる想定。
// 関連: rebono/issues/画像基盤：アバターと投稿添付.md (#145) 容量アラート
//
// Free プラン（storage 1GB）前提。Pro 化する際はこの定数を変更するだけで済む。

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---- しきい値・上限（Pro 化時にここだけ変更すればよい）----
const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // Free: 1GB
const ALERT_THRESHOLD_RATIO = 0.8; // 80%
const ALERT_THRESHOLD_BYTES = STORAGE_LIMIT_BYTES * ALERT_THRESHOLD_RATIO; // 800MB

// Vercel の Cron は最大 1 回/日程度で短時間実行される想定
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface StorageObjectRow {
  bucket_id: string | null;
  metadata: { size?: number } | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

async function sendSlackAlert(
  webhookUrl: string,
  totalBytes: number,
  perBucket: Record<string, number>
): Promise<void> {
  const ratioPct = ((totalBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(1);

  const breakdownLines = Object.entries(perBucket)
    .sort((a, b) => b[1] - a[1])
    .map(([bucket, bytes]) => `• ${bucket}: ${formatBytes(bytes)}`)
    .join("\n");

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⚠️ ストレージ使用量が閾値を超えました",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*使用量:*\n${formatBytes(totalBytes)} / ${formatBytes(
              STORAGE_LIMIT_BYTES
            )} (${ratioPct}%)`,
          },
          {
            type: "mrkdwn",
            text: `*閾値:*\n${formatBytes(ALERT_THRESHOLD_BYTES)} (${(
              ALERT_THRESHOLD_RATIO * 100
            ).toFixed(0)}%)`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*バケット別内訳:*\n${breakdownLines || "（データなし）"}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Supabase Free 枠（1GB）の 80% に到達しました。不要な画像の削除、または Pro 化を検討してください。",
          },
        ],
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

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase の環境変数が設定されていません" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // storage.objects を service role で走査し、metadata.size をバケット別に合計する。
  // PostgREST 側の集計に頼らず JS で合算する（この規模なら全件取得で十分）。
  const perBucket: Record<string, number> = {};
  let totalBytes = 0;
  const pageSize = 1000;
  let from = 0;

  // ページングで全件走査（storage スキーマへは .schema('storage') でアクセスできる）
  for (;;) {
    const { data, error } = await supabase
      .schema("storage")
      .from("objects")
      .select("bucket_id, metadata")
      .range(from, from + pageSize - 1);

    if (error) {
      return NextResponse.json(
        { error: `ストレージ集計に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as StorageObjectRow[];
    for (const row of rows) {
      const size =
        typeof row.metadata?.size === "number" ? row.metadata.size : 0;
      const bucket = row.bucket_id ?? "(unknown)";
      perBucket[bucket] = (perBucket[bucket] ?? 0) + size;
      totalBytes += size;
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  const overThreshold = totalBytes >= ALERT_THRESHOLD_BYTES;
  let alerted = false;

  if (overThreshold) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await sendSlackAlert(webhookUrl, totalBytes, perBucket);
        alerted = true;
      } catch (err) {
        console.error("Failed to send storage usage Slack alert:", err);
      }
    } else {
      console.log(
        "SLACK_WEBHOOK_URL not configured, skipping storage usage alert"
      );
    }
  }

  return NextResponse.json({
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
    limitBytes: STORAGE_LIMIT_BYTES,
    thresholdBytes: ALERT_THRESHOLD_BYTES,
    ratio: totalBytes / STORAGE_LIMIT_BYTES,
    perBucket,
    overThreshold,
    alerted,
  });
}
