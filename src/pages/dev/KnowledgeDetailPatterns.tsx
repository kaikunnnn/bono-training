/**
 * Knowledge Detail Patterns - お役立ち詳細ページのデザインパターン比較
 *
 * 3つのパターンを実験比較できるページ:
 * - Pattern A: Medium/Note風 - 読むことに集中
 * - Pattern B: Notion/Airbnb風 - 構造化された情報（目次付き）
 * - Pattern C: シンプル最適化 - 現状ベースの洗練
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Bookmark, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

// モックデータ
const mockKnowledge = {
  title: 'UIデザイナーが知っておくべきアクセシビリティの基本',
  excerpt: 'アクセシビリティはすべてのユーザーに優れた体験を提供するための重要な考え方です。この記事では、UIデザイナーが最低限押さえておくべきポイントを解説します。',
  category: {
    title: 'アクセシビリティ',
    emoji: '♿',
  },
  publishedAt: '2025-02-20',
  tags: ['UI', '初心者向け', 'a11y'],
  readingTime: '5分',
  thumbnailUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=60',
  content: [
    { type: 'h2', text: 'アクセシビリティとは何か' },
    { type: 'p', text: 'アクセシビリティ（Accessibility、略してa11y）とは、障害の有無にかかわらず、すべての人がウェブサイトやアプリケーションを利用できるようにするための考え方です。視覚障害、聴覚障害、運動機能障害、認知障害など、様々なユーザーのニーズに対応することが求められます。' },
    { type: 'p', text: '良いアクセシビリティは、障害を持つユーザーだけでなく、一時的に制約のある状況（明るい屋外でスマホを使う、騒がしい場所で動画を見るなど）にあるすべてのユーザーの体験を向上させます。' },
    { type: 'h2', text: 'コントラスト比の重要性' },
    { type: 'p', text: 'WCAG 2.1では、テキストと背景色のコントラスト比について具体的な基準を定めています。通常のテキストでは4.5:1以上、大きなテキスト（18px以上のボールド、または24px以上）では3:1以上のコントラスト比が必要です。' },
    { type: 'p', text: 'デザインツールの多くにはコントラスト比をチェックする機能が組み込まれています。Figmaの場合、プラグイン「Stark」や「Contrast」を使用することで簡単に確認できます。' },
    { type: 'h2', text: 'キーボードナビゲーション' },
    { type: 'p', text: 'マウスを使えないユーザーのために、すべてのインタラクティブ要素にキーボードでアクセスできることが重要です。Tabキーでフォーカスを移動し、Enterキーで操作できるようにデザインを考慮しましょう。' },
    { type: 'h3', text: 'フォーカス状態のデザイン' },
    { type: 'p', text: 'フォーカス状態は視覚的に明確にする必要があります。ブラウザのデフォルトのフォーカスリングを消さないこと、もしカスタマイズする場合は同等以上に目立つスタイルにすることが大切です。' },
    { type: 'h2', text: '色だけに頼らない情報伝達' },
    { type: 'p', text: 'エラーを赤色だけで示すのではなく、アイコンやテキストも併用しましょう。グラフやチャートでは、色に加えてパターンや凡例を使用することで、色覚特性を持つユーザーにも情報が伝わります。' },
    { type: 'h2', text: 'まとめ' },
    { type: 'p', text: 'アクセシビリティは後付けではなく、デザインプロセスの最初から考慮することが重要です。これらの基本を押さえることで、より多くのユーザーに使いやすいプロダクトを提供できるようになります。' },
  ],
  relatedKnowledge: [
    { id: '1', title: 'Figmaでコントラスト比をチェックする方法', category: { title: 'ツール', emoji: '🔧' } },
    { id: '2', title: 'カラーパレットの作り方ガイド', category: { title: 'デザイン基礎', emoji: '🎨' } },
    { id: '3', title: 'ボタンデザインのベストプラクティス', category: { title: 'UIパターン', emoji: '📦' } },
  ],
};

// ===== Pattern A: Medium/Note風 =====
const PatternA = () => {
  const formattedDate = new Date(mockKnowledge.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[650px] mx-auto px-4 py-8 md:py-16">
        {/* 戻るボタン */}
        <button className="flex items-center gap-2 text-[#666] hover:text-[#333] mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          ナレッジ一覧へ
        </button>

        {/* ヘッダー（中央寄せ） */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F7FF] text-[#1E6BB8] rounded-full text-sm font-medium">
              {mockKnowledge.category.emoji} {mockKnowledge.category.title}
            </span>
            <span className="text-[#888] text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {mockKnowledge.readingTime}で読める
            </span>
          </div>

          <h1 className="text-[32px] md:text-[42px] font-bold text-[#1a1a1a] leading-[1.2] mb-6">
            {mockKnowledge.title}
          </h1>

          <p className="text-[18px] text-[#666] leading-[1.7] mb-6">
            {mockKnowledge.excerpt}
          </p>

          <span className="text-[14px] text-[#aaa]">{formattedDate}</span>
        </header>

        {/* サムネイル */}
        <div className="mb-12 rounded-2xl overflow-hidden">
          <img
            src={mockKnowledge.thumbnailUrl}
            alt={mockKnowledge.title}
            className="w-full aspect-video object-cover"
          />
        </div>

        {/* 本文 */}
        <article className="prose-content">
          {mockKnowledge.content.map((block, idx) => {
            if (block.type === 'h2') {
              return (
                <h2 key={idx} className="text-[26px] font-bold text-[#1a1a1a] mt-12 mb-4 leading-[1.3]">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'h3') {
              return (
                <h3 key={idx} className="text-[20px] font-bold text-[#1a1a1a] mt-8 mb-3 leading-[1.4]">
                  {block.text}
                </h3>
              );
            }
            return (
              <p key={idx} className="text-[17px] leading-[1.85] text-[#333] mb-5 tracking-[0.01em]">
                {block.text}
              </p>
            );
          })}
        </article>

        {/* 区切り線 */}
        <hr className="my-12 border-[#eee]" />

        {/* タグ */}
        <div className="flex flex-wrap gap-2 mb-12">
          {mockKnowledge.tags.map((tag) => (
            <span key={tag} className="px-3 py-1.5 text-sm bg-[#f5f5f5] text-[#666] rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* 次に読むべきナレッジ */}
        <section>
          <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-6">📚 次に読むべきナレッジ</h2>
          <div className="space-y-3">
            {mockKnowledge.relatedKnowledge.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#fafafa] rounded-xl hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                <span className="text-xs text-[#888] mb-1 block">
                  {item.category.emoji} {item.category.title}
                </span>
                <span className="text-[15px] font-medium text-[#1a1a1a]">{item.title}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// ===== Pattern B: Notion/Airbnb風（目次付き） =====
const PatternB = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(mockKnowledge.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 見出しを抽出
  const headings = mockKnowledge.content
    .filter((block) => block.type === 'h2' || block.type === 'h3')
    .map((block, idx) => ({
      id: `heading-${idx}`,
      text: block.text,
      level: block.type,
    }));

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ヒーローセクション */}
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-[1100px] mx-auto px-4 py-8">
          {/* 上部ナビ */}
          <div className="flex items-center justify-between mb-8">
            <button className="flex items-center gap-2 text-[#666] hover:text-[#333] text-sm">
              <ArrowLeft className="w-4 h-4" />
              ナレッジ一覧へ
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#666] hover:bg-[#f5f5f5] rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#666] hover:bg-[#f5f5f5] rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2カラムヒーロー */}
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div className="rounded-2xl overflow-hidden aspect-video">
              <img
                src={mockKnowledge.thumbnailUrl}
                alt={mockKnowledge.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4FD] text-[#1E6BB8] rounded-md text-xs font-medium mb-4">
                {mockKnowledge.category.emoji} {mockKnowledge.category.title}
              </span>
              <h1 className="text-[28px] md:text-[34px] font-bold text-[#1a1a1a] leading-[1.25] mb-4">
                {mockKnowledge.title}
              </h1>
              <p className="text-[16px] text-[#666] leading-[1.7] mb-4">
                {mockKnowledge.excerpt}
              </p>
              <div className="flex items-center gap-4 text-[14px] text-[#888]">
                <span>{formattedDate}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {mockKnowledge.readingTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 本文エリア（目次付き） */}
      <div className="max-w-[1100px] mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[200px_1fr] gap-12">
          {/* 左サイド: 目次 */}
          <aside className="hidden md:block">
            <div className="sticky top-8">
              <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-4">目次</h3>
              <nav className="space-y-2">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-[14px] py-1 transition-colors ${
                      heading.level === 'h3' ? 'pl-3' : ''
                    } ${
                      activeSection === heading.id
                        ? 'text-[#1E6BB8] font-medium'
                        : 'text-[#666] hover:text-[#333]'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* 右サイド: 本文 */}
          <article ref={contentRef} className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            {mockKnowledge.content.map((block, idx) => {
              const headingIdx = headings.findIndex((h) => h.text === block.text);
              const headingId = headingIdx >= 0 ? headings[headingIdx].id : undefined;

              if (block.type === 'h2') {
                return (
                  <h2
                    key={idx}
                    id={headingId}
                    className="text-[24px] font-bold text-[#1a1a1a] mt-10 mb-4 leading-[1.3] first:mt-0 scroll-mt-8"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'h3') {
                return (
                  <h3
                    key={idx}
                    id={headingId}
                    className="text-[18px] font-bold text-[#1a1a1a] mt-8 mb-3 leading-[1.4] scroll-mt-8"
                  >
                    {block.text}
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-[16px] leading-[1.9] text-[#444] mb-5">
                  {block.text}
                </p>
              );
            })}
          </article>
        </div>

        {/* タグ・関連ナレッジ */}
        <div className="mt-12">
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-sm text-[#888] mr-2">🔖 関連タグ:</span>
            {mockKnowledge.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-sm bg-white text-[#666] rounded-md border border-[#eee]">
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-6">📚 このカテゴリのおすすめ</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {mockKnowledge.relatedKnowledge.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white rounded-xl border border-[#eee] hover:border-[#ddd] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="text-xs text-[#888] mb-2 block">
                  {item.category.emoji} {item.category.title}
                </span>
                <span className="text-[15px] font-medium text-[#1a1a1a] line-clamp-2">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== Pattern C: シンプル最適化 =====
const PatternC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formattedDate = new Date(mockKnowledge.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 進捗バー */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#eee] z-50">
        <div
          className="h-full bg-[#2563EB] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="max-w-[720px] mx-auto px-4 py-8 md:py-12">
        {/* 戻るボタン */}
        <div className="mb-6">
          <button className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
            <ArrowLeft className="w-5 h-5 text-black" />
            <span className="font-semibold text-sm text-black">ナレッジ一覧へ</span>
          </button>
        </div>

        {/* サムネイル（最上部に移動） */}
        <div className="mb-6 rounded-2xl overflow-hidden">
          <img
            src={mockKnowledge.thumbnailUrl}
            alt={mockKnowledge.title}
            className="w-full aspect-video object-cover"
          />
        </div>

        {/* メタ情報（1行にまとめる） */}
        <div className="flex items-center gap-3 text-[14px] text-[#666] mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8F4FD] text-[#1E6BB8] rounded-md text-xs font-medium">
            {mockKnowledge.category.emoji} {mockKnowledge.category.title}
          </span>
          <span>・</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {mockKnowledge.readingTime}
          </span>
          <span>・</span>
          <span>{formattedDate}</span>
        </div>

        {/* タイトル */}
        <h1 className="text-[26px] md:text-[36px] font-bold text-[#1a1a1a] leading-[1.25] mb-4">
          {mockKnowledge.title}
        </h1>

        {/* 説明文 */}
        <p className="text-[16px] md:text-[18px] text-[#555] leading-[1.7] mb-8">
          {mockKnowledge.excerpt}
        </p>

        {/* 本文 */}
        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-[#eee]">
          {mockKnowledge.content.map((block, idx) => {
            if (block.type === 'h2') {
              return (
                <h2 key={idx} className="text-[22px] font-bold text-[#1a1a1a] mt-10 mb-4 leading-[1.3] first:mt-0">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'h3') {
              return (
                <h3 key={idx} className="text-[18px] font-bold text-[#1a1a1a] mt-8 mb-3 leading-[1.4]">
                  {block.text}
                </h3>
              );
            }
            return (
              <p key={idx} className="text-[16px] leading-[1.85] text-[#444] mb-5">
                {block.text}
              </p>
            );
          })}
        </article>

        {/* 区切り線 */}
        <hr className="my-10 border-[#eee]" />

        {/* タグ */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="text-sm text-[#888] mr-2">🔖 タグ:</span>
          {mockKnowledge.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 text-sm bg-white text-[#666] rounded-full border border-[#eee]">
              {tag}
            </span>
          ))}
        </div>

        {/* もっと読む（統合版） */}
        <section>
          <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-6">📚 もっと読む</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mockKnowledge.relatedKnowledge.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-xl border border-[#eee] hover:border-[#ddd] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="text-xs text-[#888] mb-1 block">
                  {item.category.emoji} {item.category.title}
                </span>
                <span className="text-[15px] font-medium text-[#1a1a1a]">{item.title}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// ===== メインコンポーネント =====
const KnowledgeDetailPatterns = () => {
  const [activePattern, setActivePattern] = useState<'A' | 'B' | 'C'>('A');

  const patterns = [
    { id: 'A', name: 'Medium/Note風', description: '読むことに集中、中央寄せレイアウト' },
    { id: 'B', name: 'Notion/Airbnb風', description: '目次付き、構造化された情報' },
    { id: 'C', name: 'シンプル最適化', description: '現状ベースの洗練、進捗バー付き' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* パターン切り替えUI */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
        <div className="flex gap-2">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => setActivePattern(pattern.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePattern === pattern.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block">{pattern.name}</span>
              <span className="block text-xs opacity-70">{pattern.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 戻るリンク */}
      <Link
        to="/dev"
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* パターン表示 */}
      <div className="pt-20">
        {activePattern === 'A' && <PatternA />}
        {activePattern === 'B' && <PatternB />}
        {activePattern === 'C' && <PatternC />}
      </div>

      {/* 説明パネル */}
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
        <h3 className="font-bold text-sm mb-2">
          {patterns.find((p) => p.id === activePattern)?.name}
        </h3>
        <p className="text-xs text-gray-600">
          {activePattern === 'A' && (
            <>
              本文幅を650pxに制限し、読みやすさを重視。
              見出しを中央寄せにしてマガジン風に。
              タグは本文後に移動してノイズ削減。
            </>
          )}
          {activePattern === 'B' && (
            <>
              ヒーローセクションを2カラム（画像+メタ）。
              本文横にスティッキーな目次を配置。
              読みながら現在位置がわかる構造。
            </>
          )}
          {activePattern === 'C' && (
            <>
              サムネイルを最上部に移動（ビジュアルファースト）。
              メタ情報を1行にまとめ、進捗バーを追加。
              現状からの変更を最小限に抑えた改善。
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default KnowledgeDetailPatterns;
