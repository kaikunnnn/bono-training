// src/data/blog/mockPosts.ts
import { BlogPost } from '@/types/blog';

export const mockPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'getting-started-with-react',
    title: '⚛️ Reactを始めよう - 初心者向けガイド',
    emoji: '⚛️',
    description: 'Reactの基本から学ぶ初心者向けガイドです。コンポーネントの作り方から状態管理まで、わかりやすく解説します。',
    content: `
      <h2>Reactとは</h2>
      <p>Reactはユーザーインターフェースを構築するためのJavaScriptライブラリです。</p>
      <h2>コンポーネントの基本</h2>
      <p>Reactではコンポーネントという単位でUIを構築します。</p>
      <pre><code>function Hello() {
  return &lt;h1&gt;Hello, World!&lt;/h1&gt;;
}</code></pre>
      <h2>まとめ</h2>
      <p>Reactを使うことで、再利用可能なUIコンポーネントを作成できます。</p>
    `,
    author: '山田太郎',
    publishedAt: '2024-01-15T00:00:00Z',
    category: 'tech',
    tags: ['React', 'JavaScript', 'Web開発'],
    thumbnail: '/blog/images/sample-1.jpg',
    featured: true,
    readingTime: 5,
  },
  {
    id: '2',
    slug: 'modern-web-design-trends',
    title: '🎨 モダンWebデザインのトレンド2024',
    emoji: '🎨',
    description: '2024年のWebデザインで注目すべきトレンドを紹介。ミニマリズムからグラフィックデザインまで幅広く解説します。',
    content: `
      <h2>2024年のデザイントレンド</h2>
      <p>今年のWebデザインは、シンプルさと機能性を重視したトレンドが主流です。</p>
      <h2>カラーパレットの選び方</h2>
      <p>適切なカラーパレットの選択がデザインの成功を左右します。</p>
      <h2>タイポグラフィの重要性</h2>
      <p>読みやすさを重視したタイポグラフィが求められています。</p>
    `,
    author: '佐藤花子',
    publishedAt: '2024-01-12T00:00:00Z',
    category: 'design',
    tags: ['Webデザイン', 'UI/UX', 'トレンド'],
    thumbnail: '/blog/images/sample-2.jpg',
    featured: true,
    readingTime: 7,
  },
  {
    id: '3',
    slug: 'productivity-tools-2024',
    title: '🚀 生産性を高める2024年のおすすめツール',
    emoji: '🚀',
    description: 'リモートワークが定着した今、生産性を高めるために必要なツールを厳選してご紹介します。',
    content: `
      <h2>タスク管理ツール</h2>
      <p>効率的なタスク管理のためのおすすめツールを紹介します。</p>
      <h2>コミュニケーションツール</h2>
      <p>チームでの円滑なコミュニケーションをサポートするツールです。</p>
      <h2>自動化ツール</h2>
      <p>繰り返し作業を自動化して時間を節約しましょう。</p>
    `,
    author: '田中次郎',
    publishedAt: '2024-01-10T00:00:00Z',
    category: 'business',
    tags: ['生産性', 'ツール', 'リモートワーク'],
    thumbnail: '/blog/images/sample-3.jpg',
    featured: false,
    readingTime: 4,
  },
  {
    id: '4',
    slug: 'healthy-work-life-balance',
    title: '⚖️ ワークライフバランスを保つ秘訣',
    emoji: '⚖️',
    description: '仕事とプライベートの両立は現代人の大きな課題。健康的なバランスを保つための実践的なアドバイスをお届けします。',
    content: `
      <h2>時間管理の基本</h2>
      <p>効果的な時間管理の方法について解説します。</p>
      <h2>ストレス管理</h2>
      <p>日々のストレスをコントロールする方法を学びましょう。</p>
      <h2>健康的な習慣</h2>
      <p>長期的に続けられる健康習慣を身に着けることが重要です。</p>
    `,
    author: '鈴木美咲',
    publishedAt: '2024-01-08T00:00:00Z',
    category: 'lifestyle',
    tags: ['ワークライフバランス', '健康', 'ライフスタイル'],
    thumbnail: '/blog/images/sample-1.jpg',
    featured: false,
    readingTime: 6,
  },
  {
    id: '5',
    slug: 'typescript-best-practices',
    title: '📘 TypeScript ベストプラクティス集',
    emoji: '📘',
    description: 'TypeScriptを使った開発で知っておきたいベストプラクティスを実例とともに解説します。',
    content: `
      <h2>型定義の書き方</h2>
      <p>効果的な型定義の方法について説明します。</p>
      <h2>エラーハンドリング</h2>
      <p>TypeScriptでの適切なエラーハンドリング手法です。</p>
      <h2>パフォーマンス最適化</h2>
      <p>TypeScriptアプリケーションのパフォーマンスを向上させる方法です。</p>
    `,
    author: '山田太郎',
    publishedAt: '2024-01-05T00:00:00Z',
    category: 'tech',
    tags: ['TypeScript', 'JavaScript', 'ベストプラクティス'],
    thumbnail: '/blog/images/sample-2.jpg',
    featured: false,
    readingTime: 8,
  },
  {
    id: '6',
    slug: 'ux-design-principles',
    title: '✨ UXデザインの基本原則',
    emoji: '✨',
    description: '良いユーザーエクスペリエンスを提供するためのデザイン原則を、具体例とともに詳しく解説します。',
    content: `
      <h2>ユーザビリティの原則</h2>
      <p>使いやすいインターフェースを作るための基本原則です。</p>
      <h2>アクセシビリティ</h2>
      <p>すべてのユーザーが利用できるデザインを心がけましょう。</p>
      <h2>情報設計</h2>
      <p>情報を整理し、わかりやすく伝える方法について解説します。</p>
    `,
    author: '佐藤花子',
    publishedAt: '2024-01-03T00:00:00Z',
    category: 'design',
    tags: ['UX', 'デザイン', 'ユーザビリティ'],
    thumbnail: '/blog/images/sample-3.jpg',
    featured: false,
    readingTime: 9,
  },
];