import { describe, expect, it } from "vitest";
import {
  DEFAULT_REGISTRATION_COMMENT,
  REGISTRATION_COMMENT_MAX_LENGTH,
  formatParticipantLabel,
  isOnsiteRegistrationEvent,
  validateRegistrationComment,
} from "@/lib/events/onsite-registration";

describe("validateRegistrationComment (#218)", () => {
  it("初期値はそのまま通る", () => {
    expect(validateRegistrationComment(DEFAULT_REGISTRATION_COMMENT)).toEqual({
      ok: true,
      comment: "参加します！",
    });
  });

  it("前後の空白を除いて保存する", () => {
    expect(validateRegistrationComment("  よろしく！ \n")).toEqual({
      ok: true,
      comment: "よろしく！",
    });
  });

  it("空・空白のみ・文字列以外は弾く", () => {
    expect(validateRegistrationComment("").ok).toBe(false);
    expect(validateRegistrationComment("   ").ok).toBe(false);
    expect(validateRegistrationComment(null).ok).toBe(false);
  });

  it("300文字ちょうどは通り、301文字は弾く（DBのCHECKと同じ上限）", () => {
    const max = "あ".repeat(REGISTRATION_COMMENT_MAX_LENGTH);
    expect(validateRegistrationComment(max).ok).toBe(true);
    expect(validateRegistrationComment(max + "あ").ok).toBe(false);
  });
});

describe("isOnsiteRegistrationEvent (#218)", () => {
  it("一覧に無い slug は false（今まで通りGoogleフォーム）", () => {
    expect(isOnsiteRegistrationEvent("not-listed-event")).toBe(false);
  });
});

describe("formatParticipantLabel (#218 ラベルA)", () => {
  it("1〜4人は「参加中」だけ（アイコンだけにしない）", () => {
    expect(formatParticipantLabel(1)).toBe("参加中");
    expect(formatParticipantLabel(4)).toBe("参加中");
  });
  it("5人以上は「N人が参加中」", () => {
    expect(formatParticipantLabel(5)).toBe("5人が参加中");
    expect(formatParticipantLabel(12)).toBe("12人が参加中");
  });
});
