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
  it("戻り先として普通に使う値はそのまま通す", () => {
    expect(sanitizeRedirect("/slack/link?t=abc123")).toBe("/slack/link?t=abc123");
    expect(sanitizeRedirect("/guide/x#section")).toBe("/guide/x#section");
    expect(sanitizeRedirect("/events/design-hours-1")).toBe("/events/design-hours-1");
  });
  it("日本語や空白は URL の形（%エンコード）にして返す（開く先は同じ）", () => {
    expect(sanitizeRedirect("/search?q=UI デザイン")).toBe(
      "/search?q=UI%20%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3"
    );
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
      // URL として読むとパスが "//evil" に正規化される値（PR#338 レビューで再現）
      "/.//evil.example",
      "/..//evil.example",
      "/./\\evil.example",
      "/.\\/evil.example",
      "/%2e//evil.example",
      "/%2E%2E//evil.example",
      "/x/../..//evil.example",
    ]) {
      expect(sanitizeRedirect(v)).toBe("/");
    }
  });
});
