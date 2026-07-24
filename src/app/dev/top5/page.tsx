import type { Metadata } from "next";
import { DevNav } from "@/components/top-next/DevNav";
import { HeroSection } from "@/components/top-next/organisms/HeroSection";
import { PurposeNav } from "@/components/top-next/organisms/PurposeNav";
import { FeaturedSeries } from "@/components/top-next/organisms/FeaturedSeries";
import { NewContentSection } from "@/components/top-next/organisms/NewContentSection";
import { TrainingSection } from "@/components/top-next/organisms/TrainingSection";
import { CareerSection } from "@/components/top-next/organisms/CareerSection";
import { GuideSection } from "@/components/top-next/organisms/GuideSection";
import LessonHighlightSection, {
  type LessonHighlightRow,
} from "@/components/top/home/LessonHighlightSection";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import {
  getAllLessonsWithArticleIds,
  getAchievementGroups,
  getLatestMixedContent,
  getAllGuidesFromSanity,
  getAllRoadmaps,
} from "@/lib/sanity";

/**
 * /dev/top5 — Figma Make 移植版
 *
 * Figma Make の HANDOFF（デザイン確認・スタイル調整済み）を、Phase 1 で作成した
 * top-next の atoms/molecules と Phase 2 の organisms で組み上げた版。
 * 余白・ボーダー・背景は HANDOFF のスペーシング表に準拠。
 *
 * データ（レッスン・みんなの実績・あたらしいコンテンツ）は /dev/top3 と同じ
 * 実データを再利用。organisms は presentational に保ち、取得はここで行う。
 *
 * ラッパー <main> は付けない（root layout の Layout が既にサイドバーオフセットと
 * モバイルTopBarオフセットを付与しているため、HANDOFF の margin/padding は不要）。
 *
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。
 */

export const metadata: Metadata = {
  title: "Figma Make移植版 (/dev/top5)",
  robots: { index: false, follow: false },
};

export default async function DevTop5Page() {
  const [allLessons, achievementGroups, newContentItems, allGuides, allRoadmaps] =
    await Promise.all([
      getAllLessonsWithArticleIds(),
      getAchievementGroups(3),
      getLatestMixedContent(4),
      getAllGuidesFromSanity(),
      getAllRoadmaps(),
    ]);

  const findLesson = (title: string) =>
    allLessons.find((lesson) => lesson.title === title);
  const findLessonBySlug = (slug: string) =>
    allLessons.find((lesson) => lesson.slug?.current === slug);
  const findGuideBySlug = (slug: string) =>
    allGuides.find((guide) => guide.slug === slug);
  const findRoadmapBySlug = (slug: string) =>
    allRoadmaps.find((roadmap) => roadmap.slug?.current === slug);

  const guideItems = [
    {
      title: "デザインとは何か。AIで変わること変わらないこと",
      description: "見た目ではなくAI時代に必要なスキルを解説",
      slug: "ai-design-experience-shift",
    },
    {
      title: "ジュニアUI/UXデザイナーのためのスキルマップ",
      description: "肩書ではなく、何に貢献するかからスキルを考える",
      slug: "uiuxdesigner-skillmap",
    },
    {
      title: "転職ポートフォリオのポイント",
      description: "作るだけでなく、採用でアピールすべきポイントを解説",
      slug: "portfolio-01",
    },
    {
      title: "初心者が身につけるべきUXスキルの全体像",
      description: "事業やユーザーへの貢献は課題を知ることから",
      slug: "uxresearch_and_uidesign",
    },
  ].map((item) => ({
    title: item.title,
    description: item.description,
    href: `/guide/${item.slug}`,
    image: findGuideBySlug(item.slug)?.thumbnailUrl,
  }));

  const lessonRows: LessonHighlightRow[] = [
    {
      subheading: "基本のデザインフローを身につける",
      lessons: [
        findLesson("ゼロからはじめるUI情報設計"),
        findLesson("UIが上手くなる人の“デザインサイクル” ─ 入門編β"),
        findLesson("顧客体験デザインの基本"),
      ].filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson)),
    },
    {
      subheading: "UIデザインをはじめる",
      lessons: [
        findLesson("Figmaの使い方入門"),
        findLesson("ゼロからはじめるUIビジュアル"),
        findLesson("センスを盗む技術"),
      ].filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson)),
    },
  ];

  const featuredCards = [
    {
      title: "AIでUIスタイリング入門",
      desc: "ユーザー中心のUI設計を学ぶロードマップ",
      href: "/lessons/ai-ui-styling-beginner",
      image:
        findLessonBySlug("ai-ui-styling-beginner")?.thumbnailUrl ??
        findLessonBySlug("ai-ui-styling-beginner")?.iconImageUrl,
    },
    {
      title: "質を上げるデザインの進め方",
      desc: "基本のワークフローでアウトプットの質を高めます",
      href: "/lessons/ui-design-flow-lv1",
      image:
        findLessonBySlug("ui-design-flow-lv1")?.thumbnailUrl ??
        findLessonBySlug("ui-design-flow-lv1")?.iconImageUrl,
    },
    {
      title: "使いやすいUIデザイン構造を習得",
      desc: "モード、アクションなど操作UIの基本を学ぼう",
      href: "/lessons/ui-layout-basic",
      image:
        findLessonBySlug("ui-layout-basic")?.thumbnailUrl ??
        findLessonBySlug("ui-layout-basic")?.iconImageUrl,
    },
  ];

  const newContentArticles = newContentItems.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
  }));

  return (
    <>
      <DevNav current="page" />
      <HeroSection />
      <PurposeNav />
      <FeaturedSeries cards={featuredCards} />
      <NewContentSection articles={newContentArticles} />
      <TrainingSection
        image1={findRoadmapBySlug("information-architecture")?.thumbnailUrl}
        image2={findRoadmapBySlug("ux-design-basic")?.thumbnailUrl}
      />
      <CareerSection
        image1={findRoadmapBySlug("uiux-career-change")?.thumbnailUrl}
      />
      <GuideSection guides={guideItems} />
      <div className="container">
        <div className="flex flex-col">
          <LessonHighlightSection
            compact
            badgeLabel="レッスン"
            heading="1−2週間でレベルを上げる"
            rows={lessonRows}
            viewAllHref="/lessons"
          />
          <AchievementHighlightSection
            compact
            storyItems={achievementGroups.stories}
            outputItems={achievementGroups.outputs}
          />
        </div>
      </div>
    </>
  );
}
