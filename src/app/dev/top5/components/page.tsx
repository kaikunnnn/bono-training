import type { Metadata } from "next";
import { Map, MessageSquare } from "lucide-react";
import { DevNav } from "@/components/top-next/DevNav";
import { SectionBadge } from "@/components/top-next/atoms/SectionBadge";
import { PromoCard } from "@/components/top-next/molecules/PromoCard";
import { ArticleRow } from "@/components/top-next/molecules/ArticleRow";
import { PurposeItem } from "@/components/top-next/molecules/PurposeItem";

/**
 * /dev/top5/components — top-next配下のAtoms/Moleculesをダミーデータで個別確認するページ
 *
 * Figma Make（HANDOFF.md）の元コードにあった ShowcaseSection パターンを踏襲。
 * 実データではなくダミー値で見た目・構造だけを確認する用途。
 * /dev 配下なので本番では404（dev/layout.tsx でゲート）。
 */

export const metadata: Metadata = {
  title: "top-next コンポーネント確認 (/dev/top5/components)",
  robots: { index: false, follow: false },
};

function ShowcaseItem({
  name,
  file,
  dark = false,
  children,
}: {
  name: string;
  file: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-16">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-sm font-bold text-[#6d56ff]">{name}</span>
        <span className="font-mono text-xs text-gray-400">{file}</span>
      </div>
      <div
        className={`rounded-lg border border-dashed border-[rgba(109,86,255,0.3)] p-6 ${
          dark ? "bg-dark-section" : "bg-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ComponentsShowcasePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <DevNav current="components" />
      <div className="px-6 py-10">
      <h1 className="mb-8 font-mono text-lg font-bold text-[#6d56ff]">
        top-next Component Showcase
      </h1>

      <h2 className="mb-6 border-b-2 border-[#6d56ff] pb-2 font-mono text-xs font-bold text-white">
        <span className="bg-[#6d56ff] px-2 py-1">ATOMS</span>
      </h2>

      <ShowcaseItem name="SectionBadge" file="atoms/SectionBadge.tsx">
        <div className="flex flex-wrap items-center gap-6">
          <SectionBadge>DESIGN WITH USER</SectionBadge>
          <div className="rounded bg-dark-section p-3">
            <SectionBadge dark>GUIDE CONTENTS</SectionBadge>
          </div>
        </div>
      </ShowcaseItem>

      <h2 className="mb-6 mt-12 border-b-2 border-[#6d56ff] pb-2 font-mono text-xs font-bold text-white">
        <span className="bg-[#6d56ff] px-2 py-1">MOLECULES</span>
      </h2>

      <ShowcaseItem name="PurposeItem" file="molecules/PurposeItem.tsx">
        <div className="grid max-w-2xl grid-cols-1 sm:grid-cols-2">
          <PurposeItem subLabel="ロードマップ" label="スキルアップ計画を立てる" icon={<Map className="size-5" />} href="/roadmap" />
          <PurposeItem subLabel="フィードバック" label="プロに改善点をもらう" icon={<MessageSquare className="size-5" />} href="/feedbacks" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="ArticleRow" file="molecules/ArticleRow.tsx">
        <div className="max-w-md divide-y divide-black/[0.06]">
          <ArticleRow category="ガイド" title="未経験からUIUXデザイナーになれるの?を解説" href="/guide" />
          <ArticleRow category="みんなの掲示板" title="未経験からUIUXデザイナーになれるの?を解説" href="/questions" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="PromoCard" file="molecules/PromoCard.tsx">
        <p className="mb-2 font-sans text-xs text-gray-500">
          サムネイル＋タイトル＋説明（任意）＋ボタン。titlePositionでタイトルの上下が変わる（旧 TrainingCard / RoadmapCard / FeaturedCard を統合）
        </p>
        <p className="mb-2 font-sans text-xs text-gray-500">titlePosition=&quot;above&quot;（旧FeaturedCard相当）</p>
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <PromoCard title="AIとUIをつくりはじめよう" description="AIとUIのスタイリングを進める入門シリーズです" href="/lessons" titlePosition="above" aspectRatio="674/431" />
          <PromoCard title="質を上げるデザインの進め方" description="基本のワークフローでアウトプットの質を高めます" href="/lessons" titlePosition="above" aspectRatio="674/431" />
        </div>
        <p className="mb-2 font-sans text-xs text-gray-500">titlePosition=&quot;below&quot;・説明文あり（旧TrainingCard相当）</p>
        <div className="mb-6 flex flex-col gap-6 lg:flex-row">
          <PromoCard
            title="目的からデザインを構築するトレーニング"
            description="UIの仕組みとユーザーから発想する基本の形を身につけます"
            href="/training"
          />
          <PromoCard
            title="顧客理解を価値に変換するデザイントレーニング"
            description="UXデザインの基本を顧客インタビューを通して習得"
            href="/training"
          />
        </div>
        <p className="mb-2 font-sans text-xs text-gray-500">titlePosition=&quot;below&quot;・説明文なし（旧RoadmapCard相当）</p>
        <div className="mb-6 flex flex-col gap-6 lg:flex-row">
          <PromoCard title="UIUX転職ロードマップ" href="/roadmap" rounded="16px" />
          <PromoCard title="未経験からのUIUXデザイナー転職ガイド" href="https://example.com" external />
        </div>
        <p className="mb-2 font-sans text-xs text-gray-500">inverse（ダーク背景用。旧GuideCard相当）</p>
        <div className="grid grid-cols-1 gap-8 rounded-lg bg-dark-section p-6 sm:grid-cols-2">
          <PromoCard title="AIとデザインで身につけるスキル" description="生成AI時代に必要なデザインスキルを体系的に学ぶ" href="/roadmap" inverse />
          <PromoCard title="UXのロードマップ" description="ユーザー理解から体験設計までを学ぶ学習ルート" href="/roadmap" inverse />
        </div>
      </ShowcaseItem>

      <p className="mb-8 max-w-2xl font-sans text-xs text-gray-500">
        レッスン特集（1−2週間でレベルを上げる）とみんなの実績は、top-next独自のカード
        ではなく本番の共有コンポーネント（<code>LessonHighlightSection</code> /
        <code>AchievementHighlightSection</code>、top3・top4と同一）をそのまま使う方針に
        変更したため、このショーケースには含めていません。
      </p>
      </div>
    </div>
  );
}
