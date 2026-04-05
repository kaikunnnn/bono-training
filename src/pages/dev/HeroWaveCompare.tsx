/**
 * ヒーロー波形振幅比較ページ
 *
 * 波の振幅パターンを並べて比較
 * URL: /dev/hero-wave-compare
 */

import Layout from "@/components/layout/Layout";

// 振幅パターン定義
const WAVE_PATTERNS = [
  {
    name: "現在 (2.1%)",
    svg: "/shapes/roadmap-hero-shape-flexible.svg",
    description: "デスクトップで使用中の波形",
  },
  {
    name: "振幅 1.5%",
    svg: "/shapes/roadmap-hero-wave-amp-1.5.svg",
    description: "少し緩やか",
  },
  {
    name: "振幅 1.25%",
    svg: "/shapes/roadmap-hero-wave-amp-1.25.svg",
    description: "1.5%と1.0%の中間",
  },
  {
    name: "振幅 1.0%",
    svg: "/shapes/roadmap-hero-wave-amp-1.0.svg",
    description: "かなり緩やか",
  },
  {
    name: "振幅 0.5%",
    svg: "/shapes/roadmap-hero-wave-amp-0.5.svg",
    description: "ほぼフラット",
  },
  {
    name: "モバイル用 (0.5% + 角丸強)",
    svg: "/shapes/roadmap-hero-mobile.svg",
    description: "現在モバイルで使用中",
  },
  {
    name: "中央凹み",
    svg: "/shapes/roadmap-hero-shape-mobile-concave.svg",
    description: "中央が凹む逆パターン",
  },
];

// サンプルグラデーション
const SAMPLE_GRADIENT = "linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), linear-gradient(0deg, #482B4B 0%, #2A2C42 27%, #141520 100%)";

export default function HeroWaveCompare() {
  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">ヒーロー波形 振幅比較</h1>
        <p className="text-gray-600 mb-8">
          波の上下の差（振幅）を変えたパターンを比較。スマホ幅でも確認してください。
        </p>

        {/* 横並び比較（PC） */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">横並び比較</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WAVE_PATTERNS.map((pattern) => (
              <div key={pattern.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{pattern.name}</span>
                  <span className="text-sm text-gray-500">{pattern.description}</span>
                </div>
                <div
                  className="h-[300px] overflow-hidden"
                  style={{
                    WebkitMaskImage: `url('${pattern.svg}')`,
                    maskImage: `url('${pattern.svg}')`,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    background: SAMPLE_GRADIENT,
                  }}
                >
                  <div className="flex items-center justify-center h-full text-white text-sm">
                    サンプルコンテンツ
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* スマホ幅シミュレーション - 実際のヒーロー高さ (約950px) */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">スマホ幅シミュレーション - 実際の高さ (412x950px)</h2>
          <p className="text-sm text-gray-500 mb-4">
            実際のヒーローと同じ高さで表示。SVGは<code>preserveAspectRatio="none"</code>なので、
            高さが変わると波の振幅も角丸も縦に引き伸ばされます。
          </p>
          <div className="flex flex-wrap gap-6">
            {WAVE_PATTERNS.map((pattern) => (
              <div key={pattern.name + "-mobile-real"} className="space-y-2">
                <div className="text-sm font-bold">{pattern.name}</div>
                <div
                  className="w-[412px] h-[950px] overflow-hidden border border-gray-200"
                  style={{
                    WebkitMaskImage: `url('${pattern.svg}')`,
                    maskImage: `url('${pattern.svg}')`,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    background: SAMPLE_GRADIENT,
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white text-sm gap-4 p-8">
                    <div className="border border-white rounded-full px-4 py-1">
                      ロードマップ
                    </div>
                    <div className="text-2xl font-bold text-center">
                      UIUXデザイナー<br />転職ロードマップ
                    </div>
                    <div className="text-white/70 text-center">
                      キャッチコピーのテキストがここに入ります
                    </div>
                    <div className="mt-8 text-white/50 text-xs">
                      （サムネイル画像エリア）
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* スマホ幅シミュレーション - 短い高さ */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">スマホ幅シミュレーション - 短め (375x500px)</h2>
          <div className="flex flex-wrap gap-6">
            {WAVE_PATTERNS.map((pattern) => (
              <div key={pattern.name + "-mobile"} className="space-y-2">
                <div className="text-sm font-bold">{pattern.name}</div>
                <div
                  className="w-[375px] h-[500px] overflow-hidden border border-gray-200 rounded-[16px]"
                  style={{
                    WebkitMaskImage: `url('${pattern.svg}')`,
                    maskImage: `url('${pattern.svg}')`,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    background: SAMPLE_GRADIENT,
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white text-sm gap-4 p-8">
                    <div className="border border-white rounded-full px-4 py-1">
                      ロードマップ
                    </div>
                    <div className="text-2xl font-bold text-center">
                      UIUXデザイナー<br />転職ロードマップ
                    </div>
                    <div className="text-white/70 text-center">
                      キャッチコピーのテキストがここに入ります
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 説明 */}
        <section className="p-6 bg-gray-100 rounded-xl">
          <h2 className="text-lg font-bold mb-4">📐 振幅の説明</h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>振幅 2.1%</strong>: 現在のデスクトップ用。波の頂点と谷の差が大きい</li>
            <li><strong>振幅 1.5%</strong>: 少し緩やか。スマホで使うと良いかも</li>
            <li><strong>振幅 1.25%</strong>: 1.5%と1.0%の中間</li>
            <li><strong>振幅 1.0%</strong>: かなり緩やか。ほぼ直線に近い</li>
            <li><strong>振幅 0.5%</strong>: ほぼフラット。微かな波</li>
            <li><strong>中央凹み</strong>: 波の向きが逆（中央が下がる）</li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
