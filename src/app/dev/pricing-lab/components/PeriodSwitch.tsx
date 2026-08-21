"use client";

import type { PlanDuration } from "@/types/subscription";
import { getThreeMonthDuration } from "../data";

type Variant = "toggle" | "links" | "segment";

/**
 * 軸Cの期間切替UI。
 * - toggle (C1): 横トグル（1ヶ月 / 3ヶ月）
 * - links  (C3): テキストリンクで切替（3ヶ月既定）
 * - segment(C2): カード内セグメント
 *
 * 装飾禁止のため、選択中の表現は border と余白のみで示す（色は使わない）。
 */
export function PeriodSwitch({
  variant,
  duration,
  onChange,
}: {
  variant: Variant;
  duration: PlanDuration;
  onChange: (d: PlanDuration) => void;
}) {
  const months = getThreeMonthDuration();

  if (variant === "links") {
    // C3: 3ヶ月を既定表示。テキストリンクで切替
    return (
      <p className="text-sm">
        {duration === 3 ? (
          <button
            type="button"
            className="underline"
            onClick={() => onChange(1)}
          >
            1ヶ月払いにする
          </button>
        ) : (
          <button
            type="button"
            className="underline"
            onClick={() => onChange(3)}
          >
            {months}ヶ月払いにする
          </button>
        )}
      </p>
    );
  }

  // toggle (C1) / segment (C2): 見た目は同じ（border枠のセグメント）
  const items: { d: PlanDuration; label: string }[] = [
    { d: 1, label: "1ヶ月" },
    { d: 3, label: `${months}ヶ月` },
  ];

  return (
    <div className="inline-flex border text-sm">
      {items.map((it, i) => (
        <button
          key={it.d}
          type="button"
          onClick={() => onChange(it.d)}
          aria-pressed={duration === it.d}
          className={"px-3 py-1" + (i > 0 ? " border-l" : "")}
        >
          {duration === it.d ? `▶ ${it.label}` : it.label}
        </button>
      ))}
    </div>
  );
}
