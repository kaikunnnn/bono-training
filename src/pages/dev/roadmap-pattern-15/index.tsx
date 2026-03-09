/**
 * RoadmapPattern15: Structured Visual - 構造的ビジュアル版
 *
 * gaabooから学んだこと:
 * - Bento Grid的なモジュラーレイアウト
 * - 視覚的な情報階層
 * - カードごとに個性を持たせる
 * - データビジュアライゼーション要素
 * - 豊かなホバーインタラクション
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  BookOpen,
  Target,
  Layers,
  Palette,
  Layout as LayoutIcon,
  Zap,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// データ
// ============================================
const roadmapData = {
  title: 'UIビジュアル基礎',
  catchcopy: '使いやすいUIをつくる',
  stats: {
    steps: 4,
    lessons: 12,
    duration: '2ヶ月',
    level: '初心者向け',
  },
  benefits: [
    { icon: Target, title: 'ゴールが明確', desc: '何を習得すべきか迷わない' },
    { icon: Layers, title: '段階的な学習', desc: '基礎から応用まで体系的に' },
    { icon: Zap, title: '実践重視', desc: 'つくりながら身につける' },
  ],
  steps: [
    {
      number: '01',
      title: 'UIづくりに慣れる',
      description: 'ツールの基本操作と、UIトレースで手を動かす',
      icon: Palette,
      color: '#f5533e',
      lessons: 2,
      duration: '2週間',
    },
    {
      number: '02',
      title: 'デザインの進め方',
      description: '上達する人の「型」を習得する',
      icon: LayoutIcon,
      color: '#30abe6',
      lessons: 3,
      duration: '3週間',
    },
    {
      number: '03',
      title: 'UI表現の基本',
      description: 'コンポーネントとパターンを学ぶ',
      icon: Layers,
      color: '#8b5cf6',
      lessons: 4,
      duration: '4週間',
    },
    {
      number: '04',
      title: 'アウトプット',
      description: '学んだことを実践で定着させる',
      icon: Zap,
      color: '#10b981',
      lessons: 3,
      duration: '3週間',
    },
  ],
  curriculum: [
    { title: 'Figma入門', step: '01', type: '実践' },
    { title: 'UIトレース入門', step: '01', type: '実践' },
    { title: 'UIデザインサイクル', step: '02', type: '理論' },
    { title: 'レイアウト原則', step: '02', type: '理論' },
    { title: '色彩とコントラスト', step: '02', type: '理論' },
    { title: 'コンポーネント基礎', step: '03', type: '実践' },
    { title: 'ナビゲーション設計', step: '03', type: '実践' },
    { title: 'フィードバックUI', step: '03', type: '理論' },
    { title: 'レスポンシブ設計', step: '03', type: '理論' },
  ],
};

export default function RoadmapPattern15() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#f5f5f7]">
        {/* ============================================
            HERO: Bentoグリッド風
        ============================================ */}
        <section className="px-6 pt-12 pb-8">
          <div className="max-w-[1100px] mx-auto">
            {/* Bentoグリッド */}
            <div className="grid grid-cols-12 gap-4">
              {/* メインカード - 8列 */}
              <div
                className="col-span-12 md:col-span-8 bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-3xl p-10 md:p-14 text-white relative overflow-hidden min-h-[400px] flex flex-col justify-end"
              >
                {/* 装飾 */}
                <div
                  className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #f5533e 0%, transparent 70%)' }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-[200px] h-[200px] rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #30abe6 0%, transparent 70%)' }}
                />

                <div className="relative z-10">
                  <span className="inline-block text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase mb-4">
                    Roadmap
                  </span>
                  <h1 className="text-[42px] md:text-[56px] font-bold leading-[1.1] mb-6">
                    {roadmapData.title}
                  </h1>
                  <p className="text-[17px] text-white/70 leading-relaxed max-w-[400px] mb-8">
                    UI初心者が、使いやすい操作体験をつくるための基本を習得するロードマップ
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-3 bg-[#f5533e] hover:bg-[#e04a35] text-white font-semibold text-[15px] px-7 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    はじめる
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Stats カード群 - 4列 */}
              <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
                {/* 上段: 2分割 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 flex flex-col justify-between">
                    <BookOpen className="w-6 h-6 text-[#f5533e]" />
                    <div className="mt-auto">
                      <div className="text-[32px] font-bold text-[#1a1a1a]">
                        {roadmapData.stats.lessons}
                      </div>
                      <div className="text-[12px] text-[#999]">レッスン</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 flex flex-col justify-between">
                    <Clock className="w-6 h-6 text-[#30abe6]" />
                    <div className="mt-auto">
                      <div className="text-[32px] font-bold text-[#1a1a1a]">
                        {roadmapData.stats.steps}
                      </div>
                      <div className="text-[12px] text-[#999]">ステップ</div>
                    </div>
                  </div>
                </div>
                {/* 下段: 期間 */}
                <div className="bg-[#1a1a1a] rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] text-white/50 mb-1">目安期間</div>
                    <div className="text-[24px] font-bold text-white">
                      {roadmapData.stats.duration}
                    </div>
                  </div>
                  <div className="text-[12px] text-white/50 bg-white/10 px-3 py-1.5 rounded-full">
                    {roadmapData.stats.level}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            BENEFITS: 3カラムカード
        ============================================ */}
        <section className="px-6 py-8">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmapData.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-5 group-hover:bg-[#f5533e]/10 transition-colors">
                    <benefit.icon className="w-6 h-6 text-[#666] group-hover:text-[#f5533e] transition-colors" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-[14px] text-[#666] leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            STEPS: ビジュアルカード
        ============================================ */}
        <section className="px-6 py-16">
          <div className="max-w-[1100px] mx-auto">
            {/* セクションヘッダー */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#f5533e] uppercase block mb-2">
                  Learning Path
                </span>
                <h2 className="text-[32px] font-bold text-[#1a1a1a]">
                  4ステップで習得
                </h2>
              </div>
            </div>

            {/* ステップカードグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmapData.steps.map((step, i) => (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group relative overflow-hidden"
                >
                  {/* 背景装飾 */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full"
                    style={{ backgroundColor: step.color }}
                  />

                  <div className="relative z-10">
                    {/* 上部: アイコン + 番号 */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${step.color}15` }}
                      >
                        <step.icon
                          className="w-7 h-7"
                          style={{ color: step.color }}
                        />
                      </div>
                      <span
                        className="text-[48px] font-bold opacity-10"
                        style={{ color: step.color, fontFamily: "'Inter', sans-serif" }}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* タイトル */}
                    <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">
                      {step.title}
                    </h3>

                    {/* 説明 */}
                    <p className="text-[14px] text-[#666] leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* メタ情報 */}
                    <div className="flex items-center gap-4 text-[13px]">
                      <div className="flex items-center gap-2 text-[#999]">
                        <BookOpen className="w-4 h-4" />
                        {step.lessons} レッスン
                      </div>
                      <div className="flex items-center gap-2 text-[#999]">
                        <Clock className="w-4 h-4" />
                        {step.duration}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CURRICULUM: リスト形式
        ============================================ */}
        <section className="px-6 py-16">
          <div className="max-w-[1100px] mx-auto">
            {/* セクションヘッダー */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#f5533e] uppercase block mb-2">
                  Curriculum
                </span>
                <h2 className="text-[32px] font-bold text-[#1a1a1a]">
                  カリキュラム
                </h2>
              </div>
              <span className="text-[13px] text-[#999]">
                {roadmapData.curriculum.length} lessons
              </span>
            </div>

            {/* カリキュラムリスト */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {roadmapData.curriculum.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 px-8 py-5 border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafafa] transition-colors group cursor-pointer"
                >
                  {/* 番号 */}
                  <span className="text-[13px] font-mono text-[#999] w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* ステップ */}
                  <span className="text-[11px] font-bold text-white bg-[#1a1a1a] px-2 py-1 rounded">
                    {item.step}
                  </span>

                  {/* タイトル */}
                  <span className="flex-1 text-[15px] font-medium text-[#333] group-hover:text-[#f5533e] transition-colors">
                    {item.title}
                  </span>

                  {/* タイプ */}
                  <span className="text-[12px] text-[#999] bg-[#f5f5f7] px-3 py-1 rounded-full">
                    {item.type}
                  </span>

                  {/* 矢印 */}
                  <ArrowRight className="w-4 h-4 text-[#ccc] group-hover:text-[#f5533e] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA: カード型
        ============================================ */}
        <section className="px-6 py-16">
          <div className="max-w-[1100px] mx-auto">
            <div
              className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #f5533e 0%, #e04a35 100%)',
              }}
            >
              {/* 装飾 */}
              <div
                className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
              />

              <div className="relative z-10">
                <h2 className="text-[36px] md:text-[42px] font-bold text-white leading-[1.2] mb-6">
                  今すぐはじめよう
                </h2>
                <p className="text-[16px] text-white/80 leading-relaxed mb-10 max-w-[500px] mx-auto">
                  月額5,980円ですべてのロードマップにアクセス。
                  いつでもキャンセル可能です。
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 bg-white text-[#f5533e] font-bold text-[15px] px-10 py-4 rounded-xl hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    BONOをはじめる
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/dev/roadmap-patterns"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 text-white font-semibold text-[14px] px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    他のコースを見る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* フッター余白 */}
        <div className="h-16" />
      </div>
    </Layout>
  );
}
