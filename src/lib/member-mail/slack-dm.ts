/**
 * 常設の文面（はじめの案内）を、メールに加えて Slack の DM でも送る（#327-H）。
 *
 * 送る時機: 毎朝の実行で、メールを送り終えたあとに runSlackDmBatch でまとめて送る（メールの1通ごとには送らない）。
 *   候補は「今日（日本時間）、かつ Slack のスイッチを off / count から上げた時刻（slack_dm_raised_at）より後に
 *   メールを送れた（status=sent）常設の文面の送信記録」のうち、DM の記録がまだ無い・または deferred（次の実行で送ってよい）のもの。
 *   前の日の分は送らない（数だけ通知に出す）。スイッチを入れたときに、昔の分をまとめて送らないため。
 *   残り時間が SLACK_DM_MIN_REMAINING_MS より少なければ始めない（残りは同じ日の次の実行で拾う。件数は通知に出す）。
 *   スイッチが読めない（マイグレーション前）・off のときは、何もせず静かに終える（通知もしない）。
 *
 * 送る条件（すべて満たすときだけ。1つでも欠けたら DM は送らない。メールには何も影響させない）:
 *   1. SLACK_DM_STANDING_KEYS の常設の文面（今は onboarding_day2 だけ。週1回のメルマガなどは送らない）
 *   2. その人へのメールを送れた（status=sent）。メールの版と今の文面の版が同じ
 *   3. メールのスイッチ（全体・種類・文面ごとの standing_mode）が今もその行を送ってよい状態
 *      （会員の行は all、オーナー確認の行は owner 以上）。メールを下げれば、まだ送っていない DM も止まる
 *   3'. Slack の DM のスイッチ（member_mail_settings.slack_dm_mode）が owner なら owner_user_ids の人、all なら全員
 *      （off / count は送らない。count は運用 Slack に人数を出すだけ）
 *   4. slack_member_links でつながっていて、team_id が BONO のワークスペース（SLACK_WELCOME_TEAM_ID）
 *   5. 本人の「Slack の DM で受け取る」がオン（行が無ければオン）
 *   6. users.info で、退会・ゲスト・ボット・ほかのワークスペース・招待中でない（#238 の judgeEligibility）
 *
 * 二重に送らない: Slack を呼ぶ直前に member_mail_slack_dms に status=sending の行を入れる（delivery_id に一意）。
 * 入らなければ（もうある）送らない。送れたか分からないときは needs_review にして自動で送り直さない（#238 と同じ考え方）。
 * 速さの上限（429）は送られていないので deferred にして、その回の DM は止める（次の実行で送り直す）。
 *
 * ログ・記録・通知に出すのは ID とエラーコードだけ（本文・メールアドレス・名前は出さない）。
 *
 * 出典:
 * - https://docs.slack.dev/reference/methods/users.info/
 * - https://docs.slack.dev/reference/methods/conversations.open/
 * - https://docs.slack.dev/reference/methods/chat.postMessage/
 * - https://docs.slack.dev/apis/web-api/rate-limits/
 */
import { getCampaignBlockReason } from "./content";
import { isWithinSendWindow, jstDayStart } from "./dates";
import type { NotifyMailOps } from "./ops-alert";
import { renderSlackDm } from "./slack-mrkdwn";
import { MAIL_MODES, type Audience, type MailMode, type MailStore, type StandingKey } from "./types";
import { judgeEligibility } from "@/lib/slack-welcome/eligibility";
import type { SlackCallResult, SlackUserSummary } from "@/lib/slack-welcome/slack-api";

/**
 * Slack の DM でも送る常設の文面。ここに無い文面（327-E のリマインダー・327-F の相談の案内など）は、
 * オーナーが決めるまで DM では送らない
 */
export const SLACK_DM_STANDING_KEYS: readonly StandingKey[] = ["onboarding_day2"];

export function isSlackDmStandingKey(key: unknown): key is StandingKey {
  return typeof key === "string" && (SLACK_DM_STANDING_KEYS as readonly string[]).includes(key);
}

/** 1通（users.info・conversations.open・chat.postMessage の3回、各5秒まで）に要る残り時間。これより少なければ始めない */
export const SLACK_DM_MIN_REMAINING_MS = 15_000;
/** これより古い sending は「送れたか分からない」として needs_review にする（メールと同じ10分） */
export const SLACK_DM_STALE_SENDING_MS = 10 * 60 * 1000;
/** 1回の実行で Slack に送る（確保する）数の上限。送らずに外れた人はこの数に入れない */
export const SLACK_DM_BATCH_LIMIT = 50;

export interface SlackDmLink {
  teamId: string;
  slackUserId: string;
}

export type SlackDmStatus = "sending" | "sent" | "failed" | "needs_review" | "deferred";

/** DM を送る候補（送れたメールの送信記録1行） */
export interface SlackDmCandidate {
  deliveryId: string;
  campaignId: string;
  userId: string;
  audience: Audience;
  contentVersion: number;
}

export interface NewSlackDm extends SlackDmCandidate {
  teamId: string;
  slackUserId: string;
}

export interface NewSlackPreview {
  campaignId: string;
  userId: string;
  contentVersion: number;
  teamId: string;
  slackUserId: string;
}

export interface SlackDmPatch {
  status: Exclude<SlackDmStatus, "sending">;
  reason?: string | null;
  channelId?: string | null;
  ts?: string | null;
  sentAt?: Date | null;
}

/** Slack の DM の永続化（Supabase 実装は slack-dm-store.ts）。失敗時は例外を投げる */
export interface SlackDmStore {
  /** member_mail_settings.slack_dm_mode（読めなければ例外。呼び出し側で off 扱い） */
  getSlackDmMode(): Promise<MailMode>;
  /** member_mail_settings.slack_dm_raised_at（off / count から owner / all に上げた最後の時刻。トリガーが入れる） */
  getSlackDmRaisedAt(): Promise<Date | null>;
  getSlackLink(userId: string): Promise<SlackDmLink | null>;
  /** userIds のうち、つながっている人（teamId を渡すとそのワークスペースだけ） */
  listSlackLinkedUserIds(userIds: readonly string[], teamId: string | null): Promise<Set<string>>;
  /** 本人の「Slack の DM で受け取る」。hasRow は行があるか（一度でも切り替えたか） */
  getSlackDmPreference(userId: string): Promise<{ enabled: boolean; hasRow: boolean }>;
  /** userIds のうち、オフにしている人 */
  listSlackDmDisabledUserIds(userIds: readonly string[]): Promise<Set<string>>;
  setSlackDmEnabled(userId: string, enabled: boolean, at: Date): Promise<void>;
  /** この人に DM（会員の DM か、オーナー確認の DM）を送れたことがあるか */
  hasReceivedSlackDm(userId: string): Promise<boolean>;
  /**
   * campaignIds の送信記録のうち、since 以降（until があれば until より前）に送れた（status=sent）もので、
   * DM の記録が無い・または deferred のもの（メールを送った順。1日分なので上限は store の中で大きめに持つ）
   */
  listSlackDmCandidates(
    campaignIds: readonly string[],
    range: { since: Date; until?: Date },
  ): Promise<SlackDmCandidate[]>;
  /**
   * Slack を呼ぶ直前に確保する。記録が無ければ sending で入れ、deferred なら sending に戻す。
   * 確保できたら行ID、もう送った・送っている（deferred 以外の行がある）なら null
   */
  claimSlackDm(row: NewSlackDm, at: Date): Promise<string | null>;
  finishSlackDm(id: string, patch: SlackDmPatch): Promise<void>;
  /** updated_at が olderThan より古い sending を needs_review にし、件数を返す */
  markStaleSlackDms(olderThan: Date): Promise<number>;
  /** オーナー確認の DM を確保する（同じ文面の版・同じ人には1回だけ）。deferred なら取り直せる */
  claimSlackPreview(row: NewSlackPreview, at: Date): Promise<string | null>;
  finishSlackPreview(id: string, patch: SlackDmPatch): Promise<void>;
}

/** #238 の Slack クライアントのうち、DM を送るのに使う3つ */
export interface SlackDmClient {
  usersInfo(userId: string): Promise<SlackCallResult<SlackUserSummary>>;
  openDm(userId: string): Promise<SlackCallResult<{ channelId: string }>>;
  postMessage(channelId: string, text: string): Promise<SlackCallResult<{ channelId: string; ts: string }>>;
}

export interface SlackDmDeps {
  store: SlackDmStore;
  /** トークンが無ければ null（count は動く・送るのは止まる） */
  slack: SlackDmClient | null;
  /** SLACK_WELCOME_TEAM_ID。無ければ null */
  teamId: string | null;
}

/** MailDeps のうち、ここで使うもの（process.ts と循環しないよう型だけで受ける） */
export interface SlackDmContext {
  store: Pick<MailStore, "getSettings" | "getKindMode" | "getCampaign" | "listStandingCampaigns">;
  slackDm?: SlackDmDeps | null;
  notifyOps: NotifyMailOps;
  now: () => Date;
  siteUrl: string;
}

/** 投稿で返ると「投稿されたか分からない」Slack 側の内部エラー（#238 と同じ） */
const AMBIGUOUS_POST_ERRORS = new Set(["internal_error", "fatal_error", "service_unavailable", "request_timeout"]);

function logSlack(event: string, extra?: Record<string, unknown>) {
  // 個人情報は出さない（行ID・理由コードだけ）
  console.log(`[member-mail] slack_dm_${event}`, extra ?? {});
}

type Failure = Exclude<SlackCallResult<unknown>, { kind: "ok" }>;

function codeOf(result: Failure): string {
  switch (result.kind) {
    case "slack_error":
      return result.error;
    case "rate_limited":
      return "ratelimited";
    case "http_error":
      return `http_${result.status}`;
    default:
      return result.kind;
  }
}

/**
 * 表・列が無い（マイグレーション前）ときの PostgREST / Postgres のエラーコード。
 * store は「... failed: <code>」の形で投げる
 */
const MISSING_SCHEMA_CODES = ["42P01", "42703", "PGRST204", "PGRST205"];

export function isMissingSchemaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return MISSING_SCHEMA_CODES.some((code) => message.endsWith(`: ${code}`));
}

/** スイッチを読む。読めなければ null（マイグレーション前なら何も出さない。それ以外は warn だけ） */
export async function tryReadSlackDmMode(store: SlackDmStore): Promise<MailMode | null> {
  try {
    return await store.getSlackDmMode();
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      console.warn("[member-mail] slack dm mode read failed:", error instanceof Error ? error.message : "unknown");
    }
    return null;
  }
}

/** スイッチを読む。読めなければ off 扱い（送らない側に倒す） */
export async function readSlackDmMode(store: SlackDmStore): Promise<MailMode> {
  return (await tryReadSlackDmMode(store)) ?? "off";
}

/** off < count < owner < all のうち弱いほう（process.ts の effectiveMode と同じ。循環 import を避けて写す） */
function weaker(a: MailMode, b: MailMode): MailMode {
  return MAIL_MODES.indexOf(a) <= MAIL_MODES.indexOf(b) ? a : b;
}

/**
 * PR #342 の文面ごとのスイッチ（campaign.standingMode）。#342 が入っていない枝では項目が無い（undefined）ので見ない（all）。
 * 値が null（#342 のマイグレーション前）なら #342 と同じく count として扱う
 */
export function standingModeOf(campaign: object): MailMode {
  const value = (campaign as { standingMode?: unknown }).standingMode;
  if (value === undefined) return "all";
  return MAIL_MODES.includes(value as MailMode) ? (value as MailMode) : "count";
}

/** メールのスイッチ（全体・種類・文面ごと）が、今もこの行の宛先に送ってよい状態か */
function emailStillAllows(emailMode: MailMode, audience: Audience): boolean {
  return audience === "all" ? emailMode === "all" : emailMode === "owner" || emailMode === "all";
}

// =============================================================================
// 1通を送る（会員の DM とオーナー確認の DM で共通）
// =============================================================================

/** 送る前の確認で外れた理由（記録は作らない） */
type SkipReason =
  | "not_linked"
  | "other_team"
  | "disabled"
  | "deleted"
  | "bot"
  | "guest"
  | "invited"
  | `users_info_${string}`;

type SendOneResult =
  | { kind: "skipped"; reason: SkipReason }
  | { kind: "duplicate" }
  /** 429。送っていない。この回の DM はここで止める */
  | { kind: "rate_limited" }
  | { kind: "sent" }
  | { kind: "failed"; reason: string }
  | { kind: "needs_review"; reason: string }
  | { kind: "deferred"; reason: string };

interface SendOneInput {
  slack: SlackDmClient;
  store: SlackDmStore;
  teamId: string;
  userId: string;
  text: string;
  /** Slack を呼ぶ直前に確保する。確保できなければ null */
  claim: (link: SlackDmLink) => Promise<string | null>;
  finish: (id: string, patch: SlackDmPatch) => Promise<void>;
  now: () => Date;
}

async function sendOne(input: SendOneInput): Promise<SendOneResult> {
  const { slack, store, teamId, userId } = input;
  const link = await store.getSlackLink(userId);
  if (!link) return { kind: "skipped", reason: "not_linked" };
  if (link.teamId !== teamId) return { kind: "skipped", reason: "other_team" };
  if (!(await store.getSlackDmPreference(userId)).enabled) return { kind: "skipped", reason: "disabled" };

  // Slack のアカウントの状態（#238 と同じ判定。退会・ゲスト・ボット・ほかのワークスペースには送らない）
  const info = await slack.usersInfo(link.slackUserId);
  if (info.kind !== "ok") {
    if (info.kind === "rate_limited") return { kind: "rate_limited" };
    return { kind: "skipped", reason: `users_info_${codeOf(info)}` };
  }
  const decision = judgeEligibility(info.data, teamId);
  if (decision.kind === "skip") return { kind: "skipped", reason: decision.reason };
  if (decision.kind === "pending_activation") return { kind: "skipped", reason: "invited" };

  // ここで初めて記録を作る（Slack を呼ぶ直前）
  const id = await input.claim(link);
  if (!id) return { kind: "duplicate" };

  const opened = await slack.openDm(link.slackUserId);
  if (opened.kind !== "ok") {
    // DM を開けなかった＝投稿していない
    if (opened.kind === "rate_limited") {
      await input.finish(id, { status: "deferred", reason: "ratelimited" });
      return { kind: "rate_limited" };
    }
    if (opened.kind === "slack_error") {
      await input.finish(id, { status: "failed", reason: opened.error });
      return { kind: "failed", reason: opened.error };
    }
    // 通信の失敗（投稿はしていない）。次の実行で送り直してよい
    await input.finish(id, { status: "deferred", reason: codeOf(opened) });
    return { kind: "deferred", reason: codeOf(opened) };
  }
  const posted = await slack.postMessage(opened.data.channelId, input.text);
  if (posted.kind === "ok") {
    await input.finish(id, {
      status: "sent",
      channelId: posted.data.channelId,
      ts: posted.data.ts,
      sentAt: input.now(),
      reason: null,
    });
    return { kind: "sent" };
  }
  const reason = codeOf(posted);
  if (posted.kind === "rate_limited") {
    // 429 は処理されていない（https://docs.slack.dev/apis/web-api/rate-limits/）
    await input.finish(id, { status: "deferred", reason, channelId: opened.data.channelId });
    return { kind: "rate_limited" };
  }
  if (posted.kind === "slack_error" && !AMBIGUOUS_POST_ERRORS.has(posted.error)) {
    await input.finish(id, { status: "failed", reason, channelId: opened.data.channelId });
    return { kind: "failed", reason };
  }
  // 5xx・タイムアウト・応答不明・Slack の内部エラーは、投稿されたか分からない
  await input.finish(id, { status: "needs_review", reason, channelId: opened.data.channelId });
  return { kind: "needs_review", reason };
}

function tally(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1;
}

function resultKey(result: SendOneResult): string {
  switch (result.kind) {
    case "skipped":
      return `skipped_${result.reason}`;
    case "failed":
      return `failed_${result.reason}`;
    case "needs_review":
      return `needs_review_${result.reason}`;
    case "deferred":
      return `deferred_${result.reason}`;
    default:
      return result.kind;
  }
}

// =============================================================================
// 2. 毎朝の実行の最後に、送れたメールの分の DM をまとめて送る
// =============================================================================

export interface SlackDmBatchResult {
  skippedReason?:
    | "not_configured"
    | "mode_unreadable"
    | "mode_off"
    | "mode_count"
    | "mail_off"
    | "outside_window"
    | "not_raised"
    | "no_time";
  staleSending: number;
  processed: number;
  counts: Record<string, number>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function runSlackDmBatch(
  ctx: SlackDmContext,
  options: { timeBudgetMs: number; limit?: number },
): Promise<SlackDmBatchResult> {
  const startedAt = ctx.now();
  const counts: Record<string, number> = {};
  const result: SlackDmBatchResult = { staleSending: 0, processed: 0, counts };
  const sd = ctx.slackDm;
  if (!sd) return { ...result, skippedReason: "not_configured" };
  const remaining = () => options.timeBudgetMs - (ctx.now().getTime() - startedAt.getTime());

  // スイッチを最初に読む。読めない（マイグレーション前）・off なら、見回りも通知もせず静かに終える
  const mode = await tryReadSlackDmMode(sd.store);
  if (mode === null) return { ...result, skippedReason: "mode_unreadable" };
  if (mode === "off") return { ...result, skippedReason: "mode_off" };

  try {
    // 止まっていた sending を needs_review にする（自動で送り直さない）
    result.staleSending = await sd.store.markStaleSlackDms(new Date(startedAt.getTime() - SLACK_DM_STALE_SENDING_MS));
    if (result.staleSending > 0) counts.stale_sending = result.staleSending;

    if (mode === "count") return await summarize(ctx, { ...result, skippedReason: "mode_count" });
    const settings = await ctx.store.getSettings();
    if (!settings || settings.mode === "off") return await summarize(ctx, { ...result, skippedReason: "mail_off" });
    if (!isWithinSendWindow(startedAt, settings.sendHourStart, settings.sendHourEnd)) {
      return await summarize(ctx, { ...result, skippedReason: "outside_window" });
    }
    if (!sd.slack || !sd.teamId) {
      counts.not_configured = 1;
      return await summarize(ctx, { ...result, skippedReason: "not_configured" });
    }
    const raisedAt = await sd.store.getSlackDmRaisedAt();
    if (!raisedAt) {
      // スイッチを上げた時刻が分からない（トリガーを通らずに入った等）。どこから送ってよいか分からないので送らない
      counts.raised_at_missing = 1;
      return await summarize(ctx, { ...result, skippedReason: "not_raised" });
    }

    const campaigns = (await ctx.store.listStandingCampaigns(startedAt)).filter((c) => isSlackDmStandingKey(c.standingKey));
    if (campaigns.length === 0) return await summarize(ctx, result);
    const byId = new Map(campaigns.map((c) => [c.id, c]));
    const ids = campaigns.map((c) => c.id);

    // メールのスイッチ（全体・種類・文面ごと）。文面ごとに1回だけ読む
    const emailModes = new Map<string, MailMode>();
    for (const c of campaigns) {
      emailModes.set(c.id, weaker(weaker(settings.mode, await ctx.store.getKindMode(c.kind)), standingModeOf(c)));
    }

    /** 送る前に、まとめて外せる人を外す（つながり・本人のオン・オフ・スイッチ・文面の版）。外した人は通知に出さない */
    const filter = async (list: SlackDmCandidate[], tallyInto: Record<string, number> | null) => {
      const userIds = [...new Set(list.map((c) => c.userId))];
      const linked = userIds.length > 0 ? await sd.store.listSlackLinkedUserIds(userIds, sd.teamId) : new Set<string>();
      const disabled = linked.size > 0 ? await sd.store.listSlackDmDisabledUserIds([...linked]) : new Set<string>();
      const out: SlackDmCandidate[] = [];
      for (const c of list) {
        const campaign = byId.get(c.campaignId);
        let reason: string | null = null;
        if (!campaign) reason = "skipped_campaign";
        else if (!emailStillAllows(emailModes.get(c.campaignId) ?? "off", c.audience)) reason = "skipped_email_mode";
        else if (mode === "owner" && !settings.ownerUserIds.includes(c.userId)) reason = "skipped_not_owner";
        else if (campaign.contentVersion !== c.contentVersion || getCampaignBlockReason(campaign)) {
          reason = "skipped_content_changed";
        } else if (!linked.has(c.userId)) reason = "skipped_not_linked";
        else if (disabled.has(c.userId)) reason = "skipped_disabled";
        if (reason) {
          if (tallyInto) tally(tallyInto, reason);
        } else out.push(c);
      }
      return out;
    };

    // 前の日に送れずに終わった分（送らない。数だけ出す）。きのう1日分だけを見る
    const dayStart = jstDayStart(startedAt);
    const expiredFrom = new Date(Math.max(raisedAt.getTime(), dayStart.getTime() - DAY_MS));
    if (expiredFrom < dayStart) {
      const expired = await filter(await sd.store.listSlackDmCandidates(ids, { since: expiredFrom, until: dayStart }), null);
      if (expired.length > 0) counts.expired_previous_day = expired.length;
    }

    // 今日、スイッチを上げたあとに送れたメールの分だけ
    const since = new Date(Math.max(raisedAt.getTime(), dayStart.getTime()));
    const candidates = await filter(await sd.store.listSlackDmCandidates(ids, { since }), counts);
    if (candidates.length > 0 && remaining() < SLACK_DM_MIN_REMAINING_MS) {
      // 時間が足りない。記録を作っていないので、同じ日の次の実行でそのまま拾う
      counts.left_for_next_run = candidates.length;
      return await summarize(ctx, { ...result, skippedReason: "no_time" });
    }

    const limit = options.limit ?? SLACK_DM_BATCH_LIMIT;
    const texts = new Map<string, string>();
    for (const [i, candidate] of candidates.entries()) {
      if (result.processed >= limit || remaining() < SLACK_DM_MIN_REMAINING_MS) {
        counts.left_for_next_run = candidates.length - i;
        break;
      }
      const campaign = byId.get(candidate.campaignId)!;
      let text = texts.get(campaign.id);
      if (!text) {
        text = renderSlackDm(campaign, { siteUrl: ctx.siteUrl });
        texts.set(campaign.id, text);
      }
      let sent: SendOneResult;
      try {
        sent = await sendOne({
          slack: sd.slack,
          store: sd.store,
          teamId: sd.teamId,
          userId: candidate.userId,
          text,
          claim: (link) => sd.store.claimSlackDm({ ...candidate, ...link }, ctx.now()),
          finish: (id, patch) => sd.store.finishSlackDm(id, patch),
          now: ctx.now,
        });
      } catch (error) {
        // 記録の失敗など。sending の行が残っていれば次の回で needs_review になる（送り直さない）
        console.error("[member-mail] slack dm error:", error instanceof Error ? error.message : "unknown");
        tally(counts, "error");
        result.processed += 1;
        continue;
      }
      tally(counts, resultKey(sent));
      // 送らずに外れた人（Slack のアカウントの状態など）は上限に数えない（後ろの人が締め出されないように）
      if (sent.kind !== "skipped") {
        result.processed += 1;
        logSlack(sent.kind, { deliveryId: candidate.deliveryId });
      }
      if (sent.kind === "rate_limited") {
        // 速さの上限。この回の DM はここで止め、残りは次の実行で
        counts.stopped_ratelimited = 1;
        const left = candidates.length - i - 1;
        if (left > 0) counts.left_for_next_run = left;
        break;
      }
    }
  } catch (error) {
    console.error("[member-mail] slack dm batch error:", error instanceof Error ? error.message : "unknown");
    tally(counts, "error");
  }
  return summarize(ctx, result);
}

/** 通知を出すほどではない数（送らずに外れた人）。これだけの実行では通知しない */
function isQuietKey(key: string): boolean {
  return key.startsWith("skipped_") && !key.startsWith("skipped_users_info_");
}

/** 確認が要る数 */
function isProblemKey(key: string): boolean {
  return /^(failed|needs_review|stale_sending|error|stopped|not_configured|deferred|skipped_users_info_|left_for_next_run|expired|raised_at_missing)/.test(
    key,
  );
}

/** 1回の実行の結果を、運用 Slack に1つだけ出す（送った・確認が要るものがあったときだけ。外れただけの実行では出さない） */
async function summarize(ctx: SlackDmContext, result: SlackDmBatchResult): Promise<SlackDmBatchResult> {
  const keys = Object.keys(result.counts);
  if (keys.every(isQuietKey)) return result;
  const problems = keys.some(isProblemKey);
  await ctx.notifyOps({
    title: problems ? "Slack の DM の結果（確認が必要なものがあります）" : "Slack の DM の結果",
    counts: result.counts,
    note: problems
      ? "メールの送信には影響していません。member_mail_slack_dms を確認してください（needs_review は自動では送り直しません。left_for_next_run は同じ日の次の実行で送ります。expired_previous_day は前の日に送れずに終わった数です）。"
      : undefined,
  });
  return result;
}

// =============================================================================
// 3. オーナーだけに確認用の DM を送る（手動の実行からだけ。スイッチ・会員の行には関係しない）
// =============================================================================

export type SlackPreviewResult =
  | { outcome: "not_configured" | "campaign_missing" | "not_slack_dm_campaign" | "no_owner" }
  | { outcome: "blocked"; reason: string }
  | { outcome: "done"; counts: Record<string, number> };

/**
 * campaignId の文面を、owner_user_ids の人にだけ Slack の DM で送る（同じ版・同じ人には1回だけ）。
 * 本人のオン・オフ・つながり・アカウントの状態は会員と同じように見る（オフにすると届かないことを確かめられる）。
 * 文面の承認は要らない（承認の前に見た目を確かめるため）。それ以外の送れない理由（空・仮の文字・https 以外）では送らない。
 */
export async function sendSlackOwnerPreview(ctx: SlackDmContext, campaignId: string): Promise<SlackPreviewResult> {
  const sd = ctx.slackDm;
  if (!sd || !sd.slack || !sd.teamId) return { outcome: "not_configured" };
  const campaign = await ctx.store.getCampaign(campaignId);
  if (!campaign) return { outcome: "campaign_missing" };
  if (!isSlackDmStandingKey(campaign.standingKey)) return { outcome: "not_slack_dm_campaign" };
  const block = getCampaignBlockReason({ ...campaign, approvedVersion: campaign.contentVersion });
  if (block) return { outcome: "blocked", reason: block };
  const settings = await ctx.store.getSettings();
  const owners = settings?.ownerUserIds ?? [];
  if (owners.length === 0) return { outcome: "no_owner" };

  const text = renderSlackDm(campaign, { siteUrl: ctx.siteUrl });
  const counts: Record<string, number> = {};
  for (const userId of owners) {
    let sent: SendOneResult;
    try {
      sent = await sendOne({
        slack: sd.slack,
        store: sd.store,
        teamId: sd.teamId,
        userId,
        text,
        claim: (link) =>
          sd.store.claimSlackPreview({ campaignId, userId, contentVersion: campaign.contentVersion, ...link }, ctx.now()),
        finish: (id, patch) => sd.store.finishSlackPreview(id, patch),
        now: ctx.now,
      });
    } catch (error) {
      console.error("[member-mail] slack preview error:", error instanceof Error ? error.message : "unknown");
      tally(counts, "error");
      continue;
    }
    tally(counts, resultKey(sent));
    if (sent.kind === "rate_limited") break;
  }
  logSlack("preview", { campaignId, counts });
  return { outcome: "done", counts };
}

// =============================================================================
// 4. 人数と画面
// =============================================================================

/**
 * 運用 Slack の人数のお知らせに足す Slack の行（スイッチが off・DM で送らない文面なら何も足さない）。
 *   slack_candidates … メールの対象のうち、Slack とつながっている人
 *   slack_will_send  … そのうち DM を送る見込みの人（本人がオン。owner ならオーナーだけ。count は all にしたときの人数）
 * 例外は投げない（読めなければ slack_unavailable: 1 だけ）。
 */
export async function slackCountLines(
  ctx: Pick<SlackDmContext, "slackDm">,
  standingKey: unknown,
  userIds: readonly string[],
  ownerUserIds: readonly string[],
): Promise<Record<string, number>> {
  const sd = ctx.slackDm;
  if (!sd || !isSlackDmStandingKey(standingKey)) return {};
  const mode = await readSlackDmMode(sd.store);
  if (mode === "off") return {};
  try {
    const linked = await sd.store.listSlackLinkedUserIds(userIds, sd.teamId);
    const disabled = await sd.store.listSlackDmDisabledUserIds([...linked]);
    const eligible = [...linked].filter((u) => !disabled.has(u));
    const willSend = mode === "owner" ? eligible.filter((u) => ownerUserIds.includes(u)) : eligible;
    const lines: Record<string, number> = { slack_candidates: linked.size, slack_will_send: willSend.length };
    if ((mode === "owner" || mode === "all") && (!sd.slack || !sd.teamId)) lines.slack_not_configured = 1;
    return lines;
  } catch (error) {
    console.error("[member-mail] slack count failed:", error instanceof Error ? error.message : "unknown");
    return { slack_unavailable: 1 };
  }
}

/**
 * 通知設定の画面に「Slack の DM」のスイッチを出すか（#327-H）。
 * BONO のワークスペースでつながっている人で、次のどれかに当てはまる人に出す（スイッチの状態にはよらない）:
 *   - 一度でも切り替えた（設定の行がある）
 *   - DM（会員の DM・オーナー確認の DM）を受け取ったことがある
 *   - スイッチが all（これから届きうる）
 * 出さないときは null、出すときは今のオン・オフ。読めなければ null（画面は壊さない）。
 */
export async function loadSlackDmSetting(
  store: SlackDmStore,
  teamId: string | null,
  userId: string,
): Promise<boolean | null> {
  if (!teamId) return null;
  // 先にスイッチを読む。読めない（マイグレーション前）なら、エラーを出さずにカードを出さない
  const mode = await tryReadSlackDmMode(store);
  if (mode === null) return null;
  try {
    const link = await store.getSlackLink(userId);
    if (!link || link.teamId !== teamId) return null;
    const pref = await store.getSlackDmPreference(userId);
    if (pref.hasRow) return pref.enabled;
    if (await store.hasReceivedSlackDm(userId)) return pref.enabled;
    if (mode === "all") return pref.enabled;
    return null;
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      console.error("[member-mail] slack dm setting read failed:", error instanceof Error ? error.message : "unknown");
    }
    return null;
  }
}
