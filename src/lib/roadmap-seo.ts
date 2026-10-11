// src/lib/roadmap-seo.ts — ロードマップ詳細ページの SEO 文言上書き（#236）
//
// ロードマップの title / description / h1 は Sanity の値をそのまま使うが、
// 検索向けに文言を決めたページだけコード側で上書きする（Sanity 本番データは変更しない）。
// ここに無い slug は従来どおり Sanity の値を使う。

import { stripLineBreakMarker } from "@/utils/textFormat";

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
    // rebono#24: 検索語「UI/UXデザイン 勉強 ロードマップ」「何から」に合わせた文言（オーナー承認済み）
    title:
      "UI/UXデザインの勉強ロードマップ｜未経験から転職まで6ヶ月の学ぶ順番｜BONO",
    description:
      "UI/UXデザインを何から勉強すればいいか迷う人へ。UIの基礎→情報設計→UXデザイン→ポートフォリオの順に、未経験から転職まで6ヶ月で進める学習ロードマップです。",
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

/**
 * Sanity のロードマップ名を <title> / og:title 用に整える（#236）。
 * 名前の `|` はヒーロー h1 の改行マーカー（formatTitleWithLineBreaks）なので、
 * メタデータでは取り除く（h1 の文字列と同じになる。例「Figmaからデザインを|はじめる…」
 * →「Figmaからデザインをはじめる…」）。h1 側の表示には使わないこと。
 */
export function roadmapTitleForMetadata(title: string): string {
  // 既存の SEO 用ユーティリティ（stripLineBreakMarker）で「|」を除き、前後の余分な空白を詰める
  return stripLineBreakMarker(title.replace(/\s*\|\s*/g, "|")).trim();
}
