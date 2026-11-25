/**
 * 配信停止リンクの署名つきトークン（264 §5-8）。
 *
 * 新しい形（v2・327-D から）: v2.<user_id>.<署名>
 *   署名 = HMAC-SHA256(MEMBER_MAIL_UNSUBSCRIBE_SECRET, "member-mail-unsubscribe:v2:<user_id>") の base64url
 *   カテゴリ（comeback など）は入れない。会員の様子を見て送り分けていることを、会員に見える URL に出さないため（オーナー決定）。
 *   止めるのも戻すのも全カテゴリなので、カテゴリが無くても困らない。
 *
 * 古い形（v1）: v1.<user_id>.<category>.<署名>
 *   署名 = HMAC-SHA256(secret, "member-mail-unsubscribe:v1:<user_id>:<category>")
 *   もう作らないが、受け付け続ける（古いメールのリンク・ボタンは無期限で効く設計）。
 *
 * - 会員の多くはログインしていない状態でメールを読むので、URL だけで「誰か」が分かり、偽造できない形にする
 * - 期限は付けない（古いメールのリンク・ボタンでも止められるように。RFC 8058）
 * - メールアドレスは入れない
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { MAIL_CATEGORIES, type MailCategory } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function signV1(secret: string, userId: string, category: MailCategory): string {
  return createHmac("sha256", secret)
    .update(`member-mail-unsubscribe:v1:${userId}:${category}`, "utf8")
    .digest("base64url");
}

function signV2(secret: string, userId: string): string {
  return createHmac("sha256", secret).update(`member-mail-unsubscribe:v2:${userId}`, "utf8").digest("base64url");
}

function assertInputs(secret: string, userId: string) {
  if (secret.length < 32) throw new Error("unsubscribe secret too short");
  if (!UUID_RE.test(userId)) throw new Error("invalid user id");
}

/** メールに載せるトークン（v2・カテゴリなし） */
export function createUnsubscribeToken(secret: string, userId: string): string {
  assertInputs(secret, userId);
  return `v2.${userId}.${signV2(secret, userId)}`;
}

/**
 * 古い形（v1）のトークン。もうメールには載せない。
 * 古いメールのリンクが今も通ることを確かめるテストのためだけに残す。
 */
export function createLegacyUnsubscribeTokenV1(secret: string, userId: string, category: MailCategory): string {
  assertInputs(secret, userId);
  return `v1.${userId}.${category}.${signV1(secret, userId, category)}`;
}

function sameSignature(expected: string, actual: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * 検証して「誰の」トークンかを返す。v1 ならカテゴリも返す（v2 は null）。
 * 止める範囲は unsubscribe.ts の categoriesToStop が決める（カテゴリが無ければ全カテゴリ）。
 */
export function verifyUnsubscribeToken(
  secret: string,
  token: unknown,
): { userId: string; category: MailCategory | null } | null {
  if (!secret || secret.length < 32) return null;
  if (typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts[0] === "v2" && parts.length === 3) {
    const [, userId, sig] = parts;
    if (!UUID_RE.test(userId)) return null;
    if (!sameSignature(signV2(secret, userId), sig)) return null;
    return { userId, category: null };
  }
  if (parts[0] === "v1" && parts.length === 4) {
    const [, userId, category, sig] = parts;
    if (!UUID_RE.test(userId)) return null;
    if (!(MAIL_CATEGORIES as readonly string[]).includes(category)) return null;
    if (!sameSignature(signV1(secret, userId, category as MailCategory), sig)) return null;
    return { userId, category: category as MailCategory };
  }
  return null;
}

/** 本文の配信停止リンク（画面あり。開いただけでは止まらない） */
export function unsubscribePageUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/mail/unsubscribe?t=${encodeURIComponent(token)}`;
}

/** List-Unsubscribe の宛先（メールソフトのボタンからの POST を受ける） */
export function oneClickUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/api/mail/unsubscribe?t=${encodeURIComponent(token)}`;
}
