
export type PlanType = 'standard' | 'growth' | 'community';
export type PlanDuration = 1 | 3 | 6; // 月単位
export type ContentAccessType = 'learning' | 'member' | 'training';

// プランの情報
export interface PlanInfo {
  type: PlanType;
  duration: PlanDuration;
  displayName: string;
  description: string;
  pricePerMonth: number; // 月額価格（単位: 円）
}

// コンテンツアクセス権限の設定
export const CONTENT_PERMISSIONS: Record<ContentAccessType, PlanType[]> = {
  learning: ['standard', 'growth', 'community'],
  member: ['growth', 'community'],
  training: ['growth'] // トレーニングコンテンツは成長プランのみでアクセス可能
};

// 利用可能なプラン定義
export const AVAILABLE_PLANS: PlanInfo[] = [
  {
    type: 'standard',
    duration: 1,
    displayName: 'スタンダード（1ヶ月）',
    description: '基本的な機能が利用できる標準プラン（1ヶ月）',
    pricePerMonth: 4000
  },
  {
    type: 'standard',
    duration: 3,
    displayName: 'スタンダード（3ヶ月）',
    description: '基本的な機能が利用できる標準プラン（3ヶ月）',
    pricePerMonth: 3800 // 3ヶ月契約で月額割引
  },
  {
    type: 'growth',
    duration: 1,
    displayName: 'グロース（1ヶ月）',
    description: '成長のための追加機能が利用できるプラン（1ヶ月）',
    pricePerMonth: 9800
  },
  {
    type: 'growth',
    duration: 3,
    displayName: 'グロース（3ヶ月）',
    description: '成長のための追加機能が利用できるプラン（3ヶ月）',
    pricePerMonth: 9300 // 3ヶ月契約で月額割引
  },
  {
    type: 'community',
    duration: 1,
    displayName: 'コミュニティ（1ヶ月）',
    description: 'コミュニティ機能を含む全機能が利用できるプラン（1ヶ月）',
    pricePerMonth: 1480
  },
  {
    type: 'community',
    duration: 6,
    displayName: 'コミュニティ（6ヶ月）',
    description: 'コミュニティ機能を含む全機能が利用できるプラン（6ヶ月）',
    pricePerMonth: 1280 // 6ヶ月契約で月額割引
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
  // アクティブなサブスクリプションがなければアクセス不可
  if (!userPlan.isActive || !userPlan.planType) {
    return false;
  }

  // プランタイプに対応するコンテンツアクセス権限があるかチェック
  const allowedPlans = CONTENT_PERMISSIONS[contentType];
  return allowedPlans.includes(userPlan.planType);
}

/**
 * プランがトレーニングコンテンツへのアクセス権限を持っているかチェックする
 * @param planType プランタイプ
 * @returns トレーニングアクセス権限があればtrue
 */
export function hasTrainingAccess(planType: PlanType | null): boolean {
  if (!planType) return false;
  return CONTENT_PERMISSIONS.training.includes(planType);
}

/**
 * プランの特典一覧を取得する
 * @param planType プランタイプ
 * @returns 特典の配列
 */
export function getPlanBenefits(planType: PlanType | null): string[] {
  const benefits = [
    '基本的な学習コンテンツへのアクセス'
  ];
  
  if (!planType) return [];
  
  if (planType === 'growth' || planType === 'community') {
    benefits.push('メンバー限定コンテンツへのアクセス');
  }
  
  if (planType === 'growth') {
    benefits.push('トレーニングプログラムへの参加');
    benefits.push('実践的なスキルを身につけるハンズオン');
  }
  
  return benefits;
}
