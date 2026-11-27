// @vitest-environment node
// ローカル Supabase の実テーブルで、Slack DM（#327-H）の記録の一意制約と確保の動きを確かめる結合テスト。
// 通常の npm test では skip。実行するには `npx supabase start` してマイグレーションを当て、
//   MEMBER_MAIL_LOCAL_DB_SERVICE_KEY=<service_role> MEMBER_MAIL_LOCAL_DB_ANON_KEY=<anon> npx vitest run member-mail/slack-dm-store.localdb
// 注意: テスト用のユーザー（*@example.invalid）と行を作って消す。ローカル以外には向けないこと。
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
vi.mock("server-only", () => ({}));
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { createSupabaseSlackDmStore } from "@/lib/member-mail/slack-dm-store";

const URL = process.env.MEMBER_MAIL_LOCAL_DB_URL ?? "http://127.0.0.1:54321";
const SERVICE = process.env.MEMBER_MAIL_LOCAL_DB_SERVICE_KEY ?? "";
const ANON = process.env.MEMBER_MAIL_LOCAL_DB_ANON_KEY ?? "";
const ENABLED = SERVICE !== "" && ANON !== "" && /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(URL);
const admin = createClient(URL, SERVICE || "unused", { auth: { persistSession: false } });
const store = createSupabaseSlackDmStore(admin);
const RUN = randomUUID().slice(0, 8);
let userId = "";
let campaignId = "";
let deliveryId = "";

describe.skipIf(!ENABLED)("ローカルDB実テーブル（Slack DM）", () => {
  beforeAll(async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: `sd-${RUN}@example.invalid`,
      password: `Pw-${randomUUID()}`,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    const c = await admin
      .from("member_mail_campaigns")
      .insert({ kind: "signup", label: `slack-dm-localdb-${RUN}`, subject: "s", body: "b" })
      .select("id")
      .single();
    if (c.error) throw c.error;
    campaignId = c.data.id;
    const d = await admin
      .from("member_mail_deliveries")
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        kind: "signup",
        category: "signup",
        audience: "all",
        content_version: 1,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (d.error) throw d.error;
    deliveryId = d.data.id;
  });

  afterAll(async () => {
    await admin.from("member_mail_slack_dms").delete().eq("delivery_id", deliveryId);
    await admin.from("member_mail_slack_dm_previews").delete().eq("campaign_id", campaignId);
    await admin.from("member_mail_slack_dm_preferences").delete().eq("user_id", userId);
    await admin.from("member_mail_deliveries").delete().eq("id", deliveryId);
    await admin.from("member_mail_campaigns").delete().eq("id", campaignId);
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  const row = () => ({
    deliveryId,
    campaignId,
    userId,
    audience: "all" as const,
    contentVersion: 1,
    teamId: "T0LOCAL",
    slackUserId: "U0LOCAL",
  });

  it("スイッチの既定は off", async () => {
    expect(await store.getSlackDmMode()).toBe("off");
  });

  it("候補に出て、確保は1回だけ（2回目は ignoreDuplicates で null）", async () => {
    const before = await store.listSlackDmCandidates([campaignId], new Date(Date.now() - 3600_000), 10);
    expect(before.map((c) => c.deliveryId)).toEqual([deliveryId]);
    const id = await store.claimSlackDm(row(), new Date());
    expect(id).toBeTruthy();
    expect(await store.claimSlackDm(row(), new Date())).toBeNull();
    expect(await store.listSlackDmCandidates([campaignId], new Date(Date.now() - 3600_000), 10)).toEqual([]);

    // deferred は取り直せる（もう一度は取れない）
    await store.finishSlackDm(id!, { status: "deferred", reason: "ratelimited" });
    expect((await store.listSlackDmCandidates([campaignId], new Date(Date.now() - 3600_000), 10)).length).toBe(1);
    const again = await store.claimSlackDm(row(), new Date());
    expect(again).toBe(id);
    expect(await store.claimSlackDm(row(), new Date())).toBeNull();
    await store.finishSlackDm(id!, { status: "sent", sentAt: new Date(), ts: "1.1", channelId: "D0LOCAL" });
    // 終わった行は上書きしない
    await store.finishSlackDm(id!, { status: "failed", reason: "x" });
    const { data } = await admin.from("member_mail_slack_dms").select("status").eq("id", id!).single();
    expect(data?.status).toBe("sent");
    expect(await store.hasReceivedSlackDm(userId)).toBe(true);
  });

  it("古い sending は needs_review になる", async () => {
    await admin.from("member_mail_slack_dms").update({ status: "sending" }).eq("delivery_id", deliveryId);
    expect(await store.markStaleSlackDms(new Date(Date.now() + 60_000))).toBe(1);
    const { data } = await admin.from("member_mail_slack_dms").select("status, reason").eq("delivery_id", deliveryId).single();
    expect(data).toEqual({ status: "needs_review", reason: "stale_sending" });
  });

  it("オーナー確認は同じ版に1回だけ・本人のオン・オフ", async () => {
    const p = { campaignId, userId, contentVersion: 1, teamId: "T0LOCAL", slackUserId: "U0LOCAL" };
    expect(await store.claimSlackPreview(p, new Date())).toBeTruthy();
    expect(await store.claimSlackPreview(p, new Date())).toBeNull();
    expect(await store.getSlackDmPreference(userId)).toEqual({ enabled: true, hasRow: false });
    await store.setSlackDmEnabled(userId, false, new Date());
    expect(await store.getSlackDmPreference(userId)).toEqual({ enabled: false, hasRow: true });
    expect([...(await store.listSlackDmDisabledUserIds([userId]))]).toEqual([userId]);
  });
});
