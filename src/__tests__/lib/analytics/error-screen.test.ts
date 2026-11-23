import { afterEach, describe, expect, it, vi } from "vitest";
import { trackErrorScreen } from "@/lib/analytics";

vi.mock("@/lib/analytics/config", async (original) => ({
  ...(await original<typeof import("@/lib/analytics/config")>()),
  isAnalyticsHost: () => true,
}));

describe("trackErrorScreen", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubGtag() {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { hostname: "www.bo-no.design", pathname: "/contents/a" } });
    return gtag;
  }

  it("場所・digest・パスを送り、messageは送らない", () => {
    const gtag = stubGtag();
    trackErrorScreen("article_detail", Object.assign(new Error("secret@example.com"), { digest: "123" }));
    const [, name, params] = gtag.mock.calls[0];
    expect(name).toBe("error_screen");
    expect(params).toMatchObject({ error_area: "article_detail", error_digest: "123", page_path: "/contents/a" });
    expect(JSON.stringify(params)).not.toContain("secret@example.com");
  });

  it("Error以外が渡されても落ちない", () => {
    const gtag = stubGtag();
    trackErrorScreen("root", "boom");
    expect(gtag.mock.calls[0][2]).toMatchObject({ error_digest: "none" });
  });
});
