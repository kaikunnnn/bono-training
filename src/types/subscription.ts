// プランタイプ
export type PlanType = "standard" | "feedback";

// プラン期間
export type PlanDuration = 1 | 3;

// コンテンツアクセスタイプ
export type ContentAccessType = "learning" | "member";

// サブスクリプション状態
export interface SubscriptionState {
  isLoggedIn: boolean;
  isSubscribed: boolean;
  planType: PlanType | null;
  duration: PlanDuration | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  renewalDate: string | null;
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
}

// ユーザープラン情報
export interface UserPlanInfo {
  planType: PlanType | null;
  isActive: boolean;
  expiresAt?: string | null;
}

// コンテンツアクセス権限の設定
export const CONTENT_PERMISSIONS: Record<ContentAccessType, PlanType[]> = {
  learning: ["standard", "feedback"],
  member: ["standard", "feedback"],
};

// プレミアムコンテンツにアクセスできるプラン
export const PREMIUM_ACCESS_PLANS: PlanType[] = ["standard", "feedback"];
