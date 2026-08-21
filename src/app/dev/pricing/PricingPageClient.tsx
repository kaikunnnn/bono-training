"use client";

/**
 * 料金ページ 本番プロト（/dev/pricing）。
 *
 * 構成（縦積み）:
 *  1. 導入セクション（h2「BONOをはじめよう」＋サブコピー＋下のプランへ飛ぶ小リンク2つ）
 *  2. 価格カードセクション（PlanCards）— /plan 準拠の説得コピー入りカード×2。
 *     「メンバーシップ」見出し・期間トグル・価格カードは PlanCards が内包する。
 *
 * 見出し階層:
 *  h1（料金プラン: sr-only）→ h2（導入）→ h2（PlanCards のメンバーシップ見出し）→
 *  h3（プラン名）→ h4（解放機能）。レベル飛びなし。
 *
 * 価格の数値/price_id はこのページに書かず、pricing-diff の価格ロジックを再利用する。
 * CTA・再開リンクは Stripe を呼ばず console.log / href="#" のダミー。
 */

import { useState } from "react";
import type { PlanDuration } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { PlanCards } from "./PlanCards";

export function PricingPageClient() {
  // 期間state（本番トグルで操作）。既定は3ヶ月主軸。
  const [duration, setDuration] = useState<PlanDuration>(3);

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-8">
      {/* ページ主見出し（h1 は全体で1つ） */}
      <h1 className="sr-only">料金プラン</h1>

      {/* 1. 導入セクション */}
      <section className="text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          BONOをはじめよう
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          プランを選択してBONOでの学習をはじめましょう。
        </p>

        {/* 下のプラン説明へ飛ぶ小リンク（共通Button・小さめ） */}
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <a href="#std">スタンダード</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="#feedback">フィードバック</a>
          </Button>
        </div>
      </section>

      {/* 2. 価格カードセクション（/plan 準拠） */}
      <div className="mt-10">
        <PlanCards duration={duration} onDurationChange={setDuration} />
      </div>
    </div>
  );
}
