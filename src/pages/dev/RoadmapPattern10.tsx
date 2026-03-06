/**
 * RoadmapPattern10: 読み物型ロードマップ（検討段階ユーザー対応）
 *
 * ユーザーの状態:
 * - 「これは私に必要かも？」と考え中
 * - 何が可能になるかを知りたい
 * - 必要だと思ったら、どう進めるか知りたい
 *
 * 構造:
 * 1. タイトル + 誰向けか（タグ）
 * 2. このロードマップで得られること
 * 3. ロードマップの全体像
 * 4. 各ステップの詳細
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, FileText, Pencil, ChevronRight, Check } from 'lucide-react';

const courseData = {
  title: 'UIビジュアル基礎',
  subtitle: 'UI初心者が、使いやすい操作体験をつくるための基礎を身につけるロードマップ',
  duration: '2-3週間',

  // 誰向けか（タグ）
  tags: ['未経験', 'ジュニアデザイナー', 'UIづくりの基本', 'デザイン原則'],

  // このロードマップで得られること
  outcomes: [
    'UIの"ふつう"を知ることで自然な操作体験をつくれる',
    '"つくる"基本の進め方で、正しい制作を学べる',
    'つくることで正しいUIを考える思考力が身につく',
    'AIのアウトプットを判断するために基礎表現スキルが必要',
  ],

  // ステップ概要（全体像用）
  stepsOverview: [
    { number: 1, title: '進め方を知る', description: 'デザイン上達の正しいプロセスを理解する' },
    { number: 2, title: '参考を盗む', description: '良いデザインから要素を抽出する技術' },
    { number: 3, title: 'UIの基礎要素', description: '色・タイポ・余白のルールを習得' },
    { number: 4, title: 'ゼロから作る', description: '白紙からUIをデザインする', isGoal: true },
  ],

  // ステップ詳細
  steps: [
    {
      number: 1,
      title: '進め方を知る',
      duration: '30分',
      intro: `まず、デザインの学び方そのものを理解します。`,
      body: `多くの人は「とりあえず作る」ところから始めます。でも、それだと上達に時間がかかる。

プロのデザイナーがどう学んできたかを知ることで、遠回りを防ぎます。このステップは短いですが、コース全体の土台になります。`,
      contents: [
        { type: 'video', title: '上達するデザインの進め方', duration: '15分' },
        { type: 'article', title: 'インプットとアウトプットの比率', duration: '10分' },
      ],
      outcome: 'デザイン上達の正しいプロセスがわかる',
    },
    {
      number: 2,
      title: '参考を盗む',
      duration: '2時間',
      intro: `次に、良いデザインから学ぶ技術を身につけます。`,
      body: `「いいデザインだな」と思っても、それを自分のデザインに活かせないことがあります。

それは、見ているだけで「分解」していないから。このステップでは、参考デザインを要素に分解し、言語化し、自分の引き出しにする方法を学びます。

ここで身につけた技術は、このコースが終わった後もずっと使えます。`,
      contents: [
        { type: 'video', title: '参考デザインの探し方', duration: '20分' },
        { type: 'video', title: 'デザインの分解と抽出', duration: '30分' },
        { type: 'practice', title: '3つの参考を分析してみる', duration: '60分' },
      ],
      outcome: '参考から要素を抽出して言語化できる',
    },
    {
      number: 3,
      title: 'UIの基礎要素',
      duration: '3時間',
      intro: `いよいよ、UIデザインの核心に入ります。`,
      body: `色、文字、余白。UIデザインの8割は、この3つで決まります。

それぞれに明確なルールがあります。「なんとなく」で決めていたものを、「理由を持って」決められるようになる。これがこのステップのゴールです。

動画で原則を学んだら、実際にカードUIを作って手を動かします。`,
      contents: [
        { type: 'video', title: 'カラーの基本原則', duration: '25分' },
        { type: 'video', title: 'タイポグラフィの基礎', duration: '30分' },
        { type: 'video', title: '余白とレイアウト', duration: '25分' },
        { type: 'practice', title: 'カードUIを作る', duration: '90分' },
      ],
      outcome: '色・タイポ・余白をルールで決められる',
    },
    {
      number: 4,
      title: 'ゼロから作る',
      duration: '4時間',
      intro: `最後に、学んだすべてを統合します。`,
      body: `ここまでで学んだことを使って、白紙の状態からUIをデザインします。

お題はシンプルなToDoアプリ。参考を探すところから始めて、色、文字、余白を決めて、完成まで持っていきます。

このステップを終えたとき、あなたは「なんとなく」ではなく「理由を持って」デザインできるようになっています。`,
      contents: [
        { type: 'video', title: 'デザインプロセスの実演', duration: '40分' },
        { type: 'practice', title: 'ToDoアプリのUIをデザイン', duration: '3時間' },
      ],
      outcome: '白紙からUIをデザインできる',
      isGoal: true,
    },
  ],
};

const ContentIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video':
      return <Play className="w-4 h-4" />;
    case 'article':
      return <FileText className="w-4 h-4" />;
    case 'practice':
      return <Pencil className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const contentTypeLabel = (type: string) => {
  switch (type) {
    case 'video':
      return '動画';
    case 'article':
      return '記事';
    case 'practice':
      return '実践';
    default:
      return type;
  }
};

export default function RoadmapPattern10() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Breadcrumb */}
      <nav className="sticky top-0 z-40 bg-[#F9F9F7]/90 backdrop-blur-sm border-b border-gray-200">
        <div className="px-6 lg:px-10 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/dev/roadmap-patterns" className="hover:text-gray-900 transition-colors">
              コース一覧
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{courseData.title}</span>
          </div>
        </div>
      </nav>

      <div className="px-6 lg:px-10 py-10">
        <div className="max-w-3xl">

          {/* ============================================
              1. タイトル + 誰向けか（タグ）
          ============================================ */}
          <header className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {courseData.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {courseData.subtitle}
            </p>

            {/* タグ */}
            <div className="flex flex-wrap gap-2 mb-4">
              {courseData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 所要時間 */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>目安: {courseData.duration}</span>
            </div>
          </header>

          {/* ============================================
              2. このロードマップで得られること
          ============================================ */}
          <section className="mb-10 p-6 lg:p-8 bg-white rounded-2xl border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              このロードマップで得られること
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {courseData.outcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {outcome}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================
              3. ロードマップの全体像
          ============================================ */}
          <section className="mb-10 p-6 lg:p-8 bg-white rounded-2xl border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              ロードマップの全体像
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {courseData.subtitle}
            </p>

            <div className="space-y-3">
              {courseData.stepsOverview.map((step) => (
                <div
                  key={step.number}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer
                    ${step.isGoal
                      ? 'bg-gray-900 border-gray-900'
                      : 'bg-gray-50 border-gray-100 hover:border-gray-300'
                    }
                  `}
                >
                  <span className={`
                    text-sm font-mono font-bold
                    ${step.isGoal ? 'text-gray-500' : 'text-gray-400'}
                  `}>
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${step.isGoal ? 'text-white' : 'text-gray-900'}`}>
                      {step.title}
                    </p>
                    <p className={`text-sm ${step.isGoal ? 'text-gray-400' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  </div>
                  {step.isGoal && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded">
                      GOAL
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ============================================
              4. 各ステップの詳細
          ============================================ */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              各ステップの詳細
            </h2>

            {courseData.steps.map((step, stepIdx) => (
              <article
                key={step.number}
                className="mb-8 last:mb-0 p-6 lg:p-8 bg-white rounded-2xl border border-gray-200"
              >
                {/* Step Header */}
                <header className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-400">
                      Step {String(step.number).padStart(2, '0')}
                    </span>
                    {step.isGoal && (
                      <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded">
                        GOAL
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500">{step.duration}</p>
                </header>

                {/* Step Body */}
                <div className="mb-6">
                  <p className="text-gray-900 font-medium mb-3">
                    {step.intro}
                  </p>
                  {step.body.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-600 leading-relaxed mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Contents List */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    このステップの内容
                  </p>
                  <div className="space-y-2">
                    {step.contents.map((content, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${content.type === 'video' ? 'bg-blue-100 text-blue-600' :
                            content.type === 'practice' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-200 text-gray-600'}
                        `}>
                          <ContentIcon type={content.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm group-hover:text-blue-600 transition-colors">
                            {content.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {contentTypeLabel(content.type)} · {content.duration}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outcome */}
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    このステップを終えると
                  </p>
                  <p className="text-white font-medium text-sm">
                    {step.outcome}
                  </p>
                </div>
              </article>
            ))}
          </section>

          {/* CTA */}
          <section className="mt-10">
            <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
              Step 01 から始める
            </button>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 lg:px-10 border-t border-gray-200">
        <p className="text-sm text-gray-400">
          {courseData.title}
        </p>
      </footer>
    </div>
  );
}
