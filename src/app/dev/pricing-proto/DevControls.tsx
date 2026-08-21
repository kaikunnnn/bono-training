"use client";

/**
 * 確認用コントロール（dev専用・本番では非表示）。
 * frame(A1/A2) と ctaState(guest/free/other/current) を切り替える。
 * 状態はURLクエリ（frame, cta）に反映。期間はページ上の PeriodToggle が本番UIなので扱わない。
 */

import type { CtaState, FrameOption } from "./data";
import { CTA_STATES, FRAME_OPTIONS, OPTION_LABELS } from "./data";
import { Button } from "@/components/ui/button";

interface DevControlsProps {
  frame: FrameOption;
  cta: CtaState;
  onFrame: (v: FrameOption) => void;
  onCta: (v: CtaState) => void;
}

export function DevControls({ frame, cta, onFrame, onCta }: DevControlsProps) {
  return (
    <div className="rounded-btn border border-dashed border-border bg-surface px-4 py-3 text-xs">
      <p className="font-bold text-muted-foreground">確認用（本番では非表示）</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">frame:</span>
        {FRAME_OPTIONS.map((v) => (
          <Button
            key={v}
            type="button"
            size="sm"
            variant={frame === v ? "default" : "outline"}
            onClick={() => onFrame(v)}
          >
            {OPTION_LABELS.frame[v]}
          </Button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">cta:</span>
        {CTA_STATES.map((v) => (
          <Button
            key={v}
            type="button"
            size="sm"
            variant={cta === v ? "default" : "outline"}
            onClick={() => onCta(v)}
          >
            {OPTION_LABELS.cta[v]}
          </Button>
        ))}
      </div>
    </div>
  );
}
