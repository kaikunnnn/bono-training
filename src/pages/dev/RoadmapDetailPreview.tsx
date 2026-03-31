/**
 * ロードマップ詳細コンポーネント プレビューページ
 *
 * URL: /dev/roadmap-detail
 */

import Layout from "@/components/layout/Layout";
import RoadmapHero from "@/components/roadmap/detail/RoadmapHero";
import ChangingLandscape from "@/components/roadmap/detail/ChangingLandscape";
import InterestingPerspectives from "@/components/roadmap/detail/InterestingPerspectives";
import CurriculumSection from "@/components/roadmap/detail/CurriculumSection";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";

// モックデータ
const mockRoadmap = {
  title: "UIデザインビジュアル基礎",
  tagline: "使いやすいUI体験をつくるための表現の基礎を身につけよう。",
  stepCount: 4,
  estimatedDuration: "1-2",
  gradientPreset: "teal" as const,
  thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
};

const mockChangingLandscape = {
  description: "ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ",
  items: [
    {
      title: "アウトプットの質の上げ方がわからない",
      description: "自分で仮説とアイデアを立てて、デザインを探求できる快感が手に入ります。",
    },
    {
      title: "余白や色などUIに何となく適用しているが根拠がない",
      description: "UIや表現を組み立てる「基本の視点」を得ることで自分で考え始められる楽しさを得られます。",
    },
    {
      title: "何となくデザインを進めているが「型」がなく不安",
      description: "デザインの進め方の確かな道しるべを習得することで最初の1歩のハードルがワクワクに変わります。",
    },
    {
      title: "一般的に「良い」と言われるデザインがわからない",
      description: "世の中の「良いデザイン」の正体がわかり、自分の手で再現できるようになります。",
    },
  ],
};

const mockInterestingPerspectives = {
  description: "「ふつうの表現」の構築方法を身につけると「つくる楽しさ」が広がるよ",
  items: [
    {
      title: "進め方の基本「デザインサイクル」",
      description: "自分の力でデザインをどんどん良くしていける。「試行錯誤そのものが遊び」になるような手応えを実感できます。",
    },
    {
      title: "表現センスの鍛え方",
      description: "「なんとなく」が「根拠」に変わっていきます。普段見るデザイン表現に隠された「理由」を発見するワクワクスキルが手に入ります。",
    },
    {
      title: "UIデザインの「きほん原則」",
      description: "なんとなく見ていたUIデザインに理由があることがわかる。UI体験をつくる発見と好奇心が高まりやすくなります。",
    },
    {
      title: "実践的なUIデザインの進め方",
      description: "表現の基本のやり方を知ることで、「試してみたい！」という自信と好奇心で制作することができます。",
    },
  ],
};

// カリキュラムのモックデータ
const mockSteps: SanityRoadmapStep[] = [
  {
    _key: "step-1",
    title: "UIづくりの感覚を真似して覚える",
    goals: [
      "UIを構成する\"構造\"を知る",
      "動画を真似してUIづくりのイメージを掴む",
    ],
    sections: [
      {
        _key: "section-1-1",
        title: "デザインツールの使い方を習得しよう",
        description: "まずはツールの使い方を身につけるロードマップで、デザインの１歩目を踏み出そう",
        contents: [
          {
            _id: "roadmap-figma-basic",
            _type: "roadmap",
            title: "UIデザインビジュアル基礎習得ロードマップ",
            slug: { current: "ui-visual-basic" },
            description: "使いやすいUI体験をつくるための表現の基礎を身につけよう。",
            thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
            gradientPreset: "teal",
            estimatedDuration: "1-2",
            stepCount: 4,
          },
        ],
      },
    ],
  },
  {
    _key: "step-2",
    title: "デザインの「進め方の型」を習得",
    goals: [
      "まずは動画で実際にUIをつくりながら、どういう流れや、ポイントを気にして進めるのかを体験しよう",
    ],
    sections: [
      {
        _key: "section-2-1",
        title: "「サイクル」で進めるデザインの進め方を習得しよう",
        contents: [
          {
            _id: "lesson-design-cycle",
            _type: "lesson",
            title: "デザインサイクル入門",
            slug: { current: "design-cycle-intro" },
            description: "UI/UXデザインの基礎概念を学びながら、メッセンジャーアプリをデザインします",
            iconImageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=106&h=160&fit=crop",
          },
          {
            _id: "lesson-3-structure",
            _type: "lesson",
            title: "3構造で始めるUIデザイン",
            slug: { current: "3-structure-ui" },
            description: "UI/UXデザインの基礎概念を学びながら、メッセンジャーアプリをデザインします",
            iconImageUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=106&h=160&fit=crop",
          },
        ],
      },
    ],
  },
  {
    _key: "step-3",
    title: "UIの見た目の表現基本を習得しよう",
    goals: [
      "UI表現、余白・配色・タイポグラフィなど、の基本的な役割を習得する",
      "「スタイル」づくりの構築方法の基本を習得しよう",
    ],
    sections: [
      {
        _key: "section-3-1",
        title: "UIデザインの表現の\"きほん\"を習得しよう",
        contents: [
          {
            _id: "lesson-typography",
            _type: "lesson",
            title: "UIタイポグラフィ入門",
            slug: { current: "typography-intro" },
            description: "UI/UXデザインの基礎概念を学びながら、メッセンジャーアプリをデザインします",
            iconImageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=106&h=160&fit=crop",
          },
          {
            _id: "lesson-ui-visual",
            _type: "lesson",
            title: "UIビジュアル入門",
            slug: { current: "ui-visual-intro" },
            description: "UI/UXデザインの基礎概念を学びながら、メッセンジャーアプリをデザインします",
            iconImageUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=106&h=160&fit=crop",
          },
        ],
      },
      {
        _key: "section-3-2",
        title: "見た目の雰囲気づくりの進め方、をWebサイトのデザインで習得",
        contents: [
          {
            _id: "lesson-graphic",
            _type: "lesson",
            title: "グラフィック入門",
            slug: { current: "graphic-intro" },
            description: "UI/UXデザインの基礎概念を学びながら、メッセンジャーアプリをデザインします",
            iconImageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=106&h=160&fit=crop",
          },
        ],
      },
    ],
  },
  {
    _key: "step-4",
    title: "習得したことを使い、アプリをデザインしよう",
    goals: [
      "学んだUI表現の基礎を実践で活かす",
      "完成度の高いアプリUIを作る",
    ],
    sections: [
      {
        _key: "section-4-1",
        title: "音声SNSアプリの主要画面をデザインしよう",
        contents: [
          {
            _id: "lesson-app-design",
            _type: "lesson",
            title: "音声SNSアプリUIデザイン実践",
            slug: { current: "voice-sns-app" },
            description: "学んだスキルを総動員して、音声SNSアプリの主要画面をデザインします",
            iconImageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=106&h=160&fit=crop",
          },
        ],
      },
    ],
  },
];

export default function RoadmapDetailPreview() {
  return (
    <Layout>
      <div className="py-8 space-y-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">ロードマップ詳細 プレビュー</h1>
          <p className="text-gray-600 mb-8">各コンポーネントの確認用ページ</p>
        </div>

        {/* RoadmapHero */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">1. RoadmapHero</h2>
          </div>
          <RoadmapHero {...mockRoadmap} />
        </section>

        {/* ChangingLandscape */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">2. ChangingLandscape</h2>
          </div>
          <ChangingLandscape data={mockChangingLandscape} />
        </section>

        {/* InterestingPerspectives */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">3. InterestingPerspectives</h2>
          </div>
          <InterestingPerspectives data={mockInterestingPerspectives} />
        </section>

        {/* Curriculum */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">4. CurriculumSection</h2>
          </div>
          <CurriculumSection steps={mockSteps} />
        </section>

        {/* フォントサイズ比較 */}
        <section className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">📏 フォントサイズ比較（確認用）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 変更前 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-red-200">
              <p className="text-xs font-bold text-red-500 mb-4">変更前（ハードコード）</p>
              <h3 className="text-[18px] md:text-[20px] font-bold text-text-black mb-3 leading-[1.6]">
                UIづくりの感覚を真似して覚える
              </h3>
              <div className="flex items-start gap-4">
                <span className="text-[12px] font-bold text-text-black bg-gray-100 px-3 py-1.5 rounded-lg">ゴール</span>
                <p className="text-[14px] md:text-[16px] text-text-black leading-[1.8]">
                  UIを構成する"構造"を知る
                </p>
              </div>
            </div>
            {/* 変更後 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
              <p className="text-xs font-bold text-green-500 mb-4">変更後（デザインシステム）</p>
              <h3 className="text-lg md:text-xl font-bold text-text-black mb-3 leading-[1.6]">
                UIづくりの感覚を真似して覚える
              </h3>
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-text-black bg-gray-100 px-3 py-1.5 rounded-lg">ゴール</span>
                <p className="text-sm md:text-base text-text-black leading-[1.8]">
                  UIを構成する"構造"を知る
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            ※ 数値は同じ（18px→text-lg, 20px→text-xl, 12px→text-xs, 14px→text-sm, 16px→text-base）ですが、デザインシステムのトークンを使用しています。
          </p>
        </section>

        {/* ClearBlock */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">5. ClearBlock</h2>
          </div>
          <ClearBlock roadmapTitle={mockRoadmap.title} />
        </section>

        {/* RelatedRoadmaps */}
        <section className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">6. RelatedRoadmaps</h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
            実装中...
          </div>
        </section>
      </div>
    </Layout>
  );
}
