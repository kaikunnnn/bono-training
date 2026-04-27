/**
 * 検索結果コンポーネントのプレビュー
 * 既存コンポーネント（LessonCard, SearchArticleItem, GuideCard）で
 * 検索結果がどう表示されるかをモックデータで確認
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import LessonCard from "@/components/lessons/LessonCard";
import { SearchArticleItem } from "@/components/search/SearchArticleItem";
import GuideCard from "@/components/guide/GuideCard";
import {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
  type LessonSearchResult,
  type ArticleSearchResult,
  type GuideSearchResult,
} from "@/types/search";
import type { Lesson } from "@/types/lesson";
import type { Guide, GuideCategory } from "@/types/guide";

// ── モックデータ ──

const mockLessons: LessonSearchResult[] = [
  {
    id: "lesson-1",
    type: "lesson",
    title: "ゼロからはじめる情報設計",
    description: "UIデザインの土台となる情報設計を基礎から学びます。ユーザーの目的を達成するための構造設計を身につけましょう。",
    slug: "information-architecture-basics",
    thumbnail: "https://placehold.co/216x326/e2e8f0/475569?text=Info+Design",
    category: "情報設計",
    lessonCount: 12,
    isPremium: false,
    tags: ["情報設計", "IA", "初心者向け"],
  },
  {
    id: "lesson-2",
    type: "lesson",
    title: "UIビジュアル基礎",
    description: "色、タイポグラフィ、レイアウトなどUIビジュアルの基本原則を学びます。",
    slug: "ui-visual-basics",
    thumbnail: "https://placehold.co/216x326/fef3c7/92400e?text=UI+Visual",
    category: "UIデザイン",
    lessonCount: 15,
    isPremium: true,
    tags: ["UIデザイン", "ビジュアル"],
  },
  {
    id: "lesson-3",
    type: "lesson",
    title: "Figma実践マスター",
    description: "FigmaでのUI制作を効率的に行うためのテクニックを学びます。",
    slug: "figma-master",
    category: "Figma",
    lessonCount: 20,
    isPremium: true,
    tags: ["Figma", "ツール"],
  },
  {
    id: "lesson-4",
    type: "lesson",
    title: "UXリサーチ入門",
    description: "ユーザーを理解するためのリサーチ手法を学びます。",
    slug: "ux-research-intro",
    thumbnail: "https://placehold.co/216x326/dbeafe/1e40af?text=UX+Research",
    category: "UXデザイン",
    lessonCount: 8,
    isPremium: false,
    tags: ["UXデザイン", "リサーチ"],
  },
];

const mockArticles: ArticleSearchResult[] = [
  {
    id: "article-1",
    type: "article",
    title: "ユーザーフローの作り方",
    description: "ユーザーの行動を可視化するフロー図の作成方法を解説します。",
    slug: "user-flow-creation",
    thumbnail: "https://placehold.co/160x90/e2e8f0/475569?text=Flow",
    parentLessonTitle: "ゼロからはじめる情報設計",
    parentLessonSlug: "information-architecture-basics",
    readingTime: 15,
    isPremium: false,
    tags: ["ユーザーフロー", "情報設計"],
  },
  {
    id: "article-2",
    type: "article",
    title: "カラーパレットの選び方",
    description: "ブランドに合った配色を選ぶためのガイド。",
    slug: "color-palette-guide",
    thumbnail: "https://placehold.co/160x90/fef3c7/92400e?text=Color",
    parentLessonTitle: "UIビジュアル基礎",
    parentLessonSlug: "ui-visual-basics",
    readingTime: 10,
    isPremium: true,
    tags: ["カラー", "配色"],
  },
  {
    id: "article-3",
    type: "article",
    title: "Auto Layoutの基本と応用",
    description: "FigmaのAuto Layout機能を使いこなすためのチュートリアル。",
    slug: "auto-layout-tutorial",
    parentLessonTitle: "Figma実践マスター",
    parentLessonSlug: "figma-master",
    readingTime: 20,
    isPremium: true,
    tags: ["Figma", "Auto Layout"],
  },
  {
    id: "article-4",
    type: "article",
    title: "ペルソナの作り方",
    description: "効果的なペルソナを作成するためのステップバイステップガイド。",
    slug: "persona-creation",
    parentLessonTitle: "UXリサーチ入門",
    parentLessonSlug: "ux-research-intro",
    readingTime: 12,
    isPremium: false,
    tags: ["ペルソナ", "UXデザイン"],
  },
  {
    id: "article-5",
    type: "article",
    title: "ワイヤーフレームの描き方",
    description: "素早く効果的なワイヤーフレームを作成する方法。",
    slug: "wireframe-basics",
    parentLessonTitle: "ゼロからはじめる情報設計",
    parentLessonSlug: "information-architecture-basics",
    readingTime: 18,
    isPremium: false,
    tags: ["ワイヤーフレーム", "情報設計"],
  },
];

const mockGuides: GuideSearchResult[] = [
  {
    id: "guide-1",
    type: "guide",
    title: "UIUXデザイナーに必要なスキルとは？",
    description: "UIUXデザイナーとして活躍するために必要なスキルセットを解説。ハードスキルとソフトスキルの両面から。",
    slug: "uiux-designer-skills",
    thumbnail: "https://placehold.co/640x360/e2e8f0/475569?text=Skills",
    category: "career",
    readingTime: "10分",
    publishedAt: "2024-01-15",
    author: "BONO",
    isPremium: false,
    tags: ["キャリア", "スキル"],
  },
  {
    id: "guide-2",
    type: "guide",
    title: "未経験からUIUXデザイナーになるロードマップ",
    description: "デザイン未経験からUIUXデザイナーになるための学習ステップを詳しく解説。",
    slug: "career-roadmap-beginner",
    category: "career",
    readingTime: "15分",
    publishedAt: "2024-02-01",
    author: "BONO",
    isPremium: true,
    tags: ["キャリア", "ロードマップ"],
  },
  {
    id: "guide-3",
    type: "guide",
    title: "デザイナーの勉強法：効率的に学ぶコツ",
    description: "限られた時間で効率的にデザインスキルを身につけるための学習法。インプットとアウトプットのバランス。",
    slug: "effective-learning-methods",
    thumbnail: "https://placehold.co/640x360/dbeafe/1e40af?text=Learning",
    category: "learning",
    readingTime: "8分",
    publishedAt: "2024-01-20",
    author: "BONO",
    isPremium: false,
    tags: ["学習法", "効率化"],
  },
];

// ── アダプター関数 ──

function toLessonCardProps(result: LessonSearchResult): Lesson {
  return {
    id: result.id,
    title: result.title,
    description: result.description,
    category: result.category,
    thumbnail: result.thumbnail,
    slug: result.slug,
  };
}

function toGuideCardProps(result: GuideSearchResult): Guide {
  return {
    _id: result.id,
    title: result.title,
    description: result.description,
    slug: result.slug,
    category: (result.category || "learning") as GuideCategory,
    tags: result.tags || [],
    thumbnailUrl: result.thumbnail,
    videoUrl: result.videoUrl,
    author: result.author || "BONO",
    publishedAt: result.publishedAt || "",
    readingTime: result.readingTime,
    isPremium: result.isPremium || false,
  };
}

// ── コンポーネント ──

const SearchResultsPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results Preview</h1>
          <p className="text-gray-600">
            検索結果コンポーネントのプレビュー。既存コンポーネント（LessonCard, ArticleItem, GuideCard）を再利用。
          </p>
        </header>

        {/* レッスンセクション */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CONTENT_TYPE_ICONS.lesson}</span>
            <h2 className="text-lg font-bold text-gray-900">
              {CONTENT_TYPE_LABELS.lesson}
            </h2>
            <span className="text-sm text-gray-500">
              ({mockLessons.length}件)
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {mockLessons.map((result) => (
              <LessonCard
                key={result.id}
                lesson={toLessonCardProps(result)}
                onClick={() => navigate(`/lessons/${result.slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 記事セクション */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CONTENT_TYPE_ICONS.article}</span>
            <h2 className="text-lg font-bold text-gray-900">
              {CONTENT_TYPE_LABELS.article}
            </h2>
            <span className="text-sm text-gray-500">
              ({mockArticles.length}件)
            </span>
          </div>
          <div className="bg-white rounded-[24px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)] overflow-hidden">
            {mockArticles.map((result) => (
              <SearchArticleItem key={result.id} result={result} />
            ))}
          </div>
        </section>

        {/* ガイドセクション */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CONTENT_TYPE_ICONS.guide}</span>
            <h2 className="text-lg font-bold text-gray-900">
              {CONTENT_TYPE_LABELS.guide}
            </h2>
            <span className="text-sm text-gray-500">
              ({mockGuides.length}件)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGuides.map((result) => (
              <GuideCard
                key={result.id}
                guide={toGuideCardProps(result)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SearchResultsPreview;
