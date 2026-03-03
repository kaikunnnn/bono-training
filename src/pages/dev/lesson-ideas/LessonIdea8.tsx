/**
 * Idea 8: 1セクション集中
 * Linear スタイル - 今やるべきことに集中したミニマルUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Check,
  Clock,
  ChevronRight,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText, getNextArticle } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea8 = () => {
  const nextItem = getNextArticle();
  const currentQuest = lessonData.quests[userProgress.currentQuestIndex];
  const currentArticle = currentQuest?.articles[userProgress.currentArticleIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm text-gray-400">{lessonData.category}</span>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* メインコンテンツ - 現在のタスクに集中 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* タイトル */}
        <div className="mb-12">
          <p className="text-sm text-gray-400 mb-2">{lessonData.category}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-rounded-mplus">
            {lessonData.title}
          </h1>
        </div>

        {/* 進捗 - シンプルなライン表示 */}
        <div className="mb-16">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-500">進捗</span>
            <span className="text-gray-900 font-medium">
              {lessonData.completedArticles}/{lessonData.totalArticles}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: lessonData.totalArticles }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i < lessonData.completedArticles
                    ? 'bg-gray-900'
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* 次にやること - 最も目立つ部分 */}
        {nextItem && (
          <div className="mb-16">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
              次のステップ
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Quest {nextItem.quest.number} • {nextItem.quest.title}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {nextItem.article.title}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {nextItem.article.duration}
                </span>
                <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                  {nextItem.article.type === 'practice' ? '実践' : nextItem.article.type === 'challenge' ? 'チャレンジ' : '動画'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 全体構成 - 折りたたみ可能 */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            全{lessonData.quests.length}セクション
          </p>
          <div className="space-y-2">
            {lessonData.quests.map((quest, i) => {
              const completedCount = quest.articles.filter(
                (a) => a.completed
              ).length;
              const isCurrent = i === userProgress.currentQuestIndex;

              return (
                <div
                  key={quest.id}
                  className={`rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                          quest.completed
                            ? 'bg-gray-900 text-white'
                            : isCurrent
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {quest.completed ? (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        ) : (
                          quest.number
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            quest.completed || isCurrent
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {quest.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {completedCount}/{quest.articles.length} 完了
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>

                  {/* 現在のセクションは記事を表示 */}
                  {isCurrent && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-gray-100 pt-3 space-y-1">
                        {quest.articles.map((article, j) => (
                          <div
                            key={article.id}
                            className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                              j === userProgress.currentArticleIndex
                                ? 'bg-blue-50'
                                : ''
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                article.completed
                                  ? 'bg-gray-900 text-white'
                                  : j === userProgress.currentArticleIndex
                                  ? 'border-2 border-blue-500'
                                  : 'border border-gray-300'
                              }`}
                            >
                              {article.completed && (
                                <Check className="w-3 h-3" strokeWidth={3} />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                article.completed
                                  ? 'text-gray-400 line-through'
                                  : j === userProgress.currentArticleIndex
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-600'
                              }`}
                            >
                              {article.title}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {article.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* フッターCTA - 固定 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">次: {nextItem?.article.title}</p>
            <p className="text-xs text-gray-400">{nextItem?.article.duration}</p>
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
            {getCTAText()}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* スペーサー */}
      <div className="h-20"></div>

      {/* アイデア情報 */}
      <div className="fixed top-20 right-4 bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-600">
        Idea 8: 1セクション集中
      </div>
    </div>
  );
};

export default LessonIdea8;
