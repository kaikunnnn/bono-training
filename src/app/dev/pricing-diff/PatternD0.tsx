"use client";

/**
 * D0: 現行のカード並列（standard / feedback を対等に横並び）
 *
 * 現行の料金ページと同じ「2枚のプランカードを並べる」見せ方。
 * - standard / feedback を対等サイズで横並び（モバイルは縦積み）。
 * - カード内の順序: プラン名(h2) → 説明 → PriceBlock → CTA → 全機能リスト。
 * - 全機能リストは FEATURE_ROWS 全行を、そのプランの値付きで表示する
 *   （standard の差分は「なし」もそのまま出す）。
 * - feedback は border-primary +「おすすめ」ラベルで控えめに強調（D1/D2 と同方針）。
 *
 * CTA は Stripe を呼ばず console.log のダミーのみ。
 */

import { Button } from "@/components/ui/button";
import type { PlanDuration } from "@/types/subscription";
import {
  DIFF_PLAN_TYPES,
  FEATURE_ROWS,
  featureValue,
  getCtaLabel,
  getPlanPriceView,
  isFeatureAbsent,
} from "./data";
import { FeatureRow, FeatureGradientDefs } from "./FeatureRow";
import { PriceBlock } from "./PriceBlock";

interface PatternD0Props {
  duration: PlanDuration;
}

export function PatternD0({ duration }: PatternD0Props) {
  const handleCta = (plan: (typeof DIFF_PLAN_TYPES)[number]) => {
    console.log("[pricing-diff] CTA", { pattern: "D0", plan, duration });
  };

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      {DIFF_PLAN_TYPES.map((type) => {
        const view = getPlanPriceView(type, duration);
        const recommended = type === "feedback";

        return (
          <section
            key={type}
            className={`flex flex-col rounded-3xl border bg-surface px-6 py-8 ${
              recommended ? "border-primary" : "border-border"
            }`}
          >
            {/* おすすめラベル（feedback のみ・テキスト強調のみ） */}
            {recommended && (
              <p className="mb-2 text-sm font-bold text-primary">おすすめ</p>
            )}

            {/* 1. プラン名 */}
            <h2 className="font-heading text-xl font-bold text-foreground">
              {view.displayName}
            </h2>

            {/* 2. 説明 */}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {view.description}
            </p>

            {/* 3. 価格ブロック */}
            <div className="mt-6">
              <PriceBlock view={view} />
            </div>

            {/* 4. CTAボタン（価格ブロック直下） */}
            <div className="mt-6">
              <Button
                type="button"
                className="w-full"
                variant={recommended ? "default" : "outline"}
                onClick={() => handleCta(type)}
              >
                {getCtaLabel(type)}
              </Button>
            </div>

            {/* 5. 全機能リスト（FEATURE_ROWS 全行・そのプランの値）。
                feedback の限定項目（group==="diff"）だけ、文字とアイコンに
                ブランドの check グラデ（ピンク→ティール）を適用して目立たせる。 */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-foreground">
                含まれるもの
              </h3>
              {recommended && <FeatureGradientDefs />}
              <ul className="mt-3 space-y-2">
                {FEATURE_ROWS.map((row) => {
                  const value = featureValue(row, type);
                  return (
                    <FeatureRow
                      key={row.label}
                      row={row}
                      value={value}
                      absent={isFeatureAbsent(value)}
                      gradient={recommended && row.group === "diff"}
                    />
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
