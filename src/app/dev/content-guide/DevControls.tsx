"use client";

/**
 * 確認用コントロール（dev専用・本番の画面には出さない想定）。
 * 表示する人の状態（未ログイン／会員）を切り替える。URL の viewer に反映。
 * pricing-proto の DevControls と同じ見た目。
 */

import { Button } from "@/components/ui/button";
import type { Viewer } from "./query";

const VIEWER_LABELS: Record<Viewer, string> = {
  guest: "未ログイン",
  member: "会員",
};

interface DevControlsProps {
  viewer: Viewer;
  onViewer: (v: Viewer) => void;
}

export function DevControls({ viewer, onViewer }: DevControlsProps) {
  return (
    <div className="rounded-btn border border-dashed border-border bg-surface px-4 py-3 text-xs">
      <p className="font-bold text-muted-foreground">確認用（本番では非表示）</p>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="表示する人の状態">
        <span className="text-muted-foreground">表示:</span>
        {(Object.keys(VIEWER_LABELS) as Viewer[]).map((v) => (
          <Button
            key={v}
            type="button"
            size="sm"
            variant={viewer === v ? "default" : "outline"}
            aria-pressed={viewer === v}
            onClick={() => onViewer(v)}
          >
            {VIEWER_LABELS[v]}
          </Button>
        ))}
      </div>
    </div>
  );
}
