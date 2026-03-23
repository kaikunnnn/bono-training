/**
 * ロードマップ一覧ページ
 *
 * カテゴリ別にロードマップを一覧表示する
 * URL遷移型のカテゴリフィルタリング対応
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/common/PageHeader';
import CategoryNav from '@/components/common/CategoryNav';
import SectionHeading from '@/components/common/SectionHeading';
import RoadmapCard from '@/components/roadmap/RoadmapCard';
import DottedDivider from '@/components/common/DottedDivider';
import type { GradientType } from '@/components/roadmap/RoadmapCard';

// ============================================
// データ定義
// ============================================

interface RoadmapData {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  stepCount: number;
  estimatedDuration: string;
  gradientType: GradientType;
}

interface CategoryData {
  id: string;
  title: string;
  description: string;
  emoji: string;
  roadmaps: RoadmapData[];
}

// カテゴリデータ
const CATEGORIES: CategoryData[] = [
  {
    id: 'career',
    title: '転職・キャリアチェンジしたい',
    description: '未経験からデザイナーへ、キャリアアップを目指したい方向けの地図',
    emoji: '🚀',
    roadmaps: [
      {
        slug: 'career-change',
        title: 'UIUXデザイナー転職ロードマップ',
        description: '使いやすいUI体験をつくるための表現の基礎を身につけよう。',
        stepCount: 4,
        estimatedDuration: '6-9',
        gradientType: 'galaxy',
      },
    ],
  },
  {
    id: 'user-centered',
    title: 'ユーザー中心デザインを体系的に身につけたい',
    description: 'サービス価値とユーザーをつなげるデザインを学ぶ',
    emoji: '🎯',
    roadmaps: [
      {
        slug: 'ux-design',
        title: 'UXデザイン基礎習得ロードマップ',
        description: 'ユーザーの課題を理解し、本当に使われるデザインを作る力を養う。',
        stepCount: 4,
        estimatedDuration: '2-3',
        gradientType: 'sunset',
      },
      {
        slug: 'information-architecture',
        title: '情報設計ロードマップ',
        description: '迷わない画面構造を設計する力を身につける。',
        stepCount: 4,
        estimatedDuration: '1-2',
        gradientType: 'ocean',
      },
    ],
  },
  {
    id: 'skill',
    title: '基礎スキルを体系的に身につけたい',
    description: 'デザインの基礎を固めたい方向け',
    emoji: '📚',
    roadmaps: [
      {
        slug: 'ui-visual',
        title: 'UIデザインビジュアル基礎習得ロードマップ',
        description: '使いやすいUI体験をつくるための表現の基礎を身につけよう。',
        stepCount: 4,
        estimatedDuration: '1-2',
        gradientType: 'teal',
      },
      {
        slug: 'ui-design-beginner',
        title: 'Figma基礎習得ロードマップ',
        description: 'Figmaの基本操作から応用テクニックまで。',
        stepCount: 4,
        estimatedDuration: '1-2',
        gradientType: 'rose',
      },
    ],
  },
];

// ナビゲーションアイテム生成（カウントなし）
const NAV_ITEMS = [
  { label: 'すべて', href: '/roadmaps' },
  ...CATEGORIES.map((cat) => ({
    label: cat.title,
    href: `/roadmaps/category/${cat.id}`,
  })),
];

// ============================================
// メインコンポーネント
// ============================================

export default function RoadmapListPage() {
  const { categoryId } = useParams<{ categoryId?: string }>();

  // フィルタリング
  const displayCategories = categoryId
    ? CATEGORIES.filter((cat) => cat.id === categoryId)
    : CATEGORIES;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f9f9f7]">
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
          {/* ページヘッダー */}
          <PageHeader
            label="変化への地図"
            title="ロードマップ"
            description="目標に合ったロードマップを選んで、デザインの探求をはじめよう！"
          />

          {/* カテゴリナビゲーション */}
          <div className="mb-8">
            <CategoryNav items={NAV_ITEMS} />
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
                        key={roadmap.slug}
                        slug={roadmap.slug}
                        title={roadmap.title}
                        description={roadmap.description}
                        thumbnailUrl={roadmap.thumbnailUrl}
                        stepCount={roadmap.stepCount}
                        stepUnit="つ"
                        estimatedDuration={roadmap.estimatedDuration}
                        durationUnit="ヶ月"
                        gradientType={roadmap.gradientType}
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
