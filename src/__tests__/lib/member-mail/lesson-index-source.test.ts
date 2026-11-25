// @vitest-environment node
// 「学んだ」の判定に使う Sanity の読み込みの時間切れ（327-D）。時間切れは「送らない」に倒す。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
const fetchMock = vi.fn();
vi.mock("@/lib/sanity", () => ({ client: () => ({ fetch: fetchMock }) }));
import { loadLessonIndexFromSanity, LESSON_INDEX_TIMEOUT_MS, withTimeout } from "@/lib/member-mail/lesson-index-source";
import { prepareCampaign } from "@/lib/member-mail/process";
import { approvedCampaign, FakeMail, makeDeps, member, MemStore, uid } from "./helpers";

beforeEach(() => {
  fetchMock.mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Sanity の読み込みの時間切れ", () => {
  it("既定は8秒", () => {
    expect(LESSON_INDEX_TIMEOUT_MS).toBe(8000);
  });

  it("時間内に返らなければ例外になる", async () => {
    await expect(withTimeout(new Promise(() => {}), 10)).rejects.toThrow("timeout");
    await expect(withTimeout(Promise.resolve(1), 50)).resolves.toBe(1);
  });

  it("Sanity が返らないときは時間切れで例外、返れば索引になる", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    await expect(loadLessonIndexFromSanity(20)).rejects.toThrow("timeout");
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce([{ lessonId: "L1", articleIds: ["A1"] }])
      .mockResolvedValueOnce([]);
    const index = await loadLessonIndexFromSanity(1000);
    expect(index.learningOwners.get("A1")).toBe(1);
  });

  it("時間切れのときは常設の文面を書き出さない（送らない側に倒す）", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const store = new MemStore();
    store.kindModes.signup = "all";
    store.testEmailPrefixes = ["qa-fixture"];
    const campaign = approvedCampaign({
      id: "s-1",
      kind: "signup",
      standingKey: "onboarding_day2",
      scheduledAt: new Date("2026-11-20T00:00:00+09:00"),
    });
    store.campaigns.set(campaign.id, campaign);
    store.members.push(member(1));
    store.contracts.push({ subscriptionId: "sub_test_1", start: new Date("2026-11-23T10:00:00+09:00") });
    store.emails.set(uid(1), "member1@example.invalid");
    const deps = makeDeps(store, new FakeMail(), [], {
      now: () => new Date("2026-11-25T08:00:00+09:00"),
      loadLessonIndex: () => loadLessonIndexFromSanity(20),
    });
    expect(await prepareCampaign(deps, campaign)).toEqual({ outcome: "blocked", reason: "lesson_index_unavailable" });
    expect(store.deliveries).toHaveLength(0);
  });
});
