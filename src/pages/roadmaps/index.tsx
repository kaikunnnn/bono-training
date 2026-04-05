/**
 * ロードマップ一覧ページ
 *
 * カテゴリ別にロードマップを一覧表示する
 * URL遷移型のカテゴリフィルタリング対応
 * データはSanityから取得
 */

import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/common/PageHeader';
import CategoryNav from '@/components/common/CategoryNav';
import SectionHeading from '@/components/common/SectionHeading';
import RoadmapCardV2 from '@/components/roadmap/RoadmapCardV2';
import DottedDivider from '@/components/common/DottedDivider';
import { useRoadmaps, type RoadmapListItem } from '@/hooks/useRoadmaps';
import type { GradientPreset } from '@/components/roadmap/RoadmapCardV2';

// ============================================
// カテゴリ定義
// ============================================

interface CategoryDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  roadmapSlugs: string[]; // このカテゴリに属するロードマップのslug
}

// カテゴリとロードマップの対応付け
const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'career',
    title: '転職・キャリアチェンジしたい',
    description: '未経験からデザイナーへ、キャリアアップを目指したい方向けの地図',
    emoji: '🚀',
    roadmapSlugs: ['uiux-career-change'],
  },
  {
    id: 'user-centered',
    title: 'ユーザー中心デザインを体系的に身につけたい',
    description: 'サービス価値とユーザーをつなげるデザインを学ぶ',
    emoji: '🎯',
    roadmapSlugs: ['ux-design', 'information-architecture'],
  },
  {
    id: 'skill',
    title: '基礎スキルを体系的に身につけたい',
    description: 'デザインの基礎を固めたい方向け',
    emoji: '📚',
    roadmapSlugs: ['ui-visual', 'ui-design-beginner'],
  },
];

// ナビゲーションアイテム生成（カウントなし）
const NAV_ITEMS = [
  { label: 'すべて', href: '/roadmaps' },
  ...CATEGORY_DEFINITIONS.map((cat) => ({
    label: cat.title,
    href: `/roadmaps/category/${cat.id}`,
  })),
];

// ============================================
// ユーティリティ関数
// ============================================

/**
 * Sanityデータからカテゴリ別にロードマップをグループ化
 * isPublished: true のロードマップのみ表示
 */
function groupRoadmapsByCategory(
  roadmaps: RoadmapListItem[],
  categories: CategoryDefinition[]
): Array<CategoryDefinition & { roadmaps: RoadmapListItem[] }> {
  // 公開済みのロードマップのみをslugでマップ化
  const roadmapMap = new Map<string, RoadmapListItem>();
  roadmaps
    .filter((rm) => rm.isPublished)
    .forEach((rm) => {
      if (rm.slug?.current) {
        roadmapMap.set(rm.slug.current, rm);
      }
    });

  // 各カテゴリにロードマップを割り当て
  return categories.map((cat) => ({
    ...cat,
    roadmaps: cat.roadmapSlugs
      .map((slug) => roadmapMap.get(slug))
      .filter((rm): rm is RoadmapListItem => rm !== undefined),
  }));
}

// ============================================
// メインコンポーネント
// ============================================

export default function RoadmapListPage() {
  const { categoryId } = useParams<{ categoryId?: string }>();

  // Sanityからロードマップデータを取得
  const { data: roadmaps, isLoading, error } = useRoadmaps();

  // タブナビのsticky状態を検知
  const tabSentinelRef = useRef<HTMLDivElement>(null);
  const [isTabSticky, setIsTabSticky] = useState(false);

  useEffect(() => {
    const sentinel = tabSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // sentinelがビューポートから消えたらsticky状態
        setIsTabSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // ローディング中
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen">
          <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
            <PageHeader
              label="変化への地図"
              title="ロードマップ"
              description="目標に合ったロードマップを選んで、デザインの探求をはじめよう！"
            />
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  // エラー時
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen">
          <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
            <PageHeader
              label="変化への地図"
              title="ロードマップ"
              description="目標に合ったロードマップを選んで、デザインの探求をはじめよう！"
            />
            <div className="flex items-center justify-center py-16">
              <p className="text-red-500">データの取得に失敗しました</p>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  // ロードマップをカテゴリ別にグループ化
  const categoriesWithRoadmaps = groupRoadmapsByCategory(
    roadmaps || [],
    CATEGORY_DEFINITIONS
  );

  // フィルタリング
  const displayCategories = categoryId
    ? categoriesWithRoadmaps.filter((cat) => cat.id === categoryId)
    : categoriesWithRoadmaps;

  return (
    <Layout>
      <div className="min-h-screen">
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
          {/* ページヘッダー */}
          <PageHeader
            label="変化への地図"
            title="ロードマップ"
            description="目標に合ったロードマップを選んで、デザインの探求をはじめよう！"
          />

          {/* タブナビゲーションのsticky検知用sentinel */}
          <div ref={tabSentinelRef} className="h-0" aria-hidden="true" />

          {/* カテゴリナビゲーション（sticky: スクロールで固定）- 通常時は透明、sticky時は背景ブラー */}
          <div
            className={cn(
              "sticky top-14 xl:top-0 z-10 mb-8 transition-all duration-200 -mx-4 sm:-mx-6 px-2 sm:px-4 md:px-6",
              isTabSticky
                ? "backdrop-blur-sm bg-white/50"
                : "bg-transparent"
            )}
          >
            <CategoryNav
              items={NAV_ITEMS}
              align="center"
              className="border-gray-200/50"
            />
          </div>

          {/* カテゴリ別セクション */}
          <div className="space-y-16">
            {displayCategories.map((category, index) => (
              <React.Fragment key={category.id}>
                {/* セクション区切り線（最初以外） */}
                {index > 0 && <DottedDivider className="mb-12" />}

                {/* セクション */}
                <section>
                  <div className="mb-6">
                    <SectionHeading
                      title={category.title}
                      description={category.description}
                      descriptionStyle="text"
                      showUnderline={false}
                    />
                  </div>

                  {/* カードグリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                    {category.roadmaps.map((roadmap) => (
                      <RoadmapCardV2
                        key={roadmap.slug.current}
                        slug={roadmap.slug.current}
                        title={roadmap.title}
                        description={roadmap.description}
                        thumbnailUrl={roadmap.thumbnailUrl}
                        stepCount={roadmap.stepCount}
                        estimatedDuration={roadmap.estimatedDuration}
                        shortTitle={roadmap.shortTitle}
                        gradientPreset={roadmap.gradientPreset as GradientPreset}
                        variant="gradient"
                        orientation="vertical"
                        thumbnailStyle="wave"
                      />
                    ))}
                  </div>
                </section>
              </React.Fragment>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}
