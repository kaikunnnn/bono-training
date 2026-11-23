import "server-only";

/**
 * Resend（`resend` ライブラリ）での1通の送信と、結果の振り分け（#264 §5-4）。
 * - Idempotency-Key を付ける（Resend が覚えるのは24時間だけ。本当の守りは送信記録の一意制約）
 * - 送れたか分からないもの（通信エラー・5xx・同じ番号の処理中）は ambiguous → needs_review（自動で送り直さない）
 * - 断られたことが確実なものは rejected（鍵・送信元の設定ミスは、その回の送信を止める）
 * - エラーの本文（宛先アドレスが入りうる）はログに出さない。コードだけを返す
 */
import { Resend } from "resend";
import type { MailClient, OutgoingMail, SendResult } from "./types";

/** 鍵・送信元など、続けても同じ失敗になるもの */
const STOP_BATCH_CODES = new Set([
  "missing_api_key",
  "invalid_api_key",
  "restricted_api_key",
  "invalid_from_address",
  "invalid_access",
  "invalid_region",
  "security_error",
]);

export function classifyResendError(error: { name?: string; statusCode?: number | null }): SendResult {
  const code = error.name ?? "unknown";
  const status = error.statusCode ?? null;
  if (code === "rate_limit_exceeded" || code === "daily_quota_exceeded" || code === "monthly_quota_exceeded") {
    return { kind: "throttled", code };
  }
  if (code === "concurrent_idempotent_requests") return { kind: "ambiguous", code };
  if (status === null || status >= 500 || code === "application_error" || code === "internal_server_error") {
    return { kind: "ambiguous", code: status === null ? "network_error" : `${code}_${status}` };
  }
  return { kind: "rejected", code, stopBatch: STOP_BATCH_CODES.has(code) };
}

export function createResendMailClient(apiKey: string, options: { sandboxTo?: string | null } = {}): MailClient {
  const resend = new Resend(apiKey);
  return {
    async send(mail: OutgoingMail): Promise<SendResult> {
      try {
        const { data, error } = await resend.emails.send(
          {
            // ローカル・確認用: MEMBER_MAIL_SANDBOX_TO があれば、宛先をそこに差し替える（実在の会員に送らないため）
            to: options.sandboxTo || mail.to,
            from: mail.from,
            ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            headers: mail.headers,
            tags: mail.tags,
          },
          { idempotencyKey: mail.idempotencyKey },
        );
        if (error) return classifyResendError(error as { name?: string; statusCode?: number | null });
        if (!data?.id) return { kind: "ambiguous", code: "no_id" };
        return { kind: "ok", id: data.id };
      } catch {
        return { kind: "ambiguous", code: "exception" };
      }
    },
  };
}
