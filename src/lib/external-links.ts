/**
 * 外部サービス / 外部 URL の定数
 * 1 箇所に集約することで URL 変更時の修正範囲を最小化
 */

/** 質問／相談 Slack チャンネル */
export const SLACK_QUESTIONS_URL =
  "https://bonoco.slack.com/archives/C04JJHFDGTT";

/** 自己紹介 Slack チャンネル */
export const SLACK_SELF_INTRO_URL =
  "https://bonoco.slack.com/archives/C01E9V01LH3";

/** お知らせ Slack チャンネル */
export const SLACK_ANNOUNCEMENTS_URL =
  "https://bonoco.slack.com/archives/C01LP56TSJG";

/**
 * Slack コミュニティへの参加（招待）URL。
 * 誰でも参加できる共有リンクなので、公開リポジトリに書かずサーバー専用の環境変数で持つ。
 * 未設定なら null（参加ボタンを出さない）。リンクを作り直したら Vercel の env を差し替えて再デプロイする。
 * 使用箇所: /how-to/community のアイキャッチ「参加する」ボタン（課金メンバー向け・サーバー側でのみ読む）
 */
export function getSlackCommunityInviteUrl(): string | null {
  return process.env.SLACK_COMMUNITY_INVITE_URL || null;
}
