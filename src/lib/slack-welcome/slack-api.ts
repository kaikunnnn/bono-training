import "server-only";

/**
 * Slack Web API の最小クライアント（#238）。SDK は使わず fetch で呼ぶ（自動リトライなし）。
 * - users.info: ボットトークン（scope users:read）
 *   https://docs.slack.dev/reference/methods/users.info/
 * - conversations.open / chat.postMessage: カイクンのユーザートークン（user scope im:write, chat:write）
 *   https://docs.slack.dev/reference/methods/conversations.open/
 *   https://docs.slack.dev/reference/methods/chat.postMessage/
 * - 429 は Retry-After ヘッダー秒以上待つ: https://docs.slack.dev/apis/web-api/rate-limits/
 *
 * ★応答本文（プロフィール等）はログに出さない。必要な列だけ取り出して返す。
 */

const SLACK_API_BASE = "https://slack.com/api/";
const DEFAULT_TIMEOUT_MS = 10_000;

export type SlackCallResult<T> =
  | { kind: "ok"; data: T }
  /** HTTP 200 で ok:false（Slack が処理して断った） */
  | { kind: "slack_error"; error: string }
  /** HTTP 429 または error=ratelimited */
  | { kind: "rate_limited"; retryAfterSec: number }
  /** 429 以外の HTTP エラー（5xx 等） */
  | { kind: "http_error"; status: number }
  /** タイムアウト（応答を待ち切れなかった） */
  | { kind: "timeout" }
  /** 通信エラー・応答が JSON でない等（結果が分からない） */
  | { kind: "network_error" };

/** users.info から判定に使う列だけ */
export interface SlackUserSummary {
  id: string;
  teamId: string | null;
  deleted: boolean;
  isBot: boolean;
  isAppUser: boolean;
  isWorkflowBot: boolean;
  isInvitedUser: boolean;
  isRestricted: boolean;
  isUltraRestricted: boolean;
}

export interface SlackClient {
  usersInfo(userId: string): Promise<SlackCallResult<SlackUserSummary>>;
  openDm(userId: string): Promise<SlackCallResult<{ channelId: string }>>;
  postMessage(channelId: string, text: string): Promise<SlackCallResult<{ channelId: string; ts: string }>>;
}

type FetchLike = typeof fetch;

async function callSlack(
  fetchImpl: FetchLike,
  method: string,
  token: string,
  params: Record<string, string>,
  timeoutMs: number,
): Promise<SlackCallResult<Record<string, unknown>>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetchImpl(`${SLACK_API_BASE}${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: new URLSearchParams(params).toString(),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof Error && error.name === "AbortError") return { kind: "timeout" };
    return { kind: "network_error" };
  }

  try {
    if (response.status === 429) {
      return { kind: "rate_limited", retryAfterSec: parseRetryAfter(response.headers.get("retry-after")) };
    }
    if (!response.ok) {
      return { kind: "http_error", status: response.status };
    }
    let json: unknown;
    try {
      json = await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return { kind: "timeout" };
      return { kind: "network_error" };
    }
    if (!json || typeof json !== "object") return { kind: "network_error" };
    const body = json as Record<string, unknown>;
    if (body.ok === true) return { kind: "ok", data: body };
    const errorCode = typeof body.error === "string" ? body.error : "unknown_error";
    if (errorCode === "ratelimited") {
      return { kind: "rate_limited", retryAfterSec: parseRetryAfter(response.headers.get("retry-after")) };
    }
    return { kind: "slack_error", error: errorCode };
  } finally {
    clearTimeout(timer);
  }
}

export function parseRetryAfter(value: string | null): number {
  const n = value ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.ceil(n);
}

export function createSlackClient(options: {
  botToken: string;
  userToken: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): SlackClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async usersInfo(userId) {
      const result = await callSlack(fetchImpl, "users.info", options.botToken, { user: userId }, timeoutMs);
      if (result.kind !== "ok") return result;
      const user = result.data.user as Record<string, unknown> | undefined;
      if (!user || typeof user.id !== "string") return { kind: "network_error" };
      return {
        kind: "ok",
        data: {
          id: user.id,
          teamId: typeof user.team_id === "string" ? user.team_id : null,
          deleted: user.deleted === true,
          isBot: user.is_bot === true,
          isAppUser: user.is_app_user === true,
          isWorkflowBot: user.is_workflow_bot === true,
          isInvitedUser: user.is_invited_user === true,
          isRestricted: user.is_restricted === true,
          isUltraRestricted: user.is_ultra_restricted === true,
        },
      };
    },

    async openDm(userId) {
      const result = await callSlack(fetchImpl, "conversations.open", options.userToken, { users: userId }, timeoutMs);
      if (result.kind !== "ok") return result;
      const channel = result.data.channel as Record<string, unknown> | undefined;
      if (!channel || typeof channel.id !== "string") return { kind: "network_error" };
      return { kind: "ok", data: { channelId: channel.id } };
    },

    async postMessage(channelId, text) {
      const result = await callSlack(
        fetchImpl,
        "chat.postMessage",
        options.userToken,
        {
          channel: channelId,
          text,
          mrkdwn: "true",
          unfurl_links: "false",
          unfurl_media: "false",
        },
        timeoutMs,
      );
      if (result.kind !== "ok") return result;
      const ts = result.data.ts;
      const channel = result.data.channel;
      if (typeof ts !== "string") return { kind: "network_error" };
      return { kind: "ok", data: { channelId: typeof channel === "string" ? channel : channelId, ts } };
    },
  };
}
