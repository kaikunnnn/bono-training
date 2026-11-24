import { describe, it, expect } from "vitest";
import { buildMypageSearch } from "@/lib/top-redirect";

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
