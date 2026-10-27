// @vitest-environment node
// ローカル Supabase の実テーブル（PostgREST 経由）で store と SQL 関数を検証する結合テスト（#263）。
// 通常の npm test では skip。実行するには `npx supabase start` して 20261027000000_create_slack_member_sync.sql を当て、
//   SLACK_SYNC_LOCAL_DB_SERVICE_KEY=<service_role> SLACK_SYNC_LOCAL_DB_ANON_KEY=<anon> npx vitest run slack-member-sync/store.localdb
// 背景: PATCH の条件・RPC の戻り値・権限は、メモリ上の偽 store では検出できない（#238 と同じ理由）。
// 注意: slack_member_* / slack_link_tokens を全削除し、テスト用の auth ユーザーと課金行を作る。ローカル以外には向けないこと。
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
vi.mock("server-only", () => ({}));
import { createClient } from "@supabase/supabase-js";
import { createSupabaseSyncStore } from "@/lib/slack-member-sync/store";
import { hashEmail } from "@/lib/slack-member-sync/slack-api";
import { hashToken } from "@/lib/slack-member-sync/tokens";
import { makeState, TEAM_ID } from "./helpers";

const URL = process.env.SLACK_SYNC_LOCAL_DB_URL ?? "http://127.0.0.1:54321";
const SERVICE = process.env.SLACK_SYNC_LOCAL_DB_SERVICE_KEY ?? "";
const ANON = process.env.SLACK_SYNC_LOCAL_DB_ANON_KEY ?? "";
const ENABLED = SERVICE !== "" && ANON !== "" && /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(URL);
const admin = createClient(URL, SERVICE || "unused", { auth: { persistSession: false } });
const store = createSupabaseSyncStore(admin);

const PAID_EMAIL = `slack-sync-paid-${Date.now()}@example.com`;
const FREE_EMAIL = `slack-sync-free-${Date.now()}@example.com`;
let paidId = "";
let freeId = "";

async function resetTables() {
  await admin.from("slack_member_sync_state").delete().neq("team_id", "");
  await admin.from("slack_member_links").delete().neq("team_id", "");
  await admin.from("slack_link_tokens").delete().neq("team_id", "");
}

describe.skipIf(!ENABLED)("ローカルDB実テーブル（#263）", () => {
  beforeAll(async () => {
    await resetTables();
    const paid = await admin.auth.admin.createUser({ email: PAID_EMAIL, password: "TestPass123!", email_confirm: true });
    const free = await admin.auth.admin.createUser({ email: FREE_EMAIL, password: "TestPass123!", email_confirm: true });
    paidId = paid.data.user!.id;
    freeId = free.data.user!.id;
    const { error } = await admin.from("user_subscriptions").insert([
      { user_id: paidId, plan_type: "standard", is_active: true, stripe_subscription_id: "sub_local_1", environment: "live" },
      { user_id: freeId, plan_type: "standard", is_active: true, stripe_subscription_id: null, environment: "live" },
    ]);
    expect(error).toBeNull();
    await admin
      .from("slack_member_sync_settings")
      .update({ mode: "dry_run", run_locked_until: null, owner_report_sent_on: null })
      .eq("id", 1);
  });

  afterAll(async () => {
    if (!ENABLED) return;
    await resetTables();
    await admin.from("user_subscriptions").delete().in("user_id", [paidId, freeId]);
    await admin.auth.admin.deleteUser(paidId);
    await admin.auth.admin.deleteUser(freeId);
  });

  it("設定を読める（既定値）", async () => {
    const s = await store.getSettings();
    expect(s).toMatchObject({ mode: "dry_run", minNoticeDays: 7, linkGraceDays: 14 });
  });

  it("実行ロックは1つだけ取れ、期限切れなら取り直せる", async () => {
    const now = new Date();
    expect(await store.acquireRunLock(now, new Date(now.getTime() + 60_000))).toBe(true);
    expect(await store.acquireRunLock(now, new Date(now.getTime() + 60_000))).toBe(false);
    expect(await store.acquireRunLock(new Date(now.getTime() + 120_000), new Date(now.getTime() + 180_000))).toBe(true);
    await store.releaseRunLock();
    expect(await store.acquireRunLock(now, new Date(now.getTime() + 60_000))).toBe(true);
    await store.releaseRunLock();
  });

  it("メールのハッシュで課金を引ける（大文字・空白は同じ扱い）。ユーザーIDでも引ける", async () => {
    const rows = await store.lookupSubscriptions([hashEmail(` ${PAID_EMAIL.toUpperCase()} `), hashEmail(FREE_EMAIL)], []);
    const paid = rows.find((r) => r.subscription.userId === paidId)!;
    const free = rows.find((r) => r.subscription.userId === freeId)!;
    expect(paid.emailHash).toBe(hashEmail(PAID_EMAIL));
    expect(paid.subscription).toMatchObject({ hasPaidRecord: true, isActive: true });
    expect(free.subscription).toMatchObject({ hasPaidRecord: false, isActive: false });
    const byId = await store.lookupSubscriptions([], [paidId]);
    expect(byId).toHaveLength(1);
    expect(byId[0].emailHash).toBeNull();
  });

  it("状態の upsert・読み出し・DM の確保（1回だけ）", async () => {
    await store.upsertStates([
      makeState({ slackUserId: "U_LOCAL", classification: "needs_link", reason: "not_linked", teamId: TEAM_ID }),
    ]);
    const [s] = await store.listStates(TEAM_ID);
    expect(s).toMatchObject({ slackUserId: "U_LOCAL", classification: "needs_link", needsReview: false });
    expect(await store.claimDm(TEAM_ID, "U_LOCAL", "link_request")).toBe(true);
    expect(await store.claimDm(TEAM_ID, "U_LOCAL", "link_request")).toBe(false);
    await store.patchState(TEAM_ID, "U_LOCAL", {
      needsReview: false,
      reviewReason: null,
      linkRequestDmAt: new Date(),
      linkDeadline: "2026-11-10",
    });
    // 送信済みなら、印が無くても確保できない
    expect(await store.claimDm(TEAM_ID, "U_LOCAL", "link_request")).toBe(false);
    const [after] = await store.listStates(TEAM_ID);
    expect(after.linkDeadline).toBe("2026-11-10");
  });

  it("本文未承認の印だけなら確保できる", async () => {
    await store.upsertStates([
      makeState({ slackUserId: "U_SOFT", classification: "remove_scheduled", needsReview: true, reviewReason: "message_not_approved" }),
    ]);
    expect(await store.claimDm(TEAM_ID, "U_SOFT", "removal_notice")).toBe(true);
  });

  it("つながりは上書きしない", async () => {
    expect(await store.insertLink({ userId: paidId, teamId: TEAM_ID, slackUserId: "U_A", linkedVia: "email" })).toBe("inserted");
    expect(await store.insertLink({ userId: paidId, teamId: TEAM_ID, slackUserId: "U_B", linkedVia: "email" })).toBe("conflict");
    expect(await store.insertLink({ userId: freeId, teamId: TEAM_ID, slackUserId: "U_A", linkedVia: "email" })).toBe("conflict");
    expect(await store.listLinks(TEAM_ID)).toEqual([{ userId: paidId, slackUserId: "U_A" }]);
    expect(await store.getLinkByUserId(paidId)).toEqual({ teamId: TEAM_ID, slackUserId: "U_A" });
  });

  it("使い捨てリンクでつなぐ（SQL 関数）・回数を数える", async () => {
    await admin.from("slack_member_links").delete().neq("team_id", "");
    const raw = "l".repeat(43);
    await store.insertLinkToken({
      tokenHash: hashToken(raw),
      teamId: TEAM_ID,
      slackUserId: "U_TOKEN",
      purpose: "mypage",
      expiresAt: new Date(Date.now() + 60_000),
      requestedByUserId: paidId,
    });
    expect(await store.peekToken(hashToken(raw))).toBe("valid");
    expect(await store.claimLink(hashToken(raw), paidId)).toBe("linked");
    expect(await store.peekToken(hashToken(raw))).toBe("used");
    expect(await store.claimLink(hashToken(raw), paidId)).toBe("used");
    expect(await store.getLinkedUserId(TEAM_ID, "U_TOKEN")).toBe(paidId);
    expect(await store.countMypageRequests(paidId, new Date(Date.now() - 3600e3))).toBe(1);
  });

  it("anon キーでは読めない・書けない・関数を呼べない", async () => {
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    expect((await anon.from("slack_member_sync_state").select("*")).error).not.toBeNull();
    expect((await anon.from("slack_member_links").select("*")).error).not.toBeNull();
    expect((await anon.from("slack_link_tokens").select("*")).error).not.toBeNull();
    expect((await anon.from("slack_member_sync_settings").update({ mode: "live" }).eq("id", 1)).error).not.toBeNull();
    expect((await anon.rpc("slack_member_sync_lookup", { p_email_hashes: [], p_user_ids: [] })).error).not.toBeNull();
    expect((await anon.rpc("slack_member_link_claim", { p_token_hash: "x", p_user_id: paidId })).error).not.toBeNull();
  });
});
