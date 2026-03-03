/**
 * ActionPatterns - 出口設計 + 全体体験パターン（Pattern 13-21）
 * プロジェクトのデザインシステムに準拠
 */

import React from 'react';
import {
  FileText,
  Signpost,
  Award,
  MessageSquare,
  Flame,
  Layers,
  SmilePlus,
  CalendarDays,
  Check,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Star,
  Layout,
  Play,
  Video,
  Users,
  Rocket,
} from 'lucide-react';
import { PatternData } from './PatternCard';

// Pattern 13: 完了サマリーカード
const CompletionSummaryPreview = () => (
  <div className="max-w-sm bg-gradient-to-br from-success-background to-[#d1fae5] rounded-2xl p-5 border border-success-light shadow-lg shadow-success/10">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center">
        <Check className="w-5 h-5 text-white" strokeWidth={3} />
      </div>
      <h4 className="font-bold text-success-dark text-lg font-rounded-mplus">レッスン完了！</h4>
    </div>
    <div className="space-y-2 text-sm text-lesson-quest-detail mb-4">
      <p className="font-bold text-lesson-quest-title">学んだこと：</p>
      <ul className="space-y-1.5 ml-1">
        {['UIデザインの基本原則', 'カラーパレットの選び方', 'タイポグラフィの基礎'].map((item, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
    <div className="pt-4 border-t border-success-light/50 text-xs text-lesson-quest-meta flex justify-between">
      <span>所要時間: 45分</span>
      <span>完了日: 2024/12/15</span>
    </div>
  </div>
);

// Pattern 14: 次のステップ選択肢
const NextStepsPreview = () => (
  <div className="max-w-sm space-y-2.5">
    <p className="text-sm font-bold text-lesson-quest-title mb-4 font-rounded-mplus">次のステップを選ぼう</p>
    {[
      { icon: <ChevronRight className="w-5 h-5" />, label: '次のレッスンへ進む', desc: 'UIデザイン応用編', primary: true },
      { icon: <RefreshCw className="w-5 h-5" />, label: '復習する', desc: 'もう一度見る', primary: false },
      { icon: <BookOpen className="w-5 h-5" />, label: '関連コースを見る', desc: '情報設計入門', primary: false },
    ].map((option, i) => (
      <button
        key={i}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 hover:shadow-md ${
          option.primary
            ? 'bg-training/10 border-training hover:bg-training/20'
            : 'bg-white border-lesson-quest-border hover:border-lesson-quest-meta'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          option.primary ? 'bg-training text-white' : 'bg-lesson-overview-checkbox-bg text-lesson-quest-detail'
        }`}>
          {option.icon}
        </div>
        <div>
          <p className={`text-sm font-bold ${option.primary ? 'text-training' : 'text-lesson-quest-title'}`}>
            {option.label}
          </p>
          <p className="text-xs text-lesson-quest-meta mt-0.5">{option.desc}</p>
        </div>
      </button>
    ))}
  </div>
);

// Pattern 15: 達成バッジ
const AchievementBadgePreview = () => (
  <div className="max-w-sm text-center">
    <div className="inline-block relative">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#fbbf24] to-training flex items-center justify-center shadow-2xl shadow-training/30">
        <Star className="w-14 h-14 text-white" fill="white" />
      </div>
      <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-success flex items-center justify-center border-4 border-white shadow-lg">
        <Check className="w-5 h-5 text-white" strokeWidth={3} />
      </div>
    </div>
    <p className="mt-4 font-bold text-lesson-quest-title text-lg font-rounded-mplus">UIデザイン入門 完了！</p>
    <p className="text-sm text-lesson-quest-meta mt-1">マイページに表示されます</p>
  </div>
);

// Pattern 16: 振り返りプロンプト
const ReflectionPromptPreview = () => (
  <div className="max-w-sm bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] rounded-2xl p-5 border border-[#93c5fd]">
    <p className="text-sm font-bold text-[#1d4ed8] mb-4 font-rounded-mplus">
      このレッスンで印象に残ったことは？
    </p>
    <textarea
      className="w-full p-3 rounded-xl border border-[#93c5fd] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
      rows={3}
      placeholder="学んだことや感想を書いてみましょう..."
    ></textarea>
    <div className="flex justify-between items-center mt-3">
      <span className="text-xs text-lesson-quest-meta">任意入力</span>
      <button className="text-xs text-[#2563eb] font-medium hover:underline">
        コミュニティで共有 →
      </button>
    </div>
  </div>
);

// Pattern 17: 学習ストリーク表示
const StreakDisplayPreview = () => (
  <div className="max-w-sm">
    <div className="bg-gradient-to-r from-[#f97316] to-[#ef4444] text-white rounded-2xl p-5 shadow-xl shadow-[#f97316]/30">
      <div className="flex items-center gap-4">
        <Flame className="w-14 h-14" fill="white" fillOpacity={0.9} />
        <div>
          <p className="text-3xl font-bold font-rounded-mplus">3日連続</p>
          <p className="text-base text-white/80 mt-0.5">学習中！</p>
        </div>
      </div>
    </div>
    <p className="text-xs text-lesson-quest-meta mt-3 text-center">
      ストリークリストア機能（週1回）
    </p>
  </div>
);

// Pattern 18: 視覚的コントラスト
const VisualContrastPreview = () => (
  <div className="max-w-sm space-y-2.5">
    {[
      { bg: 'bg-white', border: 'border-lesson-quest-border', text: 'text-lesson-quest-title' },
      { bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]', text: 'text-[#1d4ed8]' },
      { bg: 'bg-white', border: 'border-lesson-quest-border', text: 'text-lesson-quest-title' },
      { bg: 'bg-[#faf5ff]', border: 'border-[#e9d5ff]', text: 'text-[#7c3aed]' },
    ].map((style, i) => (
      <div key={i} className={`${style.bg} p-4 rounded-xl border ${style.border}`}>
        <p className={`text-sm font-bold ${style.text} font-rounded-mplus`}>セクション {i + 1}</p>
      </div>
    ))}
  </div>
);

// Pattern 19: マスコット/キャラクター
const MascotPreview = () => (
  <div className="max-w-sm">
    <div className="flex items-start gap-4 bg-gradient-to-br from-lesson-hero-gradient-start to-lesson-hero-gradient-mid rounded-2xl p-5 border border-lesson-quest-border">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-training to-[#ea580c] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-training/30 flex-shrink-0 font-rounded-mplus">
        B
      </div>
      <div>
        <p className="text-sm text-lesson-quest-detail leading-relaxed">
          <span className="font-bold text-training">BONOより：</span>
          すばらしい！Quest 2まで完了しましたね。この調子で頑張りましょう！
        </p>
      </div>
    </div>
    <p className="text-xs text-lesson-quest-meta mt-3 text-center">
      進捗に応じてコメントが変化
    </p>
  </div>
);

// Pattern 20: 学習カレンダーヒートマップ
const CalendarHeatmapPreview = () => {
  const days = Array.from({ length: 21 }, (_, i) => ({
    intensity: Math.random() > 0.25 ? Math.floor(Math.random() * 4) : 0,
  }));

  return (
    <div className="max-w-sm">
      <div className="flex flex-wrap gap-1.5">
        {days.map((day, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-md transition-colors ${
              day.intensity === 0
                ? 'bg-lesson-overview-checkbox-bg border border-lesson-quest-border'
                : day.intensity === 1
                ? 'bg-success-light'
                : day.intensity === 2
                ? 'bg-success/70'
                : 'bg-success'
            }`}
          ></div>
        ))}
      </div>
      <p className="text-xs text-lesson-quest-meta mt-3">
        GitHubスタイルの学習履歴
      </p>
    </div>
  );
};

// Pattern 21: フルページレッスン詳細（Figmaデザイン準拠）
const FullPageLessonPreview = () => (
  <div className="max-w-md bg-white rounded-2xl border border-lesson-quest-border overflow-hidden shadow-lg">
    {/* ヒーローセクション */}
    <div className="p-5 bg-gradient-to-br from-lesson-hero-gradient-start to-lesson-hero-gradient-mid">
      <div className="flex gap-4">
        <div className="flex-1">
          <span className="inline-block px-2.5 py-1 bg-lesson-hero-text text-white text-[10px] font-bold rounded-full mb-2">
            UIデザイン
          </span>
          <h3 className="text-base font-bold text-lesson-hero-text leading-snug font-rounded-mplus mb-2">
            UIが上手くなる人の "デザインサイクル" ─入門編
          </h3>
          <p className="text-xs text-lesson-quest-detail mb-3">
            UIデザインの流れを手を動かしながら理解する入門基礎レッスンです
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-lesson-quest-border rounded-full overflow-hidden">
              <div className="w-0 h-full bg-training rounded-full"></div>
            </div>
            <span className="text-xs font-bold text-lesson-quest-title">0%</span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-lesson-hero-text text-white text-xs font-bold rounded-lg">
              はじめる
            </button>
            <button className="px-3 py-1.5 border border-lesson-quest-border text-lesson-quest-detail text-xs font-medium rounded-lg">
              カリキュラム一覧
            </button>
          </div>
        </div>
        <div className="w-20 h-28 bg-lesson-item-thumbnail-bg rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Video className="w-8 h-8 text-lesson-quest-meta" />
        </div>
      </div>
    </div>

    {/* 得られるメリットセクション */}
    <div className="p-4 border-t border-dashed border-lesson-quest-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-training/10 flex items-center justify-center">
          <Rocket className="w-3 h-3 text-training" />
        </div>
        <span className="text-xs font-bold text-lesson-quest-meta tracking-wide">得られるメリット</span>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 bg-lesson-overview-checkbox-bg rounded-xl p-3">
          <p className="text-xs font-bold text-lesson-quest-title mb-1">デザインの考え方</p>
          <p className="text-[10px] text-lesson-quest-meta leading-relaxed">
            UIリサーチからプロトタイピングまでの流れを体系的に学べます
          </p>
        </div>
        <div className="w-16 h-16 bg-lesson-item-thumbnail-bg rounded-xl flex items-center justify-center">
          <Play className="w-6 h-6 text-lesson-quest-meta" />
        </div>
      </div>
    </div>

    {/* カリキュラムプレビュー */}
    <div className="p-4 border-t border-dashed border-lesson-quest-border">
      <p className="text-xs font-bold text-lesson-quest-title mb-3 font-rounded-mplus">カリキュラム</p>
      <div className="space-y-2">
        {[
          { quest: '01', title: 'はじめに', articles: 3 },
          { quest: '02', title: 'UIリサーチ', articles: 6, current: true },
        ].map((q, i) => (
          <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${
            q.current ? 'bg-training/10 border border-training/30' : ''
          }`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              q.current ? 'border-training' : 'border-lesson-quest-meta'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${q.current ? 'bg-training' : ''}`}></div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-lesson-quest-meta">クエスト {q.quest}</p>
              <p className="text-xs font-medium text-lesson-quest-title">{q.title}</p>
            </div>
            <span className="text-[10px] text-lesson-quest-meta">{q.articles}記事</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const actionPatterns: PatternData[] = [
  // 出口設計（Pattern 13-16）
  {
    id: 'pattern-13',
    number: 13,
    title: '完了サマリーカード',
    description: '学んだことの要約（3点）、所要時間、完了日時を表示。',
    reference: 'Coursera',
    category: 'action',
    icon: <FileText className="w-6 h-6" />,
    preview: <CompletionSummaryPreview />,
    details: [
      '学んだことの3点サマリー',
      '所要時間の記録',
      '完了日時のタイムスタンプ',
      'ソーシャルシェア機能',
    ],
  },
  {
    id: 'pattern-14',
    number: 14,
    title: '次のステップ選択肢',
    description: '「次のレッスン」「復習する」「関連コースを見る」3択のカード形式。',
    reference: 'Linear, Stripe',
    category: 'action',
    icon: <Signpost className="w-6 h-6" />,
    preview: <NextStepsPreview />,
    details: [
      '次のレッスンへの導線',
      '復習オプション',
      '関連コースの推薦',
      'ユーザーの選択に基づくパーソナライズ',
    ],
  },
  {
    id: 'pattern-15',
    number: 15,
    title: '達成バッジ',
    description: 'レッスン完了でバッジ獲得。マイページに表示。',
    reference: 'Khan Academy, Duolingo',
    category: 'action',
    icon: <Award className="w-6 h-6" />,
    preview: <AchievementBadgePreview />,
    details: [
      'レッスン完了でバッジを付与',
      'マイページにコレクション表示',
      'バッジのレアリティ設定',
      'ソーシャルシェア機能',
    ],
  },
  {
    id: 'pattern-16',
    number: 16,
    title: '振り返りプロンプト',
    description: '「このレッスンで印象に残ったことは？」任意入力 → コミュニティ共有。',
    reference: 'Headspace',
    category: 'action',
    icon: <MessageSquare className="w-6 h-6" />,
    preview: <ReflectionPromptPreview />,
    details: [
      '任意入力のテキストエリア',
      'コミュニティへの共有オプション',
      '振り返りの習慣化を促進',
      '学習の定着率向上',
    ],
  },
  // 全体体験（Pattern 17-21）
  {
    id: 'pattern-17',
    number: 17,
    title: '学習ストリーク表示',
    description: 'ページ上部に「3日連続学習中！」ストリークリストア機能（週1回）。',
    reference: 'Duolingo, Forest',
    category: 'action',
    icon: <Flame className="w-6 h-6" />,
    preview: <StreakDisplayPreview />,
    details: [
      '連続学習日数の表示',
      'ストリーク維持のモチベーション',
      'ストリークリストア機能（週1回）',
      '2.3x DAU向上の実績（Duolingo）',
    ],
  },
  {
    id: 'pattern-18',
    number: 18,
    title: '視覚的コントラスト',
    description: 'セクションごとに背景色を変化。スクロールを促進するデザイン。',
    reference: 'Apple Product Page',
    category: 'action',
    icon: <Layers className="w-6 h-6" />,
    preview: <VisualContrastPreview />,
    details: [
      'セクション間の背景色変化',
      'スクロール促進効果',
      '情報のグループ化を視覚的に表現',
      'Apple製品ページのような没入体験',
    ],
  },
  {
    id: 'pattern-19',
    number: 19,
    title: 'マスコット/キャラクター',
    description: 'BONOキャラクターからの励まし。進捗に応じたコメント変化。',
    reference: 'Duolingo (Duo), Forest',
    category: 'action',
    icon: <SmilePlus className="w-6 h-6" />,
    preview: <MascotPreview />,
    details: [
      'ブランドキャラクターからのメッセージ',
      '進捗に応じたコメント変化',
      '親近感と愛着の醸成',
      'ユーザーリテンションの向上',
    ],
  },
  {
    id: 'pattern-20',
    number: 20,
    title: '学習カレンダーヒートマップ',
    description: 'GitHubスタイルの学習履歴。「今日も1つ進めよう」のモチベーション。',
    reference: 'GitHub Contribution Graph',
    category: 'action',
    icon: <CalendarDays className="w-6 h-6" />,
    preview: <CalendarHeatmapPreview />,
    details: [
      'GitHubスタイルの学習履歴',
      '日ごとの学習量を可視化',
      'モチベーション維持効果',
      '長期的な学習習慣の形成',
    ],
  },
  {
    id: 'pattern-21',
    number: 21,
    title: 'フルページレッスン詳細',
    description: 'ヒーロー、メリット、カリキュラムを統合したレッスン詳細ページの全体設計。',
    reference: 'BONO Figma Design',
    category: 'action',
    icon: <Layout className="w-6 h-6" />,
    preview: <FullPageLessonPreview />,
    details: [
      'ヒーローセクション: カテゴリバッジ、タイトル、進捗バー、CTA',
      '得られるメリット: イントロ動画プレビュー、学習内容の概要',
      'カリキュラム: クエスト一覧、記事数、進捗表示',
      '対象者セクション: ペルソナカード形式',
      'ドット点線の区切り線でセクション分割',
    ],
  },
];

export default actionPatterns;
