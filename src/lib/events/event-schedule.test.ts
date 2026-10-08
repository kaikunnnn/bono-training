import { describe, expect, it } from "vitest";
import {
  formatEventDate,
  getEventDateParts,
  getEventEndBoundary,
  getEventStatus,
  sortEventsNewestFirst,
} from "./event-schedule";

describe("正確な日時（eventStartAt）", () => {
  // 本番: 10/21(水) 20:00 JST 開始
  const event = { eventStartAt: "2026-10-21T11:00:00.000Z" };

  it("表示は「2026年10月21日(水)」", () => {
    expect(formatEventDate(event)).toBe("2026年10月21日(水)");
  });

  it("JST で日付をまたぐ時刻でも日本の日付で表示する（UTC 10/21 16:00 = JST 10/22 1:00）", () => {
    expect(formatEventDate({ eventStartAt: "2026-10-21T16:00:00.000Z" })).toBe(
      "2026年10月22日(木)",
    );
  });

  it("開催日の 23:59:59.999 JST までは募集中、翌日 0:00 JST で終了", () => {
    expect(getEventEndBoundary(event)?.toISOString()).toBe("2026-10-21T15:00:00.000Z");
    expect(getEventStatus(event, new Date("2026-10-08T00:00:00.000Z"))).toBe("upcoming");
    expect(getEventStatus(event, new Date("2026-10-21T12:00:00.000Z"))).toBe("upcoming");
    expect(getEventStatus(event, new Date("2026-10-21T14:59:59.999Z"))).toBe("upcoming");
    expect(getEventStatus(event, new Date("2026-10-21T15:00:00.000Z"))).toBe("ended");
  });

  it("eventStartAt があれば概算フィールドより優先する", () => {
    expect(
      formatEventDate({ ...event, eventYear: 2026, eventMonth: 2, eventPeriod: "late" }),
    ).toBe("2026年10月21日(水)");
  });
});

describe("概算（eventYear + eventMonth + eventPeriod）", () => {
  it("表示は「2026年8月下旬」", () => {
    expect(formatEventDate({ eventYear: 2026, eventMonth: 8, eventPeriod: "late" })).toBe(
      "2026年8月下旬",
    );
  });

  it("期間なしは「2026年8月」、年なしは「8月下旬」", () => {
    expect(formatEventDate({ eventYear: 2026, eventMonth: 8 })).toBe("2026年8月");
    expect(formatEventDate({ eventMonth: 8, eventPeriod: "late" })).toBe("8月下旬");
  });

  it("上旬は 10日 23:59:59.999 JST まで募集中", () => {
    const e = { eventYear: 2026, eventMonth: 11, eventPeriod: "early" as const };
    expect(getEventStatus(e, new Date("2026-11-10T14:59:59.999Z"))).toBe("upcoming");
    expect(getEventStatus(e, new Date("2026-11-10T15:00:00.000Z"))).toBe("ended");
  });

  it("中旬は 20日 23:59:59.999 JST まで募集中", () => {
    const e = { eventYear: 2026, eventMonth: 7, eventPeriod: "mid" as const };
    expect(getEventStatus(e, new Date("2026-07-20T14:59:59.999Z"))).toBe("upcoming");
    expect(getEventStatus(e, new Date("2026-07-20T15:00:00.000Z"))).toBe("ended");
  });

  it("下旬は月末 23:59:59.999 JST まで募集中（2月はうるう年でない 28日）", () => {
    const e = { eventYear: 2026, eventMonth: 2, eventPeriod: "late" as const };
    expect(getEventStatus(e, new Date("2026-02-28T14:59:59.999Z"))).toBe("upcoming");
    expect(getEventStatus(e, new Date("2026-02-28T15:00:00.000Z"))).toBe("ended");
  });

  it("12月下旬は 12/31 まで（年をまたぐ）", () => {
    const e = { eventYear: 2026, eventMonth: 12, eventPeriod: "late" as const };
    expect(getEventEndBoundary(e)?.toISOString()).toBe("2026-12-31T15:00:00.000Z");
  });

  it("期間なしは月末まで", () => {
    const e = { eventYear: 2026, eventMonth: 4 };
    expect(getEventEndBoundary(e)?.toISOString()).toBe("2026-04-30T15:00:00.000Z");
  });

  it("年が無い・日付情報が無いものは判定できないので「終了」扱い", () => {
    expect(getEventStatus({ eventMonth: 12, eventPeriod: "late" })).toBe("ended");
    expect(getEventStatus({})).toBe("ended");
    expect(getEventDateParts({})).toBeNull();
    expect(formatEventDate({})).toBeNull();
  });
});

describe("並び順（開催時期の新しい順）", () => {
  it("正確な日時と概算を混ぜて新しい順。同じ時期は元の順を保つ。判定できないものは最後", () => {
    const events = [
      { id: "unknown" },
      { id: "feb-a", eventYear: 2026, eventMonth: 2, eventPeriod: "late" as const },
      { id: "aug", eventYear: 2026, eventMonth: 8, eventPeriod: "late" as const },
      { id: "oct", eventStartAt: "2026-10-21T11:00:00.000Z" },
      { id: "feb-b", eventYear: 2026, eventMonth: 2, eventPeriod: "late" as const },
      { id: "jul", eventYear: 2026, eventMonth: 7, eventPeriod: "mid" as const },
    ];
    expect(sortEventsNewestFirst(events).map((e) => e.id)).toEqual([
      "oct",
      "aug",
      "jul",
      "feb-a",
      "feb-b",
      "unknown",
    ]);
  });
});
