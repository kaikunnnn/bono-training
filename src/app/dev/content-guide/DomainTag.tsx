/**
 * 領域の小さなタグ（概念アイコン + 領域名）。rules/03: 概念アイコンは iconsax-react を第一選択。
 */

import {
  Building4,
  Colorfilter,
  Designtools,
  Eye,
  Hierarchy,
  Magicpen,
  Messages2,
  People,
  TickCircle,
  type Icon,
} from "iconsax-react";
import { cn } from "@/lib/utils";

export const DOMAIN_ICONS: Record<string, Icon> = {
  ビジュアルデザイン: Colorfilter,
  "ツール・プロトタイピング": Designtools,
  "情報設計・インタラクション": Hierarchy,
  "ユーザー理解・課題解決": People,
  "評価・改善": TickCircle,
  "伝える・つなぐ": Messages2,
  AI活用: Magicpen,
  "デザインを理解して使う（デザイナー以外向け）": Eye,
  "事業・サービスの視点": Building4,
};

export function DomainTag({ domain, className }: { domain: string; className?: string }) {
  const IconComp = DOMAIN_ICONS[domain];
  return (
    <span
      data-cg-text="aux"
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-muted-custom px-2 py-0.5 text-[11px] font-medium leading-4 text-text-secondary",
        className
      )}
    >
      {IconComp && <IconComp aria-hidden="true" size={12} color="currentColor" className="shrink-0" />}
      <span className="truncate">{domain}</span>
    </span>
  );
}
