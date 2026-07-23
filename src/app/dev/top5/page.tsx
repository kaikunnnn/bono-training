import type { Metadata } from "next";
import { DevNav } from "@/components/top-next/DevNav";
import { HeroSection } from "@/components/top-next/organisms/HeroSection";
import { PurposeNav } from "@/components/top-next/organisms/PurposeNav";
import { FeaturedSeries } from "@/components/top-next/organisms/FeaturedSeries";
import { NewContentSection } from "@/components/top-next/organisms/NewContentSection";
import { TrainingSection } from "@/components/top-next/organisms/TrainingSection";
import { CareerSection } from "@/components/top-next/organisms/CareerSection";
import { GuideSection } from "@/components/top-next/organisms/GuideSection";
import { LessonSection } from "@/components/top-next/organisms/LessonSection";
import { CommunitySection } from "@/components/top-next/organisms/CommunitySection";
import {
  getAllLessonsWithArticleIds,
  getAchievementGroups,
  getLatestMixedContent,
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
  const [allLessons, achievementGroups, newContentItems] = await Promise.all([
    getAllLessonsWithArticleIds(),
    getAchievementGroups(3),
    getLatestMixedContent(4),
  ]);

  const findLesson = (title: string) =>
    allLessons.find((lesson) => lesson.title === title);
  const findLessonBySlug = (slug: string) =>
    allLessons.find((lesson) => lesson.slug?.current === slug);

  const lessonGroups = [
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
      desc: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
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
      title: "センスを盗んで成長速度を上げる",
      desc: "自己流を卒業して引き出しを増やすシリーズ",
      href: "/lessons/steel-design-sense",
      image:
        findLessonBySlug("steel-design-sense")?.thumbnailUrl ??
        findLessonBySlug("steel-design-sense")?.iconImageUrl,
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
      <TrainingSection />
      <CareerSection />
      <GuideSection />
      <LessonSection groups={lessonGroups} />
      <CommunitySection
        stories={achievementGroups.stories}
        outputs={achievementGroups.outputs}
      />
    </>
  );
}
