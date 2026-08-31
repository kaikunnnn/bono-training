"use client";

import { useState } from "react";
import type { PlanType, PlanDuration } from "@/types/subscription";
import {
  FEATURE_ROWS,
  featureValue,
  getPlanPriceView,
  type CtaState,
  type PeriodOption,
} from "../data";
import { PriceBlock } from "../components/PriceBlock";
import { CtaButton } from "../components/CtaButton";
import { PeriodSwitch } from "../components/PeriodSwitch";

export interface PatternProps {
  periodMode: PeriodOption;
  sharedDuration: PlanDuration;
  ctaState: CtaState;
  onPlansChange?: (p: "B3") => void;
}

/** カード内の機能リスト（全7行） */
function FeatureList({ type }: { type: PlanType }) {
  return (
    <ul className="mt-4 text-sm">
      {FEATURE_ROWS.map((row) => (
        <li key={row.label} className="border-t py-1">
          {row.label}: {featureValue(row, type)}
        </li>
      ))}
    </ul>
  );
}

/** 1枚のプランカード。C2のときはカードごとに独立の期間stateを持つ */
export function PlanCard({
  type,
  periodMode,
  sharedDuration,
  ctaState,
  recommended,
  titleTag = "h3",
}: {
  type: PlanType;
  periodMode: PeriodOption;
  sharedDuration: PlanDuration;
  ctaState: CtaState;
  recommended?: boolean;
  titleTag?: "h3" | "h4";
}) {
  const [localDuration, setLocalDuration] = useState<PlanDuration>(1);
  const duration = periodMode === "C2" ? localDuration : sharedDuration;
  const view = getPlanPriceView(type, duration);
  const TitleTag = titleTag;

  return (
    <div className="border p-4">
      <TitleTag className="text-base">
        {view.displayName}
        {recommended ? "（おすすめ）" : ""}
      </TitleTag>

      {periodMode === "C2" && (
        <div className="mt-2">
          <PeriodSwitch
            variant="segment"
            duration={localDuration}
            onChange={setLocalDuration}
          />
        </div>
      )}

      <PriceBlock type={type} duration={duration} />
      <p className="text-sm">{view.description}</p>
      <FeatureList type={type} />
      <div className="mt-4">
        <CtaButton plan={type} duration={duration} ctaState={ctaState} />
      </div>
    </div>
  );
}

/** B1: カード2枚を横並び（モバイルは縦積み） */
export function CardsParallel({
  periodMode,
  sharedDuration,
  ctaState,
}: PatternProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PlanCard
        type="standard"
        periodMode={periodMode}
        sharedDuration={sharedDuration}
        ctaState={ctaState}
      />
      <PlanCard
        type="feedback"
        periodMode={periodMode}
        sharedDuration={sharedDuration}
        ctaState={ctaState}
        recommended
      />
    </div>
  );
}
