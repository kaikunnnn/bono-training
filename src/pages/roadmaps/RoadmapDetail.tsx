/**
 * ロードマップ詳細ページ
 *
 * URLのslugパラメータに基づいてSanityからロードマップを取得・表示
 * 新デザイン（RoadmapHero, ChangingLandscape, InterestingPerspectives, CurriculumSection）を使用
 */

import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RoadmapHero from "@/components/roadmap/detail/RoadmapHero";
import SectionNav, { type SectionNavItem } from "@/components/roadmap/detail/SectionNav";
import ChangingLandscape from "@/components/roadmap/detail/ChangingLandscape";
import InterestingPerspectives from "@/components/roadmap/detail/InterestingPerspectives";
import CurriculumSection from "@/components/roadmap/detail/CurriculumSection";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";
import { useRoadmap } from "@/hooks/useRoadmaps";

// ============================================
// グラデーションプリセットタイプ
// ============================================
type GradientPresetType = "career-change" | "ui-beginner" | "ui-visual" | "info-arch" | "ux-design";

// ============================================
// ローディングコンポーネント
// ============================================
function LoadingState() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">ロードマップを読み込み中...</p>
        </div>
      </div>
    </Layout>
  );
}

// ============================================
// メインコンポーネント
// ============================================
export default function RoadmapDetail() {
  const { slug } = useParams<{ slug: string }>();

  // Sanityからロードマップデータを取得
  const { data: roadmap, isLoading, error } = useRoadmap(slug);

  // ローディング中
  if (isLoading) {
    return <LoadingState />;
  }

  // エラーまたはデータなしの場合は404へリダイレクト
  if (error || !roadmap) {
    return <Navigate to="/404" replace />;
  }

  // データを整形
  const gradientPreset = (roadmap.gradientPreset || "career-change") as GradientPresetType;
  const stepCount = roadmap.steps?.length || 0;
  const estimatedDuration = roadmap.estimatedDuration || "1-2";

  // セクションデータの存在確認
  const hasChangingLandscape = roadmap.changingLandscape && roadmap.changingLandscape.items && roadmap.changingLandscape.items.length > 0;
  const hasInterestingPerspectives = roadmap.interestingPerspectives && roadmap.interestingPerspectives.items && roadmap.interestingPerspectives.items.length > 0;
  const hasCurriculum = roadmap.steps && roadmap.steps.length > 0;

  // セクションナビゲーションアイテムを動的に生成
  const sectionNavItems: SectionNavItem[] = [];
  if (hasChangingLandscape) {
    sectionNavItems.push({ id: "changing-landscape", label: "ロードマップで変わる景色" });
  }
  if (hasInterestingPerspectives) {
    sectionNavItems.push({ id: "interesting-perspectives", label: "デザインが面白くなる「視点」" });
  }
  if (hasCurriculum) {
    sectionNavItems.push({ id: "curriculum", label: "カリキュラム" });
  }

  return (
    <Layout>
      <div>
        {/* ヒーローセクション */}
        <RoadmapHero
          title={roadmap.title}
          tagline={roadmap.tagline || roadmap.description}
          stepCount={stepCount}
          estimatedDuration={estimatedDuration}
          gradientPreset={gradientPreset}
          thumbnailUrl={roadmap.thumbnailUrl}
        />

        {/* セクションナビゲーション */}
        {sectionNavItems.length > 0 && (
          <SectionNav items={sectionNavItems} />
        )}

        {/* 変わる景色セクション */}
        {hasChangingLandscape && (
          <ChangingLandscape data={roadmap.changingLandscape} />
        )}

        {/* 面白くなる視点セクション */}
        {hasInterestingPerspectives && (
          <InterestingPerspectives data={roadmap.interestingPerspectives} />
        )}

        {/* カリキュラムセクション */}
        {hasCurriculum && (
          <CurriculumSection steps={roadmap.steps!} />
        )}

        {/* CTAブロック */}
        <ClearBlock roadmapTitle={roadmap.title} />
      </div>
    </Layout>
  );
}
