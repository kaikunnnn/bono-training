import "server-only";

/**
 * 会員メールの Slack DM（#327-H）の永続化（Supabase / service_role）。
 * テーブル: supabase/migrations/20261127153000_member_mail_slack_dm.sql・slack_member_links（#263）
 *
 * ★スイッチ（slack_dm_mode）は member_mail_settings の別のクエリで読む。
 *   メールの getSettings の select に足すと、マイグレーション前はメールの処理まで止まるため。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SlackDmStore } from "./slack-dm";
import { MAIL_MODES, type MailMode } from "./types";

const SETTINGS = "member_mail_settings";
const PREFERENCES = "member_mail_slack_dm_preferences";
const DMS = "member_mail_slack_dms";
const LINKS = "slack_member_links";
/** in() に渡す user_id の数（URL の長さを抑える） */
const ID_CHUNK = 100;

function fail(what: string, error: { code?: string | null } | null): never {
  throw new Error(`${what} failed: ${error?.code ?? "unknown"}`);
}

function chunks<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function createSupabaseSlackDmStore(client: SupabaseClient): SlackDmStore {
  return {
    async getSlackDmMode() {
      const { data, error } = await client.from(SETTINGS).select("slack_dm_mode").eq("id", 1).maybeSingle();
      if (error) fail("slack dm mode read", error);
      const value = (data as { slack_dm_mode?: unknown } | null)?.slack_dm_mode;
      return MAIL_MODES.includes(value as MailMode) ? (value as MailMode) : "off";
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

    async isSlackDmEnabled(userId) {
      const { data, error } = await client.from(PREFERENCES).select("enabled").eq("user_id", userId).maybeSingle();
      if (error) fail("slack dm preference read", error);
      return data ? data.enabled !== false : true;
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

    async insertSlackDm(row, at) {
      const { data, error } = await client
        .from(DMS)
        .upsert(
          {
            delivery_id: row.deliveryId,
            campaign_id: row.campaignId,
            user_id: row.userId,
            audience: row.audience,
            content_version: row.contentVersion,
            team_id: row.teamId,
            slack_user_id: row.slackUserId,
            status: "sending",
            sending_at: at.toISOString(),
          },
          { onConflict: "delivery_id", ignoreDuplicates: true },
        )
        .select("id");
      if (error) fail("slack dm insert", error);
      const id = data && data.length > 0 ? (data[0] as { id?: unknown }).id : null;
      return typeof id === "string" ? id : null;
    },

    async finishSlackDm(id, patch) {
      const db: Record<string, unknown> = { status: patch.status };
      if (patch.reason !== undefined) db.reason = patch.reason;
      if (patch.channelId !== undefined) db.slack_channel_id = patch.channelId;
      if (patch.ts !== undefined) db.slack_ts = patch.ts;
      if (patch.sentAt !== undefined) db.sent_at = patch.sentAt ? patch.sentAt.toISOString() : null;
      // sending の行だけを書き換える（終わった行を上書きしない）
      const { error } = await client.from(DMS).update(db).eq("id", id).eq("status", "sending");
      if (error) fail("slack dm update", error);
    },
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
