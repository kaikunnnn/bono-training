/**
 * Idea 6: クエスト冒険型
 * Habitica スタイル - RPG/冒険テーマのゲーム風UI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Sword,
  Shield,
  Heart,
  Star,
  Gem,
  Map,
  Play,
  Check,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea6 = () => {
  const playerLevel = Math.floor(userProgress.totalXP / 100) + 1;
  const currentHP = 85;
  const maxHP = 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100">
      {/* 装飾パターン */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-30"></div>
      </div>

      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-amber-900/90 backdrop-blur-sm border-b-4 border-amber-700 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-amber-200 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>

          {/* プレイヤーステータス */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-800 rounded-lg px-3 py-1.5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-amber-900 font-bold text-sm">
                Lv{playerLevel}
              </div>
              <div className="text-amber-100">
                <div className="flex items-center gap-1 text-xs">
                  <Heart className="w-3 h-3 text-red-400" />
                  {currentHP}/{maxHP}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Gem className="w-4 h-4" />
              <span className="font-bold">{userProgress.totalXP}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* クエストバナー */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-amber-800 to-orange-800 rounded-3xl overflow-hidden">
            {/* 装飾 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>

            <div className="relative p-6 sm:p-8">
              <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4">
                <Map className="w-4 h-4" />
                メインクエスト
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-rounded-mplus">
                {lessonData.title}
              </h1>
              <p className="text-amber-200/80 mb-6 max-w-2xl">
                {lessonData.description}
              </p>

              {/* クエスト進捗 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-amber-200">クエスト進行度</span>
                    <span className="text-yellow-400 font-bold">
                      {lessonData.progress}%
                    </span>
                  </div>
                  <div className="h-4 bg-amber-900/50 rounded-full overflow-hidden border-2 border-amber-700">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                      style={{ width: `${lessonData.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 報酬プレビュー */}
              <div className="flex items-center gap-6 text-sm">
                <span className="text-amber-300">クリア報酬:</span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Gem className="w-4 h-4" />
                  +180 XP
                </span>
                <span className="flex items-center gap-1 text-purple-300">
                  <Star className="w-4 h-4" />
                  称号獲得
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 冒険者（講師）情報 */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 rounded-2xl border-2 border-amber-200 p-5">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {lessonData.instructor.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-800" fill="currentColor" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">
                    ギルドマスター
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {lessonData.instructor.name}
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  「{lessonData.instructor.message}」
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* クエストマップ */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Sword className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900 font-rounded-mplus">
              クエストマップ
            </h2>
          </div>

          <div className="space-y-4">
            {lessonData.quests.map((quest, questIndex) => {
              const isLocked = questIndex > userProgress.currentQuestIndex;
              const isCurrent = questIndex === userProgress.currentQuestIndex;

              return (
                <div
                  key={quest.id}
                  className={`relative rounded-2xl border-2 overflow-hidden ${
                    quest.completed
                      ? 'bg-green-50 border-green-300'
                      : isCurrent
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* クエストヘッダー */}
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* アイコン */}
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          quest.completed
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {quest.completed ? (
                          <Shield className="w-7 h-7" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          <Sword className="w-7 h-7" />
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
                            第{quest.number}章: {quest.title}
                          </h3>
                          {quest.completed && (
                            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              クリア
                            </span>
                          )}
                          {isCurrent && (
                            <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                              挑戦中
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            isLocked ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {quest.description}
                        </p>
                      </div>

                      {/* CTA */}
                      {isCurrent && (
                        <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/25">
                          <Sword className="w-5 h-5" />
                          挑む
                        </button>
                      )}
                      {!isCurrent && !isLocked && (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* サブクエスト（記事） */}
                    {!isLocked && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-4 gap-2">
                          {quest.articles.map((article, i) => (
                            <div
                              key={article.id}
                              className={`h-3 rounded-full ${
                                article.completed
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                  : 'bg-gray-200'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {quest.articles.filter((a) => a.completed).length}/
                          {quest.articles.length} サブクエスト完了
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 報酬 */}
                  {!isLocked && (
                    <div className="px-5 py-3 bg-amber-50/50 border-t border-amber-100 flex items-center gap-4 text-xs">
                      <span className="text-amber-600">クリア報酬:</span>
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Gem className="w-3 h-3" />
                        +60 XP
                      </span>
                      {questIndex === lessonData.quests.length - 1 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Sparkles className="w-3 h-3" />
                          レアアイテム
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 text-center text-white border-4 border-amber-500">
            <h2 className="text-2xl font-bold mb-3 font-rounded-mplus">
              冒険を続けよう！
            </h2>
            <p className="text-amber-100 mb-6">
              あなたの旅はまだ{lessonData.progress}%。栄光を手に入れよう！
            </p>
            <button className="inline-flex items-center gap-3 bg-white text-amber-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-colors shadow-lg">
              <Play className="w-6 h-6" fill="currentColor" />
              {getCTAText()}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-amber-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-amber-100">
        Idea 6: クエスト冒険型
      </div>
    </div>
  );
};

export default LessonIdea6;
