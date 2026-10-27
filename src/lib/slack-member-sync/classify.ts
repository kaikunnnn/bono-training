/**
 * Slack メンバー1人の判定（#263）。純粋関数（DB・Slack・時計に触らない）。
 *
 * 入力: users.list の1人分 / つながっている（またはメールが一致した）BONO ユーザーの課金の要約 /
 *       今の状態行 / 設定 / 現在時刻
 * 出力: 次に保存する状態行と、今送るべき DM（送ってよいかのモード・本文承認の判定は呼び出し側）
 *
 * ルール（rebono/issues/263 の「毎日のチェック」）:
 * - ボット・削除済み・ゲスト・招待中・別チーム・オーナー・管理者は対象外（excluded）
 * - 課金中（is_active）→ keep。解約予約中も期間の終わりまでは Slack に残す
 * - 解約予約あり・解約済み → remove_scheduled。外れるお知らせDMを1回だけ送る
 *     外す日 = max(課金が終わる日の翌日, お知らせDMを送った日 + min_notice_days)
 *     → 解約予約の人は「終わる日の翌日」、初回の大掃除（終わった日が過ぎている人）は「DMの7日後」になる
 *     外す日はお知らせDMを送れた時点で決まり、以後は計算し直さない（送れるまでは null）
 * - つながっていない・課金の記録がない → needs_link。つなぐお願いDMを1回だけ送る
 *     期限（DMを送った日 + link_grace_days）を過ぎてもつながらなければ remove_scheduled（link_expired）。
 *     つなぐお願いDMに期限と「外れることがある」を書いているので、2通目のDMは送らない。外す日は期限の翌日
 * - 外す日の前に再課金・つながった → keep に戻し、外す予定を消す（DMは送らない）
 * - 外す予定・つなぐ待ちの人が Slack で削除済みになっていた → resolved（deactivated）
 * - needs_review が立っている人には DM を送らない（送れたか分からない等。オーナーが確認して外す）。
 *   ただし本文未承認の印（message_not_approved）は、承認後に送れるよう止めない
 */
import { addDays, laterDate, toJstDate } from "./dates";
import type {
  Classification,
  DmType,
  ExcludedReason,
  MemberMatch,
  ResolvedReason,
  SlackMemberSummary,
  SubscriptionSummary,
  SyncSettings,
  SyncState,
} from "./types";

export const SLACKBOT_USER_ID = "USLACKBOT";
/** 本文未承認で送れなかった印。承認されれば次の実行で送ってよい（送信は止めない） */
export const SOFT_REVIEW_REASON = "message_not_approved";

export interface ClassifyInput {
  member: SlackMemberSummary;
  /** SLACK_WELCOME_TEAM_ID */
  teamId: string;
  match: MemberMatch | null;
  state: SyncState | null;
  settings: Pick<SyncSettings, "minNoticeDays" | "linkGraceDays">;
  now: Date;
}

export interface ClassifyResult {
  /** 保存する次の状態。null なら保存しない（状態行のない対象外メンバー） */
  next: SyncState | null;
  /** 今送るべき DM */
  dm: DmType | null;
  /** dm=removal_notice のとき、今日送れたら決まる外す日 */
  removeAfterIfSentToday: string | null;
  /** dm=link_request のとき、今日送れたら決まる期限 */
  linkDeadlineIfSentToday: string | null;
  /** 課金が終わる（終わった）日（JST）。外れるお知らせDMの本文に使う */
  endDate: string | null;
}

/** 対象外の理由（null なら対象） */
export function excludedReasonOf(member: SlackMemberSummary, teamId: string): ExcludedReason | null {
  if (member.id === SLACKBOT_USER_ID) return "bot";
  if (member.deleted) return "deleted";
  if (member.isBot || member.isWorkflowBot || member.isAppUser) return "bot";
  // 所属チームが分からない・違う場合は触らない（安全側）
  if (member.teamId !== teamId) return "other_team";
  if (member.isPrimaryOwner) return "primary_owner";
  if (member.isOwner) return "owner";
  if (member.isAdmin) return "admin";
  if (member.isRestricted || member.isUltraRestricted) return "guest";
  if (member.isInvitedUser) return "invited";
  return null;
}

/**
 * 課金が終わる（終わった）時刻。getSubscriptionStatus の renewalDate と同じ考え方:
 * 解約予約ありで cancel_at があればそれ、なければ current_period_end。
 * 課金が終わっている人で日付が分からない・未来の日付なら「今」を終わりとみなす（いきなり外さないよう、
 * 外す日はお知らせDMから min_notice_days 後になる）。
 */
export function endOf(sub: SubscriptionSummary, now: Date): Date {
  const end = sub.cancelAtPeriodEnd && sub.cancelAt ? sub.cancelAt : sub.currentPeriodEnd;
  if (!sub.isActive) {
    if (!end || end.getTime() > now.getTime()) return now;
    return end;
  }
  return end ?? now;
}

function hasHardReview(state: SyncState | null): boolean {
  return Boolean(state?.needsReview && state.reviewReason !== SOFT_REVIEW_REASON);
}

function freshState(member: SlackMemberSummary, teamId: string, now: Date): SyncState {
  return {
    teamId,
    slackUserId: member.id,
    classification: "keep",
    reason: null,
    removeAfter: null,
    linkDeadline: null,
    linkRequestDmAt: null,
    linkRequestVersion: null,
    removalNoticeDmAt: null,
    removalNoticeVersion: null,
    dryRunResult: null,
    dryRunAt: null,
    needsReview: false,
    reviewReason: null,
    resolvedAt: null,
    resolvedReason: null,
    firstSeenAt: now,
  };
}

function result(next: SyncState | null, extra: Partial<ClassifyResult> = {}): ClassifyResult {
  return {
    next,
    dm: null,
    removeAfterIfSentToday: null,
    linkDeadlineIfSentToday: null,
    endDate: null,
    ...extra,
  };
}

const OPEN: Classification[] = ["remove_scheduled", "needs_link"];

export function classifyMember(input: ClassifyInput): ClassifyResult {
  const { member, teamId, match, state, settings, now } = input;
  const today = toJstDate(now);
  const base: SyncState = state ? { ...state } : freshState(member, teamId, now);

  // 1) 対象外
  const excluded = excludedReasonOf(member, teamId);
  if (excluded) {
    if (!state) return result(null); // 状態行のない人は記録しない
    if (excluded === "deleted" && OPEN.includes(state.classification)) {
      // 外す予定・つなぐ待ちだった人が外されていた → 閉じる
      return result({
        ...base,
        classification: "resolved",
        resolvedAt: now,
        resolvedReason: "deactivated",
      });
    }
    if (state.classification === "resolved") return result(base);
    return result({
      ...base,
      classification: "excluded",
      reason: excluded,
      removeAfter: null,
      linkDeadline: null,
    });
  }

  const sub = match?.subscription ?? null;

  // 2) 課金中（解約予約なし）→ 残す
  if (sub && sub.hasPaidRecord && sub.isActive && !sub.cancelAtPeriodEnd) {
    const wasOpen = state !== null && OPEN.includes(state.classification);
    const resolvedReason: ResolvedReason =
      state?.classification === "needs_link" || state?.reason === "link_expired" ? "linked" : "resubscribed";
    return result({
      ...base,
      classification: "keep",
      reason: null,
      removeAfter: null,
      linkDeadline: null,
      // 次にまた解約したら、新しい外す日でお知らせし直す
      removalNoticeDmAt: null,
      removalNoticeVersion: null,
      needsReview: base.reviewReason === SOFT_REVIEW_REASON ? false : base.needsReview,
      reviewReason: base.reviewReason === SOFT_REVIEW_REASON ? null : base.reviewReason,
      resolvedAt: wasOpen ? now : base.resolvedAt,
      resolvedReason: wasOpen ? resolvedReason : base.resolvedReason,
    });
  }

  // 3) 解約予約あり・解約済み → 外す予定
  if (sub && sub.hasPaidRecord) {
    const reason = sub.isActive ? "cancel_reserved" : "canceled";
    const endDate = toJstDate(endOf(sub, now));
    // お知らせ済みなら送り直さず、外す日も変えない（解約予約→解約済みになった人・削除済みから戻された人も同じ）。
    // 再課金で keep に戻ったときにお知らせの記録を消すので、また解約したら新しい外す日でお知らせし直す
    const noticed = state !== null && state.removalNoticeDmAt !== null && state.removeAfter !== null;
    const next: SyncState = {
      ...base,
      classification: "remove_scheduled",
      reason,
      linkDeadline: null,
      resolvedAt: null,
      resolvedReason: null,
      removeAfter: noticed ? base.removeAfter : null,
    };
    if (noticed) return result(next, { endDate });
    return result(next, {
      endDate,
      dm: hasHardReview(state) ? null : "removal_notice",
      removeAfterIfSentToday: laterDate(addDays(endDate, 1), addDays(today, settings.minNoticeDays)),
    });
  }

  // 4) つながっていない・課金の記録がない → つなぐお願い
  const needsLinkReason = match ? "no_paid_record" : "not_linked";
  if (state?.linkRequestDmAt) {
    const deadline = state.linkDeadline ?? addDays(toJstDate(state.linkRequestDmAt), settings.linkGraceDays);
    if (today > deadline) {
      return result({
        ...base,
        classification: "remove_scheduled",
        reason: "link_expired",
        linkDeadline: deadline,
        removeAfter:
          state.reason === "link_expired" && state.removeAfter ? state.removeAfter : addDays(deadline, 1),
        resolvedAt: null,
        resolvedReason: null,
      });
    }
    return result({
      ...base,
      classification: "needs_link",
      reason: needsLinkReason,
      linkDeadline: deadline,
      removeAfter: null,
      resolvedAt: null,
      resolvedReason: null,
    });
  }
  return result(
    {
      ...base,
      classification: "needs_link",
      reason: needsLinkReason,
      linkDeadline: null,
      removeAfter: null,
      resolvedAt: null,
      resolvedReason: null,
    },
    {
      dm: hasHardReview(state) ? null : "link_request",
      linkDeadlineIfSentToday: addDays(today, settings.linkGraceDays),
    },
  );
}

/** オーナー報告の「今日外す人」に入るか */
export function isDueForRemoval(state: SyncState, today: string): boolean {
  return state.classification === "remove_scheduled" && state.removeAfter !== null && state.removeAfter <= today;
}
