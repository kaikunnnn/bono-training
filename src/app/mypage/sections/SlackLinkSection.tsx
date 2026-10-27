import "server-only";

/**
 * マイページの「Slackとつなぐ」カード（#263）。
 * 課金中で、まだ Slack とつながっていない人にだけ出す。DM が見つからない人が自分でつなぐための入口。
 *
 * 出さない: 定期整理の mode が test / live 以外（off / dry_run の間は何も見せない）・トークン等が未設定・
 *           確認DMの本文が未承認（押しても DM が届かない行き止まりにしない）・
 *           課金中でない・すでにつながっている・確認に失敗した（マイページ本体を壊さない）。
 */
import { isPaidActive } from "@/lib/slack-member-sync/link-flow";
import { getSyncMessageBlockReason } from "@/lib/slack-member-sync/messages/common";
import { MYPAGE_CONFIRM_MESSAGE } from "@/lib/slack-member-sync/messages/mypage-confirm";
import { getSyncStore, loadSlackConfig } from "@/lib/slack-member-sync/runtime";
import { SlackLinkCard } from "./SlackLinkCard";

export async function SlackLinkSection({ userId }: { userId: string }) {
  const store = getSyncStore();
  if (!store || !loadSlackConfig()) return null;
  if (getSyncMessageBlockReason(MYPAGE_CONFIRM_MESSAGE) !== null) return null;
  try {
    // off / dry_run の間は設定の1回だけで終える（マイページを重くしない）
    const settings = await store.getSettings();
    if (!settings || (settings.mode !== "test" && settings.mode !== "live")) return null;
    const [sub, link] = await Promise.all([store.getSubscription(userId), store.getLinkByUserId(userId)]);
    if (!isPaidActive(sub) || link) return null;
  } catch (error) {
    console.error("[slack-member-sync] mypage card check failed:", error instanceof Error ? error.message : "unknown");
    return null;
  }
  return <SlackLinkCard />;
}
