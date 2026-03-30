import Layout from "@/components/layout/Layout";
import TopHeroSection from "@/components/top/TopHeroSection";
import PartnerBanner, { DEFAULT_PARTNERS } from "@/components/top/PartnerBanner";
import GoalNavSection, { DEFAULT_GOAL_NAV_ITEMS } from "@/components/top/GoalNavSection";
import GoalSection, { GoalSectionBlock } from "@/components/top/GoalSection";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import ContentCard from "@/components/common/ContentCard";
import DottedDivider from "@/components/common/DottedDivider";

/**
 * トップページ全体プレビュー
 *
 * 確認用: http://localhost:8080/dev/top-page-preview
 */
export default function TopPagePreview() {
  // ヒーローセクション用ロードマップデータ
  const heroRoadmaps = [
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
    <Layout headerGradient="top">
      <div className="min-h-screen">
        {/* ============================================
            ヒーローセクション
        ============================================ */}
        <TopHeroSection
          newBadgeText="AIプロトタイピングコースがリリース"
          roadmaps={heroRoadmaps}
        />

        {/* ============================================
            パートナーシップバナー
        ============================================ */}
        <PartnerBanner partners={DEFAULT_PARTNERS} />

        {/* ============================================
            目的選択ナビゲーション
        ============================================ */}
        <GoalNavSection items={DEFAULT_GOAL_NAV_ITEMS} />

        {/* ============================================
            ゴールセクション群
        ============================================ */}
        <div className="flex flex-col items-center gap-8 sm:gap-12 px-4 sm:px-6 py-10 sm:py-16">
          {/* ゴール1: UIUX転職・キャリアチェンジ */}
          <div id="goal-career">
          <GoalSection
            title="UIUX転職・キャリアチェンジしたい"
            description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            emoji="✌️"
          >
            <GoalSectionBlock
              label="コンテンツ"
              title="UIUX転職・キャリアチェンジを目指そう"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            >
              {/* カード2枚: モバイルは縦、デスクトップは横 */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <RoadmapCardV2
                    slug="career-change"
                    title="UIUXデザイナー転職ロードマップ"
                    description="ユーザーと目的から逆算して使いやすいUIデザインの構築方法を習得"
                    gradientPreset="galaxy"
                    estimatedDuration="6~"
                  />
                </div>
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

            <DottedDivider className="mx-4 sm:mx-8 lg:mx-14" />

            <GoalSectionBlock
              label="読みもの"
              title="お役立ちコンテンツ"
              description="ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ"
            >
              {/* カード3枚: モバイルは1列、タブレットは2列、デスクトップは3列 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* ゴール2: UIビジュアル習得 */}
          <div id="goal-ui-basics">
          <GoalSection
            title="UIデザインを体系的に習得したい"
            description="UIビジュアルの基礎から応用まで、体系的に学べるコンテンツを用意しています"
            emoji="🎨"
          >
            <GoalSectionBlock
              label="コンテンツ"
              title="UIビジュアルの基礎を固めよう"
              description="色、タイポグラフィ、レイアウトの基本を学びます"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <RoadmapCardV2
                    slug="ui-visual"
                    title="UIビジュアル基礎習得ロードマップ"
                    description="デザインの見た目を整えるための基礎知識を習得"
                    gradientPreset="teal"
                    estimatedDuration="1-2"
                  />
                </div>
                <div className="flex-1">
                  <ContentCard
                    href="/guide/ui-basics"
                    label="ガイド"
                    title="UIデザインの基本原則ガイド"
                    description="色・余白・タイポグラフィの基礎を学ぼう。"
                    thumbnailUrl="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"
                  />
                </div>
              </div>
            </GoalSectionBlock>
          </GoalSection>
          </div>

          {/* ゴール3: UXデザイン */}
          <div id="goal-ux-basics">
          <GoalSection
            title="UXでユーザーの課題解決を進める"
            description="ユーザーリサーチから情報設計まで、UXデザインの実践スキルを身につけよう"
            emoji="🔍"
          >
            <GoalSectionBlock
              label="コンテンツ"
              title="UXデザインの実践力を高めよう"
              description="ユーザー中心のデザインプロセスを学びます"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <RoadmapCardV2
                    slug="ux-design"
                    title="UXデザイン実践ロードマップ"
                    description="ユーザーリサーチから情報設計までの実践スキル"
                    gradientPreset="sunset"
                    estimatedDuration="3-4"
                  />
                </div>
                <div className="flex-1">
                  <ContentCard
                    href="/guide/ux-research"
                    label="ガイド"
                    title="ユーザーリサーチ入門ガイド"
                    description="ユーザーの課題を発見する方法を学ぼう。"
                    thumbnailUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"
                  />
                </div>
              </div>
            </GoalSectionBlock>
          </GoalSection>
          </div>
        </div>

        {/* フッターへの余白 */}
        <div className="h-16 sm:h-24" />
      </div>
    </Layout>
  );
}
