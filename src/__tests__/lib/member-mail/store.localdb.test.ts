// @vitest-environment node
// ローカル Supabase の実テーブル（PostgREST 経由）で会員メール（#264）の store・トリガー・DB 関数を確かめる結合テスト。
// 通常の npm test では skip。実行するには `npx supabase start` してマイグレーションを当て、
//   MEMBER_MAIL_LOCAL_DB_SERVICE_KEY=<service_role> MEMBER_MAIL_LOCAL_DB_ANON_KEY=<anon> npx vitest run member-mail/store.localdb
// 注意: テスト用のユーザー（*@example.invalid）と行を作って消す。設定は最後に off に戻す。ローカル以外には向けないこと。
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
vi.mock("server-only", () => ({}));
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { createSupabaseMailStore } from "@/lib/member-mail/store";
import { prepareCampaign, runSendBatch, type MailDeps } from "@/lib/member-mail/process";
import { unsubscribeByToken } from "@/lib/member-mail/unsubscribe";
import { createUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";
import { handleResendEvent } from "@/lib/member-mail/webhook";
import { FakeMail, SECRET, SITE } from "./helpers";

const URL = process.env.MEMBER_MAIL_LOCAL_DB_URL ?? "http://127.0.0.1:54321";
const SERVICE = process.env.MEMBER_MAIL_LOCAL_DB_SERVICE_KEY ?? "";
const ANON = process.env.MEMBER_MAIL_LOCAL_DB_ANON_KEY ?? "";
const ENABLED = SERVICE !== "" && ANON !== "" && /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(URL);
const admin = createClient(URL, SERVICE || "unused", { auth: { persistSession: false } });
const store = createSupabaseMailStore(admin);
const RUN = randomUUID().slice(0, 8);
const userIds: string[] = [];
let campaignId = "";

function deps(mail: FakeMail, alerts: unknown[] = []): MailDeps {
  return {
    store,
    mail,
    notifyOps: async (a) => {
      alerts.push(a);
    },
    // 月曜 9:00 JST（送ってよい時間帯）
    now: () => new Date(),
    newToken: () => randomUUID(),
    siteUrl: SITE,
    from: "カイくん <test@mail.example.invalid>",
    replyTo: null,
    unsubscribeSecret: SECRET,
  };
}

describe.skipIf(!ENABLED)("ローカルDB実テーブル（会員メール）", () => {
  beforeAll(async () => {
    for (let i = 1; i <= 3; i++) {
      const { data, error } = await admin.auth.admin.createUser({
        email: `mm-${RUN}-${i}@example.invalid`,
        password: `Pw-${randomUUID()}`,
        email_confirm: true,
      });
      if (error) throw error;
      userIds.push(data.user.id);
    }
    // 1・2 は課金中（live）、3 は登録だけ
    for (const [i, id] of userIds.entries()) {
      const paid = i < 2;
      const { error } = await admin.from("user_subscriptions").upsert(
        {
          user_id: id,
          plan_type: "standard",
          duration: 1,
          is_active: paid,
          environment: "live",
          stripe_subscription_id: paid ? `sub_localdb_${RUN}_${i}` : null,
        },
        { onConflict: "user_id,environment" },
      );
      if (error) throw error;
    }
    // 他の課金中の会員が既にいても、このテストは自分の3人だけを見る
    await admin.from("member_mail_settings").update({ mode: "count", owner_user_ids: [userIds[2]], daily_limit: 1000, send_hour_start: 0, send_hour_end: 24 }).eq("id", 1);
    await admin.from("member_mail_kind_settings").update({ mode: "all" }).eq("kind", "weekly");
  });

  afterAll(async () => {
    await admin.from("member_mail_settings").update({ mode: "off", owner_user_ids: [], daily_limit: 80, send_hour_start: 8, send_hour_end: 21, run_locked_until: null, auto_stopped_reason: null, auto_stopped_at: null }).eq("id", 1);
    await admin.from("member_mail_kind_settings").update({ mode: "off" }).eq("kind", "weekly");
    if (campaignId) {
      const { data: ds } = await admin.from("member_mail_deliveries").select("id").eq("campaign_id", campaignId);
      const ids = (ds ?? []).map((d) => d.id as string);
      if (ids.length) await admin.from("member_mail_webhook_events").delete().in("delivery_id", ids);
      await admin.from("member_mail_deliveries").delete().eq("campaign_id", campaignId);
      await admin.from("member_mail_campaigns").delete().eq("id", campaignId);
    }
    for (const id of userIds) {
      await admin.from("user_subscriptions").delete().eq("user_id", id);
      await admin.auth.admin.deleteUser(id);
    }
  });

  it("anon からは読めない（service_role 専用）", async () => {
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data, error } = await anon.from("member_mail_deliveries").select("id").limit(1);
    expect(error !== null || (data ?? []).length === 0).toBe(true);
    const rpc = await anon.rpc("member_mail_approve_campaign", { p_campaign_id: randomUUID() });
    expect(rpc.error).not.toBeNull();
  });

  it("文面が変わると承認が外れ、承認し直せる（トリガーと承認の関数）", async () => {
    const { data, error } = await admin
      .from("member_mail_campaigns")
      .insert({
        kind: "weekly",
        label: `localdb-${RUN}`,
        subject: "テストの件名",
        body: "テストの本文\n\n[見る](https://www.bo-no.design/lessons)",
        scheduled_at: new Date().toISOString(),
        approved_version: 1, // INSERT では承認できない
      })
      .select("id, content_version, approved_version")
      .single();
    if (error) throw error;
    campaignId = data.id;
    expect(data).toMatchObject({ content_version: 1, approved_version: null });

    const ok = await admin.rpc("member_mail_approve_campaign", { p_campaign_id: campaignId, p_expected_version: 1 });
    expect(ok.data).toBe(1);
    await admin.from("member_mail_campaigns").update({ body: "直した本文", approved_version: 1 }).eq("id", campaignId);
    let c = await store.getCampaign(campaignId);
    expect(c).toMatchObject({ contentVersion: 2, approvedVersion: null });
    const stale = await admin.rpc("member_mail_approve_campaign", { p_campaign_id: campaignId, p_expected_version: 1 });
    expect(stale.data).toBeNull();
    await admin.rpc("member_mail_approve_campaign", { p_campaign_id: campaignId, p_expected_version: 2 });
    c = await store.getCampaign(campaignId);
    expect(c).toMatchObject({ contentVersion: 2, approvedVersion: 2 });
  });

  it("人数だけ出す: 人数だけが記録され、送信の記録は作られない", async () => {
    const c = (await store.getCampaign(campaignId))!;
    const result = await prepareCampaign(deps(new FakeMail()), c);
    expect(result.outcome).toBe("counted");
    const { data } = await admin.from("member_mail_campaigns").select("last_count").eq("id", campaignId).single();
    const json = JSON.stringify(data?.last_count);
    expect(json).not.toContain("@");
    for (const id of userIds) expect(json).not.toContain(id);
    const { count } = await admin.from("member_mail_deliveries").select("id", { count: "exact", head: true }).eq("campaign_id", campaignId);
    expect(count).toBe(0);
  });

  it("オーナーだけ → 全員: 二重に送らない。配信停止した人には送らない。webhook と届かないの記録", async () => {
    // オーナーだけ（登録だけのユーザー3をオーナーに見立てる）
    await admin.from("member_mail_settings").update({ mode: "owner" }).eq("id", 1);
    const mail = new FakeMail();
    let c = (await store.getCampaign(campaignId))!;
    expect(await prepareCampaign(deps(mail), c)).toMatchObject({ outcome: "enqueued", audience: "owner", inserted: 1 });
    expect(await prepareCampaign(deps(mail), c)).toMatchObject({ inserted: 0 });
    await runSendBatch(deps(mail));
    expect(mail.sent.map((m) => m.to)).toEqual([`mm-${RUN}-3@example.invalid`]);

    // ユーザー1がワンクリックで止める
    await unsubscribeByToken(store, SECRET, createUnsubscribeToken(SECRET, userIds[0], "notice"), "one_click", new Date());

    // 全員に送る
    await admin.from("member_mail_settings").update({ mode: "all" }).eq("id", 1);
    c = (await store.getCampaign(campaignId))!;
    const prepared = await prepareCampaign(deps(mail), c);
    expect(prepared.outcome).toBe("enqueued");
    const mine = await admin.from("member_mail_deliveries").select("user_id, audience, status").eq("campaign_id", campaignId);
    const allRows = (mine.data ?? []).filter((r) => r.audience === "all");
    expect(allRows.map((r) => r.user_id)).not.toContain(userIds[0]);
    expect(allRows.map((r) => r.user_id)).toContain(userIds[1]);
    // 書き出しの印を外して再実行しても、一意制約で増えない
    await admin.from("member_mail_campaigns").update({ enqueued_at: null }).eq("id", campaignId);
    c = (await store.getCampaign(campaignId))!;
    expect(await prepareCampaign(deps(mail), c)).toMatchObject({ inserted: 0 });

    await runSendBatch(deps(mail));
    await runSendBatch(deps(mail));
    const toUser2 = mail.sent.filter((m) => m.to === `mm-${RUN}-2@example.invalid`);
    expect(toUser2).toHaveLength(1);
    expect(mail.sent.some((m) => m.to === `mm-${RUN}-1@example.invalid`)).toBe(false);

    // webhook: 開いた（同じ番号2回で1回）→ 届かなかった → 以後送らない
    const row = await admin
      .from("member_mail_deliveries")
      .select("id, resend_email_id")
      .eq("campaign_id", campaignId)
      .eq("user_id", userIds[1])
      .eq("audience", "all")
      .single();
    const emailId = row.data!.resend_email_id as string;
    const wdeps = { store, notifyOps: async () => {}, now: () => new Date() };
    expect(await handleResendEvent(wdeps, `w-${RUN}-1`, { type: "email.opened", data: { email_id: emailId } })).toBe("recorded");
    expect(await handleResendEvent(wdeps, `w-${RUN}-1`, { type: "email.opened", data: { email_id: emailId } })).toBe("duplicate");
    expect(
      await handleResendEvent(wdeps, `w-${RUN}-2`, {
        type: "email.clicked",
        data: { email_id: emailId, click: { link: "https://www.bo-no.design/lessons?from=email_weekly&x=1" } },
      }),
    ).toBe("recorded");
    expect(await handleResendEvent(wdeps, `w-${RUN}-3`, { type: "email.bounced", data: { email_id: emailId } })).toBe("suppressed");
    const after = await admin
      .from("member_mail_deliveries")
      .select("open_count, click_count, first_opened_at, first_clicked_at, bounced_at")
      .eq("id", row.data!.id)
      .single();
    expect(after.data).toMatchObject({ open_count: 1, click_count: 1 });
    expect(after.data!.bounced_at).not.toBeNull();
    expect(await store.isSuppressed(userIds[1])).toBe(true);
    const ev = await admin.from("member_mail_webhook_events").select("link_path").eq("webhook_id", `w-${RUN}-2`).single();
    expect(ev.data!.link_path).toBe("www.bo-no.design/lessons?from=email_weekly");

    // 送信記録にメールアドレスの列は無い
    const sample = await admin.from("member_mail_deliveries").select("*").eq("id", row.data!.id).single();
    expect(JSON.stringify(sample.data)).not.toContain("@");
  });
});
