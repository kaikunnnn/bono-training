/**
 * Slack メンバー1人の判定（#263）。純粋関数（DB・Slack・時計に触らない）。
 *
 * 入力: users.list の1人分 / つながっている（またはメールが一致した）BONO ユーザーの課金の要約 /
 *       今の状態行 / 設定 / 現在時刻
 * 出力: 次に保存する状態行と、今送るべき DM（送ってよいかのモード・本文承認の判定は呼び出し側）
 *
 * ルール（rebono/issues/263 の「毎日のチェック」。2026-10-29 オーナー決定で改定）:
 * - ボット・削除済み・ゲスト・招待中・別チーム・オーナー・管理者は対象外（excluded）
 * - 手で残すと決めた人（keep_user_ids / keep_slack_user_ids）→ keep
 * - 課金中（is_active）→ keep。解約予約中も期間の終わりまでは Slack に残す
 * - 解約予約あり・解約済み → remove_scheduled。DM は送らない（オーナー決定 2026-10-29）
 *     解約済み: 外す日 = 今日（課金が終わる日の翌日が先ならその日）→ 次の実行のオーナー報告に出る
 *     解約予約: 外す日 = 課金が終わる日の翌日（それまでは Slack に残る）
 *     外す日が来た人の外す日は動かさない（毎日書き直さない）
 * - つながっていない・課金の記録がない → needs_link。つなぐお願いDMを1回だけ送る
 *     期限（DMを送った日 + link_grace_days）を過ぎてもつながらなければ remove_scheduled（link_expired）。
 *     つなぐお願いDMに期限と「外れる」を書いているので、2通目のDMは送らない。外す日は期限の翌日
 * - 外す予定・つなぐ待ちの「回」を抜けたら、その回の記録を消す（また同じ状態になったら新しい回から）
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
  settings: Pick<SyncSettings, "linkGraceDays">;
  now: Date;
  /** 手で「残す」と決めた人（settings.keep_user_ids / keep_slack_user_ids）。課金に関係なく keep */
  manualKeep?: boolean;
}

export interface ClassifyResult {
  /** 保存する次の状態。null なら保存しない（状態行のない対象外メンバー） */
  next: SyncState | null;
  /** 今送るべき DM（つなぐお願いだけ。解約の人には送らない） */
  dm: DmType | null;
  /** dm=link_request のとき、今日送れたら決まる期限 */
  linkDeadlineIfSentToday: string | null;
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
 * 解約予約ありで cancel_at があればそれ、なければ current_period_end。日付が分からなければ「今」。
 * 課金が終わっている人でも未来の日付ならそのまま返す（外す日はその翌日になる。オーナー決定 2026-10-29）。
 */
export function endOf(sub: SubscriptionSummary, now: Date): Date {
  const end = sub.cancelAtPeriodEnd && sub.cancelAt ? sub.cancelAt : sub.currentPeriodEnd;
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
    linkDeadlineIfSentToday: null,
    ...extra,
  };
}

const OPEN: Classification[] = ["remove_scheduled", "needs_link"];

/** つなぐお願いの記録を消す（つなぐ待ちの「回」を終える。次に未接続になったら新しいDMと猶予から） */
const CLEAR_LINK: Pick<SyncState, "linkRequestDmAt" | "linkRequestVersion" | "linkDeadline"> = {
  linkRequestDmAt: null,
  linkRequestVersion: null,
  linkDeadline: null,
};
/**
 * 外す予定の記録を消す（外す予定の「回」を終える。次に外す予定になったら外す日を決め直す）。
 * removal_notice_dm_at / removal_notice_version は外れるお知らせDMの廃止（2026-10-29）で使わなくなった列。
 * 本番に列は残しているが、ここでは触らない（読み書きの型には残る）
 */
const CLEAR_REMOVAL: Pick<SyncState, "removeAfter"> = {
  removeAfter: null,
};

/** 今の状態が「つなぐ待ちの回」の途中か（つなぐお願いを送ってある needs_link / link_expired） */
function inLinkEpisode(state: SyncState | null): state is SyncState & { linkRequestDmAt: Date } {
  if (!state || state.linkRequestDmAt === null) return false;
  return (
    state.classification === "needs_link" ||
    (state.classification === "remove_scheduled" && state.reason === "link_expired")
  );
}

/** 今の状態が「解約で外す予定の回」で、外す日がもう来ているか（来ていれば外す日を動かさない） */
function dueCancelEpisodeDate(state: SyncState | null, today: string): string | null {
  if (
    state !== null &&
    state.classification === "remove_scheduled" &&
    (state.reason === "canceled" || state.reason === "cancel_reserved") &&
    state.removeAfter !== null &&
    state.removeAfter <= today
  ) {
    return state.removeAfter;
  }
  return null;
}

/**
 * 守ること（つなぐ待ちの道だけ）: link_expired で外す日が来る人には、必ず「今の回」でつなぐお願いDMを送ってある。
 * そのため、つなぐ待ちの回を抜けるとき（keep / excluded / resolved / 別の判定）は、その回の DM の記録を消す。
 * 解約予約・解約済みの人は DM なしで外す予定にする（オーナー決定 2026-10-29）ので、この約束の対象外。
 */
export function classifyMember(input: ClassifyInput): ClassifyResult {
  const { member, teamId, match, state, settings, now, manualKeep = false } = input;
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
        ...CLEAR_LINK,
        ...CLEAR_REMOVAL,
        classification: "resolved",
        resolvedAt: now,
        resolvedReason: "deactivated",
      });
    }
    if (state.classification === "resolved") return result(base);
    return result({ ...base, ...CLEAR_LINK, ...CLEAR_REMOVAL, classification: "excluded", reason: excluded });
  }

  const sub = match?.subscription ?? null;

  // 2) 手で残すと決めた人・課金中（解約予約なし）→ 残す
  if (manualKeep || (sub && sub.hasPaidRecord && sub.isActive && !sub.cancelAtPeriodEnd)) {
    const wasOpen = state !== null && OPEN.includes(state.classification);
    const resolvedReason: ResolvedReason =
      state?.classification === "needs_link" || state?.reason === "link_expired" ? "linked" : "resubscribed";
    return result({
      ...base,
      ...CLEAR_LINK,
      ...CLEAR_REMOVAL,
      classification: "keep",
      reason: manualKeep ? "manual_keep" : null,
      needsReview: base.reviewReason === SOFT_REVIEW_REASON ? false : base.needsReview,
      reviewReason: base.reviewReason === SOFT_REVIEW_REASON ? null : base.reviewReason,
      resolvedAt: wasOpen ? now : base.resolvedAt,
      resolvedReason: wasOpen ? resolvedReason : base.resolvedReason,
    });
  }

  // 3) 解約予約あり・解約済み → 外す予定（DM は送らない）
  if (sub && sub.hasPaidRecord) {
    const reason = sub.isActive ? "cancel_reserved" : "canceled";
    const endDate = toJstDate(endOf(sub, now));
    // 解約済みは今日（終わる日の翌日が先ならその日）、解約予約は終わる日の翌日。
    // 外す日がもう来ている人は動かさない（毎日「今日」に書き直さない。解約予約→解約済みになった人も同じ回）
    const removeAfter = dueCancelEpisodeDate(state, today) ?? laterDate(today, addDays(endDate, 1));
    const softOnly = base.reviewReason === SOFT_REVIEW_REASON;
    return result({
      ...base,
      ...CLEAR_LINK,
      classification: "remove_scheduled",
      reason,
      removeAfter,
      // 以前の「外れるお知らせ」の本文未承認の印は、もう送らないので外す
      needsReview: softOnly ? false : base.needsReview,
      reviewReason: softOnly ? null : base.reviewReason,
      resolvedAt: null,
      resolvedReason: null,
    });
  }

  // 4) つながっていない・課金の記録がない → つなぐお願い
  const needsLinkReason = match ? "no_paid_record" : "not_linked";
  if (inLinkEpisode(state)) {
    const sentOn = toJstDate(state.linkRequestDmAt);
    const deadline = state.linkDeadline ?? addDays(sentOn, settings.linkGraceDays);
    if (today > deadline) {
      // 外す日は期限の翌日（一度決めたら動かさない）
      const removeAfter =
        state.reason === "link_expired" && state.removeAfter ? state.removeAfter : addDays(deadline, 1);
      return result({
        ...base,
        ...CLEAR_REMOVAL,
        classification: "remove_scheduled",
        reason: "link_expired",
        linkDeadline: deadline,
        removeAfter,
        resolvedAt: null,
        resolvedReason: null,
      });
    }
    return result({
      ...base,
      ...CLEAR_REMOVAL,
      classification: "needs_link",
      reason: needsLinkReason,
      linkDeadline: deadline,
      resolvedAt: null,
      resolvedReason: null,
    });
  }
  // 新しい「つなぐ待ちの回」: つなぐお願いを送る
  return result(
    {
      ...base,
      ...CLEAR_LINK,
      ...CLEAR_REMOVAL,
      classification: "needs_link",
      reason: needsLinkReason,
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
