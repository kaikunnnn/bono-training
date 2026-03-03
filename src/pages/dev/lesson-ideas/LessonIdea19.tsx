/**
 * Idea 19: インタラクティブプレビュー
 * Figma スタイル - 学習コンテンツをその場でプレビュー
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  ArrowRight,
  Maximize2,
  Clock,
  Check,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea19 = () => {
  const [selectedArticle, setSelectedArticle] = useState(
    lessonData.quests[userProgress.currentQuestIndex]?.articles[userProgress.currentArticleIndex]
  );
  const [selectedQuest, setSelectedQuest] = useState(
    lessonData.quests[userProgress.currentQuestIndex]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <h1 className="font-medium text-gray-900 text-sm">
            {lessonData.title}
          </h1>
          <button className="text-sm text-blue-600 hover:underline">
            {getCTAText()}
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-52px)]">
        {/* 左サイドバー - 記事リスト */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 hidden md:block">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{lessonData.category}</p>
            <h2 className="font-bold text-gray-900">{lessonData.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>進捗</span>
                <span>{lessonData.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${lessonData.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* クエスト一覧 */}
          <div className="p-2">
            {lessonData.quests.map((quest) => (
              <div key={quest.id} className="mb-2">
                <div
                  className={`px-3 py-2 rounded-lg cursor-pointer ${
                    selectedQuest?.id === quest.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedQuest(quest);
                    setSelectedArticle(quest.articles[0]);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                        quest.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {quest.completed ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        quest.number
                      )}
                    </div>
                    <span className="text-sm font-medium">{quest.title}</span>
                  </div>
                </div>

                {/* 記事リスト */}
                {selectedQuest?.id === quest.id && (
                  <div className="mt-1 ml-7 space-y-1">
                    {quest.articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center gap-2 ${
                          selectedArticle?.id === article.id
                            ? 'bg-blue-100 text-blue-700'
                            : article.completed
                            ? 'text-gray-400 hover:bg-gray-50'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {article.completed ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span className={article.completed ? 'line-through' : ''}>
                          {article.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* メインプレビューエリア */}
        <div className="flex-1 flex flex-col">
          {/* プレビューヘッダー */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                {selectedArticle?.title || '記事を選択'}
              </span>
              {selectedArticle && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.duration}
                </span>
              )}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* プレビューコンテンツ */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              {selectedArticle ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* 動画プレビュー */}
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white/70 text-sm">
                        {selectedQuest?.title} / {selectedArticle.title}
                      </span>
                      <span className="text-white/70 text-sm">
                        {selectedArticle.duration}
                      </span>
                    </div>
                  </div>

                  {/* 記事情報 */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          selectedArticle.type === 'practice'
                            ? 'bg-purple-100 text-purple-600'
                            : selectedArticle.type === 'challenge'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedArticle.type === 'practice'
                          ? '実践'
                          : selectedArticle.type === 'challenge'
                          ? 'チャレンジ'
                          : selectedArticle.type === 'intro'
                          ? 'イントロ'
                          : '解説'}
                      </span>
                      {selectedArticle.completed && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          完了済み
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedArticle.title}
                    </h2>

                    <p className="text-gray-600 mb-6">
                      この記事では、UIデザインの基本的な考え方について学びます。
                      実践的な例を通じて、すぐに使えるスキルを身につけましょう。
                    </p>

                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                      <Play className="w-5 h-5" fill="white" />
                      {selectedArticle.completed ? 'もう一度見る' : '学習を始める'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-20">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>左のサイドバーから記事を選択してください</p>
                </div>
              )}
            </div>
          </div>

          {/* ナビゲーション */}
          {selectedArticle && (
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">前の記事</span>
              </button>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                次の記事
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white z-50">
        Idea 19: インタラクティブプレビュー
      </div>
    </div>
  );
};

export default LessonIdea19;
