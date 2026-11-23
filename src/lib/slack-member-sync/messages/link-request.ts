/**
 * つなぐお願いDM（#263）。Slack のメールが BONO の課金中アカウントと一致しない人に、1回だけ送る。
 * 送り主はカイクン（ユーザートークン）。
 *
 * 差し込み:
 *   {{link}}       … その人専用の使い捨てリンク（https://…/slack/link?t=…）
 *   {{deadline}}   … つながるのを待つ期限（DMの日 + link_grace_days。例: 11月5日）。翌日から外す候補になる
 *   {{signup_url}} … メンバー登録ページ（https://…/subscription）
 *
 * 2026-10-29 オーナー承認済み（version 2）。手順の「つなぐ」は /slack/link のボタン名と合わせている。
 */
import type { SyncMessage } from "./common";

export const LINK_REQUEST_MESSAGE: SyncMessage = {
  version: 2,
  approved: true,
  placeholders: ["link", "deadline", "signup_url"],
  text: [
    "こんにちは、BONOのカイクンです。いつもSlackに参加してくださり、ありがとうございます！",
    "BONOのSlackを、メンバーの皆さんだけの場所にするための確認をお願いしています。",
    "",
    "*なぜこのメッセージが届いたか*",
    "• あなたがSlackで使っているメールアドレスでは、課金中のBONOアカウントが見つかりませんでした",
    "• SlackとBONOで別のメールアドレスを使っていると、こうなります（例：Slackは会社のメール、BONOは個人のメール）",
    "",
    "*やること（1分ほど）*",
    "1. 下の「BONOとつなぐ」を押す",
    "2. BONOのサイトが開くので、いつもBONOで使っているメールアドレスでログインする",
    "3. 「つなぐ」を押す",
    "→ これで完了です。次からは何もしなくて大丈夫です",
    "",
    "👉 <{{link}}|BONOとつなぐ>",
    "",
    "{{deadline}}までにつながらない場合は、Slackから自動的に外れます。",
    "BONOメンバーでない方も、メンバー登録をすれば引き続き参加できます → <{{signup_url}}|メンバー登録>",
  ].join("\n"),
};
