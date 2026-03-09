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
import {
  careerChangeRoadmap,
  uiDesignBeginnerRoadmap,
  uiVisualRoadmap,
  informationArchitectureRoadmap,
  uxDesignRoadmap,
  getRoadmapBySlug,
} from '@/data/roadmaps';
import { getLessonsBySlugs } from '@/services/roadmapService';
import type { Roadmap, RoadmapLesson, RoadmapStep, RoadmapStepCourse } from '@/types/roadmap';

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
            ABOUT: このロードマップについて
        ============================================ */}
        <section className="px-8 md:px-16 py-20 bg-gradient-to-br from-[#fafafa] to-[#f5f5f5]">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* 左: 誰向けか */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#f5533e]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#f5533e]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[#999] uppercase block">
                      Who is this for
                    </span>
                    <h3 className="text-[18px] font-bold text-[#1a1a1a]">こんな方におすすめ</h3>
                  </div>
                </div>
                {roadmap.audience && roadmap.audience.length > 0 ? (
                  <ul className="space-y-4">
                    {roadmap.audience.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#f5533e] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[15px] font-medium text-[#1a1a1a]">{item.label}</span>
                          <p className="text-[13px] text-[#666] mt-0.5">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[14px] text-[#666]">UIデザインを学びたいすべての方</p>
                )}
              </div>

              {/* 右: 得られるもの */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[#999] uppercase block">
                      What you'll gain
                    </span>
                    <h3 className="text-[18px] font-bold text-[#1a1a1a]">得られるスキル</h3>
                  </div>
                </div>
                <ul className="space-y-4">
                  {roadmap.benefits.slice(0, 4).map((benefit, i) => {
                    const IconComponent = iconMap[benefit.icon] || Check;
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IconComponent className="w-3 h-3 text-[#3b82f6]" />
                        </div>
                        <div>
                          <span className="text-[15px] font-medium text-[#1a1a1a]">{benefit.title}</span>
                          <p className="text-[13px] text-[#666] mt-0.5">{benefit.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* 詳しく知るボタン → Guide記事へリンク */}
            {roadmap.relatedGuideSlug && (
              <div className="mt-10 text-center">
                <Link
                  to={`/guide/${roadmap.relatedGuideSlug}`}
                  className="inline-flex items-center gap-3 bg-white hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-white border-2 border-[#1a1a1a] font-semibold text-[15px] px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-sm"
                >
                  目指せるスキルについて詳しく知る
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[13px] text-[#999] mt-3">
                  このロードマップで身につくスキルを解説
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================
            AUDIENCE: 誰向けか（詳細版）
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
                {roadmap.relatedGuideSlug && (
                  <Link
                    to={`/guide/${roadmap.relatedGuideSlug}`}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1a1a1a] hover:text-[#f5533e] transition-colors"
                  >
                    スキル詳細を見る
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
  const courseStep = step.type === 'course' ? step : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow border border-[#f0f0f0]">
      {/* ステップヘッダー */}
      <div className="p-8 border-b border-[#f0f0f0]">
        <div className="flex items-start gap-8">
          {/* 番号 */}
          <div className="flex-shrink-0">
            <span
              className={`text-[48px] font-bold ${
                isSpecial ? 'text-[#f5533e]/30' : 'text-[var(--blog-color-dark-blue)]'
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

            {/* ゴールと身につくスキル */}
            {courseStep && (courseStep.goal || courseStep.skills) && (
              <div className="mt-6 pt-5 border-t border-[#f5f5f5] space-y-5">
                {/* ゴール */}
                {courseStep.goal && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f5533e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-4 h-4 text-[#f5533e]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[#999] block mb-1">
                        ゴール
                      </span>
                      <p className="text-[14px] font-medium text-[#1a1a1a] leading-[1.5]">
                        {courseStep.goal}
                      </p>
                    </div>
                  </div>
                )}

                {/* 身につくスキル */}
                {courseStep.skills && courseStep.skills.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpenCheck className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[#999] block mb-1">
                        身につくスキル
                      </span>
                      <ul className="space-y-1">
                        {courseStep.skills.map((skill, i) => (
                          <li key={i} className="text-[13px] text-[#666] flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ部分 */}
      {isSpecial && step.type === 'special' ? (
        <SpecialStepContent content={step.content} />
      ) : step.type === 'course' && step.linkedRoadmapSlug ? (
        <LinkedRoadmapCard linkedRoadmapSlug={step.linkedRoadmapSlug} lessons={lessons} loading={loading} />
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
// リンク先ロードマップカード（Step内に表示）
// ============================================
interface LinkedRoadmapCardProps {
  linkedRoadmapSlug: string;
  lessons: RoadmapLesson[];
  loading: boolean;
}

function LinkedRoadmapCard({ linkedRoadmapSlug, lessons, loading }: LinkedRoadmapCardProps) {
  const linkedRoadmap = getRoadmapBySlug(linkedRoadmapSlug);

  if (!linkedRoadmap) {
    return (
      <div className="px-8 py-6">
        <div className="pl-[72px] text-[14px] text-[#999]">
          ロードマップが見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="pl-[72px]">
        {/* ロードマップカード */}
        <Link
          to={`/roadmaps/${linkedRoadmapSlug}`}
          className="block group"
        >
          <div className="relative border border-[#e8e8e8] rounded-2xl overflow-hidden transition-all hover:border-[#d0d0d0] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            {/* ヘッダー: グラデーション背景 */}
            <div className={`bg-gradient-to-br ${linkedRoadmap.gradientColors || 'from-gray-600 to-gray-800'} px-6 py-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase block mb-1">
                    Roadmap
                  </span>
                  <h4 className="text-[18px] font-bold text-white">
                    {linkedRoadmap.title}
                  </h4>
                  {linkedRoadmap.subtitle && (
                    <p className="text-[13px] text-white/80 mt-1">{linkedRoadmap.subtitle}</p>
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
                    <strong className="text-[#1a1a1a]">{linkedRoadmap.stats.stepsCount}</strong> ステップ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-[#999]" />
                  <span className="text-[13px] text-[#666]">
                    <strong className="text-[#1a1a1a]">{loading ? '-' : lessons.length || linkedRoadmap.stats.lessonsCount}</strong> レッスン
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#999]" />
                  <span className="text-[13px] text-[#666]">
                    <strong className="text-[#1a1a1a]">{linkedRoadmap.stats.duration}</strong>
                  </span>
                </div>
              </div>

              {/* 説明 */}
              <p className="text-[14px] text-[#666] leading-[1.7] line-clamp-2">
                {linkedRoadmap.description}
              </p>

              {/* 得られるもの（最初の2つだけ表示） */}
              {linkedRoadmap.benefits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                  <div className="flex items-center gap-4">
                    {linkedRoadmap.benefits.slice(0, 2).map((benefit, i) => {
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
                    {linkedRoadmap.benefits.length > 2 && (
                      <span className="text-[12px] text-[#999]">
                        +{linkedRoadmap.benefits.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* レッスンプレビュー（オプション: 折りたたみ表示） */}
        {lessons.length > 0 && (
          <div className="mt-4">
            <details className="group">
              <summary className="flex items-center gap-2 text-[12px] font-medium text-[#999] cursor-pointer hover:text-[#666] transition-colors list-none">
                <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                含まれるレッスン（{lessons.length}件）を見る
              </summary>
              <div className="mt-3 pl-5 space-y-0 border-l border-[#eee]">
                {lessons.slice(0, 5).map((lesson, j) => (
                  <div
                    key={lesson._id}
                    className="flex items-center gap-3 py-2 text-[13px] text-[#666]"
                  >
                    <span className="text-[11px] font-mono text-[#ccc] w-5 text-right">
                      {String(j + 1).padStart(2, '0')}
                    </span>
                    {lesson.title}
                  </div>
                ))}
                {lessons.length > 5 && (
                  <div className="py-2 text-[12px] text-[#999]">
                    ...他 {lessons.length - 5} レッスン
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
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
            <div key={i} className="animate-pulse flex items-center gap-6 py-6">
              <div className="w-24 h-32 md:w-32 md:h-44 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mt-2" />
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
            className="flex items-center justify-between py-6 border-b border-[#f5f5f5] last:border-b-0 group cursor-pointer hover:bg-[#fafafa] -mx-4 px-4 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-6 flex-1">
              {/* サムネイル or 番号 */}
              {lesson.iconImageUrl || lesson.thumbnailUrl ? (
                <img
                  src={lesson.iconImageUrl || lesson.thumbnailUrl}
                  alt=""
                  className="w-24 h-32 md:w-32 md:h-44 rounded-xl object-cover bg-gray-50 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-32 md:w-32 md:h-44 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[16px] font-mono text-[#ccc]">
                    {String(j + 1).padStart(2, '0')}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#1a1a1a] group-hover:text-[#f5533e] transition-colors mb-2 line-clamp-2 leading-tight">
                  {lesson.title}
                </h4>
                {lesson.description && (
                  <p className="text-[13px] md:text-[14px] text-[#666] leading-relaxed line-clamp-2 md:line-clamp-3">
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 self-center">
              {lesson.isPremium && (
                <span className="text-[11px] text-[#999] bg-[#f5f5f5] px-2 py-1 rounded hidden sm:inline-block">
                  Premium
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-[#ccc] group-hover:text-[#f5533e] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
