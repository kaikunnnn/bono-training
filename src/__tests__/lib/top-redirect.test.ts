import { describe, it, expect } from "vitest";
import { buildMypageSearch, withEmailFrom } from "@/lib/top-redirect";
import { FROM_OF_KIND } from "@/lib/member-mail/types";
import { parseEmailFrom } from "@/lib/activity-utils";

describe("buildMypageSearch", () => {
  it("何もなければ空", () => {
    expect(buildMypageSearch({})).toBe("");
  });
  it("welcome=1 を引き継ぐ", () => {
    expect(buildMypageSearch({ welcome: "1" })).toBe("?welcome=1");
  });
  it("メールの印を引き継ぐ", () => {
    expect(buildMypageSearch({ from: "email_weekly" })).toBe("?from=email_weekly");
  });
  it("両方あれば両方", () => {
    expect(buildMypageSearch({ welcome: "1", from: "email_signup" })).toBe(
      "?welcome=1&from=email_signup"
    );
  });
  it("形の違う from や welcome は捨てる", () => {
    expect(buildMypageSearch({ welcome: "0", from: "twitter" })).toBe("");
    expect(buildMypageSearch({ from: "email_<x>" })).toBe("");
  });
});

describe("withEmailFrom", () => {
  it("印があれば戻り先に付ける", () => {
    expect(withEmailFrom("/mypage", "email_winback")).toBe("/mypage?from=email_winback");
    expect(withEmailFrom("/x?a=1", "email_weekly")).toBe("/x?a=1&from=email_weekly");
  });
  it("印がない・形が違う・配列なら戻り先はそのまま", () => {
    expect(withEmailFrom("/mypage", null)).toBe("/mypage");
    expect(withEmailFrom("/mypage", "twitter")).toBe("/mypage");
    expect(withEmailFrom("/mypage", ["email_weekly", "email_signup"])).toBe("/mypage");
  });
});

describe("メールの印の形の決まり", () => {
  it("送るメールのすべての印が、記録側の判定（parseEmailFrom）を通る", () => {
    for (const from of Object.values(FROM_OF_KIND)) {
      expect(parseEmailFrom(from)).toBe(from);
    }
  });
});
