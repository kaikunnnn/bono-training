import Layout from "@/components/layout/Layout";
import RoadmapHeroSection from "@/components/roadmap/RoadmapHeroSection";

/**
 * RoadmapHeroSection プレビューページ
 *
 * 確認用: http://localhost:8080/dev/roadmap-hero
 */
export default function RoadmapHeroPreview() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">RoadmapHeroSection Preview</h1>
            <p className="text-gray-600">
              ロードマップ詳細ページ用ヒーローセクションのプレビュー
            </p>
          </div>
        </div>

        {/* パターン1: 転職ロードマップ */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto px-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-500">
              パターン1: 転職ロードマップ
            </h3>
          </div>
          <RoadmapHeroSection
            title="UIUXデザイナー転職ロードマップ"
            subtitle="未経験からUIUXデザイナーへ"
            description="使いやすいUI体験をつくるための表現の基礎を身につけよう。ユーザーに受け入れられるUIデザインの「ふつう」を構築する方法を学びます。"
            englishTitle="CAREER CHANGE ROADMAP"
            stepsCount={4}
            lessonsCount={24}
            duration="6-9ヶ月"
          />
        </section>

        {/* パターン2: UIビジュアル基礎 */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto px-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-500">
              パターン2: UIビジュアル基礎（短期）
            </h3>
          </div>
          <RoadmapHeroSection
            title="UIビジュアル基礎習得ロードマップ"
            description="デザインの見た目を整えるための基礎知識。色、タイポグラフィ、レイアウトの基本を学びます。"
            englishTitle="UI VISUAL BASICS"
            stepsCount={3}
            lessonsCount={12}
            duration="1-2ヶ月"
            priceText="月額980円〜"
          />
        </section>

        {/* パターン3: ローディング状態 */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto px-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-500">
              パターン3: ローディング状態
            </h3>
          </div>
          <RoadmapHeroSection
            title="情報設計ロードマップ"
            description="迷わない画面構造を設計する力を身につける。ユーザーが直感的に操作できるUIの設計方法を学びます。"
            englishTitle="INFORMATION ARCHITECTURE"
            stepsCount={4}
            lessonsCount={"-"}
            duration="2-3ヶ月"
            loading={true}
          />
        </section>

        {/* 注意事項 */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              📝 使用方法
            </h3>
            <pre className="text-sm text-blue-700 bg-blue-100 rounded p-4 overflow-x-auto">
{`import RoadmapHeroSection from "@/components/roadmap/RoadmapHeroSection";

<RoadmapHeroSection
  title="UIUXデザイナー転職ロードマップ"
  subtitle="未経験からUIUXデザイナーへ"
  description="使いやすいUI体験をつくるための..."
  englishTitle="CAREER CHANGE ROADMAP"
  stepsCount={4}
  lessonsCount={24}
  duration="6-9ヶ月"
  priceText="月額5,980円〜"
  ctaHref="/subscription"
  ctaText="このロードマップをはじめる"
  loading={false}
/>`}
            </pre>
          </section>
        </div>
      </div>
    </Layout>
  );
}
