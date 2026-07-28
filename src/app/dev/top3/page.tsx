import type { Metadata } from "next";
import EyecatchHero from "@/components/top2/EyecatchHero";
import LatestContentPromo from "@/components/top2/LatestContentPromo";
import FeatureLinkGrid from "@/components/top2/FeatureLinkGrid";
import NewContentList from "@/components/top2/NewContentList";
import CourseHighlightSection2 from "@/components/top2/CourseHighlightSection2";
import CourseHighlightSection5 from "@/components/top2/CourseHighlightSection5";
import DesignCareerSection2 from "@/components/top2/DesignCareerSection2";
import LessonHighlightSection, {
  type LessonHighlightRow,
} from "@/components/top/home/LessonHighlightSection";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import {
  getAllLessonsWithArticleIds,
  getAchievementGroups,
  getLatestMixedContent,
} from "@/lib/sanity";

/**
 * /dev/top3 — フォントサイズを2px落とした版を正式な目標サイズとして採用したページ
 *
 * ユーザー確認済み: 「コレぐらいのサイズがイメージ通り」→ 今後 top3 に追加する
 * ブロックは全てこの縮小サイズ感（title/description等を Figma実測より
 * 2px程度小さめ）で統一する。`/dev/top2` は Figma実測px通りの参照版として残す。
 *
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。
 */

export const metadata: Metadata = {
  title: "フォントサイズ比較 (/dev/top3)",
  robots: { index: false, follow: false },
};

export default async function DevTop3Page() {
  const [allLessons, achievementGroups, newContentItems] = await Promise.all([
    getAllLessonsWithArticleIds(),
    getAchievementGroups(3),
    getLatestMixedContent(4),
  ]);

  const findLesson = (title: string) =>
    allLessons.find((lesson) => lesson.title === title);
  const findLessonBySlug = (slug: string) =>
    allLessons.find((lesson) => lesson.slug?.current === slug);

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

  return (
    <>
    <div className="container">
      <div className="flex flex-col">
        {/* ブロックA: アイキャッチ（Figma node-id 662-40038） */}
        <EyecatchHero compact />

        <LatestContentPromo
          compact
          items={[
            {
              title: "AIでUIスタイリング入門",
              description: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
              href: "/lessons/ai-ui-styling-beginner",
              thumbnail:
                findLessonBySlug("ai-ui-styling-beginner")?.thumbnailUrl ??
                findLessonBySlug("ai-ui-styling-beginner")?.iconImageUrl,
            },
            {
              title: "質を上げるデザインの進め方",
              description: "基本のワークフローでアウトプットの質を高めます",
              href: "/lessons/ui-design-flow-lv1",
              thumbnail:
                findLessonBySlug("ui-design-flow-lv1")?.thumbnailUrl ??
                findLessonBySlug("ui-design-flow-lv1")?.iconImageUrl,
            },
            {
              title: "センスを盗んで成長速度を上げる",
              description: "自己流を卒業して引き出しを増やすシリーズ",
              href: "/lessons/steel-design-sense",
              thumbnail:
                findLessonBySlug("steel-design-sense")?.thumbnailUrl ??
                findLessonBySlug("steel-design-sense")?.iconImageUrl,
            },
          ]}
        />

        {/* ブロックB-2: サービス機能訴求（Figma node-id 662-39676） */}
        <FeatureLinkGrid compact />

        {/* ブロックB-3: あたらしいコンテンツ（Figma node-id 671-7338）
            記事・レッスン・ガイド・ブログ・ストーリー・イベントを横断した実データ
            （掲示板スレッドは一覧取得の仕組みが無いため対象外 → docs/dev-top-plan.md） */}
        <NewContentList
          compact
          items={newContentItems.map((item) => ({
            tag: item.type,
            title: item.title,
            href: item.href,
            thumbnail: item.thumbnail,
          }))}
        />

        {/* ブロック5: 課題解決のデザインをはじめる（Figma node-id 662-39727。
            以前top3への実装漏れが見つかったため追加） */}
        <CourseHighlightSection5
          compact
          heading="課題解決のデザインをはじめる"
          cards={[
            {
              categoryLabel: "UIのアイデア",
              typeLabel: "トレーニング",
              title: "目的からデザインを構築するトレーニング",
              description: "UIの仕組みとユーザーから発想する基本の形を身につけます",
              href: "/training",
            },
            {
              categoryLabel: "顧客の課題解決",
              typeLabel: "トレーニング",
              title: "顧客理解を価値に変換するデザイントレーニング",
              description: "UXデザインの基本を顧客インタビューを通して習得。課題を見つけるデザイン",
              href: "/training",
            },
          ]}
        />

        {/* ブロックC: 課題解決セクション（Figma node-id 671-6642） */}
        <CourseHighlightSection2
          compact
          heading="UIUXデザイナーに転職する"
          cards={[
            {
              categoryLabel: "UIUX転職",
              typeLabel: "ロードマップ",
              metaLine1: "情報設計でユーザー中心の",
              metaLine2: "UI設計をはじめるロードマップ",
              title: "UIUX転職ロードマップ",
              description: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
              href: "/roadmap",
            },
            {
              categoryLabel: "UIUX転職",
              typeLabel: "ロードマップ",
              metaLine1: "情報設計でユーザー中心の",
              metaLine2: "UI設計をはじめるロードマップ",
              title: "未経験からのUIUXデザイナー転職ガイド",
              description: "未経験からデザイナーを目指す人のためのキャリアガイド",
              href: "https://kaikun.bo-no.design/career/beginner",
              external: true,
            },
          ]}
        />
      </div>
    </div>

    {/* ブロックD: デザインとキャリアを考える（Figma node-id 662-39684）
        右端をPCで画面幅いっぱいに広げたいため、.container の外に配置
        （中身は DesignCareerSection2 内部の .container で揃える） */}
    <DesignCareerSection2
      compact
      items={[
        {
          title: "AIとデザインで身につけるスキル",
          description: "生成AI時代に必要なデザインスキルを体系的に学ぶ",
          href: "/roadmap",
        },
        {
          title: "UXのロードマップ",
          description: "ユーザー理解から体験設計までを学ぶ学習ルート",
          href: "/roadmap",
        },
        {
          title: "UIUX転職ロードマップ",
          description: "未経験からUIUXデザイナーを目指すキャリアの道のり",
          href: "/roadmap",
        },
        {
          title: "プロのフィードバックで成長する",
          description: "現役デザイナーからのフィードバックでスキルを磨く",
          href: "/feedbacks",
        },
      ]}
    />

    <div className="container">
      <div className="flex flex-col">
        {/* ブロックE: レッスン特集（Figma node-id 679-7773） */}
        <LessonHighlightSection
          compact
          badgeLabel="レッスン"
          heading="１−2週間でレベルを上げる"
          rows={lessonRows}
        />

        {/* ブロックF: みんなの実績（Figma node-id 662-39795） */}
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
