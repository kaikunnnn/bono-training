/**
 * Dev環境トップページ
 * 開発者向けリソースへのナビゲーション
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Palette, FileText, Layers, BookOpen, Rss, Globe, CheckCircle, PartyPopper, ListChecks, LayoutList, Sparkles, LayoutGrid, MousePointerClick, Mail } from 'lucide-react';

interface DevResourceCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  tags: string[];
}

const devResources: DevResourceCard[] = [
  {
    title: 'Component Reference',
    description: 'デザインシステムとコンポーネントライブラリの完全なリファレンス。カラー、タイポグラフィ、アニメーション、UIコンポーネントなど。',
    path: '/dev/components',
    icon: <Layers className="w-8 h-8" />,
    tags: ['Colors', 'Typography', 'Animations', 'UI', 'Custom Components']
  },
  {
    title: 'ガイド記事執筆マニュアル',
    description: '/guideセクションで記事を書くための完全ガイド。Frontmatter、Markdown記法、画像管理、カテゴリ追加方法など。',
    path: '/dev/guide-manual',
    icon: <BookOpen className="w-8 h-8" />,
    tags: ['Guide', 'Writing', 'Markdown', 'Documentation']
  },
  {
    title: 'Blog開発ガイド',
    description: 'Ghost CMSを使用したブログ機能の開発・運用方法。Dockerセットアップ、記事公開、トラブルシューティングなど。',
    path: '/dev/blog',
    icon: <Rss className="w-8 h-8" />,
    tags: ['Ghost', 'CMS', 'Blog', 'Docker']
  },
  {
    title: 'Webflow Test',
    description: 'Webflowからのコンテンツ取得テスト。API連携の確認用。',
    path: '/dev/webflow-test',
    icon: <Globe className="w-8 h-8" />,
    tags: ['Webflow', 'API', 'Test']
  },
  {
    title: 'Progress Components',
    description: '進捗表示コンポーネントのプレビュー。プログレスバー、完了状態など。',
    path: '/dev/progress-components',
    icon: <CheckCircle className="w-8 h-8" />,
    tags: ['Progress', 'UI', 'Components']
  },
  {
    title: 'Celebration Components',
    description: 'お祝い・達成時のアニメーションコンポーネント。紙吹雪、バッジなど。',
    path: '/dev/celebration',
    icon: <PartyPopper className="w-8 h-8" />,
    tags: ['Animation', 'Celebration', 'UI']
  },
  {
    title: 'Quest Components',
    description: 'クエスト（レッスン内セクション）のコンポーネントプレビュー。',
    path: '/dev/quest',
    icon: <ListChecks className="w-8 h-8" />,
    tags: ['Quest', 'Lesson', 'Components']
  },
  {
    title: 'Lesson Header Components',
    description: 'レッスンヘッダーのレイアウト・スタイルバリエーション。',
    path: '/dev/lesson-header',
    icon: <LayoutList className="w-8 h-8" />,
    tags: ['Lesson', 'Header', 'Layout']
  },
  {
    title: 'Icon Animations',
    description: 'アイコンのアニメーションパターン。ホバー、クリック時の動きなど。',
    path: '/dev/icon-animations',
    icon: <Sparkles className="w-8 h-8" />,
    tags: ['Icons', 'Animation', 'Interaction']
  },
  {
    title: 'IconButton Burst Playground',
    description: '「完了にする」ボタンの弾けるアニメーションを複数パターンで比較・調整。',
    path: '/dev/icon-button-burst',
    icon: <MousePointerClick className="w-8 h-8" />,
    tags: ['IconButton', 'Burst', 'Animation', 'Experiment']
  },
  {
    title: 'Quest Item Layouts',
    description: 'クエストアイテムのレイアウト比較。タグ+タイトルの表示パターン。',
    path: '/dev/quest-layouts',
    icon: <LayoutGrid className="w-8 h-8" />,
    tags: ['Quest', 'Layout', 'Comparison']
  },
  {
    title: 'Email Templates',
    description: 'BONOのトランザクションメールテンプレートのプレビュー。パスワードリセット、メール確認など。',
    path: '/dev/email-templates',
    icon: <Mail className="w-8 h-8" />,
    tags: ['Email', 'Templates', 'Transactional']
  }
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
