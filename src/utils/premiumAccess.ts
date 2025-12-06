import { PlanType } from './subscriptionPlans';

/**
 * プレミアムコンテンツへのアクセス判定
 *
 * @param isPremium コンテンツがプレミアムかどうか
 * @param planType ユーザーの現在のプランタイプ
 * @returns アクセス可能な場合true
 */
export const canAccessContent = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  // 無料コンテンツは誰でもアクセス可能
  if (!isPremium) {
    return true;
  }

  // プレミアムコンテンツの場合、有料プラン（standard, feedback, growth, community）が必要
  // feedback: Growthプラン（Stripe Price ID: price_1OIiMRKUVUnt8GtyMGSJIH8H）
  // standard: Standardプラン（Stripe Price ID: price_1RStBiKUVUnt8GtynMfKweby）
  return planType === 'standard' || planType === 'growth' || planType === 'community' || planType === 'feedback';
};

/**
 * コンテンツがロックされているかどうか
 *
 * @param isPremium コンテンツがプレミアムかどうか
 * @param planType ユーザーの現在のプランタイプ
 * @returns ロックされている場合true
 */
export const isContentLocked = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  return !canAccessContent(isPremium, planType);
};
