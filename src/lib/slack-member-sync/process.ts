import "server-only";

/**
 * Slack 定期整理（#263）の日次処理。/api/cron/slack-member-sync から1日1回呼ばれる。
 *
 * 流れ:
 * 1. 設定を読む（off なら何もしない）→ 実行ロックを取る（同時に2つ走らない）
 * 2. users.list を全ページ取得（失敗したら何も書かずに止める。メールが1件も取れないときも止める）
 * 3. メールのハッシュとつながりで BONO ユーザーと課金を引く（SQL 関数。全員のメールは読み出さない）
 * 4. 課金中のアカウントとメールが一致した人は自動でつなぐ（linked_via=email）
 * 5. 一人ずつ判定（classify.ts）し、変わった行だけ保存する
 *    解約予約・解約済みの人は DM なしで外す予定にする（解約済みは今日、解約予約は終わる日の翌日。2026-10-29）
 * 6. モードに応じて つなぐお願いDM を送る
 *    - dry_run: DM を送らず、判定（dry_run_result）だけ記録する
 *    - test: test_user_ids の人だけに送る（ほかの人は dry_run と同じ記録）
 *    - live: 全員に送る
 * 7. 外す日が来た人・確認が必要な人がいれば、オーナー（カイクン）に自分宛てDMで報告する（test / live・1日1回）
 *
 * 安全策（#238 と同じ考え方）:
 * - 本文が未承認なら live でも送らない（本文未承認の印 needs_review=message_not_approved を付けて数える）
 * - 送る直前に needs_review=true / review_reason=sending:<種類> を条件付き UPDATE で永続化してから投稿する
 *   → 投稿の結果が分からない（タイムアウト・5xx・内部エラー）ときはそのまま残し、自動で送り直さない
 * - 送信日時（*_dm_at）が入っている人には二度と送らない
 * - 1回の実行で送る DM の数と時間に上限を置く（初回の大掃除は数日に分けて送る。期限は各自のDMの日から数える）
 * - 返す結果は件数だけ（名前・メール・ID は出さない）
 */
import { classifyMember, excludedReasonOf, isDueForRemoval, SOFT_REVIEW_REASON, type ClassifyResult } from "./classify";
import { formatJpDate, toJstDate } from "./dates";
import { renderSyncMessage, type SyncMessage } from "./messages/common";
import type { NotifyOps } from "./ops-alert";
import type { SyncSlackClient } from "./slack-api";
import { hashToken, LINK_REQUEST_TOKEN_EXTRA_DAYS, linkUrl } from "./tokens";
import type {
  Classification,
  DmType,
  MemberMatch,
  SlackMemberSummary,
  SubscriptionSummary,
  SyncMode,
  SyncSettings,
  SyncState,
  SyncStore,
} from "./types";
import type { SlackCallResult } from "@/lib/slack-welcome/slack-api";

export const RUN_LOCK_MS = 10 * 60 * 1000;
/** 1回の実行で送る DM の上限（conversations.open は Tier 3 ≒ 50回/分） */
export const DEFAULT_MAX_DMS = 100;
/** DM を送る時間の上限（maxDuration=300秒に収める） */
export const DEFAULT_DM_BUDGET_MS = 180_000;
/** users.list の取得にかけてよい時間（429 の待ちを含む） */
export const DEFAULT_LIST_BUDGET_MS = 60_000;
/** DM と DM の間隔（chat.postMessage は1秒に1通程度まで） */
export const DEFAULT_DM_INTERVAL_MS = 1_200;
/** 1回の 429 で待ってよい最長 */
const MAX_SINGLE_WAIT_MS = 30_000;
/** オーナー報告に名前を並べる上限（超えた分は人数だけ） */
const REPORT_LIST_LIMIT = 60;

/** Slack が処理して断ったことが確実で、トークン/権限の問題（このあと送っても直らない） */
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
const AMBIGUOUS_POST_ERRORS = new Set(["internal_error", "fatal_error", "service_unavailable", "request_timeout"]);

export interface SyncMessages {
  linkRequest: SyncMessage;
  ownerReport: SyncMessage;
}

export interface SyncDeps {
  store: SyncStore;
  slack: SyncSlackClient;
  /** SLACK_WELCOME_TEAM_ID */
  teamId: string;
  messages: SyncMessages;
  notifyOps: NotifyOps;
  /** 使い捨てリンク・登録ページの URL の元（https://www.bo-no.design） */
  siteUrl: string;
  now: () => Date;
  sleep: (ms: number) => Promise<void>;
  newToken: () => string;
  limits?: Partial<{ maxDms: number; dmBudgetMs: number; listBudgetMs: number; dmIntervalMs: number }>;
}

export interface SyncRunResult {
  mode: SyncMode | "unset";
  skipped?: "off" | "locked";
  error?: string;
  members: number;
  classifications: Partial<Record<Classification, number>>;
  reasons: Record<string, number>;
  statesWritten: number;
  linksCreated: number;
  dm: {
    sent: Partial<Record<DmType, number>>;
    blocked: number;
    needsReview: number;
    failed: number;
    deferred: number;
    aborted: string | null;
  };
  due: number;
  needsReview: number;
  ownerReport: string;
}

function emptyResult(mode: SyncRunResult["mode"]): SyncRunResult {
  return {
    mode,
    members: 0,
    classifications: {},
    reasons: {},
    statesWritten: 0,
    linksCreated: 0,
    dm: { sent: {}, blocked: 0, needsReview: 0, failed: 0, deferred: 0, aborted: null },
    due: 0,
    needsReview: 0,
    ownerReport: "none",
  };
}

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

function log(event: string, extra?: Record<string, unknown>) {
  // 個人情報は出さない（件数とエラーコードだけ）
  console.log(`[slack-member-sync] ${event}`, extra ?? {});
}

/** 同じ内容か（保存し直す必要があるか） */
export function sameState(a: SyncState, b: SyncState): boolean {
  for (const key of Object.keys(a) as (keyof SyncState)[]) {
    const x = a[key];
    const y = b[key];
    if (x instanceof Date || y instanceof Date) {
      if ((x as Date | null)?.getTime() !== (y as Date | null)?.getTime()) return false;
    } else if (x !== y) {
      return false;
    }
  }
  return true;
}

/** 課金中（live かつ stripe_subscription_id・is_active）か、手で残すと決めた BONO ユーザーか */
export function isPaidOrKept(sub: SubscriptionSummary | null | undefined, keepUserIds: readonly string[]): boolean {
  if (!sub) return false;
  return (sub.hasPaidRecord && sub.isActive) || keepUserIds.includes(sub.userId);
}

/** 同じメールの BONO アカウントが複数あるときは、課金中（手で残す人を含む）> 課金の記録あり > それ以外 の順で選ぶ */
function pickBest(subs: SubscriptionSummary[] | undefined, keepUserIds: readonly string[]): SubscriptionSummary | null {
  if (!subs || subs.length === 0) return null;
  const score = (s: SubscriptionSummary) => (isPaidOrKept(s, keepUserIds) ? 2 : s.hasPaidRecord ? 1 : 0);
  return [...subs].sort((a, b) => score(b) - score(a))[0];
}

/** users.list を全ページ取る。失敗したらエラーコードを返す（途中までの一覧で判定しない） */
export async function listAllMembers(
  deps: SyncDeps,
): Promise<{ ok: true; members: SlackMemberSummary[] } | { ok: false; code: string }> {
  const budgetMs = deps.limits?.listBudgetMs ?? DEFAULT_LIST_BUDGET_MS;
  const startedAt = deps.now().getTime();
  const members: SlackMemberSummary[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 100; page += 1) {
    let result = await deps.slack.usersListPage(cursor);
    while (result.kind === "rate_limited") {
      const waitMs = Math.min(result.retryAfterSec * 1000, MAX_SINGLE_WAIT_MS);
      if (deps.now().getTime() - startedAt + waitMs > budgetMs) return { ok: false, code: "users_list_ratelimited" };
      await deps.sleep(waitMs);
      result = await deps.slack.usersListPage(cursor);
    }
    if (result.kind !== "ok") return { ok: false, code: `users_list_${errorCodeOf(result)}` };
    members.push(...result.data.members);
    cursor = result.data.nextCursor;
    if (!cursor) return { ok: true, members };
  }
  return { ok: false, code: "users_list_too_many_pages" };
}

interface DmPlan {
  member: SlackMemberSummary;
  result: ClassifyResult;
  dm: DmType;
}

function dryRunText(r: ClassifyResult, blockReason: string | null, prefix = "", suffix = ""): string {
  const next = r.next!;
  let text: string;
  if (next.classification === "remove_scheduled" && (next.reason === "canceled" || next.reason === "cancel_reserved")) {
    // 解約の人には DM を送らない（外す日だけ決まる）
    text = `would_remove:${next.reason}:remove_after=${next.removeAfter}`;
  } else if (r.dm === "link_request") {
    text = `${blockReason ? `would_block:${blockReason}` : "would_send"}:link_request:deadline=${r.linkDeadlineIfSentToday}`;
  } else {
    text = `${next.classification}${next.reason ? `:${next.reason}` : ""}${next.removeAfter ? `:remove_after=${next.removeAfter}` : ""}`;
  }
  return `${prefix}${text}${suffix}`;
}

/** 送る本文を作る（未承認などで送れないときは reason）。DM はつなぐお願いだけ */
function renderDm(deps: SyncDeps, plan: DmPlan, rawToken: string | null) {
  return renderSyncMessage(deps.messages.linkRequest, {
    link: rawToken ? linkUrl(deps.siteUrl, rawToken) : "",
    deadline: formatJpDate(plan.result.linkDeadlineIfSentToday ?? ""),
    signup_url: `${deps.siteUrl}/subscription`,
  });
}

type SendOutcome = "sent" | "not_claimed" | "needs_review" | "failed" | "deferred" | "rate_limited" | "aborted";

interface DmCtx {
  deps: SyncDeps;
  settings: SyncSettings;
  states: Map<string, SyncState>;
  result: SyncRunResult;
  deadline: number;
}

async function patch(ctx: DmCtx, slackUserId: string, values: Partial<SyncState>) {
  await ctx.deps.store.patchState(ctx.deps.teamId, slackUserId, values);
  const current = ctx.states.get(slackUserId);
  if (current) ctx.states.set(slackUserId, { ...current, ...values });
}

/** 1人に1通送る。結果は state に記録する */
async function sendOne(ctx: DmCtx, plan: DmPlan): Promise<{ outcome: SendOutcome; retryAfterSec?: number; code?: string }> {
  const { deps } = ctx;
  const id = plan.member.id;
  const now = deps.now();

  const rawToken = deps.newToken();
  const rendered = renderDm(deps, plan, rawToken);
  if (!rendered.ok) return { outcome: "aborted", code: rendered.reason };

  // 1) DM を開く（投稿前なので、失敗しても二重送信にはならない）
  const opened = await deps.slack.openDm(id);
  if (opened.kind === "rate_limited") return { outcome: "rate_limited", retryAfterSec: opened.retryAfterSec };
  if (opened.kind !== "ok") {
    const code = errorCodeOf(opened);
    if (opened.kind === "slack_error" && PERMISSION_ERRORS.has(opened.error)) return { outcome: "aborted", code };
    if (opened.kind === "slack_error") {
      // 相手に DM できない（user_not_found / cannot_dm_bot など）: オーナーに確認してもらう
      await patch(ctx, id, { needsReview: true, reviewReason: `dm_failed:${code}` });
      return { outcome: "failed", code };
    }
    // タイムアウト・5xx など: 今回は見送り、次の実行でまた試す
    return { outcome: "deferred", code };
  }

  // 2) 使い捨てリンクのハッシュを保存（DM が送れなければ使われずに期限切れになるだけ）
  await deps.store.insertLinkToken({
    tokenHash: hashToken(rawToken),
    teamId: deps.teamId,
    slackUserId: id,
    purpose: "link_request",
    expiresAt: new Date(now.getTime() + (ctx.settings.linkGraceDays + LINK_REQUEST_TOKEN_EXTRA_DAYS) * 86_400_000),
    requestedByUserId: null,
  });

  // 3) 投稿直前の確保（sending の印を永続化）。確保できなければ送らない
  const claimed = await deps.store.claimDm(deps.teamId, id, plan.dm);
  if (!claimed) {
    // 送るはずなのに確保できない（送信済みの記録や確認待ちの印が残っている）。黙って毎日見送らないよう、
    // 印がまだ無ければ確認待ちにしてオーナー報告に出す
    const current = ctx.states.get(id);
    if (current && !current.needsReview) {
      await patch(ctx, id, { needsReview: true, reviewReason: `not_claimed:${plan.dm}` });
    }
    return { outcome: "not_claimed" };
  }
  const sendingMark = { needsReview: true, reviewReason: `sending:${plan.dm}` };
  const current = ctx.states.get(id);
  if (current) ctx.states.set(id, { ...current, ...sendingMark });

  // 4) 投稿
  const posted = await deps.slack.postMessage(opened.data.channelId, rendered.text);
  if (posted.kind === "ok") {
    const sentAt = deps.now();
    const values: Partial<SyncState> = {
      linkRequestDmAt: sentAt,
      linkRequestVersion: rendered.version,
      linkDeadline: plan.result.linkDeadlineIfSentToday,
      needsReview: false,
      reviewReason: null,
    };
    // ここで記録に失敗しても sending の印が残る（自動では送り直さない）
    await patch(ctx, id, values);
    return { outcome: "sent" };
  }
  if (posted.kind === "rate_limited") {
    // 429 は投稿前に断られている。印を外して、あとで送れるようにする
    await patch(ctx, id, { needsReview: false, reviewReason: null });
    return { outcome: "rate_limited", retryAfterSec: posted.retryAfterSec };
  }
  const code = errorCodeOf(posted);
  if (posted.kind === "slack_error" && !AMBIGUOUS_POST_ERRORS.has(posted.error)) {
    // Slack が処理して断った（投稿されていない）。自動では送り直さない
    await patch(ctx, id, { needsReview: true, reviewReason: `dm_failed:${code}` });
    if (PERMISSION_ERRORS.has(posted.error)) return { outcome: "aborted", code };
    return { outcome: "failed", code };
  }
  // タイムアウト・5xx・通信エラー・内部エラー → 送れたか分からない
  await patch(ctx, id, { needsReview: true, reviewReason: `send_unknown:${code}` });
  return { outcome: "needs_review", code };
}

/** モードと送り先を毎回確かめる（直前に off にされたら送らない） */
function canSendTo(settings: SyncSettings | null, slackUserId: string): boolean {
  if (!settings) return false;
  if (settings.mode === "live") return true;
  return settings.mode === "test" && settings.testUserIds.includes(slackUserId);
}

async function sendDms(ctx: DmCtx, plans: DmPlan[]): Promise<void> {
  const { deps, result } = ctx;
  const maxDms = deps.limits?.maxDms ?? DEFAULT_MAX_DMS;
  const interval = deps.limits?.dmIntervalMs ?? DEFAULT_DM_INTERVAL_MS;
  let attempted = 0;

  for (let i = 0; i < plans.length; i += 1) {
    const plan = plans[i];
    if (attempted >= maxDms || deps.now().getTime() > ctx.deadline) {
      result.dm.deferred += plans.length - i;
      log("dm_limit_reached", { remaining: plans.length - i });
      return;
    }
    const latest = await deps.store.getSettings();
    if (!canSendTo(latest, plan.member.id)) {
      result.dm.deferred += plans.length - i;
      log("mode_changed");
      return;
    }

    if (attempted > 0) await deps.sleep(interval);
    attempted += 1;
    let sent = await sendOne(ctx, plan);
    // 429 は待てるなら1回だけ待って送り直す（投稿前に断られているので二重にならない）
    if (sent.outcome === "rate_limited") {
      const waitMs = Math.min((sent.retryAfterSec ?? 1) * 1000, MAX_SINGLE_WAIT_MS);
      if (deps.now().getTime() + waitMs > ctx.deadline) {
        result.dm.deferred += plans.length - i;
        return;
      }
      await deps.sleep(waitMs);
      sent = await sendOne(ctx, plan);
      if (sent.outcome === "rate_limited") {
        result.dm.deferred += plans.length - i;
        return;
      }
    }

    switch (sent.outcome) {
      case "sent":
        result.dm.sent[plan.dm] = (result.dm.sent[plan.dm] ?? 0) + 1;
        break;
      case "needs_review":
        result.dm.needsReview += 1;
        break;
      case "failed":
        result.dm.failed += 1;
        break;
      case "not_claimed":
        result.dm.needsReview += 1;
        break;
      case "deferred":
        result.dm.deferred += 1;
        break;
      case "aborted":
        // トークン・権限の問題。残りも送れないので止める
        result.dm.aborted = sent.code ?? "unknown";
        result.dm.deferred += plans.length - i - 1;
        return;
    }
  }
}

/** オーナー報告の理由（解約予約の人も、外す日＝終わる日の翌日に「解約」として出る） */
const REASON_LABEL: Record<string, string> = {
  canceled: "解約",
  cancel_reserved: "解約",
  link_expired: "未接続",
};

function reviewLabel(reason: string | null): string {
  if (!reason) return "確認が必要";
  if (reason.startsWith("sending:") || reason.startsWith("send_unknown:")) return "DMが届いたか不明";
  if (reason.startsWith("dm_failed:")) return `DMを送れなかった（${reason.slice("dm_failed:".length)}）`;
  if (reason.startsWith("not_claimed:")) return "DMを送れる状態になっていない（記録の確認が必要）";
  return reason;
}

/** Slack のメンション。名前は Slack が表示する（名前を扱わない・保存しない） */
function mention(slackUserId: string): string {
  return `<@${slackUserId}>`;
}

function listLines(lines: string[]): string {
  if (lines.length <= REPORT_LIST_LIMIT) return lines.join("\n");
  return `${lines.slice(0, REPORT_LIST_LIMIT).join("\n")}\n…ほか ${lines.length - REPORT_LIST_LIMIT}人`;
}

/**
 * オーナー報告の差し込み値を作る。報告する人がいなければ null。純粋関数。
 * 人は <@U…> のメンションで書く（名前は Slack が表示する）。members は削除済みかの確認に使う。
 */
export function buildOwnerReport(
  states: SyncState[],
  members: Map<string, SlackMemberSummary>,
  today: string,
  adminUrl: string,
): { vars: Record<string, string>; due: number; review: number } | null {
  const due = states.filter((s) => {
    const m = members.get(s.slackUserId);
    return isDueForRemoval(s, today) && m !== undefined && !m.deleted;
  });
  const review = states.filter(
    (s) => s.needsReview && s.reviewReason !== SOFT_REVIEW_REASON && s.classification !== "resolved",
  );
  if (due.length === 0 && review.length === 0) return null;

  const byLabel = new Map<string, number>();
  for (const s of due) {
    const label = REASON_LABEL[s.reason ?? ""] ?? "その他";
    byLabel.set(label, (byLabel.get(label) ?? 0) + 1);
  }
  const breakdown = [...byLabel.entries()].map(([label, n]) => `${label}${n}`).join("・");
  const summary = `今日Slackから外す人：${due.length}人${breakdown ? `（${breakdown}）` : ""}`;

  const dueLines = due
    .sort((a, b) => (a.removeAfter ?? "").localeCompare(b.removeAfter ?? ""))
    .map(
      (s) =>
        `• ${mention(s.slackUserId)} ${REASON_LABEL[s.reason ?? ""] ?? "その他"}（外す日 ${formatJpDate(s.removeAfter ?? "")}）`,
    );
  const reviewLines = review.map(
    (s) => `• ${mention(s.slackUserId)} ${reviewLabel(s.reviewReason)}`,
  );

  return {
    vars: {
      summary,
      due_list: dueLines.length > 0 ? listLines(dueLines) : "（今日外す人はいません）",
      review: reviewLines.length > 0 ? `\n*確認が必要な人：${review.length}人*\n${listLines(reviewLines)}\n` : "",
      admin_url: adminUrl,
    },
    due: due.length,
    review: review.length,
  };
}

async function sendOwnerReport(
  deps: SyncDeps,
  settings: SyncSettings,
  states: SyncState[],
  members: Map<string, SlackMemberSummary>,
  today: string,
): Promise<string> {
  if (settings.mode !== "test" && settings.mode !== "live") return "skipped_mode";
  // 報告する人がいるかを先に数える（auth.test を無駄に呼ばない）
  if (!buildOwnerReport(states, members, today, "https://example.invalid/")) return "none";
  if (settings.ownerReportSentOn === today) return "already_sent";

  // 報告の宛先＝DM の送り主（ユーザートークンの持ち主）。env に別の ID を持たない（ずれないように）
  const me = await deps.slack.authTest();
  if (me.kind !== "ok") return `failed:auth_test_${errorCodeOf(me)}`;
  if (me.data.teamId !== deps.teamId) return "failed:auth_test_other_team";
  const adminUrl = `${me.data.url.replace(/\/+$/, "")}/admin`;
  const report = buildOwnerReport(states, members, today, adminUrl)!;
  const rendered = renderSyncMessage(deps.messages.ownerReport, report.vars);
  if (!rendered.ok) return `blocked:${rendered.reason}`;

  const opened = await deps.slack.openDm(me.data.userId);
  if (opened.kind !== "ok") return `failed:${errorCodeOf(opened)}`;
  const posted = await deps.slack.postMessage(opened.data.channelId, rendered.text);
  if (posted.kind === "ok") {
    await deps.store.markOwnerReportSent(today);
    return "sent";
  }
  if (posted.kind === "rate_limited" || (posted.kind === "slack_error" && !AMBIGUOUS_POST_ERRORS.has(posted.error))) {
    return `failed:${errorCodeOf(posted)}`;
  }
  // 送れたか分からない: 同じ日に二度送らないよう送ったことにする
  await deps.store.markOwnerReportSent(today);
  return `unknown:${errorCodeOf(posted)}`;
}

/** 日次の処理本体 */
export async function runSync(deps: SyncDeps): Promise<SyncRunResult> {
  const settings = await deps.store.getSettings();
  if (!settings) return { ...emptyResult("unset"), skipped: "off" };
  if (settings.mode === "off") return { ...emptyResult("off"), skipped: "off" };

  const startedAt = deps.now();
  if (!(await deps.store.acquireRunLock(startedAt, new Date(startedAt.getTime() + RUN_LOCK_MS)))) {
    return { ...emptyResult(settings.mode), skipped: "locked" };
  }
  try {
    return await runLocked(deps, settings, startedAt);
  } finally {
    try {
      await deps.store.releaseRunLock();
    } catch (error) {
      // 外せなくても期限（10分）で切れる
      console.error("[slack-member-sync] unlock failed:", error instanceof Error ? error.message : "unknown");
    }
  }
}

async function runLocked(deps: SyncDeps, settings: SyncSettings, startedAt: Date): Promise<SyncRunResult> {
  const result = emptyResult(settings.mode);
  const now = startedAt;
  const today = toJstDate(now);

  // 2) Slack のメンバー一覧
  const listed = await listAllMembers(deps);
  if (!listed.ok) {
    result.error = listed.code;
    await deps.notifyOps({ counts: { [listed.code]: 1 }, note: "メンバー一覧を取れなかったため、今日の判定を止めました。" });
    return result;
  }
  const members = listed.members;
  result.members = members.length;
  const memberById = new Map(members.map((m) => [m.id, m]));
  const targets = members.filter((m) => excludedReasonOf(m, deps.teamId) === null);
  if (members.length > 0 && targets.length === 0) {
    // SLACK_WELCOME_TEAM_ID の取り違えなどで全員が対象外になっている（黙って「0人」にしない）
    result.error = "no_targets";
    await deps.notifyOps({ counts: { no_targets: 1 }, note: "対象のメンバーが0人です（SLACK_WELCOME_TEAM_ID を確認）。" });
    return result;
  }
  if (targets.length > 0 && targets.every((m) => m.emailHash === null)) {
    // users:read.email が無いと全員が「つながっていない」になり、全員につなぐお願いを送ってしまう
    result.error = "no_emails";
    await deps.notifyOps({
      counts: { no_emails: 1 },
      note: "メールが1件も取れません（ボットに users:read.email が無い？）。今日の判定を止めました。",
    });
    return result;
  }

  // 3) つながりとメールで BONO ユーザーを引く
  const links = await deps.store.listLinks(deps.teamId);
  const linkBySlack = new Map(links.map((l) => [l.slackUserId, l.userId]));
  const linkedUserIds = new Set(links.map((l) => l.userId));
  const hashes = [...new Set(targets.map((m) => m.emailHash).filter((h): h is string => h !== null))];
  const found = await deps.store.lookupSubscriptions(hashes, [...linkedUserIds]);
  const byHash = new Map<string, SubscriptionSummary[]>();
  const byUserId = new Map<string, SubscriptionSummary>();
  for (const row of found) {
    byUserId.set(row.subscription.userId, row.subscription);
    if (row.emailHash) byHash.set(row.emailHash, [...(byHash.get(row.emailHash) ?? []), row.subscription]);
  }

  // 4) 課金中のアカウントとメールが一致した人を自動でつなぐ
  //    - つながりの相手が課金中でない（いない）のに、メールの一致で課金中の人が見つかれば、課金中の人で判定する
  //    - dry_run ではつながりを書かない（「つなぐはず」を dry_run_result に残すだけ）。test は test_user_ids の人だけ書く
  const keepUserIds = settings.keepUserIds;
  const matches = new Map<string, MemberMatch | null>();
  const wouldLink = new Set<string>();
  for (const member of targets) {
    const linkedUser = linkBySlack.get(member.id);
    const linkedSub = linkedUser ? byUserId.get(linkedUser) : undefined;
    if (linkedSub && isPaidOrKept(linkedSub, keepUserIds)) {
      matches.set(member.id, { via: "link", subscription: linkedSub });
      continue;
    }
    const best = member.emailHash ? pickBest(byHash.get(member.emailHash), keepUserIds) : null;
    if (best && isPaidOrKept(best, keepUserIds)) {
      if (!linkedUser && !linkedUserIds.has(best.userId)) {
        const mayWrite =
          settings.mode === "live" || (settings.mode === "test" && settings.testUserIds.includes(member.id));
        if (!mayWrite) {
          wouldLink.add(member.id);
          linkedUserIds.add(best.userId);
        } else {
          const inserted = await deps.store.insertLink({
            userId: best.userId,
            teamId: deps.teamId,
            slackUserId: member.id,
            linkedVia: "email",
          });
          if (inserted === "inserted") {
            result.linksCreated += 1;
            linkedUserIds.add(best.userId);
            linkBySlack.set(member.id, best.userId);
            matches.set(member.id, { via: "link", subscription: best });
            continue;
          }
        }
      }
      matches.set(member.id, { via: "email", subscription: best });
      continue;
    }
    // 課金中の人が見つからない: つながりの相手（いれば）、なければメールの一致で判定する
    if (linkedSub) matches.set(member.id, { via: "link", subscription: linkedSub });
    else matches.set(member.id, best ? { via: "email", subscription: best } : null);
  }

  // 5) 判定して、変わった行だけ保存する
  const existing = new Map((await deps.store.listStates(deps.teamId)).map((s) => [s.slackUserId, s]));
  const states = new Map<string, SyncState>();
  const toWrite: SyncState[] = [];
  const plans: DmPlan[] = [];
  let blocked = 0;

  for (const member of members) {
    const prev = existing.get(member.id) ?? null;
    const match = matches.get(member.id) ?? null;
    const r = classifyMember({
      member,
      teamId: deps.teamId,
      match,
      state: prev,
      settings,
      now,
      manualKeep:
        settings.keepSlackUserIds.includes(member.id) ||
        (match !== null && keepUserIds.includes(match.subscription.userId)),
    });
    if (!r.next) continue;
    let next = r.next;
    result.classifications[next.classification] = (result.classifications[next.classification] ?? 0) + 1;
    if (next.reason) result.reasons[next.reason] = (result.reasons[next.reason] ?? 0) + 1;

    const blockReason = r.dm ? renderDm(deps, { member, result: r, dm: r.dm }, "x".repeat(43)) : null;
    const blockCode = blockReason && !blockReason.ok ? blockReason.reason : null;
    const sendable = settings.mode === "live" || (settings.mode === "test" && settings.testUserIds.includes(member.id));

    if (!sendable) {
      // dry_run・test の対象外: 判定だけ記録する
      const prefix = settings.mode === "test" ? "not_test_target:" : "";
      const text = dryRunText(r, blockCode, prefix, wouldLink.has(member.id) ? ":would_link" : "");
      // 判定が前と同じなら dry_run_at も変えない（変わっていない行を毎日書き直さない）
      next = { ...next, dryRunResult: text, dryRunAt: prev?.dryRunResult === text ? prev.dryRunAt : now };
    } else if (r.dm && blockCode) {
      // 本文が未承認などで送れない: 印を付けて数える（承認されれば次の実行で送る）
      blocked += 1;
      if (!next.needsReview) next = { ...next, needsReview: true, reviewReason: SOFT_REVIEW_REASON };
    } else if (r.dm) {
      plans.push({ member, result: r, dm: r.dm });
    }

    states.set(member.id, next);
    if (!prev || !sameState(prev, next)) toWrite.push(next);
  }
  await deps.store.upsertStates(toWrite);
  result.statesWritten = toWrite.length;
  result.dm.blocked = blocked;
  if (blocked > 0) {
    await deps.notifyOps({
      counts: { message_not_approved: blocked },
      note: "DM本文が未承認のため送っていません（src/lib/slack-member-sync/messages/）。",
    });
  }

  // 6) DM（test / live）
  if (plans.length > 0) {
    const ctx: DmCtx = {
      deps,
      settings,
      states,
      result,
      deadline: deps.now().getTime() + (deps.limits?.dmBudgetMs ?? DEFAULT_DM_BUDGET_MS),
    };
    await sendDms(ctx, plans);
    const problems = result.dm.needsReview + result.dm.failed + (result.dm.aborted ? 1 : 0);
    if (problems > 0) {
      await deps.notifyOps({
        counts: {
          needs_review: result.dm.needsReview,
          dm_failed: result.dm.failed,
          ...(result.dm.aborted ? { [`aborted_${result.dm.aborted}`]: 1 } : {}),
        },
      });
    }
  }

  // 7) オーナーへの報告
  const finalStates = [...states.values()];
  result.due = finalStates.filter((s) => isDueForRemoval(s, today) && !memberById.get(s.slackUserId)?.deleted).length;
  result.needsReview = finalStates.filter(
    (s) => s.needsReview && s.reviewReason !== SOFT_REVIEW_REASON && s.classification !== "resolved",
  ).length;
  try {
    result.ownerReport = await sendOwnerReport(deps, settings, finalStates, memberById, today);
  } catch (error) {
    result.ownerReport = "failed:error";
    console.error("[slack-member-sync] owner report failed:", error instanceof Error ? error.message : "unknown");
  }
  if (result.ownerReport.startsWith("failed:") || result.ownerReport.startsWith("unknown:")) {
    await deps.notifyOps({ counts: { [`owner_report_${result.ownerReport}`]: 1 } });
  }

  log("done", {
    mode: settings.mode,
    members: result.members,
    written: result.statesWritten,
    sent: result.dm.sent,
    due: result.due,
  });
  return result;
}
