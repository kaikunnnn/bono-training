/**
 * Idea 16: フレームワーク図解
 * レッスンの全体構造を図解で見せるUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  ArrowRight,
  Eye,
  Pencil,
  Code,
  RefreshCw,
  Check,
  Clock,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const framework = [
  {
    id: 'understand',
    title: '理解',
    subtitle: 'Understand',
    description: '何をデザインするか明確にする',
    icon: Eye,
    color: 'blue',
    skills: ['ユーザー理解', '要件整理', '目標設定'],
  },
  {
    id: 'design',
    title: '設計',
    subtitle: 'Design',
    description: '構造とレイアウトを考える',
    icon: Pencil,
    color: 'purple',
    skills: ['情報設計', 'ワイヤーフレーム', 'UI構造'],
  },
  {
    id: 'implement',
    title: '実装',
    subtitle: 'Implement',
    description: 'ビジュアルを作り込む',
    icon: Code,
    color: 'green',
    skills: ['配色', 'タイポグラフィ', 'ビジュアル'],
  },
  {
    id: 'validate',
    title: '検証',
    subtitle: 'Validate',
    description: 'フィードバックを得て改善する',
    icon: RefreshCw,
    color: 'orange',
    skills: ['レビュー', 'フィードバック', '改善'],
  },
];

const LessonIdea16 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
      <header className="py-10 px-4 sm:px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-rounded-mplus">
            {lessonData.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {lessonData.description}
          </p>
        </div>
      </header>

      {/* フレームワーク図解 */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10 font-rounded-mplus">
            UIデザインサイクル フレームワーク
          </h2>

          {/* サイクル図 */}
          <div className="relative mb-16">
            {/* 中央のサイクル表示 */}
            <div className="hidden sm:flex items-center justify-center mb-8">
              <div className="relative w-80 h-80">
                {/* 矢印サークル（概念的な表現） */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-200"></div>

                {/* 各ステップ */}
                {framework.map((step, i) => {
                  const angle = (i * 90 - 45) * (Math.PI / 180);
                  const radius = 140;
                  const x = Math.cos(angle) * radius + 160;
                  const y = Math.sin(angle) * radius + 160;

                  const bgColors: Record<string, string> = {
                    blue: 'bg-blue-500',
                    purple: 'bg-purple-500',
                    green: 'bg-green-500',
                    orange: 'bg-orange-500',
                  };

                  return (
                    <div
                      key={step.id}
                      className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: x, top: y }}
                    >
                      <div
                        className={`w-full h-full rounded-2xl ${bgColors[step.color]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <step.icon className="w-8 h-8" />
                      </div>
                      <p className="text-center text-sm font-bold mt-2 text-gray-900">
                        {step.title}
                      </p>
                    </div>
                  );
                })}

                {/* 中央ラベル */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">4ステップ</p>
                    <p className="font-bold text-gray-900">サイクル</p>
                  </div>
                </div>
              </div>
            </div>

            {/* モバイル用リニア表示 */}
            <div className="sm:hidden space-y-4">
              {framework.map((step, i) => {
                const bgColors: Record<string, string> = {
                  blue: 'bg-blue-500',
                  purple: 'bg-purple-500',
                  green: 'bg-green-500',
                  orange: 'bg-orange-500',
                };

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${bgColors[step.color]} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 詳細カード */}
          <div className="grid sm:grid-cols-2 gap-6">
            {framework.map((step) => {
              const borderColors: Record<string, string> = {
                blue: 'border-blue-200',
                purple: 'border-purple-200',
                green: 'border-green-200',
                orange: 'border-orange-200',
              };
              const bgColors: Record<string, string> = {
                blue: 'bg-blue-50',
                purple: 'bg-purple-50',
                green: 'bg-green-50',
                orange: 'bg-orange-50',
              };
              const textColors: Record<string, string> = {
                blue: 'text-blue-600',
                purple: 'text-purple-600',
                green: 'text-green-600',
                orange: 'text-orange-600',
              };
              const iconBgColors: Record<string, string> = {
                blue: 'bg-blue-500',
                purple: 'bg-purple-500',
                green: 'bg-green-500',
                orange: 'bg-orange-500',
              };

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border-2 ${borderColors[step.color]} ${bgColors[step.color]} p-6`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${iconBgColors[step.color]} flex items-center justify-center text-white`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{step.title}</h3>
                      <p className={`text-xs ${textColors[step.color]}`}>
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white px-2 py-1 rounded-full text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* レッスン構成 */}
      <section className="py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-rounded-mplus">
            レッスン構成
          </h2>
          <div className="space-y-4">
            {lessonData.quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-5 rounded-2xl border ${
                  quest.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        quest.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {quest.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        quest.number
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{quest.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{quest.articles.length}記事</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          約20分
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-12 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 font-rounded-mplus">
            フレームワークを身につける
          </h2>
          <p className="text-blue-100 mb-8">
            4つのステップで、再現性のあるデザインプロセスを習得しましょう
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
        Idea 16: フレームワーク図解
      </div>
    </div>
  );
};

export default LessonIdea16;
