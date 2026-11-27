import "server-only";

/**
 * 会員メールの Slack DM（#327-H）の永続化（Supabase / service_role）。
 * テーブル: supabase/migrations/20261127084322_member_mail_slack_dm.sql・slack_member_links（#263）・member_mail_deliveries
 *
 * ★スイッチ（slack_dm_mode）は member_mail_settings の別のクエリで読む。
 *   メールの getSettings の select に足すと、マイグレーション前はメールの処理まで止まるため。
 * ★PATCH では or() を使わない（PostgREST は or() を更新後の行にも再適用する。#238 で再現）。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SlackDmCandidate, SlackDmPatch, SlackDmStore } from "./slack-dm";
import { MAIL_MODES, type Audience, type MailMode } from "./types";

const SETTINGS = "member_mail_settings";
const PREFERENCES = "member_mail_slack_dm_preferences";
const DMS = "member_mail_slack_dms";
const PREVIEWS = "member_mail_slack_dm_previews";
const DELIVERIES = "member_mail_deliveries";
const LINKS = "slack_member_links";
/** in() に渡す ID の数（URL の長さを抑える） */
const ID_CHUNK = 100;
/** 1回に読む候補（1日分の送れたメール）の上限。1日の送信の上限（daily_limit 既定80）より十分大きく */
const CANDIDATE_CAP = 1000;

type DbRow = Record<string, unknown>;

function fail(what: string, error: { code?: string | null } | null): never {
  throw new Error(`${what} failed: ${error?.code ?? "unknown"}`);
}

function chunks<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function patchToDb(patch: SlackDmPatch): DbRow {
  const db: DbRow = { status: patch.status };
  if (patch.reason !== undefined) db.reason = patch.reason;
  if (patch.channelId !== undefined) db.slack_channel_id = patch.channelId;
  if (patch.ts !== undefined) db.slack_ts = patch.ts;
  if (patch.sentAt !== undefined) db.sent_at = patch.sentAt ? patch.sentAt.toISOString() : null;
  return db;
}

function firstId(data: unknown): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const id = (data[0] as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}

export function createSupabaseSlackDmStore(client: SupabaseClient): SlackDmStore {
  /**
   * 記録が無ければ sending で入れる（一意制約の衝突は何もしない）。
   * 入らなかったら、deferred の行だけを sending に戻す（条件付き UPDATE ... RETURNING で1つの処理だけが取れる）
   */
  async function claim(table: string, conflict: string, row: DbRow, match: DbRow, at: Date): Promise<string | null> {
    const inserted = await client
      .from(table)
      .upsert({ ...row, status: "sending" }, { onConflict: conflict, ignoreDuplicates: true })
      .select("id");
    if (inserted.error) fail(`${table} insert`, inserted.error);
    const id = firstId(inserted.data);
    if (id) return id;
    let q = client.from(table).update({ status: "sending", reason: null, ...(table === DMS ? { sending_at: at.toISOString() } : {}) });
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v as string | number);
    const retried = await q.eq("status", "deferred").select("id");
    if (retried.error) fail(`${table} reclaim`, retried.error);
    return firstId(retried.data);
  }

  async function finish(table: string, id: string, patch: SlackDmPatch) {
    // sending の行だけを書き換える（終わった行を上書きしない）
    const { error } = await client.from(table).update(patchToDb(patch)).eq("id", id).eq("status", "sending");
    if (error) fail(`${table} update`, error);
  }

  return {
    async getSlackDmMode() {
      const { data, error } = await client.from(SETTINGS).select("slack_dm_mode").eq("id", 1).maybeSingle();
      if (error) fail("slack dm mode read", error);
      const value = (data as { slack_dm_mode?: unknown } | null)?.slack_dm_mode;
      return MAIL_MODES.includes(value as MailMode) ? (value as MailMode) : "off";
    },

    async getSlackDmRaisedAt() {
      const { data, error } = await client.from(SETTINGS).select("slack_dm_raised_at").eq("id", 1).maybeSingle();
      if (error) fail("slack dm raised read", error);
      const value = (data as { slack_dm_raised_at?: unknown } | null)?.slack_dm_raised_at;
      if (typeof value !== "string") return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    },

    async getSlackLink(userId) {
      const { data, error } = await client
        .from(LINKS)
        .select("team_id, slack_user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) fail("slack link read", error);
      if (!data || typeof data.team_id !== "string" || typeof data.slack_user_id !== "string") return null;
      return { teamId: data.team_id, slackUserId: data.slack_user_id };
    },

    async listSlackLinkedUserIds(userIds, teamId) {
      const out = new Set<string>();
      for (const ids of chunks(userIds, ID_CHUNK)) {
        let q = client.from(LINKS).select("user_id").in("user_id", ids);
        if (teamId) q = q.eq("team_id", teamId);
        const { data, error } = await q;
        if (error) fail("slack link list", error);
        for (const r of data ?? []) if (typeof r.user_id === "string") out.add(r.user_id);
      }
      return out;
    },

    async getSlackDmPreference(userId) {
      const { data, error } = await client.from(PREFERENCES).select("enabled").eq("user_id", userId).maybeSingle();
      if (error) fail("slack dm preference read", error);
      return data ? { enabled: data.enabled !== false, hasRow: true } : { enabled: true, hasRow: false };
    },

    async listSlackDmDisabledUserIds(userIds) {
      const out = new Set<string>();
      for (const ids of chunks(userIds, ID_CHUNK)) {
        const { data, error } = await client.from(PREFERENCES).select("user_id").in("user_id", ids).eq("enabled", false);
        if (error) fail("slack dm preference list", error);
        for (const r of data ?? []) if (typeof r.user_id === "string") out.add(r.user_id);
      }
      return out;
    },

    async setSlackDmEnabled(userId, enabled, at) {
      const { error } = await client
        .from(PREFERENCES)
        .upsert({ user_id: userId, enabled, updated_at: at.toISOString() }, { onConflict: "user_id" });
      if (error) fail("slack dm preference write", error);
    },

    async hasReceivedSlackDm(userId) {
      for (const table of [DMS, PREVIEWS]) {
        const { data, error } = await client.from(table).select("id").eq("user_id", userId).eq("status", "sent").limit(1);
        if (error) fail(`${table} received`, error);
        if (data && data.length > 0) return true;
      }
      return false;
    },

    async listSlackDmCandidates(campaignIds, range) {
      if (campaignIds.length === 0) return [];
      // 送れたメールを送った順に読み、DM の記録があるもの（deferred 以外）を外す。1日分なので上限は大きめ
      let q = client
        .from(DELIVERIES)
        .select("id, campaign_id, user_id, audience, content_version")
        .in("campaign_id", campaignIds as string[])
        .eq("status", "sent")
        .gte("sent_at", range.since.toISOString());
      if (range.until) q = q.lt("sent_at", range.until.toISOString());
      const { data, error } = await q.order("sent_at", { ascending: true }).limit(CANDIDATE_CAP);
      if (error) fail("slack dm candidates", error);
      const rows = (data ?? []) as DbRow[];
      const done = new Set<string>();
      for (const ids of chunks(rows.map((r) => r.id as string), ID_CHUNK)) {
        const dms = await client.from(DMS).select("delivery_id, status").in("delivery_id", ids);
        if (dms.error) fail("slack dm candidates dms", dms.error);
        for (const r of dms.data ?? []) if (r.status !== "deferred") done.add(r.delivery_id as string);
      }
      const out: SlackDmCandidate[] = [];
      for (const r of rows) {
        if (done.has(r.id as string)) continue;
        out.push({
          deliveryId: r.id as string,
          campaignId: r.campaign_id as string,
          userId: r.user_id as string,
          audience: r.audience as Audience,
          contentVersion: Number(r.content_version),
        });
      }
      return out;
    },

    claimSlackDm(row, at) {
      return claim(
        DMS,
        "delivery_id",
        {
          delivery_id: row.deliveryId,
          campaign_id: row.campaignId,
          user_id: row.userId,
          audience: row.audience,
          content_version: row.contentVersion,
          team_id: row.teamId,
          slack_user_id: row.slackUserId,
          sending_at: at.toISOString(),
        },
        { delivery_id: row.deliveryId },
        at,
      );
    },

    finishSlackDm: (id, patch) => finish(DMS, id, patch),

    async markStaleSlackDms(olderThan) {
      const { data, error } = await client
        .from(DMS)
        .update({ status: "needs_review", reason: "stale_sending" })
        .eq("status", "sending")
        .lt("updated_at", olderThan.toISOString())
        .select("id");
      if (error) fail("slack dm stale sweep", error);
      return data?.length ?? 0;
    },

    claimSlackPreview(row, at) {
      return claim(
        PREVIEWS,
        "campaign_id,user_id,content_version",
        {
          campaign_id: row.campaignId,
          user_id: row.userId,
          content_version: row.contentVersion,
          team_id: row.teamId,
          slack_user_id: row.slackUserId,
        },
        { campaign_id: row.campaignId, user_id: row.userId, content_version: row.contentVersion },
        at,
      );
    },

    finishSlackPreview: (id, patch) => finish(PREVIEWS, id, patch),
  };
}

/** 環境変数から service_role クライアントを作る。未設定なら null */
export function createSlackDmStoreFromEnv(): SlackDmStore | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return createSupabaseSlackDmStore(client);
}
