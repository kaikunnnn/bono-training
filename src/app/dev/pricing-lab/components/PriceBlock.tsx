"use client";

import type { PlanType, PlanDuration } from "@/types/subscription";
import { getPlanPriceView, formatYen, getThreeMonthDuration } from "../data";

/**
 * 価格ブロック（全パターン共通）。
 * - 税込表示
 * - 3ヶ月選択時: 月あたり換算 + 1ヶ月払いとの差額(お得額)
 * 装飾禁止のため色/背景/影/角丸なし。フォントは text-sm / text-base / text-2xl のみ。
 */
export function PriceBlock({
  type,
  duration,
}: {
  type: PlanType;
  duration: PlanDuration;
}) {
  const view = getPlanPriceView(type, duration);
  const months = getThreeMonthDuration();

  return (
    <div className="my-4">
      <p className="text-2xl">
        {formatYen(view.monthlyForDuration)}
        <span className="text-sm"> / 月（税込）</span>
      </p>

      {duration === 3 ? (
        <div className="mt-2 text-sm">
          <p>{months}ヶ月契約・月あたり換算</p>
          <p>
            合計 {formatYen(view.total3m)}（税込）
          </p>
          <p>
            1ヶ月払い（{formatYen(view.monthly1m)}/月）より 月あたり{" "}
            {formatYen(view.savingsPerMonth)} お得（{months}ヶ月で{" "}
            {formatYen(view.savingsTotal3m)} 節約）
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm">
          {months}ヶ月払いにすると 月あたり {formatYen(view.savingsPerMonth)} お得
        </p>
      )}
    </div>
  );
}
