/**
 * /lessons 一覧パターン C: 「学習ジャーニー」設計
 *
 * コンセプト: 「今のあなたに最適な次のステップ」を示す
 *
 * Airbnb PdM インサイト:
 * - ユーザーは「成長の道筋」が見えると安心する
 * - 段階的なステップがあると継続しやすい
 * - 「今ここ」「次はここ」がわかると行動しやすい
 *
 * デザイナー視点:
 * - 学習ロードマップ風の表示
 * - ステップバイステップのビジュアル
 * - おすすめレッスンを目立たせる
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map,
  Sparkles,
  ArrowDown,
  Clock,
  CheckCircle2,
  ChevronRight,
  Play,
  Star,
  Trophy,
  Rocket,
  Target,
  Compass,
  BookOpen
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 学習ステージ定義
const learningStages = [
  {
    id: 'stage-1',
    stage: 1,
    title: 'デザインの土台を作る',
    subtitle: 'まずはここから',
    description: 'デザインの考え方と進め方の基本を身につける',
    icon: <Compass className="w-6 h-6" />,
    color: 'blue',
    matchKeywords: ['入門', '基本', '基礎', 'はじめ', '初級', 'サイクル'],
    recommended: true,
  },
  {
    id: 'stage-2',
    stage: 2,
    title: 'UIの制作力を高める',
    subtitle: '実践スキルを磨く',
    description: '実際に手を動かして、UIを作るスキルを身につける',
    icon: <Target className="w-6 h-6" />,
    color: 'purple',
    matchKeywords: ['UI', 'デザイン', '制作', 'プロトタイプ'],
    recommended: false,
  },
  {
    id: 'stage-3',
    stage: 3,
    title: '情報設計を学ぶ',
    subtitle: '構造を整理する力',
    description: 'わかりやすい情報構造を設計できるようになる',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'emerald',
    matchKeywords: ['情報設計', 'ナビゲーション', '構造'],
    recommended: false,
  },
  {
    id: 'stage-4',
    stage: 4,
    title: 'UXの視点を持つ',
    subtitle: 'ユーザー中心の思考',
    description: 'ユーザーの体験を考え、デザインを評価・改善する',
    icon: <Rocket className="w-6 h-6" />,
    color: 'orange',
    matchKeywords: ['UX', 'ユーザー', '体験', 'リサーチ', '評価'],
    recommended: false,
  },
];

const colorConfig: Record<string, { gradient: string; light: string; text: string; border: string }> = {
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-600',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-600',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
};

export default function LessonsPatternC() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, error } = useLessons();
  const [expandedStage, setExpandedStage] = useState<string>('stage-1');

  // ステージ別にレッスンを分類
  const categorizedLessons = useMemo(() => {
    if (!lessons) return {};

    const result: Record<string, typeof lessons> = {};

    learningStages.forEach(stage => {
      result[stage.id] = lessons.filter(lesson => {
        const title = lesson.title.toLowerCase();
        const description = (lesson.description || '').toLowerCase();
        const category = lesson.categoryTitle || '';
        const searchText = `${title} ${description} ${category}`;

        return stage.matchKeywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    });

    return result;
  }, [lessons]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600">
          エラーが発生しました
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {/* ヒーローセクション */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_50%)]" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10">
                <Map className="w-4 h-4" />
                あなたの学習ロードマップ
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                デザイナーへの
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  成長の道
                </span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                ステップバイステップで、確実にスキルを身につけていきましょう
              </p>

              {/* 進捗インジケーター */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-white/80 text-sm">現在地:</span>
                </div>
                <span className="text-white font-medium">Stage 1 - 土台づくり</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 学習ステージ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="space-y-6">
            {learningStages.map((stage, idx) => {
              const colors = colorConfig[stage.color];
              const stageLessons = categorizedLessons[stage.id] || [];
              const isExpanded = expandedStage === stage.id;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {/* コネクティングライン */}
                  {idx > 0 && (
                    <div className="flex justify-center -mt-6 mb-6">
                      <div className="w-px h-12 bg-gradient-to-b from-white/20 to-white/5" />
                    </div>
                  )}

                  {/* ステージカード */}
                  <div
                    className={`relative rounded-3xl transition-all duration-500 ${
                      isExpanded
                        ? 'bg-white shadow-2xl shadow-black/20'
                        : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {/* ステージヘッダー */}
                    <button
                      onClick={() => setExpandedStage(isExpanded ? '' : stage.id)}
                      className="w-full p-6 flex items-center gap-4 text-left"
                    >
                      <div className={`relative flex-shrink-0`}>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-lg`}>
                          {stage.icon}
                        </div>
                        {stage.recommended && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" fill="currentColor" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            isExpanded ? colors.text : 'text-white/50'
                          }`}>
                            Stage {stage.stage}
                          </span>
                          {stage.recommended && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              おすすめ
                            </span>
                          )}
                        </div>
                        <h3 className={`text-xl font-bold ${isExpanded ? 'text-slate-900' : 'text-white'}`}>
                          {stage.title}
                        </h3>
                        <p className={`text-sm ${isExpanded ? 'text-slate-500' : 'text-white/50'}`}>
                          {stage.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isExpanded ? 'text-slate-400' : 'text-white/40'}`}>
                          {stageLessons.length}個のレッスン
                        </span>
                        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                          isExpanded ? 'rotate-90 text-slate-400' : 'text-white/40'
                        }`} />
                      </div>
                    </button>

                    {/* レッスン一覧（展開時） */}
                    {isExpanded && stageLessons.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="border-t border-slate-100 pt-6">
                          <div className="grid gap-4">
                            {stageLessons.map((lesson, lessonIdx) => {
                              const thumbnailUrl =
                                lesson.iconImageUrl ||
                                (lesson.iconImage
                                  ? urlFor(lesson.iconImage).width(216).height(326).url()
                                  : null) ||
                                lesson.thumbnailUrl ||
                                (lesson.thumbnail
                                  ? urlFor(lesson.thumbnail).width(600).height(450).url()
                                  : null) ||
                                '';

                              return (
                                <motion.div
                                  key={lesson._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: lessonIdx * 0.05 }}
                                  onClick={() => navigate(`/lessons/${lesson.slug.current}`)}
                                  className="group flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors"
                                >
                                  {/* サムネイル */}
                                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm">
                                    {thumbnailUrl ? (
                                      <img
                                        src={thumbnailUrl}
                                        alt={lesson.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                        <BookOpen className="w-6 h-6 text-slate-300" />
                                      </div>
                                    )}
                                  </div>

                                  {/* 情報 */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                      {lesson.title}
                                    </h4>
                                    {lesson.description && (
                                      <p className="text-sm text-slate-500 line-clamp-1">
                                        {lesson.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        約2-4時間
                                      </span>
                                      {lesson.isPremium && (
                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                                          Premium
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* CTA */}
                                  <div className="flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                                      <Play className="w-4 h-4 ml-0.5" />
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-purple-500/20"
            >
              <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                最初の一歩を踏み出そう
              </h3>
              <p className="text-white/70 mb-6">
                Stage 1から始めて、確実にスキルアップ
              </p>
              <button
                onClick={() => {
                  const firstLesson = categorizedLessons['stage-1']?.[0];
                  if (firstLesson) {
                    navigate(`/lessons/${firstLesson.slug.current}`);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors"
              >
                <Play className="w-4 h-4" />
                学習を始める
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
