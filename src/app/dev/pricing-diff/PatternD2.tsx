"use client";

/**
 * D2: 差分フォーカス比較表（1枚の表）
 *
 * 狙い: 視線がまず「フィードバックだけの手厚いサポート」に行くこと。
 * - 列 = スタンダード / フィードバック（おすすめ）
 * - 上ブロック「フィードバックだけの手厚いサポート」: 差分3行を大きく/太めに。
 * - 下ブロック「両プラン共通」: 共通4行を淡め（text-muted-foreground）に畳む。
 * - 差分と共通の境目を h3 + border で明確に分ける。
 *
 * CTA は Stripe を呼ばず console.log のダミーのみ。
 */

import { Button } from "@/components/ui/button";
import type { PlanDuration } from "@/types/subscription";
import {
  COMMON_ROWS,
  DIFF_ROWS,
  DIFF_PLAN_TYPES,
  featureValue,
  getCtaLabel,
  getPlanPriceView,
  isFeatureAbsent,
} from "./data";
import { PriceBlock } from "./PriceBlock";

interface PatternD2Props {
  duration: PlanDuration;
}

export function PatternD2({ duration }: PatternD2Props) {
  const views = {
    standard: getPlanPriceView("standard", duration),
    feedback: getPlanPriceView("feedback", duration),
  };

  const handleCta = (plan: (typeof DIFF_PLAN_TYPES)[number]) => {
    console.log("[pricing-diff] CTA", { pattern: "D2", plan, duration });
  };

  return (
    <div className="overflow-x-auto">
      {/* border-collapse のためセルの border-radius は効かない（角丸は付けない）。
          feedback列の枠線は border-x/border-primary で表現し、上下端は角丸なし。 */}
      <table className="w-full min-w-[560px] border-collapse text-left">
        {/* 列ヘッダ（プラン名 / 価格 / CTA） */}
        <thead>
          <tr className="align-top">
            {/* 左上の空セル（機能名列の見出し） */}
            <th scope="col" className="w-[34%] px-4 py-4">
              <span className="sr-only">機能</span>
            </th>

            <th scope="col" className="px-4 py-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {views.standard.displayName}
              </h2>
              <div className="mt-3">
                <PriceBlock view={views.standard} />
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  onClick={() => handleCta("standard")}
                >
                  {getCtaLabel("standard")}
                </Button>
              </div>
            </th>

            <th
              scope="col"
              className="border border-b-0 border-primary bg-surface px-4 py-4"
            >
              <p className="mb-1 text-xs font-bold text-primary">おすすめ</p>
              <h2 className="font-heading text-lg font-bold text-foreground">
                {views.feedback.displayName}
              </h2>
              <div className="mt-3">
                <PriceBlock view={views.feedback} />
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full"
                  variant="default"
                  onClick={() => handleCta("feedback")}
                >
                  {getCtaLabel("feedback")}
                </Button>
              </div>
            </th>
          </tr>
        </thead>

        {/* 上ブロック: フィードバックだけの手厚いサポート（差分・強調） */}
        <tbody>
          <tr>
            <th
              scope="colgroup"
              colSpan={3}
              className="border-b-2 border-primary px-4 pb-2 pt-8"
            >
              <h3 className="text-base font-bold text-primary">
                フィードバックだけの手厚いサポート
              </h3>
            </th>
          </tr>
          {DIFF_ROWS.map((row) => {
            const Icon = row.icon;
            const stdValue = featureValue(row, "standard");
            const fbValue = featureValue(row, "feedback");
            return (
              <tr key={row.label} className="border-b border-border">
                <th
                  scope="row"
                  className="px-4 py-4 text-left align-middle text-base font-bold text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      size={20}
                      className="shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {row.label}
                  </span>
                </th>
                <td className="px-4 py-4 align-middle text-base text-muted-foreground">
                  {stdValue}
                </td>
                <td className="border-x border-primary bg-surface px-4 py-4 align-middle text-base font-bold text-foreground">
                  {fbValue}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* 下ブロック: 両プラン共通（淡め・畳む） */}
        <tbody>
          <tr>
            <th
              scope="colgroup"
              colSpan={3}
              className="border-b border-border px-4 pb-2 pt-8"
            >
              <h3 className="text-sm font-bold text-muted-foreground">
                両プラン共通
              </h3>
            </th>
          </tr>
          {COMMON_ROWS.map((row, i) => {
            const Icon = row.icon;
            const isLast = i === COMMON_ROWS.length - 1;
            return (
              <tr key={row.label} className="border-b border-border">
                <th
                  scope="row"
                  className="px-4 py-3 text-left align-middle text-sm font-medium text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                    {row.label}
                  </span>
                </th>
                <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                  {isFeatureAbsent(row.standard) ? "—" : row.standard}
                </td>
                <td
                  className={`border-x border-primary bg-surface px-4 py-3 align-middle text-sm text-muted-foreground ${
                    isLast ? "border-b" : ""
                  }`}
                >
                  {isFeatureAbsent(row.feedback) ? "—" : row.feedback}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
