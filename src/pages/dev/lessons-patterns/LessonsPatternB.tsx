/**
 * /lessons 一覧パターン B: 「課題起点」設計
 *
 * コンセプト: 「あなたの悩み」から共感して導く
 *
 * Airbnb PdM インサイト:
 * - ユーザーは自分の課題に名前をつけられないことが多い
 * - 「こういう悩みありませんか？」と言語化してあげる
 * - 共感から始まり、解決策（レッスン）へ導く
 *
 * デザイナー視点:
 * - 課題別のタブUIで整理
 * - 「〇〇で困っていませんか？」のコピーで共感
 * - 解決後のビフォーアフターをイメージさせる
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Zap,
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 課題ベースのカテゴリ
const problemCategories = [
  {
    id: 'lost',
    problem: '何から始めていいかわからない',
    solution: '基礎から順番に学べるレッスン',
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'blue',
    emoji: '🤔',
    matchKeywords: ['入門', '基本', '基礎', 'はじめ', '初級', 'サイクル'],
  },
  {
    id: 'stuck',
    problem: 'デザインがなんか上手くいかない',
    solution: '実践的なテクニックを学ぶレッスン',
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'purple',
    emoji: '😓',
    matchKeywords: ['UI', 'デザイン', '制作', 'プロトタイプ'],
  },
  {
    id: 'messy',
    problem: '情報の整理が苦手',
    solution: '情報設計の考え方を学ぶレッスン',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'emerald',
    emoji: '📊',
    matchKeywords: ['情報設計', 'ナビゲーション', '構造'],
  },
  {
    id: 'feedback',
    problem: '自分のデザインに自信が持てない',
    solution: '評価・改善の方法を学ぶレッスン',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'orange',
    emoji: '💭',
    matchKeywords: ['評価', 'フィードバック', '改善', 'UX'],
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
};

export default function LessonsPatternB() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, error } = useLessons();
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  // 課題別にレッスンを分類
  const categorizedLessons = useMemo(() => {
    if (!lessons) return {};

    const result: Record<string, typeof lessons> = {};

    problemCategories.forEach(cat => {
      result[cat.id] = lessons.filter(lesson => {
        const title = lesson.title.toLowerCase();
        const description = (lesson.description || '').toLowerCase();
        const category = lesson.categoryTitle || '';
        const searchText = `${title} ${description} ${category}`;

        return cat.matchKeywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    });

    return result;
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!selectedProblem) return lessons;
    return categorizedLessons[selectedProblem] || [];
  }, [lessons, selectedProblem, categorizedLessons]);

  const selectedCategory = problemCategories.find(c => c.id === selectedProblem);

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
      <div className="min-h-screen bg-white">
        {/* ヒーローセクション - 共感から始める */}
        <section className="border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-6"
              >
                <MessageCircle className="w-4 h-4" />
                あなたの悩みから探す
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              >
                こんなお悩み、ありませんか？
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-500"
              >
                当てはまる悩みを選んでください
              </motion.p>
            </div>

            {/* 課題カード */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {problemCategories.map((cat, idx) => {
                const colors = colorClasses[cat.color];
                const count = categorizedLessons[cat.id]?.length || 0;
                const isSelected = selectedProblem === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    onClick={() => setSelectedProblem(isSelected ? null : cat.id)}
                    className={`group relative p-5 rounded-2xl text-left transition-all duration-300 border-2 ${
                      isSelected
                        ? `${colors.border} ${colors.light} shadow-lg`
                        : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{cat.emoji}</div>
                    <p className={`font-bold mb-2 ${isSelected ? colors.text : 'text-slate-800'}`}>
                      {cat.problem}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <BookOpen className="w-3 h-3" />
                      {count}個のレッスン
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute -top-2 -right-2 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 選択された課題の解決策 */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${colorClasses[selectedCategory.color].light} border-b border-slate-100`}
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${colorClasses[selectedCategory.color].bg} rounded-xl text-white`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">解決策</p>
                      <h3 className="text-xl font-bold text-slate-900">
                        {selectedCategory.solution}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400">
                        😓
                      </div>
                      <span className="text-slate-500">Before</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400">
                        😊
                      </div>
                      <span className={colorClasses[selectedCategory.color].text}>After</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* レッスン一覧 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedCategory
                  ? `「${selectedCategory.problem}」を解決するレッスン`
                  : 'すべてのレッスン'
                }
              </h2>
              <p className="text-slate-500 mt-1">
                {filteredLessons.length}個のレッスン
              </p>
            </div>
            {selectedProblem && (
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                すべて表示
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredLessons.map((lesson, idx) => {
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
                <motion.article
                  key={lesson._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/lessons/${lesson.slug.current}`)}
                  className="group flex items-center gap-6 p-4 md:p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* サムネイル */}
                  <div className="hidden sm:block w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden flex-shrink-0">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {lesson.categoryTitle && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                          {lesson.categoryTitle}
                        </span>
                      )}
                      {lesson.isPremium && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {lesson.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        約2-4時間
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        初級〜中級
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="hidden md:flex items-center">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 mr-2">
                      詳細を見る
                    </span>
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* 相談CTA */}
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              どれを選べばいいかわからない？
            </h3>
            <p className="text-slate-500 mb-6">
              あなたの状況に合わせたレッスンを一緒に考えましょう
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
              <MessageCircle className="w-4 h-4" />
              おすすめを相談する
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
