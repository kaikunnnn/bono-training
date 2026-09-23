import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent, setUserId, setUserProperties } from "@/lib/analytics";

afterEach(() => vi.unstubAllGlobals());
describe("event destination and pageview ownership", () => {
  it.each(["localhost", "bono-training.vercel.app"])("suppresses all helper calls on %s even if another tag exists", (hostname) => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { location: { hostname }, gtag });
    trackEvent("article_view"); setUserId("test"); setUserProperties({ plan: "test" });
    expect(gtag).not.toHaveBeenCalled();
  });
  it("pins events to the unified stream and does not create PVs for attributes", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { location: { hostname: "www.bo-no.design" }, gtag });
    trackEvent("article_view", { article_id: "test", send_to: "G-WRONG" });
    expect(gtag).toHaveBeenCalledWith("event", "article_view", { article_id: "test", send_to: "G-T8RTCENVBF" });
    setUserId("test"); setUserProperties({ plan: "test" });
    for (const call of gtag.mock.calls.filter((args) => args[0] === "config")) {
      expect(call[1]).toBe("G-T8RTCENVBF");
      expect(call[2].send_page_view).toBe(false);
    }
  });
});
