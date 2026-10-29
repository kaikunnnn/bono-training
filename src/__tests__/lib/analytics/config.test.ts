import { describe, it, expect, vi } from "vitest";
import { GA_BOOTSTRAP, GA_MEASUREMENT_ID, isAnalyticsHost } from "@/lib/analytics/config";
import {
  LAST_PAYING_TTL_MS,
  MEMBER_STATUS_EVENT_PARAM,
  resolveMemberStatusAtEvent,
} from "@/lib/analytics/member-status";

function bootstrap(hostname: string, webdriver = false) {
  const append = vi.fn();
  const create = vi.fn(() => ({}));
  const win = { location: { hostname }, navigator: { webdriver } } as Record<string, unknown>;
  const doc = { head: { appendChild: append }, createElement: create };
  const run = new Function("window", "document", GA_BOOTSTRAP);
  run(win, doc);
  return { win, create, append, runAgain: () => run(win, doc) };
}

describe("production analytics boundary", () => {
  it.each(["localhost", "127.0.0.1", "bono-training.vercel.app", "preview.vercel.app", "www.bo-no.design.attacker.example", "legacy.bo-no.design"])("does not load or initialise GA on %s", (host) => {
    const result = bootstrap(host);
    expect(isAnalyticsHost(host)).toBe(false);
    expect(result.create).not.toHaveBeenCalled();
    expect(result.win.dataLayer).toBeUndefined();
  });
  it.each(["www.bo-no.design", "bo-no.design"])("initialises exactly once on %s, using the Webflow stream", (host) => {
    const result = bootstrap(host);
    result.runAgain();
    expect(result.append).toHaveBeenCalledTimes(1);
    expect(result.append.mock.calls[0][0].src).toContain(GA_MEASUREMENT_ID);
    const commands = (result.win.dataLayer as IArguments[]).map((entry) => Array.from(entry));
    expect(commands.filter((args) => args[0] === "config")).toEqual([["config", "G-T8RTCENVBF"]]);
  });
  it("does not load GA in automated browsers (Playwright E2E against production)", () => {
    const result = bootstrap("www.bo-no.design", true);
    expect(result.create).not.toHaveBeenCalled();
    expect(result.win.dataLayer).toBeUndefined();
  });
});

describe("イベント単位の会員状態を config より前に set する（#266 S1）", () => {
  const DAY = 24 * 60 * 60 * 1000;

  function run(opts: { status: string | null; getItem?: () => string | null }) {
    const el = opts.status === null ? null : { getAttribute: () => opts.status };
    const win = {
      location: { hostname: "www.bo-no.design" },
      navigator: { webdriver: false },
      localStorage: { getItem: vi.fn(opts.getItem ?? (() => null)) },
    } as Record<string, unknown>;
    const doc = {
      head: { appendChild: vi.fn() },
      createElement: vi.fn(() => ({})),
      querySelector: vi.fn(() => el),
    };
    new Function("window", "document", GA_BOOTSTRAP)(win, doc);
    const commands = (win.dataLayer as IArguments[]).map((entry) => Array.from(entry));
    const setIndex = commands.findIndex((args) => args[0] === "set");
    const configIndex = commands.findIndex((args) => args[0] === "config");
    const value = setIndex >= 0 ? (commands[setIndex][1] as Record<string, unknown>)[MEMBER_STATUS_EVENT_PARAM] : undefined;
    return { commands, setIndex, configIndex, value, win };
  }

  it("set が config より前にある", () => {
    const r = run({ status: "free" });
    expect(r.setIndex).toBeGreaterThanOrEqual(0);
    expect(r.setIndex).toBeLessThan(r.configIndex);
    expect(r.commands[r.setIndex]).toEqual(["set", { member_status_at_event: "free" }]);
  });

  it("隠し要素が無い・許可外の値なら set しない（config は送る）", () => {
    for (const status of [null, "", "paid", "x".repeat(200)]) {
      const r = run({ status });
      expect(r.setIndex).toBe(-1);
      expect(r.configIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it("localStorage が例外でも anonymous で set し、config も送る", () => {
    const r = run({ status: "anonymous", getItem: () => { throw new Error("SecurityError"); } });
    expect(r.value).toBe("anonymous");
    expect(r.configIndex).toBeGreaterThan(r.setIndex);
  });

  it("文字列スクリプトの判定が TS の resolveMemberStatusAtEvent と一致する", () => {
    const now = Date.now();
    const raws: (string | null)[] = [
      null,
      "",
      "garbage",
      new Date(now).toISOString(),
      new Date(now - 30 * DAY).toISOString(),
      new Date(now - LAST_PAYING_TTL_MS + 60_000).toISOString(),
      new Date(now - LAST_PAYING_TTL_MS - 60_000).toISOString(),
      new Date(now + 60 * 60_000).toISOString(),
    ];
    vi.useFakeTimers();
    vi.setSystemTime(now);
    try {
      for (const status of ["paying", "free", "anonymous"] as const) {
        for (const raw of raws) {
          const r = run({ status, getItem: () => raw });
          expect([status, raw, r.value]).toEqual([status, raw, resolveMemberStatusAtEvent(status, raw, now)]);
        }
      }
      // 境界ちょうど（90日ちょうど・1ミリ秒超え）
      const exact = new Date(now - LAST_PAYING_TTL_MS).toISOString();
      const over = new Date(now - LAST_PAYING_TTL_MS - 1).toISOString();
      expect(run({ status: "anonymous", getItem: () => exact }).value).toBe("anonymous_member");
      expect(run({ status: "anonymous", getItem: () => over }).value).toBe("anonymous");
      expect(resolveMemberStatusAtEvent("anonymous", exact, now)).toBe("anonymous_member");
      expect(resolveMemberStatusAtEvent("anonymous", over, now)).toBe("anonymous");
    } finally {
      vi.useRealTimers();
    }
  });
});
