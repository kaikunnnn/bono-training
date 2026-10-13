// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createSlackClient } from "@/lib/slack-welcome/slack-api";

function client(fetchImpl: typeof fetch, timeoutMs = 50) {
  return createSlackClient({ botToken: "xoxb-test", userToken: "xoxp-test", fetchImpl, timeoutMs });
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init });

describe("Slack API クライアント", () => {
  it("chat.postMessage はユーザートークン・unfurl 無効・mrkdwn で1回だけ呼ぶ", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true, channel: "D1", ts: "1.2" }));
    const result = await client(fetchMock as unknown as typeof fetch).postMessage("D1", "hello");
    expect(result).toEqual({ kind: "ok", data: { channelId: "D1", ts: "1.2" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://slack.com/api/chat.postMessage");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer xoxp-test");
    const params = new URLSearchParams(init.body as string);
    expect(params.get("unfurl_links")).toBe("false");
    expect(params.get("unfurl_media")).toBe("false");
    expect(params.get("mrkdwn")).toBe("true");
    expect(params.has("as_user")).toBe(false);
  });

  it("users.info はボットトークンで呼び、判定に必要な列だけ返す", async () => {
    const fetchMock = vi.fn(async () =>
      json({
        ok: true,
        user: { id: "U1", team_id: "T1", is_bot: false, is_restricted: true, profile: { email: "x@example.com" } },
      }),
    );
    const result = await client(fetchMock as unknown as typeof fetch).usersInfo("U1");
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer xoxb-test");
    expect(result.kind).toBe("ok");
    expect(JSON.stringify(result)).not.toContain("example.com");
    if (result.kind === "ok") expect(result.data.isRestricted).toBe(true);
  });

  it("429 は Retry-After を返し、自動で再試行しない", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 429, headers: { "retry-after": "30" } }));
    const result = await client(fetchMock as unknown as typeof fetch).postMessage("D1", "hi");
    expect(result).toEqual({ kind: "rate_limited", retryAfterSec: 30 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("5xx・ok:false・JSONでない応答・タイムアウトを区別する", async () => {
    expect(await client((async () => new Response("", { status: 503 })) as unknown as typeof fetch).postMessage("D", "x")).toEqual({
      kind: "http_error",
      status: 503,
    });
    expect(
      await client((async () => json({ ok: false, error: "channel_not_found" })) as unknown as typeof fetch).postMessage("D", "x"),
    ).toEqual({ kind: "slack_error", error: "channel_not_found" });
    expect(
      await client((async () => new Response("<html>", { status: 200 })) as unknown as typeof fetch).postMessage("D", "x"),
    ).toEqual({ kind: "network_error" });

    const hanging = ((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      })) as unknown as typeof fetch;
    expect(await client(hanging, 10).postMessage("D", "x")).toEqual({ kind: "timeout" });
  });
});
