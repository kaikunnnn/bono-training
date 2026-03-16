/**
 * Webflow埋め込みコード 設定・プレビューページ
 *
 * - 現在の設定内容を表示
 * - 実際のプレビューを表示
 * - Webflowへの設定手順を説明
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// 現在の設定（docs/webflow-embed-code.html と同期）
const CURRENT_CONFIG = {
  BASE_URL: 'https://bono-training.vercel.app',
  SANITY_PROJECT_ID: 'cqszh4up',
  SANITY_DATASET: 'production',
  MAX_ITEMS: 6,
  SHOW_LESSONS: true,
  SHOW_ARTICLES: false,
  SHOW_KNOWLEDGE: false,
  SECTION_TITLE: '最新コンテンツ',
};

// Sanityからデータ取得
interface ContentItem {
  _id: string;
  _type: string;
  _updatedAt: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  iconImageUrl?: string;
}

export default function WebflowEmbedPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const types = [];
      if (CURRENT_CONFIG.SHOW_LESSONS) types.push('"lesson"');
      if (CURRENT_CONFIG.SHOW_ARTICLES) types.push('"article"');
      if (CURRENT_CONFIG.SHOW_KNOWLEDGE) types.push('"knowledge"');

      const query = `*[_type in [${types.join(',')}]] | order(_updatedAt desc)[0...${CURRENT_CONFIG.MAX_ITEMS}] {
        _id,
        _type,
        _updatedAt,
        title,
        "slug": slug.current,
        thumbnailUrl,
        iconImageUrl
      }`;

      const url = `https://${CURRENT_CONFIG.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${CURRENT_CONFIG.SANITY_DATASET}?query=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const data = await response.json();
      setItems(data.result || []);
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;

    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lesson: 'レッスン',
      article: '記事',
      knowledge: 'ナレッジ',
    };
    return labels[type] || type;
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText('docs/webflow-embed-code.html');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
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

          {/* 設定内容 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">現在の設定</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">リンク先</div>
                <div className="text-sm font-medium text-gray-900 break-all">
                  {CURRENT_CONFIG.BASE_URL}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">表示件数</div>
                <div className="text-sm font-medium text-gray-900">
                  {CURRENT_CONFIG.MAX_ITEMS}件
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">表示タイプ</div>
                <div className="text-sm font-medium text-gray-900">
                  {[
                    CURRENT_CONFIG.SHOW_LESSONS && 'レッスン',
                    CURRENT_CONFIG.SHOW_ARTICLES && '記事',
                    CURRENT_CONFIG.SHOW_KNOWLEDGE && 'ナレッジ',
                  ].filter(Boolean).join(', ') || 'なし'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Sanity Dataset</div>
                <div className="text-sm font-medium text-gray-900">
                  {CURRENT_CONFIG.SANITY_DATASET}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">セクションタイトル</div>
                <div className="text-sm font-medium text-gray-900">
                  {CURRENT_CONFIG.SECTION_TITLE}
                </div>
              </div>
            </div>
          </section>

          {/* Webflow設定手順 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Webflowへの設定手順</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <div className="font-medium text-gray-900">埋め込みコードをコピー</div>
                  <div className="text-sm text-gray-600 mt-1">
                    以下のファイルの内容を全てコピー
                  </div>
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
                <div>
                  <div className="font-medium text-gray-900">Webflowで Embed エレメントを追加</div>
                  <div className="text-sm text-gray-600 mt-1">
                    表示したいページの場所に「Embed」エレメントをドラッグ&ドロップ
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <div className="font-medium text-gray-900">コードを貼り付け</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Embedエレメントにコピーしたコードを貼り付けて保存
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <div className="font-medium text-gray-900">公開</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Webflowで公開すれば完了
                  </div>
                </div>
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
              <div>
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    {CURRENT_CONFIG.SECTION_TITLE}
                  </h3>
                  <a
                    href={`${CURRENT_CONFIG.BASE_URL}/lessons`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-[#f5533e] flex items-center gap-1"
                  >
                    すべて見る →
                  </a>
                </div>

                {/* カードグリッド */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((item) => (
                    <a
                      key={item._id}
                      href={`${CURRENT_CONFIG.BASE_URL}/lessons/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      {/* サムネイル */}
                      {item.thumbnailUrl || item.iconImageUrl ? (
                        <img
                          src={item.thumbnailUrl || item.iconImageUrl}
                          alt={item.title}
                          className="w-full aspect-video object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                          📚
                        </div>
                      )}
                      {/* 本文 */}
                      <div className="p-4">
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 mb-2">
                          {getTypeLabel(item._type)}
                        </span>
                        <h4 className="text-[15px] font-semibold text-gray-900 line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatDate(item._updatedAt)}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 注意事項 */}
          <section className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 mb-2">注意</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 設定を変更する場合は <code className="bg-amber-100 px-1 rounded">docs/webflow-embed-code.html</code> を編集</li>
              <li>• 変更後はWebflow側のEmbedコードも更新が必要</li>
              <li>• クライアントサイドレンダリングのため、SEOには影響しない（表示専用）</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
