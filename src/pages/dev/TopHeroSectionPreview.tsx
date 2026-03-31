import Layout from "@/components/layout/Layout";
import TopHeroSection from "@/components/top/TopHeroSection";

/**
 * TopHeroSection プレビューページ
 *
 * 確認用: http://localhost:8080/dev/top-hero
 */
export default function TopHeroSectionPreview() {
  // サンプルデータ
  const sampleRoadmaps = [
    {
      slug: "career-change",
      title: "UIUX転職・キャリアチェンジしたい",
      gradientPreset: "galaxy" as const,
    },
    {
      slug: "ui-visual",
      title: "UIデザインを体系的に習得したい",
      gradientPreset: "teal" as const,
    },
    {
      slug: "ux-design",
      title: "UXでユーザーの課題解決を進める",
      gradientPreset: "sunset" as const,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#f9f9f7]">
        {/* プレビュー情報 */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">TopHeroSection Preview</h1>
          <p className="text-gray-600 mb-4">
            トップページ用ヒーローセクションのプレビュー
          </p>
          <p className="text-sm text-gray-500">
            Figma: PRD🏠_topUI_newBONO2026 node-id: 77-16766
          </p>
        </div>

        {/* ヒーローセクション */}
        <div className="bg-white">
          <TopHeroSection
            newBadgeText="AIプロトタイピングコースがリリース"
            roadmaps={sampleRoadmaps}
          />
        </div>

        {/* 使用方法 */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              📝 使用方法
            </h3>
            <pre className="text-sm text-blue-700 bg-blue-100 rounded p-4 overflow-x-auto">
{`import TopHeroSection from "@/components/top/TopHeroSection";

const roadmaps = [
  {
    slug: "career-change",
    title: "UIUX転職・キャリアチェンジしたい",
    thumbnailUrl: "/images/roadmap-career.jpg", // optional
    gradientPreset: "galaxy",
  },
  {
    slug: "ui-visual",
    title: "UIデザインを体系的に習得したい",
    gradientPreset: "teal",
  },
  {
    slug: "ux-design",
    title: "UXでユーザーの課題解決を進める",
    gradientPreset: "sunset",
  },
];

<TopHeroSection
  newBadgeText="AIプロトタイピングコースがリリース"
  roadmaps={roadmaps}
/>`}
            </pre>
          </section>

          {/* Props説明 */}
          <section className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Props
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Prop</th>
                  <th className="text-left py-2">型</th>
                  <th className="text-left py-2">説明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">newBadgeText</td>
                  <td className="py-2 text-gray-600">string</td>
                  <td className="py-2">NEWバッジに表示するテキスト</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">roadmaps</td>
                  <td className="py-2 text-gray-600">TopHeroRoadmapItem[]</td>
                  <td className="py-2">表示するロードマップ（3つ）</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 注意事項 */}
          <section className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              📌 実装メモ
            </h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>• <strong>NEWバッジ</strong>: 手動更新（固定値）</li>
              <li>• <strong>キャッチコピー</strong>: 固定テキスト</li>
              <li>• <strong>CTAボタン①</strong>: 「はじめ方を見る」→ https://www.bo-no.design/plan（外部リンク）</li>
              <li>• <strong>CTAボタン②</strong>: 「ロードマップを見る」→ /roadmaps</li>
              <li>• <strong>ロードマップカード</strong>: 扇形配置（-1.83°, 0°, +1.83°）</li>
              <li>• <strong>フォント</strong>: Rounded Mplus 1c（メインキャッチ）</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
