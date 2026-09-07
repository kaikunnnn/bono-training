"use client";

/**
 * 確認用コントロール（dev専用・本番では非表示想定）。
 * D0（現行カード並列）/ D1（積み上げ式）/ D2（差分比較表）を切り替える。
 * 状態はURLクエリ（d）に反映。
 * 期間はページ上の PeriodToggle が本番UIなのでここでは扱わない。
 */

import type { DPattern } from "./data";
import { D_PATTERNS, OPTION_LABELS } from "./data";
import { Button } from "@/components/ui/button";

interface DevControlsProps {
  d: DPattern;
  onD: (v: DPattern) => void;
}

export function DevControls({ d, onD }: DevControlsProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-xs">
      <p className="font-bold text-muted-foreground">確認用（本番では非表示）</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">違いの見せ方:</span>
        {D_PATTERNS.map((v) => (
          <Button
            key={v}
            type="button"
            size="sm"
            variant={d === v ? "default" : "outline"}
            onClick={() => onD(v)}
          >
            {OPTION_LABELS.d[v]}
          </Button>
        ))}
      </div>
    </div>
  );
}
