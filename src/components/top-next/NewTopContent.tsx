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

/**
 * 新トップの本体（データ取得 + 描画）。1ソースとして `/`（page.tsx）と `/top`
 * （top/page.tsx）の両方から呼ぶ。認証・リダイレクト・metadata は各ページ側が持ち、
 * ここは会員判定の結果（isMember）だけを prop で受け取る。
 *
 * - isMember=true（standard/feedback 会員）のとき Hero の入会CTAを非表示にする。
 *   `/` はログイン済みを /mypage へ飛ばすため常に false、/top はログイン中でも
 *   表示するため実際の購読状態を渡す。
 */
export async function NewTopContent({ isMember }: { isMember: boolean }) {
  const [allLessons, achievementGroups, newContentItems, allGuides] =
    await Promise.all([
      getAllLessonsWithArticleIds(),
      getAchievementGroups(3),
      getLatestMixedContent(4),
      getAllGuidesFromSanity(),
    ]);

  const findLesson = (title: string) =>
    allLessons.find((lesson) => lesson.title === title);
  const findGuideBySlug = (slug: string) =>
    allGuides.find((guide) => guide.slug === slug);

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

  const newContentArticles = newContentItems.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
  }));

  return (
    <>
      <script {...jsonLdScriptProps(generateWebSiteJsonLd())} />
      <HeroSection isMember={isMember} />
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
      <NewContentSection articles={newContentArticles} />
      <TrainingSection
        image1="/images/top5/training-info-architecture.jpg"
        image2="/images/top5/training-ux-research.jpg"
      />
      <CareerSection
        image1="/images/top5/career-uiux-roadmap.jpg"
        image2="/images/top5/career-uiux-guide.jpg"
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
