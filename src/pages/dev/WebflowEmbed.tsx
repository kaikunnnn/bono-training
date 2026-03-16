/**
 * Webflow埋め込みコード 設定・プレビューページ
 *
 * - 現在の設定内容を表示
 * - 実際のプレビューを表示（リスト形式）
 * - Webflowへの設定手順を説明
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// 現在の設定（docs/webflow-embed-code.html と同期）
// ============================================
const CONFIG = {
  BASE_URL: 'https://bono-training.vercel.app',
  SANITY_PROJECT_ID: 'cqszh4up',
  SANITY_DATASET: 'production',
  SECTION_TITLE: '最新コンテンツ',
};

// 表示するコンテンツ（手動指定）
const ITEMS = [
  { type: 'lesson', slug: 'ui-design-flow-lv1' },
  { type: 'lesson', slug: 'failurepoint' },
  { type: 'lesson', slug: 'zerokara-userinterview' },
  { type: 'lesson', slug: 'bannerbeginner' },
  { type: 'lesson', slug: 'rookiesaction' },
  { type: 'lesson', slug: 'figma-elementary' },
];

// タイプ別設定
const TYPE_CONFIG: Record<string, { label: string; badgeColor: string; pathPrefix: string; emoji: string }> = {
  lesson: {
    label: 'レッスン',
    badgeColor: 'bg-blue-100 text-blue-700',
    pathPrefix: '/lessons/',
    emoji: '📚',
  },
  article: {
    label: '記事',
    badgeColor: 'bg-pink-100 text-pink-700',
    pathPrefix: '/articles/',
    emoji: '📝',
  },
  blogPost: {
    label: 'ブログ',
    badgeColor: 'bg-green-100 text-green-700',
    pathPrefix: '/blog/',
    emoji: '✏️',
  },
};

// ============================================
// 型定義
// ============================================
interface ContentItem {
  _id: string;
  _type: string;
  _updatedAt: string;
  title: string;
  slug: string;
  thumbnail?: { asset?: { _ref?: string } };
  thumbnailUrl?: string;
  iconImageUrl?: string;
}

// ============================================
// ヘルパー関数
// ============================================
function getSanityImageUrl(image: ContentItem['thumbnail'], width = 200): string | null {
  if (!image?.asset?._ref) return null;
  const ref = image.asset._ref;
  const match = ref.match(/^image-(\w+)-(\d+x\d+)-(\w+)$/);
  if (!match) return null;
  const [, id, dimensions, format] = match;
  return `https://cdn.sanity.io/images/${CONFIG.SANITY_PROJECT_ID}/${CONFIG.SANITY_DATASET}/${id}-${dimensions}.${format}?w=${width}&fit=crop&auto=format`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// ============================================
// メインコンポーネント
// ============================================
export default function WebflowEmbedPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // タイプ別にslugをグループ化
      const byType: Record<string, string[]> = {};
      ITEMS.forEach(item => {
        if (!byType[item.type]) byType[item.type] = [];
        byType[item.type].push(`"${item.slug}"`);
      });

      // 各タイプのクエリを結合
      const queries = Object.entries(byType).map(([type, slugs]) => {
        return `*[_type == "${type}" && slug.current in [${slugs.join(',')}]] {
          _id,
          _type,
          _updatedAt,
          title,
          "slug": slug.current,
          thumbnail,
          thumbnailUrl,
          ${type === 'lesson' ? 'iconImageUrl,' : ''}
        }`;
      });

      const fullQuery = `[${queries.join(',')}]`;
      const url = `https://${CONFIG.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${CONFIG.SANITY_DATASET}?query=${encodeURIComponent(fullQuery)}`;

      const response = await fetch(url);
      const data = await response.json();

      // 結果をフラット化してマップ化
      const allItems = data.result.flat();
      const itemMap: Record<string, ContentItem> = {};
      allItems.forEach((item: ContentItem) => {
        itemMap[`${item._type}:${item.slug}`] = item;
      });

      // ITEMSの順序で並べ直す
      const orderedItems = ITEMS.map(item => itemMap[`${item.type}:${item.slug}`]).filter(Boolean);
      setItems(orderedItems);
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText('docs/webflow-embed-code.html');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              to="/dev"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              開発メニューに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Webflow埋め込みコード
            </h1>
            <p className="text-gray-600 mt-1">
              bo-no.design（Webflow）に設置して、新サイトの最新コンテンツを表示
            </p>
          </div>

          {/* 現在の設定 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">現在の設定</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">リンク先</div>
                <div className="text-sm font-medium text-gray-900 break-all">
                  {CONFIG.BASE_URL}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">表示件数</div>
                <div className="text-sm font-medium text-gray-900">
                  {ITEMS.length}件（手動指定）
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2">表示コンテンツ（この順序で表示）</div>
              <div className="space-y-2">
                {ITEMS.map((item, i) => {
                  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.lesson;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 w-4">{i + 1}.</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeConfig.badgeColor}`}>
                        {typeConfig.label}
                      </span>
                      <code className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {item.slug}
                      </code>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 設定手順 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Webflowへの設定手順</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <div className="font-medium text-gray-900">埋め込みコードをコピー</div>
                  <button
                    onClick={handleCopyPath}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-mono transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        コピーしました
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        docs/webflow-embed-code.html
                      </>
                    )}
                  </button>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-gray-700">Webflowで「Embed」エレメントを追加</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-gray-700">コードを貼り付けて公開</span>
              </li>
            </ol>
          </section>

          {/* プレビュー */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">プレビュー</h2>
              <span className="text-xs text-gray-500">実際のSanityデータを表示</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                {/* セクションタイトル */}
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {CONFIG.SECTION_TITLE}
                </h3>

                {/* リスト */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const typeConfig = TYPE_CONFIG[item._type] || TYPE_CONFIG.lesson;
                    const thumbnailUrl = getSanityImageUrl(item.thumbnail) || item.thumbnailUrl || item.iconImageUrl;

                    return (
                      <a
                        key={item._id}
                        href={`${CONFIG.BASE_URL}${typeConfig.pathPrefix}${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        {/* サムネイル */}
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt=""
                            className="w-[72px] h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-[72px] h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                            {typeConfig.emoji}
                          </div>
                        )}

                        {/* コンテンツ */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeConfig.badgeColor}`}>
                              {typeConfig.label}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {formatDate(item._updatedAt)}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {item.title}
                          </h4>
                        </div>

                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 更新方法 */}
          <section className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 mb-2">コンテンツ更新方法</h3>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>表示したいコンテンツ（type + slug）を私に伝える</li>
              <li>私が <code className="bg-amber-100 px-1 rounded">docs/webflow-embed-code.html</code> を更新</li>
              <li>更新後のコードをWebflowに貼り直す</li>
            </ol>
          </section>
        </div>
      </div>
    </Layout>
  );
}
