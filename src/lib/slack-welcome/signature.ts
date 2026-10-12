import "server-only";

/**
 * Slack リクエスト署名の検証（#238）。
 * 出典: https://docs.slack.dev/authentication/verifying-requests-from-slack/
 *   basestring = "v0:" + X-Slack-Request-Timestamp + ":" + 生のリクエスト本文
 *   signature  = "v0=" + hex(HMAC-SHA256(signing_secret, basestring))
 *   タイムスタンプが現在から5分以上ずれていたら拒否（リプレイ対策）
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_TIMESTAMP_SKEW_SECONDS = 60 * 5;

export type SignatureResult =
  | { ok: true }
  | { ok: false; reason: "missing_headers" | "stale_timestamp" | "bad_signature" };

export function verifySlackSignature(params: {
  signingSecret: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  rawBody: Buffer;
  nowMs: number;
}): SignatureResult {
  const { signingSecret, timestampHeader, signatureHeader, rawBody, nowMs } = params;
  if (!signingSecret || !timestampHeader || !signatureHeader) {
    return { ok: false, reason: "missing_headers" };
  }
  if (!/^\d{1,12}$/.test(timestampHeader)) {
    return { ok: false, reason: "stale_timestamp" };
  }
  const timestamp = Number(timestampHeader);
  if (Math.abs(nowMs / 1000 - timestamp) > MAX_TIMESTAMP_SKEW_SECONDS) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const hmac = createHmac("sha256", signingSecret);
  hmac.update(`v0:${timestampHeader}:`);
  hmac.update(rawBody);
  const expected = Buffer.from(`v0=${hmac.digest("hex")}`, "utf8");
  const received = Buffer.from(signatureHeader, "utf8");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "bad_signature" };
  }
  return { ok: true };
}

/** テスト・ローカル確認用: 署名ヘッダー値を作る */
export function signSlackRequest(signingSecret: string, timestamp: string, rawBody: string): string {
  const hmac = createHmac("sha256", signingSecret);
  hmac.update(`v0:${timestamp}:${rawBody}`);
  return `v0=${hmac.digest("hex")}`;
}
