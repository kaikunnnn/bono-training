
/**
 * Stripe関連のユーティリティ関数
 */

import { PlanType, PlanDuration } from './subscriptionPlans';

/**
 * プランと期間に応じた適切なStripe価格IDを取得する
 * @param planType プランタイプ ('standard' | 'feedback')
 * @param duration 期間（月数: 1 | 3）
 * @returns Stripe価格ID
 */
export const getStripePriceId = (planType: PlanType, duration: PlanDuration): string => {
  // 環境変数のマッピング
  const priceIdMap: Record<PlanType, Record<PlanDuration, string>> = {
    standard: {
      1: import.meta.env.VITE_STRIPE_STANDARD_1M_PRICE_ID || '',
      3: import.meta.env.VITE_STRIPE_STANDARD_3M_PRICE_ID || '',
      6: '', // スタンダードに6ヶ月プランはない
    },
    feedback: {
      1: import.meta.env.VITE_STRIPE_FEEDBACK_1M_PRICE_ID || '',
      3: import.meta.env.VITE_STRIPE_FEEDBACK_3M_PRICE_ID || '',
      6: '', // feedbackに6ヶ月プランはない（必要なら後で追加）
    },
    growth: {
      1: '', // 今は使わない
      3: '',
      6: '',
    },
    community: {
      1: '', // community は feedback に統合
      3: '',
      6: '',
    }
  };

  const priceId = priceIdMap[planType]?.[duration];
  if (!priceId) {
    console.error(`Price ID not found for plan: ${planType}, duration: ${duration}`);
    return '';
  }

  return priceId;
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
 * プラン情報を取得する
 * @param planType プランタイプ
 * @param duration 期間（月数）
 */
export const getPlanInfo = (planType: PlanType, duration: PlanDuration): PlanInfo => {
  const planDefinitions: Record<PlanType, Record<PlanDuration, PlanInfo | null>> = {
    standard: {
      1: {
        id: 'standard-1m',
        name: 'スタンダード（1ヶ月）',
        description: '全てのコンテンツにアクセス',
        priceId: getStripePriceId('standard', 1),
        amount: 4000,
        currency: 'jpy',
        interval: 'month'
      },
      3: {
        id: 'standard-3m',
        name: 'スタンダード（3ヶ月）',
        description: '全てのコンテンツにアクセス（3ヶ月）',
        priceId: getStripePriceId('standard', 3),
        amount: 11400, // 3800円/月 × 3ヶ月
        currency: 'jpy',
        interval: 'month'
      },
      6: null
    },
    feedback: {
      1: {
        id: 'feedback-1m',
        name: 'フィードバック（1ヶ月）',
        description: '全てのコンテンツ + フィードバック機能',
        priceId: getStripePriceId('feedback', 1),
        amount: 1480,
        currency: 'jpy',
        interval: 'month'
      },
      3: {
        id: 'feedback-3m',
        name: 'フィードバック（3ヶ月）',
        description: '全てのコンテンツ + フィードバック機能（3ヶ月）',
        priceId: getStripePriceId('feedback', 3),
        amount: 3840, // 1280円/月 × 3ヶ月
        currency: 'jpy',
        interval: 'month'
      },
      6: null
    },
    growth: {
      1: null,
      3: null,
      6: null
    },
    community: {
      1: null,
      3: null,
      6: null
    }
  };

  const planInfo = planDefinitions[planType]?.[duration];
  if (!planInfo) {
    throw new Error(`Plan not found: ${planType}, duration: ${duration}`);
  }

  return planInfo;
};

/**
 * Checkoutセッション作成時に使用するライン項目を取得する
 * @param planType プランタイプ
 * @param duration 期間（月数）
 */
export const getCheckoutLineItems = (planType: PlanType, duration: PlanDuration) => {
  const priceId = getStripePriceId(planType, duration);

  if (!priceId) {
    throw new Error(`Price ID not found for plan: ${planType}, duration: ${duration}`);
  }

  return [
    {
      price: priceId,
      quantity: 1
    }
  ];
};
