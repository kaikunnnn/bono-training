/**
 * Slack 定期整理（#263）の DM 本文の共通部分。本文は messages/ の DM ごとのファイルに1か所ずつ置く。
 *
 * ★本文を変えるとき（#238 の message.ts と同じ運用）:
 *   1. text を書き換え、version を +1 する
 *   2. オーナーが文面を承認したら approved を true にする
 *   approved が false・本文が空・"TBD" を含む・差し込み（{{name}}）が足りない・
 *   差し込み後に https 以外のURLを含む場合は、mode が test / live でも送らない。
 *
 * 書式: Slack の mrkdwn（*太字*、<https://example.com|リンク名>）。リンクのプレビュー展開は無効にして送る。
 * 差し込みは {{name}} の形。差し込む値は render の呼び出し側が渡す。
 */
import { allUrlsAreHttps } from "@/lib/slack-welcome/message";

export interface SyncMessage {
  version: number;
  approved: boolean;
  text: string;
  /** 本文に必ず入っていなければならない差し込み名 */
  placeholders: readonly string[];
}

/** 送れない理由。null なら送ってよい */
export function getSyncMessageBlockReason(message: SyncMessage): string | null {
  if (!message.approved) return "message_not_approved";
  const text = message.text.trim();
  if (text.length === 0) return "message_empty";
  if (/TBD/i.test(text)) return "message_placeholder";
  if (!Number.isInteger(message.version) || message.version < 1) return "message_invalid_version";
  for (const name of message.placeholders) {
    if (!text.includes(`{{${name}}}`)) return "message_missing_placeholder";
  }
  return null;
}

/** Slack mrkdwn の制御文字をエスケープする（名前など、外から来た文字列を差し込むとき） */
export function escapeMrkdwn(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * 差し込んで送る本文を作る。送れないとき（未承認・差し込み漏れ・https 以外のURL）は reason を返す。
 * vars の値はそのまま入る（外から来た文字列は escapeMrkdwn してから渡すこと）。
 */
export function renderSyncMessage(
  message: SyncMessage,
  vars: Record<string, string>,
): { ok: true; version: number; text: string } | { ok: false; reason: string } {
  const block = getSyncMessageBlockReason(message);
  if (block) return { ok: false, reason: block };
  // 差し込む値が足りないか、先に本文の側で確かめる（値の中に {{…}} があっても誤判定しないように1回で置き換える）
  for (const match of message.text.matchAll(/\{\{(\w+)\}\}/g)) {
    if (!Object.prototype.hasOwnProperty.call(vars, match[1])) return { ok: false, reason: "message_missing_value" };
  }
  const text = message.text.replace(/\{\{(\w+)\}\}/g, (_whole, name: string) => vars[name]);
  if (!allUrlsAreHttps(text)) return { ok: false, reason: "message_non_https_url" };
  return { ok: true, version: message.version, text };
}

/** サイトのURL（使い捨てリンク・登録ページ）。https でなければ本文の検査で送信が止まる */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.bo-no.design").replace(/\/+$/, "");
}
