// @vitest-environment node
// 会員メールの常設の文面（327-D はじめの案内）と、配信停止トークン・リンクの印の見直しをインメモリで確かめる。
// アドレスは example.invalid、テスト用アカウントの頭は架空の値だけを使う。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
vi.mock("server-only", () => ({}));
import { getCampaignBlockReason, renderMail, unsubscribeHeaders } from "@/lib/member-mail/content";
import { jstDaysBetween } from "@/lib/member-mail/dates";
import { buildLessonIndex, isLearningEvent } from "@/lib/member-mail/learned";
import { prepareCampaign, runSendBatch } from "@/lib/member-mail/process";
import { ONBOARDING_DAY2_COPY } from "@/lib/member-mail/standing-copy";
import { STANDING_CAP_MAX } from "@/lib/member-mail/targets";
import {
  FROM_OF_KIND,
  FROM_OF_STANDING,
  MAIL_CATEGORIES,
  MAIL_KINDS,
  type Campaign,
  type ProgressEvent,
  type StandingKey,
} from "@/lib/member-mail/types";
import { unsubscribeByToken } from "@/lib/member-mail/unsubscribe";
import {
  createLegacyUnsubscribeTokenV1,
  createUnsubscribeToken,
  oneClickUrl,
  unsubscribePageUrl,
  verifyUnsubscribeToken,
} from "@/lib/member-mail/unsubscribe-token";
import { parseEmailFrom } from "@/lib/activity-utils";
import {
  approvedCampaign,
  FakeMail,
  LEARNING_ARTICLE,
  LEARNING_LESSON,
  makeDeps,
  member,
  MemStore,
  ONBOARDING_ARTICLE,
  ONBOARDING_LESSON,
  SECRET,
  SITE,
  testLessonIndex,
  uid,
} from "./helpers";

// 日本時間の朝 8:00（UTC の前日 23:00）
function jstMorning(day: string): Date {
  const d = new Date(`${day}T08:00:00+09:00`);
  return d;
}
function jst(dateTime: string): Date {
  return new Date(`${dateTime}+09:00`);
}

const ACTIVATED = jst("2026-11-20T12:00:00");
const TEST_PREFIX = "qa-fixture";

function standingCampaign(over: Partial<Campaign> = {}): Campaign {
  return approvedCampaign({
    id: "s-1",
    kind: "signup",
    label: ONBOARDING_DAY2_COPY.label,
    subject: ONBOARDING_DAY2_COPY.subject,
    preheader: ONBOARDING_DAY2_COPY.preheader,
    body: ONBOARDING_DAY2_COPY.body,
    standingKey: "onboarding_day2",
    scheduledAt: ACTIVATED,
    // 文面ごとのスイッチ（#327-E/F）は全員に上げた状態。このファイルは全体・種類のスイッチの動きを見る
    standingMode: "all",
    ...over,
  });
}

/**
 * 最初の課金日時（JST）ごとに会員を入れる。
 * アカウント（user_subscriptions.created_at）は本番のトリガーと同じく、課金よりずっと前に作られた形にする
 */
function seedStanding(joins: Record<number, string>) {
  const store = new MemStore();
  store.kindModes.signup = "all";
  store.testEmailPrefixes = [TEST_PREFIX];
  const campaign = standingCampaign();
  store.campaigns.set(campaign.id, campaign);
  for (const [n, at] of Object.entries(joins)) {
    const i = Number(n);
    store.members.push(member(i, { createdAt: new Date("2025-06-01T00:00:00Z") }));
    store.contracts.push({ subscriptionId: `sub_test_${i}`, start: jst(at) });
    store.emails.set(uid(i), `member${i}@example.invalid`);
  }
  return { store, campaign };
}

function depsAt(store: MemStore, mail: FakeMail, now: Date, alerts: unknown[] = [], over = {}) {
  return makeDeps(store, mail, alerts, { now: () => now, ...over });
}

/** 毎朝の実行（常設の文面を選ぶ → 送る） */
async function morningRun(store: MemStore, mail: FakeMail, now: Date, alerts: unknown[] = [], over = {}) {
  const deps = depsAt(store, mail, now, alerts, over);
  const results = [];
  for (const c of await store.listStandingCampaigns(now)) results.push(await prepareCampaign(deps, c));
  const batch = await runSendBatch(deps);
  return { results, batch };
}

function learnedEvent(userId: string, at: Date, over: Partial<ProgressEvent> = {}): ProgressEvent {
  return {
    userId,
    eventType: "article_complete",
    articleId: LEARNING_ARTICLE,
    lessonId: LEARNING_LESSON,
    occurredAt: at,
    percent: null,
    ...over,
  };
}

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  // ログにメールアドレス・テスト用アカウントの頭が出ていない
  const all = JSON.stringify([...logSpy.mock.calls, ...errSpy.mock.calls]);
  expect(all).not.toContain("@example.invalid");
  expect(all).not.toContain(TEST_PREFIX);
  vi.restoreAllMocks();
});

describe("送る日: 入会の2日後の朝にだけ1通", () => {
  it("入会日をずらした人のうち、2日後の朝の人にだけ届く", async () => {
    const { store } = seedStanding({
      1: "2026-11-23T10:00:00", // 2日後 → 送る
      2: "2026-11-24T23:50:00", // 1日後 → まだ
      3: "2026-11-25T07:00:00", // 当日 → まだ
      4: "2026-11-23T00:05:00", // 2日後（日本時間の日付で数える）→ 送る
      5: "2026-11-21T10:00:00", // 4日後 → もう送らない
    });
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent.map((m) => m.to).sort()).toEqual(["member1@example.invalid", "member4@example.invalid"]);
  });

  it("毎朝実行しても、1人に届くのは2日後の朝の1通だけ（二重に届かない）", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const mail = new FakeMail();
    const sentOn: string[] = [];
    for (const day of ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27"]) {
      const before = mail.sent.length;
      await morningRun(store, mail, jstMorning(day));
      // 同じ朝にもう一度（9時・10時の回や手動の実行）
      await morningRun(store, mail, new Date(jstMorning(day).getTime() + 60 * 60 * 1000));
      if (mail.sent.length > before) sentOn.push(day);
    }
    expect(mail.sent).toHaveLength(1);
    expect(sentOn).toEqual(["2026-11-25"]);
    expect(store.deliveries).toHaveLength(1);
  });

  it("2日後の朝の実行を取りこぼしたら3日後の朝に送り、4日後以降は送らない", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00", 2: "2026-11-22T10:00:00" });
    const mail = new FakeMail();
    // 11/25 の朝の実行が失敗した想定で、11/26 の朝から
    await morningRun(store, mail, jstMorning("2026-11-26"));
    expect(mail.sent.map((m) => m.to)).toEqual(["member1@example.invalid"]);
  });

  it("日本時間の日付で数える（23:50 入会は翌日を1日目とする）", () => {
    expect(jstDaysBetween(jst("2026-11-23T23:50:00"), jstMorning("2026-11-25"))).toBe(2);
    expect(jstDaysBetween(jst("2026-11-24T00:10:00"), jstMorning("2026-11-25"))).toBe(1);
  });

  it("送ってよい時間の外では選ばない", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.settings.sendHourStart = 8;
    store.settings.sendHourEnd = 21;
    const mail = new FakeMail();
    const { results } = await morningRun(store, mail, jst("2026-11-25T06:00:00"));
    expect(results[0]).toEqual({ outcome: "outside_window" });
    expect(store.deliveries).toHaveLength(0);
  });
});

describe("入会日 = 今の Stripe 契約の最初の課金日（アカウントの古さで分けない）", () => {
  it("ずっと前にアカウントを作り、あとから課金した人にも届く（課金日から数える）", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.members[0].createdAt = new Date("2024-03-01T00:00:00Z");
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent.map((m) => m.to)).toEqual(["member1@example.invalid"]);
  });

  it("登録の数日後に課金した人は、登録日ではなく課金日の2日後に届く", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.members[0].createdAt = jst("2026-11-20T13:00:00"); // 有効にした後に登録 → 2日後の 11/22 には届かない
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-22"));
    expect(mail.sent).toHaveLength(0);
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent).toHaveLength(1);
  });

  it("出戻りで新しい Stripe 契約を結んだ人にも届く（前の契約の日付は見ない）", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.contracts.push({ subscriptionId: "sub_old_1", start: new Date("2025-02-01T00:00:00Z") });
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent).toHaveLength(1);
  });

  it("同じ契約の古い行がある（プラン変更・更新）人は新規に入らない", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.contracts.push({ subscriptionId: "sub_test_1", start: new Date("2026-05-01T00:00:00Z") });
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent).toHaveLength(0);
  });

  it("決済が終わっていない（subscriptions に行が無い）人には届かない。送る直前に行が無くても送らない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const now = jstMorning("2026-11-25");
    const mail = new FakeMail();
    await prepareCampaign(depsAt(store, mail, now), campaign);
    expect(store.deliveries).toHaveLength(1);
    store.contracts = [];
    await runSendBatch(depsAt(store, mail, now));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "not_eligible" });
    const fresh = seedStanding({});
    fresh.store.members.push(member(5));
    fresh.store.emails.set(uid(5), "member5@example.invalid");
    await morningRun(fresh.store, mail, now);
    expect(fresh.store.deliveries).toHaveLength(0);
  });

  it("「学んだ」は課金日から数える（課金前の無料記事の学習は数えない）", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.members[0].createdAt = jst("2026-11-10T10:00:00");
    store.progress.push(learnedEvent(uid(1), jst("2026-11-15T10:00:00")));
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent).toHaveLength(1);
  });
});

describe("届かない人", () => {
  it("学んだ人・止めた人・テスト用アカウント・有効にする前の入会者・届かない人には届かない", async () => {
    const day = "2026-11-23T10:00:00";
    const { store } = seedStanding({ 1: day, 2: day, 3: day, 4: day, 5: day, 6: "2026-11-20T11:00:00" });
    // 2: 入会後に学んだ
    store.progress.push(learnedEvent(uid(2), jst("2026-11-24T20:00:00")));
    // 3: 配信停止（新しいトークンで止める）
    await unsubscribeByToken(store, SECRET, createUnsubscribeToken(SECRET, uid(3)), "link", new Date());
    // 4: テスト用アカウント（大文字でも当たる）
    store.emails.set(uid(4), `${TEST_PREFIX.toUpperCase()}01@example.invalid`);
    // 5: 届かなかった
    store.suppressed.set(uid(5), "bounced");
    // 6: 有効にした時刻（11/20 12:00）より前の入会。今日が「2日後」でないので、日付をずらして確かめる
    const mail = new FakeMail();
    const alerts: { counts?: Record<string, number> }[] = [];
    const { results } = await morningRun(store, mail, jstMorning("2026-11-25"), alerts);
    expect(mail.sent.map((m) => m.to)).toEqual(["member1@example.invalid"]);
    expect(results[0]).toMatchObject({
      outcome: "enqueued",
      inserted: 1,
      count: { excluded: { learned: 1, unsubscribed: 1, test_account: 1, suppressed: 1 } },
    });

    // 有効にする前の入会者: 11/20 11:00 入会 → 11/22 の朝が「2日後」だが、有効にしたのは 11/20 12:00
    const mail2 = new FakeMail();
    await morningRun(store, mail2, jstMorning("2026-11-22"));
    expect(mail2.sent).toHaveLength(0);
  });

  it("有効にした時刻（scheduled_at）が無い文面は何もしない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.campaigns.set(campaign.id, { ...campaign, scheduledAt: null });
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(store.deliveries).toHaveLength(0);
    expect(mail.sent).toHaveLength(0);
  });

  it("入会前の学習・はじめかただけ・動画75%未満は「学んだ」に入らない（届く）。動画75%以上は入る（届かない）", async () => {
    const day = "2026-11-23T10:00:00";
    const { store } = seedStanding({ 1: day, 2: day, 3: day, 4: day });
    store.progress.push(learnedEvent(uid(1), jst("2026-11-22T10:00:00"))); // 入会日より前
    store.progress.push(
      learnedEvent(uid(2), jst("2026-11-23T11:00:00"), { articleId: ONBOARDING_ARTICLE, lessonId: ONBOARDING_LESSON }),
    );
    store.progress.push(learnedEvent(uid(3), jst("2026-11-24T11:00:00"), { eventType: "video_progress", percent: "50" }));
    store.progress.push(learnedEvent(uid(4), jst("2026-11-24T11:00:00"), { eventType: "video_progress", percent: "75" }));
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(mail.sent.map((m) => m.to).sort()).toEqual([
      "member1@example.invalid",
      "member2@example.invalid",
      "member3@example.invalid",
    ]);
  });

  it("送る直前に学んでいたら送らない（書き出したあとに学んだ）", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const mail = new FakeMail();
    const now = jstMorning("2026-11-25");
    await prepareCampaign(depsAt(store, mail, now), campaign);
    expect(store.deliveries).toHaveLength(1);
    store.progress.push(learnedEvent(uid(1), jst("2026-11-25T07:59:00"), { eventType: "article_read", lessonId: null }));
    await runSendBatch(depsAt(store, mail, now));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "learned" });
  });

  it("送る直前にテスト用アカウントだと分かったら送らない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const mail = new FakeMail();
    const now = jstMorning("2026-11-25");
    await prepareCampaign(depsAt(store, mail, now), campaign);
    store.emails.set(uid(1), `${TEST_PREFIX}@example.invalid`);
    await runSendBatch(depsAt(store, mail, now));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "test_account" });
  });

  it("スイッチを止めて何日もあとに戻しても、送る日を過ぎた行は送らない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const mail = new FakeMail();
    await prepareCampaign(depsAt(store, mail, jstMorning("2026-11-25")), campaign);
    store.kindModes.signup = "count";
    await runSendBatch(depsAt(store, mail, jstMorning("2026-11-25")));
    expect(store.deliveries[0].status).toBe("queued");
    store.kindModes.signup = "all";
    await runSendBatch(depsAt(store, mail, jstMorning("2026-12-05")));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "not_due" });
  });

  it("契約が終わった人には送らない（送る直前）", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const mail = new FakeMail();
    const now = jstMorning("2026-11-25");
    await prepareCampaign(depsAt(store, mail, now), campaign);
    store.members = [];
    await runSendBatch(depsAt(store, mail, now));
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "not_eligible" });
  });
});

describe("14日で最大3通", () => {
  function addStandingSent(store: MemStore, userId: string, n: number, at: Date) {
    for (let i = 0; i < n; i++) {
      const id = `other-${i}`;
      store.campaigns.set(id, standingCampaign({ id, label: `other ${i}`, standingKey: `other_${i}` as StandingKey }));
      store.deliveries.push({
        ...store.deliveries[0],
        id: `pre-${userId}-${i}`,
        campaignId: id,
        userId,
        kind: "signup",
        category: "signup",
        audience: "all",
        contentVersion: 1,
        status: "sent",
        attempts: 1,
        reason: null,
        nextAttemptAt: new Date(0),
        claimToken: null,
        lockedUntil: null,
        resendEmailId: null,
        sendingAt: at,
        sentAt: at,
        updatedAt: at,
        openCount: 0,
        clickCount: 0,
      });
    }
  }

  it("14日以内に常設の文面を3通受け取った人には、選ぶときも送る直前も止まる", async () => {
    const day = "2026-11-23T10:00:00";
    const { store, campaign } = seedStanding({ 1: day, 2: day });
    addStandingSent(store, uid(1), STANDING_CAP_MAX, jst("2026-11-20T09:00:00"));
    addStandingSent(store, uid(2), STANDING_CAP_MAX - 1, jst("2026-11-20T09:00:00"));
    const mail = new FakeMail();
    const now = jstMorning("2026-11-25");
    const r = await prepareCampaign(depsAt(store, mail, now), store.campaigns.get(campaign.id)!);
    expect(r).toMatchObject({ outcome: "enqueued", inserted: 1, count: { excluded: { standing_cap: 1 } } });
    // 書き出したあとに上限に達した（別の常設の文面がもう1通届いた）
    addStandingSent(store, uid(2), STANDING_CAP_MAX, jst("2026-11-24T09:00:00"));
    await runSendBatch(depsAt(store, mail, now));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries.find((d) => d.campaignId === campaign.id)).toMatchObject({
      status: "skipped",
      reason: "standing_cap",
    });
  });

  it("14日より前の分は数えない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    addStandingSent(store, uid(1), STANDING_CAP_MAX, jst("2026-11-01T09:00:00"));
    const mail = new FakeMail();
    await prepareCampaign(depsAt(store, mail, jstMorning("2026-11-25")), store.campaigns.get(campaign.id)!);
    await runSendBatch(depsAt(store, mail, jstMorning("2026-11-25")));
    expect(mail.sent).toHaveLength(1);
  });
});

describe("スイッチ・安全策", () => {
  it("人数だけ出す: 人数を出し、送らない。同じ日に何度実行しても数えるのは1回", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00", 2: "2026-11-23T10:00:00" });
    store.kindModes.signup = "count";
    store.progress.push(learnedEvent(uid(2), jst("2026-11-24T10:00:00")));
    const mail = new FakeMail();
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    const first = await morningRun(store, mail, jstMorning("2026-11-25"), alerts);
    expect(first.results[0]).toMatchObject({ outcome: "counted", count: { willSend: 1, excluded: { learned: 1 } } });
    const second = await morningRun(store, mail, new Date(jstMorning("2026-11-25").getTime() + 3600_000), alerts);
    expect(second.results[0]).toEqual({ outcome: "already_counted" });
    expect(alerts.filter((a) => a.title.startsWith("人数だけ出しました"))).toHaveLength(1);
    expect(JSON.stringify(alerts)).not.toContain(uid(1));
    expect(store.deliveries).toHaveLength(0);
    expect(mail.sent).toHaveLength(0);
  });

  it("オーナーだけ: 条件に関係なくオーナーに版ごとに1通。全員分は書き出さない", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.kindModes.signup = "owner";
    store.settings.ownerUserIds = [uid(9)];
    store.emails.set(uid(9), "owner9@example.invalid");
    const mail = new FakeMail();
    await morningRun(store, mail, jstMorning("2026-11-25"));
    await morningRun(store, mail, jstMorning("2026-11-26"));
    expect(mail.sent.map((m) => m.to)).toEqual(["owner9@example.invalid"]);
  });

  it("全員に送る: テスト用アカウントの設定が空なら書き出さない", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.testEmailPrefixes = [];
    const mail = new FakeMail();
    const { results } = await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(results[0]).toEqual({ outcome: "blocked", reason: "test_email_prefixes_unset" });
    expect(mail.sent).toHaveLength(0);
  });

  it("承認の印が無い文面は送らない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    store.campaigns.set(campaign.id, { ...campaign, approvedVersion: null });
    const mail = new FakeMail();
    const { results } = await morningRun(store, mail, jstMorning("2026-11-25"));
    expect(results[0]).toEqual({ outcome: "blocked", reason: "message_not_approved" });
    expect(mail.sent).toHaveLength(0);
  });

  it("「学んだ」の判定に使う Sanity が読めなければ、書き出さず・送らない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const mail = new FakeMail();
    const now = jstMorning("2026-11-25");
    const broken = { loadLessonIndex: async () => Promise.reject(new Error("sanity down")) };
    const { results } = await morningRun(store, mail, now, [], broken);
    expect(results[0]).toEqual({ outcome: "blocked", reason: "lesson_index_unavailable" });
    expect(store.deliveries).toHaveLength(0);
    // 書き出したあとに読めなくなったときも送らない
    await prepareCampaign(depsAt(store, mail, now), campaign);
    await runSendBatch(depsAt(store, mail, now, [], broken));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "queued", reason: "lesson_index_unavailable" });
  });

  it("週1回のメルマガの書き出しは今までどおりで、常設の文面は一緒に拾われない", async () => {
    const { store } = seedStanding({ 1: "2026-11-23T10:00:00" });
    const weekly = approvedCampaign({ id: "w-1", scheduledAt: jst("2026-11-24T08:00:00") });
    store.campaigns.set(weekly.id, weekly);
    const due = await store.listDueCampaigns(jstMorning("2026-11-25"));
    expect(due.map((c) => c.id)).toEqual(["w-1"]);
  });

  it("常設の文面だけを送る実行では、週1回のメルマガの行は送らない", async () => {
    const { store, campaign } = seedStanding({ 1: "2026-11-23T10:00:00", 2: "2026-01-01T10:00:00" });
    const weekly = approvedCampaign({ id: "w-1" });
    store.campaigns.set(weekly.id, weekly);
    const mail = new FakeMail();
    const now = jstMorning("2026-11-25");
    await prepareCampaign(depsAt(store, mail, now), weekly);
    await prepareCampaign(depsAt(store, mail, now), campaign);
    await runSendBatch(depsAt(store, mail, now), { campaignIds: [campaign.id] });
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].subject).toBe(ONBOARDING_DAY2_COPY.subject);
    expect(store.deliveries.filter((d) => d.campaignId === "w-1").every((d) => d.status === "queued")).toBe(true);
  });
});

describe("「学んだ」の数え方（分析側 engagement.py #274 の写し）", () => {
  const index = buildLessonIndex(
    [
      { lessonId: "L1", articleIds: ["A1", "A2", null] },
      { lessonId: "L2", articleIds: ["A2"] },
      { lessonId: ONBOARDING_LESSON, articleIds: ["OB1", "A1"] },
      { lessonId: "drafts.L3", articleIds: ["drafts.A3"] },
    ],
    [{ articleId: "A4", lessonId: "L1" }],
  );
  const ev = (over: Partial<ProgressEvent>): ProgressEvent => ({
    userId: uid(1),
    eventType: "article_complete",
    articleId: "A1",
    lessonId: "L1",
    occurredAt: new Date(),
    percent: null,
    ...over,
  });

  it("進めた系の種類だけ。開いただけ（article_view）は入らない", () => {
    expect(isLearningEvent(ev({ eventType: "article_read" }), index)).toBe(true);
    expect(isLearningEvent(ev({ eventType: "video_complete" }), index)).toBe(true);
    expect(isLearningEvent(ev({ eventType: "article_view" }), index)).toBe(false);
  });
  it("動画は75%以上だけ。読めない%は入らない", () => {
    expect(isLearningEvent(ev({ eventType: "video_progress", percent: "75" }), index)).toBe(true);
    expect(isLearningEvent(ev({ eventType: "video_progress", percent: "74.9" }), index)).toBe(false);
    expect(isLearningEvent(ev({ eventType: "video_progress", percent: "abc" }), index)).toBe(false);
    expect(isLearningEvent(ev({ eventType: "video_progress", percent: null }), index)).toBe(false);
  });
  it("記録のレッスンが学習用でない（はじめかた）なら、記事が学習用レッスンにあっても入らない", () => {
    expect(isLearningEvent(ev({ lessonId: ONBOARDING_LESSON, articleId: "A1" }), index)).toBe(false);
  });
  it("記録のレッスンが学習用なら、そのレッスンの記事だけ", () => {
    expect(isLearningEvent(ev({ lessonId: "L1", articleId: "A2" }), index)).toBe(true);
    expect(isLearningEvent(ev({ lessonId: "L2", articleId: "A1" }), index)).toBe(false);
  });
  it("記録のレッスンが無いときは、記事を含む学習用レッスンがあれば入る（2つ以上でも）", () => {
    expect(isLearningEvent(ev({ lessonId: null, articleId: "A2" }), index)).toBe(true);
    expect(isLearningEvent(ev({ lessonId: null, articleId: "OB1" }), index)).toBe(false);
    expect(isLearningEvent(ev({ lessonId: null, articleId: "STANDALONE" }), index)).toBe(false);
    expect(isLearningEvent(ev({ lessonId: null, articleId: null }), index)).toBe(false);
  });
  it("記事側から quest→lesson でつながる記事・下書きの ID も数える", () => {
    expect(isLearningEvent(ev({ lessonId: null, articleId: "A4" }), index)).toBe(true);
    expect(isLearningEvent(ev({ lessonId: "drafts.L3", articleId: "A3" }), index)).toBe(true);
  });
  it("テスト用の索引（helpers）も同じ判定になる", () => {
    const i = testLessonIndex();
    expect(isLearningEvent(ev({ lessonId: LEARNING_LESSON, articleId: LEARNING_ARTICLE }), i)).toBe(true);
    expect(isLearningEvent(ev({ lessonId: ONBOARDING_LESSON, articleId: ONBOARDING_ARTICLE }), i)).toBe(false);
  });
});

describe("配信停止トークン（v2: カテゴリを URL に出さない）", () => {
  it("新しいトークンにカテゴリ名が出ない。検証でき、カテゴリは持たない", () => {
    const t = createUnsubscribeToken(SECRET, uid(1));
    expect(t.startsWith("v2.")).toBe(true);
    for (const c of MAIL_CATEGORIES) expect(t).not.toContain(c);
    expect(verifyUnsubscribeToken(SECRET, t)).toEqual({ userId: uid(1), category: null });
  });

  it("書き換え・別の鍵・形の混在は通らない", () => {
    const t = createUnsubscribeToken(SECRET, uid(1));
    expect(verifyUnsubscribeToken(SECRET, t.replace(uid(1), uid(2)))).toBeNull();
    expect(verifyUnsubscribeToken(`${SECRET}x`, t)).toBeNull();
    // v2 の署名を v1 の形に入れても通らない（署名の対象が違う）
    const sig = t.split(".")[2];
    expect(verifyUnsubscribeToken(SECRET, `v1.${uid(1)}.notice.${sig}`)).toBeNull();
    expect(verifyUnsubscribeToken(SECRET, `v2.${uid(1)}.notice.${sig}`)).toBeNull();
  });

  it("古いトークン（v1・カテゴリ入り）も通り続ける", () => {
    for (const c of MAIL_CATEGORIES) {
      const old = createLegacyUnsubscribeTokenV1(SECRET, uid(1), c);
      expect(verifyUnsubscribeToken(SECRET, old)).toEqual({ userId: uid(1), category: c });
    }
  });

  it("新しいトークンで止めると全カテゴリが止まる", async () => {
    const store = new MemStore();
    expect(await unsubscribeByToken(store, SECRET, createUnsubscribeToken(SECRET, uid(1)), "one_click", new Date())).toBe(
      "stopped",
    );
    expect(await store.listStoppedCategories(uid(1))).toEqual([...MAIL_CATEGORIES]);
  });
});

describe("リンクの印（?from=）", () => {
  it("新しい印はすべて記録側（parseEmailFrom）を通る", () => {
    for (const from of [...Object.values(FROM_OF_KIND), ...Object.values(FROM_OF_STANDING)]) {
      expect(parseEmailFrom(from)).toBe(from);
    }
  });

  it("印どうしが重ならない（分析で区別できる）", () => {
    const all = [...Object.values(FROM_OF_KIND), ...Object.values(FROM_OF_STANDING)];
    expect(new Set(all).size).toBe(all.length);
  });

  it("どの種類のメールでも、本文・リンク・ヘッダーに種類やカテゴリの名前が出ない", () => {
    // weekly（週1回のメルマガ）は全員に送るお知らせなので、email_weekly のままにしている
    const hidden = ["comeback", "renewal", "signup", "winback", "notice", "onboarding", "standing"];
    const campaigns: Campaign[] = [
      ...MAIL_KINDS.map((kind) =>
        approvedCampaign({ kind, body: "[見る](https://www.bo-no.design/lessons/a)\n\n[外](https://example.invalid/b)" }),
      ),
      standingCampaign(),
    ];
    for (const c of campaigns) {
      const token = createUnsubscribeToken(SECRET, uid(1));
      const r = renderMail(c, { siteUrl: SITE, unsubscribeUrl: unsubscribePageUrl(SITE, token) });
      const headers = unsubscribeHeaders(oneClickUrl(SITE, token));
      const visible = `${r.subject}\n${r.html}\n${r.text}\n${JSON.stringify(headers)}`.toLowerCase();
      for (const word of hidden) expect(visible, `${c.kind}/${c.standingKey}: ${word}`).not.toContain(word);
    }
  });

  it("はじめの案内: BONO のリンクにだけ印（email_pt）が付き、予約サイトには付かない", () => {
    const r = renderMail(standingCampaign(), { siteUrl: SITE, unsubscribeUrl: `${SITE}/u` });
    expect(r.html).toContain("https://www.bo-no.design/how-to/community?from=email_pt");
    expect(r.html).toContain('href="https://cal.com/takumikai/30min"');
    // 常設の文面は課金した会員に送るので、末尾の一文は「会員の方」（signup の種類の「ご登録いただいた方」にしない）
    expect(r.text).toContain("このメールは、BONOの会員の方にお送りしています。");
    expect(r.text).not.toContain("ご登録いただいた方");
    expect(r.html).toContain("このメールは、BONOの会員の方にお送りしています。");
  });
});

describe("はじめの案内の文面", () => {
  it("決定版の文面は送れる形（承認すれば送れる。仮の文字・https 以外のリンクが無い）", () => {
    expect(getCampaignBlockReason(standingCampaign())).toBeNull();
  });

  it("登録用の SQL の本文・件名・プレヘッダーが、コードの写しと一致する", () => {
    const sql = readFileSync(path.resolve(__dirname, "../../../../scripts/member-mail/register-onboarding-day2.sql"), "utf8");
    const body = sql.split("$body$")[1];
    expect(body).toBe(ONBOARDING_DAY2_COPY.body);
    expect(sql).toContain(`'${ONBOARDING_DAY2_COPY.subject}'`);
    expect(sql).toContain(`'${ONBOARDING_DAY2_COPY.preheader}'`);
    expect(sql).toContain(`'${ONBOARDING_DAY2_COPY.label}'`);
    expect(sql).toContain("'onboarding_day2'");
    expect(sql).toMatch(/'signup',/);
  });
});
