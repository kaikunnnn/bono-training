// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { afterTasks, runtimeState } = vi.hoisted(() => ({
  afterTasks: [] as (() => Promise<void> | void)[],
  runtimeState: { store: null as unknown, deps: null as unknown },
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (task: () => Promise<void> | void) => afterTasks.push(task) };
});

vi.mock("@/lib/slack-welcome/runtime", () => ({
  loadIngestConfig: () => ({ signingSecret: SECRET, teamId: "T0BONO", appId: "A0WELCOME" }),
  getWelcomeStore: () => runtimeState.store,
  createWelcomeDeps: () => runtimeState.deps,
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/slack/welcome/events/route";
import { signSlackRequest } from "@/lib/slack-welcome/signature";
import { APP_ID, FakeSlack, MemoryStore, TEAM_ID, makeDeps } from "./helpers";

const SECRET = "test-signing-secret";
const NOW = new Date("2026-10-12T03:00:00Z");

let store: MemoryStore;
let slack: FakeSlack;

function teamJoin(overrides: Record<string, unknown> = {}, userId = "U0NEW", eventId = "Ev01") {
  return {
    token: "legacy",
    team_id: TEAM_ID,
    api_app_id: APP_ID,
    type: "event_callback",
    event_id: eventId,
    event_time: Math.floor(NOW.getTime() / 1000),
    event: {
      type: "team_join",
      user: { id: userId, team_id: TEAM_ID, name: "should-not-be-stored", profile: { email: "x@example.com" } },
    },
    ...overrides,
  };
}

function makeRequest(
  body: string,
  opts: { secret?: string; ts?: number; signatureBody?: string; headers?: Record<string, string> } = {},
) {
  const ts = String(opts.ts ?? Math.floor(Date.now() / 1000));
  const signature = signSlackRequest(opts.secret ?? SECRET, ts, opts.signatureBody ?? body);
  return new NextRequest("http://localhost/api/slack/welcome/events", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "x-slack-request-timestamp": ts,
      "x-slack-signature": signature,
      ...opts.headers,
    },
  });
}

async function post(payload: unknown, opts?: Parameters<typeof makeRequest>[1]) {
  const res = await POST(makeRequest(JSON.stringify(payload), opts));
  return { status: res.status, json: await res.json() };
}

async function runAfterTasks() {
  while (afterTasks.length) await afterTasks.shift()!();
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  afterTasks.length = 0;
  store = new MemoryStore();
  slack = new FakeSlack();
  runtimeState.store = store;
  // 受け口は実時刻で記録するので、送信側の時計も実時刻に合わせる
  runtimeState.deps = makeDeps({ store, slack, nowRef: { now: new Date(Date.now() + 1000) } }).deps;
});

describe("POST /api/slack/welcome/events", () => {
  it("url_verification: 署名が正しければ challenge を返す", async () => {
    const res = await post({ type: "url_verification", challenge: "abc123", token: "x" });
    expect(res).toEqual({ status: 200, json: { challenge: "abc123" } });
  });

  it("url_verification でも署名が違えば 401", async () => {
    const res = await post({ type: "url_verification", challenge: "abc123" }, { secret: "wrong" });
    expect(res.status).toBe(401);
  });

  it("署名NG・5分超・改変本文は 401 で記録しない", async () => {
    expect((await post(teamJoin(), { secret: "wrong" })).status).toBe(401);
    expect((await post(teamJoin(), { ts: Math.floor(Date.now() / 1000) - 400 })).status).toBe(401);
    const body = JSON.stringify(teamJoin());
    const res = await POST(makeRequest(body, { signatureBody: body.replace("U0NEW", "U0OLD") }));
    expect(res.status).toBe(401);
    expect(store.rows).toHaveLength(0);
  });

  it("64KB 超は 413、不正JSONは 400", async () => {
    const big = JSON.stringify({ ...teamJoin(), pad: "x".repeat(70 * 1024) });
    expect((await POST(makeRequest(big))).status).toBe(413);
    expect((await POST(makeRequest("{not json"))).status).toBe(400);
  });

  it("別の team / app からのイベントは拒否する", async () => {
    expect((await post(teamJoin({ team_id: "T0OTHER" }))).status).toBe(403);
    expect((await post(teamJoin({ api_app_id: "A0OTHER" }))).status).toBe(403);
    expect(store.rows).toHaveLength(0);
  });

  it("team_join 以外のイベントは 200 で無視", async () => {
    const res = await post(teamJoin({ event: { type: "user_change", user: { id: "U0NEW" } } }));
    expect(res.status).toBe(200);
    expect(store.rows).toHaveLength(0);
    expect(afterTasks).toHaveLength(0);
  });

  it("team_join: 最小情報だけ記録して200を返し、応答後に1通送る", async () => {
    const res = await post(teamJoin());
    expect(res).toEqual({ status: 200, json: { ok: true } });
    expect(store.rows).toHaveLength(1);
    const row = store.rows[0];
    expect(row).toMatchObject({ teamId: TEAM_ID, slackUserId: "U0NEW", eventId: "Ev01", status: "queued" });
    // 名前・メールは保存しない
    expect(JSON.stringify(row)).not.toContain("should-not-be-stored");
    expect(JSON.stringify(row)).not.toContain("example.com");
    // 送信は応答のあと
    expect(slack.postCalls).toHaveLength(0);
    await runAfterTasks();
    expect(slack.postCalls).toHaveLength(1);
    expect(store.rows[0].status).toBe("sent");
  });

  it("同じ event_id の再送・同じ人の別イベント・送信後の再配送でも1通だけ", async () => {
    await post(teamJoin());
    await post(teamJoin()); // Slack の再送（同じ event_id）
    await runAfterTasks();
    await post(teamJoin({}, "U0NEW", "Ev02")); // 同じ人の別イベント（退出→再参加など）
    await runAfterTasks();
    expect(store.rows).toHaveLength(1);
    expect(slack.postCalls).toHaveLength(1);
  });

  it("並行に届いた再送でも1通だけ", async () => {
    slack.postDelayMs = 5;
    await Promise.all([post(teamJoin()), post(teamJoin()), post(teamJoin({}, "U0NEW", "Ev03"))]);
    await Promise.all(afterTasks.splice(0).map((t) => t()));
    expect(slack.postCalls).toHaveLength(1);
  });

  it("mode=off のときは記録もせず200", async () => {
    store.settings = { ...store.settings!, mode: "off" };
    const res = await post(teamJoin());
    expect(res.status).toBe(200);
    expect(store.rows).toHaveLength(0);
    expect(afterTasks).toHaveLength(0);
  });

  it("運用開始時刻より前の event_time は記録しない", async () => {
    store.settings = { ...store.settings!, enabledFrom: new Date("2026-10-13T00:00:00Z") };
    const res = await post(teamJoin());
    expect(res.status).toBe(200);
    expect(store.rows).toHaveLength(0);
  });

  it("永続化に失敗したら 503（Slack に再送させる）", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    store.failInsert = true;
    expect((await post(teamJoin())).status).toBe(503);
    store.failInsert = false;
    store.failSettings = true;
    expect((await post(teamJoin())).status).toBe(503);
    expect(afterTasks).toHaveLength(0);
  });

  it("Slack トークン未設定でも記録は残し、送信はしない（cron 待ち）", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    runtimeState.deps = null;
    await post(teamJoin());
    await runAfterTasks();
    expect(store.rows[0].status).toBe("queued");
    expect(slack.postCalls).toHaveLength(0);
  });
});
