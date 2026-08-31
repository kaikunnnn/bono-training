/**
 * 価格ブロック（税込 + 期間別表示）。
 * 選択中の期間に応じて表示を切り替える。全数値は AVAILABLE_PLANS 由来の view-model。
 * stateなし・純表示（サーバー/クライアントどちらからも描画可能）。
 */

import type { PlanPriceView } from "./data";
import { formatYen } from "./data";

interface PriceBlockProps {
  view: PlanPriceView;
}

export function PriceBlock({ view }: PriceBlockProps) {
  const isThreeMonths = view.duration === 3;

  if (!isThreeMonths) {
    // 1ヶ月（毎月払い）
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {formatYen(view.monthly1m)}
          </span>
          <span className="text-base text-muted-foreground">/月</span>
          <span className="ml-1 text-xs text-muted-foreground">税込</span>
        </div>
        <p className="text-sm text-muted-foreground">
          毎月自動更新・いつでも停止できます
        </p>
      </div>
    );
  }

  // 3ヶ月（まとめて割引）
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">
          {formatYen(view.monthly3m)}
        </span>
        <span className="text-base text-muted-foreground">/月</span>
        <span className="ml-1 text-sm text-muted-foreground">（3ヶ月ごと）</span>
      </div>
      <p className="text-sm text-muted-foreground">
        3ヶ月分まとめて {formatYen(view.total3m)}（税込）
      </p>
      <p className="text-sm font-bold text-primary">
        毎月払いより 月あたり{formatYen(view.savingsPerMonth)}お得（3ヶ月で
        {formatYen(view.savingsTotal3m)}）
      </p>
    </div>
  );
}
