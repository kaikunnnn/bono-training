/**
 * 会員メール（#264）の「対象を選ぶ処理」。
 *
 * 種類ごとに「候補の取り方」と「除外条件の並び」を持つ。除外条件は上から順に見て、最初に当たった理由で数える。
 * スライス1で作るのは週1回のメルマガ（weekly）だけ。②③④は TARGETS に1つ足し、除外条件を並べるだけで作れる形にしている。
 *   例（スライス3以降）: 解約予約中を除く → excludeCancelScheduled を並べる / 連絡済み(#254) → 新しい Exclusion を足す
 */
import { jstDayStart, jstDaysBetween, jstWeekStart, tenureBucket } from "./dates";
import { isLearningEvent, type LessonIndex } from "./learned";
import {
  CATEGORY_OF_KIND,
  type ProgressEvent,
  WEEKLY_CAP_CATEGORIES,
  type Campaign,
  type CountSummary,
  type MailCategory,
  type MailKind,
  type MailMode,
  type MailStore,
  type MemberCandidate,
  type StandingKey,
} from "./types";

export interface ExclusionContext {
  category: MailCategory;
  unsubscribed: Set<string>;
  suppressed: Set<string>;
  /** 今週（日本時間の月曜から）すでに会員向けのお知らせ系を受け取った人 */
  mailedThisWeek: Set<string>;
  now: Date;
  /** 常設の文面だけ: テスト用アカウント */
  testAccounts?: Set<string>;
  /** 常設の文面だけ: 学習の決まり（StandingTargetDefinition.learning）で外す人と、その理由 */
  learningReasons?: Map<string, string>;
  /** 常設の文面だけ: 14日で常設の文面をもう上限まで受け取った人 */
  standingCapped?: Set<string>;
}

export interface Exclusion {
  /** 送信の記録・人数に残す理由（英小文字。個人情報を入れない） */
  reason: string;
  excludes(candidate: MemberCandidate, ctx: ExclusionContext): boolean;
  /** 人によって理由が変わる除外だけ（例: 学習の決まり）。無ければ reason */
  reasonOf?(candidate: MemberCandidate, ctx: ExclusionContext): string;
}

export const excludeSuppressed: Exclusion = {
  reason: "suppressed",
  excludes: (c, ctx) => ctx.suppressed.has(c.userId),
};

export const excludeUnsubscribed: Exclusion = {
  reason: "unsubscribed",
  excludes: (c, ctx) => ctx.unsubscribed.has(c.userId),
};

/** 会員のお知らせ系は合わせて週1通まで（264 §5-9） */
export const excludeWeeklyCap: Exclusion = {
  reason: "weekly_cap",
  excludes: (c, ctx) => ctx.mailedThisWeek.has(c.userId),
};

/** 解約予約中（②③で使う。①のメルマガは解約予約中にも送る＝268 決定） */
export const excludeCancelScheduled: Exclusion = {
  reason: "cancel_scheduled",
  excludes: (c) => c.cancelAtPeriodEnd,
};

export interface TargetDefinition {
  kind: MailKind;
  listCandidates(store: MailStore): Promise<MemberCandidate[]>;
  exclusions: readonly Exclusion[];
  /** 週の上限に数える種類か */
  countsTowardWeeklyCap: boolean;
  /** 送る直前に、まだ対象か確かめる（例: 契約が終わっていないか）。配信停止・届かない・週の上限は送る処理が共通で見る */
  stillEligible(store: MailStore, userId: string): Promise<boolean>;
}

/** ① 週1回のメルマガ: 課金中の会員全員（解約予約中も含む）。配信停止・届かない人・今週もう1通受け取った人を除く */
export const WEEKLY_TARGET: TargetDefinition = {
  kind: "weekly",
  listCandidates: (store) => store.listPaidMembers(),
  stillEligible: (store, userId) => store.isPaidMember(userId),
  exclusions: [excludeSuppressed, excludeUnsubscribed, excludeWeeklyCap],
  countsTowardWeeklyCap: true,
};

export const TARGETS: Partial<Record<MailKind, TargetDefinition>> = {
  weekly: WEEKLY_TARGET,
};

// =============================================================================
// 常設の文面（327-D〜）: 毎日、条件に合った人だけを送信の記録に足す
// =============================================================================
//
// 1回分の文面（weekly）との違い:
// - 対象の書き出しを1回で終わらせない（enqueued_at を使わない）。毎日、その日に条件に合った人だけを足す
// - 1人に1回だけは、送信の記録の一意制約（campaign_id, user_id WHERE audience='all'）と、
//   1つの standing_key に文面が1つだけ（DB の一意インデックス）で守る
// - campaign.scheduledAt は「仕組みを有効にした時刻」。それより後に入会した人だけが対象（過去の入会者にさかのぼらない）
// - 文面ごとに「入会からの日数」「除外条件」「学習の決まり（learning）」を持つ。
//   新しい文面は STANDING_TARGETS に1つ足すだけで、選ぶ処理・送る直前の見直しは共通のまま
// - 常設の文面どうしは、日本時間の日付で2日以上あける（送る日の範囲で守る。テスト: standing-ef.test.ts）

/** 入会から何日でも、常設の文面は合わせて14日で最大3通まで（327 の決まりごと） */
export const STANDING_CAP_WINDOW_DAYS = 14;
export const STANDING_CAP_MAX = 3;

export const excludeTestAccount: Exclusion = {
  reason: "test_account",
  excludes: (c, ctx) => Boolean(ctx.testAccounts?.has(c.userId)),
};

/**
 * 学習の決まり（StandingTargetDefinition.learning）に当たった人。理由は決まりごとに違う
 * （例: learned＝学んだので外す / not_learned＝まだ学んでいないので外す / learned_recently＝最近学んだので外す）
 */
export const excludeByLearning: Exclusion = {
  reason: "learned",
  excludes: (c, ctx) => Boolean(ctx.learningReasons?.has(c.userId)),
  reasonOf: (c, ctx) => ctx.learningReasons?.get(c.userId) ?? "learned",
};

/** 以前の名前（327-D）。中身は excludeByLearning と同じ */
export const excludeLearned = excludeByLearning;

export const excludeStandingCap: Exclusion = {
  reason: "standing_cap",
  excludes: (c, ctx) => Boolean(ctx.standingCapped?.has(c.userId)),
};

// ----- 学習の決まり（「学んだ」の数え方は learned.ts。分析側 #274 と同じ） -----

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 学習の決まりの1つ。「since(入会日, 今) 以降に学んだか」で外すかを決める。
 * - excludeWhen: "learned" … その期間に学んでいたら外す / "not_learned" … その期間に学んでいなければ外す
 * - 決まりは上から順に見て、最初に当たった理由で外す
 * 「学んだ」の数え始めは、どの決まりでも入会日（日本時間0時）より前にはしない（課金前の無料の学習は数えない）
 */
export interface LearningCheck {
  reason: string;
  excludeWhen: "learned" | "not_learned";
  since(joinedAt: Date, now: Date): Date;
}

export interface LearningRule {
  checks: readonly LearningCheck[];
}

/** 327-D: 入会してから学んだ人は外す */
export const LEARNING_RULE_NOT_YET_LEARNED: LearningRule = {
  checks: [{ reason: "learned", excludeWhen: "learned", since: (joinedAt) => learningSince(joinedAt) }],
};

/** 327-E のリマインダー: 最近学んだかを見る日数（今日を含まず、日本時間の0時から） */
export const REMINDER_QUIET_DAYS = 3;
/**
 * 327-E: 入会してから1回は学んだ人だけ。ただし直近 REMINDER_QUIET_DAYS 日（日本時間の「今日の0時 − 3日」から今まで）に
 * 学んでいたら外す（まだ学んでいない人は 2日後・9日後の案内のほうで扱う）
 */
export const LEARNING_RULE_LEARNED_THEN_QUIET: LearningRule = {
  checks: [
    { reason: "not_learned", excludeWhen: "not_learned", since: (joinedAt) => learningSince(joinedAt) },
    {
      reason: "learned_recently",
      excludeWhen: "learned",
      since: (_joinedAt, now) => new Date(jstDayStart(now).getTime() - REMINDER_QUIET_DAYS * DAY_MS),
    },
  ],
};

/** 327-F の相談の案内: 入会日から何日目の0時（日本時間）以降の学習を見るか */
export const CONSULT_QUIET_FROM_DAY = 7;
/** 327-F: 入会7日目の0時（日本時間）から今までに学んだ人は外す。最初の1週間に学んだかは見ない */
export const LEARNING_RULE_QUIET_SINCE_DAY7: LearningRule = {
  checks: [
    {
      reason: "learned",
      excludeWhen: "learned",
      since: (joinedAt) => new Date(jstDayStart(joinedAt).getTime() + CONSULT_QUIET_FROM_DAY * DAY_MS),
    },
  ],
};

/** 学習の決まりが読む学習の記録の数え始め（どの決まりの since より前、かつ入会日の0時より前にしない） */
export function learningEventsSince(rule: LearningRule, joinedAt: Date, now: Date): Date {
  const floor = learningSince(joinedAt).getTime();
  const times = rule.checks.map((c) => Math.max(floor, c.since(joinedAt, now).getTime()));
  return new Date(Math.min(...times));
}

/**
 * 1人分の学習の記録から、学習の決まりで外す理由を返す（外さないなら null）。純粋関数。
 * events はその人の行だけでなくてもよい（userId で絞る）。
 */
export function learningExclusionReason(
  rule: LearningRule,
  userId: string,
  events: readonly ProgressEvent[],
  lessonIndex: LessonIndex,
  joinedAt: Date,
  now: Date,
): string | null {
  const floor = learningSince(joinedAt).getTime();
  const learnedAt = events
    .filter((e) => e.userId === userId && e.occurredAt.getTime() >= floor && isLearningEvent(e, lessonIndex))
    .map((e) => e.occurredAt.getTime());
  for (const check of rule.checks) {
    const since = Math.max(floor, check.since(joinedAt, now).getTime());
    const learned = learnedAt.some((t) => t >= since);
    if (check.excludeWhen === "learned" ? learned : !learned) return check.reason;
  }
  return null;
}

export interface StandingTargetDefinition {
  key: StandingKey;
  kind: MailKind;
  /** 入会日（日本時間）から何日後の朝に送るか。入会日が0 */
  sendOnDay: number;
  /**
   * sendOnDay から何日あとまで送ってよいか。0 ならその日だけ。
   * 範囲の中の毎朝、その日に条件に合った人を選ぶ（取りこぼしの救済だけでなく、その朝に条件に合った人も入る）。
   * 送る直前にもこの範囲を見直す（スイッチを止めて戻した行が何週間もあとに届かないように）
   */
  catchUpDays: number;
  exclusions: readonly Exclusion[];
  /** 学習の決まり（exclusions の excludeByLearning が使う。送る直前の見直しも同じ決まりを見る） */
  learning: LearningRule;
}

/**
 * 327-D はじめの案内: 入会の2日後の朝（日本時間）に、入会してからまだ「学んだ」がない人へ1回だけ。
 * 2日後の朝の実行が失敗したときだけ、3日後の朝に送る（それより後は送らない）。
 */
export const ONBOARDING_DAY2_TARGET: StandingTargetDefinition = {
  key: "onboarding_day2",
  kind: "signup",
  sendOnDay: 2,
  catchUpDays: 1,
  exclusions: [excludeSuppressed, excludeUnsubscribed, excludeTestAccount, excludeByLearning, excludeStandingCap],
  learning: LEARNING_RULE_NOT_YET_LEARNED,
};

/**
 * 327-E 「続きをデザインしよう」のリマインダー: 入会の5日後の朝（日本時間）。6日後の朝まで。
 * 入会してから1回は学んだが、日本時間の「今日の0時の3日前」から今までに学んでいない人へ1回だけ。
 * おすすめの記事は出さない。まだ学んでいない人は外す（2日後・9日後の案内で扱う）
 */
export const ONBOARDING_DAY5_TARGET: StandingTargetDefinition = {
  key: "onboarding_day5",
  kind: "signup",
  sendOnDay: 5,
  catchUpDays: 1,
  exclusions: [excludeSuppressed, excludeUnsubscribed, excludeTestAccount, excludeByLearning, excludeStandingCap],
  learning: LEARNING_RULE_LEARNED_THEN_QUIET,
};

/**
 * 327-F 30分相談の案内: 入会の9日後の朝（日本時間）。11日後の朝まで。
 * 入会7日目の0時（日本時間）から今までに学んでいない人へ1回だけ（最初の1週間に学んだかは見ない）
 */
export const ONBOARDING_DAY9_TARGET: StandingTargetDefinition = {
  key: "onboarding_day9",
  kind: "signup",
  sendOnDay: 9,
  catchUpDays: 2,
  exclusions: [excludeSuppressed, excludeUnsubscribed, excludeTestAccount, excludeByLearning, excludeStandingCap],
  learning: LEARNING_RULE_QUIET_SINCE_DAY7,
};

export const STANDING_TARGETS: Record<StandingKey, StandingTargetDefinition> = {
  onboarding_day2: ONBOARDING_DAY2_TARGET,
  onboarding_day5: ONBOARDING_DAY5_TARGET,
  onboarding_day9: ONBOARDING_DAY9_TARGET,
};

/** 常設の文面どうしの間を、日本時間の日付で何日以上あけるか（送る日の範囲で守る。テストで確かめる） */
export const STANDING_MIN_GAP_DAYS = 2;

/**
 * 入会日（今の Stripe 契約の最初の課金日）と有効にした時刻から、今日が送る日か。
 * 入会日は store.listContractStartsSince / getContractStart の説明のとおり。
 * アカウントの古さは見ない（新規＝Stripe の新規課金の全員。出戻りで新しく契約した人も入る＝オーナー決定）
 */
export function isStandingDue(
  def: StandingTargetDefinition,
  joinedAt: Date | null,
  activatedAt: Date | null,
  now: Date,
): boolean {
  if (!joinedAt || !activatedAt) return false;
  if (joinedAt.getTime() < activatedAt.getTime()) return false; // 有効にする前の入会者にはさかのぼらない
  const days = jstDaysBetween(joinedAt, now);
  return days >= def.sendOnDay && days <= def.sendOnDay + def.catchUpDays;
}

/** 入会日を探す範囲（送る日＋取りこぼしの日＋1日のゆとり） */
function joinLookbackStart(def: StandingTargetDefinition, now: Date): Date {
  return new Date(jstDayStart(now).getTime() - (def.sendOnDay + def.catchUpDays + 1) * 24 * 60 * 60 * 1000);
}

/** メールアドレスがテスト用アカウントの頭で始まるか（大文字・小文字を区別しない） */
export function isTestAccountEmail(email: string, prefixes: readonly string[]): boolean {
  const lower = email.trim().toLowerCase();
  return prefixes.some((p) => p.trim().length > 0 && lower.startsWith(p.trim().toLowerCase()));
}

/** 「学んだ」の数え始め: 入会日（最初の課金日）の日本時間0時（分析側の since＝課金日と同じ日単位） */
export function learningSince(joinedAt: Date): Date {
  return jstDayStart(joinedAt);
}

export interface StandingSelectionInput {
  store: MailStore;
  def: StandingTargetDefinition;
  campaign: Campaign;
  lessonIndex: LessonIndex;
  testEmailPrefixes: readonly string[];
  now: Date;
}

/** 常設の文面の対象を選ぶ（今日が送る日の人だけを候補にし、除外条件を当てる） */
export async function selectStandingTargets(input: StandingSelectionInput): Promise<TargetSelection> {
  const { store, def, campaign, lessonIndex, testEmailPrefixes, now } = input;
  const category = CATEGORY_OF_KIND[def.kind];
  const [members, starts] = await Promise.all([
    store.listPaidMembers(),
    store.listContractStartsSince(joinLookbackStart(def, now)),
  ]);
  // 決済が終わっていない（subscriptions に行が無い）契約は starts に入らないので対象外
  const joinedAt = new Map<string, Date>();
  for (const m of members) {
    const at = m.stripeSubscriptionId ? starts.get(m.stripeSubscriptionId) : undefined;
    if (at && isStandingDue(def, at, campaign.scheduledAt ?? null, now)) joinedAt.set(m.userId, at);
  }
  const due = members.filter((m) => joinedAt.has(m.userId));
  const empty: TargetSelection = { included: [], excluded: {}, candidates: 0 };
  if (due.length === 0) return empty;

  const ids = due.map((m) => m.userId);
  const earliest = new Date(
    Math.min(...due.map((m) => learningEventsSince(def.learning, joinedAt.get(m.userId)!, now).getTime())),
  );
  const capSince = new Date(now.getTime() - STANDING_CAP_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [unsubscribed, suppressed, events, capCounts] = await Promise.all([
    store.listUnsubscribedUserIds(category),
    store.listSuppressedUserIds(),
    store.listProgressEvents(ids, earliest),
    store.countStandingMailsSince(capSince, ids),
  ]);

  // テスト用アカウント: アドレスは判定にだけ使い、どこにも残さない
  const testAccounts = new Set<string>();
  if (testEmailPrefixes.length > 0) {
    for (const m of due) {
      const email = await store.getEmailAddress(m.userId);
      if (email && isTestAccountEmail(email, testEmailPrefixes)) testAccounts.add(m.userId);
    }
  }
  const standingCapped = new Set([...capCounts].filter(([, n]) => n >= STANDING_CAP_MAX).map(([id]) => id));
  const learningReasons = new Map<string, string>();
  for (const m of due) {
    const reason = learningExclusionReason(def.learning, m.userId, events, lessonIndex, joinedAt.get(m.userId)!, now);
    if (reason) learningReasons.set(m.userId, reason);
  }

  return applyExclusions(due, def.exclusions, {
    category,
    unsubscribed,
    suppressed,
    mailedThisWeek: new Set(),
    now,
    testAccounts,
    learningReasons,
    standingCapped,
  });
}

/**
 * 送る直前の見直し（常設の文面・本番の送信）。送ってよければ null、だめなら理由。
 * 配信停止・届かないは送る処理が共通で見る。テスト用アカウントはアドレスを読んだあとに送る処理が見る。
 */
export async function standingIneligibleReason(input: {
  store: MailStore;
  def: StandingTargetDefinition;
  campaign: Campaign;
  userId: string;
  lessonIndex: LessonIndex;
  now: Date;
}): Promise<string | null> {
  const { store, def, campaign, userId, lessonIndex, now } = input;
  const member = await store.getPaidMember(userId);
  if (!member) return "not_eligible";
  const joinedAt = member.stripeSubscriptionId ? await store.getContractStart(member.stripeSubscriptionId) : null;
  if (!joinedAt) return "not_eligible"; // 決済の記録が無い
  if (!isStandingDue(def, joinedAt, campaign.scheduledAt ?? null, now)) return "not_due";
  // 選ぶときと同じ学習の決まりで見直す（例: 書き出したあとに学んだ / 327-E で最近学んだ）
  const events = await store.listProgressEvents([userId], learningEventsSince(def.learning, joinedAt, now));
  const learningReason = learningExclusionReason(def.learning, userId, events, lessonIndex, joinedAt, now);
  if (learningReason) return learningReason;
  const capSince = new Date(now.getTime() - STANDING_CAP_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const counts = await store.countStandingMailsSince(capSince, [userId]);
  if ((counts.get(userId) ?? 0) >= STANDING_CAP_MAX) return "standing_cap";
  return null;
}

export interface TargetSelection {
  included: MemberCandidate[];
  excluded: Record<string, number>;
  candidates: number;
}

/** 候補に除外条件を当てる（純粋関数） */
export function applyExclusions(
  candidates: MemberCandidate[],
  exclusions: readonly Exclusion[],
  ctx: ExclusionContext,
): TargetSelection {
  const included: MemberCandidate[] = [];
  const excluded: Record<string, number> = {};
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.userId)) continue; // 同じ人を2回数えない
    seen.add(c.userId);
    const hit = exclusions.find((e) => e.excludes(c, ctx));
    if (hit) {
      const reason = hit.reasonOf ? hit.reasonOf(c, ctx) : hit.reason;
      excluded[reason] = (excluded[reason] ?? 0) + 1;
    } else {
      included.push(c);
    }
  }
  return { included, excluded, candidates: seen.size };
}

/** 対象を選ぶ（DB から候補と除外の材料を読み、除外条件を当てる） */
export async function selectTargets(
  store: MailStore,
  def: TargetDefinition,
  campaignId: string,
  now: Date,
): Promise<TargetSelection> {
  const category = CATEGORY_OF_KIND[def.kind];
  const [candidates, unsubscribed, suppressed, mailedThisWeek] = await Promise.all([
    def.listCandidates(store),
    store.listUnsubscribedUserIds(category),
    store.listSuppressedUserIds(),
    def.countsTowardWeeklyCap
      ? store.listUsersMailedSince(jstWeekStart(now), WEEKLY_CAP_CATEGORIES, campaignId)
      : Promise.resolve(new Set<string>()),
  ]);
  return applyExclusions(candidates, def.exclusions, {
    category,
    unsubscribed,
    suppressed,
    mailedThisWeek,
    now,
  });
}

/** 人数だけ出す結果（名前・アドレス・user_id を含めない） */
export function summarize(
  kind: MailKind,
  mode: MailMode,
  approved: boolean,
  selection: TargetSelection,
  now: Date,
): CountSummary {
  const byPlan: Record<string, number> = {};
  const byTenure: Record<string, number> = {};
  let cancelScheduled = 0;
  for (const c of selection.included) {
    const plan = `${c.planType ?? "unknown"}_${c.duration ?? "?"}m`;
    byPlan[plan] = (byPlan[plan] ?? 0) + 1;
    const t = tenureBucket(c.createdAt, now);
    byTenure[t] = (byTenure[t] ?? 0) + 1;
    if (c.cancelAtPeriodEnd) cancelScheduled += 1;
  }
  return {
    kind,
    mode,
    approved,
    candidates: selection.candidates,
    willSend: selection.included.length,
    excluded: selection.excluded,
    byPlan,
    byTenure,
    cancelScheduled,
  };
}
