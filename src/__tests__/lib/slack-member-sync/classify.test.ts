import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { classifyMember, endOf, isDueForRemoval, type ClassifyInput } from "@/lib/slack-member-sync/classify";
import { addDays, formatJpDate, laterDate, toJstDate } from "@/lib/slack-member-sync/dates";
import type { MemberMatch, SubscriptionSummary, SyncState } from "@/lib/slack-member-sync/types";
import { TEAM_ID, makeMember, makeState } from "./helpers";

// 2026-10-27 10:30 JST
const NOW = new Date("2026-10-27T01:30:00Z");
const SETTINGS = { minNoticeDays: 7, linkGraceDays: 14 };

function sub(overrides: Partial<SubscriptionSummary> = {}): SubscriptionSummary {
  return {
    userId: "user-1",
    hasPaidRecord: true,
    isActive: true,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    currentPeriodEnd: new Date("2026-11-20T00:00:00Z"),
    ...overrides,
  };
}

function match(overrides: Partial<SubscriptionSummary> = {}, via: MemberMatch["via"] = "email"): MemberMatch {
  return { via, subscription: sub(overrides) };
}

function run(overrides: Partial<ClassifyInput> = {}) {
  return classifyMember({
    member: makeMember(),
    teamId: TEAM_ID,
    match: null,
    state: null,
    settings: SETTINGS,
    now: NOW,
    ...overrides,
  });
}

describe("dates", () => {
  it("JST の日付境界: 14:59Z と 15:00Z は別の日", () => {
    expect(toJstDate(new Date("2026-10-27T14:59:59Z"))).toBe("2026-10-27");
    expect(toJstDate(new Date("2026-10-27T15:00:00Z"))).toBe("2026-10-28");
  });
  it("addDays は月・年をまたぐ", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-25", 7)).toBe("2027-01-01");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });
  it("laterDate / formatJpDate", () => {
    expect(laterDate("2026-11-01", "2026-10-31")).toBe("2026-11-01");
    expect(laterDate("2026-10-01", "2026-10-31")).toBe("2026-10-31");
    expect(formatJpDate("2026-11-03")).toBe("11月3日");
  });
});

describe("対象外（excluded）", () => {
  it.each([
    ["Slackbot", { id: "USLACKBOT" }, "bot"],
    ["ボット", { isBot: true }, "bot"],
    ["アプリ", { isAppUser: true }, "bot"],
    ["ワークフローボット", { isWorkflowBot: true }, "bot"],
    ["別チーム", { teamId: "T0OTHER" }, "other_team"],
    ["チーム不明", { teamId: null }, "other_team"],
    ["プライマリーオーナー", { isPrimaryOwner: true, isOwner: true, isAdmin: true }, "primary_owner"],
    ["オーナー", { isOwner: true, isAdmin: true }, "owner"],
    ["管理者", { isAdmin: true }, "admin"],
    ["シングルチャンネルゲスト", { isUltraRestricted: true }, "guest"],
    ["マルチチャンネルゲスト", { isRestricted: true }, "guest"],
    ["招待中", { isInvitedUser: true }, "invited"],
  ] as const)("%s は記録も DM もしない", (_label, overrides, reason) => {
    const r = run({ member: makeMember(overrides) });
    expect(r.next).toBeNull();
    expect(r.dm).toBeNull();
    // 状態行がある人は excluded として理由を残す
    const r2 = run({ member: makeMember(overrides), state: makeState({ classification: "needs_link" }) });
    expect(r2.next?.classification).toBe("excluded");
    expect(r2.next?.reason).toBe(reason);
    expect(r2.dm).toBeNull();
  });

  it("課金中でも管理者は対象外", () => {
    const r = run({ member: makeMember({ isAdmin: true }), match: match() });
    expect(r.next).toBeNull();
  });

  it("削除済みで状態行がない人は記録しない", () => {
    expect(run({ member: makeMember({ deleted: true }) }).next).toBeNull();
  });
});

describe("課金中 → keep", () => {
  it("メール一致で課金中なら keep、DMなし", () => {
    const r = run({ match: match() });
    expect(r.next?.classification).toBe("keep");
    expect(r.next?.firstSeenAt).toEqual(NOW);
    expect(r.dm).toBeNull();
  });

  it("つながり経由でも同じ", () => {
    const r = run({ match: match({}, "link") });
    expect(r.next?.classification).toBe("keep");
  });

  it("first_seen_at は最初に見た時刻のまま", () => {
    const first = new Date("2026-10-01T00:00:00Z");
    const r = run({ match: match(), state: makeState({ firstSeenAt: first }) });
    expect(r.next?.firstSeenAt).toEqual(first);
  });
});

describe("解約予約あり（課金中・期間の終わりまでは Slack に残す）", () => {
  it("外す日 = 終わる日の翌日（7日以上先のとき）。お知らせDMを送る", () => {
    const r = run({
      match: match({ cancelAtPeriodEnd: true, cancelAt: new Date("2026-11-20T00:00:00Z") }),
    });
    expect(r.next?.classification).toBe("remove_scheduled");
    expect(r.next?.reason).toBe("cancel_reserved");
    expect(r.next?.removeAfter).toBeNull(); // お知らせを送れるまでは決めない
    expect(r.dm).toBe("removal_notice");
    expect(r.endDate).toBe("2026-11-20");
    expect(r.removeAfterIfSentToday).toBe("2026-11-21");
  });

  it("終わる日が近い（7日未満）なら、お知らせから7日後", () => {
    const r = run({
      match: match({ cancelAtPeriodEnd: true, cancelAt: new Date("2026-10-29T00:00:00Z") }),
    });
    expect(r.removeAfterIfSentToday).toBe("2026-11-03");
  });

  it("cancel_at が無ければ current_period_end を使う", () => {
    const r = run({
      match: match({ cancelAtPeriodEnd: true, cancelAt: null, currentPeriodEnd: new Date("2026-12-01T03:00:00Z") }),
    });
    expect(r.endDate).toBe("2026-12-01");
    expect(r.removeAfterIfSentToday).toBe("2026-12-02");
  });

  it("終わる日は JST で数える（UTC 15:00 以降は翌日）", () => {
    const r = run({
      match: match({ cancelAtPeriodEnd: true, cancelAt: new Date("2026-11-20T15:30:00Z") }),
    });
    expect(r.endDate).toBe("2026-11-21");
    expect(r.removeAfterIfSentToday).toBe("2026-11-22");
  });

  it("お知らせ済みなら送り直さず、外す日も変えない", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "cancel_reserved",
      removalNoticeDmAt: new Date("2026-10-20T01:00:00Z"),
      removalNoticeVersion: 1,
      removeAfter: "2026-11-21",
    });
    const r = run({ match: match({ cancelAtPeriodEnd: true, cancelAt: new Date("2026-11-20T00:00:00Z") }), state });
    expect(r.dm).toBeNull();
    expect(r.next?.removeAfter).toBe("2026-11-21");
  });

  it("解約予約 → 期間が終わって解約済みになっても、お知らせは1回だけ", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "cancel_reserved",
      removalNoticeDmAt: new Date("2026-10-20T01:00:00Z"),
      removeAfter: "2026-10-26",
    });
    const r = run({ match: match({ isActive: false, currentPeriodEnd: new Date("2026-10-25T00:00:00Z") }), state });
    expect(r.next?.reason).toBe("canceled");
    expect(r.dm).toBeNull();
    expect(r.next?.removeAfter).toBe("2026-10-26");
    expect(isDueForRemoval(r.next!, toJstDate(NOW))).toBe(true);
  });
});

describe("解約済み", () => {
  it("初回の大掃除: 終わった日が過去なら、外す日はお知らせDMの7日後", () => {
    const r = run({ match: match({ isActive: false, currentPeriodEnd: new Date("2025-03-01T00:00:00Z") }) });
    expect(r.next?.classification).toBe("remove_scheduled");
    expect(r.next?.reason).toBe("canceled");
    expect(r.dm).toBe("removal_notice");
    expect(r.endDate).toBe("2025-03-01");
    expect(r.removeAfterIfSentToday).toBe("2026-11-03");
  });

  it("終わった日が分からない・未来の日付なら今日を終わりとみなす", () => {
    const r1 = run({ match: match({ isActive: false, currentPeriodEnd: null }) });
    expect(r1.endDate).toBe("2026-10-27");
    expect(r1.removeAfterIfSentToday).toBe("2026-11-03");
    const r2 = run({ match: match({ isActive: false, currentPeriodEnd: new Date("2027-01-01T00:00:00Z") }) });
    expect(r2.endDate).toBe("2026-10-27");
  });

  it("お知らせDMの送信が分からなかった（needs_review）人には送らない", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "canceled",
      needsReview: true,
      reviewReason: "send_unknown:timeout",
    });
    const r = run({ match: match({ isActive: false }), state });
    expect(r.dm).toBeNull();
    expect(r.next?.needsReview).toBe(true);
  });

  it("本文未承認の印だけなら、承認後に送れるよう DM を止めない", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "canceled",
      needsReview: true,
      reviewReason: "message_not_approved",
    });
    expect(run({ match: match({ isActive: false }), state }).dm).toBe("removal_notice");
  });
});

describe("外す前に再課金 → keep に戻る", () => {
  it("外す予定を消し、DMは送らない（resubscribed）", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "canceled",
      removalNoticeDmAt: new Date("2026-10-20T01:00:00Z"),
      removalNoticeVersion: 1,
      removeAfter: "2026-10-28",
    });
    const r = run({ match: match(), state });
    expect(r.next?.classification).toBe("keep");
    expect(r.next?.removeAfter).toBeNull();
    expect(r.next?.removalNoticeDmAt).toBeNull();
    expect(r.next?.resolvedReason).toBe("resubscribed");
    expect(r.next?.resolvedAt).toEqual(NOW);
    expect(r.dm).toBeNull();
  });

  it("解約予約を取り消した人も keep", () => {
    const state = makeState({ classification: "remove_scheduled", reason: "cancel_reserved" });
    const r = run({ match: match({ cancelAtPeriodEnd: false }), state });
    expect(r.next?.classification).toBe("keep");
  });

  it("また解約したら、新しい外す日でお知らせし直す", () => {
    const keep = run({
      match: match(),
      state: makeState({
        classification: "remove_scheduled",
        reason: "canceled",
        removalNoticeDmAt: new Date("2026-09-01T01:00:00Z"),
        removeAfter: "2026-09-08",
      }),
    }).next!;
    const r = run({ match: match({ isActive: false }), state: keep });
    expect(r.dm).toBe("removal_notice");
  });

  it("本文未承認の印は keep に戻ると消える。送信不明の印は残す", () => {
    const soft = run({
      match: match(),
      state: makeState({ classification: "needs_link", needsReview: true, reviewReason: "message_not_approved" }),
    });
    expect(soft.next?.needsReview).toBe(false);
    expect(soft.next?.reviewReason).toBeNull();
    const hard = run({
      match: match(),
      state: makeState({ classification: "needs_link", needsReview: true, reviewReason: "send_unknown:timeout" }),
    });
    expect(hard.next?.needsReview).toBe(true);
  });
});

describe("つながっていない・課金の記録がない → needs_link", () => {
  it("BONO にメール一致なし: つなぐお願いDMを送る。期限は今日 + 14日", () => {
    const r = run({ match: null });
    expect(r.next?.classification).toBe("needs_link");
    expect(r.next?.reason).toBe("not_linked");
    expect(r.dm).toBe("link_request");
    expect(r.linkDeadlineIfSentToday).toBe("2026-11-10");
  });

  it("BONO アカウントはあるが課金の記録なし", () => {
    const r = run({ match: match({ hasPaidRecord: false, isActive: false }) });
    expect(r.next?.classification).toBe("needs_link");
    expect(r.next?.reason).toBe("no_paid_record");
    expect(r.dm).toBe("link_request");
  });

  it("つなぐお願いは1回だけ（期限内は待つ）", () => {
    const state = makeState({
      classification: "needs_link",
      reason: "not_linked",
      linkRequestDmAt: new Date("2026-10-20T01:00:00Z"),
      linkDeadline: "2026-11-03",
    });
    const r = run({ state });
    expect(r.dm).toBeNull();
    expect(r.next?.classification).toBe("needs_link");
    expect(r.next?.linkDeadline).toBe("2026-11-03");
  });

  it("期限の当日はまだ待つ。翌日に link_expired（外す日 = 期限の翌日、DMなし）", () => {
    const state = makeState({
      classification: "needs_link",
      reason: "not_linked",
      linkRequestDmAt: new Date("2026-10-13T01:00:00Z"),
      linkDeadline: "2026-10-27",
    });
    expect(run({ state }).next?.classification).toBe("needs_link");

    const next = run({ state, now: new Date("2026-10-28T01:30:00Z") });
    expect(next.next?.classification).toBe("remove_scheduled");
    expect(next.next?.reason).toBe("link_expired");
    expect(next.next?.removeAfter).toBe("2026-10-28");
    expect(next.dm).toBeNull();
    expect(isDueForRemoval(next.next!, "2026-10-28")).toBe(true);
  });

  it("期限が未記録なら DM を送った日 + 14日で数える", () => {
    const state = makeState({
      classification: "needs_link",
      linkRequestDmAt: new Date("2026-10-01T01:00:00Z"),
      linkDeadline: null,
    });
    const r = run({ state });
    expect(r.next?.classification).toBe("remove_scheduled");
    expect(r.next?.linkDeadline).toBe("2026-10-15");
    expect(r.next?.removeAfter).toBe("2026-10-16");
  });

  it("link_expired の外す日は、その後の実行でも変わらない", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "link_expired",
      linkRequestDmAt: new Date("2026-10-01T01:00:00Z"),
      linkDeadline: "2026-10-15",
      removeAfter: "2026-10-16",
    });
    expect(run({ state }).next?.removeAfter).toBe("2026-10-16");
  });

  it("期限切れの後でも、外す前につながって課金中なら keep（linked）", () => {
    const state = makeState({
      classification: "remove_scheduled",
      reason: "link_expired",
      linkRequestDmAt: new Date("2026-10-01T01:00:00Z"),
      linkDeadline: "2026-10-15",
      removeAfter: "2026-10-16",
    });
    const r = run({ state, match: match({}, "link") });
    expect(r.next?.classification).toBe("keep");
    expect(r.next?.resolvedReason).toBe("linked");
    expect(r.next?.removeAfter).toBeNull();
    // つなぐ待ちの回が終わったので、つなぐお願いの記録も消す（また未接続になったら新しいDMと猶予から）
    expect(r.next?.linkRequestDmAt).toBeNull();
    expect(r.next?.linkDeadline).toBeNull();
  });

  it("つなぐ待ちの間につながった → keep（linked）", () => {
    const state = makeState({ classification: "needs_link", linkRequestDmAt: new Date("2026-10-20T01:00:00Z") });
    const r = run({ state, match: match({}, "link") });
    expect(r.next?.classification).toBe("keep");
    expect(r.next?.resolvedReason).toBe("linked");
  });

  it("送信不明の印がある人には、つなぐお願いも送らない", () => {
    const state = makeState({ classification: "needs_link", needsReview: true, reviewReason: "sending:link_request" });
    expect(run({ state }).dm).toBeNull();
  });
});

describe("Slack で外された（削除済み）→ resolved", () => {
  it("外す予定だった人が削除済みなら deactivated で閉じる", () => {
    const state = makeState({ classification: "remove_scheduled", reason: "canceled", removeAfter: "2026-10-26" });
    const r = run({ member: makeMember({ deleted: true }), state, match: match({ isActive: false }) });
    expect(r.next?.classification).toBe("resolved");
    expect(r.next?.resolvedReason).toBe("deactivated");
    expect(r.next?.resolvedAt).toEqual(NOW);
    expect(r.dm).toBeNull();
    expect(isDueForRemoval(r.next!, "2026-10-27")).toBe(false);
  });

  it("つなぐ待ちの人が削除済みでも閉じる", () => {
    const r = run({ member: makeMember({ deleted: true }), state: makeState({ classification: "needs_link" }) });
    expect(r.next?.classification).toBe("resolved");
  });

  it("閉じた後の実行では resolved のまま（resolved_at を更新しない）", () => {
    const at = new Date("2026-10-20T00:00:00Z");
    const state = makeState({ classification: "resolved", resolvedAt: at, resolvedReason: "deactivated" });
    const r = run({ member: makeMember({ deleted: true }), state });
    expect(r.next?.classification).toBe("resolved");
    expect(r.next?.resolvedAt).toEqual(at);
  });

  it("課金中の人が削除済みになったら excluded（deleted）", () => {
    const r = run({ member: makeMember({ deleted: true }), state: makeState({ classification: "keep" }) });
    expect(r.next?.classification).toBe("excluded");
    expect(r.next?.reason).toBe("deleted");
  });

  it("外された後に戻され、まだ解約済みなら、新しい回としてお知らせし直す（いきなり外す日にしない）", () => {
    const deleted = run({
      member: makeMember({ deleted: true }),
      state: makeState({
        classification: "remove_scheduled",
        reason: "canceled",
        removalNoticeDmAt: new Date("2026-10-01T00:00:00Z"),
        removeAfter: "2026-10-08",
      }),
    }).next!;
    expect(deleted.removalNoticeDmAt).toBeNull();
    expect(deleted.removeAfter).toBeNull();
    const r = run({ state: deleted, match: match({ isActive: false }) });
    expect(r.next?.classification).toBe("remove_scheduled");
    expect(r.dm).toBe("removal_notice");
    expect(r.next?.removeAfter).toBeNull();
    expect(isDueForRemoval(r.next!, "2026-10-27")).toBe(false);
    expect(r.removeAfterIfSentToday).toBe("2026-11-03");
  });
});

describe("endOf", () => {
  it("課金中は cancel_at（解約予約あり）か current_period_end", () => {
    expect(endOf(sub({ cancelAtPeriodEnd: true, cancelAt: new Date("2026-11-01T00:00:00Z") }), NOW)).toEqual(
      new Date("2026-11-01T00:00:00Z"),
    );
    expect(endOf(sub(), NOW)).toEqual(new Date("2026-11-20T00:00:00Z"));
  });
});

describe("isDueForRemoval", () => {
  it("外す日が今日以前の remove_scheduled だけ", () => {
    const s = (o: Partial<SyncState>) => makeState({ classification: "remove_scheduled", ...o });
    expect(isDueForRemoval(s({ removeAfter: "2026-10-27" }), "2026-10-27")).toBe(true);
    expect(isDueForRemoval(s({ removeAfter: "2026-10-28" }), "2026-10-27")).toBe(false);
    expect(isDueForRemoval(s({ removeAfter: null }), "2026-10-27")).toBe(false);
    expect(isDueForRemoval(makeState({ classification: "keep", removeAfter: "2026-10-01" }), "2026-10-27")).toBe(
      false,
    );
  });
});

describe("回をまたいだ記録の扱い（外す日の前に必ず今の回の DM がある）", () => {
  const noticed = makeState({
    classification: "remove_scheduled",
    reason: "canceled",
    removalNoticeDmAt: new Date("2026-09-01T00:00:00Z"),
    removalNoticeVersion: 1,
    removeAfter: "2026-09-08",
  });
  const linkWaiting = makeState({
    classification: "needs_link",
    reason: "not_linked",
    linkRequestDmAt: new Date("2026-09-01T00:00:00Z"),
    linkRequestVersion: 1,
    linkDeadline: "2026-09-15",
  });

  it("keep に戻ると、つなぐお願い・外れるお知らせの記録を両方消す", () => {
    const r = run({ match: match(), state: { ...linkWaiting, removalNoticeDmAt: new Date(), removeAfter: "2026-09-08" } });
    expect(r.next).toMatchObject({
      linkRequestDmAt: null,
      linkRequestVersion: null,
      linkDeadline: null,
      removalNoticeDmAt: null,
      removeAfter: null,
    });
  });

  it("以前のつなぐお願いの記録が keep で消えていれば、また未接続になったとき新しいDMと猶予から（いきなり期限切れにしない）", () => {
    const keep = run({ match: match(), state: linkWaiting }).next!;
    const r = run({ state: keep });
    expect(r.next?.classification).toBe("needs_link");
    expect(r.dm).toBe("link_request");
    expect(r.linkDeadlineIfSentToday).toBe("2026-11-10");
  });

  it("外す予定の回から needs_link に移ると、外れるお知らせの記録を消す", () => {
    const r = run({ match: null, state: noticed });
    expect(r.next).toMatchObject({ classification: "needs_link", removalNoticeDmAt: null, removeAfter: null });
    expect(r.dm).toBe("link_request");
  });

  it("外す予定の回から excluded に移ると記録を消し、戻ったら新しいお知らせを送る", () => {
    const ex = run({ member: makeMember({ isRestricted: true }), state: noticed }).next!;
    expect(ex).toMatchObject({ classification: "excluded", removalNoticeDmAt: null, removeAfter: null });
    const back = run({ state: ex, match: match({ isActive: false }) });
    expect(back.dm).toBe("removal_notice");
    expect(back.next?.removeAfter).toBeNull();
  });

  it("つなぐ待ち以外の状態に残ったつなぐお願いの記録では、期限切れにしない", () => {
    // 古いデータで keep に linkRequestDmAt が残っていても、新しい回として扱う
    const r = run({ state: makeState({ classification: "keep", linkRequestDmAt: new Date("2026-01-01T00:00:00Z") }) });
    expect(r.next?.classification).toBe("needs_link");
    expect(r.dm).toBe("link_request");
  });

  it("外す予定の回でお知らせの記録が片方しかない（外す日なし）なら、お知らせからやり直す", () => {
    const r = run({
      match: match({ isActive: false }),
      state: makeState({ classification: "remove_scheduled", reason: "canceled", removalNoticeDmAt: new Date(), removeAfter: null }),
    });
    expect(r.dm).toBe("removal_notice");
    expect(r.next?.removalNoticeDmAt).toBeNull();
  });
});

describe("手で残す人（manualKeep）", () => {
  it("課金の記録がなくても keep（理由 manual_keep）、DMなし", () => {
    const r = run({ match: null, manualKeep: true });
    expect(r.next).toMatchObject({ classification: "keep", reason: "manual_keep" });
    expect(r.dm).toBeNull();
  });

  it("外す予定だった人も keep に戻る", () => {
    const r = run({
      match: match({ isActive: false }),
      manualKeep: true,
      state: makeState({ classification: "remove_scheduled", reason: "canceled", removeAfter: "2026-10-20" }),
    });
    expect(r.next?.classification).toBe("keep");
    expect(r.next?.removeAfter).toBeNull();
  });

  it("管理者などの対象外は、手で残す設定より優先", () => {
    expect(run({ member: makeMember({ isAdmin: true }), manualKeep: true }).next).toBeNull();
  });
});
