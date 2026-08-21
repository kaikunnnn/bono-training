"use client";

/**
 * 確認用コントロール（dev専用・本番では非表示想定）。
 * 相談導線の配置パターン C1〜C4 を切り替える。状態は URL クエリ（c）に反映済みで、
 * ここではボタン操作を親（PricingConsult）に伝えるだけ（クエリ反映は親が行う）。
 *
 * 各パターンの意図は 1 行注記で併記する（比較検証しやすくするため）。
 */

import { Button } from "@/components/ui/button";
import { CONSULT_OPTIONS, type ConsultPattern } from "./patterns";

interface DevControlsProps {
  c: ConsultPattern;
  onC: (v: ConsultPattern) => void;
}

export function DevControls({ c, onC }: DevControlsProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-xs">
      <p className="font-bold text-muted-foreground">確認用（本番では非表示）</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">相談導線の配置:</span>
        {CONSULT_OPTIONS.map((opt) => (
          <Button
            key={opt.key}
            type="button"
            size="sm"
            variant={c === opt.key ? "default" : "outline"}
            onClick={() => onC(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* 選択中パターンの意図（1行注記） */}
      <p className="mt-2 text-muted-foreground">
        {CONSULT_OPTIONS.find((opt) => opt.key === c)?.note}
      </p>
    </div>
  );
}
