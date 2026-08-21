"use client";

/**
 * D1: 積み上げ式（feedback = standard + 人のサポート）
 *
 * 狙い: サポートが "上に積まれる" のが直感的に分かること。
 * - standardカード: 共通機能（解説動画/コミュニティ/質問/勉強会）を列挙。差分は出さない。
 * - feedbackカード（主眼）: 冒頭に「スタンダードの内容をすべて含む」を1行明示し、
 *   その下に強調ブロック「＋ プロによる添削サポート」として差分3つを大きめに見せる。
 *
 * CTA は Stripe を呼ばず console.log のダミーのみ。
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanDuration } from "@/types/subscription";
import {
  COMMON_ROWS,
  DIFF_ROWS,
  DIFF_PLAN_TYPES,
  featureValue,
  getCtaLabel,
  getPlanPriceView,
} from "./data";
import { FeatureRow } from "./FeatureRow";
import { PriceBlock } from "./PriceBlock";

interface PatternD1Props {
  duration: PlanDuration;
}

export function PatternD1({ duration }: PatternD1Props) {
  const standardView = getPlanPriceView("standard", duration);
  const feedbackView = getPlanPriceView("feedback", duration);

  const handleCta = (plan: (typeof DIFF_PLAN_TYPES)[number]) => {
    console.log("[pricing-diff] CTA", { pattern: "D1", plan, duration });
  };

  // 共通機能名の簡潔な並び（feedbackカードの「すべて含む」1行に使う）
  const commonLabels = COMMON_ROWS.map((r) => r.label).join("・");

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      {/* --- スタンダードカード（土台） --- */}
      <section className="flex flex-col rounded-3xl border border-border bg-surface px-6 py-8">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {standardView.displayName}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          学習に必要な土台がそろう基本プラン
        </p>

        <div className="mt-6">
          <PriceBlock view={standardView} />
        </div>

        <div className="mt-6">
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={() => handleCta("standard")}
          >
            {getCtaLabel("standard")}
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-bold text-foreground">含まれるもの</h3>
          <ul className="mt-3 space-y-2">
            {COMMON_ROWS.map((row) => (
              <FeatureRow
                key={row.label}
                row={row}
                value={featureValue(row, "standard")}
              />
            ))}
          </ul>
        </div>
      </section>

      {/* --- フィードバックカード（主眼・積み上げ） --- */}
      <section className="flex flex-col rounded-3xl border border-primary bg-surface px-6 py-8">
        <p className="mb-2 text-sm font-bold text-primary">おすすめ</p>

        <h2 className="font-heading text-xl font-bold text-foreground">
          {feedbackView.displayName}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          学習に加えて、プロが直接あなたの成果物を見てくれるプラン
        </p>

        <div className="mt-6">
          <PriceBlock view={feedbackView} />
        </div>

        <div className="mt-6">
          <Button
            type="button"
            className="w-full"
            variant="default"
            onClick={() => handleCta("feedback")}
          >
            {getCtaLabel("feedback")}
          </Button>
        </div>

        {/* 「スタンダードの内容をすべて含む」を線で区切って明示（背景塗りは使わない） */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm text-foreground">
            <span className="font-bold">
              {standardView.displayName}の内容をすべて含む
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {commonLabels} をすべて含む
          </p>
        </div>

        {/* 「＋ プロによる添削サポート」（差分3つ。サイズ・アイコンは共通行と統一） */}
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Plus size={16} className="shrink-0" aria-hidden="true" />
            プロによる添削サポート
          </h3>
          <ul className="mt-3 space-y-2">
            {DIFF_ROWS.map((row) => (
              <FeatureRow
                key={row.label}
                row={row}
                value={featureValue(row, "feedback")}
              />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
