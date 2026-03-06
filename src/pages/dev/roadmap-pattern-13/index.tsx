/**
 * RoadmapPattern13: Bold Impact - 大胆インパクト版
 *
 * gaabooから学んだこと:
 * - 大胆なグラデーション背景で視覚的なインパクト
 * - 数字を超大型にして視覚的アンカーに
 * - セクション間の強いコントラスト（白/グレー交互）
 * - フローティングカードで奥行き感
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check, ArrowRight, Play, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// データ
// ============================================
const roadmapData = {
  title: 'UIビジュアル基礎',
  catchcopy: '使いやすいUIを\n自分でつくれるようになる',
  subtitle: 'UI初心者が、操作体験の基本を習得するロードマップ',
  stats: [
    { number: '4', label: 'ステップ', suffix: '' },
    { number: '12', label: 'レッスン', suffix: '+' },
    { number: '2', label: 'ヶ月目安', suffix: '' },
  ],
  benefits: [
    'UIの"ふつう"を知り、自然な操作体験をつくれる',
    '正しい進め方で、迷わずデザインできる',
    'つくりながら、UIを考える思考力が身につく',
    'AIツールのアウトプットを正しく判断できる',
  ],
  steps: [
    {
      number: '01',
      title: 'UIづくりに慣れる',
      description: 'Figmaの基本操作と、UIトレースで手を動かす感覚を身につける',
      courses: 2,
      duration: '2週間',
    },
    {
      number: '02',
      title: 'デザインの進め方',
      description: '上達する人が必ず持っている「進め方の型」を習得する',
      courses: 3,
      duration: '3週間',
    },
    {
      number: '03',
      title: 'UI表現の基本',
      description: 'コンポーネント、ナビゲーション、フィードバックの基礎',
      courses: 4,
      duration: '4週間',
    },
    {
      number: '04',
      title: 'アウトプット',
      description: '学んだことを実際のUIに落とし込み、定着させる',
      courses: 3,
      duration: '3週間',
    },
  ],
};

export default function RoadmapPattern13() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        {/* ============================================
            HERO: フルブリードグラデーション
        ============================================ */}
        <section
          className="relative min-h-[85vh] flex items-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        >
          {/* 装飾: フローティング要素 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-20 right-[15%] w-64 h-64 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #f5533e 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-32 left-[10%] w-48 h-48 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #30abe6 0%, transparent 70%)' }}
            />
            {/* グリッドパターン */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          {/* コンテンツ */}
          <div className="relative z-10 w-full max-w-[1100px] mx-auto px-8 py-20">
            {/* バッジ */}
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-[13px] font-medium px-4 py-2 rounded-full border border-white/10">
                <Sparkles className="w-4 h-4 text-[#f5533e]" />
                ロードマップ
              </span>
              <span className="text-white/50 text-[13px]">for beginners</span>
            </div>

            {/* メインタイトル */}
            <h1
              className="text-[64px] md:text-[80px] font-bold text-white leading-[1.1] tracking-tight mb-8 whitespace-pre-line"
              style={{ fontFeatureSettings: "'palt' 1" }}
            >
              {roadmapData.catchcopy}
            </h1>

            {/* サブタイトル */}
            <p className="text-[20px] text-white/70 leading-relaxed max-w-[600px] mb-12">
              {roadmapData.subtitle}
            </p>

            {/* Stats */}
            <div className="flex gap-12 mb-16">
              {roadmapData.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-[48px] font-bold text-white leading-none mb-2">
                    {stat.number}
                    <span className="text-[24px] text-[#f5533e]">{stat.suffix}</span>
                  </div>
                  <div className="text-[13px] text-white/50 tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-6">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-3 bg-[#f5533e] hover:bg-[#e04a35] text-white font-semibold text-[16px] px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_32px_rgba(245,83,62,0.3)]"
              >
                今すぐはじめる
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-[15px] transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                紹介動画を見る
              </button>
            </div>
          </div>

          {/* ボトムカーブ */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 100" fill="none" className="w-full">
              <path
                d="M0 100V60C240 20 480 0 720 0s480 20 720 60v40H0z"
                fill="#fafafa"
              />
            </svg>
          </div>
        </section>

        {/* ============================================
            BENEFITS: 白背景 + フローティングカード
        ============================================ */}
        <section className="py-24 px-8">
          <div className="max-w-[900px] mx-auto">
            {/* セクションヘッダー */}
            <div className="text-center mb-16">
              <span className="inline-block text-[13px] font-bold text-[#f5533e] tracking-[0.2em] uppercase mb-4">
                What You'll Get
              </span>
              <h2 className="text-[36px] font-bold text-[#1a1a1a] leading-[1.3]">
                このロードマップで得られること
              </h2>
            </div>

            {/* Benefitグリッド - 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadmapData.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 border border-[#f0f0f0]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f5533e]/10 flex items-center justify-center mb-5 group-hover:bg-[#f5533e] transition-colors duration-300">
                    <Check className="w-6 h-6 text-[#f5533e] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <p className="text-[16px] leading-[1.8] text-[#333]">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            STEPS: ダークセクション + 大きな番号
        ============================================ */}
        <section className="py-28 px-8 bg-[#1a1a1a]">
          <div className="max-w-[1000px] mx-auto">
            {/* セクションヘッダー */}
            <div className="text-center mb-20">
              <span className="inline-block text-[13px] font-bold text-[#f5533e] tracking-[0.2em] uppercase mb-4">
                Learning Path
              </span>
              <h2 className="text-[36px] font-bold text-white leading-[1.3]">
                4ステップで基礎をマスター
              </h2>
            </div>

            {/* ステップフロー */}
            <div className="relative">
              {/* 縦線コネクター */}
              <div className="absolute left-[60px] top-0 bottom-0 w-px bg-gradient-to-b from-[#f5533e] via-[#f5533e]/50 to-transparent hidden md:block" />

              <div className="space-y-8">
                {roadmapData.steps.map((step, i) => (
                  <div
                    key={step.number}
                    className="relative flex gap-8 md:gap-12 items-start group"
                  >
                    {/* 番号 - 超大型 */}
                    <div className="flex-shrink-0 relative z-10">
                      <div
                        className="w-[120px] h-[120px] rounded-2xl bg-[#252525] flex items-center justify-center border border-[#333] group-hover:border-[#f5533e]/50 transition-colors duration-300"
                      >
                        <span
                          className="text-[56px] font-bold text-[#555] group-hover:text-[#f5533e] transition-colors duration-300"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1 pt-4">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-[24px] font-bold text-white">
                          {step.title}
                        </h3>
                        <span className="text-[12px] text-[#666] bg-[#252525] px-3 py-1 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-[15px] leading-[1.7] text-[#888] mb-4">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2 text-[13px] text-[#555]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f5533e]" />
                        {step.courses} レッスン
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA: グラデーント背景
        ============================================ */}
        <section
          className="py-28 px-8"
          style={{
            background: 'linear-gradient(135deg, #f5533e 0%, #e04a35 100%)',
          }}
        >
          <div className="max-w-[700px] mx-auto text-center">
            <h2 className="text-[40px] font-bold text-white leading-[1.3] mb-6">
              今日からUIデザインを<br />
              はじめよう
            </h2>
            <p className="text-[17px] text-white/80 leading-relaxed mb-10">
              月額5,980円で、すべてのロードマップとレッスンに<br className="hidden md:block" />
              アクセスできます。いつでもキャンセル可能。
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white text-[#f5533e] font-bold text-[16px] px-10 py-4 rounded-xl hover:bg-white/90 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
              >
                BONOをはじめる
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/dev/roadmap-patterns"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 text-white font-semibold text-[15px] px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                他のコースを見る
              </Link>
            </div>
          </div>
        </section>

        {/* フッター余白 */}
        <div className="h-20 bg-[#fafafa]" />
      </div>
    </Layout>
  );
}
