/**
 * 料金ページの出どころ（source_group）の検証・保存ルール（#213 A2 / 213-B P1 案B）。
 *
 * - 9グループはアプリ側 src/lib/activity-utils.ts の PRICING_CTA_SOURCE_GROUPS と同じ。
 *   一致は src/__tests__/lib/pricing-source.test.ts で検証している（片方だけ変えない）。
 * - DB の user_subscriptions.source_group の CHECK 制約とも同じ値。
 * - import を持たない純粋モジュール（Deno / Vitest どちらからも読める。deno.land 依存なし）。
 */

export const PRICING_SOURCE_GROUPS = [
  "lesson_lock",
  "content_lock",
  "roadmap",
  "feedback",
  "questions",
  "top",
  "nav",
  "event",
  "other",
] as const;

export type PricingSourceGroup = (typeof PRICING_SOURCE_GROUPS)[number];

/** 9グループのどれかなら返す。それ以外（無し・不正・"direct" 等）は null */
export function normalizePricingSourceGroup(
  value: unknown
): PricingSourceGroup | null {
  return typeof value === "string" &&
    (PRICING_SOURCE_GROUPS as readonly string[]).includes(value)
    ? (value as PricingSourceGroup)
    : null;
}

export interface SourceGroupPatchInput {
  /** user_subscriptions の既存行（無ければ null） */
  existing: {
    stripe_subscription_id?: string | null;
    source_group?: string | null;
  } | null;
  /** 今回のイベントの Stripe subscription id */
  incomingSubscriptionId: string | null | undefined;
  /** 今回のイベントの metadata.source_group（未検証） */
  incomingSourceGroup: unknown;
  /** 既存契約の置き換え（checkout の replace_subscription_id）＝プラン変更扱い */
  isReplacement?: boolean;
}

/**
 * user_subscriptions の upsert に混ぜる source_group のパッチを決める。
 *
 * - プラン変更（置き換え checkout）→ 触らない（元の出どころを保持）
 * - 行が無い／保存済みと違う subscription id（=新しい契約。解約後の再入会を含む）
 *   → 今回の checkout の値で上書き。値が無効・無しなら null（直接/不明）にする
 * - 同じ subscription（created と checkout.completed の重複・更新）
 *   → 既存値があれば保持。既存が null で今回の値が有効なら書く。それ以外は触らない
 *
 * 返り値を upsert ペイロードにスプレッドする（空オブジェクト＝source_group を触らない）。
 */
export function resolveSourceGroupPatch(
  input: SourceGroupPatchInput
): { source_group?: PricingSourceGroup | null } {
  if (input.isReplacement) return {};
  // 判定材料が無いときは安全側で触らない
  if (!input.incomingSubscriptionId) return {};
  const group = normalizePricingSourceGroup(input.incomingSourceGroup);
  const existingSubId = input.existing?.stripe_subscription_id ?? null;
  const isNewSubscription =
    !input.existing ||
    !existingSubId ||
    existingSubId !== input.incomingSubscriptionId;
  if (isNewSubscription) return { source_group: group };
  const existingGroup = input.existing?.source_group;
  if (existingGroup !== null && existingGroup !== undefined && existingGroup !== "") {
    return {};
  }
  return group ? { source_group: group } : {};
}
