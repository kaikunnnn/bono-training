"use client";

/**
 * プランカード（対等サイズ）。standard / feedback を並列表示する。
 * カード内の順序（重要・レビュー確定）:
 *   1. プラン名（h2）
 *   2. 説明
 *   3. 価格ブロック（PriceBlock）
 *   4. CTAボタン（価格ブロック直下）
 *   5. 機能リスト（7行）
 *
 * feedback の強調は「枠線 + おすすめラベル」のみ（濃色 dominant 化しない）。
 * CTA は本プロトタイプでは Stripe を呼ばず console.log のダミーのみ。
 */

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanDuration } from "@/types/subscription";
import type { CtaState, PlanPriceView } from "./data";
import {
  FEATURE_ROWS,
  featureValue,
  getCtaView,
  isFeatureAbsent,
} from "./data";
import { PriceBlock } from "./PriceBlock";

interface PlanCardProps {
  view: PlanPriceView;
  duration: PlanDuration;
  ctaState: CtaState;
  /** feedback を「おすすめ」として強調するか */
  recommended?: boolean;
}

export function PlanCard({
  view,
  duration,
  ctaState,
  recommended = false,
}: PlanCardProps) {
  const cta = getCtaView(ctaState, view.type);

  const handleCta = () => {
    console.log("[pricing-proto] CTA", {
      plan: view.type,
      duration,
      ctaState,
    });
  };

  return (
    <div
      className={`flex flex-col rounded-md-card border bg-surface px-6 py-8 ${
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
          variant={view.type === "feedback" ? "default" : "outline"}
          disabled={cta.disabled}
          onClick={handleCta}
        >
          {cta.label}
        </Button>
      </div>

      {/* 5. 機能リスト（7行） */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-foreground">含まれるもの</h3>
        <ul className="mt-3 space-y-2">
          {FEATURE_ROWS.map((row) => {
            const value = featureValue(row, view.type);
            const absent = isFeatureAbsent(value);
            return (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2 text-foreground">
                  {absent ? (
                    <span
                      aria-hidden="true"
                      className="inline-block h-4 w-4 shrink-0"
                    />
                  ) : (
                    <Check
                      size={16}
                      className="shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  {row.label}
                </span>
                <span
                  className={
                    absent
                      ? "text-muted-foreground"
                      : "font-medium text-foreground"
                  }
                >
                  {value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
