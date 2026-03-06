/**
 * /lessons 一覧パターン D: Netflix風「横スクロール行ベース発見」設計
 *
 * コンセプト: 複数の文脈で同じレッスンを異なる切り口で見せる
 *
 * Netflix UXインサイト:
 * - 縦は有限に感じるが、横は無限の可能性を感じさせる
 * - カテゴリごとの行で全体像を把握しながら探索
 * - パーソナライズされた行順序で「自分向け」感を演出
 * - 明示的なフィルタリングなし = 発見の楽しさ
 *
 * 参考: https://uxdesign.cc/netflix-discovery-experience-a-ux-ui-case-study-7bcd12f74db1
 */

import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  BookOpen,
  Zap,
  Award,
  Users
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 行の定義
const rowDefinitions = [
  {
    id: 'trending',
    title: '今人気のレッスン',
    icon: <TrendingUp className="w-5 h-5" />,
    description: '多くの人が学んでいます',
    filter: () => true, // 全て表示（実際はアナリティクスで並び替え）
    shuffle: true,
  },
  {
    id: 'beginner',
    title: 'はじめての方におすすめ',
    icon: <Sparkles className="w-5 h-5" />,
    description: '基礎から学べるレッスン',
    filter: (lesson: any) => {
      const text = `${lesson.title} ${lesson.description || ''}`.toLowerCase();
      return text.includes('入門') || text.includes('基本') || text.includes('はじめ') || text.includes('初級');
    },
  },
  {
    id: 'ui',
    title: 'UIデザインを極める',
    icon: <Zap className="w-5 h-5" />,
    description: '実践的なUI制作スキル',
    filter: (lesson: any) => {
      const text = `${lesson.title} ${lesson.description || ''} ${lesson.categoryTitle || ''}`.toLowerCase();
      return text.includes('ui') || text.includes('デザイン') || text.includes('制作');
    },
  },
  {
    id: 'short',
    title: 'サクッと学べる',
    icon: <Clock className="w-5 h-5" />,
    description: '短時間で完了できるレッスン',
    filter: () => true,
    limit: 8,
  },
  {
    id: 'premium',
    title: 'プレミアムレッスン',
    icon: <Award className="w-5 h-5" />,
    description: '深く学べる充実コンテンツ',
    filter: (lesson: any) => lesson.isPremium,
  },
  {
    id: 'information',
    title: '情報設計を学ぶ',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'わかりやすい構造設計',
    filter: (lesson: any) => {
      const text = `${lesson.title} ${lesson.description || ''} ${lesson.categoryTitle || ''}`.toLowerCase();
      return text.includes('情報設計') || text.includes('ナビゲーション') || text.includes('構造');
    },
  },
];

// 横スクロール行コンポーネント
function LessonRow({
  title,
  icon,
  description,
  lessons,
  onLessonClick,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  lessons: any[];
  onLessonClick: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (lessons.length === 0) return null;

  return (
    <div className="mb-10">
      {/* 行ヘッダー */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-white/80">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-white/50">{description}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 横スクロールカード */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {lessons.map((lesson, idx) => {
          const thumbnailUrl =
            lesson.iconImageUrl ||
            (lesson.iconImage
              ? urlFor(lesson.iconImage).width(300).height(400).url()
              : null) ||
            lesson.thumbnailUrl ||
            (lesson.thumbnail
              ? urlFor(lesson.thumbnail).width(300).height(400).url()
              : null) ||
            '';

          return (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onLessonClick(lesson.slug.current)}
              className="group flex-shrink-0 w-[200px] md:w-[240px] cursor-pointer"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* カード */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 mb-3">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/30" />
                  </div>
                )}
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* 再生ボタン */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <Play className="w-6 h-6 text-slate-900 ml-1" />
                  </div>
                </div>
                {/* プレミアムバッジ */}
                {lesson.isPremium && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">
                    PREMIUM
                  </div>
                )}
              </div>
              {/* タイトル */}
              <h4 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                {lesson.title}
              </h4>
              {lesson.categoryTitle && (
                <p className="text-white/40 text-sm mt-1">{lesson.categoryTitle}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function LessonsPatternD() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, error } = useLessons();

  // 各行のレッスンを計算
  const rowData = useMemo(() => {
    if (!lessons) return [];

    return rowDefinitions.map(row => {
      let filtered = lessons.filter(row.filter);
      if (row.shuffle) {
        filtered = [...filtered].sort(() => Math.random() - 0.5);
      }
      if (row.limit) {
        filtered = filtered.slice(0, row.limit);
      }
      return {
        ...row,
        lessons: filtered,
      };
    }).filter(row => row.lessons.length > 0);
  }, [lessons]);

  // ヒーローレッスン（最初のレッスン）
  const heroLesson = lessons?.[0];
  const heroThumbnail = heroLesson?.thumbnailUrl ||
    (heroLesson?.thumbnail ? urlFor(heroLesson.thumbnail).width(1200).height(600).url() : null);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-900 p-8 text-center text-red-400">
          エラーが発生しました
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        {/* ヒーローセクション */}
        {heroLesson && (
          <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            {/* 背景画像 */}
            {heroThumbnail && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroThumbnail})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />

            {/* コンテンツ */}
            <div className="relative h-full flex items-center">
              <div className="max-w-3xl px-8 md:px-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
                      注目
                    </span>
                    {heroLesson.categoryTitle && (
                      <span className="px-3 py-1 bg-white/20 text-white text-sm rounded">
                        {heroLesson.categoryTitle}
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {heroLesson.title}
                  </h1>
                  {heroLesson.description && (
                    <p className="text-lg text-white/70 mb-8 max-w-xl">
                      {heroLesson.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/lessons/${heroLesson.slug.current}`)}
                      className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg font-bold hover:bg-white/90 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      レッスンを見る
                    </button>
                    <button className="flex items-center gap-2 px-8 py-4 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                      <Users className="w-5 h-5" />
                      詳細情報
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* レッスン行 */}
        <section className="py-12">
          {rowData.map((row, idx) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <LessonRow
                title={row.title}
                icon={row.icon}
                description={row.description}
                lessons={row.lessons}
                onLessonClick={(slug) => navigate(`/lessons/${slug}`)}
              />
            </motion.div>
          ))}
        </section>
      </div>

      {/* スクロールバー非表示CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Layout>
  );
}
