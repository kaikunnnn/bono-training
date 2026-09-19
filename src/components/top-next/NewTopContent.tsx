import { Suspense, type ReactNode } from "react";
import { generateWebSiteJsonLd, jsonLdScriptProps } from "@/lib/jsonld";
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
} from "@/lib/sanity";
import { traceServerStep } from "@/lib/performance/server-trace";

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

async function LatestContent() {
  const items = await traceServerStep("top.cms.latest", () => getLatestMixedContent(4));
  const articles = items.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
  }));
  return <NewContentSection articles={articles} viewAllHref="/updates" />;
}

async function Guides() {
  const guides = await traceServerStep("top.cms.guides", getAllGuidesFromSanity);
  const items = guideDefinitions.map(({ title, description, slug }) => ({
    title,
    description,
    href: `/guide/${slug}`,
    image: guides.find((guide) => guide.slug === slug)?.thumbnailUrl,
  }));
  return <GuideSection guides={items} />;
}

const lessonSectionProps = {
  compact: true,
  badgeLabel: "レッスン",
  heading: "1−2週間でレベルを上げる",
  viewAllHref: "/lessons",
  imageLoading: "lazy" as const,
};

async function Lessons() {
  const lessons = await traceServerStep("top.cms.lessons", getAllLessonsWithArticleIds);
  const rows: LessonHighlightRow[] = lessonDefinitions.map(
    ({ subheading, titles }) => ({
      subheading,
      lessons: titles
        .map((title) => lessons.find((lesson) => lesson.title === title))
        .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson)),
    }),
  );
  return <LessonHighlightSection {...lessonSectionProps} rows={rows} />;
}

async function Achievements() {
  const groups = await traceServerStep("top.cms.achievements", () => getAchievementGroups(3));
  return (
    <AchievementHighlightSection
      compact
      storyItems={groups.stories}
      outputItems={groups.outputs}
    />
  );
}

/**
 * `/` と `/top` の共通本文。認証・リダイレクト・metadataは各routeに維持する。
 * isMember=trueなら入会CTAを非表示。`/` のログイン会員は /mypage へ遷移する。
 *
 * このシェルでCMSをawaitしない。Heroと固定リンクを先に返し、各セクションは
 * 独立したSuspense内で取得する。個人データの共有キャッシュは追加しない。
 */
export interface NewTopContentProps {
  isMember?: boolean;
  /** Hero本文を止めず、会員判定後のCTAだけを差し込むためのスロット */
  membershipCta?: ReactNode;
}

export function NewTopContent({
  isMember = false,
  membershipCta,
}: NewTopContentProps) {
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

  return (
    <>
      <script {...jsonLdScriptProps(generateWebSiteJsonLd())} />
      <HeroSection isMember={isMember} membershipCta={membershipCta} />
      {/* スマホ(sm未満)のみ PurposeNav と FeaturedSeries の並びを逆にする。
          sm以上は PurposeNav → FeaturedSeries の元の順序を維持 */}
      <div className="flex flex-col">
        <div className="order-2 sm:order-1">
          <PurposeNav />
        </div>
        <div className="order-1 sm:order-2">
          <FeaturedSeries cards={featuredCards} />
        </div>
      </div>
      <Suspense
        fallback={<NewContentSection articles={[]} viewAllHref="/updates" loading />}
      >
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
