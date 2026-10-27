// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { buildOwnerReport, runSync } from "@/lib/slack-member-sync/process";
import { hashToken } from "@/lib/slack-member-sync/tokens";
import { LINK_REQUEST_MESSAGE } from "@/lib/slack-member-sync/messages/link-request";
import { REMOVAL_NOTICE_MESSAGE } from "@/lib/slack-member-sync/messages/removal-notice";
import { OWNER_REPORT_MESSAGE } from "@/lib/slack-member-sync/messages/owner-report";
import {
  APPROVED_MESSAGES,
  FakeSyncSlack,
  MemorySyncStore,
  TEAM_ID,
  makeState,
  makeSyncDeps,
  memberWithEmail,
} from "./helpers";

let store: MemorySyncStore;
let slack: FakeSyncSlack;

const PAID = { hasPaidRecord: true, isActive: true, cancelAtPeriodEnd: false, cancelAt: null, currentPeriodEnd: new Date("2026-11-20T00:00:00Z") };
const CANCELED = { hasPaidRecord: true, isActive: false, cancelAtPeriodEnd: false, cancelAt: null, currentPeriodEnd: new Date("2025-05-01T00:00:00Z") };
const RESERVED = { ...PAID, cancelAtPeriodEnd: true, cancelAt: new Date("2026-11-20T00:00:00Z") };

/** よくある顔ぶれ: 課金中・解約済み・未接続・ボット・管理者 */
function seedTypical() {
  slack.members = [
    memberWithEmail("U_PAID", "paid@example.com"),
    memberWithEmail("U_CANCEL", "Canceled@Example.com"),
    memberWithEmail("U_STRANGER", "stranger@example.com"),
    memberWithEmail("U_BOT", null, { isBot: true }),
    memberWithEmail("U0OWNER", "owner@example.com", { isPrimaryOwner: true, isOwner: true, isAdmin: true }),
  ];
  store.users = [
    { userId: "user-paid", email: "paid@example.com", sub: PAID },
    { userId: "user-cancel", email: "canceled@example.com", sub: CANCELED },
  ];
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = new MemorySyncStore();
  slack = new FakeSyncSlack();
});

describe("runSync: 止めるスイッチ・ロック・取得失敗", () => {
  it("mode=off なら Slack を呼ばず何もしない", async () => {
    store.settings = { ...store.settings!, mode: "off" };
    seedTypical();
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.skipped).toBe("off");
    expect(slack.listCalls).toHaveLength(0);
    expect(store.states.size).toBe(0);
  });

  it("設定行がなければ off と同じ", async () => {
    store.settings = null;
    const { deps } = makeSyncDeps({ store, slack });
    expect((await runSync(deps)).skipped).toBe("off");
  });

  it("別の実行がロック中なら何もしない", async () => {
    seedTypical();
    store.lockedUntil = new Date("2026-10-27T02:00:00Z");
    const { deps } = makeSyncDeps({ store, slack });
    expect((await runSync(deps)).skipped).toBe("locked");
    expect(slack.listCalls).toHaveLength(0);
  });

  it("終わったらロックを外す", async () => {
    seedTypical();
    const { deps } = makeSyncDeps({ store, slack });
    await runSync(deps);
    expect(store.lockedUntil).toBeNull();
  });

  it("users.list が失敗したら何も書かずに止め、OPS に知らせる", async () => {
    seedTypical();
    slack.listQueue.push({ kind: "slack_error", error: "missing_scope" });
    const { deps, alerts } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.error).toBe("users_list_missing_scope");
    expect(store.states.size).toBe(0);
    expect(slack.postCalls).toHaveLength(0);
    expect(alerts).toContainEqual({ users_list_missing_scope: 1 });
  });

  it("途中のページで失敗したら、途中までの一覧で判定しない", async () => {
    seedTypical();
    slack.pageSize = 2;
    slack.listQueue.push(
      { kind: "ok", data: { members: slack.members.slice(0, 2), nextCursor: "2" } },
      { kind: "http_error", status: 500 },
    );
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.error).toBe("users_list_http_500");
    expect(store.states.size).toBe(0);
  });

  it("users.list の 429 は Retry-After だけ待って続きから取る", async () => {
    seedTypical();
    slack.pageSize = 2;
    slack.listQueue.push(
      { kind: "ok", data: { members: slack.members.slice(0, 2), nextCursor: "2" } },
      { kind: "rate_limited", retryAfterSec: 3 },
    );
    const { deps, sleeps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.error).toBeUndefined();
    expect(sleeps).toContain(3000);
    expect(slack.listCalls).toEqual([null, "2", "2", "4"]);
    expect(r.members).toBe(5);
  });

  it("メールが1件も取れない（users:read.email なし）なら、全員につなぐお願いを送らないよう止める", async () => {
    slack.members = [memberWithEmail("U1", null), memberWithEmail("U2", null)];
    const { deps, alerts } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.error).toBe("no_emails");
    expect(slack.postCalls).toHaveLength(0);
    expect(store.states.size).toBe(0);
    expect(alerts).toContainEqual({ no_emails: 1 });
  });
  it("全員が対象外（チームIDの取り違え等）なら no_targets で止める", async () => {
    slack.members = [memberWithEmail("U1", "a@example.com", { teamId: "T0OTHER" })];
    const { deps, alerts } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.error).toBe("no_targets");
    expect(alerts).toContainEqual({ no_targets: 1 });
  });
});

describe("runSync: dry_run", () => {
  it("DM を送らず、判定と予定（dry_run_result）だけ記録する", async () => {
    store.settings = { ...store.settings!, mode: "dry_run" };
    seedTypical();
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);

    expect(slack.openCalls).toHaveLength(0);
    expect(slack.postCalls).toHaveLength(0);
    expect(r.classifications).toEqual({ keep: 1, remove_scheduled: 1, needs_link: 1 });
    expect(r.ownerReport).toBe("skipped_mode");

    const cancel = store.states.get("U_CANCEL")!;
    expect(cancel.classification).toBe("remove_scheduled");
    expect(cancel.removeAfter).toBeNull(); // 送っていないので外す日は決まらない
    expect(cancel.dryRunResult).toBe("would_send:removal_notice:remove_after=2026-11-03");
    expect(store.states.get("U_STRANGER")!.dryRunResult).toBe("would_send:link_request:deadline=2026-11-10");
    expect(store.states.get("U_PAID")!.dryRunResult).toBe("keep");
    // ボット・オーナーは記録しない
    expect(store.states.has("U_BOT")).toBe(false);
    expect(store.states.has("U0OWNER")).toBe(false);
  });

  it("本文が未承認なら would_block として記録する", async () => {
    store.settings = { ...store.settings!, mode: "dry_run" };
    seedTypical();
    const { deps } = makeSyncDeps({
      store,
      slack,
      messages: { linkRequest: LINK_REQUEST_MESSAGE, removalNotice: REMOVAL_NOTICE_MESSAGE, ownerReport: OWNER_REPORT_MESSAGE },
    });
    await runSync(deps);
    expect(store.states.get("U_CANCEL")!.dryRunResult).toMatch(/^would_block:message_not_approved:removal_notice/);
  });

  it("課金中のアカウントとメールが一致したら自動でつなぐ（大文字・空白の違いは同じとみなす）", async () => {
    store.settings = { ...store.settings!, mode: "dry_run" };
    seedTypical();
    store.users.push({ userId: "user-paid2", email: "paid2@example.com", sub: PAID });
    slack.members.push(memberWithEmail("U_PAID2", "  PAID2@example.com "));
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.linksCreated).toBe(2);
    expect(store.links).toContainEqual({ userId: "user-paid2", teamId: TEAM_ID, slackUserId: "U_PAID2", linkedVia: "email" });
    // 解約済みの人はつながない（判定には使う）
    expect(store.links.some((l) => l.userId === "user-cancel")).toBe(false);
  });
});

describe("runSync: live", () => {
  it("解約済みに外れるお知らせ、未接続につなぐお願いを1通ずつ。課金中には送らない", async () => {
    seedTypical();
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);

    expect(r.dm.sent).toEqual({ removal_notice: 1, link_request: 1 });
    expect(slack.textsTo("U_PAID")).toHaveLength(0);
    expect(slack.textsTo("U_CANCEL")).toEqual([
      "5月1日で終了、11月3日に外れます <https://www.bo-no.design/subscription|登録>",
    ]);

    const cancel = store.states.get("U_CANCEL")!;
    expect(cancel.removeAfter).toBe("2026-11-03");
    expect(cancel.removalNoticeDmAt).not.toBeNull();
    expect(cancel.removalNoticeVersion).toBe(3);
    expect(cancel.needsReview).toBe(false);

    const stranger = store.states.get("U_STRANGER")!;
    expect(stranger.linkDeadline).toBe("2026-11-10");
    expect(stranger.linkRequestDmAt).not.toBeNull();
    // DM のリンクの値はハッシュだけが保存されている
    const [text] = slack.textsTo("U_STRANGER");
    const raw = /\/slack\/link\?t=([A-Za-z0-9_-]+)\|/.exec(text)![1];
    expect(text).toContain("期限 11月10日");
    expect(store.tokens).toHaveLength(1);
    expect(store.tokens[0]).toMatchObject({ tokenHash: hashToken(raw), slackUserId: "U_STRANGER", purpose: "link_request" });
    expect(store.tokens[0].tokenHash).not.toContain(raw);
    // 期限 + 30日有効
    expect(store.tokens[0].expiresAt.toISOString()).toBe("2026-12-10T01:30:00.000Z");
  });

  it("2回目の実行では同じ DM を送らない", async () => {
    seedTypical();
    const { deps, nowRef } = makeSyncDeps({ store, slack });
    await runSync(deps);
    nowRef.now = new Date("2026-10-28T01:30:00Z");
    const r = await runSync(deps);
    expect(r.dm.sent).toEqual({});
    expect(slack.postCalls).toHaveLength(2);
  });

  it("変わっていない行は書き直さない", async () => {
    seedTypical();
    const { deps } = makeSyncDeps({ store, slack });
    await runSync(deps);
    const r = await runSync(deps);
    expect(r.statesWritten).toBe(0);
  });

  it("解約予約の人は、終わる日の翌日に外す（お知らせは予約が分かった日に1回）", async () => {
    slack.members = [memberWithEmail("U_RES", "res@example.com"), memberWithEmail("U_X", "x@example.com")];
    store.users = [{ userId: "user-res", email: "res@example.com", sub: RESERVED }];
    store.links = [];
    const { deps } = makeSyncDeps({ store, slack });
    await runSync(deps);
    expect(store.states.get("U_RES")!.removeAfter).toBe("2026-11-21");
    expect(store.states.get("U_RES")!.reason).toBe("cancel_reserved");
    // 解約予約中も課金中なので、自動でつなぐ
    expect(store.links.map((l) => l.slackUserId)).toContain("U_RES");
  });

  it("本文が未承認なら live でも送らず、印を付けて OPS に知らせる。承認後の実行で送る", async () => {
    seedTypical();
    const unapproved = {
      linkRequest: LINK_REQUEST_MESSAGE,
      removalNotice: REMOVAL_NOTICE_MESSAGE,
      ownerReport: OWNER_REPORT_MESSAGE,
    };
    const { deps, alerts } = makeSyncDeps({ store, slack, messages: unapproved });
    const r = await runSync(deps);
    expect(slack.postCalls).toHaveLength(0);
    expect(r.dm.blocked).toBe(2);
    expect(store.states.get("U_CANCEL")!.needsReview).toBe(true);
    expect(store.states.get("U_CANCEL")!.reviewReason).toBe("message_not_approved");
    expect(alerts).toContainEqual({ message_not_approved: 2 });
    // 本文未承認の印は「確認が必要な人」には数えない
    expect(r.needsReview).toBe(0);

    deps.messages = APPROVED_MESSAGES;
    const r2 = await runSync(deps);
    expect(r2.dm.sent).toEqual({ removal_notice: 1, link_request: 1 });
    expect(store.states.get("U_CANCEL")!.needsReview).toBe(false);
  });

  it("投稿がタイムアウトしたら needs_review にし、次の実行でも送り直さない", async () => {
    slack.members = [memberWithEmail("U_CANCEL", "canceled@example.com"), memberWithEmail("U_X", "x@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    slack.postQueue.push({ kind: "timeout" });
    const { deps, alerts } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.dm.needsReview).toBe(1);
    const s = store.states.get("U_CANCEL")!;
    expect(s.needsReview).toBe(true);
    expect(s.reviewReason).toBe("send_unknown:timeout");
    expect(s.removeAfter).toBeNull();
    expect(alerts).toContainEqual(expect.objectContaining({ needs_review: 1 }));

    const before = slack.textsTo("U_CANCEL").length;
    await runSync(deps);
    expect(slack.textsTo("U_CANCEL")).toHaveLength(before);
  });

  it("Slack の内部エラーも送れたか分からない扱い", async () => {
    slack.members = [memberWithEmail("U_CANCEL", "canceled@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    slack.postQueue.push({ kind: "slack_error", error: "internal_error" });
    const { deps } = makeSyncDeps({ store, slack });
    await runSync(deps);
    expect(store.states.get("U_CANCEL")!.reviewReason).toBe("send_unknown:internal_error");
  });

  it("記録の途中で落ちても sending の印が残り、送り直さない", async () => {
    slack.members = [memberWithEmail("U_CANCEL", "canceled@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    store.failPatch = true;
    const { deps } = makeSyncDeps({ store, slack });
    await expect(runSync(deps)).rejects.toThrow();
    expect(store.states.get("U_CANCEL")!.reviewReason).toBe("sending:removal_notice");
    expect(store.lockedUntil).toBeNull();
    store.failPatch = false;
    await runSync(deps);
    expect(slack.textsTo("U_CANCEL")).toHaveLength(1);
  });

  it("投稿の 429 は待ってから1回だけ送り直す", async () => {
    slack.members = [memberWithEmail("U_CANCEL", "canceled@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    slack.postQueue.push({ kind: "rate_limited", retryAfterSec: 2 });
    const { deps, sleeps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(sleeps).toContain(2000);
    expect(r.dm.sent).toEqual({ removal_notice: 1 });
    expect(slack.postCalls).toHaveLength(2);
    expect(store.states.get("U_CANCEL")!.needsReview).toBe(false);
  });

  it("DM を開けない相手（user_not_found 等）は dm_failed で確認待ちにする", async () => {
    slack.members = [memberWithEmail("U_CANCEL", "canceled@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    slack.openQueue.push({ kind: "slack_error", error: "cannot_dm_bot" });
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.dm.failed).toBe(1);
    expect(store.states.get("U_CANCEL")!.reviewReason).toBe("dm_failed:cannot_dm_bot");
    expect(slack.postCalls.filter((c) => c.channelId === "D-U_CANCEL")).toHaveLength(0);
  });

  it("DM を開くのがタイムアウトしたら今回は見送り、次の実行で送る", async () => {
    slack.members = [memberWithEmail("U_CANCEL", "canceled@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    slack.openQueue.push({ kind: "timeout" });
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.dm.deferred).toBe(1);
    expect(store.states.get("U_CANCEL")!.needsReview).toBe(false);
    await runSync(deps);
    expect(slack.textsTo("U_CANCEL")).toHaveLength(1);
  });

  it("トークン・権限の問題が出たら、残りの DM を止める", async () => {
    slack.members = [
      memberWithEmail("U_A", "a@example.com"),
      memberWithEmail("U_B", "b@example.com"),
      memberWithEmail("U_C", "c@example.com"),
    ];
    slack.openQueue.push({ kind: "slack_error", error: "missing_scope" });
    const { deps, alerts } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.dm.aborted).toBe("missing_scope");
    expect(slack.openCalls).toHaveLength(1);
    expect(r.dm.deferred).toBe(2);
    expect(alerts).toContainEqual(expect.objectContaining({ aborted_missing_scope: 1 }));
  });

  it("1回の実行で送る数に上限がある（残りは次の日）", async () => {
    slack.members = Array.from({ length: 5 }, (_, i) => memberWithEmail(`U_${i}`, `${i}@example.com`));
    const { deps, nowRef } = makeSyncDeps({ store, slack });
    deps.limits = { ...deps.limits, maxDms: 2 };
    const r = await runSync(deps);
    expect(r.dm.sent).toEqual({ link_request: 2 });
    expect(r.dm.deferred).toBe(3);
    nowRef.now = new Date("2026-10-28T01:30:00Z");
    const r2 = await runSync(deps);
    expect(r2.dm.sent).toEqual({ link_request: 2 });
    // 期限はそれぞれ送った日から数える
    expect(store.states.get("U_0")!.linkDeadline).toBe("2026-11-10");
    expect(store.states.get("U_2")!.linkDeadline).toBe("2026-11-11");
  });

  it("外れるお知らせを先に送る", async () => {
    slack.members = [memberWithEmail("U_X", "x@example.com"), memberWithEmail("U_CANCEL", "canceled@example.com")];
    store.users = [{ userId: "user-cancel", email: "canceled@example.com", sub: CANCELED }];
    const { deps } = makeSyncDeps({ store, slack });
    deps.limits = { ...deps.limits, maxDms: 1 };
    await runSync(deps);
    expect(slack.openCalls).toEqual(["U_CANCEL"]);
  });

  it("送っている途中で off にされたら、それ以降は送らない", async () => {
    slack.members = Array.from({ length: 3 }, (_, i) => memberWithEmail(`U_${i}`, `${i}@example.com`));
    // 1回目: 実行開始 / 2回目: 1通目の直前 / 3回目以降: off
    store.settingsAfter = { calls: 2, settings: { ...store.settings!, mode: "off" } };
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(slack.postCalls).toHaveLength(1);
    expect(r.dm.deferred).toBe(2);
  });
});

describe("runSync: test モード", () => {
  it("test_user_ids の人だけに送り、ほかは判定だけ記録する", async () => {
    seedTypical();
    store.settings = { ...store.settings!, mode: "test", testUserIds: ["U_STRANGER"] };
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.dm.sent).toEqual({ link_request: 1 });
    expect(slack.textsTo("U_CANCEL")).toHaveLength(0);
    expect(store.states.get("U_CANCEL")!.dryRunResult).toBe(
      "not_test_target:would_send:removal_notice:remove_after=2026-11-03",
    );
    expect(store.states.get("U_CANCEL")!.removalNoticeDmAt).toBeNull();
  });
});

describe("runSync: 外す前の再課金・つながり・外された確認", () => {
  it("お知らせのあと再課金したら keep に戻り、外す予定が消える（DMなし）", async () => {
    seedTypical();
    const { deps, nowRef } = makeSyncDeps({ store, slack });
    await runSync(deps);
    store.users.find((u) => u.userId === "user-cancel")!.sub = PAID;
    nowRef.now = new Date("2026-10-29T01:30:00Z");
    const before = slack.postCalls.length;
    await runSync(deps);
    const s = store.states.get("U_CANCEL")!;
    expect(s.classification).toBe("keep");
    expect(s.removeAfter).toBeNull();
    expect(s.resolvedReason).toBe("resubscribed");
    expect(slack.postCalls).toHaveLength(before);
  });

  it("つなぐお願いのあと、DM リンクでつながったら keep（linked）", async () => {
    seedTypical();
    const { deps, nowRef } = makeSyncDeps({ store, slack });
    await runSync(deps);
    // 別メールの課金中アカウントとつながった
    store.users.push({ userId: "user-other-mail", email: "work@example.com", sub: PAID });
    store.links.push({ userId: "user-other-mail", teamId: TEAM_ID, slackUserId: "U_STRANGER", linkedVia: "dm_link" });
    nowRef.now = new Date("2026-10-30T01:30:00Z");
    await runSync(deps);
    expect(store.states.get("U_STRANGER")!.classification).toBe("keep");
    expect(store.states.get("U_STRANGER")!.resolvedReason).toBe("linked");
  });

  it("外す予定の人が Slack で削除済みになったら resolved（deactivated）で閉じる", async () => {
    seedTypical();
    const { deps, nowRef } = makeSyncDeps({ store, slack });
    await runSync(deps);
    slack.members = slack.members.map((m) => (m.id === "U_CANCEL" ? { ...m, deleted: true } : m));
    nowRef.now = new Date("2026-11-04T01:30:00Z");
    const r = await runSync(deps);
    expect(store.states.get("U_CANCEL")!.classification).toBe("resolved");
    expect(store.states.get("U_CANCEL")!.resolvedReason).toBe("deactivated");
    expect(r.due).toBe(0);
  });
});

describe("オーナーへの報告", () => {
  function seedDue() {
    slack.members = [
      memberWithEmail("U_CANCEL", "canceled@example.com", { displayName: "解約 <太郎>" }),
      memberWithEmail("U_LINK", "l@example.com", { displayName: "未接続花子" }),
      memberWithEmail("U_LATER", "later@example.com"),
    ];
    store.users = [
      { userId: "user-cancel", email: "canceled@example.com", sub: CANCELED },
      { userId: "user-later", email: "later@example.com", sub: CANCELED },
    ];
    store.states.set(
      "U_CANCEL",
      makeState({
        slackUserId: "U_CANCEL",
        classification: "remove_scheduled",
        reason: "canceled",
        removalNoticeDmAt: new Date("2026-10-20T01:00:00Z"),
        removeAfter: "2026-10-27",
      }),
    );
    store.states.set(
      "U_LINK",
      makeState({
        slackUserId: "U_LINK",
        classification: "needs_link",
        reason: "not_linked",
        linkRequestDmAt: new Date("2026-10-12T01:00:00Z"),
        linkDeadline: "2026-10-26",
      }),
    );
    store.states.set(
      "U_LATER",
      makeState({
        slackUserId: "U_LATER",
        classification: "remove_scheduled",
        reason: "canceled",
        removalNoticeDmAt: new Date("2026-10-25T01:00:00Z"),
        removeAfter: "2026-11-01",
      }),
    );
  }

  it("外す日が来た人を、名前のプロフィールリンクと管理画面リンク付きで自分宛てに1通送る", async () => {
    seedDue();
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("sent");
    expect(r.due).toBe(2);
    const [report] = slack.textsTo("U0OWNER");
    expect(report).toContain("今日Slackから外す人：2人（解約1・未接続1）");
    expect(report).toContain("<https://app.slack.com/team/U_CANCEL|解約 &lt;太郎&gt;> 解約（外す日 10月27日）");
    expect(report).toContain("<https://app.slack.com/team/U_LINK|未接続花子> 未接続（外す日 10月27日）");
    expect(report).not.toContain("U_LATER");
    expect(report).toContain("<https://bono.slack.com/admin|管理>");
    expect(store.settings!.ownerReportSentOn).toBe("2026-10-27");
  });

  it("同じ日に二度送らない", async () => {
    seedDue();
    const { deps } = makeSyncDeps({ store, slack });
    await runSync(deps);
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("already_sent");
    expect(slack.textsTo("U0OWNER")).toHaveLength(1);
  });

  it("確認が必要な人（送れたか不明）も報告する", async () => {
    slack.members = [memberWithEmail("U_Q", "q@example.com", { displayName: "不明さん" })];
    store.states.set(
      "U_Q",
      makeState({ slackUserId: "U_Q", classification: "needs_link", needsReview: true, reviewReason: "send_unknown:timeout" }),
    );
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("sent");
    const [report] = slack.textsTo("U0OWNER");
    expect(report).toContain("今日Slackから外す人：0人");
    expect(report).toContain("確認が必要な人：1人");
    expect(report).toContain("<https://app.slack.com/team/U_Q|不明さん> DMが届いたか不明");
  });

  it("報告する人がいない日は送らない（auth.test も呼ばない）", async () => {
    seedTypical();
    const authTest = vi.spyOn(slack, "authTest");
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("none");
    expect(authTest).not.toHaveBeenCalled();
  });

  it("dry_run では送らない", async () => {
    seedDue();
    store.settings = { ...store.settings!, mode: "dry_run" };
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("skipped_mode");
    expect(slack.postCalls).toHaveLength(0);
  });

  it("本文が未承認なら送らない", async () => {
    seedDue();
    const { deps } = makeSyncDeps({ store, slack, messages: { ...APPROVED_MESSAGES, ownerReport: OWNER_REPORT_MESSAGE } });
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("blocked:message_not_approved");
    expect(slack.textsTo("U0OWNER")).toHaveLength(0);
  });

  it("ユーザートークンが別ワークスペースのものなら送らない", async () => {
    seedDue();
    slack.me = { kind: "ok", data: { userId: "U0OWNER", teamId: "T0OTHER", url: "https://x.slack.com/" } };
    const { deps, alerts } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    expect(r.ownerReport).toBe("failed:auth_test_other_team");
    expect(alerts).toContainEqual({ "owner_report_failed:auth_test_other_team": 1 });
  });

  it("buildOwnerReport: 多すぎる名前は上限で切って人数を出す", () => {
    const states = Array.from({ length: 65 }, (_, i) =>
      makeState({ slackUserId: `U${i}`, classification: "remove_scheduled", reason: "canceled", removeAfter: "2026-10-27" }),
    );
    const members = new Map(states.map((s) => [s.slackUserId, memberWithEmail(s.slackUserId, null)]));
    const r = buildOwnerReport(states, members, "2026-10-27", "https://bono.slack.com/admin")!;
    expect(r.due).toBe(65);
    expect(r.vars.due_list).toContain("…ほか 5人");
  });
});

describe("結果に個人情報を出さない", () => {
  it("返す JSON に名前・メール・ID が入らない", async () => {
    seedTypical();
    const { deps } = makeSyncDeps({ store, slack });
    const r = await runSync(deps);
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/U_[A-Z]/);
    expect(json).not.toContain("example.com");
    expect(json).not.toContain("名前");
  });
});
