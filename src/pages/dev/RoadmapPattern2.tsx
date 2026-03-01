/**
 * RoadmapPattern2: クリーン版
 *
 * Framer.comを参考にしたシンプルで繰り返しのコンポーネント構成
 * bono-trainingのデザインシステム（色、フォント、シャドウ）を使用
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { uivisualCourse } from '@/data/roadmap/courses';
import type { RoadmapStep, RoadmapContent } from '@/data/roadmap/types';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';

// ========================================
// レッスンアイコンのマップを作成するユーティリティ
// ========================================
type LessonIconMap = Record<string, string | null>;

const extractSlugFromLink = (link: string): string | null => {
  // "/series/ui-design-cycle" → "ui-design-cycle"
  const match = link.match(/\/series\/([^/]+)/);
  return match ? match[1] : null;
};

const useLessonIconMap = (): LessonIconMap => {
  const { data: lessons } = useLessons();

  return useMemo(() => {
    if (!lessons) return {};

    const map: LessonIconMap = {};
    lessons.forEach((lesson) => {
      const slug = lesson.slug?.current;
      if (!slug) return;

      // iconImageUrl（プリコンピュート済み）を優先
      if (lesson.iconImageUrl) {
        map[slug] = lesson.iconImageUrl;
      } else if (lesson.iconImage?.asset?._ref) {
        map[slug] = urlFor(lesson.iconImage).width(120).height(120).url();
      } else if (lesson.thumbnailUrl) {
        map[slug] = lesson.thumbnailUrl;
      } else if (lesson.thumbnail?.asset?._ref) {
        map[slug] = urlFor(lesson.thumbnail).width(120).height(120).url();
      } else {
        map[slug] = null;
      }
    });

    return map;
  }, [lessons]);
};

// ========================================
// ヒーローセクション - シンプルなタイポグラフィ重視
// ========================================
const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* メタ情報 */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-500 font-noto-sans-jp">
            入門コース
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-500">
            {uivisualCourse.duration}
          </span>
        </div>

        {/* タイトル */}
        <h1 className="text-3xl md:text-5xl font-bold text-[#0f172a] font-rounded-mplus mb-6 leading-tight">
          {uivisualCourse.title}
        </h1>

        {/* 説明文 */}
        <p className="text-lg md:text-xl text-gray-600 font-noto-sans-jp leading-relaxed mb-8">
          {uivisualCourse.description}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Link
            to="/subscription"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-full font-bold font-noto-sans-jp text-sm hover:bg-gray-800 transition-colors"
          >
            学習をはじめる
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-500 self-center">
            {uivisualCourse.price}
          </span>
        </div>
      </div>
    </section>
  );
};

// ========================================
// ステップ概要 - 横並びの番号表示
// ========================================
const StepOverview = () => {
  return (
    <section className="py-12 border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {uivisualCourse.steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <span className="text-xs text-gray-500 text-center font-noto-sans-jp whitespace-nowrap">
                  {step.goal}
                </span>
              </div>
              {index < uivisualCourse.steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 min-w-[20px]" />
              )}
            </React.Fragment>
          ))}
          {/* 完了 */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <div className="w-10 h-10 rounded-full bg-[#22C55E] text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-500 text-center font-noto-sans-jp whitespace-nowrap">
              コース完了
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ========================================
// ステップセクション - 繰り返しコンポーネント
// ========================================
interface StepSectionProps {
  step: RoadmapStep;
  isLast: boolean;
  lessonIconMap: LessonIconMap;
}

const StepSection = ({ step, isLast, lessonIconMap }: StepSectionProps) => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* ステップヘッダー */}
        <div className="mb-10">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-sm font-medium text-gray-400 font-noto-sans-jp">
              STEP {String(step.number).padStart(2, '0')}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {step.duration}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] font-rounded-mplus mb-3">
            {step.title}
          </h2>
          <p className="text-gray-600 font-noto-sans-jp">
            <span className="font-medium text-[#22C55E]">ゴール:</span> {step.goal}
          </p>
          {step.description && (
            <p className="mt-2 text-gray-500 font-noto-sans-jp text-sm">
              {step.description}
            </p>
          )}
        </div>

        {/* コンテンツリスト */}
        <div className="space-y-4">
          {step.contents.map((content, index) => (
            <ContentCard
              key={content.id}
              content={content}
              index={index}
              lessonIconMap={lessonIconMap}
            />
          ))}
        </div>

        {/* チャレンジ */}
        {step.challenge && (
          <div className="mt-6">
            <Link
              to={step.challenge.link}
              className="block p-5 bg-[#FFF9F4] rounded-2xl border border-[#FF9900]/20 hover:border-[#FF9900]/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-[#FF9900]/10 text-[#FF9900] rounded text-xs font-medium mb-2">
                    チャレンジ
                  </span>
                  <h4 className="font-bold text-[#0f172a] font-rounded-mplus mb-1 group-hover:text-[#FF9900] transition-colors">
                    {step.challenge.title}
                  </h4>
                  <p className="text-sm text-gray-600 font-noto-sans-jp">
                    {step.challenge.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#FF9900] transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          </div>
        )}

        {/* 区切り線 */}
        {!isLast && (
          <div className="mt-16 flex justify-center">
            <div className="w-px h-12 bg-gray-200" />
          </div>
        )}
      </div>
    </section>
  );
};

// ========================================
// コンテンツカード - アイコン画像前提のデザイン
// ========================================
interface ContentCardProps {
  content: RoadmapContent;
  index: number;
  lessonIconMap: LessonIconMap;
}

const ContentCard = ({ content, index, lessonIconMap }: ContentCardProps) => {
  const slug = extractSlugFromLink(content.link);
  const iconUrl = slug ? lessonIconMap[slug] : null;

  return (
    <Link
      to={content.link}
      className="block bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group overflow-hidden"
      style={{
        boxShadow: '1px 1px 4px 0px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex items-center gap-4 p-4 md:p-5">
        {/* アイコン画像 */}
        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50">
          <img
            src={iconUrl || ''}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 font-noto-sans-jp">
              {content.label}
            </span>
            {content.duration && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs text-gray-400">{content.duration}</span>
              </>
            )}
          </div>
          <h4 className="font-bold text-[#0f172a] font-rounded-mplus group-hover:text-blue-600 transition-colors mb-1 text-base md:text-lg">
            {content.title}
          </h4>
          <p className="text-sm text-gray-500 font-noto-sans-jp line-clamp-2">
            {content.description}
          </p>
          {content.note && (
            <p className="mt-2 text-xs text-amber-600 font-noto-sans-jp">
              ※ {content.note}
            </p>
          )}
        </div>

        {/* 矢印 */}
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 hidden md:block" />
      </div>
    </Link>
  );
};

// ========================================
// 完了セクション
// ========================================
const CompletionSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#22C55E] text-white flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] font-rounded-mplus mb-4">
          コース完了
        </h2>
        <p className="text-gray-600 font-noto-sans-jp mb-8 max-w-lg mx-auto">
          {uivisualCourse.completionMessage}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-full font-bold font-noto-sans-jp text-sm hover:bg-gray-800 transition-colors"
          >
            次のコースを見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ========================================
// 関連コースセクション
// ========================================
const RelatedCoursesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h2 className="text-xl font-bold text-[#0f172a] font-rounded-mplus mb-8">
          他のコース
        </h2>
        <div className="space-y-4">
          {uivisualCourse.relatedCourses.map((course) => (
            <Link
              key={course.id}
              to={`/roadmap/${course.slug}`}
              className="block p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
              style={{
                boxShadow: '1px 1px 4px 0px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#0f172a] font-rounded-mplus mb-1 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-noto-sans-jp mb-3">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================================
// メインコンポーネント
// ========================================
const RoadmapPattern2 = () => {
  const lessonIconMap = useLessonIconMap();

  return (
    <div className="min-h-screen bg-white">
      {/* 戻るリンク */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/dev/roadmap-patterns"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all font-noto-sans-jp"
        >
          <ArrowLeft className="w-4 h-4" />
          一覧に戻る
        </Link>
      </div>

      {/* ヒーロー */}
      <HeroSection />

      {/* ステップ概要 */}
      <StepOverview />

      {/* 各ステップ */}
      {uivisualCourse.steps.map((step, index) => (
        <StepSection
          key={step.number}
          step={step}
          isLast={index === uivisualCourse.steps.length - 1}
          lessonIconMap={lessonIconMap}
        />
      ))}

      {/* 完了セクション */}
      <CompletionSection />

      {/* 関連コース */}
      <RelatedCoursesSection />

      {/* パターン情報 */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="p-5 bg-gray-50 rounded-2xl">
            <h3 className="font-bold text-gray-900 font-rounded-mplus mb-2">
              Pattern 2: クリーン版
            </h3>
            <p className="text-sm text-gray-600 font-noto-sans-jp">
              Framer.comを参考にしたシンプルな構成。タイポグラフィ重視、繰り返しコンポーネント、余白を活用したクリーンなデザイン。bono-trainingのデザインシステムを使用。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoadmapPattern2;
