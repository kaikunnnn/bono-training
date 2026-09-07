import "server-only";

/**
 * 通知パイプラインの失敗を構造化ログ＋（重大時のみ）運用Slackへ通知する（P0-1）。
 *
 * 位置づけ:
 * - monitoring.ts の reportAuthError と同じ思想（構造化JSON console.error ＋ 重大時Slack）を
 *   通知経路に横展開したもの。server-only（Server Component / Server Action 内からのみ）。
 * - 宛先は必ず運用アラート用 webhook（SLACK_OPS_WEBHOOK_URL）。未設定でも取りこぼさないよう
 *   旧 SLACK_WEBHOOK_URL にフォールバックする。⚠️ メンバー向け（SLACK_QUESTIONS_URL 等）へは絶対に送らない。
 * - この関数自身は fire-and-forget の一部。console/Slack が失敗しても呼び出し側の本処理
 *   （コメント投稿など）をクラッシュさせないため、例外を上へ投げない。
 */

/**
 * 失敗ステージ。insert（通知テーブルへの INSERT 失敗＝通知の完全な取りこぼし）のみ重大扱い。
 */
export type NotificationErrorStage =
  | "missing_recipient" // 宛先/actor 欠落
  | "config_missing" // Supabase service config 欠落
  | "preference_select" // オプトアウト判定の取得失敗（フェイルオープン）
  | "dedup_select" // 未読重複判定の取得失敗（フェイルオープン）
  | "insert" // 通知 INSERT 失敗（重大＝取りこぼし）
  | "threw"; // 予期しない例外

export interface NotificationErrorContext {
  stage: NotificationErrorStage;
  /** 通知種別（NotificationType）。分かる範囲で */
  type?: string;
  entityType?: string;
  entityId?: string;
  recipientId?: string;
  actorId?: string;
  /** 元エラー（PostgrestError / Error / unknown） */
  error?: unknown;
  /** 補足メッセージ */
  message?: string;
}

// insert 失敗のみ「通知の完全な取りこぼし」なので運用Slackへ即時通知する。
const CRITICAL_STAGES: NotificationErrorStage[] = ["insert"];

function serializeError(error: unknown): {
  message?: string;
  code?: string;
  details?: string;
} {
  if (!error) return {};
  if (typeof error === "string") return { message: error };
  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    return {
      message:
        typeof e.message === "string" ? e.message : String(error),
      code: typeof e.code === "string" ? e.code : undefined,
      details: typeof e.details === "string" ? e.details : undefined,
    };
  }
  return { message: String(error) };
}

/**
 * 通知失敗を記録する（ベストエフォート、例外を投げない）。
 * - 常に構造化JSONで console.error する。
 * - stage が重大（insert）のときだけ運用Slackへ1本通知する。
 */
export async function reportNotificationError(
  context: NotificationErrorContext,
): Promise<void> {
  const err = serializeError(context.error);

  console.error(
    JSON.stringify({
      level: "error",
      category: "notification",
      stage: context.stage,
      type: context.type,
      entityType: context.entityType,
      entityId: context.entityId,
      recipientId: context.recipientId,
      actorId: context.actorId,
      message: context.message,
      error: err.message,
      errorCode: err.code,
      errorDetails: err.details,
      timestamp: new Date().toISOString(),
    }),
  );

  if (!CRITICAL_STAGES.includes(context.stage)) return;

  // 運用アラート用 webhook（未設定なら旧chにフォールバックし、取りこぼしを防ぐ）
  const webhookUrl =
    process.env.SLACK_OPS_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text:
          `🚨 *通知の取りこぼし検知* \`${context.stage}\`\n` +
          `種別: \`${context.type ?? "unknown"}\`\n` +
          `entity: \`${context.entityType ?? "?"}\` / \`${context.entityId ?? "?"}\`\n` +
          `受信者: \`${context.recipientId ?? "?"}\`\n` +
          `エラー: ${err.message ?? "unknown"}` +
          (err.code ? ` (code: ${err.code})` : ""),
      }),
    });
  } catch {
    // Slack通知失敗は無視（アラート送信失敗で本処理をクラッシュさせない）
  }
}
