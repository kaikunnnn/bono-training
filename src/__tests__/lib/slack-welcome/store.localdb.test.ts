// @vitest-environment node
// ローカル Supabase の実テーブル（PostgREST 経由）で store を検証する結合テスト。
// 通常の npm test では skip。実行するには `npx supabase start` してマイグレーションを当て、
//   SLACK_WELCOME_LOCAL_DB_SERVICE_KEY=<service_role> SLACK_WELCOME_LOCAL_DB_ANON_KEY=<anon> npx vitest run store.localdb
// 背景: PATCH の or() が RETURNING 側にも再適用され「確保できたのに not_claimed」になる不具合を、
//       メモリ上の偽 store では検出できなかった（#238）。
// 注意: slack_welcome_deliveries を全削除し、settings を書き換える。ローカル以外には向けないこと。
import { describe, it, expect, vi, beforeAll } from "vitest";
vi.mock("server-only", () => ({}));
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { createSupabaseWelcomeStore } from "@/lib/slack-welcome/store";
import { processDelivery, runSweep } from "@/lib/slack-welcome/process";
import { FakeSlack, APPROVED_MESSAGE, TEAM_ID } from "./helpers";
import type { WelcomeDeps } from "@/lib/slack-welcome/types";

const URL = process.env.SLACK_WELCOME_LOCAL_DB_URL ?? "http://127.0.0.1:54321";
const SERVICE = process.env.SLACK_WELCOME_LOCAL_DB_SERVICE_KEY ?? "";
const ANON = process.env.SLACK_WELCOME_LOCAL_DB_ANON_KEY ?? "";
const ENABLED =
  SERVICE !== "" &&
  ANON !== "" &&
  /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(URL);
const admin = createClient(URL, SERVICE || "unused", {
  auth: { persistSession: false },
});
const store = createSupabaseWelcomeStore(admin);

function deps(slack: FakeSlack, alerts: unknown[] = []): WelcomeDeps {
  return {
    store,
    slack,
    teamId: TEAM_ID,
    message: APPROVED_MESSAGE,
    now: () => new Date(),
    sleep: async () => {},
    notifyOps: async (a) => {
      alerts.push(a.counts);
    },
    newToken: () => randomUUID(),
  } as WelcomeDeps;
}
async function seed(uid: string, at = new Date()) {
  const r = await store.insertDelivery({
    teamId: TEAM_ID,
    slackUserId: uid,
    eventId: `Ev-${uid}`,
    eventTime: at,
    firstReceivedAt: at,
  });
  return { r, id: (await store.findIdByKey(TEAM_ID, uid))! };
}

describe.skipIf(!ENABLED)("ローカルDB実テーブル", () => {
  beforeAll(async () => {
    await admin.from("slack_welcome_deliveries").delete().neq("team_id", "");
    const { error } = await admin
      .from("slack_welcome_settings")
      .update({
        mode: "live",
        enabled_from: new Date(Date.now() - 3600e3).toISOString(),
        test_user_ids: [],
      })
      .eq("id", 1);
    expect(error).toBeNull();
  });

  it("設定を読める", async () => {
    const s = await store.getSettings();
    expect(s?.mode).toBe("live");
  });
  it("同じ人の2回目のINSERTは duplicate", async () => {
    expect((await seed("U_DUP")).r).toBe("inserted");
    expect((await seed("U_DUP")).r).toBe("duplicate");
  });
  it("live: 1通送って sent。もう一度処理しても送らない", async () => {
    const slack = new FakeSlack();
    const { id } = await seed("U0NEW");
    expect(await processDelivery(deps(slack), id)).toBe("sent");
    expect(await processDelivery(deps(slack), id)).toBe("not_claimed");
    expect(slack.postCalls).toHaveLength(1);
    const { data } = await admin
      .from("slack_welcome_deliveries")
      .select("*")
      .eq("id", id)
      .single();
    expect(data.status).toBe("sent");
    expect(data.claim_token).toBeNull();
    expect(data.message_ts).toBeTruthy();
    expect(new Date(data.updated_at).getTime()).toBeGreaterThan(
      new Date(data.created_at).getTime() - 1,
    );
  });
  it("並行で10回処理しても1通だけ（実DBの行ロック）", async () => {
    const slack = new FakeSlack();
    slack.postDelayMs = 20;
    const { id } = await seed("U_RACE");
    const outs = await Promise.all(
      Array.from({ length: 10 }, () => processDelivery(deps(slack), id)),
    );
    expect(outs.filter((o) => o === "sent")).toHaveLength(1);
    expect(slack.postCalls).toHaveLength(1);
  });
  it("確保の期限が切れた processing は取り直して送れる", async () => {
    const slack = new FakeSlack();
    const { id } = await seed("U_EXPIRED");
    await admin
      .from("slack_welcome_deliveries")
      .update({
        status: "processing",
        claim_token: randomUUID(),
        locked_until: new Date(Date.now() - 60_000).toISOString(),
      })
      .eq("id", id);
    expect(await processDelivery(deps(slack), id)).toBe("sent");
    expect(slack.postCalls).toHaveLength(1);
  });
  it("確保の期限内の processing は取らない", async () => {
    const slack = new FakeSlack();
    const { id } = await seed("U_LOCKED");
    await admin
      .from("slack_welcome_deliveries")
      .update({
        status: "processing",
        claim_token: randomUUID(),
        locked_until: new Date(Date.now() + 60_000).toISOString(),
      })
      .eq("id", id);
    expect(await processDelivery(deps(slack), id)).toBe("not_claimed");
    expect(slack.postCalls).toHaveLength(0);
  });
  it("止まった sending は needs_review になり、送り直さない", async () => {
    const { id } = await seed("U_STUCK");
    await admin
      .from("slack_welcome_deliveries")
      .update({ status: "sending" })
      .eq("id", id);
    const n = await store.markStaleSending(new Date(Date.now() + 60_000));
    expect(n).toBeGreaterThanOrEqual(1);
    const { data } = await admin
      .from("slack_welcome_deliveries")
      .select("status")
      .eq("id", id)
      .single();
    expect(data.status).toBe("needs_review");
  });
  it("拾い直し(cron)で queued の人に送る", async () => {
    const slack = new FakeSlack();
    await seed("U_SWEEP");
    await runSweep(deps(slack));
    const { data } = await admin
      .from("slack_welcome_deliveries")
      .select("status")
      .eq("slack_user_id", "U_SWEEP")
      .single();
    expect(data.status).toBe("sent");
  });
  it("mode=off なら送らない", async () => {
    await admin
      .from("slack_welcome_settings")
      .update({ mode: "off" })
      .eq("id", 1);
    const slack = new FakeSlack();
    const { id } = await seed("U_OFF");
    await processDelivery(deps(slack), id);
    expect(slack.postCalls).toHaveLength(0);
  });
  it("anon キーでは読めない・書けない", async () => {
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    const r1 = await anon.from("slack_welcome_deliveries").select("*");
    expect(r1.error).not.toBeNull();
    const r2 = await anon
      .from("slack_welcome_settings")
      .update({ mode: "live" })
      .eq("id", 1);
    expect(r2.error).not.toBeNull();
  });
});
