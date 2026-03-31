import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * SectionHeading プレビューページ
 *
 * 確認用: http://localhost:8080/dev/section-heading
 */
export default function SectionHeadingPreview() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold mb-2">SectionHeading Preview</h1>
          <p className="text-gray-600 mb-8">
            セクション見出しコンポーネントのプレビュー
          </p>
        </div>

        {/* パターン1: label + description (text) - トップページ用 */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン1: label + description (text)
          </h3>
          <p className="text-sm text-gray-400">トップページのセクション内ヘディング用</p>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <SectionHeading
              label="コンテンツ"
              title="UIUX転職・キャリアチェンジを目指そう"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
              descriptionStyle="text"
            />
          </div>
        </section>

        {/* パターン2: description (badge) - ロードマップ一覧用 */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン2: description (badge)
          </h3>
          <p className="text-sm text-gray-400">ロードマップ一覧のセクション用</p>
          <div className="bg-white rounded-lg border p-6">
            <SectionHeading
              title="転職・キャリアチェンジしたい"
              description="未経験からデザイナーへ、キャリアアップを目指したい方向けの地図"
              descriptionStyle="badge"
            />
          </div>
        </section>

        {/* パターン3: タイトルのみ */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン3: タイトルのみ
          </h3>
          <div className="bg-white rounded-lg border p-6">
            <SectionHeading
              title="ユーザー中心デザインを体系的に身につけたい"
            />
          </div>
        </section>

        {/* パターン4: label + description (text) + 下線なし */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン4: 下線なし
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <SectionHeading
              label="読みもの"
              title="お役立ちコンテンツ"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
              descriptionStyle="text"
              showUnderline={false}
            />
          </div>
        </section>

        {/* 実際の使用イメージ */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            実際の使用イメージ（複数セクション）
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6 space-y-8">
            <SectionHeading
              label="コンテンツ"
              title="UIUX転職・キャリアチェンジを目指そう"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            />
            <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              RoadmapCard + ContentCard
            </div>

            <div className="border-t border-dashed border-gray-300" />

            <SectionHeading
              label="読みもの"
              title="お役立ちコンテンツ"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            />
            <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              ContentCard × 3
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
