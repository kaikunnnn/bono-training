
/**
 * Stripe関連のユーティリティ関数
 */

/**
 * 環境に応じた適切なStripe価格IDを取得する
 * @returns 環境に対応するStripe価格ID
 */
export const getStripePriceId = (): string => {
  // テスト環境か本番環境かによって異なるPrice IDを返す
  // Note: ここでは単純に環境変数を返していますが、将来的には
  // 複数のプランがある場合や、ユーザー属性による分岐なども
  // この関数に追加できます
  
  // テスト用Price IDがある場合はそれを優先（開発環境など）
  if (process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID) {
    return process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID;
  }
  
  // 本番用Price ID
  return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';
};

/**
 * 有料プランの情報
 */
export interface PlanInfo {
  id: string;
  name: string;
  description: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

/**
 * 現在のプラン情報を取得する
 * 将来的に複数プランが存在する場合は、この関数を拡張して
 * プランのリストを返すなどの対応が可能
 */
export const getCurrentPlan = (): PlanInfo => {
  return {
    id: 'premium',
    name: 'プレミアムプラン',
    description: 'すべての機能が利用可能なプレミアムプラン',
    priceId: getStripePriceId(),
    amount: 1980,
    currency: 'jpy',
    interval: 'month'
  };
};
