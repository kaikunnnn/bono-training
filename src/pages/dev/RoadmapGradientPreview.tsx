/**
 * ロードマップグラデーション確認ページ
 *
 * RoadmapHero と RoadmapCardV2 のグラデーションを並べて比較
 */

import React from 'react';
import { GRADIENT_PRESETS, type GradientPreset } from '@/types/sanity-roadmap';

// RoadmapCardV2 のグラデーション定義（コピー）
interface GradientDef {
  from: string;
  to: string;
  mid?: string;
  overlay?: string;
}

const CARD_GRADIENTS: Record<string, GradientDef> = {
  galaxy: {
    from: '#211f38',
    mid: '#66465f',
    to: '#2e2734',
    overlay: 'rgba(0, 0, 0, 0.2)',
  },
  infoarch: {
    from: '#3d494e',
    to: '#696356',
    overlay: 'rgba(0, 0, 0, 0.1)',
  },
  sunset: {
    from: '#3d3035',
    mid: '#453540',
    to: '#352a30',
  },
  ocean: {
    from: '#2d3540',
    mid: '#384550',
    to: '#353d48',
  },
  teal: {
    from: '#304750',
    to: '#5d5b65',
  },
  rose: {
    from: '#3a3238',
    mid: '#453840',
    to: '#322a30',
  },
};

function getCardGradientCSS(gradient: GradientDef): string {
  const { from, to, mid, overlay } = gradient;
  const gradientPart = mid
    ? `linear-gradient(180deg, ${from} 7.8%, ${mid} 24.2%, ${to} 100%)`
    : `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;

  if (overlay) {
    return `linear-gradient(90deg, ${overlay} 0%, ${overlay} 100%), ${gradientPart}`;
  }
  return gradientPart;
}

// 全プリセット
const ALL_PRESETS: GradientPreset[] = ['galaxy', 'ocean', 'uivisual', 'infoarch', 'sunset', 'teal', 'rose'];

// ロードマップとプリセットのマッピング
const ROADMAP_PRESETS: { name: string; slug: string; preset: GradientPreset }[] = [
  { name: 'UIUXデザイナー転職', slug: 'uiux-career-change', preset: 'galaxy' },
  { name: 'UIデザイン入門', slug: 'ui-design-beginner', preset: 'ocean' },
  { name: 'UIビジュアル入門', slug: 'ui-visual', preset: 'uivisual' },
  { name: '情報設計基礎', slug: 'information-architecture', preset: 'infoarch' },
  { name: 'UXデザイン基礎', slug: 'ux-design', preset: 'sunset' },
];

export default function RoadmapGradientPreview() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">ロードマップ グラデーション確認</h1>
        <p className="text-gray-600 mb-8">RoadmapHero（詳細ページ）と RoadmapCardV2（カード）のグラデーション比較</p>

        {/* ロードマップごとの比較 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">ロードマップ別比較</h2>
          <div className="space-y-6">
            {ROADMAP_PRESETS.map(({ name, slug, preset }) => (
              <div key={slug} className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold mb-4">{name} <span className="text-gray-400 font-normal">({preset})</span></h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Hero グラデーション */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">RoadmapHero（詳細ページ）</p>
                    <div
                      className="h-32 rounded-xl flex items-center justify-center text-white text-sm"
                      style={{ background: GRADIENT_PRESETS[preset] }}
                    >
                      {GRADIENT_PRESETS[preset]}
                    </div>
                  </div>

                  {/* Card グラデーション */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">RoadmapCardV2（カード）</p>
                    {CARD_GRADIENTS[preset] ? (
                      <div
                        className="h-32 rounded-xl flex items-center justify-center text-white text-sm"
                        style={{ background: getCardGradientCSS(CARD_GRADIENTS[preset]) }}
                      >
                        {getCardGradientCSS(CARD_GRADIENTS[preset]).slice(0, 50)}...
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl flex items-center justify-center bg-red-100 text-red-600 text-sm border-2 border-dashed border-red-300">
                        ❌ 定義なし
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 全プリセット一覧 */}
        <section>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">全プリセット一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_PRESETS.map((preset) => (
              <div key={preset} className="bg-white rounded-xl p-4 shadow">
                <h3 className="font-bold mb-3">{preset}</h3>

                {/* Hero */}
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">Hero</p>
                  <div
                    className="h-16 rounded-lg"
                    style={{ background: GRADIENT_PRESETS[preset] }}
                  />
                </div>

                {/* Card */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Card</p>
                  {CARD_GRADIENTS[preset] ? (
                    <div
                      className="h-16 rounded-lg"
                      style={{ background: getCardGradientCSS(CARD_GRADIENTS[preset]) }}
                    />
                  ) : (
                    <div className="h-16 rounded-lg flex items-center justify-center bg-red-100 text-red-500 text-xs border border-dashed border-red-300">
                      未定義
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hero背景画像確認 */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Hero 背景画像確認</h2>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 mb-4">hero-bg.png (opacity: 1.0)</p>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ background: GRADIENT_PRESETS.galaxy }}
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
