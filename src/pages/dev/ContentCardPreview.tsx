import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/common/ContentCard";

/**
 * ContentCard プレビューページ
 *
 * 確認用: http://localhost:8080/dev/content-card
 */
export default function ContentCardPreview() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold mb-2">ContentCard Preview</h1>
          <p className="text-gray-600 mb-8">
            ガイド・読みもの用汎用カードのプレビュー
          </p>
        </div>

        {/* 基本パターン: ラベル + タイトル + 説明 */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン1: ラベル + タイトル + 説明
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <div className="max-w-[372px]">
              <ContentCard
                href="/guides/career"
                thumbnailUrl="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800"
                label="ガイド"
                title="未経験からのUIUXデザイナー転職攻略ガイド"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
            </div>
          </div>
        </section>

        {/* パターン2: タイトル + 説明のみ */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン2: タイトル + 説明のみ（ラベルなし）
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <div className="max-w-[372px]">
              <ContentCard
                href="/articles/interview"
                thumbnailUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                title="ロードマップを使って転職した人のインタビュー集"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
            </div>
          </div>
        </section>

        {/* パターン3: サムネイルなし */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン3: サムネイルなし
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <div className="max-w-[372px]">
              <ContentCard
                href="/articles/feedback"
                label="読みもの"
                title="BONOのフィードバックプランについて"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
            </div>
          </div>
        </section>

        {/* パターン4: 外部リンク */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン4: 外部リンク
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <div className="max-w-[372px]">
              <ContentCard
                href="https://note.com/example"
                external
                thumbnailUrl="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"
                label="note"
                title="メンバーのアウトプットnote"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
            </div>
          </div>
        </section>

        {/* グリッド表示 */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            グリッド表示（3カラム）
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ContentCard
                href="/articles/1"
                thumbnailUrl="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800"
                label="読みもの"
                title="ロードマップを使って転職した人のインタビュー集"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
              <ContentCard
                href="/articles/2"
                label="読みもの"
                title="BONOのフィードバックプランについて"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
              <ContentCard
                href="/articles/3"
                label="読みもの"
                title="メンバーのアウトプットnote"
                description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
