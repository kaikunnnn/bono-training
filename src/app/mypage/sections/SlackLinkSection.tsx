import "server-only";

/**
 * マイページの「Slackとつなぐ」の入口（#263）。
 * 課金中で、まだ Slack とつながっていない人にだけ出す。DM が見つからない人が自分でつなぐための入口で、
 * 入力フォームは詳細ページ（/mypage/slack）に置く。
 *
 * 出す: mode=live の課金中（手で残す人を含む）で未接続の人。mode=test では settings.test_bono_user_ids の人だけ
 *       （test の間に会員に見せないため。Slack ID は入力されるまで分からないので BONO の ID で絞る）
 * 出さない: off / dry_run・トークン等が未設定・
 *           確認DMの本文が未承認（押しても DM が届かない行き止まりにしない）・
 *           課金中でない・すでにつながっている・確認に失敗した（マイページ本体を壊さない）。
 * 判定は詳細ページと共通（loadMypageLinkState）。
 */
import { loadMypageLinkState } from "@/lib/slack-member-sync/mypage-link-state";
import { SlackLinkEntry } from "./SlackLinkEntry";

export async function SlackLinkSection({ userId }: { userId: string }) {
  const state = await loadMypageLinkState(userId);
  if (state !== "show") return null;
  return <SlackLinkEntry />;
}
