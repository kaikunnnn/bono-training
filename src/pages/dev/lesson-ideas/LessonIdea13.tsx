/**
 * Idea 13: マイクロラーニング
 * 「1日5分」の気軽さを強調したUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Clock,
  Coffee,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText, getNextArticle } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea13 = () => {
  const nextItem = getNextArticle();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-amber-100 px-4 sm:px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium text-gray-900">{lessonData.category}</span>
          <div className="w-8"></div>
        </div>
      </nav>

      {/* 今日の学習カード */}
      <section className="py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl p-6 text-white shadow-lg shadow-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5" />
              <span className="text-sm font-medium">今日の学習</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 font-rounded-mplus">
              たった5分で学べる
            </h1>
            <p className="text-white/80 mb-6">
              コーヒー1杯分の時間で、デザインスキルアップ
            </p>
            {nextItem && (
              <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70 mb-1">次のレッスン</p>
                <p className="font-bold">{nextItem.article.title}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{nextItem.article.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 進捗状況 */}
      <section className="py-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">今日の進捗</h2>
            <span className="text-sm text-gray-500">
              {lessonData.completedArticles}/{lessonData.totalArticles} 完了
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              style={{ width: `${lessonData.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            <Sparkles className="w-4 h-4 inline mr-1 text-amber-500" />
            あと{lessonData.totalArticles - lessonData.completedArticles}レッスンでマスター！
          </p>
        </div>
      </section>

      {/* マイクロレッスン一覧 */}
      <section className="py-6 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="font-bold text-gray-900 mb-4">
            {lessonData.title}
          </h2>
          <div className="space-y-3">
            {lessonData.quests.map((quest) => (
              <div key={quest.id}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  {quest.title}
                </p>
                <div className="space-y-2">
                  {quest.articles.map((article, i) => {
                    const isCompleted = article.completed;
                    const isNext =
                      quest.id === lessonData.quests[userProgress.currentQuestIndex]?.id &&
                      i === userProgress.currentArticleIndex;

                    return (
                      <div
                        key={article.id}
                        className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                          isNext
                            ? 'bg-amber-50 border-2 border-amber-300'
                            : isCompleted
                            ? 'bg-gray-50 opacity-60'
                            : 'bg-white border border-gray-100'
                        }`}
                      >
                        {/* アイコン */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-100 text-green-600'
                              : isNext
                              ? 'bg-amber-400 text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" strokeWidth={3} />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                          )}
                        </div>

                        {/* コンテンツ */}
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isCompleted ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {article.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Coffee className="w-3 h-3" />
                              ☕ 1杯分
                            </span>
                          </div>
                        </div>

                        {/* アクション */}
                        {isNext && (
                          <button className="bg-amber-400 text-white px-4 py-2 rounded-xl text-sm font-medium">
                            学ぶ
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 学習のコツ */}
      <section className="py-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              マイクロラーニングのコツ
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                毎日同じ時間に学習する習慣をつける
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                通勤時間や休憩時間を活用する
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                1レッスン終わったらすぐにメモを取る
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* おすすめの学習時間 */}
      <section className="py-6 px-4">
        <div className="max-w-lg mx-auto">
          <h3 className="font-bold text-gray-900 mb-4">おすすめの学習タイミング</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <Sun className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">朝</p>
              <p className="text-xs text-gray-500">7:00-8:00</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <Coffee className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">昼休み</p>
              <p className="text-xs text-gray-500">12:00-13:00</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <Moon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">夜</p>
              <p className="text-xs text-gray-500">21:00-22:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-orange-200">
            <Coffee className="w-5 h-5" />
            5分だけ学習する
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* スペーサー */}
      <div className="h-20"></div>

      {/* アイデア情報 */}
      <div className="fixed top-20 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 13: マイクロラーニング
      </div>
    </div>
  );
};

export default LessonIdea13;
