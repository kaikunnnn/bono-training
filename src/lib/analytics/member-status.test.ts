import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deriveMemberStatus,
  LAST_PAYING_AT_STORAGE_KEY,
  LAST_PAYING_TTL_MS,
  readLastPayingAt,
  rememberPayingNow,
  resolveMemberStatusAtEvent,
} from "./member-status";

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

describe("resolveMemberStatusAtEvent（#266 S1）", () => {
  const now = Date.parse("2026-10-29T00:00:00.000Z");
  const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

  it("paying / free はそのまま（印は見ない）", () => {
    expect(resolveMemberStatusAtEvent("paying", null, now)).toBe("paying");
    expect(resolveMemberStatusAtEvent("free", daysAgo(1), now)).toBe("free");
  });

  it("anonymous で印なしは anonymous", () => {
    expect(resolveMemberStatusAtEvent("anonymous", null, now)).toBe("anonymous");
    expect(resolveMemberStatusAtEvent("anonymous", "", now)).toBe("anonymous");
  });

  it("anonymous で90日以内の印があれば anonymous_member", () => {
    expect(resolveMemberStatusAtEvent("anonymous", daysAgo(0), now)).toBe("anonymous_member");
    expect(resolveMemberStatusAtEvent("anonymous", daysAgo(89), now)).toBe("anonymous_member");
  });

  it("90日ちょうどは anonymous_member、1ミリ秒超えると anonymous", () => {
    expect(resolveMemberStatusAtEvent("anonymous", new Date(now - LAST_PAYING_TTL_MS).toISOString(), now)).toBe("anonymous_member");
    expect(resolveMemberStatusAtEvent("anonymous", new Date(now - LAST_PAYING_TTL_MS - 1).toISOString(), now)).toBe("anonymous");
  });

  it("壊れた値・未来の日時は anonymous", () => {
    expect(resolveMemberStatusAtEvent("anonymous", "not-a-date", now)).toBe("anonymous");
    expect(resolveMemberStatusAtEvent("anonymous", new Date(now + 60_000).toISOString(), now)).toBe("anonymous");
  });
});

describe("paying の印（localStorage）", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("rememberPayingNow で日時だけを書き、readLastPayingAt で読める", () => {
    const at = new Date("2026-10-29T01:02:03.000Z");
    rememberPayingNow(at);
    expect(window.localStorage.getItem(LAST_PAYING_AT_STORAGE_KEY)).toBe(at.toISOString());
    expect(readLastPayingAt()).toBe(at.toISOString());
  });

  it("localStorage が例外を投げても落ちない（書かない・null を返す）", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(() => rememberPayingNow()).not.toThrow();
    expect(readLastPayingAt()).toBeNull();
  });
});
