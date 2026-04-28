/**
 * サブスクリプション関連のユーティリティ関数・定数・型
 * クライアント/サーバー両方で使用可能（サーバー依存なし）
 */
import type { PlanType } from "@/types/subscription";

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
  if (!isPremium) {
    return true;
  }
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
 * 指定されたコンテンツへのアクセス権限があるかチェックする
 */
export function hasAccessToContentByPlan(
  userPlan: UserPlanInfo,
  contentType: ContentAccessType
): boolean {
  if (!userPlan || !userPlan.isActive || !userPlan.planType) {
    return false;
  }

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
