/**
 * Stripe Price ID から plan_type と duration を判定する関数
 *
 * 重要: Stripe の Price ID を使って判定することで、価格変更時にも安定した動作を保証します。
 * 価格（amount）ベースの判定は価格変更時に plan_type が変わってしまうため使用しません。
 */

export interface PlanInfo {
  planType: string;
  duration: number;
}

/**
 * Stripe Price ID から plan_type と duration を取得
 *
 * @param priceId - Stripe の Price ID (例: price_1OIiMRKUVUnt8GtyMGSJIH8H)
 * @returns PlanInfo オブジェクト { planType, duration }
 *
 * マッピング:
 * - price_1RStBiKUVUnt8GtynMfKweby → standard (1ヶ月)
 * - price_1RStCiKUVUnt8GtyKJiieo6d → standard (3ヶ月)
 * - price_1OIiMRKUVUnt8GtyMGSJIH8H → feedback (1ヶ月) [Growthプラン]
 * - price_1OIiMRKUVUnt8GtyttXJ71Hz → feedback (3ヶ月) [Growthプラン]
 *
 * デフォルト: standard (1ヶ月)
 */
export function getPlanInfo(priceId: string): PlanInfo {
  const planMap: Record<string, PlanInfo> = {
    price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
    price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
    price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
    price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}
