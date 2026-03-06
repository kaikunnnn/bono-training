/**
 * RoadmapPattern16: Elegant Minimal + 情報密度UP版
 *
 * Pattern 14の洗練さを維持しつつ:
 * - Stats（数字）を追加して全体像を伝える
 * - Benefitsをより具体的に
 * - ステップの詳細（レッスンリスト）を充実
 * - CTAを複数箇所に配置し強化
 * - カリキュラム一覧を追加
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, BookOpen, Target, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// データ
// ============================================
const roadmapData = {
  title: 'UIビジュアル基礎',
  subtitle: 'UI VISUAL FUNDAMENTALS',
  description: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得し、世の中の"ふつう"を学びながらUIデザインを自分で進められるようになるロードマップです。',
  stats: [
    { value: '4', label: 'ステップ', sub: '段階的に習得' },
    { value: '12', label: 'レッスン', sub: '実践的な内容' },
    { value: '2', label: 'ヶ月', sub: '目安期間' },
  ],
  audience: [
    { label: 'UI未経験者', desc: 'デザインツールを触ったことがない方' },
    { label: 'ジュニアデザイナー', desc: '基礎を固め直したい方' },
    { label: 'エンジニア', desc: 'UIも理解したい開発者' },
  ],
  benefits: [
    {
      title: 'UIの"ふつう"を理解する',
      desc: '世の中のアプリが採用している定番パターンを知り、自然な操作体験をデザインできるようになります。',
    },
    {
      title: '正しい進め方を身につける',
      desc: '上達するデザイナーが必ず持っている「デザインサイクル」を習得し、迷わず確実に成長できます。',
    },
    {
      title: 'UIを考える思考力',
      desc: 'ただ作るだけでなく「なぜこうするのか」を判断できる力が身につきます。AIツールの出力も正しく評価できます。',
    },
    {
      title: '実践で使えるスキル',
      desc: 'トレースや模写だけでなく、ゼロからUIを設計し、形にするまでの一連のプロセスを経験します。',
    },
  ],
  steps: [
    {
      number: '01',
      title: 'UIづくりに慣れる',
      description: 'Figmaの基本操作をマスターし、既存UIを模写することで、UIの見た目を構築する力を身につけます。',
      duration: '約2週間',
      lessons: [
        { title: 'Figma入門', desc: 'ツールの基本操作をマスター', type: '実践' },
        { title: 'UIトレース入門', desc: '既存UIを模写して感覚を掴む', type: '実践' },
      ],
    },
    {
      number: '02',
      title: 'デザインの進め方を身につける',
      description: '上達するデザイナーが必ず持っている「進め方の型」を理解し、実践で使えるようになります。',
      duration: '約3週間',
      lessons: [
        { title: 'UIデザインサイクル入門', desc: '正しい進め方の基礎', type: '理論' },
        { title: 'レイアウト原則', desc: '見やすく使いやすい配置', type: '理論' },
        { title: '色彩とコントラスト', desc: '視認性の高い色使い', type: '理論' },
      ],
    },
    {
      number: '03',
      title: 'UI表現の基本を身につける',
      description: 'コンポーネント、ナビゲーション、フィードバックなど、UIの基本表現パターンを習得します。',
      duration: '約4週間',
      lessons: [
        { title: 'UIコンポーネント基礎', desc: 'ボタン、フォーム、カードの設計', type: '実践' },
        { title: 'ナビゲーション設計', desc: '迷わない導線を作る', type: '実践' },
        { title: 'フィードバックUI', desc: 'ローディング、エラー、成功', type: '理論' },
        { title: 'レスポンシブ設計', desc: '様々なデバイスに対応', type: '理論' },
      ],
    },
    {
      number: '04',
      title: 'アウトプットにチャレンジ',
      description: '学んだことを実際のプロジェクトに適用し、定着させます。ポートフォリオにも使える作品を作ります。',
      duration: '約3週間',
      lessons: [
        { title: 'ミニプロジェクト①', desc: 'シンプルなアプリUI設計', type: '実践' },
        { title: 'ミニプロジェクト②', desc: 'Webサイトのリデザイン', type: '実践' },
        { title: 'ポートフォリオ作成', desc: '学びをまとめる', type: '実践' },
      ],
    },
  ],
};

export default function RoadmapPattern16() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* ============================================
            HERO: ミニマル + Stats追加
        ============================================ */}
        <section className="px-8 md:px-16 pt-16 pb-20 border-b border-[#eee]">
          <div className="max-w-[1100px] mx-auto">
            {/* サブタイトルライン */}
            <div className="flex items-center gap-6 mb-10">
              <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase">
                {roadmapData.subtitle}
              </span>
              <div className="flex-1 h-px bg-[#eee]" />
              <span className="text-[11px] text-[#999]">ROADMAP</span>
            </div>

            {/* メインコンテンツ: 2カラム */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* 左: タイトル + 説明 */}
              <div className="lg:col-span-7">
                <h1 className="text-[56px] md:text-[72px] font-bold text-[#1a1a1a] leading-[1.05] tracking-tight mb-8">
                  {roadmapData.title}
                </h1>
                <p className="text-[17px] leading-[1.9] text-[#444] mb-10 max-w-[540px]">
                  {roadmapData.description}
                </p>
                {/* CTA */}
                <div className="flex items-center gap-6">
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold text-[15px] px-8 py-4 rounded-full transition-all hover:-translate-y-0.5"
                  >
                    このロードマップをはじめる
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-[13px] text-[#999]">月額5,980円〜</span>
                </div>
              </div>

              {/* 右: Stats */}
              <div className="lg:col-span-5">
                <div className="bg-[#fafafa] rounded-2xl p-8">
                  <span className="text-[11px] font-medium tracking-[0.2em] text-[#999] uppercase block mb-6">
                    Overview
                  </span>
                  <div className="space-y-6">
                    {roadmapData.stats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-[#eee] last:border-b-0">
                        <div>
                          <div className="text-[13px] text-[#666] mb-1">{stat.label}</div>
                          <div className="text-[11px] text-[#999]">{stat.sub}</div>
                        </div>
                        <div
                          className="text-[40px] font-bold text-[#1a1a1a]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            AUDIENCE: 誰向けか
        ============================================ */}
        <section className="px-8 md:px-16 py-20 border-b border-[#eee]">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* 左: ラベル */}
              <div className="lg:col-span-3">
                <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase">
                  Who is this for
                </span>
              </div>
              {/* 右: リスト */}
              <div className="lg:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {roadmapData.audience.map((item, i) => (
                    <div key={i} className="border-l-2 border-[#eee] pl-6 hover:border-[#f5533e] transition-colors">
                      <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">
                        {item.label}
                      </h3>
                      <p className="text-[13px] text-[#666] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            BENEFITS: 得られるもの（2x2グリッド）
        ============================================ */}
        <section className="px-8 md:px-16 py-24">
          <div className="max-w-[1100px] mx-auto">
            {/* セクションヘッダー */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
              <div className="lg:col-span-3">
                <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-3">
                  Outcomes
                </span>
                <h2 className="text-[28px] font-bold text-[#1a1a1a]">
                  得られるもの
                </h2>
              </div>
              <div className="lg:col-span-9">
                <p className="text-[15px] leading-[1.8] text-[#666] max-w-[500px]">
                  このロードマップを完了することで、UIデザインの基礎力が確実に身につきます。
                </p>
              </div>
            </div>

            {/* Benefits グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#eee]">
              {roadmapData.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white p-10 hover:bg-[#fafafa] transition-colors group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#f5533e]/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#f5533e] transition-colors">
                      <Check className="w-4 h-4 text-[#f5533e] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#1a1a1a] leading-[1.4]">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-[14px] leading-[1.8] text-[#666] pl-12">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            STEPS: 詳細なステップ + レッスンリスト
        ============================================ */}
        <section className="px-8 md:px-16 py-24 bg-[#fafafa]">
          <div className="max-w-[1100px] mx-auto">
            {/* セクションヘッダー */}
            <div className="mb-16">
              <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase block mb-3">
                Learning Path
              </span>
              <div className="flex items-end justify-between">
                <h2 className="text-[28px] font-bold text-[#1a1a1a]">
                  進め方
                </h2>
                <span className="text-[13px] text-[#999]">
                  {roadmapData.steps.length} steps / {roadmapData.steps.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
                </span>
              </div>
            </div>

            {/* ステップリスト */}
            <div className="space-y-6">
              {roadmapData.steps.map((step, i) => (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow"
                >
                  {/* ステップヘッダー */}
                  <div className="p-8 border-b border-[#f0f0f0]">
                    <div className="flex items-start gap-8">
                      {/* 番号 */}
                      <div className="flex-shrink-0">
                        <span
                          className="text-[48px] font-bold text-[#e8e8e8]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {step.number}
                        </span>
                      </div>

                      {/* コンテンツ */}
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-[22px] font-bold text-[#1a1a1a]">
                            {step.title}
                          </h3>
                          <span className="text-[12px] text-[#999] bg-[#f5f5f5] px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-[14px] leading-[1.8] text-[#666] max-w-[600px]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* レッスンリスト */}
                  <div className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] text-[#999] uppercase mb-4 pl-[72px]">
                      <BookOpen className="w-3.5 h-3.5" />
                      Lessons
                    </div>
                    <div className="space-y-0 pl-[72px]">
                      {step.lessons.map((lesson, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between py-4 border-b border-[#f5f5f5] last:border-b-0 group cursor-pointer hover:bg-[#fafafa] -mx-4 px-4 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-[12px] font-mono text-[#ccc] w-6">
                              {String(j + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <span className="text-[15px] font-medium text-[#333] group-hover:text-[#f5533e] transition-colors">
                                {lesson.title}
                              </span>
                              <span className="text-[13px] text-[#999] ml-3">
                                {lesson.desc}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-[#999] bg-[#f5f5f5] px-2 py-1 rounded">
                              {lesson.type}
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#f5533e] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA: 強化版
        ============================================ */}
        <section className="px-8 md:px-16 py-28 border-t border-[#eee]">
          <div className="max-w-[800px] mx-auto text-center">
            <span className="text-[11px] font-medium tracking-[0.3em] text-[#f5533e] uppercase block mb-4">
              Get Started Today
            </span>
            <h2 className="text-[40px] font-bold text-[#1a1a1a] leading-[1.2] mb-6">
              今日から、<br />
              UIデザインをはじめよう
            </h2>
            <p className="text-[16px] leading-[1.9] text-[#666] mb-10 max-w-[500px] mx-auto">
              月額5,980円ですべてのロードマップとレッスンにアクセス。
              いつでもキャンセル可能。まずは無料で始められます。
            </p>

            {/* 価格カード */}
            <div className="inline-flex items-center gap-4 bg-[#fafafa] rounded-2xl p-6 mb-10">
              <div className="text-left">
                <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Monthly</div>
                <div className="text-[32px] font-bold text-[#1a1a1a]">
                  ¥5,980
                  <span className="text-[14px] font-normal text-[#999]">/月</span>
                </div>
              </div>
              <div className="w-px h-12 bg-[#e0e0e0]" />
              <ul className="text-left space-y-1">
                <li className="text-[13px] text-[#666] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f5533e]" />
                  全ロードマップアクセス
                </li>
                <li className="text-[13px] text-[#666] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f5533e]" />
                  いつでもキャンセル可能
                </li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-3 bg-[#f5533e] hover:bg-[#e04a35] text-white font-bold text-[15px] px-10 py-5 rounded-full transition-all hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(245,83,62,0.25)]"
              >
                BONOをはじめる
                <ArrowRight className="w-5 h-5" />
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
        <div className="h-20" />
      </div>
    </Layout>
  );
}
