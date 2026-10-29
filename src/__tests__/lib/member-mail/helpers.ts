// 会員メール（#264）のテスト用のインメモリ store と Resend の偽物。
// fixture のアドレスは example.invalid のみ（実在のアドレス・名前は書かない）。
import type {
  Campaign,
  CountSummary,
  DeliveryPatch,
  DeliveryRow,
  DeliveryStatus,
  MailCategory,
  MailClient,
  MailKind,
  MailMode,
  MailSettings,
  MailStore,
  MemberCandidate,
  NewDelivery,
  OutgoingMail,
  SendResult,
  UnsubscribeMethod,
  UnsubscribeStore,
  WebhookApplyResult,
  WebhookStore,
} from "@/lib/member-mail/types";
import type { MailDeps } from "@/lib/member-mail/process";

export const SECRET = "test-secret-0123456789abcdef0123456789";
export const SITE = "https://www.bo-no.design";

export function uid(n: number): string {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

export interface MemDelivery extends DeliveryRow {
  reason: string | null;
  nextAttemptAt: Date;
  claimToken: string | null;
  lockedUntil: Date | null;
  resendEmailId: string | null;
  sendingAt: Date | null;
  sentAt: Date | null;
  updatedAt: Date;
  openCount: number;
  clickCount: number;
}

export class MemStore implements MailStore, UnsubscribeStore, WebhookStore {
  settings: MailSettings = { mode: "all", ownerUserIds: [], dailyLimit: 80, sendHourStart: 0, sendHourEnd: 24 };
  kindModes: Record<string, MailMode> = { weekly: "all" };
  campaigns = new Map<string, Campaign>();
  counts = new Map<string, CountSummary>();
  members: MemberCandidate[] = [];
  emails = new Map<string, string>();
  unsubscribes = new Map<string, { method: UnsubscribeMethod; resubscribed: boolean }>();
  suppressed = new Map<string, string>();
  deliveries: MemDelivery[] = [];
  webhookIds = new Set<string>();
  autoStopped: string | null = null;
  lockedUntil: Date | null = null;
  private seq = 0;

  async getSettings() {
    return { ...this.settings };
  }
  async getKindMode(kind: MailKind) {
    return this.kindModes[kind] ?? "off";
  }
  async autoStop(reason: string) {
    this.settings.mode = "off";
    this.autoStopped = reason;
  }
  async acquireRunLock(now: Date, until: Date) {
    if (this.lockedUntil && this.lockedUntil > now) return false;
    this.lockedUntil = until;
    return true;
  }
  async releaseRunLock() {
    this.lockedUntil = null;
  }
  async getCampaign(id: string) {
    const c = this.campaigns.get(id);
    return c ? { ...c } : null;
  }
  async listDueCampaigns(now: Date) {
    return [...this.campaigns.values()].filter((c) => c.scheduledAt && c.scheduledAt <= now);
  }
  async markEnqueued(id: string, at: Date) {
    this.campaigns.get(id)!.enqueuedAt = at;
  }
  async saveCount(id: string, count: CountSummary) {
    this.counts.set(id, count);
  }
  async listPaidMembers() {
    return [...this.members];
  }
  async isPaidMember(userId: string) {
    return this.members.some((m) => m.userId === userId);
  }
  private unsubKey(userId: string, category: MailCategory) {
    return `${userId}:${category}`;
  }
  async listUnsubscribedUserIds(category: MailCategory) {
    const out = new Set<string>();
    for (const [k, v] of this.unsubscribes) {
      const [userId, cat] = k.split(":");
      if (cat === category && !v.resubscribed) out.add(userId);
    }
    return out;
  }
  async isUnsubscribed(userId: string, category: MailCategory) {
    const v = this.unsubscribes.get(this.unsubKey(userId, category));
    return Boolean(v && !v.resubscribed);
  }
  async listSuppressedUserIds() {
    return new Set(this.suppressed.keys());
  }
  async isSuppressed(userId: string) {
    return this.suppressed.has(userId);
  }
  private mailed(d: MemDelivery, since: Date, categories: readonly MailCategory[], exclude: string) {
    return (
      d.audience === "all" &&
      categories.includes(d.category) &&
      ["sending", "sent", "needs_review"].includes(d.status) &&
      d.campaignId !== exclude &&
      d.sendingAt !== null &&
      d.sendingAt >= since
    );
  }
  async listUsersMailedSince(since: Date, categories: readonly MailCategory[], exclude: string) {
    return new Set(this.deliveries.filter((d) => this.mailed(d, since, categories, exclude)).map((d) => d.userId));
  }
  async hasMailedSince(userId: string, since: Date, categories: readonly MailCategory[], exclude: string) {
    return this.deliveries.some((d) => d.userId === userId && this.mailed(d, since, categories, exclude));
  }
  async countSentSince(since: Date) {
    return this.deliveries.filter(
      (d) => ["sending", "sent", "needs_review"].includes(d.status) && d.sendingAt && d.sendingAt >= since,
    ).length;
  }
  async insertDeliveries(rows: NewDelivery[]) {
    let n = 0;
    for (const r of rows) {
      const dup = this.deliveries.some(
        (d) =>
          d.campaignId === r.campaignId &&
          d.userId === r.userId &&
          d.audience === r.audience &&
          (r.audience === "all" || d.contentVersion === r.contentVersion),
      );
      if (dup) continue;
      this.seq += 1;
      this.deliveries.push({
        id: `d-${this.seq}`,
        ...r,
        status: "queued",
        attempts: 0,
        reason: null,
        nextAttemptAt: new Date(0),
        claimToken: null,
        lockedUntil: null,
        resendEmailId: null,
        sendingAt: null,
        sentAt: null,
        updatedAt: new Date(),
        openCount: 0,
        clickCount: 0,
      });
      n += 1;
    }
    return n;
  }
  async listDueDeliveryIds(now: Date, limit: number) {
    return this.deliveries
      .filter(
        (d) =>
          (d.status === "queued" && d.nextAttemptAt <= now) ||
          (d.status === "processing" && d.lockedUntil !== null && d.lockedUntil < now),
      )
      .slice(0, limit)
      .map((d) => d.id);
  }
  async claim(id: string, now: Date, lockedUntil: Date, token: string) {
    const d = this.deliveries.find((x) => x.id === id);
    if (!d) return null;
    const ok =
      (d.status === "queued" && d.nextAttemptAt <= now) ||
      (d.status === "processing" && d.lockedUntil !== null && d.lockedUntil < now);
    if (!ok) return null;
    d.status = "processing";
    d.claimToken = token;
    d.lockedUntil = lockedUntil;
    return { ...d };
  }
  async update(id: string, token: string, expected: DeliveryStatus, patch: DeliveryPatch) {
    const d = this.deliveries.find((x) => x.id === id);
    if (!d || d.claimToken !== token || d.status !== expected) return false;
    if (patch.status !== undefined) d.status = patch.status;
    if (patch.reason !== undefined) d.reason = patch.reason;
    if (patch.attempts !== undefined) d.attempts = patch.attempts;
    if (patch.nextAttemptAt !== undefined) d.nextAttemptAt = patch.nextAttemptAt;
    if (patch.resendEmailId !== undefined) d.resendEmailId = patch.resendEmailId;
    if (patch.contentVersion !== undefined) d.contentVersion = patch.contentVersion;
    if (patch.sendingAt !== undefined) d.sendingAt = patch.sendingAt;
    if (patch.sentAt !== undefined) d.sentAt = patch.sentAt;
    if (patch.release) {
      d.claimToken = null;
      d.lockedUntil = null;
    }
    d.updatedAt = new Date();
    return true;
  }
  async markStaleSending(olderThan: Date) {
    let n = 0;
    for (const d of this.deliveries) {
      if (d.status === "sending" && d.updatedAt < olderThan) {
        d.status = "needs_review";
        d.reason = "stale_sending";
        n += 1;
      }
    }
    return n;
  }
  async getEmailAddress(userId: string) {
    return this.emails.get(userId) ?? null;
  }
  async unsubscribe(userId: string, categories: readonly MailCategory[], method: UnsubscribeMethod) {
    for (const c of categories) {
      const cur = this.unsubscribes.get(this.unsubKey(userId, c));
      if (cur && !cur.resubscribed) continue;
      this.unsubscribes.set(this.unsubKey(userId, c), { method, resubscribed: false });
    }
  }
  async resubscribe(userId: string, category: MailCategory) {
    const cur = this.unsubscribes.get(this.unsubKey(userId, category));
    if (cur) cur.resubscribed = true;
  }
  async listStoppedCategories(userId: string) {
    return (["notice", "comeback", "signup", "winback"] as MailCategory[]).filter((c) => {
      const v = this.unsubscribes.get(this.unsubKey(userId, c));
      return v && !v.resubscribed;
    });
  }
  async applyEvent(input: { webhookId: string; eventType: string; resendEmailId: string }): Promise<WebhookApplyResult> {
    if (this.webhookIds.has(input.webhookId)) return "duplicate";
    this.webhookIds.add(input.webhookId);
    const d = this.deliveries.find((x) => x.resendEmailId === input.resendEmailId);
    if (!d) return "unknown";
    if (input.eventType === "email.opened") d.openCount += 1;
    if (input.eventType === "email.clicked") d.clickCount += 1;
    if (input.eventType === "email.bounced" || input.eventType === "email.complained") {
      this.suppressed.set(d.userId, input.eventType === "email.bounced" ? "bounced" : "complained");
      return "suppressed";
    }
    return "recorded";
  }
}

export class FakeMail implements MailClient {
  sent: OutgoingMail[] = [];
  next: SendResult[] = [];
  async send(mail: OutgoingMail): Promise<SendResult> {
    this.sent.push(mail);
    return this.next.shift() ?? { kind: "ok", id: `re_${this.sent.length}` };
  }
}

export function approvedCampaign(over: Partial<Campaign> = {}): Campaign {
  return {
    id: "c-1",
    kind: "weekly",
    label: "週1回のメルマガ・テスト号",
    subject: "今週のデザインレター",
    preheader: "新しいレッスンが出ました",
    body: "こんにちは。\n\n## 今週の1本\n\n[UIの基本](https://www.bo-no.design/lessons/ui-basics)を出しました。",
    contentVersion: 1,
    approvedVersion: 1,
    scheduledAt: new Date(0),
    enqueuedAt: null,
    ...over,
  };
}

export function member(n: number, over: Partial<MemberCandidate> = {}): MemberCandidate {
  return {
    userId: uid(n),
    planType: "standard",
    duration: 1,
    cancelAtPeriodEnd: false,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...over,
  };
}

export function makeDeps(store: MemStore, mail: FakeMail | null, alerts: unknown[] = []): MailDeps {
  let t = 0;
  return {
    store,
    mail,
    notifyOps: async (a) => {
      alerts.push(a);
    },
    now: () => new Date("2026-11-09T00:00:00Z"), // 月曜 9:00 JST
    newToken: () => `tok-${++t}`,
    siteUrl: SITE,
    from: "カイくん <test@mail.example.invalid>",
    replyTo: "owner@example.invalid",
    unsubscribeSecret: SECRET,
  };
}
