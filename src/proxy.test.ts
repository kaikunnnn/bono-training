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
