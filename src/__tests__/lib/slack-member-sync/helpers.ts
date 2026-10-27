/**
 * Slack 定期整理（#263）テスト用の部品。
 */
import type { SlackMemberSummary, SyncState } from "@/lib/slack-member-sync/types";

export const TEAM_ID = "T0BONO";

export function makeMember(overrides: Partial<SlackMemberSummary> = {}): SlackMemberSummary {
  return {
    id: "U0MEMBER",
    teamId: TEAM_ID,
    deleted: false,
    isBot: false,
    isAppUser: false,
    isWorkflowBot: false,
    isInvitedUser: false,
    isRestricted: false,
    isUltraRestricted: false,
    isAdmin: false,
    isOwner: false,
    isPrimaryOwner: false,
    emailHash: null,
    displayName: "テスト太郎",
    ...overrides,
  };
}

export function makeState(overrides: Partial<SyncState> = {}): SyncState {
  return {
    teamId: TEAM_ID,
    slackUserId: "U0MEMBER",
    classification: "keep",
    reason: null,
    removeAfter: null,
    linkDeadline: null,
    linkRequestDmAt: null,
    linkRequestVersion: null,
    removalNoticeDmAt: null,
    removalNoticeVersion: null,
    dryRunResult: null,
    dryRunAt: null,
    needsReview: false,
    reviewReason: null,
    resolvedAt: null,
    resolvedReason: null,
    firstSeenAt: new Date("2026-10-01T00:00:00Z"),
    ...overrides,
  };
}
