/**
 * RoadmapPattern17: パターンA「なりたい状態」で分類
 *
 * 検討者が「自分のゴール」から逆引きで選べる構造
 * - 転職・キャリアチェンジしたい
 * - スキルの不安を解消したい
 * - 実務で成果を出したい
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen, BookOpenCheck, Target, Briefcase, Palette, Users, Sparkles, Check, Layout as LayoutIcon, FolderOpen } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
  careerChangeRoadmap,
  uiVisualRoadmap,
  informationArchitectureRoadmap,
  uiDesignBeginnerRoadmap,
  uxDesignRoadmap,
} from '@/data/roadmaps';
import type { Roadmap } from '@/types/roadmap';

// アイコンマッピング
const iconMap: Record<string, React.ElementType> = {
  Target,
  Palette,
  Layout: LayoutIcon,
  Users,
  BookOpen,
  BookOpenCheck,
  Briefcase: FolderOpen,
  Check,
};

// ============================================
// カテゴリ定義
// ============================================

interface RoadmapCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  roadmaps: (Roadmap | ComingSoonRoadmap)[];
}

interface ComingSoonRoadmap {
  isComingSoon: true;
  title: string;
  description: string;
}

const categories: RoadmapCategory[] = [
  {
    id: 'career',
    title: '転職・キャリアチェンジしたい',
    subtitle: 'Career Change',
    description: '未経験からデザイナーへ、または更なるキャリアアップを目指す方向け',
    icon: Briefcase,
    iconBg: 'bg-blue-500',
    roadmaps: [
      careerChangeRoadmap,
      {
        isComingSoon: true,
        title: '現役デザイナーのステップアップ転職',
        description: 'ポートフォリオ強化と面接対策で、より良い環境への転職を実現',
      },
    ],
  },
  {
    id: 'user-centered',
    title: 'ユーザー目線でデザインしたい',
    subtitle: 'User-Centered Design',
    description: 'ユーザーの課題を理解し、本当に使われるデザインを作りたい方向け',
    icon: Users,
    iconBg: 'bg-green-500',
    roadmaps: [
      uxDesignRoadmap,
      informationArchitectureRoadmap,
      {
        isComingSoon: true,
        title: '事業に貢献するデザイン思考',
        description: 'ビジネス視点でデザインを考え、事業成果に繋げる力を養う',
      },
    ],
  },
  {
    id: 'skill',
    title: 'スキルの不安を解消したい',
    subtitle: 'Skill Up',
    description: 'デザインの基礎力を固め、苦手を克服したい方向け',
    icon: Palette,
    iconBg: 'bg-orange-500',
    roadmaps: [
      uiVisualRoadmap,
      uiDesignBeginnerRoadmap,
    ],
  },
];

// ============================================
// コンポーネント
// ============================================

function isComingSoon(roadmap: Roadmap | ComingSoonRoadmap): roadmap is ComingSoonRoadmap {
  return 'isComingSoon' in roadmap && roadmap.isComingSoon === true;
}

interface RoadmapCardProps {
  roadmap: Roadmap | ComingSoonRoadmap;
}

function RoadmapCard({ roadmap }: RoadmapCardProps) {
  if (isComingSoon(roadmap)) {
    return (
      <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        <div className="pt-4">
          <h3 className="text-[18px] font-bold text-gray-400 mb-2">
            {roadmap.title}
          </h3>
          <p className="text-[14px] text-gray-400 leading-relaxed">
            {roadmap.description}
          </p>
        </div>
      </div>
    );
  }

  const rm = roadmap as Roadmap;

  return (
    <Link
      to={`/roadmaps/${rm.slug}`}
      className="block group"
    >
      <div className="relative border border-[#e8e8e8] rounded-2xl overflow-hidden transition-all hover:border-[#d0d0d0] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        {/* ヘッダー: グラデーション背景 */}
        <div className={`bg-gradient-to-br ${rm.gradientColors || 'from-gray-600 to-gray-800'} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase block mb-1">
                Roadmap
              </span>
              <h2 className="text-[20px] md:text-[22px] font-bold text-white">
                {rm.title}
              </h2>
              {rm.subtitle && (
                <p className="text-[13px] text-white/80 mt-1">{rm.subtitle}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* コンテンツ部分 */}
        <div className="bg-white px-6 py-5">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#999]" />
              <span className="text-[13px] text-[#666]">
                <strong className="text-[#1a1a1a]">{rm.stats.stepsCount}</strong> ステップ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-[#999]" />
              <span className="text-[13px] text-[#666]">
                <strong className="text-[#1a1a1a]">{rm.stats.lessonsCount}</strong> レッスン
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#999]" />
              <span className="text-[13px] text-[#666]">
                <strong className="text-[#1a1a1a]">{rm.stats.duration}</strong>
              </span>
            </div>
          </div>

          {/* 説明 */}
          <p className="text-[14px] text-[#666] leading-[1.7] line-clamp-2">
            {rm.description}
          </p>

          {/* 得られるもの（最初の2つだけ表示） */}
          {rm.benefits && rm.benefits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-4 flex-wrap">
                {rm.benefits.slice(0, 2).map((benefit, i) => {
                  const IconComponent = iconMap[benefit.icon] || Check;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#f5533e]/10 flex items-center justify-center">
                        <IconComponent className="w-3 h-3 text-[#f5533e]" />
                      </div>
                      <span className="text-[12px] text-[#666]">{benefit.title}</span>
                    </div>
                  );
                })}
                {rm.benefits.length > 2 && (
                  <span className="text-[12px] text-[#999]">
                    +{rm.benefits.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

interface CategorySectionProps {
  category: RoadmapCategory;
  index: number;
}

function CategorySection({ category, index }: CategorySectionProps) {
  const Icon = category.icon;

  return (
    <section className="mb-12">
      {/* カテゴリヘッダー */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-gray-400" />
          <h2 className="text-[18px] font-bold text-gray-900">
            {category.title}
          </h2>
        </div>
        <p className="text-[14px] text-gray-500 ml-7">
          {category.description}
        </p>
      </div>

      {/* ロードマップカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {category.roadmaps.map((roadmap, i) => (
          <RoadmapCard
            key={isComingSoon(roadmap) ? `coming-${i}` : (roadmap as Roadmap).id}
            roadmap={roadmap}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function RoadmapPattern17() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* ============================================
            HERO
        ============================================ */}
        <section className="px-6 md:px-12 pt-16 pb-16 border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto">
            {/* ブレッドクラム */}
            <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-8">
              <Link to="/" className="hover:text-gray-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-600">ロードマップ</span>
            </div>

            {/* メインコピー */}
            <div className="max-w-[700px]">
              <h1 className="text-[40px] md:text-[52px] font-bold text-gray-900 leading-[1.15] mb-6">
                あなたの目標に合った<br />
                ロードマップを選ぼう
              </h1>
              <p className="text-[17px] leading-[1.9] text-gray-600 mb-8">
                「なりたい状態」から逆引きで、最適な学習パスを見つけましょう。
                どのロードマップも、実践的なスキルを身につけるためのステップバイステップの学習プランです。
              </p>

              {/* クイックナビ */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[13px] text-gray-500">探す:</span>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
                  >
                    {cat.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            カテゴリセクション
        ============================================ */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-[1200px] mx-auto">
            {categories.map((category, index) => (
              <div key={category.id} id={category.id}>
                <CategorySection category={category} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* ============================================
            CTA
        ============================================ */}
        <section className="px-6 md:px-12 py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-[700px] mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f5533e]/10 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-[#f5533e]" />
            </div>
            <h2 className="text-[32px] font-bold text-gray-900 mb-4">
              どれを選べばいいか迷ったら？
            </h2>
            <p className="text-[16px] leading-[1.8] text-gray-600 mb-8">
              まずは「未経験からUI/UXデザイナーに転職する」ロードマップがおすすめです。
              基礎から応用まで、体系的にスキルを身につけることができます。
            </p>
            <Link
              to="/roadmaps/career-change"
              className="inline-flex items-center gap-3 bg-[#f5533e] hover:bg-[#e04a35] text-white font-bold text-[15px] px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(245,83,62,0.25)]"
            >
              おすすめロードマップを見る
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* デバッグリンク */}
        <div className="px-6 md:px-12 py-8 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <Link
              to="/dev/roadmap-patterns"
              className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← パターン一覧に戻る
            </Link>
            <span className="text-[11px] text-gray-400">
              Pattern 17: 「なりたい状態」で分類
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
