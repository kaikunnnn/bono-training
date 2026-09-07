/**
 * 機能行（アイコン + ラベル + 値）。単一プラン視点の1行表示。
 * D0/D1 の機能リストで使う。stateなし・純表示。
 *
 * emphasis: 差分ブロックで大きめに見せたいときに true。
 * gradient: DSの濃色グラデ（--grad-career-change / 深紫→紺→黒）を「文字」と「アイコン」の
 *   前景に適用する（背景ではない）。白背景でも読めるよう濃色を使う。
 *   - 文字: 語の幅で明確に見えるよう横方向(to-right)。グラデは「文字span」だけに限定
 *     （アイコンを含む親spanに掛けると文字が単色に見えるため）。
 *   - アイコン: SVG linearGradient stroke（横方向）。
 *   ※ --grad-career-change は縦(0deg)・多層のCSSトークンで角度変更/ SVG参照ができないため、
 *     同トークンの色値(#482B4B/#2A2C42/#141520)をミラーする（icon-lock-gradient と同じ手法）。
 */

import type { FeatureRow as FeatureRowData } from "./data";

/** グラデ用 SVG <defs> の id。グラデ行を含むリストの近くで1回だけ描画する。 */
export const FEATURE_GRAD_ID = "pricing-diff-fb-grad";

/** アイコンの stroke グラデ定義（--grad-career-change の色をミラー・横方向）。1回だけ描画すれば全アイコンから参照可。 */
export function FeatureGradientDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="absolute"
    >
      <defs>
        <linearGradient id={FEATURE_GRAD_ID} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#482B4B" />
          <stop offset="0.27" stopColor="#2A2C42" />
          <stop offset="1" stopColor="#141520" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface FeatureRowProps {
  row: FeatureRowData;
  /** 表示する値（standard/feedback の該当値。呼び出し側で featureValue 済み） */
  value: string;
  /** 「提供なし」表現（淡色 + アイコン抑制）にするか */
  absent?: boolean;
  /** 差分ブロックで大きめ強調するか */
  emphasis?: boolean;
  /** DSの濃色グラデを文字・アイコン前景に適用するか */
  gradient?: boolean;
}

/**
 * 文字グラデ: --grad-career-change の色を横方向で前景に流す。
 * 横方向の角度指定と SVGアイコンとの色一致のため、トークンではなく色値を直書き
 * （縦・多層の var(--grad-career-change) では角度変更できないため。既存 icon-lock-gradient と同方針）。
 */
const GRADIENT_TEXT =
  "bg-gradient-to-r from-[#482B4B] via-[#2A2C42] to-[#141520] bg-clip-text text-transparent";

export function FeatureRow({
  row,
  value,
  absent = false,
  emphasis = false,
  gradient = false,
}: FeatureRowProps) {
  const Icon = row.icon;

  const textColor = gradient
    ? GRADIENT_TEXT
    : absent
      ? "text-muted-foreground"
      : "text-foreground";
  const iconColorClass = absent ? "text-muted-foreground" : "text-primary";

  return (
    <li className="flex items-center justify-between gap-3">
      <span
        className={`flex items-center gap-2 ${
          emphasis ? "text-base font-medium" : "text-sm"
        }`}
      >
        <Icon
          size={emphasis ? 20 : 16}
          aria-hidden="true"
          className={gradient ? "shrink-0" : `shrink-0 ${iconColorClass}`}
          {...(gradient ? { stroke: `url(#${FEATURE_GRAD_ID})` } : {})}
        />
        {/* グラデは文字spanだけに限定（親spanに掛けると単色に見える） */}
        <span className={gradient ? GRADIENT_TEXT : textColor}>{row.label}</span>
      </span>
      <span
        className={`${textColor} ${
          emphasis ? "text-base font-bold" : "text-sm font-medium"
        }`}
      >
        {value}
      </span>
    </li>
  );
}
