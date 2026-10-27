// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { confirmLink, inspectLinkToken, MYPAGE_DAILY_LIMIT, requestMypageLink, type MypageLinkDeps } from "@/lib/slack-member-sync/link-flow";
import { MYPAGE_CONFIRM_MESSAGE } from "@/lib/slack-member-sync/messages/mypage-confirm";
import { hashToken } from "@/lib/slack-member-sync/tokens";
import { FakeSyncSlack, MemorySyncStore, TEAM_ID, makeMember } from "./helpers";

const NOW = new Date("2026-10-27T01:30:00Z");
const PAID = { hasPaidRecord: true, isActive: true, cancelAtPeriodEnd: false, cancelAt: null, currentPeriodEnd: null };
const RAW = "r".repeat(43);

let store: MemorySyncStore;
let slack: FakeSyncSlack;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = new MemorySyncStore();
  store.clock = () => NOW;
  slack = new FakeSyncSlack();
  store.users = [
    { userId: "user-paid", email: "paid@example.com", sub: PAID },
    { userId: "user-free", email: "free@example.com", sub: null },
  ];
});

function addToken(raw: string, overrides: Partial<(typeof store.tokens)[number]> = {}) {
  store.tokens.push({
    tokenHash: hashToken(raw),
    teamId: TEAM_ID,
    slackUserId: "U_SLACK",
    purpose: "link_request",
    expiresAt: new Date("2026-11-30T00:00:00Z"),
    requestedByUserId: null,
    usedAt: null,
    createdAt: NOW,
    ...overrides,
  });
}

describe("DM のリンクでつなぐ（/slack/link）", () => {
  it("開いただけではつながない（状態を見るだけ）", async () => {
    addToken(RAW);
    expect(await inspectLinkToken(store, RAW)).toBe("valid");
    expect(store.links).toHaveLength(0);
    expect(store.tokens[0].usedAt).toBeNull();
  });

  it("課金中のアカウントでつなぐと linked。リンクは使用済みになる", async () => {
    addToken(RAW);
    expect(await confirmLink(store, RAW, "user-paid")).toBe("linked");
    expect(store.links).toEqual([{ userId: "user-paid", teamId: TEAM_ID, slackUserId: "U_SLACK", linkedVia: "dm_link" }]);
    expect(await confirmLink(store, RAW, "user-paid")).toBe("used");
  });

  it("マイページ由来のリンクは linked_via=mypage", async () => {
    addToken(RAW, { purpose: "mypage" });
    await confirmLink(store, RAW, "user-paid");
    expect(store.links[0].linkedVia).toBe("mypage");
  });

  it("課金中でないアカウントではつながず、リンクも使える状態のまま", async () => {
    addToken(RAW);
    expect(await confirmLink(store, RAW, "user-free")).toBe("not_paid");
    expect(store.links).toHaveLength(0);
    expect(store.tokens[0].usedAt).toBeNull();
  });

  it("無効・期限切れのリンクは、課金の確認より先にその旨を返す", async () => {
    addToken(RAW, { expiresAt: new Date("2026-10-27T00:00:00Z") });
    expect(await confirmLink(store, RAW, "user-free")).toBe("expired");
    expect(await confirmLink(store, "x".repeat(43), "user-paid")).toBe("invalid");
    expect(await confirmLink(store, "bad token!", "user-paid")).toBe("invalid");
    expect(await confirmLink(store, null, "user-paid")).toBe("invalid");
  });

  it("Slack アカウントが別の BONO アカウントとつながっていれば断る（上書きしない）", async () => {
    store.users.push({ userId: "user-paid2", email: "p2@example.com", sub: PAID });
    store.links.push({ userId: "user-paid2", teamId: TEAM_ID, slackUserId: "U_SLACK", linkedVia: "email" });
    addToken(RAW);
    expect(await confirmLink(store, RAW, "user-paid")).toBe("slack_linked_to_other");
    expect(store.links).toHaveLength(1);
    expect(store.links[0].userId).toBe("user-paid2");
  });

  it("BONO アカウントが別の Slack アカウントとつながっていれば断る", async () => {
    store.links.push({ userId: "user-paid", teamId: TEAM_ID, slackUserId: "U_OTHER", linkedVia: "email" });
    addToken(RAW);
    expect(await confirmLink(store, RAW, "user-paid")).toBe("user_linked_to_other");
    expect(store.links).toHaveLength(1);
  });

  it("すでに同じ組み合わせでつながっていれば already_linked", async () => {
    store.links.push({ userId: "user-paid", teamId: TEAM_ID, slackUserId: "U_SLACK", linkedVia: "email" });
    addToken(RAW);
    expect(await confirmLink(store, RAW, "user-paid")).toBe("already_linked");
  });
});

describe("マイページの「Slackとつなぐ」", () => {
  function deps(overrides: Partial<MypageLinkDeps> = {}): MypageLinkDeps {
    let n = 0;
    return {
      store,
      slack,
      teamId: TEAM_ID,
      siteUrl: "https://www.bo-no.design",
      message: { ...MYPAGE_CONFIRM_MESSAGE, approved: true },
      now: () => NOW,
      newToken: () => `${String(++n)}`.padStart(43, "t"),
      ...overrides,
    };
  }

  it("Slack にいれば確認DMを送り、リンクのハッシュを保存する（メールは保存しない）", async () => {
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_SLACK" }) });
    expect(await requestMypageLink(deps(), "user-paid", " Work@Example.com ")).toBe("sent");
    expect(slack.lookupCalls).toEqual(["Work@Example.com"]);
    const [text] = slack.textsTo("U_SLACK");
    expect(text).toContain("https://www.bo-no.design/slack/link?t=");
    expect(store.tokens).toHaveLength(1);
    expect(store.tokens[0]).toMatchObject({ slackUserId: "U_SLACK", purpose: "mypage", requestedByUserId: "user-paid" });
    expect(store.tokens[0].expiresAt.toISOString()).toBe("2026-10-28T01:30:00.000Z");
    expect(JSON.stringify(store.tokens)).not.toContain("example.com");
  });

  it("Slack にいなくても同じ結果を返す（DMは送らない・回数には数える）", async () => {
    expect(await requestMypageLink(deps(), "user-paid", "nobody@example.com")).toBe("sent");
    expect(slack.postCalls).toHaveLength(0);
    expect(store.tokens).toHaveLength(1);
    expect(store.tokens[0].slackUserId).toBeNull();
  });

  it("別の BONO アカウントとつながっている Slack アカウントには送らない（同じ結果）", async () => {
    store.links.push({ userId: "user-x", teamId: TEAM_ID, slackUserId: "U_SLACK", linkedVia: "email" });
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_SLACK" }) });
    expect(await requestMypageLink(deps(), "user-paid", "a@example.com")).toBe("sent");
    expect(slack.postCalls).toHaveLength(0);
  });

  it("ボット・ゲスト・別チームには送らない（同じ結果）", async () => {
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_G", isRestricted: true }) });
    expect(await requestMypageLink(deps(), "user-paid", "a@example.com")).toBe("sent");
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_T", teamId: "T0OTHER" }) });
    expect(await requestMypageLink(deps(), "user-paid", "a@example.com")).toBe("sent");
    expect(slack.postCalls).toHaveLength(0);
  });

  it("本文が未承認なら送らない（同じ結果）", async () => {
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_SLACK" }) });
    expect(await requestMypageLink(deps({ message: MYPAGE_CONFIRM_MESSAGE }), "user-paid", "a@example.com")).toBe("sent");
    expect(slack.postCalls).toHaveLength(0);
    expect(store.tokens[0].slackUserId).toBeNull();
  });

  it("test モードでは test_user_ids の人にだけ送る", async () => {
    store.settings = { ...store.settings!, mode: "test", testUserIds: ["U_TEST"] };
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_SLACK" }) });
    await requestMypageLink(deps(), "user-paid", "a@example.com");
    expect(slack.postCalls).toHaveLength(0);
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_TEST" }) });
    await requestMypageLink(deps(), "user-paid", "b@example.com");
    expect(slack.textsTo("U_TEST")).toHaveLength(1);
  });

  it(`1日${MYPAGE_DAILY_LIMIT}回まで`, async () => {
    for (let i = 0; i < MYPAGE_DAILY_LIMIT; i += 1) {
      expect(await requestMypageLink(deps(), "user-paid", `n${i}@example.com`)).toBe("sent");
    }
    expect(await requestMypageLink(deps(), "user-paid", "n9@example.com")).toBe("rate_limited");
    expect(slack.lookupCalls).toHaveLength(MYPAGE_DAILY_LIMIT);
  });

  it("課金中でない・すでにつながっている・メールの形が違う・off なら受け付けない", async () => {
    expect(await requestMypageLink(deps(), "user-free", "a@example.com")).toBe("not_paid");
    expect(await requestMypageLink(deps(), "user-paid", "not-an-email")).toBe("invalid_email");
    store.links.push({ userId: "user-paid", teamId: TEAM_ID, slackUserId: "U_X", linkedVia: "email" });
    expect(await requestMypageLink(deps(), "user-paid", "a@example.com")).toBe("already_linked");
    store.settings = { ...store.settings!, mode: "dry_run" };
    expect(await requestMypageLink(deps(), "user-paid", "a@example.com")).toBe("unavailable");
    expect(slack.lookupCalls).toHaveLength(0);
  });

  it("送ったリンクで、そのまま /slack/link からつなげる", async () => {
    slack.lookupResult = () => ({ kind: "ok", data: makeMember({ id: "U_SLACK" }) });
    await requestMypageLink(deps(), "user-paid", "a@example.com");
    const raw = /t=([A-Za-z0-9_-]+)\|/.exec(slack.textsTo("U_SLACK")[0])![1];
    expect(await confirmLink(store, raw, "user-paid")).toBe("linked");
    expect(store.links[0]).toMatchObject({ slackUserId: "U_SLACK", linkedVia: "mypage" });
  });
});
