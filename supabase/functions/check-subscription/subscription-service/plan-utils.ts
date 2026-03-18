
/**
 * プラン情報関連のユーティリティ
 */
export class PlanUtils {
  /**
   * プランタイプとメンバーシップ権限を判定
   * @param amount 金額
   * @returns [プランタイプ, トレーニングアクセス権限]
   */
  determinePlanInfo(amount: number): [string, boolean] {
    // 価格に応じてプランタイプとトレーニングアクセス権限を決定
    if (amount <= 1500) {
      // 安価なプラン: メンバーシップのみ、トレーニングはなし
      return ["community", false]; 
    } else if (amount <= 4000) {
      // 標準的なプラン: 標準プラン、トレーニングなし
      return ["standard", false];
    } else {
      // 上級プラン: 成長プラン、トレーニングあり
      return ["growth", true];
    }
  }
}
