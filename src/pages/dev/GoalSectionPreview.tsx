import Layout from "@/components/layout/Layout";
import GoalSection, {
  GoalSectionBlock,
} from "@/components/top/GoalSection";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import ContentCard from "@/components/common/ContentCard";
import DottedDivider from "@/components/common/DottedDivider";

/**
 * GoalSection プレビューページ
 *
 * 確認用: http://localhost:8080/dev/goal-section
 */
export default function GoalSectionPreview() {
  return (
    <Layout>
      <div className="min-h-screen bg-base">
        {/* プレビュー情報 */}
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">GoalSection Preview</h1>
          <p className="text-gray-600 mb-4">
            トップページ用ゴールセクションのプレビュー
          </p>
          <p className="text-sm text-gray-500">
            Figma: PRD🏠_topUI_newBONO2026 node-id: 47-14026
          </p>
        </div>

        {/* GoalSection */}
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <GoalSection
            title="UIUX転職・キャリアチェンジしたい"
            description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            emoji="✌️"
          >
            {/* コンテンツブロック */}
            <GoalSectionBlock
              label="コンテンツ"
              title="UIUX転職・キャリアチェンジを目指そう"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            >
              <div className="flex gap-4">
                {/* ロードマップカード */}
                <div className="flex-1">
                  <RoadmapCardV2
                    slug="career-change"
                    title="UIUXデザイナー転職ロードマップ"
                    description="ユーザーと目的から逆算して使いやすいUIデザインの構築方法を習得"
                    gradientPreset="galaxy"
                    duration="6~ヶ月"
                  />
                </div>

                {/* ガイドカード */}
                <div className="flex-1">
                  <ContentCard
                    href="/guide/career-guide"
                    label="ガイド"
                    title="未経験からのUIUXデザイナー転職攻略ガイド"
                    description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                    thumbnailUrl="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800"
                  />
                </div>
              </div>
            </GoalSectionBlock>

            {/* 区切り線 */}
            <DottedDivider className="mx-14" />

            {/* 読みものブロック */}
            <GoalSectionBlock
              label="読みもの"
              title="お役立ちコンテンツ"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            >
              <div className="grid grid-cols-3 gap-4">
                <ContentCard
                  href="/blog/interview"
                  title="ロードマップを使って転職した人のインタビュー集"
                  description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                  thumbnailUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                />
                <ContentCard
                  href="/blog/feedback-plan"
                  title="BONOのフィードバックプランについて"
                  description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                />
                <ContentCard
                  href="/blog/member-output"
                  title="メンバーのアウトプットnote"
                  description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
                />
              </div>
            </GoalSectionBlock>
          </GoalSection>
        </div>

        {/* 使用方法 */}
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              📝 使用方法
            </h3>
            <pre className="text-sm text-blue-700 bg-blue-100 rounded p-4 overflow-x-auto">
{`import GoalSection, { GoalSectionBlock } from "@/components/top/GoalSection";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import ContentCard from "@/components/common/ContentCard";
import DottedDivider from "@/components/common/DottedDivider";

<GoalSection
  title="UIUX転職・キャリアチェンジしたい"
  description="ユーザーに受け入れられるUI体験のための..."
  emoji="✌️"
>
  <GoalSectionBlock
    label="コンテンツ"
    title="UIUX転職・キャリアチェンジを目指そう"
    description="..."
  >
    <div className="flex gap-4">
      <RoadmapCardV2 ... />
      <ContentCard label="ガイド" ... />
    </div>
  </GoalSectionBlock>

  <DottedDivider className="mx-14" />

  <GoalSectionBlock
    label="読みもの"
    title="お役立ちコンテンツ"
    description="..."
  >
    <div className="grid grid-cols-3 gap-4">
      <ContentCard ... />
    </div>
  </GoalSectionBlock>
</GoalSection>`}
            </pre>
          </section>

          {/* Props説明 */}
          <section className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Props</h3>
            <h4 className="font-semibold mb-2">GoalSection</h4>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Prop</th>
                  <th className="text-left py-2">型</th>
                  <th className="text-left py-2">説明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">title</td>
                  <td className="py-2 text-gray-600">string</td>
                  <td className="py-2">ゴールのタイトル</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">description</td>
                  <td className="py-2 text-gray-600">string</td>
                  <td className="py-2">ゴールの説明文</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">emoji</td>
                  <td className="py-2 text-gray-600">string?</td>
                  <td className="py-2">説明文の後に表示する絵文字</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">children</td>
                  <td className="py-2 text-gray-600">ReactNode</td>
                  <td className="py-2">セクション内のコンテンツ</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-semibold mb-2">GoalSectionBlock</h4>
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
                  <td className="py-2 font-mono">label</td>
                  <td className="py-2 text-gray-600">string</td>
                  <td className="py-2">ラベル（「コンテンツ」「読みもの」など）</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">title</td>
                  <td className="py-2 text-gray-600">string</td>
                  <td className="py-2">ブロックのタイトル</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">description</td>
                  <td className="py-2 text-gray-600">string</td>
                  <td className="py-2">ブロックの説明文</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">children</td>
                  <td className="py-2 text-gray-600">ReactNode</td>
                  <td className="py-2">ブロック内のコンテンツ</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </Layout>
  );
}
