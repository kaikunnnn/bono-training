/**
 * Idea 10: 時間軸タイムライン
 * 時間ベースの進行を視覚化したタイムラインUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Clock,
  Check,
  Circle,
  ArrowRight,
  Calendar,
  Timer,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText, getNextArticle } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea10 = () => {
  const nextItem = getNextArticle();
  const totalMinutes = 60;
  const completedMinutes = 30;

  // 記事を時間順にフラット化
  const allArticles = lessonData.quests.flatMap((quest, qIndex) =>
    quest.articles.map((article, aIndex) => ({
      ...article,
      questNumber: quest.number,
      questTitle: quest.title,
      isNext: qIndex === userProgress.currentQuestIndex && aIndex === userProgress.currentArticleIndex,
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
          <span className="text-sm text-gray-500">{lessonData.category}</span>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-rounded-mplus">
            {lessonData.title}
          </h1>
          <p className="text-gray-600 mb-6">{lessonData.description}</p>

          {/* 時間サマリー */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <Timer className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{totalMinutes}分</p>
              <p className="text-sm text-gray-500">総所要時間</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <Clock className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{completedMinutes}分</p>
              <p className="text-sm text-gray-500">学習済み</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <Calendar className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{totalMinutes - completedMinutes}分</p>
              <p className="text-sm text-gray-500">残り</p>
            </div>
          </div>
        </div>
      </header>

      {/* 時間軸プログレスバー */}
      <section className="py-6 px-4 sm:px-6 sticky top-16 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* 時間マーカー */}
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>0分</span>
              <span>15分</span>
              <span>30分</span>
              <span>45分</span>
              <span>60分</span>
            </div>
            {/* プログレスバー */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: `${(completedMinutes / totalMinutes) * 100}%` }}
              ></div>
              {/* 現在地マーカー */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md"
                style={{ left: `calc(${(completedMinutes / totalMinutes) * 100}% - 8px)` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* タイムラインビュー */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* 縦線 */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* 各記事 */}
            <div className="space-y-4">
              {allArticles.map((article, index) => {
                const isCompleted = article.completed;
                const isNext = article.isNext;

                return (
                  <div
                    key={article.id}
                    className={`relative flex items-start gap-6 p-4 rounded-2xl transition-all ${
                      isNext
                        ? 'bg-blue-50 border-2 border-blue-200 ml-4'
                        : isCompleted
                        ? 'opacity-60'
                        : 'hover:bg-gray-50 ml-4'
                    }`}
                  >
                    {/* タイムライン上のマーカー */}
                    <div
                      className={`absolute left-0 w-4 h-4 rounded-full border-2 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : isNext
                          ? 'bg-blue-500 border-blue-500 animate-pulse'
                          : 'bg-white border-gray-300'
                      }`}
                      style={{ left: '24px', transform: 'translateX(-50%)' }}
                    >
                      {isCompleted && (
                        <Check className="w-full h-full p-0.5 text-white" strokeWidth={3} />
                      )}
                    </div>

                    {/* 時間表示 */}
                    <div className="w-16 flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-400">
                        {article.duration}
                      </p>
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Quest {article.questNumber}
                          </p>
                          <h3
                            className={`font-medium ${
                              isCompleted
                                ? 'text-gray-400 line-through'
                                : 'text-gray-900'
                            }`}
                          >
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                article.type === 'practice'
                                  ? 'bg-purple-100 text-purple-600'
                                  : article.type === 'challenge'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {article.type === 'practice'
                                ? '実践'
                                : article.type === 'challenge'
                                ? 'チャレンジ'
                                : article.type === 'intro'
                                ? 'イントロ'
                                : '解説'}
                            </span>
                          </div>
                        </div>
                        {isNext && (
                          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Play className="w-4 h-4" fill="white" />
                            再開
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 講師情報 */}
      <section className="py-10 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {lessonData.instructor.avatar}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {lessonData.instructor.name}
              </p>
              <p className="text-sm text-gray-500">
                {lessonData.instructor.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6" />
              <span className="text-xl font-bold">
                残り{totalMinutes - completedMinutes}分
              </span>
            </div>
            <p className="text-blue-100 mb-6">
              あと{lessonData.totalArticles - lessonData.completedArticles}記事で完了！
            </p>
            <button className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors">
              <Play className="w-6 h-6" fill="currentColor" />
              {getCTAText()}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 10: 時間軸タイムライン
      </div>
    </div>
  );
};

export default LessonIdea10;
