/**
 * ロードマップ一覧ページ
 *
 * 利用可能なロードマップを一覧表示する
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen, BookOpenCheck, Check, Palette, Layout as LayoutIcon, Users, Target, FolderOpen } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/common/PageHeader';
import { careerChangeRoadmap } from '@/data/roadmaps/career-change';
import { uiDesignBeginnerRoadmap } from '@/data/roadmaps/ui-design-beginner';
import { uiVisualRoadmap } from '@/data/roadmaps/ui-visual';
import { informationArchitectureRoadmap } from '@/data/roadmaps/information-architecture';
import { uxDesignRoadmap } from '@/data/roadmaps/ux-design';
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

// 利用可能なロードマップ一覧
const roadmaps: Roadmap[] = [
  careerChangeRoadmap,
  uiDesignBeginnerRoadmap,
  uiVisualRoadmap,
  informationArchitectureRoadmap,
  uxDesignRoadmap,
];

export default function RoadmapListPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-base">
        {/* メインコンテンツ */}
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
          {/* ページヘッダー */}
          <PageHeader
            label="Roadmap"
            title="ロードマップ"
            description="目標に合わせて体系的に学べるロードマップ。何から始めればいいか迷ったら、ロードマップに沿って進めましょう。"
          />

          {/* ロードマップ一覧 */}
          <div className="space-y-6">
            {roadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}

// ============================================
// ロードマップカード（LinkedRoadmapCardと同じデザイン）
// ============================================
interface RoadmapCardProps {
  roadmap: Roadmap;
}

function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className="block group"
    >
      <div className="relative border border-[#e8e8e8] rounded-2xl overflow-hidden transition-all hover:border-[#d0d0d0] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        {/* ヘッダー: グラデーション背景 */}
        <div className={`bg-gradient-to-br ${roadmap.gradientColors || 'from-gray-600 to-gray-800'} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase block mb-1">
                Roadmap
              </span>
              <h2 className="text-[20px] md:text-[22px] font-bold text-white">
                {roadmap.title}
              </h2>
              {roadmap.subtitle && (
                <p className="text-[13px] text-white/80 mt-1">{roadmap.subtitle}</p>
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
                <strong className="text-[#1a1a1a]">{roadmap.stats.stepsCount}</strong> ステップ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-[#999]" />
              <span className="text-[13px] text-[#666]">
                <strong className="text-[#1a1a1a]">{roadmap.stats.lessonsCount}</strong> レッスン
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#999]" />
              <span className="text-[13px] text-[#666]">
                <strong className="text-[#1a1a1a]">{roadmap.stats.duration}</strong>
              </span>
            </div>
          </div>

          {/* 説明 */}
          <p className="text-[14px] text-[#666] leading-[1.7] line-clamp-2">
            {roadmap.description}
          </p>

          {/* 得られるもの（最初の2つだけ表示） */}
          {roadmap.benefits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-4 flex-wrap">
                {roadmap.benefits.slice(0, 2).map((benefit, i) => {
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
                {roadmap.benefits.length > 2 && (
                  <span className="text-[12px] text-[#999]">
                    +{roadmap.benefits.length - 2}
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
