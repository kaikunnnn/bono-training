// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

const runSync = vi.fn();
const createSyncDeps = vi.fn();
vi.mock("@/lib/slack-member-sync/process", () => ({ runSync: (...a: unknown[]) => runSync(...a) }));
vi.mock("@/lib/slack-member-sync/runtime", () => ({
  getSyncStore: () => ({}),
  createSyncDeps: (...a: unknown[]) => createSyncDeps(...a),
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/cron/slack-member-sync/route";

function req(auth?: string) {
  return new NextRequest("http://localhost/api/cron/slack-member-sync", {
    headers: auth ? { authorization: auth } : {},
  });
}

const saved = process.env.CRON_SECRET;
beforeEach(() => {
  runSync.mockReset();
  createSyncDeps.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  process.env.CRON_SECRET = saved;
});

describe("/api/cron/slack-member-sync", () => {
  it("CRON_SECRET 未設定なら拒否（fail-closed）", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req("Bearer undefined"));
    expect(res.status).toBe(401);
    expect(runSync).not.toHaveBeenCalled();
  });

  it("Bearer が違えば拒否", async () => {
    process.env.CRON_SECRET = "secret";
    expect((await GET(req("Bearer nope"))).status).toBe(401);
    expect((await GET(req())).status).toBe(401);
  });

  it("トークン等が未設定なら skipped: not_configured", async () => {
    process.env.CRON_SECRET = "secret";
    createSyncDeps.mockReturnValue(null);
    const res = await GET(req("Bearer secret"));
    expect(await res.json()).toEqual({ skipped: "not_configured" });
    expect(runSync).not.toHaveBeenCalled();
  });

  it("件数だけの結果を返す。一覧取得の失敗は 502", async () => {
    process.env.CRON_SECRET = "secret";
    createSyncDeps.mockReturnValue({});
    runSync.mockResolvedValueOnce({ mode: "dry_run", members: 3 });
    const ok = await GET(req("Bearer secret"));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ mode: "dry_run", members: 3 });

    runSync.mockResolvedValueOnce({ mode: "live", error: "users_list_timeout" });
    expect((await GET(req("Bearer secret"))).status).toBe(502);
  });

  it("例外は 500（中身は出さない）", async () => {
    process.env.CRON_SECRET = "secret";
    createSyncDeps.mockReturnValue({});
    runSync.mockRejectedValueOnce(new Error("state upsert failed: 42P01"));
    const res = await GET(req("Bearer secret"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "sync_failed" });
  });
});
