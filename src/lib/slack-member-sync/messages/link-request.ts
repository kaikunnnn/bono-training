/**
 * つなぐお願いDM（#263）。Slack のメールが BONO の課金中アカウントと一致しない人に、1回だけ送る。
 * 送り主はカイクン（ユーザートークン）。
 *
 * 差し込み:
 *   {{link}}     … その人専用の使い捨てリンク（https://…/slack/link?t=…）
 *   {{deadline}} … つながるのを待つ期限（例: 11月10日）
 *
 * 承認待ち（#263 未決Q1）。approved が false の間は、mode が live でも送らない。
 */
import type { SyncMessage } from "./common";

export const LINK_REQUEST_MESSAGE: SyncMessage = {
  version: 1,
  approved: false,
  placeholders: ["link", "deadline"],
  text: [
    "BONOのSlackへようこそ。いつもありがとうございます。",
    "SlackとBONOのアカウントをつなぐため、こちらを開いてBONOにログインしてください（1分で終わります）。",
    "<{{link}}|BONOとつなぐ>",
    "{{deadline}}までにつながらない場合は、課金メンバーかを確認できないため、Slackから外れることがあります。",
  ].join("\n"),
};
