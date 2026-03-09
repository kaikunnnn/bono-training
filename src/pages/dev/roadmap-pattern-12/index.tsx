/**
 * RoadmapPattern12: gaaboo.jp スタイル準拠版
 *
 * gaaboo.jp/recruit/ から抽出したスタイルルールを全面適用
 * - タイポグラフィ: 15px body / 28px h2 / 42px h1 / 1.75行間
 * - スペーシング: 80px section / 48px header-to-content / 32px grid gap
 * - カラー: #f5533e primary / #333 body / #1a1a1a headings
 * - 装飾: 12px radius / soft shadow / hover lift
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
  HeroBadge,
  Tag,
  SectionHeader,
  BenefitCard,
  StepSummaryCard,
  StepDetailCard,
  CTAButton,
} from './components';

// ============================================
// モックデータ
// ============================================
const roadmapData = {
  // ヘッダー
  header: {
    badge: 'ロードマップ',
    title: 'UIビジュアル基礎を\n習得するロードマップ',
    subtitle: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得するまでの道のりです',
    tags: ['UI未経験', 'ジュニアデザイナー', 'UIづくりの基本', 'デザイン原則'],
    ctaSubtitle: '月額5,980円からスタート',
    ctaButtonText: 'BONOをはじめる',
  },

  // 得られるもの
  benefits: {
    description: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得し、世の中の"ふつう"を学びながらUIデザインを自分で進められるようになります。',
    items: [
      'UIの"ふつう"の知ることで自然な操作体験をつくれる',
      '"つくる"基本の進め方で、正しい制作を学べる',
      'つくることで正しいUIを考える思考力が身につく',
      'AIのアウトプットを判断するために基礎表現スキルが必要',
    ],
  },

  // 進め方（サマリー）
  steps: {
    description: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得するまでの道のりです',
    items: [
      { number: '01', title: 'UIづくりに慣れる', description: 'やり方をマネしてUIの見た目の構築をはじめよう' },
      { number: '02', title: 'デザインの進め方を身につける', description: 'スキルの土台を磨く『進め方』を理解して使えるようなる' },
      { number: '03', title: 'UI表現の基本を身につける', description: 'UIの表現の基本を身につける' },
      { number: '04', title: 'アウトプットにチャレンジ', description: '身に付けたことを定着するためにアウトプットを作ろう' },
    ],
  },

  // ステップ詳細
  stepDetails: [
    {
      stepNumber: '01',
      title: 'UIづくりに慣れる',
      goal: 'Figmaの基本操作を覚え、既存UIを模写することでUIの見た目を構築する力を身につける',
      duration: '目安: 2週間',
      sectionTitle: 'このステップのレッスン',
      courses: [
        {
          number: '01',
          title: 'Figma入門 - ツールの基本操作',
          description: 'デザインツールFigmaの基本操作をマスターし、UIを作る準備を整えよう',
        },
        {
          number: '02',
          title: 'UIトレース入門',
          description: '既存のアプリUIを模写して、UIの構造と見た目の作り方を体感的に学ぶ',
        },
      ],
    },
    {
      stepNumber: '02',
      title: '上達する\nデザインの進め方',
      goal: '全てのデザインの基本の『進め方』を理解して、ここから先使っていきましょう',
      duration: '目安: 3週間',
      sectionTitle: 'このステップのレッスン',
      courses: [
        {
          number: '01',
          title: 'UIデザインサイクル入門',
          description: 'デザインには"正しい進め方"の基礎があります。基本の型を身につけて、迷わず作り、確実に上達していこう',
        },
        {
          number: '02',
          title: 'デザイン原則 - レイアウト編',
          description: '見やすく使いやすいレイアウトの原則を学び、論理的にUIを組み立てられるようになる',
        },
        {
          number: '03',
          title: 'デザイン原則 - 色彩とコントラスト',
          description: '色の使い方とコントラストの原則を理解し、視認性の高いUIを設計できるようになる',
        },
      ],
    },
    {
      stepNumber: '03',
      title: 'UI表現の基本を\n身につける',
      goal: 'UIコンポーネントの基本パターンと使い分けを理解し、適切なUI選択ができるようになる',
      duration: '目安: 4週間',
      sectionTitle: 'このステップのレッスン',
      courses: [
        {
          number: '01',
          title: 'UIコンポーネント基礎',
          description: 'ボタン、フォーム、カードなど基本コンポーネントの種類と使い分けを学ぶ',
        },
        {
          number: '02',
          title: 'ナビゲーションパターン',
          description: 'アプリやWebサイトのナビゲーションパターンを理解し、適切な導線設計ができるようになる',
        },
        {
          number: '03',
          title: 'フィードバックUI設計',
          description: 'ユーザーへのフィードバック（ローディング、エラー、成功）の適切な表現を学ぶ',
        },
        {
          number: '04',
          title: 'レスポンシブUIの考え方',
          description: '様々なデバイスサイズに対応するUI設計の基本的な考え方を身につける',
        },
      ],
    },
  ],
};

// ============================================
// メインコンポーネント
// ============================================
export default function RoadmapPattern12() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#F9F9F7]">
        {/* ============================================
            パンくずナビ
        ============================================ */}
        <nav className="sticky top-0 z-40 bg-[#F9F9F7]/95 backdrop-blur-sm border-b border-[#eee]">
          <div className="px-6 lg:px-10 py-4">
            <div className="flex items-center gap-2 text-[14px] text-[#9e9e9e]">
              <Link
                to="/dev/roadmap-patterns"
                className="hover:text-[#1a1a1a] transition-colors duration-200"
              >
                コース一覧
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#1a1a1a]">UIビジュアル基礎</span>
            </div>
          </div>
        </nav>

        {/* ============================================
            メインコンテンツ
        ============================================ */}
        <div className="px-6 lg:px-10">
          <div className="max-w-[900px] mx-auto">
            {/* ============================================
                セクション1: ヒーロー
                gaaboo: py-80px, 42px h1, 18px description
            ============================================ */}
            <section className="py-20 flex gap-16 items-center">
              {/* 左側: テキストコンテンツ */}
              <div className="flex flex-col gap-5 flex-1 max-w-[520px]">
                <HeroBadge label={roadmapData.header.badge} />

                {/* タイトル - 42px, bold, 1.35行間 */}
                <h1 className="text-[42px] font-bold leading-[1.35] tracking-[0.02em] text-[#1a1a1a] whitespace-pre-line">
                  {roadmapData.header.title}
                </h1>

                {/* サブタイトル - 18px, 1.7行間 */}
                <p className="text-[18px] leading-[1.7] text-[#333] max-w-[480px]">
                  {roadmapData.header.subtitle}
                </p>

                {/* タグリスト - gap 8px */}
                <div className="flex flex-wrap gap-2">
                  {roadmapData.header.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>

                {/* CTAボタン - mt-16px */}
                <div className="mt-4">
                  <CTAButton
                    text={roadmapData.header.ctaButtonText}
                    subtitle={roadmapData.header.ctaSubtitle}
                    href="/pricing"
                  />
                </div>
              </div>

              {/* 右側: ビジュアル - 320x320px */}
              <div
                className="w-80 h-80 rounded-full flex-shrink-0 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                style={{
                  background: 'linear-gradient(135deg, #304851 0%, #8784a4 100%)',
                }}
              >
                <div className="text-center text-white">
                  <div className="text-[11px] tracking-[0.15em] mb-2 opacity-70 uppercase">
                    BONO 入門
                  </div>
                  <div
                    className="text-[36px] font-bold tracking-[0.05em]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    UI VISUAL
                  </div>
                  <div className="text-[10px] tracking-[0.25em] opacity-50 mt-2 uppercase">
                    Beginner Course
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================
                セクション2: ロードマップで得られるもの
                gaaboo: 48px header-to-content, 2列 benefit
            ============================================ */}
            <section className="py-20 border-t border-[#eee]">
              <SectionHeader
                title="ロードマップで得られるもの"
                description={roadmapData.benefits.description}
              />

              {/* Benefitグリッド - 2列, gap 48px(横) 16px(縦) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 pl-7">
                {roadmapData.benefits.items.map((item, index) => (
                  <BenefitCard key={index} text={item} />
                ))}
              </div>

              {/* 詳細リンク */}
              <div className="pl-7 mt-8">
                <Link
                  to="#"
                  className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1a1a1a] border-2 border-[#1a1a1a] px-6 py-3 rounded-lg hover:bg-[#1a1a1a] hover:text-white transition-all duration-200"
                >
                  ロードマップ概要を読む
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* ============================================
                セクション3: 進め方（サマリーカード）
                gaaboo: StepSummaryCard, 19px radius
            ============================================ */}
            <section className="py-20 border-t border-[#eee]">
              <SectionHeader
                title="進め方"
                description={roadmapData.steps.description}
              />

              {/* StepSummaryCard */}
              <div className="pl-7">
                <StepSummaryCard
                  title="道のりのサマリー"
                  items={roadmapData.steps.items}
                />
              </div>
            </section>

            {/* ============================================
                セクション4: 各ステップ詳細
                gaaboo: StepDetailCard, 24px radius, hover shadow
            ============================================ */}
            <section className="py-20 border-t border-[#eee]">
              <SectionHeader title="スキルを身につける" />

              {/* ステップ詳細カードリスト - gap 32px */}
              <div className="flex flex-col gap-8 pl-7">
                {roadmapData.stepDetails.map((detail) => (
                  <StepDetailCard
                    key={detail.stepNumber}
                    stepNumber={detail.stepNumber}
                    title={detail.title}
                    goal={detail.goal}
                    duration={detail.duration}
                    sectionTitle={detail.sectionTitle}
                    courses={detail.courses}
                  />
                ))}
              </div>
            </section>

            {/* ============================================
                セクション5: CTA
                gaaboo: centered, primary button
            ============================================ */}
            <section className="py-20 border-t border-[#eee]">
              <div className="text-center">
                <h2 className="text-[28px] font-bold leading-[1.35] tracking-[0.03em] text-[#1a1a1a] mb-4">
                  今すぐはじめよう
                </h2>
                <p className="text-[15px] leading-[1.75] text-[#333] mb-8 max-w-[480px] mx-auto">
                  UIデザインの基礎を体系的に学び、実践的なスキルを身につけましょう。
                  月額5,980円から、すべてのコンテンツにアクセスできます。
                </p>
                <div className="flex justify-center gap-4">
                  <CTAButton
                    text="BONOをはじめる"
                    href="/pricing"
                  />
                  <CTAButton
                    text="コース一覧を見る"
                    href="/dev/roadmap-patterns"
                    variant="outline"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* フッター余白 */}
        <div className="h-20" />
      </div>
    </Layout>
  );
}
