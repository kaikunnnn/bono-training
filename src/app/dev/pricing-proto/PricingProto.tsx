"use client";

/**
 * 料金ページ 本番プロトタイプ（採用構成）。
 *
 * - 期間トグル（本番UI）を上部に置き、standard/feedback を対等2枚で並列表示。
 * - frame(A1/A2) と ctaState は確認用コントロール（dev専用）で切替、URLクエリに反映。
 * - A2（既定）はフォーカスシェルで chrome を覆って表示、A1 は通常レイアウト内に描画。
 * - h1 は中身側に1つだけ持たせる（A1/A2 どちらでも重複しない）。
 * - CTA は Stripe を呼ばず console.log のダミーのみ。
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanDuration } from "@/types/subscription";
import {
  PROTO_PLAN_TYPES,
  getPlanPriceView,
  parseCta,
  parseFrame,
  type CtaState,
  type FrameOption,
} from "./data";
import { FocusShell } from "./FocusShell";
import { PeriodToggle } from "./PeriodToggle";
import { PlanCard } from "./PlanCard";
import { RefundNote } from "./RefundNote";
import { ConsultBlock } from "./ConsultBlock";
import { DevControls } from "./DevControls";

export function PricingProto() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const frame: FrameOption = parseFrame(searchParams.get("frame"));
  const cta: CtaState = parseCta(searchParams.get("cta"));

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

  const inner = (
    <div className={frame === "A2" ? "" : "mx-auto w-full max-w-[1040px] px-4 py-8"}>
      {/* ページ主見出し（h1 は全体で1つ） */}
      <header className="text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          料金プラン
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          学習の進め方に合わせて選べる2つのプラン。3ヶ月ごとのまとめ払いなら月あたりがお得になります。
        </p>
      </header>

      {/* 期間トグル（本番UI） */}
      <div className="mt-8 flex justify-center">
        <PeriodToggle duration={duration} onChange={setDuration} />
      </div>

      {/* プランカード（対等2枚並列 / モバイル縦積み） */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {PROTO_PLAN_TYPES.map((type) => (
          <PlanCard
            key={type}
            view={getPlanPriceView(type, duration)}
            duration={duration}
            ctaState={cta}
            recommended={type === "feedback"}
          />
        ))}
      </div>

      {/* サブスク/返金コピー（3ヶ月説明の近く） */}
      <div className="mt-6">
        <RefundNote />
      </div>

      {/* 下部の相談導線 */}
      <div className="mt-12">
        <ConsultBlock />
      </div>

      {/* 確認用コントロール（本番では非表示） */}
      <div className="mt-12">
        <DevControls
          frame={frame}
          cta={cta}
          onFrame={(v) => setQuery("frame", v)}
          onCta={(v) => setQuery("cta", v)}
        />
      </div>
    </div>
  );

  if (frame === "A2") {
    return <FocusShell>{inner}</FocusShell>;
  }

  return inner;
}
