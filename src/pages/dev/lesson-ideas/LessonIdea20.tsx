/**
 * Idea 20: 感情ジャーニー型
 * 学習者の感情に寄り添うエモーショナルなUI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  ArrowRight,
  Heart,
  Sparkles,
  Sun,
  Cloud,
  Smile,
  ThumbsUp,
  Rocket,
  Star,
  Check,
} from 'lucide-react';
import { lessonData, userProgress, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const emotionalStages = [
  {
    id: 'curious',
    emoji: '🤔',
    feeling: '興味津々',
    message: 'デザインって難しそう...',
    color: 'blue',
    icon: Cloud,
  },
  {
    id: 'learning',
    emoji: '💡',
    feeling: 'なるほど！',
    message: '理解できてきた！',
    color: 'yellow',
    icon: Sun,
  },
  {
    id: 'practicing',
    emoji: '🎨',
    feeling: 'やってみよう',
    message: '手を動かすのが楽しい',
    color: 'purple',
    icon: Sparkles,
  },
  {
    id: 'confident',
    emoji: '🚀',
    feeling: '自信がついた！',
    message: 'できるようになった！',
    color: 'green',
    icon: Rocket,
  },
];

const LessonIdea20 = () => {
  const currentStageIndex = Math.floor((lessonData.progress / 100) * emotionalStages.length);
  const currentStage = emotionalStages[Math.min(currentStageIndex, emotionalStages.length - 1)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-rose-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <Heart className="w-5 h-5 text-rose-400" />
        </div>
      </nav>

      {/* 感情ステータス */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">{currentStage.emoji}</div>
          <p className="text-lg text-gray-600 mb-2">今のあなた</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-rounded-mplus">
            「{currentStage.feeling}」
          </h1>
          <p className="text-gray-500">{currentStage.message}</p>
        </div>
      </section>

      {/* 感情ジャーニーマップ */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* 接続線 */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-yellow-400 to-green-400 rounded-full transition-all"
                style={{ width: `${lessonData.progress}%` }}
              ></div>
            </div>

            {/* ステージ */}
            <div className="relative flex justify-between">
              {emotionalStages.map((stage, i) => {
                const isPast = i < currentStageIndex;
                const isCurrent = i === currentStageIndex;

                const bgColors: Record<string, string> = {
                  blue: 'bg-blue-500',
                  yellow: 'bg-yellow-500',
                  purple: 'bg-purple-500',
                  green: 'bg-green-500',
                };

                return (
                  <div key={stage.id} className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 transition-all ${
                        isCurrent
                          ? `${bgColors[stage.color]} ring-4 ring-${stage.color}-200 scale-110`
                          : isPast
                          ? bgColors[stage.color]
                          : 'bg-gray-200'
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-8 h-8 text-white" />
                      ) : (
                        <span
                          className={`${
                            isCurrent || isPast ? '' : 'grayscale opacity-50'
                          }`}
                        >
                          {stage.emoji}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        isCurrent
                          ? 'text-gray-900'
                          : isPast
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {stage.feeling}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 励ましメッセージ */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-3xl p-6 border border-rose-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {lessonData.instructor.avatar}
              </div>
              <div>
                <p className="text-sm text-rose-600 font-medium mb-1">
                  {lessonData.instructor.name}からのメッセージ
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {lessonData.progress < 30
                    ? '始めることが一番大変。でも、ここまで来たあなたは素晴らしい。一緒に頑張りましょう！'
                    : lessonData.progress < 70
                    ? '順調に進んでいますね！この調子で続けていけば、必ずできるようになります。'
                    : 'もうすぐゴールです！ここまで来れたあなたは、もう立派なデザイナーの卵です。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* レッスン情報 */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center font-rounded-mplus">
            {lessonData.title}
          </h2>

          <div className="space-y-3">
            {lessonData.quests.map((quest, i) => {
              const stageColor = emotionalStages[Math.min(i, emotionalStages.length - 1)].color;
              const bgColors: Record<string, string> = {
                blue: 'bg-blue-50 border-blue-200',
                yellow: 'bg-yellow-50 border-yellow-200',
                purple: 'bg-purple-50 border-purple-200',
                green: 'bg-green-50 border-green-200',
              };
              const iconColors: Record<string, string> = {
                blue: 'bg-blue-500',
                yellow: 'bg-yellow-500',
                purple: 'bg-purple-500',
                green: 'bg-green-500',
              };

              return (
                <div
                  key={quest.id}
                  className={`rounded-2xl border p-4 ${
                    quest.completed
                      ? 'bg-green-50 border-green-200'
                      : bgColors[stageColor]
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        quest.completed ? 'bg-green-500' : iconColors[stageColor]
                      }`}
                    >
                      {quest.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{emotionalStages[Math.min(i, emotionalStages.length - 1)].emoji}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{quest.title}</h3>
                      <p className="text-sm text-gray-500">
                        {quest.articles.length}記事 • {quest.description}
                      </p>
                    </div>
                    {i === userProgress.currentQuestIndex && (
                      <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                        今ここ！
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* モチベーションブースト */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            あなたは{userProgress.streak}日連続で学習中！
          </div>
          <p className="text-gray-600">
            小さな積み重ねが、大きな変化を生みます 🌱
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-center text-white">
            <Smile className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 font-rounded-mplus">
              今日も一歩、前へ進もう
            </h2>
            <p className="text-rose-100 mb-6">
              完璧じゃなくていい。続けることが大切です。
            </p>
            <button className="inline-flex items-center gap-3 bg-white text-rose-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-50 transition-colors">
              <Play className="w-6 h-6" fill="currentColor" />
              {getCTAText()}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 20: 感情ジャーニー型
      </div>
    </div>
  );
};

export default LessonIdea20;
