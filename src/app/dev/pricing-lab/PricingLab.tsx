"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanDuration } from "@/types/subscription";
import {
  parseFrame,
  parsePlans,
  parsePeriod,
  parseCta,
  PATTERN_TITLES,
  type FrameOption,
  type PlansOption,
  type PeriodOption,
  type CtaState,
} from "./data";
import { ControlBar } from "./components/ControlBar";
import { PeriodSwitch } from "./components/PeriodSwitch";
import { ConsultBlock } from "./components/ConsultBlock";
import { FocusFrame } from "./components/FocusFrame";
import { CardsParallel } from "./patterns/CardsParallel";
import { PersonaSplit } from "./patterns/PersonaSplit";
import { ComparisonTable } from "./patterns/ComparisonTable";
import { TabbedFocus } from "./patterns/TabbedFocus";

export function PricingLab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const frame: FrameOption = parseFrame(searchParams.get("frame"));
  const plans: PlansOption = parsePlans(searchParams.get("plans"));
  const period: PeriodOption = parsePeriod(searchParams.get("period"));
  const cta: CtaState = parseCta(searchParams.get("cta"));

  // C1/C3 で共有する期間state（C2はカード側で独立管理）
  const [sharedDuration, setSharedDuration] = useState<PlanDuration>(
    period === "C3" ? 3 : 1
  );

  const setQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handlePeriod = useCallback(
    (v: PeriodOption) => {
      setQuery("period", v);
      // 期間方式の切替に応じて共有期間を初期化する（effectで争わない）
      if (v === "C3") setSharedDuration(3);
      else if (v === "C1") setSharedDuration(1);
    },
    [setQuery]
  );

  const patternProps = {
    periodMode: period,
    sharedDuration,
    ctaState: cta,
  };

  const patternNode = (() => {
    switch (plans) {
      case "B2":
        return <PersonaSplit {...patternProps} />;
      case "B3":
        return <ComparisonTable {...patternProps} />;
      case "B4":
        return (
          <TabbedFocus
            {...patternProps}
            onPlansChange={(p) => setQuery("plans", p)}
          />
        );
      case "B1":
      default:
        return <CardsParallel {...patternProps} />;
    }
  })();

  const inner = (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl">料金ページ 構造パターン検証ラボ</h1>
      <p className="mt-2 text-sm">
        frame={frame} / plans={plans} / period={period} / cta={cta}
      </p>

      <div className="mt-6">
        <ControlBar
          frame={frame}
          plans={plans}
          period={period}
          cta={cta}
          onFrame={(v) => setQuery("frame", v)}
          onPlans={(v) => setQuery("plans", v)}
          onPeriod={handlePeriod}
          onCta={(v) => setQuery("cta", v)}
        />
      </div>

      {/* 上部の期間コントロール（C1: トグル / C3: リンク / C2: カード内のため非表示） */}
      <div className="mt-6">
        {period === "C1" && (
          <PeriodSwitch
            variant="toggle"
            duration={sharedDuration}
            onChange={setSharedDuration}
          />
        )}
        {period === "C3" && (
          <PeriodSwitch
            variant="links"
            duration={sharedDuration}
            onChange={setSharedDuration}
          />
        )}
        {period === "C2" && (
          <p className="text-sm">
            期間は各プラン内で切り替えます（C2）。
            {plans === "B3"
              ? "比較表では各列に期間セグメントを表示します。"
              : ""}
          </p>
        )}
      </div>

      {/* 選択中のパターン */}
      <section className="mt-8">
        <h2 className="text-2xl">{PATTERN_TITLES[plans]}</h2>
        <div className="mt-4">{patternNode}</div>
      </section>

      <ConsultBlock />
    </div>
  );

  if (frame === "A2") {
    return <FocusFrame>{inner}</FocusFrame>;
  }

  return inner;
}
