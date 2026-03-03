/**
 * Idea 15: スキルツリー型
 * Khan Academy / RPG スキルツリースタイル - スキル解放を視覚化
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Lock,
  Check,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

// スキルツリーデータ
const skillTree = [
  {
    id: 'foundation',
    title: '基礎スキル',
    description: 'デザインの土台を築く',
    skills: [
      { id: 's1', name: 'UIとは', unlocked: true, completed: true },
      { id: 's2', name: 'デザインサイクル', unlocked: true, completed: true },
      { id: 's3', name: '4ステップ理解', unlocked: true, completed: true },
    ],
    completed: true,
  },
  {
    id: 'practice',
    title: '実践スキル',
    description: '手を動かして学ぶ',
    skills: [
      { id: 's4', name: 'ワイヤーフレーム', unlocked: true, completed: true },
      { id: 's5', name: 'ビジュアルデザイン', unlocked: true, completed: false },
      { id: 's6', name: 'フィードバック', unlocked: false, completed: false },
    ],
    completed: false,
  },
  {
    id: 'mastery',
    title: 'マスタースキル',
    description: '実務で使える力',
    skills: [
      { id: 's7', name: '実務活用', unlocked: false, completed: false },
      { id: 's8', name: '総合課題', unlocked: false, completed: false },
    ],
    completed: false,
  },
];

const LessonIdea15 = () => {
  const totalSkills = skillTree.reduce((acc, tier) => acc + tier.skills.length, 0);
  const completedSkills = skillTree.reduce(
    (acc, tier) => acc + tier.skills.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <div className="flex items-center gap-2 text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">{userProgress.totalXP} XP</span>
          </div>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 text-sm font-medium mb-2">
            {lessonData.category}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-rounded-mplus">
            {lessonData.title}
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-6">
            スキルを解放してデザインマスターを目指そう
          </p>

          {/* 進捗サマリー */}
          <div className="inline-flex items-center gap-6 bg-white/10 rounded-2xl px-6 py-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{completedSkills}</p>
              <p className="text-xs text-white/50">習得済み</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalSkills}</p>
              <p className="text-xs text-white/50">全スキル</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">
                {Math.round((completedSkills / totalSkills) * 100)}%
              </p>
              <p className="text-xs text-white/50">完了率</p>
            </div>
          </div>
        </div>
      </header>

      {/* スキルツリー */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* 接続線 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500/20 -translate-x-1/2"></div>

            {/* 各ティア */}
            <div className="space-y-16">
              {skillTree.map((tier, tierIndex) => {
                const isLocked = tierIndex > 0 && !skillTree[tierIndex - 1].completed;
                const isCurrent = !tier.completed && (tierIndex === 0 || skillTree[tierIndex - 1].completed);

                return (
                  <div key={tier.id} className="relative">
                    {/* ティアヘッダー */}
                    <div className="flex items-center justify-center mb-8">
                      <div
                        className={`relative z-10 px-6 py-3 rounded-2xl ${
                          tier.completed
                            ? 'bg-green-500/20 border border-green-500/50'
                            : isCurrent
                            ? 'bg-blue-500/20 border border-blue-500/50'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {tier.completed ? (
                            <Star className="w-5 h-5 text-green-400" fill="currentColor" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5 text-white/30" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-blue-400" />
                          )}
                          <div>
                            <h2
                              className={`font-bold ${
                                isLocked ? 'text-white/30' : 'text-white'
                              }`}
                            >
                              {tier.title}
                            </h2>
                            <p className={`text-xs ${isLocked ? 'text-white/20' : 'text-white/50'}`}>
                              {tier.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* スキルノード */}
                    <div className="flex justify-center gap-4 flex-wrap">
                      {tier.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className={`relative group cursor-pointer ${
                            !skill.unlocked ? 'opacity-40' : ''
                          }`}
                        >
                          {/* ノード */}
                          <div
                            className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                              skill.completed
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30'
                                : skill.unlocked
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 hover:scale-105'
                                : 'bg-white/10 border border-white/10'
                            }`}
                          >
                            {skill.completed ? (
                              <Check className="w-8 h-8 text-white" strokeWidth={3} />
                            ) : skill.unlocked ? (
                              <Play className="w-8 h-8 text-white ml-1" fill="white" />
                            ) : (
                              <Lock className="w-6 h-6 text-white/30" />
                            )}
                          </div>

                          {/* スキル名 */}
                          <p
                            className={`mt-2 text-sm text-center font-medium ${
                              skill.unlocked ? 'text-white/80' : 'text-white/30'
                            }`}
                          >
                            {skill.name}
                          </p>

                          {/* XP報酬 */}
                          {!skill.completed && skill.unlocked && (
                            <p className="text-xs text-amber-400 text-center mt-1 flex items-center justify-center gap-1">
                              <Zap className="w-3 h-3" />
                              +15 XP
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 講師セクション */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {lessonData.instructor.avatar}
              </div>
              <div>
                <p className="text-xs text-white/50">スキルマスター</p>
                <p className="font-bold text-white">
                  {lessonData.instructor.name}
                </p>
                <p className="text-sm text-white/60">
                  {lessonData.instructor.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
            <Play className="w-6 h-6" fill="white" />
            {getCTAText()}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-white/40 text-sm mt-4">
            次のスキルを解放しよう
          </p>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white/70">
        Idea 15: スキルツリー型
      </div>
    </div>
  );
};

export default LessonIdea15;
