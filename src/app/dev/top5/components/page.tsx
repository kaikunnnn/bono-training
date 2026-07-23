import type { Metadata } from "next";
import { Map, MessageSquare } from "lucide-react";
import { DevNav } from "@/components/top-next/DevNav";
import { SectionBadge } from "@/components/top-next/atoms/SectionBadge";
import { LessonTag } from "@/components/top-next/atoms/LessonTag";
import { TrainingCard } from "@/components/top-next/molecules/TrainingCard";
import { RoadmapCard } from "@/components/top-next/molecules/RoadmapCard";
import { GuideCard } from "@/components/top-next/molecules/GuideCard";
import { FeaturedCard } from "@/components/top-next/molecules/FeaturedCard";
import { ArticleRow } from "@/components/top-next/molecules/ArticleRow";
import { PurposeItem } from "@/components/top-next/molecules/PurposeItem";
import { TestimonialCard } from "@/components/top-next/molecules/TestimonialCard";
import { OutputCard } from "@/components/top-next/molecules/OutputCard";
import { LessonCard } from "@/components/lessons/LessonCard";

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

      <ShowcaseItem name="LessonTag" file="atoms/LessonTag.tsx">
        <LessonTag />
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

      <ShowcaseItem name="FeaturedCard" file="molecules/FeaturedCard.tsx">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FeaturedCard title="AIとUIをつくりはじめよう" desc="AIとUIのスタイリングを進める入門シリーズです" href="/lessons" />
          <FeaturedCard title="質を上げるデザインの進め方" desc="基本のワークフローでアウトプットの質を高めます" href="/lessons" />
          <FeaturedCard title="センスを盗んで成長速度を上げる" desc="自己流を卒業して引き出しを増やすシリーズ" href="/lessons" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="TrainingCard" file="molecules/TrainingCard.tsx">
        <div className="flex flex-col gap-6 lg:flex-row">
          <TrainingCard
            topLabel="UIのアイデア"
            topSubLabel="トレーニング"
            title="目的からデザインを構築するトレーニング"
            description="UIの仕組みとユーザーから発想する基本の形を身につけます"
            href="/training"
          />
          <TrainingCard
            topLabel="顧客の課題解決"
            topSubLabel="トレーニング"
            title="顧客理解を価値に変換するデザイントレーニング"
            description="UXデザインの基本を顧客インタビューを通して習得"
            href="/training"
          />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="RoadmapCard" file="molecules/RoadmapCard.tsx">
        <div className="flex flex-col gap-6 lg:flex-row">
          <RoadmapCard topLabel="UIUX転職" topSubLabel="ロードマップ" title="UIUX転職ロードマップ" href="/roadmap" rounded="16px" />
          <RoadmapCard topLabel="UIUX転職" topSubLabel="ロードマップ" title="未経験からのUIUXデザイナー転職ガイド" href="https://example.com" external />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="GuideCard" file="molecules/GuideCard.tsx" dark>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <GuideCard title="AIとデザインで身につけるスキル" description="生成AI時代に必要なデザインスキルを体系的に学ぶ" href="/roadmap" />
          <GuideCard title="UXのロードマップ" description="ユーザー理解から体験設計までを学ぶ学習ルート" href="/roadmap" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="LessonCard (variant=&quot;cover&quot;)" file="lessons/LessonCard.tsx">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <LessonCard
            variant="cover"
            lesson={{
              id: "1",
              title: "ゼロからはじめるUI情報設計",
              description: "情報設計の基本を学ぶレッスン",
              category: "UIデザイン",
              thumbnail: "",
              slug: "dummy",
            }}
          />
          <LessonCard
            variant="cover"
            shadow="light"
            lesson={{
              id: "2",
              title: "センスを盗む技術",
              description: "自己流を卒業して引き出しを増やす",
              category: "UIデザイン",
              thumbnail: "",
              slug: "dummy2",
            }}
          />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="TestimonialCard" file="molecules/TestimonialCard.tsx">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <TestimonialCard
            category="UIUX転職"
            title="非美大・未経験から新卒でデザイン制作会社へ就職。実務とBONOを掛け合わせたデザインスキル獲得法について聞いてみた"
            authorName="和家くん"
            authorRole="2027年から制作会社の新卒デザイナー"
            href="/achievements"
          />
        </div>
      </ShowcaseItem>

      <ShowcaseItem name="OutputCard" file="molecules/OutputCard.tsx">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <OutputCard title="UI/UX勉強記録 #12 - 1人を深く掘ったら、設計のゴールが見えてきた" href="https://example.com" />
        </div>
      </ShowcaseItem>
      </div>
    </div>
  );
}
