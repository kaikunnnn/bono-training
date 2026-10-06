import { describe, expect, it } from "vitest";
import {
  formatRegistrationDeadline,
  getRegistrationDeadline,
  isRegistrationClosed,
} from "./onsite-registration";

describe("申込の締め切り（開催日の日本時間 23:59:59.999 まで）", () => {
  describe("本番イベント: 2026-10-21 20:00 JST 開始", () => {
    const start = "2026-10-21T11:00:00.000Z";

    it("締め切りは 10/22 0:00 JST（2026-10-21T15:00:00.000Z）", () => {
      expect(getRegistrationDeadline(start)?.toISOString()).toBe(
        "2026-10-21T15:00:00.000Z",
      );
    });

    it("23:59:59.999 JST までは受付中、0:00 JST で受付終了", () => {
      expect(
        isRegistrationClosed(start, new Date("2026-10-21T14:59:59.999Z")),
      ).toBe(false);
      expect(
        isRegistrationClosed(start, new Date("2026-10-21T15:00:00.000Z")),
      ).toBe(true);
    });

    it("開始時刻を過ぎても当日中は受付中", () => {
      expect(
        isRegistrationClosed(start, new Date("2026-10-21T12:00:00.000Z")),
      ).toBe(false);
    });

    it("前日以前は受付中、翌日以降は受付終了", () => {
      expect(
        isRegistrationClosed(start, new Date("2026-10-06T00:00:00.000Z")),
      ).toBe(false);
      expect(
        isRegistrationClosed(start, new Date("2026-10-23T00:00:00.000Z")),
      ).toBe(true);
    });

    it("表示は「10月21日（水）」", () => {
      expect(formatRegistrationDeadline(start)).toBe("10月21日（水）");
    });
  });

  it("23:30 JST 開始は同じ日の終わりに締め切る", () => {
    const start = "2026-10-21T14:30:00.000Z"; // 10/21 23:30 JST
    expect(getRegistrationDeadline(start)?.toISOString()).toBe(
      "2026-10-21T15:00:00.000Z",
    );
    expect(formatRegistrationDeadline(start)).toBe("10月21日（水）");
  });

  it("00:30 JST 開始は UTC では前日だが、日本時間の開催日（翌日）の終わりに締め切る", () => {
    const start = "2026-10-21T15:30:00.000Z"; // 10/22 00:30 JST
    expect(getRegistrationDeadline(start)?.toISOString()).toBe(
      "2026-10-22T15:00:00.000Z",
    );
    expect(formatRegistrationDeadline(start)).toBe("10月22日（木）");
    expect(
      isRegistrationClosed(start, new Date("2026-10-22T14:59:59.999Z")),
    ).toBe(false);
    expect(
      isRegistrationClosed(start, new Date("2026-10-22T15:00:00.000Z")),
    ).toBe(true);
  });

  it("月末・年末をまたいでも翌日 0:00 JST になる", () => {
    expect(
      getRegistrationDeadline("2026-12-31T11:00:00.000Z")?.toISOString(),
    ).toBe("2026-12-31T15:00:00.000Z");
    expect(formatRegistrationDeadline("2026-12-31T11:00:00.000Z")).toBe(
      "12月31日（木）",
    );
  });

  it("オフセット付きの ISO 文字列も同じ瞬間として扱う", () => {
    expect(
      getRegistrationDeadline("2026-10-21T20:00:00+09:00")?.toISOString(),
    ).toBe("2026-10-21T15:00:00.000Z");
  });

  it.each([undefined, null, "", "not-a-date"])(
    "開始日時が無い・不正（%s）なら締め切らない",
    (value) => {
      expect(getRegistrationDeadline(value)).toBeNull();
      expect(formatRegistrationDeadline(value)).toBeNull();
      expect(
        isRegistrationClosed(value, new Date("2099-01-01T00:00:00.000Z")),
      ).toBe(false);
    },
  );
});
