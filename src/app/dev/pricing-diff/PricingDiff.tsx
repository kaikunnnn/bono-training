"use client";

/**
 * 料金ページ「違いの見せ方」検討（D0/D1/D2）統合。
 *
 * - スタンダード↔フィードバックの違い（＝フィードバックはサポートが手厚い）の
 *   見せ方を D0（現行カード並列）/ D1（積み上げ式）/ D2（差分フォーカス比較表）で
 *   切り替えて比較する。
 * - d(D0/D1/D2) は確認用コントロールで切替、URLクエリ(d)に反映。
 * - 期間トグル（C1）は本番UIとしてページ上に置く（既定=3ヶ月ごと）。
 * - h1 はページ全体で1つだけ。
 * - CTA は Stripe を呼ばず console.log のダミーのみ（各Patternコンポーネント内）。
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanDuration } from "@/types/subscription";
import { parseDPattern, type DPattern } from "./data";
import { PeriodToggle } from "./PeriodToggle";
import { PatternD0 } from "./PatternD0";
import { PatternD1 } from "./PatternD1";
import { PatternD2 } from "./PatternD2";
import { DevControls } from "./DevControls";

export function PricingDiff() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const d: DPattern = parseDPattern(searchParams.get("d"));

  // 期間state（本番トグルで操作）。既定は3ヶ月主軸。
  const [duration, setDuration] = useState<PlanDuration>(3);

  const setQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-8">
      {/* ページ主見出し（h1 は全体で1つ） */}
      <header className="text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          プランの違い
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          スタンダードとフィードバックの違いは「プロによる添削サポート」があるかどうか。
          学習に必要な土台は共通で、フィードバックはそこに人のサポートが加わります。
        </p>
      </header>

      {/* 期間トグル（本番UI・C1） */}
      <div className="mt-8 flex justify-center">
        <PeriodToggle duration={duration} onChange={setDuration} />
      </div>

      {/* 違いの見せ方（D0/D1/D2 切替） */}
      <div className="mt-8">
        {d === "D0" ? (
          <PatternD0 duration={duration} />
        ) : d === "D1" ? (
          <PatternD1 duration={duration} />
        ) : (
          <PatternD2 duration={duration} />
        )}
      </div>

      {/* 確認用コントロール（本番では非表示） */}
      <div className="mt-12">
        <DevControls d={d} onD={(v) => setQuery("d", v)} />
      </div>
    </div>
  );
}
