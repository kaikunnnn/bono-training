/**
 * ロードマップの道筋セクション - パターンC比較
 *
 * 元のCパターン + 派生パターン（白カード+矢印）
 * URL: /dev/roadmap-pathway-patterns
 */

import Layout from "@/components/layout/Layout";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";

// ============================================
// モックデータ
// ============================================

const MOCK_DESCRIPTION = "このコースでは情報設計の基本を学ぶことで、顧客にとって操作しやすいUIアイデアを作る考え方を身につけます。「目的」と「顧客」を軸にUIをデザインする基本をステップバイステップで学びます。";

const MOCK_STEPS: SanityRoadmapStep[] = [
  {
    _key: "step-1",
    title: "デザインの基礎理解",
    goals: [
      "デザインの4大原則を理解し、実践できる",
      "優れたデザインと悪いデザインを見分けられる",
    ],
  },
  {
    _key: "step-2",
    title: "Figmaの基本操作",
    goals: [
      "Figmaの基本ツールを使いこなせる",
      "簡単なUIコンポーネントを作成できる",
    ],
  },
  {
    _key: "step-3",
    title: "UIデザインの実践",
    goals: [
      "実在するアプリのUIを模写できる",
      "色とタイポグラフィを効果的に使える",
    ],
  },
  {
    _key: "step-4",
    title: "プロジェクトに挑戦",
    goals: [
      "自分のアイデアをUIに落とし込める",
      "ポートフォリオ作品を作る",
    ],
  },
];

// ============================================
// Pattern C: Original (元のCパターン - 個別カード)
// ============================================

function PatternC({ steps, description }: { steps: SanityRoadmapStep[]; description: string }) {
  const scrollToStep = (stepNumber: number) => {
    const element = document.getElementById(`curriculum-step-${stepNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ヘッダー */}
      <div className="mb-9">
        <div className="inline-flex items-center justify-center border border-black/[0.12] rounded-full px-2.5 py-1.5 mb-4">
          <span className="text-[12px] font-bold text-[#0f172a] uppercase">
            道のり
          </span>
        </div>
        <h2 className="text-[24px] font-extrabold text-[#293525] leading-[1.5] mb-4">
          ロードマップの流れ
        </h2>
        <p className="text-[16px] md:text-[18px] text-[#293525]/80 leading-[1.7] max-w-3xl">
          {description}
        </p>
      </div>

      {/* ステップナビゲーション（縦積み1列、個別カード） */}
      <nav aria-label="ステップナビゲーション" className="space-y-3">
        {steps.map((step, index) => {
          const stepNumber = (index + 1).toString().padStart(2, "0");

          return (
            <button
              key={step._key}
              type="button"
              onClick={() => scrollToStep(index + 1)}
              aria-label={`ステップ${index + 1}「${step.title}」へ移動`}
              className="flex items-start md:items-center gap-3 md:gap-4 px-3 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left group w-full"
            >
              {/* ステップ番号バッジ（小型版） */}
              <div className="flex-shrink-0 w-[50px] bg-white rounded-xl shadow-[0_1px_5px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* グラデーションヘッダー */}
                <div className="bg-gradient-to-r from-[#b2b3d9] via-[#e2ccd1] to-[#f1e8dc] px-1.5 py-1 rounded-t-xl">
                  <p className="text-[6px] font-bold text-text-black text-center">
                    ステップ
                  </p>
                </div>
                {/* 番号 */}
                <div className="px-1.5 py-1">
                  <p className="text-[18px] font-bold text-text-black text-center font-['Unbounded',sans-serif] leading-none">
                    {stepNumber}
                  </p>
                </div>
              </div>

              {/* テキスト */}
              <div className="flex-1 min-w-0">
                {/* タイトル */}
                <h3 className="text-[14px] md:text-[16px] font-bold text-text-black leading-[1.5] mb-0.5">
                  {step.title}
                </h3>

                {/* ゴール（デスクトップのみ） */}
                {step.goals && step.goals.length > 0 && (
                  <div className="hidden md:block">
                    <p className="text-[13px] text-text-black/70 leading-[1.6] truncate">
                      {step.goals[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* 矢印 */}
              <div className="shrink-0 w-3 h-3 flex items-center justify-center">
                <ChevronRight className="w-3 h-3 text-gray-400 rotate-90 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ============================================
// Pattern C2: Card Variation (派生 - 1つのカード+矢印)
// ============================================

function PatternC2({ steps, description }: { steps: SanityRoadmapStep[]; description: string }) {
  const scrollToStep = (stepNumber: number) => {
    const element = document.getElementById(`curriculum-step-${stepNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ヘッダー */}
      <div className="mb-9">
        <div className="inline-flex items-center justify-center border border-black/[0.12] rounded-full px-2.5 py-1.5 mb-4">
          <span className="text-[12px] font-bold text-[#0f172a] uppercase">
            道のり
          </span>
        </div>
        <h2 className="text-[24px] font-extrabold text-[#293525] leading-[1.5] mb-4">
          ロードマップの流れ
        </h2>
        <p className="text-[16px] md:text-[18px] text-[#293525]/80 leading-[1.7] max-w-3xl">
          {description}
        </p>
      </div>

      {/* 白いカード */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
        <nav aria-label="ステップナビゲーション">
          {steps.map((step, index) => {
            const stepNumber = (index + 1).toString().padStart(2, "0");
            const isLast = index === steps.length - 1;

            return (
              <div key={step._key}>
                {/* ステップアイテム */}
                <button
                  type="button"
                  onClick={() => scrollToStep(index + 1)}
                  aria-label={`ステップ${index + 1}「${step.title}」へ移動`}
                  className="flex items-start md:items-center gap-3 md:gap-4 w-full text-left group"
                >
                  {/* ステップ番号バッジ */}
                  <div className="flex-shrink-0 w-[50px] bg-white rounded-xl shadow-[0_1px_5px_rgba(0,0,0,0.08)] overflow-hidden">
                    {/* 薄いグレーヘッダー */}
                    <div className="bg-gray-100 px-1.5 py-1 rounded-t-xl">
                      <p className="text-[6px] font-bold text-text-black text-center">
                        ステップ
                      </p>
                    </div>
                    {/* 番号 */}
                    <div className="px-1.5 py-1">
                      <p className="text-[18px] font-bold text-text-black text-center font-['Unbounded',sans-serif] leading-none">
                        {stepNumber}
                      </p>
                    </div>
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    {/* タイトル */}
                    <h3 className="text-[14px] md:text-[16px] font-bold text-text-black leading-[1.5] group-hover:text-gray-700 transition-colors">
                      {step.title}
                    </h3>
                  </div>
                </button>

                {/* ステップ間の矢印（左揃え） */}
                {!isLast && (
                  <div className="flex justify-start py-4 pl-[25px]">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function RoadmapPathwayPatterns() {
  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        {/* ページヘッダー */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">ロードマップの道筋セクション - Cパターン比較</h1>
          <p className="text-gray-600 text-lg">
            元のCパターン vs 派生パターン（白カード+矢印）
          </p>
        </div>

        {/* Pattern C: Original */}
        <section className="mb-20 pb-20 border-b-2 border-gray-200">
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pattern C: Original (元のパターン)
            </h2>
            <p className="text-gray-700 mb-3">
              <strong>特徴:</strong> 個別の白カード、縦積み1列
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🎨 各ステップが個別の白カード</li>
              <li>🎨 ステップバッジはグラデーション（元のデザイン）</li>
              <li>🎨 space-y-3で間隔を開ける</li>
              <li>🎨 タイトル+ゴール表示</li>
              <li>🎨 右下に小さい下向き矢印</li>
            </ul>
          </div>
          <PatternC steps={MOCK_STEPS} description={MOCK_DESCRIPTION} />
        </section>

        {/* Pattern C2: Card Variation */}
        <section className="mb-12">
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pattern C2: Card Variation (派生パターン)
            </h2>
            <p className="text-gray-700 mb-3">
              <strong>特徴:</strong> 1つの白いカードにステップリスト、間に矢印
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✨ 1つの大きな白いカード内にすべてのステップ</li>
              <li>✨ ステップバッジは薄いグレー（bg-gray-100）</li>
              <li>✨ タイトルのみ表示（ゴールなし）</li>
              <li>✨ ステップ間に下向き矢印（左揃え）</li>
              <li>✨ より統一感のあるデザイン</li>
            </ul>
          </div>
          <PatternC2 steps={MOCK_STEPS} description={MOCK_DESCRIPTION} />
        </section>
      </div>
    </Layout>
  );
}
