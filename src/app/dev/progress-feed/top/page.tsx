/**
 * /dev/progress-feed/top — /top 中心案（#251 フェーズ2）
 *
 * 本物の /top（NewTopContent）を会員表示で再現し、ヒーロー直下に進捗フィードを組み込んだもの。
 * NewTopContent はヒーローの直後に差し込む口がないため、同じ部品（organisms）を同じ順番で並べ直している
 * （本番の NewTopContent には手を入れない）。
 * CMSのセクションは本番と同じ取得関数を使い、取得に失敗したら本番の読み込み中表示のまま出す
 * （.env.local の無い環境でもページが落ちないようにするため）。計測（surface）は渡さない。
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/top-next/organisms/HeroSection";
import { PurposeNav } from "@/components/top-next/organisms/PurposeNav";
import { FeaturedSeries } from "@/components/top-next/organisms/FeaturedSeries";
import { NewContentSection } from "@/components/top-next/organisms/NewContentSection";
import { TrainingSection } from "@/components/top-next/organisms/TrainingSection";
import { CareerSection } from "@/components/top-next/organisms/CareerSection";
import { GuideSection } from "@/components/top-next/organisms/GuideSection";
import LessonHighlightSection, { type LessonHighlightRow } from "@/components/top/home/LessonHighlightSection";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import {
  getAchievementGroups,
  getAllGuidesFromSanity,
  getAllLessonsWithArticleIds,
  getLatestMixedContent,
} from "@/lib/sanity";
import { TopFeedBlock } from "../_proto/TopFeedBlock";

export const metadata: Metadata = {
  title: "トップ（進捗フィードのプロト）",
  robots: { index: false, follow: false },
};

// 以下の定義は src/components/top-next/NewTopContent.tsx と同じ
const guideDefinitions = [
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
];

const guidePlaceholders = guideDefinitions.map((item) => ({
  title: item.title,
  description: item.description,
  href: `/guide/${item.slug}`,
}));

const lessonDefinitions = [
  {
    subheading: "基本のデザインフローを身につける",
    titles: [
      "ゼロからはじめるUI情報設計",
      "UIが上手くなる人の“デザインサイクル” ─ 入門編β",
      "顧客体験デザインの基本",
    ],
  },
  {
    subheading: "UIデザインをはじめる",
    titles: ["Figmaの使い方入門", "ゼロからはじめるUIビジュアル", "センスを盗む技術"],
  },
];

const lessonSectionProps = {
  compact: true,
  badgeLabel: "レッスン",
  heading: "1−2週間でレベルを上げる",
  viewAllHref: "/lessons",
  imageLoading: "lazy" as const,
};

const featuredCards = [
  {
    title: "AIにUIデザインの見た目をサポートしてもらう方法",
    desc: "ユーザー中心のUI設計を学ぶロードマップ",
    href: "/lessons/ai-ui-styling-beginner",
    image: "/images/top5/thumbnail-aiui.jpg",
  },
  {
    title: "正解に辿り着くためのデザインワークフローを習得",
    desc: "基本のワークフローでアウトプットの質を高めます",
    href: "/lessons/ui-design-flow-lv1",
    image: "/images/top5/container-uicycle.jpg",
  },
  {
    title: "モードやアクションなどUIデザインの基本を習得",
    desc: "モード、アクションなど操作UIの基本を学ぼう",
    href: "/lessons/ui-layout-basic",
    image: "/images/top5/thumbnail-uihimitsu.jpg",
  },
];

const lessonFallback = (
  <LessonHighlightSection
    {...lessonSectionProps}
    rows={lessonDefinitions.map(({ subheading }) => ({ subheading, lessons: [] }))}
    loading
  />
);
const achievementFallback = <AchievementHighlightSection compact storyItems={[]} outputItems={[]} loading />;
const latestFallback = <NewContentSection articles={[]} viewAllHref="/updates" loading />;

/** 取得に失敗したら null（CMSにつながらない環境でもページを落とさない） */
async function safe<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}

async function LatestContent() {
  const items = await safe(() => getLatestMixedContent(4));
  if (!items) return latestFallback;
  const articles = items.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
  }));
  return <NewContentSection articles={articles} viewAllHref="/updates" />;
}

async function Guides() {
  const guides = await safe(getAllGuidesFromSanity);
  if (!guides) return <GuideSection guides={guidePlaceholders} />;
  const items = guideDefinitions.map(({ title, description, slug }) => ({
    title,
    description,
    href: `/guide/${slug}`,
    image: guides.find((guide) => guide.slug === slug)?.thumbnailUrl,
  }));
  return <GuideSection guides={items} />;
}

async function Lessons() {
  const lessons = await safe(getAllLessonsWithArticleIds);
  if (!lessons) return lessonFallback;
  const rows: LessonHighlightRow[] = lessonDefinitions.map(({ subheading, titles }) => ({
    subheading,
    lessons: titles
      .map((title) => lessons.find((lesson) => lesson.title === title))
      .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson)),
  }));
  return <LessonHighlightSection {...lessonSectionProps} rows={rows} />;
}

async function Achievements() {
  const groups = await safe(() => getAchievementGroups(3));
  if (!groups) return achievementFallback;
  return <AchievementHighlightSection compact storyItems={groups.stories} outputItems={groups.outputs} />;
}

export default function Page() {
  return (
    <>
      {/* 会員表示: 入会CTAは出さない（membershipCta={null}） */}
      <HeroSection isMember membershipCta={null} />
      {/* #251: ヒーロー直下に進捗フィード */}
      <TopFeedBlock />
      <div className="flex flex-col">
        <div className="order-2 sm:order-1">
          <PurposeNav />
        </div>
        <div className="order-1 sm:order-2">
          <FeaturedSeries cards={featuredCards} />
        </div>
      </div>
      <Suspense fallback={latestFallback}>
        <LatestContent />
      </Suspense>
      <TrainingSection
        image1="/images/top5/training-info-architecture.jpg"
        image2="/images/top5/training-ux-research.jpg"
      />
      <CareerSection image1="/images/top5/career-uiux-roadmap.jpg" image2="/images/top5/career-uiux-guide.jpg" />
      <Suspense fallback={<GuideSection guides={guidePlaceholders} />}>
        <Guides />
      </Suspense>
      <div className="container">
        <div className="flex flex-col">
          <Suspense fallback={lessonFallback}>
            <Lessons />
          </Suspense>
          <Suspense fallback={achievementFallback}>
            <Achievements />
          </Suspense>
        </div>
      </div>
    </>
  );
}
