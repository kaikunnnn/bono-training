/**
 * LessonDetailPatterns - レッスン詳細ページのデザインアイデア一覧（リンクまとめ）
 *
 * 5つの調査レポートを統合し、レッスン詳細ページを
 * 「情報提供」から「ワクワクするジャーニー」に変革する20のデザインアイデア。
 *
 * 各アイデアはフルページのプロトタイプとして実装。
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Target,
  ArrowLeftRight,
  Map,
  Flame,
  Sword,
  Image,
  Focus,
  User,
  Clock,
  CheckSquare,
  BookOpen,
  Coffee,
  Users,
  GitBranch,
  Layers,
  Sliders,
  Award,
  Eye,
  Heart,
  ChevronRight,
  Sparkles,
  FileText,
  ExternalLink,
} from 'lucide-react';

const ideas = [
  {
    id: 1,
    title: 'シネマティック・イマーシブ',
    description: 'MasterClassスタイル - フルスクリーン動画ヒーロー、没入体験',
    icon: Film,
    reference: 'MasterClass, Skillshare',
    color: 'indigo',
  },
  {
    id: 2,
    title: 'ゴール設定ファースト',
    description: 'Notion/Duolingoスタイル - 最初にゴール選択、パーソナライズ体験',
    icon: Target,
    reference: 'Notion, Duolingo',
    color: 'blue',
  },
  {
    id: 3,
    title: 'Before/After中心',
    description: 'Refactoring UIスタイル - ビジュアル変化を最初に見せる',
    icon: ArrowLeftRight,
    reference: 'Refactoring UI, Design+Code',
    color: 'cyan',
  },
  {
    id: 4,
    title: 'ロードマップ/星座型',
    description: 'Khan Academyスタイル - 視覚的な学習パスを星座風に表示',
    icon: Map,
    reference: 'Khan Academy, Learn UI Design',
    color: 'purple',
  },
  {
    id: 5,
    title: 'ストリーク＆XP重視',
    description: 'Duolingoスタイル - ゲーミフィケーション中心のUI',
    icon: Flame,
    reference: 'Duolingo, Forest',
    color: 'orange',
  },
  {
    id: 6,
    title: 'クエスト冒険型',
    description: 'Habiticaスタイル - RPG/冒険テーマのゲーム風UI',
    icon: Sword,
    reference: 'Habitica, RPGゲーム',
    color: 'amber',
  },
  {
    id: 7,
    title: 'プロジェクトギャラリー',
    description: 'Skillshareスタイル - 学生作品を最初に見せるギャラリー型',
    icon: Image,
    reference: 'Skillshare, Dribbble',
    color: 'pink',
  },
  {
    id: 8,
    title: '1セクション集中',
    description: 'Linearスタイル - 今やるべきことに集中したミニマルUI',
    icon: Focus,
    reference: 'Linear, Notion',
    color: 'slate',
  },
  {
    id: 9,
    title: '講師中心',
    description: 'MasterClass/DesignLabスタイル - 講師の存在感を最大化',
    icon: User,
    reference: 'MasterClass, DesignLab',
    color: 'violet',
  },
  {
    id: 10,
    title: '時間軸タイムライン',
    description: '時間ベースの進行を視覚化したタイムラインUI',
    icon: Clock,
    reference: 'Stripe Docs, Linear',
    color: 'teal',
  },
  {
    id: 11,
    title: 'チェックリスト進行',
    description: 'Asana/Todoistスタイル - タスク完了の達成感を重視',
    icon: CheckSquare,
    reference: 'Asana, Todoist',
    color: 'green',
  },
  {
    id: 12,
    title: 'ストーリーテリング型',
    description: 'Appleスタイル - スクロールでストーリーが展開する没入体験',
    icon: BookOpen,
    reference: 'Apple, Product Page',
    color: 'gray',
  },
  {
    id: 13,
    title: 'マイクロラーニング',
    description: '「1日5分」の気軽さを強調したUI',
    icon: Coffee,
    reference: 'Duolingo, Headspace',
    color: 'yellow',
  },
  {
    id: 14,
    title: 'コミュニティ連携',
    description: 'Headspace/Discordスタイル - 他の学習者と繋がるUI',
    icon: Users,
    reference: 'Headspace, Discord',
    color: 'fuchsia',
  },
  {
    id: 15,
    title: 'スキルツリー型',
    description: 'Khan Academy / RPGスキルツリースタイル - スキル解放を視覚化',
    icon: GitBranch,
    reference: 'Khan Academy, RPGゲーム',
    color: 'sky',
  },
  {
    id: 16,
    title: 'フレームワーク図解',
    description: 'レッスンの全体構造を図解で見せるUI',
    icon: Layers,
    reference: 'Figma Resource Library',
    color: 'red',
  },
  {
    id: 17,
    title: '難易度選択',
    description: '学習者のレベルに応じたパス選択UI',
    icon: Sliders,
    reference: 'Codecademy, Khan Academy',
    color: 'emerald',
  },
  {
    id: 18,
    title: '成功事例ファースト',
    description: 'DesignLabスタイル - 成功した卒業生のストーリーを前面に',
    icon: Award,
    reference: 'DesignLab, Coursera',
    color: 'blue',
  },
  {
    id: 19,
    title: 'インタラクティブプレビュー',
    description: 'Figmaスタイル - 学習コンテンツをその場でプレビュー',
    icon: Eye,
    reference: 'Figma, Framer',
    color: 'indigo',
  },
  {
    id: 20,
    title: '感情ジャーニー型',
    description: '学習者の感情に寄り添うエモーショナルなUI',
    icon: Heart,
    reference: 'Headspace, Calm',
    color: 'rose',
  },
];

const researchDocs = [
  { title: '現状UX分析', path: '01-pdm-current-state.md' },
  { title: 'ゲーミフィケーション', path: '02-gamification-research.md' },
  { title: 'プレミアム学習UX', path: '03-premium-learning-research.md' },
  { title: 'ジャーニー設計', path: '04-journey-design-research.md' },
  { title: 'デザイン教育', path: '05-design-education-research.md' },
];

const colorClasses: Record<string, string> = {
  indigo: 'bg-indigo-500',
  blue: 'bg-blue-500',
  cyan: 'bg-cyan-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  pink: 'bg-pink-500',
  slate: 'bg-slate-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  green: 'bg-green-500',
  gray: 'bg-gray-700',
  yellow: 'bg-yellow-500',
  fuchsia: 'bg-fuchsia-500',
  sky: 'bg-sky-500',
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const LessonDetailPatterns = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-10">
          <Link
            to="/dev"
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
          >
            ← Dev Resources
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-rounded-mplus">
            レッスン詳細ページ デザインアイデア
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            「情報提供」から「ワクワクするジャーニー」への変革 • 全20パターン
          </p>

          {/* コンセプト説明 */}
          <div className="bg-gradient-to-br from-training/10 to-orange-50 border border-training/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-training mt-0.5" />
              <div>
                <h2 className="font-bold text-gray-900 mb-2">このページの目的</h2>
                <p className="text-gray-600">
                  初めてユーザーがレッスン詳細ページに訪れた時、「このレッスンで何を得られるか」が分かり、
                  「やってみたい！」と思えるUI/UXのアイデアを20個のフルページプロトタイプとして提案します。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* アイデア一覧 */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-rounded-mplus">
            20のデザインアイデア
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            各カードをクリックしてフルページのプロトタイプを確認できます
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                to={`/dev/lesson-idea-${idea.id}`}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${colorClasses[idea.color]} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    <idea.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Idea {idea.id}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 truncate">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {idea.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      参考: {idea.reference}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 参考資料 */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {/* ベストプラクティス出典 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-gray-400" />
              主要な参考事例
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { name: 'MasterClass', desc: 'シネマティック動画、講師の存在感', color: 'bg-purple-500' },
                { name: 'Duolingo', desc: 'ストリーク、XP、ゲーミフィケーション', color: 'bg-green-500' },
                { name: 'Notion/Linear', desc: 'セルフセグメンテーション、ミニマル', color: 'bg-blue-500' },
                { name: 'Apple', desc: '映画的スクロール、ストーリーテリング', color: 'bg-gray-700' },
                { name: 'Refactoring UI', desc: 'ビジュアルファースト、Before/After', color: 'bg-orange-500' },
              ].map((ref, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ref.color}`}></div>
                  <div>
                    <span className="font-medium text-gray-900">{ref.name}</span>
                    <p className="text-gray-500 text-xs">{ref.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 調査ドキュメント */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              調査ドキュメント
            </h3>
            <ul className="space-y-2 text-sm">
              {researchDocs.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-gray-900">{doc.title}:</span>
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    {doc.path}
                  </code>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400">
              .claude/docs/features/lesson-detail-redesign/research/
            </p>
          </div>
        </div>

        {/* 対象レッスン */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">対象レッスン</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
              UI
            </div>
            <div>
              <p className="font-semibold text-gray-900">UIが上手くなる人の"デザインサイクル" ─ 入門編β</p>
              <p className="text-sm text-gray-500">
                6クエスト • 全23記事 • 約9時間
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to="/lessons/ui-design-flow-lv1"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              現在のレッスン詳細ページを見る
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailPatterns;
