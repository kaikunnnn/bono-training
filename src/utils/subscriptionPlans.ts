
export type PlanType = 'standard' | 'feedback'; // .envに合わせて修正
export type PlanDuration = 1 | 3; // .envに合わせて修正（1ヶ月 or 3ヶ月）
export type ContentAccessType = 'learning' | 'member'; // 'training'を削除し、'member'に統一

// プランの情報
export interface PlanInfo {
  type: PlanType;
  duration: PlanDuration;
  displayName: string;
  description: string;
  pricePerMonth: number; // 月額価格（単位: 円）
}

// コンテンツアクセス権限の設定（.envに合わせて修正）
export const CONTENT_PERMISSIONS: Record<ContentAccessType, PlanType[]> = {
  learning: ['standard', 'feedback'], // learningは両プランでアクセス可能
  member: ['standard', 'feedback'], // memberは両プランでアクセス可能
};

// 利用可能なプラン定義（.envに合わせて修正）
export const AVAILABLE_PLANS: PlanInfo[] = [
  {
    type: 'standard',
    duration: 1,
    displayName: 'スタンダード（1ヶ月）',
    description: '全てのコンテンツにアクセスできる基本プラン',
    pricePerMonth: 4000
  },
  {
    type: 'standard',
    duration: 3,
    displayName: 'スタンダード（3ヶ月）',
    description: '全てのコンテンツにアクセスできる基本プラン（3ヶ月で割引）',
    pricePerMonth: 3800 // 3ヶ月契約で月額割引
  },
  {
    type: 'feedback',
    duration: 1,
    displayName: 'フィードバック（1ヶ月）',
    description: '全コンテンツ + フィードバック機能が利用できるプラン',
    pricePerMonth: 1480
  },
  {
    type: 'feedback',
    duration: 3,
    displayName: 'フィードバック（3ヶ月）',
    description: '全コンテンツ + フィードバック機能が利用できるプラン（3ヶ月で割引）',
    pricePerMonth: 1280 // 3ヶ月契約で月額割引
  }
];

// ユーザーのプラン情報
export interface UserPlanInfo {
  planType: PlanType | null;
  isActive: boolean;
  expiresAt?: string | null;
}

/**
 * 指定されたコンテンツへのアクセス権限があるかチェックする
 * @param userPlan ユーザーのプラン情報
 * @param contentType コンテンツタイプ
 * @returns アクセス権限があればtrue
 */
export function hasAccessToContent(userPlan: UserPlanInfo, contentType: ContentAccessType): boolean {
  // null/undefined の安全なチェック
  if (!userPlan || !userPlan.isActive || !userPlan.planType) {
    return false;
  }

  // 期限切れチェック（expiresAtが設定されている場合）
  if (userPlan.expiresAt) {
    const expirationDate = new Date(userPlan.expiresAt);
    const now = new Date();
    if (expirationDate < now) {
      console.warn('プランが期限切れです:', { expiresAt: userPlan.expiresAt, planType: userPlan.planType });
      return false;
    }
  }

  // プランタイプに対応するコンテンツアクセス権限があるかチェック
  const allowedPlans = CONTENT_PERMISSIONS[contentType];
  if (!allowedPlans || !Array.isArray(allowedPlans)) {
    console.error('無効なコンテンツタイプです:', contentType);
    return false;
  }
  
  return allowedPlans.includes(userPlan.planType);
}

/**
 * ユーザーがメンバーコンテンツ（Trainingコンテンツ含む）にアクセスできるかチェックする
 * @param userPlan ユーザーのプラン情報
 * @returns メンバーアクセス権限があればtrue
 */
export function hasMemberAccess(userPlan: UserPlanInfo): boolean {
  return hasAccessToContent(userPlan, 'member');
}

/**
 * ユーザーが学習コンテンツにアクセスできるかチェックする
 * @param userPlan ユーザーのプラン情報  
 * @returns 学習アクセス権限があればtrue
 */
export function hasLearningAccess(userPlan: UserPlanInfo): boolean {
  return hasAccessToContent(userPlan, 'learning');
}

/**
 * プランがメンバーコンテンツへのアクセス権限を持っているかチェックする（後方互換性）
 * @param planType プランタイプ
 * @returns メンバーアクセス権限があればtrue
 */
export function hasTrainingAccess(planType: PlanType | null): boolean {
  if (!planType) return false;
  return CONTENT_PERMISSIONS.member.includes(planType);
}

/**
 * プランの特典一覧を取得する
 * @param planType プランタイプ
 * @returns 特典の配列
 */
export function getPlanBenefits(planType: PlanType | null): string[] {
  const benefits: string[] = [];
  
  if (!planType) return ['無料コンテンツのみ利用可能'];
  
  if (CONTENT_PERMISSIONS.learning.includes(planType)) {
    benefits.push('学習コンテンツへのアクセス');
  }
  
  if (CONTENT_PERMISSIONS.member.includes(planType)) {
    benefits.push('メンバー限定コンテンツへのアクセス');
    benefits.push('トレーニングプログラムへの参加');
    benefits.push('実践的なスキルを身につけるハンズオン');
  }
  
  return benefits.length > 0 ? benefits : ['基本コンテンツへのアクセス'];
}

/**
 * プランタイプの安全な検証
 * @param planType 検証するプランタイプ
 * @returns 有効なプランタイプかどうか
 */
export function isValidPlanType(planType: string | null | undefined): planType is PlanType {
  if (!planType) return false;
  return ['standard', 'feedback'].includes(planType);
}
