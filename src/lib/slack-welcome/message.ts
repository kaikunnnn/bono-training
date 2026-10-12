/**
 * Slack ウェルカムDM（#238）の本文。本文はこのファイルの1か所だけに置く。
 *
 * ★本文を変えるとき:
 *   1. text を書き換え、version を +1 する
 *   2. オーナーが文面を承認したら approved を true にする
 *   approved が false・本文が空・"TBD" を含む・https 以外のURLを含む場合は、
 *   mode が test / live でも送らない（送信拒否してログと OPS アラートを出す）。
 *
 * 書式: Slack の mrkdwn（*太字*、<https://example.com|リンク名>）。リンクのプレビュー展開は無効にして送る。
 * 同じ人には、本文の版を変えても二度と送らない（版番号は記録用）。
 */

export interface WelcomeMessage {
  version: number;
  approved: boolean;
  text: string;
}

export const WELCOME_MESSAGE: WelcomeMessage = {
  version: 1,
  approved: false,
  // TBD: 本文は未定（#238 未決Q1）。承認されるまでは送られない。
  text: "TBD（本文未定）",
};

/** 送れない理由。null なら送ってよい */
export function getMessageBlockReason(message: WelcomeMessage): string | null {
  if (!message.approved) return "message_not_approved";
  const text = message.text.trim();
  if (text.length === 0) return "message_empty";
  if (/TBD/i.test(text)) return "message_placeholder";
  if (!Number.isInteger(message.version) || message.version < 1) return "message_invalid_version";
  if (!allUrlsAreHttps(text)) return "message_non_https_url";
  return null;
}

/**
 * 本文中のURLがすべて https か。
 * - mrkdwn のリンク `<target|label>` / `<target>` の target（ユーザー/チャンネル参照 `<@U..>` `<#C..>` `<!here>` は除く）
 * - 本文中の素のスキーム（`http://`, `ftp://`, `javascript:` など）
 */
export function allUrlsAreHttps(text: string): boolean {
  for (const match of text.matchAll(/<([^>|]+)(?:\|[^>]*)?>/g)) {
    const target = match[1].trim();
    if (/^[@#!]/.test(target)) continue;
    if (!/^https:\/\/[^\s]+$/i.test(target)) return false;
  }
  for (const match of text.matchAll(/\b([a-z][a-z0-9+.-]*):(\/\/)?/gi)) {
    const scheme = match[1].toLowerCase();
    const hasSlashes = Boolean(match[2]);
    if (hasSlashes && scheme !== "https") return false;
    if (!hasSlashes && ["javascript", "data", "vbscript", "mailto", "file"].includes(scheme)) {
      return false;
    }
  }
  return true;
}

/** 送ってよい本文を返す。送れないときは null */
export function getApprovedMessage(
  message: WelcomeMessage = WELCOME_MESSAGE,
): { version: number; text: string } | null {
  if (getMessageBlockReason(message) !== null) return null;
  return { version: message.version, text: message.text };
}
