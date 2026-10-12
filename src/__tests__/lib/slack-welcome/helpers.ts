/**
 * Slack ウェルカムDM（#238）テスト用のインメモリ store / 偽 Slack クライアント。
 * claim / update は Supabase 実装と同じ条件（status・next_attempt_at・claim_token）で
 * 「確認と書き込みを await を挟まず1度に行う」ので、同時実行しても1つだけが勝つ。
 */
import type { SlackCallResult, SlackClient, SlackUserSummary } from "@/lib/slack-welcome/slack-api";
import type { WelcomeMessage } from "@/lib/slack-welcome/message";
import type { WelcomeDeps } from "@/lib/slack-welcome/process";
import {
  CLAIMABLE_STATUSES,
  type DeliveryRow,
  type WelcomeSettings,
  type WelcomeStore,
} from "@/lib/slack-welcome/types";

export const TEAM_ID = "T0BONO";
export const APP_ID = "A0WELCOME";

export class MemoryStore implements WelcomeStore {
  rows: (DeliveryRow & { updatedAt: Date })[] = [];
  settings: WelcomeSettings | null = {
    mode: "live",
    enabledFrom: new Date("2026-10-01T00:00:00Z"),
    testUserIds: [],
  };
  failInsert = false;
  failSettings = false;
  private seq = 0;
  clock: () => Date = () => new Date();

  async getSettings() {
    await Promise.resolve();
    if (this.failSettings) throw new Error("settings read failed: boom");
    return this.settings ? { ...this.settings, testUserIds: [...this.settings.testUserIds] } : null;
  }

  async insertDelivery(row: Parameters<WelcomeStore["insertDelivery"]>[0]) {
    await Promise.resolve();
    if (this.failInsert) throw new Error("delivery insert failed: boom");
    if (this.rows.some((r) => r.teamId === row.teamId && r.slackUserId === row.slackUserId)) {
      return "duplicate" as const;
    }
    this.seq += 1;
    this.rows.push({
      id: `row-${this.seq}`,
      teamId: row.teamId,
      slackUserId: row.slackUserId,
      eventId: row.eventId,
      eventTime: row.eventTime,
      status: "queued",
      attempts: 0,
      nextAttemptAt: row.firstReceivedAt,
      claimToken: null,
      lockedUntil: null,
      lastErrorCode: null,
      channelId: null,
      messageTs: null,
      messageVersion: null,
      dryRunResult: null,
      dryRunAt: null,
      firstReceivedAt: row.firstReceivedAt,
      sentAt: null,
      updatedAt: this.clock(),
    });
    return "inserted" as const;
  }

  async findIdByKey(teamId: string, slackUserId: string) {
    await Promise.resolve();
    return this.rows.find((r) => r.teamId === teamId && r.slackUserId === slackUserId)?.id ?? null;
  }

  async claim(id: string, now: Date, lockedUntil: Date, token: string) {
    await Promise.resolve();
    const row = this.rows.find((r) => r.id === id);
    if (!row) return null;
    const claimable =
      row.nextAttemptAt.getTime() <= now.getTime() &&
      (CLAIMABLE_STATUSES.includes(row.status) ||
        (row.status === "processing" && row.lockedUntil !== null && row.lockedUntil.getTime() < now.getTime()));
    if (!claimable) return null;
    row.status = "processing";
    row.claimToken = token;
    row.lockedUntil = lockedUntil;
    row.updatedAt = this.clock();
    return { ...row };
  }

  async update(
    id: string,
    token: string,
    expectedStatus: DeliveryRow["status"],
    patch: Parameters<WelcomeStore["update"]>[3],
  ) {
    await Promise.resolve();
    const row = this.rows.find((r) => r.id === id);
    if (!row || row.claimToken !== token || row.status !== expectedStatus) return false;
    const { release, ...rest } = patch;
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) (row as unknown as Record<string, unknown>)[key] = value;
    }
    if (release) {
      row.claimToken = null;
      row.lockedUntil = null;
    }
    row.updatedAt = this.clock();
    return true;
  }

  async listDueIds(now: Date, limit: number) {
    await Promise.resolve();
    return this.rows
      .filter(
        (r) =>
          r.nextAttemptAt.getTime() <= now.getTime() &&
          (CLAIMABLE_STATUSES.includes(r.status) ||
            (r.status === "processing" && r.lockedUntil !== null && r.lockedUntil.getTime() < now.getTime())),
      )
      .sort((a, b) => a.nextAttemptAt.getTime() - b.nextAttemptAt.getTime())
      .slice(0, limit)
      .map((r) => r.id);
  }

  async markStaleSending(olderThan: Date) {
    await Promise.resolve();
    let n = 0;
    for (const row of this.rows) {
      if (row.status === "sending" && row.updatedAt.getTime() < olderThan.getTime()) {
        row.status = "needs_review";
        row.lastErrorCode = "stale_sending";
        row.claimToken = null;
        row.lockedUntil = null;
        n += 1;
      }
    }
    return n;
  }

  get(slackUserId: string) {
    return this.rows.find((r) => r.slackUserId === slackUserId);
  }
}

export function makeUser(overrides: Partial<SlackUserSummary> = {}): SlackUserSummary {
  return {
    id: "U0NEW",
    teamId: TEAM_ID,
    deleted: false,
    isBot: false,
    isAppUser: false,
    isWorkflowBot: false,
    isInvitedUser: false,
    isRestricted: false,
    isUltraRestricted: false,
    ...overrides,
  };
}

type Responder<T> = (arg: string) => Promise<SlackCallResult<T>> | SlackCallResult<T>;

export class FakeSlack implements SlackClient {
  usersInfoCalls: string[] = [];
  openCalls: string[] = [];
  postCalls: { channelId: string; text: string }[] = [];
  userFor: Responder<SlackUserSummary> = (userId) => ({ kind: "ok", data: makeUser({ id: userId }) });
  openQueue: SlackCallResult<{ channelId: string }>[] = [];
  postQueue: SlackCallResult<{ channelId: string; ts: string }>[] = [];
  postDelayMs = 0;

  async usersInfo(userId: string) {
    this.usersInfoCalls.push(userId);
    return this.userFor(userId);
  }

  async openDm(userId: string) {
    this.openCalls.push(userId);
    return this.openQueue.shift() ?? { kind: "ok" as const, data: { channelId: `D-${userId}` } };
  }

  async postMessage(channelId: string, text: string) {
    this.postCalls.push({ channelId, text });
    if (this.postDelayMs > 0) await new Promise((r) => setTimeout(r, this.postDelayMs));
    return (
      this.postQueue.shift() ?? {
        kind: "ok" as const,
        data: { channelId, ts: `1700000000.00000${this.postCalls.length}` },
      }
    );
  }
}

export const APPROVED_MESSAGE: WelcomeMessage = {
  version: 2,
  approved: true,
  text: "ようこそ！まずは <https://www.bo-no.design/how-to|使い方ガイド> をご覧ください。",
};

export function makeDeps(
  overrides: Partial<WelcomeDeps> & { store: MemoryStore; slack: FakeSlack; nowRef?: { now: Date } },
) {
  const nowRef = overrides.nowRef ?? { now: new Date("2026-10-12T03:00:00Z") };
  overrides.store.clock = () => nowRef.now;
  const sleeps: number[] = [];
  const alerts: Record<string, number>[] = [];
  let tokenSeq = 0;
  const deps: WelcomeDeps = {
    teamId: TEAM_ID,
    message: APPROVED_MESSAGE,
    now: () => nowRef.now,
    sleep: async (ms) => {
      sleeps.push(ms);
      nowRef.now = new Date(nowRef.now.getTime() + ms);
    },
    notifyOps: async (alert) => {
      alerts.push(alert.counts);
    },
    newToken: () => `token-${++tokenSeq}`,
    ...overrides,
  };
  return { deps, sleeps, alerts, nowRef };
}

/** テスト用に1行入れる */
export async function seed(store: MemoryStore, slackUserId = "U0NEW", at = new Date("2026-10-12T03:00:00Z")) {
  await store.insertDelivery({
    teamId: TEAM_ID,
    slackUserId,
    eventId: `Ev-${slackUserId}`,
    eventTime: at,
    firstReceivedAt: at,
  });
  return store.get(slackUserId)!.id;
}
