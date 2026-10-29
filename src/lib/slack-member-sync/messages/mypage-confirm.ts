/**
 * マイページの「Slackとつなぐ」からの確認DM（#263）。
 * マイページで入力されたメールの Slack アカウントに送り、本人がリンクを開いて BONO にログインするとつながる
 * （DM を受け取れる＝その Slack アカウントの持ち主であることの確認）。送り主はカイクン（ユーザートークン）。
 *
 * 差し込み:
 *   {{link}} … 使い捨てリンク（24時間有効）
 *
 * 2026-10-29 オーナー承認済み。
 */
import type { SyncMessage } from "./common";

export const MYPAGE_CONFIRM_MESSAGE: SyncMessage = {
  version: 1,
  approved: true,
  placeholders: ["link"],
  text: [
    "BONOのマイページから、このSlackアカウントとBONOのアカウントをつなぐ操作がありました。",
    "ご自身の操作であれば、こちらを開いてBONOにログインしてください（24時間有効）。",
    "<{{link}}|BONOとつなぐ>",
    "心当たりがなければ、このメッセージは無視してください。",
  ].join("\n"),
};
