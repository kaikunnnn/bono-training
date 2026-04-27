/**
 * Dev環境トップページ
 * 開発者向けリソースへのナビゲーション
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, FileText, Mail, Globe, CreditCard, Eye, Volume2, Search, BookOpen } from 'lucide-react';

interface DevResourceCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  tags: string[];
}

const devResources: DevResourceCard[] = [
  {
    title: 'Webflow Embed',
    description: 'Webflow（bo-no.design）に埋め込む最新コンテンツ表示コード。設定確認とプレビュー。',
    path: '/dev/webflow-embed',
    icon: <Globe className="w-8 h-8" />,
    tags: ['Webflow', 'Sanity', 'Embed', 'Integration']
  },
  {
    title: 'Roadmap Card',
    description: 'ロードマップ一覧で使用するカードコンポーネント。グラデーションカラーのバリエーション付き。',
    path: '/dev/roadmap-card',
    icon: <CreditCard className="w-8 h-8" />,
    tags: ['Roadmap', 'Card', 'Component', 'Gradient']
  },
  {
    title: 'Roadmap Preview',
    description: '5つのロードマップのコンテンツプレビュー。詳細ページの全セクション（ヒーロー、変わる景色、面白くなる視点、カリキュラム）を確認。',
    path: '/dev/roadmap-preview',
    icon: <Eye className="w-8 h-8" />,
    tags: ['Roadmap', 'Preview', 'Content', 'Detail']
  },
  {
    title: 'Roadmap Card Wave',
    description: '波型RoadmapCardV2のプレビュー。/roadmapsで使用するカードの現在のデザイン確認。',
    path: '/dev/roadmap-card-wave',
    icon: <Eye className="w-8 h-8" />,
    tags: ['Roadmap', 'Card', 'Wave', 'V2']
  },
  {
    title: 'Training Card Preview 🎯',
    description: 'トップページのトレーニングカードプレビュー。Figmaデザインとの比較チェックリスト付き。4枚のカード（情報設計・UIUX転職・UXデザイン・UIビジュアル）を確認。',
    path: '/dev/training-card',
    icon: <CreditCard className="w-8 h-8" />,
    tags: ['Training', 'Card', 'Top', 'Checklist', 'NEW']
  },
  {
    title: 'Gradient Compare (現在 vs 提案)',
    description: '現在のグラデーションと提案されたグラデーションを並べて比較。修正が必要な箇所を視覚的に確認。',
    path: '/dev/roadmap-gradient-compare',
    icon: <Eye className="w-8 h-8" />,
    tags: ['Roadmap', 'Gradient', 'Compare', 'Review']
  },
  {
    title: 'ClearBlock Preview',
    description: 'ロードマップクリア祝福ブロックのプレビュー。水玉背景削除・背景色変更・ボタン統一の確認。',
    path: '/dev/clear-block',
    icon: <Eye className="w-8 h-8" />,
    tags: ['Roadmap', 'ClearBlock', 'Component']
  },
  {
    title: 'Hero Wave Compare',
    description: 'ロードマップ詳細ヒーローの波形振幅を比較。スマホ用の緩やかな波形を検討。',
    path: '/dev/hero-wave-compare',
    icon: <Eye className="w-8 h-8" />,
    tags: ['Roadmap', 'Hero', 'Wave', 'Mobile']
  },
  {
    title: 'Sound Effect Preview 🔊',
    description: 'トップページ読み込み時のサウンドエフェクトを3パターンで比較。自動再生ポリシーの動作確認とパターン選択。',
    path: '/dev/sound-effect-preview',
    icon: <Volume2 className="w-8 h-8" />,
    tags: ['Sound', 'Effect', 'Audio', 'UX', 'File']
  },
  {
    title: 'Synth Swoosh Preview 🎵 (推奨)',
    description: 'Web Audio APIで生成した「シュッ」音のプレビュー。音声ファイル不要で即座に動作確認可能。',
    path: '/dev/synth-swoosh-preview',
    icon: <Volume2 className="w-8 h-8" />,
    tags: ['Sound', 'Synth', 'Web Audio', 'UX', 'NEW', 'No File']
  },
  {
    title: 'Search Results Preview',
    description: '検索結果コンポーネントのプレビュー。LessonCard・ArticleItem・GuideCardを再利用した検索結果表示の確認。',
    path: '/dev/search-results',
    icon: <Search className="w-8 h-8" />,
    tags: ['Search', 'LessonCard', 'ArticleItem', 'GuideCard', 'NEW']
  },
  {
    title: 'Guide Import Manual',
    description: 'マークダウンからSanityへガイド記事を入稿する仕組みと構文リファレンス。フロントマター、カスタムブロック、実行方法を網羅。',
    path: '/dev/guide-import',
    icon: <BookOpen className="w-8 h-8" />,
    tags: ['Guide', 'Import', 'Markdown', 'Sanity', 'Manual']
  },
];

const DevHome = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold">Developer Resources</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            デザインシステム、コンポーネントライブラリ、開発ドキュメントへのアクセス
          </p>
          <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg border border-yellow-200">
            ⚠️ このページは開発環境でのみ利用可能です
          </div>
        </header>

        {/* Resource Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devResources.map((resource) => (
            <Link
              key={resource.path}
              to={resource.path}
              className="block group"
            >
              <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {resource.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Resource</span>
                  <svg
                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Email Notification Test */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            メール通知機能テスト手順
          </h3>
          <p className="text-gray-600 mb-4">
            Resend経由でメール送信が正しく動作するか確認するためのテスト手順です。
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">1. ウェルカムメール</h4>
              <p className="text-blue-800 text-sm mb-2">トリガー: <code className="px-1 bg-blue-100 rounded">checkout.session.completed</code></p>
              <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                <li>テスト用アカウントで新規サブスクリプション登録</li>
                <li>登録メールアドレスにウェルカムメールが届くか確認</li>
                <li>件名: 「BONOへようこそ！メンバーシップ登録が完了しました」</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="font-bold text-amber-900 mb-2">2. プラン変更メール</h4>
              <p className="text-amber-800 text-sm mb-2">トリガー: <code className="px-1 bg-amber-100 rounded">customer.subscription.updated</code>（プラン変更時のみ）</p>
              <ul className="text-amber-700 text-sm list-disc list-inside space-y-1">
                <li>Customer Portalでプランを変更（例: スタンダード → グロース）</li>
                <li>プラン変更メールが届くか確認</li>
                <li>件名: 「BONOメンバーシップのプランが変更されました」</li>
                <li>※キャンセル予約のみの場合はメール送信されません</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <h4 className="font-bold text-red-900 mb-2">3. 解約メール</h4>
              <p className="text-red-800 text-sm mb-2">トリガー: <code className="px-1 bg-red-100 rounded">customer.subscription.deleted</code></p>
              <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                <li>Customer Portalで解約を実行</li>
                <li>解約完了メールが届くか確認</li>
                <li>件名: 「BONOメンバーシップの解約手続きが完了しました」</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">ログ確認</h4>
              <p className="text-gray-700 text-sm">
                <a
                  href="https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/functions/stripe-webhook/logs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase Dashboard → Edge Functions → stripe-webhook → Logs
                </a>
                でメール送信のログを確認できます。
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quick Links
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="https://ui.shadcn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              shadcn/ui Documentation →
            </a>
            <a
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Tailwind CSS Docs →
            </a>
            <a
              href="https://lucide.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Lucide Icons →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevHome;
