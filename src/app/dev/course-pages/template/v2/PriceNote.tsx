/**
 * テンプレート v2（完成形）: 料金の一文 — #242
 * 表記はロードマップ本番ヒーロー（src/components/roadmap/detail/RoadmapHero.tsx）の「料金 5,800 ~ 円/月」にそろえる。
 */

import { cn } from "@/lib/utils";

export default function PriceNote({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-end gap-x-2 gap-y-0.5 text-xs",
        inverse ? "justify-center text-text-inverse/80" : "text-text-secondary",
        className
      )}
    >
      <span className="font-bold opacity-80">料金</span>
      <span className="flex items-end gap-0.5 leading-none">
        <span className={cn("font-latin text-[18px] font-bold", inverse ? "text-text-inverse" : "text-text-primary")}>
          5,800
        </span>
        <span className="text-[13px]">~</span>
        <span className="text-[13px]">円/月</span>
      </span>
      <span>（全コース・全レッスンが対象）</span>
    </p>
  );
}
