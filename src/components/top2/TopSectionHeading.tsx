/**
 * トップページ ブロック見出し共通コンポーネント（top2・top3 再構築版）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 733-6949（"Heading2" バリアント2）
 *
 * これまで各ブロック（課題解決のデザインをはじめる／UIUXデザイナーに転職する／
 * デザインとキャリアを考える／レッスン特集／みんなの実績）で見出しをバラバラに
 * 実装していたが、全ブロックでこの1つのコンポーネントに統一する。
 *
 * スタイル抽出チェックリスト（Figma実測値。PCデザインのためモバイルは調整）:
 *
 * | 要素 | font-family | weight | size(PC) | size(モバイル) | tracking | 色 |
 * |---|---|---|---|---|---|---|
 * | バッジ | M PLUS 1 | Regular | 12px | 12px（変更なし） | 1.6px | #141419→text-text-primary |
 * | 見出し | M PLUS 1 | Medium(500) | 28px | 24px(text-2xl)→sm:28px | 1.6px | #141419→text-text-primary |
 *
 * 構造: バッジ(角丸40, border, px-3 py-1（上下4px）) → gap-3 → 見出し。
 * ダーク背景セクション用に `inverse` で白系反転に対応。
 */

export interface TopSectionHeadingProps {
  badgeLabel: string;
  heading: string;
  /** ダーク背景用に白系へ反転（デフォルト false） */
  inverse?: boolean;
  className?: string;
}

export default function TopSectionHeading({
  badgeLabel,
  heading,
  inverse = false,
  className,
}: TopSectionHeadingProps) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      <span
        className={`inline-flex w-fit items-center justify-center rounded-full border px-3 py-1 font-rounded-mplus text-xs tracking-[1.6px] ${
          inverse
            ? "border-white/20 text-text-inverse"
            : "border-black/20 text-text-primary"
        }`}
      >
        {badgeLabel}
      </span>
      <h2
        className={`font-rounded-mplus text-2xl font-medium leading-[1.4] tracking-[1.6px] sm:text-[28px] ${
          inverse ? "text-text-inverse" : "text-text-primary"
        }`}
      >
        {heading}
      </h2>
    </div>
  );
}
