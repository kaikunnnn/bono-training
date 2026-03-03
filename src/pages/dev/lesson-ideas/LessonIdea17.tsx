/**
 * Idea 17: 難易度選択
 * 学習者のレベルに応じたパス選択UI
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  ArrowRight,
  Zap,
  Rocket,
  GraduationCap,
  Check,
  Clock,
  BookOpen,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const learningPaths = [
  {
    id: 'beginner',
    title: 'じっくり学ぶ',
    subtitle: 'ビギナーコース',
    icon: BookOpen,
    description: '基礎からしっかり理解したい方向け。全ての記事を順番に学習します。',
    duration: '約60分',
    articles: 12,
    features: ['全12記事を順番に学習', '実践課題付き', '復習セクション含む'],
    color: 'green',
    recommended: false,
  },
  {
    id: 'standard',
    title: 'バランスよく',
    subtitle: 'スタンダードコース',
    icon: Zap,
    description: '効率よく学びたい方向け。重要なポイントを押さえて学習します。',
    duration: '約40分',
    articles: 8,
    features: ['重要ポイントに絞った学習', '実践課題あり', '時間効率が良い'],
    color: 'blue',
    recommended: true,
  },
  {
    id: 'fast',
    title: 'サクッと学ぶ',
    subtitle: 'エクスプレスコース',
    icon: Rocket,
    description: '経験者・時間がない方向け。エッセンスだけを効率的に学習します。',
    duration: '約20分',
    articles: 4,
    features: ['核心部分のみ', '上級者向け', '最短で完了'],
    color: 'purple',
    recommended: false,
  },
];

const LessonIdea17 = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const colorClasses: Record<string, { bg: string; border: string; text: string; button: string }> = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      button: 'bg-green-500 hover:bg-green-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      button: 'bg-purple-500 hover:bg-purple-600',
    },
  };

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
          <span className="text-sm text-gray-500">{lessonData.category}</span>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="py-10 px-4 sm:px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-rounded-mplus">
            {lessonData.title}
          </h1>
          <p className="text-gray-600 mb-6">{lessonData.description}</p>
          <p className="text-lg font-medium text-gray-900">
            あなたに合った学習スタイルを選んでください
          </p>
        </div>
      </header>

      {/* パス選択 */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {learningPaths.map((path) => {
              const isSelected = selectedPath === path.id;
              const colors = colorClasses[path.color];

              return (
                <div
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 transition-all ${
                    isSelected
                      ? `${colors.border} ${colors.bg} ring-4 ring-${path.color}-100`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {path.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`${colors.text} bg-white text-xs font-bold px-3 py-1 rounded-full border ${colors.border}`}>
                        おすすめ
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* アイコン */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                        isSelected ? colors.button : 'bg-gray-100'
                      }`}
                    >
                      <path.icon
                        className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                      />
                    </div>

                    {/* タイトル */}
                    <p className={`text-xs font-medium mb-1 ${colors.text}`}>
                      {path.subtitle}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {path.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {path.description}
                    </p>

                    {/* メタ情報 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.duration}
                      </span>
                      <span>{path.articles}記事</span>
                    </div>

                    {/* 特徴 */}
                    <ul className="space-y-2">
                      {path.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check
                            className={`w-4 h-4 ${colors.text}`}
                            strokeWidth={3}
                          />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 選択インジケーター */}
                  {isSelected && (
                    <div className={`px-6 py-3 border-t ${colors.border} ${colors.bg}`}>
                      <p className={`text-sm font-medium text-center ${colors.text}`}>
                        このコースを選択中
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 講師情報 */}
      <section className="py-8 px-4 sm:px-6 bg-white border-t border-gray-100">
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

      {/* CTA */}
      {selectedPath && (
        <section className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {learningPaths.find((p) => p.id === selectedPath)?.title}を選択中
              </p>
              <p className="text-sm text-gray-500">
                {learningPaths.find((p) => p.id === selectedPath)?.duration} •{' '}
                {learningPaths.find((p) => p.id === selectedPath)?.articles}記事
              </p>
            </div>
            <button
              className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-colors ${
                colorClasses[
                  learningPaths.find((p) => p.id === selectedPath)?.color || 'blue'
                ].button
              }`}
            >
              <Play className="w-5 h-5" fill="white" />
              {getCTAText()}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* 選択前のCTA */}
      {!selectedPath && (
        <section className="sticky bottom-0 bg-gray-100 border-t border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500">
              上のコースから1つ選んでください
            </p>
          </div>
        </section>
      )}

      {/* アイデア情報 */}
      <div className="fixed top-20 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 17: 難易度選択
      </div>
    </div>
  );
};

export default LessonIdea17;
