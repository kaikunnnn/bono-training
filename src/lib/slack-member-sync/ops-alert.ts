import "server-only";

/**
 * 運用アラート（#263）。件数とエラーコードだけを送る（名前・本文・トークンは出さない）。
 * #238 の ops-alert.ts と同じ作り。
 *
 * 宛先は SLACK_OPS_WEBHOOK_URL のみ。未設定なら送らない。
 * ★メンバー向けの SLACK_WEBHOOK_URL には絶対にフォールバックしない（質問chへの誤爆防止）。
 */
import type { NotifyOps } from "@/lib/slack-welcome/ops-alert";

export type { NotifyOps, OpsAlert } from "@/lib/slack-welcome/ops-alert";

export const notifySyncOps: NotifyOps = async (alert) => {
  const webhookUrl = process.env.SLACK_OPS_WEBHOOK_URL;
  const entries = Object.entries(alert.counts).filter(([, n]) => n > 0);
  if (entries.length === 0) return;
  if (!webhookUrl) {
    console.warn("[slack-member-sync] SLACK_OPS_WEBHOOK_URL not configured, skipping ops alert", alert.counts);
    return;
  }
  const lines = entries.map(([key, n]) => `• ${key}: ${n} 件`).join("\n");
  const text = `:warning: Slack 定期整理（#263）で確認が必要です\n${lines}${
    alert.note ? `\n${alert.note}` : ""
  }\nSupabase の slack_member_sync_state を確認してください。`;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error(
      "[slack-member-sync] failed to send ops alert:",
      error instanceof Error ? error.message : "unknown",
    );
  }
};
