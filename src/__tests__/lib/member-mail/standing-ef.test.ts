// @vitest-environment node
// 会員メールの常設の文面 327-E（入会5日後の「続きをデザインしよう」）・327-F（入会9日後の30分相談の案内）をインメモリで確かめる。
// 327-D（はじめの案内）の動きが変わらないことは standing.test.ts（変更なし）が見る。ここでは3つを並べたときの動きも見る。
// アドレスは example.invalid、テスト用アカウントの頭は架空の値だけを使う。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
vi.mock("server-only", () => ({}));
import { getCampaignBlockReason, renderMail, unsubscribeHeaders } from "@/lib/member-mail/content";
import { jstDaysBetween } from "@/lib/member-mail/dates";
import { campaignModeOf, prepareCampaign, runSendBatch } from "@/lib/member-mail/process";
import { ONBOARDING_DAY2_COPY, ONBOARDING_DAY5_COPY, ONBOARDING_DAY9_COPY } from "@/lib/member-mail/standing-copy";
import {
  ONBOARDING_DAY2_TARGET,
  ONBOARDING_DAY5_TARGET,
  ONBOARDING_DAY9_TARGET,
  STANDING_CAP_MAX,
  STANDING_MIN_GAP_DAYS,
  STANDING_TARGETS,
  isStandingDue,
  learningExclusionReason,
  type StandingTargetDefinition,
} from "@/lib/member-mail/targets";
import { FROM_OF_STANDING, STANDING_KEYS, type Campaign, type ProgressEvent, type StandingKey } from "@/lib/member-mail/types";
import { mapStandingMode } from "@/lib/member-mail/store";
import { createUnsubscribeToken, oneClickUrl, unsubscribePageUrl } from "@/lib/member-mail/unsubscribe-token";
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

function jst(dateTime: string): Date {
  return new Date(`${dateTime}+09:00`);
}
function jstMorning(day: string): Date {
  return jst(`${day}T08:00:00`);
}
/** 2026-11-20 を入会日とした n 日目の日付（JST） */
function dayOf(n: number): string {
  const d = new Date(Date.UTC(2026, 10, 20 + n));
  return d.toISOString().slice(0, 10);
}

const ACTIVATED = jst("2026-11-01T12:00:00");
const TEST_PREFIX = "qa-fixture";
const JOIN = jst("2026-11-20T10:00:00");

const COPY_OF: Record<StandingKey, { label: string; subject: string; preheader: string; body: string }> = {
  onboarding_day2: ONBOARDING_DAY2_COPY,
  onboarding_day5: ONBOARDING_DAY5_COPY,
  onboarding_day9: ONBOARDING_DAY9_COPY,
};

function standingCampaign(key: StandingKey, over: Partial<Campaign> = {}): Campaign {
  const copy = COPY_OF[key];
  return approvedCampaign({
    id: `s-${key}`,
    kind: "signup",
    label: copy.label,
    subject: copy.subject,
    preheader: copy.preheader,
    body: copy.body,
    standingKey: key,
    scheduledAt: ACTIVATED,
    // 文面ごとのスイッチは全員に上げた状態（スイッチ自体の動きは「文面ごとのスイッチ」の describe で見る）
    standingMode: "all",
    ...over,
  });
}

/** 3つの常設の文面を登録し、最初の課金日時（JST）ごとに会員を入れる */
function seed(joins: Record<number, string>, keys: readonly StandingKey[] = STANDING_KEYS) {
  const store = new MemStore();
  store.kindModes.signup = "all";
  store.testEmailPrefixes = [TEST_PREFIX];
  for (const key of keys) {
    const c = standingCampaign(key);
    store.campaigns.set(c.id, c);
  }
  for (const [n, at] of Object.entries(joins)) {
    const i = Number(n);
    store.members.push(member(i, { createdAt: new Date("2025-06-01T00:00:00Z") }));
    store.contracts.push({ subscriptionId: `sub_test_${i}`, start: jst(at) });
    store.emails.set(uid(i), `member${i}@example.invalid`);
  }
  return store;
}

function depsAt(store: MemStore, mail: FakeMail, now: Date) {
  return makeDeps(store, mail, [], { now: () => now });
}

/** 毎朝の実行（常設の文面を選ぶ → 送る） */
async function morningRun(store: MemStore, mail: FakeMail, now: Date) {
  const deps = depsAt(store, mail, now);
  const results = [];
  for (const c of await store.listStandingCampaigns(now)) results.push(await prepareCampaign(deps, c));
  await runSendBatch(deps);
  return results;
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

function reasonAt(def: StandingTargetDefinition, events: ProgressEvent[], now: Date): string | null {
  return learningExclusionReason(def.learning, uid(1), events, testLessonIndex(), JOIN, now);
}

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  const all = JSON.stringify([...logSpy.mock.calls, ...errSpy.mock.calls]);
  expect(all).not.toContain("@example.invalid");
  expect(all).not.toContain(TEST_PREFIX);
  vi.restoreAllMocks();
});

describe("送る日（日本時間の日付で数える）", () => {
  function dueDays(def: StandingTargetDefinition, joinedAt: Date): number[] {
    const out: number[] = [];
    for (let n = 0; n <= 16; n++) {
      if (isStandingDue(def, joinedAt, ACTIVATED, jstMorning(dayOf(n)))) out.push(n);
    }
    return out;
  }

  it("327-D は2〜3日目、327-E は5〜6日目、327-F は9〜11日目の朝だけ", () => {
    expect(dueDays(ONBOARDING_DAY2_TARGET, JOIN)).toEqual([2, 3]);
    expect(dueDays(ONBOARDING_DAY5_TARGET, JOIN)).toEqual([5, 6]);
    expect(dueDays(ONBOARDING_DAY9_TARGET, JOIN)).toEqual([9, 10, 11]);
  });

  it("23:59 入会はその日が0日目、翌日 0:00 入会は翌日が0日目", () => {
    const late = jst("2026-11-20T23:59:00");
    const early = jst("2026-11-21T00:00:00");
    expect(jstDaysBetween(late, jstMorning(dayOf(5)))).toBe(5);
    expect(jstDaysBetween(early, jstMorning(dayOf(5)))).toBe(4);
    expect(dueDays(ONBOARDING_DAY5_TARGET, late)).toEqual([5, 6]);
    expect(dueDays(ONBOARDING_DAY5_TARGET, early)).toEqual([6, 7]);
    expect(dueDays(ONBOARDING_DAY9_TARGET, late)).toEqual([9, 10, 11]);
    expect(dueDays(ONBOARDING_DAY9_TARGET, early)).toEqual([10, 11, 12]);
  });

  it("有効にした時刻より前の入会者にはさかのぼらない", () => {
    expect(isStandingDue(ONBOARDING_DAY5_TARGET, JOIN, jst("2026-11-20T10:00:01"), jstMorning(dayOf(5)))).toBe(false);
    expect(isStandingDue(ONBOARDING_DAY9_TARGET, JOIN, null, jstMorning(dayOf(9)))).toBe(false);
  });
});

describe("常設の文面どうしの間あけ（日本時間の日付で2日以上）", () => {
  it("送る日の範囲が重ならず、前の範囲の最後の日と次の範囲の最初の日が2日以上あく（コードの守りは足さない）", () => {
    const defs = Object.values(STANDING_TARGETS).sort((a, b) => a.sendOnDay - b.sendOnDay);
    for (let i = 1; i < defs.length; i++) {
      const prevLast = defs[i - 1].sendOnDay + defs[i - 1].catchUpDays;
      expect(defs[i].sendOnDay - prevLast, `${defs[i - 1].key} → ${defs[i].key}`).toBeGreaterThanOrEqual(STANDING_MIN_GAP_DAYS);
    }
  });

  it("3通とも上限（14日で3通）に収まる", () => {
    expect(Object.keys(STANDING_TARGETS).length).toBeLessThanOrEqual(STANDING_CAP_MAX);
  });
});

describe("327-E の学習の決まり（入会してから学んだ・直近3日は学んでいない）", () => {
  const day5 = jstMorning(dayOf(5)); // 直近 = 2日目（11/22）の0時から
  const day6 = jstMorning(dayOf(6)); // 直近 = 3日目（11/23）の0時から

  it("一度も学んでいない人は外す（not_learned）", () => {
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [], day5)).toBe("not_learned");
  });

  it("入会日より前の学習だけなら、学んだに入らない（not_learned）。入会日の0時からは入る", () => {
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(1), jst("2026-11-19T23:59:59"))], day5)).toBe("not_learned");
    // 入会時刻（10:00）より前でも、入会日の0時以降なら数える（327-D と同じ日単位）
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(1), jst("2026-11-20T00:00:00"))], day5)).toBeNull();
  });

  it("直近の区切りは「今日の0時の3日前」。その1秒前の学習は届く、ちょうどの学習は外す", () => {
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(1), jst("2026-11-21T23:59:59"))], day5)).toBeNull();
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(1), jst("2026-11-22T00:00:00"))], day5)).toBe(
      "learned_recently",
    );
    // 当日の朝に学んだ人も外す
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(1), jst("2026-11-25T07:59:00"))], day5)).toBe(
      "learned_recently",
    );
  });

  it("6日目の朝は区切りが1日進む（2日目に学んだ人は6日目に届く）", () => {
    const e = [learnedEvent(uid(1), jst("2026-11-22T12:00:00"))];
    expect(reasonAt(ONBOARDING_DAY5_TARGET, e, day5)).toBe("learned_recently");
    expect(reasonAt(ONBOARDING_DAY5_TARGET, e, day6)).toBeNull();
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(1), jst("2026-11-23T00:00:00"))], day6)).toBe(
      "learned_recently",
    );
  });

  it("学習用でない記事（はじめかた）・動画75%未満は学んだに入らない", () => {
    const onboarding = learnedEvent(uid(1), jst("2026-11-21T10:00:00"), {
      articleId: ONBOARDING_ARTICLE,
      lessonId: ONBOARDING_LESSON,
    });
    const shortVideo = learnedEvent(uid(1), jst("2026-11-21T10:00:00"), { eventType: "video_progress", percent: "50" });
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [onboarding, shortVideo], day5)).toBe("not_learned");
    // 直近の学習がはじめかただけなら、直近に学んだに入らない
    const early = learnedEvent(uid(1), jst("2026-11-21T10:00:00"));
    const recentOnboarding = { ...onboarding, occurredAt: jst("2026-11-24T10:00:00") };
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [early, recentOnboarding], day5)).toBeNull();
  });

  it("ほかの人の学習は見ない", () => {
    expect(reasonAt(ONBOARDING_DAY5_TARGET, [learnedEvent(uid(2), jst("2026-11-21T10:00:00"))], day5)).toBe("not_learned");
  });
});

describe("327-F の学習の決まり（入会7日目の0時から学んでいない）", () => {
  const day9 = jstMorning(dayOf(9));

  it("一度も学んでいない人に届く", () => {
    expect(reasonAt(ONBOARDING_DAY9_TARGET, [], day9)).toBeNull();
  });

  it("最初の1週間（0〜6日目）に学んだかは見ない", () => {
    expect(reasonAt(ONBOARDING_DAY9_TARGET, [learnedEvent(uid(1), jst("2026-11-21T10:00:00"))], day9)).toBeNull();
    expect(reasonAt(ONBOARDING_DAY9_TARGET, [learnedEvent(uid(1), jst("2026-11-26T23:59:59"))], day9)).toBeNull();
  });

  it("7日目の0時ちょうど以降に学んだ人は外す（learned）", () => {
    expect(reasonAt(ONBOARDING_DAY9_TARGET, [learnedEvent(uid(1), jst("2026-11-27T00:00:00"))], day9)).toBe("learned");
    expect(reasonAt(ONBOARDING_DAY9_TARGET, [learnedEvent(uid(1), jst("2026-11-29T07:59:00"))], day9)).toBe("learned");
  });

  it("7日目は入会日の0時（日本時間）から数える（23:59 入会でも翌日 0:00 入会でもずれない）", () => {
    const late = jst("2026-11-20T23:59:00");
    const e = [learnedEvent(uid(1), jst("2026-11-26T23:59:59"))];
    expect(learningExclusionReason(ONBOARDING_DAY9_TARGET.learning, uid(1), e, testLessonIndex(), late, day9)).toBeNull();
    const nextDay = jst("2026-11-21T00:00:00");
    // 11/21 入会の7日目は 11/28 0:00 から。11/27 の学習は見ない
    const e2 = [learnedEvent(uid(1), jst("2026-11-27T12:00:00"))];
    expect(
      learningExclusionReason(ONBOARDING_DAY9_TARGET.learning, uid(1), e2, testLessonIndex(), nextDay, jstMorning(dayOf(10))),
    ).toBeNull();
  });
});

describe("327-D の決まりは変えない", () => {
  it("2日後の朝・取りこぼし1日・入会してから学んだら外す（理由 learned）", () => {
    expect(ONBOARDING_DAY2_TARGET).toMatchObject({ key: "onboarding_day2", kind: "signup", sendOnDay: 2, catchUpDays: 1 });
    const now = jstMorning(dayOf(2));
    expect(reasonAt(ONBOARDING_DAY2_TARGET, [], now)).toBeNull();
    expect(reasonAt(ONBOARDING_DAY2_TARGET, [learnedEvent(uid(1), jst("2026-11-20T00:00:00"))], now)).toBe("learned");
    expect(reasonAt(ONBOARDING_DAY2_TARGET, [learnedEvent(uid(1), jst("2026-11-19T23:59:59"))], now)).toBeNull();
  });
});

describe("3つを並べて毎朝実行する（0〜14日目）", () => {
  /**
   * 送ったメールを「誰に・何日目に・どの文面」で並べる。
   * 学習の記録は、その朝までに起きた分だけを見せる（本番の DB に未来の記録は無いため）
   */
  async function simulate(store: MemStore) {
    const mail = new FakeMail();
    const log: { user: string; day: number; subject: string }[] = [];
    const emailToUser = new Map([...store.emails].map(([u, e]) => [e, u]));
    const allEvents = [...store.progress];
    for (let n = 0; n <= 14; n++) {
      const before = mail.sent.length;
      const now = jstMorning(dayOf(n));
      store.progress = allEvents.filter((e) => e.occurredAt <= now);
      await morningRun(store, mail, now);
      for (const m of mail.sent.slice(before)) log.push({ user: emailToUser.get(m.to)!, day: n, subject: m.subject });
    }
    return log;
  }
  const subjectsOf = (log: { user: string; subject: string }[], user: string) =>
    log.filter((l) => l.user === user).map((l) => l.subject);

  it("学習のしかたごとに、届く文面が決まりどおりになる。1人に同じ文面は1回だけ", async () => {
    const store = seed({ 1: "2026-11-20T10:00:00", 2: "2026-11-20T10:00:00", 3: "2026-11-20T10:00:00", 4: "2026-11-20T10:00:00" });
    // 1: 一度も学ばない → 2日後・9日後
    // 2: 1日目に学んで、そのあと学ばない → 5日後・9日後
    store.progress.push(learnedEvent(uid(2), jst("2026-11-21T20:00:00")));
    // 3: 2日目の夜（はじめの案内のあと）に学んで、そのあと学ばない → 2日後・6日目に 327-E・9日後の3通
    store.progress.push(learnedEvent(uid(3), jst("2026-11-22T20:00:00")));
    // 4: 毎日学ぶ → どれも届かない
    for (let n = 0; n <= 14; n++) store.progress.push(learnedEvent(uid(4), jst(`${dayOf(n)}T07:00:00`)));

    const log = await simulate(store);
    expect(subjectsOf(log, uid(1))).toEqual([ONBOARDING_DAY2_COPY.subject, ONBOARDING_DAY9_COPY.subject]);
    expect(subjectsOf(log, uid(2))).toEqual([ONBOARDING_DAY5_COPY.subject, ONBOARDING_DAY9_COPY.subject]);
    expect(subjectsOf(log, uid(3))).toEqual([
      ONBOARDING_DAY2_COPY.subject,
      ONBOARDING_DAY5_COPY.subject,
      ONBOARDING_DAY9_COPY.subject,
    ]);
    expect(subjectsOf(log, uid(4))).toEqual([]);
    expect(log.filter((l) => l.user === uid(3)).map((l) => l.day)).toEqual([2, 6, 9]);
    expect(log.filter((l) => l.user === uid(1)).map((l) => l.day)).toEqual([2, 9]);
    expect(log.filter((l) => l.user === uid(2)).map((l) => l.day)).toEqual([5, 9]);
  });

  it("入会日・学習のしかたをどう変えても、1人に届く常設の文面どうしは日本時間で2日以上あく・3通まで", async () => {
    const joins: Record<number, string> = {};
    let i = 1;
    const patterns: number[][] = [];
    for (const time of ["00:00:00", "10:00:00", "23:59:00"]) {
      // 学ぶ日の組み合わせ（0〜12日目のうち、いくつか）
      for (const days of [[], [0], [1], [2], [3], [4], [2, 3], [6], [7], [8], [1, 7], [3, 4, 5], [0, 6, 10]]) {
        joins[i] = `2026-11-20T${time}`;
        patterns[i] = days;
        i++;
      }
    }
    const store = seed(joins);
    for (let n = 1; n < i; n++) {
      for (const d of patterns[n]) store.progress.push(learnedEvent(uid(n), jst(`${dayOf(d)}T20:00:00`)));
    }
    const log = await simulate(store);
    for (let n = 1; n < i; n++) {
      const days = log.filter((l) => l.user === uid(n)).map((l) => l.day);
      expect(days.length).toBeLessThanOrEqual(STANDING_CAP_MAX);
      expect(new Set(log.filter((l) => l.user === uid(n)).map((l) => l.subject)).size).toBe(days.length);
      for (let k = 1; k < days.length; k++) expect(days[k] - days[k - 1]).toBeGreaterThanOrEqual(STANDING_MIN_GAP_DAYS);
    }
    expect(log.length).toBeGreaterThan(0);
  });

  it("人数だけ出すと、327-E の外した理由が分かれて出る", async () => {
    const store = seed({ 1: "2026-11-20T10:00:00", 2: "2026-11-20T10:00:00", 3: "2026-11-20T10:00:00" }, [
      "onboarding_day5",
    ]);
    store.kindModes.signup = "count";
    store.progress.push(learnedEvent(uid(2), jst("2026-11-21T10:00:00")));
    store.progress.push(learnedEvent(uid(3), jst("2026-11-24T10:00:00")));
    const results = await morningRun(store, new FakeMail(), jstMorning(dayOf(5)));
    expect(results[0]).toMatchObject({
      outcome: "counted",
      count: { candidates: 3, willSend: 1, excluded: { not_learned: 1, learned_recently: 1 } },
    });
  });
});

describe("送る直前の見直し（文面ごとの学習の決まり）", () => {
  it("327-E: 書き出したあとに学んだら送らない（learned_recently）", async () => {
    const store = seed({ 1: "2026-11-20T10:00:00" }, ["onboarding_day5"]);
    store.progress.push(learnedEvent(uid(1), jst("2026-11-21T10:00:00")));
    const mail = new FakeMail();
    const now = jstMorning(dayOf(5));
    const deps = depsAt(store, mail, now);
    const r = await prepareCampaign(deps, store.campaigns.get("s-onboarding_day5")!);
    expect(r).toMatchObject({ outcome: "enqueued", inserted: 1 });
    store.progress.push(learnedEvent(uid(1), jst("2026-11-25T07:59:00")));
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "learned_recently" });
  });

  it("327-F: 書き出したあとに学んだら送らない（learned）", async () => {
    const store = seed({ 1: "2026-11-20T10:00:00" }, ["onboarding_day9"]);
    const mail = new FakeMail();
    const now = jstMorning(dayOf(9));
    const deps = depsAt(store, mail, now);
    await prepareCampaign(deps, store.campaigns.get("s-onboarding_day9")!);
    store.progress.push(learnedEvent(uid(1), jst("2026-11-29T07:59:00")));
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "learned" });
  });

  it("327-E: 送る日の範囲（5〜6日目）を過ぎた行は送らない", async () => {
    const store = seed({ 1: "2026-11-20T10:00:00" }, ["onboarding_day5"]);
    store.progress.push(learnedEvent(uid(1), jst("2026-11-21T10:00:00")));
    const mail = new FakeMail();
    await prepareCampaign(depsAt(store, mail, jstMorning(dayOf(6))), store.campaigns.get("s-onboarding_day5")!);
    await runSendBatch(depsAt(store, mail, jstMorning(dayOf(7))));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "not_due" });
  });

  it("書き出したあとに14日の上限に達したら送らない（standing_cap）", async () => {
    const store = seed({ 1: "2026-11-20T10:00:00" }, ["onboarding_day9"]);
    const mail = new FakeMail();
    const now = jstMorning(dayOf(9));
    await prepareCampaign(depsAt(store, mail, now), store.campaigns.get("s-onboarding_day9")!);
    const base = store.deliveries[0];
    for (let k = 0; k < STANDING_CAP_MAX; k++) {
      const id = `other-${k}`;
      store.campaigns.set(id, standingCampaign("onboarding_day2", { id, standingKey: `other_${k}` as StandingKey }));
      store.deliveries.push({
        ...base,
        id: `pre-${k}`,
        campaignId: id,
        status: "sent",
        sendingAt: jst("2026-11-25T09:00:00"),
        sentAt: jst("2026-11-25T09:00:00"),
      });
    }
    await runSendBatch(depsAt(store, mail, now));
    expect(mail.sent).toHaveLength(0);
    expect(store.deliveries[0]).toMatchObject({ status: "skipped", reason: "standing_cap" });
  });
});

describe("327-E・327-F の文面", () => {
  // 行動を見ていると受け取れる言葉（オーナーの決まり: 「来ていませんね」と書かない）
  const BANNED = [
    "来ていません",
    "止まって",
    "止まっている",
    "しばらく",
    "学んでいない",
    "学んでいません",
    "久しぶり",
    "離れて",
    "見ていない",
    "進んでいない",
    "ボタン",
  ];

  for (const [key, copy] of [
    ["onboarding_day5", ONBOARDING_DAY5_COPY],
    ["onboarding_day9", ONBOARDING_DAY9_COPY],
  ] as const) {
    it(`${key}: 行動を見ていると受け取れる言葉・「ボタン」を使わない`, () => {
      const all = `${copy.subject}\n${copy.preheader}\n${copy.body}`;
      for (const word of BANNED) expect(all, word).not.toContain(word);
    });

    it(`${key}: お便りの調子（カイクンから始まり「BONO　カイクン」で終わる）・リンクは「下のリンクから」`, () => {
      expect(copy.body.startsWith("カイクンです。")).toBe(true);
      expect(copy.body.endsWith("BONO　カイクン")).toBe(true);
      expect(copy.body).toContain("下のリンクから");
    });

    it(`${key}: 送れる形（承認すれば送れる）`, () => {
      expect(getCampaignBlockReason(standingCampaign(key))).toBeNull();
    });

    it(`${key}: 登録用の SQL の本文・件名・プレヘッダーが、コードの写しと一致する`, () => {
      const file = `register-onboarding-${key.replace("onboarding_", "")}.sql`;
      const sql = readFileSync(path.resolve(__dirname, "../../../../scripts/member-mail", file), "utf8");
      expect(sql.split("$body$")[1]).toBe(copy.body);
      expect(sql).toContain(`'${copy.subject}'`);
      expect(sql).toContain(`'${copy.preheader}'`);
      expect(sql).toContain(`'${copy.label}'`);
      expect(sql).toContain(`'${key}',\n  NULL\n)\nON CONFLICT DO NOTHING;`);
      expect(sql).toMatch(/'signup',/);
      // 承認・有効化はしない（INSERT だけ）
      const statements = sql.replace(/^--.*$/gm, "");
      expect(statements).not.toMatch(/\bUPDATE\b|member_mail_approve_campaign/);
    });

    it(`${key}: 本文・リンク・ヘッダーに種類やカテゴリの名前が出ない`, () => {
      const hidden = ["comeback", "renewal", "signup", "winback", "notice", "onboarding", "standing"];
      const token = createUnsubscribeToken(SECRET, uid(1));
      const r = renderMail(standingCampaign(key), { siteUrl: SITE, unsubscribeUrl: unsubscribePageUrl(SITE, token) });
      const visible = `${r.subject}\n${r.html}\n${r.text}\n${JSON.stringify(unsubscribeHeaders(oneClickUrl(SITE, token)))}`;
      for (const word of hidden) expect(visible.toLowerCase(), word).not.toContain(word);
      expect(r.text).toContain("このメールは、BONOの会員の方にお送りしています。");
    });
  }

  it("327-E: おすすめの記事を出さない（BONO へのリンクはマイページだけ）。印は email_ps", () => {
    const links = [...ONBOARDING_DAY5_COPY.body.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
    expect(links).toEqual(["https://www.bo-no.design/mypage"]);
    const r = renderMail(standingCampaign("onboarding_day5"), { siteUrl: SITE, unsubscribeUrl: `${SITE}/u` });
    expect(r.html).toContain("https://www.bo-no.design/mypage?from=email_ps");
    expect(FROM_OF_STANDING.onboarding_day5).toBe("email_ps");
  });

  it("327-F: リンクは相談だけ。コミュニティ（327-D で案内済み）・イベントは出さない", () => {
    const body = ONBOARDING_DAY9_COPY.body;
    const links = [...body.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
    expect(links).toEqual(["https://cal.com/takumikai/30min"]);
    for (const word of ["/events", "community", "コミュニティ", "Slack"]) expect(body, word).not.toContain(word);
    const r = renderMail(standingCampaign("onboarding_day9"), { siteUrl: SITE, unsubscribeUrl: `${SITE}/u` });
    expect(r.html).toContain('href="https://cal.com/takumikai/30min"');
  });

  it("327-F は 327-D と別の手紙として読める（相談の例・見出し・段落が重ならない）", () => {
    const items = (body: string) => body.split("\n").filter((l) => l.startsWith("- ") || l.startsWith("## "));
    const day2 = new Set(items(ONBOARDING_DAY2_COPY.body));
    for (const line of items(ONBOARDING_DAY9_COPY.body)) expect(day2.has(line), line).toBe(false);
    // 予約のリンクの行だけは同じでよい
    const paras = (body: string) =>
      body.split("\n\n").filter((p) => p.length > 20 && !p.startsWith("BONO") && !p.startsWith("["));
    const day2Paras = new Set(paras(ONBOARDING_DAY2_COPY.body));
    for (const para of paras(ONBOARDING_DAY9_COPY.body)) expect(day2Paras.has(para), para).toBe(false);
  });

  it("登録用 SQL の手順: 文面ごとのスイッチで上げ下げし、327-E・F は 4. と 5. の前に 327-D の行を確かめる", () => {
    for (const d of ["day2", "day5", "day9"]) {
      const sql = readFileSync(path.resolve(__dirname, "../../../../scripts/member-mail", `register-onboarding-${d}.sql`), "utf8");
      expect(sql, d).toContain("SET standing_mode = 'owner' WHERE standing_key = 'onboarding_");
      expect(sql, d).toMatch(/BEGIN;\n--\s+UPDATE public\.member_mail_campaigns SET scheduled_at = now\(\), standing_mode = 'all'/);
      expect(sql, d).toContain("UPDATE public.member_mail_kind_settings SET mode = 'off' WHERE kind = 'signup';");
      expect(sql, d).toContain("3つともまとめて止まる");
      expect(sql, d).not.toContain("の弱いほう");
      if (d !== "day2") {
        expect(sql, d).toMatch(/SELECT standing_mode, scheduled_at[\s\S]*WHERE standing_key = 'onboarding_day2'/);
      }
    }
  });

  it("327-F は 327-D と件名・プレヘッダーが違う（両方受け取る人がいる）", () => {
    expect(ONBOARDING_DAY9_COPY.subject).not.toBe(ONBOARDING_DAY2_COPY.subject);
    expect(ONBOARDING_DAY9_COPY.preheader).not.toBe(ONBOARDING_DAY2_COPY.preheader);
  });
});

describe("文面ごとのスイッチ（standing_mode）", () => {
  const OWNER = 99;
  /** 327-D は全員に送っている（種類 signup = all）。2日目の人と5日目の人がいる朝 */
  function seedLive(day5Mode: Campaign["standingMode"]) {
    // 1: 11/23 入会 → 11/25 が2日目（327-D）／ 2: 11/20 入会・11/21 に学んだ → 11/25 が5日目（327-E）
    const store = seed({ 1: "2026-11-23T10:00:00", 2: "2026-11-20T10:00:00" }, ["onboarding_day2", "onboarding_day5"]);
    store.progress.push(learnedEvent(uid(2), jst("2026-11-21T10:00:00")));
    store.campaigns.get("s-onboarding_day2")!.standingMode = "all";
    store.campaigns.get("s-onboarding_day5")!.standingMode = day5Mode;
    store.settings.ownerUserIds = [uid(OWNER)];
    store.emails.set(uid(OWNER), "owner-check@example.invalid");
    return store;
  }
  const NOW = jstMorning("2026-11-25");
  const to = (mail: FakeMail) => mail.sent.map((m) => `${m.to}|${m.subject}`);

  it("327-D が全員に送っているあいだに、327-E だけ人数だけ出す（327-D は送り続ける）", async () => {
    const store = seedLive("count");
    const mail = new FakeMail();
    const results = await morningRun(store, mail, NOW);
    expect(results).toEqual([
      expect.objectContaining({ outcome: "enqueued", audience: "all", inserted: 1 }),
      expect.objectContaining({ outcome: "counted", count: expect.objectContaining({ willSend: 1 }) }),
    ]);
    expect(to(mail)).toEqual([`member1@example.invalid|${ONBOARDING_DAY2_COPY.subject}`]);
  });

  it("327-E だけオーナーに送る（327-D は会員に、327-E はオーナーにだけ届く）", async () => {
    const store = seedLive("owner");
    const mail = new FakeMail();
    await morningRun(store, mail, NOW);
    expect(to(mail).sort()).toEqual(
      [
        `member1@example.invalid|${ONBOARDING_DAY2_COPY.subject}`,
        `owner-check@example.invalid|${ONBOARDING_DAY5_COPY.subject}`,
      ].sort(),
    );
  });

  it("327-E を全員に上げると会員に届く", async () => {
    const store = seedLive("all");
    const mail = new FakeMail();
    await morningRun(store, mail, NOW);
    expect(to(mail).sort()).toEqual(
      [
        `member1@example.invalid|${ONBOARDING_DAY2_COPY.subject}`,
        `member2@example.invalid|${ONBOARDING_DAY5_COPY.subject}`,
      ].sort(),
    );
  });

  it("書き出したあとに 327-E だけ下げると、送る直前に止まる（327-D は送る）", async () => {
    for (const lowered of ["off", "count", "owner"] as const) {
      const store = seedLive("all");
      const mail = new FakeMail();
      const deps = depsAt(store, mail, NOW);
      for (const c of await store.listStandingCampaigns(NOW)) await prepareCampaign(deps, c);
      store.campaigns.get("s-onboarding_day5")!.standingMode = lowered;
      await runSendBatch(deps);
      expect(to(mail), lowered).toEqual([`member1@example.invalid|${ONBOARDING_DAY2_COPY.subject}`]);
      // 翌日（日本時間の0時）まで待たせる（毎回の実行で拾い直さない）
      expect(
        store.deliveries.find((d) => d.campaignId === "s-onboarding_day5"),
        lowered,
      ).toMatchObject({ status: "queued", reason: `mode_${lowered}`, nextAttemptAt: jst("2026-11-26T00:00:00") });
      // 同じ日にもう一度実行しても拾わない
      const claimed = vi.spyOn(store, "claim");
      await runSendBatch(deps);
      expect(claimed).not.toHaveBeenCalled();
    }
  });

  it("文面のスイッチで待たせた行は、送る日の範囲（5〜6日目）を過ぎたら送らずに終える（上げ直しても届かない）", async () => {
    const store = seedLive("all");
    const mail = new FakeMail();
    // 6日目の朝（327-E の最後の日）に書き出し、下げる
    const day6 = jstMorning("2026-11-26");
    store.contracts.find((c) => c.subscriptionId === "sub_test_2")!.start = jst("2026-11-20T10:00:00");
    for (const c of await store.listStandingCampaigns(day6)) await prepareCampaign(depsAt(store, mail, day6), c);
    store.campaigns.get("s-onboarding_day5")!.standingMode = "count";
    await runSendBatch(depsAt(store, mail, day6));
    expect(store.deliveries.find((d) => d.campaignId === "s-onboarding_day5")).toMatchObject({ status: "queued" });
    // 7日目: まだ下げたまま → 範囲の外なので終える
    const day7 = jstMorning("2026-11-27");
    await runSendBatch(depsAt(store, mail, day7));
    expect(store.deliveries.find((d) => d.campaignId === "s-onboarding_day5")).toMatchObject({
      status: "skipped",
      reason: "not_due",
    });
    store.campaigns.get("s-onboarding_day5")!.standingMode = "all";
    await runSendBatch(depsAt(store, mail, jstMorning("2026-11-27")));
    expect(mail.sent.filter((m) => m.subject === ONBOARDING_DAY5_COPY.subject)).toHaveLength(0);
  });

  it("最初の見直しのあと、送る直前に文面のスイッチが下がったら送らない（mode_changed）", async () => {
    const store = seedLive("all");
    const mail = new FakeMail();
    const deps = depsAt(store, mail, NOW);
    for (const c of await store.listStandingCampaigns(NOW)) await prepareCampaign(deps, c);
    // アドレスを読む（最初の見直しのあと・送る直前の見直しの前）ときに下げる
    const original = store.getEmailAddress.bind(store);
    vi.spyOn(store, "getEmailAddress").mockImplementation(async (userId: string) => {
      if (userId === uid(2)) store.campaigns.get("s-onboarding_day5")!.standingMode = "count";
      return original(userId);
    });
    await runSendBatch(deps);
    expect(to(mail)).toEqual([`member1@example.invalid|${ONBOARDING_DAY2_COPY.subject}`]);
    expect(store.deliveries.find((d) => d.campaignId === "s-onboarding_day5")).toMatchObject({
      status: "queued",
      reason: "mode_changed",
    });
  });

  it("オーナー確認の行は、文面を count / off に下げたら送らない", async () => {
    for (const lowered of ["count", "off"] as const) {
      const store = seedLive("owner");
      const mail = new FakeMail();
      const deps = depsAt(store, mail, NOW);
      for (const c of await store.listStandingCampaigns(NOW)) await prepareCampaign(deps, c);
      expect(store.deliveries.find((d) => d.audience === "owner"), lowered).toBeDefined();
      store.campaigns.get("s-onboarding_day5")!.standingMode = lowered;
      await runSendBatch(deps);
      expect(to(mail), lowered).toEqual([`member1@example.invalid|${ONBOARDING_DAY2_COPY.subject}`]);
      expect(store.deliveries.find((d) => d.audience === "owner"), lowered).toMatchObject({
        status: "queued",
        reason: `mode_${lowered}`,
      });
    }
  });

  it("週1回のメルマガは standing_mode に値があっても見ない（送る）", async () => {
    const store = new MemStore();
    store.members.push(member(1));
    store.emails.set(uid(1), "member1@example.invalid");
    const weekly = approvedCampaign({ standingMode: "off" });
    store.campaigns.set(weekly.id, weekly);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    expect(await prepareCampaign(deps, weekly)).toMatchObject({ outcome: "enqueued", audience: "all", inserted: 1 });
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(1);
  });

  it("種類のスイッチ（signup）は非常停止として、文面が all でも全部止める", async () => {
    const store = seedLive("all");
    store.kindModes.signup = "off";
    const mail = new FakeMail();
    const results = await morningRun(store, mail, NOW);
    expect(results.map((r) => r.outcome)).toEqual(["off", "off"]);
    expect(mail.sent).toHaveLength(0);
  });

  it("全体・種類より強い値にしても上がらない（いちばん弱いものが効く）", async () => {
    const store = seedLive("all");
    store.kindModes.signup = "count";
    const mail = new FakeMail();
    const results = await morningRun(store, mail, NOW);
    expect(results.map((r) => r.outcome)).toEqual(["counted", "counted"]);
    expect(mail.sent).toHaveLength(0);
  });

  it("未設定（列が無い＝マイグレーション前）の常設の文面は count。1回分の文面は値があっても見ない", () => {
    expect(campaignModeOf(standingCampaign("onboarding_day2", { standingMode: undefined }))).toBe("count");
    expect(campaignModeOf(standingCampaign("onboarding_day2", { standingMode: null }))).toBe("count");
    expect(campaignModeOf(standingCampaign("onboarding_day5", { standingMode: "count" }))).toBe("count");
    expect(campaignModeOf(approvedCampaign({ standingMode: "off" }))).toBe("all");
    expect(campaignModeOf(null)).toBe("off");
  });

  it("DB の値の読み方: 列が無い・NULL は count、知らない値は off、4つの値はそのまま", () => {
    expect(mapStandingMode(undefined)).toBe("count");
    expect(mapStandingMode(null)).toBe("count");
    expect(mapStandingMode("ALL")).toBe("off");
    expect(mapStandingMode("paused")).toBe("off");
    expect(mapStandingMode(1)).toBe("off");
    for (const m of ["off", "count", "owner", "all"] as const) expect(mapStandingMode(m)).toBe(m);
  });

  it("マイグレーション前（文面のスイッチが未設定）に種類を all にしても、常設の文面は全員に送らない", async () => {
    const store = seedLive(undefined);
    store.campaigns.get("s-onboarding_day2")!.standingMode = undefined;
    const mail = new FakeMail();
    const results = await morningRun(store, mail, NOW);
    expect(results.map((r) => r.outcome)).toEqual(["counted", "counted"]);
    expect(mail.sent).toHaveLength(0);
  });

  it("マイグレーション: 足すだけ。既存の行も新しい行も count。値は4つだけ", () => {
    const sql = readFileSync(
      path.resolve(__dirname, "../../../../supabase/migrations/20261127010837_member_mail_standing_mode.sql"),
      "utf8",
    ).replace(/^--.*$/gm, "");
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS standing_mode text NOT NULL DEFAULT 'count'/);
    expect(sql).toMatch(/CHECK \(standing_mode IN \('off', 'count', 'owner', 'all'\)\)/);
    expect(sql).not.toMatch(/SET DEFAULT|'all'\s*;/);
    expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE)\b/);
  });
});
