import "server-only";

/**
 * Slack ウェルカムDM（#238）の送信処理。
 * 受け口の after() と、拾い直し cron の両方からこの1つの関数（processDelivery）を呼ぶ。
 *
 * 安全策（二重送信しない・分からないときは送り直さない）:
 * - 行は条件付き UPDATE ... RETURNING で確保（claim）。確保した人だけが進める
 * - 以降の書き込みはすべて claim_token 一致を条件にする（期限切れで横取りされたら止まる）
 * - 投稿の直前に status=sending を永続化してから chat.postMessage
 * - 投稿でタイムアウト・5xx・応答不明 → needs_review（自動で送り直さない）
 * - 投稿前と確実に分かる失敗だけ有限回リトライ（最大5回・最初の受信から20時間以内）
 * - sending は自動では拾い直さない（古い sending は cron が needs_review にする）
 * - 1人1行・削除しないので、退出→再参加や本文の版変更でも二度と送らない
 */
import { getMessageBlockReason, type WelcomeMessage } from "./message";
import { judgeEligibility } from "./eligibility";
import type { NotifyOps } from "./ops-alert";
import type { SlackCallResult, SlackClient } from "./slack-api";
import type { DeliveryPatch, DeliveryRow, DeliveryStatus, WelcomeStore } from "./types";

export const MAX_ATTEMPTS = 5;
export const MAX_AGE_MS = 20 * 60 * 60 * 1000;
/**
 * 招待中（pending_activation）だった人は、参加の完了が数日後になりうるので待つ期間を長くする。
 * cron が日次なので、20時間では再確認の前に期限切れになってしまうため。
 */
export const PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const INVITED_CODE = "invited_user";
export const LEASE_MS = 2 * 60 * 1000;
/** この長さ以下の待ちは、同じ処理の中で待ってから再試行する */
export const INLINE_RETRY_MAX_WAIT_MS = 15_000;
/** 1回の処理で待ってよい合計時間（関数の実行時間上限に収める） */
export const INLINE_RETRY_BUDGET_MS = 30_000;
/** 招待中の人を次に確認するまでの間隔 */
export const PENDING_RECHECK_MS = 60 * 60 * 1000;
/** これより古い sending は「送れたか分からない」として needs_review にする */
export const STALE_SENDING_MS = 10 * 60 * 1000;

/** Slack が処理して断ったことが確実で、トークン/権限の問題（送り直しても直らない） */
const PERMISSION_ERRORS = new Set([
  "invalid_auth",
  "not_authed",
  "missing_scope",
  "token_revoked",
  "token_expired",
  "account_inactive",
  "no_permission",
  "not_allowed_token_type",
  "restricted_action",
  "ekm_access_denied",
  "team_access_not_granted",
  "access_denied",
  "invalid_arguments",
]);

/** 投稿で返ると「投稿されたか分からない」Slack 側の内部エラー */
const AMBIGUOUS_POST_ERRORS = new Set([
  "internal_error",
  "fatal_error",
  "service_unavailable",
  "request_timeout",
]);

/** 対象者がいない・DMできない（送らずに終える） */
const SKIP_USER_ERRORS = new Set(["user_not_found", "user_not_visible", "user_disabled", "cannot_dm_bot"]);

export interface WelcomeDeps {
  store: WelcomeStore;
  slack: SlackClient;
  /** SLACK_WELCOME_TEAM_ID */
  teamId: string;
  message: WelcomeMessage;
  notifyOps: NotifyOps;
  now: () => Date;
  sleep: (ms: number) => Promise<void>;
  newToken: () => string;
}

export type ProcessOutcome =
  | "off"
  | "not_found"
  | "not_claimed"
  | "lost_claim"
  | "sent"
  | "skipped"
  | "pending_activation"
  | "dry_run"
  | "blocked_message"
  | "mode_changed"
  | "retry_wait"
  | "needs_review"
  | "failed"
  | "error";

interface Ctx {
  deps: WelcomeDeps;
  row: DeliveryRow;
  token: string;
  /** 今この行が DB 上でどの状態か（claim_token と合わせて条件付き更新に使う） */
  status: DeliveryStatus;
  attempts: number;
  inlineWaitedMs: number;
}

type Step = ProcessOutcome | "continue";

function errorCodeOf(result: SlackCallResult<unknown>): string {
  switch (result.kind) {
    case "slack_error":
      return result.error;
    case "rate_limited":
      return "ratelimited";
    case "http_error":
      return `http_${result.status}`;
    case "timeout":
      return "timeout";
    case "network_error":
      return "network_error";
    default:
      return "unknown";
  }
}

function logEvent(event: string, row: DeliveryRow, extra?: Record<string, unknown>) {
  // 個人情報は出さない（行IDとエラーコードだけ）
  console.log(`[slack-welcome] ${event}`, { deliveryId: row.id, ...extra });
}

async function finish(ctx: Ctx, patch: DeliveryPatch, outcome: ProcessOutcome): Promise<ProcessOutcome> {
  const ok = await ctx.deps.store.update(ctx.row.id, ctx.token, ctx.status, {
    attempts: ctx.attempts,
    ...patch,
    release: true,
  });
  if (!ok) {
    logEvent("lost_claim", ctx.row, { at: patch.status });
    return "lost_claim";
  }
  if (patch.status) ctx.status = patch.status;
  logEvent(outcome, ctx.row, { code: patch.lastErrorCode ?? undefined, attempts: ctx.attempts });
  if (outcome === "needs_review" || outcome === "failed") {
    await ctx.deps.notifyOps({ counts: { [outcome]: 1 } });
  }
  return outcome;
}

/** この行を送ってよい期限（最初の受信から） */
function deadlineOf(row: DeliveryRow): number {
  const maxAge = row.lastErrorCode === INVITED_CODE ? PENDING_MAX_AGE_MS : MAX_AGE_MS;
  return row.firstReceivedAt.getTime() + maxAge;
}

/** 投稿前と確実に分かる失敗: 有限回リトライ、ダメなら failed */
async function retryOrFail(ctx: Ctx, code: string, retryAfterSec?: number): Promise<Step> {
  const { deps, row } = ctx;
  const now = deps.now();
  const backoffMs = 2 ** ctx.attempts * 1000;
  const waitMs = Math.max((retryAfterSec ?? 0) * 1000, backoffMs);
  const deadline = deadlineOf(row);

  if (ctx.attempts >= MAX_ATTEMPTS || now.getTime() + waitMs > deadline) {
    return finish(ctx, { status: "failed", lastErrorCode: code }, "failed");
  }

  if (waitMs <= INLINE_RETRY_MAX_WAIT_MS && ctx.inlineWaitedMs + waitMs <= INLINE_RETRY_BUDGET_MS) {
    if (ctx.status === "sending") {
      // 429 は投稿されていないので、処理中に戻してから待つ
      const ok = await deps.store.update(row.id, ctx.token, "sending", {
        status: "processing",
        attempts: ctx.attempts,
        lastErrorCode: code,
      });
      if (!ok) return "lost_claim";
      ctx.status = "processing";
    }
    logEvent("retry_inline", row, { code, waitMs, attempts: ctx.attempts });
    await deps.sleep(waitMs);
    ctx.inlineWaitedMs += waitMs;
    return "continue";
  }

  return finish(
    ctx,
    { status: "retry_wait", lastErrorCode: code, nextAttemptAt: new Date(now.getTime() + waitMs) },
    "retry_wait",
  );
}

/** 投稿前の Slack 呼び出し（users.info / conversations.open）の失敗を振り分ける */
async function handlePrePostFailure(ctx: Ctx, result: SlackCallResult<unknown>): Promise<Step> {
  const code = errorCodeOf(result);
  if (result.kind === "slack_error") {
    if (SKIP_USER_ERRORS.has(result.error)) {
      return finish(ctx, { status: "skipped", lastErrorCode: code }, "skipped");
    }
    if (PERMISSION_ERRORS.has(result.error)) {
      return finish(ctx, { status: "failed", lastErrorCode: code }, "failed");
    }
  }
  // 投稿前なので、タイムアウト・5xx・429 などは送り直しても二重にならない
  return retryOrFail(ctx, code, result.kind === "rate_limited" ? result.retryAfterSec : undefined);
}

async function runOnce(ctx: Ctx): Promise<Step> {
  const { deps, row } = ctx;
  const now = deps.now();

  // 最初の受信から20時間（招待中だった人は7日）を過ぎたら送らない（過去の参加者にまとめて送らない）
  if (now.getTime() > deadlineOf(row)) {
    return ctx.attempts > 0
      ? finish(ctx, { status: "failed", lastErrorCode: "retry_window_expired" }, "failed")
      : finish(ctx, { status: "skipped", lastErrorCode: "expired" }, "skipped");
  }

  // 設定を読み直す（再デプロイなしで止められるように、毎回 DB を見る）
  const settings = await deps.store.getSettings();
  if (!settings || settings.mode === "off") {
    return finish(ctx, { status: "queued" }, "off");
  }
  if (!settings.enabledFrom || row.eventTime.getTime() < settings.enabledFrom.getTime()) {
    return finish(ctx, { status: "skipped", lastErrorCode: "before_enabled_from" }, "skipped");
  }

  ctx.attempts += 1;

  // 1) 最新のユーザー状態を確認（ボットトークン）
  const info = await deps.slack.usersInfo(row.slackUserId);
  if (info.kind !== "ok") return handlePrePostFailure(ctx, info);

  const decision = judgeEligibility(info.data, deps.teamId);
  if (decision.kind === "skip") {
    ctx.attempts -= 1;
    return finish(ctx, { status: "skipped", lastErrorCode: decision.reason }, "skipped");
  }
  if (decision.kind === "pending_activation") {
    ctx.attempts -= 1;
    return finish(
      ctx,
      {
        status: "pending_activation",
        lastErrorCode: INVITED_CODE,
        nextAttemptAt: new Date(now.getTime() + PENDING_RECHECK_MS),
      },
      "pending_activation",
    );
  }

  const blockReason = getMessageBlockReason(deps.message);

  // 2) モードごとの分岐
  if (settings.mode === "dry_run") {
    // 判定だけ記録。送信済み扱いにはしない（queued に戻す）
    ctx.attempts -= 1;
    return finish(
      ctx,
      {
        status: "queued",
        dryRunResult: blockReason ? `would_block:${blockReason}` : "would_send",
        dryRunAt: now,
      },
      "dry_run",
    );
  }
  if (settings.mode === "test" && !settings.testUserIds.includes(row.slackUserId)) {
    ctx.attempts -= 1;
    return finish(ctx, { status: "skipped", lastErrorCode: "not_test_target" }, "skipped");
  }
  if (blockReason) {
    // 本文が未承認のときは test / live でも送らない
    ctx.attempts -= 1;
    console.error(`[slack-welcome] send refused: ${blockReason} (mode=${settings.mode})`);
    const outcome = await finish(ctx, { status: "queued", lastErrorCode: blockReason }, "blocked_message");
    await deps.notifyOps({
      counts: { [blockReason]: 1 },
      note: "本文が未承認のため送信を止めました（src/lib/slack-welcome/message.ts）。",
    });
    return outcome;
  }

  // 3) DM を開く（カイクンのユーザートークン）
  const opened = await deps.slack.openDm(row.slackUserId);
  if (opened.kind !== "ok") return handlePrePostFailure(ctx, opened);

  // 4) 投稿直前に設定をもう一度確認（直前に off にされたら送らない）
  const latest = await deps.store.getSettings();
  if (
    !latest ||
    (latest.mode !== "test" && latest.mode !== "live") ||
    (latest.mode === "test" && !latest.testUserIds.includes(row.slackUserId))
  ) {
    ctx.attempts -= 1;
    return finish(ctx, { status: "queued", lastErrorCode: "mode_changed" }, "mode_changed");
  }

  // 5) sending を永続化してから投稿する
  const toSending = await deps.store.update(row.id, ctx.token, ctx.status, {
    status: "sending",
    attempts: ctx.attempts,
    channelId: opened.data.channelId,
    messageVersion: deps.message.version,
    lastErrorCode: null,
  });
  if (!toSending) {
    logEvent("lost_claim", row, { at: "sending" });
    return "lost_claim";
  }
  ctx.status = "sending";

  const posted = await deps.slack.postMessage(opened.data.channelId, deps.message.text);

  if (posted.kind === "ok") {
    // ここで記録に失敗しても sending のまま残り、cron が needs_review にする（送り直さない）
    return finish(
      ctx,
      {
        status: "sent",
        channelId: posted.data.channelId,
        messageTs: posted.data.ts,
        sentAt: deps.now(),
        lastErrorCode: null,
      },
      "sent",
    );
  }
  if (posted.kind === "rate_limited") {
    // 429 は投稿前に断られている
    return retryOrFail(ctx, "ratelimited", posted.retryAfterSec);
  }
  if (posted.kind === "slack_error" && !AMBIGUOUS_POST_ERRORS.has(posted.error)) {
    // Slack が処理して断った（投稿されていない）。自動では送り直さない
    return finish(ctx, { status: "failed", lastErrorCode: posted.error }, "failed");
  }
  // タイムアウト・5xx・通信エラー・応答不明・内部エラー → 送れたか分からない
  return finish(ctx, { status: "needs_review", lastErrorCode: errorCodeOf(posted) }, "needs_review");
}

/** 1行を処理する（after() と cron の共通入口） */
export async function processDelivery(deps: WelcomeDeps, deliveryId: string): Promise<ProcessOutcome> {
  let settings;
  try {
    settings = await deps.store.getSettings();
  } catch (error) {
    console.error("[slack-welcome] settings read failed:", error instanceof Error ? error.message : "unknown");
    return "error";
  }
  if (!settings || settings.mode === "off") return "off";

  const token = deps.newToken();
  const start = deps.now();
  let row: DeliveryRow | null;
  try {
    row = await deps.store.claim(deliveryId, start, new Date(start.getTime() + LEASE_MS), token);
  } catch (error) {
    console.error("[slack-welcome] claim failed:", error instanceof Error ? error.message : "unknown");
    return "error";
  }
  if (!row) return "not_claimed";

  const ctx: Ctx = { deps, row, token, status: "processing", attempts: row.attempts, inlineWaitedMs: 0 };
  try {
    for (;;) {
      const step = await runOnce(ctx);
      if (step !== "continue") return step;
    }
  } catch (error) {
    // processing のままなら確保の期限切れ後に cron が拾い直す。sending なら cron が needs_review にする
    console.error(
      `[slack-welcome] process error (status=${ctx.status}):`,
      error instanceof Error ? error.message : "unknown",
    );
    return "error";
  }
}

/** (team_id, slack_user_id) で行を探して処理する（受け口の after() 用） */
export async function processDeliveryByKey(
  deps: WelcomeDeps,
  teamId: string,
  slackUserId: string,
): Promise<ProcessOutcome> {
  try {
    const id = await deps.store.findIdByKey(teamId, slackUserId);
    if (!id) return "not_found";
    return await processDelivery(deps, id);
  } catch (error) {
    console.error("[slack-welcome] lookup failed:", error instanceof Error ? error.message : "unknown");
    return "error";
  }
}

export interface SweepResult {
  staleSending: number;
  processed: number;
  outcomes: Partial<Record<ProcessOutcome, number>>;
}

/** 取りこぼし拾い直し（cron）。古い sending を needs_review にし、送るべき行を処理する */
export async function runSweep(
  deps: WelcomeDeps,
  options: { limit?: number; timeBudgetMs?: number } = {},
): Promise<SweepResult> {
  const limit = options.limit ?? 25;
  // 1行あたり最大30秒のインライン待ちがあるので、maxDuration(60秒)に収まるよう新しい行の着手は20秒まで
  const timeBudgetMs = options.timeBudgetMs ?? 20_000;
  const startedAt = deps.now().getTime();

  const staleSending = await deps.store.markStaleSending(new Date(startedAt - STALE_SENDING_MS));
  if (staleSending > 0) {
    await deps.notifyOps({
      counts: { needs_review: staleSending },
      note: "送信中のまま止まっていた行があります（送れたか分からないため、自動では送り直しません）。",
    });
  }

  const outcomes: Partial<Record<ProcessOutcome, number>> = {};
  let processed = 0;
  const settings = await deps.store.getSettings();
  if (!settings || settings.mode === "off") {
    return { staleSending, processed, outcomes };
  }

  const ids = await deps.store.listDueIds(deps.now(), limit);
  for (const id of ids) {
    if (deps.now().getTime() - startedAt > timeBudgetMs) break;
    const outcome = await processDelivery(deps, id);
    outcomes[outcome] = (outcomes[outcome] ?? 0) + 1;
    processed += 1;
  }
  return { staleSending, processed, outcomes };
}
