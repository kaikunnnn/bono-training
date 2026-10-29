/**
 * アカウント情報の「Slackとつなぐ」（/account/slack）からの確認DM（#263）。
 * そこで入力されたメールの Slack アカウントに送り、本人がリンクを開いて BONO にログインするとつながる
 * （DM を受け取れる＝その Slack アカウントの持ち主であることの確認）。送り主はカイクン（ユーザートークン）。
 *
 * 差し込み:
 *   {{link}} … 使い捨てリンク（24時間有効）
 *
 * 2026-10-29 オーナー承認済み（v2: 入口を「アカウント情報」に変更）。
 */
import type { SyncMessage } from "./common";

export const MYPAGE_CONFIRM_MESSAGE: SyncMessage = {
  version: 2,
  approved: true,
  placeholders: ["link"],
  text: [
    "BONOのアカウント情報から、このSlackアカウントとBONOのアカウントをつなぐ操作がありました。",
    "ご自身の操作であれば、こちらを開いてBONOにログインしてください（24時間有効）。",
    "<{{link}}|BONOとつなぐ>",
    "心当たりがなければ、このメッセージは無視してください。",
  ].join("\n"),
};
