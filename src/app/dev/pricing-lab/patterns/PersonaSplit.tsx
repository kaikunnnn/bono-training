"use client";

import { useState } from "react";
import type { PlanType } from "@/types/subscription";
import { PLAN_PERSONA } from "../data";
import { PlanCard, type PatternProps } from "./CardsParallel";

/**
 * B2: ペルソナ分岐。
 * 先に2択（自分のペース / 添削で伸ばす）を提示し、選んだ方を主(先・大きめ)、
 * もう一方を従(後・小さめ)として表示する。
 * 既定は standard を主とする（決定論的な描画のため）。選択状態はローカルstate。
 */
export function PersonaSplit({
  periodMode,
  sharedDuration,
  ctaState,
}: PatternProps) {
  const [primary, setPrimary] = useState<PlanType>("standard");
  const secondary: PlanType = primary === "standard" ? "feedback" : "standard";

  return (
    <div>
      {/* 2択UI */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setPrimary("standard")}
          aria-pressed={primary === "standard"}
          className="border px-4 py-2 text-base"
        >
          {primary === "standard" ? "▶ " : ""}
          自分のペースで進めたい
        </button>
        <button
          type="button"
          onClick={() => setPrimary("feedback")}
          aria-pressed={primary === "feedback"}
          className="border px-4 py-2 text-base"
        >
          {primary === "feedback" ? "▶ " : ""}
          添削で確実に伸ばしたい
        </button>
      </div>

      {/* 主（大きめ text-base 見出し） */}
      <section className="mb-8">
        <p className="text-sm">あなたにおすすめ: {PLAN_PERSONA[primary]}</p>
        <PlanCard
          type={primary}
          periodMode={periodMode}
          sharedDuration={sharedDuration}
          ctaState={ctaState}
          recommended={primary === "feedback"}
        />
      </section>

      {/* 従（小さめ text-sm 見出しのカード） */}
      <section className="text-sm">
        <p>もう一方のプラン: {PLAN_PERSONA[secondary]}</p>
        <PlanCard
          type={secondary}
          periodMode={periodMode}
          sharedDuration={sharedDuration}
          ctaState={ctaState}
          recommended={secondary === "feedback"}
          titleTag="h4"
        />
      </section>
    </div>
  );
}
