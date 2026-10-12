import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { processDelivery, runSweep, STALE_SENDING_MS } from "@/lib/slack-welcome/process";
import { WELCOME_MESSAGE } from "@/lib/slack-welcome/message";
import { FakeSlack, MemoryStore, makeDeps, makeUser, seed, TEAM_ID } from "./helpers";

let store: MemoryStore;
let slack: FakeSlack;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = new MemoryStore();
  slack = new FakeSlack();
});

describe("processDelivery: 正常系", () => {
  it("live: users.info → conversations.open → chat.postMessage で1通送り sent を記録する", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);

    expect(await processDelivery(deps, id)).toBe("sent");
    expect(slack.postCalls).toHaveLength(1);
    expect(slack.postCalls[0]).toEqual({ channelId: "D-U0NEW", text: deps.message.text });
    const row = store.get("U0NEW")!;
    expect(row.status).toBe("sent");
    expect(row.messageTs).toMatch(/^1700000000/);
    expect(row.channelId).toBe("D-U0NEW");
    expect(row.messageVersion).toBe(2);
    expect(row.claimToken).toBeNull();
  });

  it("送信後にもう一度処理しても追加送信しない", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    await processDelivery(deps, id);
    expect(await processDelivery(deps, id)).toBe("not_claimed");
    expect(slack.postCalls).toHaveLength(1);
  });

  it("並行実行しても1通だけ送る", async () => {
    const { deps } = makeDeps({ store, slack });
    slack.postDelayMs = 5;
    const id = await seed(store);
    const outcomes = await Promise.all([
      processDelivery(deps, id),
      processDelivery(deps, id),
      processDelivery(deps, id),
    ]);
    expect(outcomes.filter((o) => o === "sent")).toHaveLength(1);
    expect(outcomes.filter((o) => o === "not_claimed")).toHaveLength(2);
    expect(slack.postCalls).toHaveLength(1);
  });
});

describe("processDelivery: 対象外の除外", () => {
  it.each([
    ["ボット", makeUser({ isBot: true }), "bot"],
    ["ワークフローボット", makeUser({ isWorkflowBot: true }), "bot"],
    ["アプリユーザー", makeUser({ isAppUser: true }), "bot"],
    ["Slackbot", makeUser({ id: "USLACKBOT" }), "bot"],
    ["退会済み", makeUser({ deleted: true }), "deleted"],
    ["マルチチャンネルゲスト", makeUser({ isRestricted: true }), "guest"],
    ["シングルチャンネルゲスト", makeUser({ isUltraRestricted: true }), "guest"],
    ["別チーム", makeUser({ teamId: "T0OTHER" }), "other_team"],
  ])("%s は skipped（DMしない）", async (_label, user, reason) => {
    const { deps } = makeDeps({ store, slack });
    slack.userFor = () => ({ kind: "ok", data: user });
    const id = await seed(store);
    expect(await processDelivery(deps, id)).toBe("skipped");
    expect(store.get("U0NEW")!.status).toBe("skipped");
    expect(store.get("U0NEW")!.lastErrorCode).toBe(reason);
    expect(slack.openCalls).toHaveLength(0);
    expect(slack.postCalls).toHaveLength(0);
  });

  it("招待中は pending_activation にして、後で拾い直す", async () => {
    const { deps, nowRef } = makeDeps({ store, slack });
    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u, isInvitedUser: true }) });
    const id = await seed(store);
    expect(await processDelivery(deps, id)).toBe("pending_activation");
    expect(slack.postCalls).toHaveLength(0);

    // 参加完了後（1時間後）の拾い直しで送られる
    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u }) });
    nowRef.now = new Date(nowRef.now.getTime() + 61 * 60 * 1000);
    expect(await processDelivery(deps, id)).toBe("sent");
    expect(slack.postCalls).toHaveLength(1);
  });

  it("招待中だった人は、20時間を過ぎても7日以内なら参加完了後に送る", async () => {
    const { deps, nowRef } = makeDeps({ store, slack });
    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u, isInvitedUser: true }) });
    const id = await seed(store);
    expect(await processDelivery(deps, id)).toBe("pending_activation");

    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u }) });
    nowRef.now = new Date(nowRef.now.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(await processDelivery(deps, id)).toBe("sent");

    // 7日を過ぎた招待中の行は送らない
    const late = await seed(store, "U0LATE", nowRef.now);
    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u, isInvitedUser: true }) });
    expect(await processDelivery(deps, late)).toBe("pending_activation");
    nowRef.now = new Date(nowRef.now.getTime() + 8 * 24 * 60 * 60 * 1000);
    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u }) });
    expect(await processDelivery(deps, late)).toBe("skipped");
    expect(store.get("U0LATE")!.lastErrorCode).toBe("expired");
    expect(slack.postCalls).toHaveLength(1);
  });

  it("users.info が user_not_found なら skipped", async () => {
    const { deps } = makeDeps({ store, slack });
    slack.userFor = () => ({ kind: "slack_error", error: "user_not_found" });
    const id = await seed(store);
    expect(await processDelivery(deps, id)).toBe("skipped");
  });
});

describe("processDelivery: モード", () => {
  it("off: 行を確保もせず何もしない", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    store.settings = { ...store.settings!, mode: "off" };
    expect(await processDelivery(deps, id)).toBe("off");
    expect(store.get("U0NEW")!.status).toBe("queued");
    expect(slack.usersInfoCalls).toHaveLength(0);
  });

  it("設定行が無いときは off 扱い", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    store.settings = null;
    expect(await processDelivery(deps, id)).toBe("off");
  });

  it("dry_run: 判定だけ記録し、DMを送らず、送信済みにしない", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    store.settings = { ...store.settings!, mode: "dry_run" };
    expect(await processDelivery(deps, id)).toBe("dry_run");
    const row = store.get("U0NEW")!;
    expect(row.status).toBe("queued");
    expect(row.dryRunResult).toBe("would_send");
    expect(row.dryRunAt).not.toBeNull();
    expect(row.attempts).toBe(0);
    expect(slack.openCalls).toHaveLength(0);
    expect(slack.postCalls).toHaveLength(0);
  });

  it("dry_run: 本文が未承認なら would_block と記録する", async () => {
    const { deps } = makeDeps({ store, slack, message: WELCOME_MESSAGE });
    const id = await seed(store);
    store.settings = { ...store.settings!, mode: "dry_run" };
    await processDelivery(deps, id);
    expect(store.get("U0NEW")!.dryRunResult).toBe("would_block:message_not_approved");
  });

  it("test: テスト対象のIDだけに送り、それ以外は skipped(not_test_target)", async () => {
    const { deps } = makeDeps({ store, slack });
    store.settings = { ...store.settings!, mode: "test", testUserIds: ["U0TESTER"] };
    const target = await seed(store, "U0TESTER");
    const other = await seed(store, "U0OTHER");

    expect(await processDelivery(deps, target)).toBe("sent");
    expect(await processDelivery(deps, other)).toBe("skipped");
    expect(store.get("U0OTHER")!.lastErrorCode).toBe("not_test_target");
    expect(slack.postCalls).toHaveLength(1);
    expect(slack.postCalls[0].channelId).toBe("D-U0TESTER");
  });

  it("運用開始時刻(enabled_from)より前の参加は送らない", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    store.settings = { ...store.settings!, enabledFrom: new Date("2026-10-12T04:00:00Z") };
    expect(await processDelivery(deps, id)).toBe("skipped");
    expect(store.get("U0NEW")!.lastErrorCode).toBe("before_enabled_from");
    expect(slack.postCalls).toHaveLength(0);
  });

  it("enabled_from が未設定なら誰にも送らない", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    store.settings = { ...store.settings!, enabledFrom: null };
    expect(await processDelivery(deps, id)).toBe("skipped");
    expect(slack.postCalls).toHaveLength(0);
  });

  it("投稿直前に off に切り替わったら送らない", async () => {
    const { deps } = makeDeps({ store, slack });
    const id = await seed(store);
    slack.openDm = async (userId: string) => {
      store.settings = { ...store.settings!, mode: "off" };
      return { kind: "ok", data: { channelId: `D-${userId}` } };
    };
    expect(await processDelivery(deps, id)).toBe("mode_changed");
    expect(store.get("U0NEW")!.status).toBe("queued");
    expect(slack.postCalls).toHaveLength(0);
  });
});

describe("processDelivery: 本文の承認", () => {
  it.each(["test", "live"] as const)("%s でも未承認の本文では送らず、OPS に件数だけ知らせる", async (mode) => {
    const { deps, alerts } = makeDeps({ store, slack, message: WELCOME_MESSAGE });
    store.settings = { ...store.settings!, mode, testUserIds: ["U0NEW"] };
    const id = await seed(store);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await processDelivery(deps, id)).toBe("blocked_message");
    expect(slack.openCalls).toHaveLength(0);
    expect(slack.postCalls).toHaveLength(0);
    expect(store.get("U0NEW")!.status).toBe("queued");
    expect(store.get("U0NEW")!.lastErrorCode).toBe("message_not_approved");
    expect(alerts).toEqual([{ message_not_approved: 1 }]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("processDelivery: 失敗時", () => {
  it("投稿で 429 → Retry-After 以上待ってから送り直し、1通だけ送る", async () => {
    const { deps, sleeps } = makeDeps({ store, slack });
    slack.postQueue.push({ kind: "rate_limited", retryAfterSec: 7 });
    const id = await seed(store);

    expect(await processDelivery(deps, id)).toBe("sent");
    expect(sleeps).toHaveLength(1);
    expect(sleeps[0]).toBeGreaterThanOrEqual(7000);
    // 429 の投稿は Slack に断られている（実際に届いたのは2回目の1通）
    expect(slack.postCalls).toHaveLength(2);
    expect(store.get("U0NEW")!.status).toBe("sent");
    expect(store.get("U0NEW")!.attempts).toBe(2);
  });

  it("429 の Retry-After が長いときは retry_wait にして、その時刻まで確保できない", async () => {
    const { deps, nowRef } = makeDeps({ store, slack });
    slack.userFor = () => ({ kind: "rate_limited", retryAfterSec: 120 });
    const id = await seed(store);

    expect(await processDelivery(deps, id)).toBe("retry_wait");
    const row = store.get("U0NEW")!;
    expect(row.status).toBe("retry_wait");
    expect(row.nextAttemptAt.getTime() - nowRef.now.getTime()).toBeGreaterThanOrEqual(120_000);
    expect(await processDelivery(deps, id)).toBe("not_claimed");

    slack.userFor = (u) => ({ kind: "ok", data: makeUser({ id: u }) });
    nowRef.now = new Date(nowRef.now.getTime() + 121_000);
    expect(await processDelivery(deps, id)).toBe("sent");
    expect(slack.postCalls).toHaveLength(1);
  });

  it("投稿前のタイムアウトは有限回だけリトライし、超えたら failed", async () => {
    const { deps, alerts, nowRef } = makeDeps({ store, slack });
    slack.userFor = () => ({ kind: "timeout" });
    const id = await seed(store);

    // 待ちが長くなると retry_wait になる → 時刻を進めて拾い直しを繰り返す
    let outcome = await processDelivery(deps, id);
    for (let i = 0; i < 10 && outcome === "retry_wait"; i += 1) {
      nowRef.now = new Date(nowRef.now.getTime() + 60 * 60 * 1000);
      outcome = await processDelivery(deps, id);
    }
    expect(outcome).toBe("failed");
    expect(store.get("U0NEW")!.attempts).toBe(5);
    expect(slack.usersInfoCalls).toHaveLength(5);
    expect(slack.postCalls).toHaveLength(0);
    expect(alerts).toContainEqual({ failed: 1 });
  });

  it.each([
    ["タイムアウト", { kind: "timeout" as const }],
    ["5xx", { kind: "http_error" as const, status: 503 }],
    ["応答不明", { kind: "network_error" as const }],
    ["internal_error", { kind: "slack_error" as const, error: "internal_error" }],
  ])("投稿後の%s → needs_review にして、自動で送り直さない", async (_label, result) => {
    const { deps, alerts, nowRef } = makeDeps({ store, slack });
    slack.postQueue.push(result);
    const id = await seed(store);

    expect(await processDelivery(deps, id)).toBe("needs_review");
    expect(store.get("U0NEW")!.status).toBe("needs_review");
    expect(alerts).toEqual([{ needs_review: 1 }]);

    // 拾い直し（cron）でも送らない
    nowRef.now = new Date(nowRef.now.getTime() + 60 * 60 * 1000);
    await runSweep(deps);
    expect(await processDelivery(deps, id)).toBe("not_claimed");
    expect(slack.postCalls).toHaveLength(1);
  });

  it("権限エラーは failed（送り直さない）", async () => {
    const { deps, alerts } = makeDeps({ store, slack });
    slack.openQueue.push({ kind: "slack_error", error: "missing_scope" });
    const id = await seed(store);
    expect(await processDelivery(deps, id)).toBe("failed");
    expect(store.get("U0NEW")!.lastErrorCode).toBe("missing_scope");
    expect(slack.postCalls).toHaveLength(0);
    expect(alerts).toEqual([{ failed: 1 }]);
  });

  it("投稿で Slack が断ったエラー（channel_not_found 等）は failed", async () => {
    const { deps } = makeDeps({ store, slack });
    slack.postQueue.push({ kind: "slack_error", error: "channel_not_found" });
    const id = await seed(store);
    expect(await processDelivery(deps, id)).toBe("failed");
    expect(slack.postCalls).toHaveLength(1);
  });

  it("最初の受信から20時間を過ぎた行は送らない", async () => {
    const { deps, nowRef } = makeDeps({ store, slack });
    const id = await seed(store);
    nowRef.now = new Date(nowRef.now.getTime() + 21 * 60 * 60 * 1000);
    expect(await processDelivery(deps, id)).toBe("skipped");
    expect(store.get("U0NEW")!.lastErrorCode).toBe("expired");
    expect(slack.usersInfoCalls).toHaveLength(0);
  });

  it("sent の記録に失敗しても送り直さず、cron が古い sending を needs_review にする", async () => {
    const { deps, alerts, nowRef } = makeDeps({ store, slack });
    const id = await seed(store);
    const originalUpdate = store.update.bind(store);
    store.update = async (rowId, token, expected, patch) => {
      if (patch.status === "sent") throw new Error("delivery update failed: boom");
      return originalUpdate(rowId, token, expected, patch);
    };
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await processDelivery(deps, id)).toBe("error");
    expect(store.get("U0NEW")!.status).toBe("sending");
    store.update = originalUpdate;

    nowRef.now = new Date(nowRef.now.getTime() + STALE_SENDING_MS + 1000);
    const result = await runSweep(deps);
    expect(result.staleSending).toBe(1);
    expect(store.get("U0NEW")!.status).toBe("needs_review");
    expect(alerts).toContainEqual({ needs_review: 1 });
    expect(slack.postCalls).toHaveLength(1);
  });

  it("期限切れの processing は cron が拾い直す（投稿前に落ちたケース）", async () => {
    const { deps, nowRef } = makeDeps({ store, slack });
    const id = await seed(store);
    // 確保だけして落ちた状態を再現
    await store.claim(id, nowRef.now, new Date(nowRef.now.getTime() + 1000), "dead-token");
    expect(await processDelivery(deps, id)).toBe("not_claimed");

    nowRef.now = new Date(nowRef.now.getTime() + 5000);
    const result = await runSweep(deps);
    expect(result.outcomes.sent).toBe(1);
    expect(slack.postCalls).toHaveLength(1);
    expect(store.get("U0NEW")!.teamId).toBe(TEAM_ID);
  });
});

describe("runSweep", () => {
  it("off のときは送らない（古い sending の点検だけする）", async () => {
    const { deps } = makeDeps({ store, slack });
    await seed(store);
    store.settings = { ...store.settings!, mode: "off" };
    const result = await runSweep(deps);
    expect(result.processed).toBe(0);
    expect(slack.usersInfoCalls).toHaveLength(0);
  });

  it("queued の取りこぼしを拾って送る", async () => {
    const { deps } = makeDeps({ store, slack });
    await seed(store, "U0A");
    await seed(store, "U0B");
    const result = await runSweep(deps);
    expect(result.outcomes.sent).toBe(2);
    expect(slack.postCalls).toHaveLength(2);
  });
});
