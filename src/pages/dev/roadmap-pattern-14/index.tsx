/**
 * RoadmapPattern14: Elegant Minimal - 洗練ミニマル版
 *
 * gaabooから学んだこと:
 * - 余白を贅沢に使う（100px+のセクション間隔）
 * - 細い線と繊細なボーダー
 * - タイポグラフィの階層を明確に
 * - 装飾を削ぎ落とし、必要最小限に
 * - エディトリアルな雰囲気
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// データ
// ============================================
const roadmapData = {
  title: 'UIビジュアル基礎',
  subtitle: 'UI VISUAL FUNDAMENTALS',
  description: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得し、世の中の"ふつう"を学びながらUIデザインを自分で進められるようになるロードマップです。',
  audience: ['UI未経験者', 'ジュニアデザイナー', 'エンジニアからUIへ転向したい方'],
  outcomes: [
    { label: 'SKILL', title: 'UIの"ふつう"を理解する', desc: '自然な操作体験をデザインできるようになります' },
    { label: 'PROCESS', title: '正しい進め方を身につける', desc: '迷わず、確実に上達するプロセスを習得します' },
    { label: 'MINDSET', title: 'UIを考える思考力', desc: 'つくりながら、正しい判断ができるようになります' },
  ],
  steps: [
    {
      number: '01',
      title: 'UIづくりに慣れる',
      description: 'Figmaの基本操作をマスターし、既存UIを模写することで、UIの見た目を構築する力を身につけます。',
      lessons: ['Figma入門', 'UIトレース入門'],
      duration: '約2週間',
    },
    {
      number: '02',
      title: 'デザインの進め方を身につける',
      description: '上達するデザイナーが必ず持っている「進め方の型」を理解し、実践で使えるようになります。',
      lessons: ['UIデザインサイクル入門', 'レイアウト原則', '色彩とコントラスト'],
      duration: '約3週間',
    },
    {
      number: '03',
      title: 'UI表現の基本を身につける',
      description: 'コンポーネント、ナビゲーション、フィードバックなど、UIの基本表現パターンを習得します。',
      lessons: ['コンポーネント基礎', 'ナビゲーション', 'フィードバックUI', 'レスポンシブ'],
      duration: '約4週間',
    },
  ],
};

export default function RoadmapPattern14() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* ============================================
            HERO: 極限のミニマル
        ============================================ */}
        <section className="min-h-[90vh] flex flex-col justify-center px-8 md:px-16 border-b border-[#eee]">
          <div className="max-w-[1200px] mx-auto w-full">
            {/* サブタイトル - エディトリアル風 */}
            <div className="flex items-center gap-6 mb-12">
              <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase">
                {roadmapData.subtitle}
              </span>
              <div className="flex-1 h-px bg-[#eee]" />
              <span className="text-[11px] text-[#999]">ROADMAP</span>
            </div>

            {/* メインタイトル - 極大 */}
            <h1 className="text-[72px] md:text-[96px] font-bold text-[#1a1a1a] leading-[1.05] tracking-tight mb-16">
              {roadmapData.title}
            </h1>

            {/* 2カラムレイアウト */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
              {/* 左: 説明文 */}
              <div>
                <p className="text-[18px] leading-[2] text-[#444] mb-12">
                  {roadmapData.description}
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-3 text-[14px] font-semibold text-[#1a1a1a] group"
                >
                  <span className="border-b-2 border-[#1a1a1a] pb-1 group-hover:border-[#f5533e] group-hover:text-[#f5533e] transition-colors">
                    このロードマップをはじめる
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 右: オーディエンス */}
              <div>
                <span className="text-[11px] font-medium tracking-[0.2em] text-[#999] uppercase block mb-6">
                  Who is this for
                </span>
                <ul className="space-y-4">
                  {roadmapData.audience.map((item, i) => (
                    <li
                      key={i}
                      className="text-[15px] text-[#333] pl-6 border-l-2 border-[#eee] hover:border-[#f5533e] transition-colors"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            OUTCOMES: 3カラム + 余白重視
        ============================================ */}
        <section className="py-32 px-8 md:px-16">
          <div className="max-w-[1200px] mx-auto">
            {/* セクションヘッダー */}
            <div className="flex items-end justify-between mb-20">
              <div>
                <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-4">
                  Outcomes
                </span>
                <h2 className="text-[36px] font-bold text-[#1a1a1a]">
                  得られるもの
                </h2>
              </div>
              <span className="text-[13px] text-[#999]">03 items</span>
            </div>

            {/* 3カラムグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#eee]">
              {roadmapData.outcomes.map((outcome, i) => (
                <div
                  key={i}
                  className="bg-white p-10 group hover:bg-[#fafafa] transition-colors"
                >
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#f5533e] uppercase block mb-6">
                    {outcome.label}
                  </span>
                  <h3 className="text-[20px] font-bold text-[#1a1a1a] leading-[1.4] mb-4">
                    {outcome.title}
                  </h3>
                  <p className="text-[14px] leading-[1.8] text-[#666]">
                    {outcome.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            STEPS: エディトリアル風レイアウト
        ============================================ */}
        <section className="py-32 px-8 md:px-16 bg-[#fafafa]">
          <div className="max-w-[1200px] mx-auto">
            {/* セクションヘッダー */}
            <div className="mb-24">
              <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-4">
                Learning Path
              </span>
              <h2 className="text-[36px] font-bold text-[#1a1a1a]">
                進め方
              </h2>
            </div>

            {/* ステップリスト */}
            <div className="space-y-0">
              {roadmapData.steps.map((step, i) => (
                <div
                  key={step.number}
                  className="group border-t border-[#ddd] py-16 hover:bg-white transition-colors px-8 -mx-8"
                >
                  <div className="flex gap-16">
                    {/* 番号 */}
                    <div className="w-24 flex-shrink-0">
                      <span
                        className="text-[64px] font-bold text-[#e0e0e0] group-hover:text-[#f5533e] transition-colors leading-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-[28px] font-bold text-[#1a1a1a] leading-[1.3]">
                          {step.title}
                        </h3>
                        <span className="text-[12px] text-[#999] bg-white border border-[#eee] px-4 py-2 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-[15px] leading-[1.9] text-[#555] mb-8 max-w-[600px]">
                        {step.description}
                      </p>
                      {/* レッスンリスト */}
                      <div className="flex flex-wrap gap-3">
                        {step.lessons.map((lesson, j) => (
                          <span
                            key={j}
                            className="text-[13px] text-[#333] bg-white border border-[#ddd] px-4 py-2 rounded-lg hover:border-[#f5533e] hover:text-[#f5533e] transition-colors cursor-pointer"
                          >
                            {lesson}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA: 極限のシンプル
        ============================================ */}
        <section className="py-40 px-8 md:px-16 border-t border-[#eee]">
          <div className="max-w-[800px] mx-auto text-center">
            <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-6">
              Get Started
            </span>
            <h2 className="text-[48px] font-bold text-[#1a1a1a] leading-[1.2] mb-8">
              今日から、<br />
              UIデザインをはじめよう
            </h2>
            <p className="text-[16px] leading-[1.9] text-[#666] mb-12">
              月額5,980円ですべてのコンテンツにアクセス。<br />
              いつでもキャンセル可能です。
            </p>
            <div className="flex justify-center gap-6">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold text-[15px] px-10 py-5 rounded-full transition-colors"
              >
                BONOをはじめる
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dev/roadmap-patterns"
                className="inline-flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] font-medium text-[15px] px-6 py-5 transition-colors"
              >
                他のコースを見る
              </Link>
            </div>
          </div>
        </section>

        {/* フッター余白 */}
        <div className="h-24" />
      </div>
    </Layout>
  );
}
