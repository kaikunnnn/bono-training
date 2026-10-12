import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/top-next/organisms/HeroSection";
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
} from "@/lib/sanity";
import { traceServerStep } from "@/lib/performance/server-trace";
import type { HomeClickSurface } from "@/lib/activity-utils";
import type { Surface } from "../patterns";
import { CourseTopRow, type PatternId } from "./CourseTopRow";

/**
 * /dev/course-card-patterns/top — コースカード（#235）を本番トップに横3枚で置いた見え方
 *
 * 本番トップ（src/components/top-next/NewTopContent.tsx）をコピーし、
 * PurposeNav（小さい4つの導線）と FeaturedSeries（AIにUIデザインの見た目〜の3枚）の
 * 2ブロックだけを CourseTopRow に差し替えている。それ以外のセクションとデータ取得は本番と同じ。
 * クリック計測（home_click）は付けない（surface 未指定）。
 *
 * パターン・背景・仮タグは画面下の切り替えバー、または URL で指定する:
 *   ?pattern=a|b|c|c2|d|e|f&surface=none|white|border&kari=1
 */

export const metadata: Metadata = {
  title: "コースカードをトップに並べる (/dev/course-card-patterns/top)",
  robots: { index: false, follow: false },
};

const PATTERN_IDS: PatternId[] = ["a", "b", "c", "c2", "d", "e", "f"];
const SURFACE_IDS: Surface[] = ["none", "white", "border"];

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
    titles: [
      "Figmaの使い方入門",
      "ゼロからはじめるUIビジュアル",
      "センスを盗む技術",
    ],
  },
];

/** どの画面のクリックとして記録するか（#232 home_click）。未指定なら計測しない */
interface SurfaceProps {
  surface?: HomeClickSurface;
}

async function LatestContent({ surface }: SurfaceProps) {
  const items = await traceServerStep("top.cms.latest", () => getLatestMixedContent(4));
  const articles = items.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
  }));
  return <NewContentSection articles={articles} viewAllHref="/updates" surface={surface} />;
}

async function Guides({ surface }: SurfaceProps) {
  const guides = await traceServerStep("top.cms.guides", getAllGuidesFromSanity);
  const items = guideDefinitions.map(({ title, description, slug }) => ({
    title,
    description,
    href: `/guide/${slug}`,
    image: guides.find((guide) => guide.slug === slug)?.thumbnailUrl,
  }));
  return <GuideSection guides={items} surface={surface} />;
}

const lessonSectionProps = {
  compact: true,
  badgeLabel: "レッスン",
  heading: "1−2週間でレベルを上げる",
  viewAllHref: "/lessons",
  imageLoading: "lazy" as const,
};

async function Lessons({ surface }: SurfaceProps) {
  const lessons = await traceServerStep("top.cms.lessons", getAllLessonsWithArticleIds);
  const rows: LessonHighlightRow[] = lessonDefinitions.map(
    ({ subheading, titles }) => ({
      subheading,
      lessons: titles
        .map((title) => lessons.find((lesson) => lesson.title === title))
        .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson)),
    }),
  );
  return <LessonHighlightSection {...lessonSectionProps} rows={rows} surface={surface} />;
}

async function Achievements({ surface }: SurfaceProps) {
  const groups = await traceServerStep("top.cms.achievements", () => getAchievementGroups(3));
  return (
    <AchievementHighlightSection
      compact
      storyItems={groups.stories}
      outputItems={groups.outputs}
      surface={surface}
    />
  );
}


export default async function CourseCardTopPage({
  searchParams,
}: {
  searchParams: Promise<{ pattern?: string; surface?: string; kari?: string }>;
}) {
  const params = await searchParams;
  const pattern = PATTERN_IDS.find((id) => id === params.pattern) ?? "a";
  const surface = SURFACE_IDS.find((id) => id === params.surface) ?? "none";

  return (
    <>
      <HeroSection isMember={false} />
      <CourseTopRow initialPattern={pattern} initialSurface={surface} initialKari={params.kari === "1"} />
      <Suspense fallback={<NewContentSection articles={[]} viewAllHref="/updates" loading />}>
        <LatestContent />
      </Suspense>
      <TrainingSection
        image1="/images/top5/training-info-architecture.jpg"
        image2="/images/top5/training-ux-research.jpg"
      />
      <CareerSection
        image1="/images/top5/career-uiux-roadmap.jpg"
        image2="/images/top5/career-uiux-guide.jpg"
      />
      <Suspense fallback={<GuideSection guides={guidePlaceholders} />}>
        <Guides />
      </Suspense>
      <div className="container">
        <div className="flex flex-col">
          <Suspense
            fallback={
              <LessonHighlightSection
                {...lessonSectionProps}
                rows={lessonDefinitions.map(({ subheading }) => ({ subheading, lessons: [] }))}
                loading
              />
            }
          >
            <Lessons />
          </Suspense>
          <Suspense
            fallback={<AchievementHighlightSection compact storyItems={[]} outputItems={[]} loading />}
          >
            <Achievements />
          </Suspense>
        </div>
      </div>
    </>
  );
}
