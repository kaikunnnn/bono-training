import "server-only";

/**
 * 運用アラート（#238）。件数とエラーコードだけを送る（名前・本文・トークンは出さない）。
 *
 * 宛先は SLACK_OPS_WEBHOOK_URL のみ。未設定なら送らない。
 * ★メンバー向けの SLACK_WEBHOOK_URL には絶対にフォールバックしない（質問chへの誤爆防止）。
 */

export interface OpsAlert {
  /** 例: { needs_review: 1 } / { message_not_approved: 1 } */
  counts: Record<string, number>;
  /** 補足（固定文言のみ。個人情報を入れない） */
  note?: string;
}

export type NotifyOps = (alert: OpsAlert) => Promise<void>;

export const notifyOps: NotifyOps = async (alert) => {
  const webhookUrl = process.env.SLACK_OPS_WEBHOOK_URL;
  const entries = Object.entries(alert.counts).filter(([, n]) => n > 0);
  if (entries.length === 0) return;
  if (!webhookUrl) {
    console.warn("[slack-welcome] SLACK_OPS_WEBHOOK_URL not configured, skipping ops alert", alert.counts);
    return;
  }
  const lines = entries.map(([key, n]) => `• ${key}: ${n} 件`).join("\n");
  const text = `:warning: Slack ウェルカムDM（#238）で確認が必要です\n${lines}${
    alert.note ? `\n${alert.note}` : ""
  }\nSupabase の slack_welcome_deliveries を確認してください。`;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error("[slack-welcome] failed to send ops alert:", error instanceof Error ? error.message : "unknown");
  }
};
