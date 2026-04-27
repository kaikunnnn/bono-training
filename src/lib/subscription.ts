import { createClient } from "@/lib/supabase/server";
import type { PlanType, SubscriptionState } from "@/types/subscription";

// 契約期間タイプ
export type PlanDuration = 1 | 3;

// コンテンツアクセスタイプ
export type ContentAccessType = "learning" | "member";

// プランの情報
export interface PlanInfo {
  type: PlanType;
  duration: PlanDuration;
  displayName: string;
  description: string;
  pricePerMonth: number;
}

// ユーザーのプラン情報
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

// 利用可能なプラン定義
export const AVAILABLE_PLANS: PlanInfo[] = [
  {
    type: "standard",
    duration: 1,
    displayName: "スタンダード（1ヶ月）",
    description: "全てのコンテンツにアクセスできる基本プラン",
    pricePerMonth: 6800,
  },
  {
    type: "standard",
    duration: 3,
    displayName: "スタンダード（3ヶ月）",
    description: "全てのコンテンツにアクセスできる基本プラン（3ヶ月で割引）",
    pricePerMonth: 5800,
  },
  {
    type: "feedback",
    duration: 1,
    displayName: "フィードバック（1ヶ月）",
    description: "全コンテンツ + フィードバック機能が利用できるプラン",
    pricePerMonth: 15800,
  },
  {
    type: "feedback",
    duration: 3,
    displayName: "フィードバック（3ヶ月）",
    description: "全コンテンツ + フィードバック機能が利用できるプラン（3ヶ月で割引）",
    pricePerMonth: 13800,
  },
];

/**
 * プレミアムコンテンツへのアクセス判定
 */
export function canAccessContent(
  isPremium: boolean,
  planType: PlanType | null
): boolean {
  // 無料コンテンツは誰でもアクセス可能
  if (!isPremium) {
    return true;
  }

  // プレミアムコンテンツの場合、有料プランが必要
  return planType === "standard" || planType === "feedback";
}

/**
 * コンテンツがロックされているかどうか
 */
export function isContentLocked(
  isPremium: boolean,
  planType: PlanType | null
): boolean {
  return !canAccessContent(isPremium, planType);
}

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

/**
 * 指定されたコンテンツへのアクセス権限があるかチェックする
 */
export function hasAccessToContentByPlan(
  userPlan: UserPlanInfo,
  contentType: ContentAccessType
): boolean {
  if (!userPlan || !userPlan.isActive || !userPlan.planType) {
    return false;
  }

  // 期限切れチェック
  if (userPlan.expiresAt) {
    const expirationDate = new Date(userPlan.expiresAt);
    const now = new Date();
    if (expirationDate < now) {
      return false;
    }
  }

  const allowedPlans = CONTENT_PERMISSIONS[contentType];
  if (!allowedPlans || !Array.isArray(allowedPlans)) {
    return false;
  }

  return allowedPlans.includes(userPlan.planType);
}

/**
 * ユーザーがメンバーコンテンツにアクセスできるかチェックする
 */
export function hasMemberAccessByPlan(userPlan: UserPlanInfo): boolean {
  return hasAccessToContentByPlan(userPlan, "member");
}

/**
 * ユーザーが学習コンテンツにアクセスできるかチェックする
 */
export function hasLearningAccessByPlan(userPlan: UserPlanInfo): boolean {
  return hasAccessToContentByPlan(userPlan, "learning");
}

/**
 * プランがメンバーコンテンツへのアクセス権限を持っているかチェックする
 */
export function hasTrainingAccess(planType: PlanType | null): boolean {
  if (!planType) return false;
  return CONTENT_PERMISSIONS.member.includes(planType);
}

/**
 * プランの特典一覧を取得する
 */
export function getPlanBenefits(planType: PlanType | null): string[] {
  const benefits: string[] = [];

  if (!planType) return ["無料コンテンツのみ利用可能"];

  if (CONTENT_PERMISSIONS.learning.includes(planType)) {
    benefits.push("学習コンテンツへのアクセス");
  }

  if (CONTENT_PERMISSIONS.member.includes(planType)) {
    benefits.push("メンバー限定コンテンツへのアクセス");
    benefits.push("トレーニングプログラムへの参加");
    benefits.push("実践的なスキルを身につけるハンズオン");
  }

  return benefits.length > 0 ? benefits : ["基本コンテンツへのアクセス"];
}

/**
 * プランタイプの安全な検証
 */
export function isValidPlanType(
  planType: string | null | undefined
): planType is PlanType {
  if (!planType) return false;
  return ["standard", "feedback"].includes(planType);
}

/**
 * プランの月額料金を取得する
 */
export function getPlanMonthlyPrice(
  planType: PlanType,
  duration: PlanDuration
): number {
  const plan = AVAILABLE_PLANS.find(
    (p) => p.type === planType && p.duration === duration
  );

  if (!plan) {
    console.error("プランが見つかりません:", { planType, duration });
    return 0;
  }

  return plan.pricePerMonth;
}

/**
 * プラン名を取得する
 */
export function getPlanDisplayName(planType: PlanType): string {
  const planNames: Record<PlanType, string> = {
    standard: "スタンダード",
    feedback: "フィードバック",
  };

  return planNames[planType] || planType;
}
