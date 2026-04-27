import 'server-only'
/**
 * サブスクリプション関連のサーバー専用関数
 * Server Component / Server Action からのみ使用可能
 *
 * クライアントコンポーネントからは @/lib/subscription-utils を使用すること
 */
import { createClient } from "@/lib/supabase/server";
import type { PlanType, SubscriptionState } from "@/types/subscription";

// ユーティリティ関数・定数を re-export（Server Component の既存importを壊さない）
export {
  canAccessContent,
  isContentLocked,
  hasAccessToContentByPlan,
  hasMemberAccessByPlan,
  hasLearningAccessByPlan,
  hasTrainingAccess,
  getPlanBenefits,
  isValidPlanType,
  getPlanMonthlyPrice,
  getPlanDisplayName,
  CONTENT_PERMISSIONS,
  AVAILABLE_PLANS,
} from "@/lib/subscription-utils";

export type {
  PlanDuration,
  ContentAccessType,
  PlanInfo,
  UserPlanInfo,
} from "@/lib/subscription-utils";

/**
 * サーバーサイドでサブスクリプション状態を取得
 */
export async function getSubscriptionStatus(): Promise<SubscriptionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isLoggedIn: false,
      isSubscribed: false,
      planType: null,
      duration: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      renewalDate: null,
      hasMemberAccess: false,
      hasLearningAccess: false,
    };
  }

  // 環境に応じたフィルタ（test/live混在を防止）
  const environment = process.env.NODE_ENV === "production" ? "live" : "test";

  // 直接データベースから購読情報を取得
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select(
      "plan_type, duration, is_active, cancel_at_period_end, cancel_at, current_period_end"
    )
    .eq("user_id", user.id)
    .eq("environment", environment)
    .maybeSingle();

  if (error || !subscription) {
    return {
      isLoggedIn: true,
      isSubscribed: false,
      planType: null,
      duration: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      renewalDate: null,
      hasMemberAccess: false,
      hasLearningAccess: false,
    };
  }

  const isActive = subscription.is_active || false;
  const planType = (subscription.plan_type as PlanType) || null;
  const duration = subscription.duration || null;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
  const cancelAt = subscription.cancel_at || null;
  const currentPeriodEnd = subscription.current_period_end || null;

  // renewalDate の決定
  const renewalDate =
    cancelAtPeriodEnd && cancelAt ? cancelAt : currentPeriodEnd;

  // アクセス権限を計算
  const hasMemberAccess =
    isActive && (planType === "standard" || planType === "feedback");
  const hasLearningAccess =
    isActive && (planType === "standard" || planType === "feedback");

  return {
    isLoggedIn: true,
    isSubscribed: isActive,
    planType,
    duration,
    cancelAtPeriodEnd,
    cancelAt,
    renewalDate,
    hasMemberAccess,
    hasLearningAccess,
  };
}

/**
 * サーバーサイドでユーザー情報を取得
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
