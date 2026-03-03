/**
 * Idea 5: ストリーク＆XP重視
 * Duolingo スタイル - ゲーミフィケーション中心のUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Flame,
  Zap,
  Trophy,
  Target,
  Play,
  Check,
  Lock,
  ArrowRight,
  Star,
  Gift,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea5 = () => {
  const streakDays = userProgress.streak;
  const totalXP = userProgress.totalXP;
  const weeklyGoal = 100;
  const weeklyProgress = 65;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>

          {/* ステータスバー */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-sm font-bold">
              <Flame className="w-4 h-4" />
              {streakDays}日
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-full text-sm font-bold">
              <Zap className="w-4 h-4" />
              {totalXP} XP
            </div>
          </div>
        </div>
      </nav>

      {/* ストリーク & XP サマリー */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {/* ストリーク */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">連続学習</p>
                  <p className="text-3xl font-bold">{streakDays}日</p>
                </div>
              </div>
              <p className="text-sm text-white/70">
                🔥 素晴らしい！この調子で続けよう
              </p>
            </div>

            {/* 累計XP */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">累計XP</p>
                  <p className="text-3xl font-bold">{totalXP}</p>
                </div>
              </div>
              <p className="text-sm text-white/70">
                ⚡ あと55XPでレベルアップ！
              </p>
            </div>

            {/* 週間目標 */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">今週の目標</p>
                    <p className="text-xl font-bold">
                      {weeklyProgress}/{weeklyGoal} XP
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(weeklyProgress / weeklyGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* レッスン情報 */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                UI
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{lessonData.category}</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 font-rounded-mplus">
                  {lessonData.title}
                </h1>
                <p className="text-gray-600 text-sm">{lessonData.description}</p>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">進捗</span>
                <span className="text-sm font-bold text-green-600">
                  {lessonData.progress}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${lessonData.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {lessonData.completedArticles}/{lessonData.totalArticles}記事完了
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* クエスト一覧 */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4 font-rounded-mplus">
            クエスト
          </h2>
          <div className="space-y-4">
            {lessonData.quests.map((quest, questIndex) => {
              const isLocked = questIndex > userProgress.currentQuestIndex;
              const isCurrent = questIndex === userProgress.currentQuestIndex;
              const completedArticles = quest.articles.filter(
                (a) => a.completed
              ).length;
              const questXP = quest.articles.length * 15;

              return (
                <div
                  key={quest.id}
                  className={`rounded-3xl border overflow-hidden ${
                    quest.completed
                      ? 'bg-green-50 border-green-200'
                      : isCurrent
                      ? 'bg-white border-green-400 ring-2 ring-green-400/20'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* クエストアイコン */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          quest.completed
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {quest.completed ? (
                          <Trophy className="w-7 h-7" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          <span className="text-2xl font-bold">{quest.number}</span>
                        )}
                      </div>

                      {/* クエスト情報 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-bold ${
                              isLocked ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            Quest {quest.number}: {quest.title}
                          </h3>
                          {quest.completed && (
                            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              完了!
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            isLocked ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {quest.description}
                        </p>

                        {/* 報酬 */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                            <Zap className="w-3 h-3" />
                            {questXP} XP
                          </span>
                          {questIndex === lessonData.quests.length - 1 && (
                            <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              <Gift className="w-3 h-3" />
                              バッジ獲得
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      {isCurrent && (
                        <button className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors">
                          <Play className="w-5 h-5" fill="white" />
                          続ける
                        </button>
                      )}
                    </div>

                    {/* 記事進捗 */}
                    {!isLocked && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-1.5">
                          {quest.articles.map((article, i) => (
                            <div
                              key={article.id}
                              className={`flex-1 h-2 rounded-full ${
                                article.completed
                                  ? 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {completedArticles}/{quest.articles.length}記事完了
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* バッジプレビュー */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Star className="w-10 h-10" fill="white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  完了時に獲得できるバッジ
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  UIデザインサイクル マスター
                </h3>
                <p className="text-sm text-gray-600">
                  全クエストを完了すると獲得できます
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {lessonData.progress}%
                </p>
                <p className="text-xs text-purple-500">達成率</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3 font-rounded-mplus">
              今日もXPを獲得しよう！
            </h2>
            <p className="text-green-100 mb-6">
              {streakDays}日連続学習中 • あと1記事で+15 XP
            </p>
            <button className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-colors">
              <Play className="w-6 h-6" fill="currentColor" />
              {getCTAText()}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 5: ストリーク＆XP重視
      </div>
    </div>
  );
};

export default LessonIdea5;
