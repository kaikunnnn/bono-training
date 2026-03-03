/**
 * ProgressPatterns - 進行中ガイドパターン（Pattern 7-12）
 * プロジェクトのデザインシステムに準拠
 */

import React from 'react';
import {
  Play,
  ArrowRight,
  MapPin,
  MessageCircle,
  CheckCircle,
  Zap,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { PatternData } from './PatternCard';

// Pattern 7: スマートCTA
const SmartCTAPreview = () => (
  <div className="space-y-3 max-w-xs">
    <div className="text-xs font-bold text-lesson-quest-meta tracking-wide uppercase mb-3">進捗に応じたCTA変化</div>
    <button className="w-full py-3.5 px-5 rounded-xl bg-lesson-hero-text text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-lesson-hero-text/20 hover:opacity-90 transition-opacity">
      <Play className="w-4 h-4" fill="white" />
      はじめる
    </button>
    <button className="w-full py-3.5 px-5 rounded-xl bg-success text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-success/20 hover:opacity-90 transition-opacity">
      <ArrowRight className="w-4 h-4" />
      続きから（Quest 2 / 記事 3）
    </button>
    <button className="w-full py-3.5 px-5 rounded-xl bg-training text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-training/20 hover:opacity-90 transition-opacity">
      <Sparkles className="w-4 h-4" />
      次のクエストへ
    </button>
  </div>
);

// Pattern 8: ミニ地図サイドバー
const MiniMapPreview = () => (
  <div className="max-w-[220px] bg-lesson-overview-checkbox-bg rounded-2xl p-4 border border-lesson-quest-border">
    <div className="text-xs font-bold text-lesson-quest-title mb-3 font-rounded-mplus">レッスン構成</div>
    <div className="space-y-2.5">
      {[
        { title: 'Quest 1: 基礎', articles: 3, completed: 3, current: false },
        { title: 'Quest 2: 実践', articles: 4, completed: 2, current: true },
        { title: 'Quest 3: 応用', articles: 3, completed: 0, current: false },
      ].map((quest, i) => (
        <div
          key={i}
          className={`p-3 rounded-xl text-xs transition-all ${
            quest.current
              ? 'bg-training/10 border-2 border-training'
              : quest.completed === quest.articles
              ? 'bg-success-background border border-success-light'
              : 'bg-white border border-lesson-quest-border'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${
              quest.current ? 'text-training' : quest.completed === quest.articles ? 'text-success-dark' : 'text-lesson-quest-title'
            }`}>
              {quest.title}
            </span>
            {quest.completed === quest.articles && (
              <Check className="w-4 h-4 text-success" strokeWidth={3} />
            )}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: quest.articles }).map((_, j) => (
              <div
                key={j}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  j < quest.completed ? 'bg-success' : 'bg-lesson-quest-border'
                }`}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Pattern 9: 励ましメッセージ
const EncouragementPreview = () => (
  <div className="max-w-sm space-y-3">
    <div className="bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] rounded-2xl p-4 border border-[#93c5fd]">
      <p className="text-sm text-[#1d4ed8] font-medium">
        <span className="font-bold">あと2記事</span>で次のクエスト！
      </p>
    </div>
    <div className="bg-gradient-to-r from-success-background to-[#dcfce7] rounded-2xl p-4 border border-success-light">
      <p className="text-sm text-success-dark font-medium">
        <span className="font-bold">50%完了！</span> 順調に進んでいます
      </p>
    </div>
    <div className="bg-gradient-to-r from-[#fef3c7] to-[#fde68a] rounded-2xl p-4 border border-training">
      <p className="text-sm text-[#92400e] font-medium flex items-center gap-2">
        <span className="text-lg">🔥</span>
        <span className="font-bold">今日で3日連続学習中！</span>
      </p>
    </div>
  </div>
);

// Pattern 10: セクション完了アニメーション
const CompletionAnimationPreview = () => (
  <div className="max-w-sm text-center">
    <div className="relative inline-block">
      <div className="w-24 h-24 rounded-full bg-success-background flex items-center justify-center border-4 border-success shadow-xl shadow-success/20">
        <CheckCircle className="w-12 h-12 text-success" strokeWidth={2.5} />
      </div>
      {/* 紙吹雪エフェクト（静的表現） */}
      <div className="absolute -top-2 -left-3 w-4 h-4 bg-[#fbbf24] rounded-full shadow-sm animate-bounce"></div>
      <div className="absolute -top-1 right-1 w-3 h-3 bg-[#f472b6] rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="absolute bottom-1 -right-3 w-4 h-4 bg-[#60a5fa] rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-1/2 -left-4 w-3 h-3 bg-[#a78bfa] rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.15s' }}></div>
    </div>
    <p className="mt-4 text-base font-bold text-success font-rounded-mplus">Quest 1 完了！</p>
    <p className="text-xs text-lesson-quest-meta mt-1.5">300-500msのアニメーション</p>
  </div>
);

// Pattern 11: XP獲得ポップアップ
const XPPopupPreview = () => (
  <div className="max-w-xs">
    <div className="bg-gradient-to-r from-training to-[#f59e0b] text-white rounded-2xl p-5 shadow-xl shadow-training/30">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Zap className="w-8 h-8" fill="white" />
        </div>
        <div>
          <p className="font-bold text-2xl font-rounded-mplus">+15 XP 獲得！</p>
          <p className="text-sm text-white/80 mt-0.5">累計: 245 XP</p>
        </div>
      </div>
    </div>
    <p className="text-xs text-lesson-quest-meta mt-3 text-center">
      記事完了時にポップアップ表示
    </p>
  </div>
);

// Pattern 12: クエスト間トランジション
const QuestTransitionPreview = () => (
  <div className="max-w-sm bg-gradient-to-b from-lesson-overview-checkbox-bg to-white rounded-2xl p-5 border border-lesson-quest-border shadow-sm">
    <div className="text-center mb-5">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-background mb-3 border-2 border-success">
        <Check className="w-7 h-7 text-success" strokeWidth={3} />
      </div>
      <p className="text-base font-bold text-success font-rounded-mplus">Quest 1 完了！</p>
    </div>
    <div className="border-t border-lesson-quest-border pt-5">
      <p className="text-xs font-bold text-lesson-quest-meta tracking-wide uppercase mb-3">次のクエスト</p>
      <div className="flex items-center justify-between p-4 bg-training/10 rounded-xl border-2 border-training cursor-pointer hover:bg-training/20 transition-colors">
        <div>
          <p className="font-bold text-training font-rounded-mplus">Quest 2: 実践編</p>
          <p className="text-xs text-lesson-quest-meta mt-0.5">4記事 • 約20分</p>
        </div>
        <ChevronRight className="w-5 h-5 text-training" />
      </div>
    </div>
  </div>
);

export const progressPatterns: PatternData[] = [
  {
    id: 'pattern-7',
    number: 7,
    title: 'スマートCTA',
    description: '進捗に応じてボタンテキスト変化。「始める」→「続きから」→「次のクエストへ」',
    reference: 'Linear, Notion',
    category: 'progress',
    icon: <Play className="w-6 h-6" />,
    preview: <SmartCTAPreview />,
    details: [
      '進捗0%: 「始める」',
      '進捗途中: 「続きから（Quest X / 記事 Y）」',
      'クエスト完了: 「次のクエストへ」',
      '全完了: 「もう一度見る」または「次のレッスン」',
    ],
  },
  {
    id: 'pattern-8',
    number: 8,
    title: 'ミニ地図サイドバー',
    description: '常に表示される全体構造。現在地ハイライト + 完了チェック。',
    reference: 'Stripe Docs',
    category: 'progress',
    icon: <MapPin className="w-6 h-6" />,
    preview: <MiniMapPreview />,
    details: [
      'スクロールに追従するスティッキー配置',
      '現在のクエスト・記事をハイライト',
      '完了済みにチェックマーク',
      'クリックで該当箇所にジャンプ',
    ],
  },
  {
    id: 'pattern-9',
    number: 9,
    title: '励ましメッセージ',
    description: '「あと2記事で次のクエスト！」進捗に応じた動的メッセージ。',
    reference: 'Duolingo, Headspace',
    category: 'progress',
    icon: <MessageCircle className="w-6 h-6" />,
    preview: <EncouragementPreview />,
    details: [
      '進捗に応じた励ましメッセージ',
      '残り記事数・クエスト数を表示',
      'ストリーク継続の通知',
      'ポジティブなトーンでモチベーション維持',
    ],
  },
  {
    id: 'pattern-10',
    number: 10,
    title: 'セクション完了アニメーション',
    description: 'チェックマーク + 紙吹雪（300-500ms）。小さな「やった！」感。',
    reference: 'Asana, Nike Run Club',
    category: 'progress',
    icon: <CheckCircle className="w-6 h-6" />,
    preview: <CompletionAnimationPreview />,
    details: [
      '300-500msの軽快なアニメーション',
      '紙吹雪・パーティクルエフェクト',
      'チェックマークのアニメーション',
      '完了音（オプション）',
    ],
  },
  {
    id: 'pattern-11',
    number: 11,
    title: 'XP獲得ポップアップ',
    description: '「+15 XP 獲得！」累積ポイントの表示。',
    reference: 'Duolingo, Habitica',
    category: 'progress',
    icon: <Zap className="w-6 h-6" />,
    preview: <XPPopupPreview />,
    details: [
      '記事完了時にXPを付与',
      'ポップアップでXP獲得を演出',
      '累積XPの表示',
      'レベルアップ・バッジシステムとの連携',
    ],
  },
  {
    id: 'pattern-12',
    number: 12,
    title: 'クエスト間トランジション',
    description: '完了時の次クエストへのスムーズな誘導。「次のクエストを見る」CTA。',
    reference: 'Linear',
    category: 'progress',
    icon: <ArrowRight className="w-6 h-6" />,
    preview: <QuestTransitionPreview />,
    details: [
      'クエスト完了時のサマリー表示',
      '次のクエストの概要プレビュー',
      'スムーズなトランジションアニメーション',
      '「次のクエストを見る」CTA',
    ],
  },
];

export default progressPatterns;
