import type { Metadata } from "next";
import EyecatchHero from "@/components/top2/EyecatchHero";
import LatestContentPromo from "@/components/top2/LatestContentPromo";

/**
 * /dev/top2 — 新トップページ（2026）組み立て用プレビュー（再構築版）
 *
 * Figma: PRD🏠_topUI_newBONO2026（fileKey: 43rIPBQ9lm2b4DO2gElXCO, page: v4, frame: "720" node-id 662-39669）
 *
 * `/dev/top` で発生したスタイル崩れ（font-weight不一致、共有コンポーネントへの
 * 副作用、パーセンテージサイズの誤動作等）を踏まえ、`.claude/skills/design/SKILL.md`
 * の手順（コンポーネント単位→ブロック単位の2段階実装、各段階で視覚的突合）に
 * 沿って1から組み立て直すためのページ。
 *
 * 画像は本画像確定までグレー背景のプレースホルダーで代用する。
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。
 */

export const metadata: Metadata = {
  title: "新トップ プレビュー v2 (/dev/top2)",
  robots: { index: false, follow: false },
};

export default function DevTop2Page() {
  return (
    <div className="container">
      {/* 各ブロックはFigma実測のpt/pbを自身で持っているため、ここでの追加gapは
          入れない（gapを足すと二重に余白がついて広くなりすぎるバグがあった） */}
      <div className="flex flex-col">
        {/* ブロックA: アイキャッチ（Figma node-id 662-40038） */}
        <EyecatchHero />

        {/* ブロックB-1: 最新コンテンツ訴求（Figma node-id 662-40053、コンポーネント単位の確認用・仮コピー） */}
        <LatestContentPromo
          items={[
            {
              title: "UIUX転職ロードマップ",
              description: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
              href: "/roadmap",
            },
            {
              title: "UIデザインサイクルを学ぶ",
              description: "デザインが上手くなる基本の型を身につけるレッスン",
              href: "/lessons",
            },
            {
              title: "デザインの進め方ガイド",
              description: "実践で使えるデザインプロセスを解説する記事",
              href: "/guide",
            },
          ]}
        />
      </div>
    </div>
  );
}
