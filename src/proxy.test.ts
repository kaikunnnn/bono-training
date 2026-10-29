// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const AUTH_COOKIE = "sb-fryogvfhymnpiqwssmuu-auth-token=dummy";

function request(path: string, cookie?: string) {
  return new NextRequest(`https://www.bo-no.design${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

describe("proxy: top page for signed-in members (#257 S2)", () => {
  it("redirects / to /mypage with a real 307 when the auth cookie exists", () => {
    const res = proxy(request("/", AUTH_COOKIE));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://www.bo-no.design/mypage");
  });

  it("carries only the welcome flag over to /mypage", () => {
    const res = proxy(request("/?welcome=1&utm_source=x", AUTH_COOKIE));
    expect(res.headers.get("location")).toBe(
      "https://www.bo-no.design/mypage?welcome=1"
    );
  });

  it("lets anonymous visitors see the top page", () => {
    const res = proxy(request("/"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});

describe("proxy: signed-in visitors on /signup and /login go back to redirectTo (#268-C)", () => {
  it("keeps the ? of redirectTo instead of escaping it to %3F (the 404 bug)", () => {
    const res = proxy(
      request(
        "/signup?redirectTo=%2Fsubscription%3Fintent_plan%3Dstandard%26intent_duration%3D1",
        AUTH_COOKIE
      )
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://www.bo-no.design/subscription?intent_plan=standard&intent_duration=1"
    );
  });

  it("also works on /login and for other ? destinations like /slack/link?t=", () => {
    const res = proxy(
      request("/login?redirectTo=%2Fslack%2Flink%3Ft%3Dabc123", AUTH_COOKIE)
    );
    expect(res.headers.get("location")).toBe(
      "https://www.bo-no.design/slack/link?t=abc123"
    );
  });

  it("drops the auth page's own query and only uses redirectTo", () => {
    const res = proxy(
      request("/signup?utm_source=x&redirectTo=%2Faccount", AUTH_COOKIE)
    );
    expect(res.headers.get("location")).toBe("https://www.bo-no.design/account");
  });

  it("falls back to /mypage when redirectTo is missing", () => {
    const res = proxy(request("/login", AUTH_COOKIE));
    expect(res.headers.get("location")).toBe("https://www.bo-no.design/mypage");
  });

  it.each([
    "https://evil.com",
    "https://evil.com/subscription?intent_plan=standard",
    "//evil.com",
    "//evil.com/subscription",
    "/\\evil.com",
    "/\\/evil.com",
    "/\t/evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
  ])("never sends signed-in visitors off-site (redirectTo=%j)", (redirectTo) => {
    const res = proxy(
      request(`/signup?redirectTo=${encodeURIComponent(redirectTo)}`, AUTH_COOKIE)
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://www.bo-no.design/mypage");
  });

  it("does not redirect when reauth=1 (stale-cookie loop guard)", () => {
    const res = proxy(
      request(
        "/login?reauth=1&redirectTo=%2Fsubscription%3Fintent_plan%3Dstandard",
        AUTH_COOKIE
      )
    );
    expect(res.headers.get("location")).toBeNull();
  });

  it("lets anonymous visitors see /signup", () => {
    const res = proxy(
      request("/signup?redirectTo=%2Fsubscription%3Fintent_plan%3Dstandard")
    );
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
