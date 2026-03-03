/**
 * Idea 7: プロジェクトギャラリー
 * Skillshare スタイル - 学生作品を最初に見せるギャラリー型
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Heart,
  MessageCircle,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  Star,
  Image,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

// ダミーのプロジェクトギャラリーデータ
const studentProjects = [
  {
    id: 1,
    image: 'from-blue-400 to-indigo-500',
    author: 'Yuki T.',
    title: 'ECサイトのリデザイン',
    likes: 42,
  },
  {
    id: 2,
    image: 'from-pink-400 to-rose-500',
    author: 'Ken M.',
    title: 'タスク管理アプリUI',
    likes: 38,
  },
  {
    id: 3,
    image: 'from-green-400 to-emerald-500',
    author: 'Mika S.',
    title: 'フィットネスアプリ',
    likes: 56,
  },
  {
    id: 4,
    image: 'from-purple-400 to-violet-500',
    author: 'Taro Y.',
    title: 'ダッシュボードUI',
    likes: 29,
  },
  {
    id: 5,
    image: 'from-orange-400 to-amber-500',
    author: 'Hana K.',
    title: 'レシピアプリ',
    likes: 67,
  },
  {
    id: 6,
    image: 'from-cyan-400 to-blue-500',
    author: 'Sota N.',
    title: '天気アプリUI',
    likes: 44,
  },
];

const LessonIdea7 = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      {/* ヒーロー - プロジェクトギャラリー */}
      <section className="py-10 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-500 mb-2 flex items-center justify-center gap-2">
              <Image className="w-4 h-4" />
              このレッスンで作れるもの
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-rounded-mplus">
              受講生の作品を見る
            </h1>
          </div>

          {/* プロジェクトグリッド */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {studentProjects.map((project) => (
              <div
                key={project.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* 背景（実際は画像） */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.image}`}
                ></div>

                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* 情報 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white font-medium text-sm mb-1">
                    {project.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs">{project.author}</span>
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Heart className="w-3 h-3" />
                      {project.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Users className="w-4 h-4 inline mr-1.5" />
            このレッスンを受講した1,234人が作品を投稿しました
          </p>
        </div>
      </section>

      {/* レッスン情報 */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            {/* メイン情報 */}
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-rounded-mplus">
                {lessonData.title}
              </h2>
              <p className="text-gray-600 mb-6">{lessonData.description}</p>

              {/* 講師 */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
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
                <button className="ml-auto text-sm text-blue-600 hover:underline">
                  プロフィールを見る
                </button>
              </div>

              {/* 学べること */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">学べること</h3>
                <ul className="space-y-2">
                  {lessonData.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* サイドバー */}
            <div className="md:col-span-2">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-5 shadow-lg">
                {/* プレビュー動画 */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-4 cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* 統計 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      {lessonData.totalArticles}
                    </p>
                    <p className="text-xs text-gray-500">レッスン</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">60</p>
                    <p className="text-xs text-gray-500">分</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      {lessonData.difficulty}
                    </p>
                    <p className="text-xs text-gray-500">難易度</p>
                  </div>
                </div>

                {/* 進捗 */}
                {lessonData.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">進捗</span>
                      <span className="font-medium text-gray-900">
                        {lessonData.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${lessonData.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                  <Play className="w-5 h-5" fill="white" />
                  {getCTAText()}
                </button>

                {/* コミュニティ */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      ディスカッション
                    </span>
                    <span className="text-gray-500">156件</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* レッスン構成 */}
      <section className="py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-rounded-mplus">
            レッスン構成
          </h2>
          <div className="space-y-4">
            {lessonData.quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {quest.articles.length}レッスン •{' '}
                        {quest.articles.reduce((acc, a) => {
                          const mins = parseInt(a.duration);
                          return acc + (isNaN(mins) ? 0 : mins);
                        }, 0)}
                        分
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {quest.completed && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          完了
                        </span>
                      )}
                      <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* コミュニティプロジェクト */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-rounded-mplus">
              受講生の作品をもっと見る
            </h2>
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              すべて見る
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {studentProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.image}`}
                ></div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">{project.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 7: プロジェクトギャラリー
      </div>
    </div>
  );
};

export default LessonIdea7;
