/**
 * ポイント箇条書き（lucide Check + ラベル）。純表示・stateなし。
 * E1/E2 の主要ポイント列挙で共通利用。DSトークンのみ（生hex禁止）。
 */

import { Check } from "lucide-react";

interface PointListProps {
  points: readonly string[];
  /** アイコン色の抑制版（補足リスト用）。既定は primary */
  muted?: boolean;
}

export function PointList({ points, muted = false }: PointListProps) {
  return (
    <ul className="space-y-2">
      {points.map((p) => (
        <li key={p} className="flex items-start gap-2 text-sm text-foreground">
          <Check
            size={16}
            aria-hidden="true"
            className={`mt-0.5 shrink-0 ${muted ? "text-muted-foreground" : "text-primary"}`}
          />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}
