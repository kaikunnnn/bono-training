// Slack DM（#327-H）のテスト用のインメモリ store と Slack の偽物。Slack の ID・チーム ID は架空の値だけ。
import type {
  NewSlackDm,
  NewSlackPreview,
  SlackDmCandidate,
  SlackDmClient,
  SlackDmLink,
  SlackDmPatch,
  SlackDmStatus,
  SlackDmStore,
} from "@/lib/member-mail/slack-dm";
import type { MailMode } from "@/lib/member-mail/types";
import type { SlackCallResult, SlackUserSummary } from "@/lib/slack-welcome/slack-api";
import type { MemStore } from "./helpers";

export const TEAM = "T0TESTTEAM";

export interface MemDm {
  id: string;
  key: string;
  row: NewSlackDm | NewSlackPreview;
  status: SlackDmStatus;
  reason: string | null;
  ts: string | null;
  updatedAt: Date;
}

export class MemSlackDmStore implements SlackDmStore {
  mode: MailMode = "off";
  modeError = false;
  links = new Map<string, SlackDmLink>();
  prefs = new Map<string, boolean>();
  dms: MemDm[] = [];
  previews: MemDm[] = [];
  /** Slack を呼んだ時点で sending の行があったか（呼ぶ直前に記録を作っているかの確認用） */
  private seq = 0;
  constructor(private mail: MemStore) {}

  async getSlackDmMode() {
    if (this.modeError) throw new Error("slack dm mode read failed: 42703");
    return this.mode;
  }
  async getSlackLink(userId: string) {
    return this.links.get(userId) ?? null;
  }
  async listSlackLinkedUserIds(userIds: readonly string[], teamId: string | null) {
    return new Set(userIds.filter((u) => this.links.has(u) && (!teamId || this.links.get(u)!.teamId === teamId)));
  }
  async getSlackDmPreference(userId: string) {
    return this.prefs.has(userId) ? { enabled: this.prefs.get(userId)!, hasRow: true } : { enabled: true, hasRow: false };
  }
  async listSlackDmDisabledUserIds(userIds: readonly string[]) {
    return new Set(userIds.filter((u) => this.prefs.get(u) === false));
  }
  async setSlackDmEnabled(userId: string, enabled: boolean) {
    this.prefs.set(userId, enabled);
  }
  async hasReceivedSlackDm(userId: string) {
    return [...this.dms, ...this.previews].some((d) => d.row.userId === userId && d.status === "sent");
  }
  async listSlackDmCandidates(campaignIds: readonly string[], sentSince: Date, limit: number) {
    const out: SlackDmCandidate[] = [];
    for (const d of this.mail.deliveries) {
      if (!campaignIds.includes(d.campaignId) || d.status !== "sent" || !d.sentAt || d.sentAt < sentSince) continue;
      const dm = this.dms.find((x) => x.key === d.id);
      if (dm && dm.status !== "deferred") continue;
      out.push({
        deliveryId: d.id,
        campaignId: d.campaignId,
        userId: d.userId,
        audience: d.audience,
        contentVersion: d.contentVersion,
      });
      if (out.length >= limit) break;
    }
    return out;
  }
  private claimIn(list: MemDm[], key: string, row: NewSlackDm | NewSlackPreview, at: Date) {
    const cur = list.find((x) => x.key === key);
    if (cur) {
      if (cur.status !== "deferred") return null;
      cur.status = "sending";
      cur.reason = null;
      cur.updatedAt = at;
      return cur.id;
    }
    this.seq += 1;
    const id = `dm-${this.seq}`;
    list.push({ id, key, row, status: "sending", reason: null, ts: null, updatedAt: at });
    return id;
  }
  private finishIn(list: MemDm[], id: string, patch: SlackDmPatch) {
    const d = list.find((x) => x.id === id);
    if (!d || d.status !== "sending") return;
    d.status = patch.status;
    if (patch.reason !== undefined) d.reason = patch.reason;
    if (patch.ts !== undefined) d.ts = patch.ts;
  }
  async claimSlackDm(row: NewSlackDm, at: Date) {
    return this.claimIn(this.dms, row.deliveryId, row, at);
  }
  async finishSlackDm(id: string, patch: SlackDmPatch) {
    this.finishIn(this.dms, id, patch);
  }
  async markStaleSlackDms(olderThan: Date) {
    let n = 0;
    for (const d of this.dms) {
      if (d.status === "sending" && d.updatedAt < olderThan) {
        d.status = "needs_review";
        d.reason = "stale_sending";
        n += 1;
      }
    }
    return n;
  }
  async claimSlackPreview(row: NewSlackPreview, at: Date) {
    return this.claimIn(this.previews, `${row.campaignId}:${row.userId}:${row.contentVersion}`, row, at);
  }
  async finishSlackPreview(id: string, patch: SlackDmPatch) {
    this.finishIn(this.previews, id, patch);
  }
}

export function slackUser(id: string, over: Partial<SlackUserSummary> = {}): SlackUserSummary {
  return {
    id,
    teamId: TEAM,
    deleted: false,
    isBot: false,
    isAppUser: false,
    isWorkflowBot: false,
    isInvitedUser: false,
    isRestricted: false,
    isUltraRestricted: false,
    ...over,
  };
}

export class FakeSlack implements SlackDmClient {
  info = new Map<string, SlackUserSummary>();
  infoCalls: string[] = [];
  opened: string[] = [];
  posted: { channelId: string; text: string }[] = [];
  nextInfo: SlackCallResult<SlackUserSummary>[] = [];
  nextOpen: SlackCallResult<{ channelId: string }>[] = [];
  nextPost: SlackCallResult<{ channelId: string; ts: string }>[] = [];
  throwOnOpen = false;
  /** 呼ぶたびに呼ばれる（順番の記録・時計を進める） */
  onCall: (method: string) => void = () => {};
  async usersInfo(userId: string) {
    this.onCall("users.info");
    this.infoCalls.push(userId);
    return this.nextInfo.shift() ?? { kind: "ok" as const, data: this.info.get(userId) ?? slackUser(userId) };
  }
  async openDm(userId: string) {
    this.onCall("conversations.open");
    if (this.throwOnOpen) throw new Error("boom");
    this.opened.push(userId);
    return this.nextOpen.shift() ?? { kind: "ok" as const, data: { channelId: `D-${userId}` } };
  }
  async postMessage(channelId: string, text: string) {
    this.onCall("chat.postMessage");
    this.posted.push({ channelId, text });
    return (
      this.nextPost.shift() ?? { kind: "ok" as const, data: { channelId, ts: `1700000000.00000${this.posted.length}` } }
    );
  }
}
