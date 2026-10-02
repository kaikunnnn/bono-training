import { describe, expect, it } from "vitest";
import { deriveMemberStatus } from "./member-status";

describe("deriveMemberStatus", () => {
  it("未ログインは anonymous", () => {
    expect(deriveMemberStatus({ isLoggedIn: false, isSubscribed: false })).toBe("anonymous");
  });

  it("未ログインなら isSubscribed が true でも anonymous（不整合データに引きずられない）", () => {
    expect(deriveMemberStatus({ isLoggedIn: false, isSubscribed: true })).toBe("anonymous");
  });

  it("ログイン済み・有効サブスクなしは free", () => {
    expect(deriveMemberStatus({ isLoggedIn: true, isSubscribed: false })).toBe("free");
  });

  it("ログイン済み・有効サブスクありは paying", () => {
    expect(deriveMemberStatus({ isLoggedIn: true, isSubscribed: true })).toBe("paying");
  });
});
