"use client";

/**
 * 期間トグル（ページ上部の本番UI）。
 * 「毎月払い」/「3ヶ月更新」を切り替え、選択期間を親stateへ返す。
 *
 * Figma(43:4254) 準拠のセグメント表現:
 *   コンテナ = 白背景・border-border・rounded-[12px]・p-1・gap-2。
 *   ボタン   = 共通 Button（size=sm: px-4 / rounded-[10px]）。非アクティブ = ghost(text-foreground)。
 *              アクティブ = 濃色 bg-foreground(#0f172a) + text-background(白)。
 * ※ 濃色トーンは ui/button.tsx の変更を避けるため className 上書きで表現（DSトークン参照）。
 *
 * 移植元: src/app/dev/pricing-diff/PeriodToggle.tsx
 */

import type { PlanDuration } from "@/types/subscription";
import { Button } from "@/components/ui/button";

interface PeriodToggleProps {
  duration: PlanDuration;
  onChange: (duration: PlanDuration) => void;
}

// アクティブ時の濃色（Figma #0f172a = bg-foreground / text-background=白）。
// ghost variant の hover:text-accent-foreground(濃色) が効くと濃色背景に濃色文字で
// 見えなくなるため、hover:text-background(白) も明示して上書きする（twMergeで後勝ち）。
const activeClass =
  "bg-foreground text-background hover:bg-foreground/90 hover:text-background";

export function PeriodToggle({ duration, onChange }: PeriodToggleProps) {
  return (
    <div
      role="group"
      aria-label="支払い期間の切り替え"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface p-1"
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={duration === 1 ? activeClass : ""}
        aria-pressed={duration === 1}
        onClick={() => onChange(1)}
      >
        毎月払い
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={duration === 3 ? activeClass : ""}
        aria-pressed={duration === 3}
        onClick={() => onChange(3)}
      >
        3ヶ月更新
      </Button>
    </div>
  );
}
