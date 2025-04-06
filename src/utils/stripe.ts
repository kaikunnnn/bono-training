
/**
 * Stripe関連のユーティリティ関数
 */

/**
 * 環境に応じた適切なStripe価格IDを取得する
 * @param isTest 強制的にテスト環境のPrice IDを使用するかどうか
 * @returns 環境に対応するStripe価格ID
 */
export const getStripePriceId = (isTest?: boolean): string => {
  // 強制的にテスト環境用Price IDを使用する場合
  if (isTest && import.meta.env.VITE_STRIPE_TEST_PRICE_ID) {
    return import.meta.env.VITE_STRIPE_TEST_PRICE_ID;
  }
  
  // 開発環境の場合はテスト用Price IDを使用
  if (import.meta.env.MODE !== 'production' && import.meta.env.VITE_STRIPE_TEST_PRICE_ID) {
    return import.meta.env.VITE_STRIPE_TEST_PRICE_ID;
  }
  
  // 本番環境または明示的なPrice IDが設定されていない場合は本番用を返す
  return import.meta.env.VITE_STRIPE_PRICE_ID || '';
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
 * 環境によって適切なPrice IDを使い分ける
 * @param isTest 強制的にテスト環境のプラン情報を取得するかどうか
 */
export const getCurrentPlan = (isTest?: boolean): PlanInfo => {
  return {
    id: 'premium',
    name: 'プレミアムプラン',
    description: 'すべての機能が利用可能なプレミアムプラン',
    priceId: getStripePriceId(isTest),
    amount: 1980,
    currency: 'jpy',
    interval: 'month'
  };
};

/**
 * Checkoutセッション作成時に使用するライン項目を取得する
 * @param isTest 強制的にテスト環境のPrice IDを使用するかどうか
 */
export const getCheckoutLineItems = (isTest?: boolean) => {
  return [
    {
      price: getStripePriceId(isTest),
      quantity: 1
    }
  ];
};
