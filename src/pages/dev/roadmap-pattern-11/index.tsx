/**
 * RoadmapPattern11: Figmaデザイン準拠版
 *
 * Figmaデザインを忠実に再現したロードマップページ
 * - ヘッダーセクション: バッジ + タイトル + タグ + CTA + 画像
 * - 得られるものセクション: 説明 + 4つのBenefitカード
 * - 進め方セクション: サマリーカード + ステップ行
 * - スキルセクション: ステップ詳細カード + コースリスト
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
  RoadmapBadge,
  Tag,
  SectionHeader,
  LinkButton,
  BenefitCard,
  StepRow,
  StepDetailCard,
  CTAButton,
} from './components';

// モックデータ
const roadmapData = {
  // ヘッダー
  header: {
    badge: 'ロードマップ',
    title: 'UIビジュアル基礎を\n習得するロードマップ',
    subtitle: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得するまでの道のりです',
    tags: ['UI未経験', 'ジュニアデザイナー', 'UIづくりの基本', 'デザイン原則'],
    ctaSubtitle: '月額5,980円から、ロードマップを始められます',
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
      { number: '04', title: 'アウトプットにチャレンジしよう', description: '身に付けたことを定着するためにアウトプットを作ろう' },
    ],
  },

  // ステップ詳細
  stepDetails: [
    {
      stepNumber: '01',
      title: '上達する\nデザインの進め方',
      goal: '全てのデザインの基本の『進め方』を理解して、ここから先使っていきましょう',
      sectionTitle: 'デザインしよう',
      courses: [
        {
          number: '01',
          title: 'UIデザインサイクル入門',
          description: 'デザインには"正しい進め方"の基礎があります。基本の型を身につけて、迷わず作り、確実に上達していこう',
        },
        {
          number: '02',
          title: 'UIデザインサイクル入門',
          description: 'デザインには"正しい進め方"の基礎があります。基本の型を身につけて、迷わず作り、確実に上達していこう',
        },
        {
          number: '03',
          title: 'UIデザインサイクル入門',
          description: 'デザインには"正しい進め方"の基礎があります。基本の型を身につけて、迷わず作り、確実に上達していこう',
        },
      ],
    },
  ],
};

export default function RoadmapPattern11() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#F9F9F7]">
        {/* パンくずナビ */}
        <nav className="sticky top-0 z-40 bg-[#F9F9F7]/90 backdrop-blur-sm border-b border-gray-200">
          <div className="px-6 lg:px-10 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link to="/dev/roadmap-patterns" className="hover:text-gray-900 transition-colors">
                コース一覧
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">UIビジュアル基礎</span>
            </div>
          </div>
        </nav>

        <div className="px-6 lg:px-10 py-10">
          <div className="max-w-[1012px] mx-auto">
          {/* ============================================
              セクション1: ヘッダー
          ============================================ */}
          <section className="flex gap-16 items-center mb-28">
            {/* 左側: テキストコンテンツ */}
            <div className="flex flex-col gap-4 w-[545px]">
              <RoadmapBadge label={roadmapData.header.badge} />

              <h1
                className="text-[52px] font-medium text-slate-900 leading-[1.38] tracking-tight whitespace-pre-line"
              >
                {roadmapData.header.title}
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-[502px]">
                {roadmapData.header.subtitle}
              </p>

              {/* タグ */}
              <div className="flex flex-wrap gap-1.5">
                {roadmapData.header.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>

              {/* CTA */}
              <CTAButton
                subtitle={roadmapData.header.ctaSubtitle}
                buttonText={roadmapData.header.ctaButtonText}
                className="mt-2"
              />
            </div>

            {/* 右側: 丸い画像 */}
            <div
              className="w-[400px] h-[400px] rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'linear-gradient(221deg, rgb(48, 72, 81) 14%, rgb(135, 132, 164) 84%)',
              }}
            >
              <div className="text-center text-white">
                <div className="text-xs tracking-wider mb-1 opacity-80">BONO 入門</div>
                <div
                  className="text-4xl font-bold tracking-wide"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  UI VISUAL
                </div>
                <div className="text-xs tracking-[0.3em] opacity-60 mt-1">BEGINNER COURSE</div>
              </div>
            </div>
          </section>

          {/* ============================================
              セクション2: ロードマップで得られるもの
          ============================================ */}
          <section className="mb-28">
            <SectionHeader title="ロードマップで得られるもの" />

            <div className="pl-7 flex flex-col gap-8">
              <p className="text-xl text-[#23272e] leading-[1.68] max-w-[596px]">
                {roadmapData.benefits.description}
              </p>

              {/* Benefitカード（2x2グリッド） */}
              <div className="flex flex-wrap gap-x-12 gap-y-3.5">
                {roadmapData.benefits.items.map((item, index) => (
                  <BenefitCard
                    key={index}
                    text={item}
                    className="w-[467px]"
                  />
                ))}
              </div>

              <LinkButton variant="outline" className="w-60">
                ロードマップ概要を読む
              </LinkButton>
            </div>
          </section>

          {/* ============================================
              セクション3: 進め方
          ============================================ */}
          <section className="mb-28">
            <SectionHeader title="進め方" />

            <div className="pl-7 flex flex-col gap-4">
              <p className="text-xl text-[#23272e] leading-[1.68]">
                {roadmapData.steps.description}
              </p>

              {/* サマリーカード */}
              <div className="bg-white rounded-[19px] overflow-hidden p-1">
                {/* カードヘッダー */}
                <div className="bg-[#ececec] rounded-t-xl px-5 py-1.5">
                  <span className="text-sm font-bold text-[#23272e]">
                    道のりのサマリー
                  </span>
                </div>

                {/* ステップ行 */}
                <div className="px-6 py-4">
                  {roadmapData.steps.items.map((step, index) => (
                    <StepRow
                      key={step.number}
                      number={step.number}
                      title={step.title}
                      description={step.description}
                      isLast={index === roadmapData.steps.items.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================
              セクション4: ステップ詳細
          ============================================ */}
          <section>
            {roadmapData.stepDetails.map((detail, index) => (
              <StepDetailCard
                key={index}
                stepNumber={detail.stepNumber}
                title={detail.title}
                goal={detail.goal}
                sectionTitle={detail.sectionTitle}
                courses={detail.courses}
                className="mb-8"
              />
            ))}
          </section>
        </div>
      </div>
      </div>
    </Layout>
  );
}
