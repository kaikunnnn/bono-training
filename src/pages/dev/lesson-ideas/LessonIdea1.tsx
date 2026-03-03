/**
 * Idea 1: シネマティック・イマーシブ
 * MasterClass スタイル - フルスクリーン動画ヒーロー、没入体験
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  Star,
  CheckCircle,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea1 = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ナビゲーション */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
        <Link
          to="/dev/lesson-detail-patterns"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">アイデア一覧</span>
        </Link>
      </nav>

      {/* フルスクリーン動画ヒーロー */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 背景グラデーション（動画の代わり） */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>

        {/* 装飾的な円 */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* コンテンツ */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-6">
            {lessonData.category}
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 font-rounded-mplus leading-tight">
            {lessonData.title}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            {lessonData.description}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all">
              <Play className="w-6 h-6" fill="black" />
              {getCTAText()}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-2 text-white/70 hover:text-white px-6 py-4 transition-colors">
              <BookOpen className="w-5 h-5" />
              コースを見る
            </button>
          </div>

          {/* メタ情報 */}
          <div className="flex items-center justify-center gap-6 mt-10 text-white/50 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {lessonData.totalDuration}
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {lessonData.totalArticles}記事
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              {lessonData.difficulty}
            </span>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 講師セクション */}
      <section className="bg-gradient-to-b from-black to-gray-900 py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4">
                インストラクター
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-rounded-mplus">
                {lessonData.instructor.name}
              </h2>
              <p className="text-white/50 text-lg mb-6">
                {lessonData.instructor.title}
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                「{lessonData.instructor.message}」
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl sm:text-8xl font-bold shadow-2xl shadow-blue-500/20">
                {lessonData.instructor.avatar}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学べること */}
      <section className="bg-gray-900 py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4">
              What You'll Learn
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-rounded-mplus">
              このレッスンで学べること
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {lessonData.learningOutcomes.map((outcome, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-white/80 text-lg">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* クエスト一覧 */}
      <section className="bg-black py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4">
              Course Content
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-rounded-mplus">
              全{lessonData.quests.length}クエスト・{lessonData.totalArticles}記事
            </h2>
          </div>

          <div className="space-y-6">
            {lessonData.quests.map((quest, i) => (
              <div
                key={quest.id}
                className={`rounded-2xl border transition-all ${
                  quest.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : i === userProgress.currentQuestIndex
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          quest.completed
                            ? 'bg-green-500 text-white'
                            : i === userProgress.currentQuestIndex
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {quest.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          quest.number
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-rounded-mplus">
                          Quest {quest.number}: {quest.title}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                          {quest.articles.length}記事
                        </p>
                      </div>
                    </div>
                    {quest.completed && (
                      <span className="text-green-400 text-sm font-medium">
                        完了
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 ml-16">{quest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="bg-gradient-to-t from-blue-900/50 to-black py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-rounded-mplus">
            学習を始めよう
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            {lessonData.progress > 0
              ? `現在${lessonData.progress}%完了。続きから学習を再開しましょう。`
              : 'UIデザインの基本を体系的に学び、実務で使えるスキルを身につけましょう。'}
          </p>
          <button className="group flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-xl mx-auto hover:bg-white/90 transition-all">
            <Play className="w-7 h-7" fill="black" />
            {getCTAText()}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white/70">
        Idea 1: シネマティック・イマーシブ
      </div>
    </div>
  );
};

export default LessonIdea1;
