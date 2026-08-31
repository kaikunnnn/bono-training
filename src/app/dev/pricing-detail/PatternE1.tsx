"use client";

/**
 * E1: 要約2カラム（既定）
 *
 * 狙い: スタンダード / フィードバックを左右2カラムで簡潔に見せ、
 *   「元の長い箇条書きを主要ポイントに絞る」ことで課金判断をしやすくする。
 * - 各カード: サブ見出し + 説明1〜2文 + 主要ポイント（3〜4点に絞る）+ CTA。
 * - フィードバック側は「何が変化する？」を2点に凝縮して添え、
 *   「内容を見る」で詳細（応募ページ想定）へ誘導。全部は載せない。
 *
 * 取捨の詳細（何を残し何を落としたか）は data.ts のコメントに集約。
 * CTA は Stripe を呼ばず console.log のダミーのみ。
 */

import { Button } from "@/components/ui/button";
import {
  STANDARD,
  FEEDBACK,
  FEEDBACK_CHANGES_CONDENSED,
} from "./data";
import { PointList } from "./PointList";

export function PatternE1() {
  const handleCta = (plan: string) => {
    console.log("[pricing-detail] CTA", { pattern: "E1", plan });
  };

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      {/* --- スタンダード --- */}
      <section className="flex flex-col rounded-3xl border border-border bg-surface px-6 py-8">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {STANDARD.name}
        </h2>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          {STANDARD.sub}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {STANDARD.description}
        </p>

        <div className="mt-6">
          <PointList points={STANDARD.keyPoints} />
        </div>

        <div className="mt-8">
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={() => handleCta("standard")}
          >
            {STANDARD.ctaLabel}
          </Button>
        </div>
      </section>

      {/* --- フィードバック（主眼） --- */}
      <section className="flex flex-col rounded-3xl border border-primary bg-surface px-6 py-8">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {FEEDBACK.name}
        </h2>
        <p className="mt-1 text-sm font-bold text-primary">{FEEDBACK.sub}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {FEEDBACK.description}
        </p>

        <div className="mt-6">
          <PointList points={FEEDBACK.keyPoints} />
        </div>

        {/* 「何が変化する？」を2点に凝縮して添える（全部は載せない → 内容を見る導線へ） */}
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-sm font-bold text-foreground">
            フィードバックで何が変化する？
          </h3>
          <div className="mt-3">
            <PointList points={FEEDBACK_CHANGES_CONDENSED} muted />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            className="w-full"
            variant="default"
            onClick={() => handleCta("feedback")}
          >
            {FEEDBACK.ctaLabel}
          </Button>
          {/* 「内容を見る」= 応募ページ想定のリンク（href="#" ダミー）。
              rule 03: ボタン風の生アンカー禁止 → Button asChild でラップ */}
          <Button asChild className="w-full" variant="secondary">
            <a href="#">{FEEDBACK.secondaryCtaLabel}</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
