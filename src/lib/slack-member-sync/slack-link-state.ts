import "server-only";

/**
 * 「Slackとつなぐ」（#263）を出すかどうか。アカウント情報（/account）の Slack カードと /account/slack の詳細ページで共通。
 *
 * hidden（出さない）: トークン等が未設定・確認DMの本文が未承認（押しても DM が届かない行き止まりにしない）・
 *                    off / dry_run・test の対象外
 * unavailable: 確認に失敗した（/account 本体は壊さずカードを出さない。詳細ページでは「いまは受け付けていません」）
 */
import { getSlackLinkState, type SlackLinkState } from "./link-flow";
import { getSyncMessageBlockReason } from "./messages/common";
import { MYPAGE_CONFIRM_MESSAGE } from "./messages/mypage-confirm";
import { getSyncStore, loadSlackConfig } from "./runtime";

export type SlackLinkView = SlackLinkState | "unavailable";

export async function loadSlackLinkState(userId: string): Promise<SlackLinkView> {
  const store = getSyncStore();
  if (!store || !loadSlackConfig()) return "hidden";
  if (getSyncMessageBlockReason(MYPAGE_CONFIRM_MESSAGE) !== null) return "hidden";
  try {
    return await getSlackLinkState(store, userId);
  } catch (error) {
    console.error("[slack-member-sync] slack link state check failed:", error instanceof Error ? error.message : "unknown");
    return "unavailable";
  }
}
