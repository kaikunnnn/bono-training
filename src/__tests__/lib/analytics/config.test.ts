import { describe, it, expect, vi } from "vitest";
import { GA_BOOTSTRAP, GA_MEASUREMENT_ID, isAnalyticsHost } from "@/lib/analytics/config";

function bootstrap(hostname: string) {
  const append = vi.fn();
  const create = vi.fn(() => ({}));
  const win = { location: { hostname } } as Record<string, unknown>;
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
});
