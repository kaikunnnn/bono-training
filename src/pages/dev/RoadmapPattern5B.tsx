/**
 * RoadmapPattern5B: 「変化ストーリー型」
 *
 * コンセプト: Before→Afterの変化を強調、各ステップは変化のマイルストーン
 *
 * Airbnb的発想:
 * - 「あなたはここからここへ行く」という変化の旅
 * - 各ステップは変化の途中経過点
 * - 感情的なつながりを重視
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Zap,
  Clock,
  PlayCircle,
  BookOpen,
  Target,
  ChevronRight
} from 'lucide-react';

// モックデータ
const courseData = {
  title: 'UIビジュアル基礎コース',

  // Before/After（変化のストーリー）
  transformation: {
    before: {
      label: '今のあなた',
      states: [
        '「なんかダサい」の原因がわからない',
        '参考デザインを見ても活かし方がわからない',
        '毎回ゼロから手探りで作っている',
      ],
    },
    after: {
      label: 'コース後のあなた',
      states: [
        'デザインの良し悪しを言語化できる',
        '参考から要素を抽出して再利用できる',
        '基本ルールに沿って効率的に作れる',
      ],
    },
  },

  // 各ステップ（変化のマイルストーン）
  milestones: [
    {
      number: 1,
      change: '「なんとなく」から「論理的に」',
      title: '上達の進め方を知る',
      description: 'デザインは感覚ではなくプロセス。正しい学び方を知ることで、成長スピードが変わる。',
      duration: '30分',
      contents: [
        { type: 'video', title: '上達するデザインの進め方' },
        { type: 'article', title: 'インプット/アウトプット比率' },
      ],
    },
    {
      number: 2,
      change: '「見るだけ」から「盗める」へ',
      title: '参考から学ぶ技術',
      description: '良いデザインを見て「いいな」で終わらない。分解して、抽出して、自分のものにする。',
      duration: '2時間',
      contents: [
        { type: 'video', title: '参考デザインの探し方' },
        { type: 'video', title: 'デザインの分解と抽出' },
        { type: 'challenge', title: '3つの参考を分析' },
      ],
    },
    {
      number: 3,
      change: '「感覚」から「ルール」へ',
      title: 'UIの基礎要素を習得',
      description: '色、文字、余白。この3つの基本ルールを知るだけで、デザインの質が劇的に変わる。',
      duration: '3時間',
      contents: [
        { type: 'video', title: 'カラーの基本原則' },
        { type: 'video', title: 'タイポグラフィの基礎' },
        { type: 'video', title: '余白とレイアウト' },
        { type: 'challenge', title: 'カードUIを作る' },
      ],
    },
    {
      number: 4,
      change: '「学ぶ」から「作れる」へ',
      title: 'ゼロからデザインする',
      description: '学んだ全てを統合して、実際にアプリUIをゼロから作る。これができれば、基礎は完了。',
      duration: '4時間',
      isGoal: true,
      contents: [
        { type: 'video', title: 'デザインプロセス実演' },
        { type: 'challenge', title: 'ToDoアプリUIをデザイン' },
      ],
    },
  ],
};

export default function RoadmapPattern5B() {
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
            Pattern 5B: 変化ストーリー型
          </span>
        </div>
      </nav>

      {/* ========================================
          セクション1: Transformation（Before/After）
          変化を最初に見せる
      ======================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            {courseData.title}
          </h1>
          <p className="text-gray-500 text-center mb-12">
            約2-3週間で、あなたのデザインが変わる
          </p>

          {/* Before → After */}
          <div className="grid md:grid-cols-2 gap-6 relative">
            {/* Before */}
            <div className="bg-gray-100 rounded-2xl p-8">
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full mb-6">
                {courseData.transformation.before.label}
              </span>
              <ul className="space-y-4">
                {courseData.transformation.before.states.map((state, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    {state}
                  </li>
                ))}
              </ul>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="md:hidden flex justify-center -my-2">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                <ArrowDown className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* After */}
            <div className="bg-slate-900 rounded-2xl p-8">
              <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full mb-6">
                {courseData.transformation.after.label}
              </span>
              <ul className="space-y-4">
                {courseData.transformation.after.states.map((state, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {state}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          セクション2: Milestones（変化のマイルストーン）
          各ステップで何が変わるか
      ======================================== */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8 text-center">
            変化の道のり
          </h2>

          <div className="relative">
            {/* 縦線 */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />

            <div className="space-y-8">
              {courseData.milestones.map((milestone, idx) => (
                <div key={milestone.number} className="relative">
                  {/* ステップカード */}
                  <div className={`
                    ml-12 md:ml-0 md:w-[calc(50%-2rem)]
                    ${idx % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}
                    bg-white rounded-xl border border-gray-200 overflow-hidden
                    ${milestone.isGoal ? 'ring-2 ring-slate-900' : ''}
                  `}>
                    {/* 変化のヘッドライン */}
                    <div className={`
                      px-5 py-3 border-b
                      ${milestone.isGoal ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100'}
                    `}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${milestone.isGoal ? 'text-white/50' : 'text-gray-400'}`}>
                          STEP {milestone.number}
                        </span>
                        {milestone.isGoal && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">
                            GOAL
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-bold mt-1 ${milestone.isGoal ? 'text-emerald-400' : 'text-blue-600'}`}>
                        {milestone.change}
                      </p>
                    </div>

                    {/* コンテンツ */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                        {milestone.description}
                      </p>

                      {/* コンテンツリスト（コンパクト） */}
                      <div className="flex flex-wrap gap-2">
                        {milestone.contents.map((content, cIdx) => (
                          <span
                            key={cIdx}
                            className={`
                              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                              ${content.type === 'video' ? 'bg-blue-50 text-blue-700' :
                                content.type === 'challenge' ? 'bg-orange-50 text-orange-700' :
                                'bg-gray-100 text-gray-700'}
                            `}
                          >
                            {content.type === 'video' ? <PlayCircle className="w-3 h-3" /> :
                             content.type === 'challenge' ? <Target className="w-3 h-3" /> :
                             <BookOpen className="w-3 h-3" />}
                            {content.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 時間 */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {milestone.duration}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>

                  {/* ドット */}
                  <div className={`
                    absolute left-6 md:left-1/2 top-8 -translate-x-1/2
                    w-4 h-4 rounded-full border-4 border-white
                    ${milestone.isGoal ? 'bg-emerald-500' : 'bg-blue-500'}
                  `} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          セクション3: CTA
      ======================================== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            変化への第一歩を踏み出す
          </h2>
          <p className="text-gray-500 mb-8">
            約2-3週間後、あなたのデザインは確実に変わっている
          </p>
          <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            コースを始める
          </button>
        </div>
      </section>
    </div>
  );
}
