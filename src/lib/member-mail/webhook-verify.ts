/**
 * Resend の webhook の署名検証（Svix 形式: svix-id / svix-timestamp / svix-signature、鍵は whsec_...）。
 * resend ライブラリの webhooks.verify（standardwebhooks）を使う。時刻が古すぎるもの（5分超）も弾かれる。
 * 出典: https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
 */
import { Resend } from "resend";
import type { ResendEventPayload } from "./webhook";

export function verifyResendWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
): ResendEventPayload | null {
  if (!headers.id || !headers.timestamp || !headers.signature) return null;
  try {
    // webhooks.verify は鍵を使わないが、Resend の生成に鍵の値が要るため仮の値を渡す
    const resend = new Resend(process.env.RESEND_API_KEY || "re_verify_only");
    return resend.webhooks.verify({
      payload: rawBody,
      headers: { id: headers.id, timestamp: headers.timestamp, signature: headers.signature },
      webhookSecret: secret,
    }) as unknown as ResendEventPayload;
  } catch {
    return null;
  }
}
