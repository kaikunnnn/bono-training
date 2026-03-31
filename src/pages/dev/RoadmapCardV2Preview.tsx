import Layout from "@/components/layout/Layout";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import type { GradientPreset } from "@/components/roadmap/RoadmapCardV2";

/**
 * RoadmapCardV2 プレビューページ
 *
 * 確認用: http://localhost:5173/dev/roadmap-card-v2
 *
 * Figma参照: PRD🏠_topUI_newBONO2026 node-id: 69-16224
 */

// サンプルデータ
const SAMPLE_ROADMAPS: Array<{
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  estimatedDuration: string;
  gradientPreset: GradientPreset;
}> = [
  {
    slug: "career-change",
    title: "UIUXデザイナー転職ロードマップ",
    description: "ユーザーと目的から逆算して使いやすいUIデザインの構築方法を習得",
    thumbnailUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
    estimatedDuration: "6~",
    gradientPreset: "galaxy",
  },
  {
    slug: "info-architecture",
    title: "情報設計UIデザイン基礎",
    description: "ユーザーと目的から逆算してUI体験の検証を進めることで使いやすいUIを作る方法の習得を目指す道筋です。",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    estimatedDuration: "1-2",
    gradientPreset: "infoarch",
  },
  {
    slug: "ux-design",
    title: "UXデザイン基礎習得ロードマップ",
    description: "ユーザーの課題を理解し、本当に使われるデザインを作る力を養う。",
    estimatedDuration: "2-3",
    gradientPreset: "sunset",
  },
  {
    slug: "figma-basics",
    title: "Figma基礎習得ロードマップ",
    description: "Figmaの基本操作から応用テクニックまで。",
    estimatedDuration: "1-2",
    gradientPreset: "ocean",
  },
];

export default function RoadmapCardV2Preview() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold mb-2">RoadmapCardV2 Preview</h1>
          <p className="text-gray-600">
            ロードマップカードの新デザインパターン比較
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Figma参照: PRD🏠_topUI_newBONO2026 node-id: 69-16224
          </p>
        </div>

        {/* ============================================ */}
        {/* パターンA: 全面グラデーション - 縦 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-purple-600">
              パターンA: 全面グラデーション（縦）
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              カード全体にグラデーション背景を適用。白テキスト。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_ROADMAPS.slice(0, 3).map((roadmap) => (
              <RoadmapCardV2
                key={roadmap.slug}
                variant="gradient"
                orientation="vertical"
                {...roadmap}
              />
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* パターンB: 白背景 - 縦 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-600">
              パターンB: 白背景（縦）
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              背景は白、サムネイル部分のみグラデーション。ダークテキスト。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_ROADMAPS.slice(0, 3).map((roadmap) => (
              <RoadmapCardV2
                key={roadmap.slug}
                variant="white"
                orientation="vertical"
                {...roadmap}
              />
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* パターンC: 全面グラデーション - 横 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-green-600">
              パターンC: 全面グラデーション（横）
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              横長レイアウト。レスポンシブ時やワイド表示向け。
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {SAMPLE_ROADMAPS.slice(0, 2).map((roadmap) => (
              <RoadmapCardV2
                key={roadmap.slug}
                variant="gradient"
                orientation="horizontal"
                {...roadmap}
              />
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* パターンD: 白背景 - 横 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-orange-600">
              パターンD: 白背景（横）
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              横長レイアウト + 白背景。
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {SAMPLE_ROADMAPS.slice(0, 2).map((roadmap) => (
              <RoadmapCardV2
                key={roadmap.slug}
                variant="white"
                orientation="horizontal"
                {...roadmap}
              />
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* グラデーションプリセット一覧 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              グラデーションプリセット一覧
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              各ロードマップに割り当て可能なグラデーションプリセット
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(['galaxy', 'infoarch', 'sunset', 'ocean', 'teal', 'rose'] as const).map((preset) => (
              <div key={preset} className="space-y-2">
                <RoadmapCardV2
                  slug={preset}
                  title={preset}
                  description="サンプル"
                  estimatedDuration="1-2"
                  gradientPreset={preset}
                  variant="gradient"
                  orientation="vertical"
                  className="pointer-events-none"
                />
                <p className="text-center text-sm font-mono text-gray-600">
                  {preset}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* 現在の bg-base 上での表示 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">実際のbg-base上での表示</h2>
          </div>

          <div className="rounded-lg p-8" style={{ backgroundColor: '#F9F9F7' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RoadmapCardV2
                slug="career-change"
                title="UIUXデザイナー転職ロードマップ"
                description="ユーザーと目的から逆算して使いやすいUIデザインの構築方法を習得"
                estimatedDuration="6~"
                gradientPreset="galaxy"
                variant="gradient"
              />
              <RoadmapCardV2
                slug="career-change"
                title="UIUXデザイナー転職ロードマップ"
                description="ユーザーと目的から逆算して使いやすいUIデザインの構築方法を習得"
                estimatedDuration="6~"
                gradientPreset="galaxy"
                variant="white"
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* データ構造 */}
        {/* ============================================ */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">データ構造</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm">
{`interface RoadmapCardV2Props {
  // 必須
  slug: string;              // URLに使用（例: "career-change"）
  title: string;             // タイトル
  description: string;       // 説明文
  estimatedDuration: string; // 目安期間（例: "1-2", "6~"）

  // オプション
  thumbnailUrl?: string;     // サムネイル画像URL
  gradientPreset?: GradientPreset; // グラデーションプリセット
  customGradient?: GradientDef;    // カスタムグラデーション
  variant?: 'gradient' | 'white';  // カードバリアント
  orientation?: 'vertical' | 'horizontal'; // レイアウト方向
  basePath?: string;         // リンク先ベースパス（デフォルト: "/roadmaps/"）
  label?: string;            // ラベル（デフォルト: "ロードマップ"）
}

// グラデーションプリセット
type GradientPreset =
  | 'galaxy'    // 転職用（紫系）
  | 'infoarch'  // 情報設計用（グレー/茶系）
  | 'sunset'    // UXデザイン用
  | 'ocean'     // Figma基礎用
  | 'teal'      // UIビジュアル用
  | 'rose';     // その他

// 使用例
<RoadmapCardV2
  slug="career-change"
  title="UIUXデザイナー転職ロードマップ"
  description="..."
  estimatedDuration="6~"
  gradientPreset="galaxy"
  variant="gradient"    // or "white"
  orientation="vertical" // or "horizontal"
/>`}
            </pre>
          </div>
        </section>
      </div>
    </Layout>
  );
}
