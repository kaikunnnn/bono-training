/**
 * プロレーション（日割り計算）ユーティリティ
 *
 * プラン変更時の差額計算を行います。
 * - 現在のプランの残り期間分を返金
 * - 新プランの残り期間分を請求
 */

import type { PlanType } from "@/types/subscription";

export interface PlanInfo {
  type: PlanType;
  duration: 1 | 3;
  /** プランの合計金額（1ヶ月プランなら月額、3ヶ月プランなら3ヶ月合計） */
  totalPrice: number;
}

export interface ProrationResult {
  refund: number; // 現在のプランの返金額（マイナス値）
  newCharge: number; // 新プランの日割り請求額
  total: number; // 合計（refund + newCharge）
  daysRemaining: number; // 残り日数
}

/**
 * プロレーション（差額）を計算する
 *
 * @param currentPlan - 現在のプラン情報
 * @param newPlan - 新しいプラン情報
 * @param currentPeriodEnd - 現在のサブスクリプション期間終了日
 * @returns プロレーション計算結果
 */
export function calculateProration(
  currentPlan: PlanInfo,
  newPlan: PlanInfo,
  currentPeriodEnd: Date
): ProrationResult {
  // 1ヶ月を30日として計算
  const DAYS_IN_MONTH = 30;

  // 現在のプランの日割り単価（durationを考慮: 3ヶ月プランなら90日で割る）
  const currentDailyRate = currentPlan.totalPrice / (DAYS_IN_MONTH * currentPlan.duration);

  // 新プランの日割り単価
  const newDailyRate = newPlan.totalPrice / (DAYS_IN_MONTH * newPlan.duration);

  // 残り日数を計算（次回更新日までの日数）
  const now = new Date();
  const timeDiff = currentPeriodEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(
    0,
    Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  );

  // 現在のプランの返金額（マイナス値）
  const refund = -(currentDailyRate * daysRemaining);

  // 新プランの日割り請求額
  const newCharge = newDailyRate * daysRemaining;

  // 合計
  const total = refund + newCharge;

  return {
    refund: Math.round(refund),
    newCharge: Math.round(newCharge),
    total: Math.round(total),
    daysRemaining,
  };
}

/**
 * 残り日数を計算する（ヘルパー関数）
 */
export function calculateDaysRemaining(currentPeriodEnd: Date): number {
  const now = new Date();
  const timeDiff = currentPeriodEnd.getTime() - now.getTime();
  return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
}
