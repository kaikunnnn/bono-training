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

/**
 * user_subscriptions の upsert に混ぜる source_group のパッチを決める。
 *
 * - 既存行に source_group が入っていれば触らない（最初の新規契約の出どころを保持。
 *   プラン変更・更新・イベント順序の入れ替わりで上書きしない）
 * - 既存が null/行無しで、受け取った値が有効なら書く
 * - 受け取った値が無効・無しなら触らない（null で既存を消さない）
 *
 * 返り値を upsert ペイロードにスプレッドする（空オブジェクト＝source_group を触らない）。
 */
export function resolveSourceGroupPatch(
  existing: unknown,
  incoming: unknown
): { source_group?: PricingSourceGroup } {
  if (existing !== null && existing !== undefined && existing !== "") return {};
  const group = normalizePricingSourceGroup(incoming);
  return group ? { source_group: group } : {};
}
