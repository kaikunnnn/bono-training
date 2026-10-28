/**
 * 外れるお知らせDM（#263）。解約予約・解約済みで外す予定になった人に、外す予定が決まった時点で1回だけ送る。
 * 送り主はカイクン（ユーザートークン）。送れた日から外す日が決まる（外す日 = max(終わる日の翌日, 送った日 + 7日)）。
 *
 * 差し込み:
 *   {{end_date}}    … メンバーシップが終わる（終わった）日（例: 11月20日）
 *   {{remove_date}} … Slack から外れる日（例: 11月21日）
 *   {{signup_url}}  … メンバー登録ページ（https://…/subscription）
 *
 * 初回の大掃除では終わった日が過去になるので、「終わるため」ではなく過去でも読める言い方にしている。
 * 承認待ち（#263 未決Q1）。approved が false の間は、mode が live でも送らない。
 */
import type { SyncMessage } from "./common";

export const REMOVAL_NOTICE_MESSAGE: SyncMessage = {
  version: 1,
  approved: false,
  placeholders: ["end_date", "remove_date", "signup_url"],
  text: [
    "BONOをご利用いただきありがとうございました。",
    "メンバーシップが{{end_date}}で終了のため、{{remove_date}}にSlackから外れます。",
    "また参加したくなったら、いつでもメンバー登録からどうぞ → <{{signup_url}}|メンバー登録>",
  ].join("\n"),
};
