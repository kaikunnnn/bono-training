"use client";

import { useState } from "react";
import type { PlanType, PlanDuration } from "@/types/subscription";
import {
  FEATURE_ROWS,
  featureValue,
  getPlanPriceView,
  PLAN_PERSONA,
} from "../data";
import { PriceBlock } from "../components/PriceBlock";
import { CtaButton } from "../components/CtaButton";
import { PeriodSwitch } from "../components/PeriodSwitch";
import type { PatternProps } from "./CardsParallel";

/**
 * B4: タブ集中（Figma PATTERN C）。
 * 上部にプラン選択タブ、選んだ1プランだけを表示する。
 * 末尾に B3(比較表) へ切替えるテキストリンク。
 *
 * 期間: C1/C3 は共有トグル。C2 選択時はタブ内にセグメントを置く。
 */
export function TabbedFocus({
  periodMode,
  sharedDuration,
  ctaState,
  onPlansChange,
}: PatternProps) {
  const [active, setActive] = useState<PlanType>("standard");
  const [localDuration, setLocalDuration] = useState<PlanDuration>(1);
  const duration = periodMode === "C2" ? localDuration : sharedDuration;
  const view = getPlanPriceView(active, duration);

  const tabs: PlanType[] = ["standard", "feedback"];

  return (
    <div>
      {/* プラン選択タブ */}
      <div className="mb-6 inline-flex border text-base">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            aria-pressed={active === t}
            className={"px-4 py-2" + (i > 0 ? " border-l" : "")}
          >
            {active === t ? "▶ " : ""}
            {getPlanPriceView(t, duration).displayName}
            {t === "feedback" ? "（おすすめ）" : ""}
          </button>
        ))}
      </div>

      {/* 選択プラン */}
      <div className="border p-4">
        <h3 className="text-base">{view.displayName}</h3>

        {periodMode === "C2" && (
          <div className="mt-2">
            <PeriodSwitch
              variant="segment"
              duration={localDuration}
              onChange={setLocalDuration}
            />
          </div>
        )}

        <PriceBlock type={active} duration={duration} />

        <h4 className="text-base">こんな方におすすめ</h4>
        <p className="text-sm">{PLAN_PERSONA[active]}</p>

        <ul className="mt-4 text-sm">
          {FEATURE_ROWS.map((row) => (
            <li key={row.label} className="border-t py-1">
              {row.label}: {featureValue(row, active)}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <CtaButton plan={active} duration={duration} ctaState={ctaState} />
        </div>
      </div>

      {/* B3 へのテキストリンク */}
      <p className="mt-4 text-sm">
        <button
          type="button"
          className="underline"
          onClick={() => onPlansChange?.("B3")}
        >
          両プランのより詳細な違いを比較する
        </button>
      </p>
    </div>
  );
}
