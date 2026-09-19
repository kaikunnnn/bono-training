// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { traceServerStep } from "./server-trace";

vi.mock("server-only", () => ({}));

afterEach(() => {
  delete process.env.PERF_TRACE_SERVER;
  vi.restoreAllMocks();
});

describe("local server performance trace", () => {
  it("is silent when the explicit local flag is absent", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await expect(traceServerStep("auth.get_user", async () => "member")).resolves.toBe("member");
    expect(info).not.toHaveBeenCalled();
  });

  it("logs only the allow-listed label, duration and success outcome", async () => {
    process.env.PERF_TRACE_SERVER = "1";
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await traceServerStep("subscription.query", async () => ({ private: "not logged" }));
    const event = JSON.parse(String(info.mock.calls[0][0]));
    expect(event).toEqual({
      level: "info",
      category: "performance_trace",
      label: "subscription.query",
      durationMs: expect.any(Number),
      outcome: "ok",
    });
    expect(JSON.stringify(event)).not.toContain("not logged");
  });

  it("records an error outcome without swallowing the original failure", async () => {
    process.env.PERF_TRACE_SERVER = "1";
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const failure = new Error("private provider detail");
    await expect(traceServerStep("top.cms.latest", async () => { throw failure; })).rejects.toBe(failure);
    const event = JSON.parse(String(info.mock.calls[0][0]));
    expect(event).toMatchObject({ label: "top.cms.latest", outcome: "error" });
    expect(JSON.stringify(event)).not.toContain(failure.message);
  });
});
