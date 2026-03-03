/**
 * Idea 3: Before/After中心
 * Refactoring UI スタイル - ビジュアル変化を最初に見せる
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea3 = () => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <span className="text-sm font-medium text-gray-900">
            {lessonData.category}
          </span>
        </div>
      </nav>

      {/* Before/Afterヒーロー */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-training font-medium text-sm mb-3">
              学習前と学習後の違い
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-rounded-mplus">
              {lessonData.title}
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              このレッスンを受ける前と後で、あなたのデザインがどう変わるか見てみましょう
            </p>
          </div>

          {/* Before/Afterスライダー */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-[16/9] mb-8">
            {/* Before側 */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg max-w-xs w-full">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-400 rounded mt-4"></div>
                  </div>
                </div>
                <p className="mt-4 text-gray-500 font-medium">
                  なんとなくデザイン
                </p>
              </div>
              <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold">
                BEFORE
              </div>
            </div>

            {/* After側 */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-2xl p-6 shadow-xl max-w-xs w-full border border-blue-100">
                  <div className="space-y-3">
                    <div className="h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mt-4 flex items-center justify-center text-white font-bold text-sm">
                      開始する
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-blue-600 font-medium">
                  根拠のあるデザイン
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                AFTER
              </div>
            </div>

            {/* スライダーハンドル */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="flex gap-0.5">
                  <ChevronRight className="w-4 h-4 text-gray-400 -mr-2" />
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </div>
            </div>

            {/* スライダー操作エリア */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />
          </div>

          <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            スライダーを動かして変化を確認
          </p>
        </div>
      </section>

      {/* 変化のポイント */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 font-rounded-mplus">
            学習後、何が変わる？
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {lessonData.learningOutcomes.map((outcome, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold">
                    ✕
                  </div>
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-sm font-bold">
                    ○
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2 line-through">
                    なんとなくデザイン
                  </p>
                  <div className="w-0.5 h-4"></div>
                  <p className="text-gray-900 font-medium">{outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* レッスン情報 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-8">
            {/* 左: 講師情報 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
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
              <p className="text-gray-600 text-sm leading-relaxed">
                「{lessonData.instructor.message}」
              </p>
            </div>

            {/* 右: メタ情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <Clock className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">所要時間</p>
                  <p className="font-bold text-gray-900">{lessonData.totalDuration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <BookOpen className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">コンテンツ</p>
                  <p className="font-bold text-gray-900">
                    {lessonData.quests.length}クエスト・{lessonData.totalArticles}記事
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* クエスト一覧 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 font-rounded-mplus">
            レッスン内容
          </h2>
          <div className="space-y-4">
            {lessonData.quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          quest.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {quest.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          quest.number
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Quest {quest.number}: {quest.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {quest.articles.length}記事 • {quest.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-rounded-mplus">
            「根拠のあるデザイン」を身につける
          </h2>
          <p className="text-blue-100 mb-8">
            {lessonData.progress > 0
              ? `現在${lessonData.progress}%完了。あと少しで変われます！`
              : 'このレッスンで、あなたのデザインが変わります'}
          </p>
          <button className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors">
            <Play className="w-6 h-6" fill="currentColor" />
            {getCTAText()}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 3: Before/After中心
      </div>
    </div>
  );
};

export default LessonIdea3;
