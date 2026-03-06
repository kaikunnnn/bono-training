/**
 * /lessons 一覧パターン A: 「目的起点」設計
 *
 * コンセプト: 「あなたが得たい状態」から逆引きでレッスンを見せる
 *
 * Airbnb PdM インサイト:
 * - ユーザーは「レッスン」を探しているのではなく「なりたい自分」を探している
 * - 「〇〇ができるようになる」という結果から逆算して提示
 *
 * デザイナー視点:
 * - ヒーローセクションで「何が得られるか」を先に見せる
 * - 目的別のカテゴリで脳内整理を助ける
 * - カードには「学習時間」「難易度」「得られるスキル」を明示
 */

import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Sparkles,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  PenTool,
  Layout as LayoutIcon,
  Users,
  Star,
  X,
  ArrowDown
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 目的ベースのカテゴリ定義
const purposeCategories = [
  {
    id: 'foundation',
    title: 'デザインの土台を築きたい',
    subtitle: '基礎から体系的に学ぶ',
    icon: <Target className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    description: 'デザインの考え方・進め方を身につける',
    matchKeywords: ['入門', '基本', '基礎', 'はじめ', '初級'],
  },
  {
    id: 'ui-skills',
    title: 'UIを上手く作れるようになりたい',
    subtitle: 'UI制作スキルを磨く',
    icon: <PenTool className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    description: '実践的なUI制作テクニックを習得',
    matchKeywords: ['UI', 'デザイン', '制作', 'サイクル'],
  },
  {
    id: 'information',
    title: '情報を整理・設計できるようになりたい',
    subtitle: '情報設計を学ぶ',
    icon: <LayoutIcon className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    description: 'わかりやすい構造を設計する力',
    matchKeywords: ['情報設計', 'ナビゲーション', '構造', '整理'],
  },
  {
    id: 'ux',
    title: 'ユーザー体験を考えられるようになりたい',
    subtitle: 'UXの視点を身につける',
    icon: <Users className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    description: 'ユーザー中心の設計思考を獲得',
    matchKeywords: ['UX', 'ユーザー', '体験', 'リサーチ'],
  },
];

// 得られる成果のタグ
const outcomes = [
  'デザインの進め方がわかる',
  'UIの基本が身につく',
  '情報設計ができる',
  'ユーザー視点で考えられる',
  'プロトタイピングができる',
  'デザインを評価できる',
];

export default function LessonsPatternA() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, error } = useLessons();
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const lessonsRef = useRef<HTMLElement>(null);

  // 目的別にレッスンを分類
  const categorizedLessons = useMemo(() => {
    if (!lessons) return {};

    const result: Record<string, typeof lessons> = {};

    purposeCategories.forEach(cat => {
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

    // 未分類のレッスンを「その他」に
    const categorized = new Set(Object.values(result).flat().map(l => l._id));
    result['other'] = lessons.filter(l => !categorized.has(l._id));

    return result;
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!selectedPurpose) return lessons;
    return categorizedLessons[selectedPurpose] || [];
  }, [lessons, selectedPurpose, categorizedLessons]);

  const selectedCategory = purposeCategories.find(c => c.id === selectedPurpose);

  const handlePurposeSelect = (catId: string) => {
    const isAlreadySelected = selectedPurpose === catId;
    setSelectedPurpose(isAlreadySelected ? null : catId);

    // 選択時にスムーズスクロール
    if (!isAlreadySelected) {
      setTimeout(() => {
        lessonsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* ヒーローセクション - 目的を先に見せる */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                デザインが上手くなる
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-slate-900 mb-4"
              >
                どんな自分になりたいですか？
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-600 max-w-2xl mx-auto"
              >
                目指す姿から、あなたに最適なレッスンを見つけましょう
              </motion.p>
            </div>

            {/* 目的カード */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
            >
              {purposeCategories.map((cat, idx) => {
                const count = categorizedLessons[cat.id]?.length || 0;
                const isSelected = selectedPurpose === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePurposeSelect(cat.id)}
                    className={`group relative p-6 rounded-2xl text-left transition-all duration-300 ${
                      isSelected
                        ? `${cat.lightBg} shadow-xl ring-2 ${cat.borderColor}`
                        : 'bg-white/80 hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-1 transition-colors ${
                          isSelected ? cat.textColor : 'text-slate-900 group-hover:text-indigo-600'
                        }`}>
                          {cat.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-2">{cat.subtitle}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className={`px-2 py-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-slate-100'
                          }`}>
                            {count}個のレッスン
                          </span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? `${cat.bgColor} text-white`
                          : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        {isSelected ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* 選択時のスクロール誘導 */}
            <AnimatePresence>
              {selectedPurpose && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-center mt-8"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex flex-col items-center gap-2 text-slate-400"
                  >
                    <span className="text-sm">下にスクロール</span>
                    <ArrowDown className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 選択されたカテゴリのバナー */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${selectedCategory.lightBg} border-y ${selectedCategory.borderColor}`}
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedCategory.color} text-white`}>
                      {selectedCategory.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${selectedCategory.textColor}`}>
                        選択中の目的
                      </p>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedCategory.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPurpose(null)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white rounded-lg hover:shadow-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                    リセット
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 得られる成果タグ（選択なしの時のみ表示） */}
        {!selectedPurpose && (
          <section className="border-y border-slate-100 bg-white/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm text-slate-500 mr-2">得られるスキル:</span>
                {outcomes.map((outcome, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {outcome}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* レッスン一覧 */}
        <section ref={lessonsRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 scroll-mt-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                key={selectedPurpose || 'all'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-slate-900"
              >
                {selectedCategory
                  ? selectedCategory.title
                  : 'すべてのレッスン'
                }
              </motion.h2>
              <p className="text-slate-500 mt-1">
                {filteredLessons.length}個のレッスン
              </p>
            </div>
            {selectedPurpose && (
              <button
                onClick={() => setSelectedPurpose(null)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                すべて表示
              </button>
            )}
          </div>

          <motion.div
            key={selectedPurpose || 'all'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => navigate(`/lessons/${lesson.slug.current}`)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-slate-100"
                >
                  {/* サムネイル */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PenTool className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    {lesson.isPremium && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="p-5">
                    {lesson.categoryTitle && (
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full mb-3">
                        {lesson.categoryTitle}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                        {lesson.description}
                      </p>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        約2-4時間
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" />
                        初級〜中級
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                        詳細を見る
                      </span>
                      <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </section>
      </div>
    </Layout>
  );
}
