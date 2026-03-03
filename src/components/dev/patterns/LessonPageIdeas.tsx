/**
 * LessonPageIdeas - レッスン詳細ページのデザインアイデア20選
 *
 * リサーチから抽出した知見を活かし、
 * 「情報提供」から「ワクワクするジャーニー」への変革を目指す
 * 各アイデアは実際のページレイアウトのプレビュー
 */

import React from 'react';
import {
  Play,
  Target,
  Image,
  Map,
  Zap,
  Sword,
  Users,
  Focus,
  User,
  Clock,
  CheckSquare,
  BookOpen,
  Timer,
  Heart,
  Star,
  Layers,
  Sliders,
  Award,
  MousePointer,
  Sparkles,
  ChevronRight,
  Check,
  ArrowRight,
} from 'lucide-react';

export interface PageIdeaData {
  id: string;
  number: number;
  title: string;
  description: string;
  insight: string; // リサーチからの知見
  reference: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

// ========================================
// Idea 1: シネマティック・イマーシブ
// ========================================
const CinematicImmersivePreview = () => (
  <div className="w-full max-w-md mx-auto">
    {/* フルスクリーン動画ヒーロー */}
    <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-t-2xl overflow-hidden aspect-video">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Play className="w-8 h-8 text-white ml-1" fill="white" fillOpacity={0.9} />
          </div>
          <p className="text-sm font-medium">30秒でわかる</p>
          <p className="text-xs text-white/60 mt-1">このレッスンの魅力</p>
        </div>
      </div>
      {/* 再生バー */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div className="h-full w-1/4 bg-training rounded-r-full"></div>
      </div>
    </div>
    {/* コンテンツ */}
    <div className="bg-white rounded-b-2xl p-4 border border-t-0 border-lesson-quest-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-training to-orange-500 flex items-center justify-center text-white font-bold text-lg">B</div>
        <div>
          <p className="font-bold text-lesson-quest-title text-sm">BONO</p>
          <p className="text-xs text-lesson-quest-meta">UI/UXデザイナー</p>
        </div>
      </div>
      <h3 className="font-bold text-lesson-quest-title mb-2">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-detail mb-3">「このレッスンでは、実務で使えるUIデザインの基本サイクルを一緒に学んでいきます」</p>
      <button className="w-full py-2.5 rounded-xl bg-lesson-hero-text text-white font-bold text-sm">
        レッスンを始める
      </button>
    </div>
  </div>
);

// ========================================
// Idea 2: ゴール設定ファースト
// ========================================
const GoalFirstPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 bg-gradient-to-br from-lesson-hero-gradient-start to-lesson-hero-gradient-mid">
      <p className="text-xs text-lesson-quest-meta mb-2">まず教えてください</p>
      <h3 className="font-bold text-lesson-quest-title text-lg mb-1 font-rounded-mplus">あなたの目標は？</h3>
      <p className="text-xs text-lesson-quest-detail">選択に応じて最適な学習体験を提供します</p>
    </div>
    <div className="p-4 space-y-2">
      {[
        { label: 'デザインの基礎を学びたい', selected: false },
        { label: '実務で使えるスキルが欲しい', selected: true },
        { label: 'ポートフォリオを作りたい', selected: false },
      ].map((goal, i) => (
        <button
          key={i}
          className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
            goal.selected
              ? 'bg-training/10 border-training text-lesson-quest-title'
              : 'bg-white border-lesson-quest-border text-lesson-quest-detail hover:border-lesson-quest-meta'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{goal.label}</span>
            {goal.selected && (
              <div className="w-5 h-5 rounded-full bg-training flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
    <div className="p-4 pt-0">
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        パーソナライズして始める
      </button>
    </div>
  </div>
);

// ========================================
// Idea 3: Before/After中心
// ========================================
const BeforeAfterPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 bg-gradient-to-r from-gray-100 to-blue-50">
      <p className="text-xs font-bold text-lesson-quest-meta tracking-wide uppercase mb-2">このレッスンで得られる変化</p>
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl p-3 text-center border border-gray-200">
          <div className="w-full h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-xs text-gray-400">😕</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Before</span>
          <p className="text-[10px] text-gray-400 mt-1">なんとなくデザイン</p>
        </div>
        <div className="flex items-center">
          <ArrowRight className="w-4 h-4 text-training" />
        </div>
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border-2 border-blue-300">
          <div className="w-full h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-2 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xs text-blue-600 font-bold">After</span>
          <p className="text-[10px] text-blue-500 mt-1">根拠のあるデザイン</p>
        </div>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lesson-quest-title mb-2">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-detail mb-3">デザインの「なぜ」を説明できるようになる</p>
      <button className="w-full py-2.5 rounded-xl bg-lesson-hero-text text-white font-bold text-sm">
        変化を体験する
      </button>
    </div>
  </div>
);

// ========================================
// Idea 4: ロードマップ/星座型
// ========================================
const RoadmapPreview = () => (
  <div className="w-full max-w-md mx-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-5 text-white">
    <h3 className="font-bold text-lg mb-1 font-rounded-mplus">UIデザインサイクル</h3>
    <p className="text-xs text-white/60 mb-4">3クエスト • 全体像を見る</p>
    {/* 星座風マップ */}
    <div className="relative h-32 mb-4">
      <svg className="w-full h-full" viewBox="0 0 300 100">
        {/* 接続線 */}
        <line x1="50" y1="50" x2="150" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <line x1="150" y1="30" x2="250" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4" />
        {/* ノード */}
        <circle cx="50" cy="50" r="16" fill="#22c55e" />
        <text x="50" y="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">✓</text>
        <circle cx="150" cy="30" r="16" fill="#f59e0b" className="animate-pulse" />
        <text x="150" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">2</text>
        <circle cx="250" cy="60" r="12" fill="rgba(255,255,255,0.2)" />
        <text x="250" y="64" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">3</text>
      </svg>
      {/* ラベル */}
      <div className="absolute left-2 top-16 text-[10px] text-green-400">完了</div>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 text-[10px] text-training">現在地</div>
      <div className="absolute right-2 top-20 text-[10px] text-white/40">次へ</div>
    </div>
    <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm flex items-center justify-center gap-2">
      <Play className="w-4 h-4" fill="white" />
      Quest 2 を続ける
    </button>
  </div>
);

// ========================================
// Idea 5: ストリーク＆XP重視
// ========================================
const StreakXPPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    {/* ストリーク表示 */}
    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-orange-600 text-sm">3日連続学習中！</p>
            <p className="text-[10px] text-orange-500">あと4日でボーナスXP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lesson-quest-title text-sm">245 XP</p>
          <p className="text-[10px] text-lesson-quest-meta">累計</p>
        </div>
      </div>
    </div>
    {/* レッスン情報 */}
    <div className="p-4">
      <h3 className="font-bold text-lesson-quest-title mb-2">UIデザインサイクル</h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 rounded-full bg-success-background text-success-dark text-[10px] font-medium">+50 XP</span>
        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium">バッジ獲得可能</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-lesson-quest-meta">進捗</span>
          <span className="text-lesson-quest-title font-medium">40%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-full w-2/5 bg-gradient-to-r from-training to-orange-400 rounded-full"></div>
        </div>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        続きから学習 (+15 XP)
      </button>
    </div>
  </div>
);

// ========================================
// Idea 6: クエスト冒険型
// ========================================
const QuestAdventurePreview = () => (
  <div className="w-full max-w-md mx-auto bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-4 text-white">
    <div className="flex items-center gap-2 mb-3">
      <Sword className="w-5 h-5 text-yellow-400" />
      <span className="text-xs font-bold text-yellow-400">QUEST</span>
    </div>
    <h3 className="font-bold text-xl mb-1 font-rounded-mplus">UIデザインサイクル</h3>
    <p className="text-xs text-white/70 mb-4">3つのクエストをクリアしよう</p>

    <div className="space-y-2 mb-4">
      {[
        { title: 'Quest 1: 基礎を学ぶ', status: 'complete', xp: 20 },
        { title: 'Quest 2: 実践に挑戦', status: 'current', xp: 30 },
        { title: 'Quest 3: ボス戦 (プロジェクト)', status: 'locked', xp: 50 },
      ].map((quest, i) => (
        <div
          key={i}
          className={`p-3 rounded-xl ${
            quest.status === 'complete'
              ? 'bg-green-500/20 border border-green-400/30'
              : quest.status === 'current'
              ? 'bg-yellow-500/20 border-2 border-yellow-400'
              : 'bg-white/10 border border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {quest.status === 'complete' && <Check className="w-4 h-4 text-green-400" />}
              {quest.status === 'current' && <Sword className="w-4 h-4 text-yellow-400" />}
              {quest.status === 'locked' && <span className="text-white/40">🔒</span>}
              <span className={`text-sm font-medium ${quest.status === 'locked' ? 'text-white/40' : ''}`}>
                {quest.title}
              </span>
            </div>
            <span className={`text-xs ${quest.status === 'locked' ? 'text-white/40' : 'text-yellow-400'}`}>
              +{quest.xp} XP
            </span>
          </div>
        </div>
      ))}
    </div>

    <button className="w-full py-2.5 rounded-xl bg-yellow-500 text-indigo-900 font-bold text-sm">
      Quest 2 に挑戦
    </button>
  </div>
);

// ========================================
// Idea 7: プロジェクトギャラリー
// ========================================
const ProjectGalleryPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <p className="text-xs font-bold text-lesson-quest-meta tracking-wide uppercase mb-2">このレッスンで作れるもの</p>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-lesson-quest-meta mt-2 text-center">学習者の作品 235点</p>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lesson-quest-title mb-2">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-detail mb-3">実際に手を動かしてUIを作れるようになる</p>
      <button className="w-full py-2.5 rounded-xl bg-lesson-hero-text text-white font-bold text-sm">
        作品を作り始める
      </button>
    </div>
  </div>
);

// ========================================
// Idea 8: 1セクション集中
// ========================================
const SingleFocusPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    {/* 進捗バー */}
    <div className="h-1 bg-gray-100">
      <div className="h-full w-1/3 bg-training"></div>
    </div>
    <div className="p-6 text-center">
      <p className="text-xs text-lesson-quest-meta mb-2">Step 1 of 3</p>
      <h3 className="font-bold text-xl text-lesson-quest-title mb-3 font-rounded-mplus">まず、UIデザインとは？</h3>

      <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl mb-4 flex items-center justify-center border border-gray-200">
        <Play className="w-12 h-12 text-gray-400" />
      </div>

      <p className="text-sm text-lesson-quest-detail mb-6">
        UIデザインの基本的な考え方を3分で学びましょう
      </p>

      <button className="w-full py-3 rounded-xl bg-training text-white font-bold text-sm">
        次へ進む
      </button>
    </div>
  </div>
);

// ========================================
// Idea 9: 講師中心
// ========================================
const InstructorCentricPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-5 bg-gradient-to-br from-lesson-hero-gradient-start to-lesson-hero-gradient-mid text-center">
      <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-training to-orange-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
        B
      </div>
      <h4 className="font-bold text-lesson-quest-title text-lg font-rounded-mplus">BONOと学ぶ</h4>
      <p className="text-xs text-lesson-quest-meta mb-3">UIデザイナー • 10年の実務経験</p>
      <p className="text-sm text-lesson-quest-detail italic">
        「デザインは才能じゃない。<br />
        学べば誰でもできるようになる。」
      </p>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lesson-quest-title mb-2 text-center">UIデザインサイクル</h3>
      <div className="flex justify-center gap-4 mb-3">
        <div className="text-center">
          <p className="font-bold text-lesson-quest-title">3</p>
          <p className="text-[10px] text-lesson-quest-meta">クエスト</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lesson-quest-title">12</p>
          <p className="text-[10px] text-lesson-quest-meta">記事</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lesson-quest-title">60分</p>
          <p className="text-[10px] text-lesson-quest-meta">目安</p>
        </div>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        BONOに学ぶ
      </button>
    </div>
  </div>
);

// ========================================
// Idea 10: 時間軸タイムライン
// ========================================
const TimelinePreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <h3 className="font-bold text-lesson-quest-title mb-1">UIデザインサイクル</h3>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-lesson-quest-meta" />
        <span className="text-xs text-lesson-quest-meta">合計 約60分</span>
      </div>
    </div>
    <div className="p-4">
      <div className="relative pl-6 space-y-4">
        {/* タイムライン線 */}
        <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200"></div>

        {[
          { time: '0-15分', title: 'Quest 1: 基礎', status: 'complete' },
          { time: '15-35分', title: 'Quest 2: 実践', status: 'current' },
          { time: '35-60分', title: 'Quest 3: 応用', status: 'pending' },
        ].map((item, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-4 w-3 h-3 rounded-full ${
              item.status === 'complete' ? 'bg-success' :
              item.status === 'current' ? 'bg-training' : 'bg-gray-200'
            }`}></div>
            <div>
              <p className={`text-xs ${
                item.status === 'current' ? 'text-training font-bold' : 'text-lesson-quest-meta'
              }`}>{item.time}</p>
              <p className={`text-sm font-medium ${
                item.status === 'pending' ? 'text-lesson-quest-meta' : 'text-lesson-quest-title'
              }`}>{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="p-4 pt-0">
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        15分から再開
      </button>
    </div>
  </div>
);

// ========================================
// Idea 11: チェックリスト進行
// ========================================
const ChecklistPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lesson-quest-title">UIデザインサイクル</h3>
        <span className="text-sm font-bold text-success">5/12 完了</span>
      </div>
      <div className="h-2 bg-green-100 rounded-full mt-2">
        <div className="h-full w-[42%] bg-success rounded-full"></div>
      </div>
    </div>
    <div className="p-4 space-y-2">
      {[
        { label: 'イントロダクション', done: true },
        { label: 'UIデザインとは', done: true },
        { label: 'デザインサイクルの概念', done: true },
        { label: '実践: 最初のUI', done: false, current: true },
        { label: 'フィードバックの受け方', done: false },
      ].map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-2 rounded-lg ${
            item.current ? 'bg-training/10' : ''
          }`}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center ${
            item.done ? 'bg-success' : 'border-2 border-gray-300'
          }`}>
            {item.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <span className={`text-sm ${
            item.done ? 'text-lesson-quest-meta line-through' :
            item.current ? 'text-training font-medium' : 'text-lesson-quest-detail'
          }`}>{item.label}</span>
          {item.current && <span className="text-[10px] text-training ml-auto">次はここ</span>}
        </div>
      ))}
    </div>
    <div className="p-4 pt-0">
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        続きをやる
      </button>
    </div>
  </div>
);

// ========================================
// Idea 12: ストーリーテリング型
// ========================================
const StorytellingPreview = () => (
  <div className="w-full max-w-md mx-auto">
    {/* セクション1: フック */}
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] rounded-t-2xl p-6 text-white text-center">
      <p className="text-xs text-white/60 mb-2">Chapter 1</p>
      <h3 className="font-bold text-xl mb-2 font-rounded-mplus">なぜデザインは難しいのか？</h3>
      <p className="text-sm text-white/70">多くの人が感じる壁、それは...</p>
    </div>
    {/* セクション2: 問題提起 */}
    <div className="bg-gradient-to-br from-[#2d2d44] to-[#3d3d54] p-6 text-white text-center">
      <p className="text-4xl mb-2">🤔</p>
      <p className="text-sm text-white/80">「センスがないから」と思っていませんか？</p>
    </div>
    {/* セクション3: 解決 */}
    <div className="bg-white rounded-b-2xl p-6 text-center border border-t-0 border-lesson-quest-border">
      <p className="text-xs text-lesson-quest-meta mb-2">実は...</p>
      <h3 className="font-bold text-lg text-lesson-quest-title mb-2">デザインは「サイクル」で回せる</h3>
      <p className="text-xs text-lesson-quest-detail mb-4">このレッスンで、その方法を学びます</p>
      <button className="w-full py-2.5 rounded-xl bg-lesson-hero-text text-white font-bold text-sm">
        ストーリーを始める
      </button>
    </div>
  </div>
);

// ========================================
// Idea 13: マイクロラーニング
// ========================================
const MicroLearningPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-blue-600 text-sm">5分で学べる</span>
      </div>
      <h3 className="font-bold text-lesson-quest-title">UIデザインサイクル</h3>
    </div>
    <div className="p-4">
      <p className="text-xs text-lesson-quest-meta mb-3">今日の1ステップ</p>
      <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <Play className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-lesson-quest-title text-sm">UIデザインとは？</p>
            <p className="text-xs text-lesson-quest-meta">3分の動画</p>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-lesson-quest-meta text-center mb-3">
        毎日5分、12日で完了
      </p>
      <button className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm">
        今日の5分を始める
      </button>
    </div>
  </div>
);

// ========================================
// Idea 14: コミュニティ連携
// ========================================
const CommunityPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <h3 className="font-bold text-lesson-quest-title mb-2">UIデザインサイクル</h3>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"></div>
          ))}
        </div>
        <span className="text-xs text-lesson-quest-meta">+128人が学習中</span>
      </div>
    </div>
    <div className="p-4 bg-purple-50 border-b border-purple-100">
      <p className="text-xs font-bold text-purple-600 mb-2">🎉 コミュニティの声</p>
      <div className="bg-white rounded-lg p-3 border border-purple-100">
        <p className="text-xs text-lesson-quest-detail italic">
          「Quest 2 の実践課題が特に良かった！」
        </p>
        <p className="text-[10px] text-lesson-quest-meta mt-1">- 2時間前</p>
      </div>
    </div>
    <div className="p-4">
      <button className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm">
        仲間と一緒に学ぶ
      </button>
    </div>
  </div>
);

// ========================================
// Idea 15: スキルツリー型
// ========================================
const SkillTreePreview = () => (
  <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
    <h3 className="font-bold text-lg mb-1 font-rounded-mplus">UIデザインスキル</h3>
    <p className="text-xs text-white/60 mb-4">習熟度を上げよう</p>

    <div className="space-y-3">
      {[
        { skill: '基礎理論', level: 3, max: 3, color: 'bg-green-400' },
        { skill: 'レイアウト', level: 2, max: 3, color: 'bg-yellow-400' },
        { skill: 'タイポグラフィ', level: 1, max: 3, color: 'bg-orange-400' },
        { skill: 'カラー', level: 0, max: 3, color: 'bg-gray-600' },
      ].map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span>{item.skill}</span>
            <span className="text-white/60">Lv.{item.level}/{item.max}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: item.max }).map((_, j) => (
              <div
                key={j}
                className={`flex-1 h-2 rounded-full ${
                  j < item.level ? item.color : 'bg-white/10'
                }`}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <button className="w-full mt-4 py-2.5 rounded-xl bg-white text-gray-900 font-bold text-sm">
      次のスキルを解放
    </button>
  </div>
);

// ========================================
// Idea 16: フレームワーク図解
// ========================================
const FrameworkPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <h3 className="font-bold text-lesson-quest-title text-center mb-1">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-meta text-center">BONOメソッドの4ステップ</p>
    </div>
    <div className="p-5">
      {/* 循環図 */}
      <div className="relative w-40 h-40 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-dashed border-gray-200 rounded-full"></div>
        {[
          { label: '理解', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', active: false },
          { label: '設計', pos: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2', active: true },
          { label: '実装', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', active: false },
          { label: '検証', pos: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2', active: false },
        ].map((step, i) => (
          <div
            key={i}
            className={`absolute ${step.pos} w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold ${
              step.active
                ? 'bg-training text-white shadow-lg'
                : 'bg-gray-100 text-lesson-quest-meta'
            }`}
          >
            {step.label}
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <Layers className="w-8 h-8 text-gray-300" />
        </div>
      </div>
      <p className="text-xs text-lesson-quest-detail text-center mb-4">
        この4ステップを回すことで、<br />
        デザイン力が確実に上がります
      </p>
    </div>
    <div className="p-4 pt-0">
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        サイクルを学ぶ
      </button>
    </div>
  </div>
);

// ========================================
// Idea 17: 難易度選択
// ========================================
const DifficultySelectPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <h3 className="font-bold text-lesson-quest-title mb-1">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-detail">あなたのレベルに合わせて学べます</p>
    </div>
    <div className="p-4 space-y-3">
      {[
        { level: '初級', desc: 'デザイン未経験の方', color: 'green', recommended: false },
        { level: '中級', desc: '基礎は分かる方', color: 'yellow', recommended: true },
        { level: '上級', desc: '実務経験がある方', color: 'red', recommended: false },
      ].map((item, i) => (
        <button
          key={i}
          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
            item.recommended
              ? 'border-training bg-training/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                item.color === 'green' ? 'bg-green-400' :
                item.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></span>
              <span className="font-medium text-lesson-quest-title text-sm">{item.level}</span>
              {item.recommended && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-training text-white">おすすめ</span>
              )}
            </div>
          </div>
          <p className="text-xs text-lesson-quest-meta mt-1 ml-5">{item.desc}</p>
        </button>
      ))}
    </div>
    <div className="p-4 pt-0">
      <button className="w-full py-2.5 rounded-xl bg-training text-white font-bold text-sm">
        このレベルで始める
      </button>
    </div>
  </div>
);

// ========================================
// Idea 18: 成功事例ファースト
// ========================================
const SuccessStoryPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-amber-500" />
        <span className="text-xs font-bold text-amber-600">受講者の声</span>
      </div>
      <div className="bg-white rounded-xl p-3 border border-amber-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-amber-600 font-bold text-sm">T</div>
          <div className="flex-1">
            <p className="text-xs text-lesson-quest-detail">
              「デザインの考え方が180度変わった。今では自信を持ってUIを作れるようになりました」
            </p>
            <p className="text-[10px] text-lesson-quest-meta mt-1">田中さん • UIデザイナー転職成功</p>
          </div>
        </div>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lesson-quest-title mb-2">UIデザインサイクル</h3>
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <p className="font-bold text-lesson-quest-title">98%</p>
          <p className="text-[10px] text-lesson-quest-meta">満足度</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lesson-quest-title">1,200+</p>
          <p className="text-[10px] text-lesson-quest-meta">受講者</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lesson-quest-title">4.9</p>
          <p className="text-[10px] text-lesson-quest-meta">評価</p>
        </div>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm">
        成功への第一歩を踏み出す
      </button>
    </div>
  </div>
);

// ========================================
// Idea 19: インタラクティブプレビュー
// ========================================
const InteractivePreviewPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <h3 className="font-bold text-lesson-quest-title mb-1">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-meta">まずは体験してみよう</p>
    </div>
    <div className="p-4 bg-gray-50">
      <p className="text-xs font-bold text-lesson-quest-meta tracking-wide uppercase mb-2">無料で試せる内容</p>
      <div className="space-y-2">
        <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3 cursor-pointer hover:border-training transition-colors">
          <Play className="w-8 h-8 text-training" />
          <div>
            <p className="text-sm font-medium text-lesson-quest-title">イントロ動画</p>
            <p className="text-xs text-lesson-quest-meta">3分 • 無料</p>
          </div>
          <ChevronRight className="w-4 h-4 text-lesson-quest-meta ml-auto" />
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3 cursor-pointer hover:border-training transition-colors">
          <MousePointer className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-lesson-quest-title">インタラクティブデモ</p>
            <p className="text-xs text-lesson-quest-meta">実際に触れる • 無料</p>
          </div>
          <ChevronRight className="w-4 h-4 text-lesson-quest-meta ml-auto" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <button className="w-full py-2.5 rounded-xl bg-lesson-hero-text text-white font-bold text-sm">
        全コンテンツを解放する
      </button>
    </div>
  </div>
);

// ========================================
// Idea 20: 感情ジャーニー型
// ========================================
const EmotionalJourneyPreview = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-lesson-quest-border overflow-hidden">
    <div className="p-4 border-b border-lesson-quest-border">
      <h3 className="font-bold text-lesson-quest-title mb-1">UIデザインサイクル</h3>
      <p className="text-xs text-lesson-quest-detail">あなたの学習ジャーニー</p>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        {[
          { emoji: '🤔', label: '迷い', active: false },
          { emoji: '💡', label: '発見', active: true },
          { emoji: '🛠️', label: '実践', active: false },
          { emoji: '🎉', label: '達成', active: false },
        ].map((stage, i) => (
          <React.Fragment key={i}>
            <div className={`text-center ${stage.active ? '' : 'opacity-40'}`}>
              <div className={`text-2xl mb-1 ${stage.active ? 'animate-bounce' : ''}`}>{stage.emoji}</div>
              <p className={`text-[10px] ${stage.active ? 'text-training font-bold' : 'text-lesson-quest-meta'}`}>
                {stage.label}
              </p>
            </div>
            {i < 3 && (
              <div className={`flex-1 h-0.5 mx-1 ${i === 0 ? 'bg-training' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-3 mt-4 border border-yellow-100">
        <p className="text-xs text-amber-700">
          💡 今のあなた：「なんとなく」から「根拠のある」デザインへの第一歩
        </p>
      </div>
    </div>
    <div className="p-4 pt-0">
      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-training to-orange-500 text-white font-bold text-sm">
        ジャーニーを始める
      </button>
    </div>
  </div>
);

// ========================================
// Export: 20のページデザインアイデア
// ========================================
export const pageIdeas: PageIdeaData[] = [
  {
    id: 'idea-1',
    number: 1,
    title: 'シネマティック・イマーシブ',
    description: 'フルスクリーン動画ヒーローと講師の存在感で没入体験を演出',
    insight: '「Welcome動画がない」「静的な説明文のみ」という現状の問題を解決',
    reference: 'MasterClass, Skillshare',
    icon: <Play className="w-6 h-6" />,
    preview: <CinematicImmersivePreview />,
  },
  {
    id: 'idea-2',
    number: 2,
    title: 'ゴール設定ファースト',
    description: '「あなたの目標は？」から始まり、選択に応じてコンテンツをパーソナライズ',
    insight: 'セルフセグメンテーションで体験をカスタマイズ、内発的動機の喚起',
    reference: 'Notion, Duolingo',
    icon: <Target className="w-6 h-6" />,
    preview: <GoalFirstPreview />,
  },
  {
    id: 'idea-3',
    number: 3,
    title: 'Before/After中心',
    description: '学習前後の変化をファーストビューで可視化。成果が一目瞭然',
    insight: '「何が得られるか」を明確に。抽象原則を具体的な変換で示す',
    reference: 'Refactoring UI, Design+Code',
    icon: <Image className="w-6 h-6" />,
    preview: <BeforeAfterPreview />,
  },
  {
    id: 'idea-4',
    number: 4,
    title: 'ロードマップ/星座型',
    description: '全体像を星座/パスで可視化。現在地と進路が明確',
    insight: '「全体地図がない」という問題を解決。学習の見通しを立てられる',
    reference: 'Khan Academy, Learn UI Design',
    icon: <Map className="w-6 h-6" />,
    preview: <RoadmapPreview />,
  },
  {
    id: 'idea-5',
    number: 5,
    title: 'ストリーク＆XP重視',
    description: '連続学習日数、XP獲得をメインに表示。達成感でモチベーション維持',
    insight: 'ストリークは2.3倍のDAU向上。損失回避と達成感のバランス',
    reference: 'Duolingo, Forest',
    icon: <Zap className="w-6 h-6" />,
    preview: <StreakXPPreview />,
  },
  {
    id: 'idea-6',
    number: 6,
    title: 'クエスト冒険型',
    description: 'RPG風のクエスト表示。「ボス」としてのプロジェクト',
    insight: '学習を「クエスト」として表現するゲーミフィケーションの強化',
    reference: 'Habitica, Duolingo',
    icon: <Sword className="w-6 h-6" />,
    preview: <QuestAdventurePreview />,
  },
  {
    id: 'idea-7',
    number: 7,
    title: 'プロジェクトギャラリー',
    description: '他の学習者の成果物を最初に見せる。「こんなの作れる」という期待感',
    insight: 'プロジェクトベース学習の可視化。学習の成果物で動機づけ',
    reference: 'Skillshare, Dribbble',
    icon: <Users className="w-6 h-6" />,
    preview: <ProjectGalleryPreview />,
  },
  {
    id: 'idea-8',
    number: 8,
    title: '1セクション集中',
    description: '認知負荷最小化。1画面1コンセプトで1つずつ進む',
    insight: '1入力/1ステップの原則。「多い」と感じさせない設計',
    reference: 'Linear, Figma',
    icon: <Focus className="w-6 h-6" />,
    preview: <SingleFocusPreview />,
  },
  {
    id: 'idea-9',
    number: 9,
    title: '講師中心',
    description: '講師の顔と一言メッセージを大きく。信頼と親近感',
    insight: '講師の存在感が「この人から学べる」という特別感を演出',
    reference: 'MasterClass, DesignLab',
    icon: <User className="w-6 h-6" />,
    preview: <InstructorCentricPreview />,
  },
  {
    id: 'idea-10',
    number: 10,
    title: '時間軸タイムライン',
    description: '学習の時間軸で表示。「30分でここまで」という見通し',
    insight: '所要時間の明示で学習計画を立てやすくする',
    reference: 'Coursera, Udemy',
    icon: <Clock className="w-6 h-6" />,
    preview: <TimelinePreview />,
  },
  {
    id: 'idea-11',
    number: 11,
    title: 'チェックリスト進行',
    description: 'やることリストが見える。達成感を積み重ねる',
    insight: '小さな勝利→大きなマイルストーンが長期継続の鍵',
    reference: 'Asana, Notion',
    icon: <CheckSquare className="w-6 h-6" />,
    preview: <ChecklistPreview />,
  },
  {
    id: 'idea-12',
    number: 12,
    title: 'ストーリーテリング型',
    description: 'スクロールで物語が展開。映画的スクロール体験',
    insight: '「情報」ではなく「ストーリー」で影響を与える',
    reference: 'Apple, Linear',
    icon: <BookOpen className="w-6 h-6" />,
    preview: <StorytellingPreview />,
  },
  {
    id: 'idea-13',
    number: 13,
    title: 'マイクロラーニング',
    description: '「5分で学べる」を強調。バイトサイズの安心感',
    insight: '継続のハードルを下げる。1レッスン5分以内で完了可能',
    reference: 'Duolingo, Brilliant',
    icon: <Timer className="w-6 h-6" />,
    preview: <MicroLearningPreview />,
  },
  {
    id: 'idea-14',
    number: 14,
    title: 'コミュニティ連携',
    description: '同じ学習者の存在を見せる。一緒に学んでいる感',
    insight: '競争より「つながり」。穏やかなソーシャル要素',
    reference: 'Headspace, Domestika',
    icon: <Heart className="w-6 h-6" />,
    preview: <CommunityPreview />,
  },
  {
    id: 'idea-15',
    number: 15,
    title: 'スキルツリー型',
    description: '習熟度が可視化。スキルをレベルアップ',
    insight: 'マスタリーポイントで習熟度を可視化、成長実感',
    reference: 'Khan Academy, Codecademy',
    icon: <Star className="w-6 h-6" />,
    preview: <SkillTreePreview />,
  },
  {
    id: 'idea-16',
    number: 16,
    title: 'フレームワーク図解',
    description: 'UIデザインサイクルを大きく表示。体系的理解',
    insight: 'デザインを「習得可能な技術」として提示',
    reference: 'Shift Nudge, Learn UI Design',
    icon: <Layers className="w-6 h-6" />,
    preview: <FrameworkPreview />,
  },
  {
    id: 'idea-17',
    number: 17,
    title: '難易度選択',
    description: '初級/中級/上級で入口を分ける。自分のレベルに合わせて',
    insight: 'レベル別パスでパーソナライズ',
    reference: 'Coursera, Brilliant',
    icon: <Sliders className="w-6 h-6" />,
    preview: <DifficultySelectPreview />,
  },
  {
    id: 'idea-18',
    number: 18,
    title: '成功事例ファースト',
    description: '卒業生の声、キャリア変化を最初に。社会的証明',
    insight: '数値、評価、企業ロゴで信頼性と権威性を構築',
    reference: 'DesignLab, Designership',
    icon: <Award className="w-6 h-6" />,
    preview: <SuccessStoryPreview />,
  },
  {
    id: 'idea-19',
    number: 19,
    title: 'インタラクティブプレビュー',
    description: 'レッスン内容の「味見」ができる。無料で体験',
    insight: 'Show, Don\'t Tell。実際に操作させることで学習',
    reference: 'Figma, Design+Code',
    icon: <MousePointer className="w-6 h-6" />,
    preview: <InteractivePreviewPreview />,
  },
  {
    id: 'idea-20',
    number: 20,
    title: '感情ジャーニー型',
    description: '迷い→発見→実践→達成の感情設計を可視化',
    insight: '「情報」を「ジャーニー」に変える。感情を設計する',
    reference: 'Duolingo, Apple',
    icon: <Sparkles className="w-6 h-6" />,
    preview: <EmotionalJourneyPreview />,
  },
];

export default pageIdeas;
