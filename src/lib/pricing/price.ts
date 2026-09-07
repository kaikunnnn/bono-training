/**
 * 料金ページ 価格 view-model（production 集約版）。
 *
 * 価格の唯一の真実は AVAILABLE_PLANS（src/lib/subscription-utils.ts）。
 * ここでは価格リテラルを一切書かず、AVAILABLE_PLANS から view-model を算出する
 * 純関数のみを定義する。
 *
 * NOTE: クライアント（"use client" コンポーネント）からも import するため
 * `import 'server-only'` は付けない（純関数・定数のみ・DBアクセスなし）。
 *
 * 移植元: src/app/dev/pricing-diff/data.ts（価格 view-model 部分）
 */
import { AVAILABLE_PLANS, getPlanDisplayName } from "@/lib/subscription-utils";
import type { PlanType, PlanDuration } from "@/types/subscription";

/** このページで扱うプラン（standard / feedback の2種・この順） */
export const DIFF_PLAN_TYPES: PlanType[] = ["standard", "feedback"];

function findPlan(type: PlanType, duration: PlanDuration) {
  const plan = AVAILABLE_PLANS.find(
    (p) => p.type === type && p.duration === duration
  );
  if (!plan) {
    // 定義漏れは静かに握りつぶさず明示する（価格を捏造しない）
    throw new Error(`AVAILABLE_PLANS に定義がありません: ${type}/${duration}`);
  }
  return plan;
}

export interface PlanPriceView {
  type: PlanType;
  /** getPlanDisplayName 由来のプラン名（「スタンダード」「フィードバック」） */
  displayName: string;
  /** 1ヶ月プラン定義の description */
  description: string;
  /** 表示中の期間 */
  duration: PlanDuration;
  /** 表示中の期間の月額（税込） */
  monthlyForDuration: number;
  /** 1ヶ月（毎月払い）の月額 */
  monthly1m: number;
  /** 3ヶ月契約の月あたり */
  monthly3m: number;
  /** 3ヶ月契約の合計（月額 × duration） */
  total3m: number;
  /** 3ヶ月にした場合の月あたりお得額（1ヶ月 − 3ヶ月） */
  savingsPerMonth: number;
  /** 3ヶ月契約での節約総額（月あたりお得額 × duration） */
  savingsTotal3m: number;
}

/**
 * プランタイプと表示中の期間から価格 view-model を算出する。
 * 全ての数値は AVAILABLE_PLANS 由来で、価格リテラルは含まない。
 */
export function getPlanPriceView(
  type: PlanType,
  duration: PlanDuration
): PlanPriceView {
  const p1 = findPlan(type, 1);
  const p3 = findPlan(type, 3);
  const monthly1m = p1.pricePerMonth;
  const monthly3m = p3.pricePerMonth;
  const savingsPerMonth = monthly1m - monthly3m;

  return {
    type,
    displayName: getPlanDisplayName(type),
    description: p1.description,
    duration,
    monthlyForDuration: duration === 3 ? monthly3m : monthly1m,
    monthly1m,
    monthly3m,
    // duration は AVAILABLE_PLANS のプラン定義由来（3）。裸のリテラルにしない。
    total3m: monthly3m * p3.duration,
    savingsPerMonth,
    savingsTotal3m: savingsPerMonth * p3.duration,
  };
}

/** 通貨表示（桁区切り + ¥）。数値は算出済みのものを受け取る */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}
