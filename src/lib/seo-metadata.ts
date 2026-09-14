// src/lib/seo-metadata.ts — OGP 共通既定値
//
// Next.js の Metadata は openGraph をトップレベルキー単位で「置換」する（shallow merge しない）。
// そのため自前で openGraph を定義するページでは、root layout が持つ
// type / siteName / locale が丸ごと消える。各ページの openGraph 先頭で
// `...OG_DEFAULTS` を展開し、欠けている既定値だけを補完する。
//
// 注: url は含めない。root の url をサブページに継承させると og:url が全ページ
// 同一の誤った値になるため、url は各ページ側（or canonical）に委ねる。
export const OG_DEFAULTS = {
  type: "website",
  siteName: "BONO",
  locale: "ja_JP",
} as const;

// 動的記事などでサムネイル未設定時に使う既定 OGP 画像（root の生成 OGP ルート）。
// og:image が消えないようフォールバック先として参照する。
export const DEFAULT_OG_IMAGE = "/opengraph-image";
