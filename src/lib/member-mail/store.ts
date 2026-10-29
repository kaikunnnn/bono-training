import "server-only";

/**
 * 会員メール（#264）の永続化（Supabase / service_role）。
 * テーブル: supabase/migrations/20261029000000_create_member_mail.sql
 *
 * 原子性: claim / update は PostgREST の条件付き UPDATE ... RETURNING 1文で行う。
 * ★PATCH では or() を使わない（PostgREST は or() を更新後の行にも再適用し、確保できたのに空配列が返る。#238 で再現）。
 * メールアドレスは getEmailAddress で送る直前にだけ読み、どこにも書かない。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  MAIL_CATEGORIES,
  MAIL_KINDS,
  MAIL_MODES,
  type Campaign,
  type CountSummary,
  type DeliveryPatch,
  type DeliveryRow,
  type DeliveryStatus,
  type MailCategory,
  type MailKind,
  type MailMode,
  type MailSettings,
  type MailStore,
  type MemberCandidate,
  type NewDelivery,
  type UnsubscribeMethod,
  type UnsubscribeStore,
  type WebhookApplyResult,
  type WebhookStore,
} from "./types";

const SETTINGS = "member_mail_settings";
const KIND_SETTINGS = "member_mail_kind_settings";
const CAMPAIGNS = "member_mail_campaigns";
const DELIVERIES = "member_mail_deliveries";
const UNSUBSCRIBES = "member_mail_unsubscribes";
const SUPPRESSIONS = "member_mail_suppressions";
const UNIQUE_VIOLATION = "23505";
const PAGE = 1000;
/** 送り始めの時刻からこの期間だけ、対象の書き出しを試みる */
const DUE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type DbRow = Record<string, unknown>;

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fail(what: string, error: { code?: string | null } | null): never {
  throw new Error(`${what} failed: ${error?.code ?? "unknown"}`);
}

function toMode(value: unknown): MailMode {
  return MAIL_MODES.includes(value as MailMode) ? (value as MailMode) : "off";
}

function mapCampaign(row: DbRow): Campaign {
  return {
    id: row.id as string,
    kind: row.kind as MailKind,
    label: (row.label as string) ?? "",
    subject: (row.subject as string) ?? "",
    preheader: (row.preheader as string) ?? "",
    body: (row.body as string) ?? "",
    contentVersion: Number(row.content_version),
    approvedVersion: row.approved_version === null || row.approved_version === undefined ? null : Number(row.approved_version),
    scheduledAt: toDate(row.scheduled_at),
    enqueuedAt: toDate(row.enqueued_at),
  };
}

function mapDelivery(row: DbRow): DeliveryRow {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    userId: row.user_id as string,
    kind: row.kind as MailKind,
    category: row.category as MailCategory,
    audience: row.audience as "owner" | "all",
    contentVersion: Number(row.content_version),
    status: row.status as DeliveryStatus,
    attempts: Number(row.attempts ?? 0),
  };
}

function patchToDb(patch: DeliveryPatch): DbRow {
  const db: DbRow = {};
  if (patch.status !== undefined) db.status = patch.status;
  if (patch.reason !== undefined) db.reason = patch.reason;
  if (patch.attempts !== undefined) db.attempts = patch.attempts;
  if (patch.nextAttemptAt !== undefined) db.next_attempt_at = patch.nextAttemptAt.toISOString();
  if (patch.resendEmailId !== undefined) db.resend_email_id = patch.resendEmailId;
  if (patch.contentVersion !== undefined) db.content_version = patch.contentVersion;
  if (patch.sendingAt !== undefined) db.sending_at = patch.sendingAt ? patch.sendingAt.toISOString() : null;
  if (patch.sentAt !== undefined) db.sent_at = patch.sentAt ? patch.sentAt.toISOString() : null;
  if (patch.release) {
    db.claim_token = null;
    db.locked_until = null;
  }
  return db;
}

export type SupabaseMailStore = MailStore & UnsubscribeStore & WebhookStore;

export function createSupabaseMailStore(client: SupabaseClient): SupabaseMailStore {
  function paidMemberQuery(userId?: string) {
    let q = client
      .from("user_subscriptions")
      .select("user_id, plan_type, duration, cancel_at_period_end, created_at")
      .eq("environment", "live")
      .eq("is_active", true)
      .not("stripe_subscription_id", "is", null)
      .neq("stripe_subscription_id", "");
    if (userId) q = q.eq("user_id", userId);
    return q;
  }

  return {
    // ----- スイッチ -----
    async getSettings() {
      const { data, error } = await client
        .from(SETTINGS)
        .select("mode, owner_user_ids, daily_limit, send_hour_start, send_hour_end")
        .eq("id", 1)
        .maybeSingle();
      if (error) fail("settings read", error);
      if (!data) return null;
      const settings: MailSettings = {
        mode: toMode(data.mode),
        ownerUserIds: Array.isArray(data.owner_user_ids)
          ? (data.owner_user_ids as unknown[]).filter((v): v is string => typeof v === "string")
          : [],
        dailyLimit: Number(data.daily_limit ?? 0),
        sendHourStart: Number(data.send_hour_start ?? 8),
        sendHourEnd: Number(data.send_hour_end ?? 21),
      };
      return settings;
    },

    async getKindMode(kind) {
      if (!MAIL_KINDS.includes(kind)) return "off";
      const { data, error } = await client.from(KIND_SETTINGS).select("mode").eq("kind", kind).maybeSingle();
      if (error) fail("kind settings read", error);
      return toMode(data?.mode);
    },

    async autoStop(reason, at) {
      const { error } = await client
        .from(SETTINGS)
        .update({ mode: "off", auto_stopped_reason: reason, auto_stopped_at: at.toISOString() })
        .eq("id", 1);
      if (error) fail("auto stop", error);
    },

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

    // ----- 文面 -----
    async getCampaign(id) {
      const { data, error } = await client.from(CAMPAIGNS).select("*").eq("id", id).maybeSingle();
      if (error) fail("campaign read", error);
      return data ? mapCampaign(data as DbRow) : null;
    },

    async listDueCampaigns(now) {
      // 送り始めの時刻から7日以内で、まだ全員分を書き出していないものだけ（古い号を毎回拾い直さない）
      const { data, error } = await client
        .from(CAMPAIGNS)
        .select("*")
        .lte("scheduled_at", now.toISOString())
        .gte("scheduled_at", new Date(now.getTime() - DUE_WINDOW_MS).toISOString())
        .is("enqueued_at", null)
        .order("scheduled_at", { ascending: true })
        .limit(20);
      if (error) fail("campaign list", error);
      return (data ?? []).map((r) => mapCampaign(r as DbRow));
    },

    async markEnqueued(campaignId, at) {
      const { error } = await client.from(CAMPAIGNS).update({ enqueued_at: at.toISOString() }).eq("id", campaignId);
      if (error) fail("campaign enqueued", error);
    },

    async saveCount(campaignId, count: CountSummary, at) {
      const { error } = await client
        .from(CAMPAIGNS)
        .update({ last_count: count, last_counted_at: at.toISOString() })
        .eq("id", campaignId);
      if (error) fail("campaign count", error);
    },

    // ----- 対象 -----
    async listPaidMembers() {
      const out: MemberCandidate[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await paidMemberQuery()
          .order("user_id", { ascending: true })
          .range(from, from + PAGE - 1);
        if (error) fail("paid members", error);
        for (const r of data ?? []) {
          out.push({
            userId: r.user_id as string,
            planType: (r.plan_type as string | null) ?? null,
            duration: r.duration === null || r.duration === undefined ? null : Number(r.duration),
            cancelAtPeriodEnd: Boolean(r.cancel_at_period_end),
            createdAt: toDate(r.created_at),
          });
        }
        if (!data || data.length < PAGE) break;
      }
      return out;
    },

    async isPaidMember(userId) {
      const { data, error } = await paidMemberQuery(userId).limit(1);
      if (error) fail("paid member check", error);
      return Boolean(data && data.length > 0);
    },

    async listUnsubscribedUserIds(category) {
      const ids = new Set<string>();
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await client
          .from(UNSUBSCRIBES)
          .select("user_id")
          .eq("category", category)
          .is("resubscribed_at", null)
          .order("user_id")
          .range(from, from + PAGE - 1);
        if (error) fail("unsubscribe list", error);
        for (const r of data ?? []) ids.add(r.user_id as string);
        if (!data || data.length < PAGE) break;
      }
      return ids;
    },

    async isUnsubscribed(userId, category) {
      const { data, error } = await client
        .from(UNSUBSCRIBES)
        .select("user_id")
        .eq("user_id", userId)
        .eq("category", category)
        .is("resubscribed_at", null)
        .limit(1);
      if (error) fail("unsubscribe check", error);
      return Boolean(data && data.length > 0);
    },

    async listSuppressedUserIds() {
      const ids = new Set<string>();
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await client
          .from(SUPPRESSIONS)
          .select("user_id")
          .order("user_id")
          .range(from, from + PAGE - 1);
        if (error) fail("suppression list", error);
        for (const r of data ?? []) ids.add(r.user_id as string);
        if (!data || data.length < PAGE) break;
      }
      return ids;
    },

    async isSuppressed(userId) {
      const { data, error } = await client.from(SUPPRESSIONS).select("user_id").eq("user_id", userId).limit(1);
      if (error) fail("suppression check", error);
      return Boolean(data && data.length > 0);
    },

    async listUsersMailedSince(since, categories, excludeCampaignId) {
      const ids = new Set<string>();
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await client
          .from(DELIVERIES)
          .select("user_id")
          .eq("audience", "all")
          .in("category", categories as string[])
          .in("status", ["sending", "sent", "needs_review"])
          .neq("campaign_id", excludeCampaignId)
          .gte("sending_at", since.toISOString())
          .order("id")
          .range(from, from + PAGE - 1);
        if (error) fail("weekly cap list", error);
        for (const r of data ?? []) ids.add(r.user_id as string);
        if (!data || data.length < PAGE) break;
      }
      return ids;
    },

    async hasMailedSince(userId, since, categories, excludeCampaignId) {
      const { data, error } = await client
        .from(DELIVERIES)
        .select("id")
        .eq("user_id", userId)
        .eq("audience", "all")
        .in("category", categories as string[])
        .in("status", ["sending", "sent", "needs_review"])
        .neq("campaign_id", excludeCampaignId)
        .gte("sending_at", since.toISOString())
        .limit(1);
      if (error) fail("weekly cap check", error);
      return Boolean(data && data.length > 0);
    },

    async countSentSince(since) {
      const { count, error } = await client
        .from(DELIVERIES)
        .select("id", { count: "exact", head: true })
        .in("status", ["sending", "sent", "needs_review"])
        .gte("sending_at", since.toISOString());
      if (error) fail("daily count", error);
      return count ?? 0;
    },

    // ----- 送信の記録 -----
    async insertDeliveries(rows: NewDelivery[]) {
      // 一意制約が部分インデックスなので upsert(onConflict) が使えない。1行ずつ入れ、重複は成功扱いにする
      let inserted = 0;
      for (const r of rows) {
        const { error } = await client.from(DELIVERIES).insert({
          campaign_id: r.campaignId,
          user_id: r.userId,
          kind: r.kind,
          category: r.category,
          audience: r.audience,
          content_version: r.contentVersion,
          status: "queued",
        });
        if (!error) inserted += 1;
        else if (error.code !== UNIQUE_VIOLATION) fail("delivery insert", error);
      }
      return inserted;
    },

    async listDueDeliveryIds(now, limit) {
      if (limit <= 0) return [];
      const nowIso = now.toISOString();
      const queued = await client
        .from(DELIVERIES)
        .select("id")
        .eq("status", "queued")
        .lte("next_attempt_at", nowIso)
        .order("next_attempt_at", { ascending: true })
        .limit(limit);
      if (queued.error) fail("due list", queued.error);
      const ids = (queued.data ?? []).map((r) => r.id as string);
      if (ids.length >= limit) return ids;
      const expired = await client
        .from(DELIVERIES)
        .select("id")
        .eq("status", "processing")
        .lt("locked_until", nowIso)
        .limit(limit - ids.length);
      if (expired.error) fail("due list", expired.error);
      return ids.concat((expired.data ?? []).map((r) => r.id as string));
    },

    async claim(id, now, lockedUntil, token) {
      const nowIso = now.toISOString();
      const patch = { status: "processing", claim_token: token, locked_until: lockedUntil.toISOString() };
      const fresh = await client
        .from(DELIVERIES)
        .update(patch)
        .eq("id", id)
        .eq("status", "queued")
        .lte("next_attempt_at", nowIso)
        .select("*");
      if (fresh.error) fail("delivery claim", fresh.error);
      if (fresh.data && fresh.data.length > 0) return mapDelivery(fresh.data[0] as DbRow);
      // 確保の期限が切れた processing（処理中に落ちた行）を取り直す
      const expired = await client
        .from(DELIVERIES)
        .update(patch)
        .eq("id", id)
        .eq("status", "processing")
        .lt("locked_until", nowIso)
        .select("*");
      if (expired.error) fail("delivery claim", expired.error);
      if (!expired.data || expired.data.length === 0) return null;
      return mapDelivery(expired.data[0] as DbRow);
    },

    async update(id, token, expectedStatus, patch) {
      const { data, error } = await client
        .from(DELIVERIES)
        .update(patchToDb(patch))
        .eq("id", id)
        .eq("claim_token", token)
        .eq("status", expectedStatus)
        .select("id");
      if (error) fail("delivery update", error);
      return Boolean(data && data.length > 0);
    },

    async markStaleSending(olderThan) {
      const { data, error } = await client
        .from(DELIVERIES)
        .update({ status: "needs_review", reason: "stale_sending", claim_token: null, locked_until: null })
        .eq("status", "sending")
        .lt("updated_at", olderThan.toISOString())
        .select("id");
      if (error) fail("stale sending sweep", error);
      return data?.length ?? 0;
    },

    async getEmailAddress(userId) {
      const { data, error } = await client.auth.admin.getUserById(userId);
      if (error) {
        if (error.status === 404) return null;
        fail("user lookup", { code: String(error.status ?? "unknown") });
      }
      const email = data?.user?.email;
      return typeof email === "string" && email.includes("@") ? email : null;
    },

    // ----- 配信停止 -----
    async unsubscribe(userId, categories, method: UnsubscribeMethod, at) {
      const stopped = new Set(await this.listStoppedCategories(userId));
      const rows = categories
        .filter((c) => !stopped.has(c))
        .map((category) => ({
          user_id: userId,
          category,
          method,
          unsubscribed_at: at.toISOString(),
          resubscribed_at: null,
        }));
      if (rows.length === 0) return;
      const { error } = await client.from(UNSUBSCRIBES).upsert(rows, { onConflict: "user_id,category" });
      if (error) fail("unsubscribe", error);
    },

    async resubscribe(userId, category, at) {
      const { error } = await client
        .from(UNSUBSCRIBES)
        .update({ resubscribed_at: at.toISOString() })
        .eq("user_id", userId)
        .eq("category", category)
        .is("resubscribed_at", null);
      if (error) fail("resubscribe", error);
    },

    async listStoppedCategories(userId) {
      const { data, error } = await client
        .from(UNSUBSCRIBES)
        .select("category")
        .eq("user_id", userId)
        .is("resubscribed_at", null);
      if (error) fail("unsubscribe read", error);
      return (data ?? [])
        .map((r) => r.category as MailCategory)
        .filter((c) => MAIL_CATEGORIES.includes(c));
    },

    // ----- webhook -----
    async applyEvent(input) {
      const { data, error } = await client.rpc("member_mail_apply_event", {
        p_webhook_id: input.webhookId,
        p_event_type: input.eventType,
        p_resend_email_id: input.resendEmailId,
        p_occurred_at: input.occurredAt ? input.occurredAt.toISOString() : null,
        p_link_path: input.linkPath,
      });
      if (error) fail("webhook apply", error);
      return data as WebhookApplyResult;
    },
  };
}

/** 環境変数から service_role クライアントを作る。未設定なら null */
export function createMailStoreFromEnv(): SupabaseMailStore | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return createSupabaseMailStore(client);
}
