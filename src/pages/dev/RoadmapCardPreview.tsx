/**
 * RoadmapCard プレビューページ
 *
 * ロードマップカードコンポーネントの開発・確認用ページ
 * - 各グラデーションバリエーションの表示
 * - 実装仕様の確認
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, Info } from 'lucide-react';
import RoadmapCard, { GradientType } from '@/components/roadmap/RoadmapCard';

// グラデーション情報（コンポーネントと同期）
const GRADIENT_INFO: Record<GradientType, {
  name: string;
  from: string;
  to: string;
  mid?: string;
  category: 'classic' | 'cinematic' | 'warm' | 'cool';
  useCase: string;
}> = {
  // Classic
  teal: { name: 'Teal', from: '#304750', to: '#5d5b65', category: 'classic', useCase: 'UIビジュアル基礎' },
  blue: { name: 'Blue', from: '#354a5f', to: '#565a65', category: 'classic', useCase: 'UXデザイン系' },
  purple: { name: 'Purple', from: '#4a4058', to: '#5d5b65', category: 'classic', useCase: '上級・応用系' },
  orange: { name: 'Orange', from: '#5a4235', to: '#5d5960', category: 'classic', useCase: '実践系' },
  green: { name: 'Green', from: '#3a4d42', to: '#585d5a', category: 'classic', useCase: '入門系' },
  pink: { name: 'Pink', from: '#504050', to: '#605a62', category: 'classic', useCase: 'キャリア系' },
  // Modern Cinematic/Sci-Fi (低彩度・落ち着き)
  cyber: { name: 'Cyber', from: '#2a2535', to: '#363040', mid: '#302a3a', category: 'cinematic', useCase: 'テック/AI系' },
  galaxy: { name: 'Galaxy', from: '#35303f', to: '#2d2a35', mid: '#3a3545', category: 'cinematic', useCase: 'クリエイティブ系' },
  neon: { name: 'Neon Tech', from: '#2a3038', to: '#353a42', mid: '#303540', category: 'cinematic', useCase: 'SaaS/プロダクト系' },
  midnight: { name: 'Midnight', from: '#282535', to: '#35324a', mid: '#302d40', category: 'cinematic', useCase: 'プレミアム系' },
  // Modern Warm (低彩度・落ち着き)
  sunset: { name: 'Sunset', from: '#3d3035', to: '#352a30', mid: '#453540', category: 'warm', useCase: 'エモーショナル系' },
  thermal: { name: 'Thermal', from: '#3a3032', to: '#302a30', mid: '#453538', category: 'warm', useCase: 'インパクト系' },
  coral: { name: 'Coral', from: '#403535', to: '#352d32', mid: '#4a3a3d', category: 'warm', useCase: 'フレンドリー系' },
  rose: { name: 'Rose Gold', from: '#3a3238', to: '#322a30', mid: '#453840', category: 'warm', useCase: 'ラグジュアリー系' },
  // Modern Cool/Fresh (低彩度・落ち着き)
  aurora: { name: 'Aurora', from: '#2a3538', to: '#303a3d', mid: '#354042', category: 'cool', useCase: '自然/サステナ系' },
  emerald: { name: 'Emerald', from: '#2d3835', to: '#303538', mid: '#354038', category: 'cool', useCase: '成長/進化系' },
  ocean: { name: 'Ocean', from: '#2d3540', to: '#353d48', mid: '#384550', category: 'cool', useCase: '信頼/安定系' },
  lavender: { name: 'Lavender', from: '#353040', to: '#302a38', mid: '#3a3545', category: 'cool', useCase: 'リラックス系' },
};


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
            RoadmapCard コンポーネント
          </h1>
          <p className="text-gray-600 mt-2">
            ロードマップ一覧で使用するカードコンポーネントのプレビュー
          </p>
        </div>

        {/* Figma参照 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Figma参照
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Figma URL</div>
              <a
                href="https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/product---new-BONO-ui-2026?node-id=900-39673"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                node-id=900-39673
              </a>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">コンポーネントパス</div>
              <code className="text-sm text-gray-700">
                src/components/roadmap/RoadmapCard.tsx
              </code>
            </div>
          </div>
        </section>

        {/* グラデーションカラー一覧 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            グラデーションバリエーション（18種類）
          </h2>

          {/* Classic */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Classic</span>
              オリジナルベース（低彩度・洗練）
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'classic')
                .map(([type, info]) => (
                  <div key={type} className="text-center">
                    <div
                      className="w-full aspect-[4/3] rounded-xl mb-2 border border-gray-200"
                      style={{
                        background: `linear-gradient(to bottom, ${info.from}, ${info.to})`,
                      }}
                    />
                    <div className="text-xs font-bold text-gray-900">{info.name}</div>
                    <div className="text-[10px] text-gray-500">{info.useCase}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cinematic/Sci-Fi */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Cinematic</span>
              Sci-Fi / テック風（2025-2026トレンド）
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'cinematic')
                .map(([type, info]) => (
                  <div key={type} className="text-center">
                    <div
                      className="w-full aspect-[4/3] rounded-xl mb-2 border border-gray-200"
                      style={{
                        background: info.mid
                          ? `linear-gradient(135deg, ${info.from} 0%, ${info.mid} 50%, ${info.to} 100%)`
                          : `linear-gradient(to bottom, ${info.from}, ${info.to})`,
                      }}
                    />
                    <div className="text-xs font-bold text-gray-900">{info.name}</div>
                    <div className="text-[10px] text-gray-500">{info.useCase}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Warm/Vibrant */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Warm</span>
              ウォーム / エモーショナル
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'warm')
                .map(([type, info]) => (
                  <div key={type} className="text-center">
                    <div
                      className="w-full aspect-[4/3] rounded-xl mb-2 border border-gray-200"
                      style={{
                        background: info.mid
                          ? `linear-gradient(135deg, ${info.from} 0%, ${info.mid} 50%, ${info.to} 100%)`
                          : `linear-gradient(to bottom, ${info.from}, ${info.to})`,
                      }}
                    />
                    <div className="text-xs font-bold text-gray-900">{info.name}</div>
                    <div className="text-[10px] text-gray-500">{info.useCase}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cool/Fresh */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs">Cool</span>
              クール / フレッシュ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'cool')
                .map(([type, info]) => (
                  <div key={type} className="text-center">
                    <div
                      className="w-full aspect-[4/3] rounded-xl mb-2 border border-gray-200"
                      style={{
                        background: info.mid
                          ? `linear-gradient(135deg, ${info.from} 0%, ${info.mid} 50%, ${info.to} 100%)`
                          : `linear-gradient(to bottom, ${info.from}, ${info.to})`,
                      }}
                    />
                    <div className="text-xs font-bold text-gray-900">{info.name}</div>
                    <div className="text-[10px] text-gray-500">{info.useCase}</div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* カードプレビュー - カテゴリ別比較 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            カードプレビュー（同一コンテンツ・カラバリ比較）
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            同じロードマップを異なるグラデーションで表示して比較
          </p>

          {/* Classic */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Classic</span>
              オリジナルベース
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'classic')
                .map(([type]) => (
                  <div key={type}>
                    <RoadmapCard
                      slug="ui-visual-basics"
                      title="UIデザインビジュアル基礎"
                      description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                      stepCount={4}
                      estimatedDuration="1-2"
                      gradientType={type}
                    />
                    <div className="mt-2 text-center text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-0.5 rounded">{type}</code>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cinematic */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Cinematic</span>
              Sci-Fi / テック風
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'cinematic')
                .map(([type]) => (
                  <div key={type}>
                    <RoadmapCard
                      slug="ui-visual-basics"
                      title="UIデザインビジュアル基礎"
                      description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                      stepCount={4}
                      estimatedDuration="1-2"
                      gradientType={type}
                    />
                    <div className="mt-2 text-center text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-0.5 rounded">{type}</code>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Warm */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Warm</span>
              ウォーム / エモーショナル
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'warm')
                .map(([type]) => (
                  <div key={type}>
                    <RoadmapCard
                      slug="ui-visual-basics"
                      title="UIデザインビジュアル基礎"
                      description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                      stepCount={4}
                      estimatedDuration="1-2"
                      gradientType={type}
                    />
                    <div className="mt-2 text-center text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-0.5 rounded">{type}</code>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cool */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs">Cool</span>
              クール / フレッシュ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(GRADIENT_INFO) as [GradientType, typeof GRADIENT_INFO[GradientType]][])
                .filter(([, info]) => info.category === 'cool')
                .map(([type]) => (
                  <div key={type}>
                    <RoadmapCard
                      slug="ui-visual-basics"
                      title="UIデザインビジュアル基礎"
                      description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                      stepCount={4}
                      estimatedDuration="1-2"
                      gradientType={type}
                    />
                    <div className="mt-2 text-center text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-0.5 rounded">{type}</code>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Props仕様 */}
        <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Props仕様</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Prop</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Type</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Required</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">Default</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700">説明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">slug</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-red-600">Yes</td>
                  <td className="py-2 px-3 text-gray-400">-</td>
                  <td className="py-2 px-3 text-gray-700">URLスラッグ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">title</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-red-600">Yes</td>
                  <td className="py-2 px-3 text-gray-400">-</td>
                  <td className="py-2 px-3 text-gray-700">タイトル</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">description</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-red-600">Yes</td>
                  <td className="py-2 px-3 text-gray-400">-</td>
                  <td className="py-2 px-3 text-gray-700">説明文</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">thumbnailUrl</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-gray-400">No</td>
                  <td className="py-2 px-3 text-gray-400">undefined</td>
                  <td className="py-2 px-3 text-gray-700">サムネイル画像URL</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">stepCount</td>
                  <td className="py-2 px-3 font-mono text-gray-600">number</td>
                  <td className="py-2 px-3 text-red-600">Yes</td>
                  <td className="py-2 px-3 text-gray-400">-</td>
                  <td className="py-2 px-3 text-gray-700">ステップ数</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">stepUnit</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-gray-400">No</td>
                  <td className="py-2 px-3 font-mono text-gray-500">"ヶ月"</td>
                  <td className="py-2 px-3 text-gray-700">ステップ単位</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">estimatedDuration</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-red-600">Yes</td>
                  <td className="py-2 px-3 text-gray-400">-</td>
                  <td className="py-2 px-3 text-gray-700">目安期間（例: "1-2"）</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">durationUnit</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-gray-400">No</td>
                  <td className="py-2 px-3 font-mono text-gray-500">"ヶ月"</td>
                  <td className="py-2 px-3 text-gray-700">期間単位</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">gradientType</td>
                  <td className="py-2 px-3 font-mono text-gray-600">GradientType</td>
                  <td className="py-2 px-3 text-gray-400">No</td>
                  <td className="py-2 px-3 font-mono text-gray-500">"teal"</td>
                  <td className="py-2 px-3 text-gray-700">グラデーション（18種類）</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">basePath</td>
                  <td className="py-2 px-3 font-mono text-gray-600">string</td>
                  <td className="py-2 px-3 text-gray-400">No</td>
                  <td className="py-2 px-3 font-mono text-gray-500">"/roadmaps/"</td>
                  <td className="py-2 px-3 text-gray-700">リンク先ベースパス</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
