/**
 * ロードマップ一覧ページ
 *
 * 利用可能なロードマップを一覧表示する
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen, Layers } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/common/PageHeader';
import { careerChangeRoadmap } from '@/data/roadmaps/career-change';
import { uiDesignBeginnerRoadmap } from '@/data/roadmaps/ui-design-beginner';
import { uiVisualRoadmap } from '@/data/roadmaps/ui-visual';
import { informationArchitectureRoadmap } from '@/data/roadmaps/information-architecture';
import { uxDesignRoadmap } from '@/data/roadmaps/ux-design';
import type { Roadmap } from '@/types/roadmap';

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
// ロードマップカード
// ============================================
interface RoadmapCardProps {
  roadmap: Roadmap;
}

function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <Link
      to={`/roadmaps/${roadmap.slug}`}
      className="block bg-white rounded-xl border border-[#E5E7EB] p-6 hover:border-primary hover:shadow-lg transition-all group"
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          {/* バッジ */}
          {roadmap.subtitle && (
            <span className="inline-block text-[12px] font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              {roadmap.subtitle}
            </span>
          )}
          {/* タイトル */}
          <h2 className="text-[20px] md:text-[24px] font-bold text-foreground leading-[1.3] mb-2 group-hover:text-primary transition-colors">
            {roadmap.title}
          </h2>
          {/* 説明 */}
          <p className="text-[14px] leading-[1.7] text-muted-foreground">
            {roadmap.description}
          </p>
        </div>

        {/* 矢印 */}
        <div className="hidden md:flex w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {roadmap.stats.stepsCount}
            </span>{' '}
            ステップ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {roadmap.stats.lessonsCount}
            </span>{' '}
            レッスン
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">
            目安{' '}
            <span className="font-semibold text-foreground">
              {roadmap.stats.duration}
            </span>
          </span>
        </div>
      </div>

      {/* 対象者（あれば表示） */}
      {roadmap.audience && roadmap.audience.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {roadmap.audience.map((item, i) => (
            <span
              key={i}
              className="text-[11px] text-muted-foreground bg-[#F3F4F6] px-2.5 py-1 rounded-full"
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
