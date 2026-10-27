/**
 * Slack 定期整理（#263）テスト用の部品。
 */
import type { SlackMemberSummary, SyncState } from "@/lib/slack-member-sync/types";
import type { SlackCallResult } from "@/lib/slack-welcome/slack-api";
import type { SyncSlackClient } from "@/lib/slack-member-sync/slack-api";
import type { SyncDeps } from "@/lib/slack-member-sync/process";
import type { SyncMessage } from "@/lib/slack-member-sync/messages/common";
import { hashEmail } from "@/lib/slack-member-sync/slack-api";
import { SOFT_REVIEW_REASON } from "@/lib/slack-member-sync/classify";
import type {
  DmType,
  LinkClaimResult,
  LinkStore,
  LinkedVia,
  SubscriptionSummary,
  SyncSettings,
  SyncStore,
} from "@/lib/slack-member-sync/types";

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

// ---------------------------------------------------------------------------
// インメモリ store / 偽 Slack クライアント（process のテスト用）
// claimDm は Supabase 実装と同じ条件で「確認と書き込みを await を挟まず1度に」行う。
// ---------------------------------------------------------------------------

export interface MemoryUser {
  userId: string;
  email: string;
  sub: Omit<SubscriptionSummary, "userId"> | null;
}

export interface MemoryToken {
  tokenHash: string;
  teamId: string;
  slackUserId: string | null;
  purpose: "link_request" | "mypage";
  expiresAt: Date;
  requestedByUserId: string | null;
  usedAt: Date | null;
  createdAt: Date;
}

export class MemorySyncStore implements SyncStore, LinkStore {
  settings: SyncSettings | null = {
    mode: "live",
    testUserIds: [],
    minNoticeDays: 7,
    linkGraceDays: 14,
    ownerReportSentOn: null,
    keepUserIds: [],
    keepSlackUserIds: [],
    testBonoUserIds: [],
  };
  /** 実行中に設定を書き換えるテスト用（getSettings の n 回目以降に適用） */
  settingsAfter: { calls: number; settings: SyncSettings } | null = null;
  private settingsCalls = 0;
  lockedUntil: Date | null = null;
  users: MemoryUser[] = [];
  links: { userId: string; teamId: string; slackUserId: string; linkedVia: LinkedVia }[] = [];
  states = new Map<string, SyncState>();
  tokens: MemoryToken[] = [];
  upsertCalls = 0;
  failPatch = false;
  clock: () => Date = () => new Date();

  async getSettings() {
    await Promise.resolve();
    this.settingsCalls += 1;
    if (this.settingsAfter && this.settingsCalls > this.settingsAfter.calls) {
      this.settings = this.settingsAfter.settings;
      this.settingsAfter = null;
    }
    return this.settings ? { ...this.settings, testUserIds: [...this.settings.testUserIds] } : null;
  }

  async acquireRunLock(now: Date, until: Date) {
    await Promise.resolve();
    if (this.lockedUntil && this.lockedUntil.getTime() >= now.getTime()) return false;
    this.lockedUntil = until;
    return true;
  }

  async releaseRunLock() {
    this.lockedUntil = null;
  }

  private summary(u: MemoryUser): SubscriptionSummary {
    return u.sub
      ? { userId: u.userId, ...u.sub }
      : {
          userId: u.userId,
          hasPaidRecord: false,
          isActive: false,
          cancelAtPeriodEnd: false,
          cancelAt: null,
          currentPeriodEnd: null,
        };
  }

  async lookupSubscriptions(emailHashes: string[], userIds: string[]) {
    await Promise.resolve();
    return this.users
      .filter((u) => emailHashes.includes(hashEmail(u.email)) || userIds.includes(u.userId))
      .map((u) => ({
        emailHash: emailHashes.includes(hashEmail(u.email)) ? hashEmail(u.email) : null,
        subscription: this.summary(u),
      }));
  }

  async listLinks(teamId: string) {
    return this.links.filter((l) => l.teamId === teamId).map((l) => ({ userId: l.userId, slackUserId: l.slackUserId }));
  }

  async insertLink(link: { userId: string; teamId: string; slackUserId: string; linkedVia: LinkedVia }) {
    await Promise.resolve();
    if (this.links.some((l) => l.userId === link.userId || (l.teamId === link.teamId && l.slackUserId === link.slackUserId))) {
      return "conflict" as const;
    }
    this.links.push({ ...link });
    return "inserted" as const;
  }

  async listStates(teamId: string) {
    return [...this.states.values()].filter((s) => s.teamId === teamId).map((s) => ({ ...s }));
  }

  async upsertStates(states: SyncState[]) {
    this.upsertCalls += 1;
    for (const s of states) this.states.set(s.slackUserId, { ...s });
  }

  async claimDm(_teamId: string, slackUserId: string, dmType: DmType) {
    await Promise.resolve();
    const s = this.states.get(slackUserId);
    if (!s) return false;
    const sentAt = dmType === "link_request" ? s.linkRequestDmAt : s.removalNoticeDmAt;
    const clean = !s.needsReview || s.reviewReason === SOFT_REVIEW_REASON;
    if (!clean || sentAt !== null) return false;
    s.needsReview = true;
    s.reviewReason = `sending:${dmType}`;
    return true;
  }

  async patchState(_teamId: string, slackUserId: string, patch: Partial<SyncState>) {
    await Promise.resolve();
    if (this.failPatch) throw new Error("state patch failed: boom");
    const s = this.states.get(slackUserId);
    if (s) this.states.set(slackUserId, { ...s, ...patch });
  }

  async insertLinkToken(token: Omit<MemoryToken, "usedAt" | "createdAt">) {
    await Promise.resolve();
    this.tokens.push({ ...token, usedAt: null, createdAt: this.clock() });
  }

  async markOwnerReportSent(date: string) {
    if (this.settings) this.settings = { ...this.settings, ownerReportSentOn: date };
  }

  // ---- LinkStore ----
  async peekToken(tokenHash: string) {
    const t = this.tokens.find((x) => x.tokenHash === tokenHash);
    if (!t || !t.slackUserId) return "invalid" as const;
    if (t.usedAt) return "used" as const;
    if (t.expiresAt.getTime() <= this.clock().getTime()) return "expired" as const;
    return "valid" as const;
  }

  async claimLink(tokenHash: string, userId: string): Promise<LinkClaimResult> {
    const t = this.tokens.find((x) => x.tokenHash === tokenHash);
    if (!t || !t.slackUserId) return "invalid";
    if (t.usedAt) return "used";
    if (t.expiresAt.getTime() <= this.clock().getTime()) return "expired";
    const bySlack = this.links.find((l) => l.teamId === t.teamId && l.slackUserId === t.slackUserId);
    if (bySlack) {
      if (bySlack.userId === userId) {
        t.usedAt = this.clock();
        return "already_linked";
      }
      // SQL 関数と同じ: 相手が課金中（手で残す人を含む）なら断る
      if (this.isPaid(bySlack.userId)) return "slack_linked_to_other";
    }
    if (this.links.some((l) => l.userId === userId)) return "user_linked_to_other";
    if (bySlack) this.links = this.links.filter((l) => l !== bySlack);
    this.links.push({
      userId,
      teamId: t.teamId,
      slackUserId: t.slackUserId,
      linkedVia: t.purpose === "mypage" ? "mypage" : "dm_link",
    });
    t.usedAt = this.clock();
    return "linked";
  }

  isPaid(userId: string): boolean {
    if (this.settings?.keepUserIds.includes(userId)) return true;
    const u = this.users.find((x) => x.userId === userId);
    return Boolean(u?.sub?.hasPaidRecord && u.sub.isActive);
  }

  async getLinkByUserId(userId: string) {
    const l = this.links.find((x) => x.userId === userId);
    return l ? { teamId: l.teamId, slackUserId: l.slackUserId } : null;
  }

  async getLinkedUserId(teamId: string, slackUserId: string) {
    return this.links.find((l) => l.teamId === teamId && l.slackUserId === slackUserId)?.userId ?? null;
  }

  async getSubscription(userId: string) {
    const u = this.users.find((x) => x.userId === userId);
    return u ? this.summary(u) : null;
  }

  async countMypageRequests(userId: string, since: Date) {
    return this.tokens.filter(
      (t) => t.requestedByUserId === userId && t.purpose === "mypage" && t.createdAt.getTime() >= since.getTime(),
    ).length;
  }
}

export class FakeSyncSlack implements SyncSlackClient {
  members: SlackMemberSummary[] = [];
  pageSize = 200;
  listQueue: SlackCallResult<{ members: SlackMemberSummary[]; nextCursor: string | null }>[] = [];
  listCalls: (string | null)[] = [];
  openCalls: string[] = [];
  postCalls: { channelId: string; text: string }[] = [];
  openQueue: SlackCallResult<{ channelId: string }>[] = [];
  postQueue: SlackCallResult<{ channelId: string; ts: string }>[] = [];
  lookupCalls: string[] = [];
  lookupResult: (email: string) => SlackCallResult<SlackMemberSummary> = () => ({
    kind: "slack_error",
    error: "users_not_found",
  });
  me: SlackCallResult<{ userId: string; teamId: string; url: string }> = {
    kind: "ok",
    data: { userId: "U0OWNER", teamId: TEAM_ID, url: "https://bono.slack.com/" },
  };

  async usersListPage(cursor: string | null) {
    this.listCalls.push(cursor);
    const queued = this.listQueue.shift();
    if (queued) return queued;
    const start = cursor ? Number(cursor) : 0;
    const page = this.members.slice(start, start + this.pageSize);
    const next = start + this.pageSize < this.members.length ? String(start + this.pageSize) : null;
    return { kind: "ok" as const, data: { members: page, nextCursor: next } };
  }

  async lookupByEmail(email: string) {
    this.lookupCalls.push(email);
    return this.lookupResult(email);
  }

  async authTest() {
    return this.me;
  }

  async openDm(userId: string) {
    this.openCalls.push(userId);
    return this.openQueue.shift() ?? { kind: "ok" as const, data: { channelId: `D-${userId}` } };
  }

  async postMessage(channelId: string, text: string) {
    this.postCalls.push({ channelId, text });
    return (
      this.postQueue.shift() ?? {
        kind: "ok" as const,
        data: { channelId, ts: `1700000000.00000${this.postCalls.length}` },
      }
    );
  }

  /** 送り先ごとの本文（オーナー報告は D-U0OWNER） */
  textsTo(userId: string) {
    return this.postCalls.filter((c) => c.channelId === `D-${userId}`).map((c) => c.text);
  }
}

const approved = (text: string, placeholders: string[]): SyncMessage => ({
  version: 3,
  approved: true,
  text,
  placeholders,
});

export const APPROVED_MESSAGES = {
  linkRequest: approved("つないでください <{{link}}|つなぐ> 期限 {{deadline}}", ["link", "deadline"]),
  removalNotice: approved("{{end_date}}で終了、{{remove_date}}に外れます <{{signup_url}}|登録>", [
    "end_date",
    "remove_date",
    "signup_url",
  ]),
  ownerReport: approved("*{{summary}}*\n{{due_list}}\n{{review}}\n<{{admin_url}}|管理>", [
    "summary",
    "due_list",
    "review",
    "admin_url",
  ]),
};

export function makeSyncDeps(
  overrides: Partial<SyncDeps> & { store: MemorySyncStore; slack: FakeSyncSlack; nowRef?: { now: Date } },
) {
  const nowRef = overrides.nowRef ?? { now: new Date("2026-10-27T01:30:00Z") };
  overrides.store.clock = () => nowRef.now;
  const sleeps: number[] = [];
  const alerts: Record<string, number>[] = [];
  let tokenSeq = 0;
  const deps: SyncDeps = {
    teamId: TEAM_ID,
    messages: APPROVED_MESSAGES,
    siteUrl: "https://www.bo-no.design",
    now: () => nowRef.now,
    sleep: async (ms) => {
      sleeps.push(ms);
      nowRef.now = new Date(nowRef.now.getTime() + ms);
    },
    notifyOps: async (alert) => {
      alerts.push(alert.counts);
    },
    newToken: () => `tok${String(++tokenSeq).padStart(40, "0")}`,
    limits: { dmIntervalMs: 0 },
    ...overrides,
  };
  return { deps, sleeps, alerts, nowRef };
}

/** メール付きの Slack メンバー */
export function memberWithEmail(id: string, email: string | null, overrides: Partial<SlackMemberSummary> = {}) {
  return makeMember({ id, emailHash: email ? hashEmail(email) : null, ...overrides });
}
