import "server-only";

/**
 * 会員メール（#264）の運用通知。件数と理由コードだけを送る（名前・アドレス・本文は出さない）。
 *
 * 宛先は SLACK_OPS_WEBHOOK_URL のみ。未設定なら送らない。
 * ★メンバー向けの SLACK_WEBHOOK_URL には絶対にフォールバックしない（質問chへの誤爆防止）。
 */

export interface MailOpsAlert {
  /** 見出し（固定文言） */
  title: string;
  /** 例: { sent: 80, needs_review: 1 } */
  counts: Record<string, number>;
  /** 補足（固定文言のみ。個人情報を入れない） */
  note?: string;
}

export type NotifyMailOps = (alert: MailOpsAlert) => Promise<void>;

export const notifyMailOps: NotifyMailOps = async (alert) => {
  const webhookUrl = process.env.SLACK_OPS_WEBHOOK_URL;
  const entries = Object.entries(alert.counts).filter(([, n]) => Number.isFinite(n));
  if (entries.length === 0) return;
  if (!webhookUrl) {
    console.warn("[member-mail] SLACK_OPS_WEBHOOK_URL not configured, skipping ops alert", alert.counts);
    return;
  }
  const lines = entries.map(([key, n]) => `• ${key}: ${n}`).join("\n");
  const text = `:email: 会員メール（#264）${alert.title}\n${lines}${alert.note ? `\n${alert.note}` : ""}`;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error("[member-mail] failed to send ops alert:", error instanceof Error ? error.message : "unknown");
  }
};
