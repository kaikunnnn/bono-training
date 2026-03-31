/**
 * ロードマップ一覧ページ
 *
 * カテゴリ別にロードマップを一覧表示する
 * URL遷移型のカテゴリフィルタリング対応
 * データはSanityから取得
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/common/PageHeader';
import CategoryNav from '@/components/common/CategoryNav';
import SectionHeading from '@/components/common/SectionHeading';
import RoadmapCard from '@/components/roadmap/RoadmapCard';
import DottedDivider from '@/components/common/DottedDivider';
import { useRoadmaps, type RoadmapListItem } from '@/hooks/useRoadmaps';
import type { GradientType } from '@/components/roadmap/RoadmapCard';

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
 */
function groupRoadmapsByCategory(
  roadmaps: RoadmapListItem[],
  categories: CategoryDefinition[]
): Array<CategoryDefinition & { roadmaps: RoadmapListItem[] }> {
  // slugでロードマップをマップ化
  const roadmapMap = new Map<string, RoadmapListItem>();
  roadmaps.forEach((rm) => {
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

          {/* カテゴリナビゲーション */}
          <div className="mb-8">
            <CategoryNav items={NAV_ITEMS} align="center" />
          </div>

          {/* カテゴリ別セクション */}
          <div className="flex flex-col gap-12">
            {displayCategories.map((category, index) => (
              <React.Fragment key={category.id}>
                {/* セクション区切り線（最初以外） */}
                {index > 0 && <DottedDivider />}

                {/* セクション */}
                <section className="flex flex-col gap-8">
                  <SectionHeading
                    title={category.title}
                    description={category.description}
                    descriptionStyle="badge"
                    showUnderline={false}
                  />

                  {/* カードグリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                    {category.roadmaps.map((roadmap) => (
                      <RoadmapCard
                        key={roadmap.slug.current}
                        slug={roadmap.slug.current}
                        title={roadmap.title}
                        description={roadmap.description}
                        thumbnailUrl={roadmap.thumbnailUrl}
                        stepCount={roadmap.stepCount}
                        stepUnit="つ"
                        estimatedDuration={roadmap.estimatedDuration}
                        durationUnit="ヶ月"
                        gradientType={roadmap.gradientPreset as GradientType}
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
