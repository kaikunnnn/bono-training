/**
 * RoadmapPattern5C: 「スキルツリー型」
 *
 * コンセプト: 習得スキルを視覚的に可視化、各ステップでスキルをアンロック
 *
 * ゲーム的発想:
 * - スキルツリーで全体像を把握
 * - 各ステップで何が「解放」されるか明確
 * - 達成感を視覚化
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  PlayCircle,
  BookOpen,
  Target,
  Sparkles,
  Eye,
  Palette,
  Type,
  Layout,
  Layers
} from 'lucide-react';

// モックデータ
const courseData = {
  title: 'UIビジュアル基礎コース',
  tagline: 'このコースで解放されるスキル',

  // 習得スキル一覧（全体像）
  skills: [
    { id: 'process', name: 'デザインプロセス', icon: Layers, step: 1 },
    { id: 'reference', name: '参考活用力', icon: Eye, step: 2 },
    { id: 'color', name: 'カラー設計', icon: Palette, step: 3 },
    { id: 'typography', name: 'タイポグラフィ', icon: Type, step: 3 },
    { id: 'layout', name: 'レイアウト設計', icon: Layout, step: 3 },
    { id: 'integration', name: '統合制作力', icon: Sparkles, step: 4 },
  ],

  // ステップ
  steps: [
    {
      number: 1,
      title: '進め方を知る',
      unlocks: ['process'],
      description: 'デザイン上達の正しいプロセスを理解する',
      duration: '30分',
      contents: [
        { type: 'video', title: '上達するデザインの進め方', duration: '15分' },
        { type: 'article', title: 'インプットとアウトプットの比率', duration: '10分' },
      ],
    },
    {
      number: 2,
      title: '参考を盗む',
      unlocks: ['reference'],
      description: '良いデザインから学ぶ技術を身につける',
      duration: '2時間',
      contents: [
        { type: 'video', title: '参考デザインの探し方', duration: '20分' },
        { type: 'video', title: 'デザインの分解と抽出', duration: '30分' },
        { type: 'challenge', title: '3つの参考を分析してみよう', duration: '60分' },
      ],
    },
    {
      number: 3,
      title: 'UIの基礎要素',
      unlocks: ['color', 'typography', 'layout'],
      description: '色・タイポ・余白の基本ルールをマスター',
      duration: '3時間',
      contents: [
        { type: 'video', title: 'カラーの基本原則', duration: '25分' },
        { type: 'video', title: 'タイポグラフィの基礎', duration: '30分' },
        { type: 'video', title: '余白とレイアウト', duration: '25分' },
        { type: 'challenge', title: 'カードUIを作る', duration: '90分' },
      ],
    },
    {
      number: 4,
      title: 'ゼロから作る',
      unlocks: ['integration'],
      isGoal: true,
      description: '全スキルを統合してUIをデザインする',
      duration: '4時間',
      contents: [
        { type: 'video', title: 'デザインプロセスの実演', duration: '40分' },
        { type: 'challenge', title: 'ToDoアプリのUIをデザイン', duration: '3時間' },
      ],
    },
  ],
};

export default function RoadmapPattern5C() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  // どのスキルがどのステップで解放されるかをマップ
  const getSkillStatus = (skillId: string, currentStep: number) => {
    const skill = courseData.skills.find(s => s.id === skillId);
    if (!skill) return 'locked';
    if (skill.step < currentStep) return 'completed';
    if (skill.step === currentStep) return 'current';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ナビ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/dev/roadmap-patterns"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Link>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Pattern 5C: スキルツリー型
          </span>
        </div>
      </nav>

      {/* ========================================
          セクション1: スキルツリー（全体像）
      ======================================== */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {courseData.title}
            </h1>
            <p className="text-gray-500">
              {courseData.tagline}
            </p>
          </div>

          {/* スキルカード一覧 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {courseData.skills.map((skill) => {
              const Icon = skill.icon;
              const isLocked = skill.step > 1; // モック：Step1以降はロック表示

              return (
                <div
                  key={skill.id}
                  className={`
                    relative p-4 rounded-xl border-2 text-center transition-all
                    ${isLocked
                      ? 'bg-gray-100 border-gray-200 opacity-60'
                      : 'bg-white border-blue-200 shadow-sm'}
                  `}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <div className={`
                    w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center
                    ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={`text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                    {skill.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Step {skill.step}で解放
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================
          セクション2: ステップ詳細（アコーディオン）
      ======================================== */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
            学習ステップ
          </h2>

          <div className="space-y-4">
            {courseData.steps.map((step) => {
              const isExpanded = expandedStep === step.number;
              const unlockedSkills = courseData.skills.filter(s => step.unlocks.includes(s.id));

              return (
                <div
                  key={step.number}
                  className={`
                    bg-white rounded-xl border overflow-hidden transition-all
                    ${step.isGoal ? 'border-slate-900' : 'border-gray-200'}
                    ${isExpanded ? 'shadow-lg' : 'shadow-sm'}
                  `}
                >
                  {/* ヘッダー（クリックで展開） */}
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                    className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    {/* ステップ番号 */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${step.isGoal
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-600'}
                    `}>
                      {step.number}
                    </div>

                    {/* タイトル＆解放スキル */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{step.title}</h3>
                        {step.isGoal && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                            GOAL
                          </span>
                        )}
                      </div>
                      {/* 解放されるスキル */}
                      <div className="flex flex-wrap gap-1.5">
                        {unlockedSkills.map((skill) => {
                          const Icon = skill.icon;
                          return (
                            <span
                              key={skill.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              <Icon className="w-3 h-3" />
                              {skill.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* 時間 */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-sm text-gray-400">{step.duration}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* 展開コンテンツ */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <p className="text-gray-500 text-sm py-4">
                        {step.description}
                      </p>

                      <div className="space-y-2">
                        {step.contents.map((content, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
                          >
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                              ${content.type === 'video' ? 'bg-blue-100 text-blue-600' :
                                content.type === 'challenge' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-200 text-gray-600'}
                            `}>
                              {content.type === 'video' ? <PlayCircle className="w-4 h-4" /> :
                               content.type === 'challenge' ? <Target className="w-4 h-4" /> :
                               <BookOpen className="w-4 h-4" />}
                            </div>
                            <span className="flex-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                              {content.title}
                            </span>
                            <span className="text-sm text-gray-400">{content.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================
          セクション3: 完了後
      ======================================== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            すべてのスキルを解放する
          </h2>
          <p className="text-gray-500 mb-8">
            コース完了後、6つのスキルが使えるようになります
          </p>
          <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            コースを始める
          </button>
        </div>
      </section>
    </div>
  );
}
