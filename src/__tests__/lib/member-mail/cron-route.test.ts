// @vitest-environment node
// 会員メールの cron の受け口（/api/cron/member-mail）。毎日の ?only=standing の回が weekly を動かさないこと（327-D）。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
import { NextRequest } from "next/server";
import { ONBOARDING_DAY2_COPY } from "@/lib/member-mail/standing-copy";
import { approvedCampaign, FakeMail, makeDeps, member, MemStore, uid } from "./helpers";

let store: MemStore;
let mail: FakeMail;
const NOW = new Date("2026-11-25T08:00:00+09:00"); // 水曜 8:00 JST
vi.mock("@/lib/member-mail/runtime", () => ({
  createMailDeps: () => makeDeps(store, mail, [], { now: () => NOW }),
}));

function request(query: string) {
  return new NextRequest(`https://www.bo-no.design/api/cron/member-mail${query}`, {
    headers: { authorization: "Bearer cron-test-secret" },
  });
}

beforeEach(() => {
  process.env.CRON_SECRET = "cron-test-secret";
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = new MemStore();
  mail = new FakeMail();
  store.kindModes.signup = "all";
  store.testEmailPrefixes = ["qa-fixture"];
  // 週1回のメルマガ: 昨日から送ってよい・まだ書き出していない号 ＋ 送り残しの行
  store.campaigns.set("w-1", approvedCampaign({ id: "w-1", scheduledAt: new Date("2026-11-24T08:00:00+09:00") }));
  // はじめの案内: 11/23 に入会した人が今日の対象
  store.campaigns.set(
    "s-1",
    approvedCampaign({
      id: "s-1",
      kind: "signup",
      label: ONBOARDING_DAY2_COPY.label,
      subject: ONBOARDING_DAY2_COPY.subject,
      preheader: ONBOARDING_DAY2_COPY.preheader,
      body: ONBOARDING_DAY2_COPY.body,
      standingKey: "onboarding_day2",
      standingMode: "all", // 文面ごとのスイッチ（#327-E/F）も全員に上げた状態
      scheduledAt: new Date("2026-11-20T00:00:00+09:00"),
    }),
  );
  store.members.push(member(1));
  store.contracts.push({ subscriptionId: "sub_test_1", start: new Date("2026-11-23T10:00:00+09:00") });
  store.members.push(member(2));
  store.contracts.push({ subscriptionId: "sub_test_2", start: new Date("2026-01-01T10:00:00+09:00") });
  store.emails.set(uid(1), "member1@example.invalid");
  store.emails.set(uid(2), "member2@example.invalid");
});

describe("GET /api/cron/member-mail", () => {
  it("?only=standing の回は、常設の文面だけを選んで送り、週1回のメルマガは書き出しも送信もしない", async () => {
    // 先週の回の送り残し（queued のまま）
    await store.insertDeliveries([
      { campaignId: "w-0", userId: uid(2), kind: "weekly", category: "notice", audience: "all", contentVersion: 1 },
    ]);
    const { GET } = await import("@/app/api/cron/member-mail/route");
    const res = await GET(request("?run=daily&only=standing"));
    expect(res.status).toBe(200);
    expect(mail.sent.map((m) => m.subject)).toEqual([ONBOARDING_DAY2_COPY.subject]);
    expect(store.campaigns.get("w-1")!.enqueuedAt).toBeNull();
    expect(store.deliveries.filter((d) => d.campaignId === "w-1")).toHaveLength(0);
    expect(store.deliveries.find((d) => d.campaignId === "w-0")!.status).toBe("queued");
  });

  it("いつもの回（only なし）は、週1回のメルマガと常設の文面の両方を扱う", async () => {
    const { GET } = await import("@/app/api/cron/member-mail/route");
    const res = await GET(request("?run=8"));
    expect(res.status).toBe(200);
    expect(store.campaigns.get("w-1")!.enqueuedAt).not.toBeNull();
    expect(mail.sent.map((m) => m.subject).sort()).toEqual([ONBOARDING_DAY2_COPY.subject, "今週のデザインレター", "今週のデザインレター"].sort());
  });

  it("月・火の回では、weekly の行が多くても常設の文面の行を先に送る", async () => {
    store.settings.dailyLimit = 3;
    for (let i = 10; i < 20; i++) {
      store.members.push(member(i));
      store.emails.set(uid(i), `member${i}@example.invalid`);
    }
    const { GET } = await import("@/app/api/cron/member-mail/route");
    const res = await GET(request("?run=8"));
    expect(res.status).toBe(200);
    expect(mail.sent).toHaveLength(3);
    expect(mail.sent[0].subject).toBe(ONBOARDING_DAY2_COPY.subject);
    expect(mail.sent.filter((m) => m.subject === ONBOARDING_DAY2_COPY.subject)).toHaveLength(1);
  });

  it("CRON_SECRET が無いと何もしない", async () => {
    const { GET } = await import("@/app/api/cron/member-mail/route");
    const res = await GET(new NextRequest("https://www.bo-no.design/api/cron/member-mail?only=standing"));
    expect(res.status).toBe(401);
    expect(mail.sent).toHaveLength(0);
  });
});
