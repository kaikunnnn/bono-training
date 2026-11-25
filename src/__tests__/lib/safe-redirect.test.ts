import { describe, it, expect } from "vitest";
import { sanitizeRedirect } from "@/lib/safe-redirect";

describe("sanitizeRedirect（戻り先は内部パスだけ）", () => {
  it("内部パスとクエリはそのまま", () => {
    expect(sanitizeRedirect("/mypage")).toBe("/mypage");
    expect(sanitizeRedirect("/subscription?intent_plan=standard&intent_duration=1")).toBe(
      "/subscription?intent_plan=standard&intent_duration=1"
    );
    expect(sanitizeRedirect("/mypage?from=email_comeback")).toBe("/mypage?from=email_comeback");
  });
  it("空なら /", () => {
    expect(sanitizeRedirect(null)).toBe("/");
    expect(sanitizeRedirect("")).toBe("/");
  });
  it("外のサイトへ飛ばせる値は / に落とす", () => {
    for (const v of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "evil.example",
      "/\nhttps://evil.example",
    ]) {
      expect(sanitizeRedirect(v)).toBe("/");
    }
  });
});
