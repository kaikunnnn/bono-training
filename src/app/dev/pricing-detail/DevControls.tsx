"use client";

/**
 * 確認用コントロール（dev専用・本番では非表示想定）。
 * E1（要約2カラム）/ E2（変化ストーリー）を切り替える。状態はURLクエリ（p）に反映。
 */

import type { EPattern } from "./data";
import { E_PATTERNS, OPTION_LABELS } from "./data";
import { Button } from "@/components/ui/button";

interface DevControlsProps {
  p: EPattern;
  onP: (v: EPattern) => void;
}

export function DevControls({ p, onP }: DevControlsProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-xs">
      <p className="font-bold text-muted-foreground">確認用（本番では非表示）</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">簡潔化パターン:</span>
        {E_PATTERNS.map((v) => (
          <Button
            key={v}
            type="button"
            size="sm"
            variant={p === v ? "default" : "outline"}
            onClick={() => onP(v)}
          >
            {OPTION_LABELS[v]}
          </Button>
        ))}
      </div>
    </div>
  );
}
