/**
 * users.info の結果から、ウェルカムDMを送る相手かを判定する（#238）。純粋関数。
 */
import type { SlackUserSummary } from "./slack-api";

export const SLACKBOT_USER_ID = "USLACKBOT";

export type EligibilityDecision =
  | { kind: "eligible" }
  | { kind: "skip"; reason: "deleted" | "bot" | "guest" | "other_team" }
  | { kind: "pending_activation" };

export function judgeEligibility(user: SlackUserSummary, expectedTeamId: string): EligibilityDecision {
  if (user.id === SLACKBOT_USER_ID) return { kind: "skip", reason: "bot" };
  if (user.deleted) return { kind: "skip", reason: "deleted" };
  if (user.isBot || user.isWorkflowBot || user.isAppUser) return { kind: "skip", reason: "bot" };
  // 所属チームが分からない・違う場合は送らない（安全側）
  if (user.teamId !== expectedTeamId) {
    return { kind: "skip", reason: "other_team" };
  }
  // ゲスト（シングル/マルチチャンネルゲスト）は除く（#238 Q4 案: 除く）
  if (user.isRestricted || user.isUltraRestricted) return { kind: "skip", reason: "guest" };
  // 招待中（まだ参加を完了していない）は、後で拾い直す
  if (user.isInvitedUser) return { kind: "pending_activation" };
  return { kind: "eligible" };
}
