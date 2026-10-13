import "server-only";

/**
 * Slack Events API の受け口ロジック（#238）。Route Handler から呼ぶ。
 * 出典:
 * - Events API（3秒以内に 2xx を返す・リトライあり）: https://docs.slack.dev/apis/events-api/
 * - url_verification: https://docs.slack.dev/reference/events/url_verification/
 * - team_join: https://docs.slack.dev/reference/events/team_join/
 *
 * 処理順: 本文サイズ → 署名 → JSON → url_verification → team/app 照合 → team_join 以外は無視
 *        → 設定（off なら記録しない）→ enabled_from → 一意制約付き INSERT → 200
 * DM の送信はここではしない（Route Handler が after() で processDeliveryByKey を呼ぶ）。
 * ★生の本文・プロフィールはログにも DB にも残さない。
 */
import { verifySlackSignature } from "./signature";
import type { WelcomeStore } from "./types";

export const MAX_BODY_BYTES = 64 * 1024;

export interface IngestConfig {
  signingSecret: string;
  teamId: string;
  appId: string;
}

export type IngestResult =
  | { status: number; body: Record<string, unknown>; enqueue?: undefined }
  | { status: 200; body: Record<string, unknown>; enqueue: { teamId: string; slackUserId: string } };

type ReadBodyResult = { ok: true; body: Buffer } | { ok: false; status: 413 | 400 };

/** Content-Length を先に見て、実際に読んだバイト数でももう一度確かめる */
export async function readLimitedBody(request: Request, limit = MAX_BODY_BYTES): Promise<ReadBodyResult> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > limit) return { ok: false, status: 413 };
  if (!request.body) return { ok: true, body: Buffer.alloc(0) };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }
  return { ok: true, body: Buffer.concat(chunks.map((c) => Buffer.from(c))) };
}

const SLACK_USER_ID = /^[UW][A-Z0-9]{2,30}$/;

export async function handleSlackWelcomeEvent(params: {
  headers: Headers;
  rawBody: Buffer;
  config: IngestConfig;
  store: WelcomeStore | null;
  now: Date;
}): Promise<IngestResult> {
  const { headers, rawBody, config, store, now } = params;

  if (!config.signingSecret) {
    console.error("[slack-welcome] SLACK_WELCOME_SIGNING_SECRET not configured");
    return { status: 500, body: { error: "not_configured" } };
  }

  const sig = verifySlackSignature({
    signingSecret: config.signingSecret,
    timestampHeader: headers.get("x-slack-request-timestamp"),
    signatureHeader: headers.get("x-slack-signature"),
    rawBody,
    nowMs: now.getTime(),
  });
  if (!sig.ok) {
    console.warn(`[slack-welcome] signature rejected: ${sig.reason}`);
    return { status: 401, body: { error: "invalid_signature" } };
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not object");
    payload = parsed as Record<string, unknown>;
  } catch {
    return { status: 400, body: { error: "invalid_json" } };
  }

  if (payload.type === "url_verification") {
    if (typeof payload.challenge !== "string" || payload.challenge.length > 500) {
      return { status: 400, body: { error: "invalid_challenge" } };
    }
    return { status: 200, body: { challenge: payload.challenge } };
  }

  if (!config.teamId || !config.appId) {
    console.error("[slack-welcome] SLACK_WELCOME_TEAM_ID / SLACK_WELCOME_APP_ID not configured");
    return { status: 500, body: { error: "not_configured" } };
  }
  if (payload.team_id !== config.teamId || payload.api_app_id !== config.appId) {
    console.warn("[slack-welcome] rejected event from unexpected team/app");
    return { status: 403, body: { error: "unexpected_team_or_app" } };
  }

  if (payload.type !== "event_callback") {
    return { status: 200, body: { ignored: "type" } };
  }
  const event = payload.event as Record<string, unknown> | undefined;
  if (!event || event.type !== "team_join") {
    return { status: 200, body: { ignored: "event_type" } };
  }

  const user = event.user as Record<string, unknown> | undefined;
  const slackUserId = typeof user?.id === "string" ? user.id : null;
  const eventId = typeof payload.event_id === "string" ? payload.event_id : null;
  const eventTimeSec = typeof payload.event_time === "number" ? payload.event_time : null;
  if (!slackUserId || !SLACK_USER_ID.test(slackUserId) || !eventId || eventId.length > 100 || !eventTimeSec) {
    return { status: 400, body: { error: "invalid_event" } };
  }
  const eventTime = new Date(eventTimeSec * 1000);

  if (!store) {
    console.error("[slack-welcome] Supabase service config missing");
    return { status: 503, body: { error: "storage_unavailable" } };
  }

  let settings;
  try {
    settings = await store.getSettings();
  } catch (error) {
    console.error("[slack-welcome] settings read failed:", error instanceof Error ? error.message : "unknown");
    return { status: 503, body: { error: "storage_unavailable" } };
  }

  // off のときは記録もしない
  if (!settings || settings.mode === "off") {
    return { status: 200, body: { ignored: "off" } };
  }
  // 運用開始前の参加は対象外（enabled_from 未設定なら誰も対象にしない）
  if (!settings.enabledFrom || eventTime.getTime() < settings.enabledFrom.getTime()) {
    return { status: 200, body: { ignored: "before_enabled_from" } };
  }

  try {
    const result = await store.insertDelivery({
      teamId: config.teamId,
      slackUserId,
      eventId,
      eventTime,
      firstReceivedAt: now,
    });
    console.log(`[slack-welcome] team_join recorded (${result})`);
  } catch (error) {
    console.error("[slack-welcome] persist failed:", error instanceof Error ? error.message : "unknown");
    return { status: 503, body: { error: "storage_unavailable" } };
  }

  return { status: 200, body: { ok: true }, enqueue: { teamId: config.teamId, slackUserId } };
}
