
/**
 * サブスクリプション関連の型定義
 */

export interface UserSubscription {
  user_id: string;
  is_active: boolean;
  plan_type: string;
  plan_members: boolean; // メンバー向けトレーニングコンテンツへのアクセス権限
  stripe_subscription_id: string | null;
}

export interface StripeSubscriptionInfo {
  id: string;
  status: string;
  current_period_end: number;
}

export interface CheckSubscriptionResponse {
  subscribed: boolean;
  planType: string | null;
  planMembers: boolean; // メンバー向けトレーニングコンテンツへのアクセス権限
  dbData?: any;
  testMode?: boolean;
  error?: string;
}
