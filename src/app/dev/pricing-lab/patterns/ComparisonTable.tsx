"use client";

import { useState } from "react";
import type { PlanType, PlanDuration } from "@/types/subscription";
import {
  FEATURE_ROWS,
  featureValue,
  getPlanPriceView,
} from "../data";
import { PriceBlock } from "../components/PriceBlock";
import { CtaButton } from "../components/CtaButton";
import { PeriodSwitch } from "../components/PeriodSwitch";
import type { PatternProps } from "./CardsParallel";

const COMMON_ROWS = FEATURE_ROWS.filter((r) => r.group === "common");
const DIFF_ROWS = FEATURE_ROWS.filter((r) => r.group === "diff");

/**
 * B3: 比較表。行=機能、列=2プラン。
 * 共通機能ブロックを上、差分ブロックを下に分ける（小見出し行 + border で区切る）。
 *
 * 期間: C1/C3 は上部の共有トグル（sharedDuration）を使う。
 * C2 選択時は列（プラン単位）ごとに独立の期間セグメントを置く。
 */
export function ComparisonTable({
  periodMode,
  sharedDuration,
  ctaState,
}: PatternProps) {
  const [stdDuration, setStdDuration] = useState<PlanDuration>(1);
  const [fbDuration, setFbDuration] = useState<PlanDuration>(1);

  const durationFor = (t: PlanType): PlanDuration => {
    if (periodMode !== "C2") return sharedDuration;
    return t === "standard" ? stdDuration : fbDuration;
  };

  const stdName = getPlanPriceView("standard", durationFor("standard")).displayName;
  const fbName = getPlanPriceView("feedback", durationFor("feedback")).displayName;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <caption className="text-left text-sm">
          プラン比較（税込）
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border p-2 text-left">
              機能
            </th>
            <th scope="col" className="border p-2 text-left">
              {stdName}
            </th>
            <th scope="col" className="border p-2 text-left">
              {fbName}（おすすめ）
            </th>
          </tr>
        </thead>
        <tbody>
          {/* 期間セグメント（C2のみ、プランごと） */}
          {periodMode === "C2" && (
            <tr>
              <th scope="row" className="border p-2 text-left">
                契約期間
              </th>
              <td className="border p-2">
                <PeriodSwitch
                  variant="segment"
                  duration={stdDuration}
                  onChange={setStdDuration}
                />
              </td>
              <td className="border p-2">
                <PeriodSwitch
                  variant="segment"
                  duration={fbDuration}
                  onChange={setFbDuration}
                />
              </td>
            </tr>
          )}

          {/* 料金 */}
          <tr>
            <th scope="row" className="border p-2 text-left">
              料金
            </th>
            <td className="border p-2">
              <PriceBlock type="standard" duration={durationFor("standard")} />
            </td>
            <td className="border p-2">
              <PriceBlock type="feedback" duration={durationFor("feedback")} />
            </td>
          </tr>

          {/* 共通機能ブロック */}
          <tr>
            <th scope="colgroup" colSpan={3} className="border p-2 text-left text-sm">
              共通の機能
            </th>
          </tr>
          {COMMON_ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="border p-2 text-left">
                {row.label}
              </th>
              <td className="border p-2">{featureValue(row, "standard")}</td>
              <td className="border p-2">{featureValue(row, "feedback")}</td>
            </tr>
          ))}

          {/* 差分ブロック */}
          <tr>
            <th scope="colgroup" colSpan={3} className="border p-2 text-left text-sm">
              プランごとの違い
            </th>
          </tr>
          {DIFF_ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="border p-2 text-left">
                {row.label}
              </th>
              <td className="border p-2">{featureValue(row, "standard")}</td>
              <td className="border p-2">{featureValue(row, "feedback")}</td>
            </tr>
          ))}

          {/* CTA */}
          <tr>
            <th scope="row" className="border p-2 text-left">
              申し込み
            </th>
            <td className="border p-2">
              <CtaButton
                plan="standard"
                duration={durationFor("standard")}
                ctaState={ctaState}
              />
            </td>
            <td className="border p-2">
              <CtaButton
                plan="feedback"
                duration={durationFor("feedback")}
                ctaState={ctaState}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
