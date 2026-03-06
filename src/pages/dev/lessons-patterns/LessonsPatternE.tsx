/**
 * /lessons 一覧パターン E: Apple Store風「エディトリアル/特集」設計
 *
 * コンセプト: 雑誌のように編集された特集コンテンツで魅せる
 *
 * Apple Store UXインサイト:
 * - 製品を「ストーリー」として語る
 * - 大きなビジュアルと編集されたコピー
 * - キュレーションされたコレクション
 * - 「選ばれた感」を演出
 *
 * 参考: https://www.apple.com/store
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Quote,
  Lightbulb,
  Target,
  Zap,
  Award,
  BookOpen,
  TrendingUp,
  Users
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 特集コレクションの定義
const collections = [
  {
    id: 'beginner-path',
    title: 'デザイン入門コース',
    subtitle: 'ゼロから始める',
    description: '「何から始めればいいかわからない」そんなあなたに。基礎から着実にステップアップできるレッスンを厳選しました。',
    color: 'from-blue-600 to-indigo-700',
    keywords: ['入門', '基本', '基礎', 'はじめ', '初級'],
    featured: true,
  },
  {
    id: 'ui-mastery',
    title: 'UI制作マスター',
    subtitle: '実践スキルを磨く',
    description: 'プロのUIデザイナーが実践するテクニックを、手を動かしながら習得。',
    color: 'from-purple-600 to-pink-600',
    keywords: ['UI', 'デザイン', '制作', 'サイクル'],
    featured: false,
  },
  {
    id: 'information-design',
    title: '情報設計の技法',
    subtitle: '構造を整理する力',
    description: 'わかりやすいUIの裏側にある、情報設計の考え方を学ぶ。',
    color: 'from-emerald-600 to-teal-600',
    keywords: ['情報設計', 'ナビゲーション', '構造'],
    featured: false,
  },
];

export default function LessonsPatternE() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, error } = useLessons();

  // コレクションごとにレッスンを分類
  const collectionData = useMemo(() => {
    if (!lessons) return [];

    return collections.map(col => {
      const filtered = lessons.filter(lesson => {
        const text = `${lesson.title} ${lesson.description || ''} ${lesson.categoryTitle || ''}`.toLowerCase();
        return col.keywords.some(kw => text.includes(kw.toLowerCase()));
      });
      return { ...col, lessons: filtered };
    }).filter(col => col.lessons.length > 0);
  }, [lessons]);

  // ピックアップレッスン（最新3件）
  const pickupLessons = lessons?.slice(0, 3) || [];

  // 全レッスン（残り）
  const remainingLessons = lessons?.slice(3) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f5f5f7] p-8 text-center text-red-600">
          エラーが発生しました
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f5f5f7]">
        {/* ヒーローセクション - エディトリアル風 */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-4 tracking-tight">
                レッスン
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto">
                デザインを学ぶ、最高の方法。
              </p>
            </motion.div>
          </div>
        </section>

        {/* 今週のピックアップ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
                今週のピックアップ
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pickupLessons.map((lesson, idx) => {
                const thumbnailUrl =
                  lesson.thumbnailUrl ||
                  (lesson.thumbnail ? urlFor(lesson.thumbnail).width(600).height(400).url() : null);

                return (
                  <motion.article
                    key={lesson._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    onClick={() => navigate(`/lessons/${lesson.slug.current}`)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                      {/* サムネイル */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-slate-300" />
                          </div>
                        )}
                      </div>
                      {/* コンテンツ */}
                      <div className="p-6">
                        {lesson.categoryTitle && (
                          <p className="text-sm text-orange-500 font-medium mb-2">
                            {lesson.categoryTitle}
                          </p>
                        )}
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-slate-500 text-sm line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* 特集コレクション */}
        {collectionData.map((collection, colIdx) => (
          <section
            key={collection.id}
            className={`py-16 ${colIdx % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f7]'}`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {/* コレクションヘッダー */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                  <div className="max-w-xl">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {collection.subtitle}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                      {collection.title}
                    </h2>
                    <p className="text-lg text-slate-600">
                      {collection.description}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all">
                    すべて見る
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* コレクションレッスン */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {collection.lessons.slice(0, 4).map((lesson, idx) => {
                    const thumbnailUrl =
                      lesson.iconImageUrl ||
                      (lesson.iconImage ? urlFor(lesson.iconImage).width(300).height(400).url() : null);

                    return (
                      <motion.article
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => navigate(`/lessons/${lesson.slug.current}`)}
                        className="group cursor-pointer"
                      >
                        <div className="bg-slate-100 rounded-2xl overflow-hidden mb-4 aspect-[3/4]">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={lesson.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${collection.color} flex items-center justify-center`}>
                              <BookOpen className="w-12 h-12 text-white/50" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {lesson.title}
                        </h3>
                        {lesson.isPremium && (
                          <p className="text-xs text-amber-600 font-medium mt-1">
                            Premium
                          </p>
                        )}
                      </motion.article>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>
        ))}

        {/* 引用セクション */}
        <section className="bg-slate-900 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Quote className="w-12 h-12 text-slate-700 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
              "デザインは才能じゃない。<br />
              学べば誰でもできるようになる。"
            </blockquote>
            <p className="text-slate-400">— BONO</p>
          </div>
        </section>

        {/* 全レッスン一覧 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              すべてのレッスン
            </h2>
            <span className="text-slate-500">
              {lessons?.length || 0}コース
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingLessons.map((lesson, idx) => {
              const thumbnailUrl =
                lesson.iconImageUrl ||
                (lesson.iconImage ? urlFor(lesson.iconImage).width(200).height(300).url() : null);

              return (
                <motion.article
                  key={lesson._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => navigate(`/lessons/${lesson.slug.current}`)}
                  className="group flex gap-4 cursor-pointer p-4 rounded-2xl hover:bg-white transition-colors"
                >
                  {/* サムネイル */}
                  <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    {lesson.categoryTitle && (
                      <p className="text-xs text-slate-400 mb-1">
                        {lesson.categoryTitle}
                      </p>
                    )}
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        約2-4時間
                      </span>
                      {lesson.isPremium && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}
