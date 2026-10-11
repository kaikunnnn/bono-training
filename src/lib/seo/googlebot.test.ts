// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildGoogleIpBlockList,
  isGoogleCrawlerUserAgent,
  isIpInBlockList,
  normalizeIp,
} from "./googlebot-utils";
import {
  __resetGooglebotRangesForTest,
  DEV_TEST_CLIENT_IP_HEADER,
  clientIpFromHeaders,
  isVerifiedGooglebot,
} from "./googlebot";

// common-crawlers.json と同じ形（値は公開 JSON の一部）
const RANGES = {
  creationTime: "2026-10-09T14:46:27.000000",
  prefixes: [
    { ipv6Prefix: "2001:4860:4801:10::/64" },
    { ipv4Prefix: "66.249.79.64/27" },
  ],
};

const GOOGLEBOT_UA =
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

describe("googlebot-utils", () => {
  it("recognises Googlebot / URL inspection user agents only", () => {
    expect(isGoogleCrawlerUserAgent(GOOGLEBOT_UA)).toBe(true);
    expect(isGoogleCrawlerUserAgent("Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)")).toBe(true);
    expect(isGoogleCrawlerUserAgent(BROWSER_UA)).toBe(false);
    expect(isGoogleCrawlerUserAgent(null)).toBe(false);
  });

  it("matches IPv4 and IPv6 addresses against the published ranges", () => {
    const list = buildGoogleIpBlockList(RANGES);
    expect(isIpInBlockList("66.249.79.65", list)).toBe(true);
    expect(isIpInBlockList("66.249.79.96", list)).toBe(false); // /27 の外
    expect(isIpInBlockList("2001:4860:4801:10::1", list)).toBe(true);
    expect(isIpInBlockList("2001:4860:4801:11::1", list)).toBe(false);
    expect(isIpInBlockList("203.0.113.5", list)).toBe(false);
  });

  it("returns no list for malformed JSON (nobody is treated as Googlebot)", () => {
    expect(buildGoogleIpBlockList(null)).toBeNull();
    expect(buildGoogleIpBlockList({})).toBeNull();
    expect(buildGoogleIpBlockList({ prefixes: [{ ipv4Prefix: "nope" }] })).toBeNull();
    expect(isIpInBlockList("66.249.79.65", null)).toBe(false);
  });

  it("normalises header values", () => {
    expect(normalizeIp("66.249.79.65, 10.0.0.1")).toBe("66.249.79.65");
    expect(normalizeIp("::ffff:66.249.79.65")).toBe("66.249.79.65");
    expect(normalizeIp("[2001:4860:4801:10::1]")).toBe("2001:4860:4801:10::1");
    expect(normalizeIp("not-an-ip")).toBeNull();
    expect(normalizeIp("")).toBeNull();
  });
});

describe("isVerifiedGooglebot", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    __resetGooglebotRangesForTest();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(JSON.stringify(RANGES), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("accepts a Googlebot UA from a Google IP", async () => {
    const h = new Headers({ "user-agent": GOOGLEBOT_UA, "x-real-ip": "66.249.79.65" });
    expect(await isVerifiedGooglebot(h)).toBe(true);
  });

  it("rejects a spoofed Googlebot UA from a non-Google IP", async () => {
    const h = new Headers({ "user-agent": GOOGLEBOT_UA, "x-real-ip": "203.0.113.5" });
    expect(await isVerifiedGooglebot(h)).toBe(false);
  });

  it("rejects a Google IP without a Googlebot UA, without fetching the ranges", async () => {
    const h = new Headers({ "user-agent": BROWSER_UA, "x-real-ip": "66.249.79.65" });
    expect(await isVerifiedGooglebot(h)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects when the client IP is unknown", async () => {
    const h = new Headers({ "user-agent": GOOGLEBOT_UA });
    expect(await isVerifiedGooglebot(h)).toBe(false);
  });

  it("fails closed when the ranges cannot be fetched", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const h = new Headers({ "user-agent": GOOGLEBOT_UA, "x-real-ip": "66.249.79.65" });
    expect(await isVerifiedGooglebot(h)).toBe(false);

    fetchMock.mockResolvedValueOnce(new Response("oops", { status: 500 }));
    expect(await isVerifiedGooglebot(h)).toBe(false);
  });

  it("fetches the ranges once and reuses them", async () => {
    const h = new Headers({ "user-agent": GOOGLEBOT_UA, "x-real-ip": "66.249.79.65" });
    await isVerifiedGooglebot(h);
    await isVerifiedGooglebot(h);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://developers.google.com/static/crawling/ipranges/common-crawlers.json",
    );
  });

  it("honours the dev-only test IP header outside production only", () => {
    const h = new Headers({ [DEV_TEST_CLIENT_IP_HEADER]: "66.249.79.65", "x-real-ip": "203.0.113.5" });
    vi.stubEnv("NODE_ENV", "development");
    expect(clientIpFromHeaders(h)).toBe("66.249.79.65");
    vi.stubEnv("NODE_ENV", "production");
    expect(clientIpFromHeaders(h)).toBe("203.0.113.5");
  });
});
