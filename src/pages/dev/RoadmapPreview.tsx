/**
 * ロードマップ詳細プレビューページ
 *
 * 各ロードマップのデータを使用して詳細ページをプレビューする
 * URL: /dev/roadmap-preview/:slug
 * データはSanityから取得
 *
 * 対応スラッグ:
 * - uiux-career-change: UIUXデザイナー転職ロードマップ
 * - ui-design-beginner: UIデザイン入門
 * - ui-visual: UIビジュアル入門
 * - information-architecture: 情報設計基礎
 * - ux-design: UXデザイン基礎
 */

import { useParams, Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RoadmapHero from "@/components/roadmap/detail/RoadmapHero";
import ChangingLandscape from "@/components/roadmap/detail/ChangingLandscape";
import InterestingPerspectives from "@/components/roadmap/detail/InterestingPerspectives";
import CurriculumSection from "@/components/roadmap/detail/CurriculumSection";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";
import { useAllRoadmapsWithDetails, useRoadmap } from "@/hooks/useRoadmaps";
import type { SanityRoadmapDetail, GradientPreset } from "@/types/sanity-roadmap";
import { getRoadmapBySlug } from "@/data/roadmaps";

// ============================================
// グラデーションプリセットタイプ
// ============================================
type GradientPresetType = "teal" | "galaxy" | "ocean" | "infoarch" | "sunset" | "rose" | "uivisual";

// ============================================
// ローカルデータからグラデーションプリセットを推測
// ============================================
function inferGradientPreset(gradientColors?: string): GradientPreset {
  if (!gradientColors) return "galaxy";
  // ローカルデータのgradientColorsからプリセットを推測
  if (gradientColors.includes("#304750") || gradientColors.includes("#5D5B65")) return "uivisual";
  if (gradientColors.includes("purple") || gradientColors.includes("pink")) return "galaxy";
  if (gradientColors.includes("blue") || gradientColors.includes("cyan")) return "ocean";
  if (gradientColors.includes("orange") || gradientColors.includes("pink")) return "sunset";
  if (gradientColors.includes("teal") || gradientColors.includes("emerald")) return "teal";
  if (gradientColors.includes("gray") || gradientColors.includes("amber")) return "infoarch";
  if (gradientColors.includes("rose")) return "rose";
  return "galaxy";
}

// ============================================
// プレビューコンポーネント
// ============================================
export default function RoadmapPreview() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "component"; // "component" or "page"
  const isPageMode = mode === "page";

  // Sanityから全ロードマップデータを取得（一覧用）
  const { data: allRoadmaps, isLoading: allLoading } = useAllRoadmapsWithDetails();

  // 個別ロードマップを取得（詳細表示用）
  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap(slug);

  // ローディング中
  if (allLoading || (slug && roadmapLoading)) {
    return (
      <Layout>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <p className="text-gray-600">ロードマップデータを読み込み中...</p>
        </div>
      </Layout>
    );
  }

  // slugが指定されていない場合は一覧を表示
  if (!slug) {
    return (
      <Layout>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">ロードマップ詳細プレビュー</h1>
          <p className="text-gray-600 mb-2">
            各ロードマップの詳細ページをプレビューできます。
          </p>
          <p className="text-sm text-green-600 mb-8">
            ✅ データソース: Sanity CMS ({allRoadmaps?.length || 0}件)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allRoadmaps?.map((rm) => (
              <div key={rm._id} className="p-6 bg-white rounded-xl border border-gray-200">
                <h2 className="text-lg font-bold mb-2">
                  {rm.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {rm.description}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/dev/roadmap-preview/${rm.slug.current}`}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    コンポーネント表示
                  </Link>
                  <Link
                    to={`/dev/roadmap-preview/${rm.slug.current}?mode=page`}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    ページ表示
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // ローカルデータをフォールバックとして使用
  const localRoadmap = slug ? getRoadmapBySlug(slug) : null;

  // Sanityデータがない場合はローカルデータを使用
  const effectiveRoadmap = roadmap || (localRoadmap ? {
    _id: localRoadmap.id,
    title: localRoadmap.title,
    slug: { current: localRoadmap.slug },
    description: localRoadmap.description,
    tagline: localRoadmap.subtitle,
    thumbnailUrl: undefined,
    gradientPreset: inferGradientPreset(localRoadmap.gradientColors),
    estimatedDuration: localRoadmap.stats.duration.replace('ヶ月', '').replace('〜', '-'),
    howToNavigate: undefined,
    changingLandscape: undefined,
    interestingPerspectives: undefined,
    steps: localRoadmap.steps.map((step, index) => ({
      _key: `step-${index}`,
      title: step.title,
      goals: step.type === 'course' ? [step.goal || ''] : [],
      sections: [],
    })),
  } as SanityRoadmapDetail : null);

  // ロードマップが見つからない場合
  if (!effectiveRoadmap) {
    return (
      <Layout>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">ロードマップが見つかりません</h1>
          <p className="text-gray-600 mb-4">
            スラッグ "{slug}" に対応するロードマップがSanityにもローカルデータにも見つかりませんでした。
          </p>
          <Link to="/dev/roadmap-preview" className="text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
      </Layout>
    );
  }

  // データソースを表示用に判定
  const isFromLocalData = !roadmap && !!localRoadmap;

  // モード切替ハンドラ
  const toggleMode = () => {
    if (isPageMode) {
      searchParams.delete("mode");
    } else {
      searchParams.set("mode", "page");
    }
    setSearchParams(searchParams);
  };

  // データを整形
  const gradientPreset = (effectiveRoadmap.gradientPreset || "galaxy") as GradientPresetType;
  const stepCount = effectiveRoadmap.steps?.length || 0;
  const estimatedDuration = effectiveRoadmap.estimatedDuration || "1-2";

  // changingLandscape と interestingPerspectives のデータ
  const hasChangingLandscape = effectiveRoadmap.changingLandscape && effectiveRoadmap.changingLandscape.items?.length > 0;
  const hasInterestingPerspectives = effectiveRoadmap.interestingPerspectives && effectiveRoadmap.interestingPerspectives.items?.length > 0;

  return (
    <Layout>
      <div className={isPageMode ? "" : "py-8 space-y-16"}>
        {/* ナビゲーション（コンポーネントモードのみ表示） */}
        {!isPageMode && (
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/dev/roadmap-preview"
                className="text-sm text-blue-600 hover:underline"
              >
                ← ロードマップ一覧に戻る
              </Link>
              <button
                onClick={toggleMode}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ページ表示に切替
              </button>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {effectiveRoadmap.title} - プレビュー
            </h1>
            <p className="text-gray-600 mb-4">
              スラッグ: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
            </p>

            {/* データ状況 */}
            <div className={`${isFromLocalData ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"} border rounded-lg p-4 mb-8`}>
              <h2 className={`font-bold ${isFromLocalData ? "text-yellow-800" : "text-green-800"} mb-2`}>
                {isFromLocalData ? "⚠️ ローカルデータを使用（Sanityにデータなし）" : "✅ Sanityからデータ取得"}
              </h2>
              <ul className={`text-sm ${isFromLocalData ? "text-yellow-700" : "text-green-700"} space-y-1`}>
                <li>✅ 基本情報（title, description, tagline）: あり</li>
                <li>✅ gradientPreset: {gradientPreset}</li>
                <li>
                  {hasChangingLandscape ? "✅" : "⚠️"}{" "}
                  changingLandscape: {hasChangingLandscape ? `${effectiveRoadmap.changingLandscape!.items!.length}件` : "なし"}
                </li>
                <li>
                  {hasInterestingPerspectives ? "✅" : "⚠️"}{" "}
                  interestingPerspectives: {hasInterestingPerspectives ? `${effectiveRoadmap.interestingPerspectives!.items!.length}件` : "なし"}
                </li>
                <li>✅ カリキュラム: {stepCount}ステップ</li>
              </ul>
            </div>
          </div>
        )}

        {/* ページモード時のヘッダー */}
        {isPageMode && (
          <div className="fixed top-20 right-4 z-50">
            <button
              onClick={toggleMode}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
            >
              コンポーネント表示に切替
            </button>
          </div>
        )}

        {/* RoadmapHero */}
        <section>
          {!isPageMode && (
            <div className="max-w-[1200px] mx-auto px-4 mb-4">
              <h2 className="text-lg font-bold text-gray-700">1. RoadmapHero</h2>
            </div>
          )}
          <RoadmapHero
            title={effectiveRoadmap.title}
            tagline={effectiveRoadmap.tagline || effectiveRoadmap.description}
            stepCount={stepCount}
            estimatedDuration={estimatedDuration}
            gradientPreset={gradientPreset}
            thumbnailUrl={effectiveRoadmap.thumbnailUrl}
          />
        </section>

        {/* ChangingLandscape */}
        {hasChangingLandscape && (
          <section className={isPageMode ? "" : "mt-16"}>
            {!isPageMode && (
              <div className="max-w-[1200px] mx-auto px-4 mb-4">
                <h2 className="text-lg font-bold text-gray-700">2. ChangingLandscape</h2>
              </div>
            )}
            <ChangingLandscape data={effectiveRoadmap.changingLandscape} />
          </section>
        )}

        {/* InterestingPerspectives */}
        {hasInterestingPerspectives && (
          <section className={isPageMode ? "" : "mt-16"}>
            {!isPageMode && (
              <div className="max-w-[1200px] mx-auto px-4 mb-4">
                <h2 className="text-lg font-bold text-gray-700">3. InterestingPerspectives</h2>
              </div>
            )}
            <InterestingPerspectives data={effectiveRoadmap.interestingPerspectives} />
          </section>
        )}

        {/* Curriculum */}
        {effectiveRoadmap.steps && effectiveRoadmap.steps.length > 0 && (
          <section className={isPageMode ? "" : "mt-16"}>
            {!isPageMode && (
              <div className="max-w-[1200px] mx-auto px-4 mb-4">
                <h2 className="text-lg font-bold text-gray-700">4. CurriculumSection</h2>
                <p className="text-sm text-gray-500">
                  {isFromLocalData ? "⚠️ ローカルデータから" : "✅ Sanityから"}{stepCount}ステップのカリキュラムを取得
                </p>
              </div>
            )}
            <CurriculumSection steps={effectiveRoadmap.steps} />
          </section>
        )}

        {/* ClearBlock */}
        <section className={isPageMode ? "" : "mt-16"}>
          {!isPageMode && (
            <div className="max-w-[1200px] mx-auto px-4 mb-4">
              <h2 className="text-lg font-bold text-gray-700">5. ClearBlock</h2>
            </div>
          )}
          <ClearBlock roadmapTitle={effectiveRoadmap.title} />
        </section>

        {/* ロードマップデータ詳細（コンポーネントモードのみ） */}
        {!isPageMode && (
          <section className="max-w-[1200px] mx-auto px-4 mt-16">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              📋 {isFromLocalData ? "ローカル" : "Sanity"}ロードマップデータ
            </h2>
            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <summary className="cursor-pointer font-medium">JSONデータを表示</summary>
              <pre className="mt-4 text-xs overflow-x-auto bg-gray-900 text-green-400 p-4 rounded">
                {JSON.stringify(effectiveRoadmap, null, 2)}
              </pre>
            </details>
          </section>
        )}
      </div>
    </Layout>
  );
}
