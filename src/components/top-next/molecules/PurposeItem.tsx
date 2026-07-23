import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 黄色アイコン＋ラベル（新トップページ Figma Make HANDOFF由来 / PurposeNav用）
 *
 * icon は呼び出し側から実アイコン（lucide-react等、実リポジトリに既に存在するもの）を渡す。
 * HANDOFFのダミーSVGアイコンは使用しない。
 */
export interface PurposeItemProps {
  subLabel: string;
  label: string;
  icon: ReactNode;
  href: string;
}

export function PurposeItem({ subLabel, label, icon, href }: PurposeItemProps) {
  return (
    <Link
      href={href}
      className="group flex w-[calc(100%+16px)] -mx-2 items-center gap-4 rounded-[8px] px-2 py-3 text-left transition-colors duration-200 hover:bg-black/[0.03]"
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-[4px] bg-[#f7f7ca] transition-transform duration-300 group-hover:scale-[1.08]">
        {icon}
      </div>
      <div>
        <p className="font-noto-sans-jp text-xs font-medium leading-[24px] text-text-primary/[0.56]">
          {subLabel}
        </p>
        <p className="font-noto-sans-jp text-base font-medium leading-[24px] text-text-primary">
          {label}
        </p>
      </div>
    </Link>
  );
}
