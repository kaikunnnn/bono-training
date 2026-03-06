/**
 * /lessons 一覧パターン F: Duolingo風「ゲーミフィケーション学習パス」設計
 *
 * コンセプト: ゲームのように進捗を可視化し、次にやるべきことを明確にする
 *
 * Duolingo UXインサイト:
 * - 選択肢を減らして「次に何をすべきか」を明確に
 * - 視覚的な進捗（ツリー/パス形式）
 * - アンロック/ロック状態で達成感を演出
 * - スキルレベルの可視化
 * - 連続学習のモチベーション維持
 *
 * 参考: https://www.duolingo.com/learn
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  CheckCircle2,
  Circle,
  Star,
  Trophy,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 学習パスのステージ定義
const learningPath = [
  {
    id: 'foundation',
    title: 'デザインの基礎',
    description: 'UIデザインの基本概念を学ぶ',
    icon: <Circle className="w-6 h-6" />,
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-500',
    keywords: ['入門', '基本', '基礎', 'はじめ', '初級'],
    requiredToUnlock: 0,
  },
  {
    id: 'layout',
    title: 'レイアウト設計',
    description: '配置と構成の技術をマスター',
    icon: <Target className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-500',
    keywords: ['レイアウト', '配置', '構成', 'グリッド'],
    requiredToUnlock: 2,
  },
  {
    id: 'components',
    title: 'UIコンポーネント',
    description: '実践的なUI要素の作り方',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-500',
    keywords: ['UI', 'コンポーネント', 'ボタン', 'フォーム', '制作'],
    requiredToUnlock: 4,
  },
  {
    id: 'information',
    title: '情報設計',
    description: 'わかりやすさを設計する',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-amber-400 to-amber-600',
    bgColor: 'bg-amber-500',
    keywords: ['情報設計', 'ナビゲーション', '構造', '整理'],
    requiredToUnlock: 6,
  },
  {
    id: 'advanced',
    title: 'プロフェッショナル',
    description: 'トップレベルの技術を習得',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-rose-400 to-rose-600',
    bgColor: 'bg-rose-500',
    keywords: ['上級', 'プロ', '応用', '実践'],
    requiredToUnlock: 8,
  },
];

// モックの進捗データ（実際はユーザーデータから取得）
const mockProgress = {
  completedLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
  currentStreak: 5,
  totalXP: 1250,
  level: 3,
};

// ステージノードコンポーネント
function StageNode({
  stage,
  lessons,
  isUnlocked,
  isActive,
  completedCount,
  totalCount,
  onLessonClick,
  index,
}: {
  stage: typeof learningPath[0];
  lessons: any[];
  isUnlocked: boolean;
  isActive: boolean;
  completedCount: number;
  totalCount: number;
  onLessonClick: (slug: string) => void;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isCompleted = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* 接続線 */}
      {index > 0 && (
        <div className="absolute left-8 -top-8 w-1 h-8 bg-gradient-to-b from-slate-300 to-slate-200" />
      )}

      {/* ステージカード */}
      <div
        className={`
          relative rounded-3xl overflow-hidden transition-all duration-300
          ${isUnlocked ? 'cursor-pointer' : 'opacity-60'}
          ${isActive ? 'ring-4 ring-offset-4 ring-blue-400 shadow-xl' : 'shadow-lg'}
        `}
        onClick={() => isUnlocked && setIsExpanded(!isExpanded)}
      >
        {/* ヘッダー */}
        <div className={`bg-gradient-to-r ${stage.color} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* ステータスアイコン */}
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                ${isCompleted ? 'bg-white/30' : isUnlocked ? 'bg-white/20' : 'bg-black/20'}
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                ) : isUnlocked ? (
                  <div className="text-white">{stage.icon}</div>
                ) : (
                  <Lock className="w-8 h-8 text-white/50" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                <p className="text-white/80 text-sm">{stage.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 進捗バッジ */}
              {isUnlocked && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {completedCount}/{totalCount}
                  </div>
                  <div className="text-xs text-white/70">レッスン完了</div>
                </div>
              )}
              {/* 展開ボタン */}
              {isUnlocked && lessons.length > 0 && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-white/80"
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              )}
            </div>
          </div>

          {/* 進捗バー */}
          {isUnlocked && (
            <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-white/80 rounded-full"
              />
            </div>
          )}
        </div>

        {/* レッスン一覧 */}
        <AnimatePresence>
          {isExpanded && isUnlocked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white"
            >
              <div className="p-4 space-y-3">
                {lessons.map((lesson, idx) => {
                  const isLessonCompleted = mockProgress.completedLessons.includes(lesson._id);
                  const thumbnailUrl =
                    lesson.iconImageUrl ||
                    (lesson.iconImage ? urlFor(lesson.iconImage).width(100).height(100).url() : null);

                  return (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonClick(lesson.slug.current);
                      }}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
                        ${isLessonCompleted
                          ? 'bg-emerald-50 border-2 border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                        }
                      `}
                    >
                      {/* サムネイル */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${stage.color} flex items-center justify-center`}>
                            <BookOpen className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                      </div>
                      {/* 情報 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 line-clamp-1">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {lesson.isPremium && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                              Premium
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            +50 XP
                          </span>
                        </div>
                      </div>
                      {/* 完了状態 */}
                      <div className="flex-shrink-0">
                        {isLessonCompleted ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function LessonsPatternF() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, error } = useLessons();

  // ステージごとにレッスンを分類
  const stageData = useMemo(() => {
    if (!lessons) return [];

    let unlockedCount = 0;
    return learningPath.map((stage, idx) => {
      const filtered = lessons.filter(lesson => {
        const text = `${lesson.title} ${lesson.description || ''} ${lesson.categoryTitle || ''}`.toLowerCase();
        return stage.keywords.some(kw => text.includes(kw.toLowerCase()));
      });

      const completedCount = filtered.filter(l =>
        mockProgress.completedLessons.includes(l._id)
      ).length;

      const isUnlocked = unlockedCount >= stage.requiredToUnlock;
      unlockedCount += completedCount;

      return {
        ...stage,
        lessons: filtered,
        completedCount,
        isUnlocked,
        isActive: isUnlocked && completedCount < filtered.length,
      };
    });
  }, [lessons]);

  // 次にやるべきレッスン
  const nextLesson = useMemo(() => {
    for (const stage of stageData) {
      if (stage.isActive && stage.lessons.length > 0) {
        const incomplete = stage.lessons.find(
          l => !mockProgress.completedLessons.includes(l._id)
        );
        if (incomplete) return { lesson: incomplete, stage };
      }
    }
    return null;
  }, [stageData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-100 p-8 text-center text-red-600">
          エラーが発生しました
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
        {/* ステータスバー */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* ストリーク */}
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-600">{mockProgress.currentStreak}</span>
                <span className="text-sm text-orange-500">日連続</span>
              </div>
              {/* XP */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-amber-600">{mockProgress.totalXP}</span>
                <span className="text-sm text-amber-500">XP</span>
              </div>
              {/* レベル */}
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                <Trophy className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-purple-500">Lv.</span>
                <span className="font-bold text-purple-600">{mockProgress.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 次のレッスン推奨 */}
        {nextLesson && (
          <section className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">次におすすめ</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {nextLesson.lesson.title}
                </h2>
                <p className="text-white/70 mb-6">
                  {nextLesson.stage.title}のレッスン • +50 XP
                </p>
                <button
                  onClick={() => navigate(`/lessons/${nextLesson.lesson.slug.current}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg"
                >
                  学習を始める
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </section>
        )}

        {/* 学習パス */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            あなたの学習パス
          </h2>

          <div className="space-y-8">
            {stageData.map((stage, idx) => (
              <StageNode
                key={stage.id}
                stage={stage}
                lessons={stage.lessons}
                isUnlocked={stage.isUnlocked}
                isActive={stage.isActive}
                completedCount={stage.completedCount}
                totalCount={stage.lessons.length}
                onLessonClick={(slug) => navigate(`/lessons/${slug}`)}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* 全体の進捗 */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
              全体の進捗
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-emerald-500">
                  {mockProgress.completedLessons.length}
                </div>
                <div className="text-sm text-slate-500 mt-1">完了レッスン</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-500">
                  {mockProgress.totalXP}
                </div>
                <div className="text-sm text-slate-500 mt-1">獲得XP</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-500">
                  {mockProgress.currentStreak}
                </div>
                <div className="text-sm text-slate-500 mt-1">連続日数</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
