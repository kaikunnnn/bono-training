/**
 * RoadmapPattern5A: 「目的地逆算型」
 *
 * コンセプト: ゴール（なれる自分）を最初に大きく見せ、そこへの道筋を提示
 *
 * Airbnb的発想:
 * - 「こういう体験ができる」を最初に約束
 * - その約束を果たすための旅程を見せる
 * - 各ステップは「ゴールに近づく一歩」として位置づけ
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  CheckCircle2,
  Circle,
  Sparkles,
  Clock,
  BookOpen,
  PlayCircle
} from 'lucide-react';

// モックデータ：UIビジュアル基礎コース
const courseData = {
  title: 'UIビジュアル基礎コース',
  tagline: 'デザインの「見た目」を自信を持って作れるようになる',

  // ゴール（Promise）- 最初に見せる
  promise: {
    headline: 'このコースを終えると、あなたは',
    outcomes: [
      'プロのデザインを見て「なぜ良いか」を言語化できる',
      '参考デザインから要素を抽出して自分の制作に活かせる',
      'UIの基本ルールに沿った美しいデザインを作れる',
    ],
  },

  // 全体の道のり
  journey: {
    duration: '約2-3週間',
    steps: [
      {
        number: 1,
        title: '進め方を知る',
        outcome: 'デザイン上達の正しいプロセスを習得',
        duration: '30分',
        contents: [
          { type: 'video', title: '上達するデザインの進め方', duration: '15分' },
          { type: 'article', title: 'インプットとアウトプットの黄金比', duration: '10分' },
        ],
      },
      {
        number: 2,
        title: '参考を盗む',
        outcome: '良いデザインから学ぶ技術を習得',
        duration: '2時間',
        contents: [
          { type: 'video', title: '参考デザインの探し方', duration: '20分' },
          { type: 'video', title: 'デザインの分解と抽出', duration: '30分' },
          { type: 'challenge', title: '実際に3つの参考を分析してみよう', duration: '60分' },
        ],
      },
      {
        number: 3,
        title: 'UIの基礎要素',
        outcome: '色・タイポ・余白の基本を習得',
        duration: '3時間',
        contents: [
          { type: 'video', title: 'カラーの基本原則', duration: '25分' },
          { type: 'video', title: 'タイポグラフィの基礎', duration: '30分' },
          { type: 'video', title: '余白とレイアウト', duration: '25分' },
          { type: 'challenge', title: '基本要素を使ってカードUIを作る', duration: '90分' },
        ],
      },
      {
        number: 4,
        title: 'ゼロから作る',
        outcome: '学んだことを統合して実践',
        duration: '4時間',
        isGoal: true,
        contents: [
          { type: 'video', title: 'デザインプロセスの実演', duration: '40分' },
          { type: 'challenge', title: 'ToDoアプリのUIをゼロからデザイン', duration: '3時間' },
        ],
      },
    ],
  },
};

export default function RoadmapPattern5A() {
  return (
    <div className="min-h-screen bg-white">
      {/* ナビ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/dev/roadmap-patterns"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Link>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Pattern 5A: 目的地逆算型
          </span>
        </div>
      </nav>

      {/* ========================================
          セクション1: Promise（約束）
          ゴールを最初に大きく見せる
      ======================================== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          {/* コースタイトル */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs mb-4">
              <Sparkles className="w-3 h-3" />
              ロードマップコース
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {courseData.title}
            </h1>
            <p className="text-lg text-white/70">
              {courseData.tagline}
            </p>
          </div>

          {/* Promise: このコースを終えると */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 md:p-10 border border-white/10">
            <p className="text-white/60 text-sm mb-6">
              {courseData.promise.headline}
            </p>
            <ul className="space-y-4">
              {courseData.promise.outcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-white text-lg font-medium leading-relaxed">
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 期間 */}
          <div className="mt-8 flex items-center gap-6 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {courseData.journey.duration}
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {courseData.journey.steps.length}ステップ
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          セクション2: Journey Overview（道のり俯瞰）
          全体像を一目で把握
      ======================================== */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8">
            学習の道のり
          </h2>

          {/* 横並びステップ */}
          <div className="flex items-stretch gap-4 overflow-x-auto pb-4">
            {courseData.journey.steps.map((step, idx) => (
              <div
                key={step.number}
                className={`
                  flex-1 min-w-[200px] p-5 rounded-xl border-2 transition-all
                  ${step.isGoal
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold ${step.isGoal ? 'text-white/50' : 'text-gray-400'}`}>
                    STEP {step.number}
                  </span>
                  {step.isGoal && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">
                      GOAL
                    </span>
                  )}
                </div>
                <h3 className={`font-bold mb-2 ${step.isGoal ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${step.isGoal ? 'text-white/70' : 'text-gray-500'}`}>
                  {step.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          セクション3: Steps Detail（各ステップ詳細）
          コンパクトに、でも必要な情報は全て
      ======================================== */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {courseData.journey.steps.map((step, idx) => (
              <div
                key={step.number}
                className={`
                  rounded-2xl overflow-hidden border
                  ${step.isGoal ? 'border-slate-900 bg-slate-50' : 'border-gray-200 bg-white'}
                `}
              >
                {/* ステップヘッダー */}
                <div className={`
                  px-6 py-5 flex items-center justify-between
                  ${step.isGoal ? 'bg-slate-900 text-white' : 'bg-gray-50'}
                `}>
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${step.isGoal ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-600'}
                    `}>
                      {step.number}
                    </div>
                    <div>
                      <h3 className={`font-bold ${step.isGoal ? 'text-white' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${step.isGoal ? 'text-white/70' : 'text-gray-500'}`}>
                        {step.outcome}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm ${step.isGoal ? 'text-white/50' : 'text-gray-400'}`}>
                    {step.duration}
                  </span>
                </div>

                {/* コンテンツリスト */}
                <div className="divide-y divide-gray-100">
                  {step.contents.map((content, cIdx) => (
                    <div
                      key={cIdx}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer group"
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${content.type === 'video' ? 'bg-blue-100 text-blue-600' :
                          content.type === 'challenge' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'}
                      `}>
                        {content.type === 'video' ? <PlayCircle className="w-4 h-4" /> :
                         content.type === 'challenge' ? <Target className="w-4 h-4" /> :
                         <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                          {content.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{content.duration}</span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          セクション4: 次へ
      ======================================== */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 mb-6">
            このコースを完了したら
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            次のステップへ進む準備ができます
          </h2>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              コースを始める
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
