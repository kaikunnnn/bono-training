/**
 * Idea 4: ロードマップ/星座型
 * Khan Academy スタイル - 視覚的な学習パスを星座風に表示
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Star,
  Check,
  Lock,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea4 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* 星の背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

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
          <span className="text-sm text-white/60">{lessonData.category}</span>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="relative z-10 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white/70 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {lessonData.progress}% 完了
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-rounded-mplus">
            {lessonData.title}
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-6">
            {lessonData.description}
          </p>
          <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {lessonData.totalDuration}
            </span>
            <span>•</span>
            <span>{lessonData.totalArticles}記事</span>
            <span>•</span>
            <span>{lessonData.difficulty}</span>
          </div>
        </div>
      </header>

      {/* 星座ロードマップ */}
      <section className="relative z-10 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {lessonData.quests.map((quest, questIndex) => (
            <div key={quest.id} className="relative">
              {/* 接続線 */}
              {questIndex < lessonData.quests.length - 1 && (
                <div className="absolute left-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-white/30 to-transparent -translate-x-1/2"></div>
              )}

              {/* クエストカード */}
              <div
                className={`relative rounded-3xl p-6 mb-16 ${
                  quest.completed
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30'
                    : questIndex === userProgress.currentQuestIndex
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {/* クエストヘッダー */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      quest.completed
                        ? 'bg-green-500 text-white'
                        : questIndex === userProgress.currentQuestIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {quest.completed ? (
                      <Check className="w-7 h-7" strokeWidth={3} />
                    ) : questIndex > userProgress.currentQuestIndex ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <span className="text-xl font-bold">{quest.number}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-rounded-mplus">
                      Quest {quest.number}: {quest.title}
                    </h2>
                    <p className="text-white/50 text-sm">{quest.description}</p>
                  </div>
                </div>

                {/* 記事リスト（星座風） */}
                <div className="relative pl-6 ml-3 border-l border-white/20">
                  {quest.articles.map((article, articleIndex) => {
                    const isCompleted = article.completed;
                    const isCurrent =
                      questIndex === userProgress.currentQuestIndex &&
                      articleIndex === userProgress.currentArticleIndex;
                    const isLocked =
                      questIndex > userProgress.currentQuestIndex ||
                      (questIndex === userProgress.currentQuestIndex &&
                        articleIndex > userProgress.currentArticleIndex);

                    return (
                      <div
                        key={article.id}
                        className="relative flex items-center gap-4 py-3"
                      >
                        {/* 星マーカー */}
                        <div
                          className={`absolute -left-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? 'bg-yellow-400 border-yellow-400'
                              : isCurrent
                              ? 'bg-blue-400 border-blue-400 animate-pulse'
                              : 'bg-slate-800 border-white/30'
                          }`}
                        >
                          {isCompleted && (
                            <Star
                              className="w-full h-full p-0.5 text-slate-900"
                              fill="currentColor"
                            />
                          )}
                        </div>

                        {/* 記事情報 */}
                        <div
                          className={`flex-1 flex items-center justify-between p-3 rounded-xl ${
                            isCurrent
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <p
                              className={`font-medium ${
                                isLocked ? 'text-white/30' : 'text-white/80'
                              }`}
                            >
                              {article.title}
                            </p>
                            <p className="text-sm text-white/40">
                              {article.duration}
                            </p>
                          </div>
                          {isCurrent && (
                            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                              <Play className="w-4 h-4" fill="white" />
                              再開
                            </button>
                          )}
                          {isCompleted && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 講師セクション */}
      <section className="relative z-10 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {lessonData.instructor.avatar}
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  Instructor
                </p>
                <p className="font-bold text-white mb-1">
                  {lessonData.instructor.name}
                </p>
                <p className="text-sm text-white/50 mb-3">
                  {lessonData.instructor.title}
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  「{lessonData.instructor.message}」
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="relative z-10 py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
            <Play className="w-6 h-6" fill="white" />
            {getCTAText()}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-white/40 text-sm mt-4">
            {lessonData.completedArticles}/{lessonData.totalArticles}記事完了
          </p>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white/70">
        Idea 4: ロードマップ/星座型
      </div>
    </div>
  );
};

export default LessonIdea4;
