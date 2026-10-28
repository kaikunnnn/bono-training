/**
 * 使い捨てリンクの値（#263）。値そのものは DM の本文にだけ入れ、DB には sha256 のハッシュだけを保存する。
 */
import { createHash, randomBytes } from "node:crypto";

/**
 * つなぐお願いDM のリンクは「期限（link_grace_days）+ この日数」有効。
 * 期限切れ＝外す候補になった後も、実際に外される前ならつながれるよう長めにとる。
 */
export const LINK_REQUEST_TOKEN_EXTRA_DAYS = 30;
/** マイページからの確認DM のリンクの有効期限 */
export const MYPAGE_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** 推測できない値（32バイト・URL に入れられる形） */
export function newRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

/** URL の t= の形として妥当か（ハッシュを引く前の足切り） */
export function isPlausibleToken(raw: unknown): raw is string {
  return typeof raw === "string" && /^[A-Za-z0-9_-]{32,64}$/.test(raw);
}

export function linkUrl(siteUrl: string, raw: string): string {
  return `${siteUrl}/slack/link?t=${encodeURIComponent(raw)}`;
}
