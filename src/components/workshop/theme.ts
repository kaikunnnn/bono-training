/**
 * ワークショップトップページのテーマ定数。
 * 詳細ページ（/guide準拠のライト配色）と揃えたライトテーマ。
 * 値はデザイントークン（colors_and_type.css）と同じ。
 */
export const WS_THEME = {
  /** ページ背景（--bg-surface） */
  bg: "#FFFFFF",
  /** 見出し・主要テキスト（--text-primary） */
  ink: "#021710",
  /** 本文（--text-secondary） */
  body: "#354540",
  /** ラベル・メタ情報（--text-muted） */
  muted: "#677470",
  /** 罫線（--border-light） */
  hairline: "#D4D6CC",
  /** 点線コネクタ（--border-default） */
  dotted: "#C3C5BB",
} as const;
