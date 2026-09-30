"use client";

/**
 * 確認用コントロール（dev専用・本番の画面には出さない想定）。
 * - 表示する人の状態（未ログイン／会員）を切り替える。URL の viewer に反映。
 * - 画面の案（現行／A案／B案）を切り替える（12_診断UI_A案B案_仕様書 §2）。
 *   選んだ目標とチェック（goal・done）、結果かどうか、表示する人を引き継ぐ。
 * pricing-proto の DevControls と同じ見た目。
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SkillStateId } from "@/lib/content-guide/skill-states";
import type { Viewer } from "./query";
import { VARIANT_PATHS, carryOverSearch, type Variant } from "./flow-query";

const VIEWER_LABELS: Record<Viewer, string> = {
  guest: "未ログイン",
  member: "会員",
};

const VARIANT_LABELS: Record<Variant, string> = {
  list: "現行（一覧）",
  map: "A案（スキルマップ）",
  quiz: "B案（クイズ）",
};

interface DevControlsProps {
  viewer: Viewer;
  onViewer: (v: Viewer) => void;
  variant: Variant;
  /** 案の切り替えで引き継ぐ状態 */
  carry: { goal: SkillStateId | null; checked: readonly SkillStateId[]; isResult: boolean };
}

export function DevControls({ viewer, onViewer, variant, carry }: DevControlsProps) {
  const search = carryOverSearch({ ...carry, viewer });
  return (
    <div className="rounded-btn border border-dashed border-border bg-surface px-4 py-3 text-xs">
      <p className="font-bold text-muted-foreground">確認用（本番では非表示）</p>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="画面の案">
        <span className="text-muted-foreground">画面:</span>
        {(Object.keys(VARIANT_LABELS) as Variant[]).map((v) => (
          <Button key={v} asChild size="sm" variant={variant === v ? "default" : "outline"}>
            <Link href={`${VARIANT_PATHS[v]}${search}`} aria-current={variant === v ? "page" : undefined}>
              {VARIANT_LABELS[v]}
            </Link>
          </Button>
        ))}
      </div>
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
