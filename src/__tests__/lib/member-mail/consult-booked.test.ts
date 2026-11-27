// @vitest-environment node
// 30分相談（Cal.com）を予約した人を、相談に誘う常設の文面（はじめの案内・30分相談の案内）から外す（#327-F）。
// - Cal.com の webhook: 署名・同じ予約は1行・取り消し・日時の変更・ほかの event type
// - 外す処理: 選ぶとき・送る直前・327-E は変わらない・人数に consult_booked が出る・ログにアドレスを出さない
// アドレスは example.invalid、鍵は架空の値だけを使う。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
vi.mock("server-only", () => ({}));
import { NextRequest } from "next/server";
import {
  consultEventFromEnv,
  handleCalcomEvent,
  verifyCalcomSignature,
  type CalcomWebhookBody,
} from "@/lib/member-mail/calcom-webhook";
import { prepareCampaign, runSendBatch } from "@/lib/member-mail/process";
import { ONBOARDING_DAY2_COPY, ONBOARDING_DAY5_COPY, ONBOARDING_DAY9_COPY } from "@/lib/member-mail/standing-copy";
import { CONSULT_BOOKED_EXCLUDED_KEYS, excludeConsultBooked, STANDING_TARGETS } from "@/lib/member-mail/targets";
import { STANDING_KEYS, type Campaign, type CountSummary, type StandingKey } from "@/lib/member-mail/types";
import {
  approvedCampaign,
  FakeMail,
  LEARNING_ARTICLE,
  LEARNING_LESSON,
  makeDeps,
  member,
  MemStore,
  uid,
} from "./helpers";

const routeStore = { current: new MemStore() };
vi.mock("@/lib/member-mail/runtime", () => ({
  getMailStore: () => routeStore.current,
}));
const opsAlerts: { title: string; counts: Record<string, number>; note?: string }[] = [];
vi.mock("@/lib/member-mail/ops-alert", () => ({
  notifyMailOps: async (a: { title: string; counts: Record<string, number>; note?: string }) => {
    opsAlerts.push(a);
  },
}));

const CAL_SECRET = "calcom-test-secret-0123456789";
const TEST_PREFIX = "qa-fixture";
const ACTIVATED = new Date("2026-11-01T12:00:00+09:00");
const JOIN = new Date("2026-11-20T10:00:00+09:00");
const MATCHER = { slug: "30min", eventTypeId: null };

function jstMorning(day: string): Date {
  return new Date(`${day}T08:00:00+09:00`);
}
/** 入会日（2026-11-20）から n 日目の朝 */
function morningOf(n: number): Date {
  return jstMorning(new Date(Date.UTC(2026, 10, 20 + n)).toISOString().slice(0, 10));
}
const SEND_DAY: Record<StandingKey, number> = { onboarding_day2: 2, onboarding_day5: 5, onboarding_day9: 9 };
const COPY: Record<StandingKey, { label: string; subject: string; preheader: string; body: string }> = {
  onboarding_day2: ONBOARDING_DAY2_COPY,
  onboarding_day5: ONBOARDING_DAY5_COPY,
  onboarding_day9: ONBOARDING_DAY9_COPY,
};

function campaign(key: StandingKey): Campaign {
  return approvedCampaign({
    id: `s-${key}`,
    kind: "signup",
    ...COPY[key],
    standingKey: key,
    scheduledAt: ACTIVATED,
    standingMode: "all",
  });
}

/** 会員 1・2 が同じ日に入会。327-E（学んだあと静か）の対象にもなるよう、入会翌日に1回学んだ状態にできる */
function seed(key: StandingKey, opts: { learnedOnDay1?: boolean } = {}) {
  const store = new MemStore();
  store.kindModes.signup = "all";
  store.testEmailPrefixes = [TEST_PREFIX];
  const c = campaign(key);
  store.campaigns.set(c.id, c);
  for (const i of [1, 2]) {
    store.members.push(member(i));
    store.contracts.push({ subscriptionId: `sub_test_${i}`, start: JOIN });
    store.emails.set(uid(i), `Member${i}@Example.invalid`);
    if (opts.learnedOnDay1) {
      store.progress.push({
        userId: uid(i),
        eventType: "article_complete",
        articleId: LEARNING_ARTICLE,
        lessonId: LEARNING_LESSON,
        occurredAt: new Date("2026-11-21T12:00:00+09:00"),
        percent: null,
      });
    }
  }
  return { store, campaign: c };
}

function calBody(trigger: string, over: Record<string, unknown> = {}): CalcomWebhookBody {
  return {
    triggerEvent: trigger,
    createdAt: "2026-11-21T00:00:00.000Z",
    payload: {
      type: "30min",
      eventTypeId: 123,
      uid: "bk-1",
      startTime: "2026-11-25T10:00:00Z",
      attendees: [{ email: "Member1@Example.invalid", name: "テスト", timeZone: "Asia/Tokyo" }],
      ...over,
    },
  };
}

function sign(raw: string, secret = CAL_SECRET) {
  return createHmac("sha256", secret).update(raw).digest("hex");
}

function calRequest(body: unknown, signature: string | null) {
  const raw = JSON.stringify(body);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signature !== null) headers["x-cal-signature-256"] = signature;
  return new NextRequest("https://www.bo-no.design/api/webhooks/calcom", { method: "POST", headers, body: raw });
}

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  opsAlerts.length = 0;
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  // どのテストでも、ログにアドレス（大文字・小文字どちらも）を出さない
  const all = JSON.stringify([...logSpy.mock.calls, ...errSpy.mock.calls, opsAlerts]).toLowerCase();
  expect(all).not.toContain("example.invalid");
  vi.restoreAllMocks();
  delete process.env.CALCOM_WEBHOOK_SECRET;
});

describe("Cal.com の署名（X-Cal-Signature-256 = 本文の HMAC-SHA256 の16進）", () => {
  it("正しい署名だけ通す。本文が1文字違う・鍵が違う・形が違う・ヘッダーが無いは通さない", () => {
    const raw = JSON.stringify(calBody("BOOKING_CREATED"));
    expect(verifyCalcomSignature(raw, sign(raw), CAL_SECRET)).toBe(true);
    expect(verifyCalcomSignature(raw, sign(raw).toUpperCase(), CAL_SECRET)).toBe(true);
    expect(verifyCalcomSignature(`${raw} `, sign(raw), CAL_SECRET)).toBe(false);
    expect(verifyCalcomSignature(raw, sign(raw, "other-secret"), CAL_SECRET)).toBe(false);
    expect(verifyCalcomSignature(raw, "no-secret-provided", CAL_SECRET)).toBe(false);
    expect(verifyCalcomSignature(raw, sign(raw).slice(0, 62), CAL_SECRET)).toBe(false);
    expect(verifyCalcomSignature(raw, null, CAL_SECRET)).toBe(false);
    expect(verifyCalcomSignature(raw, sign(raw, ""), "")).toBe(false);
  });

  it("route: 鍵が無ければ 503 で何も記録しない", async () => {
    routeStore.current = new MemStore();
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = calBody("BOOKING_CREATED");
    const res = await POST(calRequest(body, sign(JSON.stringify(body))));
    expect(res.status).toBe(503);
    expect(routeStore.current.consultBookings.size).toBe(0);
  });

  it("route: 署名が違えば 401 で記録しない。正しければ記録し、同じ予約が2回届いても1行", async () => {
    routeStore.current = new MemStore();
    process.env.CALCOM_WEBHOOK_SECRET = CAL_SECRET;
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = calBody("BOOKING_CREATED");
    const bad = await POST(calRequest(body, sign(JSON.stringify(body), "wrong-secret")));
    expect(bad.status).toBe(401);
    const missing = await POST(calRequest(body, null));
    expect(missing.status).toBe(401);
    expect(routeStore.current.consultBookings.size).toBe(0);
    // 64桁の16進の署名が合わないときだけ運用 Slack に件数だけ出す（署名なしは通知しない）
    expect(opsAlerts.map((a) => a.counts)).toEqual([{ calcom_invalid_signature: 1 }]);
    opsAlerts.length = 0;

    for (let i = 0; i < 2; i++) {
      const res = await POST(calRequest(body, sign(JSON.stringify(body))));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ ok: true, outcome: "booked" });
    }
    expect(routeStore.current.consultBookings.size).toBe(1);
    expect(opsAlerts).toEqual([]); // 正しく記録できたときは通知しない
    expect(routeStore.current.consultBookings.get("bk-1")).toMatchObject({
      attendeeEmail: "member1@example.invalid",
      status: "booked",
    });
  });

  it("route: 署名つきでも JSON でなければ 400。確認用（PING）・ほかの種類は 200 で何もしない", async () => {
    routeStore.current = new MemStore();
    process.env.CALCOM_WEBHOOK_SECRET = CAL_SECRET;
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const raw = "not-json";
    const res = await POST(
      new NextRequest("https://www.bo-no.design/api/webhooks/calcom", {
        method: "POST",
        headers: { "x-cal-signature-256": sign(raw) },
        body: raw,
      }),
    );
    expect(res.status).toBe(400);
    for (const trigger of ["PING", "MEETING_ENDED", "BOOKING_REQUESTED"]) {
      const body = calBody(trigger);
      const r = await POST(calRequest(body, sign(JSON.stringify(body))));
      expect(r.status).toBe(200);
      expect(await r.json()).toMatchObject({ outcome: "ignored" });
    }
    expect(routeStore.current.consultBookings.size).toBe(0);
  });
});

describe("route: 記録の失敗・読めない中身は運用 Slack に出す（アドレスは出さない）", () => {
  it("記録に失敗したら 500 を返し、種類と件数だけ通知する", async () => {
    const store = new MemStore();
    store.recordConsultBooking = async () => {
      throw new Error("consult booking record failed: 42P01");
    };
    routeStore.current = store;
    process.env.CALCOM_WEBHOOK_SECRET = CAL_SECRET;
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = calBody("BOOKING_CREATED");
    const res = await POST(calRequest(body, sign(JSON.stringify(body))));
    expect(res.status).toBe(500);
    expect(opsAlerts.map((a) => a.counts)).toEqual([{ calcom_failed_booking_created: 1 }]);
  });

  it("uid か予約した人のアドレスが無い中身は 200 で記録せず、種類と件数だけ通知する", async () => {
    routeStore.current = new MemStore();
    process.env.CALCOM_WEBHOOK_SECRET = CAL_SECRET;
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = calBody("BOOKING_CANCELLED", { attendees: [{ name: "メールなし" }] });
    const res = await POST(calRequest(body, sign(JSON.stringify(body))));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ outcome: "invalid" });
    expect(routeStore.current.consultBookings.size).toBe(0);
    expect(opsAlerts.map((a) => a.counts)).toEqual([{ calcom_invalid_booking_cancelled: 1 }]);
  });

  it("知らない種類の名前を通知・ログにそのまま出さない", async () => {
    routeStore.current = new MemStore();
    process.env.CALCOM_WEBHOOK_SECRET = CAL_SECRET;
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const body = calBody("member1@example.invalid");
    const res = await POST(calRequest(body, sign(JSON.stringify(body))));
    expect(await res.json()).toMatchObject({ outcome: "ignored" });
    expect(opsAlerts).toEqual([]);
  });
});

describe("route: 公開 URL への雑な POST では通知しない", () => {
  it("署名なし・形の違う署名（no-secret-provided・短い・16進でない）は 401 でログだけ。64桁の16進が合わないときだけ通知する", async () => {
    routeStore.current = new MemStore();
    process.env.CALCOM_WEBHOOK_SECRET = CAL_SECRET;
    const { POST } = await import("@/app/api/webhooks/calcom/route");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const body = calBody("BOOKING_CREATED");
    for (const sig of [null, "no-secret-provided", "abc123", "z".repeat(64), "0".repeat(63)]) {
      const res = await POST(calRequest(body, sig));
      expect(res.status).toBe(401);
    }
    expect(opsAlerts).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(5);
    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain("example.invalid");

    const wrong = await POST(calRequest(body, "a".repeat(64)));
    expect(wrong.status).toBe(401);
    expect(opsAlerts.map((a) => a.counts)).toEqual([{ calcom_invalid_signature: 1 }]);
    expect(routeStore.current.consultBookings.size).toBe(0);
  });
});

describe("日時の変更の端のケース", () => {
  it("rescheduleUid が無い: 新しい予約だけ booked で記録し、ほかの行は作らない", async () => {
    const store = new MemStore();
    expect(await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_RESCHEDULED", { uid: "bk-new" }))).toBe("rescheduled");
    expect([...store.consultBookings.entries()].map(([k, v]) => [k, v.status])).toEqual([["bk-new", "booked"]]);
  });

  it("rescheduleUid が uid と同じ: 取り消しにしない（booked のまま）", async () => {
    const store = new MemStore();
    await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_RESCHEDULED", { uid: "bk-same", rescheduleUid: "bk-same" }));
    expect([...store.consultBookings.entries()].map(([k, v]) => [k, v.status])).toEqual([["bk-same", "booked"]]);
  });
});

describe("Cal.com の webhook の鍵が無いときは count より上げない", () => {
  for (const key of CONSULT_BOOKED_EXCLUDED_KEYS) {
    for (const mode of ["owner", "all"] as const) {
      it(`${key}: ${mode} では書き出さずに止めて知らせる`, async () => {
        const { store, campaign: c } = seed(key);
        store.campaigns.get(c.id)!.standingMode = mode;
        store.settings.ownerUserIds = [uid(1)];
        const alerts: { counts?: Record<string, number> }[] = [];
        const deps = makeDeps(store, new FakeMail(), alerts, {
          now: () => morningOf(SEND_DAY[key]),
          consultWebhookConfigured: false,
        });
        expect(await prepareCampaign(deps, store.campaigns.get(c.id)!)).toEqual({
          outcome: "blocked",
          reason: "calcom_webhook_secret_unset",
        });
        expect(store.deliveries).toHaveLength(0);
        expect(alerts[0].counts).toEqual({ calcom_webhook_secret_unset: 1 });
      });
    }

    it(`${key}: 人数だけ出す（count）は鍵が無くても動く`, async () => {
      const { store, campaign: c } = seed(key);
      store.campaigns.get(c.id)!.standingMode = "count";
      const deps = makeDeps(store, new FakeMail(), [], { now: () => morningOf(SEND_DAY[key]), consultWebhookConfigured: false });
      expect(await prepareCampaign(deps, store.campaigns.get(c.id)!)).toMatchObject({ outcome: "counted" });
    });
  }

  it("onboarding_day5 は鍵が無くても今までどおり書き出す", async () => {
    const { store, campaign: c } = seed("onboarding_day5", { learnedOnDay1: true });
    const deps = makeDeps(store, new FakeMail(), [], { now: () => morningOf(5), consultWebhookConfigured: false });
    expect(await prepareCampaign(deps, c)).toMatchObject({ outcome: "enqueued", inserted: 2 });
  });
});

describe("予約の記録（handleCalcomEvent）", () => {
  it("ほかの event type（slug が 30min でない）は記録しない。ID を指定すれば ID でも突き合わせる", async () => {
    const store = new MemStore();
    expect(await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CREATED", { type: "60min", eventTypeId: 999 }))).toBe(
      "other_event_type",
    );
    expect(store.consultBookings.size).toBe(0);
    const byId = { slug: "30min", eventTypeId: 999 };
    expect(await handleCalcomEvent({ store, matcher: byId }, calBody("BOOKING_CREATED", { type: "renamed", eventTypeId: 999 }))).toBe(
      "booked",
    );
    expect(consultEventFromEnv({})).toEqual({ slug: "30min", eventTypeId: null });
    expect(consultEventFromEnv({ CALCOM_CONSULT_EVENT_SLUG: "consult", CALCOM_CONSULT_EVENT_TYPE_ID: "42" })).toEqual({
      slug: "consult",
      eventTypeId: 42,
    });
  });

  it("予約した本人（attendees[0]）だけを小文字で記録する。uid かアドレスが無ければ記録しない", async () => {
    const store = new MemStore();
    await handleCalcomEvent(
      { store, matcher: MATCHER },
      calBody("BOOKING_CREATED", { attendees: [{ email: "Member1@Example.invalid" }, { email: "guest@example.invalid" }] }),
    );
    expect([...store.consultBookings.values()].map((b) => b.attendeeEmail)).toEqual(["member1@example.invalid"]);
    expect(await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CREATED", { uid: "" }))).toBe("invalid");
    expect(await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CREATED", { attendees: [] }))).toBe("invalid");
  });

  it("取り消しは戻らない（取り消しのあとに予約が届いても cancelled のまま）", async () => {
    const store = new MemStore();
    await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CANCELLED", { uid: "bk-x" }));
    await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CREATED", { uid: "bk-x" }));
    expect(store.consultBookings.get("bk-x")?.status).toBe("cancelled");
  });

  it("日時の変更: 新しい uid が booked、元の予約が cancelled。そのあと新しい予約を取り消せば外さない", async () => {
    const store = new MemStore();
    store.emails.set(uid(1), "member1@example.invalid");
    await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CREATED", { uid: "bk-old" }));
    expect(
      await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_RESCHEDULED", { uid: "bk-new", rescheduleUid: "bk-old" })),
    ).toBe("rescheduled");
    expect(store.consultBookings.get("bk-old")?.status).toBe("cancelled");
    expect(store.consultBookings.get("bk-new")?.status).toBe("booked");
    expect(await store.listConsultBookedUserIds([uid(1)])).toEqual(new Set([uid(1)]));
    await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CANCELLED", { uid: "bk-new" }));
    expect(await store.listConsultBookedUserIds([uid(1)])).toEqual(new Set());
  });
});

describe("外す文面（1つの定数で決まる）", () => {
  it("はじめの案内・30分相談の案内だけ。327-E は入らない。除外条件の並びは定数と一致する", () => {
    expect([...CONSULT_BOOKED_EXCLUDED_KEYS].sort()).toEqual(["onboarding_day2", "onboarding_day9"]);
    for (const key of STANDING_KEYS) {
      expect(STANDING_TARGETS[key].exclusions.includes(excludeConsultBooked), key).toBe(
        CONSULT_BOOKED_EXCLUDED_KEYS.includes(key),
      );
    }
  });

  it("学習の決まりより前に見る（人数に consult_booked として出るように）", () => {
    for (const key of CONSULT_BOOKED_EXCLUDED_KEYS) {
      const names = STANDING_TARGETS[key].exclusions.map((e) => e.reason);
      expect(names.indexOf("consult_booked")).toBeLessThan(names.indexOf("learned"));
    }
  });
});

describe("選ぶとき・送る直前に外す", () => {
  async function book(store: MemStore, email: string, bookingUid: string) {
    await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CREATED", { uid: bookingUid, attendees: [{ email }] }));
  }

  for (const key of CONSULT_BOOKED_EXCLUDED_KEYS) {
    it(`${key}: 予約した人は選ばない（人数に excluded_consult_booked）。取り消した人は選ぶ`, async () => {
      const { store, campaign: c } = seed(key);
      await book(store, "MEMBER1@example.invalid", "bk-1"); // アドレスの大文字・小文字は問わない
      await book(store, "member2@example.invalid", "bk-2");
      await handleCalcomEvent({ store, matcher: MATCHER }, calBody("BOOKING_CANCELLED", { uid: "bk-2", attendees: [{ email: "member2@example.invalid" }] }));
      const alerts: unknown[] = [];
      const mail = new FakeMail();
      const deps = makeDeps(store, mail, alerts, { now: () => morningOf(SEND_DAY[key]) });
      const result = await prepareCampaign(deps, c);
      expect(result).toMatchObject({ outcome: "enqueued", audience: "all", inserted: 1 });
      expect((store.counts.get(c.id) as CountSummary).excluded).toMatchObject({ consult_booked: 1 });
      expect(store.deliveries.map((d) => d.userId)).toEqual([uid(2)]);
      expect(JSON.stringify(alerts)).toContain("excluded_consult_booked");
      await runSendBatch(deps);
      expect(mail.sent).toHaveLength(1);
    });

    it(`${key}: 人数だけ出すときも consult_booked が出る`, async () => {
      const { store, campaign: c } = seed(key);
      store.campaigns.get(c.id)!.standingMode = "count";
      await book(store, "member1@example.invalid", "bk-1");
      const alerts: { counts?: Record<string, number> }[] = [];
      const deps = makeDeps(store, new FakeMail(), alerts, { now: () => morningOf(SEND_DAY[key]) });
      const result = await prepareCampaign(deps, store.campaigns.get(c.id)!);
      expect(result).toMatchObject({ outcome: "counted" });
      expect(alerts[0].counts).toMatchObject({ candidates: 2, will_send: 1, excluded_consult_booked: 1 });
    });

    it(`${key}: 書き出したあとに予約した人には、送る直前に外す（consult_booked）`, async () => {
      const { store, campaign: c } = seed(key);
      const mail = new FakeMail();
      const deps = makeDeps(store, mail, [], { now: () => morningOf(SEND_DAY[key]) });
      await prepareCampaign(deps, c);
      expect(store.deliveries).toHaveLength(2);
      await book(store, "member1@example.invalid", "bk-1");
      await runSendBatch(deps);
      expect(mail.sent).toHaveLength(1);
      expect(store.deliveries.find((d) => d.userId === uid(1))).toMatchObject({ status: "skipped", reason: "consult_booked" });
      expect(store.deliveries.find((d) => d.userId === uid(2))?.status).toBe("sent");
    });

    it(`${key}: 予約の記録が user_id だけ（アドレスが会員のものと違う）でも外す`, async () => {
      const { store, campaign: c } = seed(key);
      store.consultBookings.set("bk-z", { attendeeEmail: "other@example.invalid", userId: uid(1), status: "booked", startTime: null });
      const deps = makeDeps(store, new FakeMail(), [], { now: () => morningOf(SEND_DAY[key]) });
      await prepareCampaign(deps, c);
      expect(store.deliveries.map((d) => d.userId)).toEqual([uid(2)]);
    });

    it(`${key}: 予約の記録が読めない（マイグレーション前）なら、書き出さない・送らない`, async () => {
      const { store, campaign: c } = seed(key);
      const mail = new FakeMail();
      const alerts: unknown[] = [];
      const deps = makeDeps(store, mail, alerts, { now: () => morningOf(SEND_DAY[key]) });
      store.consultBookingsUnavailable = true;
      expect(await prepareCampaign(deps, c)).toEqual({ outcome: "blocked", reason: "consult_bookings_unavailable" });
      expect(store.deliveries).toHaveLength(0);

      // 書き出したあとに読めなくなったら、送らずに待たせる
      store.consultBookingsUnavailable = false;
      await prepareCampaign(deps, c);
      store.consultBookingsUnavailable = true;
      await runSendBatch(deps);
      expect(mail.sent).toHaveLength(0);
      expect(store.deliveries.every((d) => d.status === "queued" && d.reason === "consult_bookings_unavailable")).toBe(true);
    });
  }

  it("onboarding_day5 は予約を見ない（予約した人にも今までどおり送る・予約の記録を読まない）", async () => {
    const { store, campaign: c } = seed("onboarding_day5", { learnedOnDay1: true });
    await book(store, "member1@example.invalid", "bk-1");
    store.consultBookingsUnavailable = true; // 読めば落ちる状態でも動く
    const readsBefore = store.consultBookingReads;
    const mail = new FakeMail();
    const deps = makeDeps(store, mail, [], { now: () => morningOf(5) });
    const result = await prepareCampaign(deps, c);
    expect(result).toMatchObject({ outcome: "enqueued", inserted: 2 });
    expect((store.counts.get(c.id) as CountSummary).excluded).not.toHaveProperty("consult_booked");
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(2);
    expect(store.consultBookingReads).toBe(readsBefore);
  });
});
