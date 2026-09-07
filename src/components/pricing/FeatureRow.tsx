/**
 * 機能行（アイコン + ラベル + 値）。単一プラン視点の1行表示。
 * 価格カードの解放機能リストで使う。stateなし・純表示。
 *
 * Figma(186)の緑チェック方式:
 *  - 左: [機能アイコン 16px] + ラベル（flex-1 でラベル列を可変幅に）。
 *  - 値列: 固定幅(w-[120px]) の左揃え列。全行同じx位置から値が並びスキャンしやすい。
 *      緑チェック(CheckCircle2 / text-text-success) + 値。
 *      値色＝共通行(common)=text-foreground / 差分行(diff=feedback独自)=text-text-success で強調。
 *  - 値（なし）: 行全体 opacity-25・チェック無し・値「なし」text-muted-foreground。
 *
 * 緑色は DS の成功テキストトークン --text-success(#047A53, AA合格) を使う
 * （旧 text-success-dark #16A34A は白背景でコントラスト不足のため置換）。
 *
 * 旧デザインの濃色グラデ（--grad-career-change / bg-clip-text / SVG stroke）は
 * Figma(186)で廃止されたため、gradient / FeatureGradientDefs / emphasis も削除した。
 *
 * 移植元: src/app/dev/pricing-diff/FeatureRow.tsx（緑チェック方式へ刷新）
 */

import { CheckCircle2 } from "lucide-react";
import type { FeatureRow as FeatureRowData } from "@/lib/pricing/content";

interface FeatureRowProps {
  row: FeatureRowData;
  /** 表示する値（standard/feedback の該当値。呼び出し側で featureValue 済み） */
  value: string;
  /** 「提供なし」表現（行全体を淡色・チェック無し）にするか */
  absent?: boolean;
}

export function FeatureRow({ row, value, absent = false }: FeatureRowProps) {
  const Icon = row.icon;
  // 含む値の色: 共通行=foreground / 差分行(feedback独自)=text-success で強調。
  const valueColor =
    row.group === "diff" ? "text-text-success" : "text-foreground";

  return (
    <li
      className={`flex min-h-[28px] items-center gap-3 ${
        absent ? "opacity-25" : ""
      }`}
    >
      {/* 左: 機能アイコン + ラベル（flex-1 で可変幅） */}
      <span className="flex flex-1 items-center gap-2 text-sm text-foreground">
        <Icon size={16} aria-hidden="true" className="shrink-0" />
        <span>{row.label}</span>
      </span>

      {/* 値列: 固定幅・左揃え（全行同じx位置に値を揃える）。含む=緑チェック+値 / なし=淡色ラベルのみ。 */}
      {absent ? (
        <span className="flex w-[120px] shrink-0 items-center text-sm text-muted-foreground">
          {value}
        </span>
      ) : (
        <span
          className={`flex w-[120px] shrink-0 items-center gap-2 text-sm ${valueColor}`}
        >
          <CheckCircle2
            size={16}
            aria-hidden="true"
            className="shrink-0 text-text-success"
          />
          {value}
        </span>
      )}
    </li>
  );
}
