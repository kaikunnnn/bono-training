/**
 * グラデーション比較プレビューページ
 *
 * 現在のグラデーションと提案されたグラデーションをRoadmapCardV2で比較
 * URL: /dev/roadmap-gradient-compare
 */

import Layout from "@/components/layout/Layout";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";

// ============================================
// 型定義
// ============================================

interface GradientDef {
  from: string;
  to: string;
  mid?: string;
  overlay?: string;
  customGradient?: string;
}

interface ComparisonItem {
  name: string;
  roadmapName: string;
  slug: string;
  description: string;
  stepCount: number;
  estimatedDuration: string;
  current: GradientDef;
  proposed: GradientDef;
  note: string;
  hasChange: boolean;
}

// ============================================
// グラデーション定義（現在 vs 提案）
// ============================================

const COMPARISONS: ComparisonItem[] = [
  {
    name: "career-change",
    roadmapName: "UIUXデザイナー|転職ロードマップ",
    slug: "uiux-career-change",
    description: "UIUXデザイナーとして転職を目指す方向けのロードマップ",
    stepCount: 5,
    estimatedDuration: "6~",
    current: {
      from: "#482B4B",
      mid: "#2A2C42",
      to: "#141520",
      customGradient: "linear-gradient(0deg, #482B4B 0%, #2A2C42 27%, #141520 100%)",
    },
    proposed: {
      from: "#482B4B",
      mid: "#2A2C42",
      to: "#141520",
      customGradient: "linear-gradient(0deg, #482B4B 0%, #2A2C42 27%, #141520 100%)",
    },
    note: "✅ 適用済み - #482B4B(0%) → #2A2C42(27%) → #141520(100%)",
    hasChange: false,
  },
  {
    name: "ui-beginner",
    roadmapName: "UIデザイン入門",
    slug: "ui-design-beginner",
    description: "Figmaの基礎からUIデザインの基本を学ぶ",
    stepCount: 4,
    estimatedDuration: "1-2",
    current: {
      from: "#684B4B",
      mid: "#231C26",
      to: "#F59EAF",
      customGradient:
        "linear-gradient(0deg, rgba(104, 75, 75, 1) 0%, rgba(35, 28, 38, 1) 81%, rgba(245, 158, 175, 1) 100%)",
    },
    proposed: {
      from: "#684B4B",
      mid: "#231C26",
      to: "#F59EAF",
      customGradient:
        "linear-gradient(0deg, rgba(104, 75, 75, 1) 0%, rgba(35, 28, 38, 1) 81%, rgba(245, 158, 175, 1) 100%)",
    },
    note: "✅ 適用済み - #684B4B(0%) → #231C26(81%) → #F59EAF(100%)",
    hasChange: false,
  },
  {
    name: "ui-visual",
    roadmapName: "UIビジュアル入門",
    slug: "ui-visual",
    description: "UIの見た目を整えるビジュアルデザインの基礎",
    stepCount: 3,
    estimatedDuration: "1-2",
    current: {
      from: "#304750",
      to: "#5D5B65",
      overlay: "rgba(0, 0, 0, 0.2)",
    },
    proposed: {
      from: "#304750",
      to: "#5D5B65",
      overlay: "rgba(0, 0, 0, 0.2)",
    },
    note: "✅ OK - 変更なし",
    hasChange: false,
  },
  {
    name: "info-arch",
    roadmapName: "情報設計基礎",
    slug: "information-architecture",
    description: "情報設計の基礎を学び、使いやすいUIを設計する",
    stepCount: 3,
    estimatedDuration: "1-2",
    current: {
      from: "#214234",
      to: "#8D7746",
      overlay: "rgba(0, 0, 0, 0.3)",
    },
    proposed: {
      from: "#214234",
      to: "#8D7746",
      overlay: "rgba(0, 0, 0, 0.3)",
    },
    note: "✅ 適用済み - 向き反転 #214234(0%) → #8D7746(100%)",
    hasChange: false,
  },
  {
    name: "ux-design",
    roadmapName: "UXデザイン基礎",
    slug: "ux-design",
    description: "ユーザー体験を設計するUXデザインの基礎",
    stepCount: 4,
    estimatedDuration: "2-3",
    current: {
      from: "#F1BAC1",
      to: "#2F3F6D",
      overlay: "rgba(0, 0, 0, 0.4)",
      customGradient: "linear-gradient(0deg, #F1BAC1 0%, #E27979 12%, #764749 54%, #2F3F6D 100%)",
    },
    proposed: {
      from: "#F1BAC1",
      to: "#2F3F6D",
      overlay: "rgba(0, 0, 0, 0.4)",
      customGradient: "linear-gradient(0deg, #F1BAC1 0%, #E27979 12%, #764749 54%, #2F3F6D 100%)",
    },
    note: "✅ 適用済み - 向き反転 #F1BAC1(0%) → #E27979(12%) → #764749(54%) → #2F3F6D(100%)",
    hasChange: false,
  },
];

// ============================================
// メインコンポーネント
// ============================================

export default function RoadmapGradientCompare() {
  const changesCount = COMPARISONS.filter((c) => c.hasChange).length;

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">グラデーション比較（カードコンポーネント）</h1>
        <p className="text-gray-600 mb-2">
          RoadmapCardV2コンポーネントで現在 vs 提案のグラデーションを比較
        </p>
        <p className="text-sm mb-8">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
            要変更: {changesCount}件
          </span>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
            OK: {COMPARISONS.length - changesCount}件
          </span>
        </p>

        {/* 比較一覧 */}
        <div className="space-y-12">
          {COMPARISONS.map((item) => (
            <div
              key={item.name}
              className={`p-6 rounded-xl border ${
                item.hasChange
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-green-300 bg-green-50"
              }`}
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {item.roadmapName.replace("|", " ")}
                  </h2>
                  <code className="text-sm text-gray-500">{item.name}</code>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.hasChange
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {item.hasChange ? "要変更" : "OK"}
                </span>
              </div>

              {/* ノート */}
              <div className="mb-6 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">📝 指示: </span>
                  {item.note}
                </p>
              </div>

              {/* カード比較 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 現在 */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    現在 (Current)
                  </p>
                  <RoadmapCardV2
                    slug={item.slug}
                    title={item.roadmapName}
                    description={item.description}
                    estimatedDuration={item.estimatedDuration}
                    stepCount={item.stepCount}
                    shortTitle={item.name}
                    customGradient={item.current}
                    variant="gradient"
                    basePath="#"
                  />
                  {/* 色コード */}
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs space-y-1">
                    <p><strong>from:</strong> {item.current.from}</p>
                    {item.current.mid && <p><strong>mid:</strong> {item.current.mid}</p>}
                    <p><strong>to:</strong> {item.current.to}</p>
                    {item.current.overlay && <p><strong>overlay:</strong> {item.current.overlay}</p>}
                  </div>
                </div>

                {/* 提案 */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    提案 (Proposed)
                  </p>
                  <RoadmapCardV2
                    slug={item.slug}
                    title={item.roadmapName}
                    description={item.description}
                    estimatedDuration={item.estimatedDuration}
                    stepCount={item.stepCount}
                    shortTitle={item.name}
                    customGradient={item.proposed}
                    variant="gradient"
                    basePath="#"
                  />
                  {/* 色コード */}
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs space-y-1">
                    <p><strong>from:</strong> {item.proposed.from}</p>
                    {item.proposed.mid && <p><strong>mid:</strong> {item.proposed.mid}</p>}
                    <p><strong>to:</strong> {item.proposed.to}</p>
                    {item.proposed.overlay && <p><strong>overlay:</strong> {item.proposed.overlay}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 補足説明 */}
        <div className="mt-12 p-6 bg-gray-100 rounded-xl">
          <h2 className="text-lg font-bold mb-4">📐 CSSグラデーション方向の補足</h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              <strong>0deg</strong> = 下から上へグラデーション
            </li>
            <li>
              <strong>from (0%)</strong> = グラデーションの開始点（下）
            </li>
            <li>
              <strong>to (100%)</strong> = グラデーションの終了点（上）
            </li>
            <li className="pt-2 border-t border-gray-300">
              ユーザー指示の「100%が下の方」は、CSSでは0%に該当します。
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
