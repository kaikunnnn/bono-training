/**
 * カイクンへの報告DM（#263）。自分宛ての DM（ユーザートークンの持ち主＝auth.test の user_id）に送る。
 * 「今日外す人」か「確認が必要な人」が1人以上いる日だけ、1日1回。
 *
 * 差し込み（中身は process.ts の buildOwnerReport が作る）:
 *   {{summary}}   … 例: 今日Slackから外す人：3人（解約2・未接続1）
 *   {{due_list}}  … 1人1行（表示名のプロフィールリンク・理由・外す日）
 *   {{review}}    … 確認が必要な人（いなければ空）
 *   {{admin_url}} … Slack 管理画面のメンバー一覧
 *
 * 名前は users.list の応答からその場で入れる（保存しない）。
 * 承認待ち（#263 未決Q1）。approved が false の間は送らない。
 */
import type { SyncMessage } from "./common";

export const OWNER_REPORT_MESSAGE: SyncMessage = {
  version: 1,
  approved: false,
  placeholders: ["summary", "due_list", "review", "admin_url"],
  text: [
    "*{{summary}}*",
    "{{due_list}}",
    "{{review}}",
    "外す操作は管理画面から → <{{admin_url}}|メンバー管理>",
  ].join("\n"),
};
