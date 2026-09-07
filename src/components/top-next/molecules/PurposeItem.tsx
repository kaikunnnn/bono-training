import Link from "next/link";
import type { ReactNode } from "react";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";

/**
 * アイコン＋ラベル（新トップページ /dev/top5 / PurposeNav用）
 *
 * icon は呼び出し側から実アイコン（lucide-react等、実リポジトリに既に存在するもの）を渡す。
 * アイコン背景は Figma（800:9300）の斜めグラデーション（gradients.ts で一元管理）。
 */
export interface PurposeItemProps {
  subLabel: string;
  label: string;
  icon: ReactNode;
  href: string;
}

export function PurposeItem({ subLabel, label, icon, href }: PurposeItemProps) {
  return (
    // 外側: レイアウト上の行間隔を維持するための余白のみ（ホバー背景には含めない）
    <div className="py-1 lg:py-5">
      {/* 内側: ホバー背景の範囲。コンテンツにタイトに沿わせる */}
      <Link
        href={href}
        className="group -mx-3 flex items-center gap-4 rounded-[8px] px-3 py-3 text-left transition-colors duration-200 hover:bg-black/[0.03]"
      >
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-[4px] border-[0.5px] border-black/10 transition-transform duration-300 group-hover:scale-[1.08]"
          style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
        >
          {icon}
        </div>
        <div>
          <p className="font-noto-sans-jp text-xs font-medium leading-[24px] text-text-primary/[0.56]">
            {subLabel}
          </p>
          <p className="font-noto-sans-jp text-sm font-medium leading-[24px] text-text-primary">
            {label}
          </p>
        </div>
      </Link>
    </div>
  );
}
