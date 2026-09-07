/**
 * 価格ブロック（/plan準拠）。プランカード内で価格表示を担う独立部品。
 * 全数値は getPlanPriceView（AVAILABLE_PLANS 由来）で算出済みの PlanPriceView を受け取る。
 * 価格リテラルはここに書かない。
 *
 * 移植元: src/app/dev/pricing/PlanCards.tsx の CardPriceBlock を独立部品化。
 */

import { formatYen, type PlanPriceView } from "@/lib/pricing/price";

interface PriceBlockProps {
  view: PlanPriceView;
}

export function PriceBlock({ view }: PriceBlockProps) {
  if (view.duration === 3) {
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {formatYen(view.monthly3m)}
          </span>
          <span className="text-sm text-muted-foreground">
            /月(3ヶ月継続)
          </span>
          <span className="ml-1 text-xs text-muted-foreground">税込</span>
        </div>
        {/* お得額 = 月あたり(1ヶ月−3ヶ月) を主に、3ヶ月合計を直下に小さく添える（お得感優先）。
            2行構成でスマホでも「お得」が孤立折返しにならないようにする。
            /plan の「¥1,199」は旧価格の名残で価格差(¥2,000)と不一致だったため、定数算出値を正とする。 */}
        <p className="text-sm text-muted-foreground">
          <span className="line-through">{formatYen(view.monthly1m)}</span>{" "}
          <span className="font-bold text-text-success">
            約{formatYen(view.savingsPerMonth)}/月 お得
          </span>
        </p>
        <p className="text-xs font-medium text-text-success">
          （3ヶ月で{formatYen(view.savingsTotal3m)}）
        </p>
      </div>
    );
  }

  // 毎月払い（1ヶ月）
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-foreground">
        {formatYen(view.monthly1m)}
      </span>
      <span className="text-sm text-muted-foreground">/月</span>
      <span className="ml-1 text-xs text-muted-foreground">税込</span>
    </div>
  );
}
