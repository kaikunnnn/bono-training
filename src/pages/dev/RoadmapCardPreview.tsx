/**
 * RoadmapCard 統合プレビューページ
 *
 * RoadmapCard (v1) と RoadmapCardV2 を並べて比較
 * - 両バージョンの違いを確認
 * - 統合の方針を決定するための参照
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RoadmapCard, { GradientType } from '@/components/roadmap/RoadmapCard';
import RoadmapCardV2, { GradientPreset } from '@/components/roadmap/RoadmapCardV2';

// 共通サンプルデータ
const SAMPLE_DATA = {
  slug: 'ui-visual-basics',
  title: 'UIデザインビジュアル基礎',
  description: '使いやすいUI体験をつくるための表現の基礎を身につけよう。',
  thumbnailUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
  estimatedDuration: '1-2',
  stepCount: 4,
};

// v1 グラデーション（代表的なもの）
const V1_GRADIENTS: GradientType[] = ['teal', 'galaxy', 'ocean', 'sunset', 'rose', 'infoarch'];

// v2 グラデーションプリセット
const V2_PRESETS: GradientPreset[] = ['galaxy', 'infoarch', 'sunset', 'ocean', 'teal', 'rose'];

export default function RoadmapCardPreview() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            開発メニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            RoadmapCard 統合プレビュー
          </h1>
          <p className="text-gray-600 mt-2">
            v1（現行）とv2（Figma準拠）を並べて比較し、統合方針を検討
          </p>
        </div>

        {/* ============================================ */}
        {/* 比較サマリー */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">コンポーネント比較</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-bold text-gray-700">項目</th>
                  <th className="text-left py-2 px-3 font-bold text-blue-600">RoadmapCard (v1)</th>
                  <th className="text-left py-2 px-3 font-bold text-purple-600">RoadmapCardV2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 px-3 text-gray-700">使用場所</td>
                  <td className="py-2 px-3">/roadmaps 一覧</td>
                  <td className="py-2 px-3">Figmaデザイン（未使用）</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">グラデーション数</td>
                  <td className="py-2 px-3">18種類</td>
                  <td className="py-2 px-3">6種類</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">variant</td>
                  <td className="py-2 px-3">なし（gradient固定）</td>
                  <td className="py-2 px-3">gradient / white</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">orientation</td>
                  <td className="py-2 px-3">なし（vertical固定）</td>
                  <td className="py-2 px-3">vertical / horizontal</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">角丸</td>
                  <td className="py-2 px-3">24px (rounded-3xl)</td>
                  <td className="py-2 px-3">32-64px (レスポンシブ)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">サムネイル形状</td>
                  <td className="py-2 px-3">特殊形状（SVG clipPath）</td>
                  <td className="py-2 px-3">角丸長方形</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">ラベルバッジ</td>
                  <td className="py-2 px-3">なし</td>
                  <td className="py-2 px-3">あり（「ロードマップ」）</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">CTA</td>
                  <td className="py-2 px-3">「詳細を見る」ボタン</td>
                  <td className="py-2 px-3">矢印アイコン</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================ */}
        {/* 並列比較: 縦型 */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">縦型カード比較</h2>
          <p className="text-sm text-gray-500 mb-6">同じデータで両バージョンを並べて表示</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* v1 */}
            <div>
              <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">v1</span>
                RoadmapCard（現行）
              </h3>
              <RoadmapCard
                slug={SAMPLE_DATA.slug}
                title={SAMPLE_DATA.title}
                description={SAMPLE_DATA.description}
                thumbnailUrl={SAMPLE_DATA.thumbnailUrl}
                stepCount={SAMPLE_DATA.stepCount}
                estimatedDuration={SAMPLE_DATA.estimatedDuration}
                gradientType="galaxy"
              />
            </div>

            {/* v2 gradient */}
            <div>
              <h3 className="text-sm font-bold text-purple-600 mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-100 rounded text-xs">v2</span>
                RoadmapCardV2（gradient）
              </h3>
              <RoadmapCardV2
                slug={SAMPLE_DATA.slug}
                title={SAMPLE_DATA.title}
                description={SAMPLE_DATA.description}
                thumbnailUrl={SAMPLE_DATA.thumbnailUrl}
                estimatedDuration={SAMPLE_DATA.estimatedDuration}
                gradientPreset="galaxy"
                variant="gradient"
                orientation="vertical"
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* v2 バリアント展開 */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">v2 バリアント展開</h2>
          <p className="text-sm text-gray-500 mb-6">variant × orientation の組み合わせ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* gradient × vertical */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="gradient" × orientation="vertical"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="gradient"
                orientation="vertical"
              />
            </div>

            {/* white × vertical */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="white" × orientation="vertical"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="white"
                orientation="vertical"
              />
            </div>
          </div>

          {/* horizontal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="gradient" × orientation="horizontal"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="gradient"
                orientation="horizontal"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="white" × orientation="horizontal"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="white"
                orientation="horizontal"
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* v2 波形サムネイル展開 */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">v2 波形サムネイル展開</h2>
          <p className="text-sm text-gray-500 mb-6">
            thumbnailStyle="wave" を適用（詳細ページHeroと同様の波形マスク）
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* gradient × vertical × wave */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="gradient" × orientation="vertical" × thumbnailStyle="wave"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="gradient"
                orientation="vertical"
                thumbnailStyle="wave"
              />
            </div>

            {/* white × vertical × wave */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="white" × orientation="vertical" × thumbnailStyle="wave"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="white"
                orientation="vertical"
                thumbnailStyle="wave"
              />
            </div>
          </div>

          {/* horizontal × wave */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="gradient" × orientation="horizontal" × thumbnailStyle="wave"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="gradient"
                orientation="horizontal"
                thumbnailStyle="wave"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                variant="white" × orientation="horizontal" × thumbnailStyle="wave"
              </h3>
              <RoadmapCardV2
                {...SAMPLE_DATA}
                gradientPreset="galaxy"
                variant="white"
                orientation="horizontal"
                thumbnailStyle="wave"
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* グラデーション比較 */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">グラデーション比較</h2>
          <p className="text-sm text-gray-500 mb-6">同名プリセットの色味の違い</p>

          <div className="space-y-8">
            {V2_PRESETS.map((preset) => (
              <div key={preset} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  <code className="bg-gray-100 px-2 py-0.5 rounded">{preset}</code>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* v1 */}
                  <div>
                    <p className="text-xs text-blue-600 mb-2">v1 RoadmapCard</p>
                    <RoadmapCard
                      slug={SAMPLE_DATA.slug}
                      title={SAMPLE_DATA.title}
                      description={SAMPLE_DATA.description}
                      stepCount={SAMPLE_DATA.stepCount}
                      estimatedDuration={SAMPLE_DATA.estimatedDuration}
                      gradientType={preset as GradientType}
                    />
                  </div>
                  {/* v2 */}
                  <div>
                    <p className="text-xs text-purple-600 mb-2">v2 RoadmapCardV2</p>
                    <RoadmapCardV2
                      slug={SAMPLE_DATA.slug}
                      title={SAMPLE_DATA.title}
                      description={SAMPLE_DATA.description}
                      estimatedDuration={SAMPLE_DATA.estimatedDuration}
                      gradientPreset={preset}
                      variant="gradient"
                      orientation="vertical"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* v1のみのグラデーション */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">v1のみのグラデーション</h2>
          <p className="text-sm text-gray-500 mb-6">v2に存在しないプリセット（統合時に追加検討）</p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(['blue', 'purple', 'orange', 'green', 'pink', 'cyber', 'neon', 'midnight', 'thermal', 'coral', 'aurora', 'emerald', 'lavender'] as GradientType[]).map((type) => (
              <div key={type} className="text-center">
                <div
                  className="w-full aspect-[3/4] rounded-xl mb-2 border border-gray-200"
                  style={{
                    background: `linear-gradient(135deg, var(--gradient-${type}-from, #333) 0%, var(--gradient-${type}-to, #555) 100%)`,
                  }}
                />
                <code className="text-xs bg-gray-100 px-1 rounded">{type}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            ※ 上記は参考表示。実際の色は RoadmapCard コンポーネント内で定義
          </p>
        </section>
      </div>
    </div>
  );
}
