import "server-only";

/**
 * マイページの「Slackとつなぐ」カード（#263）。
 * 課金中で、まだ Slack とつながっていない人にだけ出す。DM が見つからない人が自分でつなぐための入口。
 *
 * 出す: mode=live の課金中（手で残す人を含む）で未接続の人。mode=test では settings.test_bono_user_ids の人だけ
 *       （test の間に会員に見せないため。Slack ID は入力されるまで分からないので BONO の ID で絞る）
 * 出さない: off / dry_run・トークン等が未設定・
 *           確認DMの本文が未承認（押しても DM が届かない行き止まりにしない）・
 *           課金中でない・すでにつながっている・確認に失敗した（マイページ本体を壊さない）。
 */
import { canUseMypageCard, isPaidForLink } from "@/lib/slack-member-sync/link-flow";
import { getSyncMessageBlockReason } from "@/lib/slack-member-sync/messages/common";
import { MYPAGE_CONFIRM_MESSAGE } from "@/lib/slack-member-sync/messages/mypage-confirm";
import { getSyncStore, loadSlackConfig } from "@/lib/slack-member-sync/runtime";
import { SlackLinkCard } from "./SlackLinkCard";

export async function SlackLinkSection({ userId }: { userId: string }) {
  const store = getSyncStore();
  if (!store || !loadSlackConfig()) return null;
  if (getSyncMessageBlockReason(MYPAGE_CONFIRM_MESSAGE) !== null) return null;
  try {
    // off / dry_run（と test の対象外）は設定の1回だけで終える（マイページを重くしない）
    const settings = await store.getSettings();
    if (!canUseMypageCard(settings, userId)) return null;
    const [paid, link] = await Promise.all([isPaidForLink(store, userId, settings), store.getLinkByUserId(userId)]);
    if (!paid || link) return null;
  } catch (error) {
    console.error("[slack-member-sync] mypage card check failed:", error instanceof Error ? error.message : "unknown");
    return null;
  }
  return <SlackLinkCard />;
}
