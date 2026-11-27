/**
 * 常設の文面（はじめの案内など）を、メールに加えて Slack の DM でも送る（#327-H）。
 *
 * 送る条件（すべて満たすときだけ。1つでも欠けたら DM は送らず、メールには何も影響させない）:
 *   1. 常設の文面（standing_key あり）。週1回のメルマガ（weekly）などは送らない
 *   2. その人へのメールを送れた（メールのスイッチ・承認・配信停止・対象の条件をすべて通って Resend が受け付けた）
 *   3. Slack の DM のスイッチ（member_mail_settings.slack_dm_mode）が owner なら owner_user_ids の人、all なら全員
 *      （off / count は送らない。count は運用 Slack に人数を出すだけ）
 *   4. slack_member_links でつながっていて、team_id が BONO のワークスペース（SLACK_WELCOME_TEAM_ID）
 *   5. 本人の「Slack の DM で受け取る」がオン（行が無ければオン）
 *
 * 二重に送らない: 送る前に member_mail_slack_dms に status=sending の行を入れる（delivery_id に一意）。
 * 入らなければ（もうある）送らない。送れたか分からないときは needs_review にして自動で送り直さない（#238 と同じ考え方）。
 *
 * ログ・記録・通知に出すのは ID とエラーコードだけ（本文・メールアドレス・名前は出さない）。
 *
 * 出典:
 * - https://docs.slack.dev/reference/methods/conversations.open/
 * - https://docs.slack.dev/reference/methods/chat.postMessage/
 * - https://docs.slack.dev/apis/web-api/rate-limits/
 */
import type { NotifyMailOps } from "./ops-alert";
import { renderSlackDm } from "./slack-mrkdwn";
import type { Audience, Campaign, DeliveryRow, MailMode, MailStore } from "./types";
import type { SlackCallResult } from "@/lib/slack-welcome/slack-api";

export interface SlackDmLink {
  teamId: string;
  slackUserId: string;
}

export type SlackDmStatus = "sending" | "sent" | "failed" | "needs_review";

export interface NewSlackDm {
  deliveryId: string;
  campaignId: string;
  userId: string;
  audience: Audience;
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
  getSlackLink(userId: string): Promise<SlackDmLink | null>;
  /** userIds のうち、つながっている人（teamId を渡すとそのワークスペースだけ） */
  listSlackLinkedUserIds(userIds: readonly string[], teamId: string | null): Promise<Set<string>>;
  /** 本人の「Slack の DM で受け取る」（行が無ければ true） */
  isSlackDmEnabled(userId: string): Promise<boolean>;
  /** userIds のうち、オフにしている人 */
  listSlackDmDisabledUserIds(userIds: readonly string[]): Promise<Set<string>>;
  setSlackDmEnabled(userId: string, enabled: boolean, at: Date): Promise<void>;
  /** 送る前に入れる。入れられたら行ID、もうあれば null */
  insertSlackDm(row: NewSlackDm, at: Date): Promise<string | null>;
  finishSlackDm(id: string, patch: SlackDmPatch): Promise<void>;
}

/** #238 の Slack クライアントのうち、DM を送る2つだけ */
export interface SlackDmClient {
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
  store: Pick<MailStore, "getSettings">;
  slackDm?: SlackDmDeps | null;
  notifyOps: NotifyMailOps;
  now: () => Date;
  siteUrl: string;
}

export type SlackDmOutcome =
  | "not_standing"
  | "not_configured"
  | "mode_off"
  | "mode_count"
  | "not_owner"
  | "not_linked"
  | "other_team"
  | "disabled"
  | "duplicate"
  | "sent"
  | "failed"
  | "needs_review"
  | "error";

/** 投稿で返ると「投稿されたか分からない」Slack 側の内部エラー（#238 と同じ） */
const AMBIGUOUS_POST_ERRORS = new Set(["internal_error", "fatal_error", "service_unavailable", "request_timeout"]);

function logSlack(event: string, extra?: Record<string, unknown>) {
  // 個人情報は出さない（行ID・理由コードだけ）
  console.log(`[member-mail] slack_dm_${event}`, extra ?? {});
}

function codeOf(result: Exclude<SlackCallResult<unknown>, { kind: "ok" }>): string {
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

/** 投稿の失敗が「送られていないことが確実」か「分からない」か */
function postFailureStatus(result: Exclude<SlackCallResult<unknown>, { kind: "ok" }>): "failed" | "needs_review" {
  switch (result.kind) {
    case "slack_error":
      return AMBIGUOUS_POST_ERRORS.has(result.error) ? "needs_review" : "failed";
    case "rate_limited":
      // 429 は処理されていない（https://docs.slack.dev/apis/web-api/rate-limits/）
      return "failed";
    default:
      // 5xx・タイムアウト・応答不明は、投稿されたか分からない
      return "needs_review";
  }
}

/** スイッチを読む。読めなければ（マイグレーション前など）off 扱い */
export async function readSlackDmMode(store: SlackDmStore): Promise<MailMode> {
  try {
    return await store.getSlackDmMode();
  } catch (error) {
    console.error("[member-mail] slack dm mode read failed:", error instanceof Error ? error.message : "unknown");
    return "off";
  }
}

/**
 * メールを送れた直後に呼ぶ。例外は投げない（メールの結果を変えない）。
 * row はメールの送信記録、campaign はその行の文面。
 */
export async function sendStandingSlackDm(
  ctx: SlackDmContext,
  row: DeliveryRow,
  campaign: Campaign,
): Promise<SlackDmOutcome> {
  if (!campaign.standingKey) return "not_standing";
  const sd = ctx.slackDm;
  if (!sd) return "not_configured";
  try {
    const mode = await readSlackDmMode(sd.store);
    if (mode === "off") return "mode_off";
    if (mode === "count") return "mode_count";
    if (mode === "owner") {
      const settings = await ctx.store.getSettings();
      if (!settings || !settings.ownerUserIds.includes(row.userId)) return "not_owner";
    }
    if (!sd.slack || !sd.teamId) {
      logSlack("not_configured", { deliveryId: row.id });
      return "not_configured";
    }
    const link = await sd.store.getSlackLink(row.userId);
    if (!link) return "not_linked";
    if (link.teamId !== sd.teamId) return "other_team";
    if (!(await sd.store.isSlackDmEnabled(row.userId))) return "disabled";

    const dmId = await sd.store.insertSlackDm(
      {
        deliveryId: row.id,
        campaignId: campaign.id,
        userId: row.userId,
        audience: row.audience,
        contentVersion: campaign.contentVersion,
        teamId: link.teamId,
        slackUserId: link.slackUserId,
      },
      ctx.now(),
    );
    if (!dmId) {
      logSlack("duplicate", { deliveryId: row.id });
      return "duplicate";
    }

    const text = renderSlackDm(campaign, { siteUrl: ctx.siteUrl });
    const opened = await sd.slack.openDm(link.slackUserId);
    if (opened.kind !== "ok") {
      // DM を開けなかった＝投稿していない（送られていないことが確実）
      return await settle(ctx, sd, dmId, row.id, { status: "failed", reason: codeOf(opened) });
    }
    const posted = await sd.slack.postMessage(opened.data.channelId, text);
    if (posted.kind === "ok") {
      await sd.store.finishSlackDm(dmId, {
        status: "sent",
        channelId: posted.data.channelId,
        ts: posted.data.ts,
        sentAt: ctx.now(),
        reason: null,
      });
      logSlack("sent", { deliveryId: row.id, dmId });
      return "sent";
    }
    return await settle(ctx, sd, dmId, row.id, {
      status: postFailureStatus(posted),
      reason: codeOf(posted),
      channelId: opened.data.channelId,
    });
  } catch (error) {
    // 記録の失敗など。sending の行が残っていれば送り直さない（二重送信より送らない側に倒す）
    console.error("[member-mail] slack dm error:", error instanceof Error ? error.message : "unknown");
    return "error";
  }
}

async function settle(
  ctx: SlackDmContext,
  sd: SlackDmDeps,
  dmId: string,
  deliveryId: string,
  patch: SlackDmPatch & { status: "failed" | "needs_review" },
): Promise<SlackDmOutcome> {
  await sd.store.finishSlackDm(dmId, patch);
  logSlack(patch.status, { deliveryId, dmId, reason: patch.reason });
  await ctx.notifyOps({
    title: patch.status === "needs_review" ? "Slack の DM が送れたか分かりません" : "Slack の DM を送れませんでした",
    counts: { [patch.reason ?? "unknown"]: 1 },
    note: "メールは送れています。member_mail_slack_dms を確認してください（自動では送り直しません）。",
  });
  return patch.status;
}

/**
 * 運用 Slack の人数のお知らせに足す Slack の行（スイッチが off なら何も足さない）。
 *   slack_candidates … メールの対象のうち、Slack とつながっている人
 *   slack_will_send  … そのうち DM を送る人（本人がオン。owner ならオーナーだけ。count は all にしたときの人数）
 * 例外は投げない（読めなければ slack_unavailable: 1 だけ）。
 */
export async function slackCountLines(
  ctx: Pick<SlackDmContext, "slackDm">,
  userIds: readonly string[],
  ownerUserIds: readonly string[],
): Promise<Record<string, number>> {
  const sd = ctx.slackDm;
  if (!sd) return {};
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
 * スイッチが owner ならオーナーだけ、all なら全員。Slack とつながっていない人には出さない。
 * 出さないときは null、出すときは今のオン・オフ。読めなければ null（画面は壊さない）。
 */
export async function loadSlackDmSetting(
  mailStore: Pick<MailStore, "getSettings">,
  store: SlackDmStore,
  userId: string,
): Promise<boolean | null> {
  try {
    const mode = await readSlackDmMode(store);
    if (mode === "off" || mode === "count") return null;
    if (mode === "owner") {
      const settings = await mailStore.getSettings();
      if (!settings || !settings.ownerUserIds.includes(userId)) return null;
    }
    if (!(await store.getSlackLink(userId))) return null;
    return await store.isSlackDmEnabled(userId);
  } catch (error) {
    console.error("[member-mail] slack dm setting read failed:", error instanceof Error ? error.message : "unknown");
    return null;
  }
}
