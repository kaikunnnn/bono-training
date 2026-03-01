/**
 * RoadmapPattern3: 洗練されたライフスタイルデザイン
 *
 * Design Philosophy:
 * - Airbnbのような温かみと洗練さ
 * - 余白を活かした呼吸感のあるレイアウト
 * - 2026年のWebデザイントレンドを意識
 * - ライフスタイルブランドのような世界観
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { uivisualCourse } from '@/data/roadmap/courses';
import type { RoadmapStep, RoadmapContent } from '@/data/roadmap/types';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';

// ========================================
// デザイントークン
// ========================================
const tokens = {
  colors: {
    bg: '#FAFAF8',           // 温かみのあるオフホワイト
    surface: '#FFFFFF',
    text: {
      primary: '#1A1A1A',    // 柔らかいブラック
      secondary: '#6B6B6B',
      tertiary: '#9A9A9A',
    },
    accent: '#E07A5F',       // テラコッタ（温かみのあるアクセント）
    border: 'rgba(0,0,0,0.06)',
  },
  shadows: {
    soft: '0 2px 20px rgba(0,0,0,0.04)',
    medium: '0 4px 30px rgba(0,0,0,0.06)',
    hover: '0 8px 40px rgba(0,0,0,0.08)',
  },
  radius: {
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

// ========================================
// レッスンアイコンのマップ
// ========================================
type LessonIconMap = Record<string, string | null>;

const extractSlugFromLink = (link: string): string | null => {
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

      if (lesson.iconImageUrl) {
        map[slug] = lesson.iconImageUrl;
      } else if (lesson.iconImage?.asset?._ref) {
        map[slug] = urlFor(lesson.iconImage).width(200).height(200).url();
      } else if (lesson.thumbnailUrl) {
        map[slug] = lesson.thumbnailUrl;
      } else if (lesson.thumbnail?.asset?._ref) {
        map[slug] = urlFor(lesson.thumbnail).width(200).height(200).url();
      } else {
        map[slug] = null;
      }
    });

    return map;
  }, [lessons]);
};

// ========================================
// ヒーローセクション
// ========================================
const HeroSection = () => {
  return (
    <section
      className="min-h-[70vh] flex items-center"
      style={{ backgroundColor: tokens.colors.bg }}
    >
      <div className="w-full max-w-4xl mx-auto px-6 md:px-8 py-24 md:py-32">
        {/* カテゴリーラベル */}
        <div className="mb-8">
          <span
            className="inline-block px-4 py-2 text-xs font-medium tracking-widest uppercase"
            style={{
              color: tokens.colors.accent,
              backgroundColor: `${tokens.colors.accent}10`,
              borderRadius: tokens.radius.sm,
            }}
          >
            Learning Path
          </span>
        </div>

        {/* メインタイトル */}
        <h1
          className="font-rounded-mplus font-bold leading-[1.1] tracking-tight mb-8"
          style={{
            color: tokens.colors.text.primary,
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          }}
        >
          UIビジュアルの
          <br />
          基礎を身につける
        </h1>

        {/* サブテキスト */}
        <p
          className="font-noto-sans-jp text-lg md:text-xl leading-relaxed mb-12 max-w-2xl"
          style={{ color: tokens.colors.text.secondary }}
        >
          {uivisualCourse.description}
        </p>

        {/* メタ情報 + CTA */}
        <div className="flex flex-wrap items-center gap-6">
          <Link
            to="/subscription"
            className="inline-flex items-center gap-3 px-8 py-4 font-noto-sans-jp font-bold text-white transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: tokens.colors.text.primary,
              borderRadius: tokens.radius.lg,
            }}
          >
            はじめる
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-6 text-sm" style={{ color: tokens.colors.text.tertiary }}>
            <span>{uivisualCourse.duration}</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <span>{uivisualCourse.steps.length} ステップ</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <span>{uivisualCourse.price}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ========================================
// ロードマップ概要
// ========================================
const RoadmapOverview = () => {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: tokens.colors.surface }}>
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 md:gap-6">
          {uivisualCourse.steps.map((step, index) => (
            <div key={step.number} className="text-center">
              <div
                className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: tokens.colors.bg,
                  color: tokens.colors.text.primary,
                  borderRadius: '50%',
                }}
              >
                {step.number}
              </div>
              <p
                className="text-xs md:text-sm font-noto-sans-jp hidden md:block"
                style={{ color: tokens.colors.text.tertiary }}
              >
                {step.goal}
              </p>
            </div>
          ))}
          {/* 完了 */}
          <div className="text-center">
            <div
              className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 flex items-center justify-center"
              style={{
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
                borderRadius: '50%',
              }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p
              className="text-xs md:text-sm font-noto-sans-jp hidden md:block"
              style={{ color: tokens.colors.text.tertiary }}
            >
              完了
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ========================================
// ステップセクション
// ========================================
interface StepSectionProps {
  step: RoadmapStep;
  index: number;
  lessonIconMap: LessonIconMap;
}

const StepSection = ({ step, index, lessonIconMap }: StepSectionProps) => {
  const isEven = index % 2 === 0;

  return (
    <section
      className="py-20 md:py-32"
      style={{ backgroundColor: isEven ? tokens.colors.bg : tokens.colors.surface }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        {/* ステップヘッダー */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span
              className="text-sm font-medium tracking-wider"
              style={{ color: tokens.colors.text.tertiary }}
            >
              STEP {String(step.number).padStart(2, '0')}
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: tokens.colors.border }}
            />
            <span
              className="flex items-center gap-2 text-sm"
              style={{ color: tokens.colors.text.tertiary }}
            >
              <Clock className="w-4 h-4" />
              {step.duration}
            </span>
          </div>

          <h2
            className="font-rounded-mplus font-bold text-2xl md:text-4xl mb-4"
            style={{ color: tokens.colors.text.primary }}
          >
            {step.title}
          </h2>

          <p
            className="font-noto-sans-jp text-lg"
            style={{ color: tokens.colors.text.secondary }}
          >
            {step.goal}
          </p>
        </div>

        {/* コンテンツカード */}
        <div className="space-y-6">
          {step.contents.map((content, contentIndex) => (
            <ContentCard
              key={content.id}
              content={content}
              lessonIconMap={lessonIconMap}
            />
          ))}
        </div>

        {/* チャレンジ */}
        {step.challenge && (
          <div className="mt-10">
            <Link
              to={step.challenge.link}
              className="block p-6 md:p-8 transition-all hover:scale-[1.01] group"
              style={{
                backgroundColor: '#FFF8F6',
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.colors.accent}20`,
              }}
            >
              <div className="flex items-start gap-6">
                <div
                  className="w-12 h-12 shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: `${tokens.colors.accent}15`,
                    borderRadius: tokens.radius.md,
                    color: tokens.colors.accent,
                  }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <span
                    className="text-xs font-medium tracking-wider mb-2 block"
                    style={{ color: tokens.colors.accent }}
                  >
                    CHALLENGE
                  </span>
                  <h4
                    className="font-rounded-mplus font-bold text-lg mb-2 group-hover:opacity-70 transition-opacity"
                    style={{ color: tokens.colors.text.primary }}
                  >
                    {step.challenge.title}
                  </h4>
                  <p
                    className="font-noto-sans-jp text-sm"
                    style={{ color: tokens.colors.text.secondary }}
                  >
                    {step.challenge.description}
                  </p>
                </div>

                <ArrowRight
                  className="w-5 h-5 shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
                  style={{ color: tokens.colors.accent }}
                />
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// ========================================
// コンテンツカード
// ========================================
interface ContentCardProps {
  content: RoadmapContent;
  lessonIconMap: LessonIconMap;
}

const ContentCard = ({ content, lessonIconMap }: ContentCardProps) => {
  const slug = extractSlugFromLink(content.link);
  const iconUrl = slug ? lessonIconMap[slug] : null;

  return (
    <Link
      to={content.link}
      className="block p-5 md:p-6 transition-all hover:scale-[1.01] group"
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.radius.lg,
        boxShadow: tokens.shadows.soft,
      }}
    >
      <div className="flex items-center gap-5 md:gap-6">
        {/* アイコン */}
        <div
          className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden"
          style={{
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.bg,
          }}
        >
          <img
            src={iconUrl || ''}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-medium font-noto-sans-jp"
              style={{ color: tokens.colors.text.tertiary }}
            >
              {content.label}
            </span>
            {content.duration && (
              <>
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: tokens.colors.text.tertiary }}
                />
                <span
                  className="text-xs"
                  style={{ color: tokens.colors.text.tertiary }}
                >
                  {content.duration}
                </span>
              </>
            )}
          </div>

          <h4
            className="font-rounded-mplus font-bold text-base md:text-lg mb-1.5 group-hover:opacity-70 transition-opacity"
            style={{ color: tokens.colors.text.primary }}
          >
            {content.title}
          </h4>

          <p
            className="font-noto-sans-jp text-sm line-clamp-2"
            style={{ color: tokens.colors.text.secondary }}
          >
            {content.description}
          </p>

          {content.note && (
            <p
              className="mt-2 text-xs font-noto-sans-jp"
              style={{ color: tokens.colors.accent }}
            >
              {content.note}
            </p>
          )}
        </div>

        {/* 矢印 */}
        <ArrowRight
          className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform hidden md:block"
          style={{ color: tokens.colors.text.tertiary }}
        />
      </div>
    </Link>
  );
};

// ========================================
// 完了セクション
// ========================================
const CompletionSection = () => {
  return (
    <section
      className="py-24 md:py-32"
      style={{ backgroundColor: tokens.colors.surface }}
    >
      <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
        {/* 完了アイコン */}
        <div
          className="w-20 h-20 mx-auto mb-8 flex items-center justify-center"
          style={{
            backgroundColor: '#E8F5E9',
            borderRadius: '50%',
          }}
        >
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2
          className="font-rounded-mplus font-bold text-2xl md:text-3xl mb-4"
          style={{ color: tokens.colors.text.primary }}
        >
          コース完了
        </h2>

        <p
          className="font-noto-sans-jp text-lg mb-10 leading-relaxed"
          style={{ color: tokens.colors.text.secondary }}
        >
          {uivisualCourse.completionMessage}
        </p>

        <Link
          to="/roadmap"
          className="inline-flex items-center gap-3 px-8 py-4 font-noto-sans-jp font-bold text-white transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: tokens.colors.text.primary,
            borderRadius: tokens.radius.lg,
          }}
        >
          次のコースへ
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

// ========================================
// 関連コースセクション
// ========================================
const RelatedCoursesSection = () => {
  return (
    <section
      className="py-20 md:py-28"
      style={{ backgroundColor: tokens.colors.bg }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2
          className="font-rounded-mplus font-bold text-xl md:text-2xl mb-10"
          style={{ color: tokens.colors.text.primary }}
        >
          他のコース
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {uivisualCourse.relatedCourses.map((course) => (
            <Link
              key={course.id}
              to={`/roadmap/${course.slug}`}
              className="block p-6 transition-all hover:scale-[1.02] group"
              style={{
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.radius.lg,
                boxShadow: tokens.shadows.soft,
              }}
            >
              <h3
                className="font-rounded-mplus font-bold text-lg mb-2 group-hover:opacity-70 transition-opacity"
                style={{ color: tokens.colors.text.primary }}
              >
                {course.title}
              </h3>

              <p
                className="font-noto-sans-jp text-sm mb-4"
                style={{ color: tokens.colors.text.secondary }}
              >
                {course.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {course.topics.slice(0, 3).map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-noto-sans-jp"
                    style={{
                      backgroundColor: tokens.colors.bg,
                      color: tokens.colors.text.secondary,
                      borderRadius: tokens.radius.sm,
                    }}
                  >
                    {topic}
                  </span>
                ))}
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
const RoadmapPattern3 = () => {
  const lessonIconMap = useLessonIconMap();

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.colors.bg }}>
      {/* 戻るリンク */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/dev/roadmap-patterns"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-noto-sans-jp transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: tokens.colors.surface,
            color: tokens.colors.text.secondary,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadows.soft,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Link>
      </div>

      <HeroSection />
      <RoadmapOverview />

      {uivisualCourse.steps.map((step, index) => (
        <StepSection
          key={step.number}
          step={step}
          index={index}
          lessonIconMap={lessonIconMap}
        />
      ))}

      <CompletionSection />
      <RelatedCoursesSection />

      {/* パターン情報 */}
      <section
        className="py-12"
        style={{
          backgroundColor: tokens.colors.surface,
          borderTop: `1px solid ${tokens.colors.border}`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div
            className="p-6"
            style={{
              backgroundColor: tokens.colors.bg,
              borderRadius: tokens.radius.lg,
            }}
          >
            <h3 className="font-bold font-rounded-mplus mb-2" style={{ color: tokens.colors.text.primary }}>
              Pattern 3: 洗練されたライフスタイルデザイン
            </h3>
            <p className="text-sm font-noto-sans-jp" style={{ color: tokens.colors.text.secondary }}>
              Airbnbのような温かみと洗練さを持つデザイン。余白を活かした呼吸感、ミニマルだけど人間味のある世界観。2026年のWebデザイントレンドを意識した、ブランドデザインエージェンシークオリティ。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoadmapPattern3;
