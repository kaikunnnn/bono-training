/**
 * 配信停止リンクの署名つきトークン（264 §5-8）。
 *
 * 形: v1.<user_id>.<category>.<署名>
 *   署名 = HMAC-SHA256(MEMBER_MAIL_UNSUBSCRIBE_SECRET, "member-mail-unsubscribe:v1:<user_id>:<category>") の base64url
 * - 会員の多くはログインしていない状態でメールを読むので、URL だけで「誰の・どのカテゴリか」が分かり、偽造できない形にする
 * - 期限は付けない（古いメールのリンク・ボタンでも止められるように。RFC 8058）
 * - メールアドレスは入れない
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { MAIL_CATEGORIES, type MailCategory } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function sign(secret: string, userId: string, category: MailCategory): string {
  return createHmac("sha256", secret)
    .update(`member-mail-unsubscribe:v1:${userId}:${category}`, "utf8")
    .digest("base64url");
}

export function createUnsubscribeToken(secret: string, userId: string, category: MailCategory): string {
  if (secret.length < 32) throw new Error("unsubscribe secret too short");
  if (!UUID_RE.test(userId)) throw new Error("invalid user id");
  return `v1.${userId}.${category}.${sign(secret, userId, category)}`;
}

export function verifyUnsubscribeToken(
  secret: string,
  token: unknown,
): { userId: string; category: MailCategory } | null {
  if (!secret || secret.length < 32) return null;
  if (typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  const [, userId, category, sig] = parts;
  if (!UUID_RE.test(userId)) return null;
  if (!(MAIL_CATEGORIES as readonly string[]).includes(category)) return null;
  const expected = Buffer.from(sign(secret, userId, category as MailCategory));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return { userId, category: category as MailCategory };
}

/** 本文の配信停止リンク（画面あり。開いただけでは止まらない） */
export function unsubscribePageUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/mail/unsubscribe?t=${encodeURIComponent(token)}`;
}

/** List-Unsubscribe の宛先（メールソフトのボタンからの POST を受ける） */
export function oneClickUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/api/mail/unsubscribe?t=${encodeURIComponent(token)}`;
}
