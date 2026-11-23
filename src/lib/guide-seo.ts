// src/lib/guide-seo.ts — ガイド詳細ページの SEO 文言上書き（rebono#24 / #236）
//
// ガイドの title / description / h1 / 本文は Sanity の値をそのまま使うが、
// 検索向けに文言を決めたページだけ <title> と meta description（OGP / Twitter 含む）を
// コード側で上書きする（Sanity 本番データは変更しない。h1 と本文は変えない）。
// ここに無い slug は従来どおり「{Sanityのtitle} | 読みもの | BONO」と Sanity の説明文を使う。

export interface GuideSeoOverride {
  /** <title>。root layout の title.template を付けず、この文字列をそのまま使う */
  title: string;
  /**
   * meta description（OGP / Twitter も同じ文言）。
   * 省略時は従来どおり Sanity の説明文（guideSeoDescription）を使い、title だけ上書きする。
   */
  description?: string;
}

export const GUIDE_SEO_OVERRIDES: Record<string, GuideSeoOverride> = {
  // rebono#24: 検索語「未経験 UI/UXデザイナー なるには」「必要なスキル」に合わせた文言（オーナー承認済み）
  "rdm-howtobeadesigner": {
    title:
      "未経験からUI/UXデザイナーになるには？必要なスキル3つと書類で落ちない条件 | BONO",
    description:
      "未経験からUI/UXデザイナーをめざす人向けに、採用で見られる3つのスキル（ふつうに使えるUIを作る基礎・課題解決の力・未経験者のポテンシャル）と、その身につけ方を解説します。",
  },
  // rebono#20: /roadmap/uiux-career-change と検索で競合しないよう、解説記事であることを title で分ける
  // （オーナー承認済み）。description は Sanity のまま。
  "rdm-howtostart-roadmap": {
    title:
      "転職ロードマップの中身を解説｜フェーズごとに目指すレベルと習得すること | BONO",
  },
  // #236 オーナー決定B（2026-10-09）/ #276: 役割を「年収と将来」に絞り、rdm-howtobeadesigner と
  // 「未経験」「なるには」で取り合わないようにする。Sanity の description は空なので説明文も決める。
  // h1（Sanity の title）と本文の見出しは Sanity 側（このファイルでは変えない）。
  "become-uiux-designer-beginner-guide": {
    title:
      "UI/UXデザイナーの年収と将来性｜仕事の役割・年収の目安・キャリアの広げ方 | BONO",
    description:
      "UI/UXデザイナーの仕事の役割と、年収の目安・会社による違い・年収1000万円以上を目指す道やフリーランスという選択肢まで、これからのキャリアを考える材料をまとめました。",
  },
};

export function getGuideSeoOverride(
  slug: string,
): GuideSeoOverride | undefined {
  // "constructor" 等のプロトタイプ由来キーを拾わないよう自前プロパティのみ見る
  return Object.hasOwn(GUIDE_SEO_OVERRIDES, slug)
    ? GUIDE_SEO_OVERRIDES[slug]
    : undefined;
}
