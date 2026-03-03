/**
 * Idea 14: コミュニティ連携
 * Headspace/Discord スタイル - 他の学習者と繋がるUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  ArrowRight,
  Award,
  TrendingUp,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const communityStats = {
  learners: 1234,
  activeNow: 42,
  discussions: 156,
};

const recentDiscussions = [
  {
    id: 1,
    author: 'Yuki',
    avatar: 'Y',
    content: 'Quest 2のワイヤーフレーム課題、みなさんどのツール使ってますか？',
    replies: 12,
    likes: 24,
    time: '2時間前',
  },
  {
    id: 2,
    author: 'Ken',
    avatar: 'K',
    content: 'デザインサイクルの「検証」ステップが一番難しかった...',
    replies: 8,
    likes: 15,
    time: '5時間前',
  },
  {
    id: 3,
    author: 'Mika',
    avatar: 'M',
    content: '完了しました！🎉 BONOさんの説明わかりやすかったです',
    replies: 5,
    likes: 32,
    time: '1日前',
  },
];

const leaderboard = [
  { rank: 1, name: 'Sota', progress: 100, xp: 450 },
  { rank: 2, name: 'Hana', progress: 92, xp: 420 },
  { rank: 3, name: 'Taro', progress: 83, xp: 380 },
];

const LessonIdea14 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {communityStats.activeNow}人がオンライン
          </div>
        </div>
      </nav>

      {/* レッスンヘッダー */}
      <header className="bg-white py-8 px-4 sm:px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              UI
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">{lessonData.category}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 font-rounded-mplus">
                {lessonData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {communityStats.learners}人が学習中
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lessonData.totalDuration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="md:col-span-2 space-y-6">
            {/* 進捗 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">あなたの進捗</h2>
                <span className="text-sm font-medium text-purple-600">
                  {lessonData.progress}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${lessonData.progress}%` }}
                ></div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all">
                <Play className="w-5 h-5" fill="white" />
                {getCTAText()}
              </button>
            </div>

            {/* コミュニティディスカッション */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                  みんなの声
                </h2>
                <button className="text-sm text-purple-600 hover:underline">
                  すべて見る
                </button>
              </div>
              <div className="space-y-4">
                {recentDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                        {discussion.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {discussion.author}
                          </span>
                          <span className="text-xs text-gray-400">
                            {discussion.time}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {discussion.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {discussion.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {discussion.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 border border-purple-200 text-purple-600 px-4 py-3 rounded-xl font-medium hover:bg-purple-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
                質問・感想を投稿する
              </button>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* リーダーボード */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                今週のランキング
              </h2>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.rank === 1
                          ? 'bg-amber-100 text-amber-600'
                          : user.rank === 2
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.xp} XP</p>
                    </div>
                    <div className="text-xs text-gray-400">{user.progress}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 完了バッジ */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-bold text-gray-900">完了バッジ</p>
                  <p className="text-xs text-gray-600">
                    完了すると獲得できます
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                現在{communityStats.learners}人中328人が獲得済み
              </p>
            </div>

            {/* シェア */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-3">友達を招待</h2>
              <p className="text-sm text-gray-600 mb-4">
                一緒に学ぶともっと楽しい！
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                <Share2 className="w-4 h-4" />
                シェアする
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 14: コミュニティ連携
      </div>
    </div>
  );
};

export default LessonIdea14;
