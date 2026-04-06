/**
 * ロードマップグラデーション確認ページ
 *
 * Sanityから取得したロードマップごとにグラデーションを確認
 * RoadmapHero と RoadmapCardV2 のグラデーションを並べて比較
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { type GradientPreset, GRADIENTS, getGradientCSS } from '@/styles/gradients';
import RoadmapCardV2 from '@/components/roadmap/RoadmapCardV2';

// 全プリセット
const ALL_PRESETS: GradientPreset[] = ['career-change', 'ui-beginner', 'ui-visual', 'info-arch', 'ux-design'];

export default function RoadmapGradientPreview() {
  const { data: roadmaps, isLoading, error, refetch } = useRoadmaps();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            開発メニューに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ロードマップ グラデーション確認</h1>
              <p className="text-gray-600">Sanityから取得したロードマップごとにグラデーションを比較</p>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              再読み込み
            </button>
          </div>
        </div>

        {/* ローディング */}
        {isLoading && (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4" />
            <p className="text-gray-500">ロードマップを読み込み中...</p>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            <p className="font-bold mb-2">エラーが発生しました</p>
            <p className="text-sm">{(error as Error).message}</p>
          </div>
        )}

        {/* Sanityから取得したロードマップ */}
        {roadmaps && roadmaps.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Sanity ロードマップ一覧
              <span className="ml-2 text-sm font-normal text-gray-500">({roadmaps.length}件)</span>
            </h2>
            <div className="space-y-6">
              {roadmaps.map((roadmap) => {
                const preset = (roadmap.gradientPreset || 'career-change') as GradientPreset;
                const hasCardGradient = !!GRADIENTS[preset];

                return (
                  <div key={roadmap._id} className="bg-white rounded-xl p-6 shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {roadmap.title}
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${roadmap.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {roadmap.isPublished ? '公開中' : '非公開'}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-500">
                          slug: {roadmap.slug.current} | preset: <code className="bg-gray-100 px-1 rounded">{preset}</code>
                        </p>
                      </div>
                      <Link
                        to={`/roadmaps/${roadmap.slug.current}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        詳細ページを見る →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hero グラデーション */}
                      <div>
                        <p className="text-sm text-gray-500 mb-2">RoadmapHero（詳細ページ）</p>
                        <div
                          className="h-32 rounded-xl flex items-center justify-center text-white text-xs overflow-hidden"
                          style={{ background: getGradientCSS(preset) }}
                        >
                          <div className="text-center px-4">
                            <div className="opacity-80 text-[10px] mb-1">GRADIENTS[{preset}] (from gradients.ts)</div>
                            <div className="font-mono text-[10px] opacity-60">
                              {getGradientCSS(preset).slice(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card グラデーション */}
                      <div>
                        <p className="text-sm text-gray-500 mb-2">RoadmapCardV2（カード）</p>
                        {hasCardGradient ? (
                          <div
                            className="h-32 rounded-xl flex items-center justify-center text-white text-xs"
                            style={{ background: getGradientCSS(preset) }}
                          >
                            <div className="text-center px-4">
                              <div className="opacity-80 text-[10px] mb-1">RoadmapCardV2 (uses GRADIENTS)</div>
                              <div className="font-mono text-[10px] opacity-60">
                                {getGradientCSS(preset).slice(0, 50)}...
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 rounded-xl flex items-center justify-center bg-red-100 text-red-600 text-sm border-2 border-dashed border-red-300">
                            ❌ Card用グラデーション未定義
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 実際のカードコンポーネント */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-4">実際のRoadmapCardV2コンポーネント</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* gradient variant */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2">variant="gradient"</p>
                          <RoadmapCardV2
                            slug={roadmap.slug.current}
                            title={roadmap.title}
                            description={roadmap.description}
                            thumbnailUrl={roadmap.thumbnailUrl}
                            estimatedDuration={roadmap.estimatedDuration}
                            stepCount={roadmap.stepCount}
                            shortTitle={roadmap.shortTitle}
                            gradientPreset={preset as CardGradientPreset}
                            variant="gradient"
                            orientation="vertical"
                          />
                        </div>
                        {/* white variant */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2">variant="white"</p>
                          <RoadmapCardV2
                            slug={roadmap.slug.current}
                            title={roadmap.title}
                            description={roadmap.description}
                            thumbnailUrl={roadmap.thumbnailUrl}
                            estimatedDuration={roadmap.estimatedDuration}
                            stepCount={roadmap.stepCount}
                            shortTitle={roadmap.shortTitle}
                            gradientPreset={preset as CardGradientPreset}
                            variant="white"
                            orientation="vertical"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* カラーコード比較表 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            カラーコード比較表
            <span className="ml-2 text-sm font-normal text-red-500">⚠️ Hero と Card で色が異なる</span>
          </h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">プリセット</th>
                  <th className="px-4 py-3 text-left font-bold">Hero（詳細ページ）</th>
                  <th className="px-4 py-3 text-left font-bold">Card（RoadmapCardV2）</th>
                  <th className="px-4 py-3 text-center font-bold">一致</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ALL_PRESETS.map((preset) => {
                  const heroGradient = getGradientCSS(preset);
                  const cardGradient = GRADIENTS[preset];
                  const cardCSS = cardGradient ? getGradientCSS(preset) : null;

                  // 色コードを抽出（簡易比較用）
                  const heroColors = heroGradient.match(/#[0-9a-fA-F]{6}/g) || [];
                  const cardColors = cardGradient ? [cardGradient.from, cardGradient.mid, cardGradient.to].filter(Boolean) : [];
                  const isMatching = heroColors.join(',').toLowerCase() === cardColors.join(',').toLowerCase();

                  return (
                    <tr key={preset} className={isMatching ? '' : 'bg-red-50'}>
                      <td className="px-4 py-3 font-mono font-bold">{preset}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border border-gray-200"
                            style={{ background: heroGradient }}
                          />
                          <div className="text-xs font-mono">
                            {heroColors.map((c, i) => (
                              <span key={i} className="mr-1" style={{ color: c }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cardGradient ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border border-gray-200"
                              style={{ background: cardCSS || '' }}
                            />
                            <div className="text-xs font-mono">
                              {cardColors.map((c, i) => (
                                <span key={i} className="mr-1" style={{ color: c }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-500">未定義</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isMatching ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 注意:</strong> Hero と Card で異なるグラデーション定義が使われています。
              グラデーション定義は <code className="bg-green-100 px-1 rounded">src/styles/gradients.ts</code> に統一管理されています。
            </p>
          </div>
        </section>

        {/* 全プリセット一覧 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">全プリセット一覧（視覚比較）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_PRESETS.map((preset) => {
              const usedBy = roadmaps?.filter(r => r.gradientPreset === preset).map(r => r.title) || [];

              return (
                <div key={preset} className="bg-white rounded-xl p-4 shadow">
                  <h3 className="font-bold mb-2">
                    {preset}
                    {usedBy.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        使用: {usedBy.length}件
                      </span>
                    )}
                  </h3>

                  {/* 使用中のロードマップ */}
                  {usedBy.length > 0 && (
                    <div className="mb-3 text-xs text-gray-500">
                      {usedBy.join(', ')}
                    </div>
                  )}

                  {/* Hero */}
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">Hero</p>
                    <div
                      className="h-16 rounded-lg"
                      style={{ background: getGradientCSS(preset) }}
                    />
                  </div>

                  {/* Card */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Card</p>
                    {GRADIENTS[preset] ? (
                      <div
                        className="h-16 rounded-lg"
                        style={{ background: getGradientCSS(preset) }}
                      />
                    ) : (
                      <div className="h-16 rounded-lg flex items-center justify-center bg-red-100 text-red-500 text-xs border border-dashed border-red-300">
                        未定義
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Hero背景画像確認 */}
        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Hero 背景画像確認</h2>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-4">hero-bg.png (opacity: 1.0)</p>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ background: getGradientCSS('career-change') }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url('/images/roadmap/hero-bg.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 1.0,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url('/textures/noise.svg')`,
                  backgroundRepeat: 'repeat',
                  opacity: 1,
                  mixBlendMode: 'overlay',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                背景画像 + ノイズ + グラデーション
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
