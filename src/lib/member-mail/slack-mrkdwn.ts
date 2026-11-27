/**
 * 会員メールの文面を Slack の DM 用の mrkdwn に直す（#327-H）。純粋関数のみ。
 *
 * メールと同じ言葉にする（本文の書き方は content.ts の決まりと同じものを読む）:
 *   - 1行目に件名を太字で
 *   - 見出し "## 文字" → 太字の1行 "*文字*"
 *   - 箇条書き "- 文字" → "• 文字"（Slack の mrkdwn には箇条書きの記法が無いため、記号で残す）
 *   - リンク [文字](https://...) → <https://...|文字>
 *   - 段落は空行、段落の中の改行はそのまま
 *   - &, <, > はエスケープする（Slack の決まり）
 * 配信停止の法定表示（メールの末尾）は付けない。代わりに「通知設定でオフにできる」の1行を最後に付ける。
 * リンクにメールの印（?from=email_xxx）は付けない（Slack から押したのをメールから押したと数えないため）。
 *
 * 出典:
 * - https://docs.slack.dev/messaging/formatting-message-text （mrkdwn・エスケープ・リンクの書き方）
 */
import { LINK_RE, parseBlocks } from "./content";
import type { Campaign } from "./types";

/** 通知設定のページ（Slack の DM のオン・オフ） */
export function notificationSettingsUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/account/notifications`;
}

/** Slack の mrkdwn で特別な意味を持つ3文字だけエスケープする */
export function escapeSlack(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineSlack(line: string): string {
  let out = "";
  let last = 0;
  for (const m of line.matchAll(LINK_RE)) {
    out += escapeSlack(line.slice(last, m.index));
    // URL は content.ts の検査で https だけ。| と > は URL に入らない前提だが、念のため外す
    const href = m[2].replace(/[|<>]/g, "");
    out += `<${href}|${escapeSlack(m[1]).replace(/\|/g, "｜")}>`;
    last = (m.index ?? 0) + m[0].length;
  }
  return out + escapeSlack(line.slice(last));
}

/** Slack の DM 1通分の文字 */
export function renderSlackDm(campaign: Pick<Campaign, "subject" | "body">, opts: { siteUrl: string }): string {
  const blocks = parseBlocks(campaign.body).map((b) => {
    if (b.type === "h") return `*${inlineSlack(b.lines[0])}*`;
    if (b.type === "ul") return b.lines.map((l) => `• ${inlineSlack(l)}`).join("\n");
    return b.lines.map(inlineSlack).join("\n");
  });
  const subject = campaign.subject.trim();
  const head = subject ? [`*${escapeSlack(subject)}*`] : [];
  const footer = `Slackでのお知らせは、<${notificationSettingsUrl(opts.siteUrl)}|通知設定>からオフにできます。`;
  return [...head, ...blocks, footer].join("\n\n");
}
