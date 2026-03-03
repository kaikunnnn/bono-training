/**
 * Idea 2: ゴール設定ファースト
 * Notion/Duolingo スタイル - 最初にゴール選択、パーソナライズ体験
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Lightbulb,
  Briefcase,
  Palette,
  ArrowRight,
  ChevronLeft,
  Check,
  Clock,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const goals = [
  {
    id: 'career',
    icon: <Briefcase className="w-6 h-6" />,
    title: 'デザイナーになりたい',
    description: '転職・キャリアチェンジを目指している',
    highlight: ['デザインサイクルの概念', '実務での活用法'],
  },
  {
    id: 'skill',
    icon: <Palette className="w-6 h-6" />,
    title: 'スキルを上げたい',
    description: '今の仕事でデザイン力を活かしたい',
    highlight: ['ワイヤーフレームを作る', 'ビジュアルデザイン'],
  },
  {
    id: 'hobby',
    icon: <Lightbulb className="w-6 h-6" />,
    title: '趣味として学びたい',
    description: '教養として楽しく学習したい',
    highlight: ['UIデザインとは何か', '4つのステップを知る'],
  },
];

const LessonIdea2 = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setTimeout(() => setShowContent(true), 500);
  };

  const selectedGoalData = goals.find((g) => g.id === selectedGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <span className="text-sm text-gray-400">{lessonData.category}</span>
        </div>
      </nav>

      {!showContent ? (
        /* ゴール選択画面 */
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-6">
              <Target className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-rounded-mplus">
              まず、あなたの目標を教えてください
            </h1>
            <p className="text-gray-500">
              目標に合わせて学習をパーソナライズします
            </p>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal.id)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                  selectedGoal === goal.id
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/20'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedGoal === goal.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {goal.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                  {selectedGoal === goal.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* パーソナライズされたコンテンツ */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* パーソナライズヘッダー */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white mb-8">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              あなたの目標に最適化
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 font-rounded-mplus">
              {lessonData.title}
            </h1>
            <p className="text-blue-100 mb-6">{lessonData.description}</p>

            {/* 目標バッジ */}
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm">
              {selectedGoalData?.icon}
              <span>{selectedGoalData?.title}</span>
            </div>
          </div>

          {/* メタ情報 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">所要時間</p>
              <p className="font-bold text-gray-900">{lessonData.totalDuration}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">記事数</p>
              <p className="font-bold text-gray-900">{lessonData.totalArticles}記事</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <Target className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">難易度</p>
              <p className="font-bold text-gray-900">{lessonData.difficulty}</p>
            </div>
          </div>

          {/* おすすめコンテンツ */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              あなたにおすすめのコンテンツ
            </h2>
            <div className="space-y-2">
              {selectedGoalData?.highlight.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* クエスト一覧 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 font-rounded-mplus">
              レッスン構成
            </h2>
            <div className="space-y-4">
              {lessonData.quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`bg-white rounded-2xl border p-5 ${
                    quest.completed
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        quest.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {quest.completed ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        quest.number
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{quest.title}</h3>
                      <p className="text-sm text-gray-500">
                        {quest.articles.length}記事
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-14">
                    {quest.description}
                  </p>

                  {/* ハイライト表示 */}
                  {selectedGoalData?.highlight.some((h) =>
                    quest.articles.some((a) => a.title === h)
                  ) && (
                    <div className="mt-3 ml-14">
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        おすすめ
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="sticky bottom-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">進捗 {lessonData.progress}%</p>
                <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${lessonData.progress}%` }}
                  ></div>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
                {getCTAText()}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 2: ゴール設定ファースト
      </div>
    </div>
  );
};

export default LessonIdea2;
