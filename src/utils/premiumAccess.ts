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

  // プレミアムコンテンツの場合、standardまたはcommunity（feedback）プランが必要
  // 注: 'growth'プランも全コンテンツにアクセス可能
  return planType === 'standard' || planType === 'growth' || planType === 'community';
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
