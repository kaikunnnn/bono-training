/**
 * Idea 11: チェックリスト進行
 * Asana/Todoist スタイル - タスク完了の達成感を重視
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Check,
  Square,
  CheckSquare,
  Circle,
  ArrowRight,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea11 = () => {
  const completedPercentage = lessonData.progress;

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">
              {lessonData.completedArticles}/{lessonData.totalArticles} 完了
            </span>
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="py-8 px-4 sm:px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-gray-500 mb-2">{lessonData.category}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-rounded-mplus">
            {lessonData.title}
          </h1>
          <p className="text-gray-600">{lessonData.description}</p>
        </div>
      </header>

      {/* 達成状況サマリー */}
      <section className="py-6 px-4 sm:px-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {lessonData.completedArticles}個完了！
                </p>
                <p className="text-sm text-gray-600">
                  残り{lessonData.totalArticles - lessonData.completedArticles}個で全クリア
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                {completedPercentage}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* チェックリスト */}
      <main className="py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {lessonData.quests.map((quest, questIndex) => {
            const questCompleted = quest.completed;
            const questProgress = quest.articles.filter((a) => a.completed).length;

            return (
              <div key={quest.id}>
                {/* クエストヘッダー */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      questCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {questCompleted ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <span className="font-bold text-sm">{quest.number}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-900">{quest.title}</h2>
                    <p className="text-sm text-gray-500">
                      {questProgress}/{quest.articles.length} 完了
                    </p>
                  </div>
                  {questCompleted && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      クリア！
                    </span>
                  )}
                </div>

                {/* 記事チェックリスト */}
                <div className="space-y-2 ml-11">
                  {quest.articles.map((article, articleIndex) => {
                    const isCompleted = article.completed;
                    const isCurrent =
                      questIndex === userProgress.currentQuestIndex &&
                      articleIndex === userProgress.currentArticleIndex;

                    return (
                      <div
                        key={article.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : isCompleted
                            ? 'bg-gray-50 opacity-70'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        {/* チェックボックス */}
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'border-2 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isCompleted && (
                            <Check className="w-4 h-4" strokeWidth={3} />
                          )}
                        </div>

                        {/* タイトル */}
                        <span
                          className={`flex-1 ${
                            isCompleted
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {article.title}
                        </span>

                        {/* メタ情報 */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              article.type === 'practice'
                                ? 'bg-purple-100 text-purple-600'
                                : article.type === 'challenge'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {article.type === 'practice'
                              ? '実践'
                              : article.type === 'challenge'
                              ? 'チャレンジ'
                              : article.duration}
                          </span>
                          {isCurrent && (
                            <button className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                              <Play className="w-4 h-4" fill="white" />
                              開始
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 完了報酬プレビュー */}
      <section className="py-8 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              全タスク完了で
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  UIデザインサイクル マスター
                </p>
                <p className="text-sm text-gray-500">バッジを獲得</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {lessonData.totalArticles - lessonData.completedArticles}個のタスクが残っています
            </p>
            <p className="text-sm text-gray-500">次: ビジュアルデザイン</p>
          </div>
          <button className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors">
            <Play className="w-5 h-5" fill="white" />
            {getCTAText()}
          </button>
        </div>
      </div>

      {/* アイデア情報 */}
      <div className="fixed top-20 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 11: チェックリスト進行
      </div>
    </div>
  );
};

export default LessonIdea11;
