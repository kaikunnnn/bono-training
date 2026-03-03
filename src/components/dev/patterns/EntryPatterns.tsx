/**
 * EntryPatterns - 入口設計パターン（Pattern 1-6）
 * プロジェクトのデザインシステムに準拠
 */

import React from 'react';
import {
  Play,
  Image,
  Target,
  Map,
  Clock,
  User,
  Check,
  Sparkles,
} from 'lucide-react';
import { PatternData } from './PatternCard';

// Pattern 1: シネマティック・ウェルカム プレビュー
const CinematicWelcomePreview = () => (
  <div className="relative bg-gradient-to-br from-lesson-hero-text to-[#1a1a2e] rounded-2xl overflow-hidden aspect-video max-w-sm shadow-lg">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:scale-105 transition-transform cursor-pointer">
          <Play className="w-10 h-10 text-white ml-1" fill="white" fillOpacity={0.9} />
        </div>
        <p className="text-base font-medium tracking-wide">30秒イントロ動画</p>
        <p className="text-sm text-white/60 mt-1.5">「このレッスンで何が学べるか」</p>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
      <div className="h-full w-1/3 bg-gradient-to-r from-training to-[#ffb347] rounded-r-full"></div>
    </div>
  </div>
);

// Pattern 2: 完成形プレビュー
const CompletionPreviewPreview = () => (
  <div className="max-w-sm">
    <p className="text-xs font-bold text-lesson-quest-meta tracking-wide uppercase mb-3">Before / After スライダー</p>
    <div className="flex gap-3">
      <div className="flex-1 bg-lesson-overview-image-bg rounded-2xl p-4 text-center border border-lesson-quest-border">
        <div className="w-full h-24 bg-lesson-item-thumbnail-bg rounded-xl mb-3 flex items-center justify-center">
          <span className="text-lesson-quest-meta text-sm font-medium">Before</span>
        </div>
        <span className="text-xs text-lesson-quest-detail font-medium">学習前</span>
      </div>
      <div className="flex-1 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] rounded-2xl p-4 text-center border-2 border-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/10">
        <div className="w-full h-24 bg-gradient-to-br from-[#bae6fd] to-[#7dd3fc] rounded-xl mb-3 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#0369a1]" />
        </div>
        <span className="text-xs text-[#0369a1] font-bold">完成形</span>
      </div>
    </div>
  </div>
);

// Pattern 3: ゴール設定カード
const GoalSettingPreview = () => (
  <div className="max-w-sm">
    <p className="text-base font-bold text-lesson-quest-title font-rounded-mplus mb-4">あなたの目標は？</p>
    <div className="space-y-2.5">
      {['基礎を学びたい', 'スキルアップしたい', '実務で使いたい'].map((goal, i) => (
        <button
          key={i}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
            i === 1
              ? 'bg-[#fef3c7] border-training text-lesson-hero-text shadow-md'
              : 'bg-white border-lesson-quest-border text-lesson-quest-detail hover:border-lesson-quest-meta hover:bg-lesson-overview-checkbox-bg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{goal}</span>
            {i === 1 && (
              <div className="w-6 h-6 rounded-full bg-training flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Pattern 4: ロードマップビュー
const RoadmapPreview = () => (
  <div className="max-w-md">
    <div className="flex items-center gap-4">
      {[
        { label: 'Quest 1', completed: true },
        { label: 'Quest 2', current: true },
        { label: 'Quest 3', completed: false },
      ].map((item, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                item.completed
                  ? 'bg-success text-white shadow-lg shadow-success/30'
                  : item.current
                  ? 'bg-training text-white ring-4 ring-training/20 shadow-lg shadow-training/30'
                  : 'bg-lesson-overview-checkbox-bg text-lesson-quest-meta border-2 border-lesson-quest-border'
              }`}
            >
              {item.completed ? <Check className="w-5 h-5" strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${
              item.current ? 'text-training' : item.completed ? 'text-success' : 'text-lesson-quest-meta'
            }`}>
              {item.completed ? '完了' : item.current ? '現在地' : '未完了'}
            </span>
          </div>
          {i < 2 && (
            <div className="flex-1 h-1 rounded-full -mt-6">
              <div className={`h-full rounded-full ${
                item.completed ? 'bg-success' : 'bg-lesson-quest-border'
              }`}></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// Pattern 5: 難易度・時間インジケーター
const DifficultyTimePreview = () => (
  <div className="flex flex-wrap gap-2.5">
    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-success-background text-success-dark text-sm font-medium border border-success-light">
      <Sparkles className="w-4 h-4" />
      初級
    </span>
    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#eff6ff] text-[#1d4ed8] text-sm font-medium border border-[#bfdbfe]">
      <Clock className="w-4 h-4" />
      15分
    </span>
    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#faf5ff] text-[#7c3aed] text-sm font-medium border border-[#e9d5ff]">
      全3クエスト • 計45分
    </span>
  </div>
);

// Pattern 6: 講師紹介セクション
const InstructorPreview = () => (
  <div className="flex items-start gap-5 max-w-sm p-5 bg-gradient-to-br from-lesson-hero-gradient-start to-lesson-hero-gradient-mid rounded-2xl">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-training to-[#ea580c] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-training/30 font-rounded-mplus">
      B
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-lesson-hero-text text-lg font-rounded-mplus">BONO</h4>
      <p className="text-xs text-lesson-quest-meta font-medium mb-3">UI/UXデザイナー</p>
      <p className="text-sm text-lesson-quest-detail leading-relaxed">
        「このレッスンではデザインの考え方を大切に進めていきます。」
      </p>
    </div>
  </div>
);

export const entryPatterns: PatternData[] = [
  {
    id: 'pattern-1',
    number: 1,
    title: 'シネマティック・ウェルカム',
    description: 'レッスン冒頭に30秒のイントロ動画。「何が学べるか」を映像で体感させる。',
    reference: 'MasterClass, Skillshare',
    category: 'entry',
    icon: <Play className="w-6 h-6" />,
    preview: <CinematicWelcomePreview />,
    details: [
      '30秒以内の短いイントロ動画',
      '自動再生（ミュート）またはホバーで再生',
      'スキップ可能な設計',
      'レッスンのハイライトシーンを凝縮',
    ],
  },
  {
    id: 'pattern-2',
    number: 2,
    title: '完成形プレビュー',
    description: '「このレッスンで作れるもの」を最初に表示。Before/Afterスライダーで変化を可視化。',
    reference: 'Refactoring UI, Design+Code',
    category: 'entry',
    icon: <Image className="w-6 h-6" />,
    preview: <CompletionPreviewPreview />,
    details: [
      'スライダーで比較可能なBefore/After',
      '完成形の画像・動画をファーストビューに配置',
      'ユーザーの期待値を明確に設定',
      'モチベーション向上に効果的',
    ],
  },
  {
    id: 'pattern-3',
    number: 3,
    title: 'ゴール設定カード',
    description: '「あなたの目標は？」3択。選択に応じてハイライトするコンテンツが変化。',
    reference: 'Notion, Duolingo',
    category: 'entry',
    icon: <Target className="w-6 h-6" />,
    preview: <GoalSettingPreview />,
    details: [
      'セルフセグメンテーションによる個人化',
      '選択結果をローカルストレージに保存',
      '選んだ目標に関連するコンテンツをハイライト',
      'オンボーディング体験の向上',
    ],
  },
  {
    id: 'pattern-4',
    number: 4,
    title: 'ロードマップビュー',
    description: 'クエストを星座/パス形式で可視化。現在地と完了済みを色分け。',
    reference: 'Khan Academy, Learn UI Design',
    category: 'entry',
    icon: <Map className="w-6 h-6" />,
    preview: <RoadmapPreview />,
    details: [
      '視覚的な進捗表示（星座・パス形式）',
      '現在地を明確にハイライト',
      '完了済み・未完了の色分け',
      'ゲーミフィケーション要素の導入',
    ],
  },
  {
    id: 'pattern-5',
    number: 5,
    title: '難易度・時間インジケーター',
    description: '「15分」「初級」などのバッジ。全クエスト分の合計時間も表示。',
    reference: 'Figma Resource Library',
    category: 'entry',
    icon: <Clock className="w-6 h-6" />,
    preview: <DifficultyTimePreview />,
    details: [
      '難易度バッジ（初級・中級・上級）',
      '所要時間の明示',
      '全クエストの合計時間',
      '学習計画を立てやすくする',
    ],
  },
  {
    id: 'pattern-6',
    number: 6,
    title: '講師紹介セクション',
    description: '顔写真 + 一言メッセージ。「このレッスンで大事にしていること」を伝える。',
    reference: 'Skillshare, DesignLab',
    category: 'entry',
    icon: <User className="w-6 h-6" />,
    preview: <InstructorPreview />,
    details: [
      '講師の顔写真・アイコン',
      '一言メッセージで親近感を演出',
      'レッスンへの思いを伝える',
      '信頼感・権威性の向上',
    ],
  },
];

export default entryPatterns;
