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
import type { SanityRoadmapDetail } from "@/types/sanity-roadmap";

// ============================================
// グラデーションプリセットタイプ
// ============================================
type GradientPresetType = "teal" | "galaxy" | "ocean" | "infoarch" | "sunset" | "rose";

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

  // ロードマップが見つからない場合
  if (!roadmap) {
    return (
      <Layout>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">ロードマップが見つかりません</h1>
          <p className="text-gray-600 mb-4">
            スラッグ "{slug}" に対応するロードマップがSanityに見つかりませんでした。
          </p>
          <Link to="/dev/roadmap-preview" className="text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
      </Layout>
    );
  }

  // モード切替ハンドラ
  const toggleMode = () => {
    if (isPageMode) {
      searchParams.delete("mode");
    } else {
      searchParams.set("mode", "page");
    }
    setSearchParams(searchParams);
  };

  // Sanityからのデータを整形
  const gradientPreset = (roadmap.gradientPreset || "teal") as GradientPresetType;
  const stepCount = roadmap.steps?.length || 0;
  const estimatedDuration = roadmap.estimatedDuration || "1-2";

  // changingLandscape と interestingPerspectives のデータ
  const hasChangingLandscape = roadmap.changingLandscape && roadmap.changingLandscape.items?.length > 0;
  const hasInterestingPerspectives = roadmap.interestingPerspectives && roadmap.interestingPerspectives.items?.length > 0;

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
              {roadmap.title} - プレビュー
            </h1>
            <p className="text-gray-600 mb-4">
              スラッグ: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
            </p>

            {/* データ状況 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <h2 className="font-bold text-green-800 mb-2">✅ Sanityからデータ取得</h2>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ 基本情報（title, description, tagline）: あり</li>
                <li>
                  {hasChangingLandscape ? "✅" : "⚠️"}{" "}
                  changingLandscape: {hasChangingLandscape ? `${roadmap.changingLandscape.items.length}件` : "なし"}
                </li>
                <li>
                  {hasInterestingPerspectives ? "✅" : "⚠️"}{" "}
                  interestingPerspectives: {hasInterestingPerspectives ? `${roadmap.interestingPerspectives.items.length}件` : "なし"}
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
            title={roadmap.title}
            tagline={roadmap.tagline || roadmap.description}
            stepCount={stepCount}
            estimatedDuration={estimatedDuration}
            gradientPreset={gradientPreset}
            thumbnailUrl={roadmap.thumbnailUrl}
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
            <ChangingLandscape data={roadmap.changingLandscape} />
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
            <InterestingPerspectives data={roadmap.interestingPerspectives} />
          </section>
        )}

        {/* Curriculum */}
        {roadmap.steps && roadmap.steps.length > 0 && (
          <section className={isPageMode ? "" : "mt-16"}>
            {!isPageMode && (
              <div className="max-w-[1200px] mx-auto px-4 mb-4">
                <h2 className="text-lg font-bold text-gray-700">4. CurriculumSection</h2>
                <p className="text-sm text-gray-500">
                  ✅ Sanityから{stepCount}ステップのカリキュラムを取得
                </p>
              </div>
            )}
            <CurriculumSection steps={roadmap.steps} />
          </section>
        )}

        {/* ClearBlock */}
        <section className={isPageMode ? "" : "mt-16"}>
          {!isPageMode && (
            <div className="max-w-[1200px] mx-auto px-4 mb-4">
              <h2 className="text-lg font-bold text-gray-700">5. ClearBlock</h2>
            </div>
          )}
          <ClearBlock roadmapTitle={roadmap.title} />
        </section>

        {/* ロードマップデータ詳細（コンポーネントモードのみ） */}
        {!isPageMode && (
          <section className="max-w-[1200px] mx-auto px-4 mt-16">
            <h2 className="text-lg font-bold text-gray-700 mb-4">📋 Sanityロードマップデータ</h2>
            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <summary className="cursor-pointer font-medium">JSONデータを表示</summary>
              <pre className="mt-4 text-xs overflow-x-auto bg-gray-900 text-green-400 p-4 rounded">
                {JSON.stringify(roadmap, null, 2)}
              </pre>
            </details>
          </section>
        )}
      </div>
    </Layout>
  );
}
