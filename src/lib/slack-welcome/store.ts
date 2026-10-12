import "server-only";

/**
 * Slack ウェルカムDM（#238）の永続化（Supabase / service_role）。
 * テーブル: supabase/migrations/20261012000000_create_slack_welcome_dm.sql
 *
 * 原子性: claim / update は PostgREST の条件付き UPDATE ... RETURNING 1文で行う。
 * 同じ行を同時に確保しようとしても、行ロック後に WHERE が再評価されるので1つだけが勝つ。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  CLAIMABLE_STATUSES,
  type DeliveryPatch,
  type DeliveryRow,
  type DeliveryStatus,
  type NewDelivery,
  type WelcomeMode,
  type WelcomeSettings,
  type WelcomeStore,
} from "./types";

const DELIVERIES = "slack_welcome_deliveries";
const SETTINGS = "slack_welcome_settings";
const MODES: WelcomeMode[] = ["off", "dry_run", "test", "live"];

type DbRow = Record<string, unknown>;

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapRow(row: DbRow): DeliveryRow {
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    slackUserId: row.slack_user_id as string,
    eventId: row.event_id as string,
    eventTime: toDate(row.event_time) ?? new Date(0),
    status: row.status as DeliveryStatus,
    attempts: Number(row.attempts ?? 0),
    nextAttemptAt: toDate(row.next_attempt_at) ?? new Date(0),
    claimToken: (row.claim_token as string | null) ?? null,
    lockedUntil: toDate(row.locked_until),
    lastErrorCode: (row.last_error_code as string | null) ?? null,
    channelId: (row.channel_id as string | null) ?? null,
    messageTs: (row.message_ts as string | null) ?? null,
    messageVersion: (row.message_version as number | null) ?? null,
    dryRunResult: (row.dry_run_result as string | null) ?? null,
    dryRunAt: toDate(row.dry_run_at),
    firstReceivedAt: toDate(row.first_received_at) ?? new Date(0),
    sentAt: toDate(row.sent_at),
  };
}

function patchToDb(patch: DeliveryPatch): DbRow {
  const db: DbRow = {};
  if (patch.status !== undefined) db.status = patch.status;
  if (patch.attempts !== undefined) db.attempts = patch.attempts;
  if (patch.nextAttemptAt !== undefined) db.next_attempt_at = patch.nextAttemptAt.toISOString();
  if (patch.lastErrorCode !== undefined) db.last_error_code = patch.lastErrorCode;
  if (patch.channelId !== undefined) db.channel_id = patch.channelId;
  if (patch.messageTs !== undefined) db.message_ts = patch.messageTs;
  if (patch.messageVersion !== undefined) db.message_version = patch.messageVersion;
  if (patch.dryRunResult !== undefined) db.dry_run_result = patch.dryRunResult;
  if (patch.dryRunAt !== undefined) db.dry_run_at = patch.dryRunAt ? patch.dryRunAt.toISOString() : null;
  if (patch.sentAt !== undefined) db.sent_at = patch.sentAt ? patch.sentAt.toISOString() : null;
  if (patch.release) {
    db.claim_token = null;
    db.locked_until = null;
  }
  return db;
}

/** PostgREST の or() 用に値をダブルクォートで囲む */
function q(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function claimableOrFilter(nowIso: string): string {
  return `status.in.(${CLAIMABLE_STATUSES.join(",")}),and(status.eq.processing,locked_until.lt.${q(nowIso)})`;
}

export function createSupabaseWelcomeStore(client: SupabaseClient): WelcomeStore {
  return {
    async getSettings() {
      const { data, error } = await client
        .from(SETTINGS)
        .select("mode, enabled_from, test_user_ids")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw new Error(`settings read failed: ${error.code ?? "unknown"}`);
      if (!data) return null;
      const mode = MODES.includes(data.mode as WelcomeMode) ? (data.mode as WelcomeMode) : "off";
      const settings: WelcomeSettings = {
        mode,
        enabledFrom: toDate(data.enabled_from),
        testUserIds: Array.isArray(data.test_user_ids)
          ? (data.test_user_ids as unknown[]).filter((v): v is string => typeof v === "string")
          : [],
      };
      return settings;
    },

    async insertDelivery(row: NewDelivery) {
      const { data, error } = await client
        .from(DELIVERIES)
        .upsert(
          {
            team_id: row.teamId,
            slack_user_id: row.slackUserId,
            event_id: row.eventId,
            event_time: row.eventTime.toISOString(),
            first_received_at: row.firstReceivedAt.toISOString(),
            next_attempt_at: row.firstReceivedAt.toISOString(),
            status: "queued",
          },
          { onConflict: "team_id,slack_user_id", ignoreDuplicates: true },
        )
        .select("id");
      if (error) throw new Error(`delivery insert failed: ${error.code ?? "unknown"}`);
      return data && data.length > 0 ? "inserted" : "duplicate";
    },

    async findIdByKey(teamId, slackUserId) {
      const { data, error } = await client
        .from(DELIVERIES)
        .select("id")
        .eq("team_id", teamId)
        .eq("slack_user_id", slackUserId)
        .maybeSingle();
      if (error) throw new Error(`delivery lookup failed: ${error.code ?? "unknown"}`);
      return (data?.id as string | undefined) ?? null;
    },

    async claim(id, now, lockedUntil, token) {
      const nowIso = now.toISOString();
      const { data, error } = await client
        .from(DELIVERIES)
        .update({ status: "processing", claim_token: token, locked_until: lockedUntil.toISOString() })
        .eq("id", id)
        .lte("next_attempt_at", nowIso)
        .or(claimableOrFilter(nowIso))
        .select("*");
      if (error) throw new Error(`delivery claim failed: ${error.code ?? "unknown"}`);
      if (!data || data.length === 0) return null;
      return mapRow(data[0] as DbRow);
    },

    async update(id, token, expectedStatus, patch) {
      const { data, error } = await client
        .from(DELIVERIES)
        .update(patchToDb(patch))
        .eq("id", id)
        .eq("claim_token", token)
        .eq("status", expectedStatus)
        .select("id");
      if (error) throw new Error(`delivery update failed: ${error.code ?? "unknown"}`);
      return Boolean(data && data.length > 0);
    },

    async listDueIds(now, limit) {
      const nowIso = now.toISOString();
      const { data, error } = await client
        .from(DELIVERIES)
        .select("id")
        .lte("next_attempt_at", nowIso)
        .or(claimableOrFilter(nowIso))
        .order("next_attempt_at", { ascending: true })
        .limit(limit);
      if (error) throw new Error(`delivery list failed: ${error.code ?? "unknown"}`);
      return (data ?? []).map((r) => r.id as string);
    },

    async markStaleSending(olderThan) {
      const { data, error } = await client
        .from(DELIVERIES)
        .update({
          status: "needs_review",
          last_error_code: "stale_sending",
          claim_token: null,
          locked_until: null,
        })
        .eq("status", "sending")
        .lt("updated_at", olderThan.toISOString())
        .select("id");
      if (error) throw new Error(`stale sending sweep failed: ${error.code ?? "unknown"}`);
      return data?.length ?? 0;
    },
  };
}

/** 環境変数から service_role クライアントを作る。未設定なら null */
export function createWelcomeStoreFromEnv(): WelcomeStore | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return createSupabaseWelcomeStore(client);
}
