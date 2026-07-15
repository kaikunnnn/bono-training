import "server-only";

export type AuthEventType =
  | "login_failed"
  | "signup_failed"
  | "password_reset_failed"
  | "otp_verification_failed"
  | "callback_failed"
  | "password_update_failed";

interface AuthErrorEvent {
  type: AuthEventType;
  email?: string;
  message: string;
  path: string;
}

// OTP/コールバック失敗はシステムバグを示すため即時通知
const CRITICAL_TYPES: AuthEventType[] = [
  "otp_verification_failed",
  "callback_failed",
];

export async function reportAuthError(event: AuthErrorEvent): Promise<void> {
  console.error(
    JSON.stringify({
      level: "error",
      category: "auth",
      type: event.type,
      email: event.email ?? "unknown",
      message: event.message,
      path: event.path,
      timestamp: new Date().toISOString(),
    })
  );

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl || !CRITICAL_TYPES.includes(event.type)) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text:
          `🚨 *認証エラー検知* \`${event.type}\`\n` +
          `メール: ${event.email ?? "不明"}\n` +
          `エラー: ${event.message}\n` +
          `パス: \`${event.path}\``,
      }),
    });
  } catch {
    // Slack通知失敗は無視
  }
}
