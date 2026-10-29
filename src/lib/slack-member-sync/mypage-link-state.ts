import "server-only";

/**
 * マイページの「Slackとつなぐ」（#263）を出すかどうか。/mypage の入口と /mypage/slack の詳細ページで共通。
 *
 * hidden（出さない）: トークン等が未設定・確認DMの本文が未承認（押しても DM が届かない行き止まりにしない）・
 *                    off / dry_run・test の対象外
 * unavailable: 確認に失敗した（マイページ本体は壊さず入口を出さない。詳細ページでは「いまは受け付けていません」）
 */
import { getMypageLinkState, type MypageLinkState } from "./link-flow";
import { getSyncMessageBlockReason } from "./messages/common";
import { MYPAGE_CONFIRM_MESSAGE } from "./messages/mypage-confirm";
import { getSyncStore, loadSlackConfig } from "./runtime";

export type MypageLinkView = MypageLinkState | "unavailable";

export async function loadMypageLinkState(userId: string): Promise<MypageLinkView> {
  const store = getSyncStore();
  if (!store || !loadSlackConfig()) return "hidden";
  if (getSyncMessageBlockReason(MYPAGE_CONFIRM_MESSAGE) !== null) return "hidden";
  try {
    return await getMypageLinkState(store, userId);
  } catch (error) {
    console.error("[slack-member-sync] mypage link check failed:", error instanceof Error ? error.message : "unknown");
    return "unavailable";
  }
}
