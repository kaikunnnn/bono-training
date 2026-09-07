"use client";

/**
 * 期間トグル（C1・ページ上部）。
 * 「毎月払い」/「3ヶ月ごと（まとめてお得）」を切り替え、選択期間を親stateへ返す。
 * 共通 Button（default/outline）でセグメント表現する。
 */

import type { PlanDuration } from "@/types/subscription";
import { Button } from "@/components/ui/button";

interface PeriodToggleProps {
  duration: PlanDuration;
  onChange: (duration: PlanDuration) => void;
}

export function PeriodToggle({ duration, onChange }: PeriodToggleProps) {
  return (
    <div
      role="group"
      aria-label="支払い期間の切り替え"
      className="inline-flex items-center gap-2 rounded-btn border border-border bg-surface p-1"
    >
      <Button
        type="button"
        size="sm"
        variant={duration === 1 ? "default" : "ghost"}
        aria-pressed={duration === 1}
        onClick={() => onChange(1)}
      >
        毎月払い
      </Button>
      <Button
        type="button"
        size="sm"
        variant={duration === 3 ? "default" : "ghost"}
        aria-pressed={duration === 3}
        onClick={() => onChange(3)}
      >
        3ヶ月ごと（まとめてお得）
      </Button>
    </div>
  );
}
