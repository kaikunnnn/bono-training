import type { Metadata } from "next";
import HeroSection from "@/components/top/home/HeroSection";
import EyecatchSection from "@/components/top/home/EyecatchSection";
import NewContentSection, {
  type NewContentItem,
} from "@/components/top/home/NewContentSection";
import CourseBannerSection from "@/components/top/home/CourseBannerSection";
import CoursePromoSection from "@/components/top/home/CoursePromoSection";
import CourseHighlightSection from "@/components/top/home/CourseHighlightSection";
import HighlightPromoSection from "@/components/top/home/HighlightPromoSection";
import DesignCareerSection from "@/components/top/home/DesignCareerSection";
import LessonHighlightSection, {
  type LessonHighlightRow,
} from "@/components/top/home/LessonHighlightSection";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import { type CoursePromoCardProps } from "@/components/top/home/CoursePromoCard";
import { getOgImageUrl } from "@/lib/og-image-fetch";
import {
  getAllLessonsWithArticleIds,
  getAchievementGroups,
} from "@/lib/sanity";

/**
 * /dev/top — 新トップページ（2026）組み立て用プレビュー
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 497-3
 *
 * ブロック単位で実装し、ここで確認する。完成後に / へ接続する。
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。
 */

export const metadata: Metadata = {
  title: "新トップ プレビュー (/dev/top)",
  robots: { index: false, follow: false },
};

// ブロック2 のモックデータ（Figma の見た目確認用）
const MOCK_NEW_ITEMS: NewContentItem[] = [
  {
    type: "レッスン",
    title: "生成AIと共創するデザインプロセス",
    thumbnail: "/images/top/new/new1.png",
    href: "/lessons",
  },
  {
    type: "ガイド",
    title: "生成AIと共創するデザインプロセスだよ〜ね〜",
    thumbnail: "/images/top/new/new2.png",
    href: "/guide",
  },
  {
    type: "フィードバック",
    title: "生成AIと共創するデザインプロセス",
    thumbnail: "/images/top/new/new3.png",
    href: "/feedbacks",
  },
  {
    type: "レッスン",
    title: "生成AIと共創するデザインプロセス",
    thumbnail: "/images/top/new/new4.png",
    href: "/lessons",
  },
];

// ブロック5 のモックデータ（Figma node-id: 662-39727）
const MOCK_HIGHLIGHT_CARDS: CoursePromoCardProps[] = [
  {
    layout: "default",
    categoryLabel: "UIUX転職",
    typeLabel: "ロードマップ",
    visual: {
      type: "collage",
      images: [
        { src: "/images/top/course/collage-1.png", alt: "" },
        { src: "/images/top/course/collage-2.png", alt: "" },
        { src: "/images/top/course/collage-3.png", alt: "" },
        { src: "/images/top/course/collage-4.png", alt: "" },
      ],
    },
    title: "UIUX転職ロードマップ",
    description: "情報設計でユーザー中心のUI設計をはじめるロードマップ",
    href: "/roadmap",
  },
  {
    layout: "default",
    categoryLabel: "UIのアイデア",
    typeLabel: "トレーニング",
    visual: {
      type: "single",
      image: { src: "/images/top/course/badge-info-arch.png", alt: "" },
      gradientPreset: "info-arch",
    },
    title: "目的を達成するためのUIデザイン",
    description: "顧客と目的を達成する”デザインの進め方”を身につけよう",
    href: "/training",
  },
];

// ブロックC のリンク先（Figma node-id: 671-6642）
// カード1: ロードマップ一覧（実在ルート /roadmap）
// カード2: 外部キャリアガイド（別タブ）
const BLOCK_C_ROADMAP_HREF = "/roadmap";
const BLOCK_C_CAREER_HREF = "https://kaikun.bo-no.design/career/beginner";

export default async function DevTopPage() {
  // ブロックC の 2枚のカードのサムネイルは、各リンク先の OGP 画像を使う
  // ブロックE のレッスンは /lessons と同じ実データ取得ロジックを流用する
  // ブロックF: みんなの実績（転職インタビュー + アウトプットを公開日順で最新3件）
  const [[roadmapOg, careerOg], allLessons, achievementGroups] = await Promise.all([
    Promise.all([
      getOgImageUrl(BLOCK_C_ROADMAP_HREF),
      getOgImageUrl(BLOCK_C_CAREER_HREF),
    ]),
    getAllLessonsWithArticleIds(),
    getAchievementGroups(3),
  ]);

  // ブロックE: レッスン特集（Figma node-id: 679-7773）
  // 見出しコピーは Figma 実データを採用。各行 3 件は暫定で先頭から詰める
  //（テーマ別の厳密なキュレーションは Sanity 側のタグ整理後に対応 → docs/dev-top-todo.md）
  const lessonRows: LessonHighlightRow[] = [
    {
      subheading: "基本のデザインワークフローを身につける",
      lessons: allLessons.slice(0, 3),
    },
    {
      subheading: "UIデザインをはじめる",
      lessons: allLessons.slice(3, 6),
    },
  ];

  // ブロックC のカード（仮コピー。実コピーはユーザーが後で用意 → docs/dev-top-todo.md）
  const blockCCards: CoursePromoCardProps[] = [
    {
      layout: "default",
      categoryLabel: "",
      typeLabel: "",
      visual: { type: "og", image: { src: roadmapOg, alt: "" } },
      title: "UIUX転職ロードマップ",
      description: "情報設計からユーザー中心のUI設計をはじめる学習ルート",
      href: BLOCK_C_ROADMAP_HREF,
    },
    {
      layout: "default",
      categoryLabel: "",
      typeLabel: "",
      visual: { type: "og", image: { src: careerOg, alt: "" } },
      title: "未経験からのUIUXデザイナー転職ガイド",
      description: "未経験からデザイナーを目指す人のためのキャリアガイド",
      href: BLOCK_C_CAREER_HREF,
      external: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-16 sm:gap-24">
        {/* ブロックA: ヒーロー（Figma 662-40038）。EyecatchSection と並存 */}
        <HeroSection />

        {/* ブロックB: 訴求3ブロック（Figma 689-6919 / B-1 spotlight + B-2 機能訴求） */}
        <HighlightPromoSection />

        {/* ブロック1: アイキャッチ */}
        <EyecatchSection />

        {/*
          ブロック2 / ブロックB-3: 新着コンテンツ一覧（モックデータ）。
          本番では getLatestMixedContent() の結果（MixedContentItem[]）を items に渡す。
          このプロトタイプでは Server Component 化せずモックのままとする。
        */}
        <NewContentSection items={MOCK_NEW_ITEMS} />

        {/* ブロック3: コース訴求バナー（モックデータ。承認後に実データ接続） */}
        <CourseBannerSection />

        {/* ブロック4: コース訴求カード（モックデータ。承認後に実データ接続） */}
        <CoursePromoSection />

        {/* ブロック5: 課題解決のデザインをはじめる（モックデータ。承認後に実データ接続） */}
        <CourseHighlightSection
          heading="課題解決のデザインをはじめる"
          cards={MOCK_HIGHLIGHT_CARDS}
        />

        {/*
          ブロックC: 2つ目の課題解決セクション（Figma 671-6642）。
          ブロック5と同テンプレだが見出しは 28px（headingSize="md"）。
          サムネイルは各リンク先ページの OGP 画像を使用。
        */}
        <CourseHighlightSection
          badgeLabel="DESIGN WITH USER"
          heading="UIUXデザイナーに転職する"
          headingSize="md"
          cards={blockCCards}
        />

        {/* ブロックD: デザインとキャリアを考える（Figma 662-39684 / ダーク背景） */}
        <DesignCareerSection
          largeItem={{
            title: "AIとデザインで身につけるスキル",
            description: "生成AI時代に必要なデザインスキルを体系的に学ぶ",
            href: "/roadmap",
          }}
          smallItems={[
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
          ]}
        />

        {/* ブロックE: レッスン特集（Figma 679-7773）。カードは /lessons と同じ
            LessonCardRenderer を流用。見出し・余白のみ Figma 準拠 */}
        <LessonHighlightSection
          heading="１−2週間でレベルを上げる"
          rows={lessonRows}
        />

        {/* ブロックF: みんなの実績（Figma 662-39795）。
            転職インタビュー3件・アウトプット3件を別グループとして表示（統一カードデザイン） */}
        <AchievementHighlightSection
          heading="みんなの実績"
          storyItems={achievementGroups.stories}
          outputItems={achievementGroups.outputs}
        />

        {/* 以降のブロックは順次追加 */}
      </div>
    </div>
  );
}
