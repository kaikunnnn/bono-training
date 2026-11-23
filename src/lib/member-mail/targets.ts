/**
 * 会員メール（#264）の「対象を選ぶ処理」。
 *
 * 種類ごとに「候補の取り方」と「除外条件の並び」を持つ。除外条件は上から順に見て、最初に当たった理由で数える。
 * スライス1で作るのは週1回のメルマガ（weekly）だけ。②③④は TARGETS に1つ足し、除外条件を並べるだけで作れる形にしている。
 *   例（スライス3以降）: 解約予約中を除く → excludeCancelScheduled を並べる / 連絡済み(#254) → 新しい Exclusion を足す
 */
import { jstWeekStart, tenureBucket } from "./dates";
import {
  CATEGORY_OF_KIND,
  WEEKLY_CAP_CATEGORIES,
  type CountSummary,
  type MailCategory,
  type MailKind,
  type MailMode,
  type MailStore,
  type MemberCandidate,
} from "./types";

export interface ExclusionContext {
  category: MailCategory;
  unsubscribed: Set<string>;
  suppressed: Set<string>;
  /** 今週（日本時間の月曜から）すでに会員向けのお知らせ系を受け取った人 */
  mailedThisWeek: Set<string>;
  now: Date;
}

export interface Exclusion {
  /** 送信の記録・人数に残す理由（英小文字。個人情報を入れない） */
  reason: string;
  excludes(candidate: MemberCandidate, ctx: ExclusionContext): boolean;
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
      excluded[hit.reason] = (excluded[hit.reason] ?? 0) + 1;
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
