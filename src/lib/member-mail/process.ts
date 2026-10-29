/**
 * 会員メール（#264 スライス1）の送る処理。
 *
 * 流れ（264 §5-2・§5-5）:
 *   1. prepareCampaign: 対象を選ぶ。
 *        count（人数だけ）→ 人数を記録して運用 Slack に出す（送らない・記録の行も作らない）
 *        owner（オーナーだけ）→ オーナーの行を送信の記録に書く
 *        all（全員）→ 対象全員の行を送信の記録に書く（1回だけ）
 *   2. runSendBatch: 送信の記録から1人ずつ送る（1回に数十人まで・1日の上限・送ってよい時間帯）
 *
 * 安全策（#238 と同じ考え方。二重送信しない・分からないときは送り直さない）:
 * - 行は条件付き UPDATE ... RETURNING で確保（claim）。確保した処理だけが進める
 * - 送る直前に status=sending を永続化してから Resend に送る。Idempotency-Key は送信記録の行ID
 * - タイムアウト・5xx・応答不明 → needs_review（自動で送り直さない）。Resend が番号を覚えるのは24時間だけなので、本当の守りは記録の一意制約
 * - スイッチ・承認・配信停止・届かない・週の上限・契約は、送る1通ごとに読み直す（すぐ止まる）
 * - 承認の印がない文面は、どのモードでも送らない
 * - ログ・記録・通知にメールアドレスを出さない（行IDと理由コードだけ）
 */
import { getCampaignBlockReason, renderMail, unsubscribeHeaders } from "./content";
import { isWithinSendWindow, jstDayStart, jstWeekStart } from "./dates";
import type { NotifyMailOps } from "./ops-alert";
import { selectTargets, summarize, TARGETS } from "./targets";
import {
  CATEGORY_OF_KIND,
  MAIL_MODES,
  WEEKLY_CAP_CATEGORIES,
  type Campaign,
  type CountSummary,
  type DeliveryPatch,
  type DeliveryRow,
  type DeliveryStatus,
  type MailClient,
  type MailKind,
  type MailMode,
  type MailStore,
  type NewDelivery,
} from "./types";
import { createUnsubscribeToken, oneClickUrl, unsubscribePageUrl } from "./unsubscribe-token";

export const LEASE_MS = 2 * 60 * 1000;
/** これより古い sending は「送れたか分からない」として needs_review にする */
export const STALE_SENDING_MS = 10 * 60 * 1000;
/** 速さ・1日の上限で断られたとき、次に試すまでの間隔 */
export const THROTTLE_RETRY_MS = 60 * 60 * 1000;

export interface MailDeps {
  store: MailStore;
  /** Resend の鍵などが無いときは null（人数だけ出すは動く・送る処理は止まる） */
  mail: MailClient | null;
  notifyOps: NotifyMailOps;
  now: () => Date;
  newToken: () => string;
  siteUrl: string;
  from: string;
  replyTo: string | null;
  unsubscribeSecret: string;
}

/** 全体と種類ごとのスイッチのうち、弱いほう（off < count < owner < all） */
export function effectiveMode(global: MailMode, kind: MailMode): MailMode {
  return MAIL_MODES.indexOf(global) <= MAIL_MODES.indexOf(kind) ? global : kind;
}

async function currentMode(store: MailStore, kind: MailKind): Promise<MailMode> {
  const settings = await store.getSettings();
  if (!settings) return "off";
  return effectiveMode(settings.mode, await store.getKindMode(kind));
}

function logEvent(event: string, extra?: Record<string, unknown>) {
  // 個人情報は出さない（行ID・理由コード・件数だけ）
  console.log(`[member-mail] ${event}`, extra ?? {});
}

// =============================================================================
// 1. 対象を選んで送信の記録に書く
// =============================================================================

export type PrepareResult =
  | { outcome: "off" }
  | { outcome: "unsupported_kind" }
  | { outcome: "counted"; count: CountSummary }
  | { outcome: "blocked"; reason: string }
  | { outcome: "enqueued"; audience: "owner" | "all"; inserted: number; count?: CountSummary }
  | { outcome: "already_enqueued" };

export async function prepareCampaign(deps: MailDeps, campaign: Campaign): Promise<PrepareResult> {
  const { store } = deps;
  const now = deps.now();
  const settings = await store.getSettings();
  if (!settings) return { outcome: "off" };
  const mode = effectiveMode(settings.mode, await store.getKindMode(campaign.kind));
  if (mode === "off") return { outcome: "off" };

  const def = TARGETS[campaign.kind];
  if (!def) return { outcome: "unsupported_kind" };
  const blockReason = getCampaignBlockReason(campaign);
  const category = CATEGORY_OF_KIND[campaign.kind];

  if (mode === "count") {
    const selection = await selectTargets(store, def, campaign.id, now);
    const count = summarize(campaign.kind, mode, blockReason === null, selection, now);
    await store.saveCount(campaign.id, count, now);
    await deps.notifyOps({
      title: `人数だけ出しました（${campaign.label}）`,
      counts: {
        candidates: count.candidates,
        will_send: count.willSend,
        ...prefixKeys("excluded_", count.excluded),
        cancel_scheduled: count.cancelScheduled,
      },
      note: blockReason ? `文面はまだ送れない状態です（${blockReason}）。` : "文面は承認済みです。",
    });
    logEvent("counted", { campaignId: campaign.id, willSend: count.willSend });
    return { outcome: "counted", count };
  }

  // owner / all は承認済みの文面だけ（承認の印がない文面は、どのモードでも送らない）
  if (blockReason) {
    await deps.notifyOps({
      title: `文面が承認されていないため送りません（${campaign.label}）`,
      counts: { [blockReason]: 1 },
    });
    logEvent("prepare_blocked", { campaignId: campaign.id, reason: blockReason });
    return { outcome: "blocked", reason: blockReason };
  }

  if (mode === "owner") {
    const rows: NewDelivery[] = settings.ownerUserIds.map((userId) => ({
      campaignId: campaign.id,
      userId,
      kind: campaign.kind,
      category,
      audience: "owner",
      contentVersion: campaign.contentVersion,
    }));
    const inserted = rows.length > 0 ? await store.insertDeliveries(rows) : 0;
    logEvent("enqueued_owner", { campaignId: campaign.id, inserted });
    return { outcome: "enqueued", audience: "owner", inserted };
  }

  // all: 対象の書き出しは1回だけ（毎回足すと、あとから入った人に古い号が届くため）
  if (campaign.enqueuedAt) return { outcome: "already_enqueued" };
  const selection = await selectTargets(store, def, campaign.id, now);
  const count = summarize(campaign.kind, mode, true, selection, now);
  const rows: NewDelivery[] = selection.included.map((c) => ({
    campaignId: campaign.id,
    userId: c.userId,
    kind: campaign.kind,
    category,
    audience: "all",
    contentVersion: campaign.contentVersion,
  }));
  const inserted = rows.length > 0 ? await store.insertDeliveries(rows) : 0;
  await store.saveCount(campaign.id, count, now);
  await store.markEnqueued(campaign.id, now);
  await deps.notifyOps({
    title: `全員に送る準備をしました（${campaign.label}）`,
    counts: { queued: inserted, ...prefixKeys("excluded_", count.excluded) },
  });
  logEvent("enqueued_all", { campaignId: campaign.id, inserted });
  return { outcome: "enqueued", audience: "all", inserted, count };
}

function prefixKeys(prefix: string, obj: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${prefix}${k}`, v]));
}

// =============================================================================
// 2. 1人ずつ送る
// =============================================================================

export type DeliveryOutcome =
  | "not_claimed"
  | "lost_claim"
  | "paused"
  | "blocked"
  | "skipped"
  | "sent"
  | "throttled"
  | "failed"
  | "failed_stop"
  | "needs_review"
  | "not_configured"
  | "error";

interface Ctx {
  deps: MailDeps;
  row: DeliveryRow;
  token: string;
  status: DeliveryStatus;
}

async function finish(ctx: Ctx, patch: DeliveryPatch, outcome: DeliveryOutcome): Promise<DeliveryOutcome> {
  const ok = await ctx.deps.store.update(ctx.row.id, ctx.token, ctx.status, { ...patch, release: true });
  if (!ok) {
    logEvent("lost_claim", { deliveryId: ctx.row.id, at: patch.status });
    return "lost_claim";
  }
  logEvent(outcome, { deliveryId: ctx.row.id, reason: patch.reason ?? undefined });
  return outcome;
}

/** 送らずに待ち行列へ戻す（スイッチが止まった・承認が外れた など。あとで再開できる） */
function backToQueue(ctx: Ctx, reason: string, outcome: DeliveryOutcome, retryAt?: Date) {
  return finish(
    ctx,
    { status: "queued", reason, ...(retryAt ? { nextAttemptAt: retryAt } : {}) },
    outcome,
  );
}

async function runDelivery(ctx: Ctx): Promise<DeliveryOutcome> {
  const { deps, row } = ctx;
  const { store } = deps;

  // スイッチ（毎回 DB を見る）
  const mode = await currentMode(store, row.kind);
  if (mode === "off" || mode === "count") return backToQueue(ctx, `mode_${mode}`, "paused");
  if (row.audience === "all" && mode !== "all") return backToQueue(ctx, `mode_${mode}`, "paused");

  // 文面と承認（承認の印がない文面は、どのモードでも送らない）
  const campaign = await store.getCampaign(row.campaignId);
  if (!campaign) return finish(ctx, { status: "failed", reason: "campaign_missing" }, "failed");
  const blockReason = getCampaignBlockReason(campaign);
  if (blockReason) {
    await deps.notifyOps({ title: "文面が承認されていないため送信を止めました", counts: { [blockReason]: 1 } });
    return backToQueue(ctx, blockReason, "blocked");
  }
  // オーナー確認は、その版を見るためのもの。版が変わったら送らない（新しい版で改めて書き出す）
  if (row.audience === "owner" && campaign.contentVersion !== row.contentVersion) {
    return finish(ctx, { status: "skipped", reason: "content_changed" }, "skipped");
  }

  // 送ってよい相手か（届かない・配信停止・契約・週の上限）
  if (await store.isSuppressed(row.userId)) return finish(ctx, { status: "skipped", reason: "suppressed" }, "skipped");
  if (await store.isUnsubscribed(row.userId, row.category)) {
    return finish(ctx, { status: "skipped", reason: "unsubscribed" }, "skipped");
  }
  if (row.audience === "all") {
    const def = TARGETS[row.kind];
    if (!def) return finish(ctx, { status: "failed", reason: "unsupported_kind" }, "failed");
    if (!(await def.stillEligible(store, row.userId))) {
      return finish(ctx, { status: "skipped", reason: "not_eligible" }, "skipped");
    }
    if (
      def.countsTowardWeeklyCap &&
      (await store.hasMailedSince(row.userId, jstWeekStart(deps.now()), WEEKLY_CAP_CATEGORIES, row.campaignId))
    ) {
      return finish(ctx, { status: "skipped", reason: "weekly_cap" }, "skipped");
    }
  }

  if (!deps.mail) return backToQueue(ctx, "not_configured", "not_configured");

  // アドレスは送る直前にだけ読む（記録・ログに残さない）
  const to = await store.getEmailAddress(row.userId);
  if (!to) return finish(ctx, { status: "skipped", reason: "no_email" }, "skipped");

  const tokenValue = createUnsubscribeToken(deps.unsubscribeSecret, row.userId, row.category);
  const rendered = renderMail(campaign, {
    siteUrl: deps.siteUrl,
    unsubscribeUrl: unsubscribePageUrl(deps.siteUrl, tokenValue),
  });

  // 送る直前にもう一度スイッチを見る（直前に止められたら送らない）
  const latest = await currentMode(store, row.kind);
  if (latest === "off" || latest === "count" || (row.audience === "all" && latest !== "all")) {
    return backToQueue(ctx, "mode_changed", "paused");
  }

  // sending を永続化してから送る
  const sendingAt = deps.now();
  const toSending = await store.update(row.id, ctx.token, ctx.status, {
    status: "sending",
    attempts: row.attempts + 1,
    contentVersion: campaign.contentVersion,
    sendingAt,
    reason: null,
  });
  if (!toSending) {
    logEvent("lost_claim", { deliveryId: row.id, at: "sending" });
    return "lost_claim";
  }
  ctx.status = "sending";

  const result = await deps.mail.send({
    to,
    from: deps.from,
    replyTo: deps.replyTo,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    headers: unsubscribeHeaders(oneClickUrl(deps.siteUrl, tokenValue)),
    idempotencyKey: `member-mail/${row.id}`,
    tags: [
      { name: "kind", value: row.kind },
      { name: "audience", value: row.audience },
    ],
  });

  switch (result.kind) {
    case "ok":
      // ここで記録に失敗しても sending のまま残り、次の回で needs_review になる（送り直さない）
      return finish(ctx, { status: "sent", resendEmailId: result.id, sentAt: deps.now() }, "sent");
    case "throttled":
      // 送られていないことが確実。1日の上限を数え直せるよう sending_at を消して待ち行列へ戻す
      return finish(
        ctx,
        {
          status: "queued",
          reason: result.code,
          sendingAt: null,
          nextAttemptAt: new Date(deps.now().getTime() + THROTTLE_RETRY_MS),
        },
        "throttled",
      );
    case "rejected":
      return finish(ctx, { status: "failed", reason: result.code }, result.stopBatch ? "failed_stop" : "failed");
    case "ambiguous":
    default:
      return finish(ctx, { status: "needs_review", reason: result.code }, "needs_review");
  }
}

export async function processDelivery(deps: MailDeps, deliveryId: string): Promise<DeliveryOutcome> {
  const token = deps.newToken();
  const start = deps.now();
  let row: DeliveryRow | null;
  try {
    row = await deps.store.claim(deliveryId, start, new Date(start.getTime() + LEASE_MS), token);
  } catch (error) {
    console.error("[member-mail] claim failed:", error instanceof Error ? error.message : "unknown");
    return "error";
  }
  if (!row) return "not_claimed";
  const ctx: Ctx = { deps, row, token, status: "processing" };
  try {
    return await runDelivery(ctx);
  } catch (error) {
    // processing のままなら確保の期限切れ後に拾い直す。sending なら次の回で needs_review にする
    console.error(
      `[member-mail] process error (status=${ctx.status}):`,
      error instanceof Error ? error.message : "unknown",
    );
    return "error";
  }
}

export interface BatchResult {
  skippedReason?: "off" | "outside_window" | "daily_limit" | "locked";
  staleSending: number;
  processed: number;
  outcomes: Partial<Record<DeliveryOutcome, number>>;
}

/** 送信の記録から1回分（数十人まで）送る。cron と手動の両方から呼ぶ */
export async function runSendBatch(
  deps: MailDeps,
  options: { limit?: number; timeBudgetMs?: number } = {},
): Promise<BatchResult> {
  const { store } = deps;
  // 1回の上限は1日の上限（既定80）まで。実際に止めるのは時間の予算（関数の実行時間上限 60秒に収める）
  const limit = options.limit ?? 100;
  const timeBudgetMs = Math.max(0, options.timeBudgetMs ?? 40_000);
  const startedAt = deps.now();
  const outcomes: Partial<Record<DeliveryOutcome, number>> = {};
  let processed = 0;

  const staleSending = await store.markStaleSending(new Date(startedAt.getTime() - STALE_SENDING_MS));
  if (staleSending > 0) {
    await deps.notifyOps({
      title: "送信中のまま止まっていた行があります",
      counts: { needs_review: staleSending },
      note: "送れたか分からないため、自動では送り直しません。member_mail_deliveries を確認してください。",
    });
  }

  const settings = await store.getSettings();
  if (!settings || settings.mode === "off") return { skippedReason: "off", staleSending, processed, outcomes };
  if (!isWithinSendWindow(startedAt, settings.sendHourStart, settings.sendHourEnd)) {
    return { skippedReason: "outside_window", staleSending, processed, outcomes };
  }

  const locked = await store.acquireRunLock(startedAt, new Date(startedAt.getTime() + timeBudgetMs + LEASE_MS));
  if (!locked) return { skippedReason: "locked", staleSending, processed, outcomes };

  try {
    let remaining = settings.dailyLimit - (await store.countSentSince(jstDayStart(startedAt)));
    if (remaining <= 0) return { skippedReason: "daily_limit", staleSending, processed, outcomes };

    const ids = await store.listDueDeliveryIds(startedAt, Math.min(limit, remaining));
    for (const id of ids) {
      if (remaining <= 0) break;
      if (deps.now().getTime() - startedAt.getTime() > timeBudgetMs) break;
      const outcome = await processDelivery(deps, id);
      outcomes[outcome] = (outcomes[outcome] ?? 0) + 1;
      processed += 1;
      if (outcome === "sent" || outcome === "needs_review") remaining -= 1;
      // 鍵・送信元の設定ミスや上限は、続けても同じなので止める
      if (outcome === "failed_stop" || outcome === "throttled" || outcome === "not_configured") break;
    }
  } finally {
    await store.releaseRunLock();
  }

  const counts = outcomes as Record<string, number>;
  if (processed > 0) {
    const problems = ["needs_review", "failed", "failed_stop", "throttled", "blocked", "error"].some(
      (k) => (counts[k] ?? 0) > 0,
    );
    await deps.notifyOps({
      title: problems ? "送信の結果（確認が必要なものがあります）" : "送信の結果",
      counts,
    });
  }
  return { staleSending, processed, outcomes };
}
