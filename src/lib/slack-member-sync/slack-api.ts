import "server-only";

/**
 * Slack 定期整理（#263）の Slack Web API クライアント。SDK は使わず fetch で呼ぶ（#238 の callSlack を共用）。
 * - users.list: ボットトークン（scope users:read, users:read.email）。cursor でページ送り
 *   https://docs.slack.dev/reference/methods/users.list/
 * - users.lookupByEmail: ボットトークン（scope users:read.email）
 *   https://docs.slack.dev/reference/methods/users.lookupByEmail/
 * - auth.test: カイクンのユーザートークン（報告DMの宛先＝トークンの持ち主と、ワークスペースのURLを知るため）
 *   https://docs.slack.dev/reference/methods/auth.test/
 * - conversations.open / chat.postMessage: カイクンのユーザートークン（#238 と同じ）
 * - 429 は Retry-After 秒以上待つ（待つのは呼び出し側）: https://docs.slack.dev/apis/web-api/rate-limits/
 *
 * ★メールはここでハッシュ（md5(lower(trim))）にして捨てる。名前・プロフィールは取り出さない。
 */
import { createHash } from "node:crypto";
import { callSlack, createSlackClient, type FetchLike, type SlackCallResult } from "@/lib/slack-welcome/slack-api";
import type { SlackMemberSummary } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;
/** users.list の1ページの件数（Slack の推奨上限は200） */
export const USERS_LIST_PAGE_SIZE = 200;

export interface SyncSlackClient {
  usersListPage(
    cursor: string | null,
  ): Promise<SlackCallResult<{ members: SlackMemberSummary[]; nextCursor: string | null }>>;
  lookupByEmail(email: string): Promise<SlackCallResult<SlackMemberSummary>>;
  /** ユーザートークンの持ち主（＝DMの送り主＝報告の宛先） */
  authTest(): Promise<SlackCallResult<{ userId: string; teamId: string; url: string }>>;
  openDm(userId: string): Promise<SlackCallResult<{ channelId: string }>>;
  postMessage(channelId: string, text: string): Promise<SlackCallResult<{ channelId: string; ts: string }>>;
}

/** BONO 側の SQL 関数と同じ正規化: md5(lower(trim(email))) */
export function hashEmail(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** users.list / users.lookupByEmail の user オブジェクトから、使う列だけ取り出す */
export function toMemberSummary(user: Record<string, unknown>): SlackMemberSummary | null {
  const id = str(user.id);
  if (!id) return null;
  const profile = (user.profile && typeof user.profile === "object" ? user.profile : {}) as Record<string, unknown>;
  const email = str(profile.email);
  return {
    id,
    teamId: str(user.team_id),
    deleted: user.deleted === true,
    isBot: user.is_bot === true,
    isAppUser: user.is_app_user === true,
    isWorkflowBot: user.is_workflow_bot === true,
    isInvitedUser: user.is_invited_user === true,
    isRestricted: user.is_restricted === true,
    isUltraRestricted: user.is_ultra_restricted === true,
    isAdmin: user.is_admin === true,
    isOwner: user.is_owner === true,
    isPrimaryOwner: user.is_primary_owner === true,
    emailHash: email ? hashEmail(email) : null,
  };
}

export function createSyncSlackClient(options: {
  botToken: string;
  userToken: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): SyncSlackClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  // DM の送信は #238 のクライアントをそのまま使う（同じトークン・同じ送り方）
  const dm = createSlackClient({ botToken: options.botToken, userToken: options.userToken, fetchImpl, timeoutMs });

  return {
    async usersListPage(cursor) {
      const params: Record<string, string> = { limit: String(USERS_LIST_PAGE_SIZE) };
      if (cursor) params.cursor = cursor;
      const result = await callSlack(fetchImpl, "users.list", options.botToken, params, timeoutMs);
      if (result.kind !== "ok") return result;
      const raw = result.data.members;
      if (!Array.isArray(raw)) return { kind: "network_error" };
      const members: SlackMemberSummary[] = [];
      for (const item of raw) {
        if (!item || typeof item !== "object") continue;
        const summary = toMemberSummary(item as Record<string, unknown>);
        if (summary) members.push(summary);
      }
      const meta = result.data.response_metadata as Record<string, unknown> | undefined;
      const next = meta ? str(meta.next_cursor) : null;
      return { kind: "ok", data: { members, nextCursor: next } };
    },

    async lookupByEmail(email) {
      const result = await callSlack(
        fetchImpl,
        "users.lookupByEmail",
        options.botToken,
        { email: email.trim() },
        timeoutMs,
      );
      if (result.kind !== "ok") return result;
      const user = result.data.user;
      const summary = user && typeof user === "object" ? toMemberSummary(user as Record<string, unknown>) : null;
      if (!summary) return { kind: "network_error" };
      return { kind: "ok", data: summary };
    },

    async authTest() {
      const result = await callSlack(fetchImpl, "auth.test", options.userToken, {}, timeoutMs);
      if (result.kind !== "ok") return result;
      const userId = str(result.data.user_id);
      const teamId = str(result.data.team_id);
      const url = str(result.data.url);
      if (!userId || !teamId || !url) return { kind: "network_error" };
      return { kind: "ok", data: { userId, teamId, url } };
    },

    openDm: (userId) => dm.openDm(userId),
    postMessage: (channelId, text) => dm.postMessage(channelId, text),
  };
}
