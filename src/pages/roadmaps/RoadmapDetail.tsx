/**
 * ロードマップ詳細ページ（汎用）
 *
 * URLのslugパラメータに基づいて適切なロードマップを表示
 * Sanity連携でレッスンデータを取得
 */

import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  BookOpen,
  ChevronRight,
  Target,
  Calendar,
  PenTool,
  BookOpenCheck,
  AlertCircle,
  FolderOpen,
  Palette,
  Layout,
  Users,
} from 'lucide-react';
import LayoutComponent from '@/components/layout/Layout';
import { careerChangeRoadmap } from '@/data/roadmaps/career-change';
import { uiDesignBeginnerRoadmap } from '@/data/roadmaps/ui-design-beginner';
import { uiVisualRoadmap } from '@/data/roadmaps/ui-visual';
import { informationArchitectureRoadmap } from '@/data/roadmaps/information-architecture';
import { uxDesignRoadmap } from '@/data/roadmaps/ux-design';
import { getLessonsBySlugs } from '@/services/roadmapService';
import type { Roadmap, RoadmapLesson, RoadmapStep } from '@/types/roadmap';

// ロードマップマッピング
const roadmapMap: Record<string, Roadmap> = {
  'career-change': careerChangeRoadmap,
  'ui-design-beginner': uiDesignBeginnerRoadmap,
  'ui-visual': uiVisualRoadmap,
  'information-architecture': informationArchitectureRoadmap,
  'ux-design': uxDesignRoadmap,
};

// 英語タイトルマッピング（HEROセクション用）
const englishTitleMap: Record<string, string> = {
  'career-change': 'CAREER CHANGE ROADMAP',
  'ui-design-beginner': 'UI DESIGN BEGINNER',
  'ui-visual': 'UI VISUAL BASICS',
  'information-architecture': 'INFORMATION ARCHITECTURE',
  'ux-design': 'UX DESIGN BASICS',
};

// アイコンマッピング
const iconMap: Record<string, React.ElementType> = {
  Target,
  Calendar,
  PenTool,
  BookOpen,
  AlertCircle,
  FolderOpen,
  Palette,
  Layout,
  Users,
  BookOpenCheck,
  Briefcase: FolderOpen,
};

export default function RoadmapDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [lessonsByStep, setLessonsByStep] = useState<Record<number, RoadmapLesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roadmap = slug ? roadmapMap[slug] : null;
  const englishTitle = slug ? englishTitleMap[slug] || slug.toUpperCase().replace(/-/g, ' ') : '';

  useEffect(() => {
    if (!roadmap) return;

    async function loadLessons() {
      try {
        const lessonsMap: Record<number, RoadmapLesson[]> = {};

        // 各ステップのレッスンを取得
        for (const step of roadmap!.steps) {
          if (step.type === 'course' && step.lessonSlugs.length > 0) {
            const lessons = await getLessonsBySlugs(step.lessonSlugs);
            lessonsMap[step.stepNumber] = lessons;
          }
        }

        setLessonsByStep(lessonsMap);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        setError('レッスンデータの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, [roadmap]);

  // ロードマップが見つからない場合は404へリダイレクト
  if (!roadmap) {
    return <Navigate to="/404" replace />;
  }

  // 全レッスン数を計算
  const totalLessons = Object.values(lessonsByStep).reduce(
    (acc, lessons) => acc + lessons.length,
    0
  );

  return (
    <LayoutComponent>
      <div className="min-h-screen bg-white">
        {/* ============================================
            HERO: タイトル + Stats
        ============================================ */}
        <section className="px-8 md:px-16 pt-16 pb-20 border-b border-[#eee]">
          <div className="max-w-[1100px] mx-auto">
            {/* サブタイトルライン */}
            <div className="flex items-center gap-6 mb-10">
              <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase">
                {englishTitle}
              </span>
              <div className="flex-1 h-px bg-[#eee]" />
              <span className="text-[11px] text-[#999]">ロードマップ</span>
            </div>

            {/* メインコンテンツ: 2カラム */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* 左: タイトル + 説明 */}
              <div className="lg:col-span-7">
                <h1 className="text-[56px] md:text-[72px] font-bold text-[#1a1a1a] leading-[1.05] tracking-tight mb-8">
                  {roadmap.title}
                </h1>
                {roadmap.subtitle && (
                  <p className="text-[20px] text-[#666] mb-4">{roadmap.subtitle}</p>
                )}
                <p className="text-[17px] leading-[1.9] text-[#444] mb-10 max-w-[540px]">
                  {roadmap.description}
                </p>
                {/* CTA */}
                <div className="flex items-center gap-6">
                  <Link
                    to="/subscription"
                    className="inline-flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold text-[15px] px-8 py-4 rounded-full transition-all hover:-translate-y-0.5"
                  >
                    このロードマップをはじめる
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-[13px] text-[#999]">月額5,980円〜</span>
                </div>
              </div>

              {/* 右: Stats */}
              <div className="lg:col-span-5">
                <div className="bg-[#fafafa] rounded-2xl p-8">
                  <span className="text-[11px] font-medium tracking-[0.2em] text-[#999] uppercase block mb-6">
                    Overview
                  </span>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-[#eee]">
                      <div>
                        <div className="text-[13px] text-[#666] mb-1">ステップ</div>
                        <div className="text-[11px] text-[#999]">段階的に習得</div>
                      </div>
                      <div
                        className="text-[40px] font-bold text-[#1a1a1a]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {roadmap.stats.stepsCount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-[#eee]">
                      <div>
                        <div className="text-[13px] text-[#666] mb-1">レッスン</div>
                        <div className="text-[11px] text-[#999]">実践的な内容</div>
                      </div>
                      <div
                        className="text-[40px] font-bold text-[#1a1a1a]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {loading ? '-' : totalLessons || roadmap.stats.lessonsCount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <div className="text-[13px] text-[#666] mb-1">目安期間</div>
                        <div className="text-[11px] text-[#999]">自分のペースで</div>
                      </div>
                      <div
                        className="text-[40px] font-bold text-[#1a1a1a]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {roadmap.stats.duration.replace('ヶ月', '').replace('〜', '-')}
                        <span className="text-[16px] font-normal ml-1">ヶ月</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            AUDIENCE: 誰向けか
        ============================================ */}
        {roadmap.audience && roadmap.audience.length > 0 && (
          <section className="px-8 md:px-16 py-20 border-b border-[#eee]">
            <div className="max-w-[1100px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* 左: ラベル */}
                <div className="lg:col-span-3">
                  <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase">
                    Who is this for
                  </span>
                </div>
                {/* 右: リスト */}
                <div className="lg:col-span-9">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roadmap.audience.map((item, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-[#eee] pl-6 hover:border-[#f5533e] transition-colors"
                      >
                        <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">
                          {item.label}
                        </h3>
                        <p className="text-[13px] text-[#666] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================
            BENEFITS: 得られるもの
        ============================================ */}
        <section className="px-8 md:px-16 py-24">
          <div className="max-w-[1100px] mx-auto">
            {/* セクションヘッダー */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
              <div className="lg:col-span-3">
                <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-3">
                  Outcomes
                </span>
                <h2 className="text-[28px] font-bold text-[#1a1a1a]">得られるもの</h2>
              </div>
              <div className="lg:col-span-9 flex items-center justify-between">
                <p className="text-[15px] leading-[1.8] text-[#666] max-w-[500px]">
                  このロードマップを完了することで、実践的なデザインスキルを身につけられます。
                </p>
                {roadmap.aboutPageUrl && (
                  <Link
                    to={roadmap.aboutPageUrl}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1a1a1a] hover:text-[#f5533e] transition-colors"
                  >
                    詳しく知る
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Benefits グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#eee]">
              {roadmap.benefits.map((benefit, i) => {
                const IconComponent = iconMap[benefit.icon] || Check;
                return (
                  <div
                    key={i}
                    className="bg-white p-10 hover:bg-[#fafafa] transition-colors group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#f5533e]/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#f5533e] transition-colors">
                        <IconComponent className="w-4 h-4 text-[#f5533e] group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-[18px] font-bold text-[#1a1a1a] leading-[1.4]">
                        {benefit.title}
                      </h3>
                    </div>
                    <p className="text-[14px] leading-[1.8] text-[#666] pl-12">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================
            STEPS: 進め方 + レッスンリスト
        ============================================ */}
        <section className="px-8 md:px-16 py-24 bg-[#fafafa]">
          <div className="max-w-[1100px] mx-auto">
            {/* セクションヘッダー */}
            <div className="mb-16">
              <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-3">
                Learning Path
              </span>
              <div className="flex items-end justify-between">
                <h2 className="text-[28px] font-bold text-[#1a1a1a]">進め方</h2>
                <span className="text-[13px] text-[#999]">
                  {roadmap.stats.stepsCount} steps / {loading ? '-' : totalLessons} lessons
                </span>
              </div>
            </div>

            {/* ステップリスト */}
            <div className="space-y-6">
              {roadmap.steps.map((step) => (
                <StepCard
                  key={step.stepNumber}
                  step={step}
                  lessons={lessonsByStep[step.stepNumber] || []}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA: 強化版
        ============================================ */}
        <section className="px-8 md:px-16 py-28 border-t border-[#eee]">
          <div className="max-w-[800px] mx-auto text-center">
            <span className="text-[11px] font-medium tracking-[0.3em] text-[#f5533e] uppercase block mb-4">
              Get Started Today
            </span>
            <h2 className="text-[40px] font-bold text-[#1a1a1a] leading-[1.2] mb-6">
              今日から、
              <br />
              デザインをはじめよう
            </h2>
            <p className="text-[16px] leading-[1.9] text-[#666] mb-10 max-w-[500px] mx-auto">
              月額5,980円ですべてのロードマップとレッスンにアクセス。
              いつでもキャンセル可能。まずは無料で始められます。
            </p>

            {/* 価格カード */}
            <div className="inline-flex items-center gap-4 bg-[#fafafa] rounded-2xl p-6 mb-10">
              <div className="text-left">
                <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">
                  Monthly
                </div>
                <div className="text-[32px] font-bold text-[#1a1a1a]">
                  ¥5,980
                  <span className="text-[14px] font-normal text-[#999]">/月</span>
                </div>
              </div>
              <div className="w-px h-12 bg-[#e0e0e0]" />
              <ul className="text-left space-y-1">
                <li className="text-[13px] text-[#666] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f5533e]" />
                  全ロードマップアクセス
                </li>
                <li className="text-[13px] text-[#666] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f5533e]" />
                  いつでもキャンセル可能
                </li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                to="/subscription"
                className="inline-flex items-center gap-3 bg-[#f5533e] hover:bg-[#e04a35] text-white font-bold text-[15px] px-10 py-5 rounded-full transition-all hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(245,83,62,0.25)]"
              >
                BONOをはじめる
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/roadmaps"
                className="inline-flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] font-medium text-[15px] px-6 py-5 transition-colors"
              >
                他のコースを見る
              </Link>
            </div>
          </div>
        </section>

        {/* フッター余白 */}
        <div className="h-20" />
      </div>
    </LayoutComponent>
  );
}

// ============================================
// ステップカードコンポーネント
// ============================================
interface StepCardProps {
  step: RoadmapStep;
  lessons: RoadmapLesson[];
  loading: boolean;
}

function StepCard({ step, lessons, loading }: StepCardProps) {
  const isSpecial = step.type === 'special';

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow">
      {/* ステップヘッダー */}
      <div className="p-8 border-b border-[#f0f0f0]">
        <div className="flex items-start gap-8">
          {/* 番号 */}
          <div className="flex-shrink-0">
            <span
              className={`text-[48px] font-bold ${
                isSpecial ? 'text-[#f5533e]/30' : 'text-[#e8e8e8]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {String(step.stepNumber).padStart(2, '0')}
            </span>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-4 mb-3">
              <h3 className="text-[22px] font-bold text-[#1a1a1a]">{step.title}</h3>
              {isSpecial && (
                <span className="text-[12px] text-[#f5533e] bg-[#f5533e]/10 px-3 py-1 rounded-full">
                  準備
                </span>
              )}
            </div>
            <p className="text-[14px] leading-[1.8] text-[#666] max-w-[600px]">
              {step.description}
            </p>
          </div>
        </div>
      </div>

      {/* コンテンツ部分 */}
      {isSpecial && step.type === 'special' ? (
        <SpecialStepContent content={step.content} />
      ) : (
        <LessonList lessons={lessons} loading={loading} />
      )}
    </div>
  );
}

// ============================================
// 特殊ステップコンテンツ（Step 0）
// ============================================
interface SpecialStepContentProps {
  content: {
    links: Array<{ title: string; url: string; description?: string; icon?: string }>;
    guidance: Array<{ title: string; description: string; icon?: string }>;
    tips?: string[];
  };
}

function SpecialStepContent({ content }: SpecialStepContentProps) {
  return (
    <div className="px-8 py-6">
      {/* リンク集 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] text-[#999] uppercase mb-4 pl-[72px]">
          <BookOpen className="w-3.5 h-3.5" />
          まず読んでおこう
        </div>
        <div className="space-y-0 pl-[72px]">
          {content.links.map((link, i) => {
            const IconComponent = link.icon ? iconMap[link.icon] || BookOpen : BookOpen;
            return (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-4 border-b border-[#f5f5f5] last:border-b-0 group cursor-pointer hover:bg-[#fafafa] -mx-4 px-4 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center group-hover:bg-[#f5533e]/10 transition-colors">
                    <IconComponent className="w-4 h-4 text-[#999] group-hover:text-[#f5533e] transition-colors" />
                  </div>
                  <div>
                    <span className="text-[15px] font-medium text-[#333] group-hover:text-[#f5533e] transition-colors">
                      {link.title}
                    </span>
                    {link.description && (
                      <span className="text-[13px] text-[#999] ml-3">{link.description}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#f5533e] group-hover:translate-x-1 transition-all" />
              </a>
            );
          })}
        </div>
      </div>

      {/* 心構え */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] text-[#999] uppercase mb-4 pl-[72px]">
          <Target className="w-3.5 h-3.5" />
          心構え
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-[72px]">
          {content.guidance.map((item, i) => {
            const IconComponent = item.icon ? iconMap[item.icon] || Target : Target;
            return (
              <div key={i} className="bg-[#fafafa] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className="w-4 h-4 text-[#f5533e]" />
                  <h4 className="text-[14px] font-bold text-[#1a1a1a]">{item.title}</h4>
                </div>
                <p className="text-[13px] text-[#666] leading-[1.6]">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      {content.tips && content.tips.length > 0 && (
        <div className="pl-[72px]">
          <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#92400e] mb-3">
              <AlertCircle className="w-4 h-4" />
              注意点
            </div>
            <ul className="space-y-2">
              {content.tips.map((tip, i) => (
                <li key={i} className="text-[13px] text-[#92400e] flex items-start gap-2">
                  <span className="text-[#f59e0b] mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// レッスンリストコンポーネント
// ============================================
interface LessonListProps {
  lessons: RoadmapLesson[];
  loading: boolean;
}

function LessonList({ lessons, loading }: LessonListProps) {
  if (loading) {
    return (
      <div className="px-8 py-6">
        <div className="pl-[72px] space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 py-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="px-8 py-6">
        <div className="pl-[72px] text-[14px] text-[#999]">
          レッスンは準備中です
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] text-[#999] uppercase mb-4 pl-[72px]">
        <BookOpen className="w-3.5 h-3.5" />
        Lessons
      </div>
      <div className="space-y-0 pl-[72px]">
        {lessons.map((lesson, j) => (
          <Link
            key={lesson._id}
            to={`/lessons/${lesson.slug}`}
            className="flex items-center justify-between py-4 border-b border-[#f5f5f5] last:border-b-0 group cursor-pointer hover:bg-[#fafafa] -mx-4 px-4 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* サムネイル or 番号 */}
              {lesson.iconImageUrl || lesson.thumbnailUrl ? (
                <img
                  src={lesson.iconImageUrl || lesson.thumbnailUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <span className="text-[12px] font-mono text-[#ccc] w-12 text-center">
                  {String(j + 1).padStart(2, '0')}
                </span>
              )}
              <div>
                <span className="text-[15px] font-medium text-[#333] group-hover:text-[#f5533e] transition-colors">
                  {lesson.title}
                </span>
                {lesson.description && (
                  <p className="text-[13px] text-[#999] mt-0.5 line-clamp-1 max-w-[400px]">
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lesson.isPremium && (
                <span className="text-[11px] text-[#999] bg-[#f5f5f5] px-2 py-1 rounded">
                  Premium
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#f5533e] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
