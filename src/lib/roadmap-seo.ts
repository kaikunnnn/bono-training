// src/lib/roadmap-seo.ts — ロードマップ詳細ページの SEO 文言上書き（#236）
//
// ロードマップの title / description / h1 は Sanity の値をそのまま使うが、
// 検索向けに文言を決めたページだけコード側で上書きする（Sanity 本番データは変更しない）。
// ここに無い slug は従来どおり Sanity の値を使う。

export interface RoadmapSeoOverride {
  /** <title>。root layout の title.template を付けず、この文字列をそのまま使う */
  title: string;
  /** meta description（OGP / Twitter も同じ文言） */
  description: string;
  /** ヒーローの h1。`|` は表示上の改行マーカー（formatTitleWithLineBreaks） */
  heading: string;
}

export const ROADMAP_SEO_OVERRIDES: Record<string, RoadmapSeoOverride> = {
  "uiux-career-change": {
    title:
      "未経験からUI/UXデザイナーに転職するロードマップ｜6ヶ月のオンラインコース｜BONO",
    description:
      "未経験からUI/UXデザイナーを目指す人の6ヶ月の学習ロードマップ。UIデザインの基礎、情報設計、UXデザイン、ポートフォリオ制作までを順番に学べます。",
    heading: "未経験からUI/UXデザイナーになる|転職ロードマップ",
  },
};

export function getRoadmapSeoOverride(
  slug: string,
): RoadmapSeoOverride | undefined {
  // "constructor" 等のプロトタイプ由来キーを拾わないよう自前プロパティのみ見る
  return Object.hasOwn(ROADMAP_SEO_OVERRIDES, slug)
    ? ROADMAP_SEO_OVERRIDES[slug]
    : undefined;
}
