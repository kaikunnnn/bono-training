import "server-only";

/**
 * Slack 定期整理（#263）の永続化（Supabase / service_role）。
 * テーブル・関数: supabase/migrations/20261027000000_create_slack_member_sync.sql
 *
 * 原子性:
 * - DM の確保（claimDm）は条件付き UPDATE ... RETURNING 1文。同じ人を同時に確保しようとしても1つだけが勝つ
 * - 実行ロック（acquireRunLock）も同じ
 * - PATCH では or() を使わない（PostgREST は or() を更新後の行にも再適用し、確保できたのに空配列が返る。#238 で確認）
 * - 使い捨てリンクでつなぐ処理は SQL 関数（slack_member_link_claim）の1トランザクション
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Classification,
  DmType,
  LinkClaimResult,
  LinkStore,
  ResolvedReason,
  SubscriptionSummary,
  SyncMode,
  SyncSettings,
  SyncState,
  SyncStore,
} from "./types";
import { SOFT_REVIEW_REASON } from "./classify";

const SETTINGS = "slack_member_sync_settings";
const STATE = "slack_member_sync_state";
const LINKS = "slack_member_links";
const TOKENS = "slack_link_tokens";
const MODES: SyncMode[] = ["off", "dry_run", "test", "live"];
/** PostgREST の既定の最大行数（max-rows）に合わせたページの大きさ */
const PAGE = 1000;
/** 一度に送る upsert / 照合の件数 */
const CHUNK = 200;
const LINK_CLAIM_RESULTS: LinkClaimResult[] = [
  "linked",
  "already_linked",
  "invalid",
  "used",
  "expired",
  "slack_linked_to_other",
  "user_linked_to_other",
  "conflict",
];

type DbRow = Record<string, unknown>;

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function fail(what: string, error: { code?: string } | null): never {
  throw new Error(`${what} failed: ${error?.code ?? "unknown"}`);
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function mapSettings(data: DbRow): SyncSettings {
  const mode = MODES.includes(data.mode as SyncMode) ? (data.mode as SyncMode) : "off";
  return {
    mode,
    testUserIds: strings(data.test_user_ids),
    keepUserIds: strings(data.keep_user_ids),
    keepSlackUserIds: strings(data.keep_slack_user_ids),
    testBonoUserIds: strings(data.test_bono_user_ids),
    // min_notice_days は使わない（外れるお知らせDMの廃止 2026-10-29。列は本番に残る）
    linkGraceDays: Number(data.link_grace_days ?? 7),
    ownerReportSentOn: typeof data.owner_report_sent_on === "string" ? data.owner_report_sent_on : null,
  };
}

function mapState(row: DbRow): SyncState {
  return {
    teamId: row.team_id as string,
    slackUserId: row.slack_user_id as string,
    classification: row.classification as Classification,
    reason: (row.reason as string | null) ?? null,
    removeAfter: (row.remove_after as string | null) ?? null,
    linkDeadline: (row.link_deadline as string | null) ?? null,
    linkRequestDmAt: toDate(row.link_request_dm_at),
    linkRequestVersion: (row.link_request_version as number | null) ?? null,
    removalNoticeDmAt: toDate(row.removal_notice_dm_at),
    removalNoticeVersion: (row.removal_notice_version as number | null) ?? null,
    dryRunResult: (row.dry_run_result as string | null) ?? null,
    dryRunAt: toDate(row.dry_run_at),
    needsReview: row.needs_review === true,
    reviewReason: (row.review_reason as string | null) ?? null,
    resolvedAt: toDate(row.resolved_at),
    resolvedReason: (row.resolved_reason as ResolvedReason | null) ?? null,
    firstSeenAt: toDate(row.first_seen_at) ?? new Date(0),
  };
}

/** SyncState の一部 → DB の列。undefined の項目は書かない */
export function statePatchToDb(patch: Partial<SyncState>): DbRow {
  const db: DbRow = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) db[key] = value;
  };
  set("team_id", patch.teamId);
  set("slack_user_id", patch.slackUserId);
  set("classification", patch.classification);
  set("reason", patch.reason);
  set("remove_after", patch.removeAfter);
  set("link_deadline", patch.linkDeadline);
  if (patch.linkRequestDmAt !== undefined) db.link_request_dm_at = iso(patch.linkRequestDmAt);
  set("link_request_version", patch.linkRequestVersion);
  if (patch.removalNoticeDmAt !== undefined) db.removal_notice_dm_at = iso(patch.removalNoticeDmAt);
  set("removal_notice_version", patch.removalNoticeVersion);
  set("dry_run_result", patch.dryRunResult);
  if (patch.dryRunAt !== undefined) db.dry_run_at = iso(patch.dryRunAt);
  set("needs_review", patch.needsReview);
  set("review_reason", patch.reviewReason);
  if (patch.resolvedAt !== undefined) db.resolved_at = iso(patch.resolvedAt);
  set("resolved_reason", patch.resolvedReason);
  if (patch.firstSeenAt !== undefined) db.first_seen_at = iso(patch.firstSeenAt);
  return db;
}

function mapSubscription(row: DbRow): SubscriptionSummary {
  return {
    userId: row.user_id as string,
    hasPaidRecord: row.has_paid_record === true,
    isActive: row.is_active === true,
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
    cancelAt: toDate(row.cancel_at),
    currentPeriodEnd: toDate(row.current_period_end),
  };
}

const DM_AT_COLUMN: Record<DmType, string> = {
  link_request: "link_request_dm_at",
};

export function createSupabaseSyncStore(client: SupabaseClient): SyncStore & LinkStore {
  async function getSettings(): Promise<SyncSettings | null> {
    const { data, error } = await client
      .from(SETTINGS)
      .select(
        "mode, test_user_ids, link_grace_days, owner_report_sent_on, keep_user_ids, keep_slack_user_ids, test_bono_user_ids",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error) fail("settings read", error);
    return data ? mapSettings(data as DbRow) : null;
  }

  async function lookup(emailHashes: string[], userIds: string[]) {
    const { data, error } = await client.rpc("slack_member_sync_lookup", {
      p_email_hashes: emailHashes,
      p_user_ids: userIds,
    });
    if (error) fail("subscription lookup", error);
    return ((data ?? []) as DbRow[]).map((row) => ({
      emailHash: (row.email_hash as string | null) ?? null,
      subscription: mapSubscription(row),
    }));
  }

  return {
    getSettings,

    async acquireRunLock(now, until) {
      const patch = { run_locked_until: until.toISOString() };
      const free = await client.from(SETTINGS).update(patch).eq("id", 1).is("run_locked_until", null).select("id");
      if (free.error) fail("run lock", free.error);
      if (free.data && free.data.length > 0) return true;
      const expired = await client
        .from(SETTINGS)
        .update(patch)
        .eq("id", 1)
        .lt("run_locked_until", now.toISOString())
        .select("id");
      if (expired.error) fail("run lock", expired.error);
      return Boolean(expired.data && expired.data.length > 0);
    },

    async releaseRunLock() {
      const { error } = await client.from(SETTINGS).update({ run_locked_until: null }).eq("id", 1);
      if (error) fail("run unlock", error);
    },

    async lookupSubscriptions(emailHashes, userIds) {
      const out: Awaited<ReturnType<SyncStore["lookupSubscriptions"]>> = [];
      for (const part of chunks(emailHashes, CHUNK)) out.push(...(await lookup(part, [])));
      for (const part of chunks(userIds, CHUNK)) out.push(...(await lookup([], part)));
      return out;
    },

    async listLinks(teamId) {
      const out: { userId: string; slackUserId: string }[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await client
          .from(LINKS)
          .select("user_id, slack_user_id")
          .eq("team_id", teamId)
          .order("id")
          .range(from, from + PAGE - 1);
        if (error) fail("links read", error);
        const rows = (data ?? []) as DbRow[];
        out.push(...rows.map((r) => ({ userId: r.user_id as string, slackUserId: r.slack_user_id as string })));
        if (rows.length < PAGE) return out;
      }
    },

    async insertLink(link) {
      const { error } = await client.from(LINKS).insert({
        user_id: link.userId,
        team_id: link.teamId,
        slack_user_id: link.slackUserId,
        linked_via: link.linkedVia,
      });
      if (!error) return "inserted";
      if (error.code === "23505") return "conflict";
      fail("link insert", error);
    },

    async listStates(teamId) {
      const out: SyncState[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await client
          .from(STATE)
          .select("*")
          .eq("team_id", teamId)
          .order("id")
          .range(from, from + PAGE - 1);
        if (error) fail("state read", error);
        const rows = (data ?? []) as DbRow[];
        out.push(...rows.map(mapState));
        if (rows.length < PAGE) return out;
      }
    },

    async upsertStates(states) {
      for (const part of chunks(states, CHUNK)) {
        // 全行に全列を入れる（列のそろわない一括 upsert で、書かなかった列が NULL にならないように）
        const rows = part.map((s) => statePatchToDb(s));
        const { error } = await client.from(STATE).upsert(rows, { onConflict: "team_id,slack_user_id" });
        if (error) fail("state upsert", error);
      }
    },

    async claimDm(teamId, slackUserId, dmType) {
      const patch = { needs_review: true, review_reason: `sending:${dmType}` };
      const column = DM_AT_COLUMN[dmType];
      const clean = await client
        .from(STATE)
        .update(patch)
        .eq("team_id", teamId)
        .eq("slack_user_id", slackUserId)
        .eq("needs_review", false)
        .is(column, null)
        .select("id");
      if (clean.error) fail("dm claim", clean.error);
      if (clean.data && clean.data.length > 0) return true;
      // 本文未承認の印だけが立っている人は、承認後に送ってよい
      const soft = await client
        .from(STATE)
        .update(patch)
        .eq("team_id", teamId)
        .eq("slack_user_id", slackUserId)
        .eq("needs_review", true)
        .eq("review_reason", SOFT_REVIEW_REASON)
        .is(column, null)
        .select("id");
      if (soft.error) fail("dm claim", soft.error);
      return Boolean(soft.data && soft.data.length > 0);
    },

    async patchState(teamId, slackUserId, patch) {
      const { error } = await client
        .from(STATE)
        .update(statePatchToDb(patch))
        .eq("team_id", teamId)
        .eq("slack_user_id", slackUserId);
      if (error) fail("state patch", error);
    },

    async insertLinkToken(token) {
      const { error } = await client.from(TOKENS).insert({
        token_hash: token.tokenHash,
        team_id: token.teamId,
        slack_user_id: token.slackUserId,
        purpose: token.purpose,
        expires_at: token.expiresAt.toISOString(),
        requested_by_user_id: token.requestedByUserId,
      });
      if (error) fail("token insert", error);
    },

    async markOwnerReportSent(date) {
      const { error } = await client.from(SETTINGS).update({ owner_report_sent_on: date }).eq("id", 1);
      if (error) fail("owner report mark", error);
    },

    // ---- つなぐページ・マイページ用 ----

    async peekToken(tokenHash) {
      const { data, error } = await client
        .from(TOKENS)
        .select("slack_user_id, expires_at, used_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();
      if (error) fail("token read", error);
      if (!data || !data.slack_user_id) return "invalid";
      if (data.used_at) return "used";
      const expiresAt = toDate(data.expires_at);
      if (!expiresAt || expiresAt.getTime() <= Date.now()) return "expired";
      return "valid";
    },

    async claimLink(tokenHash, userId) {
      const { data, error } = await client.rpc("slack_member_link_claim", {
        p_token_hash: tokenHash,
        p_user_id: userId,
      });
      if (error) fail("link claim", error);
      return LINK_CLAIM_RESULTS.includes(data as LinkClaimResult) ? (data as LinkClaimResult) : "invalid";
    },

    async getLinkByUserId(userId) {
      const { data, error } = await client
        .from(LINKS)
        .select("team_id, slack_user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) fail("link read", error);
      return data ? { teamId: data.team_id as string, slackUserId: data.slack_user_id as string } : null;
    },

    async getLinkedUserId(teamId, slackUserId) {
      const { data, error } = await client
        .from(LINKS)
        .select("user_id")
        .eq("team_id", teamId)
        .eq("slack_user_id", slackUserId)
        .maybeSingle();
      if (error) fail("link read", error);
      return (data?.user_id as string | undefined) ?? null;
    },

    async getSubscription(userId) {
      const rows = await lookup([], [userId]);
      return rows[0]?.subscription ?? null;
    },

    async countMypageRequests(userId, since) {
      const { count, error } = await client
        .from(TOKENS)
        .select("id", { count: "exact", head: true })
        .eq("requested_by_user_id", userId)
        .eq("purpose", "mypage")
        .gte("created_at", since.toISOString());
      if (error) fail("token count", error);
      return count ?? 0;
    },
  };
}

/** 環境変数から service_role クライアントを作る。未設定なら null */
export function createSyncStoreFromEnv(): (SyncStore & LinkStore) | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return createSupabaseSyncStore(client);
}
